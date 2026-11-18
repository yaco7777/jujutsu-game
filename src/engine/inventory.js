import { getItemById } from '../data/items.js';
import { addLogEntry, sanitizeGameState } from './gameState.js';

export function getEquipmentBonuses(state) {
  const bonuses = {
    attackBonus: 0,
    defenseBonus: 0,
    speedBonus: 0,
    ceCostReduction: 0,
    defensePenetration: 0,
    mentalShield: 0
  };

  if (!state || !state.inventory) {
    return bonuses;
  }

  const weapon = state.inventory.equippedWeapon ? getItemById(state.inventory.equippedWeapon) : null;
  const talisman = state.inventory.equippedTalisman ? getItemById(state.inventory.equippedTalisman) : null;

  for (const item of [weapon, talisman]) {
    if (item && item.effect) {
      bonuses.attackBonus += item.effect.attackBonus || 0;
      bonuses.defenseBonus += item.effect.defenseBonus || 0;
      bonuses.speedBonus += item.effect.speedBonus || 0;
      bonuses.ceCostReduction += item.effect.ceCostReduction || 0;
      bonuses.defensePenetration += item.effect.defensePenetration || 0;
      bonuses.mentalShield += item.effect.mentalShield || 0;
    }
  }

  return bonuses;
}

export function buyItem(state, itemId) {
  if (!state || !state.player || !state.player.alive || state.player.retired) {
    return { ok: false, message: 'No puedes comprar objetos en este momento.', state };
  }

  const item = getItemById(itemId);
  if (!item) {
    return { ok: false, message: 'El objeto solicitado no existe.', state };
  }

  const p = state.player;
  if (p.money < item.price) {
    return { ok: false, message: `Fondos insuficientes. Necesitas ${item.price.toLocaleString('es-ES')} ¥.`, state };
  }

  if (item.requirements?.minRankOrder && p.rankOrder < item.requirements.minRankOrder) {
    return { ok: false, message: 'Tu grado actual no tiene autorización para adquirir este artículo.', state };
  }

  p.money -= item.price;
  state.inventory.items.push(item.id);

  if (item.category === 'herramienta_maldita' && !state.inventory.equippedWeapon && p.stats.strength >= (item.requirements?.minStrength || 0)) {
    state.inventory.equippedWeapon = item.id;
  } else if (item.category === 'talisman' && !state.inventory.equippedTalisman) {
    state.inventory.equippedTalisman = item.id;
  }

  sanitizeGameState(state);
  const msg = `Compraste "${item.name}" por ${item.price.toLocaleString('es-ES')} ¥.`;
  addLogEntry(state, msg, 'inventory');
  return { ok: true, message: msg, state };
}

export function sellItem(state, itemId) {
  if (!state || !state.player || !state.player.alive || state.player.retired) {
    return { ok: false, message: 'No puedes vender objetos en este momento.', state };
  }

  const idx = state.inventory.items.indexOf(itemId);
  if (idx === -1) {
    return { ok: false, message: 'No posees ese objeto en el inventario.', state };
  }

  const item = getItemById(itemId);
  const sellPrice = item ? item.sellValue : 1000;

  state.inventory.items.splice(idx, 1);
  state.player.money += sellPrice;

  const stillHasCopy = state.inventory.items.includes(itemId);
  if (!stillHasCopy) {
    if (state.inventory.equippedWeapon === itemId) {
      state.inventory.equippedWeapon = null;
    }
    if (state.inventory.equippedTalisman === itemId) {
      state.inventory.equippedTalisman = null;
    }
  }

  sanitizeGameState(state);
  const msg = `Vendiste "${item ? item.name : itemId}" por ${sellPrice.toLocaleString('es-ES')} ¥.`;
  addLogEntry(state, msg, 'inventory');
  return { ok: true, message: msg, state };
}

export function equipItem(state, itemId) {
  if (!state || !state.player || !state.player.alive || state.player.retired) {
    return { ok: false, message: 'No puedes equipar objetos ahora.', state };
  }

  if (!state.inventory.items.includes(itemId)) {
    return { ok: false, message: 'El objeto no está en tu inventario.', state };
  }

  const item = getItemById(itemId);
  if (!item) {
    return { ok: false, message: 'Objeto desconocido.', state };
  }

  const p = state.player;
  if (item.requirements?.minStrength && p.stats.strength < item.requirements.minStrength) {
    return { ok: false, message: `Requiere Fuerza ${item.requirements.minStrength}+ para empuñar "${item.name}".`, state };
  }
  if (item.requirements?.minRankOrder && p.rankOrder < item.requirements.minRankOrder) {
    return { ok: false, message: 'Tu rango es insuficiente para equipar esta reliquia.', state };
  }

  if (item.category === 'herramienta_maldita') {
    state.inventory.equippedWeapon = item.id;
  } else if (item.category === 'talisman') {
    state.inventory.equippedTalisman = item.id;
  } else {
    return { ok: false, message: 'Solo las herramientas malditas y talismanes son equipables.', state };
  }

  sanitizeGameState(state);
  const msg = `Equipaste "${item.name}".`;
  addLogEntry(state, msg, 'inventory');
  return { ok: true, message: msg, state };
}

export function useConsumable(state, itemId) {
  if (!state || !state.player || !state.player.alive || state.player.retired) {
    return { ok: false, message: 'El personaje no puede usar consumibles ahora.', state };
  }

  const idx = state.inventory.items.indexOf(itemId);
  if (idx === -1) {
    return { ok: false, message: 'No tienes ese consumible en tu inventario.', state };
  }

  const item = getItemById(itemId);
  if (!item || item.category !== 'consumible') {
    return { ok: false, message: 'Este objeto no es un consumible.', state };
  }

  const p = state.player;
  const s = p.stats;
  const eff = item.effect || {};
  const details = [];

  if (eff.healHealth) {
    s.health += eff.healHealth;
    details.push(`+${eff.healHealth} Salud`);
  }
  if (eff.healMental) {
    s.mentalHealth += eff.healMental;
    details.push(`+${eff.healMental} Salud mental`);
  }
  if (eff.restoreCursedEnergy && p.origin !== 'heavenly_restriction') {
    s.cursedEnergy += eff.restoreCursedEnergy;
    details.push(`+${eff.restoreCursedEnergy} Energía maldita`);
  }
  if (eff.combatDefenseBoost && state.combat) {
    state.combat.tempDefenseBonus = (state.combat.tempDefenseBonus || 0) + eff.combatDefenseBoost;
    details.push(`+${eff.combatDefenseBoost} Defensa en combate`);
  }

  state.inventory.items.splice(idx, 1);
  sanitizeGameState(state);

  const msg = `Usaste "${item.name}" (${details.join(', ') || 'efecto aplicado'}).`;
  addLogEntry(state, msg, 'inventory');
  return { ok: true, message: msg, state };
}
