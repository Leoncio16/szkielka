import React, { useState, useMemo, useEffect } from 'react';
import { Phone, Glass, MatchResult } from '../types';
import { Search, Ruler, ArrowRight, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';

interface PhoneMatcherProps {
  phones: Phone[];
  glasses: Glass[];
}

export const PhoneMatcher: React.FC<PhoneMatcherProps> = ({ phones, glasses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [margin, setMargin] = useState(1.5); // mm margin from edge (total width reduction = margin * 2)

  // Reset selection on search
  useEffect(() => {
    if (searchTerm === '') setSelectedPhone(null);
  }, [searchTerm]);

  const filteredPhones = useMemo(() => {
    if (!searchTerm) return [];
    const lower = searchTerm.toLowerCase();
    return phones.filter(p => 
      p.model.toLowerCase().includes(lower) || 
      p.brand.toLowerCase().includes(lower)
    ).slice(0, 5); // Limit results
  }, [searchTerm, phones]);

  const matches = useMemo(() => {
    if (!selectedPhone) return [];

    const targetHeight = selectedPhone.height_mm - (margin * 2);
    const targetWidth = selectedPhone.width_mm - (margin * 2);

    const results: MatchResult[] = glasses.map(glass => {
      const hDiff = glass.height_mm - targetHeight;
      const wDiff = glass.width_mm - targetWidth;
      
      // Weighted score: Penalize being larger than target significantly
      // We want glass <= target generally, or very slightly larger (tolerance)
      // Distance formula simply:
      const fitScore = Math.abs(hDiff) + Math.abs(wDiff);
      
      return {
        glass,
        fitScore,
        heightDiff: hDiff,
        widthDiff: wDiff
      };
    });

    // Filter out glasses that are drastically too big (e.g. > 2mm larger) or too small (> 10mm smaller)
    // Sort by best fit (lowest score)
    return results
      .filter(r => r.widthDiff <= 1 && r.heightDiff <= 1 && r.widthDiff > -10 && r.heightDiff > -10)
      .sort((a, b) => a.fitScore - b.fitScore)
      .slice(0, 10);

  }, [selectedPhone, glasses, margin]);

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2 text-indigo-600" />
          Znajdź urządzenie
        </h2>
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
            placeholder="Szukaj według marki lub modelu (np. 'iPhone 14')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          
          {filteredPhones.length > 0 && !selectedPhone && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              {filteredPhones.map(phone => (
                <button
                  key={phone.id}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 flex justify-between items-center border-b border-slate-100 last:border-0"
                  onClick={() => {
                    setSelectedPhone(phone);
                    setSearchTerm(`${phone.brand} ${phone.model}`);
                  }}
                >
                  <span className="font-medium text-slate-700">{phone.brand} {phone.model}</span>
                  <span className="text-xs text-slate-400 font-mono">{phone.height_mm} x {phone.width_mm}mm</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPhone && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Device Specs & Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-indigo-900 font-semibold mb-4 flex items-center">
                <Ruler className="h-5 w-5 mr-2" />
                Docelowe wymiary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Rozmiar urządzenia:</span>
                  <span className="font-mono font-medium">{selectedPhone.height_mm} × {selectedPhone.width_mm} mm</span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Margines brzegu (mm)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      step="0.1" 
                      value={margin}
                      onChange={(e) => setMargin(parseFloat(e.target.value))}
                      className="flex-grow h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-sm font-bold text-indigo-700 w-12 text-right">{margin}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Odstęp od krawędzi telefonu do krawędzi folii.</p>
                </div>

                <div className="pt-4 border-t border-indigo-200">
                  <div className="flex justify-between text-sm font-semibold text-indigo-900">
                    <span>Idealna folia:</span>
                    <span className="font-mono">
                      {(selectedPhone.height_mm - margin * 2).toFixed(1)} × {(selectedPhone.width_mm - margin * 2).toFixed(1)} mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matching Results */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Rekomendowane folie</h3>
            
            {matches.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <p className="text-slate-600">Nie znaleziono odpowiednich dopasowań w tolerancji.</p>
                <p className="text-sm text-slate-400 mt-1">Spróbuj dostosować margines lub dodaj nowy magazyn.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match, idx) => (
                  <div 
                    key={match.glass.id}
                    className={`group bg-white p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                      idx === 0 
                        ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' 
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex-shrink-0 pt-1 sm:pt-0">
                      {idx === 0 ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-800 truncate">{match.glass.sku}</h4>
                        {idx === 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Najlepsze dopasowanie</span>}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{match.glass.notes}</p>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end text-right min-w-[100px]">
                      <span className="font-mono text-sm font-medium text-slate-700">
                        {match.glass.height_mm} × {match.glass.width_mm}
                      </span>
                      <div className="text-xs flex flex-col gap-0.5 mt-1">
                        <span className={`${match.heightDiff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          H: {match.heightDiff > 0 ? '+' : ''}{match.heightDiff.toFixed(1)}mm
                        </span>
                        <span className={`${match.widthDiff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          W: {match.widthDiff > 0 ? '+' : ''}{match.widthDiff.toFixed(1)}mm
                        </span>
                      </div>
                    </div>
                    
                    <div className="hidden sm:block text-slate-300 group-hover:text-indigo-400">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedPhone && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Smartphone className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Wybierz urządzenie, aby rozpocząć</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">
            Wyszukaj model telefonu powyżej, aby obliczyć idealne wymiary folii i znaleźć dopasowany magazyn.
          </p>
        </div>
      )}
    </div>
  );
};