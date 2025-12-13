import React, { useState } from 'react';
import { Module, ChatMessage, Activity } from '../types';
import { Play, TrendingUp, Trophy, Users, Send, Star, Zap, ChevronRight, MoreHorizontal } from 'lucide-react';

interface DashboardProps {
  modules: Module[];
  onResume: () => void;
  activeModuleId: number;
}

const MOCK_CHAT: ChatMessage[] = [
  { id: 1, user: "Martine", avatar: "https://i.pravatar.cc/150?u=1", text: "Bonjour ! Le barré du Fa ?", time: "10:30", isMe: false },
  { id: 2, user: "Jean-Pierre", avatar: "https://i.pravatar.cc/150?u=2", text: "Tourne bien le poignet.", time: "10:32", isMe: false },
  { id: 3, user: "Moi", avatar: "", text: "Merci Jean-Pierre !", time: "10:35", isMe: true },
];

const MOCK_ACTIVITY: Activity[] = [
  { id: 1, user: "Sophie D.", action: "a terminé", target: "Module 2", time: "2 min", type: "progress" },
  { id: 2, user: "Marc L.", action: "badge", target: "Oreille Musicale", time: "15 min", type: "achievement" },
  { id: 3, user: "Vous", action: "débloqué", target: "Module 3", time: "Hier", type: "progress" },
  { id: 4, user: "Paul", action: "rejoint", target: "Le cours", time: "Hier", type: "progress" },
];

const Dashboard: React.FC<DashboardProps> = ({ modules, onResume, activeModuleId }) => {
  const currentModule = modules.find(m => m.id === activeModuleId);
  const progress = Math.round((modules.filter(m => m.status === 'completed').length / modules.length) * 100);
  const [msgInput, setMsgInput] = useState("");
  const [chat, setChat] = useState(MOCK_CHAT);

  const handleSend = () => {
    if (!msgInput.trim()) return;
    setChat([...chat, { id: Date.now(), user: "Moi", avatar: "", text: msgInput, time: "À l'instant", isMe: true }]);
    setMsgInput("");
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-slate-50">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Bonjour, Michel 👋</h1>
          <p className="text-slate-500 font-medium">Bon retour parmi nous.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 text-xs font-bold text-slate-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            24 élèves en ligne
        </div>
      </header>

      {/* Optimized Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* ROW 1: Action Principale + Stats (Compact) */}
        
        {/* Resume Card - Wide but short (Span 3) */}
        <div className="md:col-span-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full filter blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block px-2 py-0.5 bg-amber-500 text-slate-900 rounded text-[10px] font-black uppercase tracking-wider">
                En cours
              </span>
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Module {currentModule?.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight mb-1">
              {currentModule?.title}
            </h2>
            <p className="text-slate-400 text-sm md:text-base line-clamp-1">{currentModule?.subtitle}</p>
          </div>

          <button 
            onClick={onResume}
            className="relative z-10 shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-amber-500/20 w-full md:w-auto justify-center"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Reprendre</span>
          </button>
        </div>

        {/* Progress Card - Small Square (Span 1) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[140px]">
           <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                <circle cx="40" cy="40" r="36" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray={226} strokeDashoffset={226 - (226 * progress) / 100} className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-slate-800">{progress}%</span>
              </div>
           </div>
           <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2 text-center">Progression Cursus</p>
        </div>

        {/* ROW 2: Secondary Content */}

        {/* Activity Feed (Span 1 on LG) */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 flex flex-col h-[300px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              Activité récente
            </h3>
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {MOCK_ACTIVITY.map(act => (
              <div key={act.id} className="flex items-start gap-2.5 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${act.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                  {act.type === 'achievement' ? <Star className="w-3 h-3 fill-current" /> : <TrendingUp className="w-3 h-3" />}
                </div>
                <div className="leading-tight">
                  <p className="text-slate-700">
                    <span className="font-bold">{act.user}</span> {act.action} <span className="font-medium text-amber-700">{act.target}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat (Span 2 on MD, 1 on LG) */}
        <div className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col h-[300px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Discussion de groupe
            </h3>
            <div className="flex -space-x-2">
               {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>)}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {chat.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                {!msg.isMe && <img src={msg.avatar} alt={msg.user} className="w-6 h-6 rounded-full border border-slate-200 mt-1" />}
                <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm ${msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.user} • {msg.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 rounded-b-2xl">
            <input 
              type="text" 
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Écrire un message..." 
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
            />
            <button onClick={handleSend} className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tip / Widget (Span 1) */}
        <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-4">
             <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md flex-1 flex flex-col justify-center items-center text-center">
                <Zap className="w-8 h-8 mb-2 text-yellow-300 fill-current" />
                <p className="font-bold text-sm mb-1">Le conseil du jour</p>
                <p className="text-emerald-50 text-xs leading-relaxed">Privilégiez la régularité à la durée. 15min/jour suffisent !</p>
            </div>
            
            <button className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between group transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-slate-500 font-bold uppercase">Communauté</p>
                        <p className="text-sm font-bold text-slate-800">Voir les défis</p>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;