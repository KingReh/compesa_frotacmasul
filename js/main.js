import { desiredPlates } from './config.js';
import { showNotification, showError, toggleModal, htmlToPlainText, copyToClipboard, copyRichTextToClipboard } from './utils.js';
import { loadStateFromSupabase, saveMaterialsToSupabase } from './api.js';
import { initializeMaintenanceNotes } from './maintenance_notes.js';
import { renderVehicleCards, renderMaterialsCard, updateMaterialsCard } from './ui/vehicleCards.js';
import { renderSummary } from './ui/summary.js';
import { renderMaintenanceModal, renderMiscModal, renderRequestMaintenanceModal, renderEmailReportModal, generateEmailHtml } from './ui/modals.js';
import { setupDragAndDrop } from './handlers/fileHandler.js';
import { downloadImage, shareImage } from './handlers/imageExport.js';
import { initPwa } from './pwa.js';
import { VehicleBalanceCalculator } from './calculator.js';

// --- STATE ---
let maintenanceState = {};
let materialsState = {};
let currentTable = null;
let calculator = null;
let lastEmailData = null;

// --- FILE PROCESSING CALLBACK ---
function onFileProcessed(table) {
  currentTable = table;
  renderVehicleCards(table, maintenanceState);
  renderMaterialsCard();
  updateMaterialsCard(materialsState);
  renderSummary(table, maintenanceState);
  renderMaintenanceModal(maintenanceState);
  renderMiscModal(materialsState);

  // if (calculator) {
  //   calculator.updateVehicles(table);
  // }

  // Save to localStorage
  localStorage.setItem('lastLoadedTableHTML', table.outerHTML);
  const now = new Date();
  localStorage.setItem('lastLoadedDate', now.toISOString());

  // Update the UI with the new date
  const lastUpdatedEl = document.getElementById('lastUpdated');
  if (lastUpdatedEl) {
    lastUpdatedEl.textContent = `Dados atualizados em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }
}

// --- LOAD SAVED DATA ---
function loadSavedData() {
  const savedTableHTML = localStorage.getItem('lastLoadedTableHTML');
  const savedDateStr = localStorage.getItem('lastLoadedDate');

  if (savedTableHTML && savedDateStr) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = savedTableHTML;
    const savedTable = tempDiv.querySelector('table');

    if (savedTable) {
      const savedDate = new Date(savedDateStr);
      const lastUpdatedEl = document.getElementById('lastUpdated');
      if (lastUpdatedEl) {
        lastUpdatedEl.textContent = `Dados carregados da última sessão em: ${savedDate.toLocaleDateString('pt-BR')} às ${savedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      onFileProcessed(savedTable);
      showNotification('Dados da última sessão foram carregados.');
    }
  }
}

// --- SCROLL TO TOP BUTTON LOGIC ---
function setupScrollToTopButton() {
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (!scrollToTopBtn) return;

  const toggleVisibility = () => {
    if (window.scrollY > 200) { // Show button after scrolling 200px
      scrollToTopBtn.classList.add('show');
    } else {
      scrollToTopBtn.classList.remove('show');
    }
  };

  window.addEventListener('scroll', toggleVisibility);
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Initial check in case the page loads already scrolled
  toggleVisibility();
}

// --- INITIALIZATION ---
async function initializeApp() {
  const initialState = await loadStateFromSupabase();
  maintenanceState = initialState.maintenanceState;
  materialsState = initialState.materialsState;
  desiredPlates.forEach(plate => {
    if (maintenanceState[plate] === undefined) maintenanceState[plate] = false;
  });

  setupDragAndDrop({ onSuccess: onFileProcessed });
  renderRequestMaintenanceModal();
  initializeMaintenanceNotes();
  initPwa(); // Initialize PWA functionality
  loadSavedData(); // Load data from localStorage on startup
  setupScrollToTopButton(); // Setup scroll to top button

  // Initialize Calculator
  calculator = new VehicleBalanceCalculator();

  // Event Listeners
  document.getElementById('maintenanceBtn').addEventListener('click', () => {
    if (!currentTable) return showError('Por favor, carregue um arquivo primeiro.');
    toggleModal('maintenanceModal', true);
  });
  document.getElementById('miscBtn').addEventListener('click', () => {
    if (!currentTable) return showError('Por favor, carregue um arquivo primeiro.');
    toggleModal('miscModal', true);
  });
  document.getElementById('closeModalBtn').addEventListener('click', () => toggleModal('maintenanceModal', false));
  document.getElementById('closeMiscModalBtn').addEventListener('click', () => toggleModal('miscModal', false));
  document.getElementById('downloadBtn').addEventListener('click', downloadImage);
  document.getElementById('shareBtn').addEventListener('click', shareImage);
  document.getElementById('requestMaintenanceBtn').addEventListener('click', () => toggleModal('requestMaintenanceModal', true));
  document.getElementById('closeRequestModalBtn').addEventListener('click', () => {
    toggleModal('requestMaintenanceModal', false);
    document.getElementById('requestMaintenanceForm').reset();
  });
  document.getElementById('buildEmailBtn').addEventListener('click', () => {
    const form = document.getElementById('requestMaintenanceForm');
    const data = Object.fromEntries(new FormData(form).entries());
    Object.assign(data, {
      driverContact: document.getElementById('driverContact').value,
      unitAddress: document.getElementById('unitAddress').value,
      unitMaps: document.getElementById('unitMaps').value,
      locadoraSelect: document.getElementById('locadoraSelect').value,
    });
    if (Object.values(data).some(val => !val)) {
      return alert('Por favor, preencha todos os campos obrigatórios.');
    }
    lastEmailData = data;
    renderEmailReportModal(data);
    toggleModal('requestMaintenanceModal', false);
  });
  document.getElementById('closeEmailReportModalBtn').addEventListener('click', () => toggleModal('emailReportModal', false));
  document.getElementById('copyEmailBtn').addEventListener('click', async () => {
    if (!lastEmailData) return;

    // Generate fixed-width HTML for clipboard
    const htmlSnippet = generateEmailHtml(lastEmailData, true);
    const plainText = htmlToPlainText(htmlSnippet);

    if (await copyRichTextToClipboard(htmlSnippet, plainText)) {
      showNotification('E-mail copiado com sucesso!');
    }
  });

  document.getElementById('saveMiscChangesBtn').addEventListener('click', async () => {
    const miscList = document.getElementById('miscList');
    const inputs = miscList.querySelectorAll('input[type="number"]');
    const newMaterialsState = JSON.parse(JSON.stringify(materialsState));
    let hasChanges = false;

    inputs.forEach(input => {
      const { material, type } = input.dataset;
      const value = parseInt(input.value) || 0;
      if (newMaterialsState[material][type] !== value) {
        newMaterialsState[material][type] = value;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      materialsState = newMaterialsState;
      const savePromises = Object.keys(materialsState).map(material => {
        return saveMaterialsToSupabase(material, materialsState[material]);
      });

      try {
        await Promise.all(savePromises);
        updateMaterialsCard(materialsState);
        showNotification('Materiais atualizados com sucesso!');
      } catch (error) {
        showError('Falha ao salvar as alterações dos materiais.');
        console.error('Error saving materials:', error);
      }
    }
    toggleModal('miscModal', false);
  });

  document.body.classList.add('loaded');
  document.querySelector('.button-container').classList.add('loaded');
  document.getElementById('mainContent').classList.add('loaded');
}

document.addEventListener('DOMContentLoaded', initializeApp);