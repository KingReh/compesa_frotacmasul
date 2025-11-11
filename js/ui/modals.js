import { desiredPlates, vehicles, drivers, units } from '../config.js';
import { toggleModal, getGreeting } from '../utils.js';
import { saveMaintenanceToSupabase } from '../api.js';
import { updateVehicleCard } from './vehicleCards.js';
import { updateQuantityCard } from './summary.js';

export function renderMaintenanceModal(maintenanceState) {
  const maintenanceList = document.getElementById('maintenanceList');
  maintenanceList.innerHTML = desiredPlates.map(plate => `
    <li class="flex justify-between items-center">
      <span class="text-gray-700">${plate}</span>
      <label class="switch">
        <input type="checkbox" ${maintenanceState[plate] ? 'checked' : ''} data-plate="${plate}">
        <span class="slider round"></span>
      </label>
    </li>
  `).join('');

  maintenanceList.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', async (e) => {
      const plate = e.target.dataset.plate;
      maintenanceState[plate] = e.target.checked;
      await saveMaintenanceToSupabase(plate, maintenanceState[plate]);
      updateVehicleCard(plate, maintenanceState);
      updateQuantityCard(maintenanceState);
    });
  });
}

export function renderMiscModal(materialsState) {
  const miscList = document.getElementById('miscList');
  const materials = [
    { id: 'Agua_Mineral', name: 'Água Mineral', img: '/img/diversos_img/agua_mineral.png', hasStock: true },
    { id: 'Gas_Cozinha', name: 'Gás de Cozinha', img: '/img/diversos_img/gas_cozinha.png', hasStock: true },
    { id: 'Oleo_Maquina', name: 'Óleo de Máquina', img: '/img/diversos_img/oleo_maquina.png', hasStock: false }
  ];

  miscList.innerHTML = materials.map(m => {
    const currentInputHTML = `
      <div class="${!m.hasStock ? 'col-span-2' : ''}">
        <label class="text-sm text-gray-500">Estoque na ETA</label>
        <div class="input-spinner mt-1">
          <button type="button" class="spinner-btn" data-action="decrement" data-target-id="${m.id}-current">-</button>
          <input type="number" id="${m.id}-current" min="0" value="${materialsState[m.id].current}" data-material="${m.id}" data-type="current">
          <button type="button" class="spinner-btn" data-action="increment" data-target-id="${m.id}-current">+</button>
        </div>
      </div>
    `;

    const stockInputHTML = m.hasStock ? `
      <div>
        <label class="text-sm text-gray-500">Estoque no Fornecedor</label>
        <div class="input-spinner mt-1">
          <button type="button" class="spinner-btn" data-action="decrement" data-target-id="${m.id}-stock">-</button>
          <input type="number" id="${m.id}-stock" min="0" value="${materialsState[m.id].stock}" data-material="${m.id}" data-type="stock">
          <button type="button" class="spinner-btn" data-action="increment" data-target-id="${m.id}-stock">+</button>
        </div>
      </div>
    ` : '';

    return `
      <li class="flex flex-col gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <img src="${m.img}" class="w-10 h-10 object-contain" alt="Ícone de ${m.name}"/>
          <span class="font-medium text-gray-700">${m.name}</span>
        </div>
        <div class="grid grid-cols-2 gap-4">
          ${currentInputHTML}
          ${stockInputHTML}
        </div>
      </li>
    `;
  }).join('');

  miscList.querySelectorAll('.spinner-btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const targetId = button.dataset.targetId;
      const input = document.getElementById(targetId);
      if (input) {
        let currentValue = parseInt(input.value, 10) || 0;
        if (action === 'increment') {
          currentValue++;
        } else if (action === 'decrement' && currentValue > 0) {
          currentValue--;
        }
        input.value = currentValue;
      }
    });
  });
}

export function renderRequestMaintenanceModal() {
  const vehicleSelect = document.getElementById('vehicleSelect');
  const driverSelect = document.getElementById('driverSelect');
  const unitSelect = document.getElementById('unitSelect');

  vehicleSelect.innerHTML = '<option value="">Selecione um veículo</option>' + vehicles.map(v => `<option value="${v.plate}">${v.plate}</option>`).join('');
  driverSelect.innerHTML = '<option value="">Selecione um condutor</option>' + drivers.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  unitSelect.innerHTML = '<option value="">Selecione uma unidade</option>' + units.map(u => `<option value="${u.name}">${u.name}</option>`).join('');

  driverSelect.addEventListener('change', () => {
    const driver = drivers.find(d => d.name === driverSelect.value);
    document.getElementById('driverContact').value = driver ? driver.contact : '';
  });
  unitSelect.addEventListener('change', () => {
    const unit = units.find(u => u.name === unitSelect.value);
    document.getElementById('unitAddress').value = unit ? unit.address : '';
    document.getElementById('unitMaps').value = unit ? unit.maps : '';
  });
  vehicleSelect.addEventListener('change', () => {
    const vehicle = vehicles.find(v => v.plate === vehicleSelect.value);
    document.getElementById('locadoraSelect').value = vehicle ? vehicle.locadora : '';
  });
}

export function renderEmailReportModal(data) {
  const emailBody = `
    <strong>Destinatário:</strong> gadlocados@compesa.com.br<br>
    <strong>Cc:</strong> swamirecife@compesa.com.br, luannesilva@compesa.com.br<br>
    <strong>Assunto:</strong> Manutenção do Veículo ${data.vehicleSelect} Km ${data.currentKm} - CMA SUL/GPM<br><br>
    ${getGreeting()}<br><br>
    Gostaria de informar que o veículo de placa <strong>${data.vehicleSelect}</strong>, com <strong>${data.currentKm}</strong> km rodados, necessita de alguns ajustes importantes. Abaixo, listo os problemas identificados:<br><br>
    ${data.issues.replace(/\n/g, '<br>')}<br><br>
    <strong>Gerência:</strong> GERÊNCIA DE PRODUÇÃO METROPOLITANA - GPM<br>
    <strong>Coordenação:</strong> COORDENAÇÃO DE MANUTENÇÃO DE ADUTORA - CMA SUL<br>
    <strong>Cidade onde o veículo se encontra:</strong> Cabo de Santo Agostinho<br>
    <strong>Telefone da unidade:</strong> 3412-9797<br>
    <strong>Contato do condutor do veículo:</strong> ${data.driverContact} - ${data.driverSelect}<br>
    <strong>Unidade de lotação do veículo:</strong> ${data.unitSelect}<br>
    <strong>Endereço da unidade:</strong> ${data.unitAddress}<br>
    <strong>Google Maps:</strong> <a href="${data.unitMaps}" target="_blank">${data.unitMaps}</a><br>
    <strong>Locadora/Responsável:</strong> ${data.locadoraSelect}
  `;
  document.getElementById('emailReportContent').innerHTML = emailBody;
  toggleModal('emailReportModal', true);
}