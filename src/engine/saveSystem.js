import { ORIGINS, getRankById, sanitizeGameState } from './gameState.js';
import { deepClone } from './utils.js';

export const SAVE_FORMAT_VERSION = '1.0.0';
export const SUPPORTED_VERSIONS = ['1.0.0', '0.9.0'];
export const SAVE_SLOT_IDS = ['slot_1', 'slot_2', 'slot_3', 'autosave'];

const STORAGE_PREFIX = 'jujutsu_life_save_';
const memoryStorage = new Map();

function getStorage() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch (_err) {
    // Fallback en entornos sin acceso a localStorage
  }
  return {
    getItem: (key) => (memoryStorage.has(key) ? memoryStorage.get(key) : null),
    setItem: (key, val) => memoryStorage.set(key, String(val)),
    removeItem: (key) => memoryStorage.delete(key)
  };
}

function getSlotKey(slotId) {
  return `${STORAGE_PREFIX}${slotId}`;
}

export function validateSavePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'El archivo o bloque de guardado no es un objeto JSON válido.' };
  }

  if (payload.format !== 'jujutsu-life-save') {
    return { valid: false, error: 'El archivo no corresponde a una partida de Jujutsu Life.' };
  }

  if (!payload.version || typeof payload.version !== 'string') {
    return { valid: false, error: 'El archivo de guardado no declara una versión de formato.' };
  }

  if (!SUPPORTED_VERSIONS.includes(payload.version)) {
    return {
      valid: false,
      error: `Versión de partida incompatible (${payload.version}). Versiones admitidas: ${SUPPORTED_VERSIONS.join(', ')}.`
    };
  }

  const st = payload.state;
  if (!st || typeof st !== 'object' || !st.player || typeof st.player !== 'object') {
    return { valid: false, error: 'La estructura interna del jugador está dañada o incompleta.' };
  }

  if (typeof st.player.name !== 'string' || st.player.name.trim().length < 1) {
    return { valid: false, error: 'El nombre del personaje en la partida guardada no es válido.' };
  }

  if (!ORIGINS.some((o) => o.id === st.player.origin)) {
    return { valid: false, error: 'El origen del personaje en la partida no es reconocido.' };
  }

  if (!st.player.stats || typeof st.player.stats !== 'object' || typeof st.player.stats.health !== 'number') {
    return { valid: false, error: 'Las estadísticas del personaje están corruptas o no son numéricas.' };
  }

  if (!st.inventory || !Array.isArray(st.inventory.items)) {
    return { valid: false, error: 'El inventario de la partida guardada es inválido.' };
  }

  return { valid: true, error: null };
}

export function migrateSavePayload(payload) {
  const cloned = deepClone(payload);
  if (cloned.version === '0.9.0') {
    cloned.version = SAVE_FORMAT_VERSION;
    if (cloned.state) {
      cloned.state.version = SAVE_FORMAT_VERSION;
      if (!cloned.state.world) {
        cloned.state.world = {
          curseActivity: 25,
          globalIncidents: [],
          completedMissions: 0,
          exorcisedCurses: 0,
          blackFlashesLanded: 0,
          bindingVowsTaken: 0,
          achievements: [],
          unlockedEndings: []
        };
      }
    }
  }
  return cloned;
}

export function buildSaveEnvelope(state) {
  const cleanState = sanitizeGameState(deepClone(state));
  const p = cleanState.player;
  const rankObj = getRankById(p.rank);

  return {
    format: 'jujutsu-life-save',
    version: SAVE_FORMAT_VERSION,
    savedAt: new Date().toISOString(),
    summary: {
      name: p.name,
      age: p.age,
      quarter: p.quarter,
      year: p.year,
      rankName: rankObj.name,
      origin: p.origin,
      alive: p.alive,
      retired: p.retired
    },
    state: cleanState
  };
}

export function saveGameToSlot(state, slotId = 'slot_1') {
  if (!SAVE_SLOT_IDS.includes(slotId)) {
    return { ok: false, message: `Ranura de guardado inválida (${slotId}).` };
  }
  if (!state || !state.player) {
    return { ok: false, message: 'No hay una partida válida para guardar.' };
  }

  try {
    const envelope = buildSaveEnvelope(state);
    const storage = getStorage();
    storage.setItem(getSlotKey(slotId), JSON.stringify(envelope));
    return {
      ok: true,
      message: slotId === 'autosave'
        ? 'Autoguardado completado.'
        : `Partida guardada correctamente en ${slotId.replace('slot_', 'Ranura ')}.`,
      summary: envelope.summary
    };
  } catch (err) {
    return { ok: false, message: `Error al guardar en almacenamiento local: ${err.message}` };
  }
}

export function autoSaveGame(state) {
  if (!state || !state.characterCreated || !state.player) {
    return { ok: false, message: 'Autoguardado omitido: personaje no creado.' };
  }
  return saveGameToSlot(state, 'autosave');
}

export function loadGameFromSlot(slotId = 'slot_1') {
  if (!SAVE_SLOT_IDS.includes(slotId)) {
    return { ok: false, message: `Ranura de carga inválida (${slotId}).`, state: null };
  }

  try {
    const storage = getStorage();
    const raw = storage.getItem(getSlotKey(slotId));
    if (!raw) {
      return { ok: false, message: 'La ranura seleccionada está vacía.', state: null };
    }

    const parsed = JSON.parse(raw);
    const validation = validateSavePayload(parsed);
    if (!validation.valid) {
      return { ok: false, message: validation.error, state: null };
    }

    const migrated = migrateSavePayload(parsed);
    const sanitizedState = sanitizeGameState(migrated.state);

    return {
      ok: true,
      message: `Partida de "${sanitizedState.player.name}" cargada con éxito.`,
      state: sanitizedState
    };
  } catch (_err) {
    return { ok: false, message: 'Los datos de la ranura están dañados y no pudieron leerse.', state: null };
  }
}

export function deleteSaveSlot(slotId) {
  if (!SAVE_SLOT_IDS.includes(slotId)) {
    return { ok: false, message: 'Ranura inválida.' };
  }
  const storage = getStorage();
  storage.removeItem(getSlotKey(slotId));
  return { ok: true, message: `Ranura ${slotId.replace('slot_', '')} eliminada.` };
}

export function listSaveSlots() {
  const storage = getStorage();
  return SAVE_SLOT_IDS.map((slotId) => {
    const label = slotId === 'autosave' ? 'Autoguardado' : `Ranura ${slotId.replace('slot_', '')}`;
    try {
      const raw = storage.getItem(getSlotKey(slotId));
      if (!raw) {
        return { slotId, label, exists: false, savedAt: null, summary: null };
      }
      const parsed = JSON.parse(raw);
      const validation = validateSavePayload(parsed);
      if (!validation.valid) {
        return { slotId, label, exists: false, savedAt: null, summary: null, corrupted: true };
      }
      return {
        slotId,
        label,
        exists: true,
        savedAt: parsed.savedAt,
        summary: parsed.summary
      };
    } catch (_err) {
      return { slotId, label, exists: false, savedAt: null, summary: null, corrupted: true };
    }
  });
}

export function exportSaveToJson(state) {
  if (!state || !state.player) {
    return { ok: false, message: 'No hay estado activo para exportar.', json: null };
  }
  const envelope = buildSaveEnvelope(state);
  return {
    ok: true,
    message: 'Archivo JSON generado correctamente.',
    json: JSON.stringify(envelope, null, 2)
  };
}

export function importSaveFromJson(jsonString) {
  if (typeof jsonString !== 'string' || jsonString.trim().length === 0) {
    return { ok: false, message: 'El contenido JSON proporcionado está vacío.', state: null };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (_err) {
    return { ok: false, message: 'El archivo seleccionado no tiene un formato JSON válido.', state: null };
  }

  const validation = validateSavePayload(parsed);
  if (!validation.valid) {
    return { ok: false, message: validation.error, state: null };
  }

  const migrated = migrateSavePayload(parsed);
  const cleanState = sanitizeGameState(migrated.state);

  return {
    ok: true,
    message: `Partida de "${cleanState.player.name}" importada y validada correctamente.`,
    state: cleanState
  };
}
