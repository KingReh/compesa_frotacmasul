import { desiredPlates, coordinations } from './config.js';
import { showNotification, showError, toggleModal, formatDateToBrazilian, calculateDaysAbsent } from './utils.js';
import { loadMaintenanceNotesFromSupabase, saveMaintenanceNoteToSupabase, updateMaintenanceNoteToSupabase, deleteMaintenanceNoteFromSupabase } from './api.js';

let maintenanceNotes = [];

function openEditModal(note) {
    document.getElementById('editMaintenanceNoteId').value = note.id;
    document.getElementById('editMaintenanceNotePlate').value = note.plate;
    document.getElementById('editMaintenanceNoteCoordination').value = note.coordination;
    document.getElementById('editMaintenanceNoteEntryDate').value = note.entry_date;
    document.getElementById('editMaintenanceNoteTicketNumber').value = note.ticket_number;
    document.getElementById('editMaintenanceNoteService').value = note.service;
    document.getElementById('editMaintenanceNoteDaysAbsent').value = calculateDaysAbsent(note.entry_date);
    toggleModal('editMaintenanceNoteModal', true);
}

async function handleDeleteNote(noteId) {
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) return;

    const success = await deleteMaintenanceNoteFromSupabase(noteId);
    if (success) {
        maintenanceNotes = maintenanceNotes.filter(note => note.id !== noteId);
        renderMaintenanceNotesList();
        showNotification('Anotação excluída com sucesso!');
    }
}

function renderMaintenanceNotesList() {
    const notesList = document.getElementById('maintenanceNotesList');
    if (!notesList) return;
    notesList.innerHTML = '';

    if (maintenanceNotes.length === 0) {
        notesList.innerHTML = '<p class="text-gray-500 text-center mt-4">Nenhuma anotação encontrada.</p>';
        return;
    }

    maintenanceNotes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'border-b border-gray-200 py-2 flex justify-between items-center gap-2';
        li.innerHTML = `
          <div class="text-gray-700 text-sm flex-grow">
            <strong>Placa:</strong> ${note.plate} | 
            <strong>Coord.:</strong> ${note.coordination}<br>
            <strong>Entrada:</strong> ${formatDateToBrazilian(note.entry_date)} | 
            <strong>Ausente:</strong> ${calculateDaysAbsent(note.entry_date)} dias<br>
            <strong>Chamado:</strong> ${note.ticket_number}<br>
            <strong>Serviço:</strong> ${note.service}
          </div>
          <div class="action-buttons flex flex-row gap-2">
            <button class="action-btn edit" data-note-id="${note.id}" aria-label="Editar anotação">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn delete" data-note-id="${note.id}" aria-label="Excluir anotação">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        `;
        notesList.appendChild(li);
    });

    notesList.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', () => {
            const noteId = parseInt(button.dataset.noteId);
            const noteToEdit = maintenanceNotes.find(n => n.id === noteId);
            if (noteToEdit) openEditModal(noteToEdit);
        });
    });

    notesList.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', () => {
            const noteId = parseInt(button.dataset.noteId);
            handleDeleteNote(noteId);
        });
    });
}

function populateSelect(selectElement, options) {
    if (!selectElement) return;
    selectElement.innerHTML = `<option value="">Selecione uma ${selectElement.id.includes('Plate') ? 'placa' : 'coordenação'}</option>`;
    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
}

function exportMaintenanceNotesToTxt() {
    const txtContent = maintenanceNotes.map(note => `
*PLACA:* ${note.plate}
*COORDENAÇÃO:* ${note.coordination}
*DATA DE ENTRADA NA OFICINA:* ${formatDateToBrazilian(note.entry_date)}
*TEMPO AUSENTE:* ${calculateDaysAbsent(note.entry_date)} dias
*Nº CHAMADO:* ${note.ticket_number}
*SERVIÇO:* ${note.service}
───────────────────`).join('\n').trim();

    const blob = new Blob([txtContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Anotacoes_Manutencao.txt';
    link.click();
    URL.revokeObjectURL(link.href);
    showNotification('Anotações exportadas como TXT!');
}

function exportMaintenanceNotesToExcel() {
    const worksheetData = maintenanceNotes.map(note => ({
        'Placa': note.plate,
        'Coordenação': note.coordination,
        'Data de Entrada': formatDateToBrazilian(note.entry_date),
        'Tempo Ausente (dias)': calculateDaysAbsent(note.entry_date),
        'Nº Chamado': note.ticket_number,
        'Serviço': note.service
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Anotações de Manutenção');
    XLSX.writeFile(workbook, 'Anotacoes_Manutencao.xlsx');
    showNotification('Anotações exportadas como Excel!');
}

async function handleSaveNote() {
    const plate = document.getElementById('maintenanceNotePlate').value;
    const coordination = document.getElementById('maintenanceNoteCoordination').value;
    const entryDate = document.getElementById('maintenanceNoteEntryDate').value;
    const ticketNumber = document.getElementById('maintenanceNoteTicketNumber').value;
    const service = document.getElementById('maintenanceNoteService').value;

    if (!plate || !coordination || !entryDate || !ticketNumber || !service) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const note = { plate, coordination, entry_date: entryDate, ticket_number: ticketNumber, service };
    const success = await saveMaintenanceNoteToSupabase(note);
    if (success) {
        maintenanceNotes = await loadMaintenanceNotesFromSupabase();
        renderMaintenanceNotesList();
        document.getElementById('maintenanceNotesForm').reset();
        document.getElementById('maintenanceNoteDaysAbsent').value = '';
        showNotification('Anotação salva com sucesso!');
    }
}

async function handleUpdateNote() {
    const noteId = parseInt(document.getElementById('editMaintenanceNoteId').value);
    const updatedNote = {
        plate: document.getElementById('editMaintenanceNotePlate').value,
        coordination: document.getElementById('editMaintenanceNoteCoordination').value,
        entry_date: document.getElementById('editMaintenanceNoteEntryDate').value,
        ticket_number: document.getElementById('editMaintenanceNoteTicketNumber').value,
        service: document.getElementById('editMaintenanceNoteService').value,
    };

    if (!updatedNote.plate || !updatedNote.coordination || !updatedNote.entry_date || !updatedNote.ticket_number || !updatedNote.service) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const success = await updateMaintenanceNoteToSupabase(noteId, updatedNote);
    if (success) {
        const index = maintenanceNotes.findIndex(note => note.id === noteId);
        if (index !== -1) {
            maintenanceNotes[index] = { ...maintenanceNotes[index], ...updatedNote };
        }
        renderMaintenanceNotesList();
        toggleModal('editMaintenanceNoteModal', false);
        showNotification('Anotação atualizada com sucesso!');
    }
}

export async function initializeMaintenanceNotes() {
    const notesBtn = document.getElementById('maintenanceNotesBtn');
    const closeNotesModalBtn = document.getElementById('closeNotesModalBtn');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const exportTxtBtn = document.getElementById('exportTxtBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const entryDateInput = document.getElementById('maintenanceNoteEntryDate');
    const daysAbsentInput = document.getElementById('maintenanceNoteDaysAbsent');
    const plateSelect = document.getElementById('maintenanceNotePlate');
    const coordinationSelect = document.getElementById('maintenanceNoteCoordination');

    const closeEditNoteModalBtn = document.getElementById('closeEditNoteModalBtn');
    const saveEditNoteBtn = document.getElementById('saveEditNoteBtn');
    const editPlateSelect = document.getElementById('editMaintenanceNotePlate');
    const editCoordinationSelect = document.getElementById('editMaintenanceNoteCoordination');
    const editEntryDateInput = document.getElementById('editMaintenanceNoteEntryDate');
    const editDaysAbsentInput = document.getElementById('editMaintenanceNoteDaysAbsent');

    populateSelect(plateSelect, desiredPlates);
    populateSelect(coordinationSelect, coordinations);
    populateSelect(editPlateSelect, desiredPlates);
    populateSelect(editCoordinationSelect, coordinations);

    notesBtn.addEventListener('click', () => toggleModal('maintenanceNotesModal', true));
    closeNotesModalBtn.addEventListener('click', () => toggleModal('maintenanceNotesModal', false));
    saveNoteBtn.addEventListener('click', handleSaveNote);
    exportTxtBtn.addEventListener('click', exportMaintenanceNotesToTxt);
    exportExcelBtn.addEventListener('click', exportMaintenanceNotesToExcel);

    entryDateInput.addEventListener('change', () => {
        daysAbsentInput.value = calculateDaysAbsent(entryDateInput.value);
    });

    closeEditNoteModalBtn.addEventListener('click', () => toggleModal('editMaintenanceNoteModal', false));
    saveEditNoteBtn.addEventListener('click', handleUpdateNote);
    editEntryDateInput.addEventListener('change', () => {
        editDaysAbsentInput.value = calculateDaysAbsent(editEntryDateInput.value);
    });

    maintenanceNotes = await loadMaintenanceNotesFromSupabase();
    renderMaintenanceNotesList();
}