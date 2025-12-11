import React, { useState, useEffect } from 'react';
import { Music4 } from 'lucide-react';
import { INITIAL_MODULES } from './constants';
import { Module } from './types';
import ModuleCard from './components/ModuleCard';
import ModuleView from './components/ModuleView';

export default function App() {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [activeModuleId, setActiveModuleId] = useState<number>(1);

  // Auto-scroll to active module in sidebar if needed (optional enhancement)
  useEffect(() => {
    // In a real app we might scroll the sidebar to show the active item
  }, [activeModuleId]);

  const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];

  const handleModuleClick = (id: number) => {
    setActiveModuleId(id);
  };

  const handleComplete = () => {
    setModules(prevModules => {
      const newModules = [...prevModules];
      const currentIndex = newModules.findIndex(m => m.id === activeModuleId);
      
      // Mark current as completed
      if (currentIndex !== -1) {
        newModules[currentIndex] = {
          ...newModules[currentIndex],
          status: 'completed'
        };
      }

      // Unlock next if exists
      const nextIndex = currentIndex + 1;
      if (nextIndex < newModules.length) {
        // Only unlock if it was locked
        if (newModules[nextIndex].status === 'locked') {
          newModules[nextIndex] = {
            ...newModules[nextIndex],
            status: 'active'
          };
        }
        // Automatically switch to next module for smooth flow
        setActiveModuleId(newModules[nextIndex].id);
      }

      return newModules;
    });
  };

  const completedCount = modules.filter(m => m.status === 'completed').length;
  const progressPercentage = (completedCount / modules.length) * 100;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      
      {/* Sidebar - Navigation & Progress */}
      <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col h-full bg-slate-50 z-20 shadow-xl md:shadow-none">
        
        {/* Brand Header */}
        <div className="p-8 pb-4 flex items-center gap-4 border-b border-slate-200 bg-white md:bg-transparent">
          <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Music4 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              GIA
            </h1>
            <p className="text-amber-700 font-bold uppercase tracking-wide text-sm">
              Formation Guitare
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="px-8 py-6 bg-slate-50">
          <div className="flex justify-between items-end mb-2">
            <span className="text-lg font-bold text-slate-700">Votre progression</span>
            <span className="text-2xl font-black text-amber-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Module List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 md:pr-0 space-y-2">
          {modules.map(module => (
            <ModuleCard
              key={module.id}
              module={module}
              isActive={module.id === activeModuleId}
              onClick={() => handleModuleClick(module.id)}
            />
          ))}
          
          <div className="p-6 mt-8 bg-blue-50 rounded-xl border border-blue-100 mx-2 mb-8">
            <p className="text-blue-900 font-medium text-lg text-center">
              Besoin d'aide ? <br/>
              <span className="font-bold underline cursor-pointer">Contacter le support</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full relative z-10 md:pl-2 pt-2 md:pt-4 pr-2 md:pr-4 pb-2 md:pb-4 bg-slate-50">
        <ModuleView 
          module={activeModule} 
          onComplete={handleComplete}
          isLastModule={activeModuleId === modules[modules.length - 1].id}
        />
      </div>

    </div>
  );
}