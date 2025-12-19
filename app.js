
/**
 * GIA V3.2 - ELITE EDITION
 * Focus : Wistia Support, Full Admin CRUD, Premium UI
 */

// --- DONNÉES ---
const INITIAL_MODULES = [
  {
    id: 1,
    title: "CHAPITRE 1 : Les Fondamentaux",
    lessons: [
      { id: 101, title: "Bienvenue & Posture", subtitle: "Les bases du confort", duration: "10m", type: 'video', status: 'active', hasVideo: true, wistiaId: '30q789' }, // Exemple ID Wistia
      { id: 102, title: "Accorder sa Guitare", subtitle: "Précision auditive", duration: "15m", type: 'video', status: 'locked', hasVideo: true, wistiaId: 'abc123' }
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
let state = {
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

// --- LOGIQUE GLOBALE ---
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

// --- LOGIQUE ADMIN (CRUD) ---
window.updateChapterTitle = (id, val) => {
  const mod = state.modules.find(m => m.id === id);
  if (mod) mod.title = val;
};

window.deleteChapter = (id) => {
  if (confirm("Supprimer ce chapitre et toutes ses leçons ?")) {
    state.modules = state.modules.filter(m => m.id !== id);
    render();
  }
};

window.addChapter = () => {
  const newId = state.modules.length > 0 ? Math.max(...state.modules.map(m => m.id)) + 1 : 1;
  state.modules.push({
    id: newId,
    title: "NOUVEAU CHAPITRE",
    lessons: []
  });
  render();
};

window.editLesson = (lessonId) => {
    const newTitle = prompt("Nouveau titre pour la leçon ?");
    if (newTitle) {
        state.modules.forEach(mod => {
            const lesson = mod.lessons.find(l => l.id === lessonId);
            if (lesson) lesson.title = newTitle;
        });
        render();
    }
};

// --- RENDU COMPOSANTS ---

function renderSidebar() {
  return state.modules.map(mod => `
    <div class="mb-2">
      <button onclick="toggleModule(${mod.id})" class="w-full p-4 flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition-colors">
        <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest text-left">${mod.title}</span>
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
        <p class="text-xl text-slate-500">Reprenons là où vous vous étiez arrêté.</p>
      </header>
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-8 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 flex items-center gap-8 relative overflow-hidden group">
          <div class="z-10 flex-1">
            <span class="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase mb-6 inline-block">Dernière leçon vue</span>
            <h2 class="text-4xl font-black text-slate-900 mb-4 leading-tight">Accorder sa guitare</h2>
            <button onclick="setView('classroom')" class="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-transform hover:scale-105">
              <i data-lucide="play" class="fill-current"></i> Continuer le cursus
            </button>
          </div>
          <div class="w-64 h-64 bg-slate-100 rounded-3xl overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-500">
             <img src="https://picsum.photos/seed/guitar/400/400" class="w-full h-full object-cover" />
          </div>
        </div>
        <div class="col-span-4 bg-orange-500 rounded-[2.5rem] p-10 text-white shadow-xl flex flex-col justify-between">
          <div class="flex justify-between items-start">
             <i data-lucide="trending-up" class="w-10 h-10 opacity-50"></i>
             <span class="text-4xl font-black">${state.user.progression}%</span>
          </div>
          <p class="text-lg font-bold opacity-80">Votre progression totale</p>
        </div>
      </div>
    </div>
  `;
}

function renderClassroom() {
  const currentLesson = state.modules.flatMap(m => m.lessons).find(l => l.id === state.activeLessonId);

  return `
    <div class="flex h-full bg-slate-900">
      <aside class="w-[340px] h-full flex flex-col bg-slate-950 border-r border-white/5 overflow-y-auto custom-scrollbar">
         <div class="p-6 border-b border-white/10 flex items-center gap-3">
            <i data-lucide="layout-list" class="text-orange-500 w-5 h-5"></i>
            <span class="text-white font-black uppercase text-xs tracking-widest">Contenu du cours</span>
         </div>
         ${renderSidebar()}
      </aside>

      <div class="flex-1 flex flex-col relative">
        <div class="flex-1 p-10 flex flex-col">
          <div class="flex-1 flex items-center justify-center">
            ${currentLesson.hasVideo ? `
              <!-- Vidéo Cinema Frame avec support Wistia -->
              <div class="w-full max-w-5xl aspect-video video-frame group">
                ${currentLesson.wistiaId ? `
                  <iframe src="https://fast.wistia.net/embed/iframe/${currentLesson.wistiaId}?videoFoam=true" 
                          title="Wistia video player" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" 
                          name="wistia_embed" allowfullscreen mozallowfullscreen webkitallowfullscreen oallowfullscreen msallowfullscreen 
                          width="100%" height="100%"></iframe>
                ` : `
                  <div class="w-full h-full bg-slate-800 flex items-center justify-center">
                    <p class="text-slate-400 font-bold">Vidéo en cours de préparation...</p>
                  </div>
                `}
              </div>
            ` : `
              <div class="bg-white rounded-3xl p-12 shadow-2xl max-w-2xl w-full text-center fade-in">
                 <div class="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><i data-lucide="file-text" class="w-10 h-10"></i></div>
                 <h2 class="text-3xl font-black text-slate-900 mb-4">Lecture Théorique</h2>
                 <p class="text-xl text-slate-600 leading-relaxed mb-8">Consultez les notes de cours pour valider cette étape.</p>
                 <button onclick="toggleNotes()" class="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold">Ouvrir le manuel</button>
              </div>
            `}
          </div>
        </div>

        <footer class="bg-white p-8 px-12 border-t border-slate-200 shadow-sticky-footer flex items-center justify-between z-30">
           <div>
             <h3 class="text-2xl font-black text-slate-900">${currentLesson.title}</h3>
             <p class="text-slate-500 font-bold italic">${currentLesson.subtitle}</p>
           </div>
           <div class="flex items-center gap-4">
             <button onclick="toggleNotes()" class="flex items-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all">
                <i data-lucide="book" class="w-5 h-5 text-blue-500"></i> Lire le cours
             </button>
             <button class="bg-[#F97316] hover:bg-orange-600 text-white px-10 py-3 rounded-xl font-black text-lg shadow-lg transition-all flex items-center gap-2">
                Suivant <i data-lucide="chevron-right" class="w-6 h-6"></i>
             </button>
           </div>
        </footer>

        <div id="notes-drawer" class="fixed top-0 right-0 h-full w-[40%] min-w-[400px] bg-white shadow-2xl z-[100] transform transition-transform duration-500 ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-slate-100 flex flex-col">
           <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 class="text-2xl font-black text-slate-900 flex items-center gap-3"><i data-lucide="book-open" class="text-orange-500"></i> Notes</h3>
              <button onclick="toggleNotes()" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-800"><i data-lucide="x" class="w-8 h-8"></i></button>
           </div>
           <div class="flex-1 overflow-y-auto p-12 prose prose-slate max-w-none">
              <h1 class="text-4xl font-black mb-6">${currentLesson.title}</h1>
              <p class="text-xl text-slate-700">Contenu riche pour seniors ici...</p>
           </div>
        </div>
        ${state.isNotesOpen ? `<div onclick="toggleNotes()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] fade-in"></div>` : ''}
      </div>
    </div>
  `;
}

function renderAdmin() {
  return `
    <div class="h-full bg-white p-12 bg-admin fade-in overflow-y-auto pb-40">
      <header class="flex justify-between items-center mb-12 bg-white/80 backdrop-blur p-6 rounded-3xl border border-slate-100 sticky top-0 z-20 shadow-sm">
        <div>
           <h1 class="text-4xl font-black text-slate-900 mb-2 font-mono">GESTIONNAIRE DE CONTENU</h1>
           <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Éditez votre programme ici</p>
        </div>
        <button onclick="addChapter()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg transition-all active:scale-95">
            <i data-lucide="plus-circle"></i> Nouveau Chapitre
        </button>
      </header>
      
      <div class="grid grid-cols-1 gap-10 max-w-5xl mx-auto">
        ${state.modules.map(mod => `
          <div class="bg-white border-2 border-slate-200 p-10 rounded-[2.5rem] shadow-xl hover:border-indigo-200 transition-all group">
             <div class="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                <div class="flex items-center gap-6 flex-1">
                   <div class="w-12 h-12 bg-slate-100 flex items-center justify-center rounded-2xl cursor-move"><i data-lucide="grip-vertical" class="text-slate-400"></i></div>
                   <input type="text" 
                          onchange="updateChapterTitle(${mod.id}, this.value)" 
                          value="${mod.title}" 
                          class="text-3xl font-black bg-transparent border-b-2 border-transparent focus:border-indigo-500 outline-none flex-1 py-2" 
                          placeholder="Nom du chapitre..." />
                </div>
                <button onclick="deleteChapter(${mod.id})" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-4 rounded-2xl transition-all">
                    <i data-lucide="trash-2" class="w-8 h-8"></i>
                </button>
             </div>
             <div class="space-y-4 pl-12">
                ${mod.lessons.map(l => `
                  <div class="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 group/lesson hover:border-indigo-100 transition-all">
                    <div class="flex items-center gap-4">
                        <i data-lucide="${l.type === 'video' ? 'play' : 'file'}" class="w-5 h-5 text-slate-400"></i>
                        <span class="font-bold text-slate-800 text-lg">${l.title}</span>
                    </div>
                    <div class="flex items-center gap-4">
                       <button onclick="editLesson(${l.id})" class="bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 font-bold text-sm shadow-sm">Éditer</button>
                       <span class="text-[10px] bg-slate-200 px-3 py-1 rounded-full text-slate-600 uppercase font-black tracking-widest">${l.type}</span>
                    </div>
                  </div>
                `).join('')}
                <button class="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 font-bold transition-all mt-4">
                    + Ajouter une leçon
                </button>
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
       <div class="bg-white rounded-[4rem] shadow-2xl p-16 max-w-2xl w-full text-center border border-slate-100">
          <img src="${state.user.avatar}" class="w-40 h-40 mx-auto mb-8 rounded-full border-8 border-orange-500 shadow-2xl" />
          <h2 class="text-4xl font-black text-slate-900 mb-2">${state.user.name}</h2>
          <p class="text-xl text-slate-400 font-bold mb-10">Membre Elite - Section Guitare</p>
          <button onclick="setView('dashboard')" class="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl transition-all hover:scale-105">Retour au cursus</button>
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
      <nav class="w-24 bg-white border-r border-slate-200 flex flex-col items-center py-10 z-50 shadow-xl">
        <div class="mb-14 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
          <i data-lucide="music-4" class="w-8 h-8 text-orange-500"></i>
        </div>
        <div class="flex-1 w-full flex flex-col items-center gap-10">
           <button onclick="setView('dashboard')" class="group flex flex-col items-center gap-1 transition-all ${state.currentView === 'dashboard' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}">
              <i data-lucide="layout-grid" class="w-8 h-8"></i>
              <span class="text-[9px] font-black uppercase tracking-widest">Accueil</span>
           </button>
           <button onclick="setView('classroom')" class="group flex flex-col items-center gap-1 transition-all ${state.currentView === 'classroom' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}">
              <i data-lucide="graduation-cap" class="w-8 h-8"></i>
              <span class="text-[9px] font-black uppercase tracking-widest">Leçons</span>
           </button>
           <button onclick="setView('profile')" class="group flex flex-col items-center gap-1 transition-all ${state.currentView === 'profile' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}">
              <i data-lucide="user" class="w-8 h-8"></i>
              <span class="text-[9px] font-black uppercase tracking-widest">Compte</span>
           </button>
        </div>
        <button onclick="setView('admin')" class="mt-auto p-4 rounded-2xl ${state.currentView === 'admin' ? 'bg-indigo-600 text-white btn-admin-active' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-500'} transition-all">
           <i data-lucide="settings" class="w-7 h-7"></i>
        </button>
      </nav>
      <main class="flex-1 overflow-hidden relative bg-slate-50">${content}</main>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

// Initialisation sécurisée
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
} else {
    render();
}
