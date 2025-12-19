
/**
 * GIA - APPLICATION VANILLA JS PREMIUM
 * Spécialement conçue pour l'accessibilité Senior (40-70 ans)
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
          description: "C'est l'accord le plus simple et le plus beau pour commencer. Il ne nécessite que deux doigts ! Prenez votre temps pour bien positionner votre main.",
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
          description: "Saurez-vous identifier le temps fort dans cette mesure ? Lisez bien les consignes ci-dessous pour répondre au quiz.",
          tips: ["Le premier temps est fort.", "Compte à haute voix.", "Battez du pied régulièrement."]
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
  }, 450);
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
    }, 400);
  } else {
    render();
  }
};

// --- RENDER HELPERS ---

function renderLoader() {
  return `
    <div class="flex flex-col h-full bg-slate-900 items-center justify-center fade-in">
        <div class="vibrate-string w-32 h-1.5 rounded-full mb-6"></div>
        <p class="text-slate-400 font-bold text-lg uppercase tracking-widest">Initialisation...</p>
    </div>
  `;
}

function renderNav() {
  const views = [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Accueil' },
    { id: 'classroom', icon: 'graduation-cap', label: 'Cursus' },
    { id: 'games', icon: 'gamepad-2', label: 'Jeux' }
  ];
  return `
    <nav class="w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 z-50 shadow-xl">
      <div class="mb-12 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl">
        <i data-lucide="music-4" class="w-8 h-8 text-orange-400"></i>
      </div>
      <div class="flex-1 w-full px-3 space-y-8">
        ${views.map(v => `
          <button onclick="setView('${v.id}')" class="w-full p-3 rounded-2xl flex flex-col items-center gap-2 transition-all group ${state.currentView === v.id ? 'text-orange-600 bg-orange-50 ring-1 ring-orange-100 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}">
            <i data-lucide="${v.icon}" class="w-8 h-8 transition-transform group-hover:scale-110"></i>
            <span class="text-[10px] uppercase font-black tracking-widest">${v.label}</span>
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

  // --- 1. SIDEBAR (POLIE POUR SENIORS) ---
  const sidebarHTML = state.modules.map(mod => {
    const isExpanded = state.expandedModules.includes(mod.id);
    return `
      <div class="border-b border-white/5">
         <button onclick="toggleModule(${mod.id})" class="w-full p-6 flex items-center justify-between bg-[#1f1f1f] hover:bg-[#252525] transition-colors border-l-4 border-transparent">
            <span class="font-black text-slate-300 text-xs uppercase tracking-[0.2em]">${mod.title}</span>
            <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-5 h-5 text-slate-500"></i>
         </button>
         ${isExpanded ? `
            <div class="bg-[#141414] fade-in">
                ${mod.lessons.map(l => {
                    const isActive = l.id === state.activeLessonId;
                    const isLocked = l.status === 'locked';
                    const isCompleted = l.status === 'completed';
                    
                    let typeIcon = 'video';
                    let iconColor = 'text-blue-400';
                    if (l.type === 'practice') { typeIcon = 'target'; iconColor = 'text-indigo-400'; }
                    if (l.type === 'text') { typeIcon = 'file-text'; iconColor = 'text-amber-400'; }

                    return `
                        <div onclick="${isLocked ? '' : `setActiveLesson(${l.id})`}" 
                             class="pl-8 pr-6 py-6 flex items-center gap-5 cursor-pointer border-l-[4px] transition-all 
                             ${isActive ? 'bg-orange-500/10 border-orange-500' : 'border-transparent hover:bg-white/5'} 
                             ${isLocked ? 'opacity-25 cursor-not-allowed' : ''}">
                            <i data-lucide="${isCompleted ? 'check-circle-2' : typeIcon}" class="w-6 h-6 ${isCompleted ? 'text-emerald-500' : (isActive ? 'text-orange-500' : iconColor)}"></i>
                            <div class="flex-1">
                                <p class="text-[16px] font-bold ${isActive ? 'text-white' : 'text-slate-200'} leading-snug">${l.title}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-[11px] font-black text-slate-500 uppercase tracking-tighter">${l.duration}</span>
                                    ${isLocked ? '<i data-lucide="lock" class="w-3 h-3 text-slate-600"></i>' : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
         ` : ''}
      </div>
    `;
  }).join('');

  // --- 2. SCÈNE CENTRALE (MODE CANVAS RÉEL) ---
  let centralSceneHTML = '';
  if (lesson.hasVideo) {
    centralSceneHTML = `
      <div class="relative w-full h-full bg-black flex items-center justify-center group overflow-hidden">
          <img src="https://picsum.photos/seed/guitar-${lesson.id}/1920/1080" class="w-full h-full object-cover opacity-30 blur-sm scale-110 transition-transform duration-700 group-hover:scale-100" />
          <div class="absolute inset-0 flex flex-col items-center justify-center">
              <button class="w-28 h-28 bg-orange-500 hover:bg-orange-400 text-white rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.4)] hover:scale-110 active:scale-95 transition-all">
                  <i data-lucide="play" class="w-12 h-12 fill-current ml-1"></i>
              </button>
              <p class="text-white/60 font-black uppercase tracking-[0.3em] mt-8 text-sm">Lancer la vidéo</p>
          </div>
      </div>
    `;
  } else {
    // MODE CANVAS : Carte Premium centrée
    centralSceneHTML = `
      <div class="w-full h-full bg-[#0f172a] flex items-center justify-center p-12 overflow-y-auto">
          <div class="bg-white rounded-3xl p-12 shadow-2xl max-w-[800px] w-full fade-in border border-white/20 flex flex-col items-center text-center">
              <div class="w-24 h-24 ${lesson.type === 'practice' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'} rounded-[2rem] flex items-center justify-center mb-10 shadow-inner">
                  <i data-lucide="${lesson.type === 'practice' ? 'target' : 'file-text'}" class="w-12 h-12"></i>
              </div>
              <h2 class="text-4xl font-black text-slate-900 mb-6 leading-tight">${lesson.content.heading}</h2>
              <div class="w-20 h-1.5 bg-orange-500 rounded-full mb-8"></div>
              <p class="text-2xl text-slate-600 leading-relaxed font-medium mb-12 px-4">
                ${lesson.content.description}
              </p>
              ${lesson.type === 'practice' ? `
                <button onclick="completeLesson()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-2xl text-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4">
                  <i data-lucide="video" class="w-8 h-8"></i> Envoyer mon travail
                </button>
              ` : `
                <div class="p-8 bg-slate-50 border-2 border-slate-100 rounded-2xl w-full text-left">
                  <h4 class="font-black text-slate-800 mb-3 uppercase tracking-wider text-sm flex items-center gap-2">
                    <i data-lucide="info" class="w-5 h-5 text-orange-500"></i> Instructions :
                  </h4>
                  <p class="text-slate-600 text-lg">Veuillez lire attentivement les notes de cours via le bouton ci-dessous pour valider cette étape théorique.</p>
                </div>
              `}
          </div>
      </div>
    `;
  }

  // --- 3. BARRE D'ACTION (STICKY & PROFONDEUR) ---
  const actionButtonsHTML = `
    <div class="flex items-center gap-6">
        <button onclick="toggleNotes()" class="group flex items-center gap-4 bg-white border-[3px] border-[#CBD5E1] hover:border-slate-400 text-slate-800 px-8 py-4 rounded-2xl font-black transition-all shadow-sm active:scale-95">
            <i data-lucide="book-open" class="w-6 h-6 text-blue-600 group-hover:rotate-6 transition-transform"></i>
            <span class="text-xl">Lire le cours</span>
        </button>
        
        ${lesson.status === 'completed' ? `
          <div class="bg-emerald-50 text-emerald-700 px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 border-2 border-emerald-200">
              <i data-lucide="check-circle" class="w-7 h-7"></i> Terminé
          </div>
        ` : `
          <button onclick="completeLesson()" class="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4">
              <span>Continuer</span>
              <i data-lucide="${isLast ? 'check' : 'chevron-right'}" class="w-7 h-7"></i>
          </button>
        `}
    </div>
  `;

  return `
    <div class="flex h-full relative overflow-hidden bg-[#121212]">
        <!-- SIDEBAR GAUCHE -->
        <aside class="w-[360px] h-full flex flex-col bg-[#121212] border-r border-white/10 shadow-2xl z-20 overflow-y-auto custom-scrollbar">
            <div class="p-8 border-b border-white/5 bg-[#1a1a1a]">
                <h2 class="text-[11px] font-black text-orange-500 tracking-[0.4em] uppercase flex items-center gap-3">
                    <i data-lucide="layers" class="w-4 h-4"></i> Structure du Cours
                </h2>
            </div>
            <div class="flex-1">${sidebarHTML}</div>
        </aside>

        <!-- ZONE PLAYER -->
        <div class="flex-1 flex flex-col relative h-full bg-[#0f172a]">
            <div id="player-zone" class="flex-1 overflow-hidden relative">${centralSceneHTML}</div>
            
            <!-- STICKY ACTION BAR -->
            <footer class="bg-white p-8 md:px-12 border-t border-slate-200 shadow-premium-footer z-30 flex items-center justify-between">
                <div class="max-w-[50%]">
                    <h2 class="text-3xl font-black text-slate-900 leading-none mb-2">${lesson.title}</h2>
                    <p class="text-slate-500 font-bold text-lg italic">${lesson.subtitle}</p>
                </div>
                ${actionButtonsHTML}
            </footer>

            <!-- SIDE DRAWER (NOTES DE COURS) -->
            <div id="notes-drawer" class="fixed top-0 right-0 h-full w-[40%] min-w-[450px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-[100] transform transition-transform duration-500 ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-slate-100">
                <div class="h-full flex flex-col">
                    <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md sticky top-0">
                        <h3 class="text-2xl font-black text-slate-900 flex items-center gap-4">
                            <i data-lucide="book-marked" class="text-orange-500 w-8 h-8"></i> Cahier de notes
                        </h3>
                        <button onclick="toggleNotes()" class="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-200">
                            <i data-lucide="x" class="w-8 h-8"></i>
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-12 pb-32">
                        <article class="prose prose-xl prose-slate max-w-none">
                            <h1 class="text-4xl font-black text-slate-900 mb-8 border-b-4 border-orange-500 pb-4 inline-block">${lesson.content.heading}</h1>
                            <p class="text-2xl text-slate-700 leading-relaxed mb-12 font-medium">${lesson.content.description}</p>
                            
                            <div class="bg-gradient-to-br from-orange-50 to-orange-100 border-l-8 border-orange-500 p-10 rounded-3xl mb-12 shadow-sm">
                                <h4 class="text-orange-900 font-black text-2xl mb-8 flex items-center gap-4">
                                    <i data-lucide="sparkles" class="w-8 h-8"></i> Astuces de Pro
                                </h4>
                                <ul class="space-y-6">
                                    ${lesson.content.tips.map(t => `
                                        <li class="flex items-start gap-5 text-slate-800">
                                            <i data-lucide="check" class="w-7 h-7 text-orange-600 mt-1 shrink-0 bg-white rounded-full p-1 shadow-sm"></i>
                                            <span class="text-xl font-bold">${t}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <div class="mt-16">
                                <button class="w-full py-8 border-4 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50/30 transition-all font-black flex items-center justify-center gap-5 text-2xl group">
                                    <i data-lucide="file-down" class="w-10 h-10 group-hover:bounce"></i> 
                                    <span>Télécharger la partition (PDF)</span>
                                </button>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
            
            <!-- OVERLAY DE CONTROLE -->
            ${state.isNotesOpen ? `<div onclick="toggleNotes()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90] fade-in transition-all duration-500"></div>` : ''}
        </div>
    </div>
  `;
}

// --- RENDERING ENGINE ---
function render() {
  const root = document.getElementById('root');
  if(!root) return;

  let mainContent = '';
  switch (state.currentView) {
    case 'classroom': mainContent = renderClassroom(); break;
    case 'dashboard': mainContent = `<div class="h-full flex items-center justify-center bg-slate-100"><button onclick="setView('classroom')" class="p-8 bg-orange-500 text-white rounded-3xl font-black text-2xl shadow-2xl hover:scale-105 transition-all">Accéder au cours maintenant</button></div>`; break;
    case 'games': mainContent = `<div class="h-full flex items-center justify-center bg-slate-100"><h1 class="text-4xl font-black text-slate-400">Salle de Jeux (Prochainement)</h1></div>`; break;
    default: mainContent = '<div class="p-20">Vue non trouvée</div>';
  }

  root.innerHTML = `
    <div class="flex h-screen bg-white overflow-hidden selection:bg-orange-500 selection:text-white">
        ${renderNav()}
        <main class="flex-1 h-full relative overflow-hidden">${mainContent}</main>
    </div>
  `;

  // Ré-initialise les icônes Lucide après chaque render
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Lancement au chargement
document.addEventListener("DOMContentLoaded", render);
