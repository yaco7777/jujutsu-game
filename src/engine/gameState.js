import {
  getTechniqueById,
  getAvailableTechniquesForOrigin,
  rollWeightedTechniqueForOrigin
} from '../data/techniques.js';
import { NPCS } from '../data/npcs.js';
import { createInitialFamilyState } from './familyEngine.js';
import { createInitialSchoolState } from './schoolEngine.js';
import { clamp, deepClone, randomChoice, randomInt } from './utils.js';

export const MAX_ACTIONS_PER_TURN = 4;
export const MAX_NPC_INTERACTIONS_PER_YEAR = 2;
export const MAX_TOTAL_SOCIAL_PER_YEAR = 5;

export const RANKS = [
  { id: 'grado_4', name: 'Grado 4', order: 0, minPrestige: 0, minMastery: 0, stipendium: 6000 },
  { id: 'grado_3', name: 'Grado 3', order: 1, minPrestige: 14, minMastery: 12, stipendium: 10000 },
  { id: 'semi_grado_2', name: 'Semi-Grado 2', order: 2, minPrestige: 26, minMastery: 24, stipendium: 15000 },
  { id: 'grado_2', name: 'Grado 2', order: 3, minPrestige: 40, minMastery: 35, stipendium: 22000 },
  { id: 'semi_grado_1', name: 'Semi-Grado 1', order: 4, minPrestige: 55, minMastery: 48, stipendium: 30000 },
  { id: 'grado_1', name: 'Grado 1', order: 5, minPrestige: 70, minMastery: 62, stipendium: 45000 },
  { id: 'grado_especial', name: 'Grado Especial', order: 6, minPrestige: 88, minMastery: 80, stipendium: 70000 }
];

export const REGIONS = [
  { id: 'tokyo', name: 'Metrópoli de Tokio', defaultSchool: 'tokyo', curseDensity: 'Alta' },
  { id: 'kyoto', name: 'Prefectura Imperial de Kioto', defaultSchool: 'kyoto', curseDensity: 'Tradicional' },
  { id: 'sendai', name: 'Distrito Norte de Sendai', defaultSchool: 'tokyo', curseDensity: 'Moderada' },
  { id: 'hokkaido', name: 'Frontera Nevada de Hokkaido', defaultSchool: 'tokyo', curseDensity: 'Aislada' },
  { id: 'fukuoka', name: 'Costa Sur de Fukuoka', defaultSchool: 'kyoto', curseDensity: 'Costera' },
  { id: 'okinawa', name: 'Archipiélago de Okinawa', defaultSchool: 'kyoto', curseDensity: 'Insular' }
];

export const SCHOOLS = [
  { id: 'tokyo', name: 'Colegio Técnico de Magia Metropolitana de Tokio' },
  { id: 'kyoto', name: 'Colegio Técnico de Magia Prefectural de Kioto' }
];

export const TALENT_TIERS = [
  {
    id: 'estandar',
    name: 'Latente Estándar',
    weight: 48,
    growthMultiplier: 1.0,
    description: 'Crecimiento constante basado en esfuerzo puro y disciplina diaria.'
  },
  {
    id: 'prometedor',
    name: 'Semilla Prometedora',
    weight: 32,
    growthMultiplier: 1.2,
    description: 'Sensibilidad superior para el flujo maldito (+20 % eficacia de aprendizaje).'
  },
  {
    id: 'prodigio',
    name: 'Prodigio de su Generación',
    weight: 15,
    growthMultiplier: 1.45,
    description: 'Talento innato extraordinario (+45 % eficacia de aprendizaje y mayor reserva).'
  },
  {
    id: 'anomalia',
    name: 'Anomalía Bendecida por las Chispas',
    weight: 5,
    growthMultiplier: 1.75,
    description: 'Uno entre un millón. Asimila técnicas y conceptos a velocidad vertiginosa (+75 % eficacia).'
  }
];

export const PERSONALITIES = [
  {
    id: 'analitico',
    name: 'Analítico',
    description: 'Evalúa fríamente cada barrera y técnica rival. +5 Inteligencia táctica, +3 Control.',
    statMods: { tacticalIntelligence: 5, cursedEnergyControl: 3 }
  },
  {
    id: 'impulsivo',
    name: 'Impulsivo',
    description: 'Se lanza al choque con instinto feroz. +5 Fuerza, +3 Velocidad, -3 Inteligencia táctica.',
    statMods: { strength: 5, speed: 3, tacticalIntelligence: -3 }
  },
  {
    id: 'estoico',
    name: 'Estoico',
    description: 'Mantiene la compostura frente al horror. +5 Salud mental, +4 Relación con altos mandos.',
    statMods: { mentalHealth: 5, higherUpsRelation: 4 }
  },
  {
    id: 'compasivo',
    name: 'Compasivo',
    description: 'Prioriza salvar vidas humanas y proteger compañeros. +7 Popularidad, +4 Salud mental.',
    statMods: { popularity: 7, mentalHealth: 4 }
  },
  {
    id: 'ambicioso',
    name: 'Ambicioso',
    description: 'Aspira a la cima del mundo jujutsu sin importar el precio. +6 Prestigio, +4 Nivel de amenaza.',
    statMods: { prestige: 6, threatLevel: 4 }
  }
];

export const CAREER_PATHS = [
  {
    id: 'crianza_familiar',
    name: 'Infancia y Despertar en el Hogar',
    minAge: 1,
    description: 'Primeros años de vida bajo el cuidado de tus padres mientras despierta tu sensibilidad maldita.'
  },
  {
    id: 'discipulo_clan',
    name: 'Pupilo Interno de Clan',
    minAge: 6,
    description: 'Entrenamiento estricto desde la niñez en los patios familiares bajo supervisión tradicional.'
  },
  {
    id: 'entrenamiento_callejero',
    name: 'Autodidacta Callejero',
    minAge: 6,
    description: 'Aprendizaje libre enfrentando pequeños espíritus y forjando instinto de supervivencia propio.'
  },
  {
    id: 'estudiante',
    name: 'Estudiante del Colegio Técnico',
    minAge: 14,
    description: 'En formación oficial dentro del colegio técnico de Tokio o Kioto.'
  },
  {
    id: 'hechicero_oficial',
    name: 'Hechicero Oficial Acreditado',
    minAge: 16,
    description: 'Operativo acreditado por el consejo con estipendio anual completo y misiones de alto rango.'
  },
  {
    id: 'investigador_barreras',
    name: 'Especialista Médico y de Barreras',
    minAge: 16,
    description: 'Dedicado a la Técnica Inversa, autopsias malditas y mantenimiento de cortinas estratégicas.'
  },
  {
    id: 'mercenario',
    name: 'Mercenario / Cazador de Recompensas',
    minAge: 16,
    description: 'Vende su fuerza al mejor postor manteniendo neutralidad táctica entre facciones (+35 % pagos).'
  },
  {
    id: 'desertor',
    name: 'Desertor / Usuario Maldito',
    minAge: 15,
    description: 'Renegado que opera fuera de la ley jujutsu. Altos ingresos en el mercado negro y alta amenaza.'
  },
  {
    id: 'lider_clan',
    name: 'Patriarca / Líder de Clan',
    minAge: 17,
    description: 'Cabeza política y marcial de una gran dinastía de hechiceros con influencia directa en el consejo.'
  }
];

export const ORIGINS = [
  {
    id: 'clan_zenin',
    name: 'Clan Zenin',
    weight: 16,
    wealthLabel: 'Dinastía Marcial Acaudalada',
    description: 'Linaje marcial obsesionado con la supremacía técnica y las herramientas malditas.',
    initialMoney: 38000,
    defaultTechniqueId: 'ten_shadows',
    baseStats: {
      health: 100,
      maxCursedEnergy: 65,
      cursedEnergy: 65,
      cursedEnergyControl: 28,
      strength: 30,
      speed: 28,
      tacticalIntelligence: 26,
      mentalHealth: 72,
      prestige: 22,
      higherUpsRelation: 55,
      popularity: 20,
      threatLevel: 12
    },
    relationMods: {
      npc_maki_zenin: { friendship: 5, respect: 8, rivalry: 10 },
      npc_megumi_fushiguro: { friendship: 8, respect: 8 },
      npc_naobito_zenin: { respect: 12, friendship: 6 },
      npc_mai_zenin: { friendship: 6, rivalry: 8 }
    },
    startingItems: ['item_slaughter_dagger']
  },
  {
    id: 'clan_gojo',
    name: 'Clan Gojo',
    weight: 8,
    wealthLabel: 'Fortuna Aristocrática Milenaria',
    description: 'Descendiente de la familia sostenida por el poder de Satoru Gojo. Inmensa reserva y fortuna familiar.',
    initialMoney: 52000,
    defaultTechniqueId: 'limitless',
    baseStats: {
      health: 100,
      maxCursedEnergy: 80,
      cursedEnergy: 80,
      cursedEnergyControl: 36,
      strength: 22,
      speed: 30,
      tacticalIntelligence: 30,
      mentalHealth: 76,
      prestige: 26,
      higherUpsRelation: 46,
      popularity: 25,
      threatLevel: 18
    },
    relationMods: {
      npc_satoru_gojo: { friendship: 15, respect: 12 },
      npc_yuta_okkotsu: { friendship: 10, respect: 8 },
      npc_yoshinobu_gakuganji: { rivalry: 10 }
    },
    startingItems: ['item_warding_seal']
  },
  {
    id: 'clan_kamo',
    name: 'Clan Kamo',
    weight: 18,
    wealthLabel: 'Patrimonio Noble Tradicional',
    description: 'Estirpe ortodoxa guardiana de las tradiciones y cercana a los altos mandos.',
    initialMoney: 34000,
    defaultTechniqueId: 'blood_manipulation',
    baseStats: {
      health: 100,
      maxCursedEnergy: 64,
      cursedEnergy: 64,
      cursedEnergyControl: 32,
      strength: 24,
      speed: 25,
      tacticalIntelligence: 29,
      mentalHealth: 75,
      prestige: 20,
      higherUpsRelation: 66,
      popularity: 18,
      threatLevel: 8
    },
    relationMods: {
      npc_noritoshi_kamo: { friendship: 14, respect: 12 },
      npc_yoshinobu_gakuganji: { respect: 10, friendship: 6 },
      npc_shoko_ieiri: { friendship: 5 }
    },
    startingItems: ['item_medical_pack']
  },
  {
    id: 'common_family',
    name: 'Familia común de hechiceros',
    weight: 42,
    wealthLabel: 'Economía Familiar Modesta',
    description: 'Sin el respaldo ni las cadenas de los tres grandes clanes. Libertad para forjar tu propio destino.',
    initialMoney: 14000,
    defaultTechniqueId: 'straw_doll',
    baseStats: {
      health: 100,
      maxCursedEnergy: 56,
      cursedEnergy: 56,
      cursedEnergyControl: 24,
      strength: 25,
      speed: 26,
      tacticalIntelligence: 25,
      mentalHealth: 82,
      prestige: 10,
      higherUpsRelation: 45,
      popularity: 32,
      threatLevel: 5
    },
    relationMods: {
      npc_yuji_itadori: { friendship: 10, respect: 5 },
      npc_nobara_kugisaki: { friendship: 8, respect: 5 },
      npc_kento_nanami: { respect: 8, friendship: 5 },
      npc_kasumi_miwa: { friendship: 12 }
    },
    startingItems: ['item_medical_pack']
  },
  {
    id: 'heavenly_restriction',
    name: 'Restricción Celestial',
    weight: 6,
    wealthLabel: 'Recursos Escasos / Marginalizado por Clanes',
    description: 'Atadura de nacimiento que reduce tu energía maldita a 0 absoluto a cambio de un físico sobrehumano.',
    initialMoney: 16000,
    defaultTechniqueId: 'heavenly_restriction_body',
    baseStats: {
      health: 100,
      maxCursedEnergy: 0,
      cursedEnergy: 0,
      cursedEnergyControl: 0,
      strength: 62,
      speed: 60,
      tacticalIntelligence: 30,
      mentalHealth: 78,
      prestige: 12,
      higherUpsRelation: 35,
      popularity: 22,
      threatLevel: 20
    },
    relationMods: {
      npc_maki_zenin: { friendship: 18, respect: 16 },
      npc_yuji_itadori: { friendship: 10, respect: 10 },
      npc_naobito_zenin: { rivalry: 15 }
    },
    startingItems: ['item_slaughter_dagger', 'item_medical_pack']
  },
  {
    id: 'cursed_vessel',
    name: 'Recipiente de un objeto maldito',
    weight: 10,
    wealthLabel: 'Hogar Humilde Bajo Vigilancia Especial',
    description: 'Nacido con una jaula espiritual capaz de albergar una reliquia de Grado Especial. Reserva colosal y riesgo constante.',
    initialMoney: 12000,
    defaultTechniqueId: 'shrine',
    baseStats: {
      health: 100,
      maxCursedEnergy: 84,
      cursedEnergy: 84,
      cursedEnergyControl: 22,
      strength: 36,
      speed: 32,
      tacticalIntelligence: 22,
      mentalHealth: 66,
      prestige: 14,
      higherUpsRelation: 20,
      popularity: 24,
      threatLevel: 38
    },
    relationMods: {
      npc_yuji_itadori: { friendship: 16, respect: 12 },
      npc_satoru_gojo: { friendship: 12, respect: 10 },
      npc_ryomen_sukuna: { respect: 10, rivalry: 20 },
      npc_yoshinobu_gakuganji: { rivalry: 20 }
    },
    startingItems: ['item_cursed_incense']
  }
];

export function rollWeightedFromList(items, rng = Math.random) {
  const total = items.reduce((acc, item) => acc + (item.weight || 10), 0);
  let r = rng() * total;
  for (const item of items) {
    r -= item.weight || 10;
    if (r <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
}

export function generateParentsProfile(originObj, regionObj, rng = Math.random) {
  const fatherNames = ['Kenjiro', 'Tatsuya', 'Shinichi', 'Masaru', 'Ryohei', 'Kazuki', 'Seiji', 'Haruto'];
  const motherNames = ['Yasuko', 'Ayame', 'Fumiko', 'Chihiro', 'Natsumi', 'Kaori', 'Misaki', 'Reiko'];

  const surnameMap = {
    clan_zenin: 'Zenin',
    clan_gojo: 'Gojo',
    clan_kamo: 'Kamo',
    common_family: randomChoice(['Sato', 'Takahashi', 'Watanabe', 'Ito', 'Kobayashi'], rng),
    heavenly_restriction: randomChoice(['Zenin (Rama Exiliada)', 'Fushiguro', 'Kuroda'], rng),
    cursed_vessel: randomChoice(['Itadori', 'Hoshino', 'Amamiya', 'Fujimoto'], rng)
  };

  const roleMap = {
    clan_zenin: {
      fatherRole: 'Comandante de la Unidad Hei (Grado 1)',
      motherRole: 'Custodia del Armero Ceremonial Zenin',
      story: 'Tus padres esperan que demuestres una técnica digna de la casa principal o serás relegado a las unidades de infantería.'
    },
    clan_gojo: {
      fatherRole: 'Maestro de Barreras de la Rama Principal Gojo',
      motherRole: 'Archivera de los Pergaminos Estelares',
      story: 'Naciste rodeado de lujos y guardaespaldas en una residencia donde cada niño es evaluado bajo la sombra de Satoru Gojo.'
    },
    clan_kamo: {
      fatherRole: 'Consejero Diplomático del Clan Kamo (Semi-Grado 1)',
      motherRole: 'Sacerdotisa de Purificación Sintoísta',
      story: 'Tu nacimiento fue celebrado con rituales antiguos; la familia espera que honres el linaje y mantengas el favor del consejo.'
    },
    common_family: {
      fatherRole: 'Supervisor Auxiliar ("Ventana" del Colegio Técnico)',
      motherRole: 'Hechicera Retirada de Grado 3',
      story: 'Creciste en un hogar cálido de clase trabajadora donde te enseñaron que sobrevivir es más importante que la gloria política.'
    },
    heavenly_restriction: {
      fatherRole: 'Guerrero Desheredado de Clan Tradicional',
      motherRole: 'Artesana de Herramientas Malditas',
      story: 'Al nacer con 0 absoluto de energía maldita, los ancianos te dieron la espalda, pero tus padres vieron en tu físico un milagro irrepetible.'
    },
    cursed_vessel: {
      fatherRole: 'Investigador Desaparecido de Reliquias Malditas',
      motherRole: 'Portadora de Sello de Contención Antiguo',
      story: 'Un pacto ancestral selló un fragmento maldito en tu cuna la noche en que naciste, atrayendo la mirada de Satoru Gojo y de los altos mandos.'
    }
  };

  const surname = surnameMap[originObj.id] || 'Sato';
  const info = roleMap[originObj.id] || roleMap.common_family;
  const wealthVariation = randomInt(-2500, 6000, rng);
  const familyMoney = Math.max(5000, originObj.initialMoney + wealthVariation);

  return {
    fatherName: `${randomChoice(fatherNames, rng)} ${surname}`,
    fatherRole: info.fatherRole,
    motherName: `${randomChoice(motherNames, rng)} ${surname}`,
    motherRole: info.motherRole,
    story: info.story,
    wealthLabel: originObj.wealthLabel,
    regionName: regionObj.name,
    familyMoney
  };
}

export function getOriginById(originId) {
  return ORIGINS.find((origin) => origin.id === originId) || ORIGINS[3];
}

export function getRankById(rankId) {
  return RANKS.find((rank) => rank.id === rankId) || RANKS[0];
}

export function getRankByOrder(order) {
  return RANKS.find((rank) => rank.order === order) || RANKS[0];
}

export function validateCharacterConfig(config = {}) {
  const errors = [];
  const cleanName = typeof config.name === 'string' ? config.name.trim() : '';
  if (cleanName.length < 2 || cleanName.length > 32) {
    errors.push('El nombre debe tener entre 2 y 32 caracteres.');
  }

  const validPronouns = ['él', 'ella', 'elle'];
  if (!validPronouns.includes(config.pronouns)) {
    errors.push('Selecciona un género / pronombre válido (él, ella, elle).');
  }

  if (config.region && !REGIONS.some((r) => r.id === config.region)) {
    errors.push('La región seleccionada no es válida.');
  }

  if (config.origin && !ORIGINS.some((o) => o.id === config.origin)) {
    errors.push('El origen seleccionado no es válido.');
  }

  if (config.school && !SCHOOLS.some((s) => s.id === config.school)) {
    errors.push('La escuela seleccionada no es válida.');
  }

  if (config.personality && !PERSONALITIES.some((p) => p.id === config.personality)) {
    errors.push('La personalidad seleccionada no es válida.');
  }

  if (config.origin && config.techniqueId) {
    const validTechniques = getAvailableTechniquesForOrigin(config.origin);
    if (!validTechniques.some((t) => t.id === config.techniqueId)) {
      errors.push('La técnica seleccionada no es compatible con el origen elegido.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function generateRandomCharacterConfig(rng = Math.random) {
  const sampleNames = [
    'Akira Sato',
    'Kaito Hoshino',
    'Renji Kurokawa',
    'Hinata Tachibana',
    'Sora Fujimoto',
    'Yuki Shinohara',
    'Daichi Morimoto',
    'Rei Amamiya'
  ];
  const pronounsList = ['él', 'ella', 'elle'];
  const region = randomChoice(REGIONS, rng);
  const origin = rollWeightedFromList(ORIGINS, rng);
  const personality = randomChoice(PERSONALITIES, rng);
  const rolledTech = rollWeightedTechniqueForOrigin(origin.id, rng);

  return {
    name: randomChoice(sampleNames, rng),
    pronouns: randomChoice(pronounsList, rng),
    region: region.id,
    origin: origin.id,
    school: region.defaultSchool,
    personality: personality.id,
    techniqueId: rolledTech.technique.id,
    techniqueProbPercent: rolledTech.probabilityPercent
  };
}

export function createInitialGameState(rawConfig = {}, rng = Math.random) {
  const fallback = generateRandomCharacterConfig(rng);
  const regionObj = REGIONS.find((r) => r.id === rawConfig.region) || REGIONS[0];

  const isRollDestiny = Boolean(rawConfig.rollDestiny);
  const originObj = (!isRollDestiny && ORIGINS.some((o) => o.id === rawConfig.origin))
    ? getOriginById(rawConfig.origin)
    : rollWeightedFromList(ORIGINS, rng);

  const personalityObj = (!isRollDestiny && PERSONALITIES.some((p) => p.id === rawConfig.personality))
    ? PERSONALITIES.find((p) => p.id === rawConfig.personality)
    : randomChoice(PERSONALITIES, rng);

  const talentObj = TALENT_TIERS.find((t) => t.id === rawConfig.talentId)
    || rollWeightedFromList(TALENT_TIERS, rng);

  const compatibleTechs = getAvailableTechniquesForOrigin(originObj.id);
  let selectedTech = null;
  let techProbPercent = 15;

  if (!isRollDestiny && rawConfig.techniqueId && compatibleTechs.some((t) => t.id === rawConfig.techniqueId)) {
    selectedTech = getTechniqueById(rawConfig.techniqueId);
  } else {
    const rolled = rollWeightedTechniqueForOrigin(originObj.id, rng);
    selectedTech = rolled.technique;
    techProbPercent = rolled.probabilityPercent;
  }

  const parentsProfile = rawConfig.parents || generateParentsProfile(originObj, regionObj, rng);
  const schoolId = SCHOOLS.some((s) => s.id === rawConfig.school) ? rawConfig.school : regionObj.defaultSchool;

  const stats = { ...originObj.baseStats };
  for (const [statKey, delta] of Object.entries(personalityObj.statMods)) {
    if (typeof stats[statKey] === 'number') {
      stats[statKey] += delta;
    }
  }

  if (talentObj.id === 'prodigio' || talentObj.id === 'anomalia') {
    if (originObj.id !== 'heavenly_restriction') {
      stats.maxCursedEnergy += talentObj.id === 'anomalia' ? 10 : 5;
      stats.cursedEnergy = stats.maxCursedEnergy;
      stats.cursedEnergyControl += talentObj.id === 'anomalia' ? 6 : 3;
    } else {
      stats.strength += 6;
      stats.speed += 6;
    }
  }

  const relationships = {};
  for (const npc of NPCS) {
    const mod = originObj.relationMods?.[npc.id] || {};
    const personalityBonus = npc.preferredPersonality === personalityObj.id ? 6 : 0;
    relationships[npc.id] = {
      friendship: clamp(npc.initialFriendship + (mod.friendship || 0) + personalityBonus, 0, 100),
      respect: clamp(npc.initialRespect + (mod.respect || 0) + personalityBonus, 0, 100),
      rivalry: clamp(npc.initialRivalry + (mod.rivalry || 0), 0, 100),
      trust: clamp(npc.initialFriendship + (mod.friendship || 0), 0, 100),
      romance: 0,
      allied: false,
      betrayed: false
    };
  }

  const initialItems = [...(originObj.startingItems || [])];
  const equippedWeapon = initialItems.includes('item_slaughter_dagger') ? 'item_slaughter_dagger' : null;
  const equippedTalisman = initialItems.includes('item_warding_seal') ? 'item_warding_seal' : null;

  const startAge = typeof rawConfig.startAge === 'number'
    ? rawConfig.startAge
    : (rawConfig.rollDestiny ? 1 : 15);

  const initialMoney = rawConfig.rollDestiny ? parentsProfile.familyMoney : originObj.initialMoney;

  const state = {
    version: '1.0.0',
    characterCreated: Boolean(rawConfig.characterCreated ?? true),
    birthPreviewPending: Boolean(rawConfig.birthPreviewPending ?? false),
    birthLocked: true,
    tutorialSeen: Boolean(rawConfig.tutorialSeen ?? false),
    player: {
      name: typeof rawConfig.name === 'string' && rawConfig.name.trim().length >= 2
        ? rawConfig.name.trim().slice(0, 32)
        : fallback.name,
      pronouns: ['él', 'ella', 'elle'].includes(rawConfig.pronouns) ? rawConfig.pronouns : 'él',
      region: regionObj.id,
      currentLocation: regionObj.id,
      age: startAge,
      quarter: 1,
      year: 1,
      totalQuarters: 0,
      school: schoolId,
      origin: originObj.id,
      personality: personalityObj.id,
      talent: {
        id: talentObj.id,
        name: talentObj.name,
        growthMultiplier: talentObj.growthMultiplier,
        description: talentObj.description
      },
      parents: parentsProfile,
      rank: 'grado_4',
      rankOrder: 0,
      careerPath: startAge < 14 ? 'crianza_familiar' : 'estudiante',
      techniqueId: selectedTech.id,
      techniqueProbPercent: techProbPercent,
      techniqueMastery: startAge < 14 ? 4 : 10,
      unlockedExtensions: [],
      unlocks: {
        rct: false,
        simpleDomain: false,
        domainExpansion: false
      },
      fatigue: 0,
      injury: null,
      illness: null,
      romanticPartnerId: null,
      vesselRisk: originObj.id === 'cursed_vessel' ? 25 : 0,
      money: initialMoney,
      alive: true,
      retired: false,
      causeOfDeath: null,
      ending: null,
      stats
    },
    family: createInitialFamilyState(originObj, regionObj, parentsProfile, rng),
    school: createInitialSchoolState(schoolId),
    inventory: {
      items: initialItems,
      equippedWeapon,
      equippedTalisman
    },
    relationships,
    world: {
      curseActivity: 25,
      globalIncidents: [],
      completedMissions: 0,
      exorcisedCurses: 0,
      blackFlashesLanded: 0,
      bindingVowsTaken: 0,
      achievements: [],
      unlockedEndings: [],
      visitedLocations: [regionObj.id],
      factionReputation: {
        colegio_tecnico: 50,
        tres_clanes: originObj.id.startsWith('clan_') ? 65 : 40,
        altos_mandos: stats.higherUpsRelation,
        sindicato_nocturno: 20
      },
      rumors: [
        `Se comenta el nacimiento de ${rawConfig.name || fallback.name} en ${regionObj.name} bajo el signo de "${originObj.name}".`
      ],
      worldNews: [
        'Las escuelas técnicas de Tokio y Kioto mantienen vigilancia ordinaria sobre las cortinas regionales.'
      ],
      decisionMemory: [],
      lastAnnualSummary: null
    },
    turn: {
      maxActionsPerTurn: MAX_ACTIONS_PER_TURN,
      actionsRemaining: MAX_ACTIONS_PER_TURN,
      actionsTakenCount: 0,
      quarterActionTaken: false,
      lastActionName: null,
      npcInteractions: {},
      totalSocialThisYear: 0,
      activeEvent: null,
      recentEventIds: [],
      completedOnceEvents: []
    },
    combat: null,
    log: [
      {
        id: 'log_init_1',
        quarter: 1,
        year: 1,
        age: startAge,
        category: 'milestone',
        text: `${rawConfig.name || fallback.name} nace en ${regionObj.name} dentro de "${originObj.name}". Padres: ${parentsProfile.fatherName} y ${parentsProfile.motherName}. Talento: "${talentObj.name}". Técnica grabada: "${selectedTech.name}".`
      }
    ]
  };

  return sanitizeGameState(state);
}

export function consumeTurnAction(state, actionLabel = 'Acción') {
  if (!state || !state.turn) {
    return;
  }
  const currentRem = typeof state.turn.actionsRemaining === 'number'
    ? state.turn.actionsRemaining
    : MAX_ACTIONS_PER_TURN;

  state.turn.actionsRemaining = Math.max(0, currentRem - 1);
  state.turn.actionsTakenCount = (state.turn.actionsTakenCount || 0) + 1;
  state.turn.lastActionName = actionLabel;
  state.turn.quarterActionTaken = state.turn.actionsRemaining <= 0;
}

export function sanitizeGameState(state) {
  if (!state || typeof state !== 'object' || !state.player) {
    return createInitialGameState({ characterCreated: false });
  }

  const p = state.player;
  const s = p.stats || {};

  if (p.origin === 'heavenly_restriction') {
    p.techniqueId = 'heavenly_restriction_body';
    s.maxCursedEnergy = 0;
    s.cursedEnergy = 0;
    s.cursedEnergyControl = 0;
  } else {
    s.maxCursedEnergy = clamp(s.maxCursedEnergy ?? 50, 1, 100);
    s.cursedEnergy = clamp(s.cursedEnergy ?? s.maxCursedEnergy, 0, s.maxCursedEnergy);
    s.cursedEnergyControl = clamp(s.cursedEnergyControl ?? 20, 0, 100);
  }

  s.health = clamp(s.health ?? 100, 0, 100);
  s.strength = clamp(s.strength ?? 20, 0, 100);
  s.speed = clamp(s.speed ?? 20, 0, 100);
  s.tacticalIntelligence = clamp(s.tacticalIntelligence ?? 20, 0, 100);
  s.mentalHealth = clamp(s.mentalHealth ?? 75, 0, 100);
  s.prestige = clamp(s.prestige ?? 10, 0, 100);
  s.higherUpsRelation = clamp(s.higherUpsRelation ?? 45, 0, 100);
  s.popularity = clamp(s.popularity ?? 20, 0, 100);
  s.threatLevel = clamp(s.threatLevel ?? 5, 0, 100);

  p.techniqueMastery = clamp(p.techniqueMastery ?? 10, 0, 100);
  p.vesselRisk = clamp(p.vesselRisk ?? 0, 0, 100);
  p.fatigue = clamp(p.fatigue ?? 0, 0, 100);
  p.money = Math.max(0, Math.round(Number(p.money) || 0));
  p.age = Math.max(1, Math.round(Number(p.age) || 1));
  p.quarter = clamp(p.quarter ?? 1, 1, 4);
  p.year = Math.max(1, Math.round(Number(p.year) || 1));

  if (!p.talent) {
    p.talent = {
      id: 'estandar',
      name: 'Latente Estándar',
      growthMultiplier: 1.0,
      description: 'Crecimiento constante basado en esfuerzo puro.'
    };
  }
  if (!p.parents) {
    const originObj = getOriginById(p.origin);
    const regionObj = REGIONS.find((r) => r.id === p.region) || REGIONS[0];
    p.parents = generateParentsProfile(originObj, regionObj);
  }
  if (!state.family) {
    const originObj = getOriginById(p.origin);
    const regionObj = REGIONS.find((r) => r.id === p.region) || REGIONS[0];
    state.family = createInitialFamilyState(originObj, regionObj, p.parents);
  }
  if (!state.school) {
    state.school = createInitialSchoolState(p.school || 'tokyo');
  }

  const rankObj = getRankById(p.rank);
  p.rank = rankObj.id;
  p.rankOrder = rankObj.order;

  const tech = getTechniqueById(p.techniqueId);
  if (Array.isArray(tech.extensions)) {
    for (const ext of tech.extensions) {
      const meetsMastery = p.techniqueMastery >= ext.unlockMastery;
      const meetsControl = p.origin === 'heavenly_restriction' || s.cursedEnergyControl >= ext.minControl;
      if (meetsMastery && meetsControl && !p.unlockedExtensions.includes(ext.id)) {
        p.unlockedExtensions.push(ext.id);
      }
    }
  }

  if (state.turn) {
    if (typeof state.turn.maxActionsPerTurn !== 'number') {
      state.turn.maxActionsPerTurn = MAX_ACTIONS_PER_TURN;
    }
    if (typeof state.turn.actionsRemaining !== 'number') {
      state.turn.actionsRemaining = state.turn.quarterActionTaken ? 0 : MAX_ACTIONS_PER_TURN;
    }
    if (!state.turn.npcInteractions || typeof state.turn.npcInteractions !== 'object') {
      state.turn.npcInteractions = {};
    }
    if (typeof state.turn.totalSocialThisYear !== 'number') {
      state.turn.totalSocialThisYear = 0;
    }
  }

  if (s.health <= 0 && p.alive) {
    p.alive = false;
    p.causeOfDeath = p.causeOfDeath || 'Colapso vital por heridas críticas.';
    if (!p.ending) {
      p.ending = {
        id: 'ending_fallen_sorcerer',
        title: 'Muerte en el Deber',
        summary: `${p.name} cayó a los ${p.age} años como hechicero de ${rankObj.name}. En el mundo del jujutsu, ningún hechicero muere sin dejar una marca.`
      };
    }
  }

  if (!p.alive || p.retired) {
    state.combat = null;
    if (state.turn) {
      state.turn.activeEvent = null;
    }
  }

  if (state.relationships && typeof state.relationships === 'object') {
    for (const npc of NPCS) {
      const rel = state.relationships[npc.id] || {
        friendship: npc.initialFriendship,
        respect: npc.initialRespect,
        rivalry: npc.initialRivalry,
        allied: false,
        betrayed: false
      };
      rel.friendship = clamp(rel.friendship, 0, 100);
      rel.respect = clamp(rel.respect, 0, 100);
      rel.rivalry = clamp(rel.rivalry, 0, 100);
      rel.trust = clamp(rel.trust ?? rel.friendship, 0, 100);
      rel.romance = clamp(rel.romance ?? 0, 0, 100);
      state.relationships[npc.id] = rel;
    }
  }

  if (state.world) {
    state.world.curseActivity = clamp(state.world.curseActivity ?? 25, 0, 100);
    if (!Array.isArray(state.world.visitedLocations)) {
      state.world.visitedLocations = [p.region || 'tokyo'];
    }
    if (!state.world.factionReputation) {
      state.world.factionReputation = {
        colegio_tecnico: 50,
        tres_clanes: 45,
        altos_mandos: s.higherUpsRelation,
        sindicato_nocturno: 20
      };
    } else {
      state.world.factionReputation.altos_mandos = clamp(s.higherUpsRelation, 0, 100);
    }
    if (!Array.isArray(state.world.rumors)) {
      state.world.rumors = [];
    }
    if (!Array.isArray(state.world.worldNews)) {
      state.world.worldNews = [];
    }
    if (!Array.isArray(state.world.decisionMemory)) {
      state.world.decisionMemory = [];
    }
  }

  return state;
}

export function generateBiography(state) {
  if (!state || !state.player) return '';
  const p = state.player;
  const originObj = getOriginById(p.origin);
  const rankObj = getRankById(p.rank);
  const tech = getTechniqueById(p.techniqueId);
  const careerObj = CAREER_PATHS.find((c) => c.id === p.careerPath) || CAREER_PATHS[0];
  const parents = p.parents || {};

  return `${p.name} (${p.pronouns}) nació en ${parents.regionName || 'Tokio'}, hijo/a de ${parents.fatherName || 'padre desconocido'} y ${parents.motherName || 'madre desconocida'}, en el seno de "${originObj.name}". Despertó el talento "${p.talent?.name || 'Estándar'}" y la técnica "${tech.name}". A sus ${p.age} años ostenta el rango de ${rankObj.name} siguiendo el camino de "${careerObj.name}", habiendo completado ${state.world?.completedMissions || 0} misiones y exorcizado ${state.world?.exorcisedCurses || 0} maldiciones.`;
}

export function addLogEntry(state, text, category = 'info') {
  if (!state || !Array.isArray(state.log)) {
    return;
  }
  state.log.unshift({
    id: `log_${Date.now()}_${state.log.length}`,
    quarter: state.player.quarter,
    year: state.player.year,
    age: state.player.age,
    category,
    text
  });
  if (state.log.length > 150) {
    state.log.length = 150;
  }
}

export function canPerformQuarterAction(state) {
  if (!state || !state.player) {
    return { allowed: false, reason: 'Estado de partida no inicializado.' };
  }
  if (!state.player.alive) {
    return { allowed: false, reason: 'El personaje ha fallecido. La muerte es permanente.' };
  }
  if (state.player.retired) {
    return { allowed: false, reason: 'El personaje ya se ha retirado de la vida activa.' };
  }
  if (state.combat) {
    return { allowed: false, reason: 'Debes resolver el combate en curso antes de realizar otra acción.' };
  }
  if (state.turn?.activeEvent) {
    return { allowed: false, reason: 'Debes tomar una decisión en el evento principal actual antes de continuar.' };
  }
  const rem = state.turn?.actionsRemaining ?? MAX_ACTIONS_PER_TURN;
  if (state.turn?.quarterActionTaken || rem <= 0) {
    return { allowed: false, reason: 'Ya agotaste tus 4 acciones de este año. Pulsa "Avanzar Año (+1 Año)".' };
  }
  return { allowed: true, reason: '' };
}

export function cloneState(state) {
  return deepClone(state);
}
