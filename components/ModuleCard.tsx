import React from 'react';
import { Module, ModuleStatus } from '../types';
import { Lock, CheckCircle2, PlayCircle, ChevronRight } from 'lucide-react';

interface ModuleCardProps {
  module: Module;
  isActive: boolean;
  onClick: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, isActive, onClick }) => {
  const getStatusColor = (status: ModuleStatus) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 border-emerald-200 text-emerald-800';
      case 'active': return 'bg-amber-100 border-amber-300 text-amber-900 ring-2 ring-amber-400 ring-inset';
      case 'locked': return 'bg-slate-100 border-slate-200 text-slate-400';
    }
  };

  const getIcon = (status: ModuleStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />;
      case 'active': return <PlayCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />;
      case 'locked': return <Lock className="w-8 h-8 text-slate-400 flex-shrink-0" />;
    }
  };

  const isLocked = module.status === 'locked';

  return (
    <button
      onClick={!isLocked ? onClick : undefined}
      disabled={isLocked}
      className={`
        w-full text-left p-6 mb-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group
        ${getStatusColor(module.status)}
        ${!isLocked ? 'hover:scale-[1.02] hover:shadow-md cursor-pointer' : 'cursor-not-allowed opacity-80'}
        ${isActive ? 'scale-[1.02] shadow-md border-amber-500' : ''}
      `}
      aria-current={isActive ? 'true' : undefined}
      aria-disabled={isLocked}
    >
      {getIcon(module.status)}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold uppercase tracking-wider opacity-70">
            Module {module.id}
          </span>
          {module.status === 'completed' && (
            <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">
              Terminé
            </span>
          )}
        </div>
        <h3 className={`text-xl font-bold truncate leading-tight ${isLocked ? 'text-slate-500' : ''}`}>
          {module.title}
        </h3>
        <p className={`text-base mt-1 truncate ${isLocked ? 'text-slate-400' : 'opacity-80'}`}>
          {module.subtitle}
        </p>
      </div>

      {!isLocked && (
        <ChevronRight className={`w-6 h-6 transition-transform ${isActive ? 'translate-x-1 text-amber-700' : 'text-slate-400 group-hover:text-slate-600'}`} />
      )}
    </button>
  );
};

export default ModuleCard;