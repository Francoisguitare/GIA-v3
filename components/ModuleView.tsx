
import React from 'react';
import { Module } from '../types';
import { Play, Check, ArrowRight, BookOpen, Maximize2, Minimize2, Video, Clock, Lock } from 'lucide-react';

interface ModuleViewProps {
  module: Module;
  onComplete: () => void;
  isLastModule: boolean;
  isLoading?: boolean;
  isCinemaMode?: boolean;
  onToggleCinema?: () => void;
}

const ModuleView: React.FC<ModuleViewProps> = ({ 
    module, 
    onComplete, 
    isLastModule, 
    isLoading = false,
    isCinemaMode = false,
    onToggleCinema
}) => {
  
  // SKELETON LOADER
  if (isLoading) {
    return (
        <div className="flex flex-col h-full bg-white items-center justify-center relative z-20">
            <div className="text-center space-y-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-700 animate-pulse">Accordage en cours...</h2>
                <div className="relative h-40 w-full flex justify-center gap-8">
                    <div className="w-1 h-full bg-amber-800/20 rounded-full"></div>
                    <div className="w-1 h-full bg-amber-700/30 rounded-full"></div>
                    <div className="w-1.5 h-full bg-amber-600/40 rounded-full vibrate-string"></div> 
                    <div className="w-1 h-full bg-amber-700/30 rounded-full"></div>
                    <div className="w-1 h-full bg-amber-800/20 rounded-full"></div>
                </div>
            </div>
        </div>
    );
  }

  // --- LOGIQUE DU BOUTON D'ACTION (GATEKEEPER) ---
  const renderActionButton = () => {
    // Cas 1 : Module déjà terminé
    if (module.status === 'completed') {
        return (
            <button disabled className="w-full md:w-auto bg-emerald-100 text-emerald-800 px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center gap-2 cursor-default border border-emerald-200">
                <Check className="w-6 h-6" /> Leçon terminée
            </button>
        );
    }

    // Cas 2 : Devoir envoyé, en attente (BLOQUANT)
    if (module.type === 'practice' && module.validationStatus === 'submitted') {
        return (
            <div className="flex flex-col items-end">
                <button disabled className="w-full md:w-auto bg-slate-100 text-slate-400 px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
                    <Clock className="w-6 h-6" /> En attente de validation...
                </button>
                <span className="text-xs text-slate-500 mt-1 font-medium">François analyse votre vidéo 🧐</span>
            </div>
        );
    }

    // Cas 3 : Devoir à rendre (Practice)
    if (module.type === 'practice' && (!module.validationStatus || module.validationStatus === 'none')) {
        return (
            <button onClick={onComplete} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg shadow-indigo-200 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
                <Video className="w-6 h-6" /> Envoyer ma vidéo au coach
            </button>
        );
    }

    // Cas 4 : Standard (Théorie)
    return (
        <button onClick={onComplete} className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 group">
            <span>J'ai terminé, passer à la suite</span>
            {isLastModule ? <Check className="w-6 h-6" /> : <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
        </button>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-white overflow-hidden transition-all duration-500 relative z-10 ${isCinemaMode ? 'rounded-none' : 'rounded-l-3xl shadow-2xl border-l border-slate-200'}`}>
      
      {/* 1. ZONE VIDÉO (Hauteur Contrainte 55vh) */}
      <div className={`
         w-full bg-black relative group transition-all duration-500 shrink-0
         ${isCinemaMode ? 'flex-1' : 'h-[55vh]'}
      `}>
          <img 
            src={`https://picsum.photos/1200/675?random=${module.id}`} 
            alt="Illustration du cours" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-20 h-20 bg-amber-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform duration-300 cursor-pointer hover:bg-amber-400">
                <Play className="w-8 h-8 text-white fill-current ml-1" />
             </div>
          </div>
          
          <button 
            onClick={onToggleCinema}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-lg backdrop-blur-md border border-white/20 transition-all z-20 flex items-center gap-2 text-sm font-bold"
          >
            {isCinemaMode ? <><Minimize2 className="w-4 h-4" /> Réduire</> : <><Maximize2 className="w-4 h-4" /> Mode Cinéma</>}
          </button>
      </div>

      {/* 2. STICKY ACTION BAR (Juste sous la vidéo, toujours visible) */}
      {!isCinemaMode && (
          <div className="shrink-0 bg-white border-b border-slate-200 p-4 shadow-md z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
                      <BookOpen className="w-3 h-3" />
                      Module {module.id} — {module.duration}
                  </div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 truncate leading-tight">
                      {module.title}
                  </h1>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                  {renderActionButton()}
              </div>
          </div>
      )}

      {/* 3. SCROLLABLE CONTENT (Seul cette partie scroll) */}
      {!isCinemaMode && (
          <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar p-6 md:p-8">
              <div className="max-w-4xl mx-auto">
                  <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-8">
                      {module.subtitle}
                  </p>

                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                          <span className="w-1.5 h-8 bg-amber-500 rounded-full"></span>
                          {module.content.heading}
                      </h2>
                      <p className="text-lg leading-relaxed text-slate-700 mb-8">
                          {module.content.description}
                      </p>
                      
                      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                              <span>💡</span> Conseils du professeur
                          </h3>
                          <ul className="space-y-3">
                              {module.content.tips.map((tip, index) => (
                                  <li key={index} className="flex items-start gap-3 text-base text-slate-800">
                                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                                      <span>{tip}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
                  <div className="h-12"></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ModuleView;
