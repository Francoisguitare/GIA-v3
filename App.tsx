import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_MODULES } from './constants';
import { Module, Lesson, ViewType } from './types';
import ModuleView from './components/ModuleView';
import Dashboard from './components/Dashboard';
import GameRoom from './components/GameRoom';
import GlobalNav from './components/GlobalNav';
import { 
    Triangle, Lock, CheckCircle2, Target, Hourglass, 
    ChevronDown, ChevronUp, PlayCircle, FolderOpen, Video 
} from 'lucide-react';

export default function App() {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  // On track la leçon active
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  // Pour l'accordéon : quels modules sont ouverts ? (Par défaut le 100)
  const [expandedModuleIds, setExpandedModuleIds] = useState<number[]>([100]);

  // Récupérer la leçon active
  const activeLesson = useMemo(() => {
      let foundLesson: Lesson | undefined;
      for (const mod of modules) {
          foundLesson = mod.lessons.find(l => l.id === activeLessonId);
          if (foundLesson) break;
      }
      // Fallback sécurisé si l'ID n'existe pas
      return foundLesson || modules[0].lessons[0];
  }, [modules, activeLessonId]);

  // Aplatir les leçons pour le calcul des dates et navigation linéaire
  const allLessons = useMemo(() => modules.flatMap(m => m.lessons), [modules]);

  const getEstimatedDate = (lessonIndex: number) => {
    const today = new Date();
    const daysToAdd = lessonIndex * 7; 
    const estimatedDate = new Date(today);
    estimatedDate.setDate(today.getDate() + daysToAdd);
    return estimatedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  const toggleModule = (modId: number) => {
      setExpandedModuleIds(prev => 
        prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
      );
  };

  const handleLessonClick = (lessonId: number) => {
    const targetLesson = allLessons.find(l => l.id === lessonId);
    
    // Protection contre le clic sur une leçon verrouillée
    if (!targetLesson || (targetLesson.status === 'locked' && lessonId !== activeLessonId)) {
        return;
    }
    
    if (lessonId === activeLessonId) return;

    setIsLessonLoading(true);
    // Simuler un temps de chargement réseau/transition
    setTimeout(() => {
        setActiveLessonId(lessonId);
        setIsLessonLoading(false);
    }, 500);
  };

  const handleComplete = () => {
    // 1. Feedback Sonore
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio interaction required"));

    // 2. Mise à jour de l'état
    setTimeout(() => {
        // Copie profonde pour manipulation
        const newModules = modules.map(m => ({
            ...m,
            lessons: m.lessons.map(l => ({ ...l, content: { ...l.content } }))
        }));
        
        // Aplatir pour recherche facile
        const flatList = newModules.flatMap(m => m.lessons);
        const currentLessonRef = flatList.find(l => l.id === activeLessonId);

        if (!currentLessonRef) return;

        let nextLessonId: number | null = null;
        let nextModuleId: number | null = null;

        // --- LOGIQUE DE VALIDATION ---
        if (currentLessonRef.type === 'practice' && (!currentLessonRef.validationStatus || currentLessonRef.validationStatus === 'none')) {
            // Cas pratique : on soumet mais on ne débloque pas tout de suite
            currentLessonRef.status = 'pending_review';
            currentLessonRef.validationStatus = 'submitted';
            // Pas de navigation automatique
        } else {
            // Cas standard : on termine
            currentLessonRef.status = 'completed';
            
            // Trouver la suivante
            const currentIndex = flatList.findIndex(l => l.id === activeLessonId);
            if (currentIndex !== -1 && currentIndex + 1 < flatList.length) {
                const nextL = flatList[currentIndex + 1];
                
                // Déverrouiller la suivante si elle était bloquée
                if (nextL.status === 'locked') {
                    nextL.status = 'active';
                    
                    // Si on change de module, on note l'ID pour l'ouvrir
                    if (nextL.moduleId !== currentLessonRef.moduleId) {
                         nextModuleId = nextL.moduleId;
                    }
                }
                nextLessonId = nextL.id;
            }
        }

        // Appliquer les changements d'état
        setModules(newModules);

        // 3. Navigation
        if (nextLessonId) {
            if (nextModuleId) {
                setExpandedModuleIds(prev => prev.includes(nextModuleId!) ? prev : [...prev, nextModuleId!]);
            }
            
            setIsLessonLoading(true);
            setTimeout(() => {
                setActiveLessonId(nextLessonId!);
                setIsLessonLoading(false);
            }, 600);
        }
    }, 300);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            modules={modules} 
            activeLessonId={activeLessonId} 
            onResume={() => {
                setCurrentView('classroom');
            }} 
          />
        );
      case 'games':
        return <GameRoom />;
      case 'classroom':
        return (
          <div className="flex flex-col md:flex-row h-full relative bg-black">
            
            {/* --- SIDEBAR MANCHE DE GUITARE --- */}
            <div className="w-full md:w-[340px] flex-col h-full bg-[#1a1a1a] border-r border-white/10 shadow-2xl flex z-20">
              {/* Header Sidebar */}
              <div className="p-5 bg-[#262626] border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-black text-white tracking-widest uppercase flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-amber-500" />
                    Programme
                </h2>
                <span className="text-xs font-bold bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                    {Math.round((allLessons.filter(l => l.status === 'completed').length / allLessons.length) * 100)}%
                </span>
              </div>
              
              {/* Accordéon Modules */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1a1a1a]">
                {modules.map((module) => {
                    const isExpanded = expandedModuleIds.includes(module.id);
                    
                    return (
                        <div key={module.id} className="border-b border-white/5">
                            {/* Titre Module (Conteneur) */}
                            <button 
                                onClick={() => toggleModule(module.id)}
                                className="w-full p-4 flex items-center justify-between bg-[#202020] hover:bg-[#2a2a2a] transition-colors group"
                            >
                                <span className="font-bold text-slate-300 text-sm uppercase group-hover:text-white transition-colors">
                                    {module.title}
                                </span>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                            </button>

                            {/* Liste des Leçons (Contenu) */}
                            {isExpanded && (
                                <div className="bg-[#151515] relative">
                                    {/* Ligne "Corde" verticale */}
                                    <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-white/5"></div>

                                    {module.lessons.map((lesson, idx) => {
                                        const isActive = lesson.id === activeLessonId;
                                        const isLocked = lesson.status === 'locked';
                                        const isPending = lesson.status === 'pending_review';
                                        const isCompleted = lesson.status === 'completed';
                                        const lessonGlobalIndex = allLessons.findIndex(l => l.id === lesson.id);

                                        return (
                                            <div 
                                                key={lesson.id}
                                                onClick={() => handleLessonClick(lesson.id)}
                                                className={`
                                                    relative pl-12 pr-4 py-4 flex items-center gap-3 cursor-pointer border-l-4 transition-all
                                                    ${isActive ? 'bg-white/10 border-amber-500' : 'border-transparent hover:bg-white/5'}
                                                    ${isLocked ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}
                                                `}
                                            >
                                                {/* Icône État */}
                                                <div className="shrink-0">
                                                    {isActive ? (
                                                        <Triangle className="w-4 h-4 text-amber-500 fill-amber-500 rotate-90" />
                                                    ) : isCompleted ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    ) : isPending ? (
                                                        <Hourglass className="w-4 h-4 text-amber-400" />
                                                    ) : isLocked ? (
                                                        <Lock className="w-4 h-4 text-slate-500" />
                                                    ) : (
                                                        <PlayCircle className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                            {lesson.title}
                                                        </span>
                                                        {lesson.type === 'practice' && <Target className="w-3 h-3 text-indigo-400" />}
                                                    </div>
                                                    
                                                    {/* Informations complémentaires */}
                                                    {isLocked && (
                                                        <div className="text-xs text-[#FCD34D] font-medium flex items-center gap-1">
                                                            📅 {getEstimatedDate(lessonGlobalIndex)}
                                                        </div>
                                                    )}
                                                    {isPending && <div className="text-xs text-amber-400 font-bold">En attente...</div>}
                                                    {!isLocked && !isPending && <div className="text-xs text-slate-500">{lesson.duration}</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
              </div>
            </div>
            
            {/* --- LECTEUR VIDÉO --- */}
            <div className="flex-1 h-full bg-black relative">
               <ModuleView 
                  lesson={activeLesson} 
                  onComplete={handleComplete}
                  isLastLesson={activeLessonId === allLessons[allLessons.length - 1].id}
                  isLoading={isLessonLoading}
               />
            </div>
          </div>
        );
      default:
        return <div>Vue non trouvée</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      <GlobalNav currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 h-full relative overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}