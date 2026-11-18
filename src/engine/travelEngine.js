import {
  canPerformQuarterAction,
  consumeTurnAction,
  addLogEntry,
  sanitizeGameState
} from './gameState.js';
import { calculateLogarithmicStatGain } from './progression.js';
import { randomChoice } from './utils.js';

export const TRAVEL_DESTINATIONS = [
  {
    id: 'tokyo',
    name: 'Metrópoli de Tokio y Sede Técnica',
    minAge: 6,
    minRankOrder: 0,
    cost: 3500,
    durationLabel: '1 Estancia Anual',
    riskLevel: 'Bajo',
    localNpcs: ['npc_satoru_gojo', 'npc_yuji_itadori', 'npc_megumi_fushiguro', 'npc_nobara_kugisaki', 'npc_kento_nanami'],
    description: 'El corazón moderno del jujutsu. Ideal para entrenar con los estudiantes y mentores de Tokio o patrullar distritos urbanos.'
  },
  {
    id: 'kyoto',
    name: 'Prefectura Imperial de Kioto',
    minAge: 6,
    minRankOrder: 0,
    cost: 5000,
    durationLabel: '1 Estancia Anual',
    riskLevel: 'Bajo',
    localNpcs: ['npc_aoi_todo', 'npc_noritoshi_kamo', 'npc_kasumi_miwa', 'npc_mai_zenin', 'npc_yoshinobu_gakuganji'],
    description: 'Cuna de los santuarios milenarios y las escuelas tradicionales de barreras y arquería maldita.'
  },
  {
    id: 'zenin_estate',
    name: 'Dominio Amurallado de los Tres Clanes',
    minAge: 8,
    minRankOrder: 0,
    cost: 6500,
    durationLabel: '1 Estancia Anual',
    riskLevel: 'Moderado',
    localNpcs: ['npc_maki_zenin', 'npc_naobito_zenin', 'npc_noritoshi_kamo'],
    description: 'Pabellones ancestrales donde las grandes familias entrenan con herramientas malditas y custodian reliquias.'
  },
  {
    id: 'sendai',
    name: 'Ciudad de Sendai y Costa Norte',
    minAge: 10,
    minRankOrder: 0,
    cost: 7500,
    durationLabel: '1 Estancia Anual',
    riskLevel: 'Moderado',
    localNpcs: ['npc_yuta_okkotsu', 'npc_toge_inumaki', 'npc_panda'],
    description: 'Región famosa por sus mercados regionales, aguas termales curativas y anomalías espirituales costeras.'
  },
  {
    id: 'shibuya_underground',
    name: 'Distrito Subterráneo de Shibuya y Shinjuku',
    minAge: 14,
    minRankOrder: 1,
    cost: 9500,
    durationLabel: '1Incursión Táctica',
    riskLevel: 'Alto',
    localNpcs: ['npc_mei_mei', 'npc_kento_nanami', 'npc_suguru_geto'],
    description: 'Laberinto de estaciones y callejones donde operan intermediarios, usuarios malditos y maldiciones densas.'
  },
  {
    id: 'hida_mountains',
    name: 'Cordillera Sagrada de Hida (Zona Peligrosa)',
    minAge: 15,
    minRankOrder: 2,
    cost: 15000,
    durationLabel: '1 Expedición',
    riskLevel: 'Muy Alto',
    localNpcs: ['npc_satoru_gojo', 'npc_shoko_ieiri', 'npc_masamichi_yaga'],
    description: 'Cumbres aisladas saturadas de energía ancestral donde se forjan votos vinculantes y se ocultan tumbas estelares.'
  },
  {
    id: 'overseas_mission',
    name: 'Expedición Internacional de Grado Especial',
    minAge: 16,
    minRankOrder: 4,
    cost: 28000,
    durationLabel: '1 Expedición Larga',
    riskLevel: 'Extremo',
    localNpcs: ['npc_yuta_okkotsu', 'npc_mei_mei', 'npc_ryomen_sukuna'],
    description: 'Viaje de alto riesgo en busca de herramientas malditas únicas como fragmentos de cuerda negra y reliquias extranjeras.'
  }
];

export function travelToDestination(state, destinationId, rng = Math.random) {
  const check = canPerformQuarterAction(state);
  if (!check.allowed) {
    return { ok: false, message: check.reason, state };
  }

  const dest = TRAVEL_DESTINATIONS.find((d) => d.id === destinationId);
  if (!dest) {
    return { ok: false, message: 'Destino de viaje desconocido.', state };
  }

  const p = state.player;
  const s = p.stats;
  const talentMult = p.talent?.growthMultiplier || 1.0;

  if (p.age < dest.minAge) {
    return { ok: false, message: `Debes tener al menos ${dest.minAge} años para viajar a "${dest.name}".`, state };
  }
  if (p.rankOrder < dest.minRankOrder) {
    return { ok: false, message: `Se requiere mayor grado de hechicería para viajar a "${dest.name}".`, state };
  }
  if (p.money < dest.cost) {
    return { ok: false, message: `Fondos insuficientes. El viaje cuesta ${dest.cost.toLocaleString('es-ES')} ¥.`, state };
  }

  p.money -= dest.cost;
  p.currentLocation = dest.id;
  if (!Array.isArray(state.world.visitedLocations)) {
    state.world.visitedLocations = [];
  }
  if (!state.world.visitedLocations.includes(dest.id)) {
    state.world.visitedLocations.push(dest.id);
  }

  const metNpcId = randomChoice(dest.localNpcs, rng);
  if (metNpcId && state.relationships[metNpcId]) {
    state.relationships[metNpcId].friendship += 5;
    state.relationships[metNpcId].respect += 4;
  }

  let outcomeMsg = '';

  if (dest.riskLevel === 'Muy Alto' || dest.riskLevel === 'Extremo') {
    const masteryGain = calculateLogarithmicStatGain(p.techniqueMastery, 'dificil', 1.0, talentMult);
    p.techniqueMastery += masteryGain;
    s.prestige += 5;

    if (rng() < 0.35 && p.age >= 15) {
      state.combat = {
        id: `travel_combat_${dest.id}_${Date.now()}`,
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
          id: `enemy_${dest.id}`,
          name: `Espíritu Errante de ${dest.name}`,
          grade: 'grado_2',
          gradeOrder: 3,
          maxHealth: 150,
          health: 150,
          attack: 26,
          defense: 14,
          speed: 24,
          specialName: 'Emboscada Territorial',
          specialPower: 34,
          specialChance: 0.32
        },
        combatLog: [
          `Durante tu expedición a "${dest.name}", una maldición territorial te corta el paso.`
        ]
      };
      outcomeMsg = `Viajaste a "${dest.name}" (+${masteryGain} Maestría, +5 Prestigio) y te topaste con un espíritu hostil.`;
    } else {
      if (dest.id === 'overseas_mission' && !state.inventory.items.includes('item_inverted_fragment_spear') && rng() < 0.45) {
        state.inventory.items.push('item_warding_seal');
        outcomeMsg = `Expedición exitosa en "${dest.name}": +${masteryGain} Maestría, +5 Prestigio y hallaste un Talismán consagrado.`;
      } else {
        outcomeMsg = `Exploraste "${dest.name}": +${masteryGain} Maestría técnica, +5 Prestigio y estrechaste lazos locales.`;
      }
    }
  } else {
    const intGain = calculateLogarithmicStatGain(s.tacticalIntelligence, 'normal', 0.9, talentMult);
    s.tacticalIntelligence += intGain;
    s.mentalHealth += 12;
    s.popularity += 3;
    outcomeMsg = `Viajaste a "${dest.name}" (-${dest.cost.toLocaleString('es-ES')} ¥): +${intGain} Inteligencia táctica, +12 Salud mental y +Amistad local.`;
  }

  consumeTurnAction(state, `Viaje a ${dest.name}`);
  sanitizeGameState(state);
  addLogEntry(state, outcomeMsg, 'action');
  return { ok: true, message: outcomeMsg, state };
}
