import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertTriangle, Check, Download } from 'lucide-react';
import { inventoryService } from '../services/db';
import { Phone } from '../types';

interface DataImportProps {
  onImportComplete: () => void;
}

export const DataImport: React.FC<DataImportProps> = ({ onImportComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
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
  );
};