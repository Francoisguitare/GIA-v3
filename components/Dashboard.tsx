import React, { useState } from 'react';
import { Module, ChatMessage, Activity } from '../types';
import { Play, TrendingUp, Trophy, Users, Send, Star, Zap, ChevronRight, MoreHorizontal, Clock } from 'lucide-react';

interface DashboardProps {
  modules: Module[];
  onResume: () => void;
  activeModuleId: number;
}

const MOCK_CHAT: ChatMessage[] = [
  { id: 1, user: "Martine", avatar: "https://i.pravatar.cc/150?u=1", text: "Bonjour ! Le barré du Fa ?", time: "10:30", isMe: false },
  { id: 2, user: "Jean-Pierre", avatar: "https://i.pravatar.cc/150?u=2", text: "Tourne bien le poignet.", time: "10:32", isMe: false },
  { id: 3, user: "Moi", avatar: "", text: "Merci Jean-Pierre !", time: "10:35", isMe: true },
  { id: 4, user: "Sophie", avatar: "https://i.pravatar.cc/150?u=3", text: "On se voit au live de jeudi ?", time: "10:38", isMe: false },
  { id: 5, user: "Paul", avatar: "", text: "J'arrive pas le rythme du module 4", time: "10:40", isMe: false },
];

const MOCK_ACTIVITY: Activity[] = [
  { id: 1, user: "Sophie D.", action: "a terminé", target: "Module 2", time: "2 min", type: "progress" },
  { id: 2, user: "Marc L.", action: "badge", target: "Oreille Musicale", time: "15 min", type: "achievement" },
  { id: 3, user: "Vous", action: "débloqué", target: "Module 3", time: "Hier", type: "progress" },
  { id: 4, user: "Paul", action: "rejoint", target: "Le cours", time: "Hier", type: "progress" },
  { id: 5, user: "Julie", action: "a terminé", target: "Module 1", time: "Hier", type: "progress" },
  { id: 6, user: "Thomas", action: "badge", target: "Rythme", time: "2j", type: "achievement" },
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
    <div className="h-full flex flex-col p-4 md:p-6 bg-slate-50 overflow-hidden">
      
      {/* HEADER: Compact & Aligned */}
      <header className="flex-none mb-4 flex justify-between items-center h-12">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            Bonjour, Michel <span className="text-lg">👋</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200 text-xs font-bold text-slate-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            24 en ligne
        </div>
      </header>

      {/* MAIN CONTENT GRID - No Global Scroll */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN (Main Stack) */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
            
            {/* 1. HERO BAR: Ultra Compact "Banner" Style */}
            <div className="flex-none bg-slate-900 rounded-xl p-3 shadow-lg flex items-center justify-between gap-4 group cursor-pointer hover:bg-slate-800 transition-colors" onClick={onResume}>
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shrink-0 shadow-md">
                        <Play className="w-5 h-5 text-slate-900 fill-current ml-0.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Reprendre</span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span className="text-[10px] text-slate-400 font-medium">{currentModule?.duration}</span>
                        </div>
                        <h2 className="text-white font-bold text-lg truncate leading-none mt-0.5">
                            {currentModule?.title}
                        </h2>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 pr-2">
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Continuer</span>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
            </div>

            {/* 2. STATS & CHAT ROW - Fills remaining height */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
                
                {/* Chat Section (Grows) */}
                <div className="flex-[2] bg-white rounded-xl border border-slate-200 flex flex-col min-h-0 shadow-sm">
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl flex-none">
                        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            Discussion (Groupe A)
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30 custom-scrollbar">
                        {chat.map(msg => (
                        <div key={msg.id} className={`flex gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                            {!msg.isMe && <img src={msg.avatar || `https://ui-avatars.com/api/?name=${msg.user}&background=random`} alt={msg.user} className="w-6 h-6 rounded-full border border-slate-200 mt-1" />}
                            <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                            <div className={`px-3 py-2 rounded-2xl text-xs sm:text-sm ${msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                                {msg.text}
                            </div>
                            <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                            </div>
                        </div>
                        ))}
                    </div>
                    
                    <div className="p-2 border-t border-slate-100 flex gap-2 flex-none bg-white rounded-b-xl">
                        <input 
                            type="text" 
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Message..." 
                            className="flex-1 bg-slate-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button onClick={handleSend} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 shadow-sm">
                            <Send className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                    </div>
                </div>

                 {/* Progress Card (Narrow Column) */}
                 <div className="flex-1 md:max-w-[180px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative p-4 shrink-0">
                     <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="40%" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                            <circle cx="50%" cy="50%" r="40%" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray={251} strokeDashoffset={251 - (251 * progress) / 100} className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-black text-slate-800">{progress}%</span>
                        </div>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2 text-center">Cursus</p>
                    <div className="mt-4 w-full pt-4 border-t border-slate-100">
                         <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Badge</span>
                            <span className="text-amber-600 font-bold">3/12</span>
                         </div>
                         <div className="flex gap-1 justify-center">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                         </div>
                    </div>
                </div>

            </div>
        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
            
            {/* Tip Widget */}
            <div className="flex-none bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-3 text-white shadow-md flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-yellow-300 fill-current" />
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-[10px] opacity-80 uppercase tracking-wide">Conseil du jour</p>
                    <p className="text-xs font-medium truncate">La régularité bat l'intensité.</p>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col min-h-0 shadow-sm">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl flex-none">
                    <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    Activité
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {MOCK_ACTIVITY.map(act => (
                    <div key={act.id} className="flex items-start gap-2 text-xs p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${act.type === 'achievement' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {act.type === 'achievement' ? <Star className="w-3 h-3 fill-current" /> : <TrendingUp className="w-3 h-3" />}
                        </div>
                        <div className="leading-tight flex-1 min-w-0">
                        <p className="text-slate-700 truncate">
                            <span className="font-bold text-slate-900">{act.user}</span> {act.action}
                        </p>
                        <p className="font-semibold text-amber-700 truncate">{act.target}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{act.time}</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
            
             <button className="flex-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between group transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Communauté</p>
                        <p className="text-xs font-bold text-slate-800">Défis Hebdo</p>
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