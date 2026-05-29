import { desiredPlates, placasCPRSUL, fuelPrices } from '../config.js';
import { parseSaldo, formatCurrency, getConsolidatedPlateBalances } from '../utils.js';
import { renderMaterialsCard, updateMaterialsCard } from './vehicleCards.js';

function calculateOperationData(maintenanceState) {
  const cmaSulCount = desiredPlates.length - placasCPRSUL.length;
  const cprSulCount = placasCPRSUL.length;
  const maintenanceCount = desiredPlates.filter(plate => maintenanceState[plate]).length;
  return { cmaSulCount, cprSulCount, maintenanceCount };
}

function updateOperationChart(maintenanceState) {
  const operationCtx = document.getElementById('operationPieChart')?.getContext('2d');
  if (operationCtx) {
    const operationData = calculateOperationData(maintenanceState);
    if (Chart.getChart(operationCtx)) {
      Chart.getChart(operationCtx).destroy();
    }
    new Chart(operationCtx, {
      type: 'pie',
      data: {
        labels: ['CMA SUL', 'CPR SUL', 'Manutenção'],
        datasets: [{
          data: [operationData.cmaSulCount, operationData.cprSulCount, operationData.maintenanceCount],
          backgroundColor: ['#10B981', '#34D399', '#F59E0B']
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: (item) => `${item.label}: ${item.raw} veículos` } }
        }
      }
    });
  }
}

export function updateQuantityCard(maintenanceState) {
  const { cmaSulCount, cprSulCount, maintenanceCount } = calculateOperationData(maintenanceState);
  const quantityCard = document.querySelector('#summaryContainer .modern-card:nth-child(2)');
  if (quantityCard) {
    quantityCard.innerHTML = `
      <h2 class="text-center text-xl font-semibold text-gray-700 mb-6">Veículos em Operação</h2>
      <div id="operationPieChartContainer" class="mb-6 flex justify-center">
        <canvas id="operationPieChart" class="loaded"></canvas>
      </div>
      <div class="flex justify-between text-lg">
        <span class="font-medium">CMA SUL</span>
        <span class="font-bold text-gray-700">${cmaSulCount} veículos</span>
      </div>
      <div class="flex justify-between text-lg mt-2">
        <span class="font-medium">CPR SUL</span>
        <span class="font-bold text-gray-700">${cprSulCount} veículos</span>
      </div>
      <div class="flex justify-between border-t pt-2 mt-6 text-lg font-semibold">
        <span>Manutenção</span>
        <span class="font-bold text-gray-800">${maintenanceCount} veículos</span>
      </div>
    `;
    updateOperationChart(maintenanceState);
  }
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
  const summaryContainer = document.getElementById('summaryContainer');
  summaryContainer.innerHTML = '';

  // 1. Render and update the Materials Card in summaryContainer
  renderMaterialsCard(summaryContainer);
  updateMaterialsCard(materialsState);
  
  // 2. Render quantity card (Veículos em Operação)
  const quantityCard = document.createElement('div');
  quantityCard.className = 'modern-card p-6 bg-white loaded';
  summaryContainer.appendChild(quantityCard);
  updateQuantityCard(maintenanceState);

  // 3. Render fuel prices card
  await renderFuelPricesCard();
}