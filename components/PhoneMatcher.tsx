import React, { useState, useMemo, useEffect } from 'react';
import { Phone, Glass, MatchResult } from '../types';
import { Search, Ruler, ArrowRight, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';

interface PhoneMatcherProps {
  phones: Phone[];
  glasses: Glass[];
}

interface GlassWithMatch {
  glass: Glass;
  fitScore: number | null;
  heightDiff: number | null;
  widthDiff: number | null;
  matchQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
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

  const allGlassesWithMatch = useMemo((): GlassWithMatch[] => {
    // Zawsze pokazuj wszystkie szkła z magazynu
    if (!selectedPhone) {
      // Gdy telefon nie jest wybrany, pokazuj szkła bez informacji o dopasowaniu
      return glasses.map(glass => ({
        glass,
        fitScore: null,
        heightDiff: null,
        widthDiff: null,
        matchQuality: null
      }));
    }

    const targetHeight = selectedPhone.height_mm - (margin * 2);
    const targetWidth = selectedPhone.width_mm - (margin * 2);

    const results = glasses.map(glass => {
      const hDiff = glass.height_mm - targetHeight;
      const wDiff = glass.width_mm - targetWidth;
      
      // Oblicz wynik dopasowania
      const fitScore = Math.abs(hDiff) + Math.abs(wDiff);
      
      // Określ jakość dopasowania
      let matchQuality: 'excellent' | 'good' | 'fair' | 'poor';
      if (fitScore <= 1) {
        matchQuality = 'excellent';
      } else if (fitScore <= 3) {
        matchQuality = 'good';
      } else if (fitScore <= 6) {
        matchQuality = 'fair';
      } else {
        matchQuality = 'poor';
      }
      
      return {
        glass,
        fitScore,
        heightDiff: hDiff,
        widthDiff: wDiff,
        matchQuality
      };
    });

    // Sortuj według najlepszego dopasowania (najniższy wynik)
    return results.sort((a, b) => {
      if (a.fitScore === null || b.fitScore === null) return 0;
      return a.fitScore - b.fitScore;
    });

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device Specs & Controls */}
        {selectedPhone && (
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
        )}

        {/* All Glasses List */}
        <div className={selectedPhone ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              {selectedPhone ? 'Wszystkie folie z magazynu' : 'Wszystkie folie z magazynu'}
            </h3>
            {!selectedPhone && (
              <p className="text-sm text-slate-500">Wybierz urządzenie, aby zobaczyć stopień dopasowania</p>
            )}
          </div>
          
          {allGlassesWithMatch.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <p className="text-slate-600">Brak folii w magazynie.</p>
              <p className="text-sm text-slate-400 mt-1">Dodaj folie w sekcji Magazyn.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allGlassesWithMatch.map((match, idx) => {
                const hasMatch = match.fitScore !== null && match.heightDiff !== null && match.widthDiff !== null;
                const matchQualityColors = {
                  excellent: 'bg-green-100 text-green-700 border-green-300',
                  good: 'bg-blue-100 text-blue-700 border-blue-300',
                  fair: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                  poor: 'bg-red-100 text-red-700 border-red-300'
                };
                const matchQualityLabels = {
                  excellent: 'Doskonale',
                  good: 'Dobrze',
                  fair: 'Umiarkowanie',
                  poor: 'Słabo'
                };

                return (
                  <div 
                    key={match.glass.id}
                    className={`group bg-white p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                      hasMatch && match.matchQuality === 'excellent' && idx === 0
                        ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' 
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex-shrink-0 pt-1 sm:pt-0">
                      {hasMatch && match.matchQuality === 'excellent' && idx === 0 ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h4 className="font-bold text-slate-800 truncate">{match.glass.sku}</h4>
                        {hasMatch && (
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${matchQualityColors[match.matchQuality!]}`}>
                            {matchQualityLabels[match.matchQuality!]}
                          </span>
                        )}
                        {hasMatch && idx === 0 && match.matchQuality === 'excellent' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Najlepsze dopasowanie</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{match.glass.notes || 'Brak uwag'}</p>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end text-right min-w-[120px]">
                      <span className="font-mono text-sm font-medium text-slate-700">
                        {match.glass.height_mm} × {match.glass.width_mm} mm
                      </span>
                      {hasMatch && (
                        <div className="text-xs flex flex-col gap-0.5 mt-1">
                          <span className={`${match.heightDiff! > 0 ? 'text-red-500' : match.heightDiff! < 0 ? 'text-green-600' : 'text-slate-500'}`}>
                            H: {match.heightDiff! > 0 ? '+' : ''}{match.heightDiff!.toFixed(1)}mm
                          </span>
                          <span className={`${match.widthDiff! > 0 ? 'text-red-500' : match.widthDiff! < 0 ? 'text-green-600' : 'text-slate-500'}`}>
                            W: {match.widthDiff! > 0 ? '+' : ''}{match.widthDiff!.toFixed(1)}mm
                          </span>
                          {match.fitScore !== null && (
                            <span className="text-slate-400 mt-1">
                              Wynik: {match.fitScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
                      {!hasMatch && (
                        <span className="text-xs text-slate-400 mt-1">Wybierz urządzenie</span>
                      )}
                    </div>
                    
                    <div className="hidden sm:block text-slate-300 group-hover:text-indigo-400">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {!selectedPhone && (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 mb-3">
            <Smartphone className="h-6 w-6 text-slate-500" />
          </div>
          <p className="text-sm text-slate-600">
            Wyszukaj model telefonu powyżej, aby zobaczyć stopień dopasowania dla każdej folii.
          </p>
        </div>
      )}
    </div>
  );
};