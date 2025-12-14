
import React, { useState } from 'react';
import { Lesson } from '../types';
import { Play, Check, ArrowRight, BookOpen, Maximize2, Minimize2, Video, Clock, X, FileText } from 'lucide-react';

interface ModuleViewProps {
  lesson: Lesson;
  onComplete: () => void;
  isLastLesson: boolean;
  isLoading?: boolean;
}

const ModuleView: React.FC<ModuleViewProps> = ({ 
    lesson, 
    onComplete, 
    isLastLesson, 
    isLoading = false
}) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // SKELETON LOADER
  if (isLoading) {
    return (
        <div className="flex flex-col h-full bg-white items-center justify-center relative z-20">
            <div className="text-center space-y-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-700 animate-pulse">Chargement de la leçon...</h2>
                <div className="relative h-40 w-full flex justify-center gap-8">
                    <div className="w-1 h-full bg-amber-800/20 rounded-full"></div>
                    <div className="w-1.5 h-full bg-amber-600/40 rounded-full vibrate-string"></div> 
                    <div className="w-1 h-full bg-amber-800/20 rounded-full"></div>
                </div>
            </div>
        </div>
    );
  }

  // --- LOGIQUE BOUTON ACTION ---
  const renderActionButton = () => {
    if (lesson.status === 'completed') {
        return (
            <button disabled className="w-full md:w-auto bg-emerald-100 text-emerald-800 px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center gap-2 cursor-default border border-emerald-200">
                <Check className="w-6 h-6" /> Leçon terminée
            </button>
        );
    }
    if (lesson.type === 'practice' && lesson.validationStatus === 'submitted') {
        return (
            <button disabled className="w-full md:w-auto bg-slate-100 text-slate-400 px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
                <Clock className="w-6 h-6" /> En attente de correction...
            </button>
        );
    }
    if (lesson.type === 'practice' && (!lesson.validationStatus || lesson.validationStatus === 'none')) {
        return (
            <button onClick={onComplete} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg shadow-indigo-200 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
                <Video className="w-6 h-6" /> Envoyer mon travail au coach 📤
            </button>
        );
    }
    return (
        <button onClick={onComplete} className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 group">
            <span>J'ai terminé, passer à la suite</span>
            {isLastLesson ? <Check className="w-6 h-6" /> : <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
        </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
      
      {/* 1. ZONE VIDÉO (Flex-1 : Prend tout l'espace disponible) */}
      <div className={`
         relative w-full flex-1 bg-black flex items-center justify-center group
         ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}
      `}>
          <div className="relative w-full h-full max-h-full flex items-center justify-center bg-zinc-900">
             {/* Fallback image if video fails or is loading */}
             <img 
                src={`https://picsum.photos/seed/${lesson.id}/1200/675`} 
                alt="Illustration du cours" 
                className="w-full h-full object-contain opacity-50 group-hover:opacity-40 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-amber-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform duration-300 cursor-pointer hover:bg-amber-400">
                    <Play className="w-10 h-10 text-white fill-current ml-1" />
                </div>
            </div>
            {/* Contrôles Player */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium">{lesson.duration}</span>
                <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-white hover:text-amber-400 p-2"
                >
                    {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                </button>
            </div>
          </div>
      </div>

      {/* 2. BARRE D'ACTION STICKY (Fixe en bas) */}
      <div className="flex-none bg-white border-t border-slate-200 p-4 md:px-8 md:py-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1">
                  <h1 className="text-xl font-black text-slate-900 leading-tight">
                      {lesson.title}
                  </h1>
                  <p className="text-sm text-slate-500 truncate">{lesson.subtitle}</p>
              </div>
              <button 
                onClick={() => setIsNotesOpen(true)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold transition-colors"
              >
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="hidden md:inline">Lire le cours</span>
                  <span className="md:hidden">Notes</span>
              </button>
          </div>
          
          <div className="w-full md:w-auto">
              {renderActionButton()}
          </div>
      </div>

      {/* 3. MODALE "NOTES DE COURS" (Overlay) - Z-INDEX AUGMENTÉ À 60 */}
      {isNotesOpen && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
              <div className="w-full md:w-[600px] h-full bg-white shadow-2xl overflow-y-auto slide-in-from-right duration-300">
                  {/* Header Modale */}
                  <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-slate-100 p-6 flex justify-between items-center z-10">
                      <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                          <FileText className="w-6 h-6 text-amber-500" />
                          Notes de cours
                      </h2>
                      <button 
                        onClick={() => setIsNotesOpen(false)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                      >
                          <X className="w-6 h-6 text-slate-600" />
                      </button>
                  </div>

                  {/* Contenu Texte */}
                  <div className="p-8 prose prose-lg prose-slate max-w-none">
                      <h3>{lesson.content.heading}</h3>
                      <p>{lesson.content.description}</p>
                      
                      <div className="my-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                          <h4 className="text-blue-900 mt-0">💡 Conseils du coach</h4>
                          <ul className="list-disc pl-5 space-y-2 text-slate-700">
                              {lesson.content.tips.map((tip, idx) => (
                                  <li key={idx}>{tip}</li>
                              ))}
                          </ul>
                      </div>
                      
                      <p className="text-slate-500 italic">
                          Relisez ces notes après avoir pratiqué la vidéo au moins 3 fois.
                      </p>
                  </div>
                  <div className="h-24"></div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ModuleView;