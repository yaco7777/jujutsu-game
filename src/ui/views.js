import { getTechniqueById } from '../data/techniques.js';
import { NPCS } from '../data/npcs.js';
import { ITEMS, getItemById } from '../data/items.js';
import { MISSIONS } from '../data/missions.js';
import {
  REGIONS,
  SCHOOLS,
  PERSONALITIES,
  CAREER_PATHS,
  RANKS,
  MAX_NPC_INTERACTIONS_PER_YEAR,
  MAX_TOTAL_SOCIAL_PER_YEAR,
  getOriginById,
  getRankById,
  canPerformQuarterAction,
  generateBiography
} from '../engine/gameState.js';
import {
  TRAINING_DIFFICULTIES,
  UNLOCK_REQUIREMENTS,
  canUnlockSpecialSkill,
  getNextRankInfo
} from '../engine/progression.js';
import { TRAINING_MODALITIES, calculateTrainingGain } from '../engine/trainingEngine.js';
import { HOUSING_TIERS, AGE_JOBS } from '../engine/familyEngine.js';
import { SPORTS_CATALOG } from '../engine/schoolEngine.js';
import { TRAVEL_DESTINATIONS } from '../engine/travelEngine.js';
import { isChoiceAvailable } from '../engine/eventEngine.js';
import { getNpcInteractionStatus } from '../engine/relationships.js';
import { getEquipmentBonuses } from '../engine/inventory.js';
import { listSaveSlots } from '../engine/saveSystem.js';
import { getUiPreferences } from './animations.js';
import { renderStepByStepTutorial } from './tutorial.js';
import { formatMoney, formatStat } from '../engine/utils.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderStatBar(label, value, max = 100, colorClass = '') {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  return `
    <div class="stat-item">
      <div class="stat-header">
        <span>${escapeHtml(label)}</span>
        <strong>${formatStat(value)}/${formatStat(max)}</strong>
      </div>
      <div class="progress-track">
        <div class="progress-fill ${colorClass}" style="width: ${pct}%"></div>
      </div>
    </div>
  `;
}

function renderActionOrbs(rem, max = 4) {
  const orbs = [];
  for (let i = 0; i < max; i += 1) {
    orbs.push(`<span class="action-orb ${i < rem ? 'is-available' : ''}"></span>`);
  }
  return `
    <div class="action-orbs" title="Tienes ${rem} de ${max} acciones disponibles este año">
      ${orbs.join('')}
      <span>${rem}/${max} acciones</span>
    </div>
  `;
}

export function getLifeStageInfo(age) {
  if (age < 6) {
    return {
      stageName: '1–5 Años: Primera Infancia',
      nextMilestone: `Faltan ${6 - age} ${6 - age === 1 ? 'año' : 'años'} para ingresar a Primaria y despertar tu Técnica (6 años).`,
      helpText: 'Eres un niño pequeño en casa de tus padres. Desarrolla tu lenguaje, motricidad, vínculo con tus padres y primeros indicios espirituales.'
    };
  }
  if (age < 12) {
    return {
      stageName: '6–11 Años: Infancia Escolar',
      nextMilestone: `Faltan ${12 - age} ${12 - age === 1 ? 'año' : 'años'} para la preadolescencia (12 años).`,
      helpText: 'Ya asistes a la Escuela Primaria y tu don ha despertado. Estudia, haz amigos, inscríbete en deportes y entrena tus primeras habilidades.'
    };
  }
  if (age < 15) {
    return {
      stageName: '12–14 Años: Preadolescencia',
      nextMilestone: `Faltan ${15 - age} ${15 - age === 1 ? 'año' : 'años'} para ingresar al Colegio Técnico de Hechicería (15 años).`,
      helpText: 'Tienes mayor independencia: participa en torneos escolares, realiza tus primeros empleos juveniles, viaja y recibe orientación de hechiceros.'
    };
  }
  if (age < 18) {
    return {
      stageName: '15–17 Años: Adolescencia y Formación Jujutsu',
      nextMilestone: `Faltan ${18 - age} ${18 - age === 1 ? 'año' : 'años'} para alcanzar la mayoría de edad (18 años).`,
      helpText: 'Formación especializada: supera exámenes de grado, realiza misiones supervisadas, forja rivalidades o vive tus primeras citas románticas.'
    };
  }
  return {
    stageName: '18+ Años: Adultez y Carrera',
    nextMilestone: 'Alcanza el Grado Especial, lidera tu clan, forma tu propia familia o retírate con honor.',
    helpText: 'Plena autonomía: misiones de alto riesgo, política de clanes, matrimonio y descendencia, vivienda propia y maestría de Dominio.'
  };
}

export function renderStageGuideBanner(state) {
  const p = state.player;
  const rem = state.turn?.actionsRemaining ?? 4;
  const maxAct = state.turn?.maxActionsPerTurn ?? 4;
  const stage = getLifeStageInfo(p.age);
  const locObj = TRAVEL_DESTINATIONS.find((d) => d.id === p.currentLocation) || TRAVEL_DESTINATIONS[0];

  return `
    <div class="stage-guide-banner">
      <div class="stage-guide-header">
        <div class="badge-row">
          <span class="badge badge-accent">${escapeHtml(stage.stageName)}</span>
          <span class="badge badge-gold">Edad: ${p.age} ${p.age === 1 ? 'año' : 'años'}</span>
          <span class="badge">Ubicación: ${escapeHtml(locObj.name)}</span>
          ${p.injury ? `<span class="badge badge-danger">Lesión: ${escapeHtml(p.injury)}</span>` : ''}
        </div>
        ${renderActionOrbs(rem, maxAct)}
      </div>
      <p class="card-desc" style="color: var(--text-primary);">${escapeHtml(stage.helpText)}</p>
      <p class="card-desc" style="font-size: 0.79rem; color: #818cf8;"><strong>Próximo hito:</strong> ${escapeHtml(stage.nextMilestone)}</p>
    </div>
  `;
}

export function renderHeaderMeta(state) {
  if (!state || !state.characterCreated) {
    return `<span class="meta-pill">Modo: <strong>Nuevo Nacimiento</strong></span>`;
  }
  const p = state.player;
  const rankObj = getRankById(p.rank);
  const rem = state.turn?.actionsRemaining ?? 4;
  const maxAct = state.turn?.maxActionsPerTurn ?? 4;
  return `
    <span class="meta-pill">Nombre: <strong>${escapeHtml(p.name)}</strong></span>
    <span class="meta-pill">Edad: <strong>${p.age} ${p.age === 1 ? 'año' : 'años'} (Año ${p.year})</strong></span>
    <span class="meta-pill">Acciones: <strong>${rem}/${maxAct}</strong></span>
    <span class="meta-pill">Grado: <strong>${p.age < 6 ? 'Infante' : escapeHtml(rankObj.name)}</strong></span>
    <span class="meta-pill">Fondos: <strong>${formatMoney(p.money)}</strong></span>
  `;
}

export function renderSidebarStats(state) {
  if (!state || !state.characterCreated) {
    return `
      <h2 class="section-title">Guía de Inicio</h2>
      <div class="stat-list" style="gap: 10px;">
        <p class="card-desc">1. Elige solo tu <strong>Nombre</strong>, <strong>Género</strong> y <strong>Región</strong>.</p>
        <p class="card-desc">2. Tus padres, clan, talento y técnica se sortean una sola vez al nacer (sin re-sorteo).</p>
        <p class="card-desc">3. Empiezas con <strong>1 año de edad</strong> y dispones de <strong>4 acciones por año</strong>.</p>
        <button type="button" data-action="open-tutorial" class="btn btn-secondary btn-block">
          Abrir Tutorial (20 Etapas)
        </button>
      </div>
    `;
  }

  const p = state.player;
  const s = p.stats;
  const originObj = getOriginById(p.origin);
  const tech = getTechniqueById(p.techniqueId);
  const rankObj = getRankById(p.rank);
  const careerObj = CAREER_PATHS.find((c) => c.id === p.careerPath) || CAREER_PATHS[0];
  const isHR = p.origin === 'heavenly_restriction';
  const techAwakened = p.age >= 6 || isHR;
  const initials = p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
      <div class="avatar-portrait" aria-hidden="true">${escapeHtml(initials)}</div>
      <div>
        <div class="card-title">${escapeHtml(p.name)}</div>
        <div class="card-desc">${p.age} ${p.age === 1 ? 'año' : 'años'} · ${p.age < 6 ? 'Infante' : escapeHtml(rankObj.name)}</div>
      </div>
    </div>

    <div class="badge-row" style="margin-bottom: 12px;">
      <span class="badge">${escapeHtml(originObj.name)}</span>
      <span class="badge badge-gold">${escapeHtml(careerObj.name)}</span>
      <span class="badge badge-accent">Talento: ${escapeHtml(p.talent?.name || 'Estándar')} (x${p.talent?.growthMultiplier || 1})</span>
      <span class="badge">${techAwakened ? escapeHtml(tech.name) : `Latente: ${escapeHtml(tech.name)} (6 años)`}</span>
    </div>

    <div class="stat-list">
      ${renderStatBar('Salud Física', s.health, 100, 'bar-health')}
      ${renderStatBar('Salud Mental / Ánimo', s.mentalHealth, 100, 'bar-health')}
      ${renderStatBar('Cansancio / Fatiga', p.fatigue || 0, 100, 'bar-danger')}
      ${isHR
        ? `<div class="stat-item"><div class="stat-header"><span>Energía Maldita</span><strong>0/0 (Restricción Celestial)</strong></div></div>`
        : renderStatBar('Energía Maldita', s.cursedEnergy, s.maxCursedEnergy, 'bar-ce')
      }
      ${renderStatBar('Fuerza Física', s.strength, 100)}
      ${renderStatBar('Velocidad y Agilidad', s.speed, 100)}
      ${renderStatBar('Inteligencia Táctica', s.tacticalIntelligence, 100)}
      ${!isHR ? renderStatBar('Control de Energía', s.cursedEnergyControl, 100, 'bar-ce') : ''}
      ${renderStatBar('Maestría de Técnica', p.techniqueMastery, 100, 'bar-gold')}
      ${renderStatBar('Prestigio', s.prestige, 100, 'bar-gold')}
      ${renderStatBar('Popularidad', s.popularity, 100)}
      ${p.age >= 6 ? renderStatBar('Relación Altos Mandos', s.higherUpsRelation, 100) : ''}
      ${p.age >= 6 ? renderStatBar('Nivel de Amenaza', s.threatLevel, 100, 'bar-danger') : ''}
      ${p.origin === 'cursed_vessel' ? renderStatBar('Riesgo del Recipiente', p.vesselRisk, 100, 'bar-danger') : ''}
    </div>
  `;
}

export function renderSidebarLog(state) {
  const recentLogs = (state?.log || []).slice(0, 14);
  return `
    <h2 class="section-title">
      <span>Acontecimientos Recientes</span>
      <span class="badge">Amenaza: ${state?.world?.curseActivity ?? 25}%</span>
    </h2>
    <div class="log-feed">
      ${recentLogs.map((entry) => `
        <div class="log-entry log-${escapeHtml(entry.category)}">
          <div class="log-meta">Edad: ${entry.age} ${entry.age === 1 ? 'año' : 'años'} · Año ${entry.year}</div>
          <div>${escapeHtml(entry.text)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderCharacterCreationView(draft) {
  return `
    <div class="startup-hero">
      <div class="badge-row" style="margin-bottom: 8px;">
        <span class="badge badge-accent">Simulador de Vida Completa · Jujutsu Kaisen</span>
        <span class="badge badge-gold">Sorteo Único e Irreversible</span>
      </div>
      <h2 style="font-size: 1.45rem; font-weight: 800; margin-bottom: 6px;">
        Comienza tu Existencia desde el Año 1
      </h2>
      <p class="card-desc" style="color: #dbe4ff;">
        En el mundo del jujutsu nadie elige en qué cuna nace ni con qué don despierta. Introduce únicamente tu <strong>Nombre</strong>, <strong>Género</strong> y <strong>Región</strong>: al nacer descubrirás quiénes son tus padres, la situación económica de tu familia y qué técnica maldita grabó el destino en tu alma.
      </p>
    </div>

    <form id="form-create-character">
      <div class="form-grid">
        <div class="form-group">
          <label for="input-char-name">1. Nombre del Personaje</label>
          <input id="input-char-name" name="name" type="text" class="form-control" maxlength="32" required value="${escapeHtml(draft.name)}" />
        </div>

        <div class="form-group">
          <label for="select-char-pronouns">2. Género</label>
          <select id="select-char-pronouns" name="pronouns" class="form-control">
            <option value="él" ${draft.pronouns === 'él' ? 'selected' : ''}>Masculino (él)</option>
            <option value="ella" ${draft.pronouns === 'ella' ? 'selected' : ''}>Femenino (ella)</option>
            <option value="elle" ${draft.pronouns === 'elle' ? 'selected' : ''}>No binario (elle)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="select-char-region">3. Región de Nacimiento</label>
          <select id="select-char-region" name="region" class="form-control">
            ${REGIONS.map((reg) => `
              <option value="${reg.id}" ${draft.region === reg.id ? 'selected' : ''}>
                ${escapeHtml(reg.name)} (Densidad maldita: ${escapeHtml(reg.curseDensity)})
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="card card-highlight" style="margin-bottom: 16px;">
        <div class="card-title">Distribución de Rareza de Técnicas (Sin Opción de Re-sorteo)</div>
        <p class="card-desc">
          Las técnicas más poderosas son considerablemente menos frecuentes. Una vez confirmada la creación, el resultado queda bloqueado:
        </p>
        <div class="badge-row">
          <span class="badge">Común: ~60%</span>
          <span class="badge badge-accent">Rara: ~26%</span>
          <span class="badge badge-gold">Heredada de Clan: ~9%</span>
          <span class="badge badge-danger">Grado Especial / Restricción Celestial: ~5%</span>
        </div>
      </div>

      <div class="action-bar">
        <button type="button" data-action="open-tutorial" class="btn btn-secondary">
          Abrir Tutorial Interactivo (20 Etapas)
        </button>
        <button type="submit" class="btn btn-primary">
          Generar Nacimiento y Origen Familiar (Año 1)
        </button>
      </div>
    </form>
  `;
}

export function renderBirthPreviewView(state) {
  const p = state.player;
  const originObj = getOriginById(p.origin);
  const tech = getTechniqueById(p.techniqueId);
  const personalityObj = PERSONALITIES.find((per) => per.id === p.personality) || PERSONALITIES[0];
  const parents = p.parents || {};
  const fam = state.family || {};

  return `
    <div class="card card-highlight birth-reveal-anim" style="padding: 24px;">
      <div class="badge-row">
        <span class="badge badge-accent">Acta de Nacimiento · Edad: 1 Año</span>
        <span class="badge badge-gold">Región: ${escapeHtml(parents.regionName || 'Tokio')}</span>
        <span class="badge badge-danger">Origen Bloqueado (Sin Re-sorteo)</span>
      </div>

      <h2 class="section-title" style="margin-top: 10px; font-size: 1.4rem;">
        Nacimiento y Origen Familiar de ${escapeHtml(p.name)} (${escapeHtml(p.pronouns)})
      </h2>

      <div class="card-grid" style="margin-bottom: 18px;">
        <div class="card">
          <div>
            <div class="card-title">Padres y Situación Social</div>
            <p class="card-desc"><strong>Padre:</strong> ${escapeHtml(parents.fatherName)} — <em>${escapeHtml(parents.fatherRole)}</em></p>
            <p class="card-desc" style="margin-top: 4px;"><strong>Madre:</strong> ${escapeHtml(parents.motherName)} — <em>${escapeHtml(parents.motherRole)}</em></p>
            <p class="card-desc" style="margin-top: 6px;"><strong>Crianza familiar:</strong> ${escapeHtml(fam.parentingStyle?.name || 'Tradicional')}</p>
            <p class="card-desc" style="margin-top: 6px;">${escapeHtml(parents.story)}</p>
          </div>
          <div class="badge-row">
            <span class="badge badge-accent">Procedencia: ${escapeHtml(originObj.name)}</span>
            <span class="badge">Afinidad Familiar: ${fam.father?.affection ?? 85}/100</span>
          </div>
        </div>

        <div class="card">
          <div>
            <div class="card-title">Economía Familiar y Reputación del Clan</div>
            <p class="card-desc"><strong>Estatus Económico:</strong> ${escapeHtml(parents.wealthLabel)}</p>
            <p class="card-desc" style="font-size: 1.18rem; font-weight: 800; color: #fbbf24; margin-top: 6px;">
              Patrimonio Familiar: ${formatMoney(p.money)}
            </p>
            <p class="card-desc" style="margin-top: 6px;">
              <strong>Reputación del Clan:</strong> ${p.stats.prestige}/100 · <strong>Relación Consejo:</strong> ${p.stats.higherUpsRelation}/100
            </p>
            <p class="card-desc" style="margin-top: 6px;">
              <strong>Personalidad inicial:</strong> ${escapeHtml(personalityObj.name)}
            </p>
          </div>
        </div>

        <div class="card card-highlight">
          <div>
            <div class="card-title">Talento Innato y Potencial</div>
            <p class="card-desc" style="font-size: 1.08rem; font-weight: 700; color: #818cf8; margin-top: 4px;">
              ${escapeHtml(p.talent?.name)} (Potencial x${p.talent?.growthMultiplier})
            </p>
            <p class="card-desc" style="margin-top: 6px;">${escapeHtml(p.talent?.description)}</p>
            <p class="card-desc" style="margin-top: 6px;">
              <strong>Potencial de Energía Maldita:</strong> ${p.stats.maxCursedEnergy}/100
            </p>
          </div>
        </div>

        <div class="card card-highlight">
          <div>
            <div class="badge-row" style="margin-bottom: 6px;">
              <span class="badge badge-gold">Rareza: ${escapeHtml(tech.rarity)}</span>
              <span class="badge badge-danger">Probabilidad: ${p.techniqueProbPercent ?? 12}%</span>
            </div>
            <div class="card-title">Técnica Innata: ${escapeHtml(tech.name)}</div>
            <p class="card-desc">${escapeHtml(tech.description)}</p>
            <p class="card-desc" style="margin-top: 6px; color: #6ee7b7;">
              <em>Permanecerá latente durante tu primera infancia (1–5 años) hasta tu despertar a los 6 años.</em>
            </p>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button type="button" id="btn-confirm-birth" class="btn btn-primary">
          Confirmar y Comenzar Definitivamente mi Vida (Año 1)
        </button>
        <button type="button" data-action="open-tutorial" class="btn btn-secondary">
          Ver Tutorial Interactivo (20 Etapas)
        </button>
      </div>
    </div>
  `;
}

export function renderFullscreenEventOverlay(state) {
  const activeEvent = state?.turn?.activeEvent;
  if (!activeEvent || !state?.player?.alive || state?.player?.retired) {
    return '';
  }

  const p = state.player;
  return `
    <div class="fullscreen-event-card birth-reveal-anim">
      <div class="badge-row">
        <span class="badge badge-accent">ACONTECIMIENTO PRINCIPAL · PANTALLA COMPLETA</span>
        <span class="badge badge-gold">Edad: ${p.age} ${p.age === 1 ? 'año' : 'años'} (Año ${p.year})</span>
        <span class="badge">Decisiones: ${activeEvent.choices.length}</span>
      </div>

      <h2 class="fullscreen-event-title">${escapeHtml(activeEvent.title)}</h2>
      <div class="fullscreen-event-narrative">${escapeHtml(activeEvent.narrative)}</div>

      <div class="subsection-title">Elige tu decisión (Consecuencias Permanentes):</div>
      <div class="choice-list">
        ${activeEvent.choices.map((ch) => {
          const avail = isChoiceAvailable(state, ch);
          return `
            <button
              type="button"
              class="btn choice-btn ${avail.available ? 'btn-primary' : ''}"
              data-event-id="${activeEvent.id}"
              data-choice-id="${ch.id}"
              ${!avail.available ? 'disabled' : ''}
            >
              <span>${escapeHtml(ch.label)}</span>
              ${!avail.available ? `<span class="choice-lock-reason">Requisito no cumplido: ${escapeHtml(avail.reason)}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function renderEndOfLifeBanner(state) {
  const p = state.player;
  if (p.alive && !p.retired) {
    return '';
  }

  const ending = p.ending || {
    title: p.alive ? 'Retiro de la Hechicería' : 'Muerte en Combate',
    summary: p.causeOfDeath || 'Tu camino en el mundo del jujutsu ha llegado a su fin.'
  };

  return `
    <div class="card card-danger" style="margin-bottom: 16px;">
      <div class="card-title">${!p.alive ? 'PARTIDA FINALIZADA — MUERTE PERMANENTE' : 'CARRERA CONCLUIDA — RETIRO'}</div>
      <p class="card-desc"><strong>${escapeHtml(ending.title)}</strong>: ${escapeHtml(ending.summary)}</p>
      <p class="card-desc" style="margin-top: 6px;">${escapeHtml(generateBiography(state))}</p>
      <div class="badge-row">
        <span class="badge">Edad final: ${p.age} años</span>
        <span class="badge">Misiones completadas: ${state.world.completedMissions}</span>
        <span class="badge">Maldiciones exorcizadas: ${state.world.exorcisedCurses}</span>
        <span class="badge">Destellos Negros: ${state.world.blackFlashesLanded}</span>
      </div>
      <div class="action-bar">
        <button type="button" data-action="start-new-life" class="btn btn-primary">Comenzar una Nueva Vida</button>
      </div>
    </div>
  `;
}

export function renderCombatArena(state) {
  const c = state.combat;
  if (!c || !c.enemy) {
    return '';
  }

  const p = state.player;
  const s = p.stats;
  const enemy = c.enemy;
  const tech = getTechniqueById(p.techniqueId);
  const consumables = state.inventory.items
    .map((id) => getItemById(id))
    .filter((item) => item && item.category === 'consumible');

  const unlockedExtObjs = (tech.extensions || []).filter((ext) => p.unlockedExtensions.includes(ext.id));

  return `
    <div class="combat-arena birth-reveal-anim">
      <div class="section-title">
        <span>Combate Táctico por Turnos — Turno ${c.turnNumber}</span>
        <span class="badge badge-danger">${c.isPromotionExam ? 'Examen Oficial de Ascenso' : 'Enfrentamiento en Curso'}</span>
      </div>

      <div class="combat-fighters">
        <div class="card">
          <div class="card-title">${escapeHtml(p.name)} (Tú)</div>
          ${renderStatBar('Salud', s.health, 100, 'bar-health')}
          ${p.origin === 'heavenly_restriction'
            ? `<span class="badge badge-accent">Restricción Celestial (Coste 0 EM)</span>`
            : renderStatBar('Energía Maldita', s.cursedEnergy, s.maxCursedEnergy, 'bar-ce')
          }
          <div class="badge-row">
            ${c.ally ? `<span class="badge badge-success">Aliado: ${escapeHtml(c.ally.name)}</span>` : ''}
            ${c.simpleDomainActive > 0 ? `<span class="badge badge-accent">Dominio Simple (${c.simpleDomainActive}t)</span>` : ''}
            ${c.domainActive > 0 ? `<span class="badge badge-gold">Dominio Activo (${c.domainActive}t)</span>` : ''}
            ${c.domainBurnout > 0 ? `<span class="badge badge-danger">Agotamiento Técnica (${c.domainBurnout}t)</span>` : ''}
          </div>
        </div>

        <div class="card card-danger">
          <div class="card-title">${escapeHtml(enemy.name)}</div>
          ${renderStatBar('Salud Enemiga', enemy.health, enemy.maxHealth, 'bar-danger')}
          <div class="badge-row">
            <span class="badge badge-danger">Ataque: ${enemy.attack}</span>
            <span class="badge">Defensa: ${enemy.defense}</span>
            <span class="badge">Velocidad: ${enemy.speed}</span>
            <span class="badge badge-gold">Especial: ${escapeHtml(enemy.specialName)}</span>
          </div>
        </div>
      </div>

      <div class="subsection-title">Acciones de Combate</div>
      <div class="action-bar">
        <button type="button" class="btn btn-primary" data-combat-action="basic_attack">
          Ataque Básico
        </button>
        <button type="button" class="btn btn-primary" data-combat-action="cursed_technique">
          ${escapeHtml(tech.name)} (${p.origin === 'heavenly_restriction' ? '0' : tech.ceCost} EM)
        </button>
        ${unlockedExtObjs.map((ext) => `
          <button type="button" class="btn btn-secondary" data-combat-action="cursed_technique" data-extension-id="${ext.id}">
            Extensión: ${escapeHtml(ext.name)} (${p.origin === 'heavenly_restriction' ? '0' : ext.ceCost} EM)
          </button>
        `).join('')}
        <button type="button" class="btn btn-secondary" data-combat-action="defend_reinforce">
          Refuerzo / Defensa ${p.unlocks.simpleDomain ? '+ Dominio Simple' : ''}
        </button>
        <button type="button" class="btn btn-danger" data-combat-action="binding_vow">
          Voto Vinculante (-14 Salud / +Ataque y EM)
        </button>
        ${p.unlocks.rct && p.origin !== 'heavenly_restriction' ? `
          <button type="button" class="btn btn-secondary" data-combat-action="use_rct">
            Técnica Inversa RCT (22 EM / +38 Salud)
          </button>
        ` : ''}
        ${p.unlocks.domainExpansion && p.origin !== 'heavenly_restriction' ? `
          <button type="button" class="btn btn-danger" data-combat-action="domain_expansion">
            Expansión de Dominio: ${escapeHtml(tech.domainName)}
          </button>
        ` : ''}
        <button type="button" class="btn btn-outline" data-combat-action="flee">
          Intentar Huir
        </button>
      </div>

      ${consumables.length > 0 ? `
        <div class="subsection-title">Usar Consumible</div>
        <div class="action-bar">
          ${consumables.map((item) => `
            <button type="button" class="btn btn-sm btn-secondary" data-combat-action="use_item" data-item-id="${item.id}">
              Usar ${escapeHtml(item.name)}
            </button>
          `).join('')}
        </div>
      ` : ''}

      <div class="combat-log-box">
        ${c.combatLog.slice().reverse().map((line) => `<div>• ${escapeHtml(line)}</div>`).join('')}
      </div>
    </div>
  `;
}

export function renderTabVida(state) {
  const p = state.player;
  const activeEvent = state.turn?.activeEvent;
  const actionCheck = canPerformQuarterAction(state);
  const canAdvance = p.alive && !p.retired && !state.combat && !activeEvent;
  const isEarlyChildhood = p.age < 6;
  const summary = state.world?.lastAnnualSummary;

  return `
    ${renderEndOfLifeBanner(state)}
    ${renderStageGuideBanner(state)}
    ${state.combat ? renderCombatArena(state) : ''}

    ${summary ? `
      <div class="card" style="margin-bottom: 14px;">
        <div class="card-title" style="font-size: 0.92rem;">Resumen del Último Cumpleaños (Edad alcanzada: ${summary.ageReached} años)</div>
        <div class="badge-row">
          <span class="badge badge-gold">Ingresos/Apoyo anual: ${formatMoney(summary.stipendiumEarned)}</span>
          <span class="badge badge-accent">Calificaciones escolares: ${summary.schoolGrades}/100</span>
          <span class="badge">Actividad maldita: ${summary.curseActivity}%</span>
        </div>
      </div>
    ` : ''}

    <h3 class="subsection-title">
      ${isEarlyChildhood
        ? `Actividades de Primera Infancia (${p.age} ${p.age === 1 ? 'Año' : 'Años'} — Consume 1 de tus 4 acciones)`
        : `Acciones Principales de Vida (${p.age} Años — Consume 1 de tus 4 acciones)`
      }
    </h3>

    ${isEarlyChildhood ? `
      <div class="card-grid" style="margin-bottom: 16px;">
        <div class="card card-highlight">
          <div>
            <div class="card-title">Juegos Interactivos de Desarrollo (Minijuegos)</div>
            <p class="card-desc">Aprende coordinación, agilidad y memoria con minijuegos adaptados a tu primera infancia.</p>
          </div>
          <button type="button" class="btn btn-primary" data-action="go-train-menu" ${!actionCheck.allowed ? 'disabled' : ''}>
            Abrir Juegos de Desarrollo (1 Acción)
          </button>
        </div>

        <div class="card">
          <div>
            <div class="card-title">Jugar y Correr en el Patio</div>
            <p class="card-desc">Desarrollo motor, equilibrio y juegos al aire libre (+Fuerza, +Velocidad, +6 Salud mental).</p>
          </div>
          <button type="button" class="btn btn-secondary" data-quarter-action="child_play" ${!actionCheck.allowed ? 'disabled' : ''}>
            Jugar en el Patio (1 Acción)
          </button>
        </div>

        <div class="card">
          <div>
            <div class="card-title">Aprender Lenguaje y Cuentos con tus Padres</div>
            <p class="card-desc">Escucha relatos familiares y desarrolla tu curiosidad e ingenio (+Inteligencia, +5 Salud mental).</p>
          </div>
          <button type="button" class="btn btn-secondary" data-quarter-action="child_curiosity" ${!actionCheck.allowed ? 'disabled' : ''}>
            Escuchar Cuentos (1 Acción)
          </button>
        </div>

        <div class="card">
          <div>
            <div class="card-title">Percibir Indicios de Energía Maldita</div>
            <p class="card-desc">Observa en silencio las pequeñas sombras invisibles de la casa (+Sensibilidad espiritual).</p>
          </div>
          <button type="button" class="btn btn-secondary" data-quarter-action="child_sense" ${!actionCheck.allowed ? 'disabled' : ''}>
            Sentir Presencias (1 Acción)
          </button>
        </div>

        <div class="card">
          <div>
            <div class="card-title">Dormir la Siesta y Descansar</div>
            <p class="card-desc">Crece sano y reduce cualquier fatiga bajo el cuidado familiar (+28 Salud, +22 Salud Mental).</p>
          </div>
          <button type="button" class="btn btn-secondary" data-quarter-action="rest_recover" ${!actionCheck.allowed ? 'disabled' : ''}>
            Dormir y Descansar (1 Acción)
          </button>
        </div>
      </div>
    ` : `
      <div class="card-grid" style="margin-bottom: 16px;">
        <div class="card card-highlight">
          <div>
            <div class="card-title">Ir al Menú de Entrenamiento (Minijuegos)</div>
            <p class="card-desc">Entrena cualquiera de las 8 modalidades con minijuegos de progreso lento y logarítmico.</p>
          </div>
          <button type="button" class="btn btn-primary" data-action="go-train-menu" ${!actionCheck.allowed ? 'disabled' : ''}>
            Abrir Entrenamiento (1 Acción)
          </button>
        </div>

        <div class="card">
          <div>
            <div class="card-title">${p.age < 15 ? 'Recados y Observación de Ventana' : 'Patrullar y Trabajar'}</div>
            <p class="card-desc">Obtén ingresos en yenes y prestigio según tu etapa de vida (+Dinero, +Prestigio, -3 Salud mental).</p>
          </div>
          <button type="button" class="btn btn-secondary" data-quarter-action="work_patrol" ${!actionCheck.allowed ? 'disabled' : ''}>
            ${p.age < 15 ? 'Hacer Recados (1 Acción)' : 'Ejecutar Patrulla (1 Acción)'}
          </button>
        </div>

        <div class="card">
          <div>
            <div class="card-title">Estudiar Teoría y Barreras</div>
            <p class="card-desc">Mejora logarítmica de Inteligencia táctica, Control y relación institucional.</p>
          </div>
          <button type="button" class="btn btn-secondary" data-quarter-action="study_academics" ${!actionCheck.allowed ? 'disabled' : ''}>
            Estudiar (1 Acción)
          </button>
        </div>

        <div class="card">
          <div>
            <div class="card-title">Descansar y Recuperar Fatiga</div>
            <p class="card-desc">Restaura Salud (+28), Salud mental (+22), Energía maldita y alivia el cansancio acumulado.</p>
          </div>
          <button type="button" class="btn btn-secondary" data-quarter-action="rest_recover" ${!actionCheck.allowed ? 'disabled' : ''}>
            Descansar (1 Acción)
          </button>
        </div>
      </div>
    `}

    <div class="card card-highlight" style="margin-bottom: 16px;">
      <div class="card-title">Avance Anual (+1 Año · Cumpleaños)</div>
      <p class="card-desc">
        Al avanzar pasará <strong>1 año completo</strong>, cumplirás <strong>${p.age + 1} años</strong>, se actualizarán tu familia, el colegio, la economía y el mundo, recuperarás tus <strong>4 acciones</strong> y vivirás un <strong>Evento Principal a pantalla completa</strong>.
      </p>
      <button type="button" id="btn-advance-quarter" class="btn btn-primary btn-block" ${!canAdvance ? 'disabled' : ''}>
        Avanzar Año (+1 Año → Cumplir ${p.age + 1} Años)
      </button>
    </div>

    <h3 class="subsection-title">Crónica Anual de Vida</h3>
    <div class="log-feed">
      ${state.log.slice(0, 18).map((entry) => `
        <div class="log-entry log-${escapeHtml(entry.category)}">
          <div class="log-meta">Edad: ${entry.age} ${entry.age === 1 ? 'año' : 'años'} · Año ${entry.year}</div>
          <div>${escapeHtml(entry.text)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderTabFamilia(state) {
  const p = state.player;
  const fam = state.family || {};
  const actionCheck = canPerformQuarterAction(state);

  return `
    ${renderStageGuideBanner(state)}
    <h2 class="section-title">
      <span>Familia, Crianza y Descendencia</span>
      <span class="badge badge-accent">Crianza: ${escapeHtml(fam.parentingStyle?.name || 'Tradicional')}</span>
    </h2>

    <div class="card-grid" style="margin-bottom: 16px;">
      <div class="card card-highlight">
        <div>
          <div class="card-title">Padre: ${escapeHtml(fam.father?.name || p.parents?.fatherName)}</div>
          <p class="card-desc"><strong>Ocupación:</strong> ${escapeHtml(fam.father?.role || p.parents?.fatherRole)}</p>
          <p class="card-desc"><strong>Edad:</strong> ${fam.father?.age || 30} años · <strong>Estado:</strong> ${fam.father?.alive !== false ? 'Vivo' : 'Fallecido'}</p>
          ${renderStatBar('Relación Paterna', fam.father?.affection ?? 80, 100, 'bar-health')}
        </div>
      </div>

      <div class="card card-highlight">
        <div>
          <div class="card-title">Madre: ${escapeHtml(fam.mother?.name || p.parents?.motherName)}</div>
          <p class="card-desc"><strong>Ocupación:</strong> ${escapeHtml(fam.mother?.role || p.parents?.motherRole)}</p>
          <p class="card-desc"><strong>Edad:</strong> ${fam.mother?.age || 29} años · <strong>Estado:</strong> ${fam.mother?.alive !== false ? 'Viva' : 'Fallecida'}</p>
          ${renderStatBar('Relación Materna', fam.mother?.affection ?? 85, 100, 'bar-health')}
        </div>
      </div>

      ${(fam.grandparents || []).map((gp) => `
        <div class="card">
          <div>
            <div class="card-title">${escapeHtml(gp.name)} (${escapeHtml(gp.relationType)})</div>
            <p class="card-desc"><strong>Edad:</strong> ${gp.age} años · <strong>Estado:</strong> ${gp.alive ? 'Vivo' : 'Fallecido (Herencia entregada)'}</p>
            ${renderStatBar('Afecto', gp.affection, 100, 'bar-gold')}
          </div>
          <button type="button" class="btn btn-sm btn-secondary" data-family-action="visit_grandparent" ${!actionCheck.allowed || !gp.alive ? 'disabled' : ''}>
            Visitar y Escuchar Consejos (1 Acción)
          </button>
        </div>
      `).join('')}

      ${(fam.siblings || []).map((sib) => `
        <div class="card">
          <div>
            <div class="card-title">${escapeHtml(sib.name)} (${escapeHtml(sib.relationType)})</div>
            <p class="card-desc"><strong>Edad:</strong> ${sib.age} años · <strong>Rasgo:</strong> ${escapeHtml(sib.trait)}</p>
            ${renderStatBar('Afecto Fraternal', sib.affection, 100, 'bar-health')}
          </div>
          <button type="button" class="btn btn-sm btn-secondary" data-family-action="interact_sibling" data-member-id="${sib.id}" ${!actionCheck.allowed ? 'disabled' : ''}>
            Pasar Tiempo Juntos (1 Acción)
          </button>
        </div>
      `).join('')}
    </div>

    <div class="card-grid" style="margin-bottom: 16px;">
      <div class="card">
        <div>
          <div class="card-title">Reunión con tus Padres</div>
          <p class="card-desc">Cena y conversa con tus padres para fortalecer la unión familiar y tu estabilidad emocional.</p>
        </div>
        <button type="button" class="btn btn-primary" data-family-action="spend_time_parents" ${!actionCheck.allowed ? 'disabled' : ''}>
          Pasar Tiempo con tus Padres (1 Acción)
        </button>
      </div>

      <div class="card">
        <div>
          <div class="card-title">Solicitar Mesada / Apoyo Familiar</div>
          <p class="card-desc">Si eres menor de 18 años y mantienes buena relación con tus padres, puedes pedir apoyo económico.</p>
        </div>
        <button type="button" class="btn btn-secondary" data-family-action="ask_allowance" ${!actionCheck.allowed || p.age > 17 ? 'disabled' : ''}>
          ${p.age > 17 ? 'Solo hasta los 17 años' : 'Pedir Mesada Familiar (1 Acción)'}
        </button>
      </div>

      <div class="card">
        <div>
          <div class="card-title">Matrimonio y Descendencia</div>
          <p class="card-desc">
            <strong>Cónyuge:</strong> ${escapeHtml(fam.spouse || 'Soltero/a (Puedes casarte desde la pestaña Relaciones a los 18+ años)')}
          </p>
          <p class="card-desc"><strong>Hijos:</strong> ${(fam.children || []).length}</p>
        </div>
        <button type="button" class="btn btn-primary" data-family-action="have_child" ${!actionCheck.allowed || p.age < 18 || !fam.spouse ? 'disabled' : ''}>
          Tener Descendencia con tu Cónyuge (1 Acción)
        </button>
      </div>
    </div>

    ${(fam.children || []).length > 0 ? `
      <h3 class="subsection-title">Tus Hijos y Herederos</h3>
      <div class="card-grid">
        ${fam.children.map((ch) => `
          <div class="card card-highlight">
            <div class="card-title">${escapeHtml(ch.name)} (${ch.age} ${ch.age === 1 ? 'año' : 'años'})</div>
            <p class="card-desc"><strong>Talento Heredado:</strong> ${escapeHtml(ch.talentName)}</p>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

export function renderTabColegio(state) {
  const p = state.player;
  const sch = state.school || {};
  const actionCheck = canPerformQuarterAction(state);
  const activeSport = SPORTS_CATALOG.find((sp) => sp.id === sch.activeSportId);

  return `
    ${renderStageGuideBanner(state)}
    <h2 class="section-title">
      <span>Vida Escolar, Exámenes y Deportes</span>
      <span class="badge badge-accent">${escapeHtml(sch.institutionName || 'Etapa Escolar')}</span>
    </h2>

    <div class="card-grid" style="margin-bottom: 16px;">
      <div class="card card-highlight">
        <div class="card-title">Expediente Académico</div>
        ${renderStatBar('Asistencia a Clases', sch.attendance ?? 100, 100, 'bar-health')}
        ${renderStatBar('Calificaciones', sch.grades ?? 75, 100, 'bar-ce')}
        ${renderStatBar('Disciplina Escolar', sch.discipline ?? 80, 100, 'bar-gold')}
        ${renderStatBar('Reputación Escolar', sch.schoolReputation ?? 50, 100)}
        <div class="badge-row" style="margin-top: 6px;">
          <span class="badge ${sch.hasScholarship ? 'badge-success' : ''}">${sch.hasScholarship ? 'Beca Activa (+6.000 ¥/año)' : 'Sin Beca'}</span>
          <span class="badge badge-gold">Premios Académicos: ${sch.academicAwards || 0}</span>
          <span class="badge badge-accent">Torneos Ganados: ${sch.tournamentsWon || 0}</span>
        </div>
      </div>

      <div class="card">
        <div>
          <div class="card-title">Acciones Académicas (6+ Años)</div>
          <p class="card-desc">Estudia para subir tus calificaciones, rinde el examen anual para optar a una beca de 12.000 ¥ o cambia de institución.</p>
        </div>
        <div class="action-bar">
          <button type="button" class="btn btn-primary btn-sm" data-school-action="study_homework" ${!actionCheck.allowed || p.age < 6 ? 'disabled' : ''}>
            Hacer Tareas y Estudiar (1 Acción)
          </button>
          <button type="button" class="btn btn-secondary btn-sm" data-school-action="take_school_exam" ${!actionCheck.allowed || p.age < 6 ? 'disabled' : ''}>
            Rendir Examen Anual (1 Acción)
          </button>
          <button type="button" class="btn btn-secondary btn-sm" data-school-action="school_tournament" ${!actionCheck.allowed || p.age < 12 ? 'disabled' : ''}>
            Torneo Escolar (12+ Años · 1 Acción)
          </button>
          <button type="button" class="btn btn-outline btn-sm" data-school-action="skip_classes" ${!actionCheck.allowed || p.age < 6 ? 'disabled' : ''}>
            Faltar a Clases (1 Acción)
          </button>
          <button type="button" class="btn btn-outline btn-sm" data-school-action="change_institution" ${!actionCheck.allowed || p.age < 6 ? 'disabled' : ''}>
            Cambiar Sede (Tokio ↔ Kioto)
          </button>
          <button type="button" class="btn btn-danger btn-sm" data-school-action="toggle_enrollment" ${!actionCheck.allowed || p.age < 12 ? 'disabled' : ''}>
            ${sch.stage === 'abandonado' ? 'Retomar Estudios' : 'Abandonar Estudios'}
          </button>
        </div>
      </div>
    </div>

    <h3 class="subsection-title">
      Deportes y Desarrollo Físico (Deporte Activo: ${activeSport ? escapeHtml(activeSport.name) : 'Ninguno'})
    </h3>
    ${activeSport ? `
      <div class="card card-highlight" style="margin-bottom: 14px;">
        <div class="card-title">Entrenamiento de Club: ${escapeHtml(activeSport.name)} (${escapeHtml(activeSport.coachName)})</div>
        <p class="card-desc">${escapeHtml(activeSport.description)}</p>
        <button type="button" class="btn btn-primary" data-school-action="practice_sport" ${!actionCheck.allowed ? 'disabled' : ''}>
          Entrenar y Competir en ${escapeHtml(activeSport.name)} (1 Acción)
        </button>
      </div>
    ` : ''}

    <div class="card-grid">
      ${SPORTS_CATALOG.map((sp) => {
        const isCurrent = sch.activeSportId === sp.id;
        const meetsAge = p.age >= sp.minAge;
        const canAfford = p.money >= sp.cost;
        return `
          <div class="card ${isCurrent ? 'card-highlight' : ''}">
            <div>
              <div class="badge-row" style="margin-bottom: 6px;">
                <span class="badge badge-accent">Edad mín.: ${sp.minAge} años</span>
                <span class="badge badge-gold">Inscripción: ${formatMoney(sp.cost)}</span>
              </div>
              <div class="card-title">${escapeHtml(sp.name)}</div>
              <p class="card-desc"><strong>Entrenador:</strong> ${escapeHtml(sp.coachName)}</p>
              <p class="card-desc">${escapeHtml(sp.description)}</p>
            </div>
            <button
              type="button"
              class="btn ${isCurrent ? 'btn-outline' : 'btn-secondary'}"
              data-school-action="join_sport"
              data-sport-id="${sp.id}"
              ${isCurrent || !meetsAge || !canAfford || !actionCheck.allowed ? 'disabled' : ''}
            >
              ${isCurrent ? 'Inscrito Actualmente' : (!meetsAge ? `Requiere ${sp.minAge} años` : `Inscribirse (${formatMoney(sp.cost)})`)}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderTabRelaciones(state) {
  const p = state.player;
  const actionCheck = canPerformQuarterAction(state);
  const availableMissions = MISSIONS.filter((m) => p.rankOrder >= m.requirements.minRankOrder);
  const defaultDuoMission = availableMissions[availableMissions.length - 1] || MISSIONS[0];
  const totalSocial = state.turn?.totalSocialThisYear || 0;
  const isChildUnder6 = p.age < 6;

  const visibleNpcs = isChildUnder6
    ? NPCS.filter((n) => !['npc_suguru_geto', 'npc_ryomen_sukuna', 'npc_mei_mei'].includes(n.id))
    : NPCS;

  return `
    ${renderStageGuideBanner(state)}
    <h2 class="section-title">
      <span>Personajes Canon y Relaciones (${visibleNpcs.length}/20)</span>
      <span class="badge badge-gold">Cupo Social Anual: ${totalSocial}/${MAX_TOTAL_SOCIAL_PER_YEAR} (Máx. ${MAX_NPC_INTERACTIONS_PER_YEAR} por NPC)</span>
    </h2>

    <div class="card-grid">
      ${visibleNpcs.map((npc) => {
        const rel = state.relationships[npc.id] || { friendship: 0, respect: 0, rivalry: 0, trust: 0, romance: 0, allied: false, betrayed: false };
        const gradeObj = getRankById(npc.grade);
        const intStatus = getNpcInteractionStatus(state, npc.id);
        const canSocial = p.alive && !p.retired && intStatus.canInteract;
        const canDuo = !isChildUnder6 && actionCheck.allowed && canSocial && npc.canDuoMission && (rel.friendship >= 45 || rel.respect >= 45 || rel.allied);
        const isSpouse = state.family?.spouse === npc.name;

        return `
          <div class="card ${rel.allied || isSpouse ? 'card-highlight' : (rel.betrayed ? 'card-danger' : '')}">
            <div>
              <div class="badge-row" style="margin-bottom: 6px;">
                <span class="badge badge-accent">${escapeHtml(gradeObj.name)}</span>
                <span class="badge">${escapeHtml(npc.faction)}</span>
                <span class="badge ${intStatus.perNpc >= intStatus.maxPerNpc ? 'badge-danger' : 'badge-gold'}">
                  Este año: ${intStatus.perNpc}/${intStatus.maxPerNpc}
                </span>
                ${isSpouse ? '<span class="badge badge-success">Cónyuge</span>' : (rel.allied ? '<span class="badge badge-success">Aliado</span>' : '')}
                ${rel.betrayed ? '<span class="badge badge-danger">Traicionado</span>' : ''}
              </div>
              <div class="card-title">${escapeHtml(npc.name)}</div>
              <div class="card-desc" style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(npc.role)}</div>
              <p class="card-desc">${escapeHtml(npc.description)}</p>
            </div>

            <div class="stat-list" style="margin: 8px 0;">
              ${renderStatBar('Amistad', rel.friendship, 100, 'bar-health')}
              ${renderStatBar('Respeto', rel.respect, 100, 'bar-ce')}
              ${renderStatBar('Confianza', rel.trust ?? rel.friendship, 100, 'bar-gold')}
              ${p.age >= 15 ? renderStatBar('Romance', rel.romance || 0, 100, 'bar-danger') : ''}
              ${renderStatBar('Rivalidad', rel.rivalry, 100, 'bar-danger')}
            </div>

            <div class="action-bar">
              <button type="button" class="btn btn-sm btn-secondary" data-npc-id="${npc.id}" data-npc-action="talk" ${!canSocial ? 'disabled' : ''}>
                ${isChildUnder6 ? 'Saludar / Jugar' : 'Conversar'}
              </button>
              ${!isChildUnder6 ? `
                <button type="button" class="btn btn-sm btn-secondary" data-npc-id="${npc.id}" data-npc-action="gift" ${!canSocial || p.money < 7000 ? 'disabled' : ''}>
                  Obsequio (7.000 ¥)
                </button>
              ` : ''}
              ${npc.canTrain && !isChildUnder6 ? `
                <button type="button" class="btn btn-sm btn-primary" data-npc-id="${npc.id}" data-npc-action="train_together" ${!actionCheck.allowed || !canSocial ? 'disabled' : ''}>
                  Entrenar Juntos (1 Acción)
                </button>
              ` : ''}
              ${npc.canDuoMission && !isChildUnder6 ? `
                <button type="button" class="btn btn-sm btn-primary" data-npc-id="${npc.id}" data-duo-mission="${defaultDuoMission.id}" ${!canDuo ? 'disabled' : ''}>
                  Misión en Dúo (1 Acción)
                </button>
              ` : ''}
              ${p.age >= 15 && npc.canAlly ? `
                <button type="button" class="btn btn-sm btn-secondary" data-npc-id="${npc.id}" data-npc-action="date_romance" ${!canSocial || rel.friendship < 50 ? 'disabled' : ''}>
                  Cita Romántica
                </button>
              ` : ''}
              ${p.age >= 18 && (rel.romance || 0) >= 60 && !isSpouse ? `
                <button type="button" class="btn btn-sm btn-primary" data-npc-id="${npc.id}" data-npc-action="marry" ${!canSocial ? 'disabled' : ''}>
                  Casarse
                </button>
              ` : ''}
              ${npc.canAlly && !rel.allied && !rel.betrayed && !isChildUnder6 ? `
                <button type="button" class="btn btn-sm btn-outline" data-npc-id="${npc.id}" data-npc-action="form_alliance" ${!canSocial ? 'disabled' : ''}>
                  Alianza
                </button>
              ` : ''}
              ${!rel.betrayed && !isChildUnder6 ? `
                <button type="button" class="btn btn-sm btn-danger" data-npc-id="${npc.id}" data-npc-action="betray" ${!p.alive || p.retired ? 'disabled' : ''}>
                  Traicionar
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderTabEntrenamiento(state, selectedDifficulty = 'normal') {
  const p = state.player;
  const s = p.stats;
  const actionCheck = canPerformQuarterAction(state);
  const diffObj = TRAINING_DIFFICULTIES[selectedDifficulty] || TRAINING_DIFFICULTIES.normal;
  const isChildUnder6 = p.age < 6;

  return `
    ${renderEndOfLifeBanner(state)}
    ${renderStageGuideBanner(state)}

    <div class="section-title">
      <span>${isChildUnder6 ? 'Desarrollo Infantil con Minijuegos (1 a 5 Años)' : 'Laboratorio de Entrenamiento con Minijuegos (8 Modalidades)'}</span>
      <span class="badge badge-danger">Cansancio actual: ${p.fatigue || 0}/100</span>
    </div>

    <div class="card card-highlight" style="margin-bottom: 14px;">
      <div class="card-title">1. Selecciona el Nivel de Dificultad del Minijuego</div>
      <p class="card-desc">
        <strong>Fórmula de Rendimiento Decreciente:</strong> Ganancia = Base × Dificultad × Factor Edad × Potencial (${p.talent?.growthMultiplier || 1}x) × Rendimiento Logarítmico. Repetir dificultades fáciles a niveles altos otorga mejoras mínimas.
      </p>
      <div class="action-bar">
        ${Object.values(TRAINING_DIFFICULTIES).map((d) => `
          <button
            type="button"
            class="btn ${d.id === diffObj.id ? 'btn-primary' : 'btn-secondary'}"
            data-select-difficulty="${d.id}"
          >
            ${escapeHtml(d.name)} (x${d.multiplier} · -${d.fatigueCost} Salud)
          </button>
        `).join('')}
      </div>
    </div>

    <div class="card-grid">
      ${TRAINING_MODALITIES.map((mod) => {
        let statKey = mod.id;
        if (mod.id === 'stamina') statKey = 'strength';
        if (mod.id === 'concentration') statKey = 'tacticalIntelligence';
        if (mod.id === 'emotionalControl') statKey = 'mentalHealth';

        const currentVal = statKey === 'techniqueMastery' ? p.techniqueMastery : (s[statKey] ?? 20);
        const estimatedGain = calculateTrainingGain({
          currentValue: currentVal,
          difficultyId: diffObj.id,
          age: p.age,
          potentialMultiplier: p.talent?.growthMultiplier || 1.0,
          scoreRatio: 1.0,
          fatigue: p.fatigue || 0
        });
        const meetsAge = p.age >= mod.minAge;
        const displayName = isChildUnder6 ? mod.childName : mod.name;

        return `
          <div class="card ${meetsAge ? '' : 'card-danger'}">
            <div>
              <div class="badge-row" style="margin-bottom: 6px;">
                <span class="badge badge-accent">${escapeHtml(mod.minigameTitle)}</span>
                <span class="badge badge-gold">Nivel: ${formatStat(currentVal)}/100</span>
              </div>
              <div class="card-title">${escapeHtml(displayName)}</div>
              <p class="card-desc">${escapeHtml(mod.description)}</p>
              ${meetsAge ? `
                <p class="card-desc" style="margin-top: 6px; color: #6ee7b7;">
                  Ganancia estimada en ${escapeHtml(diffObj.name)}: <strong>+${estimatedGain} pts</strong>
                </p>
              ` : `
                <p class="card-desc" style="margin-top: 6px; color: #fda4af;">
                  Bloqueado hasta los <strong>${mod.minAge} años (Edad del Despertar)</strong>.
                </p>
              `}
            </div>
            <button
              type="button"
              class="btn btn-primary"
              data-open-minigame="${mod.id}"
              ${!actionCheck.allowed || !meetsAge ? 'disabled' : ''}
            >
              ${!meetsAge ? `Requiere ${mod.minAge} años` : 'Jugar Minijuego (1 Acción)'}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderTabHechiceria(state) {
  const p = state.player;
  const tech = getTechniqueById(p.techniqueId);
  const currentRank = getRankById(p.rank);
  const nextInfo = getNextRankInfo(state);
  const actionCheck = canPerformQuarterAction(state);
  const isChildUnder6 = p.age < 6;

  return `
    ${renderEndOfLifeBanner(state)}
    ${renderStageGuideBanner(state)}
    ${state.combat ? renderCombatArena(state) : ''}

    <h2 class="section-title">Técnica Innata, Dominios, Grados y Caminos de Vida</h2>

    ${isChildUnder6 && p.origin !== 'heavenly_restriction' ? `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-title">Técnica Latente: ${escapeHtml(tech.name)} <span class="badge badge-gold">Despierta a los 6 años</span></div>
        <p class="card-desc">
          Aún tienes ${p.age} ${p.age === 1 ? 'año' : 'años'}. Tu técnica innata despertará cuando cumplas los <strong>6 años</strong>.
        </p>
      </div>
    ` : `
      <div class="card card-highlight" style="margin-bottom: 16px;">
        <div class="card-title">${escapeHtml(tech.name)} <span class="badge badge-accent">${escapeHtml(tech.rarity)}</span></div>
        <p class="card-desc">${escapeHtml(tech.description)}</p>
        <div class="badge-row">
          <span class="badge">Coste Base: ${tech.ceCost} EM</span>
          <span class="badge">Potencia Base: ${tech.basePower}</span>
          <span class="badge">Modificador: x${tech.damageModifier || 1.25}</span>
          <span class="badge badge-gold">Dominio: ${escapeHtml(tech.domainName)}</span>
        </div>
        <div class="card-grid" style="margin-top: 8px;">
          ${(tech.extensions || []).map((ext) => {
            const unlocked = p.unlockedExtensions.includes(ext.id);
            return `
              <div class="card">
                <div class="card-title">${escapeHtml(ext.name)}</div>
                <p class="card-desc">${escapeHtml(ext.description)}</p>
                <div class="badge-row">
                  <span class="badge ${unlocked ? 'badge-success' : 'badge-gold'}">${unlocked ? 'Desbloqueada' : `Requiere Maestría ${ext.unlockMastery}+ y Control ${ext.minControl}+`}</span>
                  <span class="badge">Coste: ${ext.ceCost} EM · Potencia x${ext.powerMultiplier}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <h3 class="subsection-title">Desbloqueos Supremos (Dominio Simple, Técnica Inversa y Expansión de Dominio)</h3>
      <div class="card-grid" style="margin-bottom: 18px;">
        ${Object.values(UNLOCK_REQUIREMENTS).map((req) => {
          const isUnlocked = Boolean(p.unlocks[req.id]);
          const check = canUnlockSpecialSkill(state, req.id);
          return `
            <div class="card ${isUnlocked ? 'card-highlight' : ''}">
              <div>
                <div class="card-title">${escapeHtml(req.name)}</div>
                <p class="card-desc">${escapeHtml(req.description)}</p>
              </div>
              <div class="badge-row">
                <span class="badge">Control ${req.minControl}+</span>
                <span class="badge">Maestría ${req.minMastery}+</span>
                <span class="badge">Inteligencia ${req.minIntelligence}+</span>
              </div>
              <button
                type="button"
                class="btn ${isUnlocked ? 'btn-outline' : 'btn-primary'}"
                data-unlock-skill="${req.id}"
                ${isUnlocked || !check.allowed ? 'disabled' : ''}
              >
                ${isUnlocked ? 'Dominada' : (check.allowed ? 'Desbloquear Ahora' : escapeHtml(check.reason))}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `}

    <h3 class="subsection-title">Escalafón de Hechicería y Exámenes de Grado</h3>
    <div class="card-grid" style="margin-bottom: 16px;">
      <div class="card card-highlight">
        <div>
          <div class="card-title">Rango Actual: ${p.age < 6 ? 'Infante' : escapeHtml(currentRank.name)}</div>
          <div class="badge-row" style="margin-top: 6px;">
            ${RANKS.map((r) => `<span class="badge ${r.id === p.rank ? 'badge-accent' : ''}">${r.order + 1}. ${escapeHtml(r.name)}</span>`).join('')}
          </div>
        </div>
        ${p.age >= 6 && nextInfo ? `
          <div>
            <p class="card-desc"><strong>Siguiente ascenso:</strong> ${escapeHtml(nextInfo.nextRank.name)}</p>
            ${nextInfo.reasons.length > 0 ? `<p class="card-desc" style="color: #fda4af;">Pendiente: ${escapeHtml(nextInfo.reasons.join(' · '))}</p>` : '<p class="card-desc" style="color: #6ee7b7;">Listo para examen oficial.</p>'}
            <button type="button" id="btn-promotion-exam" class="btn btn-primary btn-block" style="margin-top: 8px;" ${!nextInfo.eligible || !actionCheck.allowed ? 'disabled' : ''}>
              Iniciar Examen de Promoción a ${escapeHtml(nextInfo.nextRank.name)} (1 Acción)
            </button>
          </div>
        ` : ''}
      </div>

      <div class="card">
        <div class="card-title">Retiro y Final de Carrera</div>
        <p class="card-desc">Cuando consideres que tu trayectoria ha concluido, puedes retirarte con vida para registrar tu final.</p>
        <button type="button" id="btn-retire-career" class="btn btn-danger btn-block" ${!p.alive || p.retired || state.combat || p.age < 15 ? 'disabled' : ''}>
          ${p.age < 15 ? 'Retiro disponible desde los 15 años' : 'Retirarse de la Vida Activa'}
        </button>
      </div>
    </div>

    <h3 class="subsection-title">Caminos de Vida (9 Caminos según tu Edad y Decisiones)</h3>
    <div class="card-grid">
      ${CAREER_PATHS.map((cp) => {
        const isCurrent = p.careerPath === cp.id;
        const meetsAge = p.age >= (cp.minAge || 1);
        return `
          <div class="card ${isCurrent ? 'card-highlight' : ''}">
            <div>
              <div class="badge-row" style="margin-bottom: 6px;">
                <span class="badge ${meetsAge ? 'badge-accent' : 'badge-danger'}">Edad mín.: ${cp.minAge || 1} años</span>
                ${isCurrent ? '<span class="badge badge-success">Camino Activo</span>' : ''}
              </div>
              <div class="card-title">${escapeHtml(cp.name)}</div>
              <p class="card-desc">${escapeHtml(cp.description)}</p>
            </div>
            <button
              type="button"
              class="btn ${isCurrent ? 'btn-outline' : 'btn-secondary'}"
              data-career-id="${cp.id}"
              ${isCurrent || !meetsAge || !p.alive || p.retired ? 'disabled' : ''}
            >
              ${isCurrent ? 'Camino Actual' : (!meetsAge ? `Requiere ${cp.minAge} años` : 'Adoptar Camino')}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderTabMisiones(state) {
  const p = state.player;
  const actionCheck = canPerformQuarterAction(state);
  const isChildUnder6 = p.age < 6;

  return `
    ${renderEndOfLifeBanner(state)}
    ${renderStageGuideBanner(state)}
    ${state.combat ? renderCombatArena(state) : ''}

    <h2 class="section-title">Tablón de Misiones y Operaciones de Campo</h2>

    ${isChildUnder6 ? `
      <div class="card">
        <div class="card-title">Misiones Bloqueadas en Primera Infancia (1 a 5 Años)</div>
        <p class="card-desc">Un niño menor de 6 años no puede recibir misiones de exorcismo. Crece hasta los 6 años para tus primeras pruebas supervisadas.</p>
      </div>
    ` : `
      <div class="card-grid">
        ${MISSIONS.map((m) => {
          const gradeObj = getRankById(m.grade);
          const minAgeForMission = m.gradeOrder >= 3 ? 15 : (m.gradeOrder >= 1 ? 10 : 6);
          const meetsAge = p.age >= minAgeForMission;
          const meetsGrade = p.rankOrder >= m.requirements.minRankOrder;
          const meetsHp = p.stats.health >= m.requirements.minHealth;
          const canAccept = actionCheck.allowed && meetsAge && meetsGrade && meetsHp;
          return `
            <div class="card">
              <div>
                <div class="badge-row" style="margin-bottom: 6px;">
                  <span class="badge badge-accent">${escapeHtml(gradeObj.name)}</span>
                  <span class="badge badge-danger">Riesgo: ${escapeHtml(m.riskLevel)}</span>
                  <span class="badge badge-gold">Recompensa: ${formatMoney(m.rewards.money)}</span>
                  <span class="badge">Edad mín.: ${minAgeForMission} años</span>
                </div>
                <div class="card-title">${escapeHtml(m.title)}</div>
                <p class="card-desc">${escapeHtml(m.description)}</p>
                <p class="card-desc" style="margin-top: 4px;"><strong>Enemigo:</strong> ${escapeHtml(m.enemyTemplate.name)} (${m.enemyTemplate.maxHealth} PV)</p>
              </div>
              <button
                type="button"
                class="btn btn-primary"
                data-accept-mission="${m.id}"
                data-mission-risk="${m.riskLevel}"
                data-mission-title="${escapeHtml(m.title)}"
                ${!canAccept ? 'disabled' : ''}
              >
                ${!meetsAge ? `Requiere ${minAgeForMission} años` : (!meetsGrade ? `Requiere ${gradeObj.name}` : (!meetsHp ? `Requiere Salud ${m.requirements.minHealth}+` : 'Aceptar Misión (1 Acción)'))}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

export function renderTabViajes(state) {
  const p = state.player;
  const actionCheck = canPerformQuarterAction(state);

  return `
    ${renderStageGuideBanner(state)}
    <h2 class="section-title">
      <span>Viajes, Regiones y Exploración</span>
      <span class="badge badge-gold">Regiones visitadas: ${(state.world?.visitedLocations || []).length}/${TRAVEL_DESTINATIONS.length}</span>
    </h2>

    <div class="card-grid">
      ${TRAVEL_DESTINATIONS.map((dest) => {
        const isCurrent = p.currentLocation === dest.id;
        const meetsAge = p.age >= dest.minAge;
        const meetsRank = p.rankOrder >= dest.minRankOrder;
        const canAfford = p.money >= dest.cost;
        const minRankObj = getRankById(RANKS[dest.minRankOrder]?.id);
        return `
          <div class="card ${isCurrent ? 'card-highlight' : ''}">
            <div>
              <div class="badge-row" style="margin-bottom: 6px;">
                <span class="badge badge-accent">Edad mín.: ${dest.minAge} años</span>
                <span class="badge badge-danger">Riesgo: ${escapeHtml(dest.riskLevel)}</span>
                <span class="badge badge-gold">Coste: ${formatMoney(dest.cost)}</span>
              </div>
              <div class="card-title">${escapeHtml(dest.name)}</div>
              <p class="card-desc">${escapeHtml(dest.description)}</p>
            </div>
            <button
              type="button"
              class="btn ${isCurrent ? 'btn-outline' : 'btn-primary'}"
              data-travel-dest="${dest.id}"
              data-travel-risk="${dest.riskLevel}"
              data-travel-name="${escapeHtml(dest.name)}"
              ${!actionCheck.allowed || !meetsAge || !meetsRank || !canAfford ? 'disabled' : ''}
            >
              ${!meetsAge ? `Requiere ${dest.minAge} años` : (!meetsRank ? `Requiere ${minRankObj.name}` : (!canAfford ? 'Fondos Insuficientes' : (isCurrent ? `Explorar de Nuevo (${formatMoney(dest.cost)})` : `Viajar (${formatMoney(dest.cost)} · 1 Acción)`)))}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderTabEconomia(state) {
  const p = state.player;
  const fam = state.family || {};
  const actionCheck = canPerformQuarterAction(state);
  const currentHouse = HOUSING_TIERS.find((h) => h.id === fam.housingId) || HOUSING_TIERS[0];

  return `
    ${renderStageGuideBanner(state)}
    <h2 class="section-title">
      <span>Economía, Empleos por Edad y Vivienda</span>
      <span class="badge badge-gold">Capital Actual: ${formatMoney(p.money)}</span>
    </h2>

    <div class="card card-highlight" style="margin-bottom: 16px;">
      <div class="card-title">Vivienda Actual: ${escapeHtml(currentHouse.name)}</div>
      <p class="card-desc">${escapeHtml(currentHouse.description)}</p>
      <div class="badge-row">
        <span class="badge badge-success">Recuperación anual +${currentHouse.recoveryBonus} Salud</span>
        <span class="badge badge-gold">Mantenimiento anual: ${formatMoney(currentHouse.upkeepPerYear)}</span>
      </div>
    </div>

    <h3 class="subsection-title">Empleos Disponibles Según tu Edad (Consume 1 Acción)</h3>
    <div class="card-grid" style="margin-bottom: 18px;">
      ${AGE_JOBS.map((job) => {
        const meetsAge = p.age >= job.minAge && p.age <= job.maxAge;
        const meetsInt = !job.minIntelligence || p.stats.tacticalIntelligence >= job.minIntelligence;
        return `
          <div class="card">
            <div>
              <div class="badge-row" style="margin-bottom: 6px;">
                <span class="badge badge-accent">Edad: ${job.minAge}+ años</span>
                <span class="badge badge-gold">Pago: +${formatMoney(job.income)}</span>
                <span class="badge badge-danger">Fatiga: +${job.fatigue}</span>
              </div>
              <div class="card-title">${escapeHtml(job.name)}</div>
              <p class="card-desc">${escapeHtml(job.description)}</p>
            </div>
            <button
              type="button"
              class="btn btn-primary"
              data-family-action="work_age_job"
              data-job-id="${job.id}"
              ${!actionCheck.allowed || !meetsAge || !meetsInt ? 'disabled' : ''}
            >
              ${!meetsAge ? `Requiere ${job.minAge} años` : (!meetsInt ? `Requiere Inteligencia ${job.minIntelligence}+` : `Trabajar (+${formatMoney(job.income)} · 1 Acción)`)}
            </button>
          </div>
        `;
      }).join('')}
    </div>

    <h3 class="subsection-title">Adquirir o Mejorar Vivienda</h3>
    <div class="card-grid">
      ${HOUSING_TIERS.map((h) => {
        const isCurrent = fam.housingId === h.id;
        const canAfford = p.money >= h.price;
        return `
          <div class="card ${isCurrent ? 'card-highlight' : ''}">
            <div>
              <div class="badge-row" style="margin-bottom: 6px;">
                <span class="badge badge-gold">Precio: ${formatMoney(h.price)}</span>
                <span class="badge badge-success">+${h.recoveryBonus} Salud/año</span>
              </div>
              <div class="card-title">${escapeHtml(h.name)}</div>
              <p class="card-desc">${escapeHtml(h.description)}</p>
            </div>
            <button
              type="button"
              class="btn ${isCurrent ? 'btn-outline' : 'btn-secondary'}"
              data-family-action="upgrade_housing"
              data-housing-id="${h.id}"
              ${isCurrent || !canAfford || !actionCheck.allowed ? 'disabled' : ''}
            >
              ${isCurrent ? 'Vivienda Actual' : (!canAfford ? 'Fondos Insuficientes' : `Mudarse (${formatMoney(h.price)})`)}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderTabInventario(state) {
  const p = state.player;
  const equip = getEquipmentBonuses(state);
  const weapon = state.inventory.equippedWeapon ? getItemById(state.inventory.equippedWeapon) : null;
  const talisman = state.inventory.equippedTalisman ? getItemById(state.inventory.equippedTalisman) : null;

  const counts = {};
  for (const id of state.inventory.items) {
    counts[id] = (counts[id] || 0) + 1;
  }
  const ownedIds = Object.keys(counts);

  return `
    ${renderStageGuideBanner(state)}
    <h2 class="section-title">
      <span>Inventario, Herramientas Malditas y Mercado</span>
      <span class="badge badge-gold">Fondos: ${formatMoney(p.money)}</span>
    </h2>

    <div class="card-grid" style="margin-bottom: 16px;">
      <div class="card card-highlight">
        <div class="card-title">Arma Equipada: ${weapon ? escapeHtml(weapon.name) : 'Ninguna'}</div>
        <p class="card-desc">${weapon ? escapeHtml(weapon.description) : 'Equipa una herramienta maldita para incrementar tu ataque.'}</p>
      </div>
      <div class="card card-highlight">
        <div class="card-title">Talismán Equipado: ${talisman ? escapeHtml(talisman.name) : 'Ninguno'}</div>
        <p class="card-desc">${talisman ? escapeHtml(talisman.description) : 'Equipa un talismán para reforzar tu defensa y ahorro de energía.'}</p>
      </div>
      <div class="card">
        <div class="card-title">Bonificaciones Activas</div>
        <div class="badge-row">
          <span class="badge badge-accent">Ataque +${equip.attackBonus}</span>
          <span class="badge badge-success">Defensa +${equip.defenseBonus}</span>
          <span class="badge">Velocidad +${equip.speedBonus}</span>
          <span class="badge">Ahorro EM -${equip.ceCostReduction}</span>
        </div>
      </div>
    </div>

    <h3 class="subsection-title">Objetos en Posesión (${state.inventory.items.length})</h3>
    ${ownedIds.length === 0 ? `<p class="card-desc" style="margin-bottom: 16px;">No tienes objetos en tu inventario.</p>` : `
      <div class="card-grid" style="margin-bottom: 18px;">
        ${ownedIds.map((id) => {
          const item = getItemById(id);
          if (!item) return '';
          const isEquipped = state.inventory.equippedWeapon === id || state.inventory.equippedTalisman === id;
          return `
            <div class="card ${isEquipped ? 'card-highlight' : ''}">
              <div>
                <div class="badge-row" style="margin-bottom: 6px;">
                  <span class="badge">${escapeHtml(item.category)}</span>
                  <span class="badge badge-gold">Cantidad: x${counts[id]}</span>
                  ${isEquipped ? '<span class="badge badge-success">Equipado</span>' : ''}
                </div>
                <div class="card-title">${escapeHtml(item.name)}</div>
                <p class="card-desc">${escapeHtml(item.description)}</p>
              </div>
              <div class="action-bar">
                ${item.category === 'consumible' ? `
                  <button type="button" class="btn btn-sm btn-primary" data-use-item="${item.id}" ${!p.alive || p.retired ? 'disabled' : ''}>
                    Usar
                  </button>
                ` : `
                  <button type="button" class="btn btn-sm btn-secondary" data-equip-item="${item.id}" ${isEquipped || !p.alive || p.retired ? 'disabled' : ''}>
                    ${isEquipped ? 'En Uso' : 'Equipar'}
                  </button>
                `}
                <button type="button" class="btn btn-sm btn-outline" data-sell-item="${item.id}" ${!p.alive || p.retired ? 'disabled' : ''}>
                  Vender (+${formatMoney(item.sellValue)})
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}

    <h3 class="subsection-title">Mercado de Objetos, Reliquias y Suministros</h3>
    <div class="card-grid">
      ${ITEMS.map((item) => {
        const canAfford = p.money >= item.price;
        const meetsRank = p.rankOrder >= (item.requirements?.minRankOrder || 0);
        const minRankObj = getRankById(RANKS[item.requirements?.minRankOrder || 0]?.id);
        return `
          <div class="card">
            <div>
              <div class="badge-row" style="margin-bottom: 6px;">
                <span class="badge badge-accent">${escapeHtml(item.rarity)}</span>
                <span class="badge">${escapeHtml(item.category)}</span>
                <span class="badge badge-gold">${formatMoney(item.price)}</span>
              </div>
              <div class="card-title">${escapeHtml(item.name)}</div>
              <p class="card-desc">${escapeHtml(item.description)}</p>
            </div>
            <button
              type="button"
              class="btn btn-primary"
              data-buy-item="${item.id}"
              ${!canAfford || !meetsRank || !p.alive || p.retired ? 'disabled' : ''}
            >
              ${!meetsRank ? `Requiere ${minRankObj.name}` : (!canAfford ? 'Fondos Insuficientes' : `Comprar (${formatMoney(item.price)})`)}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderTabMundo(state) {
  const w = state.world;
  const fRep = w.factionReputation || { colegio_tecnico: 50, tres_clanes: 45, altos_mandos: 45, sindicato_nocturno: 20 };

  return `
    ${renderStageGuideBanner(state)}
    <h2 class="section-title">Mundo Dinámico, Facciones, Rumores y Logros</h2>

    <div class="card-grid" style="margin-bottom: 16px;">
      <div class="card card-highlight">
        <div class="card-title">Actividad Global de Maldiciones</div>
        ${renderStatBar('Índice de Amenaza Maldita', w.curseActivity, 100, 'bar-danger')}
        <p class="card-desc">Un índice alto incrementa la dificultad de las misiones y desata incidentes globales.</p>
      </div>

      <div class="card">
        <div class="card-title">Reputación por Facción</div>
        ${renderStatBar('Colegio Técnico', fRep.colegio_tecnico ?? 50, 100, 'bar-health')}
        ${renderStatBar('Tres Grandes Clanes', fRep.tres_clanes ?? 45, 100, 'bar-gold')}
        ${renderStatBar('Consejo de Altos Mandos', fRep.altos_mandos ?? state.player.stats.higherUpsRelation, 100, 'bar-ce')}
        ${renderStatBar('Sindicato Nocturno', fRep.sindicato_nocturno ?? 20, 100, 'bar-danger')}
      </div>
    </div>

    <div class="card-grid" style="margin-bottom: 16px;">
      <div class="card">
        <div class="card-title">Noticias del Mundo Jujutsu</div>
        ${(w.worldNews || []).slice(0, 4).map((n) => `<p class="card-desc">• ${escapeHtml(n)}</p>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">Rumores entre Ventanas y Clanes</div>
        ${(w.rumors || []).slice(0, 4).map((r) => `<p class="card-desc">• ${escapeHtml(r)}</p>`).join('')}
      </div>
    </div>

    <h3 class="subsection-title">Incidentes Globales Activos</h3>
    <div class="badge-row" style="margin-bottom: 14px;">
      ${w.globalIncidents.length === 0
        ? '<span class="badge">Sin incidentes críticos declarados</span>'
        : w.globalIncidents.map((inc) => `<span class="badge badge-danger">${escapeHtml(inc)}</span>`).join('')
      }
    </div>

    <h3 class="subsection-title">Logros Desbloqueados (${w.achievements.length})</h3>
    <div class="badge-row" style="margin-bottom: 14px;">
      ${w.achievements.length === 0
        ? '<span class="badge">Ningún logro desbloqueado todavía</span>'
        : w.achievements.map((ach) => `<span class="badge badge-gold">${escapeHtml(ach)}</span>`).join('')
      }
    </div>

    <h3 class="subsection-title">Finales Registrados (${w.unlockedEndings.length})</h3>
    <div class="badge-row">
      ${w.unlockedEndings.length === 0
        ? '<span class="badge">Completa una vida o retírate para registrar un final</span>'
        : w.unlockedEndings.map((end) => `<span class="badge badge-accent">${escapeHtml(end)}</span>`).join('')
      }
    </div>
  `;
}

export function renderTabBitacora(state) {
  const w = state.world;
  const bio = generateBiography(state);

  return `
    ${renderStageGuideBanner(state)}
    <h2 class="section-title">Biografía Generada y Bitácora Completa</h2>

    <div class="card card-highlight" style="margin-bottom: 16px;">
      <div class="card-title">Biografía del Personaje</div>
      <p class="card-desc" style="color: var(--text-primary);">${escapeHtml(bio)}</p>
      <div class="badge-row" style="margin-top: 6px;">
        <span class="badge">Misiones completadas: ${w.completedMissions}</span>
        <span class="badge">Maldiciones exorcizadas: ${w.exorcisedCurses}</span>
        <span class="badge badge-accent">Destellos Negros: ${w.blackFlashesLanded}</span>
        <span class="badge badge-danger">Votos Vinculantes: ${w.bindingVowsTaken}</span>
      </div>
    </div>

    <h3 class="subsection-title">Historial Cronológico Completo (${state.log.length} entradas)</h3>
    <div class="log-feed">
      ${state.log.map((entry) => `
        <div class="log-entry log-${escapeHtml(entry.category)}">
          <div class="log-meta">Edad: ${entry.age} ${entry.age === 1 ? 'año' : 'años'} · Año ${entry.year}</div>
          <div>${escapeHtml(entry.text)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderTabConfiguracion() {
  const prefs = getUiPreferences();
  return `
    <h2 class="section-title">Configuración, Accesibilidad, Sonido y Partidas</h2>

    <div class="card-grid" style="margin-bottom: 18px;">
      <div class="card card-highlight">
        <div class="card-title">Preferencias de Interfaz y Audio</div>
        <div class="action-bar">
          <button type="button" class="btn btn-secondary" data-pref-toggle="animations">
            Animaciones: ${prefs.animationsEnabled ? 'Activadas' : 'Desactivadas'}
          </button>
          <button type="button" class="btn btn-secondary" data-pref-toggle="sound">
            Efectos de Sonido: ${prefs.soundEnabled ? 'Activados' : 'Silenciados'}
          </button>
        </div>
        <div class="form-group" style="margin-top: 8px;">
          <label for="input-sound-volume">Volumen de Efectos (${prefs.soundVolume}%)</label>
          <input id="input-sound-volume" type="range" min="0" max="100" value="${prefs.soundVolume}" class="form-control" />
        </div>
      </div>

      <div class="card">
        <div class="card-title">Tutorial Interactivo (20 Etapas)</div>
        <p class="card-desc">Consulta la guía interactiva paso a paso en cualquier momento.</p>
        <button type="button" data-action="open-tutorial" class="btn btn-primary">
          Abrir Tutorial de 20 Etapas
        </button>
      </div>
    </div>

    ${renderSaveModalContent()}
  `;
}

export function renderTutorialModalContent(stepIndex = 0) {
  return renderStepByStepTutorial(stepIndex);
}

export function renderSaveModalContent() {
  const slots = listSaveSlots();
  return `
    <div class="subsection-title" style="margin-top: 0;">Ranuras en Almacenamiento Local</div>
    <div class="card-grid" style="margin-bottom: 16px;">
      ${slots.map((slot) => `
        <div class="card">
          <div>
            <div class="card-title">${escapeHtml(slot.label)}</div>
            ${slot.exists && slot.summary ? `
              <p class="card-desc">
                <strong>${escapeHtml(slot.summary.name)}</strong> · ${slot.summary.age} años (${escapeHtml(slot.summary.rankName)})
              </p>
              <p class="card-desc" style="font-size: 0.74rem;">Guardado: ${escapeHtml(new Date(slot.savedAt).toLocaleString('es-ES'))}</p>
            ` : `<p class="card-desc">${slot.corrupted ? 'Datos corruptos' : 'Ranura vacía'}</p>`}
          </div>
          <div class="action-bar">
            ${slot.slotId !== 'autosave' ? `
              <button type="button" class="btn btn-sm btn-primary" data-save-slot="${slot.slotId}">Guardar</button>
            ` : ''}
            <button type="button" class="btn btn-sm btn-secondary" data-load-slot="${slot.slotId}" ${!slot.exists ? 'disabled' : ''}>Cargar</button>
            <button type="button" class="btn btn-sm btn-danger" data-delete-slot="${slot.slotId}" ${!slot.exists ? 'disabled' : ''}>Borrar</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="subsection-title">Exportar e Importar Partida (JSON)</div>
    <div class="action-bar" style="margin-bottom: 12px;">
      <button type="button" id="btn-export-json" class="btn btn-secondary">Descargar / Mostrar JSON de Partida</button>
    </div>

    <div class="form-group" style="margin-bottom: 10px;">
      <label for="input-import-file">Importar desde archivo .json</label>
      <input type="file" id="input-import-file" accept=".json,application/json" class="form-control" />
    </div>

    <div class="form-group" style="margin-bottom: 10px;">
      <label for="textarea-save-json">O pega / copia aquí el contenido JSON de la partida</label>
      <textarea id="textarea-save-json" rows="5" class="form-control" placeholder='{"format":"jujutsu-life-save", ...}'></textarea>
    </div>

    <button type="button" id="btn-import-json-text" class="btn btn-primary">Validar e Importar JSON</button>
  `;
}
