import { openModal, closeModal } from './navigation.js';

let pendingConfirmCallback = null;

export function requestConfirmation({
  title = 'Confirmar Decisión Importante',
  description = '¿Estás seguro de que deseas continuar?',
  consequences = [],
  confirmLabel = 'Confirmar y Ejecutar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm = null
}) {
  pendingConfirmCallback = typeof onConfirm === 'function' ? onConfirm : null;

  const consequencesHtml = Array.isArray(consequences) && consequences.length > 0
    ? `
      <div class="card ${danger ? 'card-danger' : 'card-highlight'}" style="margin: 12px 0;">
        <div class="card-title" style="font-size: 0.9rem;">Consecuencias Conocidas:</div>
        <ul style="margin: 6px 0 0 18px; font-size: 0.84rem; color: var(--text-secondary);">
          ${consequences.map((c) => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const html = `
    <p class="card-desc" style="color: var(--text-primary); font-size: 0.94rem;">${description}</p>
    ${consequencesHtml}
    <div class="action-bar" style="justify-content: flex-end; margin-top: 14px;">
      <button type="button" id="btn-confirm-cancel" class="btn btn-outline">${cancelLabel}</button>
      <button type="button" id="btn-confirm-proceed" class="btn ${danger ? 'btn-danger' : 'btn-primary'}">${confirmLabel}</button>
    </div>
  `;

  openModal(title, html);

  if (typeof document !== 'undefined') {
    const cancelBtn = document.getElementById('btn-confirm-cancel');
    const proceedBtn = document.getElementById('btn-confirm-proceed');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        pendingConfirmCallback = null;
        closeModal();
      });
    }

    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        const cb = pendingConfirmCallback;
        pendingConfirmCallback = null;
        closeModal();
        if (cb) {
          cb();
        }
      });
    }
  }
}
