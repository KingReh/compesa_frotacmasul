// Funções de UI e utilitários

import { desiredPlates, generators } from './config.js';

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
  const NEWLINE_PLACEHOLDER = 'DYAD_NEWLINE_PLACEHOLDER';
  const BOLD_START_PLACEHOLDER = 'DYAD_BOLD_START';
  const BOLD_END_PLACEHOLDER = 'DYAD_BOLD_END';

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Replace <strong> tags with placeholders for bold
  tempDiv.querySelectorAll('strong').forEach(strong => {
    strong.outerHTML = `${BOLD_START_PLACEHOLDER}${strong.textContent}${BOLD_END_PLACEHOLDER}`;
  });

  // Replace <br> tags with a unique placeholder
  tempDiv.querySelectorAll('br').forEach(br => {
    br.outerHTML = NEWLINE_PLACEHOLDER;
  });

  // Get the text content, which will now include our placeholders
  let plainText = tempDiv.textContent || '';

  // Replace placeholders with actual formatting
  plainText = plainText.replace(new RegExp(BOLD_START_PLACEHOLDER, 'g'), '*');
  plainText = plainText.replace(new RegExp(BOLD_END_PLACEHOLDER, 'g'), '*');
  plainText = plainText.replace(new RegExp(NEWLINE_PLACEHOLDER, 'g'), '\n');

  // Trim leading/trailing whitespace from the entire string
  return plainText.trim();
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

/**
 * Copies content to the clipboard in both HTML (Rich Text) and Plain Text formats.
 * This ensures compatibility with webmail clients (like Zimbra) and text editors.
 * @param {string} html - The HTML content with inline styles.
 * @param {string} plainText - The plain text fallback.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
export async function copyRichTextToClipboard(html, plainText) {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      console.warn('Clipboard API com suporte a write não disponível. Tentando fallback para texto simples.');
      return copyToClipboard(plainText);
    }

    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' });

    const data = [
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      })
    ];

    await navigator.clipboard.write(data);
    return true;
  } catch (err) {
    console.error('Erro ao copiar Rich Text:', err);
    // Fallback automatico para texto simples se falhar o objeto complexo
    return copyToClipboard(plainText);
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

/**
 * Processes the raw HTML table data to consolidate vehicle balances.
 * If a plate appears multiple times, it prioritizes the non-zero balance.
 * If multiple non-zero balances exist, it returns the maximum one.
 * If all balances are zero, it returns 0.
 * @param {HTMLTableElement} table The raw table element from the imported file.
 * @returns {Object<string, number>} A map of { plate: numeric_balance }.
 */
export function getConsolidatedPlateBalances(table) {
    const plateBalances = {};
    const generatorCodes = generators.map(g => g.code);
    table.querySelectorAll('tr.LinhaImpar, tr.LinhaPar').forEach(row => {
        const plate = row.cells[1]?.textContent.trim();
        const balanceRaw = row.cells[13]?.textContent.trim().replace('R$', '') || '0,00';
        
        if (desiredPlates.includes(plate) || generatorCodes.includes(plate)) {
            if (!plateBalances[plate]) {
                plateBalances[plate] = [];
            }
            // Store the numeric value for easy comparison
            plateBalances[plate].push(parseSaldo(balanceRaw));
        }
    });

    const consolidatedData = {};
    Object.keys(plateBalances).forEach(plate => {
        const balances = plateBalances[plate];
        
        // Find the maximum non-zero balance, or 0 if none exists.
        const nonZeroBalances = balances.filter(b => b !== 0);
        
        if (nonZeroBalances.length > 0) {
            consolidatedData[plate] = Math.max(...nonZeroBalances);
        } else {
            consolidatedData[plate] = 0;
        }
    });
    
    return consolidatedData;
}