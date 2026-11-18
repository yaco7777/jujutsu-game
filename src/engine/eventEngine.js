import { EVENTS, getEventById } from '../data/events.js';
import { addLogEntry, sanitizeGameState } from './gameState.js';
import { randomChoice } from './utils.js';

export function isEventEligible(state, event) {
  if (!state || !state.player || !event) {
    return false;
  }
  const p = state.player;
  const s = p.stats;
  const cond = event.conditions || {};

  if (cond.once && state.turn?.completedOnceEvents?.includes(event.id)) {
    return false;
  }
  if (typeof cond.minAge === 'number' && p.age < cond.minAge) {
    return false;
  }
  if (typeof cond.maxAge === 'number' && p.age > cond.maxAge) {
    return false;
  }
  if (typeof cond.minRankOrder === 'number' && p.rankOrder < cond.minRankOrder) {
    return false;
  }
  if (typeof cond.minThreat === 'number' && s.threatLevel < cond.minThreat) {
    return false;
  }
  if (Array.isArray(cond.origins) && cond.origins.length > 0 && !cond.origins.includes(p.origin)) {
    return false;
  }
  if (Array.isArray(cond.schools) && cond.schools.length > 0 && !cond.schools.includes(p.school)) {
    return false;
  }

  return true;
}

export function isChoiceAvailable(state, choice) {
  if (!state || !state.player || !choice) {
    return { available: false, reason: 'Opción inválida.' };
  }
  const p = state.player;
  const s = p.stats;
  const cond = choice.conditions || {};

  if (cond.requiresHeavenlyRestriction && p.origin !== 'heavenly_restriction') {
    return { available: false, reason: 'Requiere origen Restricción Celestial.' };
  }
  if (cond.requiresTechnique && p.techniqueId !== cond.requiresTechnique) {
    return { available: false, reason: 'Requiere la técnica maldita específica.' };
  }
  if (typeof cond.minIntelligence === 'number' && s.tacticalIntelligence < cond.minIntelligence) {
    return { available: false, reason: `Requiere Inteligencia táctica ${cond.minIntelligence}+ (actual: ${s.tacticalIntelligence}).` };
  }
  if (typeof cond.minControl === 'number' && s.cursedEnergyControl < cond.minControl) {
    return { available: false, reason: `Requiere Control de energía maldita ${cond.minControl}+ (actual: ${s.cursedEnergyControl}).` };
  }
  if (typeof cond.minMoney === 'number' && p.money < cond.minMoney) {
    return { available: false, reason: `Requiere ${cond.minMoney.toLocaleString('es-ES')} ¥.` };
  }
  if (typeof cond.minCursedEnergy === 'number') {
    if (p.origin === 'heavenly_restriction') {
      return { available: false, reason: 'Requiere Energía maldita (incompatible con Restricción Celestial).' };
    }
    if (s.cursedEnergy < cond.minCursedEnergy) {
      return { available: false, reason: `Requiere ${cond.minCursedEnergy} de Energía maldita actual.` };
    }
  }
  if (cond.personality && p.personality !== cond.personality) {
    return { available: false, reason: `Requiere personalidad ${cond.personality}.` };
  }

  return { available: true, reason: '' };
}

export function selectNextEvent(state, rng = Math.random) {
  const eligible = EVENTS.filter((evt) => isEventEligible(state, evt));
  if (eligible.length === 0) {
    return null;
  }

  const recent = state.turn?.recentEventIds || [];
  const nonRecent = eligible.filter((evt) => !recent.includes(evt.id));
  const pool = nonRecent.length > 0 ? nonRecent : eligible;

  const chosen = randomChoice(pool, rng);
  if (!chosen) {
    return null;
  }

  return chosen;
}

export function resolveEventChoice(state, eventId, choiceId) {
  if (!state || !state.player || !state.player.alive || state.player.retired) {
    return { ok: false, message: 'No se puede resolver el evento en el estado actual.', state };
  }

  const event = getEventById(eventId) || state.turn?.activeEvent;
  if (!event || event.id !== eventId) {
    return { ok: false, message: 'El evento indicado no coincide con el evento activo.', state };
  }

  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { ok: false, message: 'La opción seleccionada no existe en este evento.', state };
  }

  const availability = isChoiceAvailable(state, choice);
  if (!availability.available) {
    return { ok: false, message: `Opción bloqueada: ${availability.reason}`, state };
  }

  const effects = choice.effects || {};
  const p = state.player;
  const s = p.stats;

  if (effects.stats && typeof effects.stats === 'object') {
    for (const [statKey, delta] of Object.entries(effects.stats)) {
      if (typeof s[statKey] === 'number' && typeof delta === 'number') {
        s[statKey] += delta;
      }
    }
  }

  if (typeof effects.money === 'number') {
    p.money = Math.max(0, p.money + effects.money);
  }

  if (typeof effects.mastery === 'number') {
    p.techniqueMastery += effects.mastery;
  }

  if (typeof effects.vesselRisk === 'number') {
    p.vesselRisk += effects.vesselRisk;
  }

  if (typeof effects.worldThreat === 'number' && state.world) {
    state.world.curseActivity += effects.worldThreat;
  }

  if (effects.addItem && typeof effects.addItem === 'string') {
    state.inventory.items.push(effects.addItem);
  }

  if (effects.relationships && typeof effects.relationships === 'object') {
    for (const [npcId, relDelta] of Object.entries(effects.relationships)) {
      const currentRel = state.relationships[npcId];
      if (currentRel && relDelta) {
        currentRel.friendship += relDelta.friendship || 0;
        currentRel.respect += relDelta.respect || 0;
        currentRel.rivalry += relDelta.rivalry || 0;
      }
    }
  }

  if (choice.conditions?.isBindingVow && state.world) {
    state.world.bindingVowsTaken += 1;
  }

  if (event.conditions?.once && !state.turn.completedOnceEvents.includes(event.id)) {
    state.turn.completedOnceEvents.push(event.id);
  }

  state.turn.recentEventIds.push(event.id);
  if (state.turn.recentEventIds.length > 6) {
    state.turn.recentEventIds.shift();
  }
  state.turn.activeEvent = null;

  const logMessage = effects.log || `Evento "${event.title}": elegiste "${choice.label}".`;
  addLogEntry(state, logMessage, 'event');

  if (effects.combatEnemy && p.stats.health > 0) {
    const enemyTpl = effects.combatEnemy;
    state.combat = {
      id: `evt_combat_${event.id}_${Date.now()}`,
      turnNumber: 1,
      isPromotionExam: false,
      targetRankId: null,
      missionId: null,
      playerGuarding: false,
      simpleDomainActive: 0,
      domainActive: 0,
      domainBurnout: 0,
      tempAttackBonus: 0,
      tempDefenseBonus: 0,
      ally: null,
      enemy: {
        ...enemyTpl,
        health: enemyTpl.maxHealth
      },
      combatLog: [
        `¡El evento "${event.title}" desemboca en un combate contra ${enemyTpl.name}!`
      ]
    };
  }

  sanitizeGameState(state);
  return { ok: true, message: logMessage, state };
}
