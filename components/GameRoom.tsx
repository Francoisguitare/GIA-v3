import React from 'react';
import { Music, Mic2, Timer, Award } from 'lucide-react';

const GameRoom: React.FC = () => {
  const games = [
    { id: 1, title: "Ear Master", desc: "Reconnaître les accords à l'oreille", icon: Music, color: "bg-purple-500", locked: false },
    { id: 2, title: "Rythme Box", desc: "Taper dans le tempo", icon: Timer, color: "bg-rose-500", locked: false },
    { id: 3, title: "Accordeur Pro", desc: "Entraînement à l'accordage rapide", icon: Mic2, color: "bg-blue-500", locked: true },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 bg-slate-50">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Salle de Jeu 🕹️</h1>
        <p className="text-xl text-slate-500">Détendez-vous tout en progressant.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <div key={game.id} className={`group relative bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl ${game.locked ? 'opacity-75 grayscale' : 'cursor-pointer'}`}>
            <div className={`w-16 h-16 ${game.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white transform group-hover:rotate-6 transition-transform`}>
              <game.icon className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{game.title}</h3>
            <p className="text-slate-500 text-lg mb-6">{game.desc}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
               {game.locked ? (
                 <span className="flex items-center gap-2 text-slate-400 font-bold bg-slate-100 px-4 py-2 rounded-full text-sm">
                   🔒 Bientôt
                 </span>
               ) : (
                 <span className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 px-4 py-2 rounded-full text-sm group-hover:bg-amber-500 group-hover:text-white transition-colors">
                   <Award className="w-4 h-4" /> Jouer
                 </span>
               )}
            </div>
          </div>
        ))}
        
        {/* Placeholder for Leaderboard in Game Room */}
        <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white mt-8 flex flex-col md:flex-row items-center justify-between">
           <div>
             <h3 className="text-2xl font-bold mb-2">Classement de la semaine</h3>
             <p className="text-slate-400">Vous êtes 4ème avec 1250 points !</p>
           </div>
           <div className="flex -space-x-4 mt-4 md:mt-0">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold">
                   #{i}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;