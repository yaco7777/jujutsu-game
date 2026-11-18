import { createInitialGameState, generateRandomCharacterConfig } from './engine/gameState.js';
import { loadGameFromSlot } from './engine/saveSystem.js';
import { initNavigation } from './ui/navigation.js';
import { setAppState, renderApp, bindGlobalUiEvents } from './ui/render.js';
import { showNotification } from './ui/notifications.js';

export function bootstrapApp() {
  initNavigation(() => {
    renderApp();
  });

  bindGlobalUiEvents();

  const autoLoaded = loadGameFromSlot('autosave');
  if (autoLoaded.ok && autoLoaded.state) {
    setAppState(autoLoaded.state);
    showNotification(`Partida restaurada automáticamente: ${autoLoaded.state.player.name}.`, 'info');
  } else {
    const draft = generateRandomCharacterConfig();
    const initial = createInitialGameState({ ...draft, characterCreated: false });
    setAppState(initial);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
  } else {
    bootstrapApp();
  }
}
