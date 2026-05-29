import { supabase } from './config.js';
import { showError } from './utils.js';

// API calls for main state
export async function loadStateFromSupabase() {
  const state = {
    maintenanceState: {},
    materialsState: {
      'Agua_Mineral': { current: 0, stock: 0 },
      'Gas_Cozinha': { current: 0, stock: 0 },
      'Oleo_Maquina': { current: 0, stock: 0 }
    }
  };

  try {
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from('maintenance_state')
      .select('plate, is_in_maintenance');
    if (maintenanceError) throw maintenanceError;
    if (maintenanceData) {
      maintenanceData.forEach(row => {
        state.maintenanceState[row.plate] = row.is_in_maintenance;
      });
    }

    const { data: materialsData, error: materialsError } = await supabase
      .from('materials_state')
      .select('material_id, current_quantity, stock_quantity');
    if (materialsError) throw materialsError;
    if (materialsData) {
      materialsData.forEach(row => {
        state.materialsState[row.material_id] = {
          current: row.current_quantity,
          stock: row.stock_quantity
        };
      });
    }
  } catch (err) {
    console.error('Erro geral ao carregar do Supabase:', err);
    showError('Erro ao carregar dados do servidor.');
  }
  return state;
}

export async function saveMaintenanceToSupabase(plate, isInMaintenance) {
  try {
    const { error } = await supabase
      .from('maintenance_state')
      .upsert({ plate, is_in_maintenance: isInMaintenance }, { onConflict: 'plate' });
    if (error) throw error;
    console.log(`Estado de manutenção salvo para placa ${plate}: ${isInMaintenance}`);
  } catch (err) {
    console.error('Erro ao salvar estado de manutenção no Supabase:', err);
    showError('Erro ao salvar estado de manutenção: ' + err.message);
  }
}

export async function saveMaterialsToSupabase(material, data) {
  try {
    const { error } = await supabase
      .from('materials_state')
      .upsert({ material_id: material, current_quantity: data.current, stock_quantity: data.stock }, { onConflict: 'material_id' });
    if (error) throw error;
    console.log(`Materiais salvos: ${material} - Atual: ${data.current}, Estoque: ${data.stock}`);
  } catch (err) {
    console.error('Erro ao salvar materiais no Supabase:', err);
    showError('Erro ao salvar materiais: ' + err.message);
  }
}

// API calls for maintenance notes
export async function loadMaintenanceNotesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('maintenance_notes')
      .select('*')
      .order('entry_date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao carregar anotações do Supabase:', err);
    showError('Erro ao carregar anotações de manutenção: ' + err.message);
    return [];
  }
}

export async function saveMaintenanceNoteToSupabase(note) {
  try {
    const { error } = await supabase.from('maintenance_notes').insert([note]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao salvar anotação no Supabase:', err);
    showError('Erro ao salvar anotação de manutenção: ' + err.message);
    return false;
  }
}

export async function updateMaintenanceNoteToSupabase(noteId, updatedNote) {
  try {
    const { error } = await supabase
      .from('maintenance_notes')
      .update(updatedNote)
      .eq('id', noteId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao atualizar anotação no Supabase:', err);
    showError('Erro ao atualizar anotação de manutenção: ' + err.message);
    return false;
  }
}

export async function deleteMaintenanceNoteFromSupabase(noteId) {
  try {
    const { error } = await supabase
      .from('maintenance_notes')
      .delete()
      .eq('id', noteId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao deletar anotação no Supabase:', err);
    showError('Erro ao deletar anotação de manutenção: ' + err.message);
    return false;
  }
}