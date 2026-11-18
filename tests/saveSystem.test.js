import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../src/engine/gameState.js';
import {
  saveGameToSlot,
  loadGameFromSlot,
  deleteSaveSlot,
  listSaveSlots,
  exportSaveToJson,
  importSaveFromJson
} from '../src/engine/saveSystem.js';

describe('saveSystem — Guardado, Carga, Exportación e Importación JSON', () => {
  it('guarda y carga correctamente en las 3 ranuras manuales y autoguardado', () => {
    const state = createInitialGameState({
      name: 'Yuta Guardado',
      origin: 'clan_gojo',
      techniqueId: 'copy_rika'
    });
    state.player.money = 88000;

    const save1 = saveGameToSlot(state, 'slot_1');
    const save2 = saveGameToSlot(state, 'slot_2');
    const save3 = saveGameToSlot(state, 'slot_3');

    expect(save1.ok).toBe(true);
    expect(save2.ok).toBe(true);
    expect(save3.ok).toBe(true);

    const slots = listSaveSlots();
    expect(slots.filter((s) => s.exists).length).toBeGreaterThanOrEqual(3);

    const loaded = loadGameFromSlot('slot_1');
    expect(loaded.ok).toBe(true);
    expect(loaded.state.player.name).toBe('Yuta Guardado');
    expect(loaded.state.player.money).toBe(88000);

    const del = deleteSaveSlot('slot_3');
    expect(del.ok).toBe(true);
    expect(loadGameFromSlot('slot_3').ok).toBe(false);
  });

  it('exporta a JSON e importa revalidando y sanitizando valores fuera de rango', () => {
    const state = createInitialGameState({
      name: 'Exportado',
      origin: 'clan_zenin',
      techniqueId: 'ten_shadows'
    });

    const exported = exportSaveToJson(state);
    expect(exported.ok).toBe(true);
    expect(typeof exported.json).toBe('string');

    const rawObj = JSON.parse(exported.json);
    rawObj.state.player.stats.strength = 999;
    rawObj.state.player.stats.health = 500;

    const imported = importSaveFromJson(JSON.stringify(rawObj));
    expect(imported.ok).toBe(true);
    expect(imported.state.player.stats.strength).toBe(100);
    expect(imported.state.player.stats.health).toBe(100);
  });

  it('migra partidas de la versión 0.9.0 a 1.0.0 sin perder datos', () => {
    const state = createInitialGameState({ name: 'Legado 0.9' });
    const legacyEnvelope = {
      format: 'jujutsu-life-save',
      version: '0.9.0',
      savedAt: new Date().toISOString(),
      state
    };
    delete legacyEnvelope.state.world;

    const imported = importSaveFromJson(JSON.stringify(legacyEnvelope));
    expect(imported.ok).toBe(true);
    expect(imported.state.version).toBe('1.0.0');
    expect(imported.state.world).toBeDefined();
    expect(imported.state.world.curseActivity).toBe(25);
  });

  it('rechaza de forma segura JSON corruptos, estructuras inválidas o versiones incompatibles', () => {
    const emptyRes = importSaveFromJson('');
    expect(emptyRes.ok).toBe(false);

    const malformedRes = importSaveFromJson('{no_es_json_valido');
    expect(malformedRes.ok).toBe(false);

    const wrongFormatRes = importSaveFromJson(JSON.stringify({ format: 'otro-juego', version: '1.0.0' }));
    expect(wrongFormatRes.ok).toBe(false);

    const incompatibleVersionRes = importSaveFromJson(JSON.stringify({
      format: 'jujutsu-life-save',
      version: '9.9.9',
      state: {}
    }));
    expect(incompatibleVersionRes.ok).toBe(false);
    expect(incompatibleVersionRes.message).toContain('incompatible');
  });
});
