import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../src/engine/gameState.js';
import {
  TRAINING_MODALITIES,
  calculateTrainingGain,
  executeModalityTraining
} from '../src/engine/trainingEngine.js';

describe('trainingEngine — 8 Modalidades, Minijuegos y Curva Logarítmica', () => {
  it('dispone de las 8 modalidades de entrenamiento independientes', () => {
    expect(TRAINING_MODALITIES.length).toBe(8);
    const ids = TRAINING_MODALITIES.map((m) => m.id);
    expect(ids).toContain('strength');
    expect(ids).toContain('speed');
    expect(ids).toContain('stamina');
    expect(ids).toContain('cursedEnergyControl');
    expect(ids).toContain('tacticalIntelligence');
    expect(ids).toContain('techniqueMastery');
    expect(ids).toContain('concentration');
    expect(ids).toContain('emotionalControl');
  });

  it('aplica rendimiento decreciente logarítmico en tramos 5->6, 40->41, 80->81 y 95->96', () => {
    const gainAt5 = calculateTrainingGain({ currentValue: 5, difficultyId: 'normal', age: 16 });
    const gainAt40 = calculateTrainingGain({ currentValue: 40, difficultyId: 'normal', age: 16 });
    const gainAt80 = calculateTrainingGain({ currentValue: 80, difficultyId: 'normal', age: 16 });
    const gainAt95 = calculateTrainingGain({ currentValue: 95, difficultyId: 'normal', age: 16 });

    expect(gainAt5).toBeGreaterThan(gainAt40);
    expect(gainAt40).toBeGreaterThan(gainAt80);
    expect(gainAt80).toBeGreaterThan(gainAt95);

    const gainEasyAt60 = calculateTrainingGain({ currentValue: 60, difficultyId: 'facil', age: 16 });
    const gainExtremeAt60 = calculateTrainingGain({ currentValue: 60, difficultyId: 'extremo', age: 16 });
    expect(gainExtremeAt60).toBeGreaterThan(gainEasyAt60 * 4);
  });

  it('bloquea modalidades de energía maldita antes de los 6 años y acumula cansancio', () => {
    const toddler = createInitialGameState({
      name: 'Niño Pequeño',
      startAge: 3
    });

    const blockedCe = executeModalityTraining(toddler, 'cursedEnergyControl', 'normal', 1.0);
    expect(blockedCe.ok).toBe(false);

    const allowedPhysical = executeModalityTraining(toddler, 'strength', 'normal', 1.0);
    expect(allowedPhysical.ok).toBe(true);
    expect(toddler.player.fatigue).toBeGreaterThan(0);
    expect(toddler.turn.actionsRemaining).toBe(3);
  });
});
