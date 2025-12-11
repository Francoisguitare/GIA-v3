import React from 'react';
import { LayoutDashboard, GraduationCap, Gamepad2, Settings, LogOut, Music4 } from 'lucide-react';
import { ViewType } from '../types';

interface GlobalNavProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

const GlobalNav: React.FC<GlobalNavProps> = ({ currentView, onChangeView }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: ViewType; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onChangeView(view)}
        className={`w-full p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group ${
          isActive 
            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105' 
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        }`}
      >
        <Icon className={`w-8 h-8 ${isActive ? 'fill-current' : ''}`} />
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </button>
    );
  };

  return (
    <div className="w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 z-50 shadow-xl flex-shrink-0">
      <div className="mb-10 w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-amber-500 shadow-lg">
        <Music4 className="w-7 h-7" />
      </div>

      <nav className="flex-1 w-full px-2 space-y-6">
        <NavItem view="dashboard" icon={LayoutDashboard} label="Accueil" />
        <NavItem view="classroom" icon={GraduationCap} label="Cursus" />
        <NavItem view="games" icon={Gamepad2} label="Jeux" />
      </nav>

      <div className="space-y-4 w-full px-2 mt-auto">
        <button className="w-full p-3 rounded-xl text-slate-400 hover:bg-slate-100 flex justify-center">
          <Settings className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 border-2 border-white shadow-lg"></div>
      </div>
    </div>
  );
};

export default GlobalNav;