import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../src/engine/gameState.js';
import {
  canUnlockSpecialSkill,
  attemptUnlockSpecialSkill,
  getNextRankInfo,
  startPromotionExam,
  changeCareerPath
} from '../src/engine/progression.js';
import { performFamilyAction } from '../src/engine/familyEngine.js';
import { performSchoolAction } from '../src/engine/schoolEngine.js';
import { travelToDestination } from '../src/engine/travelEngine.js';

describe('progression, schoolEngine, familyEngine y travelEngine', () => {
  it('impide que un niño menor de 6 años acceda a colegio, misiones o viajes restringidos', () => {
    const baby = createInitialGameState({
      name: 'Bebé Restringido',
      region: 'tokyo',
      rollDestiny: true,
      startAge: 2
    });

    const schoolRes = performSchoolAction(baby, 'study_homework');
    expect(schoolRes.ok).toBe(false);

    const travelRes = travelToDestination(baby, 'hida_mountains');
    expect(travelRes.ok).toBe(false);

    const careerRes = changeCareerPath(baby, 'hechicero_oficial');
    expect(careerRes.ok).toBe(false);
  });

  it('permite acciones familiares, escolares, deportivas y viajes cuando se cumple la edad', () => {
    const youth = createInitialGameState({
      name: 'Joven Estudiante',
      origin: 'clan_kamo',
      techniqueId: 'blood_manipulation',
      startAge: 14
    });
    youth.player.money = 50000;

    const famRes = performFamilyAction(youth, 'spend_time_parents');
    expect(famRes.ok).toBe(true);

    const sportJoin = performSchoolAction(youth, 'join_sport', { sportId: 'artes_marciales' });
    expect(sportJoin.ok).toBe(true);
    expect(youth.school.activeSportId).toBe('artes_marciales');

    const sportPractice = performSchoolAction(youth, 'practice_sport', {}, () => 0.5);
    expect(sportPractice.ok).toBe(true);

    const travelRes = travelToDestination(youth, 'kyoto', () => 0.5);
    expect(travelRes.ok).toBe(true);
    expect(youth.player.currentLocation).toBe('kyoto');
  });

  it('exige requisitos estrictos para Dominio Simple, RCT, Expansión de Dominio y Exámenes de Grado', () => {
    const state = createInitialGameState({
      name: 'Aspirante',
      origin: 'clan_gojo',
      techniqueId: 'limitless',
      startAge: 16
    });

    expect(canUnlockSpecialSkill(state, 'domainExpansion').allowed).toBe(false);

    state.player.stats.cursedEnergyControl = 75;
    state.player.techniqueMastery = 70;
    state.player.stats.tacticalIntelligence = 55;
    state.player.rank = 'semi_grado_1';
    state.player.rankOrder = 4;

    expect(canUnlockSpecialSkill(state, 'rct').allowed).toBe(true);
    expect(attemptUnlockSpecialSkill(state, 'rct').ok).toBe(true);

    expect(canUnlockSpecialSkill(state, 'domainExpansion').allowed).toBe(true);
    expect(attemptUnlockSpecialSkill(state, 'domainExpansion').ok).toBe(true);

    state.player.stats.prestige = 75;
    const nextRank = getNextRankInfo(state);
    expect(nextRank.eligible).toBe(true);

    const examRes = startPromotionExam(state);
    expect(examRes.ok).toBe(true);
    expect(state.combat.isPromotionExam).toBe(true);
  });
});
