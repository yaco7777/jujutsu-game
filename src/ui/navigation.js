export const VALID_TABS = [
  'vida',
  'familia',
  'colegio',
  'relaciones',
  'entrenamiento',
  'hechiceria',
  'misiones',
  'viajes',
  'economia',
  'inventario',
  'mundo',
  'bitacora',
  'configuracion',
  'carrera'
];

let currentTab = 'vida';

export function getActiveTab() {
  return currentTab;
}

export function setActiveTab(tabId, onTabChange) {
  const normalized = tabId === 'carrera' ? 'hechiceria' : tabId;
  if (!VALID_TABS.includes(normalized)) {
    return;
  }
  currentTab = normalized;

  if (typeof document !== 'undefined') {
    const buttons = document.querySelectorAll('#main-nav .nav-tab');
    buttons.forEach((btn) => {
      const isMatch = btn.getAttribute('data-tab') === currentTab;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
  }

  if (typeof onTabChange === 'function') {
    onTabChange(currentTab);
  }
}

export function initNavigation(onTabChange) {
  if (typeof document === 'undefined') {
    return;
  }

  const nav = document.getElementById('main-nav');
  if (nav) {
    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-tab');
      if (!btn) {
        return;
      }
      const tabId = btn.getAttribute('data-tab');
      setActiveTab(tabId, onTabChange);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const index = Number(e.key) - 1;
      setActiveTab(VALID_TABS[index], onTabChange);
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });
}

export function openModal(title, htmlContent) {
  if (typeof document === 'undefined') {
    return;
  }
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!overlay || !titleEl || !bodyEl) {
    return;
  }

  titleEl.textContent = title;
  bodyEl.innerHTML = htmlContent;
  overlay.classList.remove('is-hidden');
}

export function closeModal() {
  if (typeof document === 'undefined') {
    return;
  }
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.add('is-hidden');
  }
}
