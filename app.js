
/**
 * GIA V3.1 - ELITE EDITION
 * Focus : Seniors, Premium UX, Admin & Student management
 */

// --- DONNÉES ---
const INITIAL_MODULES = [
  {
    id: 1,
    title: "CHAPITRE 1 : Les Fondamentaux",
    lessons: [
      { id: 101, title: "Bienvenue & Posture", subtitle: "Les bases du confort", duration: "10m", type: 'video', status: 'active', hasVideo: true },
      { id: 102, title: "Accorder sa Guitare", subtitle: "Précision auditive", duration: "15m", type: 'video', status: 'locked', hasVideo: true }
    ]
  },
  {
    id: 2,
    title: "CHAPITRE 2 : Premiers Accords",
    lessons: [
      { id: 201, title: "Le Mi Mineur (Em)", subtitle: "L'accord universel", duration: "20m", type: 'practice', status: 'locked', hasVideo: false },
      { id: 202, title: "Quiz Théorie", subtitle: "Validez vos acquis", duration: "5m", type: 'text', status: 'locked', hasVideo: false }
    ]
  }
];

// --- STATE ---
const state = {
  modules: JSON.parse(JSON.stringify(INITIAL_MODULES)),
  activeLessonId: 101,
  currentView: 'dashboard',
  expandedModules: [1],
  isNotesOpen: false,
  user: {
    name: "Jean-Pierre",
    progression: 15,
    points: 450,
    avatar: "https://i.pravatar.cc/150?u=jp"
  }
};

// --- LOGIQUE ---
window.setView = (view) => {
  state.currentView = view;
  state.isNotesOpen = false;
  render();
};

window.setActiveLesson = (id) => {
  state.activeLessonId = id;
  state.currentView = 'classroom';
  render();
};

window.toggleNotes = () => {
  state.isNotesOpen = !state.isNotesOpen;
  render();
};

window.toggleModule = (id) => {
  if(state.expandedModules.includes(id)) state.expandedModules = state.expandedModules.filter(m => m !== id);
  else state.expandedModules.push(id);
  render();
};

// --- RENDU COMPOSANTS ---

function renderSidebar() {
  return state.modules.map(mod => `
    <div class="mb-2">
      <button onclick="toggleModule(${mod.id})" class="w-full p-4 flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition-colors">
        <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">${mod.title}</span>
        <i data-lucide="${state.expandedModules.includes(mod.id) ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4 text-slate-500"></i>
      </button>
      ${state.expandedModules.includes(mod.id) ? `
        <div class="bg-slate-900">
          ${mod.lessons.map(l => {
            const isActive = l.id === state.activeLessonId;
            const isLocked = l.status === 'locked';
            return `
              <div onclick="${isLocked ? '' : `setActiveLesson(${l.id})`}" class="flex items-center gap-4 p-5 cursor-pointer border-l-4 transition-all ${isActive ? 'bg-orange-500/10 border-orange-500' : 'border-transparent hover:bg-white/5'} ${isLocked ? 'opacity-30 grayscale cursor-not-allowed' : ''}">
                <i data-lucide="${l.type === 'video' ? 'play-circle' : l.type === 'practice' ? 'target' : 'file-text'}" class="w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-500'}"></i>
                <div>
                  <p class="text-[16px] font-bold ${isActive ? 'text-white' : 'text-slate-300'} leading-none">${l.title}</p>
                  <span class="text-[11px] text-slate-500 uppercase font-black">${l.duration}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function renderDashboard() {
  return `
    <div class="h-full overflow-y-auto p-12 bg-slate-50 fade-in">
      <header class="mb-12">
        <h1 class="text-5xl font-black text-slate-900 mb-2">Bonjour, ${state.user.name} 👋</h1>
        <p class="text-xl text-slate-500">Prêt pour votre session de guitare du jour ?</p>
      </header>

      <!-- Bento Grid -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Main Card -->
        <div class="col-span-8 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 flex items-center gap-8 relative overflow-hidden group">
          <div class="z-10 flex-1">
            <span class="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase mb-6 inline-block">Prochaine étape</span>
            <h2 class="text-4xl font-black text-slate-900 mb-4 leading-tight">Leçon 2 : <br/>Accorder sa guitare</h2>
            <button onclick="setView('classroom')" class="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
              <i data-lucide="play" class="fill-current"></i> Reprendre le cours
            </button>
          </div>
          <div class="w-64 h-64 bg-slate-100 rounded-3xl overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-500">
             <img src="https://picsum.photos/seed/guitar/400/400" class="w-full h-full object-cover" />
          </div>
          <div class="absolute -right-10 -bottom-10 opacity-5 transform rotate-12"><i data-lucide="music" class="w-64 h-64"></i></div>
        </div>

        <!-- Progress Card -->
        <div class="col-span-4 bg-orange-500 rounded-[2.5rem] p-10 text-white shadow-xl flex flex-col justify-between">
          <div class="flex justify-between items-start">
             <i data-lucide="trending-up" class="w-10 h-10 opacity-50"></i>
             <span class="text-4xl font-black">${state.user.progression}%</span>
          </div>
          <div>
            <p class="text-lg font-bold opacity-80">Progression Cursus</p>
            <div class="w-full bg-white/20 h-3 rounded-full mt-4 overflow-hidden">
              <div class="bg-white h-full" style="width: ${state.user.progression}%"></div>
            </div>
          </div>
        </div>

        <!-- Stats 1 -->
        <div class="col-span-4 bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl flex items-center gap-6">
           <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"><i data-lucide="zap" class="w-8 h-8"></i></div>
           <div>
             <p class="text-3xl font-black">${state.user.points}</p>
             <p class="font-bold opacity-70">GIA Points</p>
           </div>
        </div>

        <!-- Stats 2 -->
        <div class="col-span-4 bg-emerald-500 rounded-[2.5rem] p-8 text-white shadow-xl flex items-center gap-6">
           <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"><i data-lucide="award" class="w-8 h-8"></i></div>
           <div>
             <p class="text-3xl font-black">4</p>
             <p class="font-bold opacity-70">Badges obtenus</p>
           </div>
        </div>

        <!-- Stats 3 -->
        <div class="col-span-4 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl flex items-center gap-6">
           <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"><i data-lucide="clock" class="w-8 h-8"></i></div>
           <div>
             <p class="text-3xl font-black">12h</p>
             <p class="font-bold opacity-70">Temps de pratique</p>
           </div>
        </div>
      </div>
    </div>
  `;
}

function renderClassroom() {
  const currentLesson = state.modules.flatMap(m => m.lessons).find(l => l.id === state.activeLessonId);

  return `
    <div class="flex h-full bg-slate-900">
      <!-- Sidebar -->
      <aside class="w-[340px] h-full flex flex-col bg-slate-950 border-r border-white/5 overflow-y-auto custom-scrollbar">
         <div class="p-6 border-b border-white/10 flex items-center gap-3">
            <i data-lucide="layout-list" class="text-orange-500 w-5 h-5"></i>
            <span class="text-white font-black uppercase text-xs tracking-widest">Mon Parcours</span>
         </div>
         ${renderSidebar()}
      </aside>

      <!-- Main Player -->
      <div class="flex-1 flex flex-col relative">
        <div class="flex-1 p-10 flex flex-col">
          <div class="flex-1 flex items-center justify-center">
            ${currentLesson.hasVideo ? `
              <!-- Vidéo Cinema Frame -->
              <div class="w-full max-w-5xl aspect-video video-frame bg-black group cursor-pointer">
                <img src="https://picsum.photos/seed/guit/${currentLesson.id}/1280/720" class="w-full h-full object-cover opacity-40 blur-[2px] group-hover:blur-0 transition-all duration-700" />
                <div class="absolute inset-0 flex items-center justify-center">
                   <button class="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                      <i data-lucide="play" class="w-10 h-10 text-white fill-current ml-1"></i>
                   </button>
                </div>
              </div>
            ` : `
              <!-- Mode Canvas (Pas de vidéo) -->
              <div class="bg-white rounded-3xl p-12 shadow-2xl max-w-2xl w-full text-center fade-in">
                 <div class="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><i data-lucide="file-text" class="w-10 h-10"></i></div>
                 <h2 class="text-3xl font-black text-slate-900 mb-4">Exercice Théorique</h2>
                 <p class="text-xl text-slate-600 leading-relaxed mb-8">Pour valider cette leçon, veuillez consulter les notes de cours détaillées via le panneau latéral.</p>
                 <button onclick="toggleNotes()" class="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold">Consulter les notes</button>
              </div>
            `}
          </div>
        </div>

        <!-- Sticky Footer -->
        <footer class="bg-white p-8 px-12 border-t border-slate-200 shadow-sticky-footer flex items-center justify-between z-30">
           <div>
             <h3 class="text-2xl font-black text-slate-900">${currentLesson.title}</h3>
             <p class="text-slate-500 font-bold">${currentLesson.subtitle}</p>
           </div>
           <div class="flex items-center gap-4">
             <button onclick="toggleNotes()" class="flex items-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm">
                <i data-lucide="book" class="w-5 h-5 text-blue-500"></i> Lire le cours
             </button>
             <button class="bg-[#F97316] hover:bg-orange-600 text-white px-10 py-3 rounded-xl font-black text-lg shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                J'ai terminé, suite <i data-lucide="chevron-right" class="w-6 h-6"></i>
             </button>
           </div>
        </footer>

        <!-- Notes Drawer -->
        <div id="notes-drawer" class="fixed top-0 right-0 h-full w-[40%] min-w-[400px] bg-white shadow-2xl z-[100] transform transition-transform duration-500 ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-slate-100 flex flex-col">
           <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 class="text-2xl font-black text-slate-900 flex items-center gap-3"><i data-lucide="book-open" class="text-orange-500"></i> Notes de cours</h3>
              <button onclick="toggleNotes()" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-800"><i data-lucide="x" class="w-8 h-8"></i></button>
           </div>
           <div class="flex-1 overflow-y-auto p-12 prose prose-slate max-w-none">
              <h1 class="text-4xl font-black mb-6">${currentLesson.title}</h1>
              <p class="text-xl text-slate-700 mb-10">Ici s'affiche le contenu textuel enrichi, les diagrammes d'accords et les explications détaillées pour les seniors.</p>
              <div class="p-8 bg-orange-50 rounded-3xl border-l-8 border-orange-500"><h4 class="font-black text-orange-900 mb-4 text-xl">Conseil Premium</h4><p class="text-lg">Prenez le temps de bien respirer entre chaque exercice.</p></div>
           </div>
        </div>
        ${state.isNotesOpen ? `<div onclick="toggleNotes()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] fade-in"></div>` : ''}
      </div>
    </div>
  `;
}

function renderAdmin() {
  return `
    <div class="h-full bg-white p-12 bg-admin fade-in overflow-y-auto">
      <header class="flex justify-between items-center mb-12">
        <div>
           <h1 class="text-4xl font-black text-slate-900 mb-2 font-mono">PANNEAU ADMINISTRATION</h1>
           <p class="text-slate-500 font-bold">Édition des parcours et gestion des modules</p>
        </div>
        <button class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><i data-lucide="plus"></i> Nouveau Chapitre</button>
      </header>
      
      <div class="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        ${state.modules.map(mod => `
          <div class="bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
             <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-4">
                   <div class="w-8 h-8 bg-slate-100 flex items-center justify-center rounded cursor-move"><i data-lucide="grip-vertical" class="text-slate-400"></i></div>
                   <input type="text" value="${mod.title}" class="text-xl font-black bg-transparent border-b-2 border-transparent focus:border-indigo-500 outline-none w-[400px]" />
                </div>
                <button class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><i data-lucide="trash-2"></i></button>
             </div>
             <div class="space-y-3 pl-12">
                ${mod.lessons.map(l => `
                  <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="font-bold text-slate-700">${l.title}</span>
                    <div class="flex items-center gap-4">
                       <button class="text-slate-400 hover:text-indigo-600"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                       <span class="text-xs bg-white px-2 py-1 border rounded text-slate-400 uppercase font-black tracking-widest">${l.type}</span>
                    </div>
                  </div>
                `).join('')}
             </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProfile() {
  return `
    <div class="h-full flex items-center justify-center bg-slate-50 p-12 fade-in">
       <div class="bg-white rounded-[3rem] shadow-2xl p-16 max-w-2xl w-full text-center border border-slate-100">
          <div class="relative w-40 h-40 mx-auto mb-8">
             <img src="${state.user.avatar}" class="w-full h-full rounded-full border-8 border-orange-500 shadow-xl" />
             <div class="absolute bottom-0 right-0 w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg"><i data-lucide="check" class="w-6 h-6"></i></div>
          </div>
          <h2 class="text-4xl font-black text-slate-900 mb-2">${state.user.name}</h2>
          <p class="text-xl text-slate-400 font-bold mb-10 italic">Élève Guitare Passion - Depuis Janv 2024</p>
          
          <div class="grid grid-cols-2 gap-6 mb-10">
             <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100"><p class="text-3xl font-black text-indigo-600">Bronze</p><p class="text-slate-500 font-bold">Niveau Actuel</p></div>
             <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100"><p class="text-3xl font-black text-orange-600">450</p><p class="text-slate-500 font-bold">Points accumulés</p></div>
          </div>

          <button onclick="setView('dashboard')" class="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl transition-all hover:scale-105 active:scale-95">Modifier mon profil</button>
       </div>
    </div>
  `;
}

// --- MOTEUR DE RENDU PRINCIPAL ---
function render() {
  const root = document.getElementById('root');
  if(!root) return;

  let content = '';
  switch(state.currentView) {
    case 'dashboard': content = renderDashboard(); break;
    case 'classroom': content = renderClassroom(); break;
    case 'admin': content = renderAdmin(); break;
    case 'profile': content = renderProfile(); break;
    default: content = renderDashboard();
  }

  root.innerHTML = `
    <div class="flex h-screen bg-slate-100">
      <!-- Nav Menu -->
      <nav class="w-24 bg-white border-r border-slate-200 flex flex-col items-center py-10 z-50 shadow-xl">
        <div class="mb-14 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer hover:rotate-6 transition-transform">
          <i data-lucide="music-4" class="w-8 h-8 text-orange-500"></i>
        </div>
        <div class="flex-1 w-full flex flex-col items-center gap-10">
           <button onclick="setView('dashboard')" class="group flex flex-col items-center gap-1 transition-all ${state.currentView === 'dashboard' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}">
              <i data-lucide="layout-grid" class="w-8 h-8"></i>
              <span class="text-[9px] font-black uppercase tracking-widest">Dashboard</span>
           </button>
           <button onclick="setView('classroom')" class="group flex flex-col items-center gap-1 transition-all ${state.currentView === 'classroom' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}">
              <i data-lucide="graduation-cap" class="w-8 h-8"></i>
              <span class="text-[9px] font-black uppercase tracking-widest">Cours</span>
           </button>
           <button onclick="setView('profile')" class="group flex flex-col items-center gap-1 transition-all ${state.currentView === 'profile' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}">
              <i data-lucide="user" class="w-8 h-8"></i>
              <span class="text-[9px] font-black uppercase tracking-widest">Profil</span>
           </button>
        </div>
        <button onclick="setView('admin')" class="mt-auto p-4 rounded-2xl ${state.currentView === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-500'} transition-all">
           <i data-lucide="settings" class="w-7 h-7"></i>
        </button>
      </nav>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-hidden relative">${content}</main>
    </div>
  `;

  // Init Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Sécurité démarrage
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
} else {
    render();
}
