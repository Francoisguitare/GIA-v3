import React from 'react';
import { Module } from '../types';
import { Play, Check, ArrowRight, BookOpen } from 'lucide-react';

interface ModuleViewProps {
  module: Module;
  onComplete: () => void;
  isLastModule: boolean;
}

const ModuleView: React.FC<ModuleViewProps> = ({ module, onComplete, isLastModule }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-l-3xl shadow-2xl overflow-hidden border-l border-slate-200">
      
      {/* Header Area */}
      <div className="bg-slate-50 border-b border-slate-200 p-8 pb-6">
        <div className="flex items-center gap-3 text-amber-700 font-bold mb-2">
          <BookOpen className="w-6 h-6" />
          <span className="text-lg uppercase tracking-wide">Module {module.id} — {module.duration}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
          {module.title}
        </h1>
        <p className="text-2xl text-slate-600 mt-3 font-medium">
          {module.subtitle}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10">
        
        {/* Visual / Video Placeholder */}
        <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg relative group cursor-pointer">
          <img 
            src={`https://picsum.photos/1200/675?random=${module.id}`} 
            alt="Illustration du cours" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Play className="w-10 h-10 text-white fill-current ml-1" />
             </div>
          </div>
          <div className="absolute bottom-6 left-6 text-white font-medium text-lg bg-black/50 px-4 py-2 rounded-lg">
            Cliquez pour lancer la vidéo
          </div>
        </div>

        {/* Text Content */}
        <div className="prose prose-xl prose-slate max-w-none">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 border-l-8 border-amber-500 pl-4">
            {module.content.heading}
          </h2>
          <p className="text-xl leading-relaxed text-slate-700 mb-8">
            {module.content.description}
          </p>
          
          <div className="bg-blue-50 border-l-8 border-blue-500 p-8 rounded-r-xl">
            <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">💡</span>
              Conseils du professeur
            </h3>
            <ul className="space-y-4">
              {module.content.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-4 text-xl text-slate-800">
                  <div className="w-2 h-2 mt-3 rounded-full bg-blue-500 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Spacing for scroll */}
        <div className="h-20"></div>
      </div>

      {/* Sticky Footer Action */}
      <div className="p-6 md:p-8 bg-white border-t border-slate-200 flex justify-end sticky bottom-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {module.status === 'completed' ? (
           <button
           disabled
           className="w-full md:w-auto bg-emerald-100 text-emerald-800 px-10 py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 opacity-100 cursor-default"
         >
           <Check className="w-8 h-8" />
           Leçon terminée
         </button>
        ) : (
          <button
            onClick={onComplete}
            className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            <span>J'ai terminé, passer à la suite</span>
            {isLastModule ? <Check className="w-8 h-8" /> : <ArrowRight className="w-8 h-8" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModuleView;