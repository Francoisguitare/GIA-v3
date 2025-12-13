import React, { useState, useEffect } from 'react';
import { INITIAL_MODULES } from './constants';
import { Module, ViewType } from './types';
import ModuleCard from './components/ModuleCard';
import ModuleView from './components/ModuleView';
import Dashboard from './components/Dashboard';
import GameRoom from './components/GameRoom';
import GlobalNav from './components/GlobalNav';

export default function App() {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isModuleLoading, setIsModuleLoading] = useState(false);

  const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];

  const handleModuleClick = (id: number) => {
    // Si on clique sur le module déjà actif, ne rien faire
    if (id === activeModuleId) return;

    setIsModuleLoading(true);
    // Simuler un délai réseau pour l'UX
    setTimeout(() => {
        setActiveModuleId(id);
        setIsModuleLoading(false);
    }, 600);
  };

  const handleComplete = () => {
    setModules(prevModules => {
      const newModules = [...prevModules];
      const currentIndex = newModules.findIndex(m => m.id === activeModuleId);
      
      if (currentIndex !== -1) {
        newModules[currentIndex] = { ...newModules[currentIndex], status: 'completed' };
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex < newModules.length) {
        if (newModules[nextIndex].status === 'locked') {
          newModules[nextIndex] = { ...newModules[nextIndex], status: 'active' };
        }
        // Petit délai aussi pour le passage au suivant
        setIsModuleLoading(true);
        setTimeout(() => {
            setActiveModuleId(newModules[nextIndex].id);
            setIsModuleLoading(false);
        }, 600);
      }
      return newModules;
    });
  };

  const navigateToClassroom = () => {
    setCurrentView('classroom');
  };

  // Render logic based on currentView
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            modules={modules} 
            activeModuleId={activeModuleId} 
            onResume={navigateToClassroom} 
          />
        );
      case 'games':
        return <GameRoom />;
      case 'classroom':
        return (
          <div className="flex flex-col md:flex-row h-full">
            {/* Inner Sidebar for Classroom */}
            <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col h-full bg-slate-50 border-r border-slate-200">
              <div className="p-6 pb-4 border-b border-slate-200 bg-white md:bg-transparent">
                <h2 className="text-xl font-black text-slate-800">Mon Cursus</h2>
                <div className="mt-4">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase">Progression</span>
                        <span className="text-sm font-black text-amber-600">
                            {Math.round((modules.filter(m => m.status === 'completed').length / modules.length) * 100)}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                        className="h-full bg-amber-500 transition-all duration-700"
                        style={{ width: `${(modules.filter(m => m.status === 'completed').length / modules.length) * 100}%` }}
                        />
                    </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {modules.map(module => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    isActive={module.id === activeModuleId}
                    onClick={() => handleModuleClick(module.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Classroom Content */}
            <div className="flex-1 h-full bg-white relative">
               <ModuleView 
                  module={activeModule} 
                  onComplete={handleComplete}
                  isLastModule={activeModuleId === modules[modules.length - 1].id}
                  isLoading={isModuleLoading}
               />
            </div>
          </div>
        );
      default:
        return <div>Vue non trouvée</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Global Navigation - Always visible on desktop, acting as the "Hub" anchor */}
      <GlobalNav currentView={currentView} onChangeView={setCurrentView} />

      {/* Main Viewport */}
      <main className="flex-1 h-full relative overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}