import {
  createInitialGameState,
  generateRandomCharacterConfig,
  validateCharacterConfig
} from '../engine/gameState.js';
import { performQuarterAction, advanceQuarter, retireCharacter } from '../engine/gameLoop.js';
import {
  TRAINING_DIFFICULTIES,
  trainSorcerer,
  attemptUnlockSpecialSkill,
  startPromotionExam,
  changeCareerPath
} from '../engine/progression.js';
import { TRAINING_MODALITIES, executeModalityTraining } from '../engine/trainingEngine.js';
import { performFamilyAction } from '../engine/familyEngine.js';
import { performSchoolAction } from '../engine/schoolEngine.js';
import { travelToDestination } from '../engine/travelEngine.js';
import { resolveEventChoice } from '../engine/eventEngine.js';
import { executeCombatTurn } from '../engine/combatEngine.js';
import { interactWithNpc, startDuoMissionWithNpc } from '../engine/relationships.js';
import { buyItem, sellItem, equipItem, useConsumable } from '../engine/inventory.js';
import {
  saveGameToSlot,
  autoSaveGame,
  loadGameFromSlot,
  deleteSaveSlot,
  exportSaveToJson,
  importSaveFromJson
} from '../engine/saveSystem.js';
import { getActiveTab, setActiveTab, openModal, closeModal } from './navigation.js';
import { showNotification } from './notifications.js';
import { getUiPreferences, updateUiPreferences, triggerVisualEffect } from './animations.js';
import { requestConfirmation } from './confirmations.js';
import { highlightTutorialElement } from './tutorial.js';
import {
  renderHeaderMeta,
  renderSidebarStats,
  renderSidebarLog,
  renderCharacterCreationView,
  renderBirthPreviewView,
  renderFullscreenEventOverlay,
  renderTabVida,
  renderTabFamilia,
  renderTabColegio,
  renderTabRelaciones,
  renderTabEntrenamiento,
  renderTabHechiceria,
  renderTabMisiones,
  renderTabViajes,
  renderTabEconomia,
  renderTabInventario,
  renderTabMundo,
  renderTabBitacora,
  renderTabConfiguracion,
  renderTutorialModalContent,
  renderSaveModalContent
} from './views.js';

let appState = null;
let creationDraft = generateRandomCharacterConfig();
let selectedMinigameDifficulty = 'normal';
let activeMinigameTimer = null;

function clearMinigameTimers() {
  if (activeMinigameTimer) {
    clearInterval(activeMinigameTimer);
    activeMinigameTimer = null;
  }
}

export function getAppState() {
  return appState;
}

export function setAppState(newState) {
  appState = newState;
  renderApp();
}

export function renderApp() {
  if (typeof document === 'undefined') {
    return;
  }

  const headerMeta = document.getElementById('header-meta');
  const sidebarStats = document.getElementById('sidebar-stats');
  const sidebarLog = document.getElementById('sidebar-log');
  const mainView = document.getElementById('main-view');
  const fullscreenEventOverlay = document.getElementById('fullscreen-event-overlay');

  if (!headerMeta || !sidebarStats || !sidebarLog || !mainView) {
    return;
  }

  headerMeta.innerHTML = renderHeaderMeta(appState);
  sidebarStats.innerHTML = renderSidebarStats(appState);
  sidebarLog.innerHTML = renderSidebarLog(appState);

  if (fullscreenEventOverlay) {
    const hasFullscreenEvent = Boolean(
      appState
      && appState.characterCreated
      && !appState.birthPreviewPending
      && appState.player?.alive
      && !appState.player?.retired
      && appState.turn?.activeEvent
    );
    if (hasFullscreenEvent) {
      fullscreenEventOverlay.innerHTML = renderFullscreenEventOverlay(appState);
      fullscreenEventOverlay.classList.remove('is-hidden');
    } else {
      fullscreenEventOverlay.innerHTML = '';
      fullscreenEventOverlay.classList.add('is-hidden');
    }
  }

  if (!appState || !appState.characterCreated) {
    mainView.innerHTML = renderCharacterCreationView(creationDraft);
    bindCreationFormEvents();
    return;
  }

  if (appState.birthPreviewPending) {
    mainView.innerHTML = renderBirthPreviewView(appState);
    bindBirthPreviewEvents();
    return;
  }

  const tab = getActiveTab();
  if (tab === 'vida') {
    mainView.innerHTML = renderTabVida(appState);
  } else if (tab === 'familia') {
    mainView.innerHTML = renderTabFamilia(appState);
  } else if (tab === 'colegio') {
    mainView.innerHTML = renderTabColegio(appState);
  } else if (tab === 'relaciones') {
    mainView.innerHTML = renderTabRelaciones(appState);
  } else if (tab === 'entrenamiento') {
    mainView.innerHTML = renderTabEntrenamiento(appState, selectedMinigameDifficulty);
  } else if (tab === 'hechiceria' || tab === 'carrera') {
    mainView.innerHTML = renderTabHechiceria(appState);
  } else if (tab === 'misiones') {
    mainView.innerHTML = renderTabMisiones(appState);
  } else if (tab === 'viajes') {
    mainView.innerHTML = renderTabViajes(appState);
  } else if (tab === 'economia') {
    mainView.innerHTML = renderTabEconomia(appState);
  } else if (tab === 'inventario') {
    mainView.innerHTML = renderTabInventario(appState);
  } else if (tab === 'mundo') {
    mainView.innerHTML = renderTabMundo(appState);
  } else if (tab === 'bitacora') {
    mainView.innerHTML = renderTabBitacora(appState);
  } else if (tab === 'configuracion') {
    mainView.innerHTML = renderTabConfiguracion(appState);
  }
}

function bindCreationFormEvents() {
  const form = document.getElementById('form-create-character');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const config = {
        name: formData.get('name'),
        pronouns: formData.get('pronouns'),
        region: formData.get('region'),
        rollDestiny: true,
        startAge: 1,
        characterCreated: true,
        birthPreviewPending: true
      };

      const validation = validateCharacterConfig(config);
      if (!validation.valid) {
        showNotification(validation.errors.join(' '), 'error');
        return;
      }

      creationDraft = {
        ...creationDraft,
        name: config.name,
        pronouns: config.pronouns,
        region: config.region
      };

      appState = createInitialGameState(config);
      autoSaveGame(appState);
      triggerVisualEffect('skill_unlock');
      renderApp();
      showNotification('Destino de nacimiento revelado y guardado. Revisa tu origen familiar.', 'info');
    });
  }
}

function bindBirthPreviewEvents() {
  const confirmBtn = document.getElementById('btn-confirm-birth');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      requestConfirmation({
        title: 'Confirmar Inicio Definitivo de Vida',
        description: `¿Deseas comenzar oficialmente la vida de ${appState.player.name} a la edad de 1 año?`,
        consequences: [
          'Tu clan, padres, talento y técnica innata quedarán bloqueados permanentemente para esta partida.',
          'Empezarás con 1 año de edad y 4 acciones disponibles por cada año.'
        ],
        confirmLabel: 'Comenzar Vida (Año 1)',
        onConfirm: () => {
          appState.birthPreviewPending = false;
          const shouldShowTutorial = !appState.tutorialSeen;
          appState.tutorialSeen = true;
          autoSaveGame(appState);
          triggerVisualEffect('age_up');
          setActiveTab('vida', () => renderApp());
          showNotification(`¡Comienza el Año 1 de la vida de ${appState.player.name}!`, 'success');
          if (shouldShowTutorial) {
            openModal('Tutorial Interactivo (20 Etapas) — Jujutsu Life', renderTutorialModalContent(0));
            highlightTutorialElement(0);
          }
        }
      });
    });
  }
}

function launchMinigameModal(modalityId, difficultyId) {
  clearMinigameTimers();
  const modality = TRAINING_MODALITIES.find((m) => m.id === modalityId) || TRAINING_MODALITIES[0];
  const diff = TRAINING_DIFFICULTIES[difficultyId] || TRAINING_DIFFICULTIES.normal;

  if (modality.minigameType === 'black_flash_timing') {
    openTimingMinigame(modality, diff);
  } else if (modality.minigameType === 'hand_signs_memory') {
    openHandSignsMinigame(modality, diff);
  } else {
    openReflexMinigame(modality, diff);
  }
}

function finishMinigame(modalityId, difficultyId, scoreRatio) {
  clearMinigameTimers();
  closeModal();
  const res = executeModalityTraining(appState, modalityId, difficultyId, scoreRatio);
  triggerVisualEffect('stat_up');
  handleResult(res);
}

function openTimingMinigame(modality, diff) {
  const targetStart = 20 + Math.floor(Math.random() * (60 - diff.targetZoneWidth));
  const targetEnd = targetStart + diff.targetZoneWidth;
  const targetCenter = (targetStart + targetEnd) / 2;

  openModal(
    `${modality.minigameTitle} — ${diff.name}`,
    `
      <p class="card-desc">
        Detén el pulso de energía dentro de la <strong>zona carmesí</strong> para maximizar el entrenamiento logarítmico de <strong>${modality.name}</strong>.
      </p>
      <div class="minigame-stage">
        <div class="timing-bar-track">
          <div class="timing-target-zone" style="left: ${targetStart}%; width: ${diff.targetZoneWidth}%;"></div>
          <div id="minigame-timing-cursor" class="timing-cursor" style="left: 0%;"></div>
        </div>
        <button type="button" id="btn-strike-timing" class="btn btn-primary btn-block">
          ¡GOLPEAR EN EL NÚCLEO AHORA!
        </button>
      </div>
    `
  );

  let pos = 0;
  let dir = 1;
  const cursorEl = document.getElementById('minigame-timing-cursor');
  const strikeBtn = document.getElementById('btn-strike-timing');

  activeMinigameTimer = setInterval(() => {
    pos += dir * 2.5;
    if (pos >= 100) {
      pos = 100;
      dir = -1;
    } else if (pos <= 0) {
      pos = 0;
      dir = 1;
    }
    if (cursorEl) {
      cursorEl.style.left = `${pos}%`;
    }
  }, diff.speedMs);

  if (strikeBtn) {
    strikeBtn.addEventListener('click', () => {
      clearMinigameTimers();
      let scoreRatio = 0.3;
      if (pos >= targetStart && pos <= targetEnd) {
        const distFromCenter = Math.abs(pos - targetCenter);
        const halfWidth = diff.targetZoneWidth / 2;
        scoreRatio = 0.85 + (1 - distFromCenter / halfWidth) * 0.25;
      } else {
        const distOutside = Math.min(Math.abs(pos - targetStart), Math.abs(pos - targetEnd));
        scoreRatio = Math.max(0.25, 0.7 - distOutside * 0.015);
      }
      finishMinigame(modality.id, diff.id, scoreRatio);
    });
  }
}

function openHandSignsMinigame(modality, diff) {
  const SEALS = ['Carnero', 'Serpiente', 'Dragón', 'Tigre', 'Pájaro', 'Mono'];
  const sequence = [];
  for (let i = 0; i < diff.sequenceLength; i += 1) {
    sequence.push(SEALS[Math.floor(Math.random() * SEALS.length)]);
  }

  openModal(
    `${modality.minigameTitle} — ${diff.name}`,
    `
      <p class="card-desc">
        Memoriza la secuencia de <strong>${sequence.length} sellos manuales</strong> y repítela en el orden exacto para entrenar <strong>${modality.name}</strong>.
      </p>
      <div class="minigame-stage">
        <div id="minigame-seal-status" class="card-title" style="text-align: center; color: #fbbf24;">
          Observa la secuencia: ${sequence.join(' → ')}
        </div>
        <div id="minigame-seals-grid" class="seals-grid">
          ${SEALS.map((seal) => `
            <button type="button" class="btn btn-secondary seal-btn" data-seal-name="${seal}" disabled>
              Sello: ${seal}
            </button>
          `).join('')}
        </div>
      </div>
    `
  );

  const statusEl = document.getElementById('minigame-seal-status');
  const gridEl = document.getElementById('minigame-seals-grid');
  let playerStep = 0;
  let correctHits = 0;

  activeMinigameTimer = setTimeout(() => {
    if (statusEl) {
      statusEl.textContent = `¡Tu turno! Introduce el sello 1 de ${sequence.length}`;
    }
    if (gridEl) {
      gridEl.querySelectorAll('button').forEach((b) => {
        b.disabled = false;
      });
    }
  }, Math.max(1200, 2600 - (diff.sequenceLength - 3) * 350));

  if (gridEl) {
    gridEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-seal-name]');
      if (!btn || btn.disabled) {
        return;
      }
      const chosen = btn.getAttribute('data-seal-name');
      if (chosen === sequence[playerStep]) {
        correctHits += 1;
      }
      playerStep += 1;

      if (playerStep >= sequence.length) {
        const ratio = Math.max(0.25, correctHits / sequence.length);
        finishMinigame(modality.id, diff.id, ratio);
      } else if (statusEl) {
        statusEl.textContent = `Introduce el sello ${playerStep + 1} de ${sequence.length} (Aciertos: ${correctHits})`;
      }
    });
  }
}

function openReflexMinigame(modality, diff) {
  const totalTargets = diff.reflexTargets;
  let hits = 0;
  let remainingSec = diff.timeLimitSec;

  openModal(
    `${modality.minigameTitle} — ${diff.name}`,
    `
      <p class="card-desc">
        Pulsa los <strong>${totalTargets} nodos críticos (7:3)</strong> antes de que se agote el tiempo para entrenar <strong>${modality.name}</strong>.
      </p>
      <div class="minigame-stage">
        <div class="badge-row" style="justify-content: space-between;">
          <span id="reflex-progress" class="badge badge-accent">Nodos quebrados: 0 / ${totalTargets}</span>
          <span id="reflex-timer" class="badge badge-danger">Tiempo restante: ${remainingSec}s</span>
        </div>
        <div id="reflex-board" class="reflex-board"></div>
      </div>
    `
  );

  const board = document.getElementById('reflex-board');
  const progressEl = document.getElementById('reflex-progress');
  const timerEl = document.getElementById('reflex-timer');

  function spawnNode() {
    if (!board) return;
    board.innerHTML = '';
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'reflex-node';
    node.textContent = '7:3';
    node.style.left = `${8 + Math.floor(Math.random() * 76)}%`;
    node.style.top = `${10 + Math.floor(Math.random() * 68)}%`;

    node.addEventListener('click', () => {
      hits += 1;
      if (progressEl) {
        progressEl.textContent = `Nodos quebrados: ${hits} / ${totalTargets}`;
      }
      if (hits >= totalTargets) {
        finishMinigame(modality.id, diff.id, 1.05);
      } else {
        spawnNode();
      }
    });

    board.appendChild(node);
  }

  spawnNode();

  activeMinigameTimer = setInterval(() => {
    remainingSec -= 1;
    if (timerEl) {
      timerEl.textContent = `Tiempo restante: ${remainingSec}s`;
    }
    if (remainingSec <= 0) {
      const ratio = Math.max(0.25, hits / totalTargets);
      finishMinigame(modality.id, diff.id, ratio);
    }
  }, 1000);
}

function handleResult(res, switchToCombatTab = false) {
  if (!res) {
    return;
  }
  showNotification(res.message, res.ok ? 'success' : 'error');
  if (res.ok && appState && appState.characterCreated) {
    autoSaveGame(appState);
  }
  if (switchToCombatTab && appState?.combat) {
    setActiveTab('misiones', () => renderApp());
    return;
  }
  renderApp();
}

export function bindGlobalUiEvents() {
  if (typeof document === 'undefined') {
    return;
  }

  const fullscreenEventOverlay = document.getElementById('fullscreen-event-overlay');
  if (fullscreenEventOverlay) {
    fullscreenEventOverlay.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-event-id][data-choice-id]');
      if (!btn || !appState) {
        return;
      }
      const evtId = btn.getAttribute('data-event-id');
      const choiceId = btn.getAttribute('data-choice-id');
      handleResult(resolveEventChoice(appState, evtId, choiceId), true);
    });
  }

  const mainView = document.getElementById('main-view');
  if (mainView) {
    mainView.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) {
        return;
      }

      if (btn.getAttribute('data-action') === 'open-tutorial') {
        openModal('Tutorial Interactivo (20 Etapas) — Jujutsu Life', renderTutorialModalContent(0));
        highlightTutorialElement(0);
        return;
      }

      if (btn.hasAttribute('data-pref-toggle')) {
        const key = btn.getAttribute('data-pref-toggle');
        const current = getUiPreferences();
        if (key === 'animations') {
          updateUiPreferences({ animationsEnabled: !current.animationsEnabled });
        } else if (key === 'sound') {
          updateUiPreferences({ soundEnabled: !current.soundEnabled });
        }
        renderApp();
        return;
      }

      if (!appState) {
        return;
      }

      if (btn.getAttribute('data-action') === 'start-new-life') {
        creationDraft = generateRandomCharacterConfig();
        appState = createInitialGameState({ ...creationDraft, characterCreated: false });
        renderApp();
        return;
      }

      if (btn.getAttribute('data-action') === 'go-train-menu') {
        setActiveTab('entrenamiento', () => renderApp());
        return;
      }

      if (btn.hasAttribute('data-select-difficulty')) {
        selectedMinigameDifficulty = btn.getAttribute('data-select-difficulty');
        renderApp();
        return;
      }

      if (btn.hasAttribute('data-open-minigame')) {
        const modalityId = btn.getAttribute('data-open-minigame');
        launchMinigameModal(modalityId, selectedMinigameDifficulty);
        return;
      }

      if (btn.id === 'btn-advance-quarter') {
        const rem = appState.turn?.actionsRemaining ?? 0;
        if (rem > 0) {
          requestConfirmation({
            title: `Avanzar al Año ${appState.player.year + 1} (Cumplir ${appState.player.age + 1} Años)`,
            description: `Aún te quedan ${rem} acciones disponibles este año. ¿Deseas avanzar al siguiente año de todos modos?`,
            consequences: [
              `Cumplirás ${appState.player.age + 1} años y se renovarán tus 4 acciones anuales.`,
              'Se procesará el calendario familiar, escolar, económico y un nuevo acontecimiento principal.'
            ],
            confirmLabel: `Avanzar a los ${appState.player.age + 1} Años`,
            onConfirm: () => {
              triggerVisualEffect('age_up');
              handleResult(advanceQuarter(appState));
            }
          });
        } else {
          triggerVisualEffect('age_up');
          handleResult(advanceQuarter(appState));
        }
        return;
      }

      if (btn.hasAttribute('data-quarter-action')) {
        const act = btn.getAttribute('data-quarter-action');
        if (act === 'work_patrol') triggerVisualEffect('money');
        else triggerVisualEffect('stat_up');
        handleResult(performQuarterAction(appState, act));
        return;
      }

      if (btn.hasAttribute('data-family-action')) {
        const famAct = btn.getAttribute('data-family-action');
        const memberId = btn.getAttribute('data-member-id') || null;
        const jobId = btn.getAttribute('data-job-id') || null;
        const housingId = btn.getAttribute('data-housing-id') || null;
        triggerVisualEffect(famAct === 'work_age_job' || famAct === 'ask_allowance' ? 'money' : 'stat_up');
        handleResult(performFamilyAction(appState, famAct, { memberId, jobId, housingId }));
        return;
      }

      if (btn.hasAttribute('data-school-action')) {
        const schAct = btn.getAttribute('data-school-action');
        const sportId = btn.getAttribute('data-sport-id') || null;
        if (schAct === 'toggle_enrollment' && appState.school?.stage !== 'abandonado') {
          requestConfirmation({
            title: 'Confirmar Abandono de Estudios',
            description: '¿Estás seguro de que deseas abandonar tus estudios actuales?',
            consequences: [
              'Dejarás de recibir formación académica y becas escolares.',
              'Tu relación con los altos mandos disminuirá en 8 puntos (podrás retomarlos más adelante).'
            ],
            danger: true,
            confirmLabel: 'Abandonar Estudios',
            onConfirm: () => handleResult(performSchoolAction(appState, schAct, { sportId }))
          });
          return;
        }
        triggerVisualEffect('stat_up');
        handleResult(performSchoolAction(appState, schAct, { sportId }));
        return;
      }

      if (btn.hasAttribute('data-travel-dest')) {
        const destId = btn.getAttribute('data-travel-dest');
        const risk = btn.getAttribute('data-travel-risk') || 'Bajo';
        const destName = btn.getAttribute('data-travel-name') || destId;
        if (risk === 'Alto' || risk === 'Muy Alto' || risk === 'Extremo') {
          requestConfirmation({
            title: `Confirmar Viaje a Zona Peligrosa: ${destName}`,
            description: `El destino "${destName}" tiene un nivel de riesgo ${risk}. ¿Deseas emprender la expedición?`,
            consequences: [
              'Consumirá 1 acción anual y el coste del viaje en yenes.',
              'Existe probabilidad de encontrar espíritus malditos hostiles en combate.'
            ],
            danger: true,
            confirmLabel: 'Emprender Viaje',
            onConfirm: () => handleResult(travelToDestination(appState, destId), true)
          });
          return;
        }
        handleResult(travelToDestination(appState, destId), true);
        return;
      }

      if (btn.hasAttribute('data-event-id') && btn.hasAttribute('data-choice-id')) {
        const evtId = btn.getAttribute('data-event-id');
        const choiceId = btn.getAttribute('data-choice-id');
        handleResult(resolveEventChoice(appState, evtId, choiceId), true);
        return;
      }

      if (btn.hasAttribute('data-combat-action')) {
        const actionType = btn.getAttribute('data-combat-action');
        const extensionId = btn.getAttribute('data-extension-id') || null;
        const itemId = btn.getAttribute('data-item-id') || null;
        triggerVisualEffect(actionType === 'domain_expansion' ? 'skill_unlock' : 'damage');
        handleResult(executeCombatTurn(appState, actionType, { extensionId, itemId }));
        return;
      }

      if (btn.hasAttribute('data-train-type')) {
        const trainType = btn.getAttribute('data-train-type');
        handleResult(trainSorcerer(appState, trainType));
        return;
      }

      if (btn.hasAttribute('data-unlock-skill')) {
        const skillKey = btn.getAttribute('data-unlock-skill');
        triggerVisualEffect('skill_unlock');
        handleResult(attemptUnlockSpecialSkill(appState, skillKey));
        return;
      }

      if (btn.hasAttribute('data-accept-mission')) {
        const missionId = btn.getAttribute('data-accept-mission');
        const risk = btn.getAttribute('data-mission-risk') || 'Moderado';
        const title = btn.getAttribute('data-mission-title') || 'Misión';
        if (risk === 'Alto' || risk === 'Muy Alto' || risk === 'Severo' || risk === 'Extremo' || risk === 'Apocalíptico') {
          requestConfirmation({
            title: `Confirmar Misión Peligrosa: ${title}`,
            description: `Esta misión tiene riesgo ${risk} y desencadenará un combate mortal. ¿Confirmas el despliegue?`,
            consequences: [
              'Si tu Salud cae a 0 durante el combate, la muerte será permanente (Permadeath).',
              'Consumirá 1 acción anual.'
            ],
            danger: true,
            confirmLabel: 'Desplegarse en Misión',
            onConfirm: () => handleResult(performQuarterAction(appState, 'accept_mission', { missionId }), true)
          });
          return;
        }
        handleResult(performQuarterAction(appState, 'accept_mission', { missionId }), true);
        return;
      }

      if (btn.hasAttribute('data-npc-id') && btn.hasAttribute('data-npc-action')) {
        const npcId = btn.getAttribute('data-npc-id');
        const npcAct = btn.getAttribute('data-npc-action');
        if (npcAct === 'betray') {
          requestConfirmation({
            title: 'Confirmar Traición Irreversible',
            description: '¿Estás seguro de que deseas traicionar a este personaje a cambio de 25.000 ¥ y ventaja táctica?',
            consequences: [
              'La Amistad caerá a 0 y la Rivalidad subirá a 100 permanentemente.',
              'Tu Nivel de Amenaza aumentará y tu Popularidad disminuirá.'
            ],
            danger: true,
            confirmLabel: 'Consumir Traición',
            onConfirm: () => handleResult(interactWithNpc(appState, npcId, npcAct))
          });
          return;
        }
        handleResult(interactWithNpc(appState, npcId, npcAct));
        return;
      }

      if (btn.hasAttribute('data-npc-id') && btn.hasAttribute('data-duo-mission')) {
        const npcId = btn.getAttribute('data-npc-id');
        const missionId = btn.getAttribute('data-duo-mission');
        handleResult(startDuoMissionWithNpc(appState, npcId, missionId), true);
        return;
      }

      if (btn.id === 'btn-promotion-exam') {
        handleResult(startPromotionExam(appState), true);
        return;
      }

      if (btn.id === 'btn-retire-career') {
        requestConfirmation({
          title: 'Confirmar Retiro Definitivo de Carrera',
          description: '¿Deseas retirarte con vida y concluir la trayectoria activa de tu personaje?',
          consequences: [
            'Se calculará y desbloqueará tu Final de Carrera según tus logros, rango y decisiones.',
            'No podrás realizar más acciones en esta partida tras el retiro.'
          ],
          danger: true,
          confirmLabel: 'Confirmar Retiro',
          onConfirm: () => handleResult(retireCharacter(appState))
        });
        return;
      }

      if (btn.hasAttribute('data-career-id')) {
        const careerId = btn.getAttribute('data-career-id');
        if (careerId === 'desertor') {
          requestConfirmation({
            title: 'Confirmar Deserción como Usuario Maldito',
            description: '¿Estás seguro de desertar de las instituciones oficiales y convertirte en Usuario Maldito?',
            consequences: [
              'Tu Nivel de Amenaza subirá en +25 y perderás el respaldo de los altos mandos.',
              'Ganarás un +35 % en encargos clandestinos.'
            ],
            danger: true,
            confirmLabel: 'Convertirse en Usuario Maldito',
            onConfirm: () => handleResult(changeCareerPath(appState, careerId))
          });
          return;
        }
        handleResult(changeCareerPath(appState, careerId));
        return;
      }

      if (btn.hasAttribute('data-buy-item')) {
        triggerVisualEffect('money');
        handleResult(buyItem(appState, btn.getAttribute('data-buy-item')));
        return;
      }

      if (btn.hasAttribute('data-sell-item')) {
        triggerVisualEffect('money');
        handleResult(sellItem(appState, btn.getAttribute('data-sell-item')));
        return;
      }

      if (btn.hasAttribute('data-equip-item')) {
        handleResult(equipItem(appState, btn.getAttribute('data-equip-item')));
        return;
      }

      if (btn.hasAttribute('data-use-item')) {
        triggerVisualEffect('stat_up');
        handleResult(useConsumable(appState, btn.getAttribute('data-use-item')));
      }
    });

    mainView.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'input-sound-volume') {
        updateUiPreferences({ soundVolume: Number(e.target.value) });
      }
    });
  }

  const sidebarStats = document.getElementById('sidebar-stats');
  if (sidebarStats) {
    sidebarStats.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action="open-tutorial"]');
      if (btn) {
        openModal('Tutorial Interactivo (20 Etapas) — Jujutsu Life', renderTutorialModalContent(0));
        highlightTutorialElement(0);
      }
    });
  }

  const tutorialBtn = document.getElementById('btn-open-tutorial');
  if (tutorialBtn) {
    tutorialBtn.addEventListener('click', () => {
      openModal('Tutorial Interactivo (20 Etapas) — Jujutsu Life', renderTutorialModalContent(0));
      highlightTutorialElement(0);
    });
  }

  const quickSaveBtn = document.getElementById('btn-quick-save');
  if (quickSaveBtn) {
    quickSaveBtn.addEventListener('click', () => {
      if (!appState || !appState.characterCreated) {
        showNotification('Crea primero a tu personaje antes de guardar.', 'error');
        return;
      }
      const res = saveGameToSlot(appState, 'slot_1');
      showNotification(res.message, res.ok ? 'success' : 'error');
    });
  }

  const openSavesBtn = document.getElementById('btn-open-saves');
  if (openSavesBtn) {
    openSavesBtn.addEventListener('click', () => {
      clearMinigameTimers();
      openModal('Gestión de Partidas Guardadas', renderSaveModalContent());
    });
  }

  const newLifeBtn = document.getElementById('btn-new-life');
  if (newLifeBtn) {
    newLifeBtn.addEventListener('click', () => {
      clearMinigameTimers();
      creationDraft = generateRandomCharacterConfig();
      appState = createInitialGameState({ ...creationDraft, characterCreated: false });
      renderApp();
      showNotification('Iniciando creación de un nuevo hechicero.', 'info');
    });
  }

  const closeModalBtn = document.getElementById('btn-close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      clearMinigameTimers();
      closeModal();
    });
  }

  const modalBody = document.getElementById('modal-body');
  if (modalBody) {
    modalBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) {
        return;
      }

      if (btn.hasAttribute('data-tutorial-step')) {
        const nextStep = Number(btn.getAttribute('data-tutorial-step'));
        modalBody.innerHTML = renderTutorialModalContent(nextStep);
        highlightTutorialElement(nextStep);
        return;
      }

      if (btn.hasAttribute('data-tutorial-try-tab')) {
        const targetTab = btn.getAttribute('data-tutorial-try-tab');
        closeModal();
        setActiveTab(targetTab, () => renderApp());
        return;
      }

      if (btn.getAttribute('data-action') === 'close-tutorial') {
        closeModal();
        return;
      }

      if (btn.hasAttribute('data-save-slot')) {
        if (!appState || !appState.characterCreated) {
          showNotification('Debes crear un personaje antes de guardar en una ranura.', 'error');
          return;
        }
        const slotId = btn.getAttribute('data-save-slot');
        const res = saveGameToSlot(appState, slotId);
        showNotification(res.message, res.ok ? 'success' : 'error');
        modalBody.innerHTML = renderSaveModalContent();
        return;
      }

      if (btn.hasAttribute('data-load-slot')) {
        const slotId = btn.getAttribute('data-load-slot');
        const res = loadGameFromSlot(slotId);
        showNotification(res.message, res.ok ? 'success' : 'error');
        if (res.ok && res.state) {
          appState = res.state;
          closeModal();
          renderApp();
        }
        return;
      }

      if (btn.hasAttribute('data-delete-slot')) {
        const slotId = btn.getAttribute('data-delete-slot');
        const res = deleteSaveSlot(slotId);
        showNotification(res.message, 'info');
        modalBody.innerHTML = renderSaveModalContent();
        return;
      }

      if (btn.id === 'btn-export-json') {
        if (!appState || !appState.characterCreated) {
          showNotification('No hay una partida activa para exportar.', 'error');
          return;
        }
        const exp = exportSaveToJson(appState);
        if (exp.ok && exp.json) {
          const textarea = document.getElementById('textarea-save-json');
          if (textarea) {
            textarea.value = exp.json;
          }
          try {
            const blob = new Blob([exp.json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jujutsu_life_${appState.player.name.replace(/\s+/g, '_').toLowerCase()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          } catch (_err) {
            // El JSON sigue visible en el textarea
          }
          showNotification('Partida exportada a JSON.', 'success');
        }
        return;
      }

      if (btn.id === 'btn-import-json-text') {
        const textarea = document.getElementById('textarea-save-json');
        const raw = textarea ? textarea.value : '';
        const res = importSaveFromJson(raw);
        showNotification(res.message, res.ok ? 'success' : 'error');
        if (res.ok && res.state) {
          appState = res.state;
          autoSaveGame(appState);
          closeModal();
          renderApp();
        }
      }
    });

    modalBody.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'input-import-file') {
        const file = e.target.files?.[0];
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const text = String(reader.result || '');
          const textarea = document.getElementById('textarea-save-json');
          if (textarea) {
            textarea.value = text;
          }
          const res = importSaveFromJson(text);
          showNotification(res.message, res.ok ? 'success' : 'error');
          if (res.ok && res.state) {
            appState = res.state;
            autoSaveGame(appState);
            closeModal();
            renderApp();
          }
        };
        reader.readAsText(file);
      }
    });
  }
}
