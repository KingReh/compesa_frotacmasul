import { copyToClipboard } from './utils.js';

export class VehicleBalanceCalculator {
  constructor() {
    this.isOpen = false;
    // Static list of vehicles as requested (Specific Order)
    this.vehicles = [
      'RZO3G50',
      'RZO2H73',
      'QYY0G07',
      'SJG1G06',
      'SJE0D78',
      'PCA5320',
      'KII8770',
      'UHJ2C14',
      'PEW3772',
      'MAQ0005',
      'MAQ0003'
    ]; // NO SORTING

    this.values = {}; // { plate: number }
    this.container = null;
    this.render();
    this.loadState();
  }

  // --- PUBLIC API ---

  updateVehicles(table) {
    // No-op: Vehicles are now fixed.
    console.log('Calculator: Using fixed vehicle list, ignoring table update.');
  }

  // --- STATE MANAGEMENT ---

  loadState() {
    const saved = localStorage.getItem('calculatorState');
    if (saved) {
      const { values, isOpen } = JSON.parse(saved);
      this.values = values || {};
      this.isOpen = !!isOpen;
      this.render();
    }
  }

  saveState() {
    localStorage.setItem('calculatorState', JSON.stringify({
      values: this.values,
      isOpen: this.isOpen
    }));
  }

  updateValue(plate, amount) {
    if (amount === 0 || isNaN(amount)) {
      delete this.values[plate];
    } else {
      this.values[plate] = amount;
    }
    this.updateTotalDisplay();
    this.saveState();
  }

  clearValue(plate) {
    delete this.values[plate];
    const input = document.getElementById(`calc-input-${plate}`);
    if (input) input.value = '';
    this.updateTotalDisplay();
    this.saveState();
  }

  clearAll() {
    this.values = {};
    const inputs = this.container.querySelectorAll('.calc-input');
    inputs.forEach(input => input.value = '');
    this.updateTotalDisplay();
    this.saveState();
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
    this.render();
    this.saveState();
  }

  // --- RENDERING ---

  getTotal() {
    return Object.values(this.values).reduce((acc, curr) => acc + curr, 0);
  }

  formatCurrency(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Helper to parse input string "200,50" -> 200.50
  parseInputValue(str) {
    if (!str) return 0;
    // Convert comma to dot for parsing if using pt-BR format input
    // Remove dots (thousands) then replace comma with dot
    const normalized = str.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  render() {
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'vehicle-calculator';
      this.container.className = 'fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-poppins';
      document.body.appendChild(this.container);
    }

    if (!this.isOpen) {
      this.renderMinimized();
    } else {
      this.renderMaximized();
    }
  }

  renderMinimized() {
    const vehicleCount = this.vehicles.length;
    const hasValues = Object.keys(this.values).length > 0;

    this.container.innerHTML = `
      <button id="calc-toggle-btn" class="bg-[#204499] hover:bg-[#1a3880] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center relative group" aria-label="Abrir Calculadora">
        <!-- Badge -->
        ${vehicleCount > 0 ? `
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            ${vehicleCount > 99 ? '99+' : vehicleCount}
          </span>
        ` : ''}
        
        <!-- Calculator Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="8" y1="6" x2="16" y2="6"></line>
          <line x1="16" y1="14" x2="16" y2="14"></line>
          <line x1="8" y1="14" x2="8" y2="14"></line>
          <line x1="12" y1="14" x2="12" y2="14"></line>
          <line x1="16" y1="18" x2="16" y2="18"></line>
          <line x1="8" y1="18" x2="8" y2="18"></line>
          <line x1="12" y1="18" x2="12" y2="18"></line>
        </svg>
        
        <span class="absolute right-[110%] bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Calculadora de Saldo
        </span>
      </button>
    `;

    this.container.querySelector('#calc-toggle-btn').addEventListener('click', () => this.toggleOpen());
  }

  renderMaximized() {
    this.container.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl w-[92vw] sm:w-96 flex flex-col max-h-[85vh] sm:max-h-[80vh] border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        <!-- Header -->
        <div class="bg-[#204499] text-white p-4 rounded-t-xl flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="14"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="16" y1="18" x2="16" y2="18"></line><line x1="8" y1="18" x2="8" y2="18"></line><line x1="12" y1="18" x2="12" y2="18"></line></svg>
            <h3 class="font-semibold text-lg">Calculadora de Saldo</h3>
          </div>
          <button id="calc-close-btn" class="text-blue-100 hover:text-white hover:bg-[#1a3880] p-1 rounded transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Vehicle List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
          ${this.vehicles.length === 0 ? `
            <div class="text-center text-gray-400 py-8">
              <p>Nenhum veículo disponível</p>
            </div>
          ` : this.vehicles.map(plate => {
      const value = this.values[plate] || '';
      const valueStr = value ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '';
      return `
              <div class="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                <span class="font-mono font-medium text-gray-700 w-20 text-sm bg-gray-100 px-2 py-1 rounded text-center select-all">${plate}</span>
                <div class="flex-1 relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input 
                    type="text" 
                    id="calc-input-${plate}"
                    class="calc-input w-full pl-8 pr-8 py-1 text-right text-gray-800 focus:outline-none bg-transparent font-medium" 
                    placeholder="0,00"
                    data-plate="${plate}"
                    value="${valueStr}"
                    inputmode="decimal"
                    autocomplete="off"
                  >
                  <!-- Clear button inside input context -->
                  <button class="calc-clear-item absolute right-1 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 p-1 ${!value ? 'hidden' : ''}" data-plate="${plate}" title="Limpar valor" tabindex="-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            `;
    }).join('')}
        </div>

        <!-- Footer / Total -->
        <div class="bg-gray-50/50 p-4 border-t border-gray-100 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-sm">
          <div class="flex justify-between items-center mb-2">
            <!-- Copy Button Area -->
            <button id="calc-copy-btn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-95 group" title="Copiar relatório">
               <svg class="group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
               <span id="calc-copy-text" class="tracking-wide">Copiar</span>
            </button>
            
            <div class="flex flex-col items-end gap-1">
                <span class="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Total Calculado</span>
                <button id="calc-clear-all" class="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 shadow-sm transition-all hover:shadow-md active:scale-95" title="Limpar tudo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  Limpar
                </button>
            </div>
          </div>
          <div id="calc-total-display" class="text-3xl font-bold text-[#204499] text-right tracking-tight font-poppins drop-shadow-sm">
            R$ ${this.formatCurrency(this.getTotal())}
          </div>
        </div>
      </div>
    `;

    this.setupMaximizedEvents();
  }

  updateTotalDisplay() {
    const display = this.container.querySelector('#calc-total-display');
    if (display) {
      display.textContent = `R$ ${this.formatCurrency(this.getTotal())}`;
    }
  }

  async handleCopy() {
    const total = this.getTotal();
    const totalStr = this.formatCurrency(total);

    let text = '*Solicitação de saldo*\n\n';
    text += 'CPR/CMA SUL\n\n';

    this.vehicles.forEach(plate => {
      const value = this.values[plate];
      if (value && value > 0) {
        text += `${plate} = ${this.formatCurrency(value)}\n`;
      }
    });

    // Check if any value was added, if not maybe just total? 
    // Usually user wants filled items. If empty, it's just headers + total 0.

    text += `\nTotal = ${totalStr}`;

    const success = await copyToClipboard(text);
    if (success) {
      // Feedback
      const btnText = this.container.querySelector('#calc-copy-text');
      const original = btnText.textContent;
      btnText.textContent = 'Copiado!';
      setTimeout(() => {
        btnText.textContent = original;
      }, 2000);
    }
  }

  setupMaximizedEvents() {
    // Close button
    this.container.querySelector('#calc-close-btn').addEventListener('click', () => this.toggleOpen());

    // Copy Button
    this.container.querySelector('#calc-copy-btn')?.addEventListener('click', () => this.handleCopy());

    // Clear All
    this.container.querySelector('#calc-clear-all')?.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar todos os valores?')) {
        this.clearAll();
        // Manually clear inputs to avoid full re-render
        this.container.querySelectorAll('.calc-input').forEach(input => input.value = '');
        this.container.querySelectorAll('.calc-clear-item').forEach(btn => btn.classList.add('hidden'));
      }
    });

    // Inputs
    const inputs = this.container.querySelectorAll('.calc-input');
    inputs.forEach(input => {

      // On Input (Typing)
      input.addEventListener('input', (e) => {
        const plate = e.target.dataset.plate;
        const rawValue = e.target.value;
        const parentDiv = e.target.closest('div.relative');

        // Simple cleanup for calc: allow nums, comma, dot.
        const parsed = this.parseInputValue(rawValue);

        if (rawValue === '') {
          delete this.values[plate];
          parentDiv.querySelector('.calc-clear-item')?.classList.add('hidden');
        } else {
          this.values[plate] = parsed;
          parentDiv.querySelector('.calc-clear-item')?.classList.remove('hidden');
        }

        this.updateTotalDisplay();
        this.saveState();
      });

      // On Blur: Format result
      input.addEventListener('blur', (e) => {
        const rawValue = e.target.value;
        if (rawValue) {
          const parsed = this.parseInputValue(rawValue);
          e.target.value = parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        }
      });
    });

    // Clear Individual Items delegation
    this.container.querySelectorAll('.calc-clear-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const plate = e.currentTarget.dataset.plate;
        this.clearValue(plate);
        // Manually update UI
        const input = document.getElementById(`calc-input-${plate}`);
        if (input) {
          input.value = '';
          input.focus();
        }
        e.currentTarget.classList.add('hidden');
      });
    });
  }
}
