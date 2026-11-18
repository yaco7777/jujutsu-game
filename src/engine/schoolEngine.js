import {
  SCHOOLS,
  canPerformQuarterAction,
  consumeTurnAction,
  addLogEntry,
  sanitizeGameState
} from './gameState.js';
import { calculateLogarithmicStatGain } from './progression.js';
import { clamp, randomInt } from './utils.js';

export const SPORTS_CATALOG = [
  {
    id: 'atletismo',
    name: 'Atletismo de Pista',
    minAge: 6,
    cost: 1500,
    coachName: 'Entrenador Kurosawa',
    statFocus: ['speed', 'strength'],
    injuryRisk: 0.05,
    description: 'Carreras de velocidad y fondo que desarrollan zancada explosiva y capacidad pulmonar.'
  },
  {
    id: 'natacion',
    name: 'Natación de Resistencia',
    minAge: 6,
    cost: 2200,
    coachName: 'Instructora Mizuno',
    statFocus: ['speed', 'cursedEnergyControl'],
    injuryRisk: 0.03,
    description: 'Control de la respiración bajo presión y fortalecimiento integral sin impacto articular.'
  },
  {
    id: 'gimnasia',
    name: 'Gimnasia Acrobática',
    minAge: 6,
    cost: 2000,
    coachName: 'Maestra Hoshino',
    statFocus: ['speed', 'cursedEnergyControl'],
    injuryRisk: 0.06,
    description: 'Equilibrio aéreo, flexibilidad y control absoluto del centro de gravedad.'
  },
  {
    id: 'futbol',
    name: 'Fútbol Escolar',
    minAge: 7,
    cost: 1800,
    coachName: 'Capitán Takeuchi',
    statFocus: ['speed', 'tacticalIntelligence'],
    injuryRisk: 0.07,
    description: 'Visión periférica de equipo, resistencia aeróbica y popularidad entre compañeros.'
  },
  {
    id: 'baloncesto',
    name: 'Baloncesto Táctico',
    minAge: 8,
    cost: 2000,
    coachName: 'Entrenador Sakamoto',
    statFocus: ['speed', 'tacticalIntelligence'],
    injuryRisk: 0.07,
    description: 'Salto vertical, cambios bruscos de ritmo y lectura rápida de defensas.'
  },
  {
    id: 'artes_marciales',
    name: 'Artes Marciales y Kendo',
    minAge: 6,
    cost: 3000,
    coachName: 'Maestro Daiki',
    statFocus: ['strength', 'techniqueMastery'],
    injuryRisk: 0.09,
    description: 'Combate de contacto y manejo de espada de bambú aplicable directamente al jujutsu.'
  }
];

export function createInitialSchoolState(schoolId = 'tokyo') {
  return {
    enrolled: false,
    stage: 'hogar',
    institutionName: 'Crianza en el Hogar Familiar',
    attendance: 100,
    grades: 75,
    discipline: 80,
    schoolReputation: 50,
    hasScholarship: false,
    activeSportId: null,
    tournamentsWon: 0,
    academicAwards: 0,
    homeworkDoneThisYear: false,
    preferredCampus: schoolId
  };
}

export function getSchoolStageForAge(age, currentSchoolState) {
  if (currentSchoolState?.stage === 'abandonado') {
    return {
      stage: 'abandonado',
      institutionName: 'Estudios Abandonados (Fuera del Sistema Escolar)'
    };
  }
  if (age < 6) {
    return {
      stage: 'hogar',
      institutionName: 'Etapa Preescolar en el Hogar'
    };
  }
  if (age < 12) {
    return {
      stage: 'primaria',
      institutionName: 'Escuela Primaria Regional'
    };
  }
  if (age < 15) {
    return {
      stage: 'secundaria',
      institutionName: 'Escuela Secundaria Básica'
    };
  }
  if (age <= 18) {
    const campus = SCHOOLS.find((s) => s.id === (currentSchoolState?.preferredCampus || 'tokyo')) || SCHOOLS[0];
    return {
      stage: 'colegio_tecnico',
      institutionName: campus.name
    };
  }
  return {
    stage: 'graduado',
    institutionName: 'Graduado del Colegio Técnico de Hechicería'
  };
}

export function performSchoolAction(state, actionType, payload = {}, rng = Math.random) {
  const check = canPerformQuarterAction(state);
  if (!check.allowed) {
    return { ok: false, message: check.reason, state };
  }

  const p = state.player;
  const s = p.stats;
  const sch = state.school;
  const talentMult = p.talent?.growthMultiplier || 1.0;

  if (!sch) {
    return { ok: false, message: 'Sistema escolar no inicializado.', state };
  }

  if (p.age < 6 && actionType !== 'join_sport') {
    return { ok: false, message: 'Aún no has ingresado a la escuela primaria (ingreso a los 6 años).', state };
  }

  let msg = '';

  if (actionType === 'study_homework') {
    if (sch.stage === 'abandonado') {
      return { ok: false, message: 'Has abandonado los estudios; retómalos primero para asistir a clases.', state };
    }
    const intGain = calculateLogarithmicStatGain(s.tacticalIntelligence, 'normal', 0.95, talentMult);
    s.tacticalIntelligence += intGain;
    sch.grades = clamp(sch.grades + randomInt(6, 11, rng), 0, 100);
    sch.attendance = clamp(sch.attendance + 5, 0, 100);
    sch.discipline = clamp(sch.discipline + 4, 0, 100);
    sch.homeworkDoneThisYear = true;
    msg = `Completaste tareas, lecturas y prácticas escolares: Calificaciones ${sch.grades}/100 (+${intGain} Inteligencia táctica).`;
  } else if (actionType === 'take_school_exam') {
    if (sch.stage === 'abandonado') {
      return { ok: false, message: 'No estás matriculado actualmente.', state };
    }
    const examScore = Math.round(sch.grades * 0.65 + s.tacticalIntelligence * 0.35 + randomInt(-5, 8, rng));
    if (examScore >= 80) {
      sch.academicAwards += 1;
      sch.hasScholarship = true;
      const scholarshipMoney = 12000;
      p.money += scholarshipMoney;
      s.prestige += 3;
      sch.schoolReputation = clamp(sch.schoolReputation + 10, 0, 100);
      msg = `¡Sobresaliente en los exámenes anuales (${examScore} pts)! Recibes Reconocimiento Académico y una Beca de ${scholarshipMoney.toLocaleString('es-ES')} ¥.`;
    } else if (examScore >= 55) {
      sch.grades = clamp(sch.grades + 3, 0, 100);
      s.tacticalIntelligence += 0.4;
      msg = `Aprobaste los exámenes escolares con ${examScore} puntos y consolidaste tu base teórica.`;
    } else {
      sch.schoolReputation = clamp(sch.schoolReputation - 6, 0, 100);
      s.mentalHealth = Math.max(10, s.mentalHealth - 5);
      msg = `Obtuviste una nota baja (${examScore} pts) en los exámenes. Los profesores te advirtieron mejorar tu asistencia.`;
    }
  } else if (actionType === 'skip_classes') {
    sch.attendance = clamp(sch.attendance - 15, 0, 100);
    sch.grades = clamp(sch.grades - 8, 0, 100);
    sch.discipline = clamp(sch.discipline - 10, 0, 100);
    s.mentalHealth += 8;
    s.popularity += 3;
    msg = 'Faltaste a clases para recorrer la ciudad: +8 Salud mental y +3 Popularidad, pero cayeron tu asistencia y disciplina.';
  } else if (actionType === 'join_sport') {
    const sport = SPORTS_CATALOG.find((sp) => sp.id === payload.sportId);
    if (!sport) {
      return { ok: false, message: 'Deporte no válido.', state };
    }
    if (p.age < sport.minAge) {
      return { ok: false, message: `Debes tener al menos ${sport.minAge} años para practicar ${sport.name}.`, state };
    }
    if (p.money < sport.cost) {
      return { ok: false, message: `Necesitas ${sport.cost.toLocaleString('es-ES')} ¥ para pagar la inscripción de ${sport.name}.`, state };
    }
    p.money -= sport.cost;
    sch.activeSportId = sport.id;
    msg = `Te inscribiste en el club de "${sport.name}" bajo la tutela de ${sport.coachName} (-${sport.cost.toLocaleString('es-ES')} ¥).`;
  } else if (actionType === 'practice_sport') {
    const sport = SPORTS_CATALOG.find((sp) => sp.id === sch.activeSportId);
    if (!sport) {
      return { ok: false, message: 'Primero inscríbete en un deporte desde el catálogo deportivo.', state };
    }
    const gains = [];
    for (const statKey of sport.statFocus) {
      if (statKey === 'techniqueMastery') {
        const g = calculateLogarithmicStatGain(p.techniqueMastery, 'normal', 0.9, talentMult);
        p.techniqueMastery += g;
        gains.push(`+${g} Maestría`);
      } else if (typeof s[statKey] === 'number') {
        const g = calculateLogarithmicStatGain(s[statKey], 'normal', 0.9, talentMult);
        s[statKey] += g;
        gains.push(`+${g} ${statKey}`);
      }
    }

    s.popularity += 2;
    s.health = Math.max(10, s.health - 6);
    p.fatigue = clamp((p.fatigue || 0) + 8, 0, 100);

    if (rng() < sport.injuryRisk) {
      p.injury = 'Esguince deportivo leve (-Velocidad temporal)';
      s.health = Math.max(10, s.health - 10);
      msg = `Entrenaste ${sport.name} (${gains.join(', ')}), pero sufriste una lesión leve durante la práctica (-10 Salud).`;
    } else if (rng() < 0.35) {
      sch.tournamentsWon += 1;
      s.prestige += 3;
      p.money += 5000;
      msg = `¡Ganaste una competencia interescolar de ${sport.name}! (${gains.join(', ')}, +3 Prestigio y premio de 5.000 ¥).`;
    } else {
      msg = `Sesión intensiva de ${sport.name} con ${sport.coachName}: ${gains.join(', ')}, +2 Popularidad.`;
    }
  } else if (actionType === 'school_tournament') {
    if (p.age < 12) {
      return { ok: false, message: 'Los torneos interescolares requieren tener al menos 12 años.', state };
    }
    const powerScore = s.strength + s.speed + s.tacticalIntelligence + p.techniqueMastery;
    if (powerScore >= 130) {
      sch.tournamentsWon += 1;
      s.prestige += 6;
      s.popularity += 6;
      p.money += 15000;
      msg = '¡Te proclamaste campeón del Torneo Escolar Anual! (+6 Prestigio, +6 Popularidad, +15.000 ¥).';
    } else {
      const g = calculateLogarithmicStatGain(s.strength, 'normal', 0.85, talentMult);
      s.strength += g;
      s.prestige += 2;
      msg = `Participaste con honor en el Torneo Escolar y alcanzaste las rondas finales (+${g} Fuerza, +2 Prestigio).`;
    }
  } else if (actionType === 'change_institution') {
    const newCampusId = sch.preferredCampus === 'tokyo' ? 'kyoto' : 'tokyo';
    sch.preferredCampus = newCampusId;
    const campusObj = SCHOOLS.find((sc) => sc.id === newCampusId) || SCHOOLS[0];
    p.school = newCampusId;
    if (p.age >= 15 && p.age <= 18) {
      sch.institutionName = campusObj.name;
    }
    msg = `Solicitaste traslado académico a: ${campusObj.name}.`;
  } else if (actionType === 'toggle_enrollment') {
    if (sch.stage === 'abandonado') {
      const restored = getSchoolStageForAge(p.age, { preferredCampus: p.school });
      sch.stage = restored.stage;
      sch.institutionName = restored.institutionName;
      sch.enrolled = true;
      msg = `Has retomado oficialmente tus estudios en: ${sch.institutionName}.`;
    } else {
      sch.stage = 'abandonado';
      sch.institutionName = 'Estudios Abandonados';
      sch.enrolled = false;
      s.higherUpsRelation = Math.max(0, s.higherUpsRelation - 8);
      msg = 'Abandonaste los estudios formales para seguir tu propio camino fuera de las aulas (-8 Relación altos mandos).';
    }
  } else {
    return { ok: false, message: 'Acción escolar o deportiva no reconocida.', state };
  }

  consumeTurnAction(state, `Colegio/Deporte: ${actionType}`);
  sanitizeGameState(state);
  addLogEntry(state, msg, 'action');
  return { ok: true, message: msg, state };
}

export function processAnnualSchoolUpdate(state) {
  const sch = state.school;
  if (!sch) return;
  const p = state.player;
  const s = p.stats;

  if (sch.stage !== 'abandonado') {
    const stageInfo = getSchoolStageForAge(p.age, sch);
    sch.stage = stageInfo.stage;
    sch.institutionName = stageInfo.institutionName;
    sch.enrolled = p.age >= 6 && p.age <= 18;
  }

  if (sch.enrolled) {
    if (!sch.homeworkDoneThisYear) {
      sch.grades = clamp(sch.grades - 4, 0, 100);
    }
    if (sch.grades < 40) {
      s.higherUpsRelation = Math.max(0, s.higherUpsRelation - 3);
      addLogEntry(state, 'Tus bajas calificaciones escolares preocupan a tus padres y profesores.', 'warning');
    } else if (sch.hasScholarship) {
      p.money += 6000;
    }
  }

  sch.homeworkDoneThisYear = false;
}
