
/**
 * GIA V4.0 - SYSTEM EDITION
 * Feature: Multi-User Auth, Role Management, Student Tracking
 */

// --- MOCK DATABASE & STATE ---

const DEFAULT_DB = {
  version: 4.0,
  currentUser: null, // null = logged out
  users: [
    {
      id: 1,
      name: "Formateur (Admin)",
      email: "admin@gia.com",
      password: "admin", // Pour démo
      role: 'admin',
      avatar: "https://i.pravatar.cc/150?u=admin",
      progression: 100
    },
    {
      id: 2,
      name: "Jean-Pierre (Élève)",
      email: "eleve@gia.com",
      password: "123",
      role: 'student',
      avatar: "https://i.pravatar.cc/150?u=jp",
      progression: 15,
      points: 450
    }
  ],
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
          validationRequired: false,
          content: "Dans cette leçon, nous allons aborder la posture idéale pour éviter les douleurs lombaires...",
          files: [{ name: "Guide_Posture.pdf", url: "#" }]
        },
        { 
            id: 102, 
            title: "Premier Accord (Test)", 
            subtitle: "Validation des acquis", 
            duration: "5m", 
            type: 'practice', 
            status: 'locked', 
            hasVideo: false, 
            wistiaId: '',
            validationRequired: true,
            content: "Envoyez une vidéo de votre premier accord.",
            files: []
        }
      ]
    }
  ],
  activeLessonId: 101,
  currentView: 'login', // Default view is login
  expandedModules: [1],
  isNotesOpen: false,
  editingLessonId: null,
};

// --- CORE ENGINE ---

// Charge ou initialise la "Base de données"
let state = JSON.parse(localStorage.getItem('gia_state')) || DEFAULT_DB;

// Migration si version ancienne
if (!state.version || state.version < 4.0) {
    console.log("Migration V4.0...");
    // On conserve les modules existants mais on restructure les users
    const oldModules = state.modules || DEFAULT_DB.modules;
    state = { ...DEFAULT_DB, modules: oldModules };
}

const saveState = () => {
  localStorage.setItem('gia_state', JSON.stringify(state));
};

// Helper pour récupérer l'utilisateur connecté
const getCurrentUser = () => state.users.find(u => u.id === state.currentUser);

// --- AUTH ACTIONS ---

window.login = (email, password) => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
        state.currentUser = user.id;
        state.currentView = 'dashboard';
        saveState();
        render();
    } else {
        alert("Email ou mot de passe incorrect.\n(Essai Admin: admin@gia.com / admin)\n(Essai Élève: eleve@gia.com / 123)");
    }
};

window.logout = () => {
    state.currentUser = null;
    state.currentView = 'login';
    saveState();
    render();
};

window.createUser = (name, email, password) => {
    if(!name || !email || !password) return alert("Tous les champs sont requis");
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: 'student',
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
        progression: 0,
        points: 0
    };
    
    state.users.push(newUser);
    saveState();
    render(); // Re-render admin view
    // Close modal logic handled in render via re-render
};

window.deleteUser = (id) => {
    if(confirm("Supprimer cet élève définitivement ?")) {
        state.users = state.users.filter(u => u.id !== id);
        saveState();
        render();
    }
};

// --- GLOBAL ACTIONS ---

window.setView = (view) => {
  state.currentView = view;
  state.editingLessonId = null;
  state.isNotesOpen = false;
  saveState();
  render();
};

window.setActiveLesson = (id) => {
  state.activeLessonId = id;
  state.currentView = 'classroom';
  saveState();
  render();
};

window.toggleNotes = () => {
  state.isNotesOpen = !state.isNotesOpen;
  saveState();
  render();
};

window.toggleModule = (id) => {
  if(state.expandedModules.includes(id)) state.expandedModules = state.expandedModules.filter(m => m !== id);
  else state.expandedModules.push(id);
  saveState();
  render();
};

// --- ADMIN ACTIONS ---
// (Identiques à avant, mais protégées par la vue)

window.updateLessonTitle = (id, value) => { const l = findLesson(id); if(l) { l.title = value; saveState(); } };
window.updateLessonContent = (id, value) => { const l = findLesson(id); if(l) { l.content = value; saveState(); } };
window.updateLessonWistia = (id, value) => { const l = findLesson(id); if(l) { l.wistiaId = value; saveState(); } };
window.updateChapterTitle = (id, value) => { const m = state.modules.find(m => m.id === id); if(m) { m.title = value; saveState(); } };
window.toggleLessonLock = (id, isChecked) => { const l = findLesson(id); if(l) { l.status = isChecked ? 'locked' : 'active'; saveState(); render(); } };
window.toggleLessonValidation = (id, isChecked) => { const l = findLesson(id); if(l) { l.validationRequired = isChecked; saveState(); render(); } };

window.addChapter = () => {
  const newId = Date.now();
  state.modules.push({ id: newId, title: "Nouveau Chapitre", lessons: [] });
  saveState();
  render();
};

window.deleteChapter = (id) => {
  if(confirm("Supprimer définitivement ce chapitre ?")) {
    state.modules = state.modules.filter(m => m.id !== id);
    saveState();
    render();
  }
};

window.addLesson = (chapterId) => {
  const mod = state.modules.find(m => m.id === chapterId);
  if(mod) {
    mod.lessons.push({
      id: Date.now(),
      title: "Nouvelle leçon",
      subtitle: "À configurer",
      duration: "5m",
      type: 'video',
      status: 'locked',
      hasVideo: true,
      wistiaId: '',
      validationRequired: false,
      content: '',
      files: []
    });
    saveState();
    render();
  }
};

window.addFile = (lessonId) => {
    const name = prompt("Nom du fichier :");
    if(name) { const l = findLesson(lessonId); if(l) { l.files.push({name, url:'#'}); saveState(); render(); } }
};
window.removeFile = (lessonId, fileName) => {
    const l = findLesson(lessonId); if(l) { l.files = l.files.filter(f => f.name !== fileName); saveState(); render(); }
};

window.openEditor = (id) => { state.editingLessonId = id; render(); };
window.closeEditor = () => { state.editingLessonId = null; render(); };

// Helpers
const findLesson = (id) => state.modules.flatMap(m => m.lessons).find(l => l.id === id);


// --- VIEWS ---

function renderLogin() {
    return `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 fade-in">
        <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-orange-500"></div>
            
            <div class="text-center mb-10">
                <div class="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <i data-lucide="music-4" class="w-8 h-8 text-orange-400"></i>
                </div>
                <h1 class="text-3xl font-black text-slate-900">Bienvenue sur GIA</h1>
                <p class="text-slate-400 font-medium">Connectez-vous à votre espace</p>
            </div>

            <form onsubmit="event.preventDefault(); login(this.email.value, this.password.value);" class="space-y-6">
                <div>
                    <label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Email</label>
                    <input type="email" name="email" required 
                           class="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                           placeholder="votre@email.com" />
                </div>
                <div>
                    <label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Mot de passe</label>
                    <input type="password" name="password" required 
                           class="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                           placeholder="••••••••" />
                </div>
                
                <button type="submit" class="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                    Se connecter <i data-lucide="arrow-right" class="w-5 h-5"></i>
                </button>
            </form>
            
            <div class="mt-8 pt-6 border-t border-slate-100 text-center">
                <p class="text-xs text-slate-400">Pour la démo :<br>Admin: admin@gia.com / admin<br>Élève: eleve@gia.com / 123</p>
            </div>
        </div>
    </div>
    `;
}

function renderStudentManagement() {
    const students = state.users.filter(u => u.role === 'student');
    
    return `
    <div class="h-full bg-admin-grid p-8 lg:p-12 overflow-y-auto fade-in">
        <header class="flex justify-between items-center mb-12 max-w-6xl mx-auto">
            <div>
                <h1 class="text-4xl font-black text-slate-900 mb-2">Mes Apprentis</h1>
                <p class="text-slate-500 font-bold uppercase tracking-widest">Suivi et gestion des comptes</p>
            </div>
            <!-- Add Student Trigger -->
            <button onclick="document.getElementById('add-student-modal').classList.remove('hidden')" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
                <i data-lucide="user-plus" class="w-5 h-5"></i> Ajouter
            </button>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            ${students.map(student => `
                <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group">
                    <div class="flex items-center gap-4 mb-6">
                        <img src="${student.avatar}" class="w-16 h-16 rounded-2xl border-2 border-slate-50" />
                        <div>
                            <h3 class="text-xl font-black text-slate-900 leading-tight">${student.name}</h3>
                            <p class="text-xs text-slate-400 font-mono">${student.email}</p>
                        </div>
                    </div>
                    
                    <div class="space-y-4 mb-6">
                        <div>
                            <div class="flex justify-between text-xs font-bold uppercase text-slate-400 mb-1">
                                <span>Progression</span>
                                <span>${student.progression}%</span>
                            </div>
                            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div class="bg-indigo-500 h-full rounded-full" style="width: ${student.progression}%"></div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span class="text-xs font-bold text-slate-500 uppercase">Points XP</span>
                            <span class="font-black text-orange-500 flex items-center gap-1">
                                <i data-lucide="award" class="w-4 h-4"></i> ${student.points}
                            </span>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <button onclick="alert('Fonctionnalité message à venir')" class="flex-1 py-2 rounded-lg border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 text-sm">Contacter</button>
                        <button onclick="deleteUser(${student.id})" class="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                    </div>
                </div>
            `).join('')}
            
            ${students.length === 0 ? `<div class="col-span-full text-center py-20 text-slate-400 font-bold">Aucun apprenti pour le moment.</div>` : ''}
        </div>

        <!-- Modal Ajout Élève -->
        <div id="add-student-modal" class="hidden fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onclick="this.parentElement.classList.add('hidden')"></div>
            <div class="bg-white w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl">
                <h3 class="text-2xl font-black text-slate-900 mb-6">Nouvel Apprenti</h3>
                <form onsubmit="event.preventDefault(); createUser(this.name.value, this.email.value, this.password.value);" class="space-y-4">
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-400">Nom complet</label>
                        <input name="name" type="text" required class="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-400">Email</label>
                        <input name="email" type="email" required class="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-400">Mot de passe provisoire</label>
                        <input name="password" type="text" required class="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                    </div>
                    <button class="w-full bg-indigo-600 text-white py-3 rounded-xl font-black mt-4 shadow-lg hover:bg-indigo-700">Créer le compte</button>
                </form>
                <button onclick="document.getElementById('add-student-modal').classList.add('hidden')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><i data-lucide="x"></i></button>
            </div>
        </div>
    </div>
    `;
}

// --- STANDARD VIEWS (Updates with currentUser data) ---

function renderDashboard() {
  const user = getCurrentUser();
  return `
    <div class="h-full overflow-y-auto p-8 lg:p-12 bg-slate-50 fade-in">
        <header class="mb-12 flex justify-between items-start">
            <div>
                <h1 class="text-4xl lg:text-6xl font-black text-slate-900 mb-4">Bonjour ${user.name.split(' ')[0]}</h1>
                <p class="text-xl text-slate-500">Prêt à faire sonner votre guitare aujourd'hui ?</p>
            </div>
            ${user.role === 'admin' ? '<span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-200">Mode Formateur</span>' : ''}
        </header>
        
        <div class="grid grid-cols-12 gap-8">
            <!-- Hero Card -->
            <div class="col-span-12 lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-premium border border-slate-100 relative overflow-hidden group cursor-pointer" onclick="setView('classroom')">
                <div class="relative z-10 max-w-lg">
                    <span class="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest mb-6 inline-block">Reprendre</span>
                    <h2 class="text-4xl font-black text-slate-900 mb-6 leading-tight">Accorder sa guitare</h2>
                    <p class="text-slate-500 text-lg mb-8 font-medium">Vous aviez commencé le Chapitre 1. C'est le moment idéal pour valider cette étape.</p>
                    <button class="bg-slate-900 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:gap-5 transition-all shadow-xl">
                        Continuer <i data-lucide="arrow-right"></i>
                    </button>
                </div>
                <img src="https://picsum.photos/seed/guitar/600/400" class="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 mask-image-gradient group-hover:scale-105 transition-transform duration-700" style="mask-image: linear-gradient(to right, transparent, black);" />
            </div>

            <!-- Stats -->
            <div class="col-span-12 lg:col-span-4 bg-orange-500 p-10 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-4">
                         <div class="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><i data-lucide="activity" class="w-8 h-8 text-white"></i></div>
                         <span class="text-5xl font-black">${user.progression}%</span>
                    </div>
                    <p class="text-orange-100 font-bold text-lg">Progression Globale</p>
                </div>
                <div class="relative z-10 mt-8">
                    <div class="w-full bg-black/20 h-3 rounded-full overflow-hidden">
                        <div class="bg-white h-full rounded-full" style="width: ${user.progression}%"></div>
                    </div>
                </div>
                <i data-lucide="award" class="absolute -bottom-6 -right-6 w-40 h-40 text-orange-400 opacity-50 rotate-12"></i>
            </div>
        </div>
    </div>
  `;
}

function renderClassroom() {
  const currentLesson = findLesson(state.activeLessonId);
  if(!currentLesson) { state.activeLessonId = state.modules[0]?.lessons[0]?.id; render(); return ''; }
  
  // Is Admin ?
  const isAdmin = getCurrentUser()?.role === 'admin';

  return `
    <div class="flex h-full bg-slate-900">
        <!-- Sidebar -->
        <aside class="w-[340px] bg-slate-950 border-r border-white/5 flex flex-col hidden lg:flex">
            <div class="p-8 border-b border-white/10">
                <h2 class="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">Programme</h2>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar p-3">
                ${state.modules.map(mod => `
                    <div class="mb-6">
                        <button onclick="toggleModule(${mod.id})" class="w-full px-2 py-2 flex items-center justify-between text-slate-500 hover:text-white group">
                            <span class="text-[10px] font-black uppercase tracking-widest group-hover:text-orange-400 transition-colors">${mod.title}</span>
                            <i data-lucide="${state.expandedModules.includes(mod.id) ? 'chevron-up' : 'chevron-down'}" class="w-3 h-3"></i>
                        </button>
                        ${state.expandedModules.includes(mod.id) ? `
                            <div class="space-y-1 mt-1">
                                ${mod.lessons.map(l => {
                                    const isActive = l.id === state.activeLessonId;
                                    const isLocked = l.status === 'locked' && !isAdmin; // Admin voit tout unlocked
                                    return `
                                        <div onclick="${isLocked ? '' : `setActiveLesson(${l.id})`}" class="p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'hover:bg-white/5 text-slate-500'} ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}">
                                            <i data-lucide="${isLocked ? 'lock' : (isActive ? 'play' : 'circle')}" class="w-4 h-4 ${isActive ? 'fill-current' : ''} flex-shrink-0"></i>
                                            <span class="text-sm font-bold leading-tight flex-1">${l.title}</span>
                                            ${l.validationRequired ? '<span title="Validation requise" class="text-lg filter drop-shadow-sm">🎯</span>' : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </aside>

        <!-- Player Area -->
        <div class="flex-1 flex flex-col relative h-full overflow-hidden">
            <div class="flex-1 bg-slate-900 overflow-y-auto custom-scrollbar relative">
                <!-- Wrapper centré -->
                <div class="min-h-full flex flex-col items-center justify-center p-8 lg:p-16">
                    <div class="w-full max-w-5xl">
                       <div class="aspect-video video-frame mb-8 shadow-2xl">
                            ${currentLesson.wistiaId ? `
                                <iframe src="https://fast.wistia.net/embed/iframe/${currentLesson.wistiaId}?videoFoam=true" 
                                        title="Wistia video player" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" 
                                        name="wistia_embed" allowfullscreen width="100%" height="100%"></iframe>
                            ` : `
                                <div class="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-500">
                                    <i data-lucide="video-off" class="w-16 h-16 mb-4 opacity-20"></i>
                                    <span class="text-xs font-black uppercase tracking-widest">Contenu vidéo non disponible</span>
                                </div>
                            `}
                       </div>
                       
                       <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 text-white pb-10">
                           <div>
                               <div class="flex items-center gap-3 mb-2">
                                   <h1 class="text-3xl font-black">${currentLesson.title}</h1>
                                   ${currentLesson.validationRequired ? '<span title="Validation requise" class="text-2xl filter drop-shadow-md">🎯</span>' : ''}
                               </div>
                               <p class="text-slate-400 text-lg">${currentLesson.subtitle}</p>
                           </div>
                           <div class="flex items-center gap-4">
                               <button onclick="toggleNotes()" class="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                                   <i data-lucide="book" class="w-5 h-5"></i> Notes
                               </button>
                               
                               ${currentLesson.validationRequired ? `
                                   <button onclick="window.open('https://wa.me/?text=Bonjour,%20je%20souhaite%20valider%20la%20leçon%20${encodeURIComponent(currentLesson.title)}', '_blank')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 hover:scale-105">
                                       <i data-lucide="message-circle" class="w-5 h-5"></i> Valider par WhatsApp
                                   </button>
                               ` : `
                                   <button class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-orange-900/20 transition-all">
                                       SUIVANT
                                   </button>
                               `}
                           </div>
                       </div>
                    </div>
                </div>
            </div>
            
            <!-- Notes Drawer -->
            <div class="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-[80] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col">
                <div class="p-6 border-b flex justify-between items-center bg-slate-50">
                    <h3 class="text-xl font-black text-slate-900 flex items-center gap-2"><i data-lucide="book-open" class="text-orange-500"></i> Notes de cours</h3>
                    <button onclick="toggleNotes()" class="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
                <div class="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
                    <h2 class="text-3xl font-black mb-6 flex items-center gap-3">
                        ${currentLesson.title}
                        ${currentLesson.validationRequired ? '🎯' : ''}
                    </h2>
                    <div class="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap mb-10">${currentLesson.content || "Aucune note disponible."}</div>
                    
                    ${currentLesson.files.length > 0 ? `
                        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 not-prose">
                            <h4 class="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Téléchargements</h4>
                            <div class="space-y-3">
                                ${currentLesson.files.map(f => `
                                    <a href="#" class="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group">
                                        <div class="flex items-center gap-3">
                                            <i data-lucide="file-text" class="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors"></i>
                                            <span class="font-bold text-slate-700">${f.name}</span>
                                        </div>
                                        <i data-lucide="download-cloud" class="w-5 h-5 text-slate-300"></i>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            ${state.isNotesOpen ? `<div onclick="toggleNotes()" class="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[70] fade-in"></div>` : ''}
        </div>
    </div>
  `;
}

// Les fonctions renderLessonEditor et renderAdmin restent identiques, mais Admin est accessible uniquement aux admins

function renderLessonEditor() {
  const lesson = findLesson(state.editingLessonId);
  if (!lesson) return '';

  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 fade-in">
        <div class="absolute inset-0 modal-overlay" onclick="closeEditor()"></div>
        <div class="bg-white w-full max-w-6xl h-full max-h-[95vh] rounded-[2.5rem] shadow-2xl z-10 flex flex-col overflow-hidden">
            <!-- Header -->
            <header class="px-8 py-6 border-b bg-slate-50 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <i data-lucide="edit-3" class="w-6 h-6 text-indigo-600"></i> Édition
                    </h2>
                    <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Leçon ID: ${lesson.id}</p>
                </div>
                <button onclick="closeEditor()" class="p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                    <i data-lucide="x" class="w-8 h-8"></i>
                </button>
            </header>
            
            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-8 lg:p-10 grid grid-cols-12 gap-10 bg-white">
                <!-- Main Content -->
                <div class="col-span-12 lg:col-span-7 space-y-8">
                    <div class="group">
                        <label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Titre de la leçon</label>
                        <input type="text" 
                               value="${lesson.title}" 
                               oninput="updateLessonTitle(${lesson.id}, this.value)" 
                               class="w-full text-2xl font-bold bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                               placeholder="Titre de la leçon..." />
                    </div>
                    <div class="group h-full flex flex-col">
                        <label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Contenu Pédagogique</label>
                        <textarea oninput="updateLessonContent(${lesson.id}, this.value)" 
                                  class="w-full flex-1 min-h-[300px] text-lg bg-slate-50 border-2 border-slate-100 p-6 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                                  placeholder="Rédigez le cours ici...">${lesson.content || ''}</textarea>
                    </div>
                </div>

                <!-- Settings Sidebar -->
                <div class="col-span-12 lg:col-span-5 space-y-6">
                    <!-- Status Card -->
                    <div class="p-6 rounded-2xl border-4 ${lesson.status === 'locked' ? 'border-slate-100 bg-slate-50' : 'border-emerald-100 bg-emerald-50/50'} transition-colors">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <div class="p-3 rounded-xl ${lesson.status === 'locked' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-200 text-emerald-700'}">
                                    <i data-lucide="${lesson.status === 'locked' ? 'lock' : 'unlock'}" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="font-black text-slate-900">Accès Élève</h3>
                                    <p class="text-xs font-bold ${lesson.status === 'locked' ? 'text-slate-400' : 'text-emerald-600'} uppercase">
                                        ${lesson.status === 'locked' ? 'Verrouillé' : 'Ouvert'}
                                    </p>
                                </div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${lesson.status !== 'locked' ? 'checked' : ''} onchange="toggleLessonLock(${lesson.id}, !this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <!-- Validation Config -->
                    <div class="bg-orange-50/50 p-6 rounded-2xl border-4 border-orange-100/50">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="p-3 rounded-xl bg-orange-100 text-orange-600">
                                    <span class="text-2xl leading-none filter drop-shadow-sm">🎯</span>
                                </div>
                                <div>
                                    <h3 class="font-black text-slate-900">Validation Requise</h3>
                                    <p class="text-xs font-bold text-orange-500 uppercase">Devoir à rendre</p>
                                </div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${lesson.validationRequired ? 'checked' : ''} onchange="toggleLessonValidation(${lesson.id}, this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <!-- Video Config -->
                    <div class="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200">
                        <div class="flex items-center gap-2 mb-4 opacity-80">
                            <i data-lucide="video" class="w-4 h-4"></i>
                            <span class="text-xs font-black uppercase tracking-widest">Intégration Vidéo</span>
                        </div>
                        <div class="bg-indigo-800/50 p-4 rounded-xl border border-indigo-400/30">
                            <label class="block text-[10px] uppercase font-bold text-indigo-200 mb-1">ID Wistia</label>
                            <input type="text" 
                                   value="${lesson.wistiaId || ''}" 
                                   oninput="updateLessonWistia(${lesson.id}, this.value)"
                                   class="w-full bg-transparent border-none text-white font-mono text-lg focus:outline-none placeholder:text-indigo-400" 
                                   placeholder="ex: 30q789" />
                        </div>
                    </div>
                    <!-- Files -->
                    <div class="border-t border-slate-100 pt-6">
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-xs font-black uppercase text-slate-400 tracking-widest">Fichiers joints</span>
                            <button onclick="addFile(${lesson.id})" class="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">+ Ajouter</button>
                        </div>
                        <div class="space-y-2">
                            ${lesson.files.map(f => `
                                <div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <div class="flex items-center gap-3 overflow-hidden">
                                        <div class="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <i data-lucide="file" class="w-4 h-4"></i>
                                        </div>
                                        <span class="text-sm font-bold text-slate-700 truncate">${f.name}</span>
                                    </div>
                                    <button onclick="removeFile(${lesson.id}, '${f.name}')" class="text-slate-300 hover:text-red-500 p-1">
                                        <i data-lucide="trash" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            `).join('')}
                            ${lesson.files.length === 0 ? `<p class="text-xs text-slate-300 italic text-center py-2">Aucun fichier</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <!-- Footer -->
            <footer class="p-6 border-t bg-slate-50 flex justify-end">
                <button onclick="closeEditor()" class="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:translate-y-[-2px] transition-all">
                    Enregistrer & Fermer
                </button>
            </footer>
        </div>
    </div>
  `;
}

function renderAdmin() {
  return `
    <div class="h-full bg-admin-grid p-8 lg:p-12 overflow-y-auto pb-40 fade-in">
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 max-w-5xl mx-auto gap-6">
            <div>
                <h1 class="text-4xl lg:text-5xl font-black text-slate-900 mb-2">Contenu du Cours</h1>
                <p class="text-lg text-slate-500 font-bold uppercase tracking-widest">Modifiez la structure</p>
            </div>
            <button onclick="addChapter()" class="bg-indigo-600 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-indigo-200 hover:scale-105 transition-all">
                <i data-lucide="plus-circle" class="w-5 h-5"></i> Nouveau Chapitre
            </button>
        </header>

        <div class="space-y-12 max-w-5xl mx-auto">
            ${state.modules.map(mod => `
                <div class="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-200 shadow-premium group/module">
                    <div class="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                        <div class="flex-1 mr-4">
                             <input type="text" 
                                    value="${mod.title}" 
                                    oninput="updateChapterTitle(${mod.id}, this.value)"
                                    class="w-full text-2xl lg:text-3xl font-black text-slate-900 bg-transparent outline-none focus:text-indigo-600 transition-colors placeholder:text-slate-200"
                                    placeholder="Titre du chapitre..." />
                        </div>
                        <button onclick="deleteChapter(${mod.id})" class="text-slate-200 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all">
                            <i data-lucide="trash-2" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4 pl-0 lg:pl-8 border-l-0 lg:border-l-2 border-slate-100">
                        ${mod.lessons.map(l => `
                            <div class="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group/lesson">
                                <div class="flex items-center gap-5 overflow-hidden">
                                    <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${l.status === 'locked' ? 'bg-slate-200 text-slate-400' : 'bg-emerald-100 text-emerald-600'}">
                                        <i data-lucide="${l.status === 'locked' ? 'lock' : 'check-circle'}" class="w-5 h-5"></i>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <div class="flex items-center gap-2">
                                            <p class="text-lg font-bold text-slate-800 truncate">${l.title}</p>
                                            ${l.validationRequired ? '<span title="Validation requise" class="text-lg filter drop-shadow-sm">🎯</span>' : ''}
                                        </div>
                                        <div class="flex items-center gap-2 mt-1">
                                            <span class="text-[10px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider">${l.type}</span>
                                            <span class="text-[10px] font-bold text-slate-400">${l.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onclick="openEditor(${l.id})" class="bg-white border-2 border-slate-200 px-5 py-2 rounded-xl font-black text-xs text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm whitespace-nowrap">
                                    ÉDITER
                                </button>
                            </div>
                        `).join('')}
                        
                        <button onclick="addLesson(${mod.id})" class="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/10 transition-all flex items-center justify-center gap-2 text-sm mt-4">
                            <i data-lucide="plus" class="w-4 h-4"></i> Ajouter une leçon
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${state.editingLessonId ? renderLessonEditor() : ''}
    </div>
  `;
}

function renderProfile() {
    const user = getCurrentUser();
    return `
    <div class="h-full flex items-center justify-center p-8 bg-slate-50">
        <div class="bg-white p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center">
            <img src="${user.avatar}" class="w-32 h-32 rounded-3xl mx-auto mb-6 shadow-lg" />
            <h2 class="text-3xl font-black text-slate-900 mb-1">${user.name}</h2>
            <p class="text-slate-400 font-bold mb-8">${user.email}</p>
            
            <div class="flex justify-center gap-6 mb-10">
                <div class="bg-orange-50 p-4 rounded-2xl">
                    <span class="block text-2xl font-black text-orange-600">${user.points}</span>
                    <span class="text-xs font-bold uppercase text-orange-400">XP Points</span>
                </div>
                <div class="bg-indigo-50 p-4 rounded-2xl">
                    <span class="block text-2xl font-black text-indigo-600">${user.progression}%</span>
                    <span class="text-xs font-bold uppercase text-indigo-400">Progrès</span>
                </div>
            </div>
            
            <button onclick="logout()" class="w-full py-4 border-2 border-slate-200 text-slate-500 font-black rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2">
                <i data-lucide="log-out" class="w-5 h-5"></i> Se déconnecter
            </button>
        </div>
    </div>`;
}

// --- RENDER ENGINE ---

function render() {
  const root = document.getElementById('root');
  if(!root) return;

  // 1. Guard: Si pas connecté, afficher Login
  if(!state.currentUser) {
      root.innerHTML = renderLogin();
      if (window.lucide) window.lucide.createIcons();
      return;
  }

  const currentUser = getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  // 2. Router
  let content = '';
  switch(state.currentView) {
    case 'dashboard': content = renderDashboard(); break;
    case 'classroom': content = renderClassroom(); break;
    case 'admin': content = isAdmin ? renderAdmin() : renderDashboard(); break; // Protect Admin
    case 'admin-students': content = isAdmin ? renderStudentManagement() : renderDashboard(); break; // New View
    case 'profile': content = renderProfile(); break;
    default: content = renderDashboard();
  }

  // 3. Layout Principal
  root.innerHTML = `
    <div class="flex h-screen bg-slate-50">
        <!-- Main Nav -->
        <nav class="w-24 bg-white border-r border-slate-200 flex flex-col items-center py-10 z-[50] hidden md:flex">
            <div class="mb-16 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-300">
                <i data-lucide="music-4" class="w-7 h-7 text-orange-400"></i>
            </div>
            
            <div class="flex-1 w-full space-y-8 flex flex-col items-center">
                ${navButton('dashboard', 'layout-grid', 'Accueil')}
                ${navButton('classroom', 'graduation-cap', 'Cours')}
                ${navButton('profile', 'user', 'Compte')}
            </div>

            <!-- Admin Nav Section -->
            ${isAdmin ? `
                <div class="w-full px-4 mb-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
                     <button onclick="setView('admin-students')" class="p-3 rounded-xl transition-all ${state.currentView === 'admin-students' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'}" title="Mes élèves">
                        <i data-lucide="users" class="w-6 h-6"></i>
                    </button>
                    <button onclick="setView('admin')" class="p-3 rounded-xl transition-all ${state.currentView === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'}" title="Éditeur">
                        <i data-lucide="edit" class="w-6 h-6"></i>
                    </button>
                </div>
            ` : ''}
        </nav>

        <!-- Mobile Nav -->
        <nav class="md:hidden fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50">
             ${navButtonMobile('dashboard', 'layout-grid')}
             ${navButtonMobile('classroom', 'graduation-cap')}
             ${isAdmin ? navButtonMobile('admin-students', 'users') : ''}
             ${navButtonMobile('profile', 'user')}
        </nav>

        <main class="flex-1 overflow-hidden relative selection:bg-orange-100 selection:text-orange-900">
            ${content}
        </main>
    </div>
  `;

  // Ré-hydratation des icônes
  if (window.lucide) window.lucide.createIcons();
}

// Helpers Render
const navButton = (view, icon, label) => `
    <button onclick="setView('${view}')" class="group flex flex-col items-center gap-1.5 w-full relative">
        <div class="p-3 rounded-xl transition-all ${state.currentView === view ? 'bg-orange-50 text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}">
            <i data-lucide="${icon}" class="w-6 h-6 ${state.currentView === view ? 'stroke-[2.5px]' : ''}"></i>
        </div>
        <span class="text-[10px] font-black uppercase tracking-widest ${state.currentView === view ? 'text-orange-600' : 'text-slate-300 group-hover:text-slate-400'}">${label}</span>
        ${state.currentView === view ? '<div class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-l-full"></div>' : ''}
    </button>
`;

const navButtonMobile = (view, icon) => `
    <button onclick="setView('${view}')" class="${state.currentView === view ? 'text-orange-600' : 'text-slate-400'}">
        <i data-lucide="${icon}"></i>
    </button>
`;

// Init
render();
