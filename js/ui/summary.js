import { desiredPlates, placasCPRSUL, fuelPrices } from '../config.js';
import { parseSaldo, formatCurrency, getConsolidatedPlateBalances } from '../utils.js';
import { renderMaterialsCard, updateMaterialsCard } from './vehicleCards.js';

export function updateQuantityCard(maintenanceState) {
  // No-op: O card "Veículos em Operação" foi completamente substituído por "Resumo de Saldo"
}

async function renderFuelPricesCard() {
  const summaryContainer = document.getElementById('summaryContainer');
  const fuelCard = document.createElement('div');
  fuelCard.className = 'modern-card p-6 bg-white loaded';

  const fuelImageMap = {
    gasolina: 'gasol_comun',
    diesel: 'diesel_comum',
    gnv: 'gás_natural',
    etanol: 'etanol_comun',
    arla32: 'arla_32'
  };

  fuelCard.innerHTML = `
    <h2 class="text-center text-xl font-semibold text-gray-700 mb-6">Preços Médios de Combustíveis</h2>
    <ul class="space-y-4 text-gray-700 text-sm">
      ${Object.entries(fuelPrices).map(([key, value]) => {
        const imageName = fuelImageMap[key] || key;
        return `
        <li class="flex justify-between items-center loaded">
          <div class="flex items-center gap-3">
            <img src="/img/combust_img/${imageName}.png" class="w-10 h-10 object-contain loaded" alt="Ícone de ${key}"/>
            <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
          </div>
          <span class="font-semibold text-gray-800 text-lg">R$ ${formatCurrency(value)}</span>
        </li>
      `}).join('')}
    </ul>
  `;
  summaryContainer.appendChild(fuelCard);
}

export async function renderSummary(table, maintenanceState, materialsState) {
  const consolidatedData = getConsolidatedPlateBalances(table);
  
  let totalGeral = 0;
  let totalCPRSUL = 0;
  
  Object.entries(consolidatedData).forEach(([plate, saldo]) => {
    totalGeral += saldo;
    if (placasCPRSUL.includes(plate)) {
      totalCPRSUL += saldo;
    }
  });

  const totalCMASUL = totalGeral - totalCPRSUL;

  const summaryContainer = document.getElementById('summaryContainer');
  summaryContainer.innerHTML = '';

  // 1. Render and update the Materials Card in summaryContainer
  renderMaterialsCard(summaryContainer);
  updateMaterialsCard(materialsState);

  // 2. Render "Resumo de Saldo" card in the 2nd position (where "Veículos em Operação" used to be)
  const resumo = document.createElement('div');
  resumo.className = 'modern-card p-6 text-base text-gray-800 bg-white loaded';
  resumo.innerHTML = `
    <h2 class="text-center text-xl font-semibold text-gray-700 mb-6">Resumo de Saldo</h2>
    <div id="pieChartContainer" class="mb-6 flex justify-center"><canvas id="balancePieChart" class="loaded"></canvas></div>
    <div class="flex justify-between text-lg"><span class="font-medium">CMA SUL</span><span class="font-bold text-green-700 text-xl">R$ ${formatCurrency(totalCMASUL)}</span></div>
    <div class="flex justify-between text-lg mt-2"><span class="font-medium">CPR SUL</span><span class="font-bold text-green-700 text-xl">R$ ${formatCurrency(totalCPRSUL)}</span></div>
    <div class="flex justify-between border-t pt-2 mt-6 text-xl font-semibold"><span>Total</span><span class="text-green-800 font-bold text-2xl">R$ ${formatCurrency(totalGeral)}</span></div>
  `;
  summaryContainer.appendChild(resumo);

  const balanceCtx = document.getElementById('balancePieChart')?.getContext('2d');
  if (balanceCtx) {
    new Chart(balanceCtx, {
      type: 'pie',
      data: {
        labels: ['CMA SUL', 'CPR SUL'],
        datasets: [{
          data: [totalCMASUL, totalCPRSUL],
          backgroundColor: ['#10B981', '#34D399']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: (item) => `${item.label}: R$ ${formatCurrency(item.raw)}` } }
        }
      }
    });
  }

  // 3. Render fuel prices card
  await renderFuelPricesCard();
}