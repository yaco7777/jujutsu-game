import { getTechniqueById } from '../data/techniques.js';
import { getMissionById } from '../data/missions.js';
import { getRankById, addLogEntry, sanitizeGameState } from './gameState.js';
import { getEquipmentBonuses, useConsumable } from './inventory.js';
import { evaluateWorldIncidentsAndAchievements } from './gameLoop.js';
import { randomInt } from './utils.js';

export function startCombat(state, enemyTemplate, options = {}) {
  if (!state || !state.player) {
    return { ok: false, message: 'Estado de partida inválido.', state };
  }
  if (!state.player.alive || state.player.retired) {
    return { ok: false, message: 'El personaje no puede iniciar un combate tras morir o retirarse.', state };
  }
  if (!enemyTemplate || typeof enemyTemplate !== 'object' || !enemyTemplate.name || !(enemyTemplate.maxHealth > 0)) {
    return { ok: false, message: 'No se puede iniciar un combate sin un rival válido.', state };
  }

  state.combat = {
    id: options.id || `combat_${Date.now()}`,
    turnNumber: 1,
    isPromotionExam: Boolean(options.isPromotionExam),
    targetRankId: options.targetRankId || null,
    missionId: options.missionId || null,
    playerGuarding: false,
    simpleDomainActive: 0,
    domainActive: 0,
    domainBurnout: 0,
    tempAttackBonus: 0,
    tempDefenseBonus: 0,
    ally: options.ally || null,
    enemy: {
      id: enemyTemplate.id || 'enemy_custom',
      name: enemyTemplate.name,
      grade: enemyTemplate.grade || 'grado_3',
      gradeOrder: enemyTemplate.gradeOrder ?? 1,
      maxHealth: Math.round(enemyTemplate.maxHealth),
      health: Math.round(enemyTemplate.health ?? enemyTemplate.maxHealth),
      attack: Math.round(enemyTemplate.attack || 15),
      defense: Math.round(enemyTemplate.defense || 8),
      speed: Math.round(enemyTemplate.speed || 15),
      specialName: enemyTemplate.specialName || 'Golpe Maldito Concentrado',
      specialPower: Math.round(enemyTemplate.specialPower || 22),
      specialChance: enemyTemplate.specialChance ?? 0.3
    },
    combatLog: [
      `¡Combate iniciado contra ${enemyTemplate.name}!`
    ]
  };

  sanitizeGameState(state);
  return { ok: true, message: `Combate iniciado contra ${enemyTemplate.name}.`, state };
}

export function executeCombatTurn(state, actionType, options = {}, rng = Math.random) {
  if (!state || !state.player || !state.player.alive || state.player.retired) {
    return { ok: false, outcome: 'invalid', message: 'El personaje no puede actuar en combate.', state };
  }
  if (!state.combat || !state.combat.enemy) {
    return { ok: false, outcome: 'invalid', message: 'No hay ningún combate activo.', state };
  }

  const p = state.player;
  const s = p.stats;
  const c = state.combat;
  const enemy = c.enemy;
  const equip = getEquipmentBonuses(state);
  const tech = getTechniqueById(p.techniqueId);
  const isHR = p.origin === 'heavenly_restriction';

  c.playerGuarding = false;

  if (actionType === 'basic_attack') {
    const baseDmg = 10
      + s.strength * 0.42
      + s.speed * 0.15
      + equip.attackBonus
      + (c.tempAttackBonus || 0)
      + (c.ally?.attackBonus || 0);

    const bfChance = isHR
      ? (s.speed >= 50 ? 0.16 : 0.08)
      : (s.cursedEnergyControl >= 25 ? Math.min(0.24, 0.08 + s.cursedEnergyControl * 0.002) : 0.04);

    const isBlackFlash = rng() < bfChance;
    const variance = randomInt(-2, 4, rng);
    const effectiveEnemyDef = Math.max(0, enemy.defense - equip.defensePenetration);
    let finalDmg = Math.max(5, Math.round((baseDmg + variance - effectiveEnemyDef * 0.55) * (isBlackFlash ? 1.65 : 1.0)));

    enemy.health = Math.max(0, enemy.health - finalDmg);

    if (isBlackFlash) {
      state.world.blackFlashesLanded += 1;
      p.techniqueMastery += 3;
      if (!isHR) {
        s.cursedEnergy = Math.min(s.maxCursedEnergy, s.cursedEnergy + 12);
      }
      c.combatLog.push(`Turno ${c.turnNumber}: ¡DESTELLO NEGRO! Las chispas negras distorsionan el espacio e infliges ${finalDmg} de daño crítico a ${enemy.name}.`);
    } else {
      c.combatLog.push(`Turno ${c.turnNumber}: Ejecutas un ataque cuerpo a cuerpo e infliges ${finalDmg} de daño a ${enemy.name}.`);
    }
  } else if (actionType === 'cursed_technique') {
    if (c.domainBurnout > 0 && !isHR) {
      return {
        ok: false,
        outcome: 'blocked',
        message: `Tu técnica innata está agotada tras el dominio (${c.domainBurnout} turnos restantes).`,
        state
      };
    }

    let chosenExt = null;
    if (options.extensionId && Array.isArray(tech.extensions)) {
      chosenExt = tech.extensions.find((ext) => ext.id === options.extensionId && p.unlockedExtensions.includes(ext.id));
    }

    const rawCost = chosenExt ? chosenExt.ceCost : tech.ceCost;
    const finalCost = isHR ? 0 : Math.max(2, rawCost - equip.ceCostReduction);

    if (!isHR && s.cursedEnergy < finalCost) {
      return {
        ok: false,
        outcome: 'blocked',
        message: `Energía maldita insuficiente. Necesitas ${finalCost} puntos (actual: ${s.cursedEnergy}).`,
        state
      };
    }

    if (!isHR) {
      s.cursedEnergy -= finalCost;
    }

    const scalingValue = typeof s[tech.scalingStat] === 'number' ? s[tech.scalingStat] : s.cursedEnergyControl;
    const extMultiplier = chosenExt ? chosenExt.powerMultiplier : 1.0;
    const dmgMod = tech.damageModifier || 1.25;
    const domainBoost = c.domainActive > 0 ? 1.25 : 1.0;

    const rawPower = (tech.basePower + scalingValue * 0.48 + p.techniqueMastery * 0.25 + equip.attackBonus * 0.7 + (c.tempAttackBonus || 0) + (c.ally?.attackBonus || 0))
      * extMultiplier
      * (dmgMod * 0.85)
      * domainBoost;

    const effectiveDef = c.domainActive > 0 ? 0 : Math.max(0, enemy.defense - equip.defensePenetration);
    const variance = randomInt(-3, 5, rng);
    const finalDmg = Math.max(8, Math.round(rawPower + variance - effectiveDef * 0.45));

    enemy.health = Math.max(0, enemy.health - finalDmg);
    if (tech.defenseBonus) {
      c.tempDefenseBonus = Math.min(25, (c.tempDefenseBonus || 0) + Math.round(tech.defenseBonus * 0.5));
    }

    const attackName = chosenExt ? `${tech.name} — ${chosenExt.name}` : tech.name;
    c.combatLog.push(`Turno ${c.turnNumber}: Canalizas "${attackName}"${!isHR ? ` (-${finalCost} EM)` : ''} e infliges ${finalDmg} de daño a ${enemy.name}.`);
  } else if (actionType === 'defend_reinforce') {
    c.playerGuarding = true;
    if (!isHR) {
      const recovered = Math.min(s.maxCursedEnergy - s.cursedEnergy, 14);
      s.cursedEnergy += recovered;
      c.combatLog.push(`Turno ${c.turnNumber}: Refuerzas tu guardia con energía maldita (+Defensa este turno, +${recovered} EM).`);
    } else {
      c.tempDefenseBonus = (c.tempDefenseBonus || 0) + 6;
      c.combatLog.push(`Turno ${c.turnNumber}: Adoptas postura evasiva de Restricción Celestial (+Defensa y percepción).`);
    }

    if (p.unlocks.simpleDomain && c.simpleDomainActive === 0) {
      c.simpleDomainActive = 2;
      c.combatLog.push('Despliegas tu Dominio Simple alrededor de tus pies para anular técnicas de golpe seguro.');
    }
  } else if (actionType === 'binding_vow') {
    if (s.health <= 16) {
      return {
        ok: false,
        outcome: 'blocked',
        message: 'Tu salud es demasiado baja para soportar el coste vital de un Voto Vinculante improvisado.',
        state
      };
    }

    s.health -= 14;
    s.mentalHealth = Math.max(0, s.mentalHealth - 8);
    if (!isHR) {
      s.cursedEnergy = Math.min(s.maxCursedEnergy, s.cursedEnergy + 28);
    }
    c.tempAttackBonus = (c.tempAttackBonus || 0) + 16;
    state.world.bindingVowsTaken += 1;

    const vowStrike = Math.max(12, Math.round(18 + s.strength * 0.4 + s.cursedEnergyControl * 0.35 - enemy.defense * 0.3));
    enemy.health = Math.max(0, enemy.health - vowStrike);

    c.combatLog.push(`Turno ${c.turnNumber}: ¡Voto Vinculante improvisado! Sacrificas 14 de Salud y 8 de Salud mental para ganar +16 Ataque, restaurar reserva y asestar un impacto de ${vowStrike} de daño.`);
  } else if (actionType === 'use_rct') {
    if (!p.unlocks.rct || isHR) {
      return { ok: false, outcome: 'blocked', message: 'No dominas la Técnica Maldita Inversa (RCT).', state };
    }
    const rctCost = 22;
    if (s.cursedEnergy < rctCost) {
      return { ok: false, outcome: 'blocked', message: `Requiere ${rctCost} de Energía maldita para multiplicar energía positiva.`, state };
    }
    s.cursedEnergy -= rctCost;
    s.health = Math.min(100, s.health + 38);
    c.combatLog.push(`Turno ${c.turnNumber}: Multiplicas energía negativa por negativa con Técnica Maldita Inversa (-${rctCost} EM, +38 Salud).`);
  } else if (actionType === 'domain_expansion') {
    if (!p.unlocks.domainExpansion || isHR) {
      return { ok: false, outcome: 'blocked', message: 'Aún no has desbloqueado la Expansión de Dominio.', state };
    }
    if (c.domainBurnout > 0) {
      return { ok: false, outcome: 'blocked', message: 'Tu corteza prefrontal sigue agotada tras una expansión previa.', state };
    }
    const domainCost = Math.max(25, 38 - equip.ceCostReduction);
    if (s.cursedEnergy < domainCost) {
      return { ok: false, outcome: 'blocked', message: `Necesitas ${domainCost} de Energía maldita para abrir tu Expansión de Dominio.`, state };
    }

    s.cursedEnergy -= domainCost;

    const highRiskBackfire = (s.cursedEnergyControl < 75 || s.health < 25) && rng() < 0.3;
    if (highRiskBackfire) {
      s.health = Math.max(1, s.health - 18);
      c.domainBurnout = 3;
      const partialDmg = Math.max(15, Math.round(tech.basePower * 1.1));
      enemy.health = Math.max(0, enemy.health - partialDmg);
      c.combatLog.push(`Turno ${c.turnNumber}: ¡Sobrecarga al expandir "${tech.domainName}"! La barrera colapsa parcialmente: infliges ${partialDmg} de daño, pero sufres 18 de daño cerebral y agotamiento de técnica.`);
    } else {
      c.domainActive = 2;
      c.domainBurnout = 2;
      const sureHitDmg = Math.round(tech.basePower * 1.9 + s.cursedEnergyControl * 0.55 + p.techniqueMastery * 0.4);
      enemy.health = Math.max(0, enemy.health - sureHitDmg);
      c.combatLog.push(`Turno ${c.turnNumber}: ¡EXPANSIÓN DE DOMINIO: "${tech.domainName}"! El golpe garantizado ignora toda defensa e inflige ${sureHitDmg} de daño devastador a ${enemy.name}.`);
    }
  } else if (actionType === 'use_item') {
    const res = useConsumable(state, options.itemId);
    if (!res.ok) {
      return { ok: false, outcome: 'blocked', message: res.message, state };
    }
    c.combatLog.push(`Turno ${c.turnNumber}: ${res.message}`);
  } else if (actionType === 'flee') {
    const fleeScore = (s.speed + equip.speedBonus) * 0.6 + s.tacticalIntelligence * 0.4;
    const targetScore = enemy.speed * 0.85;
    const fleeChance = Math.min(0.85, Math.max(0.25, 0.5 + (fleeScore - targetScore) * 0.01));

    if (rng() < fleeChance) {
      return handleCombatFlee(state);
    }
    c.combatLog.push(`Turno ${c.turnNumber}: ¡Intentaste retirarte, pero ${enemy.name} cortó tu ruta de escape!`);
  } else {
    return { ok: false, outcome: 'invalid', message: 'Acción de combate no reconocida.', state };
  }

  if (enemy.health <= 0) {
    return handleCombatVictory(state);
  }

  return executeEnemyTurn(state, rng);
}

function executeEnemyTurn(state, rng) {
  const p = state.player;
  const s = p.stats;
  const c = state.combat;
  const enemy = c.enemy;
  const equip = getEquipmentBonuses(state);

  const useSpecial = rng() < (enemy.specialChance || 0.3);
  const rawEnemyAtk = useSpecial ? enemy.specialPower : enemy.attack;

  const playerBaseDef = s.strength * 0.18
    + s.cursedEnergyControl * 0.16
    + equip.defenseBonus
    + (c.tempDefenseBonus || 0)
    + (c.ally?.defenseBonus || 0);

  const guardMultiplier = c.playerGuarding ? 1.85 : 1.0;
  const simpleDomainBonus = c.simpleDomainActive > 0 ? 10 : 0;
  const domainBonus = c.domainActive > 0 ? 12 : 0;

  const totalDefense = (playerBaseDef + simpleDomainBonus + domainBonus) * guardMultiplier;
  const variance = randomInt(-2, 3, rng);
  const damageTaken = Math.max(3, Math.round(rawEnemyAtk + variance - totalDefense * 0.55));

  s.health = Math.max(0, s.health - damageTaken);

  if (useSpecial) {
    c.combatLog.push(`${enemy.name} desata "${enemy.specialName}" y te inflige ${damageTaken} puntos de daño.`);
  } else {
    c.combatLog.push(`${enemy.name} contraataca y te causa ${damageTaken} puntos de daño.`);
  }

  if (c.simpleDomainActive > 0) {
    c.simpleDomainActive -= 1;
  }
  if (c.domainActive > 0) {
    c.domainActive -= 1;
  }
  if (c.domainBurnout > 0) {
    c.domainBurnout -= 1;
  }
  c.turnNumber += 1;

  if (s.health <= 0) {
    return handleCombatDeath(state, enemy);
  }

  sanitizeGameState(state);
  return {
    ok: true,
    outcome: 'ongoing',
    message: c.combatLog[c.combatLog.length - 1],
    state
  };
}

function handleCombatVictory(state) {
  const p = state.player;
  const s = p.stats;
  const c = state.combat;
  const enemy = c.enemy;
  let victorySummary = '';

  state.world.exorcisedCurses += 1;

  if (c.isPromotionExam && c.targetRankId) {
    const newRank = getRankById(c.targetRankId);
    p.rank = newRank.id;
    p.rankOrder = newRank.order;
    s.prestige += 12;
    s.higherUpsRelation += 5;
    p.techniqueMastery += 5;
    victorySummary = `¡Victoria en el examen de ascenso! Has sido promovido oficialmente a ${newRank.name} (+12 Prestigio, +5 Maestría).`;
  } else if (c.missionId) {
    const mission = getMissionById(c.missionId);
    if (mission) {
      p.money += mission.rewards.money;
      s.prestige += mission.rewards.prestige;
      s.higherUpsRelation += mission.rewards.higherUpsRelation;
      p.techniqueMastery += mission.rewards.masteryGain;
      state.world.completedMissions += 1;
      state.world.curseActivity = Math.max(0, state.world.curseActivity - 4);
      victorySummary = `¡Misión "${mission.title}" completada! Exorcizaste a ${enemy.name} (+${mission.rewards.money.toLocaleString('es-ES')} ¥, +${mission.rewards.prestige} Prestigio, +${mission.rewards.masteryGain} Maestría).`;
    }
  }

  if (!victorySummary) {
    const rewardMoney = 10000 + (enemy.gradeOrder || 0) * 6000;
    p.money += rewardMoney;
    s.prestige += 7;
    p.techniqueMastery += 5;
    victorySummary = `¡Derrotaste a ${enemy.name}! (+${rewardMoney.toLocaleString('es-ES')} ¥, +7 Prestigio, +5 Maestría).`;
  }

  state.combat = null;
  evaluateWorldIncidentsAndAchievements(state);
  sanitizeGameState(state);
  addLogEntry(state, victorySummary, 'combat');

  return {
    ok: true,
    outcome: 'victory',
    message: victorySummary,
    state
  };
}

function handleCombatFlee(state) {
  const p = state.player;
  const s = p.stats;
  const c = state.combat;
  const enemyName = c.enemy.name;
  let fleeSummary = '';

  if (c.isPromotionExam) {
    s.prestige -= 6;
    fleeSummary = `Te retiraste del examen de promoción frente a ${enemyName}. Deberás intentarlo en otro trimestre (-6 Prestigio).`;
  } else if (c.missionId) {
    const mission = getMissionById(c.missionId);
    if (mission && mission.failurePenalty) {
      s.prestige += mission.failurePenalty.prestige || -5;
      s.higherUpsRelation += mission.failurePenalty.higherUpsRelation || -4;
      s.mentalHealth += mission.failurePenalty.mentalHealth || -6;
    }
    fleeSummary = `Huiste con vida de "${enemyName}". La misión quedó abortada y tu reputación sufrió las consecuencias.`;
  } else {
    s.prestige -= 5;
    s.mentalHealth -= 4;
    fleeSummary = `Escapaste del combate contra ${enemyName} (-5 Prestigio, -4 Salud mental).`;
  }

  state.combat = null;
  sanitizeGameState(state);
  addLogEntry(state, fleeSummary, 'warning');

  return {
    ok: true,
    outcome: 'fled',
    message: fleeSummary,
    state
  };
}

function handleCombatDeath(state, enemy) {
  const p = state.player;
  p.stats.health = 0;
  p.alive = false;
  p.causeOfDeath = `Abatido en combate mortal contra ${enemy.name}.`;
  p.ending = {
    id: 'ending_combat_death',
    title: 'Caído dentro del Velo',
    summary: `${p.name} luchó hasta su último aliento y cayó ante ${enemy.name} a los ${p.age} años. La muerte de un hechicero es definitiva.`
  };

  if (!state.world.unlockedEndings.includes(p.ending.title)) {
    state.world.unlockedEndings.push(p.ending.title);
  }

  state.combat = null;
  sanitizeGameState(state);
  const deathMsg = `MUERTE PERMANENTE: Has caído en combate ante ${enemy.name}. Tu historia concluye aquí.`;
  addLogEntry(state, deathMsg, 'death');

  return {
    ok: true,
    outcome: 'death',
    message: deathMsg,
    state
  };
}
