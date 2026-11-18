import { describe, it, expect } from 'vitest';
import { EVENTS, getEventById } from '../src/data/events.js';
import {
  TECHNIQUES,
  TECHNIQUE_RARITIES,
  getTechniqueById,
  getTechniqueDropWeight
} from '../src/data/techniques.js';
import { NPCS } from '../src/data/npcs.js';
import { createInitialGameState } from '../src/engine/gameState.js';
import {
  isChoiceAvailable,
  selectNextEvent,
  resolveEventChoice
} from '../src/engine/eventEngine.js';

describe('eventEngine y catálogos canon de datos', () => {
  it('incluye al menos 25 eventos narrativos distintos (32 en total desde 1 año de edad) con 3 a 5 elecciones', () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(25);

    const ids = new Set();
    for (const evt of EVENTS) {
      expect(typeof evt.id).toBe('string');
      expect(ids.has(evt.id)).toBe(false);
      ids.add(evt.id);

      expect(typeof evt.title).toBe('string');
      expect(evt.title.length).toBeGreaterThan(5);
      expect(typeof evt.narrative).toBe('string');
      expect(evt.narrative.length).toBeGreaterThan(60);

      expect(Array.isArray(evt.choices)).toBe(true);
      expect(evt.choices.length).toBeGreaterThanOrEqual(3);
      expect(evt.choices.length).toBeLessThanOrEqual(5);
    }
  });

  it('incluye las 20 técnicas canon (con menor probabilidad cuanto más fuerte) y los 20 personajes canon', () => {
    expect(TECHNIQUES.length).toBe(20);
    expect(NPCS.length).toBe(20);

    for (const rarity of TECHNIQUE_RARITIES) {
      expect(TECHNIQUES.some((t) => t.rarity === rarity)).toBe(true);
    }

    const commonTech = getTechniqueById('divergent_fist');
    const rareTech = getTechniqueById('ratio_technique');
    const specialTech = getTechniqueById('limitless');

    expect(getTechniqueDropWeight(commonTech)).toBeGreaterThan(getTechniqueDropWeight(rareTech));
    expect(getTechniqueDropWeight(rareTech)).toBeGreaterThan(getTechniqueDropWeight(specialTech));
  });

  it('selecciona eventos elegibles tanto a 1 año de edad como a 15+ años evitando repetición inmediata', () => {
    const babyState = createInitialGameState({ name: 'Bebé Jujutsu', startAge: 1 });
    const babyEvent = selectNextEvent(babyState, () => 0.0);
    expect(babyEvent).not.toBeNull();

    const state = createInitialGameState({ name: 'Narrador', startAge: 15 });
    const firstEvent = selectNextEvent(state, () => 0.0);
    expect(firstEvent).not.toBeNull();

    state.turn.recentEventIds.push(firstEvent.id);
    const secondEvent = selectNextEvent(state, () => 0.0);
    expect(secondEvent).not.toBeNull();
    expect(secondEvent.id).not.toBe(firstEvent.id);
  });

  it('valida decisiones condicionadas por Inteligencia táctica, Restricción Celestial y técnica', () => {
    const state = createInitialGameState({
      name: 'Condicionado',
      origin: 'common_family',
      techniqueId: 'straw_doll',
      startAge: 15
    });
    state.player.stats.tacticalIntelligence = 15;

    const evt1 = getEventById('evt_01_entrance_curtain');
    const intChoice = evt1.choices.find((c) => c.id === 'c1_analyze');
    const hrChoice = evt1.choices.find((c) => c.id === 'c2_heavenly_rush');

    expect(isChoiceAvailable(state, intChoice).available).toBe(false);
    expect(isChoiceAvailable(state, hrChoice).available).toBe(false);

    state.player.stats.tacticalIntelligence = 35;
    expect(isChoiceAvailable(state, intChoice).available).toBe(true);
  });

  it('resuelve consecuencias de un evento sobre estadísticas, relaciones o inicio de combate', () => {
    const state = createInitialGameState({ name: 'Resolutor', startAge: 15 });
    const evt1 = getEventById('evt_01_entrance_curtain');
    state.turn.activeEvent = evt1;

    const res = resolveEventChoice(state, evt1.id, 'c3_direct_clash');
    expect(res.ok).toBe(true);
    expect(state.turn.activeEvent).toBeNull();
    expect(state.combat).not.toBeNull();
    expect(state.combat.enemy.name).toContain('Espíritu Cautivo');
  });
});
