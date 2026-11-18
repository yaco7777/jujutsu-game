export const TECHNIQUE_RARITIES = ['Común', 'Rara', 'Especial', 'Heredada'];

export const TECHNIQUES = [
  {
    id: 'divergent_fist',
    name: 'Puño Divergente y Nuevo Estilo de Sombra',
    description: 'Estilo para hechiceros sin técnica innata. Combina el retraso de flujo maldito del Puño Divergente con posturas defensivas y desenvaines del Nuevo Estilo de Sombra.',
    rarity: 'Común',
    isInnate: false,
    ceCost: 8,
    basePower: 18,
    damageModifier: 1.15,
    effectType: 'damage_and_guard',
    defenseBonus: 6,
    scalingStat: 'strength',
    compatibleOrigins: ['common_family', 'clan_zenin', 'clan_gojo', 'clan_kamo', 'cursed_vessel'],
    unlockRequirements: { minControl: 0, minIntelligence: 0 },
    domainName: 'Dominio Simple: Cerco de Batto',
    extensions: [
      {
        id: 'ext_divergent_double_impact',
        name: 'Puño Divergente de Doble Onda',
        description: 'Golpea físicamente primero y libera la oleada de energía maldita un instante después para quebrar la guardia enemiga.',
        unlockMastery: 25,
        minControl: 20,
        ceCost: 13,
        powerMultiplier: 1.35
      },
      {
        id: 'ext_batto_sword_draw',
        name: 'Desenvaine de Sombra: Batto',
        description: 'Recubre la hoja o el antebrazo con energía maldita rotatoria para ejecutar un corte a velocidad fulminante.',
        unlockMastery: 55,
        minControl: 45,
        ceCost: 19,
        powerMultiplier: 1.68
      }
    ]
  },
  {
    id: 'heavenly_restriction_body',
    name: 'Restricción Celestial: Cuerpo Sobrehumano',
    description: 'atadura congénita idéntica a la de Toji Fushiguro y Maki Zenin despertada. Reduce la energía maldita a cero absoluto a cambio de sentidos preternaturales, inmunidad a barreras cerradas y fuerza física devastadora.',
    rarity: 'Especial',
    isInnate: false,
    ceCost: 0,
    basePower: 29,
    damageModifier: 1.45,
    effectType: 'physical_burst',
    defenseBonus: 9,
    scalingStat: 'strength',
    compatibleOrigins: ['heavenly_restriction'],
    unlockRequirements: { minControl: 0, minIntelligence: 0, requiresHeavenlyRestriction: true },
    domainName: 'Anomalía Cero Libre de Barreras',
    extensions: [
      {
        id: 'ext_sky_tread',
        name: 'Salto sobre Superficies de Aire',
        description: 'Lee la temperatura y densidad atmosférica para impulsarse en pleno vuelo y atacar desde puntos ciegos.',
        unlockMastery: 25,
        minControl: 0,
        ceCost: 0,
        powerMultiplier: 1.38
      },
      {
        id: 'ext_soul_split_perception',
        name: 'Percepción del Alma de los Objetos',
        description: 'Percibe el alma incluso de la materia inorgánica para ejecutar un tajo que ignora toda resistencia física o maldita.',
        unlockMastery: 60,
        minControl: 0,
        ceCost: 0,
        powerMultiplier: 1.8
      }
    ]
  },
  {
    id: 'limitless',
    name: 'Infinito (Mukagen)',
    description: 'Técnica heredada suprema del Clan Gojo que lleva al plano físico la paradoja del infinito matemático, dividiendo el espacio interminablemente para detener ataques o colapsar coordenadas.',
    rarity: 'Heredada',
    isInnate: true,
    ceCost: 24,
    basePower: 34,
    damageModifier: 1.6,
    effectType: 'spatial_burst',
    defenseBonus: 12,
    scalingStat: 'cursedEnergyControl',
    compatibleOrigins: ['clan_gojo'],
    unlockRequirements: { minControl: 30, minIntelligence: 25 },
    domainName: 'Vacío Inconmensurable (Vuelo Vacío Mágico)',
    extensions: [
      {
        id: 'ext_lapse_blue',
        name: 'Rotación hacia Adelante: Azul (Ao)',
        description: 'Amplifica el Infinito con números negativos para forzar al espacio a rellenar el vacío con una atracción magnética brutal.',
        unlockMastery: 35,
        minControl: 45,
        ceCost: 28,
        powerMultiplier: 1.48
      },
      {
        id: 'ext_hollow_purple',
        name: 'Vacío Púrpura (Murasaki)',
        description: 'Hace colisionar la atracción de Azul y la repulsión de Rojo para generar una masa imaginaria que borra todo a su paso.',
        unlockMastery: 75,
        minControl: 75,
        ceCost: 38,
        powerMultiplier: 1.98
      }
    ]
  },
  {
    id: 'ten_shadows',
    name: 'Técnica de las Diez Sombras',
    description: 'Técnica heredada atesorada por el Clan Zenin que usa las sombras como intermediario líquido para invocar hasta diez shikigamis distintos y almacenar objetos en la penumbra.',
    rarity: 'Heredada',
    isInnate: true,
    ceCost: 18,
    basePower: 28,
    damageModifier: 1.4,
    effectType: 'tactical_summon',
    defenseBonus: 6,
    scalingStat: 'tacticalIntelligence',
    compatibleOrigins: ['clan_zenin'],
    unlockRequirements: { minControl: 20, minIntelligence: 25 },
    domainName: 'Jardín Sombrío de Quimeras',
    extensions: [
      {
        id: 'ext_divine_dog_totality',
        name: 'Perro Divino: Totalidad y Nue',
        description: 'Combina las garras letales del lobo heredero con la descarga eléctrica alada de Nue en una pinza táctica.',
        unlockMastery: 30,
        minControl: 35,
        ceCost: 24,
        powerMultiplier: 1.42
      },
      {
        id: 'ext_eight_handled_sword_ritual',
        name: 'Invocación Suprema: General Divino',
        description: 'Desata el pináculo ofensivo de las Diez Sombras con una presión abrumadora capaz de adaptarse al combate.',
        unlockMastery: 70,
        minControl: 65,
        ceCost: 35,
        powerMultiplier: 1.88
      }
    ]
  },
  {
    id: 'blood_manipulation',
    name: 'Manipulación de Sangre',
    description: 'Técnica heredada del Clan Kamo que permite controlar cada aspecto de la propia sangre: forma, temperatura, coagulación y velocidad de disparo más allá de la barrera del sonido.',
    rarity: 'Heredada',
    isInnate: true,
    ceCost: 15,
    basePower: 26,
    damageModifier: 1.35,
    effectType: 'blood_art',
    defenseBonus: 6,
    scalingStat: 'cursedEnergyControl',
    compatibleOrigins: ['clan_kamo', 'cursed_vessel'],
    unlockRequirements: { minControl: 20, minIntelligence: 20 },
    domainName: 'Entramado de Arterias Carmesí',
    extensions: [
      {
        id: 'ext_piercing_blood',
        name: 'Sangre Perforante (Senketsu)',
        description: 'Tras comprimir la sangre con Convergencia, dispara un haz hiperveloz que atraviesa blindajes malditos.',
        unlockMastery: 30,
        minControl: 35,
        ceCost: 21,
        powerMultiplier: 1.45
      },
      {
        id: 'ext_flowing_red_scale',
        name: 'Escama Roja Fluyente: Apilamiento',
        description: 'Eleva drásticamente el pulso, la temperatura y el conteo de glóbulos rojos para multiplicar las capacidades físicas.',
        unlockMastery: 60,
        minControl: 55,
        ceCost: 27,
        powerMultiplier: 1.76
      }
    ]
  },
  {
    id: 'projection_sorcery',
    name: 'Hechicería de Proyección (24 Fotogramas)',
    description: 'Técnica heredada empleada en el Clan Zenin que divide un segundo en 24 fotogramas; quien incumpla la trayectoria trazada o las leyes físicas queda congelado en un cuadro durante un segundo.',
    rarity: 'Heredada',
    isInnate: true,
    ceCost: 17,
    basePower: 27,
    damageModifier: 1.38,
    effectType: 'lightning_blitz',
    defenseBonus: 5,
    scalingStat: 'speed',
    compatibleOrigins: ['clan_zenin'],
    unlockRequirements: { minControl: 22, minIntelligence: 22 },
    domainName: 'Celuloide del Palacio Lunar',
    extensions: [
      {
        id: 'ext_frame_freeze',
        name: 'Encuadre de Parálisis en Panel',
        description: 'Toca la guardia del enemigo para encerrarlo en un fotograma bidimensional y quebrarlo de un impacto.',
        unlockMastery: 30,
        minControl: 35,
        ceCost: 23,
        powerMultiplier: 1.42
      },
      {
        id: 'ext_subsonic_stack',
        name: 'Secuencia Acumulada Supersónica',
        description: 'Encadena múltiples secuencias de 24 fotogramas hasta alcanzar una velocidad e inercia devastadoras.',
        unlockMastery: 62,
        minControl: 55,
        ceCost: 29,
        powerMultiplier: 1.78
      }
    ]
  },
  {
    id: 'shrine',
    name: 'Relicario Demoníaco (Mizushi)',
    description: 'La técnica legendaria de Ryomen Sukuna grabada en su recipiente. Combina cortes invisibles a distancia y a quemarropa con la apertura de llamas devastadoras.',
    rarity: 'Especial',
    isInnate: true,
    ceCost: 22,
    basePower: 33,
    damageModifier: 1.58,
    effectType: 'cursed_fire',
    defenseBonus: 6,
    scalingStat: 'strength',
    compatibleOrigins: ['cursed_vessel'],
    unlockRequirements: { minControl: 20, minIntelligence: 18 },
    domainName: 'Relicario Demoníaco (Iluminación Demoniaca)',
    extensions: [
      {
        id: 'ext_dismantle_cleave',
        name: 'Desmantelar y Hender (Kai / Hachi)',
        description: 'Ajusta automáticamente la profundidad del tajo según la dureza y energía maldita del objetivo para partirlo en dos.',
        unlockMastery: 32,
        minControl: 40,
        ceCost: 27,
        powerMultiplier: 1.5
      },
      {
        id: 'ext_furnace_open',
        name: 'Apertura del Horno: Flecha de Fuego (Fuga)',
        description: 'Tras pulverizar el entorno con cortes, pronuncia "Apertura" y moldea una saeta ígnea de destrucción total.',
        unlockMastery: 72,
        minControl: 68,
        ceCost: 36,
        powerMultiplier: 1.95
      }
    ]
  },
  {
    id: 'straw_doll',
    name: 'Técnica del Muñeco de Paja',
    description: 'Técnica tradicional emblemática de Nobara Kugisaki que canaliza energía maldita a través de un martillo, clavos de hierro y efigies de paja para atacar tanto de lejos como directamente al alma.',
    rarity: 'Común',
    isInnate: true,
    ceCost: 13,
    basePower: 22,
    damageModifier: 1.25,
    effectType: 'sonic_damage',
    defenseBonus: 4,
    scalingStat: 'tacticalIntelligence',
    compatibleOrigins: ['common_family', 'clan_zenin', 'clan_kamo', 'cursed_vessel'],
    unlockRequirements: { minControl: 12, minIntelligence: 15 },
    domainName: 'Clavero de Agujas Malditas',
    extensions: [
      {
        id: 'ext_hairpin',
        name: 'Horquilla (Kanzashi)',
        description: 'Hace detonar simultáneamente todos los clavos imbuidos clavados en el enemigo o en el terreno.',
        unlockMastery: 25,
        minControl: 25,
        ceCost: 18,
        powerMultiplier: 1.38
      },
      {
        id: 'ext_resonance',
        name: 'Resonancia (Tomonari)',
        description: 'Atraviesa un vínculo conectado al objetivo para enviar un pico letal de energía directo a su núcleo vital.',
        unlockMastery: 55,
        minControl: 48,
        ceCost: 24,
        powerMultiplier: 1.72
      }
    ]
  },
  {
    id: 'ratio_technique',
    name: 'Técnica de Proporción (7:3)',
    description: 'Técnica característica de Kento Nanami que traza una línea divisoria sobre cualquier objetivo en proporción siete a tres, creando forzosamente un punto crítico al golpear la marca.',
    rarity: 'Rara',
    isInnate: true,
    ceCost: 15,
    basePower: 26,
    damageModifier: 1.36,
    effectType: 'precision_crit',
    defenseBonus: 5,
    scalingStat: 'tacticalIntelligence',
    compatibleOrigins: ['common_family', 'clan_zenin', 'clan_gojo', 'clan_kamo', 'cursed_vessel'],
    unlockRequirements: { minControl: 18, minIntelligence: 24 },
    domainName: 'Compás de la Hora Extra',
    extensions: [
      {
        id: 'ext_ratio_collapse',
        name: 'Extensión de Técnica: Colapso',
        description: 'Aplica la proporción 7:3 al suelo o estructuras circundantes para provocar un derrumbe masivo sobre el rival.',
        unlockMastery: 30,
        minControl: 35,
        ceCost: 21,
        powerMultiplier: 1.43
      },
      {
        id: 'ext_overtime_vow_strike',
        name: 'Ejecución en Hora Extra',
        description: 'Libera el límite autoimpuesto de energía para descargar un tajo crítico al 120 % de potencia.',
        unlockMastery: 60,
        minControl: 55,
        ceCost: 28,
        powerMultiplier: 1.8
      }
    ]
  },
  {
    id: 'boogie_woogie',
    name: 'Boogie Woogie',
    description: 'Técnica táctica de Aoi Todo que intercambia instantáneamente la posición de dos objetivos con energía maldita al dar una palmada, desorientando por completo al adversario.',
    rarity: 'Rara',
    isInnate: true,
    ceCost: 12,
    basePower: 23,
    damageModifier: 1.28,
    effectType: 'control_slash',
    defenseBonus: 8,
    scalingStat: 'tacticalIntelligence',
    compatibleOrigins: ['common_family', 'clan_zenin', 'clan_gojo', 'clan_kamo', 'cursed_vessel'],
    unlockRequirements: { minControl: 15, minIntelligence: 25 },
    domainName: 'Escenario de Aplauso Infinito',
    extensions: [
      {
        id: 'ext_feint_clap',
        name: 'Palmada de Finta Psicológica',
        description: 'Aplaude sin activar el cambio o intercambia con una piedra imbuida para conectar un gancho imbloqueable.',
        unlockMastery: 28,
        minControl: 32,
        ceCost: 17,
        powerMultiplier: 1.38
      },
      {
        id: 'ext_fifty_swaps_combo',
        name: 'Ráfaga de Cincuenta Permutaciones',
        description: 'Encadena intercambios a velocidad vertiginosa bombardeando al enemigo desde todas las direcciones.',
        unlockMastery: 58,
        minControl: 52,
        ceCost: 24,
        powerMultiplier: 1.75
      }
    ]
  },
  {
    id: 'cursed_speech',
    name: 'Discurso Maldito',
    description: 'Técnica heredada del Clan Inumaki que imprime sellos de serpiente y colmillos en la lengua y mejillas para obligar a todo aquel que escuche sus palabras a obedecer la orden maldita.',
    rarity: 'Heredada',
    isInnate: true,
    ceCost: 19,
    basePower: 27,
    damageModifier: 1.38,
    effectType: 'sonic_damage',
    defenseBonus: 4,
    scalingStat: 'cursedEnergyControl',
    compatibleOrigins: ['common_family', 'clan_gojo', 'clan_kamo'],
    unlockRequirements: { minControl: 22, minIntelligence: 20 },
    domainName: 'Catedral del Eco Imperativo',
    extensions: [
      {
        id: 'ext_word_plummet',
        name: 'Palabra de Poder: Aplástate',
        description: 'Proyecta una orden gravitatoria que hunde al enemigo contra el suelo y fractura su postura.',
        unlockMastery: 30,
        minControl: 38,
        ceCost: 24,
        powerMultiplier: 1.44
      },
      {
        id: 'ext_word_blast_away',
        name: 'Palabra Suprema: Explota',
        description: 'Pronuncia un mandato de detonación que desgarra la energía interna del rival a costa de una gran tensión vocal.',
        unlockMastery: 62,
        minControl: 58,
        ceCost: 31,
        powerMultiplier: 1.82
      }
    ]
  },
  {
    id: 'cursed_spirit_manipulation',
    name: 'Manipulación de Espíritus Malditos',
    description: 'Técnica de Grado Especial de Suguru Geto que permite absorber maldiciones derrotadas en orbes oscuros para invocarlas posteriormente como un ejército personal.',
    rarity: 'Especial',
    isInnate: true,
    ceCost: 21,
    basePower: 31,
    damageModifier: 1.5,
    effectType: 'tactical_summon',
    defenseBonus: 8,
    scalingStat: 'tacticalIntelligence',
    compatibleOrigins: ['common_family', 'clan_kamo', 'cursed_vessel'],
    unlockRequirements: { minControl: 26, minIntelligence: 28 },
    domainName: 'Útero de Profusión (Womb Profusion)',
    extensions: [
      {
        id: 'ext_special_grade_legion',
        name: 'Despliegue de Guardia de Grado Especial',
        description: 'Convoca simultáneamente espíritus blindados y ofensivos que saturan el campo de batalla.',
        unlockMastery: 35,
        minControl: 45,
        ceCost: 27,
        powerMultiplier: 1.48
      },
      {
        id: 'ext_maximum_uzumaki',
        name: 'Técnica Máxima: Uzumaki',
        description: 'Condensa decenas de maldiciones en una espiral negra de energía ultra-densa y extrae su técnica.',
        unlockMastery: 72,
        minControl: 68,
        ceCost: 36,
        powerMultiplier: 1.92
      }
    ]
  },
  {
    id: 'idle_transfiguration',
    name: 'Mutación Pasiva (Transfiguración Inerte)',
    description: 'Técnica temible que moldea directamente el contorno del alma propia o ajena, obligando al cuerpo físico a seguir la nueva forma del espíritu.',
    rarity: 'Especial',
    isInnate: true,
    ceCost: 23,
    basePower: 31,
    damageModifier: 1.52,
    effectType: 'control_slash',
    defenseBonus: 9,
    scalingStat: 'cursedEnergyControl',
    compatibleOrigins: ['cursed_vessel', 'common_family'],
    unlockRequirements: { minControl: 28, minIntelligence: 25 },
    domainName: 'Autoencarnación de la Perfección',
    extensions: [
      {
        id: 'ext_soul_multiplicity',
        name: 'Multiplicidad de Almas: Repulsión de Cuerpo',
        description: 'Fusiona almas transfiguradas para lanzar un ataque omnidireccional de alta velocidad.',
        unlockMastery: 34,
        minControl: 44,
        ceCost: 28,
        powerMultiplier: 1.46
      },
      {
        id: 'ext_instant_spirit_body',
        name: 'Cuerpo Espiritual de Matanza Instantánea',
        description: 'Reconfigura la propia alma en una armadura de combate letal con cuchillas en los codos.',
        unlockMastery: 70,
        minControl: 65,
        ceCost: 35,
        powerMultiplier: 1.9
      }
    ]
  },
  {
    id: 'disaster_flames',
    name: 'Llamas del Desastre',
    description: 'Técnica volcánica que genera cráteres en muros y suelo, enjambres explosivos y erupciones de magma que incineran defensas de energía maldita.',
    rarity: 'Especial',
    isInnate: true,
    ceCost: 22,
    basePower: 30,
    damageModifier: 1.48,
    effectType: 'cursed_fire',
    defenseBonus: 5,
    scalingStat: 'strength',
    compatibleOrigins: ['cursed_vessel', 'clan_zenin', 'common_family'],
    unlockRequirements: { minControl: 24, minIntelligence: 20 },
    domainName: 'Ataúd de la Montaña de Hierro',
    extensions: [
      {
        id: 'ext_ember_insects',
        name: 'Insectos de Brasas Explosivas',
        description: 'Lanza proyectiles alados que emiten un chirrido ultrasónico antes de detonar a quemarropa.',
        unlockMastery: 32,
        minControl: 38,
        ceCost: 26,
        powerMultiplier: 1.44
      },
      {
        id: 'ext_maximum_meteor',
        name: 'Técnica Máxima: Meteoro',
        description: 'Reúne una esfera colosal de roca fundida y ceniza ardiente que arrasa todo un sector urbano.',
        unlockMastery: 68,
        minControl: 62,
        ceCost: 35,
        powerMultiplier: 1.88
      }
    ]
  },
  {
    id: 'disaster_tides',
    name: 'Mareas del Desastre',
    description: 'Genera torrentes oceánicos de energía maldita capaces de inundar el terreno, amortiguar impactos con escudos acuáticos y devorar enemigos con bestias abisales.',
    rarity: 'Rara',
    isInnate: true,
    ceCost: 18,
    basePower: 26,
    damageModifier: 1.34,
    effectType: 'fortress_strike',
    defenseBonus: 10,
    scalingStat: 'cursedEnergyControl',
    compatibleOrigins: ['common_family', 'clan_kamo', 'cursed_vessel'],
    unlockRequirements: { minControl: 20, minIntelligence: 18 },
    domainName: 'Horizonte del Skandha Cautivador',
    extensions: [
      {
        id: 'ext_tidal_shield',
        name: 'Anillo de Marea Protectora',
        description: 'Envuelve al usuario en una corriente circular a alta presión que desvía proyectiles y golpes.',
        unlockMastery: 28,
        minControl: 34,
        ceCost: 22,
        powerMultiplier: 1.4
      },
      {
        id: 'ext_death_swarm',
        name: 'Enjambre de la Muerte',
        description: 'Libera un cardumen interminable de shikigamis marinos voraces que desgarran la guardia rival.',
        unlockMastery: 60,
        minControl: 54,
        ceCost: 29,
        powerMultiplier: 1.76
      }
    ]
  },
  {
    id: 'disaster_plants',
    name: 'Plantas del Desastre',
    description: 'Técnica silvestre que hace brotar raíces gigantescas, campos de flores hipnóticas y semillas parásitas que se alimentan de la propia energía maldita del oponente.',
    rarity: 'Rara',
    isInnate: true,
    ceCost: 17,
    basePower: 25,
    damageModifier: 1.32,
    effectType: 'fortress_strike',
    defenseBonus: 9,
    scalingStat: 'tacticalIntelligence',
    compatibleOrigins: ['common_family', 'clan_zenin', 'clan_kamo'],
    unlockRequirements: { minControl: 18, minIntelligence: 20 },
    domainName: 'Mar Brillante de Flores Ceremoniales',
    extensions: [
      {
        id: 'ext_cursed_buds',
        name: 'Brotes Malditos Drenadores',
        description: 'Incrusta semillas que crecen más rápido cuanto más flujo maldito utilice el enemigo para defenderse.',
        unlockMastery: 28,
        minControl: 32,
        ceCost: 22,
        powerMultiplier: 1.4
      },
      {
        id: 'ext_flower_offering_beam',
        name: 'Cañón Floral de Vitalidad Terrestre',
        description: 'Absorbe la energía del entorno en la flor del hombro para disparar un haz concentrado.',
        unlockMastery: 60,
        minControl: 54,
        ceCost: 28,
        powerMultiplier: 1.75
      }
    ]
  },
  {
    id: 'copy_rika',
    name: 'Imitación Incondicional y Reina de las Maldiciones',
    description: 'Técnica de Grado Especial de Yuta Okkotsu respaldada por la manifestación de Rika: permite almacenar herramientas, reponer reservas inmensas de energía y replicar técnicas observadas.',
    rarity: 'Especial',
    isInnate: true,
    ceCost: 24,
    basePower: 33,
    damageModifier: 1.56,
    effectType: 'spatial_burst',
    defenseBonus: 10,
    scalingStat: 'cursedEnergyControl',
    compatibleOrigins: ['clan_gojo', 'common_family', 'cursed_vessel'],
    unlockRequirements: { minControl: 28, minIntelligence: 25 },
    domainName: 'Amor Verdadero y Mutuo',
    extensions: [
      {
        id: 'ext_five_minute_manifestation',
        name: 'Conexión del Anillo: Manifestación Completa',
        description: 'Despliega toda la potencia de la Reina de las Maldiciones y el arsenal de técnicas copiadas.',
        unlockMastery: 36,
        minControl: 46,
        ceCost: 29,
        powerMultiplier: 1.5
      },
      {
        id: 'ext_pure_love_beam',
        name: 'Cañón de Energía Maldita Pura',
        description: 'Libera un disparo masivo de energía condensada capaz de superar técnicas máximas rivales.',
        unlockMastery: 72,
        minControl: 70,
        ceCost: 37,
        powerMultiplier: 1.94
      }
    ]
  },
  {
    id: 'star_rage',
    name: 'Furia Estelar (Bomba-Ba-Ye)',
    description: 'Técnica de Grado Especial de Yuki Tsukumo que añade masa virtual tanto al propio cuerpo como a su shikigami Garuda, otorgando una potencia de impacto que ignora conceptos defensivos.',
    rarity: 'Especial',
    isInnate: true,
    ceCost: 22,
    basePower: 32,
    damageModifier: 1.54,
    effectType: 'gravity_crush',
    defenseBonus: 7,
    scalingStat: 'strength',
    compatibleOrigins: ['common_family', 'clan_gojo', 'clan_zenin'],
    unlockRequirements: { minControl: 26, minIntelligence: 24 },
    domainName: 'Horizonte de Masa Virtual',
    extensions: [
      {
        id: 'ext_garuda_rebound',
        name: 'Disparo Balístico con Garuda',
        description: 'Imbuye masa virtual extrema en Garuda y lo patea como un proyectil que perfora cualquier barrera.',
        unlockMastery: 34,
        minControl: 42,
        ceCost: 27,
        powerMultiplier: 1.48
      },
      {
        id: 'ext_singularity_mass',
        name: 'Sobrecarga de Densidad Planetaria',
        description: 'Acumula masa imaginaria hasta el límite crítico donde la gravedad comienza a colapsar el espacio.',
        unlockMastery: 70,
        minControl: 66,
        ceCost: 35,
        powerMultiplier: 1.9
      }
    ]
  },
  {
    id: 'ice_formation',
    name: 'Formación de Hielo',
    description: 'Técnica ancestral de enfriamiento extremo que congela instantáneamente la humedad y la energía circundante para atrapar y quebrar como cristal a los oponentes.',
    rarity: 'Rara',
    isInnate: true,
    ceCost: 18,
    basePower: 27,
    damageModifier: 1.37,
    effectType: 'control_slash',
    defenseBonus: 8,
    scalingStat: 'cursedEnergyControl',
    compatibleOrigins: ['common_family', 'clan_kamo', 'clan_gojo', 'cursed_vessel'],
    unlockRequirements: { minControl: 22, minIntelligence: 20 },
    domainName: 'Calma Invernal Absoluta',
    extensions: [
      {
        id: 'ext_frost_calm',
        name: 'Calma Helada (Shimofuri)',
        description: 'Exhala una neblina bajo cero que recubre al enemigo en un bloque de hielo macizo antes de destrozarlo.',
        unlockMastery: 30,
        minControl: 36,
        ceCost: 23,
        powerMultiplier: 1.43
      },
      {
        id: 'ext_icefall',
        name: 'Cascada Glacial (Hyobaku)',
        description: 'Levanta estalactitas gigantescas y las abate en lluvia continua sobre todo el campo de batalla.',
        unlockMastery: 62,
        minControl: 56,
        ceCost: 30,
        powerMultiplier: 1.79
      }
    ]
  },
  {
    id: 'mythical_beast_amber',
    name: 'Bestia Mítica Ámbar y Rasgo Eléctrico',
    description: 'Técnica de Hajime Kashimo cuya energía maldita posee la naturaleza de la electricidad constante; separa cargas positivas y negativas para garantizar un rayo certero sin necesidad de dominio.',
    rarity: 'Especial',
    isInnate: true,
    ceCost: 20,
    basePower: 31,
    damageModifier: 1.5,
    effectType: 'lightning_blitz',
    defenseBonus: 5,
    scalingStat: 'speed',
    compatibleOrigins: ['common_family', 'clan_zenin', 'cursed_vessel'],
    unlockRequirements: { minControl: 24, minIntelligence: 20 },
    domainName: 'Jaula Fulgurante del Dios del Trueno',
    extensions: [
      {
        id: 'ext_sure_hit_lightning',
        name: 'Descarga de Retorno Garantizado',
        description: 'Acumula carga positiva en el rival durante el cuerpo a cuerpo y libera un relámpago imposible de esquivar.',
        unlockMastery: 32,
        minControl: 40,
        ceCost: 26,
        powerMultiplier: 1.48
      },
      {
        id: 'ext_amber_release',
        name: 'Liberación: Bestia Mítica Ámbar',
        description: 'Reconstruye el cuerpo con electricidad pura para superar los límites neurológicos y vaporizar con ondas electromagnéticas.',
        unlockMastery: 70,
        minControl: 64,
        ceCost: 35,
        powerMultiplier: 1.9
      }
    ]
  }
];

export const RARITY_WEIGHTS = {
  Común: 60,
  Rara: 26,
  Heredada: 9,
  Especial: 5
};

export function getTechniqueById(id) {
  return TECHNIQUES.find((tech) => tech.id === id) || TECHNIQUES[0];
}

export function getAvailableTechniquesForOrigin(originId) {
  if (originId === 'heavenly_restriction') {
    return TECHNIQUES.filter((tech) => tech.id === 'heavenly_restriction_body');
  }
  return TECHNIQUES.filter((tech) => tech.compatibleOrigins.includes(originId));
}

export function getTechniqueDropWeight(tech) {
  if (!tech) return 1;
  const rarityWeight = RARITY_WEIGHTS[tech.rarity] || 10;
  // Entre mayor sea basePower y damageModifier, menor es su peso relativo dentro de su categoría
  const powerPenalty = Math.max(1, (tech.basePower || 20) * (tech.damageModifier || 1.2) * 0.35);
  return Math.max(0.8, Number((rarityWeight * (12 / powerPenalty)).toFixed(2)));
}

export function rollWeightedTechniqueForOrigin(originId, rng = Math.random) {
  const pool = getAvailableTechniquesForOrigin(originId);
  if (pool.length === 0) {
    return { technique: TECHNIQUES[0], probabilityPercent: 100 };
  }
  if (pool.length === 1) {
    return { technique: pool[0], probabilityPercent: 100 };
  }

  const weights = pool.map((t) => getTechniqueDropWeight(t));
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let roll = rng() * totalWeight;

  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      const probabilityPercent = Number(((weights[i] / totalWeight) * 100).toFixed(1));
      return { technique: pool[i], probabilityPercent };
    }
  }

  const lastIdx = pool.length - 1;
  return {
    technique: pool[lastIdx],
    probabilityPercent: Number(((weights[lastIdx] / totalWeight) * 100).toFixed(1))
  };
}
