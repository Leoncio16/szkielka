import React, { useState } from 'react';
import { Glass } from '../types';
import { Plus, Trash2, Save, X, Download } from 'lucide-react';
import { inventoryService } from '../services/db';

interface GlassInventoryProps {
  glasses: Glass[];
  onUpdate: () => void;
}

export const GlassInventory: React.FC<GlassInventoryProps> = ({ glasses, onUpdate }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Glass>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newGlass, setNewGlass] = useState<Omit<Glass, 'id'>>({
    sku: '', height_mm: 0, width_mm: 0, notes: ''
  });

  const startEditing = (glass: Glass) => {
    setEditingId(glass.id);
    setEditForm(glass);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
  };

  const saveEdit = async (id: number) => {
    try {
      await inventoryService.updateGlass(id, editForm);
      setEditingId(null);
      onUpdate();
    } catch (e) {
      alert('Nie udało się zapisać zmian');
    }
  };

  const addNew = async () => {
    if (!newGlass.sku) return alert('SKU jest wymagane');
    try {
      await inventoryService.addGlass(newGlass);
      setIsAdding(false);
      setNewGlass({ sku: '', height_mm: 0, width_mm: 0, notes: '' });
      onUpdate();
    } catch (e) {
      alert('Nie udało się dodać folii');
    }
  };

  const deleteGlass = async (id: number) => {
    if (confirm('Czy na pewno chcesz usunąć ten element?')) {
      await inventoryService.deleteGlass(id);
      onUpdate();
    }
  };

  const exportCSV = () => {
    const headers = ['id', 'sku', 'height_mm', 'width_mm', 'notes'];
    const csvContent = [
      headers.join(','),
      ...glasses.map(g => [g.id, g.sku, g.height_mm, g.width_mm, `"${g.notes}"`].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'magazyn_folii.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Zarządzanie magazynem</h2>
        <div className="flex gap-2">
          <button 
            onClick={exportCSV}
            className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Eksportuj CSV
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj nowy
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Wysokość (mm)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Szerokość (mm)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Uwagi</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Akcje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {/* Add New Row */}
              {isAdding && (
                <tr className="bg-indigo-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      autoFocus
                      className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      placeholder="SKU-123"
                      value={newGlass.sku}
                      onChange={e => setNewGlass({...newGlass, sku: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="number" step="0.1"
                      className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      value={newGlass.height_mm || ''}
                      onChange={e => setNewGlass({...newGlass, height_mm: parseFloat(e.target.value)})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="number" step="0.1"
                      className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      value={newGlass.width_mm || ''}
                      onChange={e => setNewGlass({...newGlass, width_mm: parseFloat(e.target.value)})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      placeholder="Uwagi..."
                      value={newGlass.notes}
                      onChange={e => setNewGlass({...newGlass, notes: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={addNew} className="text-green-600 hover:text-green-900 mr-3"><Save className="h-5 w-5"/></button>
                    <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5"/></button>
                  </td>
                </tr>
              )}

              {/* Existing Rows */}
              {glasses.map((glass) => {
                const isEditing = editingId === glass.id;
                return (
                  <tr key={glass.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {isEditing ? (
                         <input 
                         className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                         value={editForm.sku}
                         onChange={e => setEditForm({...editForm, sku: e.target.value})}
                       />
                      ) : glass.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {isEditing ? (
                         <input 
                         type="number" step="0.1"
                         className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                         value={editForm.height_mm}
                         onChange={e => setEditForm({...editForm, height_mm: parseFloat(e.target.value)})}
                       />
                      ) : glass.height_mm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {isEditing ? (
                         <input 
                         type="number" step="0.1"
                         className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                         value={editForm.width_mm}
                         onChange={e => setEditForm({...editForm, width_mm: parseFloat(e.target.value)})}
                       />
                      ) : glass.width_mm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {isEditing ? (
                         <input 
                         className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                         value={editForm.notes}
                         onChange={e => setEditForm({...editForm, notes: e.target.value})}
                       />
                      ) : glass.notes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(glass.id)} className="text-green-600 hover:text-green-900 mr-3"><Save className="h-5 w-5"/></button>
                          <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5"/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(glass)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edytuj</button>
                          <button onClick={() => deleteGlass(glass.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5 inline" /></button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};