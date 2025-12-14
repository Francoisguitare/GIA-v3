
/**
 * GIA - APPLICATION VANILLA JS
 * Zéro dépendances React.
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
        type: 'standard',
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
        type: 'standard',
        content: {
          heading: "L'accordage standard (E A D G B E)",
          description: "Une guitare bien accordée est essentielle. Nous allons utiliser un accordeur électronique pour régler chaque corde une par une.",
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
        type: 'practice',
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
        title: "Rythmique de Base",
        subtitle: "Apprendre à battre la mesure",
        duration: "25 min",
        status: 'locked',
        type: 'standard',
        content: {
          heading: "Le mouvement de balancier",
          description: "La main droite donne le rythme. Nous allons apprendre le mouvement 'Bas - Bas - Haut - Bas'.",
          tips: ["Poignet souple.", "Respirez.", "Comptez 1, 2, 3, 4."]
        }
      }
    ]
  },
  {
    id: 300,
    title: "CHAPITRE 3 : Mélodies",
    lessons: [
      {
        id: 5,
        moduleId: 300,
        title: "Mélodie Simple",
        subtitle: "Jouer 'Jeux Interdits' (Début)",
        duration: "30 min",
        status: 'locked',
        type: 'standard',
        content: {
          heading: "Introduction à la mélodie",
          description: "Nous allons jouer les premières notes de cette mélodie célèbre. Prenez votre temps pour bien détacher chaque note.",
          tips: ["Laissez résonner.", "Soyez patient.", "Félicitez-vous."]
        }
      }
    ]
  }
];

// --- STATE ---
const state = {
  modules: JSON.parse(JSON.stringify(INITIAL_MODULES)),
  activeLessonId: 1,
  currentView: 'dashboard',
  expandedModules: [100],
  isNotesOpen: false,
  isFullscreen: false,
  chat: [
    { id: 1, user: "Martine", avatar: "https://i.pravatar.cc/150?u=1", text: "Le barré du Fa ?", time: "10:30", isMe: false },
    { id: 2, user: "Jean-Pierre", avatar: "https://i.pravatar.cc/150?u=2", text: "Tourne le poignet.", time: "10:32", isMe: false },
    { id: 3, user: "Moi", avatar: "", text: "Merci JP !", time: "10:35", isMe: true },
  ],
  msgInput: ""
};

// --- HELPERS ---
function getAllLessons() {
  return state.modules.flatMap(m => m.lessons);
}

function getActiveLesson() {
  const lesson = getAllLessons().find(l => l.id === state.activeLessonId);
  return lesson || state.modules[0].lessons[0];
}

// --- ACTIONS GLOBALES ---
window.setView = (view) => {
  state.currentView = view;
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
  const lesson = getAllLessons().find(l => l.id === lessonId);
  if (!lesson || lesson.status === 'locked') return;
  
  const videoContainer = document.getElementById('video-container');
  if(videoContainer) videoContainer.innerHTML = renderLoader();
  
  setTimeout(() => {
    state.activeLessonId = lessonId;
    render();
  }, 400);
};

window.toggleNotes = () => {
  state.isNotesOpen = !state.isNotesOpen;
  render();
};

window.toggleFullscreen = () => {
  state.isFullscreen = !state.isFullscreen;
  render();
};

window.completeLesson = () => {
  // Feedback Audio
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch(e) {}

  const all = getAllLessons();
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
      }, 500);
    }
  }
  render();
};

window.sendChat = () => {
  const input = document.getElementById('chatInput');
  if(!input) return;
  const val = input.value.trim();
  if(!val) return;
  
  state.chat.push({
    id: Date.now(),
    user: "Moi",
    avatar: "",
    text: val,
    time: "À l'instant",
    isMe: true
  });
  render();
  setTimeout(() => {
    const newInput = document.getElementById('chatInput');
    if(newInput) newInput.focus();
  }, 50);
};

// --- TEMPLATES ---

function renderLoader() {
  return `
    <div class="flex flex-col h-full bg-white items-center justify-center relative z-20">
        <div class="text-center space-y-8 w-full max-w-md">
            <h2 class="text-2xl font-bold text-slate-700 animate-pulse">Chargement...</h2>
            <div class="relative h-40 w-full flex justify-center gap-8">
                <div class="w-1 h-full bg-amber-800/20 rounded-full"></div>
                <div class="w-1.5 h-full bg-amber-600/40 rounded-full vibrate-string"></div> 
                <div class="w-1 h-full bg-amber-800/20 rounded-full"></div>
            </div>
        </div>
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
    <div class="w-20 md:w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0">
      <div class="mb-10 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
        <i data-lucide="music-4" class="w-6 h-6 text-amber-400"></i>
      </div>

      <nav class="flex-1 w-full px-3 space-y-4">
        ${views.map(v => {
          const isActive = state.currentView === v.id;
          return `
            <button onclick="setView('${v.id}')"
              class="w-full p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group relative ${isActive ? 'text-amber-600 bg-amber-50 ring-1 ring-amber-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}"
            >
              <i data-lucide="${v.icon}" class="w-7 h-7 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}"></i>
              <span class="text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-amber-700' : ''}">${v.label}</span>
              ${isActive ? '<div class="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-full hidden lg:block"></div>' : ''}
            </button>
          `;
        }).join('')}
      </nav>

      <div class="space-y-6 w-full px-3 mt-auto flex flex-col items-center">
        <button class="p-3 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-500">
          <i data-lucide="settings" class="w-6 h-6"></i>
        </button>
        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 border-2 border-white shadow-md ring-2 ring-blue-50 cursor-pointer hover:scale-105 transition-transform"></div>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const allLessons = getAllLessons();
  const currentLesson = getActiveLesson();
  const completedCount = allLessons.filter(l => l.status === 'completed').length;
  const progress = Math.round((completedCount / allLessons.length) * 100);
  const isStarted = completedCount > 0 || currentLesson.id > 1;
  const nextLessons = allLessons.filter(l => l.id > state.activeLessonId).slice(0, 2);

  const strokeDash = 290;
  const offset = strokeDash - (strokeDash * progress) / 100;

  return `
    <div class="h-full flex flex-col p-6 md:p-8 bg-slate-50/50 overflow-y-auto">
      <header class="flex-none mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">
            Bonjour, Michel <span class="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p class="text-slate-600 font-medium mt-1 text-lg">Prêt à faire vibrer les cordes ?</p>
        </div>
      </header>

      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div class="lg:col-span-8 space-y-8">
            <div onclick="setView('classroom')" class="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]">
                <div class="absolute top-0 right-0 w-1/3 h-full bg-amber-50 -skew-x-12 translate-x-12"></div>
                
                <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div class="relative shrink-0">
                        <svg class="w-28 h-28 transform -rotate-90">
                            <circle cx="50%" cy="50%" r="42%" stroke="#cbd5e1" stroke-width="8" fill="none" />
                            <circle cx="50%" cy="50%" r="42%" stroke="#f59e0b" stroke-width="8" fill="none" stroke-dasharray="${strokeDash}" stroke-dashoffset="${offset}" stroke-linecap="round" />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center flex-col">
                            <span class="text-2xl font-black text-slate-800">${progress}%</span>
                            <span class="text-[10px] uppercase font-bold text-slate-500">Accompli</span>
                        </div>
                    </div>

                    <div class="flex-1 text-center md:text-left space-y-2">
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-200">
                            <span class="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
                            ${isStarted ? "Leçon en cours" : "À démarrer"}
                        </div>
                        <h2 class="text-3xl font-black text-slate-900 leading-tight">${currentLesson.title}</h2>
                        <p class="text-slate-600 font-medium text-lg">${currentLesson.subtitle}</p>
                    </div>

                    <button class="shrink-0 bg-slate-900 hover:bg-black text-white rounded-2xl py-4 px-8 flex items-center gap-3 shadow-lg transition-all group-hover:translate-x-1">
                        <span class="font-bold text-lg">${isStarted ? "Reprendre" : "Démarrer"}</span>
                        <i data-lucide="play" class="w-6 h-6 fill-current"></i>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                   <div class="flex items-center gap-2 text-rose-600 mb-1">
                       <i data-lucide="hand" class="w-5 h-5"></i>
                       <h3 class="font-bold text-sm uppercase tracking-wide">Callosité</h3>
                   </div>
                   <div class="flex-1">
                        <div class="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mt-2">
                            <div class="h-full bg-gradient-to-r from-rose-400 to-rose-600 w-[45%] rounded-full"></div>
                        </div>
                        <p class="text-xs text-slate-500 mt-2 font-medium">Niveau 2 : Ça commence à piquer !</p>
                   </div>
               </div>
               
               <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                    <div class="flex items-center gap-2 text-amber-600 mb-1 relative z-10">
                        <i data-lucide="flame" class="w-5 h-5"></i>
                        <h3 class="font-bold text-sm uppercase tracking-wide">Série</h3>
                    </div>
                    <div class="relative z-10">
                        <p class="text-3xl font-black text-slate-800">4 Jours</p>
                    </div>
                </div>

                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-blue-600 mb-1">
                        <i data-lucide="timer" class="w-5 h-5"></i>
                        <h3 class="font-bold text-sm uppercase tracking-wide">Temps</h3>
                    </div>
                    <div>
                        <p class="text-3xl font-black text-slate-800">2h 15</p>
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                 <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <i data-lucide="target" class="w-5 h-5 text-indigo-500"></i>
                    Leçons suivantes
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${nextLessons.map(l => `
                        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                <i data-lucide="lock" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-500 uppercase">Leçon ${l.id}</p>
                                <p class="font-bold text-slate-700 leading-tight text-lg">${l.title}</p>
                            </div>
                        </div>
                    `).join('')}
                    ${nextLessons.length === 0 ? '<div class="col-span-2 p-6 bg-emerald-50 rounded-2xl text-emerald-800 font-medium text-center">Tout est terminé ! 🎉</div>' : ''}
                </div>
            </div>
        </div>

        <div class="lg:col-span-4 space-y-6">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                         <i data-lucide="message-circle" class="w-4 h-4 text-blue-500"></i> Entraide
                    </h3>
                </div>
                <div class="p-4 space-y-4 bg-white flex-1 overflow-y-auto">
                    ${state.chat.map(msg => `
                        <div class="flex gap-3 text-sm">
                            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                                ${msg.isMe ? '<span class="text-xs font-bold text-slate-500">Moi</span>' : `<img src="${msg.avatar}" class="w-full h-full object-cover" />`}
                            </div>
                            <div class="min-w-0">
                                <div class="flex items-baseline gap-2">
                                    <span class="font-bold text-slate-800 text-xs">${msg.user}</span>
                                    <span class="text-[10px] text-slate-400">${msg.time}</span>
                                </div>
                                <p class="text-slate-700 text-sm mt-1 bg-slate-50 p-2 rounded-r-xl rounded-bl-xl inline-block border border-slate-100">
                                    ${msg.text}
                                </p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="p-4 border-t border-slate-100 relative">
                    <input id="chatInput" 
                        class="w-full bg-white border border-slate-300 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                        placeholder="Poser une question..."
                        onkeydown="if(event.key === 'Enter') sendChat()"
                    />
                    <button onclick="sendChat()" class="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i data-lucide="send" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  `;
}

function renderClassroom() {
  const lesson = getActiveLesson();
  const allLessons = getAllLessons();
  const isLastLesson = state.activeLessonId === allLessons[allLessons.length - 1].id;
  
  const sidebarHTML = state.modules.map(mod => {
    const isExpanded = state.expandedModules.includes(mod.id);
    return `
      <div class="border-b border-white/5">
         <button onclick="toggleModule(${mod.id})" class="w-full p-4 flex items-center justify-between bg-[#202020] hover:bg-[#2a2a2a] transition-colors group">
            <span class="font-bold text-slate-300 text-sm uppercase group-hover:text-white transition-colors">${mod.title}</span>
            <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4 text-slate-500"></i>
         </button>
         ${isExpanded ? `
            <div class="bg-[#151515] relative">
                <div class="absolute left-6 top-0 bottom-0 w-[2px] bg-white/5"></div>
                ${mod.lessons.map(l => {
                    const isActive = l.id === state.activeLessonId;
                    const isLocked = l.status === 'locked';
                    const isPending = l.status === 'pending_review';
                    const isCompleted = l.status === 'completed';
                    
                    let icon = 'play-circle';
                    let iconClass = 'text-slate-400';
                    if (isActive) { icon = 'triangle'; iconClass = 'text-amber-500 fill-amber-500 rotate-90'; }
                    else if (isCompleted) { icon = 'check-circle-2'; iconClass = 'text-emerald-500'; }
                    else if (isPending) { icon = 'hourglass'; iconClass = 'text-amber-400'; }
                    else if (isLocked) { icon = 'lock'; iconClass = 'text-slate-500'; }

                    return `
                        <div onclick="${isLocked ? '' : `setActiveLesson(${l.id})`}" 
                             class="relative pl-12 pr-4 py-4 flex items-center gap-3 cursor-pointer border-l-4 transition-all ${isActive ? 'bg-white/10 border-amber-500' : 'border-transparent hover:bg-white/5'} ${isLocked ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}">
                            <i data-lucide="${icon}" class="w-4 h-4 ${iconClass}"></i>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-0.5">
                                    <span class="text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}">${l.title}</span>
                                </div>
                                ${!isLocked && !isPending ? `<div class="text-xs text-slate-500">${l.duration}</div>` : ''}
                                ${isPending ? '<div class="text-xs text-amber-400 font-bold">En attente...</div>' : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
         ` : ''}
      </div>
    `;
  }).join('');

  let actionBtnHTML = '';
  if (lesson.status === 'completed') {
    actionBtnHTML = `
        <button disabled class="w-full md:w-auto bg-emerald-100 text-emerald-800 px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center gap-2 cursor-default border border-emerald-200">
            <i data-lucide="check" class="w-6 h-6"></i> Leçon terminée
        </button>
    `;
  } else if (lesson.type === 'practice' && lesson.validationStatus === 'submitted') {
    actionBtnHTML = `
        <button disabled class="w-full md:w-auto bg-slate-100 text-slate-400 px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
            <i data-lucide="clock" class="w-6 h-6"></i> En attente...
        </button>
    `;
  } else if (lesson.type === 'practice') {
     actionBtnHTML = `
        <button onclick="completeLesson()" class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg flex items-center justify-center gap-3">
            <i data-lucide="video" class="w-6 h-6"></i> Envoyer mon travail
        </button>
    `;
  } else {
    actionBtnHTML = `
        <button onclick="completeLesson()" class="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-xl flex items-center justify-center gap-3 group">
            <span>J'ai terminé, suite</span>
            <i data-lucide="${isLastLesson ? 'check' : 'arrow-right'}" class="w-6 h-6"></i>
        </button>
    `;
  }

  return `
    <div class="flex flex-col md:flex-row h-full relative bg-black">
        <div class="w-full md:w-[340px] flex-col h-full bg-[#1a1a1a] border-r border-white/10 shadow-2xl flex z-20">
            <div class="p-5 bg-[#262626] border-b border-white/10 flex items-center justify-between">
                <h2 class="text-lg font-black text-white tracking-widest uppercase flex items-center gap-2">
                    <i data-lucide="folder-open" class="w-5 h-5 text-amber-500"></i> Programme
                </h2>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar bg-[#1a1a1a]">
                ${sidebarHTML}
            </div>
        </div>

        <div id="video-container" class="flex-1 h-full bg-slate-900 relative overflow-hidden flex flex-col">
            <div class="relative w-full flex-1 bg-black flex items-center justify-center group ${state.isFullscreen ? 'fixed inset-0 z-[100]' : ''}">
                 <img src="https://picsum.photos/seed/${lesson.id}/1200/675" class="w-full h-full object-contain opacity-50" />
                 <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-24 h-24 bg-amber-500/90 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)] cursor-pointer hover:bg-amber-400">
                        <i data-lucide="play" class="w-10 h-10 text-white fill-current ml-1"></i>
                    </div>
                 </div>
                 <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-white font-medium">${lesson.duration}</span>
                    <button onclick="toggleFullscreen()" class="text-white hover:text-amber-400 p-2"><i data-lucide="${state.isFullscreen ? 'minimize-2' : 'maximize-2'}"></i></button>
                 </div>
            </div>

            <div class="flex-none bg-white border-t border-slate-200 p-4 md:px-8 md:py-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-4 w-full md:w-auto">
                    <div class="flex-1">
                        <h1 class="text-xl font-black text-slate-900 leading-tight">${lesson.title}</h1>
                        <p class="text-sm text-slate-500 truncate">${lesson.subtitle}</p>
                    </div>
                    <button onclick="toggleNotes()" class="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold transition-colors">
                        <i data-lucide="book-open" class="w-5 h-5 text-blue-600"></i>
                        <span class="hidden md:inline">Lire le cours</span>
                    </button>
                </div>
                <div class="w-full md:w-auto">${actionBtnHTML}</div>
            </div>

            ${state.isNotesOpen ? `
                <div class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-end fade-in">
                    <div class="w-full md:w-[600px] h-full bg-white shadow-2xl overflow-y-auto">
                        <div class="sticky top-0 bg-white/90 backdrop-blur border-b border-slate-100 p-6 flex justify-between items-center z-10">
                            <h2 class="text-2xl font-black text-slate-800 flex items-center gap-3"><i data-lucide="file-text" class="text-amber-500"></i> Notes</h2>
                            <button onclick="toggleNotes()" class="p-2 bg-slate-100 rounded-full"><i data-lucide="x"></i></button>
                        </div>
                        <div class="p-8 prose prose-lg prose-slate max-w-none">
                            <h3>${lesson.content.heading}</h3>
                            <p>${lesson.content.description}</p>
                            <div class="my-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                                <h4 class="text-blue-900 mt-0">💡 Conseils du coach</h4>
                                <ul class="list-disc pl-5 space-y-2 text-slate-700">
                                    ${lesson.content.tips.map(t => `<li>${t}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        <div class="h-24"></div>
                    </div>
                </div>
            ` : ''}
        </div>
    </div>
  `;
}

function renderGames() {
  const games = [
    { id: 1, title: "Ear Master", desc: "Reconnaître les accords à l'oreille", icon: 'music', color: "bg-purple-500", locked: false },
    { id: 2, title: "Rythme Box", desc: "Taper dans le tempo", icon: 'timer', color: "bg-rose-500", locked: false },
    { id: 3, title: "Accordeur Pro", desc: "Entraînement à l'accordage rapide", icon: 'mic-2', color: "bg-blue-500", locked: true },
  ];

  return `
    <div class="h-full overflow-y-auto p-6 md:p-10 bg-slate-50">
      <header class="mb-10 text-center md:text-left">
        <h1 class="text-4xl font-black text-slate-900 mb-2">Salle de Jeu 🕹️</h1>
        <p class="text-xl text-slate-500">Détendez-vous tout en progressant.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${games.map(g => `
          <div class="group relative bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl ${g.locked ? 'opacity-75 grayscale' : 'cursor-pointer'}">
             <div class="w-16 h-16 ${g.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white transform group-hover:rotate-6 transition-transform">
                <i data-lucide="${g.icon}" class="w-8 h-8"></i>
             </div>
             <h3 class="text-2xl font-bold text-slate-900 mb-2">${g.title}</h3>
             <p class="text-slate-500 text-lg mb-6">${g.desc}</p>
             <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                ${g.locked ? `
                    <span class="flex items-center gap-2 text-slate-400 font-bold bg-slate-100 px-4 py-2 rounded-full text-sm">🔒 Bientôt</span>
                ` : `
                    <span class="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 px-4 py-2 rounded-full text-sm group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <i data-lucide="award" class="w-4 h-4"></i> Jouer
                    </span>
                `}
             </div>
          </div>
        `).join('')}
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
    case 'dashboard': mainContent = renderDashboard(); break;
    case 'classroom': mainContent = renderClassroom(); break;
    case 'games': mainContent = renderGames(); break;
    default: mainContent = '<div>404</div>';
  }

  root.innerHTML = `
    <div class="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
        ${renderNav()}
        <main class="flex-1 h-full relative overflow-hidden">
            ${mainContent}
        </main>
    </div>
  `;

  // Init Lucide Icons safely
  if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
  }
}

// Start
document.addEventListener("DOMContentLoaded", render);
// Fallback if DOM already loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(render, 1);
}
