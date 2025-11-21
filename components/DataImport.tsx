import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertTriangle, Check, Download, Plus, Trash2, Save, X } from 'lucide-react';
import { inventoryService } from '../services/db';
import { Phone } from '../types';

interface DataImportProps {
  phones: Phone[];
  onImportComplete: () => void;
}

export const DataImport: React.FC<DataImportProps> = ({ phones, onImportComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Phone>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newPhone, setNewPhone] = useState<Omit<Phone, 'id'>>({
    brand: '', model: '', height_mm: 0, width_mm: 0, release_year: new Date().getFullYear()
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const parseCSV = (text: string): Phone[] => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error('File is empty or invalid');
    
    // Simple CSV parser assuming order: brand, model, height, width, year
    // In a real app, check headers dynamically
    const phones: Phone[] = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < 5) continue;
      
      phones.push({
        id: 0, // Will be assigned by service
        brand: cols[0],
        model: cols[1],
        height_mm: parseFloat(cols[2]),
        width_mm: parseFloat(cols[3]),
        release_year: parseInt(cols[4]) || new Date().getFullYear()
      });
    }
    return phones;
  };

  const processFile = async (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Proszę przesłać prawidłowy plik CSV.' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const text = await file.text();
      const phones = parseCSV(text);
      
      if (phones.length === 0) throw new Error('Nie znaleziono prawidłowych danych telefonów');

      await inventoryService.bulkImportPhones(phones);
      setMessage({ type: 'success', text: `Pomyślnie zaimportowano ${phones.length} urządzeń.` });
      onImportComplete();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Nie udało się przetworzyć pliku.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "brand,model,height_mm,width_mm,release_year\nSamsung,Galaxy S24,147.0,70.6,2024\nApple,iPhone 15,147.6,71.6,2023";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'szablon_telefonow.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEditing = (phone: Phone) => {
    setEditingId(phone.id);
    setEditForm(phone);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
  };

  const saveEdit = async (id: number) => {
    try {
      await inventoryService.updatePhone(id, editForm);
      setEditingId(null);
      onImportComplete();
    } catch (e) {
      alert('Nie udało się zapisać zmian');
    }
  };

  const addNew = async () => {
    if (!newPhone.brand || !newPhone.model) return alert('Marka i model są wymagane');
    try {
      await inventoryService.addPhone(newPhone);
      setIsAdding(false);
      setNewPhone({ brand: '', model: '', height_mm: 0, width_mm: 0, release_year: new Date().getFullYear() });
      onImportComplete();
    } catch (e) {
      alert('Nie udało się dodać telefonu');
    }
  };

  const deletePhone = async (id: number) => {
    if (confirm('Czy na pewno chcesz usunąć ten telefon?')) {
      try {
        await inventoryService.deletePhone(id);
        onImportComplete();
      } catch (e) {
        alert('Nie udało się usunąć telefonu');
      }
    }
  };

  const exportCSV = () => {
    const headers = ['brand', 'model', 'height_mm', 'width_mm', 'release_year'];
    const csvContent = [
      headers.join(','),
      ...phones.map(p => [p.brand, p.model, p.height_mm, p.width_mm, p.release_year].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'telefony.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Import danych telefonów</h2>
            <p className="text-slate-500 mt-2">Prześlij plik CSV, aby masowo zaktualizować lub dodać nowe modele telefonów do bazy danych.</p>
          </div>

          <div 
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ease-in-out cursor-pointer
              ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv" 
              onChange={handleChange}
            />
            
            {isProcessing ? (
              <div className="animate-pulse flex flex-col items-center">
                <UploadCloud className="h-12 w-12 text-indigo-400 mb-3" />
                <span className="text-indigo-600 font-medium">Przetwarzanie pliku...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-slate-100 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-lg font-medium text-slate-700">Kliknij lub przeciągnij plik CSV tutaj</p>
                <p className="text-sm text-slate-400 mt-1">Obsługiwany format: .csv</p>
              </div>
            )}
          </div>

          {message && (
            <div className={`mt-6 p-4 rounded-lg flex items-start ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.type === 'success' ? <Check className="h-5 w-5 mr-2 mt-0.5" /> : <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />}
              <div>
                <h4 className="font-semibold">{message.type === 'success' ? 'Przesyłanie zakończone' : 'Przesyłanie nieudane'}</h4>
                <p className="text-sm opacity-90">{message.text}</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              <p className="font-medium text-slate-700">Wymagania formatu CSV:</p>
              <code className="bg-slate-100 px-2 py-1 rounded mt-1 block text-xs">brand, model, height_mm, width_mm, release_year</code>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Pobierz szablon
            </button>
          </div>
        </div>
      </div>

      {/* Phones List Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Zarządzanie telefonami ({phones.length})</h2>
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

        {phones.length === 0 && !isAdding ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <p className="text-slate-600">Brak telefonów w bazie danych.</p>
            <p className="text-sm text-slate-400 mt-1">Dodaj telefony ręcznie lub zaimportuj z pliku CSV.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Marka</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Wysokość (mm)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Szerokość (mm)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Rok</th>
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
                        placeholder="Apple"
                        value={newPhone.brand}
                        onChange={e => setNewPhone({...newPhone, brand: e.target.value})}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                        placeholder="iPhone 15"
                        value={newPhone.model}
                        onChange={e => setNewPhone({...newPhone, model: e.target.value})}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="number" step="0.1"
                        className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                        value={newPhone.height_mm || ''}
                        onChange={e => setNewPhone({...newPhone, height_mm: parseFloat(e.target.value)})}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="number" step="0.1"
                        className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                        value={newPhone.width_mm || ''}
                        onChange={e => setNewPhone({...newPhone, width_mm: parseFloat(e.target.value)})}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="number"
                        className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                        value={newPhone.release_year || ''}
                        onChange={e => setNewPhone({...newPhone, release_year: parseInt(e.target.value)})}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={addNew} className="text-green-600 hover:text-green-900 mr-3"><Save className="h-5 w-5"/></button>
                      <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5"/></button>
                    </td>
                  </tr>
                )}

                {/* Existing Rows */}
                {phones.map((phone) => {
                  const isEditing = editingId === phone.id;
                  return (
                    <tr key={phone.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {isEditing ? (
                          <input 
                            className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            value={editForm.brand}
                            onChange={e => setEditForm({...editForm, brand: e.target.value})}
                          />
                        ) : phone.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {isEditing ? (
                          <input 
                            className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            value={editForm.model}
                            onChange={e => setEditForm({...editForm, model: e.target.value})}
                          />
                        ) : phone.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {isEditing ? (
                          <input 
                            type="number" step="0.1"
                            className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            value={editForm.height_mm}
                            onChange={e => setEditForm({...editForm, height_mm: parseFloat(e.target.value)})}
                          />
                        ) : phone.height_mm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {isEditing ? (
                          <input 
                            type="number" step="0.1"
                            className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            value={editForm.width_mm}
                            onChange={e => setEditForm({...editForm, width_mm: parseFloat(e.target.value)})}
                          />
                        ) : phone.width_mm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {isEditing ? (
                          <input 
                            type="number"
                            className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            value={editForm.release_year}
                            onChange={e => setEditForm({...editForm, release_year: parseInt(e.target.value)})}
                          />
                        ) : phone.release_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(phone.id)} className="text-green-600 hover:text-green-900 mr-3"><Save className="h-5 w-5"/></button>
                            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5"/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(phone)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edytuj</button>
                            <button onClick={() => deletePhone(phone.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5 inline" /></button>
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
        )}
      </div>
    </div>
  );
};