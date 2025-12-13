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
        className={`w-full p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group relative ${
          isActive 
            ? 'text-amber-600 bg-amber-50 ring-1 ring-amber-100' 
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
        }`}
      >
        <Icon className={`w-7 h-7 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-amber-700' : ''}`}>{label}</span>
        
        {/* Active Indicator Dot */}
        {isActive && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-full hidden lg:block opacity-0"></div>
        )}
      </button>
    );
  };

  return (
    <div className="w-20 md:w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0">
      <div className="mb-10 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
        <Music4 className="w-6 h-6 text-amber-400" />
      </div>

      <nav className="flex-1 w-full px-3 space-y-4">
        <NavItem view="dashboard" icon={LayoutDashboard} label="Accueil" />
        <NavItem view="classroom" icon={GraduationCap} label="Cursus" />
        <NavItem view="games" icon={Gamepad2} label="Jeux" />
      </nav>

      <div className="space-y-6 w-full px-3 mt-auto flex flex-col items-center">
        <button className="p-3 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-500 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 border-2 border-white shadow-md ring-2 ring-blue-50 cursor-pointer hover:scale-105 transition-transform"></div>
      </div>
    </div>
  );
};

export default GlobalNav;