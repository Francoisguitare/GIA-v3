
/**
 * GIA - APPLICATION VANILLA JS PREMIUM
 * Optimisé pour Seniors (40-70 ans)
 */

// --- DONNÉES ---
const INITIAL_MODULES = [
  {
    id: 100,
    title: "CHAPITRE 1 : Les Fondamentaux",
    lessons: [
      {
        id: 1,
        moduleId: 100,
        title: "Bienvenue & Posture",
        subtitle: "Les bases pour ne pas avoir mal au dos",
        duration: "10 min",
        status: 'active',
        type: 'standard', // 🎥 Vidéo
        hasVideo: true,
        content: {
          heading: "Tenir sa guitare correctement",
          description: "Dans cette première leçon, nous allons apprendre à tenir l'instrument sans créer de tensions. C'est le secret pour jouer longtemps avec plaisir.",
          tips: ["Gardez le dos droit.", "Tête du manche surélevée.", "Respirez par le ventre."]
        }
      },
      {
        id: 2,
        moduleId: 100,
        title: "Accorder sa Guitare",
        subtitle: "L'étape indispensable avant de jouer",
        duration: "15 min",
        status: 'locked',
        type: 'standard', // 🎥 Vidéo
        hasVideo: true,
        content: {
          heading: "L'accordage standard (E A D G B E)",
          description: "Une guitare bien accordée est essentielle. Nous allons utiliser un accordeur électronique pour régler chaque corde une par une.",
          tips: ["Commencez par la corde grave.", "Tournez doucement.", "Visez l'aiguille verte."]
        }
      }
    ]
  },
  {
    id: 200,
    title: "CHAPITRE 2 : Premiers Pas",
    lessons: [
      {
        id: 3,
        moduleId: 200,
        title: "Premier Accord (Mi Mineur)",
        subtitle: "Votre tout premier son de guitare",
        duration: "20 min",
        status: 'locked',
        type: 'practice', // 🎯 Devoir
        hasVideo: false,
        validationStatus: 'none',
        content: {
          heading: "L'accord de Mi Mineur (Em)",
          description: "C'est l'accord le plus simple et le plus beau pour commencer. Il ne nécessite que deux doigts !",
          tips: ["Utilisez l'index et le majeur.", "Appuyez avec le bout des doigts.", "Grattez tout d'un coup."]
        }
      },
      {
        id: 4,
        moduleId: 200,
        title: "Quiz Rythmique",
        subtitle: "Vérifions vos connaissances",
        duration: "5 min",
        status: 'locked',
        type: 'text', // 📝 Texte/Quiz
        hasVideo: false,
        content: {
          heading: "Le rythme en 4 temps",
          description: "Saurez-vous identifier le temps fort dans cette mesure ? Lisez bien les consignes ci-dessous.",
          tips: ["Le premier temps est fort.", "Comptez à haute voix.", "Battez du pied."]
        }
      }
    ]
  }
];

// --- STATE ---
const state = {
  modules: JSON.parse(JSON.stringify(INITIAL_MODULES)),
  activeLessonId: 1,
  currentView: 'classroom',
  expandedModules: [100],
  isNotesOpen: false
};

// --- ACTIONS GLOBALES ---
window.setView = (view) => {
  state.currentView = view;
  state.isNotesOpen = false;
  render();
};

window.toggleModule = (modId) => {
  if (state.expandedModules.includes(modId)) {
    state.expandedModules = state.expandedModules.filter(id => id !== modId);
  } else {
    state.expandedModules.push(modId);
  }
  render();
};

window.setActiveLesson = (lessonId) => {
  const all = state.modules.flatMap(m => m.lessons);
  const lesson = all.find(l => l.id === lessonId);
  if (!lesson || lesson.status === 'locked') return;
  
  const playerZone = document.getElementById('player-zone');
  if(playerZone) playerZone.innerHTML = renderLoader();
  
  setTimeout(() => {
    state.activeLessonId = lessonId;
    render();
  }, 400);
};

window.toggleNotes = () => {
  state.isNotesOpen = !state.isNotesOpen;
  render();
};

window.completeLesson = () => {
  const all = state.modules.flatMap(m => m.lessons);
  const currentIdx = all.findIndex(l => l.id === state.activeLessonId);
  const currentLesson = all[currentIdx];

  currentLesson.status = 'completed';
  if (currentIdx + 1 < all.length) {
    const nextLesson = all[currentIdx + 1];
    nextLesson.status = 'active';
    if (!state.expandedModules.includes(nextLesson.moduleId)) {
      state.expandedModules.push(nextLesson.moduleId);
    }
    setTimeout(() => {
      state.activeLessonId = nextLesson.id;
      render();
    }, 300);
  }
  render();
};

// --- RENDER HELPERS ---

function renderLoader() {
  return `<div class="flex flex-col h-full bg-slate-900 items-center justify-center"><div class="vibrate-string w-24 h-1 rounded-full mb-4"></div><p class="text-slate-400 font-bold">Chargement...</p></div>`;
}

function renderNav() {
  const views = [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Accueil' },
    { id: 'classroom', icon: 'graduation-cap', label: 'Cursus' },
    { id: 'games', icon: 'gamepad-2', label: 'Jeux' }
  ];
  return `
    <nav class="w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div class="mb-10 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><i data-lucide="music-4" class="w-6 h-6 text-amber-400"></i></div>
      <div class="flex-1 w-full px-3 space-y-6">
        ${views.map(v => `
          <button onclick="setView('${v.id}')" class="w-full p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${state.currentView === v.id ? 'text-amber-600 bg-amber-50 ring-1 ring-amber-100' : 'text-slate-400 hover:bg-slate-50'}">
            <i data-lucide="${v.icon}" class="w-7 h-7"></i>
            <span class="text-[10px] uppercase font-bold tracking-wider">${v.label}</span>
          </button>
        `).join('')}
      </div>
    </nav>
  `;
}

function renderClassroom() {
  const allLessons = state.modules.flatMap(m => m.lessons);
  const lesson = allLessons.find(l => l.id === state.activeLessonId) || allLessons[0];
  const isLast = lesson.id === allLessons[allLessons.length - 1].id;

  // --- 1. SIDEBAR (MENU GAUCHE) ---
  const sidebarHTML = state.modules.map(mod => {
    const isExpanded = state.expandedModules.includes(mod.id);
    return `
      <div class="border-b border-white/5">
         <button onclick="toggleModule(${mod.id})" class="w-full p-5 flex items-center justify-between bg-[#202020] hover:bg-[#2a2a2a] transition-colors">
            <span class="font-bold text-slate-400 text-xs uppercase tracking-widest">${mod.title}</span>
            <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4 text-slate-500"></i>
         </button>
         ${isExpanded ? `
            <div class="bg-[#151515]">
                ${mod.lessons.map(l => {
                    const isActive = l.id === state.activeLessonId;
                    const isLocked = l.status === 'locked';
                    const isCompleted = l.status === 'completed';
                    
                    // Iconographie par type de contenu
                    let typeIcon = 'video';
                    if (l.type === 'practice') typeIcon = 'target';
                    if (l.type === 'text') typeIcon = 'file-text';

                    return `
                        <div onclick="${isLocked ? '' : `setActiveLesson(${l.id})`}" 
                             class="pl-6 pr-4 py-6 flex items-center gap-4 cursor-pointer border-l-[4px] transition-all 
                             ${isActive ? 'bg-white/5 border-orange-500' : 'border-transparent hover:bg-white/5'} 
                             ${isLocked ? 'opacity-30 cursor-not-allowed' : ''}">
                            <i data-lucide="${typeIcon}" class="w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-500'}"></i>
                            <div class="flex-1">
                                <p class="text-[16px] font-bold ${isActive ? 'text-white' : 'text-slate-300'} leading-tight">${l.title}</p>
                                <span class="text-xs text-slate-500">${l.duration}</span>
                            </div>
                            ${isCompleted ? '<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
         ` : ''}
      </div>
    `;
  }).join('');

  // --- 2. SCÈNE CENTRALE (VIDÉO OU MODE CANVAS) ---
  let centralSceneHTML = '';
  if (lesson.hasVideo) {
    centralSceneHTML = `
      <div class="relative w-full h-full bg-black flex items-center justify-center group">
          <img src="https://picsum.photos/seed/${lesson.id}/1200/675" class="w-full h-full object-contain opacity-40" />
          <div class="absolute inset-0 flex items-center justify-center">
              <button class="w-24 h-24 bg-orange-500/90 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)] hover:scale-110 transition-transform">
                  <i data-lucide="play" class="w-10 h-10 text-white fill-current ml-1"></i>
              </button>
          </div>
      </div>
    `;
  } else {
    // MODE CANVAS : Carte de contenu centrée
    centralSceneHTML = `
      <div class="w-full h-full bg-slate-900 flex items-center justify-center p-8 overflow-y-auto">
          <div class="bg-white rounded-2xl p-10 shadow-2xl max-w-[800px] w-full fade-in flex flex-col items-center text-center">
              <div class="w-20 h-20 ${lesson.type === 'practice' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'} rounded-2xl flex items-center justify-center mb-6">
                  <i data-lucide="${lesson.type === 'practice' ? 'target' : 'file-text'}" class="w-10 h-10"></i>
              </div>
              <h2 class="text-3xl font-black text-slate-900 mb-4">${lesson.content.heading}</h2>
              <p class="text-xl text-slate-600 leading-relaxed mb-8">
                ${lesson.content.description}
              </p>
              ${lesson.type === 'practice' ? `
                <button onclick="completeLesson()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-xl font-bold shadow-xl transition-all hover:scale-105 flex items-center gap-3">
                  <i data-lucide="video" class="w-6 h-6"></i> Envoyer mon travail
                </button>
              ` : `
                <div class="p-6 bg-slate-50 border border-slate-200 rounded-xl w-full text-left">
                  <h4 class="font-bold text-slate-800 mb-2">Consignes :</h4>
                  <p class="text-slate-600">Complétez la lecture pour valider ce module. N'oubliez pas de consulter les notes de cours.</p>
                </div>
              `}
          </div>
      </div>
    `;
  }

  // --- 3. BARRE D'ACTION (STICKY FOOTER) ---
  const actionButtonsHTML = `
    <div class="flex items-center gap-5">
        <!-- Bouton OUTLINE "Lire le cours" -->
        <button onclick="toggleNotes()" class="flex items-center gap-3 bg-white border-2 border-[#CBD5E1] hover:border-slate-400 text-slate-700 px-7 py-3.5 rounded-xl font-bold transition-all shadow-sm">
            <i data-lucide="book-open" class="w-5 h-5 text-blue-600"></i>
            <span class="text-lg">Lire le cours</span>
        </button>
        
        <!-- Bouton SOLID "J'ai terminé" -->
        ${lesson.status === 'completed' ? `
          <div class="bg-emerald-50 text-emerald-700 px-7 py-3.5 rounded-xl font-bold flex items-center gap-2 border border-emerald-200 shadow-sm">
              <i data-lucide="check" class="w-6 h-6"></i> Terminé
          </div>
        ` : `
          <button onclick="completeLesson()" class="bg-[#F97316] hover:bg-[#EA580C] text-white px-10 py-3.5 rounded-xl font-black text-xl shadow-lg transition-all hover:scale-105 flex items-center gap-3">
              <span>J'ai terminé, suite</span>
              <i data-lucide="${isLast ? 'check' : 'chevron-right'}" class="w-6 h-6"></i>
          </button>
        `}
    </div>
  `;

  return `
    <div class="flex h-full relative overflow-hidden bg-[#1a1a1a]">
        <!-- SIDEBAR (MENU GAUCHE) -->
        <aside class="w-[340px] h-full flex flex-col bg-[#1a1a1a] border-r border-white/5 shadow-2xl z-20 overflow-y-auto custom-scrollbar">
            <div class="p-6 border-b border-white/10 bg-[#262626]">
                <h2 class="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                    <i data-lucide="folder-open" class="w-4 h-4 text-orange-500"></i> Mon Programme
                </h2>
            </div>
            <div class="flex-1">${sidebarHTML}</div>
        </aside>

        <!-- PLAYER & ACTIONS -->
        <div class="flex-1 flex flex-col relative h-full">
            <div id="player-zone" class="flex-1 overflow-hidden relative">${centralSceneHTML}</div>
            
            <!-- STICKY ACTION BAR (FOOTER) -->
            <footer class="bg-white p-6 md:px-10 border-t border-slate-200 shadow-sticky-footer z-30 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-black text-slate-900 leading-tight">${lesson.title}</h2>
                    <p class="text-slate-500 font-medium text-lg">${lesson.subtitle}</p>
                </div>
                ${actionButtonsHTML}
            </footer>

            <!-- SIDE DRAWER (NOTES) -->
            <div id="notes-drawer" class="fixed top-0 right-0 h-full w-[40%] min-w-[400px] bg-white shadow-2xl z-[100] transform transition-transform duration-400 ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'}">
                <div class="h-full flex flex-col">
                    <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h3 class="text-xl font-black text-slate-800 flex items-center gap-3">
                            <i data-lucide="book" class="text-orange-500"></i> Contenu de la leçon
                        </h3>
                        <button onclick="toggleNotes()" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                            <i data-lucide="x" class="w-7 h-7"></i>
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-12 prose prose-slate max-w-none">
                        <h1 class="text-3xl font-black text-slate-900 mb-6">${lesson.content.heading}</h1>
                        <p class="text-xl text-slate-700 leading-relaxed mb-8">${lesson.content.description}</p>
                        
                        <div class="bg-amber-50 border-l-8 border-orange-500 p-8 rounded-2xl mb-10 shadow-sm">
                            <h4 class="text-orange-900 font-black text-xl mb-6 flex items-center gap-3">
                                <i data-lucide="lightbulb" class="w-6 h-6"></i> Conseils du coach
                            </h4>
                            <ul class="space-y-5">
                                ${lesson.content.tips.map(t => `
                                    <li class="flex items-start gap-4 text-slate-700">
                                        <i data-lucide="check-circle" class="w-6 h-6 text-orange-600 mt-1 shrink-0"></i>
                                        <span class="text-xl">${t}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="mt-12 pt-10 border-t border-slate-100">
                            <button class="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-slate-500 hover:text-slate-700 transition-all font-bold flex items-center justify-center gap-4 text-lg">
                                <i data-lucide="download" class="w-6 h-6"></i> 
                                Télécharger la partition PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Overlay pour fermer le drawer -->
            ${state.isNotesOpen ? `<div onclick="toggleNotes()" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] fade-in"></div>` : ''}
        </div>
    </div>
  `;
}

// --- RENDER ENGINE ---
function render() {
  const root = document.getElementById('root');
  if(!root) return;

  let mainContent = '';
  switch (state.currentView) {
    case 'classroom': mainContent = renderClassroom(); break;
    case 'dashboard': mainContent = `<div class="p-10 text-center"><h1>Accueil</h1><button onclick="setView('classroom')" class="p-4 bg-orange-500 text-white rounded mt-4">Retour au cours</button></div>`; break;
    case 'games': mainContent = `<div class="p-10 text-center"><h1>Jeux</h1></div>`; break;
    default: mainContent = '<div>404</div>';
  }

  root.innerHTML = `
    <div class="flex h-screen bg-slate-100 overflow-hidden">
        ${renderNav()}
        <main class="flex-1 h-full relative overflow-hidden">${mainContent}</main>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", render);
