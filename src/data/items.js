export const ITEMS = [
  {
    id: 'item_slaughter_dagger',
    name: 'Daga de Exorcismo Templada',
    category: 'herramienta_maldita',
    rarity: 'Común',
    price: 12000,
    sellValue: 6000,
    description: 'Hoja corta imbuida de forma permanente con energía maldita industrial. Ideal para estudiantes y usuarios sin técnica.',
    effect: { attackBonus: 7, speedBonus: 2 },
    requirements: { minStrength: 10, minRankOrder: 0 }
  },
  {
    id: 'item_black_steel_katana',
    name: 'Katana de Acero Azabache',
    category: 'herramienta_maldita',
    rarity: 'Rara',
    price: 32000,
    sellValue: 16000,
    description: 'Espada forjada para canalizar flujos cortantes. Incrementa la letalidad en duelos cerrados.',
    effect: { attackBonus: 13, speedBonus: 4 },
    requirements: { minStrength: 25, minRankOrder: 1 }
  },
  {
    id: 'item_three_section_staff',
    name: 'Bastón Articulado de Nube Roja',
    category: 'herramienta_maldita',
    rarity: 'Especial',
    price: 78000,
    sellValue: 39000,
    description: 'Herramienta maldita de grado especial cuya potencia escala puramente con la fuerza física del portador.',
    effect: { attackBonus: 22, speedBonus: 7 },
    requirements: { minStrength: 50, minRankOrder: 3 }
  },
  {
    id: 'item_inverted_fragment_spear',
    name: 'Lanza de Escisión Celeste',
    category: 'herramienta_maldita',
    rarity: 'Especial',
    price: 95000,
    sellValue: 47500,
    description: 'Reliquia de filo bifurcado capaz de perturbar defensas impregnadas de energía maldita.',
    effect: { attackBonus: 25, defensePenetration: 10 },
    requirements: { minStrength: 55, minRankOrder: 4 }
  },
  {
    id: 'item_resonant_gauntlets',
    name: 'Guanteletes de Impacto Sísmico',
    category: 'herramienta_maldita',
    rarity: 'Rara',
    price: 38000,
    sellValue: 19000,
    description: 'Refuerzan nudillos y muñecas para liberar ondas de choque al golpear cuerpo a cuerpo.',
    effect: { attackBonus: 14, defenseBonus: 4 },
    requirements: { minStrength: 30, minRankOrder: 1 }
  },
  {
    id: 'item_warding_seal',
    name: 'Talismán de Velo Protector',
    category: 'talisman',
    rarity: 'Común',
    price: 9000,
    sellValue: 4500,
    description: 'Sello de papel consagrado que amortigua parte del impacto maldito recibido.',
    effect: { defenseBonus: 6, mentalShield: 3 },
    requirements: { minStrength: 0, minRankOrder: 0 }
  },
  {
    id: 'item_crimson_knot_talisman',
    name: 'Amuleto de Nudo Carmesí',
    category: 'talisman',
    rarity: 'Rara',
    price: 26000,
    sellValue: 13000,
    description: 'Estabiliza la circulación de energía maldita y reduce el desgaste en combates prolongados.',
    effect: { defenseBonus: 10, ceCostReduction: 3 },
    requirements: { minStrength: 0, minRankOrder: 1 }
  },
  {
    id: 'item_mirror_soul_amulet',
    name: 'Espejo de Contención Abisal',
    category: 'talisman',
    rarity: 'Especial',
    price: 68000,
    sellValue: 34000,
    description: 'Reliquia lacada que protege la mente del portador y refuerza la barrera personal frente a dominios hostiles.',
    effect: { defenseBonus: 16, ceCostReduction: 5, mentalShield: 10 },
    requirements: { minStrength: 0, minRankOrder: 3 }
  },
  {
    id: 'item_medical_pack',
    name: 'Botiquín de Sutura Rápida',
    category: 'consumible',
    rarity: 'Común',
    price: 5500,
    sellValue: 2500,
    description: 'Vendajes compresivos y coagulantes de campaña. Restaura 28 puntos de Salud.',
    effect: { healHealth: 28 },
    requirements: { minStrength: 0, minRankOrder: 0 }
  },
  {
    id: 'item_rct_ampoule',
    name: 'Ampolla de Catalizador Inverso',
    category: 'consumible',
    rarity: 'Rara',
    price: 16500,
    sellValue: 8000,
    description: 'Suero preparado por el Cuerpo Médico que acelera la regeneración celular. Restaura 55 puntos de Salud.',
    effect: { healHealth: 55, healMental: 5 },
    requirements: { minStrength: 0, minRankOrder: 1 }
  },
  {
    id: 'item_cursed_incense',
    name: 'Incienso de Calma Espiritual',
    category: 'consumible',
    rarity: 'Común',
    price: 7000,
    sellValue: 3500,
    description: 'Aroma herbal empleado tras misiones traumáticas. Restaura 25 puntos de Salud mental.',
    effect: { healMental: 25 },
    requirements: { minStrength: 0, minRankOrder: 0 }
  },
  {
    id: 'item_condensed_ce_pill',
    name: 'Cápsula de Resina Maldita',
    category: 'consumible',
    rarity: 'Común',
    price: 6500,
    sellValue: 3000,
    description: 'Cristal soluble que repone de inmediato 30 puntos de Energía maldita actual (sin efecto en Restricción Celestial).',
    effect: { restoreCursedEnergy: 30 },
    requirements: { minStrength: 0, minRankOrder: 0 }
  },
  {
    id: 'item_grade1_elixir',
    name: 'Elixir de Destilación Oscura',
    category: 'consumible',
    rarity: 'Rara',
    price: 19000,
    sellValue: 9500,
    description: 'Restaura 35 de Salud y 40 de Energía maldita en mitad de una crisis.',
    effect: { healHealth: 35, restoreCursedEnergy: 40 },
    requirements: { minStrength: 0, minRankOrder: 2 }
  },
  {
    id: 'item_tactical_smoke_seal',
    name: 'Sello de Bruma Ocultadora',
    category: 'consumible',
    rarity: 'Común',
    price: 8000,
    sellValue: 4000,
    description: 'En combate, libera una cortina densa que refuerza la defensa temporal y facilita la maniobra.',
    effect: { combatDefenseBoost: 14, healHealth: 12 },
    requirements: { minStrength: 0, minRankOrder: 0 }
  }
];

export function getItemById(id) {
  return ITEMS.find((item) => item.id === id) || null;
}
