// Funções de UI e utilitários

export function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification show';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}

export function showError(message) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = `<p class="text-red-500 text-center">${message}</p>`;
}

function manageBackdrop(show) {
  let backdrop = document.querySelector('.modal-backdrop');
  if (show && !backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }
  if (backdrop) {
    backdrop.classList.toggle('show', show);
  }
}

export function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (modal) {
        manageBackdrop(show);
        modal.classList.toggle('hidden', !show);
        modal.classList.toggle('show', show);
    }
}

export function parseSaldo(valor) {
  return parseFloat(valor.replace('.', '').replace(',', '.')) || 0;
}

export function formatCurrency(value) {
  const formatted = value.toFixed(2).replace('.', ',');
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatDateToBrazilian(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  // Adjust for timezone offset to prevent date from changing
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function htmlToPlainText(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia!";
  if (hour < 18) return "Boa tarde!";
  return "Boa noite!";
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    console.warn('API navigator.clipboard não suportada.');
    return false;
  } catch (err) {
    console.error('Erro ao copiar para a área de transferência:', err);
    return false;
  }
}

export function calculateDaysAbsent(entryDate) {
    if (!entryDate) return 0;
    const today = new Date();
    const entry = new Date(entryDate);
    if (isNaN(entry.getTime())) return 0;
    const diffTime = today - entry;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
}