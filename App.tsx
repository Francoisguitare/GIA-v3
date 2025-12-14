
import React, { useState, useEffect } from 'react';
import { INITIAL_MODULES } from './constants';
import { Module, ViewType } from './types';
import ModuleView from './components/ModuleView';
import Dashboard from './components/Dashboard';
import GameRoom from './components/GameRoom';
import GlobalNav from './components/GlobalNav';
import { Triangle, Lock, CheckCircle2, Target, Hourglass } from 'lucide-react';

export default function App() {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];

  const getEstimatedDate = (index: number) => {
    const today = new Date();
    const daysToAdd = index * 7; 
    const estimatedDate = new Date(today);
    estimatedDate.setDate(today.getDate() + daysToAdd);
    return estimatedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  const handleModuleClick = (id: number) => {
    // Empêcher le clic si le module est bloqué ou en attente (sauf si c'est le module courant)
    const targetModule = modules.find(m => m.id === id);
    if (!targetModule || (targetModule.status === 'locked' && id !== activeModuleId)) return;

    if (id === activeModuleId) return;

    setIsModuleLoading(true);
    setTimeout(() => {
        setActiveModuleId(id);
        setIsModuleLoading(false);
        setIsCinemaMode(false);
    }, 800);
  };

  const handleComplete = () => {
    // 1. Feedback Sonore
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio interaction required"));

    setTimeout(() => {
        setModules(prevModules => {
            const newModules = [...prevModules];
            const currentIndex = newModules.findIndex(m => m.id === activeModuleId);
            if (currentIndex === -1) return newModules;

            const currentMod = newModules[currentIndex];

            // LOGIQUE GATEKEEPER
            if (currentMod.type === 'practice' && (!currentMod.validationStatus || currentMod.validationStatus === 'none')) {
                // Si c'est un module pratique : On passe en "Envoyé" mais on NE débloque PAS la suite
                newModules[currentIndex] = { 
                    ...currentMod, 
                    status: 'pending_review',
                    validationStatus: 'submitted' 
                };
                // Pas de changement d'activeModuleId, on reste sur la page avec le message d'attente
            } else {
                // Cas Standard : On termine et on passe au suivant
                newModules[currentIndex] = { ...currentMod, status: 'completed' };
                
                const nextIndex = currentIndex + 1;
                if (nextIndex < newModules.length) {
                    if (newModules[nextIndex].status === 'locked') {
                        newModules[nextIndex] = { ...newModules[nextIndex], status: 'active' };
                    }
                    // Navigation automatique seulement pour le standard
                    setIsModuleLoading(true);
                    setTimeout(() => {
                        setActiveModuleId(newModules[nextIndex].id);
                        setIsModuleLoading(false);
                        setIsCinemaMode(false);
                    }, 600);
                }
            }
            return newModules;
        });
    }, 500);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            modules={modules} 
            activeModuleId={activeModuleId} 
            onResume={() => setCurrentView('classroom')} 
          />
        );
      case 'games':
        return <GameRoom />;
      case 'classroom':
        return (
          <div className="flex flex-col md:flex-row h-full relative bg-black">
            {/* SIDEBAR "MANCHE DE GUITARE" */}
            <div className={`
                flex-col h-full bg-[#1a1a1a] border-r border-white/10 shadow-2xl transition-all duration-500 ease-in-out relative z-20
                ${isCinemaMode ? 'w-0 opacity-0 overflow-hidden' : 'w-full md:w-[320px] opacity-100 flex'}
            `}>
              {/* Header Sidebar */}
              <div className="p-6 bg-[#262626] border-b border-white/10 relative z-10">
                <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
                    Mon Cursus
                </h2>
                <div className="h-1 w-24 bg-amber-500 mt-2 rounded-full"></div>
              </div>
              
              {/* Liste Modules */}
              <div className="flex-1 overflow-y-auto relative bg-[#1a1a1a]">
                {/* Ligne centrale manche */}
                <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-white/5 hidden md:block"></div>

                <div>
                  {modules.map((module, index) => {
                     const isActive = module.id === activeModuleId;
                     const isLocked = module.status === 'locked';
                     const isPending = module.status === 'pending_review';
                     const isCompleted = module.status === 'completed';
                     
                     return (
                        <div key={module.id} className="relative group">
                            {/* Frette (Séparateur) */}
                            <div className="h-[2px] w-full bg-gradient-to-r from-white/5 via-white/20 to-white/5"></div>
                            
                            <div 
                                onClick={() => handleModuleClick(module.id)}
                                className={`
                                    p-5 transition-all duration-200 flex items-center gap-4 cursor-pointer relative
                                    ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                                    ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {/* Indicateur Status (Gauche) */}
                                <div className="w-8 flex justify-center shrink-0 relative z-10">
                                    {isActive ? (
                                        <div className="relative drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                                            <Triangle className="w-5 h-5 text-amber-500 fill-amber-500 rotate-90 translate-x-1" />
                                        </div>
                                    ) : (
                                        <>
                                            {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                            {isPending && <Hourglass className="w-5 h-5 text-amber-400 animate-pulse" />}
                                            {isLocked && <Lock className="w-5 h-5 text-slate-500" />}
                                            {!isCompleted && !isLocked && !isPending && <div className="w-3 h-3 rounded-full bg-white/20"></div>}
                                        </>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-amber-400' : 'text-slate-400'}`}>
                                            Module {module.id}
                                        </span>
                                        {/* Icone Type Leçon */}
                                        {module.type === 'practice' && (
                                            <Target className="w-3 h-3 text-indigo-400" title="Pratique" />
                                        )}
                                    </div>
                                    
                                    <h3 className={`font-bold text-base leading-tight truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                        {module.title}
                                    </h3>
                                    
                                    {/* Date Estimée (Contraste Fort) */}
                                    {isLocked && (
                                        <p className="text-xs text-[#FCD34D] mt-1.5 font-medium flex items-center gap-1.5">
                                            <span>📅</span> 
                                            Estimation : {getEstimatedDate(index)}
                                        </p>
                                    )}
                                    {isPending && (
                                        <p className="text-xs text-amber-400 mt-1.5 font-bold">En attente de correction</p>
                                    )}
                                </div>
                            </div>
                        </div>
                     );
                  })}
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className={`flex-1 h-full bg-white relative transition-all duration-500 ${isCinemaMode ? 'w-full' : ''}`}>
               <ModuleView 
                  module={activeModule} 
                  onComplete={handleComplete}
                  isLastModule={activeModuleId === modules[modules.length - 1].id}
                  isLoading={isModuleLoading}
                  isCinemaMode={isCinemaMode}
                  onToggleCinema={() => setIsCinemaMode(!isCinemaMode)}
               />
               
               {isCinemaMode && (
                   <div className="absolute inset-0 bg-black/80 pointer-events-none z-0 backdrop-blur-sm transition-opacity duration-500"></div>
               )}
            </div>
          </div>
        );
      default:
        return <div>Vue non trouvée</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      <div className={`transition-all duration-500 ease-in-out ${isCinemaMode ? '-ml-24 opacity-0' : 'ml-0 opacity-100'}`}>
          <GlobalNav currentView={currentView} onChangeView={setCurrentView} />
      </div>
      <main className="flex-1 h-full relative overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
