export function clamp(value, min = 0, max = 100) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return min;
  }
  const rounded = Math.round(num * 100) / 100;
  return Math.min(max, Math.max(min, rounded));
}

export function formatStat(value) {
  const num = Number(value) || 0;
  if (Number.isInteger(num)) {
    return String(num);
  }
  return num.toFixed(1);
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
}

export function randomInt(min, max, rng = Math.random) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(rng() * (high - low + 1)) + low;
}

export function randomChoice(list, rng = Math.random) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  const index = Math.floor(rng() * list.length);
  return list[Math.min(list.length - 1, Math.max(0, index))];
}

export function formatMoney(amount) {
  const safeAmount = Math.max(0, Math.round(Number(amount) || 0));
  return `${safeAmount.toLocaleString('es-ES')} ¥`;
}

export function generateId(prefix = 'id') {
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}
