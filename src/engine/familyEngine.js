import {
  canPerformQuarterAction,
  consumeTurnAction,
  addLogEntry,
  sanitizeGameState
} from './gameState.js';
import { clamp, randomChoice, randomInt } from './utils.js';

export const PARENTING_STYLES = [
  {
    id: 'estricto_marcial',
    name: 'Disciplina Marcial de Clan',
    description: 'Exigencia constante en postura y etiqueta. Otorga bonificación a Fuerza y Control, pero exige mayor temple mental.',
    yearlyBonus: { strength: 0.4, cursedEnergyControl: 0.4, mentalHealth: -1 }
  },
  {
    id: 'protector_calido',
    name: 'Hogar Cálido y Protector',
    description: 'Prioriza tu bienestar emocional y afecto. Mejora tu Salud mental y recuperación anual.',
    yearlyBonus: { mentalHealth: 4, popularity: 0.4 }
  },
  {
    id: 'academico_exigente',
    name: 'Exigencia Académica y Táctica',
    description: 'Tus padres supervisan cada tarea y lectura. Impulsa tu Inteligencia táctica y calificaciones.',
    yearlyBonus: { tacticalIntelligence: 0.5, prestige: 0.3 }
  },
  {
    id: 'independiente_libre',
    name: 'Crianza Libre y Autodidacta',
    description: 'Te permiten explorar el mundo a tu propio ritmo, desarrollando agilidad e instinto propio.',
    yearlyBonus: { speed: 0.5, mentalHealth: 2 }
  }
];

export const HOUSING_TIERS = [
  {
    id: 'humilde_apartamento',
    name: 'Apartamento Modesto en Suburbios',
    price: 0,
    upkeepPerYear: 2000,
    recoveryBonus: 2,
    prestigeBonus: 0,
    description: 'Vivienda sencilla pero funcional en un barrio tranquilo.'
  },
  {
    id: 'casa_tradicional',
    name: 'Casa Tradicional con Patio',
    price: 45000,
    upkeepPerYear: 5000,
    recoveryBonus: 6,
    prestigeBonus: 4,
    description: 'Hogar amplio con jardín interior ideal para meditar y descansar.'
  },
  {
    id: 'residencia_clan',
    name: 'Residencia Interior del Clan',
    price: 110000,
    upkeepPerYear: 10000,
    recoveryBonus: 10,
    prestigeBonus: 10,
    description: 'Pabellón protegido con dojo privado de entrenamiento y biblioteca.'
  },
  {
    id: 'mansion_protegida',
    name: 'Mansión con Barrera Purificadora',
    price: 240000,
    upkeepPerYear: 18000,
    recoveryBonus: 16,
    prestigeBonus: 18,
    description: 'Propiedad de élite rodeada de velos protectores de primer nivel.'
  }
];

export const AGE_JOBS = [
  {
    id: 'repartidor_barrio',
    name: 'Reparto y Recados del Barrio',
    minAge: 12,
    maxAge: 17,
    income: 4500,
    fatigue: 5,
    description: 'Repartes encargos después de clases para ganar tus primeros ahorros.'
  },
  {
    id: 'ayudante_ventana',
    name: 'Observador Auxiliar ("Ventana")',
    minAge: 13,
    maxAge: 99,
    income: 8500,
    fatigue: 7,
    description: 'Registras avistamientos de energía residual en tu distrito.'
  },
  {
    id: 'asistente_archivo',
    name: 'Asistente del Archivo Maldito',
    minAge: 15,
    maxAge: 99,
    income: 14000,
    fatigue: 8,
    description: 'Clasificas informes de misiones y pergaminos bajo supervisión técnica.'
  },
  {
    id: 'supervisor_oficial',
    name: 'Supervisor de Campo y Cortinas',
    minAge: 18,
    maxAge: 99,
    income: 26000,
    fatigue: 11,
    description: 'Levantas velos y coordinas la logística de exorcismos urbanos.'
  },
  {
    id: 'consultor_barreras',
    name: 'Consultor Maestro de Barreras',
    minAge: 20,
    maxAge: 99,
    minIntelligence: 45,
    income: 42000,
    fatigue: 12,
    description: 'Diseñas barreras de seguridad para familias influyentes y sedes oficiales.'
  }
];

export function createInitialFamilyState(originObj, regionObj, parentsProfile, rng = Math.random) {
  const style = originObj.id.startsWith('clan_')
    ? PARENTING_STYLES[0]
    : randomChoice(PARENTING_STYLES, rng);

  const siblingNames = ['Haru', 'Sora', 'Ren', 'Mio', 'Yuna', 'Kenta', 'Riku', 'Emi'];
  const surname = (parentsProfile.fatherName || 'Sato').split(' ').slice(1).join(' ') || 'Sato';
  const numSiblings = randomInt(0, 2, rng);
  const siblings = [];

  for (let i = 0; i < numSiblings; i += 1) {
    const sName = `${randomChoice(siblingNames, rng)} ${surname}`;
    const sAge = randomInt(2, 6, rng);
    siblings.push({
      id: `sibling_${i + 1}`,
      name: sName,
      relationType: 'Hermano/a',
      age: sAge,
      alive: true,
      affection: randomInt(65, 90, rng),
      trait: randomChoice(['Protector', 'Competitivo', 'Estudioso', 'Alegre', 'Reservado'], rng)
    });
  }

  const grandparents = [
    {
      id: 'grandparent_1',
      name: `Abuelo ${surname}`,
      relationType: 'Abuelo Paterno',
      age: randomInt(58, 70, rng),
      alive: true,
      affection: randomInt(70, 95, rng),
      trait: 'Sabio de la Familia'
    }
  ];

  const defaultHousing = originObj.id === 'clan_gojo' || originObj.id === 'clan_zenin'
    ? 'residencia_clan'
    : (originObj.id === 'clan_kamo' ? 'casa_tradicional' : 'humilde_apartamento');

  return {
    parentingStyle: style,
    father: {
      id: 'father',
      name: parentsProfile.fatherName,
      role: parentsProfile.fatherRole,
      age: randomInt(27, 36, rng),
      alive: true,
      affection: randomInt(75, 95, rng),
      health: 92
    },
    mother: {
      id: 'mother',
      name: parentsProfile.motherName,
      role: parentsProfile.motherRole,
      age: randomInt(26, 35, rng),
      alive: true,
      affection: randomInt(80, 98, rng),
      health: 94
    },
    siblings,
    grandparents,
    spouse: null,
    children: [],
    housingId: defaultHousing,
    familyIncomePerYear: Math.round((parentsProfile.familyMoney || 15000) * 0.45),
    familyExpensesPerYear: Math.round((parentsProfile.familyMoney || 15000) * 0.25),
    inheritanceReceived: false,
    mourningYears: 0
  };
}

export function performFamilyAction(state, actionType, payload = {}, rng = Math.random) {
  const check = canPerformQuarterAction(state);
  if (!check.allowed) {
    return { ok: false, message: check.reason, state };
  }

  const p = state.player;
  const s = p.stats;
  const fam = state.family;
  if (!fam) {
    return { ok: false, message: 'Datos familiares no disponibles.', state };
  }

  let msg = '';

  if (actionType === 'spend_time_parents') {
    if (!fam.father.alive && !fam.mother.alive) {
      return { ok: false, message: 'Ambos padres han fallecido. Puedes honrar su memoria en el altar familiar.', state };
    }
    fam.father.affection = clamp(fam.father.affection + 6, 0, 100);
    fam.mother.affection = clamp(fam.mother.affection + 6, 0, 100);
    s.mentalHealth += 10;
    s.popularity += 2;
    msg = `Compartiste tiempo en casa con tus padres (${fam.father.name} y ${fam.mother.name}): +6 Afecto familiar, +10 Salud mental.`;
  } else if (actionType === 'interact_sibling') {
    const sib = fam.siblings.find((sb) => sb.id === payload.memberId) || fam.siblings[0];
    if (!sib || !sib.alive) {
      return { ok: false, message: 'No tienes hermanos disponibles para esta actividad.', state };
    }
    sib.affection = clamp(sib.affection + 8, 0, 100);
    s.mentalHealth += 8;
    s.speed += 0.3;
    msg = `Pasaste el día jugando y conversando con tu hermano/a ${sib.name}: +8 Afecto, +8 Salud mental.`;
  } else if (actionType === 'visit_grandparent') {
    const gp = fam.grandparents[0];
    if (!gp || !gp.alive) {
      return { ok: false, message: 'Tu abuelo ya no se encuentra con vida.', state };
    }
    gp.affection = clamp(gp.affection + 7, 0, 100);
    s.tacticalIntelligence += 0.6;
    s.mentalHealth += 7;
    msg = `Escuchaste los consejos e historias antiguas de ${gp.name}: +7 Afecto, +0.6 Inteligencia táctica.`;
  } else if (actionType === 'ask_allowance') {
    if (p.age > 17) {
      return { ok: false, message: 'Ya eres mayor de edad; debes generar tus propios ingresos.', state };
    }
    const avgAffection = Math.round((fam.father.affection + fam.mother.affection) / 2);
    if (avgAffection < 50) {
      return { ok: false, message: 'La relación con tus padres es tensa (<50) y rechazaron darte mesada extra.', state };
    }
    const amount = Math.round(1500 + (fam.familyIncomePerYear * 0.12));
    p.money += amount;
    fam.father.affection = clamp(fam.father.affection - 2, 0, 100);
    msg = `Tus padres te entregaron un apoyo económico de ${amount.toLocaleString('es-ES')} ¥ para tus gastos.`;
  } else if (actionType === 'work_age_job') {
    const job = AGE_JOBS.find((j) => j.id === payload.jobId);
    if (!job) {
      return { ok: false, message: 'Empleo no encontrado.', state };
    }
    if (p.age < job.minAge || p.age > job.maxAge) {
      return { ok: false, message: `Este empleo requiere tener entre ${job.minAge} y ${job.maxAge} años.`, state };
    }
    if (job.minIntelligence && s.tacticalIntelligence < job.minIntelligence) {
      return { ok: false, message: `Requiere Inteligencia ${job.minIntelligence}+.`, state };
    }
    p.money += job.income;
    s.health = Math.max(10, s.health - job.fatigue);
    p.fatigue = clamp((p.fatigue || 0) + job.fatigue, 0, 100);
    msg = `Trabajaste como "${job.name}": ganaste ${job.income.toLocaleString('es-ES')} ¥ (-${job.fatigue} Salud por cansancio).`;
  } else if (actionType === 'upgrade_housing') {
    const house = HOUSING_TIERS.find((h) => h.id === payload.housingId);
    if (!house) {
      return { ok: false, message: 'Vivienda no válida.', state };
    }
    if (fam.housingId === house.id) {
      return { ok: false, message: 'Ya resides en este tipo de vivienda.', state };
    }
    if (p.money < house.price) {
      return { ok: false, message: `Necesitas ${house.price.toLocaleString('es-ES')} ¥ para adquirir "${house.name}".`, state };
    }
    p.money -= house.price;
    fam.housingId = house.id;
    s.prestige += house.prestigeBonus;
    s.mentalHealth += 10;
    msg = `¡Te mudaste a "${house.name}"! (+${house.prestigeBonus} Prestigio, +${house.recoveryBonus} recuperación anual).`;
  } else if (actionType === 'have_child') {
    if (p.age < 18) {
      return { ok: false, message: 'Debes ser mayor de edad (18+ años) para formar descendencia.', state };
    }
    if (!fam.spouse) {
      return { ok: false, message: 'Debes estar casado/a o tener una pareja estable para tener descendencia.', state };
    }
    const childNames = ['Ren', 'Akira', 'Hana', 'Sora', 'Yuki', 'Kaito', 'Mei', 'Riku'];
    const surname = p.name.split(' ').slice(1).join(' ') || 'Sato';
    const childName = `${randomChoice(childNames, rng)} ${surname}`;
    const inheritedTalent = p.talent?.growthMultiplier >= 1.4 ? 'Prodigio Heredero' : 'Semilla Prometedora';

    fam.children.push({
      id: `child_${fam.children.length + 1}_${Date.now()}`,
      name: childName,
      age: 1,
      talentName: inheritedTalent,
      inheritedTechnique: p.techniqueId,
      affection: 95
    });
    s.mentalHealth += 15;
    s.prestige += 5;
    msg = `¡Ha nacido tu hijo/a ${childName}! Heredó el rasgo "${inheritedTalent}" y afinidad con tu técnica.`;
  } else {
    return { ok: false, message: 'Acción familiar o económica desconocida.', state };
  }

  consumeTurnAction(state, `Familia/Economía: ${actionType}`);
  sanitizeGameState(state);
  addLogEntry(state, msg, 'social');
  return { ok: true, message: msg, state };
}

export function processAnnualFamilyUpdate(state, rng = Math.random) {
  const fam = state.family;
  if (!fam) return;

  const p = state.player;
  const s = p.stats;

  // Envejecer familiares vivos
  if (fam.father?.alive) fam.father.age += 1;
  if (fam.mother?.alive) fam.mother.age += 1;
  for (const sib of fam.siblings || []) {
    if (sib.alive) sib.age += 1;
  }
  for (const ch of fam.children || []) {
    ch.age += 1;
  }

  // Efecto del estilo de crianza hasta los 15 años
  if (p.age < 15 && fam.parentingStyle?.yearlyBonus) {
    for (const [k, delta] of Object.entries(fam.parentingStyle.yearlyBonus)) {
      if (typeof s[k] === 'number') {
        s[k] += delta;
      }
    }
  }

  // Bonificación de vivienda y mantenimiento si es adulto
  const house = HOUSING_TIERS.find((h) => h.id === fam.housingId) || HOUSING_TIERS[0];
  s.health += house.recoveryBonus;
  if (p.age >= 18 && house.upkeepPerYear > 0 && p.money >= house.upkeepPerYear) {
    p.money -= house.upkeepPerYear;
  }

  // Envejecimiento de abuelos y posible herencia natural
  const gp = fam.grandparents?.[0];
  if (gp && gp.alive) {
    gp.age += 1;
    if (gp.age >= 78 && rng() < 0.25) {
      gp.alive = false;
      fam.mourningYears = 2;
      const inheritance = Math.round(18000 + (fam.familyIncomePerYear || 10000));
      p.money += inheritance;
      fam.inheritanceReceived = true;
      s.mentalHealth = Math.max(10, s.mentalHealth - 12);
      addLogEntry(
        state,
        `Falleció en paz tu ${gp.name} a los ${gp.age} años. La familia atraviesa duelo (-12 Salud mental) y recibes una herencia de ${inheritance.toLocaleString('es-ES')} ¥.`,
        'event'
      );
    }
  }

  // Acontecimiento familiar inesperado en la infancia: nacimiento de un hermano menor
  if (p.age >= 2 && p.age <= 7 && fam.siblings.length < 2 && rng() < 0.14) {
    const surname = p.name.split(' ').slice(1).join(' ') || 'Sato';
    const babySibName = `${randomChoice(['Noa', 'Shin', 'Aoi', 'Yuzu'], rng)} ${surname}`;
    fam.siblings.push({
      id: `sibling_${fam.siblings.length + 1}`,
      name: babySibName,
      relationType: 'Hermano/a Menor',
      age: 1,
      alive: true,
      affection: 85,
      trait: 'Curioso'
    });
    addLogEntry(state, `¡Acontecimiento familiar inesperado! Ha nacido tu hermano/a menor: ${babySibName}.`, 'milestone');
  }

  if (fam.mourningYears > 0) {
    fam.mourningYears -= 1;
  }
}
