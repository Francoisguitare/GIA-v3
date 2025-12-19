
/**
 * GIA V3.4 - EXPERT EDITION
 * Spécialement optimisé pour l'interactivité Admin et l'intégration Wistia.
 */

// --- DONNÉES ---
let state = {
  modules: [
    {
      id: 1,
      title: "CHAPITRE 1 : Les Fondamentaux",
      lessons: [
        { 
          id: 101, 
          title: "Bienvenue & Posture", 
          subtitle: "Les bases du confort", 
          duration: "10m", 
          type: 'video', 
          status: 'active', 
          hasVideo: true, 
          wistiaId: '30q789',
          content: "Dans cette leçon, nous allons aborder la posture idéale pour éviter les douleurs lombaires...",
          files: [{ name: "Guide_Posture.pdf", url: "#" }]
        }
      ]
    }
  ],
  activeLessonId: 101,
  currentView: 'dashboard',
  expandedModules: [1],
  isNotesOpen: false,
  editingLessonId: null, // Si null, la modale d'édition est fermée
  user: {
    name: "Jean-Pierre",
    progression: 15,
    points: 450,
    avatar: "https://i.pravatar.cc/150?u=jp"
  }
};

// --- FONCTIONS CORE (WINDOWS) ---
window.setView = (view) => {
  state.currentView = view;
  state.editingLessonId = null;
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

// --- FONCTIONS ADMIN ---
window.openEditor = (lessonId) => {
  state.editingLessonId = lessonId;
  render();
};

window.closeEditor = () => {
  state.editingLessonId = null;
  render();
};

window.updateLesson = (lessonId, field, value) => {
  state.modules.forEach(mod => {
    const lesson = mod.lessons.find(l => l.id === lessonId);
    if (lesson) {
      if (field === 'isLocked') {
        lesson.status = value ? 'locked' : 'active';
      } else {
        lesson[field] = value;
      }
    }
  });
  render();
};

window.addFile = (lessonId) => {
  const name = prompt("Nom du document (ex: Partition PDF) :");
  if (name) {
    state.modules.forEach(mod => {
      const lesson = mod.lessons.find(l => l.id === lessonId);
      if (lesson) lesson.files.push({ name, url: "#" });
    });
    render();
  }
};

window.removeFile = (lessonId, fileName) => {
  state.modules.forEach(mod => {
    const lesson = mod.lessons.find(l => l.id === lessonId);
    if (lesson) lesson.files = lesson.files.filter(f => f.name !== fileName);
  });
  render();
};

window.addChapter = () => {
  const newId = Date.now();
  state.modules.push({ id: newId, title: "Nouveau Chapitre", lessons: [] });
  render();
};

window.addLesson = (chapterId) => {
  const mod = state.modules.find(m => m.id === chapterId);
  if(mod) {
    mod.lessons.push({
      id: Date.now(),
      title: "Nouvelle leçon",
      subtitle: "Description",
      duration: "5m",
      type: 'video',
      status: 'locked',
      hasVideo: true,
      wistiaId: '',
      content: '',
      files: []
    });
    render();
  }
};

// --- RENDU UI COMPOSANTS ---

function renderLessonEditor() {
  const lesson = state.modules.flatMap(m => m.lessons).find(l => l.id === state.editingLessonId);
  if (!lesson) return '';

  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 fade-in">
        <div class="absolute inset-0 modal-overlay" onclick="closeEditor()"></div>
        <div class="bg-white w-full max-w-6xl h-full rounded-[3rem] shadow-2xl z-10 flex flex-col overflow-hidden">
            <header class="p-8 border-b bg-slate-50 flex justify-between items-center">
                <div>
                    <h2 class="text-3xl font-black text-slate-900">Éditeur de Leçon Premium</h2>
                    <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Configuration du contenu élève</p>
                </div>
                <button onclick="closeEditor()" class="p-4 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all border border-transparent hover:border-red-100">
                    <i data-lucide="x" class="w-10 h-10"></i>
                </button>
            </header>
            
            <div class="flex-1 overflow-y-auto p-12 grid grid-cols-12 gap-12">
                <!-- Gauche : Titre et Texte -->
                <div class="col-span-12 lg:col-span-7 space-y-10">
                    <div>
                        <label class="block text-sm font-black uppercase text-slate-400 mb-4 tracking-tighter">Titre de la leçon</label>
                        <input type="text" value="${lesson.title}" oninput="updateLesson(${lesson.id}, 'title', this.value)" 
                               class="w-full text-3xl font-black bg-slate-100 border-2 border-slate-200 p-6 rounded-2xl focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label class="block text-sm font-black uppercase text-slate-400 mb-4 tracking-tighter">Notes de cours (Mise en page)</label>
                        <textarea oninput="updateLesson(${lesson.id}, 'content', this.value)" rows="10"
                                  class="w-full text-xl bg-slate-100 border-2 border-slate-200 p-8 rounded-2xl focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                  placeholder="Rédigez ici vos conseils pédagogiques...">${lesson.content}</textarea>
                    </div>
                </div>

                <!-- Droite : Vidéo, Lock, Fichiers -->
                <div class="col-span-12 lg:col-span-5 space-y-10">
                    <!-- Lock Toggle -->
                    <div class="bg-white p-8 rounded-3xl border-4 ${lesson.status === 'locked' ? 'border-amber-100' : 'border-emerald-100'} shadow-sm">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 ${lesson.status === 'locked' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} rounded-2xl flex items-center justify-center">
                                    <i data-lucide="${lesson.status === 'locked' ? 'lock' : 'unlock'}" class="w-7 h-7"></i>
                                </div>
                                <span class="text-xl font-black text-slate-800">Statut d'accès</span>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${lesson.status !== 'locked' ? 'checked' : ''} onchange="updateLesson(${lesson.id}, 'isLocked', !this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p class="text-sm font-bold text-slate-400 italic">${lesson.status === 'locked' ? 'Cette leçon est verrouillée pour l\'élève.' : 'La leçon est accessible immédiatement.'}</p>
                    </div>

                    <!-- Wistia ID -->
                    <div class="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl">
                        <label class="block text-xs font-black uppercase mb-4 opacity-70">ID Vidéo Wistia (Hébergement Elite)</label>
                        <div class="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/20">
                            <i data-lucide="video" class="w-6 h-6"></i>
                            <input type="text" value="${lesson.wistiaId || ''}" oninput="updateLesson(${lesson.id}, 'wistiaId', this.value)"
                                   class="bg-transparent border-none text-white text-2xl font-mono focus:outline-none w-full" placeholder="ex: 30q789" />
                        </div>
                    </div>

                    <!-- Fichiers -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <label class="text-sm font-black uppercase text-slate-400">Documents joints</label>
                            <button onclick="addFile(${lesson.id})" class="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-600 transition-colors">+ Ajouter un fichier</button>
                        </div>
                        <div class="space-y-3">
                            ${lesson.files.length === 0 ? '<div class="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-300 font-bold uppercase text-xs">Aucun document</div>' : ''}
                            ${lesson.files.map(f => `
                                <div class="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl group">
                                    <div class="flex items-center gap-4">
                                        <i data-lucide="file-text" class="text-slate-400"></i>
                                        <span class="font-bold text-slate-700">${f.name}</span>
                                    </div>
                                    <button onclick="removeFile(${lesson.id}, '${f.name}')" class="text-red-300 hover:text-red-500 transition-colors">
                                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <footer class="p-8 border-t bg-white flex justify-end">
                <button onclick="closeEditor()" class="bg-indigo-600 text-white px-14 py-5 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 transition-all">TERMINER L'ÉDITION</button>
            </footer>
        </div>
    </div>
  `;
}

function renderAdmin() {
  return `
    <div class="h-full bg-admin-grid p-12 overflow-y-auto pb-40 fade-in">
        <header class="flex justify-between items-center mb-16 max-w-6xl mx-auto">
            <div>
                <h1 class="text-5xl font-black text-slate-900 mb-3">Panneau Formateur</h1>
                <p class="text-xl text-slate-400 font-bold uppercase tracking-widest">Édition de votre cursus Elite</p>
            </div>
            <button onclick="addChapter()" class="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
                <i data-lucide="plus-circle"></i> Nouveau Chapitre
            </button>
        </header>

        <div class="space-y-12 max-w-6xl mx-auto">
            ${state.modules.map(mod => `
                <div class="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-premium">
                    <div class="flex items-center justify-between mb-8 pb-6 border-b">
                        <input type="text" value="${mod.title}" class="text-3xl font-black text-slate-900 bg-transparent outline-none focus:border-b-2 border-indigo-500" />
                        <button class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-8 h-8"></i></button>
                    </div>
                    <div class="space-y-4 pl-10">
                        ${mod.lessons.map(l => `
                            <div class="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-indigo-500 hover:bg-white transition-all">
                                <div class="flex items-center gap-6">
                                    <i data-lucide="${l.status === 'locked' ? 'lock' : 'check-circle'}" class="${l.status === 'locked' ? 'text-slate-300' : 'text-emerald-500'} w-7 h-7"></i>
                                    <div>
                                        <p class="text-xl font-black text-slate-800">${l.title}</p>
                                        <p class="text-xs font-bold text-slate-400 uppercase">${l.type} • ${l.duration}</p>
                                    </div>
                                </div>
                                <button onclick="openEditor(${l.id})" class="bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl font-black hover:bg-slate-900 hover:text-white transition-all shadow-sm">ÉDITER</button>
                            </div>
                        `).join('')}
                        <button onclick="addLesson(${mod.id})" class="w-full py-6 border-4 border-dashed border-slate-200 rounded-3xl text-slate-300 font-black hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 text-lg mt-6">
                            <i data-lucide="plus"></i> Ajouter une leçon
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        ${state.editingLessonId ? renderLessonEditor() : ''}
    </div>
  `;
}

function renderClassroom() {
  const currentLesson = state.modules.flatMap(m => m.lessons).find(l => l.id === state.activeLessonId);

  return `
    <div class="flex h-full bg-slate-900">
        <!-- Sidebar -->
        <aside class="w-[360px] bg-slate-950 border-r border-white/5 flex flex-col">
            <div class="p-8 border-b border-white/10">
                <h2 class="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">Leçons</h2>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
                ${state.modules.map(mod => `
                    <div class="mb-4">
                        <button onclick="toggleModule(${mod.id})" class="w-full p-4 flex items-center justify-between text-slate-500 hover:text-white">
                            <span class="text-[10px] font-black uppercase tracking-widest">${mod.title}</span>
                            <i data-lucide="chevron-down" class="w-4 h-4"></i>
                        </button>
                        ${state.expandedModules.includes(mod.id) ? `
                            <div class="space-y-1 mt-2">
                                ${mod.lessons.map(l => {
                                    const isActive = l.id === state.activeLessonId;
                                    const isLocked = l.status === 'locked';
                                    return `
                                        <div onclick="${isLocked ? '' : `setActiveLesson(${l.id})`}" class="p-5 flex items-center gap-4 cursor-pointer border-l-4 transition-all ${isActive ? 'bg-orange-500/10 border-orange-500' : 'border-transparent hover:bg-white/5'} ${isLocked ? 'opacity-30 grayscale' : ''}">
                                            <i data-lucide="${isLocked ? 'lock' : 'play-circle'}" class="${isActive ? 'text-orange-500' : 'text-slate-600'}"></i>
                                            <span class="text-lg font-bold ${isActive ? 'text-white' : 'text-slate-400'}">${l.title}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </aside>

        <!-- Player -->
        <div class="flex-1 flex flex-col">
            <div class="flex-1 flex items-center justify-center p-10 bg-slate-900">
                <div class="w-full max-w-6xl aspect-video video-frame shadow-2xl">
                    ${currentLesson.wistiaId ? `
                        <iframe src="https://fast.wistia.net/embed/iframe/${currentLesson.wistiaId}?videoFoam=true" 
                                title="Wistia video player" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" 
                                name="wistia_embed" allowfullscreen width="100%" height="100%"></iframe>
                    ` : `
                        <div class="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-600">
                            <i data-lucide="video-off" class="w-20 h-20 mb-4 opacity-10"></i>
                            <p class="font-black uppercase tracking-widest text-sm">Vidéo non disponible</p>
                        </div>
                    `}
                </div>
            </div>

            <footer class="bg-white p-8 px-12 border-t flex justify-between items-center shadow-premium">
                <div>
                    <h3 class="text-3xl font-black text-slate-900 leading-none mb-2">${currentLesson.title}</h3>
                    <p class="text-slate-400 font-bold italic">${currentLesson.subtitle}</p>
                </div>
                <div class="flex items-center gap-6">
                    <button onclick="toggleNotes()" class="bg-slate-50 border-2 border-slate-200 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-100 transition-all">
                        <i data-lucide="book-open" class="text-blue-500"></i> Lire le cours
                    </button>
                    <button class="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all">TERMINER</button>
                </div>
            </footer>
        </div>

        <!-- Notes Sidebar -->
        <div class="fixed top-0 right-0 h-full w-[45%] bg-white shadow-2xl z-[80] transform transition-transform duration-500 ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'} border-l flex flex-col">
            <div class="p-10 border-b flex justify-between items-center bg-slate-50">
                <h3 class="text-2xl font-black text-slate-900">Support de cours</h3>
                <button onclick="toggleNotes()" class="p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full"><i data-lucide="x" class="w-8 h-8"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-16 prose prose-slate">
                <h1 class="text-5xl font-black mb-10">${currentLesson.title}</h1>
                <div class="text-2xl text-slate-700 leading-relaxed whitespace-pre-wrap mb-16">${currentLesson.content || "Le formateur n'a pas encore rédigé de notes pour cette leçon."}</div>
                ${currentLesson.files.length > 0 ? `
                    <div class="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                        <h4 class="text-xl font-black mb-6 uppercase tracking-widest text-slate-400">Documents à télécharger</h4>
                        <div class="space-y-4">
                            ${currentLesson.files.map(f => `
                                <a href="#" class="flex items-center justify-between p-6 bg-white border rounded-2xl hover:border-indigo-500 transition-all group">
                                    <span class="font-bold text-slate-700">${f.name}</span>
                                    <i data-lucide="download" class="w-6 h-6 text-slate-300 group-hover:text-indigo-500"></i>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
        ${state.isNotesOpen ? `<div onclick="toggleNotes()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] fade-in"></div>` : ''}
    </div>
  `;
}

function renderDashboard() {
  return `
    <div class="h-full overflow-y-auto p-12 bg-slate-50 fade-in">
        <h1 class="text-6xl font-black text-slate-900 mb-16">Bonjour, ${state.user.name} 👋</h1>
        <div class="grid grid-cols-12 gap-10">
            <div class="col-span-8 bg-white p-12 rounded-[3.5rem] shadow-premium border border-slate-100 flex items-center gap-12 group overflow-hidden relative">
                <div class="z-10 flex-1">
                    <span class="bg-orange-100 text-orange-600 px-6 py-2 rounded-full text-xs font-black uppercase mb-8 inline-block tracking-widest">Leçon en cours</span>
                    <h2 class="text-5xl font-black text-slate-900 mb-8 leading-tight">Accorder sa guitare</h2>
                    <button onclick="setView('classroom')" class="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-2xl flex items-center gap-4 transition-all hover:scale-105 shadow-2xl">
                        <i data-lucide="play" class="fill-current"></i> Continuer
                    </button>
                </div>
                <div class="w-72 h-72 bg-slate-100 rounded-[2.5rem] overflow-hidden group-hover:rotate-3 transition-all duration-700 shadow-inner">
                    <img src="https://picsum.photos/seed/guit/500/500" class="w-full h-full object-cover" />
                </div>
            </div>
            <div class="col-span-4 bg-orange-500 rounded-[3.5rem] p-12 text-white shadow-2xl flex flex-col justify-between overflow-hidden relative">
                <div class="flex justify-between items-start">
                    <i data-lucide="trending-up" class="w-16 h-16 opacity-30"></i>
                    <span class="text-7xl font-black">${state.user.progression}%</span>
                </div>
                <p class="text-2xl font-black opacity-90 leading-tight">Votre avancée dans<br/>le cursus Elite</p>
                <div class="absolute -right-10 -bottom-10 opacity-10"><i data-lucide="award" class="w-64 h-64"></i></div>
            </div>
        </div>
    </div>
  `;
}

function renderProfile() {
  return `
    <div class="h-full flex items-center justify-center bg-slate-50 p-12 fade-in">
        <div class="bg-white p-24 rounded-[5rem] shadow-2xl border border-slate-100 max-w-3xl w-full text-center">
            <img src="${state.user.avatar}" class="w-48 h-48 mx-auto mb-10 rounded-full border-[12px] border-orange-500 shadow-2xl" />
            <h2 class="text-5xl font-black text-slate-900 mb-4">${state.user.name}</h2>
            <p class="text-2xl text-slate-400 font-bold mb-16 uppercase tracking-[0.2em]">Membre Elite GIA</p>
            <button onclick="setView('dashboard')" class="w-full py-7 bg-slate-900 text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all">Accéder au tableau de bord</button>
        </div>
    </div>
  `;
}

// --- MOTEUR DE RENDU ---
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
    <div class="flex h-screen">
      <nav class="w-28 bg-white border-r border-slate-200 flex flex-col items-center py-12 z-[110] shadow-xl">
        <div class="mb-20 w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer hover:rotate-12 transition-transform">
          <i data-lucide="music-4" class="w-10 h-10 text-orange-500"></i>
        </div>
        <div class="flex-1 w-full flex flex-col items-center gap-14">
           <button onclick="setView('dashboard')" class="flex flex-col items-center gap-2 group transition-all ${state.currentView === 'dashboard' ? 'text-orange-600' : 'text-slate-300 hover:text-slate-500'}">
              <i data-lucide="layout-grid" class="w-10 h-10"></i>
              <span class="text-[10px] font-black uppercase tracking-widest">Accueil</span>
           </button>
           <button onclick="setView('classroom')" class="flex flex-col items-center gap-2 group transition-all ${state.currentView === 'classroom' ? 'text-orange-600' : 'text-slate-300 hover:text-slate-500'}">
              <i data-lucide="graduation-cap" class="w-10 h-10"></i>
              <span class="text-[10px] font-black uppercase tracking-widest">Leçons</span>
           </button>
           <button onclick="setView('profile')" class="flex flex-col items-center gap-2 group transition-all ${state.currentView === 'profile' ? 'text-orange-600' : 'text-slate-300 hover:text-slate-500'}">
              <i data-lucide="user" class="w-10 h-10"></i>
              <span class="text-[10px] font-black uppercase tracking-widest">Profil</span>
           </button>
        </div>
        <button onclick="setView('admin')" class="mt-auto p-5 rounded-2xl ${state.currentView === 'admin' ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-xl' : 'text-slate-200 hover:text-slate-400 hover:bg-slate-50'} transition-all">
           <i data-lucide="shield-check" class="w-10 h-10"></i>
        </button>
      </nav>
      <main class="flex-1 overflow-hidden relative">${content}</main>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

// Lancement
render();
