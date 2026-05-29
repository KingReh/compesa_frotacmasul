import { showError } from '../utils.js';

let dragCounter = 0;

export function processFile(file, callbacks) {
  if (!file) return;
  if (!['text/html', 'application/vnd.ms-excel'].includes(file.type)) {
    return showError('Erro: Por favor, envie um arquivo .html ou .xls válido.');
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const doc = new DOMParser().parseFromString(e.target.result, 'text/html');
      const table = doc.querySelector('table.boxedBody');
      if (!table) return showError('Erro: O arquivo não contém uma tabela válida.');
      
      callbacks.onSuccess(table);
    } catch (err) {
      showError('Erro ao processar o arquivo: ' + err.message);
    }
  };
  reader.readAsText(file);
}

export function setupDragAndDrop(callbacks) {
  const dropZone = document.getElementById('dropZone');
  const mainContent = document.getElementById('mainContent');
  
  mainContent.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    mainContent.classList.add('drag-over');
    dropZone.classList.add('show');
  });
  mainContent.addEventListener('dragover', (e) => e.preventDefault());
  mainContent.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      mainContent.classList.remove('drag-over');
      dropZone.classList.remove('show');
    }
  });
  mainContent.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    mainContent.classList.remove('drag-over');
    dropZone.classList.remove('show');
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0], callbacks);
  });
  document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files[0]) processFile(e.target.files[0], callbacks);
  });
}