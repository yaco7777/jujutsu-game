import {
  MAX_ACTIONS_PER_TURN,
  getRankById,
  canPerformQuarterAction,
  consumeTurnAction,
  addLogEntry,
  sanitizeGameState
} from './gameState.js';
import { calculateLogarithmicStatGain } from './progression.js';
import { selectNextEvent } from './eventEngine.js';
import { processAnnualFamilyUpdate } from './familyEngine.js';
import { processAnnualSchoolUpdate } from './schoolEngine.js';
import { getMissionById } from '../data/missions.js';
import { randomChoice, randomInt } from './utils.js';

export function performQuarterAction(state, actionType, payload = {}, rng = Math.random) {
  const check = canPerformQuarterAction(state);
  if (!check.allowed) {
    return { ok: false, message: check.reason, state };
  }

  const p = state.player;
  const s = p.stats;
  const talentMult = p.talent?.growthMultiplier || 1.0;
  let message = '';

  // Acciones reales de Primera Infancia (1 a 5 años)
  if (actionType === 'child_play') {
    const strGain = calculateLogarithmicStatGain(s.strength, 'facil', 0.85, talentMult);
    const spdGain = calculateLogarithmicStatGain(s.speed, 'facil', 0.85, talentMult);
    s.strength += strGain;
    s.speed += spdGain;
    s.mentalHealth += 6;
    message = `Jugaste y corriste por el patio familiar: tu cuerpo infantil se fortalece (+${strGain} Fuerza, +${spdGain} Velocidad, +6 Salud mental).`;
  } else if (actionType === 'child_curiosity') {
    const intGain = calculateLogarithmicStatGain(s.tacticalIntelligence, 'normal', 0.9, talentMult);
    s.tacticalIntelligence += intGain;
    s.popularity += 2;
    s.mentalHealth += 5;
    message = `Escuchaste historias de tus padres y exploraste tu entorno con curiosidad (+${intGain} Inteligencia, +5 Salud mental).`;
  } else if (actionType === 'child_sense') {
    if (p.origin === 'heavenly_restriction') {
      const spdGain = calculateLogarithmicStatGain(s.speed, 'normal', 0.9, talentMult);
      s.speed += spdGain;
      message = `Tus sentidos físicos perciben hasta el roce del viento en la habitación (+${spdGain} Velocidad).`;
    } else {
      const ctrlGain = calculateLogarithmicStatGain(s.cursedEnergyControl, 'normal', 0.9, talentMult);
      s.cursedEnergyControl += ctrlGain;
      message = `Observaste en silencio las pequeñas sombras invisibles de la casa, preparando tu sensibilidad (+${ctrlGain} Control latente).`;
    }
  } else if (actionType === 'work_patrol') {
    if (p.age < 6) {
      return { ok: false, message: 'Eres demasiado pequeño (menos de 6 años) para realizar encargos o patrullas.', state };
    }
    const rankObj = getRankById(p.rank);
    const basePay = p.age < 15
      ? randomInt(2000, 4500, rng)
      : rankObj.stipendium + randomInt(3000, 7500, rng);
    const careerMult = p.careerPath === 'mercenario' || p.careerPath === 'desertor' ? 1.35 : 1.0;
    const earned = Math.round(basePay * careerMult);
    p.money += earned;
    const presGain = calculateLogarithmicStatGain(s.prestige, 'facil', 0.85, talentMult);
    s.prestige += presGain;
    s.mentalHealth -= 3;
    message = p.age < 15
      ? `Ayudaste en recados familiares y observación de Ventana: ahorraste ${earned.toLocaleString('es-ES')} ¥ (+${presGain} Prestigio).`
      : `Patrulla y guardia de cortinas completada: ganaste ${earned.toLocaleString('es-ES')} ¥ y +${presGain} Prestigio (-3 Salud mental).`;
  } else if (actionType === 'rest_recover') {
    s.health += 28;
    s.mentalHealth += 22;
    if (p.origin !== 'heavenly_restriction') {
      s.cursedEnergy += 35;
    }
    if (p.vesselRisk > 0) {
      p.vesselRisk = Math.max(0, p.vesselRisk - 6);
    }
    message = p.age < 6
      ? 'Dormiste profundamente bajo el cuidado de tus padres: +28 Salud y +22 Salud mental.'
      : 'Dedicaste tiempo a descansar y recuperarte: +28 Salud, +22 Salud mental y reservas restauradas.';
  } else if (actionType === 'study_academics') {
    const intGain = calculateLogarithmicStatGain(s.tacticalIntelligence, 'normal', 0.9, talentMult);
    s.tacticalIntelligence += intGain;
    if (p.origin !== 'heavenly_restriction') {
      const ctrlGain = calculateLogarithmicStatGain(s.cursedEnergyControl, 'facil', 0.85, talentMult);
      s.cursedEnergyControl += ctrlGain;
    }
    s.higherUpsRelation += 2;
    message = `Estudiaste teoría de barreras y pergaminos jujutsu: +${intGain} Inteligencia táctica, +2 Relación con altos mandos.`;
  } else if (actionType === 'socialize_campus') {
    const popGain = calculateLogarithmicStatGain(s.popularity, 'normal', 0.9, talentMult);
    s.popularity += popGain;
    s.mentalHealth += 10;
    if (state.relationships.npc_yuji_itadori) {
      state.relationships.npc_yuji_itadori.friendship += 3;
    }
    if (state.relationships.npc_nobara_kugisaki) {
      state.relationships.npc_nobara_kugisaki.friendship += 3;
    }
    message = `Compartiste tiempo libre y forjaste amistades: +${popGain} Popularidad, +10 Salud mental.`;
  } else if (actionType === 'accept_mission') {
    if (p.age < 6) {
      return { ok: false, message: 'Un niño menor de 6 años no puede aceptar misiones de exorcismo.', state };
    }
    const mission = getMissionById(payload.missionId);
    if (!mission) {
      return { ok: false, message: 'Misión no encontrada.', state };
    }
    if (p.rankOrder < mission.requirements.minRankOrder) {
      return { ok: false, message: 'No tienes el grado requerido para aceptar esta misión.', state };
    }
    if (s.health < mission.requirements.minHealth) {
      return { ok: false, message: `Salud insuficiente para desplegarte (requiere ${mission.requirements.minHealth}+).`, state };
    }

    consumeTurnAction(state, `Misión: ${mission.title}`);

    const tpl = mission.enemyTemplate;
    const worldMultiplier = state.world.curseActivity >= 70 ? 1.15 : 1.0;
    const scaledHp = Math.round(tpl.maxHealth * worldMultiplier);
    const scaledAtk = Math.round(tpl.attack * worldMultiplier);

    state.combat = {
      id: `mission_${mission.id}_${Date.now()}`,
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
      ally: null,
      enemy: {
        ...tpl,
        maxHealth: scaledHp,
        health: scaledHp,
        attack: scaledAtk
      },
      combatLog: [
        `Despliegue en misión "${mission.title}" (Riesgo: ${mission.riskLevel}).`,
        `¡Te enfrentas a ${tpl.name}!`
      ]
    };

    sanitizeGameState(state);
    addLogEntry(state, `Aceptaste la misión "${mission.title}" y entraste en combate con ${tpl.name}.`, 'combat');
    return { ok: true, message: `Misión "${mission.title}" iniciada.`, state };
  } else {
    return { ok: false, message: 'Acción desconocida.', state };
  }

  consumeTurnAction(state, actionType);
  sanitizeGameState(state);
  addLogEntry(state, message, 'action');

  return { ok: true, message, state };
}

export function advanceQuarter(state, rng = Math.random) {
  if (!state || !state.player) {
    return { ok: false, message: 'Estado inválido.', state };
  }
  const p = state.player;
  const s = p.stats;

  if (!p.alive) {
    return { ok: false, message: 'El personaje ha muerto. Inicia una nueva vida.', state };
  }
  if (p.retired) {
    return { ok: false, message: 'La carrera de este personaje ya ha concluido.', state };
  }
  if (state.combat) {
    return { ok: false, message: 'Debes terminar el combate activo antes de avanzar de año.', state };
  }
  if (state.turn?.activeEvent) {
    return { ok: false, message: 'Debes tomar una decisión en el evento principal actual antes de avanzar de año.', state };
  }

  // Cada avance corresponde a 1 Año completo de vida
  p.totalQuarters += 1;
  p.age += 1;
  p.year += 1;
  p.quarter = 1;

  if (p.age === 6) {
    addLogEntry(state, '¡Cumples 6 años! Llega la Edad del Despertar: tu técnica maldita innata despierta y ya puedes entrenarla.', 'milestone');
  } else if (p.age === 15) {
    if (['crianza_familiar', 'discipulo_clan', 'entrenamiento_callejero'].includes(p.careerPath)) {
      p.careerPath = 'estudiante';
    }
    addLogEntry(state, '¡Cumples 15 años! Ingresas oficialmente como Estudiante en el Colegio Técnico de Hechicería.', 'milestone');
  }

  const rankObj = getRankById(p.rank);
  const stipendium = p.careerPath === 'desertor' || p.age < 6
    ? 0
    : (p.age < 15 ? Math.round(rankObj.stipendium * 0.25) : Math.round(rankObj.stipendium * 0.9));
  if (stipendium > 0) {
    p.money += stipendium;
  }

  s.health += 16;
  s.mentalHealth += 8;
  p.fatigue = Math.max(0, (p.fatigue || 0) - 35);
  p.injury = null;
  p.illness = null;
  if (p.origin !== 'heavenly_restriction') {
    s.cursedEnergy += 30;
  }

  processAnnualFamilyUpdate(state, rng);
  processAnnualSchoolUpdate(state);

  if (p.origin === 'cursed_vessel' && p.vesselRisk >= 75) {
    s.mentalHealth -= 6;
    s.threatLevel += 5;
    addLogEntry(state, 'La reliquia sellada en tu interior agita tus sueños y eleva tu nivel de amenaza.', 'warning');
  }

  const activityDelta = randomInt(-4, 7, rng);
  state.world.curseActivity += activityDelta;

  const sampleNews = [
    `Año ${p.year}: La actividad de maldiciones se sitúa en el ${state.world.curseActivity}% a nivel nacional.`,
    `Año ${p.year}: Los Tres Grandes Clanes debaten nuevas asignaciones presupuestarias para las escuelas técnicas.`,
    `Año ${p.year}: Se reportan avistamientos de usuarios malditos independientes en distritos comerciales.`,
    `Año ${p.year}: El Cuerpo Médico de Hechicería publica nuevos protocolos de contención de cortinas.`
  ];
  const sampleRumors = [
    `Se rumorea que ${p.name} ha estado perfeccionando sus habilidades a los ${p.age} años.`,
    `Entre las Ventanas se comenta el potencial del linaje de ${p.name}.`,
    `Algunos veteranos debaten si la nueva generación superará a los antiguos Grado 1.`
  ];
  if (Array.isArray(state.world.worldNews)) {
    state.world.worldNews.unshift(randomChoice(sampleNews, rng));
    if (state.world.worldNews.length > 10) state.world.worldNews.length = 10;
  }
  if (Array.isArray(state.world.rumors)) {
    state.world.rumors.unshift(randomChoice(sampleRumors, rng));
    if (state.world.rumors.length > 10) state.world.rumors.length = 10;
  }

  state.world.lastAnnualSummary = {
    ageReached: p.age,
    yearNumber: p.year,
    stipendiumEarned: stipendium,
    schoolGrades: state.school?.grades ?? 75,
    curseActivity: state.world.curseActivity
  };

  evaluateWorldIncidentsAndAchievements(state);

  // Reiniciar el cupo de 4 acciones anuales y límites de interacción con NPC
  state.turn.maxActionsPerTurn = MAX_ACTIONS_PER_TURN;
  state.turn.actionsRemaining = MAX_ACTIONS_PER_TURN;
  state.turn.actionsTakenCount = 0;
  state.turn.quarterActionTaken = false;
  state.turn.lastActionName = null;
  state.turn.npcInteractions = {};
  state.turn.totalSocialThisYear = 0;

  if (p.age >= 50 && !p.retired) {
    return retireCharacter(state, 'Has sobrevivido décadas en un oficio donde pocos alcanzan la madurez.');
  }

  const nextEvent = selectNextEvent(state, rng);
  if (nextEvent) {
    state.turn.activeEvent = nextEvent;
  }

  sanitizeGameState(state);
  const summary = `Avanzaste un año: ahora tienes ${p.age} años (Año ${p.year}). Tienes 4 acciones nuevas disponibles.${stipendium > 0 ? ` Apoyo / Estipendio anual: ${stipendium.toLocaleString('es-ES')} ¥.` : ''}`;
  addLogEntry(state, summary, 'quarter');
  return { ok: true, message: summary, state };
}

export const advanceYear = advanceQuarter;

export function evaluateWorldIncidentsAndAchievements(state) {
  const p = state.player;
  const s = p.stats;
  const w = state.world;

  if (w.curseActivity >= 75 && !w.globalIncidents.includes('Oleada de Maldiciones en Shibuya')) {
    w.globalIncidents.push('Oleada de Maldiciones en Shibuya');
    addLogEntry(state, '¡Incidente global activo! Oleada de Maldiciones en Shibuya: los espíritus son más feroces.', 'warning');
  }
  if (s.threatLevel >= 80 && !w.globalIncidents.includes('Orden de Vigilancia Especial del Consejo')) {
    w.globalIncidents.push('Orden de Vigilancia Especial del Consejo');
    addLogEntry(state, 'El consejo de altos mandos te ha declarado objetivo de vigilancia prioritaria.', 'warning');
  }

  const potentialAchievements = [
    { id: 'ach_grade_1', title: 'Pilar de Grado 1', check: () => p.rankOrder >= 5 },
    { id: 'ach_special_grade', title: 'Anomalía de Grado Especial', check: () => p.rankOrder >= 6 },
    { id: 'ach_black_flash', title: 'Elegido por las Chispas Negras', check: () => w.blackFlashesLanded >= 1 },
    { id: 'ach_domain', title: 'Pináculo de la Hechicería (Dominio)', check: () => Boolean(p.unlocks.domainExpansion) },
    { id: 'ach_veteran', title: 'Exorcista Implacable (10+ Misiones)', check: () => w.completedMissions >= 10 },
    { id: 'ach_wealthy', title: 'Fortuna de Mei Mei (150.000+ ¥)', check: () => p.money >= 150000 }
  ];

  for (const ach of potentialAchievements) {
    if (ach.check() && !w.achievements.includes(ach.title)) {
      w.achievements.push(ach.title);
      addLogEntry(state, `Logro desbloqueado: "${ach.title}".`, 'milestone');
    }
  }
}

export function determineCareerEnding(state) {
  const p = state.player;
  const s = p.stats;

  if (!p.alive) {
    return {
      id: 'ending_fallen_sorcerer',
      title: 'Cenizas en el Velo',
      summary: `${p.name} cayó en combate a los ${p.age} años. Su nombre quedó grabado en los archivos del colegio técnico.`
    };
  }
  if (p.careerPath === 'desertor' || s.threatLevel >= 85) {
    return {
      id: 'ending_curse_king_successor',
      title: 'Soberano de las Sombras',
      summary: `${p.name} rompió las cadenas de los altos mandos y se convirtió en una leyenda temida por todo el mundo jujutsu.`
    };
  }
  if (p.careerPath === 'lider_clan') {
    return {
      id: 'ending_clan_patriarch',
      title: 'Reformador de las Tres Familias',
      summary: `${p.name} asumió el liderazgo dinástico y transformó la política de los grandes clanes para una nueva era.`
    };
  }
  if (p.rankOrder >= 6 && s.prestige >= 85) {
    return {
      id: 'ending_honored_strongest',
      title: 'El Más Fuerte de su Generación',
      summary: `${p.name} alcanzó el Grado Especial y redefinió el equilibrio entre hechiceros y maldiciones junto a Satoru Gojo y Yuta Okkotsu.`
    };
  }
  if (p.careerPath === 'mercenario' && p.money >= 120000) {
    return {
      id: 'ending_golden_broker',
      title: 'Magnate del Mercado Nocturno',
      summary: `${p.name} acumuló una fortuna en contratos de alto riesgo y se retiró invicto lejos de la burocracia.`
    };
  }
  return {
    id: 'ending_mentor_retire',
    title: 'Mentor de la Nueva Generación',
    summary: `${p.name} sobrevivió a las batallas más cruentas y colgó el uniforme de combate para formar a los nuevos estudiantes.`
  };
}

export function retireCharacter(state, customReason = '') {
  if (!state || !state.player || !state.player.alive) {
    return { ok: false, message: 'No es posible retirarse en el estado actual.', state };
  }
  if (state.combat) {
    return { ok: false, message: 'No puedes retirarte en mitad de un combate.', state };
  }

  const p = state.player;
  p.retired = true;
  const ending = determineCareerEnding(state);
  if (customReason) {
    ending.summary = `${customReason} ${ending.summary}`;
  }
  p.ending = ending;

  if (!state.world.unlockedEndings.includes(ending.title)) {
    state.world.unlockedEndings.push(ending.title);
  }

  sanitizeGameState(state);
  const msg = `Fin de carrera desbloqueado: "${ending.title}".`;
  addLogEntry(state, msg, 'milestone');
  return { ok: true, message: msg, state };
}
