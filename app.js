
/**
 * GIA V3.3 - ELITE ADMIN EDITION
 * Focus : Full Lesson Editing, File Management, Lock Toggle, Wistia.
 */

// --- DONNÉES INITIALES ---
const INITIAL_MODULES = [
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
        content: "Bienvenue dans ce cursus ! Nous allons voir comment tenir la guitare sans fatigue.",
        files: [{ name: "Posture_Guitare.pdf", url: "#" }]
      },
      { 
        id: 102, 
        title: "Accorder sa Guitare", 
        subtitle: "Précision auditive", 
        duration: "15m", 
        type: 'video', 
        status: 'locked', 
        hasVideo: true, 
        wistiaId: 'abc123',
        content: "L'accordage est la clé d'un bon son.",
        files: []
      }
    ]
  },
  {
    id: 2,
    title: "CHAPITRE 2 : Premiers Accords",
    lessons: [
      { 
        id: 201, 
        title: "Le Mi Mineur (Em)", 
        subtitle: "L'accord universel", 
        duration: "20m", 
        type: 'practice', 
        status: 'locked', 
        hasVideo: false,
        content: "Posez votre majeur et votre annulaire sur la 2ème case...",
        files: [{ name: "Diagramme_Em.png", url: "#" }]
      }
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
  editingLessonId: null, // ID de la leçon en cours d'édition
  user: {
    name: "Jean-Pierre",
    progression: 15,
    points: 450,
    avatar: "https://i.pravatar.cc/150?u=jp"
  }
};

// --- LOGIQUE CORE ---
window.setView = (view) => {
  state.currentView = view;
  state.editingLessonId = null;
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

// --- LOGIQUE ADMIN ---
window.updateChapterTitle = (id, val) => {
  const mod = state.modules.find(m => m.id === id);
  if (mod) mod.title = val;
};

window.deleteChapter = (id) => {
  if (confirm("Supprimer ce chapitre ?")) {
    state.modules = state.modules.filter(m => m.id !== id);
    render();
  }
};

window.addChapter = () => {
  const newId = state.modules.length > 0 ? Math.max(...state.modules.map(m => m.id)) + 1 : 1;
  state.modules.push({ id: newId, title: "NOUVEAU CHAPITRE", lessons: [] });
  render();
};

window.openLessonEditor = (lessonId) => {
  state.editingLessonId = lessonId;
  render();
};

window.closeLessonEditor = () => {
  state.editingLessonId = null;
  render();
};

window.updateLessonDetail = (id, field, value) => {
  state.modules.forEach(mod => {
    const lesson = mod.lessons.find(l => l.id === id);
    if (lesson) {
        lesson[field] = value;
        // Si c'est le toggle lock, on gère le status
        if(field === 'status') {
            lesson.status = value ? 'active' : 'locked';
        }
    }
  });
  render();
};

window.addLessonToChapter = (chapterId) => {
    const mod = state.modules.find(m => m.id === chapterId);
    if(mod) {
        const newId = Date.now();
        mod.lessons.push({
            id: newId,
            title: "Nouvelle leçon",
            subtitle: "Description courte",
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

window.addFileToLesson = (lessonId) => {
    const name = prompt("Nom du fichier ?");
    if(name) {
        state.modules.forEach(mod => {
            const lesson = mod.lessons.find(l => l.id === lessonId);
            if (lesson) lesson.files.push({ name, url: "#" });
        });
        render();
    }
};

window.removeFileFromLesson = (lessonId, fileName) => {
    state.modules.forEach(mod => {
        const lesson = mod.lessons.find(l => l.id === lessonId);
        if (lesson) lesson.files = lesson.files.filter(f => f.name !== fileName);
    });
    render();
};

// --- RENDU UI ---

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
                <i data-lucide="${l.status === 'locked' ? 'lock' : (l.type === 'video' ? 'play-circle' : 'file-text')}" class="w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-500'}"></i>
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

function renderLessonEditor() {
  const lesson = state.modules.flatMap(m => m.lessons).find(l => l.id === state.editingLessonId);
  if (!lesson) return '';

  return `
    <div id="admin-modal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 fade-in">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onclick="closeLessonEditor()"></div>
        <div class="bg-white w-full max-w-5xl h-full rounded-[2.5rem] shadow-2xl z-10 flex flex-col overflow-hidden">
            <header class="p-8 border-b flex justify-between items-center bg-slate-50">
                <div>
                    <h2 class="text-3xl font-black text-slate-900">Édition de Leçon</h2>
                    <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">ID: ${lesson.id}</p>
                </div>
                <button onclick="closeLessonEditor()" class="p-4 hover:bg-white rounded-full transition-all text-slate-400 hover:text-red-500 border border-transparent hover:border-slate-200">
                    <i data-lucide="x" class="w-8 h-8"></i>
                </button>
            </header>
            
            <div class="flex-1 overflow-y-auto p-10 grid grid-cols-12 gap-10">
                <!-- Colonne Gauche -->
                <div class="col-span-12 lg:col-span-7 space-y-8">
                    <div>
                        <label class="block text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Titre de la leçon</label>
                        <input type="text" value="${lesson.title}" oninput="updateLessonDetail(${lesson.id}, 'title', this.value)" 
                               class="w-full text-2xl font-bold bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label class="block text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Notes de cours (Contenu texte)</label>
                        <textarea oninput="updateLessonDetail(${lesson.id}, 'content', this.value)" rows="8"
                                  class="w-full text-lg bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                  placeholder="Entrez le texte pédagogique ici...">${lesson.content}</textarea>
                    </div>
                </div>

                <!-- Colonne Droite -->
                <div class="col-span-12 lg:col-span-5 space-y-8">
                    <div class="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100">
                        <div class="flex items-center justify-between mb-6">
                            <span class="font-black text-slate-700 flex items-center gap-2">
                                <i data-lucide="${lesson.status === 'locked' ? 'lock' : 'unlock'}" class="w-5 h-5"></i> État d'accès
                            </span>
                            <label class="switch">
                                <input type="checkbox" ${lesson.status !== 'locked' ? 'checked' : ''} 
                                       onchange="updateLessonDetail(${lesson.id}, 'status', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p class="text-xs text-slate-400 font-bold uppercase italic">${lesson.status === 'locked' ? 'Leçon verrouillée pour les élèves' : 'Leçon disponible immédiatement'}</p>
                    </div>

                    <div class="bg-indigo-50 p-8 rounded-3xl border-2 border-indigo-100">
                        <label class="block text-sm font-black text-indigo-900 uppercase mb-3 flex items-center gap-2">
                            <i data-lucide="video" class="w-4 h-4"></i> ID Vidéo Wistia
                        </label>
                        <input type="text" value="${lesson.wistiaId || ''}" oninput="updateLessonDetail(${lesson.id}, 'wistiaId', this.value)"
                               class="w-full bg-white border-2 border-indigo-200 p-4 rounded-xl font-mono text-indigo-700 focus:border-indigo-500 outline-none" 
                               placeholder="ex: 30q789" />
                        <p class="mt-2 text-[10px] text-indigo-400 font-bold italic">L'embed se mettra à jour automatiquement dans le cursus.</p>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <label class="text-sm font-black uppercase tracking-widest text-slate-400">Documents joints</label>
                            <button onclick="addFileToLesson(${lesson.id})" class="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg font-black">+ Ajouter</button>
                        </div>
                        <div class="space-y-2">
                            ${lesson.files.length === 0 ? '<p class="text-slate-300 italic text-sm">Aucun fichier joint</p>' : ''}
                            ${lesson.files.map(f => `
                                <div class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <span class="text-sm font-bold truncate pr-4">${f.name}</span>
                                    <button onclick="removeFileFromLesson(${lesson.id}, '${f.name}')" class="text-red-400 hover:text-red-600"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <footer class="p-8 border-t bg-slate-50 text-right">
                <button onclick="closeLessonEditor()" class="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">
                    Enregistrer les modifications
                </button>
            </footer>
        </div>
    </div>
  `;
}

function renderAdmin() {
  return `
    <div class="h-full bg-white p-12 bg-admin fade-in overflow-y-auto pb-40">
      <header class="flex justify-between items-center mb-12 bg-white/80 backdrop-blur p-6 rounded-3xl border border-slate-100 sticky top-0 z-20 shadow-sm">
        <div>
           <h1 class="text-4xl font-black text-slate-900 mb-2 font-mono">PANNEAU FORMATEUR</h1>
           <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Structurer votre contenu Elite</p>
        </div>
        <button onclick="addChapter()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg transition-all active:scale-95">
            <i data-lucide="folder-plus"></i> Créer un Chapitre
        </button>
      </header>
      
      <div class="grid grid-cols-1 gap-12 max-w-5xl mx-auto">
        ${state.modules.map(mod => `
          <div class="bg-white border-2 border-slate-200 p-10 rounded-[3rem] shadow-xl hover:border-indigo-100 transition-all">
             <div class="flex justify-between items-center mb-10 pb-6 border-b-2 border-slate-50">
                <div class="flex items-center gap-6 flex-1">
                   <div class="w-12 h-12 bg-slate-100 flex items-center justify-center rounded-2xl text-slate-400"><i data-lucide="layers"></i></div>
                   <input type="text" 
                          onchange="updateChapterTitle(${mod.id}, this.value)" 
                          value="${mod.title}" 
                          class="text-3xl font-black bg-transparent border-b-2 border-transparent focus:border-indigo-500 outline-none flex-1 py-2" />
                </div>
                <button onclick="deleteChapter(${mod.id})" class="text-slate-300 hover:text-red-500 p-4 rounded-2xl transition-all"><i data-lucide="trash-2" class="w-8 h-8"></i></button>
             </div>
             
             <div class="space-y-4 pl-12">
                ${mod.lessons.map(l => `
                  <div class="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-indigo-400 hover:bg-white transition-all group">
                    <div class="flex items-center gap-6">
                        <i data-lucide="${l.status === 'locked' ? 'lock' : 'check'}" class="w-6 h-6 ${l.status === 'locked' ? 'text-slate-300' : 'text-indigo-500'}"></i>
                        <div>
                            <span class="font-black text-slate-800 text-xl block">${l.title}</span>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">${l.type} • ${l.duration}</span>
                        </div>
                    </div>
                    <button onclick="openLessonEditor(${l.id})" class="bg-white border-2 border-slate-200 px-6 py-3 rounded-xl text-slate-600 font-black hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                        ÉDITER <i data-lucide="edit-3" class="inline w-4 h-4 ml-2"></i>
                    </button>
                  </div>
                `).join('')}
                
                <button onclick="addLessonToChapter(${mod.id})" class="w-full py-6 border-4 border-dashed border-slate-100 rounded-3xl text-slate-300 hover:border-indigo-300 hover:text-indigo-600 font-black transition-all flex items-center justify-center gap-4 text-xl mt-6">
                    <i data-lucide="plus-square"></i> Nouvelle leçon dans ce chapitre
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
      <aside class="w-[340px] h-full flex flex-col bg-slate-950 border-r border-white/5 overflow-y-auto custom-scrollbar">
         <div class="p-6 border-b border-white/10 flex items-center gap-3">
            <i data-lucide="layout-list" class="text-orange-500 w-5 h-5"></i>
            <span class="text-white font-black uppercase text-xs tracking-widest">Ma progression</span>
         </div>
         ${renderSidebar()}
      </aside>

      <div class="flex-1 flex flex-col relative">
        <div class="flex-1 p-10 flex flex-col">
          <div class="flex-1 flex items-center justify-center">
            ${currentLesson.hasVideo ? `
              <div class="w-full max-w-5xl aspect-video video-frame bg-black">
                ${currentLesson.wistiaId ? `
                  <iframe src="https://fast.wistia.net/embed/iframe/${currentLesson.wistiaId}?videoFoam=true" 
                          title="Wistia video player" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" 
                          name="wistia_embed" allowfullscreen width="100%" height="100%"></iframe>
                ` : `
                  <div class="w-full h-full flex flex-col items-center justify-center text-slate-600">
                    <i data-lucide="video-off" class="w-20 h-20 mb-4 opacity-20"></i>
                    <p class="font-black uppercase tracking-widest">Aucune vidéo configurée</p>
                  </div>
                `}
              </div>
            ` : `
              <div class="bg-white rounded-[3rem] p-16 shadow-2xl max-w-2xl w-full text-center fade-in">
                 <div class="w-24 h-24 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                    <i data-lucide="file-text" class="w-12 h-12"></i>
                 </div>
                 <h2 class="text-4xl font-black text-slate-900 mb-6">Support de cours</h2>
                 <p class="text-2xl text-slate-600 leading-relaxed mb-12">${currentLesson.subtitle}</p>
                 <button onclick="toggleNotes()" class="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl">Ouvrir le manuel complet</button>
              </div>
            `}
          </div>
        </div>

        <footer class="bg-white p-8 px-12 border-t border-slate-200 shadow-sticky-footer flex items-center justify-between z-30">
           <div class="max-w-[50%]">
             <h3 class="text-3xl font-black text-slate-900 truncate leading-none mb-2">${currentLesson.title}</h3>
             <p class="text-slate-400 font-bold italic text-lg">${currentLesson.subtitle}</p>
           </div>
           <div class="flex items-center gap-6">
             <button onclick="toggleNotes()" class="flex items-center gap-3 bg-white border-[3px] border-slate-200 hover:border-slate-400 text-slate-800 px-8 py-4 rounded-2xl font-black transition-all">
                <i data-lucide="book-open" class="w-6 h-6 text-blue-600"></i> Lire le cours
             </button>
             <button class="bg-[#F97316] hover:bg-orange-600 text-white px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all flex items-center gap-3">
                Continuer <i data-lucide="chevron-right" class="w-7 h-7"></i>
             </button>
           </div>
        </footer>

        <!-- Notes Drawer (Affichage) -->
        <div id="notes-drawer" class="fixed top-0 right-0 h-full w-[45%] min-w-[500px] bg-white shadow-2xl z-[150] transform transition-transform duration-500 ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-slate-100 flex flex-col">
           <div class="p-8 border-b flex items-center justify-between bg-slate-50 sticky top-0">
              <h3 class="text-2xl font-black text-slate-900 flex items-center gap-4"><i data-lucide="graduation-cap" class="text-orange-500 w-8 h-8"></i> Contenu pédagogique</h3>
              <button onclick="toggleNotes()" class="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-200"><i data-lucide="x" class="w-8 h-8"></i></button>
           </div>
           <div class="flex-1 overflow-y-auto p-12 prose prose-slate max-w-none">
              <h1 class="text-4xl font-black text-slate-900 mb-10 border-b-4 border-orange-500 pb-4 inline-block">${currentLesson.title}</h1>
              <div class="text-2xl text-slate-700 leading-relaxed mb-12 whitespace-pre-wrap">${currentLesson.content || "Aucune note n'a été rédigée pour cette leçon."}</div>
              
              ${currentLesson.files.length > 0 ? `
                <div class="mt-16 p-10 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                    <h4 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><i data-lucide="paperclip" class="text-indigo-500"></i> Fichiers à télécharger</h4>
                    <div class="space-y-4">
                        ${currentLesson.files.map(f => `
                            <a href="${f.url}" class="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group">
                                <span class="font-bold text-slate-700">${f.name}</span>
                                <i data-lucide="download" class="w-5 h-5 text-slate-300 group-hover:text-indigo-500"></i>
                            </a>
                        `).join('')}
                    </div>
                </div>
              ` : ''}
           </div>
        </div>
        ${state.isNotesOpen ? `<div onclick="toggleNotes()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[140] fade-in"></div>` : ''}
      </div>
    </div>
  `;
}

function renderDashboard() {
  return `
    <div class="h-full overflow-y-auto p-12 bg-slate-50 fade-in">
      <header class="mb-14">
        <h1 class="text-6xl font-black text-slate-900 mb-3 tracking-tight">Ravi de vous revoir, ${state.user.name}</h1>
        <p class="text-2xl text-slate-400 font-medium">Votre guitare n'attend que vous pour sonner.</p>
      </header>
      <div class="grid grid-cols-12 gap-8">
        <div class="col-span-8 bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 flex items-center gap-12 relative overflow-hidden group">
          <div class="z-10 flex-1">
            <span class="bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full text-sm font-black uppercase mb-8 inline-block tracking-widest">Leçon en cours</span>
            <h2 class="text-5xl font-black text-slate-900 mb-6 leading-tight">Accorder sa guitare <br/><span class="text-slate-300">Chapitre 1</span></h2>
            <button onclick="setView('classroom')" class="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-4 transition-all hover:scale-105 shadow-xl">
              <i data-lucide="play" class="fill-current w-6 h-6"></i> Reprendre le cours
            </button>
          </div>
          <div class="w-72 h-72 bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-700 ring-8 ring-slate-50">
             <img src="https://picsum.photos/seed/guitar/500/500" class="w-full h-full object-cover" />
          </div>
        </div>
        <div class="col-span-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[3rem] p-12 text-white shadow-2xl flex flex-col justify-between">
          <div class="flex justify-between items-start">
             <i data-lucide="flame" class="w-16 h-16 opacity-30"></i>
             <span class="text-6xl font-black">${state.user.progression}%</span>
          </div>
          <div>
            <p class="text-2xl font-black opacity-90">Progression</p>
            <div class="w-full bg-white/30 h-4 rounded-full mt-6 overflow-hidden backdrop-blur-sm">
              <div class="bg-white h-full" style="width: ${state.user.progression}%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProfile() {
  return `
    <div class="h-full flex items-center justify-center bg-slate-50 p-12 fade-in">
       <div class="bg-white rounded-[4rem] shadow-2xl p-20 max-w-3xl w-full text-center border border-slate-100">
          <div class="relative w-48 h-48 mx-auto mb-10">
              <img src="${state.user.avatar}" class="w-full h-full rounded-full border-[12px] border-orange-500 shadow-2xl" />
              <div class="absolute -right-2 bottom-4 w-14 h-14 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg"><i data-lucide="check" class="w-8 h-8"></i></div>
          </div>
          <h2 class="text-5xl font-black text-slate-900 mb-3">${state.user.name}</h2>
          <p class="text-2xl text-slate-400 font-bold mb-14 tracking-wide uppercase">Élève Privilège GIA</p>
          <button onclick="setView('dashboard')" class="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95">Retourner travailler la guitare</button>
       </div>
    </div>
  `;
}

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
      <nav class="w-28 bg-white border-r border-slate-200 flex flex-col items-center py-12 z-50 shadow-2xl">
        <div class="mb-16 w-16 h-16 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center shadow-2xl hover:rotate-12 transition-transform cursor-pointer">
          <i data-lucide="music-4" class="w-10 h-10 text-orange-500"></i>
        </div>
        <div class="flex-1 w-full flex flex-col items-center gap-12">
           <button onclick="setView('dashboard')" class="group flex flex-col items-center gap-2 transition-all ${state.currentView === 'dashboard' ? 'text-orange-600' : 'text-slate-300 hover:text-slate-600'}">
              <i data-lucide="layout-grid" class="w-10 h-10"></i>
              <span class="text-[10px] font-black uppercase tracking-[0.2em]">Accueil</span>
           </button>
           <button onclick="setView('classroom')" class="group flex flex-col items-center gap-2 transition-all ${state.currentView === 'classroom' ? 'text-orange-600' : 'text-slate-300 hover:text-slate-600'}">
              <i data-lucide="graduation-cap" class="w-10 h-10"></i>
              <span class="text-[10px] font-black uppercase tracking-[0.2em]">Cours</span>
           </button>
           <button onclick="setView('profile')" class="group flex flex-col items-center gap-2 transition-all ${state.currentView === 'profile' ? 'text-orange-600' : 'text-slate-300 hover:text-slate-600'}">
              <i data-lucide="user" class="w-10 h-10"></i>
              <span class="text-[10px] font-black uppercase tracking-[0.2em]">Profil</span>
           </button>
        </div>
        <button onclick="setView('admin')" class="mt-auto p-5 rounded-2xl ${state.currentView === 'admin' ? 'bg-indigo-600 text-white btn-admin-active' : 'text-slate-200 hover:bg-slate-50 hover:text-slate-400'} transition-all">
           <i data-lucide="shield-check" class="w-10 h-10"></i>
        </button>
      </nav>
      <main class="flex-1 overflow-hidden relative bg-slate-50 shadow-inner">${content}</main>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
} else {
    render();
}
