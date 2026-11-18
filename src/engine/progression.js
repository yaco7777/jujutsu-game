import { getTechniqueById } from '../data/techniques.js';
import {
  RANKS,
  CAREER_PATHS,
  getRankByOrder,
  canPerformQuarterAction,
  consumeTurnAction,
  addLogEntry,
  sanitizeGameState
} from './gameState.js';

export const TRAINING_DIFFICULTIES = {
  facil: {
    id: 'facil',
    name: 'Fácil (Calentamiento)',
    multiplier: 1.0,
    fatigueCost: 4,
    speedMs: 28,
    targetZoneWidth: 28,
    sequenceLength: 3,
    reflexTargets: 4,
    timeLimitSec: 9,
    description: 'Ritmo accesible y desgaste bajo. Progreso suave.'
  },
  normal: {
    id: 'normal',
    name: 'Normal (Estándar Técnico)',
    multiplier: 1.65,
    fatigueCost: 7,
    speedMs: 20,
    targetZoneWidth: 20,
    sequenceLength: 4,
    reflexTargets: 6,
    timeLimitSec: 8,
    description: 'Exigencia oficial de colegio técnico. Buen equilibrio entre riesgo y mejora.'
  },
  dificil: {
    id: 'dificil',
    name: 'Difícil (Grado 1)',
    multiplier: 2.45,
    fatigueCost: 11,
    speedMs: 14,
    targetZoneWidth: 13,
    sequenceLength: 5,
    reflexTargets: 8,
    timeLimitSec: 7,
    description: 'Alta velocidad y margen estrecho. Gran bonificación logarítmica si aciertas.'
  },
  extremo: {
    id: 'extremo',
    name: 'Extremo (Grado Especial)',
    multiplier: 3.6,
    fatigueCost: 16,
    speedMs: 10,
    targetZoneWidth: 8,
    sequenceLength: 6,
    reflexTargets: 10,
    timeLimitSec: 6,
    description: 'Precisión en la millonésima de segundo. El mayor entrenamiento posible.'
  }
};

export const TRAINABLE_STATS = [
  {
    id: 'strength',
    name: 'Fuerza Física',
    childName: 'Coordinación y Juegos Físicos',
    minAge: 1,
    minigameType: 'black_flash_timing',
    minigameTitle: 'Pulso de Impacto (Sincronización)',
    childMinigameTitle: 'Juego de Equilibrio y Empuje',
    description: 'Detén el cursor de energía exactamente en el núcleo crítico para templar tus músculos y pegada.',
    childDescription: 'Juega en el patio familiar para desarrollar tus primeros músculos, equilibrio y resistencia infantil.'
  },
  {
    id: 'speed',
    name: 'Velocidad y Reflejos',
    childName: 'Agilidad y Primeras Carreras',
    minAge: 1,
    minigameType: 'ratio_reflex',
    minigameTitle: 'Reflejos de Proporción 7:3',
    childMinigameTitle: 'Atrapa las Luciérnagas en Movimiento',
    description: 'Golpea todos los nodos críticos antes de que se desvanezcan para acelerar tu reacción neuromuscular.',
    childDescription: 'Reacciona rápido a los estímulos visuales para mejorar tu agilidad y coordinación ojo-mano.'
  },
  {
    id: 'tacticalIntelligence',
    name: 'Inteligencia Táctica',
    childName: 'Curiosidad, Memoria y Cuentos',
    minAge: 1,
    minigameType: 'hand_signs_memory',
    minigameTitle: 'Lectura de Patrones y Barreras',
    childMinigameTitle: 'Memoria de Figuras y Relatos',
    description: 'Descifra la secuencia táctica sin errores para elevar tu capacidad de análisis en combate.',
    childDescription: 'Recuerda el orden de las figuras que te enseñan tus padres para despertar tu ingenio temprano.'
  },
  {
    id: 'cursedEnergyControl',
    name: 'Control de Energía Maldita',
    childName: 'Control de Energía Maldita',
    minAge: 6,
    minigameType: 'hand_signs_memory',
    minigameTitle: 'Secuencia de Sellos Manuales',
    childMinigameTitle: 'Secuencia de Sellos Manuales',
    description: 'Memoriza y repite en orden los sellos ceremoniales para afinar la circulación de tu energía.',
    childDescription: 'Se desbloquea a los 6 años cuando despierta tu flujo maldito.'
  },
  {
    id: 'techniqueMastery',
    name: 'Maestría de Técnica Innata',
    childName: 'Maestría de Técnica Innata',
    minAge: 6,
    minigameType: 'black_flash_timing',
    minigameTitle: 'Destello Negro: Ventana Crítica',
    childMinigameTitle: 'Destello Negro: Ventana Crítica',
    description: 'Clava la sincronización espacial para profundizar en tu técnica y desbloquear extensiones.',
    childDescription: 'Se desbloquea a los 6 años cuando se manifiesta tu técnica innata.'
  },
  {
    id: 'maxCursedEnergy',
    name: 'Reserva Espiritual y Mente',
    childName: 'Reserva Espiritual y Mente',
    minAge: 6,
    minigameType: 'ratio_reflex',
    minigameTitle: 'Estabilización de Nodos Internos',
    childMinigameTitle: 'Estabilización de Nodos Internos',
    description: 'Purifica los puntos de tensión para expandir tu Energía Maldita máxima y Salud Mental.',
    childDescription: 'Se desbloquea a los 6 años tras tu despertar espiritual.'
  }
];

export const UNLOCK_REQUIREMENTS = {
  simpleDomain: {
    id: 'simpleDomain',
    name: 'Dominio Simple (Guardia Antidominio)',
    minControl: 28,
    minMastery: 25,
    minIntelligence: 25,
    allowHeavenlyRestriction: true,
    description: 'Neutraliza el efecto de golpe garantizado de cualquier Expansión de Dominio y refuerza la defensa táctica en combate.'
  },
  rct: {
    id: 'rct',
    name: 'Técnica Maldita Inversa (RCT)',
    minControl: 55,
    minMastery: 45,
    minIntelligence: 38,
    allowHeavenlyRestriction: false,
    description: 'Multiplica energía maldita negativa por sí misma para generar energía positiva capaz de regenerar heridas graves.'
  },
  domainExpansion: {
    id: 'domainExpansion',
    name: 'Expansión de Dominio Completa',
    minControl: 70,
    minMastery: 65,
    minIntelligence: 48,
    minRankOrder: 4,
    allowHeavenlyRestriction: false,
    description: 'Materializa tu dominio innato con golpe garantizado devastador. Alto riesgo: usarla con poco control o energía provoca agotamiento de técnica y daño cerebral.'
  }
};

export function calculateLogarithmicStatGain(currentValue, difficultyId = 'normal', scoreRatio = 1.0, talentMultiplier = 1.0) {
  const diff = TRAINING_DIFFICULTIES[difficultyId] || TRAINING_DIFFICULTIES.normal;
  const safeCurrent = Math.max(0, Number(currentValue) || 0);
  const clampedScore = Math.min(1.25, Math.max(0.2, Number(scoreRatio) || 0.2));
  const safeTalent = Math.max(0.8, Number(talentMultiplier) || 1.0);

  // Curva logarítmica: cuanto más alto es safeCurrent, mayor es la resistencia logarítmica
  const logResistance = 1 + Math.log(1 + safeCurrent) * 1.95;
  const basePower = 2.65;
  const rawGain = (basePower * diff.multiplier * clampedScore * safeTalent) / logResistance;

  return Number(Math.max(0.12, rawGain).toFixed(2));
}

export function completeMinigameTraining(state, statId, difficultyId = 'normal', scoreRatio = 1.0) {
  const check = canPerformQuarterAction(state);
  if (!check.allowed) {
    return { ok: false, message: check.reason, state };
  }

  const statDef = TRAINABLE_STATS.find((st) => st.id === statId) || TRAINABLE_STATS[0];
  const diff = TRAINING_DIFFICULTIES[difficultyId] || TRAINING_DIFFICULTIES.normal;
  const p = state.player;
  const s = p.stats;
  const isHR = p.origin === 'heavenly_restriction';
  const talentMult = p.talent?.growthMultiplier || 1.0;

  let currentVal = statId === 'techniqueMastery' ? p.techniqueMastery : (s[statId] ?? 20);
  if (isHR && (statId === 'cursedEnergyControl' || statId === 'maxCursedEnergy')) {
    currentVal = s.speed;
  }

  const gain = calculateLogarithmicStatGain(currentVal, diff.id, scoreRatio, talentMult);
  let secondaryMsg = '';

  if (statId === 'techniqueMastery') {
    p.techniqueMastery += gain;
    if (!isHR) {
      const subGain = Number((gain * 0.35).toFixed(2));
      s.cursedEnergyControl += subGain;
      secondaryMsg = `, +${subGain} Control`;
    }
    if (scoreRatio >= 0.92 && (diff.id === 'dificil' || diff.id === 'extremo')) {
      state.world.blackFlashesLanded += 1;
      const bfBonus = Number((gain * 0.4).toFixed(2));
      p.techniqueMastery += bfBonus;
      secondaryMsg += ` ¡DESTELLO NEGRO (+${bfBonus} extra)!`;
    }
  } else if (statId === 'maxCursedEnergy') {
    if (isHR) {
      s.strength += gain;
      s.mentalHealth += 4;
      secondaryMsg = ' (Restricción Celestial: canalizado en Fuerza y +4 Salud Mental)';
    } else {
      s.maxCursedEnergy += gain;
      s.cursedEnergy += gain;
      s.mentalHealth += 4;
      secondaryMsg = ', +4 Salud Mental';
    }
  } else if (statId === 'cursedEnergyControl' && isHR) {
    s.speed += gain;
    secondaryMsg = ' (Restricción Celestial: reflejos aplicados a Velocidad)';
  } else {
    s[statId] = (s[statId] || 0) + gain;
    const masterySub = Number((gain * 0.3).toFixed(2));
    p.techniqueMastery += masterySub;
    secondaryMsg = `, +${masterySub} Maestría`;
  }

  s.health = Math.max(5, s.health - diff.fatigueCost);
  consumeTurnAction(state, `Entrenamiento: ${statDef.name} (${diff.name})`);
  sanitizeGameState(state);

  const qualityLabel = scoreRatio >= 0.9
    ? '¡Ejecución Perfecta!'
    : (scoreRatio >= 0.6 ? 'Buen entrenamiento.' : 'Entrenamiento parcial.');

  const msg = `${qualityLabel} [${diff.name}] +${gain} en ${statDef.name}${secondaryMsg} (-${diff.fatigueCost} Salud por fatiga). Acciones restantes este año: ${state.turn.actionsRemaining}/${state.turn.maxActionsPerTurn}.`;
  addLogEntry(state, msg, 'training');

  return { ok: true, gain, message: msg, state };
}

export function trainSorcerer(state, trainingType = 'physical', rng = Math.random) {
  const typeToStat = {
    physical: 'strength',
    cursed_control: 'cursedEnergyControl',
    technique_mastery: 'techniqueMastery',
    tactical_study: 'tacticalIntelligence'
  };

  const targetStat = typeToStat[trainingType];
  if (!targetStat) {
    return { ok: false, message: 'Tipo de entrenamiento no reconocido.', state };
  }

  const simulatedScore = 0.75 + rng() * 0.25;
  return completeMinigameTraining(state, targetStat, 'normal', simulatedScore);
}

export function canUnlockSpecialSkill(state, skillKey) {
  const req = UNLOCK_REQUIREMENTS[skillKey];
  if (!req) {
    return { allowed: false, reason: 'Habilidad avanzada desconocida.' };
  }

  const p = state.player;
  const s = p.stats;

  if (!p.alive || p.retired) {
    return { allowed: false, reason: 'El personaje no está en activo.' };
  }
  if (p.unlocks?.[skillKey]) {
    return { allowed: false, reason: 'Esta habilidad ya está desbloqueada.' };
  }
  if (p.origin === 'heavenly_restriction' && !req.allowHeavenlyRestriction) {
    return { allowed: false, reason: 'La Restricción Celestial carece de energía maldita para ejecutar esta técnica.' };
  }
  if (p.origin !== 'heavenly_restriction' && s.cursedEnergyControl < req.minControl) {
    return { allowed: false, reason: `Requiere Control de energía maldita ${req.minControl}+ (actual: ${s.cursedEnergyControl}).` };
  }
  if (p.techniqueMastery < req.minMastery) {
    return { allowed: false, reason: `Requiere Maestría de técnica ${req.minMastery}+ (actual: ${p.techniqueMastery}).` };
  }
  if (s.tacticalIntelligence < req.minIntelligence) {
    return { allowed: false, reason: `Requiere Inteligencia táctica ${req.minIntelligence}+ (actual: ${s.tacticalIntelligence}).` };
  }
  if (typeof req.minRankOrder === 'number' && p.rankOrder < req.minRankOrder) {
    const minRank = getRankByOrder(req.minRankOrder);
    return { allowed: false, reason: `Requiere rango mínimo ${minRank.name}.` };
  }

  return { allowed: true, reason: 'Requisitos cumplidos.' };
}

export function attemptUnlockSpecialSkill(state, skillKey) {
  const check = canUnlockSpecialSkill(state, skillKey);
  if (!check.allowed) {
    return { ok: false, message: check.reason, state };
  }

  const req = UNLOCK_REQUIREMENTS[skillKey];
  state.player.unlocks[skillKey] = true;
  state.player.stats.prestige += 6;
  sanitizeGameState(state);

  const msg = `¡Desbloqueaste ${req.name}! (+6 Prestigio).`;
  addLogEntry(state, msg, 'milestone');
  return { ok: true, message: msg, state };
}

export function getNextRankInfo(state) {
  const currentOrder = state.player.rankOrder;
  if (currentOrder >= RANKS.length - 1) {
    return null;
  }
  const nextRank = RANKS[currentOrder + 1];
  const p = state.player;
  const s = p.stats;

  const meetsPrestige = s.prestige >= nextRank.minPrestige;
  const meetsMastery = p.techniqueMastery >= nextRank.minMastery;
  const meetsStanding = p.careerPath === 'desertor' || s.higherUpsRelation >= 20;

  return {
    nextRank,
    eligible: meetsPrestige && meetsMastery && meetsStanding && p.alive && !p.retired,
    reasons: [
      !meetsPrestige ? `Requiere Prestigio ${nextRank.minPrestige}+ (actual: ${s.prestige})` : null,
      !meetsMastery ? `Requiere Maestría ${nextRank.minMastery}+ (actual: ${p.techniqueMastery})` : null,
      !meetsStanding ? 'Relación con altos mandos demasiado baja (<20) para recomendación oficial' : null
    ].filter(Boolean)
  };
}

export function startPromotionExam(state) {
  const actionCheck = canPerformQuarterAction(state);
  if (!actionCheck.allowed) {
    return { ok: false, message: actionCheck.reason, state };
  }

  const nextInfo = getNextRankInfo(state);
  if (!nextInfo) {
    return { ok: false, message: 'Ya has alcanzado el Grado Especial, la cima de la clasificación jujutsu.', state };
  }

  if (!nextInfo.eligible) {
    return {
      ok: false,
      message: `No cumples los requisitos de promoción a ${nextInfo.nextRank.name}: ${nextInfo.reasons.join(', ')}.`,
      state
    };
  }

  const targetOrder = nextInfo.nextRank.order;
  const enemyHp = 85 + targetOrder * 36;
  const enemyAtk = 15 + targetOrder * 6;
  const enemyDef = 7 + targetOrder * 4;
  const enemySpd = 15 + targetOrder * 5;

  consumeTurnAction(state, `Examen de promoción a ${nextInfo.nextRank.name}`);

  state.combat = {
    id: `exam_${nextInfo.nextRank.id}_${Date.now()}`,
    turnNumber: 1,
    isPromotionExam: true,
    targetRankId: nextInfo.nextRank.id,
    missionId: null,
    playerGuarding: false,
    simpleDomainActive: 0,
    domainActive: 0,
    domainBurnout: 0,
    tempAttackBonus: 0,
    tempDefenseBonus: 0,
    ally: null,
    enemy: {
      id: `examiner_${nextInfo.nextRank.id}`,
      name: `Evaluador de Ascenso (${nextInfo.nextRank.name})`,
      grade: nextInfo.nextRank.id,
      gradeOrder: targetOrder,
      maxHealth: enemyHp,
      health: enemyHp,
      attack: enemyAtk,
      defense: enemyDef,
      speed: enemySpd,
      specialName: 'Técnica de Evaluación Certificada',
      specialPower: Math.round(enemyAtk * 1.35),
      specialChance: 0.32
    },
    combatLog: [
      `Comienza el examen práctico de promoción a ${nextInfo.nextRank.name}. Demuestra tu valía en combate.`
    ]
  };

  addLogEntry(state, `Iniciaste el examen oficial de ascenso a ${nextInfo.nextRank.name}.`, 'combat');
  return { ok: true, message: `Examen de promoción a ${nextInfo.nextRank.name} iniciado.`, state };
}

export function changeCareerPath(state, newCareerId) {
  const p = state.player;
  const s = p.stats;

  if (!p.alive || p.retired) {
    return { ok: false, message: 'El personaje no está activo.', state };
  }

  const targetCareer = CAREER_PATHS.find((c) => c.id === newCareerId);
  if (!targetCareer) {
    return { ok: false, message: 'Camino profesional inválido.', state };
  }
  if (p.careerPath === newCareerId) {
    return { ok: false, message: `Ya sigues el camino: ${targetCareer.name}.`, state };
  }
  if (targetCareer.minAge && p.age < targetCareer.minAge) {
    return { ok: false, message: `Debes tener al menos ${targetCareer.minAge} años para elegir "${targetCareer.name}".`, state };
  }

  if (newCareerId === 'discipulo_clan') {
    s.higherUpsRelation += 4;
    s.prestige += 3;
  } else if (newCareerId === 'entrenamiento_callejero') {
    s.speed += 2;
    s.strength += 2;
  } else if (newCareerId === 'estudiante') {
    s.popularity += 4;
  } else if (newCareerId === 'hechicero_oficial') {
    if (p.rankOrder < 1 && p.age < 17) {
      return { ok: false, message: 'Requiere al menos Grado 3 o tener 17+ años.', state };
    }
    if (s.higherUpsRelation < 25) {
      return { ok: false, message: 'Requiere Relación con altos mandos de al menos 25.', state };
    }
    s.higherUpsRelation += 6;
    s.prestige += 4;
  } else if (newCareerId === 'investigador_barreras') {
    if (s.tacticalIntelligence < 30) {
      return { ok: false, message: 'Requiere Inteligencia táctica de al menos 30.', state };
    }
    s.tacticalIntelligence += 3;
    s.higherUpsRelation += 5;
  } else if (newCareerId === 'desertor') {
    s.threatLevel += 25;
    s.higherUpsRelation = Math.min(s.higherUpsRelation, 12);
  } else if (newCareerId === 'mercenario') {
    if (p.rankOrder < 2) {
      return { ok: false, message: 'Requiere al menos Semi-Grado 2 para operar como mercenario independiente.', state };
    }
    s.higherUpsRelation -= 8;
  } else if (newCareerId === 'lider_clan') {
    if (!['clan_zenin', 'clan_gojo', 'clan_kamo'].includes(p.origin)) {
      return { ok: false, message: 'Solo un descendiente de los clanes Zenin, Gojo o Kamo puede reclamar el liderazgo dinástico.', state };
    }
    if (p.rankOrder < 4 || s.prestige < 55) {
      return { ok: false, message: 'Requiere al menos Semi-Grado 1 y 55+ de Prestigio para liderar tu clan.', state };
    }
    s.prestige += 12;
    s.higherUpsRelation += 10;
  }

  p.careerPath = newCareerId;
  sanitizeGameState(state);
  const msg = `Has cambiado tu camino de vida a: ${targetCareer.name}.`;
  addLogEntry(state, msg, 'milestone');
  return { ok: true, message: msg, state };
}
