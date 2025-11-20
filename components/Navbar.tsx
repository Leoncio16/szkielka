import React from 'react';
import { Smartphone, ClipboardList, UploadCloud, Shield } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: ViewState.MATCHER, label: 'Dopasowywacz', icon: Smartphone },
    { view: ViewState.INVENTORY, label: 'Magazyn', icon: ClipboardList },
    { view: ViewState.IMPORT, label: 'Import danych', icon: UploadCloud },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">ScreenGuard</span>
          </div>
          
          <div className="flex space-x-1 sm:space-x-4">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  currentView === item.view
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};