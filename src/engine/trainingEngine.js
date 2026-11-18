import {
  canPerformQuarterAction,
  consumeTurnAction,
  addLogEntry,
  sanitizeGameState
} from './gameState.js';
import { TRAINING_DIFFICULTIES } from './progression.js';
import { clamp } from './utils.js';

export const TRAINING_MODALITIES = [
  {
    id: 'strength',
    name: 'Fuerza Física',
    childName: 'Coordinación y Juegos de Empuje',
    minAge: 1,
    minigameType: 'black_flash_timing',
    minigameTitle: 'Coordinación y Resistencia Muscular',
    description: 'Sincroniza el esfuerzo físico en el punto de máxima tensión muscular.'
  },
  {
    id: 'speed',
    name: 'Velocidad',
    childName: 'Agilidad y Primeras Carreras',
    minAge: 1,
    minigameType: 'ratio_reflex',
    minigameTitle: 'Desafío de Reflejos Neuromusculares',
    description: 'Golpea los puntos de reacción antes de que desaparezcan del campo visual.'
  },
  {
    id: 'stamina',
    name: 'Resistencia Vital',
    childName: 'Juegos de Aire Libre y Salud',
    minAge: 1,
    minigameType: 'black_flash_timing',
    minigameTitle: 'Administración del Esfuerzo',
    description: 'Mantén la respiración en la franja óptima para endurecer tu cuerpo y reducir el cansancio.'
  },
  {
    id: 'tacticalIntelligence',
    name: 'Inteligencia Táctica',
    childName: 'Ingenio, Cuentos y Rompecabezas',
    minAge: 1,
    minigameType: 'hand_signs_memory',
    minigameTitle: 'Resolución Táctica de Situaciones',
    description: 'Analiza y reproduce el patrón estratégico sin cometer errores.'
  },
  {
    id: 'concentration',
    name: 'Concentración',
    childName: 'Memoria y Atención Infantil',
    minAge: 1,
    minigameType: 'hand_signs_memory',
    minigameTitle: 'Memoria y Atención de Sellos',
    description: 'Retén secuencias complejas bajo presión para afinar tu mente e inteligencia.'
  },
  {
    id: 'emotionalControl',
    name: 'Control Emocional',
    childName: 'Descubrimiento de Emociones',
    minAge: 1,
    minigameType: 'ratio_reflex',
    minigameTitle: 'Autocontrol y Calma Espiritual',
    description: 'Disipa los impulsos de pánico para fortalecer tu Salud mental y estabilidad.'
  },
  {
    id: 'cursedEnergyControl',
    name: 'Control de Energía Maldita',
    childName: 'Control de Energía Maldita',
    minAge: 6,
    minigameType: 'hand_signs_memory',
    minigameTitle: 'Precisión de Flujo Maldito',
    description: 'Canaliza energía por todo el cuerpo mediante secuencias exactas de sellos.'
  },
  {
    id: 'techniqueMastery',
    name: 'Maestría Técnica',
    childName: 'Maestría Técnica',
    minAge: 6,
    minigameType: 'black_flash_timing',
    minigameTitle: 'Dominio Específico de Técnica Innata',
    description: 'Busca la chispa del Destello Negro y desbloquea extensiones de tu técnica.'
  }
];

export function getAgeTrainingFactor(age) {
  if (age < 6) return 0.65;
  if (age < 12) return 0.85;
  if (age < 15) return 1.0;
  if (age <= 28) return 1.15;
  if (age <= 40) return 0.95;
  return 0.75;
}

export function getDiminishingReturnsFactor(currentStatValue) {
  const val = clamp(currentStatValue, 0, 100);
  // Curva logarítmica + amortiguación en tramos altos (40+, 80+, 95+)
  const logDivisor = 1 + Math.log(1 + val) * 1.9;
  let highBracketMultiplier = 1.0;
  if (val >= 95) {
    highBracketMultiplier = 0.22;
  } else if (val >= 80) {
    highBracketMultiplier = 0.42;
  } else if (val >= 40) {
    highBracketMultiplier = 0.72;
  }
  return highBracketMultiplier / logDivisor;
}

export function calculateTrainingGain({
  currentValue = 20,
  difficultyId = 'normal',
  age = 15,
  potentialMultiplier = 1.0,
  scoreRatio = 1.0,
  fatigue = 0
}) {
  const diff = TRAINING_DIFFICULTIES[difficultyId] || TRAINING_DIFFICULTIES.normal;
  const baseReward = 3.2;

  // Evitar explotación de dificultad fácil en niveles medios/altos
  const easyCapPenalty = (difficultyId === 'facil' && currentValue >= 50) ? 0.35 : 1.0;
  const ageFactor = getAgeTrainingFactor(age);
  const potentialFactor = Math.max(0.8, Number(potentialMultiplier) || 1.0);
  const diminishingFactor = getDiminishingReturnsFactor(currentValue);
  const fatiguePenalty = fatigue >= 75 ? 0.5 : (fatigue >= 50 ? 0.78 : 1.0);
  const clampedScore = Math.min(1.25, Math.max(0.2, Number(scoreRatio) || 0.2));

  const raw = baseReward
    * diff.multiplier
    * ageFactor
    * potentialFactor
    * diminishingFactor
    * easyCapPenalty
    * fatiguePenalty
    * clampedScore;

  return Number(Math.max(0.08, raw).toFixed(2));
}

export function executeModalityTraining(state, modalityId, difficultyId = 'normal', scoreRatio = 1.0, rng = Math.random) {
  const check = canPerformQuarterAction(state);
  if (!check.allowed) {
    return { ok: false, message: check.reason, state };
  }

  const modality = TRAINING_MODALITIES.find((m) => m.id === modalityId) || TRAINING_MODALITIES[0];
  const diff = TRAINING_DIFFICULTIES[difficultyId] || TRAINING_DIFFICULTIES.normal;
  const p = state.player;
  const s = p.stats;

  if (p.age < modality.minAge) {
    return {
      ok: false,
      message: `La modalidad "${modality.name}" requiere tener al menos ${modality.minAge} años.`,
      state
    };
  }

  const isHR = p.origin === 'heavenly_restriction';
  const currentFatigue = p.fatigue || 0;

  let statTargetKey = modality.id;
  if (modality.id === 'stamina') statTargetKey = 'strength';
  if (modality.id === 'concentration') statTargetKey = 'tacticalIntelligence';
  if (modality.id === 'emotionalControl') statTargetKey = 'mentalHealth';

  const currentVal = statTargetKey === 'techniqueMastery'
    ? p.techniqueMastery
    : (s[statTargetKey] ?? 20);

  const gain = calculateTrainingGain({
    currentValue: currentVal,
    difficultyId: diff.id,
    age: p.age,
    potentialMultiplier: p.talent?.growthMultiplier || 1.0,
    scoreRatio,
    fatigue: currentFatigue
  });

  let extraNotes = '';

  if (modality.id === 'techniqueMastery') {
    p.techniqueMastery += gain;
    if (!isHR) {
      s.cursedEnergyControl += Number((gain * 0.35).toFixed(2));
    }
    if (scoreRatio >= 0.92 && (diff.id === 'dificil' || diff.id === 'extremo')) {
      state.world.blackFlashesLanded += 1;
      const bfBonus = Number((gain * 0.4).toFixed(2));
      p.techniqueMastery += bfBonus;
      extraNotes = ` ¡Destello Negro (+${bfBonus})!`;
    }
  } else if (modality.id === 'stamina') {
    s.health = clamp(s.health + 10, 0, 100);
    s.strength += gain;
    p.fatigue = Math.max(0, currentFatigue - 8);
    extraNotes = ', +10 Salud y menor fatiga';
  } else if (modality.id === 'concentration') {
    s.tacticalIntelligence += gain;
    if (!isHR) {
      s.cursedEnergyControl += Number((gain * 0.5).toFixed(2));
    }
    extraNotes = ' (+Control y Memoria)';
  } else if (modality.id === 'emotionalControl') {
    s.mentalHealth = clamp(s.mentalHealth + gain * 4, 0, 100);
    if (!isHR) {
      s.maxCursedEnergy = clamp(s.maxCursedEnergy + gain * 0.7, 1, 100);
    }
    extraNotes = ` (+${Number((gain * 4).toFixed(1))} Salud mental)`;
  } else if (modality.id === 'cursedEnergyControl' && isHR) {
    s.speed += gain;
    extraNotes = ' (Restricción Celestial: aplicado a Velocidad)';
  } else {
    s[statTargetKey] = (s[statTargetKey] || 0) + gain;
  }

  // Aplicar fatiga y comprobar riesgo de sobreentrenamiento / lesión
  if (modality.id !== 'stamina') {
    p.fatigue = clamp(currentFatigue + diff.fatigueCost * 1.4, 0, 100);
    s.health = Math.max(5, s.health - diff.fatigueCost);
  }

  if (p.fatigue >= 85 && rng() < 0.25) {
    p.injury = 'Desgarro por sobreentrenamiento';
    s.health = Math.max(5, s.health - 10);
    extraNotes += ' [¡Alerta: Lesión por exceso de cansancio!]';
  }

  consumeTurnAction(state, `Entrenamiento: ${modality.name}`);
  sanitizeGameState(state);

  const msg = `Entrenamiento de ${p.age < 6 ? modality.childName : modality.name} [${diff.name}]: +${gain} pts${extraNotes} (Cansancio: ${p.fatigue}/100).`;
  addLogEntry(state, msg, 'training');
  return { ok: true, gain, message: msg, state };
}
