
import React, { useState } from 'react';
import { Module, ChatMessage } from '../types';
import { Play, Timer, Send, Zap, Lock, Target, MessageCircle, Flame, Hand } from 'lucide-react';

interface DashboardProps {
  modules: Module[]; 
  onResume: () => void;
  activeLessonId: number; 
}

const MOCK_CHAT: ChatMessage[] = [
  { id: 1, user: "Martine", avatar: "https://i.pravatar.cc/150?u=1", text: "Le barré du Fa ?", time: "10:30", isMe: false },
  { id: 2, user: "Jean-Pierre", avatar: "https://i.pravatar.cc/150?u=2", text: "Tourne le poignet.", time: "10:32", isMe: false },
  { id: 3, user: "Moi", avatar: "", text: "Merci JP !", time: "10:35", isMe: true },
];

const Dashboard: React.FC<DashboardProps> = ({ modules, onResume, activeLessonId }) => {
  // Aplatir les leçons pour faciliter l'affichage
  const allLessons = modules.flatMap(m => m.lessons);
  const currentLesson = allLessons.find(l => l.id === activeLessonId) || allLessons[0];
  const nextLessons = allLessons.filter(l => l.id > activeLessonId).slice(0, 2);
  
  const completedCount = allLessons.filter(l => l.status === 'completed').length;
  const progress = Math.round((completedCount / allLessons.length) * 100);
  const isStarted = completedCount > 0 || currentLesson.id > 1;
  
  const [msgInput, setMsgInput] = useState("");
  const [chat, setChat] = useState(MOCK_CHAT);

  const handleSend = () => {
    if (!msgInput.trim()) return;
    setChat([...chat, { id: Date.now(), user: "Moi", avatar: "", text: msgInput, time: "À l'instant", isMe: true }]);
    setMsgInput("");
  };

  return (
    <div className="h-full flex flex-col p-6 md:p-8 bg-slate-50/50 overflow-y-auto">
      
      {/* Header */}
      <header className="flex-none mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Bonjour, Michel <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-slate-600 font-medium mt-1 text-lg">Prêt à faire vibrer les cordes ?</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-sm font-bold text-slate-700">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            24 élèves en ligne
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- COLONNE PRINCIPALE (8/12) --- */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* 1. HERO CARD */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]" onClick={onResume}>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-50 -skew-x-12 translate-x-12"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Visual Progress */}
                    <div className="relative shrink-0">
                        <svg className="w-28 h-28 transform -rotate-90">
                            <circle cx="50%" cy="50%" r="42%" stroke="#cbd5e1" strokeWidth="8" fill="none" />
                            <circle cx="50%" cy="50%" r="42%" stroke="#f59e0b" strokeWidth="8" fill="none" strokeDasharray={290} strokeDashoffset={290 - (290 * progress) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-black text-slate-800">{progress}%</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500">Accompli</span>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-200">
                            <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
                            {isStarted ? "Leçon en cours" : "À démarrer"}
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">
                            {currentLesson?.title}
                        </h2>
                        <p className="text-slate-600 font-medium text-lg">{currentLesson?.subtitle}</p>
                    </div>

                    <button className="shrink-0 bg-slate-900 hover:bg-black text-white rounded-2xl py-4 px-8 flex items-center gap-3 shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all group-hover:translate-x-1 ring-2 ring-offset-2 ring-transparent group-hover:ring-slate-900">
                        <span className="font-bold text-lg">
                            {isStarted ? "Reprendre" : "Démarrer"}
                        </span>
                        <Play className="w-6 h-6 fill-current" />
                    </button>
                </div>
            </div>

            {/* 2. Jauges Gamification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-rose-600 mb-1">
                        <Hand className="w-5 h-5" />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Callosité</h3>
                    </div>
                    <div className="flex-1">
                         <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                             <span>Douillets</span>
                             <span>Acier</span>
                         </div>
                         <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                             <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 w-[45%] rounded-full"></div>
                         </div>
                         <p className="text-xs text-slate-500 mt-2 font-medium">Niveau 2 : Ça commence à piquer !</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Timer className="w-5 h-5" />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Temps</h3>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-800">2h 15</p>
                        <p className="text-xs text-slate-500 font-medium leading-tight mt-1">
                            Accordées à votre passion cette semaine.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10 text-amber-500">
                        <Flame className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 mb-1 relative z-10">
                        <Flame className="w-5 h-5 fill-current" />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Série</h3>
                    </div>
                    <div className="relative z-10">
                        <p className="text-3xl font-black text-slate-800">4 Jours</p>
                        <p className="text-xs text-slate-500 font-medium leading-tight mt-1">
                            Revenez demain pour garder le rythme !
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Suite Programme */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-500" />
                    Leçons suivantes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nextLessons.map(lesson => (
                        <div key={lesson.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 opacity-100 hover:bg-white transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Leçon {lesson.id}</p>
                                <p className="font-bold text-slate-700 leading-tight text-lg">{lesson.title}</p>
                            </div>
                        </div>
                    ))}
                    {nextLessons.length === 0 && (
                        <div className="col-span-2 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 font-medium text-center">
                            Vous avez tout terminé ! 🎉
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- COLONNE SECONDAIRE --- */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border-l-4 border-emerald-500 shadow-sm shadow-slate-200/50 rounded-r-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                        <Zap className="w-6 h-6 text-emerald-600 fill-current" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Conseil du jour</p>
                        <p className="text-slate-800 font-medium text-base leading-snug">
                            "Relâchez votre épaule gauche, elle ne doit pas remonter vers l'oreille."
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        Entraide
                    </h3>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Voir tout</button>
                </div>
                <div className="p-4 space-y-4 bg-white">
                    {chat.slice(0, 3).map(msg => (
                    <div key={msg.id} className="flex gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                             {msg.isMe ? <span className="text-xs font-bold text-slate-500">Moi</span> : <img src={msg.avatar} className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-slate-800 text-xs">{msg.user}</span>
                                <span className="text-[10px] text-slate-400">{msg.time}</span>
                            </div>
                            <p className="text-slate-700 text-sm mt-1 bg-slate-50 p-2 rounded-r-xl rounded-bl-xl inline-block border border-slate-100">
                                {msg.text}
                            </p>
                        </div>
                    </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100">
                    <div className="relative">
                        <input 
                            className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                            placeholder="Poser une question..."
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;