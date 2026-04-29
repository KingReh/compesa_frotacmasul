const LS_KEY = 'fuelPrices';

export const defaultFuelPrices = {
  gasolina: 7.25,
  diesel: 7.09,
  gnv: 4.19,
  etanol: 5.70,
  arla32: 3.99
};

const LABELS = {
  gasolina: 'Gasolina',
  diesel: 'Diesel',
  gnv: 'GNV',
  etanol: 'Etanol',
  arla32: 'Arla 32'
};

export function getFuelPrices() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...defaultFuelPrices, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Erro ao carregar preços:', e);
  }
  return { ...defaultFuelPrices };
}

function saveFuelPrices(prices) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(prices));
  } catch (e) {
    console.warn('Erro ao salvar preços:', e);
  }
}

function parseInput(str) {
  const normalized = str.replace(/\./g, '').replace(',', '.');
  const v = parseFloat(normalized);
  return isNaN(v) ? null : v;
}

function fmt(v) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export class FuelPricesManager {
  constructor(triggerElement) {
    this.triggerEl = triggerElement;
    this.modal = null;
    this.currentPrices = getFuelPrices();
    this._attachTrigger();
    this._renderDisplay();
  }

  _attachTrigger() {
    this.triggerEl.style.cursor = 'pointer';
    this.triggerEl.addEventListener('click', () => this._openModal());
  }

  _renderDisplay() {
    // Atualiza o elemento trigger com os preços atuais visualmente
    // (opcional — adapte ao HTML do seu trigger)
  }

  _openModal() {
    if (this.modal) { this.modal.remove(); }

    this.modal = document.createElement('div');
    this.modal.className = 'fuel-modal'; // estilize via CSS existente
    this.modal.innerHTML = this._buildModalHTML();
    document.body.appendChild(this.modal);
    this._setupModalEvents();
  }

  _buildModalHTML() {
    const rows = Object.keys(defaultFuelPrices).map(key => `
      <div class="fuel-modal__row">
        <label for="fp-${key}">${LABELS[key]}</label>
        <div class="fuel-modal__input-wrap">
          <span>R$</span>
          <input id="fp-${key}" type="text" inputmode="decimal"
            value="${fmt(this.currentPrices[key])}" data-key="${key}" />
        </div>
      </div>
    `).join('');

    return `
      <div class="fuel-modal__box">
        <div class="fuel-modal__header">
          <span>Preços de combustível</span>
          <button id="fp-close">✕</button>
        </div>
        <div class="fuel-modal__body">${rows}</div>
        <div class="fuel-modal__footer">
          <button id="fp-reset">Restaurar padrão</button>
          <button id="fp-save">Salvar</button>
        </div>
      </div>
    `;
  }

  _setupModalEvents() {
    this.modal.querySelector('#fp-close')
      .addEventListener('click', () => this._closeModal());

    this.modal.querySelector('#fp-reset')
      .addEventListener('click', () => {
        Object.keys(defaultFuelPrices).forEach(key => {
          const input = this.modal.querySelector(`#fp-${key}`);
          if (input) input.value = fmt(defaultFuelPrices[key]);
        });
      });

    this.modal.querySelector('#fp-save')
      .addEventListener('click', () => {
        const updated = {};
        let valid = true;
        Object.keys(defaultFuelPrices).forEach(key => {
          const val = parseInput(this.modal.querySelector(`#fp-${key}`)?.value || '');
          if (val === null || val <= 0) { valid = false; return; }
          updated[key] = val;
        });
        if (!valid) return;
        this.currentPrices = updated;
        saveFuelPrices(updated);
        this._closeModal();
        // Despacha evento para que a calculadora e outros módulos reajam
        window.dispatchEvent(new CustomEvent('fuelPricesUpdated', { detail: updated }));
      });
  }

  _closeModal() {
    this.modal?.remove();
    this.modal = null;
  }
}