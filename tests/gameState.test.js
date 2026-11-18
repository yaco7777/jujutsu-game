import { describe, it, expect } from 'vitest';
import {
  ORIGINS,
  createInitialGameState,
  validateCharacterConfig,
  sanitizeGameState,
  canPerformQuarterAction
} from '../src/engine/gameState.js';
import { advanceQuarter, performQuarterAction, retireCharacter } from '../src/engine/gameLoop.js';
import {
  calculateLogarithmicStatGain,
  completeMinigameTraining,
  trainSorcerer,
  attemptUnlockSpecialSkill,
  changeCareerPath
} from '../src/engine/progression.js';
import { buyItem, sellItem, useConsumable } from '../src/engine/inventory.js';
import { interactWithNpc } from '../src/engine/relationships.js';

describe('gameState y nuevas reglas anuales / logarítmicas', () => {
  it('crea un personaje desde 1 año de edad con destino aleatorio, padres, talento y dinero familiar', () => {
    const state = createInitialGameState({
      name: 'Kaito Nanami',
      pronouns: 'él',
      region: 'tokyo',
      rollDestiny: true,
      startAge: 1,
      birthPreviewPending: true
    });

    expect(state.player.name).toBe('Kaito Nanami');
    expect(state.player.age).toBe(1);
    expect(state.player.year).toBe(1);
    expect(state.birthPreviewPending).toBe(true);
    expect(state.player.parents).toBeDefined();
    expect(typeof state.player.parents.fatherName).toBe('string');
    expect(typeof state.player.parents.motherName).toBe('string');
    expect(state.player.talent).toBeDefined();
    expect(state.player.money).toBeGreaterThanOrEqual(5000);
    expect(state.turn.actionsRemaining).toBe(4);
  });

  it('aplica la Restricción Celestial con 0 de energía maldita y compensación física alta', () => {
    const state = createInitialGameState({
      name: 'Toji Ren',
      pronouns: 'él',
      origin: 'heavenly_restriction',
      school: 'kyoto',
      personality: 'estoico',
      techniqueId: 'heavenly_restriction_body'
    });

    expect(state.player.stats.maxCursedEnergy).toBe(0);
    expect(state.player.stats.cursedEnergy).toBe(0);
    expect(state.player.stats.cursedEnergyControl).toBe(0);
    expect(state.player.stats.strength).toBeGreaterThanOrEqual(60);
    expect(state.player.stats.speed).toBeGreaterThanOrEqual(55);
    expect(state.player.techniqueId).toBe('heavenly_restriction_body');
  });

  it('aplica progreso lento y logarítmico en los minijuegos según nivel actual y dificultad', () => {
    const gainLowEasy = calculateLogarithmicStatGain(15, 'facil', 1.0, 1.0);
    const gainLowExtreme = calculateLogarithmicStatGain(15, 'extremo', 1.0, 1.0);
    const gainHighExtreme = calculateLogarithmicStatGain(85, 'extremo', 1.0, 1.0);

    // Mayor dificultad da mayor ganancia
    expect(gainLowExtreme).toBeGreaterThan(gainLowEasy);
    // Entre más alto el número de estadística, más lento sube (curva logarítmica)
    expect(gainLowExtreme).toBeGreaterThan(gainHighExtreme);

    const state = createInitialGameState({ name: 'Minigame Tester' });
    const res = completeMinigameTraining(state, 'strength', 'dificil', 0.95);
    expect(res.ok).toBe(true);
    expect(res.gain).toBeGreaterThan(0);
    expect(state.turn.actionsRemaining).toBe(3);
  });

  it('limita a 4 las acciones por turno (año) y cada avance suma 1 año', () => {
    const state = createInitialGameState({ name: 'Cuatro Acciones', startAge: 1 });
    expect(state.turn.actionsRemaining).toBe(4);

    for (let i = 0; i < 4; i += 1) {
      const r = trainSorcerer(state, 'physical', () => 0.8);
      expect(r.ok).toBe(true);
    }

    expect(state.turn.actionsRemaining).toBe(0);
    const fifthAction = trainSorcerer(state, 'physical', () => 0.8);
    expect(fifthAction.ok).toBe(false);

    state.turn.activeEvent = null;
    const adv = advanceQuarter(state, () => 0.5);
    expect(adv.ok).toBe(true);
    expect(state.player.age).toBe(2);
    expect(state.turn.actionsRemaining).toBe(4);
  });

  it('limita las interacciones con cada NPC por año y las reinicia al avanzar de año', () => {
    const state = createInitialGameState({ name: 'Social Tester' });

    const talk1 = interactWithNpc(state, 'npc_satoru_gojo', 'talk');
    const talk2 = interactWithNpc(state, 'npc_satoru_gojo', 'talk');
    const talk3 = interactWithNpc(state, 'npc_satoru_gojo', 'talk');

    expect(talk1.ok).toBe(true);
    expect(talk2.ok).toBe(true);
    expect(talk3.ok).toBe(false);

    state.turn.activeEvent = null;
    advanceQuarter(state, () => 0.5);

    const talkNextYear = interactWithNpc(state, 'npc_satoru_gojo', 'talk');
    expect(talkNextYear.ok).toBe(true);
  });

  it('acota todas las estadísticas entre 0 y 100 mediante sanitizeGameState', () => {
    const state = createInitialGameState({ name: 'Test Clamp' });
    state.player.stats.strength = 250;
    state.player.stats.mentalHealth = -40;
    state.player.stats.prestige = 190;
    state.player.money = -5000;

    sanitizeGameState(state);

    expect(state.player.stats.strength).toBe(100);
    expect(state.player.stats.mentalHealth).toBe(0);
    expect(state.player.stats.prestige).toBe(100);
    expect(state.player.money).toBe(0);
  });

  it('permite comprar, usar consumibles, desbloquear habilidades y cambiar entre varios caminos', () => {
    const state = createInitialGameState({
      name: 'Progresión',
      origin: 'clan_gojo',
      techniqueId: 'limitless',
      startAge: 16
    });

    const buyRes = buyItem(state, 'item_medical_pack');
    expect(buyRes.ok).toBe(true);

    state.player.stats.health = 60;
    const useRes = useConsumable(state, 'item_medical_pack');
    expect(useRes.ok).toBe(true);
    expect(state.player.stats.health).toBe(88);

    const sellRes = sellItem(state, 'item_warding_seal');
    expect(sellRes.ok).toBe(true);

    state.player.stats.cursedEnergyControl = 60;
    state.player.techniqueMastery = 50;
    state.player.stats.tacticalIntelligence = 45;
    const unlockRes = attemptUnlockSpecialSkill(state, 'simpleDomain');
    expect(unlockRes.ok).toBe(true);
    expect(state.player.unlocks.simpleDomain).toBe(true);

    const careerRes = changeCareerPath(state, 'investigador_barreras');
    expect(careerRes.ok).toBe(true);
    expect(state.player.careerPath).toBe('investigador_barreras');
  });

  it('impide actuar después de morir o retirarse y valida la configuración de creación', () => {
    expect(ORIGINS.length).toBe(6);
    const badValidation = validateCharacterConfig({ name: 'A', pronouns: 'x', origin: 'invalid' });
    expect(badValidation.valid).toBe(false);

    const state = createInitialGameState({ name: 'Retirado' });
    const ret = retireCharacter(state);
    expect(ret.ok).toBe(true);
    expect(state.player.retired).toBe(true);

    const check = canPerformQuarterAction(state);
    expect(check.allowed).toBe(false);

    const actAfterRetire = performQuarterAction(state, 'work_patrol');
    expect(actAfterRetire.ok).toBe(false);
  });
});
