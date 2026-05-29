import { desiredPlates, generators } from '../config.js';
import { parseSaldo, formatCurrency, copyToClipboard, showNotification, getConsolidatedPlateBalances } from '../utils.js';

export function renderVehicleCards(table, maintenanceState) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '';

  // Use a nova função utilitária para obter dados consolidados
  const consolidatedPlateData = getConsolidatedPlateBalances(table);

  desiredPlates.forEach(plate => {
    // Se a placa não foi encontrada no arquivo, seu saldo é 0
    const balanceValue = consolidatedPlateData[plate] !== undefined ? consolidatedPlateData[plate] : 0;
    const balanceFormatted = formatCurrency(balanceValue);

    const isInMaintenance = maintenanceState[plate] || false;
    const card = document.createElement('div');
    card.className = `modern-card ${isInMaintenance ? 'maintenance' : ''} loaded cursor-pointer`;
    card.setAttribute('data-plate', plate);
    card.innerHTML = `
      <div class="mb-4">
        <img src="/img/car_img/${plate.toLowerCase()}.png" alt="Veículo ${plate}" class="loaded" onerror="this.parentElement.innerHTML='<div class=\\'no-image loaded\\'>Imagem não disponível</div>';"/>
      </div>
      <p class="text-xl font-semibold text-gray-800 !mb-3">${plate}</p>
      <p class="text-3xl font-bold ${balanceValue === 0 ? 'zero-balance' : 'text-green-600'} loaded">R$ ${balanceFormatted}</p>
      ${isInMaintenance ? '<div class="maintenance-badge loaded">Em Manutenção</div>' : ''}
    `;
    card.addEventListener('click', async () => {
      if (await copyToClipboard(plate)) showNotification(`Placa ${plate} copiada!`);
    });
    contentDiv.appendChild(card);
  });

  // Renderiza o Cartão de Geradores no local antigo do Materiais Diversos
  renderGeneratorsCard(table, maintenanceState);
}

export function updateVehicleCard(plate, maintenanceState) {
  const card = document.querySelector(`.modern-card[data-plate="${plate}"]`);
  if (card) {
    const isInMaintenance = maintenanceState[plate];
    if (isInMaintenance) {
      card.classList.add('maintenance');
    } else {
      card.classList.remove('maintenance');
    }
    const badge = card.querySelector('.maintenance-badge');
    if (isInMaintenance && !badge) {
      const newBadge = document.createElement('div');
      const isGenerator = plate.startsWith('GER');
      newBadge.className = isGenerator ? 'maintenance-badge loaded text-[9px] px-1 py-0.5 mt-0 shrink-0' : 'maintenance-badge loaded';
      newBadge.textContent = 'Quebrado';
      const targetContainer = isGenerator ? card.querySelector('.flex-col.items-end') : card;
      if (targetContainer) targetContainer.appendChild(newBadge);
    } else if (!isInMaintenance && badge) {
      badge.remove();
    }
  }
}

export function renderMaterialsCard(parentContainer) {
  const target = parentContainer || document.getElementById('content');
  const extraCard = document.createElement('div');
  extraCard.className = 'modern-card p-6 bg-white loaded';
  extraCard.setAttribute('data-materials-card', 'true');
  extraCard.innerHTML = `
    <h2 class="text-center text-xl font-semibold text-gray-700 mb-9">Materiais Diversos</h2>
    <ul class="space-y-4 text-gray-700 text-sm"></ul>
  `;
  target.appendChild(extraCard);
}

export function renderGeneratorsCard(table, maintenanceState) {
  const contentDiv = document.getElementById('content');
  const containerCard = document.createElement('div');
  containerCard.className = 'modern-card p-6 bg-white loaded flex flex-col justify-between';
  containerCard.setAttribute('id', 'generatorsContainerCard');
  containerCard.innerHTML = `
    <h2 class="text-center text-xl font-semibold text-gray-700 mb-6">Geradores</h2>
    <div class="flex flex-col gap-3 flex-grow"></div>
  `;

  const gridDiv = containerCard.querySelector('.flex-col');
  const consolidatedData = getConsolidatedPlateBalances(table);

  generators.forEach(gen => {
    const plate = gen.code;
    const name = gen.name;
    const balanceValue = consolidatedData[plate] !== undefined ? consolidatedData[plate] : 0;
    const balanceFormatted = formatCurrency(balanceValue);
    const isInMaintenance = maintenanceState[plate] || false;
    const subCard = document.createElement('div');
    subCard.className = `modern-card generator-subcard ${isInMaintenance ? 'maintenance' : ''} loaded cursor-pointer flex flex-row items-center justify-between w-full`;
    subCard.setAttribute('data-plate', plate);
    subCard.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <img src="/img/car_img/${plate.toLowerCase()}.png" alt="${plate}" class="loaded shrink-0" onerror="this.outerHTML='<div class=\\'no-image w-10 h-10 loaded shrink-0\\'></div>';"/>
        <div class="flex flex-col text-left">
          <span class="text-xs font-bold text-gray-800 leading-tight">${plate}</span>
          <span class="text-[10px] font-normal text-gray-600 uppercase tracking-wide leading-tight">${name}</span>
        </div>
      </div>
      <div class="flex flex-col items-end justify-center gap-1 shrink-0">
        <span class="text-xs font-bold ${balanceValue === 0 ? 'zero-balance' : 'text-green-600'} loaded">R$ ${balanceFormatted}</span>
        ${isInMaintenance ? '<div class="maintenance-badge loaded text-[9px] px-1 py-0.5 mt-0 shrink-0">Em Manutenção</div>' : ''}
      </div>
    `;

    subCard.addEventListener('click', async () => {
      if (await copyToClipboard(plate)) showNotification(`Placa/Gerador ${plate} copiado!`);
    });

    gridDiv.appendChild(subCard);
  });

  contentDiv.appendChild(containerCard);
}


export function updateMaterialsCard(materialsState) {
  const materialsCard = document.querySelector('.modern-card[data-materials-card="true"]');
  if (materialsCard) {
    materialsCard.querySelector('ul').innerHTML = `
      <li class="flex justify-between items-center loaded">
        <div class="flex items-center gap-3">
          <img src="/img/diversos_img/agua_mineral.png" class="w-10 h-10 object-contain loaded" alt="Ícone de garrafa de água mineral"/>
          <span>Água Mineral</span>
        </div>
        <span class="font-semibold text-gray-800 text-lg">${materialsState['Agua_Mineral'].current} / ${materialsState['Agua_Mineral'].stock}</span>
      </li>
      <li class="flex justify-between items-center loaded">
        <div class="flex items-center gap-3">
          <img src="/img/diversos_img/gas_cozinha.png" class="w-10 h-10 object-contain loaded" alt="Ícone de botijão de gás"/>
          <span>Gás de Cozinha</span>
        </div>
        <span class="font-semibold text-gray-800 text-lg">${materialsState['Gas_Cozinha'].current} / ${materialsState['Gas_Cozinha'].stock}</span>
      </li>
      <li class="flex justify-between items-center loaded">
        <div class="flex items-center gap-3">
          <img src="/img/diversos_img/oleo_maquina.png" class="w-10 h-10 object-contain loaded" alt="Ícone de óleo de máquina"/>
          <span>Óleo de Máquina</span>
        </div>
        <span class="font-semibold text-gray-800 text-lg">${materialsState['Oleo_Maquina'].current} / ${materialsState['Oleo_Maquina'].stock}</span>
      </li>
    `;
  }
}