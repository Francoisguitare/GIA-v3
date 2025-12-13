import React, { useState } from 'react';
import { Module, ChatMessage, Activity } from '../types';
import { Play, TrendingUp, Trophy, Users, Send, Star, Zap, ChevronRight, Clock, Lock, Target, MessageCircle } from 'lucide-react';

interface DashboardProps {
  modules: Module[];
  onResume: () => void;
  activeModuleId: number;
}

const MOCK_CHAT: ChatMessage[] = [
  { id: 1, user: "Martine", avatar: "https://i.pravatar.cc/150?u=1", text: "Le barré du Fa ?", time: "10:30", isMe: false },
  { id: 2, user: "Jean-Pierre", avatar: "https://i.pravatar.cc/150?u=2", text: "Tourne le poignet.", time: "10:32", isMe: false },
  { id: 3, user: "Moi", avatar: "", text: "Merci JP !", time: "10:35", isMe: true },
];

const Dashboard: React.FC<DashboardProps> = ({ modules, onResume, activeModuleId }) => {
  const currentModule = modules.find(m => m.id === activeModuleId);
  const nextModules = modules.filter(m => m.id > activeModuleId).slice(0, 2);
  const progress = Math.round((modules.filter(m => m.status === 'completed').length / modules.length) * 100);
  const [msgInput, setMsgInput] = useState("");
  const [chat, setChat] = useState(MOCK_CHAT);

  const handleSend = () => {
    if (!msgInput.trim()) return;
    setChat([...chat, { id: Date.now(), user: "Moi", avatar: "", text: msgInput, time: "À l'instant", isMe: true }]);
    setMsgInput("");
  };

  return (
    <div className="h-full flex flex-col p-6 md:p-8 bg-slate-50/50 overflow-y-auto">
      
      {/* Header Simplifié */}
      <header className="flex-none mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Bonjour, Michel <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Prêt à faire vibrer les cordes ?</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 text-sm font-bold text-slate-600">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            24 élèves en ligne
        </div>
      </header>

      {/* GRID LAYOUT: 70% Left (Learning) / 30% Right (Support) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- ZONE PRINCIPALE (70%) --- */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* 1. HERO CARD: Focus & Progression */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]" onClick={onResume}>
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-50 -skew-x-12 translate-x-12"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Left: Visual Progress */}
                    <div className="relative shrink-0">
                        <svg className="w-28 h-28 transform -rotate-90">
                            <circle cx="50%" cy="50%" r="42%" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                            <circle cx="50%" cy="50%" r="42%" stroke="#f59e0b" strokeWidth="8" fill="none" strokeDasharray={290} strokeDashoffset={290 - (290 * progress) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-black text-slate-800">{progress}%</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Accompli</span>
                        </div>
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wide">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            En cours
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">
                            {currentModule?.title}
                        </h2>
                        <p className="text-slate-500 font-medium text-lg">{currentModule?.subtitle}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-4 pt-2 text-sm font-medium text-slate-400">
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> {currentModule?.duration}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>Module {currentModule?.id} / {modules.length}</span>
                        </div>
                    </div>

                    {/* Right: CTA */}
                    <button className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 px-8 flex items-center gap-3 shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all group-hover:translate-x-1">
                        <span className="font-bold text-lg">Reprendre</span>
                        <Play className="w-5 h-5 fill-current" />
                    </button>
                </div>
            </div>

            {/* 2. NEXT STEPS & CHALLENGES ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Next Modules List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-500" />
                        La suite du programme
                    </h3>
                    <div className="space-y-3">
                        {nextModules.map(mod => (
                            <div key={mod.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Module {mod.id}</p>
                                    <p className="font-bold text-slate-700 leading-tight">{mod.title}</p>
                                </div>
                            </div>
                        ))}
                         {nextModules.length === 0 && (
                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 font-medium text-center">
                                Vous avez tout terminé ! 🎉
                            </div>
                        )}
                    </div>
                </div>

                {/* Weekly Challenge Banner */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Défis Hebdo
                    </h3>
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-[164px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="w-32 h-32" />
                        </div>
                        <div>
                            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">
                                Nouveau
                            </span>
                            <h4 className="text-xl font-bold leading-tight mb-1">Rythme & Cadence</h4>
                            <p className="text-indigo-100 text-sm">Maîtrisez le 4/4 sans métronome.</p>
                        </div>
                        <button className="self-start bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors">
                            Participer
                        </button>
                    </div>
                </div>

            </div>

        </div>

        {/* --- ZONE SECONDAIRE (30%) --- */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* 1. DAILY TIP (Support) */}
            <div className="bg-white border-l-4 border-emerald-500 shadow-sm shadow-slate-200/50 rounded-r-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                        <Zap className="w-5 h-5 text-emerald-600 fill-current" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Conseil du jour</p>
                        <p className="text-slate-700 font-medium text-sm leading-snug">
                            "Pour les barrés, ne forcez pas avec le pouce. Utilisez le poids de votre bras."
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. COMPACT CHAT (Community) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        Entraide
                    </h3>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Voir tout</button>
                </div>
                
                <div className="p-3 space-y-3 bg-white">
                    {chat.slice(0, 3).map(msg => (
                    <div key={msg.id} className="flex gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                             {msg.isMe ? <span className="text-xs font-bold text-slate-500">Moi</span> : <img src={msg.avatar} className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-slate-700 text-xs">{msg.user}</span>
                                <span className="text-[10px] text-slate-400">{msg.time}</span>
                            </div>
                            <p className="text-slate-600 text-xs mt-0.5 bg-slate-50 p-2 rounded-r-xl rounded-bl-xl inline-block">
                                {msg.text}
                            </p>
                        </div>
                    </div>
                    ))}
                </div>
                <div className="p-3 border-t border-slate-50">
                    <div className="relative">
                        <input 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-10 text-xs focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="Poser une question..."
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} className="absolute right-1 top-1 p-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            <Send className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. TROPHIES (Gamification) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-slate-800 text-sm">Mes Trophées</h3>
                     <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">3 / 12</span>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200" title="Premier accord">
                        <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200" title="Régularité">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 border-dashed">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 border-dashed">
                        <Lock className="w-5 h-5" />
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;