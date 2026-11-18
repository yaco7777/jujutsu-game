import { getNpcById } from '../data/npcs.js';
import { getMissionById } from '../data/missions.js';
import {
  MAX_NPC_INTERACTIONS_PER_YEAR,
  MAX_TOTAL_SOCIAL_PER_YEAR,
  canPerformQuarterAction,
  consumeTurnAction,
  addLogEntry,
  sanitizeGameState
} from './gameState.js';
import { calculateLogarithmicStatGain } from './progression.js';

export function getNpcInteractionStatus(state, npcId) {
  const perNpc = state?.turn?.npcInteractions?.[npcId] || 0;
  const totalSocial = state?.turn?.totalSocialThisYear || 0;
  return {
    perNpc,
    maxPerNpc: MAX_NPC_INTERACTIONS_PER_YEAR,
    totalSocial,
    maxTotalSocial: MAX_TOTAL_SOCIAL_PER_YEAR,
    canInteract: perNpc < MAX_NPC_INTERACTIONS_PER_YEAR && totalSocial < MAX_TOTAL_SOCIAL_PER_YEAR
  };
}

function registerNpcInteraction(state, npcId) {
  if (!state.turn.npcInteractions) {
    state.turn.npcInteractions = {};
  }
  state.turn.npcInteractions[npcId] = (state.turn.npcInteractions[npcId] || 0) + 1;
  state.turn.totalSocialThisYear = (state.turn.totalSocialThisYear || 0) + 1;
}

export function interactWithNpc(state, npcId, actionType) {
  if (!state || !state.player || !state.player.alive || state.player.retired) {
    return { ok: false, message: 'No puedes interactuar con personajes en este momento.', state };
  }

  const npc = getNpcById(npcId);
  if (!npc) {
    return { ok: false, message: 'Personaje no encontrado.', state };
  }

  const limitStatus = getNpcInteractionStatus(state, npc.id);
  if (actionType !== 'betray' && !limitStatus.canInteract) {
    if (limitStatus.perNpc >= limitStatus.maxPerNpc) {
      return {
        ok: false,
        message: `Ya alcanzaste el límite de interacciones con ${npc.name} este año (${limitStatus.perNpc}/${limitStatus.maxPerNpc}). Avanza al próximo año.`,
        state
      };
    }
    return {
      ok: false,
      message: `Has agotado el cupo social máximo de este año (${limitStatus.totalSocial}/${limitStatus.maxTotalSocial}).`,
      state
    };
  }

  const rel = state.relationships[npc.id];
  const p = state.player;
  const s = p.stats;

  if (actionType === 'talk') {
    rel.friendship += 4;
    rel.respect += 2;
    s.mentalHealth += 3;
    if (npc.preferredPersonality === p.personality) {
      rel.friendship += 2;
    }
    registerNpcInteraction(state, npc.id);
    sanitizeGameState(state);
    const quote = npc.dialogues?.greeting || 'Intercambiaste impresiones sobre el mundo de la hechicería.';
    const msg = `Conversaste con ${npc.name}: ${quote} (+Amistad, +3 Salud mental · Interacciones con ${npc.name}: ${state.turn.npcInteractions[npc.id]}/${MAX_NPC_INTERACTIONS_PER_YEAR}).`;
    addLogEntry(state, msg, 'social');
    return { ok: true, message: msg, state };
  }

  if (actionType === 'gift') {
    const giftCost = 7000;
    if (p.money < giftCost) {
      return { ok: false, message: `Necesitas ${giftCost.toLocaleString('es-ES')} ¥ para hacer un obsequio a ${npc.name}.`, state };
    }
    p.money -= giftCost;
    rel.friendship += 8;
    rel.respect += 4;
    rel.rivalry = Math.max(0, rel.rivalry - 4);
    registerNpcInteraction(state, npc.id);
    sanitizeGameState(state);
    const msg = `Entregaste un obsequio selecto a ${npc.name} (-7.000 ¥, +8 Amistad, +4 Respeto).`;
    addLogEntry(state, msg, 'social');
    return { ok: true, message: msg, state };
  }

  if (actionType === 'train_together') {
    if (!npc.canTrain) {
      return { ok: false, message: `${npc.name} no está disponible para sesiones de entrenamiento personal.`, state };
    }
    const check = canPerformQuarterAction(state);
    if (!check.allowed) {
      return { ok: false, message: check.reason, state };
    }
    if (rel.friendship < 20 && rel.respect < 25) {
      return { ok: false, message: `Necesitas al menos 20 de Amistad o 25 de Respeto para entrenar con ${npc.name}.`, state };
    }

    const bonuses = npc.trainingBonus || {};
    const appliedList = [];
    const talentMult = p.talent?.growthMultiplier || 1.0;

    for (const [statKey, _val] of Object.entries(bonuses)) {
      if (p.origin === 'heavenly_restriction' && statKey === 'cursedEnergyControl') {
        const gain = calculateLogarithmicStatGain(s.speed, 'normal', 0.95, talentMult);
        s.speed += gain;
        appliedList.push(`+${gain} Velocidad`);
      } else if (typeof s[statKey] === 'number') {
        const gain = calculateLogarithmicStatGain(s[statKey], 'normal', 0.95, talentMult);
        s[statKey] += gain;
        appliedList.push(`+${gain} ${statKey}`);
      }
    }

    const masteryGain = calculateLogarithmicStatGain(p.techniqueMastery, 'normal', 0.85, talentMult);
    p.techniqueMastery += masteryGain;
    rel.friendship += 5;
    rel.respect += 6;
    registerNpcInteraction(state, npc.id);
    consumeTurnAction(state, `Entrenamiento con ${npc.name}`);

    sanitizeGameState(state);
    const quote = npc.dialogues?.train || '';
    const msg = `Entrenaste con ${npc.name}. ${quote} (${appliedList.join(', ')}, +${masteryGain} Maestría).`;
    addLogEntry(state, msg, 'training');
    return { ok: true, message: msg, state };
  }

  if (actionType === 'form_alliance') {
    if (!npc.canAlly) {
      return { ok: false, message: `${npc.name} no forma alianzas formales.`, state };
    }
    if (rel.allied) {
      return { ok: false, message: `Ya mantienes una alianza activa con ${npc.name}.`, state };
    }
    if (rel.betrayed) {
      return { ok: false, message: `Traicionaste a ${npc.name} en el pasado; jamás volverá a confiar en ti.`, state };
    }
    if (rel.friendship < 55 || rel.respect < 50) {
      return { ok: false, message: `Requiere al menos 55 de Amistad y 50 de Respeto con ${npc.name} para sellar una alianza.`, state };
    }

    rel.allied = true;
    s.prestige += 6;
    if (npc.faction.includes('Altos Mandos') || npc.faction.includes('Clan')) {
      s.higherUpsRelation += 5;
    } else {
      s.popularity += 6;
    }
    registerNpcInteraction(state, npc.id);
    sanitizeGameState(state);
    const quote = npc.dialogues?.alliance || '';
    const msg = `Sellaste una alianza estratégica con ${npc.name}. ${quote} (+6 Prestigio).`;
    addLogEntry(state, msg, 'milestone');
    return { ok: true, message: msg, state };
  }

  if (actionType === 'date_romance') {
    if (p.age < 15) {
      return { ok: false, message: 'Las citas románticas solo están disponibles a partir de los 15 años.', state };
    }
    if (rel.friendship < 50) {
      return { ok: false, message: `Necesitas al menos 50 de Amistad con ${npc.name} para invitarle a una cita.`, state };
    }
    rel.romance = (rel.romance || 0) + 15;
    rel.friendship += 6;
    rel.trust = (rel.trust || rel.friendship) + 8;
    p.romanticPartnerId = npc.id;
    s.mentalHealth += 10;
    registerNpcInteraction(state, npc.id);
    sanitizeGameState(state);
    const msg = `Saliste en una cita especial con ${npc.name} (+15 Romance, +6 Amistad, +10 Salud mental).`;
    addLogEntry(state, msg, 'social');
    return { ok: true, message: msg, state };
  }

  if (actionType === 'marry') {
    if (p.age < 18) {
      return { ok: false, message: 'Debes tener al menos 18 años para contraer matrimonio.', state };
    }
    if ((rel.romance || 0) < 60) {
      return { ok: false, message: `Necesitas al menos 60 de vínculo romántico con ${npc.name} para casarte.`, state };
    }
    if (state.family) {
      state.family.spouse = npc.name;
    }
    p.romanticPartnerId = npc.id;
    rel.allied = true;
    s.mentalHealth += 20;
    s.prestige += 8;
    registerNpcInteraction(state, npc.id);
    sanitizeGameState(state);
    const msg = `¡Contraiste matrimonio con ${npc.name}! Ahora pueden formar su propia familia (+20 Salud mental, +8 Prestigio).`;
    addLogEntry(state, msg, 'milestone');
    return { ok: true, message: msg, state };
  }

  if (actionType === 'betray') {
    if (rel.betrayed) {
      return { ok: false, message: `Ya has roto todo vínculo con ${npc.name}.`, state };
    }
    rel.allied = false;
    rel.betrayed = true;
    rel.friendship = 0;
    rel.respect = Math.max(0, rel.respect - 30);
    rel.rivalry = 100;
    p.money += 25000;
    s.threatLevel += 12;
    s.popularity -= 10;

    sanitizeGameState(state);
    const quote = npc.dialogues?.rivalry || '';
    const msg = `Traicionaste la confianza de ${npc.name} a cambio de ventaja táctica y 25.000 ¥. ${quote} (Rivalidad al máximo).`;
    addLogEntry(state, msg, 'event');
    return { ok: true, message: msg, state };
  }

  return { ok: false, message: 'Acción social desconocida.', state };
}

export function startDuoMissionWithNpc(state, npcId, missionId) {
  const check = canPerformQuarterAction(state);
  if (!check.allowed) {
    return { ok: false, message: check.reason, state };
  }

  const npc = getNpcById(npcId);
  if (!npc || !npc.canDuoMission) {
    return { ok: false, message: 'Este personaje no está disponible para misiones en dúo.', state };
  }

  const rel = state.relationships[npc.id];
  if (!rel || (rel.friendship < 45 && rel.respect < 45 && !rel.allied)) {
    return { ok: false, message: `Necesitas al menos 45 de Amistad o Respeto (o una alianza) con ${npc.name} para invitarle a una misión en dúo.`, state };
  }

  const mission = getMissionById(missionId);
  if (!mission) {
    return { ok: false, message: 'Misión no encontrada.', state };
  }

  const p = state.player;
  if (p.rankOrder < mission.requirements.minRankOrder) {
    return { ok: false, message: 'Tu rango actual no permite aceptar esta misión.', state };
  }
  if (p.stats.health < mission.requirements.minHealth) {
    return { ok: false, message: `Salud insuficiente para la misión (requiere ${mission.requirements.minHealth}+).`, state };
  }

  consumeTurnAction(state, `Misión en dúo con ${npc.name}: ${mission.title}`);
  registerNpcInteraction(state, npc.id);
  rel.friendship += 5;
  rel.respect += 4;

  const tpl = mission.enemyTemplate;
  state.combat = {
    id: `duo_${mission.id}_${Date.now()}`,
    turnNumber: 1,
    isPromotionExam: false,
    targetRankId: null,
    missionId: mission.id,
    playerGuarding: false,
    simpleDomainActive: 0,
    domainActive: 0,
    domainBurnout: 0,
    tempAttackBonus: 0,
    tempDefenseBonus: 0,
    ally: {
      npcId: npc.id,
      name: npc.name,
      attackBonus: 11,
      defenseBonus: 6
    },
    enemy: {
      ...tpl,
      health: tpl.maxHealth
    },
    combatLog: [
      `Inicias la misión "${mission.title}" en dúo con ${npc.name}.`,
      `${npc.name} cubre tu flanco (+11 Ataque de apoyo, +6 Defensa).`
    ]
  };

  sanitizeGameState(state);
  addLogEntry(state, `Partiste en misión en dúo con ${npc.name}: "${mission.title}".`, 'combat');
  return { ok: true, message: `Misión en dúo iniciada junto a ${npc.name}.`, state };
}
