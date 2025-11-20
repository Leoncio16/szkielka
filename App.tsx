import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { PhoneMatcher } from './components/PhoneMatcher';
import { GlassInventory } from './components/GlassInventory';
import { DataImport } from './components/DataImport';
import { ViewState, Phone, Glass } from './types';
import { inventoryService } from './services/db';
import { HashRouter } from 'react-router-dom'; // Just wrapping for potential router usage, though we use state routing here per simple SPA request

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.MATCHER);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [glasses, setGlasses] = useState<Glass[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [p, g] = await Promise.all([
        inventoryService.getPhones(),
        inventoryService.getGlasses()
      ]);
      setPhones(p);
      setGlasses(g);
    } catch (error) {
      console.error('Nie udało się załadować inwentarza', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 pb-12">
        <Navbar currentView={currentView} setView={setCurrentView} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {currentView === ViewState.MATCHER && (
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Dopasowywacz urządzeń</h1>
                    <p className="text-slate-500 mt-1">Znajdź idealne dopasowanie folii ochronnej na podstawie wymiarów.</p>
                  </div>
                  <PhoneMatcher phones={phones} glasses={glasses} />
                </div>
              )}

              {currentView === ViewState.INVENTORY && (
                <div className="animate-fadeIn">
                  <GlassInventory glasses={glasses} onUpdate={refreshData} />
                </div>
              )}

              {currentView === ViewState.IMPORT && (
                <div className="animate-fadeIn">
                  <DataImport onImportComplete={refreshData} />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </HashRouter>
  );
};

export default App;