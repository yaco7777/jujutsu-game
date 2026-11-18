import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../src/engine/gameState.js';
import { startCombat, executeCombatTurn } from '../src/engine/combatEngine.js';
import { startPromotionExam } from '../src/engine/progression.js';

describe('combatEngine — Combate táctico por turnos', () => {
  it('impide iniciar un combate sin enemigo válido o con un personaje fallecido', () => {
    const state = createInitialGameState({ name: 'Tester Combate' });
    const noEnemyRes = startCombat(state, null);
    expect(noEnemyRes.ok).toBe(false);

    state.player.alive = false;
    const deadCombatRes = startCombat(state, { name: 'Maldición', maxHealth: 50 });
    expect(deadCombatRes.ok).toBe(false);
  });

  it('ejecuta ataque básico, técnica maldita, defensa y voto vinculante correctamente', () => {
    const state = createInitialGameState({
      name: 'Megumi Test',
      origin: 'clan_zenin',
      techniqueId: 'ten_shadows'
    });

    const startRes = startCombat(state, {
      id: 'enemy_test_1',
      name: 'Maldición de Prueba',
      grade: 'grado_4',
      gradeOrder: 0,
      maxHealth: 180,
      attack: 14,
      defense: 6,
      speed: 12,
      specialName: 'Garra Oscura',
      specialPower: 18,
      specialChance: 0.2
    });

    expect(startRes.ok).toBe(true);
    expect(state.combat).not.toBeNull();

    const initialEnemyHp = state.combat.enemy.health;
    const turn1 = executeCombatTurn(state, 'basic_attack', {}, () => 0.5);
    expect(turn1.ok).toBe(true);
    expect(state.combat.enemy.health).toBeLessThan(initialEnemyHp);

    const hpAfterTurn1 = state.combat.enemy.health;
    const ceBeforeTech = state.player.stats.cursedEnergy;
    const turn2 = executeCombatTurn(state, 'cursed_technique', {}, () => 0.5);
    expect(turn2.ok).toBe(true);
    expect(state.player.stats.cursedEnergy).toBeLessThan(ceBeforeTech);
    expect(state.combat.enemy.health).toBeLessThan(hpAfterTurn1);

    const turn3 = executeCombatTurn(state, 'defend_reinforce', {}, () => 0.5);
    expect(turn3.ok).toBe(true);

    const turn4 = executeCombatTurn(state, 'binding_vow', {}, () => 0.5);
    expect(turn4.ok).toBe(true);
    expect(state.world.bindingVowsTaken).toBe(1);
  });

  it('resuelve la victoria en un examen de promoción y asciende el rango del jugador', () => {
    const state = createInitialGameState({
      name: 'Candidato Ascenso',
      origin: 'clan_gojo',
      techniqueId: 'limitless'
    });
    state.player.stats.prestige = 30;
    state.player.techniqueMastery = 30;
    state.player.stats.strength = 80;

    const examStart = startPromotionExam(state);
    expect(examStart.ok).toBe(true);
    expect(state.combat.isPromotionExam).toBe(true);

    state.combat.enemy.health = 10;
    const winRes = executeCombatTurn(state, 'basic_attack', {}, () => 0.1);
    expect(winRes.ok).toBe(true);
    expect(winRes.outcome).toBe('victory');
    expect(state.combat).toBeNull();
    expect(state.player.rank).toBe('grado_3');
    expect(state.player.rankOrder).toBe(1);
  });

  it('permite huir del combate cuando la tirada de velocidad es favorable', () => {
    const state = createInitialGameState({
      name: 'Velocista',
      origin: 'heavenly_restriction',
      techniqueId: 'heavenly_restriction_body'
    });

    startCombat(state, {
      name: 'Espíritu Lento',
      maxHealth: 100,
      attack: 12,
      defense: 5,
      speed: 10
    });

    const fleeRes = executeCombatTurn(state, 'flee', {}, () => 0.05);
    expect(fleeRes.ok).toBe(true);
    expect(fleeRes.outcome).toBe('fled');
    expect(state.combat).toBeNull();
  });

  it('aplica muerte permanente (permadeath) cuando la salud del jugador cae a 0 en combate', () => {
    const state = createInitialGameState({ name: 'Mártir' });
    state.player.stats.health = 5;

    startCombat(state, {
      name: 'Maldición de Grado Especial',
      maxHealth: 400,
      attack: 95,
      defense: 40,
      speed: 50
    });

    const turnRes = executeCombatTurn(state, 'basic_attack', {}, () => 0.5);
    expect(turnRes.outcome).toBe('death');
    expect(state.player.alive).toBe(false);
    expect(state.player.stats.health).toBe(0);
    expect(state.combat).toBeNull();
    expect(state.player.ending).not.toBeNull();

    const postDeathAttempt = executeCombatTurn(state, 'basic_attack');
    expect(postDeathAttempt.ok).toBe(false);
  });
});
