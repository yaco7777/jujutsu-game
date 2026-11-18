export const EVENTS = [
  {
    id: 'evt_00a_first_steps',
    title: 'Sombras junto a la Cuna',
    narrative: 'Apenas das tus primeros pasos en el hogar familiar cuando una pequeña maldición doméstica se desliza por el tatami atraída por tu flujo vital. Tus padres contienen el aliento desde el umbral para observar cómo reacciona tu instinto infantil ante lo invisible.',
    conditions: { minAge: 1, maxAge: 4, once: true },
    choices: [
      {
        id: 'c1_stare_down',
        label: 'Mirar fijamente a la criatura sin llorar hasta que retroceda ante tu presencia',
        conditions: {},
        effects: {
          stats: { mentalHealth: 4, cursedEnergyControl: 2, prestige: 2 },
          log: 'Mantuviste la mirada sin temor. Tus padres comprendieron que posees ojos para ver el otro lado.'
        }
      },
      {
        id: 'c2_grab_and_crush',
        label: 'Aferrar al pequeño espíritu con tus manos e instinto físico',
        conditions: {},
        effects: {
          stats: { strength: 2, speed: 2 },
          mastery: 2,
          log: 'Aplastaste la larva maldita por puro reflejo físico ante el asombro de tu familia.'
        }
      },
      {
        id: 'c3_call_parents',
        label: 'Señalar el rincón oscuro para alertar a tus padres',
        conditions: {},
        effects: {
          stats: { tacticalIntelligence: 3, popularity: 2 },
          log: 'Advertiste del peligro con sorprendente claridad para tu corta edad.'
        }
      }
    ]
  },
  {
    id: 'evt_00b_technique_awakening_5yo',
    title: 'La Edad del Despertar (5-6 Años)',
    narrative: 'En el mundo del jujutsu, entre los cinco y los seis años de edad el destino grabado en el cerebro de un niño sale a la luz. Durante una tarde de tormenta en el patio familiar, el aire alrededor de tus manos comienza a vibrar con una firma inconfundible.',
    conditions: { minAge: 5, maxAge: 7, once: true },
    choices: [
      {
        id: 'c1_embrace_spark',
        label: 'Dejar que la energía fluya libremente para manifestar tu técnica por primera vez',
        conditions: {},
        effects: {
          stats: { cursedEnergyControl: 4, prestige: 4 },
          mastery: 5,
          relationships: { npc_satoru_gojo: { respect: 5 } },
          log: 'Tu técnica despertó con un destello nítido. Los observadores registraron tu nombre en los archivos de hechicería.'
        }
      },
      {
        id: 'c2_heavenly_body_spark',
        label: '[Restricción Celestial] Demostrar que, sin energía maldita, puedes partir una roca del jardín de un golpe',
        conditions: { requiresHeavenlyRestriction: true },
        effects: {
          stats: { strength: 5, speed: 4, prestige: 4 },
          mastery: 5,
          relationships: { npc_maki_zenin: { respect: 8, friendship: 5 } },
          log: 'Tu cuerpo libre de energía maldita demostró una potencia física impropia de la infancia.'
        }
      },
      {
        id: 'c3_careful_containment',
        label: 'Concentrarte en respirar despacio para que el despertar no dañe la casa',
        conditions: {},
        effects: {
          stats: { tacticalIntelligence: 3, cursedEnergyControl: 3, mentalHealth: 3 },
          mastery: 3,
          log: 'Controlaste el despertar de tu don sin causar destrozos en el hogar familiar.'
        }
      }
    ]
  },
  {
    id: 'evt_00c_window_vision',
    title: 'El Espíritu del Parque Vecinal',
    narrative: 'Mientras juegas en tu región natal, notas una masa viscosa adherida al columpio oxidado de un parque infantil. Los demás niños no pueden verla, pero tú sientes cómo drena la vitalidad de quien se acerca.',
    conditions: { minAge: 6, maxAge: 11 },
    choices: [
      {
        id: 'c1_exorcise_minor',
        label: 'Enfrentarte a la maldición menor antes de que lastime a otros niños',
        conditions: {},
        effects: {
          stats: { prestige: 3, popularity: 3 },
          mastery: 3,
          log: 'Decidiste plantar cara al espíritu del parque por tu cuenta.',
          combatEnemy: {
            id: 'evt_enemy_park_larva',
            name: 'Larva Maldita del Columpio',
            grade: 'grado_4',
            gradeOrder: 0,
            maxHealth: 42,
            attack: 8,
            defense: 3,
            speed: 8,
            specialName: 'Miasma Pegajoso',
            specialPower: 11,
            specialChance: 0.2
          }
        }
      },
      {
        id: 'c2_warn_kids',
        label: 'Inventar un juego en otra zona para alejar a todos del peligro sin combatir',
        conditions: {},
        effects: {
          stats: { tacticalIntelligence: 3, popularity: 4, mentalHealth: 2 },
          log: 'Guiaste a los demás lejos del columpio hasta que un supervisor limpió la zona.'
        }
      },
      {
        id: 'c3_study_residue',
        label: 'Observar a distancia cómo se mueve la energía residual de la maldición',
        conditions: {},
        effects: {
          stats: { cursedEnergyControl: 3, tacticalIntelligence: 2 },
          log: 'Aprendiste a distinguir los residuos malditos de las maldiciones activas.'
        }
      }
    ]
  },
  {
    id: 'evt_00d_childhood_mentor',
    title: 'La Visita del Hechicero de Grado Especial',
    narrative: 'Un hombre alto con gafas oscuras —Satoru Gojo— o un enviado del colegio técnico se detiene frente a tu casa tras percibir tu potencial desde el otro extremo de la calle. Te lanza una moneda imbuida en energía maldita para ver tus reflejos.',
    conditions: { minAge: 8, maxAge: 13, once: true },
    choices: [
      {
        id: 'c1_catch_coin',
        label: 'Atrapar la moneda en el aire recubriendo tus dedos con flujo maldito',
        conditions: {},
        effects: {
          stats: { speed: 3, cursedEnergyControl: 3, prestige: 5 },
          relationships: { npc_satoru_gojo: { friendship: 10, respect: 8 } },
          log: 'Atrapaste la moneda al vuelo. Satoru Gojo sonrió y prometió seguir tu crecimiento de cerca.'
        }
      },
      {
        id: 'c2_ask_questions',
        label: 'Preguntarle sobre las barreras, los votos vinculantes y el mundo de los hechiceros',
        conditions: {},
        effects: {
          stats: { tacticalIntelligence: 4, cursedEnergyControl: 2 },
          relationships: {
            npc_satoru_gojo: { friendship: 6, respect: 6 },
            npc_kento_nanami: { respect: 6 }
          },
          log: 'Tu curiosidad táctica dejó una excelente impresión en los mentores.'
        }
      },
      {
        id: 'c3_ask_stipend',
        label: 'Pedir apoyo económico anticipado para aliviar los gastos de tu familia',
        conditions: {},
        effects: {
          money: 12000,
          stats: { mentalHealth: 4, higherUpsRelation: 3 },
          log: 'Gestionaste una beca preparatoria de 12.000 ¥ para tu familia.'
        }
      }
    ]
  },
  {
    id: 'evt_00e_pre_academy_trial',
    title: 'Entrenamiento Juvenil de Pre-Ingreso',
    narrative: 'A medida que te acercas a la adolescencia, la presión de los clanes y la actividad de maldiciones en tu región aumentan. Debes decidir en qué enfocar tus años previos a la mayoría de edad de hechicería.',
    conditions: { minAge: 10, maxAge: 14 },
    choices: [
      {
        id: 'c1_martial_focus',
        label: 'Entrenar artes marciales y resistencia junto a Maki Zenin y Yuji Itadori',
        conditions: {},
        effects: {
          stats: { strength: 3, speed: 3, health: 5 },
          relationships: {
            npc_maki_zenin: { friendship: 6, respect: 5 },
            npc_yuji_itadori: { friendship: 6 }
          },
          log: 'Fortaleciste tu base física con sesiones marciales exigentes.'
        }
      },
      {
        id: 'c2_shadow_study',
        label: 'Practicar lectura táctica y control con Megumi Fushiguro y Noritoshi Kamo',
        conditions: {},
        effects: {
          stats: { tacticalIntelligence: 3, cursedEnergyControl: 3 },
          mastery: 3,
          relationships: {
            npc_megumi_fushiguro: { friendship: 6, respect: 5 },
            npc_noritoshi_kamo: { friendship: 5, respect: 5 }
          },
          log: 'Afinaste tu criterio táctico antes de cumplir los quince años.'
        }
      },
      {
        id: 'c3_part_time_window',
        label: 'Trabajar como informante de "Ventana" localizando rastros malditos',
        conditions: {},
        effects: {
          money: 9000,
          stats: { higherUpsRelation: 4, prestige: 2 },
          log: 'Tus reportes precisos como Ventana te ganaron un estipendio de 9.000 ¥.'
        }
      }
    ]
  },
  {
    id: 'evt_00f_fourteen_crossroads',
    title: 'La Carta Sellada en Vísperas de los Quince',
    narrative: 'En la víspera de tus quince años llega un sobre lacrado con el emblema en espiral de la Escuela Técnica de Hechicería. Ha llegado el momento de dejar atrás la infancia y entrar de lleno en el campo de batalla.',
    conditions: { minAge: 14, maxAge: 14, once: true },
    choices: [
      {
        id: 'c1_accept_eagerly',
        label: 'Romper el lacre y jurar convertirte en el hechicero más fuerte de tu era',
        conditions: {},
        effects: {
          stats: { prestige: 5, strength: 2, cursedEnergyControl: 2 },
          mastery: 4,
          log: 'Firmaste tu ingreso con determinación absoluta.'
        }
      },
      {
        id: 'c2_prepare_gear',
        label: 'Invertir tus ahorros y prepararte metódicamente con suministros médicos',
        conditions: {},
        effects: {
          addItem: 'item_medical_pack',
          stats: { tacticalIntelligence: 3, mentalHealth: 4 },
          log: 'Preparaste tu equipo médico y táctico antes de cruzar las puertas del colegio.'
        }
      },
      {
        id: 'c3_farewell_family',
        label: 'Pasar la última noche en paz con tus padres para blindar tu corazón',
        conditions: {},
        effects: {
          stats: { mentalHealth: 10, popularity: 4 },
          log: 'El abrazo de tus padres fortaleció tu espíritu para las pruebas venideras.'
        }
      }
    ]
  },
  {
    id: 'evt_01_entrance_curtain',
    title: 'La Prueba del Director Yaga y el Primer Velo',
    narrative: 'La lluvia golpea los tejados del colegio técnico mientras Masamichi Yaga y Satoru Gojo observan tu ingreso. Antes siquiera de dejar tu equipaje, un cuerpo maldito agresivo y una maldición cautiva son liberados en el patio para comprobar si luchas por convicción propia o por obligación ajena.',
    conditions: { minAge: 15, maxAge: 17, once: true },
    choices: [
      {
        id: 'c1_analyze',
        label: '[Inteligencia táctica 25+] Analizar el núcleo del cuerpo maldito y golpear su punto ciego',
        conditions: { minIntelligence: 25 },
        effects: {
          stats: { tacticalIntelligence: 4, prestige: 5, higherUpsRelation: 3 },
          mastery: 4,
          relationships: {
            npc_masamichi_yaga: { respect: 9, friendship: 4 },
            npc_megumi_fushiguro: { respect: 6, friendship: 3 }
          },
          log: 'Identificaste el núcleo principal en segundos. Masamichi Yaga y Megumi Fushiguro reconocieron tu sangre fría.'
        }
      },
      {
        id: 'c2_heavenly_rush',
        label: '[Restricción Celestial] Destrozar la urna y al espíritu de un solo embate físico sin rastro maldito',
        conditions: { requiresHeavenlyRestriction: true },
        effects: {
          stats: { strength: 5, speed: 4, prestige: 7 },
          relationships: {
            npc_maki_zenin: { respect: 12, friendship: 6 },
            npc_satoru_gojo: { respect: 8 }
          },
          log: 'Los sensores del velo ni siquiera te detectaron antes de que el espíritu estallara contra el muro. Maki Zenin sonrió con orgullo.'
        }
      },
      {
        id: 'c3_direct_clash',
        label: 'Avanzar de frente junto a Yuji Itadori y entablar combate real para demostrar tu determinación',
        conditions: {},
        effects: {
          stats: { prestige: 4, strength: 2 },
          relationships: { npc_yuji_itadori: { friendship: 8, respect: 5 } },
          log: 'Decidiste enfrentarte al espíritu de prueba sin retroceder un solo paso.',
          combatEnemy: {
            id: 'evt_enemy_urn_spirit',
            name: 'Espíritu Cautivo del Patio Técnico',
            grade: 'grado_4',
            gradeOrder: 0,
            maxHealth: 62,
            attack: 12,
            defense: 5,
            speed: 12,
            specialName: 'Garra de Ceniza Húmeda',
            specialPower: 16,
            specialChance: 0.25
          }
        }
      },
      {
        id: 'c4_defensive_wait',
        label: 'Mantener guardia defensiva y priorizar tu integridad hasta que termine la evaluación',
        conditions: {},
        effects: {
          stats: { cursedEnergyControl: 3, mentalHealth: 3, prestige: -2 },
          relationships: { npc_kento_nanami: { respect: 4 } },
          log: 'Superaste la prueba sin un rasguño; Kento Nanami valoró tu prudencia.'
        }
      }
    ]
  },
  {
    id: 'evt_02_midnight_archive',
    title: 'Almacén Sellado de las Bóvedas Estelares',
    narrative: 'Durante una guardia nocturna descubres que uno de los corredores subterráneos del almacén de objetos malditos ha quedado sin custodios. En el interior reposan tratados antiguos sobre votos vinculantes, registros sobre Ryomen Sukuna y expedientes clasificados por Yoshinobu Gakuganji.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_study_treatise',
        label: '[Inteligencia táctica 30+] Descifrar los diagramas de flujo y copiar las notas clave sin activar las alarmas',
        conditions: { minIntelligence: 30 },
        effects: {
          stats: { cursedEnergyControl: 6, tacticalIntelligence: 5, mentalHealth: -3 },
          mastery: 6,
          relationships: { npc_satoru_gojo: { friendship: 5, respect: 5 } },
          log: 'Memorizaste tratados de control avanzado antes del cambio de guardia.'
        }
      },
      {
        id: 'c2_binding_vow_archive',
        label: '[Voto Vinculante] Jurar secreto absoluto a cambio de absorber la resonancia de un pergamino antiguo (-8 Salud, +8 Control y Maestría)',
        conditions: { isBindingVow: true },
        effects: {
          stats: { health: -8, cursedEnergyControl: 8, maxCursedEnergy: 5, mentalHealth: -5 },
          mastery: 8,
          log: 'Sellaste un voto de silencio con tinta maldita: tu comprensión del flujo creció a costa de un agudo desgaste físico.'
        }
      },
      {
        id: 'c3_report_gakuganji',
        label: 'Cerrar la cámara e informar inmediatamente al Director Yoshinobu Gakuganji',
        conditions: {},
        effects: {
          stats: { higherUpsRelation: 8, prestige: 3 },
          relationships: { npc_yoshinobu_gakuganji: { respect: 9, friendship: 4 } },
          log: 'Reportaste la brecha de seguridad. El consejo conservador tomó nota de tu obediencia institucional.'
        }
      },
      {
        id: 'c4_sell_copy_meimei',
        label: 'Fotografiar el inventario de reliquias y negociar una comisión con Mei Mei',
        conditions: {},
        effects: {
          money: 18000,
          stats: { higherUpsRelation: -7, threatLevel: 5 },
          relationships: { npc_mei_mei: { friendship: 8, respect: 6 } },
          log: 'Vendiste información estratégica a la red financiera de Mei Mei por una suma considerable.'
        }
      }
    ]
  },
  {
    id: 'evt_03_clan_envoy',
    title: 'Delegación de las Tres Grandes Familias',
    narrative: 'Una comitiva encabezada por Naobito Zenin y Noritoshi Kamo llega al pabellón principal mientras Satoru Gojo aparece con las manos en los bolsillos. Los clanes evalúan a la nueva generación y ofrecen patrocinios condicionados a quienes respalden sus intereses políticos.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_accept_patronage',
        label: 'Aceptar el patrocinio político y comprometerte a respaldar sus mociones tradicionales',
        conditions: {},
        effects: {
          money: 22000,
          stats: { higherUpsRelation: 7, prestige: 4, popularity: -5 },
          relationships: {
            npc_noritoshi_kamo: { friendship: 6, respect: 5 },
            npc_naobito_zenin: { respect: 6 }
          },
          log: 'Recibiste fondos de patrocinio de las familias conservadoras, aunque algunos compañeros desconfían de tu cercanía al consejo.'
        }
      },
      {
        id: 'c2_challenge_zenin',
        label: 'Rechazar el dinero y retar a Maki Zenin y Naobito a una demostración marcial en el patio',
        conditions: {},
        effects: {
          stats: { prestige: 7, strength: 3, higherUpsRelation: -3 },
          relationships: {
            npc_maki_zenin: { respect: 9, friendship: 5 },
            npc_naobito_zenin: { respect: 7, rivalry: 8 }
          },
          log: 'Tu desafío público encendió el espíritu competitivo de Maki y captó la atención de Naobito Zenin.'
        }
      },
      {
        id: 'c3_gojo_mock',
        label: 'Unirte a Satoru Gojo y Nobara Kugisaki para ridiculizar el protocolo arcaico de los ancianos',
        conditions: {},
        effects: {
          stats: { popularity: 8, mentalHealth: 5, higherUpsRelation: -8 },
          relationships: {
            npc_satoru_gojo: { friendship: 10, respect: 6 },
            npc_nobara_kugisaki: { friendship: 8 }
          },
          log: 'Los emisarios se marcharon furiosos mientras Gojo y Nobara celebraban tu falta de reverencia.'
        }
      }
    ]
  },
  {
    id: 'evt_04_black_market_broker',
    title: 'Subasta Clandestina de Herramientas Malditas',
    narrative: 'En una galería privada de Shinjuku, Mei Mei supervisa una subasta de herramientas malditas y talismanes confiscados. Te indica un lote reservado que podría marcar la diferencia entre la vida y la muerte en tu próxima misión.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_buy_weapon_lot',
        label: '[Pagar 15.000 ¥] Adquirir una Daga de Exorcismo Templada a precio preferencial',
        conditions: { minMoney: 15000 },
        effects: {
          money: -15000,
          addItem: 'item_slaughter_dagger',
          stats: { prestige: 2 },
          relationships: { npc_mei_mei: { friendship: 6, respect: 4 } },
          log: 'Compraste una Daga de Exorcismo Templada gracias a los contactos de Mei Mei.'
        }
      },
      {
        id: 'c2_buy_elixir_lot',
        label: '[Pagar 10.000 ¥] Comprar una Ampolla de Catalizador Inverso preparada por Shoko Ieiri',
        conditions: { minMoney: 10000 },
        effects: {
          money: -10000,
          addItem: 'item_rct_ampoule',
          relationships: { npc_shoko_ieiri: { friendship: 4 } },
          log: 'Aseguraste un suero médico de alta pureza para emergencias.'
        }
      },
      {
        id: 'c3_raid_auction',
        label: 'Denunciar al traficante infiltrado y enfrentarte a su guardaespaldas usuario maldito',
        conditions: {},
        effects: {
          stats: { higherUpsRelation: 6, prestige: 5 },
          relationships: { npc_kento_nanami: { respect: 7 } },
          log: 'Interviniste para confiscar el cargamento ilegal por la fuerza.',
          combatEnemy: {
            id: 'evt_enemy_smuggler_guard',
            name: 'Mercenario de la Subasta Subterránea',
            grade: 'grado_3',
            gradeOrder: 1,
            maxHealth: 98,
            attack: 18,
            defense: 9,
            speed: 17,
            specialName: 'Mazazo de Hierro Sellado',
            specialPower: 24,
            specialChance: 0.3
          }
        }
      },
      {
        id: 'c4_observe_only',
        label: 'Analizar las cotizaciones del mercado con Mei Mei y retirarte sin gastar fondos',
        conditions: {},
        effects: {
          stats: { tacticalIntelligence: 3 },
          relationships: { npc_mei_mei: { respect: 3 } },
          log: 'Tomaste nota de los precios y contactos del mercado sin comprometer tu capital.'
        }
      }
    ]
  },
  {
    id: 'evt_05_vessel_tremor',
    title: 'Resonancia del Rey de las Maldiciones',
    narrative: 'A mitad de la noche despiertas con un frío sepulcral y la visión de un trono de cráneos reflejado en el agua. La presencia de Ryomen Sukuna vibra a través de las reliquias selladas, tentando tu ambición con poder inmediato a cambio de ceder control.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_suppress_control',
        label: '[Control 30+] Reforzar las barreras del alma junto a Yuji Itadori y Megumi Fushiguro',
        conditions: { minControl: 30 },
        effects: {
          stats: { cursedEnergyControl: 6, mentalHealth: 4, prestige: 3 },
          vesselRisk: -10,
          relationships: {
            npc_yuji_itadori: { friendship: 7, respect: 6 },
            npc_ryomen_sukuna: { rivalry: 8 }
          },
          log: 'Sometiste la resonancia maldita con pura disciplina espiritual.'
        }
      },
      {
        id: 'c2_technique_blood',
        label: '[Técnica: Manipulación de Sangre] Purgar la presión maldita acelerando tu pulso con Escama Roja',
        conditions: { requiresTechnique: 'blood_manipulation' },
        effects: {
          stats: { cursedEnergyControl: 5, strength: 4, health: -5 },
          mastery: 7,
          relationships: { npc_noritoshi_kamo: { respect: 7 } },
          log: 'Tu control sanguíneo neutralizó la intrusión y perfeccionó tu dominio técnico.'
        }
      },
      {
        id: 'c3_accept_whisper',
        label: '[Voto Vinculante] Aceptar el pacto de Sukuna: gran oleada de poder a cambio de elevar tu Nivel de Amenaza',
        conditions: { isBindingVow: true },
        effects: {
          stats: { maxCursedEnergy: 10, cursedEnergy: 15, strength: 5, threatLevel: 16, higherUpsRelation: -10, mentalHealth: -8 },
          vesselRisk: 18,
          mastery: 8,
          relationships: {
            npc_ryomen_sukuna: { respect: 12, friendship: 5 },
            npc_yoshinobu_gakuganji: { rivalry: 12 }
          },
          log: 'Dejaste que el Relicario inundara tus canales. Tu poder creció, pero el consejo detectó la anomalía.'
        }
      },
      {
        id: 'c4_medical_ward',
        label: 'Acudir de urgencia a la enfermería de Shoko Ieiri para estabilizar tu flujo',
        conditions: {},
        effects: {
          stats: { health: 10, mentalHealth: 6 },
          vesselRisk: -6,
          relationships: { npc_shoko_ieiri: { friendship: 7, respect: 5 } },
          log: 'Shoko Ieiri aplicó sellos de contención médica y estabilizó tu energía.'
        }
      }
    ]
  },
  {
    id: 'evt_06_rainy_shibuya_patrol',
    title: 'Cortina Hostil en el Cruce de Shibuya',
    narrative: 'Mientras patrullas bajo la lluvia torrencial con Toge Inumaki y Panda, los semáforos de una avenida de Shibuya parpadean y decenas de civiles quedan atrapados dentro de una cortina. Un usuario maldito afín a Suguru Geto intenta recolectar energía antes de que lleguen refuerzos.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_amber_intercept',
        label: '[Técnica: Bestia Mítica Ámbar y Rasgo Eléctrico] Cruzar la avenida en una centella y fulminar al agresor',
        conditions: { requiresTechnique: 'mythical_beast_amber' },
        effects: {
          stats: { speed: 5, prestige: 8, popularity: 6 },
          mastery: 7,
          money: 12000,
          log: 'Tu descarga eléctrica de retorno garantizado abatió al agresor en un parpadeo.'
        }
      },
      {
        id: 'c2_engage_curse_user',
        label: 'Entrar en la cortina y batirte en duelo directo para proteger a los civiles',
        conditions: {},
        effects: {
          stats: { prestige: 6, popularity: 5 },
          relationships: { npc_panda: { friendship: 6 }, npc_toge_inumaki: { friendship: 6 } },
          log: 'Te interpusiste entre los civiles y el usuario maldito.',
          combatEnemy: {
            id: 'evt_enemy_avenue_collector',
            name: 'Usuario Maldito del Cruce de Shibuya',
            grade: 'grado_3',
            gradeOrder: 1,
            maxHealth: 102,
            attack: 19,
            defense: 10,
            speed: 19,
            specialName: 'Aguja de Drenaje Gris',
            specialPower: 25,
            specialChance: 0.3
          }
        }
      },
      {
        id: 'c3_evacuate_civilians',
        label: '[Sacrificar 20 de Energía Maldita] Desplegar un corredor protector junto a Toge Inumaki para evacuar civiles',
        conditions: { minCursedEnergy: 20 },
        effects: {
          stats: { cursedEnergy: -20, cursedEnergyControl: 5, popularity: 8, higherUpsRelation: 4 },
          relationships: { npc_toge_inumaki: { friendship: 8, respect: 6 } },
          log: 'Agotaste tus reservas para abrir un corredor seguro y salvar a todos los civiles.'
        }
      },
      {
        id: 'c4_wait_backup',
        label: 'Mantener el perímetro exterior y esperar la llegada de Kento Nanami',
        conditions: {},
        effects: {
          stats: { tacticalIntelligence: 2, popularity: -4, prestige: -2 },
          relationships: { npc_kento_nanami: { respect: 3 } },
          log: 'Esperaste a los refuerzos de Grado 1. La amenaza fue contenida, pero hubo daños materiales.'
        }
      }
    ]
  },
  {
    id: 'evt_07_sister_school_scrimmage',
    title: 'Festival de Intercambio con las Escuelas Hermanas',
    narrative: 'Las delegaciones de Tokio y Kioto se enfrentan en el bosque del colegio técnico. Aoi Todo ruge en primera línea buscando un rival digno mientras Mai Zenin, Kasumi Miwa y Noritoshi Kamo toman posiciones estratégicas entre la arboleda.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_duel_todo',
        label: 'Aceptar el desafío directo de Aoi Todo en la vanguardia del bosque',
        conditions: {},
        effects: {
          stats: { prestige: 8, popularity: 7, strength: 3 },
          relationships: {
            npc_aoi_todo: { friendship: 12, respect: 12, rivalry: 8 },
            npc_yuji_itadori: { friendship: 6 }
          },
          log: 'Chocaste los puños en la vanguardia del Festival de Intercambio.',
          combatEnemy: {
            id: 'evt_enemy_exchange_champion',
            name: 'Vanguardia de Élite de Kioto',
            grade: 'semi_grado_2',
            gradeOrder: 2,
            maxHealth: 128,
            attack: 23,
            defense: 13,
            speed: 24,
            specialName: 'Impacto de Palmada Desorientadora',
            specialPower: 30,
            specialChance: 0.32
          }
        }
      },
      {
        id: 'c2_tactical_command',
        label: '[Inteligencia táctica 35+] Coordinar a Megumi, Panda y Nobara para desarticular la formación de Kioto',
        conditions: { minIntelligence: 35 },
        effects: {
          stats: { tacticalIntelligence: 6, prestige: 8, higherUpsRelation: 6 },
          relationships: {
            npc_megumi_fushiguro: { respect: 9, friendship: 5 },
            npc_nobara_kugisaki: { friendship: 7 },
            npc_mai_zenin: { rivalry: 8 }
          },
          log: 'Tu plan de emboscada desarticuló por completo la formación de Kioto.'
        }
      },
      {
        id: 'c3_ten_shadows_ambush',
        label: '[Técnica: Técnica de las Diez Sombras] Desplegar a Nue y Perros Divinos por la penumbra del bosque',
        conditions: { requiresTechnique: 'ten_shadows' },
        effects: {
          stats: { cursedEnergyControl: 5, prestige: 8, popularity: 5 },
          mastery: 7,
          relationships: { npc_megumi_fushiguro: { respect: 10 } },
          log: 'Tus shikigamis de sombra aseguraron el bosque antes de que el equipo rival pudiera reaccionar.'
        }
      },
      {
        id: 'c4_diplomatic_baseball',
        label: 'Confraternizar en el partido posterior con Kasumi Miwa y Noritoshi Kamo',
        conditions: {},
        effects: {
          stats: { popularity: 7, higherUpsRelation: 4, mentalHealth: 5 },
          relationships: {
            npc_kasumi_miwa: { friendship: 10 },
            npc_noritoshi_kamo: { friendship: 7 }
          },
          log: 'El encuentro deportivo posterior unió a los estudiantes de Tokio y Kioto.'
        }
      }
    ]
  },
  {
    id: 'evt_08_morgue_autopsy',
    title: 'Autopsia de Cuerpos Transfigurados con Shoko Ieiri',
    narrative: 'Shoko Ieiri te convoca a la morgue subterránea donde descansan víctimas alteradas por la Mutación Pasiva. El olor a antiséptico satura la sala mientras Kento Nanami aguarda el informe forense para rastrear la guarida del responsable.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_reverse_flow_insight',
        label: '[Control 40+] Estudiar la inversión de energía negativa en positiva mientras Shoko opera',
        conditions: { minControl: 40 },
        effects: {
          stats: { cursedEnergyControl: 7, tacticalIntelligence: 5 },
          mastery: 6,
          relationships: { npc_shoko_ieiri: { respect: 10, friendship: 7 } },
          log: 'Comprendiste los fundamentos de la Técnica Maldita Inversa observando a Shoko Ieiri.'
        }
      },
      {
        id: 'c2_assist_dissection',
        label: 'Asistir durante toda la madrugada a Shoko y Nanami pese al impacto psicológico',
        conditions: {},
        effects: {
          stats: { tacticalIntelligence: 5, cursedEnergyControl: 4, mentalHealth: -6 },
          addItem: 'item_medical_pack',
          relationships: {
            npc_shoko_ieiri: { friendship: 7, respect: 5 },
            npc_kento_nanami: { respect: 7, friendship: 4 }
          },
          log: 'Completaste el análisis forense. Shoko te entregó suministros médicos por tu temple.'
        }
      },
      {
        id: 'c3_decline_autopsy',
        label: 'Reconocer tu límite y retirarte a descansar para preservar tu estabilidad mental',
        conditions: {},
        effects: {
          stats: { mentalHealth: 6, prestige: -2 },
          log: 'Decidiste tomarte la noche libre lejos de la sala de autopsias.'
        }
      }
    ]
  },
  {
    id: 'evt_09_binding_altar',
    title: 'El Santuario de las Cuerdas Shimenawa',
    narrative: 'En la cima de un monte cubierto de escarcha encuentras un altar antiguo rodeado de cuerdas ceremoniales carbonizadas. La densidad espiritual del lugar permite grabar un voto vinculante profundo o entrenar hasta el límite físico.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_vow_of_overtime',
        label: '[Voto Vinculante] Limitar tu descanso actual (-12 Salud, -10 Salud mental) para expandir tu control y reserva (+8 Control, +8 Energía máx.)',
        conditions: { isBindingVow: true },
        effects: {
          stats: { health: -12, mentalHealth: -10, cursedEnergyControl: 8, maxCursedEnergy: 8, cursedEnergy: 8 },
          mastery: 7,
          relationships: { npc_kento_nanami: { respect: 6 } },
          log: 'Ataste un juramento de Hora Extra: tu reserva maldita se expandió mediante disciplina estricta.'
        }
      },
      {
        id: 'c2_heavenly_meditation',
        label: '[Restricción Celestial] Entrenar bajo la cascada helada con Maki Zenin hasta perfeccionar tus sentidos',
        conditions: { requiresHeavenlyRestriction: true },
        effects: {
          stats: { speed: 7, strength: 6, mentalHealth: 4 },
          mastery: 6,
          relationships: { npc_maki_zenin: { friendship: 8, respect: 8 } },
          log: 'Sin una gota de energía maldita, tu cuerpo alcanzó una precisión sobrehumana bajo el agua helada.'
        }
      },
      {
        id: 'c3_consecrate_talisman',
        label: '[Sacrificar 25 de Energía Maldita] Imbuir un sello virgen para crear un Talismán de Velo Protector',
        conditions: { minCursedEnergy: 25 },
        effects: {
          stats: { cursedEnergy: -25, cursedEnergyControl: 3 },
          addItem: 'item_warding_seal',
          log: 'Canalizaste tu energía en el altar para consagrar un Talismán de Velo Protector.'
        }
      },
      {
        id: 'c4_rest_at_shrine',
        label: 'Encender incienso y meditar con Kasumi Miwa para recuperar la serenidad',
        conditions: {},
        effects: {
          stats: { mentalHealth: 10, health: 8 },
          relationships: { npc_kasumi_miwa: { friendship: 6 } },
          log: 'El aire frío de la montaña disipó tus dudas y restauró tu calma interior.'
        }
      }
    ]
  },
  {
    id: 'evt_10_kenji_crisis',
    title: 'Emboscada en el Centro de Detención Juvenil',
    narrative: 'Recibes una alerta de emergencia: Yuji Itadori y Nobara Kugisaki han quedado aislados dentro de un dominio incompleto en un centro de detención tras la aparición de un vientre maldito de categoría superior. Si esperas la orden escrita del consejo, podrían no salir con vida.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_rush_rescue',
        label: 'Ignorar la burocracia y entrar de inmediato para combatir codo con codo con Yuji y Nobara',
        conditions: {},
        effects: {
          stats: { popularity: 7, higherUpsRelation: -4 },
          relationships: {
            npc_yuji_itadori: { friendship: 14, respect: 10 },
            npc_nobara_kugisaki: { friendship: 12, respect: 10 }
          },
          log: 'Irrumpiste en el pabellón justo a tiempo para cubrir a Yuji y Nobara.',
          combatEnemy: {
            id: 'evt_enemy_parking_stalker',
            name: 'Portador de Dedo del Pabellón',
            grade: 'semi_grado_2',
            gradeOrder: 2,
            maxHealth: 132,
            attack: 23,
            defense: 13,
            speed: 22,
            specialName: 'Descarga de Energía Pura',
            specialPower: 29,
            specialChance: 0.32
          }
        }
      },
      {
        id: 'c2_ratio_rescue',
        label: '[Técnica: Técnica de Proporción (7:3)] Derrumbar el muro de contención en proporción 7:3 para extraer al grupo',
        conditions: { requiresTechnique: 'ratio_technique' },
        effects: {
          stats: { prestige: 7, tacticalIntelligence: 4 },
          mastery: 7,
          relationships: {
            npc_kento_nanami: { respect: 12 },
            npc_yuji_itadori: { friendship: 10 }
          },
          log: 'Trazaste la proporción exacta sobre las columnas y abriste una ruta de extracción limpia.'
        }
      },
      {
        id: 'c3_coordinate_megumi',
        label: '[Inteligencia táctica 28+] Triangular la salida con los sabuesos de Megumi Fushiguro',
        conditions: { minIntelligence: 28 },
        effects: {
          stats: { tacticalIntelligence: 5, higherUpsRelation: 4, prestige: 4 },
          relationships: {
            npc_megumi_fushiguro: { friendship: 9, respect: 8 },
            npc_yuji_itadori: { friendship: 8 }
          },
          log: 'Tu coordinación táctica con Megumi permitió un rescate sin bajas.'
        }
      },
      {
        id: 'c4_follow_protocol',
        label: 'Seguir el protocolo estricto de Yoshinobu Gakuganji y esperar afuera del velo',
        conditions: {},
        effects: {
          stats: { higherUpsRelation: 6, popularity: -10, mentalHealth: -8 },
          relationships: {
            npc_yuji_itadori: { friendship: -12 },
            npc_nobara_kugisaki: { friendship: -14, respect: -10 },
            npc_satoru_gojo: { respect: -10 }
          },
          log: 'Tus compañeros sobrevivieron con heridas graves, pero tu pasividad enfureció a Satoru Gojo.'
        }
      }
    ]
  },
  {
    id: 'evt_11_cursed_tool_forge',
    title: 'El Arsenal de Herramientas Malditas',
    narrative: 'Maki Zenin y Yuta Okkotsu te invitan a revisar la armería reservada del colegio técnico, donde un maestro armero ajusta katanas y bastones imbuidos de energía maldita.',
    conditions: { minAge: 16 },
    choices: [
      {
        id: 'c1_commission_katana',
        label: '[Pagar 24.000 ¥] Adquirir una Katana de Acero Azabache equilibrada junto a Yuta Okkotsu',
        conditions: { minMoney: 24000 },
        effects: {
          money: -24000,
          addItem: 'item_black_steel_katana',
          stats: { strength: 3, prestige: 3 },
          relationships: { npc_yuta_okkotsu: { friendship: 8, respect: 6 } },
          log: 'Obtuviste una Katana de Acero Azabache y practicaste su revestimiento con Yuta.'
        }
      },
      {
        id: 'c2_infuse_own_ce',
        label: '[Sacrificar 30 de Energía Maldita] Imbuir hojas sin descanso durante horas para pulir tu control',
        conditions: { minCursedEnergy: 30 },
        effects: {
          stats: { cursedEnergy: -30, cursedEnergyControl: 7, strength: 3 },
          mastery: 6,
          relationships: { npc_yuta_okkotsu: { respect: 7 } },
          log: 'Mantuviste un flujo constante sobre el acero sin quebrar la hoja.'
        }
      },
      {
        id: 'c3_spar_maki',
        label: 'Practicar combate de armas pesadas toda la tarde con Maki Zenin',
        conditions: {},
        effects: {
          stats: { strength: 6, health: -6 },
          money: 6000,
          relationships: { npc_maki_zenin: { friendship: 7, respect: 8 } },
          log: 'Terminaste con moretones en todo el cuerpo, pero tu manejo de armas dio un salto notable.'
        }
      }
    ]
  },
  {
    id: 'evt_12_higher_ups_tribunal',
    title: 'Audiencia ante los Biombos de los Altos Mandos',
    narrative: 'Te conducen a una sala oscura rodeada por puertas correderas de papel tras las cuales se ocultan los ancianos del consejo. Yoshinobu Gakuganji lee tu expediente y cuestiona la influencia de Satoru Gojo sobre tus decisiones recientes.',
    conditions: { minAge: 16 },
    choices: [
      {
        id: 'c1_pledge_loyalty',
        label: 'Inclinarte con respeto protocolario y reafirmar tu obediencia al consejo',
        conditions: {},
        effects: {
          stats: { higherUpsRelation: 12, prestige: 3, threatLevel: -8, popularity: -4 },
          relationships: {
            npc_yoshinobu_gakuganji: { respect: 8, friendship: 5 },
            npc_satoru_gojo: { friendship: -4 }
          },
          log: 'Tu discurso formal apaciguó las sospechas de los ancianos detrás de los biombos.'
        }
      },
      {
        id: 'c2_tactical_rebuttal',
        label: '[Inteligencia táctica 40+] Demostrar con informes firmados por Kento Nanami que tus métodos reducen las bajas un 40 %',
        conditions: { minIntelligence: 40 },
        effects: {
          stats: { prestige: 10, higherUpsRelation: 7, tacticalIntelligence: 4 },
          relationships: {
            npc_kento_nanami: { respect: 9 },
            npc_yoshinobu_gakuganji: { respect: 7 }
          },
          log: 'Desmontaste cada acusación con datos irrefutables. Incluso los conservadores guardaron silencio.'
        }
      },
      {
        id: 'c3_defy_tribunal',
        label: 'Desafiar su hipocresía abiertamente como haría Satoru Gojo',
        conditions: {},
        effects: {
          stats: { popularity: 10, prestige: 6, higherUpsRelation: -15, threatLevel: 10 },
          relationships: {
            npc_satoru_gojo: { friendship: 12, respect: 9 },
            npc_yoshinobu_gakuganji: { rivalry: 15 }
          },
          log: 'Saliste de la sala con la frente en alto mientras Gojo aplaudía tu insolencia.'
        }
      }
    ]
  },
  {
    id: 'evt_13_azure_anomaly',
    title: 'Clase Magistral sobre el Infinito y la Masa',
    narrative: 'En un polígono despejado a las afueras, Satoru Gojo demuestra cómo la convergencia espacial y la masa virtual alteran las leyes de la física cuando una anomalía maldita de Grado 2 emerge cerca del perímetro.',
    conditions: { minAge: 16 },
    choices: [
      {
        id: 'c1_limitless_mastery',
        label: '[Técnica: Infinito (Mukagen)] Sincronizar Azul y Rojo bajo la tutela directa de Satoru Gojo',
        conditions: { requiresTechnique: 'limitless' },
        effects: {
          stats: { cursedEnergyControl: 8, maxCursedEnergy: 6, prestige: 8 },
          mastery: 10,
          relationships: { npc_satoru_gojo: { respect: 14, friendship: 9 } },
          log: 'Alcanzaste una iluminación técnica al manipular las coordenadas del Infinito.'
        }
      },
      {
        id: 'c2_star_rage_mastery',
        label: '[Técnica: Furia Estelar (Bomba-Ba-Ye)] Incrementar tu masa virtual hasta quebrar la barrera de la anomalía',
        conditions: { requiresTechnique: 'star_rage' },
        effects: {
          stats: { cursedEnergyControl: 8, strength: 6, prestige: 7 },
          mastery: 10,
          log: 'Tu impacto cargado de masa imaginaria pulverizó la distorsión de un solo golpe.'
        }
      },
      {
        id: 'c3_analyze_distortion',
        label: '[Inteligencia táctica 32+] Calcular los vectores de barrera junto a Satoru Gojo',
        conditions: { minIntelligence: 32 },
        effects: {
          stats: { cursedEnergyControl: 6, tacticalIntelligence: 5 },
          mastery: 5,
          relationships: { npc_satoru_gojo: { friendship: 7, respect: 6 } },
          log: 'Tus cálculos sobre barreras espaciales sorprendieron gratamente a Gojo.'
        }
      },
      {
        id: 'c4_destroy_nucleus',
        label: 'Saltar al centro del fenómeno y exorcizar a la maldición en solitario',
        conditions: {},
        effects: {
          stats: { prestige: 6 },
          log: 'Entraste al polígono para destruir el núcleo de la anomalía.',
          combatEnemy: {
            id: 'evt_enemy_star_aberration',
            name: 'Aberración Espacial del Polígono',
            grade: 'grado_2',
            gradeOrder: 3,
            maxHealth: 155,
            attack: 27,
            defense: 15,
            speed: 26,
            specialName: 'Colapso de Lente Oscura',
            specialPower: 35,
            specialChance: 0.34
          }
        }
      }
    ]
  },
  {
    id: 'evt_14_civilian_cult',
    title: 'La Secta de la Estrella y la Oferta de Suguru Geto',
    narrative: 'Una organización religiosa fachada recauda millones entre civiles mientras sirve de tapadera para recolectar espíritus malditos. Al infiltrarte en el recinto, te topas con emisarios de Suguru Geto que te invitan a cuestionar por qué proteges a los no-hechiceros.',
    conditions: { minAge: 16 },
    choices: [
      {
        id: 'c1_exorcise_cult_womb',
        label: 'Rechazar su ideología y exorcizar al espíritu guardián del templo subterráneo',
        conditions: {},
        effects: {
          stats: { prestige: 9, popularity: 7, higherUpsRelation: 5 },
          money: 20000,
          relationships: {
            npc_satoru_gojo: { respect: 7 },
            npc_suguru_geto: { rivalry: 12, respect: 5 }
          },
          log: 'Desmantelaste la célula de la secta y destruiste la maldición que custodiaban.',
          combatEnemy: {
            id: 'evt_enemy_cult_idol',
            name: 'Deidad Falsa de la Secta',
            grade: 'semi_grado_2',
            gradeOrder: 2,
            maxHealth: 145,
            attack: 25,
            defense: 14,
            speed: 23,
            specialName: 'Mirada de Parálisis Ciega',
            specialPower: 32,
            specialChance: 0.33
          }
        }
      },
      {
        id: 'c2_csm_absorb',
        label: '[Técnica: Manipulación de Espíritus Malditos] Someter y absorber a la maldición de la secta en un orbe negro',
        conditions: { requiresTechnique: 'cursed_spirit_manipulation' },
        effects: {
          stats: { cursedEnergyControl: 8, prestige: 9, threatLevel: 8 },
          mastery: 10,
          relationships: { npc_suguru_geto: { respect: 14, friendship: 10 } },
          log: 'Tragaste el orbe maldito y sumaste al espíritu guardián a tu arsenal personal.'
        }
      },
      {
        id: 'c3_seize_cult_funds',
        label: 'Confiscar la caja fuerte de la secta junto a Mei Mei antes de informar al colegio',
        conditions: {},
        effects: {
          money: 38000,
          stats: { higherUpsRelation: -8, threatLevel: 7 },
          relationships: {
            npc_mei_mei: { respect: 10, friendship: 7 },
            npc_suguru_geto: { friendship: 6 }
          },
          log: 'Te embolsaste los fondos de la secta antes de que llegaran los supervisores.'
        }
      },
      {
        id: 'c4_expose_politicians',
        label: '[Inteligencia táctica 38+] Desarticular la red financiera de la secta sin derramamiento de sangre',
        conditions: { minIntelligence: 38 },
        effects: {
          stats: { popularity: 12, prestige: 8, tacticalIntelligence: 4, higherUpsRelation: -5 },
          relationships: { npc_kento_nanami: { respect: 8 } },
          log: 'Tu investigación destapó la red de financiación y salvó a decenas de civiles.'
        }
      }
    ]
  },
  {
    id: 'evt_15_burnout_fever',
    title: 'Sobrecarga Cerebral por Uso de Técnica',
    narrative: 'Tras semanas de entrenamientos intensivos y misiones encadenadas, tu corteza prefrontal acusa el desgaste del flujo maldito. Shoko Ieiri te advierte que forzar el cerebro sin Técnica Inversa puede dejar secuelas.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_pay_private_clinic',
        label: '[Pagar 12.000 ¥] Costear un tratamiento intensivo de recuperación con Shoko Ieiri',
        conditions: { minMoney: 12000 },
        effects: {
          money: -12000,
          stats: { health: 22, mentalHealth: 18, cursedEnergy: 20 },
          relationships: { npc_shoko_ieiri: { friendship: 6 } },
          log: 'El tratamiento especializado de Shoko restauró por completo tu equilibrio físico y mental.'
        }
      },
      {
        id: 'c2_push_through_fever',
        label: '[Voto Vinculante] Forzar la meditación en pleno desgaste (-15 Salud, +9 Control, +8 Maestría)',
        conditions: { isBindingVow: true },
        effects: {
          stats: { health: -15, mentalHealth: -8, cursedEnergyControl: 9 },
          mastery: 8,
          log: 'Convertiste el dolor de la sobrecarga en un ancla de concentración extrema.'
        }
      },
      {
        id: 'c3_take_leave',
        label: 'Tomarte tres días de descanso viendo películas con Yuji Itadori y Panda',
        conditions: {},
        effects: {
          stats: { health: 12, mentalHealth: 15, prestige: -2 },
          relationships: {
            npc_yuji_itadori: { friendship: 8 },
            npc_panda: { friendship: 7 }
          },
          log: 'Unos días de descanso en los dormitorios te devolvieron la claridad mental.'
        }
      }
    ]
  },
  {
    id: 'evt_16_zenin_armory_trial',
    title: 'La Cámara disciplinaria del Clan Zenin',
    narrative: 'Naobito Zenin te desafía a entrar en el almacén disciplinario de la residencia Zenin, donde se guardan espíritus cautivos y herramientas malditas ancestrales. Maki y Mai Zenin observan tensas desde la puerta.',
    conditions: { minAge: 16 },
    choices: [
      {
        id: 'c1_heavenly_claim',
        label: '[Restricción Celestial] Arrasar la cámara a puño limpio y reclamar los Guanteletes de Impacto Sísmico',
        conditions: { requiresHeavenlyRestriction: true },
        effects: {
          stats: { strength: 6, prestige: 9 },
          addItem: 'item_resonant_gauntlets',
          relationships: {
            npc_maki_zenin: { respect: 15, friendship: 10 },
            npc_naobito_zenin: { respect: 10, rivalry: 10 }
          },
          log: 'Destrozaste a las maldiciones de la cámara sin energía maldita y tomaste los Guanteletes de Impacto Sísmico.'
        }
      },
      {
        id: 'c2_duel_armory_guardian',
        label: 'Batirte contra el centinela de la cámara junto a Maki Zenin',
        conditions: {},
        effects: {
          stats: { prestige: 7, strength: 3 },
          relationships: {
            npc_maki_zenin: { friendship: 9, respect: 9 },
            npc_mai_zenin: { friendship: 5 }
          },
          log: 'Desenvainaste frente al centinela maldito de la cámara del Clan Zenin.',
          combatEnemy: {
            id: 'evt_enemy_armory_sentinel',
            name: 'Guardián Maldito delFoso Zenin',
            grade: 'grado_2',
            gradeOrder: 3,
            maxHealth: 162,
            attack: 29,
            defense: 17,
            speed: 25,
            specialName: 'Torbellino de Alabarda Negra',
            specialPower: 37,
            specialChance: 0.34
          }
        }
      },
      {
        id: 'c3_projection_disarm',
        label: '[Técnica: Hechicería de Proyección (24 Fotogramas)] Congelar al guardián en un fotograma ante los ojos de Naobito',
        conditions: { requiresTechnique: 'projection_sorcery' },
        effects: {
          stats: { speed: 7, cursedEnergyControl: 6, prestige: 9 },
          mastery: 9,
          addItem: 'item_crimson_knot_talisman',
          relationships: { npc_naobito_zenin: { respect: 15, friendship: 8 } },
          log: 'Trazaste 24 fotogramas impecables y quebraste el encuadre del guardián. Naobito Zenin brindó en tu honor.'
        }
      }
    ]
  },
  {
    id: 'evt_17_train_derailment_omen',
    title: 'El Expreso Nocturno de las Maldiciones del Desastre',
    narrative: 'Un tren de cercanías circula sin control envuelto en raíces gigantescas, escarcha e inundaciones malditas. Decenas de pasajeros permanecen atrapados en los vagones mientras la presión espiritual sube por momentos.',
    conditions: { minAge: 16 },
    choices: [
      {
        id: 'c1_ice_brake',
        label: '[Técnica: Formación de Hielo] Congelar las vías con Calma Helada para frenar el convoy sin descarrilarlo',
        conditions: { requiresTechnique: 'ice_formation' },
        effects: {
          stats: { cursedEnergyControl: 6, prestige: 9, popularity: 8 },
          mastery: 8,
          money: 16000,
          log: 'Tus rampas de hielo detuvieron el convoy con precisión y salvaron a todos los pasajeros.'
        }
      },
      {
        id: 'c2_straw_doll_wake',
        label: '[Técnica: Técnica del Muñeco de Paja] Ejecutar Resonancia sobre las raíces parásitas junto a Nobara Kugisaki',
        conditions: { requiresTechnique: 'straw_doll' },
        effects: {
          stats: { cursedEnergyControl: 6, prestige: 8, popularity: 7 },
          mastery: 8,
          money: 16000,
          relationships: { npc_nobara_kugisaki: { friendship: 10, respect: 9 } },
          log: 'Tus clavos imbuidos destruyeron la red de raíces en todos los vagones simultáneamente.'
        }
      },
      {
        id: 'c3_cursed_speech_halt',
        label: '[Técnica: Discurso Maldito] Ordenar "¡Detente!" a la maldición conductora junto a Toge Inumaki',
        conditions: { requiresTechnique: 'cursed_speech' },
        effects: {
          stats: { cursedEnergyControl: 7, prestige: 9, health: -4 },
          mastery: 8,
          money: 16000,
          relationships: { npc_toge_inumaki: { friendship: 10, respect: 10 } },
          log: 'Tu voz maldita paralizó en seco al espíritu conductor y permitió evacuar el tren.'
        }
      },
      {
        id: 'c4_board_and_fight',
        label: 'Saltar al techo del vagón delantero y enfrentarte al maquinista maldito',
        conditions: {},
        effects: {
          stats: { prestige: 7, speed: 3 },
          log: 'Aterrizaste sobre el vagón en marcha para abatir al espíritu conductor.',
          combatEnemy: {
            id: 'evt_enemy_phantom_conductor',
            name: 'Espíritu Arbóreo del Expreso',
            grade: 'grado_2',
            gradeOrder: 3,
            maxHealth: 158,
            attack: 28,
            defense: 15,
            speed: 28,
            specialName: 'Raíces de Descarrilamiento',
            specialPower: 36,
            specialChance: 0.35
          }
        }
      }
    ]
  },
  {
    id: 'evt_18_domain_research_notes',
    title: 'Entrenamiento de Barreras: Dominio Simple y Expansión',
    narrative: 'Kasumi Miwa, Kento Nanami y Megumi Fushiguro debaten en el dojo sobre cómo sobrevivir a un golpe garantizado mediante el Dominio Simple del Nuevo Estilo de Sombra o contrarrestarlo expandiendo el propio paisaje innato.',
    conditions: { minAge: 16 },
    choices: [
      {
        id: 'c1_high_control_barrier',
        label: '[Control 50+] Desplegar una barrera de dominio experimental sin fisuras en el borde del tatami',
        conditions: { minControl: 50 },
        effects: {
          stats: { cursedEnergyControl: 8, tacticalIntelligence: 5, prestige: 6 },
          mastery: 9,
          relationships: {
            npc_megumi_fushiguro: { respect: 10 },
            npc_satoru_gojo: { respect: 8 }
          },
          log: 'Tu barrera resistió la presión externa sin perder densidad.'
        }
      },
      {
        id: 'c2_sacrifice_ce_barrier',
        label: '[Sacrificar 35 de Energía Maldita] Verter tu reserva actual para sostener la visualización de tu dominio',
        conditions: { minCursedEnergy: 35 },
        effects: {
          stats: { cursedEnergy: -35, cursedEnergyControl: 6, mentalHealth: 3 },
          mastery: 7,
          log: 'Terminaste de rodillas y jadeando, pero lograste cerrar los parámetros de la barrera.'
        }
      },
      {
        id: 'c3_study_simple_posture',
        label: 'Practicar los pasos del Dominio Simple junto a Kasumi Miwa',
        conditions: {},
        effects: {
          stats: { cursedEnergyControl: 4, tacticalIntelligence: 4 },
          mastery: 4,
          relationships: { npc_kasumi_miwa: { friendship: 8, respect: 6 } },
          log: 'Asimilaste la postura defensiva clásica contra técnicas de golpe garantizado.'
        }
      }
    ]
  },
  {
    id: 'evt_19_cursed_relic_temptation',
    title: 'El Dedo de Ryomen Sukuna Lacado en Cera',
    narrative: 'Tras limpiar un santuario abandonado encuentras una caja de madera sellada que contiene un dedo momificado de Grado Especial aún no registrado. La presencia de Ryomen Sukuna retumba en tu mente mientras Suguru Geto y el consejo buscan la reliquia.',
    conditions: { minAge: 16 },
    choices: [
      {
        id: 'c1_vessel_absorb_relic',
        label: '[Técnica: Relicario Demoníaco (Mizushi)] Asimilar la resonancia del dedo para potenciar tus cortes e ignición',
        conditions: { requiresTechnique: 'shrine' },
        effects: {
          stats: { maxCursedEnergy: 10, strength: 6, threatLevel: 14, higherUpsRelation: -8 },
          vesselRisk: 15,
          mastery: 10,
          relationships: { npc_ryomen_sukuna: { respect: 15, friendship: 6 } },
          log: 'La energía del dedo despertó una nueva profundidad del Relicario Demoníaco en tu interior.'
        }
      },
      {
        id: 'c2_hand_over_relic',
        label: 'Sellar el estuche y entregarlo intacto a Satoru Gojo y Masamichi Yaga',
        conditions: {},
        effects: {
          stats: { higherUpsRelation: 10, prestige: 7, threatLevel: -6 },
          money: 15000,
          relationships: {
            npc_satoru_gojo: { friendship: 6, respect: 7 },
            npc_masamichi_yaga: { respect: 9 }
          },
          log: 'Entregaste el dedo de grado especial y recibiste una bonificación oficial por integridad.'
        }
      },
      {
        id: 'c3_sell_relic_geto',
        label: 'Negociar en secreto la entrega de la reliquia con la red de Suguru Geto y Mei Mei',
        conditions: {},
        effects: {
          money: 55000,
          stats: { higherUpsRelation: -16, threatLevel: 15 },
          worldThreat: 8,
          relationships: {
            npc_suguru_geto: { friendship: 12, respect: 9 },
            npc_mei_mei: { friendship: 8 }
          },
          log: 'Obtuviste una fortuna por el objeto de Grado Especial, pero la amenaza global de maldiciones se disparó.'
        }
      }
    ]
  },
  {
    id: 'evt_20_clan_succession_intrigue',
    title: 'Disputa Sucesoria entre los Grandes Clanes',
    narrative: 'Una crisis política estalla entre los patriarcas del Clan Zenin y el Clan Kamo. Noritoshi Kamo y Maki Zenin te citan en privado: una facción tradicionalista vinculada a Gakuganji planea bloquear el ascenso de todos los hechiceros reformistas.',
    conditions: { minAge: 17 },
    choices: [
      {
        id: 'c1_back_reformists',
        label: 'Apoyar la alianza reformista de Maki Zenin, Noritoshi Kamo y Satoru Gojo',
        conditions: {},
        effects: {
          stats: { prestige: 8, popularity: 8, higherUpsRelation: -6 },
          relationships: {
            npc_maki_zenin: { friendship: 10, respect: 9 },
            npc_noritoshi_kamo: { friendship: 9, respect: 8 },
            npc_satoru_gojo: { friendship: 7 }
          },
          log: 'Tu respaldo inclinó la balanza a favor de la nueva generación dentro de los clanes.'
        }
      },
      {
        id: 'c2_back_hardliners',
        label: 'Respaldar a Naobito Zenin y Yoshinobu Gakuganji a cambio de influencia política y estipendio',
        conditions: {},
        effects: {
          money: 30000,
          stats: { higherUpsRelation: 12, prestige: 5, popularity: -8 },
          relationships: {
            npc_naobito_zenin: { friendship: 8, respect: 8 },
            npc_yoshinobu_gakuganji: { friendship: 8, respect: 8 }
          },
          log: 'Aseguraste el favor de los patriarcas conservadores y un generoso estipendio.'
        }
      },
      {
        id: 'c3_duel_clan_assassin',
        label: 'Interceptar al sicario enviado para sabotear la cumbre de los clanes',
        conditions: {},
        effects: {
          stats: { prestige: 10 },
          log: 'Desbarataste el asesinato político enfrentándote al ejecutor en el jardín.',
          combatEnemy: {
            id: 'evt_enemy_tea_assassin',
            name: 'Ejecutor de la Unidad Kukuru',
            grade: 'semi_grado_1',
            gradeOrder: 4,
            maxHealth: 185,
            attack: 32,
            defense: 18,
            speed: 33,
            specialName: 'Corte de Sombra Ceremonial',
            specialPower: 41,
            specialChance: 0.36
          }
        }
      }
    ]
  },
  {
    id: 'evt_21_black_flash_awakening',
    title: 'Las Chispas Negras de Aoi Todo y Yuji Itadori',
    narrative: 'En una sesión de combate extremo guiada por Aoi Todo y Yuji Itadori, tu golpe físico y tu flujo de energía maldita convergen dentro de una millonésima de segundo. El espacio se distorsiona con relámpagos negros y carmesí.',
    conditions: { minAge: 16 },
    choices: [
      {
        id: 'c1_focus_timing',
        label: '[Control 45+] Entrar en "la zona" y clavar el Destello Negro bajo la mirada de Todo e Itadori',
        conditions: { minControl: 45 },
        effects: {
          stats: { cursedEnergyControl: 9, strength: 5, prestige: 7 },
          mastery: 10,
          relationships: {
            npc_aoi_todo: { respect: 12, friendship: 10 },
            npc_yuji_itadori: { respect: 10, friendship: 10 }
          },
          log: 'Saboreaste la esencia de la energía maldita a través del Destello Negro.'
        }
      },
      {
        id: 'c2_pure_flow_strike',
        label: '[Técnica: Puño Divergente y Nuevo Estilo de Sombra] Combinar doble impacto y Destello Negro en un solo golpe',
        conditions: { requiresTechnique: 'divergent_fist' },
        effects: {
          stats: { strength: 7, speed: 5, cursedEnergyControl: 6 },
          mastery: 10,
          relationships: { npc_yuji_itadori: { friendship: 12, respect: 10 } },
          log: 'Tu dominio del Puño Divergente demostró que puedes rivalizar con cualquier técnica heredada.'
        }
      },
      {
        id: 'c3_boogie_combo',
        label: '[Técnica: Boogie Woogie] Sincronizar una palmada de intercambio en el instante exacto del impacto',
        conditions: { requiresTechnique: 'boogie_woogie' },
        effects: {
          stats: { tacticalIntelligence: 7, cursedEnergyControl: 6, prestige: 8 },
          mastery: 10,
          relationships: { npc_aoi_todo: { friendship: 15, respect: 14 } },
          log: 'Aoi Todo lloró de emoción al presenciar tu combinación perfecta con Boogie Woogie.'
        }
      },
      {
        id: 'c4_reckless_effort',
        label: 'Golpear hasta sangrar los nudillos buscando repetir la chispa negra por instinto',
        conditions: {},
        effects: {
          stats: { strength: 5, cursedEnergyControl: 4, health: -10 },
          mastery: 5,
          log: 'Tus nudillos quedaron destrozados, pero tu pegada ganó una ferocidad renovada.'
        }
      }
    ]
  },
  {
    id: 'evt_22_prison_transport_breach',
    title: 'Emboscada de Usuarios Malditos en la Autopista',
    narrative: 'Un convoy blindado escoltado por Kento Nanami ha sido atacado en un viaducto por seguidores de Suguru Geto. Las cortinas están cayendo sobre la autopista y necesitas decidir cómo intervenir.',
    conditions: { minAge: 16, minRankOrder: 2 },
    choices: [
      {
        id: 'c1_intercept_ringleader',
        label: 'Bloquear la rampa de salida junto a Kento Nanami y abatir al cabecilla en combate',
        conditions: {},
        effects: {
          stats: { prestige: 11, higherUpsRelation: 8 },
          relationships: { npc_kento_nanami: { respect: 12, friendship: 8 } },
          log: 'Cortaste la retirada del cabecilla sobre el viaducto junto a Nanami.',
          combatEnemy: {
            id: 'evt_enemy_convoy_fugitive',
            name: 'Comandante Disidente del Viaducto',
            grade: 'semi_grado_1',
            gradeOrder: 4,
            maxHealth: 195,
            attack: 34,
            defense: 19,
            speed: 32,
            specialName: 'Estallido de Grilletes Rotos',
            specialPower: 43,
            specialChance: 0.37
          }
        }
      },
      {
        id: 'c2_tactical_seal_bridge',
        label: '[Inteligencia táctica 45+] Triangular las cortinas con Megumi Fushiguro para encerrar a los atacantes',
        conditions: { minIntelligence: 45 },
        effects: {
          stats: { tacticalIntelligence: 6, prestige: 9, higherUpsRelation: 9 },
          money: 22000,
          relationships: { npc_megumi_fushiguro: { respect: 8 } },
          log: 'Capturaste a los asaltantes sin bajas civiles mediante una maniobra de cierre perimetral impecable.'
        }
      },
      {
        id: 'c3_secret_deal_prisoner',
        label: 'Permitir la retirada de un emisario de Suguru Geto a cambio de fondos y un talismán raro',
        conditions: {},
        effects: {
          money: 32000,
          addItem: 'item_crimson_knot_talisman',
          stats: { higherUpsRelation: -14, threatLevel: 12 },
          relationships: { npc_suguru_geto: { friendship: 10, respect: 7 } },
          log: 'Dejaste un hueco en el velo para que el emisario de Geto escapara tras entregarte el tributo.'
        }
      }
    ]
  },
  {
    id: 'evt_23_festival_night_respite',
    title: 'Faroles de Verano con los Estudiantes de Tokio y Kioto',
    narrative: 'Por primera vez en meses no hay alertas de Grado Especial. Yuji, Megumi, Nobara, Panda, Inumaki, Maki, Yuta y Miwa se reúnen junto al río Sumida mientras los fuegos artificiales iluminan el cielo nocturno.',
    conditions: { minAge: 15 },
    choices: [
      {
        id: 'c1_invite_companions',
        label: '[Pagar 8.000 ¥] Invitar a cenar a todo el grupo y brindar por quienes siguen en pie',
        conditions: { minMoney: 8000 },
        effects: {
          money: -8000,
          stats: { mentalHealth: 18, popularity: 10, health: 10 },
          relationships: {
            npc_yuji_itadori: { friendship: 10 },
            npc_megumi_fushiguro: { friendship: 8 },
            npc_nobara_kugisaki: { friendship: 9 },
            npc_yuta_okkotsu: { friendship: 8 }
          },
          log: 'La velada junto al río fortaleció la unión de tus compañeros.'
        }
      },
      {
        id: 'c2_quiet_talk_nanami',
        label: 'Compartir una charla tranquila en la ribera con Kento Nanami y Shoko Ieiri',
        conditions: {},
        effects: {
          stats: { mentalHealth: 14, tacticalIntelligence: 4 },
          relationships: {
            npc_kento_nanami: { friendship: 10, respect: 6 },
            npc_shoko_ieiri: { friendship: 8 }
          },
          log: 'Nanami y Shoko compartieron contigo recuerdos de su época de estudiantes.'
        }
      },
      {
        id: 'c3_solitary_watch',
        label: 'Vigilar desde los tejados cercanos con Yuta Okkotsu por si alguna maldición acecha el festival',
        conditions: {},
        effects: {
          stats: { prestige: 5, tacticalIntelligence: 3, mentalHealth: 5 },
          relationships: { npc_yuta_okkotsu: { friendship: 7, respect: 8 } },
          log: 'Incluso en noche de festival mantuviste la guardia sobre la ciudad junto a Yuta.'
        }
      }
    ]
  },
  {
    id: 'evt_24_cursed_womb_awakening',
    title: 'Incursión de Espíritus de Grado Especial en la Torre Central',
    narrative: 'Las pantallas de toda la metrópoli pierden la señal. En la aguja de la torre de comunicaciones, un espíritu de categoría especial despliega llamas volcánicas y raíces sobre el distrito.',
    conditions: { minAge: 17, minRankOrder: 3 },
    choices: [
      {
        id: 'c1_solo_assault_tower',
        label: 'Ascender hasta la antena principal y batirte en duelo directo con la entidad',
        conditions: {},
        effects: {
          stats: { prestige: 14, popularity: 9 },
          worldThreat: -8,
          log: 'Subiste hasta la cúspide de la torre bajo una tormenta de fuego maldito.',
          combatEnemy: {
            id: 'evt_enemy_tower_seraph',
            name: 'Espíritu Volcánico de la Aguja',
            grade: 'grado_1',
            gradeOrder: 5,
            maxHealth: 225,
            attack: 38,
            defense: 22,
            speed: 37,
            specialName: 'Erupción de Insectos de Brasa',
            specialPower: 48,
            specialChance: 0.38
          }
        }
      },
      {
        id: 'c2_copy_rika_beam',
        label: '[Técnica: Imitación Incondicional y Reina de las Maldiciones] Desatar un Cañón de Energía Pura junto a Yuta Okkotsu',
        conditions: { requiresTechnique: 'copy_rika' },
        effects: {
          stats: { cursedEnergyControl: 8, prestige: 15, popularity: 10 },
          mastery: 10,
          money: 28000,
          worldThreat: -11,
          relationships: { npc_yuta_okkotsu: { friendship: 12, respect: 12 } },
          log: 'Tu descarga combinada desintegró el núcleo maldito sobre la torre.'
        }
      },
      {
        id: 'c3_vow_overcharge_strike',
        label: '[Voto Vinculante] Quemar tus reservas (-30 Energía, -12 Salud) para destruir el núcleo de un disparo concentrado',
        conditions: { isBindingVow: true, minCursedEnergy: 30 },
        effects: {
          stats: { cursedEnergy: -30, health: -12, prestige: 12, cursedEnergyControl: 7 },
          mastery: 9,
          money: 28000,
          worldThreat: -10,
          log: 'Tu descarga vinculada pulverizó la amenaza antes de que expandiera su dominio.'
        }
      },
      {
        id: 'c4_coordinate_barrier_team',
        label: '[Inteligencia táctica 50+] Aislar la antena con una triple cortina para neutralizar la amenaza por asfixia energética',
        conditions: { minIntelligence: 50 },
        effects: {
          stats: { tacticalIntelligence: 7, prestige: 11, higherUpsRelation: 8 },
          money: 25000,
          worldThreat: -8,
          log: 'Tu asedio técnico neutralizó la amenaza sin destruir la infraestructura.'
        }
      }
    ]
  },
  {
    id: 'evt_25_execution_order_dilemma',
    title: 'La Sentencia de Ejecución de los Altos Mandos',
    narrative: 'Yoshinobu Gakuganji transmite un decreto sellado del consejo supremo: han reactivado una orden de ejecución inmediata contra Yuji Itadori y sus aliados cercanos. Tu firma y tu acero están convocados para hacer cumplir o frustrar la orden.',
    conditions: { minAge: 17, minRankOrder: 3 },
    choices: [
      {
        id: 'c1_hide_target',
        label: 'Desobedecer al consejo y proteger a Yuji Itadori junto a Satoru Gojo y Yuta Okkotsu',
        conditions: {},
        effects: {
          stats: { popularity: 12, mentalHealth: 8, higherUpsRelation: -14, threatLevel: 9 },
          relationships: {
            npc_yuji_itadori: { friendship: 15, respect: 12 },
            npc_satoru_gojo: { friendship: 10, respect: 10 },
            npc_yuta_okkotsu: { friendship: 10, respect: 10 },
            npc_yoshinobu_gakuganji: { rivalry: 14 }
          },
          log: 'Frustraste la sentencia de ejecución y protegiste a tu compañero frente al consejo.'
        }
      },
      {
        id: 'c2_negotiate_suspension',
        label: '[Inteligencia táctica 48+] Presentar un recurso avalado por Masamichi Yaga y Noritoshi Kamo para suspender la orden',
        conditions: { minIntelligence: 48 },
        effects: {
          stats: { prestige: 11, tacticalIntelligence: 5, higherUpsRelation: 4, popularity: 8 },
          relationships: {
            npc_masamichi_yaga: { respect: 10 },
            npc_noritoshi_kamo: { respect: 10, friendship: 7 }
          },
          log: 'Lograste suspender legalmente la ejecución mediante garantías diplomáticas.'
        }
      },
      {
        id: 'c3_enforce_decree',
        label: 'Acatar la orden de Yoshinobu Gakuganji para consolidar tu poder ante los altos mandos',
        conditions: {},
        effects: {
          stats: { higherUpsRelation: 16, prestige: 6, mentalHealth: -14, popularity: -12 },
          money: 35000,
          relationships: {
            npc_yoshinobu_gakuganji: { respect: 14, friendship: 8 },
            npc_yuji_itadori: { friendship: -20, rivalry: 20 },
            npc_satoru_gojo: { friendship: -15, rivalry: 15 }
          },
          log: 'Te alineaste con el decreto del consejo. Recibiste honores oficiales a costa de la confianza de tus compañeros.'
        }
      }
    ]
  },
  {
    id: 'evt_26_red_moon_convergence',
    title: 'El Desfile Nocturno de los Cien Demonios',
    narrative: 'El cielo sobre Tokio y Kioto se tiñe de púrpura oscuro. Suguru Geto ha declarado la guerra total lanzando miles de maldiciones sobre ambas ciudades mientras todos los hechiceros disponibles son desplegados en primera línea.',
    conditions: { minAge: 17 },
    choices: [
      {
        id: 'c1_lead_frontline',
        label: 'Tomar el mando de la línea defensiva junto a Yuta Okkotsu, Aoi Todo y Kento Nanami',
        conditions: {},
        effects: {
          stats: { prestige: 15, popularity: 12 },
          worldThreat: -10,
          relationships: {
            npc_yuta_okkotsu: { respect: 10, friendship: 8 },
            npc_aoi_todo: { respect: 10 },
            npc_kento_nanami: { respect: 10 }
          },
          log: 'Mantuviste la avenida principal frente a la embestida del Desfile Nocturno.',
          combatEnemy: {
            id: 'evt_enemy_red_tide_general',
            name: 'Deidad Maldita de Grado Especial del Desfile',
            grade: 'grado_1',
            gradeOrder: 5,
            maxHealth: 235,
            attack: 40,
            defense: 23,
            speed: 38,
            specialName: 'Torbellino de Uzumaki Menor',
            specialPower: 50,
            specialChance: 0.4
          }
        }
      },
      {
        id: 'c2_heavenly_slaughter',
        label: '[Restricción Celestial] Arrasar tres columnas de maldiciones junto a Maki Zenin en diez minutos',
        conditions: { requiresHeavenlyRestriction: true },
        effects: {
          stats: { prestige: 16, strength: 6, speed: 6 },
          money: 30000,
          worldThreat: -12,
          relationships: { npc_maki_zenin: { friendship: 12, respect: 14 } },
          log: 'Los testigos solo vieron destellos de acero antes de que tres hordas completas quedaran en silencio.'
        }
      },
      {
        id: 'c3_buy_supplies_distribute',
        label: '[Pagar 20.000 ¥] Suministrar talismanes y sueros de Shoko Ieiri a los estudiantes de primer año',
        conditions: { minMoney: 20000 },
        effects: {
          money: -20000,
          stats: { popularity: 15, prestige: 10, higherUpsRelation: 7, mentalHealth: 8 },
          worldThreat: -7,
          relationships: {
            npc_shoko_ieiri: { respect: 10 },
            npc_kasumi_miwa: { friendship: 10 }
          },
          log: 'Tu apoyo logístico salvó la vida de docenas de hechiceros jóvenes durante el Desfile Nocturno.'
        }
      },
      {
        id: 'c4_join_geto_raid',
        label: 'Colaborar en las sombras con la facción de Suguru Geto para saquear las bóvedas del consejo',
        conditions: {},
        effects: {
          money: 48000,
          addItem: 'item_mirror_soul_amulet',
          stats: { higherUpsRelation: -15, threatLevel: 14, popularity: -10 },
          worldThreat: 6,
          relationships: { npc_suguru_geto: { friendship: 14, respect: 12 } },
          log: 'Aprovechaste la distracción del Desfile Nocturno para saquear un Espejo de Contención Abisal.'
        }
      }
    ]
  }
];

export function getEventById(id) {
  return EVENTS.find((evt) => evt.id === id) || null;
}
