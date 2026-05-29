import { desiredPlates, generators, vehicles, drivers, units } from '../config.js';
import { toggleModal, getGreeting } from '../utils.js';
import { saveMaintenanceToSupabase } from '../api.js';
import { updateVehicleCard } from './vehicleCards.js';
import { updateQuantityCard } from './summary.js';

export function renderMaintenanceModal(maintenanceState) {
  const maintenanceList = document.getElementById('maintenanceList');
  const allPlates = [...desiredPlates, ...generators.map(g => g.code)];
  maintenanceList.innerHTML = allPlates.map(plate => `
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

/**
 * Generates the HTML for the email report with inline styles.
 * @param {Object} data - The email data.
 * @param {boolean} isClipboard - If true, applies a fixed 600px width for clipboard compatibility.
 * @returns {string} The generated HTML string.
 */
export function generateEmailHtml(data, isClipboard = false) {
  // Para a área de transferência, o container principal NÃO deve ter largura fixa de 600px, apenas a tabela.
  // Isso evita que o texto inicial quebre linha antes da hora.
  const containerStyle = isClipboard
    ? 'text-align: left; margin: 0; padding: 0; font-family: Arial, sans-serif; font-size: 10pt; color: #333;'
    : 'width: 100%; font-family: Arial, sans-serif; font-size: 10pt; color: #333; background-color: white; border: 1px solid #eee; padding: 20px; border-radius: 8px; box-sizing: border-box;';

  const tableWidth = isClipboard ? '625px' : '100%';
  const tableAttrWidth = isClipboard ? '625' : '100%';

  const styles = {
    // A tabela permanece com largura fixa de 625px no clipboard conforme solicitado pelo usuário
    table: `width: ${tableWidth}; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt; color: #333; margin: 0; text-align: left;`,
    tdLabel: 'padding: 8px; background-color: #f4f4f4; font-weight: bold; width: 30%; border: 1px solid #ddd; text-align: left; font-size: 10pt;',
    tdValue: 'padding: 8px; border: 1px solid #ddd; text-align: left; font-size: 10pt;',
    header: 'background-color: #000080; color: white; padding: 10px; text-align: center; border-radius: 4px 4px 0 0; font-size: 10pt;',
    paragraph: `margin: 0 0 15px 0; line-height: 1.5; font-size: 10pt; text-align: left; width: 100%;`
  };

  const tableAttributes = `width="${tableAttrWidth}" align="left"`;
  const vehicleImgUrl = `${window.location.origin}/img/car_img/${data.vehicleSelect.toLowerCase()}.png`;

  // Substituímos qquer \n literal pelos <br> para garantir quebras de linha no HTML
  const greeting = getGreeting().replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
  const introText = `\nGostaria de informar que o veículo de placa <strong>${data.vehicleSelect}</strong>, com <strong>${data.currentKm}</strong> km rodados, necessita de alguns ajustes importantes:`.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
  const issuesBody = data.issues.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');

  return `
    <div style="${containerStyle}">
      <p style="font-size: 10pt; color: #666; margin-bottom: 20px;">
        gadlocados@compesa.com.br<br>
        swamirecife@compesa.com.br, luannesilva@compesa.com.br<br>
        Manutenção do Veículo ${data.vehicleSelect} - ${data.currentKm} km - CMA SUL/GPM
      </p>

      <p style="${styles.paragraph}"><strong>${greeting}</strong></p>
      <br>
      <p style="${styles.paragraph}">
        ${introText}
      </p>
      <br>
      <p style="${styles.paragraph}">
        <strong>${issuesBody}</strong>
      </p>
      <br>
      <table ${tableAttributes} style="${styles.table}">
        <tr>
          <td colspan="2" style="${styles.header}">
            <strong>Dados do Veículo</strong>
          </td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Veículo</td>
          <td style="${styles.tdValue}">
            <img src="${vehicleImgUrl}" alt="Veículo ${data.vehicleSelect}" style="max-width: 150px; height: auto; display: block; border-radius: 4px;">
          </td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Placa</td>
          <td style="${styles.tdValue}">${data.vehicleSelect}</td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Km Atual</td>
          <td style="${styles.tdValue}">${data.currentKm} km</td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Gerência</td>
          <td style="${styles.tdValue}">GERÊNCIA DE PRODUÇÃO METROPOLITANA - GPM</td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Coordenação</td>
          <td style="${styles.tdValue}">COORDENAÇÃO DE MANUTENÇÃO DE ADUTORA - CMA SUL</td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Cidade</td>
          <td style="${styles.tdValue}">Cabo de Santo Agostinho</td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Telefone da Unidade</td>
          <td style="${styles.tdValue}">3412-4460</td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Condutor</td>
          <td style="${styles.tdValue}">${data.driverSelect} (Contato: ${data.driverContact})</td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Unidade de Lotação</td>
          <td style="${styles.tdValue}">${data.unitSelect}</td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Endereço</td>
          <td style="${styles.tdValue}">${data.unitAddress}</td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Localização (Maps)</td>
          <td style="${styles.tdValue}"><a href="${data.unitMaps}" target="_blank" style="font-size: 10pt; color: #0000ee;">${data.unitMaps}</a></td>
        </tr>
        <tr>
          <td style="${styles.tdLabel}">Locadora/Responsável</td>
          <td style="${styles.tdValue}">${data.locadoraSelect}</td>
        </tr>
      </table>
      <div style="clear: both;"></div>
    </div>
  `;
}

export function renderEmailReportModal(data) {
  const emailBody = generateEmailHtml(data, false);
  document.getElementById('emailReportContent').innerHTML = emailBody;
  toggleModal('emailReportModal', true);
}