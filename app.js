
/**
 * GIA V4.3 - FLUID UI ENGINE
 * Feature: App Shell Architecture, Partial Rendering, CSS Transitions
 */

// --- CONFIGURATION PAR DÉFAUT ---

const DEFAULT_DB = {
  version: 4.2, 
  currentUser: null, 
  users: [
    {
      id: 1,
      name: "Formateur (Admin)",
      email: "admin@gia.com",
      password: "admin", 
      role: 'admin',
      avatar: "https://i.pravatar.cc/150?u=admin",
      progression: 100,
      validatedLessons: [] 
    },
    {
      id: 2,
      name: "Jean-Pierre (Élève)",
      email: "eleve@gia.com",
      password: "123",
      role: 'student',
      avatar: "https://i.pravatar.cc/150?u=jp",
      progression: 0,
      points: 0,
      validatedLessons: [] 
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
          content: "Dans cette leçon, nous allons aborder la posture idéale...",
          files: []
        },
        { 
            id: 102, 
            title: "Premier Accord (Test)", 
            subtitle: "Validation des acquis", 
            duration: "5m", 
            type: 'practice', 
            status: 'active', 
            hasVideo: false, 
            wistiaId: '',
            validationRequired: true,
            content: "Envoyez une vidéo de votre premier accord.",
            files: []
        },
        { 
            id: 103, 
            title: "La Rythmique Feu de Camp", 
            subtitle: "Jouer en rythme", 
            duration: "15m", 
            type: 'video', 
            status: 'active', 
            hasVideo: true, 
            wistiaId: '',
            validationRequired: false,
            content: "Bravo pour votre validation ! Voici la suite...",
            files: []
        }
      ]
    }
  ],
  activeLessonId: 101,
  currentView: 'login',
  expandedModules: [1],
  isNotesOpen: false,
  editingLessonId: null,
};

// --- CORE ENGINE ---

let savedState = null;
try { savedState = JSON.parse(localStorage.getItem('gia_state')); } catch (e) {}

let state;

// Migration V4.2/4.3
if (!savedState || !savedState.version || savedState.version < 4.2) {
    console.log("--- MIGRATION V4.3 ---");
    const baseState = savedState || DEFAULT_DB;
    const updatedUsers = (baseState.users || DEFAULT_DB.users).map(u => ({
        ...u,
        validatedLessons: u.validatedLessons || []
    }));
    state = {
        ...DEFAULT_DB,
        users: updatedUsers,
        modules: DEFAULT_DB.modules
    };
    localStorage.setItem('gia_state', JSON.stringify(state));
} else {
    state = savedState;
}

const saveState = () => {
  localStorage.setItem('gia_state', JSON.stringify(state));
};

const getCurrentUser = () => {
    if(!state.currentUser) return null;
    return state.users.find(u => u.id === state.currentUser);
};

const getAccessibleLessons = (user) => {
    const accessibleIds = new Set();
    if (user.role === 'admin') {
        state.modules.forEach(m => m.lessons.forEach(l => accessibleIds.add(l.id)));
        return accessibleIds;
    }
    let isBlocked = false;
    for (const mod of state.modules) {
        for (const lesson of mod.lessons) {
            if (lesson.status === 'locked') continue; 
            if (!isBlocked) {
                accessibleIds.add(lesson.id);
                if (lesson.validationRequired) {
                    const hasValidated = user.validatedLessons && user.validatedLessons.includes(lesson.id);
                    if (!hasValidated) isBlocked = true;
                }
            }
        }
    }
    return accessibleIds;
};

// --- AUTH ACTIONS ---

window.login = (email, password) => {
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        state.currentUser = user.id;
        state.currentView = 'dashboard';
        saveState();
        // Force full reload for login to establish Shell
        render();
    } else {
        alert("Identifiants incorrects.");
    }
};

window.logout = () => {
    state.currentUser = null;
    state.currentView = 'login';
    saveState();
    // Destroy Shell
    document.getElementById('root').innerHTML = '';
    render();
};

window.createStudent = (name, email, password) => {
    if(!name || !email || !password) return alert("Champs manquants");
    if(state.users.find(u => u.email.toLowerCase() === email.toLowerCase())) return alert("Email pris");
    state.users.push({
        id: Date.now(), name, email, password, role: 'student', avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
        progression: 0, points: 0, validatedLessons: []
    });
    saveState();
    document.getElementById('add-student-modal').classList.add('hidden');
    render(); // Re-render content only
};

window.deleteUser = (id) => {
    if(confirm("Supprimer ?")) { state.users = state.users.filter(u => u.id !== id); saveState(); render(); }
};

window.toggleStudentValidation = (studentId, lessonId, isValidated) => {
    const student = state.users.find(u => u.id === studentId);
    if (!student) return;
    if (!student.validatedLessons) student.validatedLessons = [];
    if (isValidated) {
        if (!student.validatedLessons.includes(lessonId)) {
            student.validatedLessons.push(lessonId);
            student.points = (student.points || 0) + 50; 
            student.progression = Math.min(100, student.progression + 5); 
        }
    } else {
        student.validatedLessons = student.validatedLessons.filter(id => id !== lessonId);
        student.points = Math.max(0, (student.points || 0) - 50);
    }
    saveState();
    render();
};

// --- NAVIGATION & INTERACTION OPTIMISEES ---

window.setView = (view) => { 
    state.currentView = view; 
    state.editingLessonId = null; 
    state.isNotesOpen = false; 
    saveState(); 
    render(); // Partial render
};

window.setActiveLesson = (id) => { 
    state.activeLessonId = id; 
    // Si on est déjà en classroom, on reste, sinon on change
    if (state.currentView !== 'classroom') {
        state.currentView = 'classroom';
    }
    saveState(); 
    render(); 
};

// OPTIMISATION: Manipulation DOM directe pour éviter le scintillement (surtout de la vidéo)
window.toggleNotes = () => {
  state.isNotesOpen = !state.isNotesOpen;
  saveState();
  
  // Update DOM sans re-render
  const drawer = document.getElementById('notes-drawer');
  const backdrop = document.getElementById('notes-backdrop');
  if(drawer && backdrop) {
      if(state.isNotesOpen) {
          drawer.classList.remove('translate-x-full');
          drawer.classList.add('translate-x-0');
          backdrop.classList.remove('hidden', 'opacity-0');
      } else {
          drawer.classList.remove('translate-x-0');
          drawer.classList.add('translate-x-full');
          backdrop.classList.add('opacity-0');
          setTimeout(() => backdrop.classList.add('hidden'), 300);
      }
  } else {
      render(); // Fallback
  }
};

window.toggleModule = (id) => {
  if(state.expandedModules.includes(id)) state.expandedModules = state.expandedModules.filter(m => m !== id);
  else state.expandedModules.push(id);
  saveState(); 
  render(); // Necessite re-render sidebar
};

// --- ADMIN EDITOR ---
window.updateLessonTitle = (id, value) => { const l = findLesson(id); if(l) { l.title = value; saveState(); } };
window.updateLessonContent = (id, value) => { const l = findLesson(id); if(l) { l.content = value; saveState(); } };
window.updateLessonWistia = (id, value) => { const l = findLesson(id); if(l) { l.wistiaId = value; saveState(); } };
window.updateChapterTitle = (id, value) => { const m = state.modules.find(m => m.id === id); if(m) { m.title = value; saveState(); } };
window.toggleLessonLock = (id, isChecked) => { const l = findLesson(id); if(l) { l.status = isChecked ? 'locked' : 'active'; saveState(); render(); } }; 
window.toggleLessonValidation = (id, isChecked) => { const l = findLesson(id); if(l) { l.validationRequired = isChecked; saveState(); render(); } };

window.addChapter = () => { state.modules.push({ id: Date.now(), title: "Nouveau Chapitre", lessons: [] }); saveState(); render(); };
window.deleteChapter = (id) => { if(confirm("Supprimer ?")) { state.modules = state.modules.filter(m => m.id !== id); saveState(); render(); } };
window.addLesson = (cId) => { const m = state.modules.find(mod => mod.id === cId); if(m) { m.lessons.push({ id: Date.now(), title: "Leçon", subtitle: "...", duration: "5m", type: 'video', status: 'locked', hasVideo: true, wistiaId: '', validationRequired: false, content: '', files: [] }); saveState(); render(); } };
window.addFile = (lId) => { const n = prompt("Nom:"); if(n) { const l = findLesson(lId); if(l) { l.files.push({name:n, url:'#'}); saveState(); render(); } } };
window.removeFile = (lId, fN) => { const l = findLesson(lId); if(l) { l.files = l.files.filter(f => f.name !== fN); saveState(); render(); } };
window.openEditor = (id) => { state.editingLessonId = id; render(); };
window.closeEditor = () => { state.editingLessonId = null; render(); };

const findLesson = (id) => state.modules.flatMap(m => m.lessons).find(l => l.id === id);

// --- VUES ---

// La vue Login reste "Stand-alone"
function renderLogin() {
    return `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 fade-in relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
             <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[100px]"></div>
             <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600 rounded-full blur-[100px]"></div>
        </div>
        <div class="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10">
            <div class="text-center mb-10">
                <div class="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-300">
                    <i data-lucide="music-4" class="w-10 h-10 text-orange-400"></i>
                </div>
                <h1 class="text-3xl font-black text-slate-900 mb-2">GIA Élite</h1>
                <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Plateforme de formation privée</p>
            </div>
            <form onsubmit="event.preventDefault(); login(this.email.value, this.password.value);" class="space-y-6">
                <div><label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest ml-2">Email</label><input type="email" name="email" required class="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 font-bold text-slate-700" placeholder="votre@email.com" /></div>
                <div><label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest ml-2">Mot de passe</label><input type="password" name="password" required class="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 font-bold text-slate-700" placeholder="••••••••" /></div>
                <button type="submit" class="w-full bg-slate-900 text-white py-5 rounded-xl font-black text-lg shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">Se connecter <i data-lucide="arrow-right" class="w-5 h-5"></i></button>
            </form>
            <div class="mt-8 pt-6 border-t border-slate-100 text-center space-y-2"><p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Accès Démo</p><div class="flex gap-2 justify-center text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg inline-block"><span>admin@gia.com (admin)</span><span class="text-slate-300">|</span><span>eleve@gia.com (123)</span></div></div>
        </div>
    </div>`;
}

// Shell Structure (Layout Fixe)
function renderShell(user, content, isAdmin) {
    return `
    <div id="app-shell" class="flex h-screen bg-slate-50">
        <!-- Sidebar Fixe Desktop -->
        <nav class="w-24 bg-white border-r border-slate-200 flex flex-col items-center py-10 z-[50] hidden md:flex transition-none">
            <div class="mb-16 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-300">
                <i data-lucide="music-4" class="w-7 h-7 text-orange-400"></i>
            </div>
            <div id="desktop-menu-items" class="flex-1 w-full space-y-8 flex flex-col items-center">
                <!-- Rempli dynamiquement pour gérer les états actifs -->
            </div>
            ${isAdmin ? `
                <div id="admin-menu-items" class="w-full px-4 mb-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
                     <!-- Admin items -->
                </div>
            ` : ''}
        </nav>

        <!-- Navbar Fixe Mobile -->
        <nav id="mobile-nav" class="md:hidden fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50">
             <!-- Mobile items -->
        </nav>

        <!-- Container Contenu Dynamique -->
        <main id="main-content" class="flex-1 overflow-hidden relative selection:bg-orange-100 selection:text-orange-900">
            ${content}
        </main>
    </div>
    `;
}

// --- CONTENU DES VUES ---

function renderStudentManagement() {
    const students = state.users.filter(u => u.role === 'student');
    const checkpoints = state.modules.flatMap(m => m.lessons.filter(l => l.validationRequired));

    return `
    <div class="h-full bg-admin-grid p-8 lg:p-12 overflow-y-auto fade-in">
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 max-w-6xl mx-auto gap-6">
            <div><h1 class="text-4xl font-black text-slate-900 mb-2">Mes Apprentis</h1><p class="text-slate-500 font-bold uppercase tracking-widest">Suivez et validez la progression</p></div>
            <button onclick="document.getElementById('add-student-modal').classList.remove('hidden')" class="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg hover:scale-105 transition-all"><i data-lucide="user-plus" class="w-5 h-5"></i> Ajouter un élève</button>
        </header>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            ${students.map(student => {
                const studentValidated = student.validatedLessons || [];
                const nextCheckpoint = checkpoints.find(c => !studentValidated.includes(c.id));
                return `
                <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col h-full">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-4"><img src="${student.avatar}" class="w-14 h-14 rounded-2xl border-2 border-slate-50" /><div class="min-w-0"><h3 class="text-lg font-black text-slate-900 truncate">${student.name}</h3><p class="text-xs text-slate-400 font-bold truncate">${student.email}</p></div></div>
                        <button onclick="deleteUser(${student.id})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                    </div>
                    <div class="mb-6"><div class="flex justify-between text-xs font-bold uppercase text-slate-400 mb-1"><span>Progression</span><span>${student.progression}%</span></div><div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div class="bg-indigo-500 h-full rounded-full" style="width: ${student.progression}%"></div></div></div>
                    <div class="bg-slate-50 rounded-xl p-4 flex-1 border border-slate-100">
                        <h4 class="text-xs font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2"><i data-lucide="flag" class="w-3 h-3"></i> Checkpoints</h4>
                        <div class="space-y-2">
                            ${checkpoints.map(cp => {
                                const isDone = studentValidated.includes(cp.id);
                                return `<div class="flex items-center justify-between p-2 rounded-lg ${isDone ? 'bg-emerald-50 border border-emerald-100' : 'bg-white border border-slate-200'}"><span class="text-xs font-bold ${isDone ? 'text-emerald-700' : 'text-slate-600'} truncate mr-2">${cp.title}</span><label class="switch scale-75 origin-right"><input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleStudentValidation(${student.id}, ${cp.id}, this.checked)"><span class="slider"></span></label></div>`;
                            }).join('')}
                            ${checkpoints.length === 0 ? '<p class="text-xs text-slate-400 italic">Aucun checkpoint défini.</p>' : ''}
                        </div>
                    </div>
                    ${nextCheckpoint ? `<div class="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-3"><div class="bg-orange-100 p-2 rounded-lg text-orange-600"><i data-lucide="lock" class="w-4 h-4"></i></div><div><p class="text-[10px] uppercase font-bold text-orange-400">Actuellement bloqué à</p><p class="text-xs font-bold text-slate-800 line-clamp-1">${nextCheckpoint.title}</p></div></div>` : `<div class="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center"><p class="text-xs font-bold text-emerald-600">Tout est validé ! 🎉</p></div>`}
                </div>
            `;}).join('')}
        </div>
        <div id="add-student-modal" class="hidden fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onclick="this.parentElement.classList.add('hidden')"></div>
            <div class="bg-white w-full max-w-md rounded-[2rem] p-8 relative z-10 shadow-2xl">
                <h3 class="text-2xl font-black text-slate-900 mb-6">Nouvel Apprenti</h3>
                <form onsubmit="event.preventDefault(); createStudent(this.name.value, this.email.value, this.password.value);" class="space-y-4">
                    <input name="name" type="text" required placeholder="Nom complet" class="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                    <input name="email" type="email" required placeholder="Email" class="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                    <input name="password" type="text" required placeholder="Mot de passe" class="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                    <button class="w-full bg-indigo-600 text-white py-4 rounded-xl font-black mt-2">Créer le compte</button>
                </form>
            </div>
        </div>
    </div>`;
}

function renderClassroom() {
  const currentLesson = findLesson(state.activeLessonId);
  if(!currentLesson) { state.activeLessonId = state.modules[0]?.lessons[0]?.id; render(); return ''; }
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser.role === 'admin';
  const accessibleLessons = getAccessibleLessons(currentUser);

  // La structure du drawer est présente mais cachée/translatée
  return `
    <div class="flex h-full bg-slate-900 fade-in">
        <!-- Sidebar Programme -->
        <aside class="w-[340px] bg-slate-950 border-r border-white/5 flex flex-col hidden lg:flex">
            <div class="p-8 border-b border-white/10"><h2 class="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">Programme</h2></div>
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
                                    const isAccessible = accessibleLessons.has(l.id);
                                    const isActive = l.id === state.activeLessonId;
                                    const isLocked = !isAccessible;
                                    let icon = isLocked ? 'lock' : (isActive ? 'play' : 'circle');
                                    if (l.validationRequired) icon = 'flag';
                                    if (l.validationRequired && currentUser.validatedLessons?.includes(l.id)) icon = 'check-circle';

                                    return `
                                        <div onclick="${isLocked ? '' : `setActiveLesson(${l.id})`}" class="p-4 rounded-xl flex items-center gap-4 transition-all ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'hover:bg-white/5 text-slate-500'} ${isLocked ? 'opacity-40 cursor-not-allowed bg-slate-900/50' : 'cursor-pointer'}">
                                            <i data-lucide="${icon}" class="w-4 h-4 ${isActive ? 'fill-current' : ''} flex-shrink-0 ${l.validationRequired && !isLocked && !currentUser.validatedLessons?.includes(l.id) ? 'text-orange-400 animate-pulse' : ''}"></i>
                                            <div class="flex-1 min-w-0"><span class="text-sm font-bold leading-tight block truncate">${l.title}</span></div>
                                            ${l.validationRequired ? '<span title="Validation requise" class="text-sm filter drop-shadow-sm">🎯</span>' : ''}
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
                <div class="min-h-full flex flex-col items-center justify-center p-8 lg:p-16">
                    <div class="w-full max-w-5xl">
                       <div class="aspect-video video-frame mb-8 shadow-2xl">
                            ${currentLesson.wistiaId ? `
                                <iframe src="https://fast.wistia.net/embed/iframe/${currentLesson.wistiaId}?videoFoam=true" title="Wistia video player" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" name="wistia_embed" allowfullscreen width="100%" height="100%"></iframe>
                            ` : `
                                <div class="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-500"><i data-lucide="video-off" class="w-16 h-16 mb-4 opacity-20"></i><span class="text-xs font-black uppercase tracking-widest">Contenu vidéo non disponible</span></div>
                            `}
                       </div>
                       
                       <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 text-white pb-10">
                           <div>
                               <div class="flex items-center gap-3 mb-2"><h1 class="text-3xl font-black">${currentLesson.title}</h1>${currentLesson.validationRequired ? '<span title="Validation requise" class="text-2xl filter drop-shadow-md">🎯</span>' : ''}</div>
                               <p class="text-slate-400 text-lg">${currentLesson.subtitle}</p>
                           </div>
                           <div class="flex items-center gap-4">
                               <button onclick="toggleNotes()" class="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"><i data-lucide="book" class="w-5 h-5"></i> Notes</button>
                               ${currentLesson.validationRequired ? `
                                   ${currentUser.validatedLessons?.includes(currentLesson.id) ? 
                                   `<div class="px-8 py-3 rounded-xl font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-2"><i data-lucide="check-circle" class="w-5 h-5"></i> Validé</div>` 
                                   : 
                                   `<button onclick="window.open('https://wa.me/?text=Bonjour,%20je%20souhaite%20valider%20la%20leçon%20${encodeURIComponent(currentLesson.title)}', '_blank')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 hover:scale-105"><i data-lucide="message-circle" class="w-5 h-5"></i> Valider par WhatsApp</button>`}
                               ` : `<button class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-orange-900/20 transition-all">SUIVANT</button>`}
                           </div>
                       </div>
                    </div>
                </div>
            </div>
            
            <!-- Notes Drawer (Persistent) -->
            <div id="notes-drawer" class="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-[80] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col">
                <div class="p-6 border-b flex justify-between items-center bg-slate-50">
                    <h3 class="text-xl font-black text-slate-900 flex items-center gap-2"><i data-lucide="book-open" class="text-orange-500"></i> Notes de cours</h3>
                    <button onclick="toggleNotes()" class="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
                <div class="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
                    <h2 class="text-3xl font-black mb-6 flex items-center gap-3">${currentLesson.title} ${currentLesson.validationRequired ? '🎯' : ''}</h2>
                    <div class="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap mb-10">${currentLesson.content || "Aucune note disponible."}</div>
                    ${currentLesson.files.length > 0 ? `<div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 not-prose"><h4 class="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Téléchargements</h4><div class="space-y-3">${currentLesson.files.map(f => `<a href="#" class="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"><div class="flex items-center gap-3"><i data-lucide="file-text" class="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors"></i><span class="font-bold text-slate-700">${f.name}</span></div><i data-lucide="download-cloud" class="w-5 h-5 text-slate-300"></i></a>`).join('')}</div></div>` : ''}
                </div>
            </div>
            
            <!-- Backdrop -->
            <div id="notes-backdrop" onclick="toggleNotes()" class="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[70] transition-opacity duration-300 ${state.isNotesOpen ? '' : 'hidden opacity-0'}"></div>
        </div>
    </div>
  `;
}

function renderDashboard() {
  const user = getCurrentUser();
  return `
    <div class="h-full overflow-y-auto p-8 lg:p-12 bg-slate-50 fade-in">
        <header class="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div><h1 class="text-4xl lg:text-6xl font-black text-slate-900 mb-4">Bonjour ${user.name.split(' ')[0]}</h1><p class="text-xl text-slate-500">Prêt à faire sonner votre guitare aujourd'hui ?</p></div>
            ${user.role === 'admin' ? '<span class="bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200">Mode Formateur</span>' : ''}
        </header>
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12 lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-premium border border-slate-100 relative overflow-hidden group cursor-pointer" onclick="setView('classroom')">
                <div class="relative z-10 max-w-lg"><span class="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest mb-6 inline-block">Reprendre</span><h2 class="text-4xl font-black text-slate-900 mb-6 leading-tight">Accorder sa guitare</h2><p class="text-slate-500 text-lg mb-8 font-medium">Continuez votre progression.</p><button class="bg-slate-900 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:gap-5 transition-all shadow-xl">Continuer <i data-lucide="arrow-right"></i></button></div>
                <img src="https://picsum.photos/seed/guitar/600/400" class="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 mask-image-gradient group-hover:scale-105 transition-transform duration-700" style="mask-image: linear-gradient(to right, transparent, black);" />
            </div>
            <div class="col-span-12 lg:col-span-4 bg-orange-500 p-10 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                <div class="relative z-10"><div class="flex justify-between items-start mb-4"><div class="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><i data-lucide="activity" class="w-8 h-8 text-white"></i></div><span class="text-5xl font-black">${user.progression}%</span></div><p class="text-orange-100 font-bold text-lg">Progression Globale</p></div>
                <div class="relative z-10 mt-8"><div class="w-full bg-black/20 h-3 rounded-full overflow-hidden"><div class="bg-white h-full rounded-full" style="width: ${user.progression}%"></div></div></div>
                <i data-lucide="award" class="absolute -bottom-6 -right-6 w-40 h-40 text-orange-400 opacity-50 rotate-12"></i>
            </div>
        </div>
    </div>`;
}

function renderProfile() {
    const user = getCurrentUser();
    return `
    <div class="h-full flex items-center justify-center p-8 bg-slate-50 fade-in">
        <div class="bg-white p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-slate-100">
            <img src="${user.avatar}" class="w-32 h-32 rounded-3xl mx-auto mb-6 shadow-lg border-4 border-white" />
            <h2 class="text-3xl font-black text-slate-900 mb-1">${user.name}</h2>
            <p class="text-slate-400 font-bold mb-8">${user.email}</p>
            <div class="flex justify-center gap-6 mb-10">
                <div class="bg-orange-50 p-4 rounded-2xl"><span class="block text-2xl font-black text-orange-600">${user.points}</span><span class="text-xs font-bold uppercase text-orange-400">XP Points</span></div>
                <div class="bg-indigo-50 p-4 rounded-2xl"><span class="block text-2xl font-black text-indigo-600">${user.progression}%</span><span class="text-xs font-bold uppercase text-indigo-400">Progrès</span></div>
            </div>
            <button onclick="logout()" class="w-full py-4 border-2 border-slate-200 text-slate-500 font-black rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"><i data-lucide="log-out" class="w-5 h-5"></i> Se déconnecter</button>
        </div>
    </div>`;
}

function renderAdmin() {
  return `
    <div class="h-full bg-admin-grid p-8 lg:p-12 overflow-y-auto pb-40 fade-in">
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 max-w-5xl mx-auto gap-6">
            <div><h1 class="text-4xl lg:text-5xl font-black text-slate-900 mb-2">Contenu du Cours</h1><p class="text-lg text-slate-500 font-bold uppercase tracking-widest">Modifiez la structure</p></div>
            <button onclick="addChapter()" class="bg-indigo-600 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-indigo-200 hover:scale-105 transition-all"><i data-lucide="plus-circle" class="w-5 h-5"></i> Nouveau Chapitre</button>
        </header>
        <div class="space-y-12 max-w-5xl mx-auto">
            ${state.modules.map(mod => `
                <div class="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-200 shadow-premium group/module">
                    <div class="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                        <div class="flex-1 mr-4"><input type="text" value="${mod.title}" oninput="updateChapterTitle(${mod.id}, this.value)" class="w-full text-2xl lg:text-3xl font-black text-slate-900 bg-transparent outline-none focus:text-indigo-600 transition-colors placeholder:text-slate-200" placeholder="Titre du chapitre..." /></div>
                        <button onclick="deleteChapter(${mod.id})" class="text-slate-200 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all"><i data-lucide="trash-2" class="w-6 h-6"></i></button>
                    </div>
                    <div class="space-y-4 pl-0 lg:pl-8 border-l-0 lg:border-l-2 border-slate-100">
                        ${mod.lessons.map(l => `
                            <div class="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group/lesson">
                                <div class="flex items-center gap-5 overflow-hidden">
                                    <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${l.status === 'locked' ? 'bg-slate-200 text-slate-400' : 'bg-emerald-100 text-emerald-600'}"><i data-lucide="${l.status === 'locked' ? 'lock' : 'check-circle'}" class="w-5 h-5"></i></div>
                                    <div class="min-w-0 flex-1">
                                        <div class="flex items-center gap-2"><p class="text-lg font-bold text-slate-800 truncate">${l.title}</p>${l.validationRequired ? '<span title="Validation requise" class="text-lg filter drop-shadow-sm">🎯</span>' : ''}</div>
                                        <div class="flex items-center gap-2 mt-1"><span class="text-[10px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider">${l.type}</span><span class="text-[10px] font-bold text-slate-400">${l.duration}</span></div>
                                    </div>
                                </div>
                                <button onclick="openEditor(${l.id})" class="bg-white border-2 border-slate-200 px-5 py-2 rounded-xl font-black text-xs text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm whitespace-nowrap">ÉDITER</button>
                            </div>
                        `).join('')}
                        <button onclick="addLesson(${mod.id})" class="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/10 transition-all flex items-center justify-center gap-2 text-sm mt-4"><i data-lucide="plus" class="w-4 h-4"></i> Ajouter une leçon</button>
                    </div>
                </div>
            `).join('')}
        </div>
        ${state.editingLessonId ? renderLessonEditor() : ''}
    </div>`;
}

// L'éditeur reste inchangé
function renderLessonEditor() {
  const lesson = findLesson(state.editingLessonId);
  if (!lesson) return '';
  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 fade-in">
        <div class="absolute inset-0 modal-overlay" onclick="closeEditor()"></div>
        <div class="bg-white w-full max-w-6xl h-full max-h-[95vh] rounded-[2.5rem] shadow-2xl z-10 flex flex-col overflow-hidden">
            <header class="px-8 py-6 border-b bg-slate-50 flex justify-between items-center">
                <div><h2 class="text-2xl font-black text-slate-900 flex items-center gap-3"><i data-lucide="edit-3" class="w-6 h-6 text-indigo-600"></i> Édition</h2><p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Leçon ID: ${lesson.id}</p></div>
                <button onclick="closeEditor()" class="p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><i data-lucide="x" class="w-8 h-8"></i></button>
            </header>
            <div class="flex-1 overflow-y-auto p-8 lg:p-10 grid grid-cols-12 gap-10 bg-white">
                <div class="col-span-12 lg:col-span-7 space-y-8">
                    <div class="group"><label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Titre de la leçon</label><input type="text" value="${lesson.title}" oninput="updateLessonTitle(${lesson.id}, this.value)" class="w-full text-2xl font-bold bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 outline-none transition-all" /></div>
                    <div class="group h-full flex flex-col"><label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Contenu Pédagogique</label><textarea oninput="updateLessonContent(${lesson.id}, this.value)" class="w-full flex-1 min-h-[300px] text-lg bg-slate-50 border-2 border-slate-100 p-6 rounded-xl focus:border-indigo-500 outline-none resize-none leading-relaxed">${lesson.content || ''}</textarea></div>
                </div>
                <div class="col-span-12 lg:col-span-5 space-y-6">
                    <div class="p-6 rounded-2xl border-4 ${lesson.status === 'locked' ? 'border-slate-100 bg-slate-50' : 'border-emerald-100 bg-emerald-50/50'} transition-colors">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <div class="p-3 rounded-xl ${lesson.status === 'locked' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-200 text-emerald-700'}"><i data-lucide="${lesson.status === 'locked' ? 'lock' : 'unlock'}" class="w-6 h-6"></i></div>
                                <div><h3 class="font-black text-slate-900">État Global (Brouillon)</h3><p class="text-xs font-bold ${lesson.status === 'locked' ? 'text-slate-400' : 'text-emerald-600'} uppercase">${lesson.status === 'locked' ? 'Caché' : 'Visible'}</p></div>
                            </div>
                            <label class="switch"><input type="checkbox" ${lesson.status !== 'locked' ? 'checked' : ''} onchange="toggleLessonLock(${lesson.id}, !this.checked)"><span class="slider"></span></label>
                        </div>
                    </div>
                    <div class="bg-orange-50/50 p-6 rounded-2xl border-4 border-orange-100/50">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="p-3 rounded-xl bg-orange-100 text-orange-600"><span class="text-2xl leading-none filter drop-shadow-sm">🎯</span></div>
                                <div><h3 class="font-black text-slate-900">Checkpoint</h3><p class="text-xs font-bold text-orange-500 uppercase">Bloque la suite</p></div>
                            </div>
                            <label class="switch"><input type="checkbox" ${lesson.validationRequired ? 'checked' : ''} onchange="toggleLessonValidation(${lesson.id}, this.checked)"><span class="slider"></span></label>
                        </div>
                    </div>
                    <div class="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200">
                        <div class="flex items-center gap-2 mb-4 opacity-80"><i data-lucide="video" class="w-4 h-4"></i><span class="text-xs font-black uppercase tracking-widest">Intégration Vidéo</span></div>
                        <div class="bg-indigo-800/50 p-4 rounded-xl border border-indigo-400/30">
                            <label class="block text-[10px] uppercase font-bold text-indigo-200 mb-1">ID Wistia</label>
                            <input type="text" value="${lesson.wistiaId || ''}" oninput="updateLessonWistia(${lesson.id}, this.value)" class="w-full bg-transparent border-none text-white font-mono text-lg focus:outline-none placeholder:text-indigo-400" placeholder="ex: 30q789" />
                        </div>
                    </div>
                    <div class="border-t border-slate-100 pt-6">
                        <div class="flex items-center justify-between mb-4"><span class="text-xs font-black uppercase text-slate-400 tracking-widest">Fichiers joints</span><button onclick="addFile(${lesson.id})" class="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">+ Ajouter</button></div>
                        <div class="space-y-2">${lesson.files.map(f => `<div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm"><div class="flex items-center gap-3 overflow-hidden"><div class="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0"><i data-lucide="file" class="w-4 h-4"></i></div><span class="text-sm font-bold text-slate-700 truncate">${f.name}</span></div><button onclick="removeFile(${lesson.id}, '${f.name}')" class="text-slate-300 hover:text-red-500 p-1"><i data-lucide="trash" class="w-4 h-4"></i></button></div>`).join('')}</div>
                    </div>
                </div>
            </div>
            <footer class="p-6 border-t bg-slate-50 flex justify-end"><button onclick="closeEditor()" class="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:translate-y-[-2px] transition-all">Enregistrer & Fermer</button></footer>
        </div>
    </div>`;
}


// --- FLUID RENDER LOGIC ---

function updateNavState() {
    // Reconstruit seulement les boutons du menu dans les conteneurs existants
    const desktopContainer = document.getElementById('desktop-menu-items');
    const adminContainer = document.getElementById('admin-menu-items');
    const mobileContainer = document.getElementById('mobile-nav');
    const isAdmin = getCurrentUser().role === 'admin';

    if (desktopContainer) {
        desktopContainer.innerHTML = `
            ${navButton('dashboard', 'layout-grid', 'Accueil')}
            ${navButton('classroom', 'graduation-cap', 'Cours')}
            ${navButton('profile', 'user', 'Compte')}
        `;
    }
    
    if (adminContainer && isAdmin) {
        adminContainer.innerHTML = `
            <button onclick="setView('admin-students')" class="p-3 rounded-xl transition-all group relative ${state.currentView === 'admin-students' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'}" title="Mes Apprentis"><i data-lucide="users" class="w-6 h-6"></i></button>
            <button onclick="setView('admin')" class="p-3 rounded-xl transition-all group relative ${state.currentView === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'}" title="Éditeur de contenu"><i data-lucide="edit" class="w-6 h-6"></i></button>
        `;
    }

    if (mobileContainer) {
        mobileContainer.innerHTML = `
             ${navButtonMobile('dashboard', 'layout-grid')}
             ${navButtonMobile('classroom', 'graduation-cap')}
             ${isAdmin ? navButtonMobile('admin-students', 'users') : ''}
             ${navButtonMobile('profile', 'user')}
        `;
    }
}

function render() {
  const root = document.getElementById('root');
  if(!root) return;

  if(!state.currentUser) {
      root.innerHTML = renderLogin();
      if (window.lucide) window.lucide.createIcons();
      return;
  }

  const currentUser = getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  let content = '';
  switch(state.currentView) {
    case 'dashboard': content = renderDashboard(); break;
    case 'classroom': content = renderClassroom(); break;
    case 'admin': content = isAdmin ? renderAdmin() : renderDashboard(); break;
    case 'admin-students': content = isAdmin ? renderStudentManagement() : renderDashboard(); break;
    case 'profile': content = renderProfile(); break;
    default: content = renderDashboard();
  }

  // APP SHELL PATTERN
  // Si le shell n'existe pas, on le crée.
  if (!document.getElementById('app-shell')) {
      root.innerHTML = renderShell(currentUser, content, isAdmin);
      updateNavState(); // Initial population
  } else {
      // Si le shell existe, on met à jour uniquement les parties dynamiques
      updateNavState();
      document.getElementById('main-content').innerHTML = content;
  }
  
  // Overlay si éditeur ouvert (se rajoute par dessus le shell)
  if(state.editingLessonId) {
      const editor = document.createElement('div');
      editor.innerHTML = renderLessonEditor();
      // On s'assure qu'on ne duplique pas
      const existingEditor = document.querySelector('.fixed.inset-0.z-\\[100\\]');
      if(!existingEditor) document.body.appendChild(editor.firstElementChild);
  } else {
       const existingEditor = document.querySelector('.fixed.inset-0.z-\\[100\\]');
       if(existingEditor) existingEditor.remove();
  }

  if (window.lucide) window.lucide.createIcons();
}

const navButton = (view, icon, label) => `<button onclick="setView('${view}')" class="group flex flex-col items-center gap-1.5 w-full relative"><div class="p-3 rounded-xl transition-all ${state.currentView === view ? 'bg-orange-50 text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}"><i data-lucide="${icon}" class="w-6 h-6 ${state.currentView === view ? 'stroke-[2.5px]' : ''}"></i></div><span class="text-[10px] font-black uppercase tracking-widest ${state.currentView === view ? 'text-orange-600' : 'text-slate-300 group-hover:text-slate-400'}">${label}</span>${state.currentView === view ? '<div class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-l-full"></div>' : ''}</button>`;
const navButtonMobile = (view, icon) => `<button onclick="setView('${view}')" class="${state.currentView === view ? 'text-orange-600' : 'text-slate-400'}"><i data-lucide="${icon}"></i></button>`;

render();
