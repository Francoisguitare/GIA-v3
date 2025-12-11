import React, { useState } from 'react';
import { Module, ChatMessage, Activity } from '../types';
import { Play, TrendingUp, Trophy, Users, Send, Star, Zap } from 'lucide-react';

interface DashboardProps {
  modules: Module[];
  onResume: () => void;
  activeModuleId: number;
}

const MOCK_CHAT: ChatMessage[] = [
  { id: 1, user: "Martine", avatar: "https://i.pravatar.cc/150?u=1", text: "Bonjour ! Quelqu'un a réussi le barré du Fa ?", time: "10:30", isMe: false },
  { id: 2, user: "Jean-Pierre", avatar: "https://i.pravatar.cc/150?u=2", text: "Oui ! Le secret c'est de bien tourner le poignet.", time: "10:32", isMe: false },
  { id: 3, user: "Moi", avatar: "", text: "Merci pour le conseil Jean-Pierre !", time: "10:35", isMe: true },
];

const MOCK_ACTIVITY: Activity[] = [
  { id: 1, user: "Sophie D.", action: "a terminé", target: "Module 2 : Accorder", time: "Il y a 2 min", type: "progress" },
  { id: 2, user: "Marc L.", action: "a gagné le badge", target: "Oreille Musicale", time: "Il y a 15 min", type: "achievement" },
  { id: 3, user: "Vous", action: "avez débloqué", target: "Module 3", time: "Hier", type: "progress" },
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
    <div className="h-full overflow-y-auto p-6 md:p-10 bg-slate-50">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Bonjour, Michel 👋</h1>
          <p className="text-xl text-slate-500">Prêt à faire vibrer les cordes aujourd'hui ?</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-bold text-slate-600">24 élèves en ligne</span>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* HERO CARD - Resume Course (Span 2 cols) */}
        <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full filter blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-bold mb-4 border border-amber-500/20">
              REPRENDRE LA LEÇON
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
              {currentModule?.title}
            </h2>
            <p className="text-slate-400 text-lg line-clamp-2">{currentModule?.subtitle}</p>
          </div>

          <button 
            onClick={onResume}
            className="relative z-10 w-full md:w-auto mt-6 bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-4 rounded-xl text-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-amber-500/25"
          >
            <Play className="w-6 h-6 fill-current" />
            Continuer le Module {currentModule?.id}
          </button>
        </div>

        {/* STATS CARD - Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-50/50"></div>
           <div className="relative z-10 text-center">
             <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="60" stroke="#3b82f6" strokeWidth="12" fill="none" strokeDasharray={377} strokeDashoffset={377 - (377 * progress) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-black text-slate-800">{progress}%</span>
                </div>
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">Progression Globale</p>
           </div>
        </div>

        {/* SOCIAL CARD - Chat (Span 1 col, 2 rows) */}
        <div className="md:row-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Salle de discussion
            </h3>
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {chat.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                {!msg.isMe && <img src={msg.avatar} alt={msg.user} className="w-8 h-8 rounded-full border border-slate-200" />}
                <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Dites bonjour..." 
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSend} className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GAMIFICATION - Leaderboard / Activity */}
        <div className="md:col-span-2 lg:col-span-1 bg-amber-50 rounded-3xl p-6 border border-amber-100 flex flex-col">
          <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            Derniers Exploits
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {MOCK_ACTIVITY.map(act => (
              <div key={act.id} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-amber-100/50 shadow-sm">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${act.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                  {act.type === 'achievement' ? <Star className="w-4 h-4 fill-current" /> : <TrendingUp className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm text-slate-800 leading-tight">
                    <span className="font-bold">{act.user}</span> {act.action} <span className="font-medium text-amber-700">{act.target}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOTIVATION */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 text-white flex flex-col justify-center items-center text-center shadow-lg group hover:scale-[1.02] transition-transform">
           <Zap className="w-12 h-12 mb-2 text-yellow-300 fill-current animate-bounce" />
           <p className="font-bold text-lg">Le saviez-vous ?</p>
           <p className="text-emerald-50 text-sm mt-1">Jouer 15min par jour est plus efficace que 2h le dimanche !</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;