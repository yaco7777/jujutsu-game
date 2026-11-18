export function showNotification(message, type = 'info', durationMs = 3800) {
  if (typeof document === 'undefined') {
    return;
  }
  const container = document.getElementById('toast-container');
  if (!container || !message) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, durationMs);
}
