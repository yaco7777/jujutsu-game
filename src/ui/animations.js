const uiPreferences = {
  animationsEnabled: true,
  soundEnabled: true,
  soundVolume: 40
};

let audioCtx = null;

export function getUiPreferences() {
  return { ...uiPreferences };
}

export function updateUiPreferences(partial = {}) {
  if (typeof partial.animationsEnabled === 'boolean') {
    uiPreferences.animationsEnabled = partial.animationsEnabled;
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('reduce-motion', !uiPreferences.animationsEnabled);
    }
  }
  if (typeof partial.soundEnabled === 'boolean') {
    uiPreferences.soundEnabled = partial.soundEnabled;
  }
  if (typeof partial.soundVolume === 'number') {
    uiPreferences.soundVolume = Math.min(100, Math.max(0, Math.round(partial.soundVolume)));
  }
  return getUiPreferences();
}

export function playSoundEffect(type = 'click') {
  if (!uiPreferences.soundEnabled || uiPreferences.soundVolume <= 0) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  try {
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const vol = (uiPreferences.soundVolume / 100) * 0.12;

    if (type === 'stat_up' || type === 'skill_unlock') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.14);
    } else if (type === 'money') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
    } else if (type === 'damage') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, audioCtx.currentTime + 0.16);
    } else if (type === 'age_up') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(523, audioCtx.currentTime + 0.18);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, audioCtx.currentTime);
    }

    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.19);
  } catch (_err) {
    // Ignorar silenciosamente si el navegador bloquea autoplay de audio
  }
}

export function triggerVisualEffect(type = 'stat_up') {
  playSoundEffect(type);

  if (!uiPreferences.animationsEnabled || typeof document === 'undefined') {
    return;
  }

  const mainView = document.getElementById('main-view');
  if (!mainView) {
    return;
  }

  const classMap = {
    stat_up: 'fx-stat-up',
    money: 'fx-money-gain',
    damage: 'fx-damage-hit',
    age_up: 'fx-age-up',
    skill_unlock: 'fx-skill-unlock'
  };

  const fxClass = classMap[type] || 'fx-stat-up';
  mainView.classList.remove(fxClass);
  void mainView.offsetWidth;
  mainView.classList.add(fxClass);

  setTimeout(() => {
    mainView.classList.remove(fxClass);
  }, 550);
}
