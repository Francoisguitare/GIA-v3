
/**
 * GIA - APPLICATION VANILLA JS PREMIUM
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
          description: "Une guitare bien accordée est essentielle. Nous allons utiliser un accordeur électronique.",
          tips: ["Commencez par la corde grave (Mi).", "Tournez doucement.", "Visez l'aiguille verte."]
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
        type: 'practice', // 🎯 Devoir (Canvas Mode)
        hasVideo: false,
        validationStatus: 'none',
        content: {
          heading: "L'accord de Mi Mineur (Em)",
          description: "C'est l'accord le plus simple et le plus beau pour commencer. Il ne nécessite que deux doigts ! Pour valider ce module, vous devrez m'envoyer une courte vidéo.",
          tips: ["Utilisez l'index et le majeur.", "Appuyez avec le bout des doigts.", "Grattez tout d'un coup."]
        }
      },
      {
        id: 4,
        moduleId: 200,
        title: "Rythmique de Base",
        subtitle: "Apprendre à battre la mesure",
        duration: "25 min",
        status: 'locked',
        type: 'standard',
        hasVideo: true,
        content: {
          heading: "Le mouvement de balancier",
          description: "La main droite donne le rythme. Nous allons apprendre le mouvement 'Bas - Bas - Haut - Bas'.",
          tips: ["Poignet souple.", "Respirez.", "Comptez 1, 2, 3, 4."]
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
  isNotesOpen: false,
  isFullscreen: false,
  chat: [
    { id: 1, user: "Martine", avatar: "https://i.pravatar.cc/150?u=1", text: "Le barré du Fa ?", time: "10:30", isMe: false }
  ]
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
  
  // Petit loader
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

  if (currentLesson.type === 'practice' && (!currentLesson.validationStatus || currentLesson.validationStatus === 'none')) {
    currentLesson.status = 'pending_review';
    currentLesson.validationStatus = 'submitted';
  } else {
    currentLesson.status = 'completed';
    if (currentIdx + 1 < all.length) {
      const nextLesson = all[currentIdx + 1];
      if (nextLesson.status === 'locked') {
        nextLesson.status = 'active';
        if (!state.expandedModules.includes(nextLesson.moduleId)) {
          state.expandedModules.push(nextLesson.moduleId);
        }
      }
      setTimeout(() => {
        state.activeLessonId = nextLesson.id;
        render();
      }, 300);
    }
  }
  render();
};

// --- RENDER HELPERS ---

function renderLoader() {
  return `<div class="flex flex-col h-full bg-slate-900 items-center justify-center"><div class="vibrate-string w-24 h-1 rounded-full mb-4"></div><p class="text-slate-400 font-bold">Préparation...</p></div>`;
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

  // 1. Sidebar (Menu Gauche)
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
                    
                    // Icone de type de contenu
                    let typeIcon = 'video';
                    if (l.type === 'practice') typeIcon = 'target';
                    if (l.type === 'text') typeIcon = 'file-text';

                    return `
                        <div onclick="${isLocked ? '' : `setActiveLesson(${l.id})`}" 
                             class="pl-6 pr-4 py-5 flex items-center gap-4 cursor-pointer border-l-[4px] transition-all ${isActive ? 'bg-amber-500/10 border-amber-500' : 'border-transparent hover:bg-white/5'} ${isLocked ? 'opacity-30 cursor-not-allowed' : ''}">
                            <i data-lucide="${typeIcon}" class="w-5 h-5 ${isActive ? 'text-amber-500' : 'text-slate-500'}"></i>
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

  // 2. Scène Centrale (Vidéo ou Canvas)
  let centralSceneHTML = '';
  if (lesson.hasVideo) {
    centralSceneHTML = `
      <div class="relative w-full h-full bg-black flex items-center justify-center group">
          <img src="https://picsum.photos/seed/${lesson.id}/1200/675" class="w-full h-full object-contain opacity-40" />
          <div class="absolute inset-0 flex items-center justify-center">
              <button class="w-24 h-24 bg-amber-500/90 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)] hover:scale-110 transition-transform">
                  <i data-lucide="play" class="w-10 h-10 text-white fill-current ml-1"></i>
              </button>
          </div>
      </div>
    `;
  } else {
    centralSceneHTML = `
      <div class="w-full h-full bg-slate-900 flex items-center justify-center p-8">
          <div class="bg-white rounded-3xl p-10 shadow-2xl max-w-2xl w-full fade-in flex flex-col items-center text-center">
              <div class="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <i data-lucide="target" class="w-10 h-10"></i>
              </div>
              <h2 class="text-3xl font-black text-slate-900 mb-4">${lesson.content.heading}</h2>
              <p class="text-xl text-slate-600 leading-relaxed mb-8">${lesson.content.description}</p>
              <button onclick="completeLesson()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-xl font-bold shadow-xl transition-all hover:scale-105 flex items-center gap-3">
                  <i data-lucide="video" class="w-6 h-6"></i>
                  Lancer l'exercice pratique
              </button>
          </div>
      </div>
    `;
  }

  // 3. Barre d'Action (Sticky Footer)
  const isPending = lesson.status === 'pending_review';
  const isCompleted = lesson.status === 'completed';

  const actionButtonsHTML = `
    <div class="flex items-center gap-4">
        <button onclick="toggleNotes()" class="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all">
            <i data-lucide="book-open" class="w-5 h-5 text-blue-600"></i>
            <span>Lire le cours</span>
        </button>
        ${isCompleted ? `
            <div class="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-emerald-200">
                <i data-lucide="check" class="w-5 h-5"></i> Terminé
            </div>
        ` : isPending ? `
            <div class="bg-amber-50 text-amber-700 px-6 py-3 rounded-xl font-bold border border-amber-200">En attente de validation...</div>
        ` : `
            <button onclick="completeLesson()" class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2">
                <span>J'ai terminé, suite</span>
                <i data-lucide="${isLast ? 'check' : 'chevron-right'}" class="w-5 h-5"></i>
            </button>
        `}
    </div>
  `;

  return `
    <div class="flex h-full relative overflow-hidden bg-[#1a1a1a]">
        <!-- Sidebar Menu -->
        <aside class="w-[340px] h-full flex flex-col bg-[#1a1a1a] border-r border-white/5 shadow-2xl z-20 overflow-y-auto custom-scrollbar">
            <div class="p-6 border-b border-white/10 bg-[#262626]">
                <h2 class="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                    <i data-lucide="folder-open" class="w-4 h-4 text-amber-500"></i> Mon Programme
                </h2>
            </div>
            <div class="flex-1">${sidebarHTML}</div>
        </aside>

        <!-- Player & Actions -->
        <div class="flex-1 flex flex-col relative h-full">
            <div id="player-zone" class="flex-1 overflow-hidden relative">${centralSceneHTML}</div>
            
            <!-- Sticky Action Bar -->
            <footer class="bg-white p-6 md:px-10 border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-30 flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 leading-tight">${lesson.title}</h1>
                    <p class="text-slate-500 font-medium">${lesson.subtitle}</p>
                </div>
                ${actionButtonsHTML}
            </footer>

            <!-- Side Drawer (Notes) -->
            <div id="notes-drawer" class="fixed top-0 right-0 h-full w-[40%] min-w-[400px] bg-white shadow-2xl z-[100] transform transition-transform duration-300 ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'}">
                <div class="h-full flex flex-col">
                    <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h3 class="text-xl font-black text-slate-800 flex items-center gap-3">
                            <i data-lucide="file-text" class="text-amber-500"></i> Contenu de la leçon
                        </h3>
                        <button onclick="toggleNotes()" class="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <i data-lucide="x" class="w-6 h-6 text-slate-500"></i>
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-10 prose prose-slate max-w-none">
                        <h2 class="text-3xl font-black text-slate-900 mb-6">${lesson.content.heading}</h2>
                        <p class="text-lg text-slate-700 leading-relaxed mb-8">${lesson.content.description}</p>
                        <div class="bg-amber-50 border-l-4 border-amber-500 p-8 rounded-xl">
                            <h4 class="text-amber-900 font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="lightbulb" class="w-5 h-5"></i> Conseils du coach
                            </h4>
                            <ul class="space-y-4">
                                ${lesson.content.tips.map(t => `
                                    <li class="flex items-start gap-3 text-slate-700">
                                        <i data-lucide="check-circle" class="w-5 h-5 text-amber-600 mt-1 shrink-0"></i>
                                        <span class="text-lg">${t}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="mt-10 pt-10 border-t border-slate-100">
                            <button class="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-slate-500 hover:text-slate-700 transition-all font-bold flex items-center justify-center gap-3">
                                <i data-lucide="download" class="w-5 h-5"></i> Télécharger la partition PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            ${state.isNotesOpen ? `<div onclick="toggleNotes()" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] fade-in"></div>` : ''}
        </div>
    </div>
  `;
}

// --- DASHBOARD & GAMES (Placeholders) ---
function renderDashboard() {
  return `<div class="h-full flex items-center justify-center bg-slate-50"><div class="text-center"><h1 class="text-4xl font-black text-slate-800 mb-4">Tableau de Bord</h1><button onclick="setView('classroom')" class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Reprendre mon cours</button></div></div>`;
}

function renderGames() {
  return `<div class="h-full flex items-center justify-center bg-slate-50"><h1 class="text-4xl font-black text-slate-800">Salle de Jeux 🕹️</h1></div>`;
}

// --- MOTEUR DE RENDU ---
function render() {
  const root = document.getElementById('root');
  if(!root) return;

  let mainContent = '';
  switch (state.currentView) {
    case 'dashboard': mainContent = renderDashboard(); break;
    case 'classroom': mainContent = renderClassroom(); break;
    case 'games': mainContent = renderGames(); break;
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
if (document.readyState === "complete" || document.readyState === "interactive") render();
