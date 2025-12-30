
/**
 * GIA V4.7 - SMART FORECAST & GOD MODE ADMIN
 * Feature: Intelligent 9/15 months prediction, Global Admin Tracking Table
 */

// --- CONFIGURATION PAR DÉFAUT ---

const DEFAULT_DB = {
  version: 4.7, 
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
      validatedLessons: [],
      startDate: "2023-01-01",
      history: []
    },
    {
      id: 2,
      name: "Jean-Pierre (Élève)",
      email: "eleve@gia.com",
      password: "123",
      role: 'student',
      avatar: "https://i.pravatar.cc/150?u=jp",
      progression: 15,
      points: 450,
      validatedLessons: [102], // Simule une leçon validée
      startDate: "2023-09-01", // Simule un début ancien pour tester le calcul
      history: [
          { lessonId: 102, date: "2023-09-15T10:00:00.000Z" }
      ]
    },
    {
      id: 3,
      name: "Sophie (Débutante)",
      email: "sophie@gia.com",
      password: "123",
      role: 'student',
      avatar: "https://i.pravatar.cc/150?u=sophie",
      progression: 5,
      points: 50,
      validatedLessons: [],
      startDate: new Date().toISOString().split('T')[0],
      history: []
    }
  ],
  modules: [
    {
      id: 1,
      title: "CHAPITRE 1 : Les Fondamentaux",
      estimatedWeeks: 2,
      lessons: [
        { id: 101, title: "Bienvenue & Posture", subtitle: "Les bases du confort", duration: "10m", type: 'video', status: 'active', hasVideo: true, wistiaId: '30q789', validationRequired: false, content: "...", files: [] },
        { id: 102, title: "Premier Accord (Test)", subtitle: "Validation des acquis", duration: "5m", type: 'practice', status: 'active', hasVideo: false, wistiaId: '', validationRequired: true, content: "...", files: [] },
        { id: 103, title: "La Rythmique Feu de Camp", subtitle: "Jouer en rythme", duration: "15m", type: 'video', status: 'active', hasVideo: true, wistiaId: '', validationRequired: false, content: "...", files: [] }
      ]
    },
    {
      id: 2,
      title: "CHAPITRE 2 : Premiers Pas",
      estimatedWeeks: 3,
      lessons: [
         { id: 201, title: "Leçon 2.1", subtitle: "Suite", duration: "10m", type: 'video', status: 'locked', hasVideo: false, wistiaId: '', validationRequired: true, content: "...", files: [] }
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

if (!savedState || !savedState.version || savedState.version < 4.7) {
    const baseState = savedState || DEFAULT_DB;
    const updatedUsers = (baseState.users || DEFAULT_DB.users).map(u => ({
        ...u,
        validatedLessons: u.validatedLessons || [],
        startDate: u.startDate || new Date().toISOString().split('T')[0],
        history: u.history || []
    }));
    state = { ...DEFAULT_DB, users: updatedUsers, modules: baseState.modules || DEFAULT_DB.modules };
    localStorage.setItem('gia_state', JSON.stringify(state));
} else {
    state = savedState;
}

const saveState = () => { localStorage.setItem('gia_state', JSON.stringify(state)); };
const getCurrentUser = () => { if(!state.currentUser) return null; return state.users.find(u => u.id === state.currentUser); };
const findLesson = (id) => state.modules.flatMap(m => m.lessons).find(l => l.id === id);

// --- ANALYTICS ENGINE (The Brain) ---

function getStudentAnalytics(user) {
    const allCheckpoints = state.modules.flatMap(m => m.lessons.filter(l => l.validationRequired));
    const totalCheckpoints = allCheckpoints.length;
    const validatedCount = user.validatedLessons.length;
    const remainingCount = totalCheckpoints - validatedCount;
    
    // Dates
    const start = new Date(user.startDate);
    const now = new Date();
    const daysSinceStart = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    
    // Dernier mouvement (pour détecter si bloqué)
    let lastActionDate = start;
    if (user.history && user.history.length > 0) {
        // Trie l'historique pour trouver la date la plus récente
        const sortedHistory = [...user.history].sort((a,b) => new Date(b.date) - new Date(a.date));
        lastActionDate = new Date(sortedHistory[0].date);
    }
    const daysSinceLastAction = Math.floor((now - lastActionDate) / (1000 * 60 * 60 * 24));
    
    // Vélocité (Temps moyen par étape validée)
    // Si 0 validation, on assume une vélocité "standard" de 15 jours par étape pour la projection initiale
    const avgDaysPerStep = validatedCount > 0 ? (daysSinceStart / validatedCount) : 14; 
    
    // Projection
    const projectedDaysRemaining = remainingCount * avgDaysPerStep;
    const projectedEndDate = new Date();
    projectedEndDate.setDate(now.getDate() + projectedDaysRemaining);
    
    // Durée totale projetée en mois
    const totalProjectedDurationMonths = (projectedEndDate - start) / (1000 * 60 * 60 * 24 * 30);
    
    // Seuils
    const TARGET_MONTHS = 9;
    const TOLERANCE_MONTHS = 15;
    
    let status = 'good'; // 'excellent', 'good', 'late'
    let message = "";
    let colorClass = "";
    
    if (totalProjectedDurationMonths <= TARGET_MONTHS) {
        status = 'excellent';
        message = "Excellente dynamique ! Fin estimée sous 9 mois.";
        colorClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
    } else if (totalProjectedDurationMonths <= TOLERANCE_MONTHS) {
        status = 'good';
        message = "Progression solide. Vous êtes dans la zone de tolérance.";
        colorClass = "text-amber-600 bg-amber-50 border-amber-200";
    } else {
        status = 'late';
        // Date limite des 15 mois
        const toleranceDate = new Date(start);
        toleranceDate.setDate(toleranceDate.getDate() + (TOLERANCE_MONTHS * 30));
        const dateStr = toleranceDate.toLocaleDateString('fr-FR', {month:'short', year:'numeric'});
        message = `Attention : Seuil de tolérance (${dateStr}) dépassé selon le rythme actuel.`;
        colorClass = "text-rose-600 bg-rose-50 border-rose-200";
    }

    // Leçon actuelle (La première non validée ou la dernière active)
    const currentLessonId = state.activeLessonId; // Simplification, idéalement calculé
    const currentLesson = findLesson(currentLessonId);

    return {
        percent: totalCheckpoints > 0 ? Math.round((validatedCount / totalCheckpoints) * 100) : 0,
        validatedCount,
        remainingCount,
        daysSinceStart,
        daysSinceLastAction,
        isStuck: daysSinceLastAction > 20, // Bloqué si > 20 jours sans validation
        projectedEndDate,
        projectedDateStr: projectedEndDate.toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'}),
        status,
        message,
        colorClass,
        currentLessonTitle: currentLesson ? currentLesson.title : "Introduction"
    };
}

// --- ACTIONS ---

window.login = (email, password) => {
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) { state.currentUser = user.id; state.currentView = 'dashboard'; saveState(); render(); } else { alert("Identifiants incorrects."); }
};
window.logout = () => { state.currentUser = null; state.currentView = 'login'; saveState(); document.getElementById('root').innerHTML = ''; render(); };
window.createStudent = (name, email, password) => {
    if(!name || !email || !password) return alert("Champs manquants");
    if(state.users.find(u => u.email.toLowerCase() === email.toLowerCase())) return alert("Email pris");
    state.users.push({ id: Date.now(), name, email, password, role: 'student', avatar: `https://i.pravatar.cc/150?u=${Date.now()}`, progression: 0, points: 0, validatedLessons: [], startDate: new Date().toISOString().split('T')[0], history: [] });
    saveState(); document.getElementById('add-student-modal').classList.add('hidden'); render(); 
};
window.deleteUser = (id) => { if(confirm("Supprimer ?")) { state.users = state.users.filter(u => u.id !== id); saveState(); render(); } };

window.toggleStudentValidation = (studentId, lessonId, isValidated) => {
    const student = state.users.find(u => u.id === studentId);
    if (!student) return;
    if (!student.validatedLessons) student.validatedLessons = [];
    if (!student.history) student.history = [];
    if (isValidated) {
        if (!student.validatedLessons.includes(lessonId)) {
            student.validatedLessons.push(lessonId);
            student.history.push({ lessonId: lessonId, date: new Date().toISOString() });
            student.points = (student.points || 0) + 50; 
        }
    } else {
        student.validatedLessons = student.validatedLessons.filter(id => id !== lessonId);
        student.history = student.history.filter(h => h.lessonId !== lessonId);
        student.points = Math.max(0, (student.points || 0) - 50);
    }
    // Recalcul progression simple pour affichage rapide
    const total = state.modules.flatMap(m => m.lessons.filter(l => l.validationRequired)).length;
    student.progression = total > 0 ? Math.round((student.validatedLessons.length / total) * 100) : 0;
    saveState(); render();
};

window.setView = (view) => { state.currentView = view; state.editingLessonId = null; state.isNotesOpen = false; saveState(); render(); };
window.setActiveLesson = (id) => { state.activeLessonId = id; if (state.currentView !== 'classroom') state.currentView = 'classroom'; saveState(); render(); };
window.toggleNotes = () => { state.isNotesOpen = !state.isNotesOpen; saveState(); renderNotes(); };
function renderNotes() { const d = document.getElementById('notes-drawer'); const b = document.getElementById('notes-backdrop'); if(d && b) { if(state.isNotesOpen) { d.classList.remove('translate-x-full'); d.classList.add('translate-x-0'); b.classList.remove('hidden', 'opacity-0'); } else { d.classList.remove('translate-x-0'); d.classList.add('translate-x-full'); b.classList.add('opacity-0'); setTimeout(() => b.classList.add('hidden'), 300); } } else { render(); } }

window.toggleModule = (id) => { if(state.expandedModules.includes(id)) state.expandedModules = state.expandedModules.filter(m => m !== id); else state.expandedModules.push(id); saveState(); const s = document.getElementById('classroom-sidebar-content'); if(s) { s.innerHTML = renderModuleListItems(); if(window.lucide) window.lucide.createIcons(); } else { render(); } };

// Admin basics
window.updateLessonTitle = (id, v) => { const l = findLesson(id); if(l) { l.title = v; saveState(); } };
window.updateLessonContent = (id, v) => { const l = findLesson(id); if(l) { l.content = v; saveState(); } };
window.updateLessonWistia = (id, v) => { const l = findLesson(id); if(l) { l.wistiaId = v; saveState(); } };
window.updateChapterTitle = (id, v) => { const m = state.modules.find(m => m.id === id); if(m) { m.title = v; saveState(); } };
window.updateChapterDuration = (id, v) => { const m = state.modules.find(m => m.id === id); if(m) { m.estimatedWeeks = parseInt(v) || 0; saveState(); } };
window.toggleLessonLock = (id, c) => { const l = findLesson(id); if(l) { l.status = c ? 'locked' : 'active'; saveState(); render(); } }; 
window.toggleLessonValidation = (id, c) => { const l = findLesson(id); if(l) { l.validationRequired = c; saveState(); render(); } };
window.addChapter = () => { state.modules.push({ id: Date.now(), title: "Nouveau Chapitre", estimatedWeeks: 2, lessons: [] }); saveState(); render(); };
window.deleteChapter = (id) => { if(confirm("Supprimer ?")) { state.modules = state.modules.filter(m => m.id !== id); saveState(); render(); } };
window.addLesson = (cId) => { const m = state.modules.find(mod => mod.id === cId); if(m) { m.lessons.push({ id: Date.now(), title: "Leçon", subtitle: "...", duration: "5m", type: 'video', status: 'locked', hasVideo: true, wistiaId: '', validationRequired: false, content: '', files: [] }); saveState(); render(); } };
window.openEditor = (id) => { state.editingLessonId = id; render(); };
window.closeEditor = () => { state.editingLessonId = null; render(); };

// --- VIEWS ---

function renderLogin() {
    return `<div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 fade-in relative overflow-hidden"><div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none"><div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[100px]"></div><div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600 rounded-full blur-[100px]"></div></div><div class="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10"><div class="text-center mb-10"><div class="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-300"><i data-lucide="music-4" class="w-10 h-10 text-orange-400"></i></div><h1 class="text-3xl font-black text-slate-900 mb-2">GIA Élite</h1><p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Plateforme de formation privée</p></div><form onsubmit="event.preventDefault(); login(this.email.value, this.password.value);" class="space-y-6"><div><label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest ml-2">Email</label><input type="email" name="email" required class="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 font-bold text-slate-700" placeholder="votre@email.com" /></div><div><label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest ml-2">Mot de passe</label><input type="password" name="password" required class="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 font-bold text-slate-700" placeholder="••••••••" /></div><button type="submit" class="w-full bg-slate-900 text-white py-5 rounded-xl font-black text-lg shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">Se connecter <i data-lucide="arrow-right" class="w-5 h-5"></i></button></form><div class="mt-8 pt-6 border-t border-slate-100 text-center space-y-2"><p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Accès Démo</p><div class="flex gap-2 justify-center text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg inline-block"><span>admin@gia.com (admin)</span><span class="text-slate-300">|</span><span>eleve@gia.com (123)</span></div></div></div></div>`;
}

function renderShell(user, content, isAdmin) {
    return `<div id="app-shell" class="flex h-screen bg-slate-50"><nav class="w-24 bg-white border-r border-slate-200 flex flex-col items-center py-10 z-[50] hidden md:flex transition-none flex-shrink-0"><div class="mb-16 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-300"><i data-lucide="music-4" class="w-7 h-7 text-orange-400"></i></div><div id="desktop-menu-items" class="flex-1 w-full space-y-8 flex flex-col items-center"></div>${isAdmin ? `<div id="admin-menu-items" class="w-full px-4 mb-4 pt-4 border-t border-slate-100 flex flex-col gap-4"></div>` : ''}</nav><nav id="mobile-nav" class="md:hidden fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50"></nav><main id="main-content" class="flex-1 overflow-hidden relative selection:bg-orange-100 selection:text-orange-900">${content}</main></div>`;
}

function renderModuleListItems() {
    const currentUser = getCurrentUser();
    const isAdmin = currentUser.role === 'admin';
    const accessibleLessons = getAccessibleLessons(currentUser);
    return state.modules.map(mod => `<div class="mb-6"><button onclick="toggleModule(${mod.id})" class="w-full px-2 py-2 flex items-center justify-between text-slate-500 hover:text-white group"><span class="text-[10px] font-black uppercase tracking-widest group-hover:text-orange-400 transition-colors">${mod.title}</span><i data-lucide="${state.expandedModules.includes(mod.id) ? 'chevron-up' : 'chevron-down'}" class="w-3 h-3"></i></button>${state.expandedModules.includes(mod.id) ? `<div class="space-y-1 mt-1">${mod.lessons.map(l => { const isAccessible = accessibleLessons.has(l.id); const isActive = l.id === state.activeLessonId; const isLocked = !isAccessible; let icon = isLocked ? 'lock' : (isActive ? 'play' : 'circle'); if (l.validationRequired) icon = 'flag'; if (l.validationRequired && currentUser.validatedLessons?.includes(l.id)) icon = 'check-circle'; return `<div onclick="${isLocked ? '' : `setActiveLesson(${l.id})`}" class="p-4 rounded-xl flex items-center gap-4 transition-all ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'hover:bg-white/5 text-slate-500'} ${isLocked ? 'opacity-40 cursor-not-allowed bg-slate-900/50' : 'cursor-pointer'}"><i data-lucide="${icon}" class="w-4 h-4 ${isActive ? 'fill-current' : ''} flex-shrink-0 ${l.validationRequired && !isLocked && !currentUser.validatedLessons?.includes(l.id) ? 'text-orange-400 animate-pulse' : ''}"></i><div class="flex-1 min-w-0"><span class="text-sm font-bold leading-tight block truncate">${l.title}</span></div>${l.validationRequired ? '<span title="Validation requise" class="text-sm filter drop-shadow-sm">🎯</span>' : ''}</div>`; }).join('')}</div>` : ''}</div>`).join('');
}

function renderClassroom() {
  const currentLesson = findLesson(state.activeLessonId) || state.modules[0].lessons[0];
  const currentUser = getCurrentUser();
  return `<div class="flex h-full bg-slate-900 fade-in"><aside class="w-[340px] bg-slate-950 border-r border-white/5 flex flex-col hidden lg:flex"><div class="p-8 border-b border-white/10"><h2 class="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">Programme</h2></div><div id="classroom-sidebar-content" class="flex-1 overflow-y-auto custom-scrollbar p-3">${renderModuleListItems()}</div></aside><div class="flex-1 flex flex-col relative h-full overflow-hidden"><div class="flex-1 flex flex-col bg-slate-900 p-6 lg:p-10 overflow-hidden"><div class="w-full max-w-6xl mx-auto flex flex-col h-full"><div class="flex-1 min-h-0 flex flex-col justify-center mb-6"><div class="w-full aspect-video video-frame shadow-2xl mx-auto max-h-full">${currentLesson.wistiaId ? `<iframe src="https://fast.wistia.net/embed/iframe/${currentLesson.wistiaId}?videoFoam=true" title="Wistia video player" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" name="wistia_embed" allowfullscreen width="100%" height="100%"></iframe>` : `<div class="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-500"><i data-lucide="video-off" class="w-16 h-16 mb-4 opacity-20"></i><span class="text-xs font-black uppercase tracking-widest">Contenu vidéo non disponible</span></div>`}</div></div><div class="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 text-white pb-2"><div><div class="flex items-center gap-3 mb-2"><h1 class="text-3xl font-black truncate">${currentLesson.title}</h1>${currentLesson.validationRequired ? '<span title="Validation requise" class="text-2xl filter drop-shadow-md">🎯</span>' : ''}</div><p class="text-slate-400 text-lg truncate">${currentLesson.subtitle}</p></div><div class="flex items-center gap-4"><button onclick="toggleNotes()" class="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"><i data-lucide="book" class="w-5 h-5"></i> Notes</button>${currentLesson.validationRequired ? `${currentUser.validatedLessons?.includes(currentLesson.id) ? `<div class="px-8 py-3 rounded-xl font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-2"><i data-lucide="check-circle" class="w-5 h-5"></i> Validé</div>` : `<button class="relative bg-slate-900 text-amber-500 px-8 py-3 rounded-xl font-black border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] opacity-90 cursor-default flex items-center gap-3"><i data-lucide="smartphone" class="w-5 h-5"></i> <span>Validation sur Mobile</span><div class="absolute inset-0 rounded-xl ring-1 ring-amber-500/20 animate-pulse"></div></button>`}` : `<button class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-orange-900/20 transition-all">SUIVANT</button>`}</div></div></div></div><div id="notes-drawer" class="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-[80] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${state.isNotesOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col"><div class="p-6 border-b flex justify-between items-center bg-slate-50"><h3 class="text-xl font-black text-slate-900 flex items-center gap-2"><i data-lucide="book-open" class="text-orange-500"></i> Notes de cours</h3><button onclick="toggleNotes()" class="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><i data-lucide="x" class="w-6 h-6"></i></button></div><div class="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none"><h2 class="text-3xl font-black mb-6 flex items-center gap-3">${currentLesson.title} ${currentLesson.validationRequired ? '🎯' : ''}</h2><div class="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap mb-10">${currentLesson.content || "Aucune note disponible."}</div>${currentLesson.files.length > 0 ? `<div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 not-prose"><h4 class="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Téléchargements</h4><div class="space-y-3">${currentLesson.files.map(f => `<a href="#" class="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"><div class="flex items-center gap-3"><i data-lucide="file-text" class="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors"></i><span class="font-bold text-slate-700">${f.name}</span></div><i data-lucide="download-cloud" class="w-5 h-5 text-slate-300"></i></a>`).join('')}</div></div>` : ''}</div></div><div id="notes-backdrop" onclick="toggleNotes()" class="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[70] transition-opacity duration-300 ${state.isNotesOpen ? '' : 'hidden opacity-0'}"></div></div></div>`;
}

function renderDashboard() {
  const user = getCurrentUser();
  const currentLesson = findLesson(state.activeLessonId) || state.modules[0].lessons[0];
  const analytics = getStudentAnalytics(user);
  
  // Recent history formatting
  const recentHistory = (user.history || []).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(h => {
        const l = state.modules.flatMap(m => m.lessons).find(l => l.id === h.lessonId);
        return { title: l ? l.title : 'Leçon inconnue', date: new Date(h.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) };
  });

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analytics.percent / 100) * circumference;

  return `
    <div class="h-full flex flex-col p-6 lg:p-8 bg-slate-50 fade-in overflow-hidden">
        <header class="flex-shrink-0 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div><h1 class="text-3xl lg:text-4xl font-black text-slate-900 mb-1">Tableau de Bord</h1><p class="text-base text-slate-500">Vue d'ensemble de votre parcours.</p></div>
            ${user.role === 'admin' ? '<span class="bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200">Mode Formateur</span>' : ''}
        </header>

        <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 grid-rows-6 gap-6">
            
            <!-- 1. CARTE DE REPRISE (Main - 2/3 Height) -->
            <div class="col-span-12 lg:col-span-8 row-span-4 bg-white p-8 rounded-[2rem] shadow-premium border border-slate-100 relative overflow-hidden group cursor-pointer flex flex-col justify-center" onclick="setView('classroom')">
                <div class="relative z-10 max-w-xl">
                    <span class="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest mb-4 inline-block">
                        ${currentLesson.validationRequired ? 'Priorité : Checkpoint' : 'Reprendre le cours'}
                    </span>
                    <h2 class="text-3xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight">${currentLesson.title}</h2>
                    <p class="text-slate-500 text-lg mb-8 font-medium line-clamp-2">${currentLesson.subtitle}</p>
                    <button class="bg-slate-900 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:gap-5 transition-all shadow-xl w-fit">Accéder <i data-lucide="arrow-right"></i></button>
                </div>
                <img src="https://picsum.photos/seed/guitar/600/400" class="absolute right-0 top-0 h-full w-1/2 object-cover opacity-10 mask-image-gradient group-hover:scale-105 transition-transform duration-700" style="mask-image: linear-gradient(to right, transparent, black);" />
            </div>

            <!-- 2. SMART FORECAST (1/3 Height - INTELLIGENT) -->
            <div class="col-span-12 lg:col-span-8 row-span-2 ${analytics.colorClass} p-8 rounded-[2rem] border-2 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div class="relative z-10 flex items-center justify-between">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                             <i data-lucide="trending-up" class="w-5 h-5"></i>
                             <span class="text-xs font-black uppercase tracking-widest">Projection Fin de Parcours</span>
                        </div>
                        <h3 class="text-3xl font-black mb-1">Objectif : ${analytics.projectedDateStr}</h3>
                        <p class="font-bold opacity-80">${analytics.message}</p>
                    </div>
                    <div class="text-right hidden sm:block">
                        <span class="block text-4xl font-black">${analytics.remainingCount}</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider">Étapes restantes</span>
                    </div>
                </div>
            </div>

            <!-- 3. JAUGE GLOBALE -->
            <div class="col-span-12 lg:col-span-4 row-span-2 bg-orange-500 p-4 rounded-[2rem] shadow-xl text-white flex flex-row items-center justify-between relative overflow-hidden px-8">
                <div class="relative z-10 w-28 h-28 flex-shrink-0">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="${radius}" stroke="rgba(255,255,255,0.2)" stroke-width="12" fill="none" />
                        <circle cx="80" cy="80" r="${radius}" stroke="white" stroke-width="12" fill="none" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round" />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-2xl font-black">${analytics.percent}%</span>
                    </div>
                </div>
                <div class="relative z-10 text-right">
                    <p class="text-3xl font-black">${analytics.remainingCount}</p>
                    <p class="text-orange-100 text-xs font-bold opacity-80 uppercase">Étapes<br>Restantes</p>
                </div>
            </div>

            <!-- 4. VELOCITE -->
            <div class="col-span-12 lg:col-span-4 row-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative">
                 <div class="absolute top-6 left-6 flex items-center gap-2">
                    <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><i data-lucide="zap" class="w-4 h-4"></i></div>
                </div>
                <div class="text-center mt-4">
                    <p class="text-4xl font-black text-slate-900 leading-none mb-1">
                        ${analytics.validatedCount > 0 ? (Math.round(analytics.daysSinceStart / analytics.validatedCount) + 'j') : '-'}
                    </p>
                    <p class="text-xs text-slate-400 font-bold uppercase">Moyenne par étape</p>
                </div>
            </div>

            <!-- 5. HISTORIQUE -->
            <div class="col-span-12 lg:col-span-4 row-span-2 bg-slate-100 p-6 rounded-[2rem] border border-slate-200 flex flex-col overflow-hidden">
                <div class="flex items-center gap-3 mb-3 flex-shrink-0">
                    <div class="p-2 bg-white text-slate-600 rounded-lg shadow-sm"><i data-lucide="history" class="w-4 h-4"></i></div>
                    <h3 class="font-black text-slate-900 text-sm">Récent</h3>
                </div>
                <div class="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    ${recentHistory.length > 0 ? recentHistory.map(h => `
                        <div class="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-200/50">
                            <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]"><i data-lucide="check" class="w-3 h-3"></i></div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-bold text-slate-800 truncate">${h.title}</p>
                                <p class="text-[10px] font-bold text-slate-400 uppercase">${h.date}</p>
                            </div>
                        </div>
                    `).join('') : '<p class="text-center text-[10px] text-slate-400 py-2 italic">Rien à signaler.</p>'}
                </div>
            </div>

        </div>
    </div>`;
}

// --- NEW ADMIN GLOBAL TRACKING VIEW ---

function renderAdminTracking() {
    const students = state.users.filter(u => u.role === 'student').map(u => ({ ...u, analytics: getStudentAnalytics(u) }));

    return `
    <div class="h-full bg-slate-50 p-8 flex flex-col fade-in">
        <header class="flex-shrink-0 mb-8 flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-black text-slate-900">Suivi Global (God Mode)</h1>
                <p class="text-slate-500 font-bold">Performance temps réel de tous les élèves</p>
            </div>
            <div class="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-xs font-bold text-slate-500">
                ${students.length} Élèves actifs
            </div>
        </header>

        <div class="flex-1 bg-white rounded-[2rem] shadow-premium border border-slate-200 overflow-hidden flex flex-col">
            <div class="overflow-auto flex-1 custom-scrollbar">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th class="p-6 text-xs font-black uppercase text-slate-400 tracking-widest">Apprenti</th>
                            <th class="p-6 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Progression</th>
                            <th class="p-6 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Vélocité</th>
                            <th class="p-6 text-xs font-black uppercase text-slate-400 tracking-widest">Module Actuel</th>
                            <th class="p-6 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                            <th class="p-6 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Projection</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${students.map(s => `
                            <tr class="hover:bg-slate-50/50 transition-colors group">
                                <td class="p-6">
                                    <div class="flex items-center gap-4">
                                        <img src="${s.avatar}" class="w-10 h-10 rounded-xl border border-slate-200" />
                                        <div>
                                            <div class="font-bold text-slate-900">${s.name}</div>
                                            <div class="text-xs text-slate-400 font-mono">Depuis: ${new Date(s.startDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-6 text-center">
                                    <div class="inline-flex flex-col items-center">
                                        <span class="text-xl font-black text-indigo-600">${s.analytics.percent}%</span>
                                        <span class="text-[10px] font-bold text-slate-400">${s.analytics.validatedCount} validés</span>
                                    </div>
                                </td>
                                <td class="p-6 text-center">
                                    <div class="font-bold text-slate-700">${s.analytics.validatedCount > 0 ? Math.round(s.analytics.daysSinceStart / s.analytics.validatedCount) : '-'}j</div>
                                    <div class="text-[10px] text-slate-400">par étape</div>
                                </td>
                                <td class="p-6">
                                    <div class="max-w-[200px]">
                                        <div class="text-sm font-bold text-slate-900 truncate">${s.analytics.currentLessonTitle}</div>
                                        ${s.analytics.isStuck ? 
                                            `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded mt-1">
                                                <i data-lucide="alert-circle" class="w-3 h-3"></i> Bloqué ${s.analytics.daysSinceLastAction}j
                                            </span>` 
                                            : 
                                            `<span class="text-[10px] text-emerald-500 font-bold">Actif il y a ${s.analytics.daysSinceLastAction}j</span>`
                                        }
                                    </div>
                                </td>
                                <td class="p-6 text-center">
                                    <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                        s.analytics.status === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                        s.analytics.status === 'good' ? 'bg-amber-100 text-amber-700' :
                                        'bg-rose-100 text-rose-700'
                                    }">
                                        ${s.analytics.status === 'excellent' ? 'Élite' : s.analytics.status === 'good' ? 'Standard' : 'Retard'}
                                    </span>
                                </td>
                                <td class="p-6 text-right">
                                    <div class="text-sm font-bold text-slate-900">${s.analytics.projectedDateStr}</div>
                                    ${s.analytics.status === 'late' ? '<div class="text-[10px] font-bold text-rose-500">Seuil dépassé</div>' : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function renderProfile() {
    const user = getCurrentUser();
    return `<div class="h-full flex items-center justify-center p-8 bg-slate-50 fade-in"><div class="bg-white p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-slate-100"><img src="${user.avatar}" class="w-32 h-32 rounded-3xl mx-auto mb-6 shadow-lg border-4 border-white" /><h2 class="text-3xl font-black text-slate-900 mb-1">${user.name}</h2><p class="text-slate-400 font-bold mb-8">${user.email}</p><div class="flex justify-center gap-6 mb-10"><div class="bg-orange-50 p-4 rounded-2xl"><span class="block text-2xl font-black text-orange-600">${user.points}</span><span class="text-xs font-bold uppercase text-orange-400">XP Points</span></div><div class="bg-indigo-50 p-4 rounded-2xl"><span class="block text-2xl font-black text-indigo-600">${user.progression}%</span><span class="text-xs font-bold uppercase text-indigo-400">Progrès</span></div></div><button onclick="logout()" class="w-full py-4 border-2 border-slate-200 text-slate-500 font-black rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"><i data-lucide="log-out" class="w-5 h-5"></i> Se déconnecter</button></div></div>`;
}

function renderStudentManagement() {
    // Legacy view kept for individual actions, but tracking logic moved to God Mode
    const students = state.users.filter(u => u.role === 'student');
    const checkpoints = state.modules.flatMap(m => m.lessons.filter(l => l.validationRequired));
    return `<div class="h-full bg-admin-grid p-8 lg:p-12 overflow-y-auto fade-in"><header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 max-w-6xl mx-auto gap-6"><div><h1 class="text-4xl font-black text-slate-900 mb-2">Gestion Individuelle</h1><p class="text-slate-500 font-bold uppercase tracking-widest">Validez les checkpoints</p></div><button onclick="document.getElementById('add-student-modal').classList.remove('hidden')" class="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg hover:scale-105 transition-all"><i data-lucide="user-plus" class="w-5 h-5"></i> Ajouter un élève</button></header><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">${students.map(student => {const studentValidated = student.validatedLessons || []; const nextCheckpoint = checkpoints.find(c => !studentValidated.includes(c.id)); return `<div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col h-full"><div class="flex items-center justify-between mb-6"><div class="flex items-center gap-4"><img src="${student.avatar}" class="w-14 h-14 rounded-2xl border-2 border-slate-50" /><div class="min-w-0"><h3 class="text-lg font-black text-slate-900 truncate">${student.name}</h3><p class="text-xs text-slate-400 font-bold truncate">${student.email}</p></div></div><button onclick="deleteUser(${student.id})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-5 h-5"></i></button></div><div class="mb-6"><div class="flex justify-between text-xs font-bold uppercase text-slate-400 mb-1"><span>Progression</span><span>${student.progression}%</span></div><div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div class="bg-indigo-500 h-full rounded-full" style="width: ${student.progression}%"></div></div></div><div class="bg-slate-50 rounded-xl p-4 flex-1 border border-slate-100"><h4 class="text-xs font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2"><i data-lucide="flag" class="w-3 h-3"></i> Checkpoints</h4><div class="space-y-2">${checkpoints.map(cp => { const isDone = studentValidated.includes(cp.id); return `<div class="flex items-center justify-between p-2 rounded-lg ${isDone ? 'bg-emerald-50 border border-emerald-100' : 'bg-white border border-slate-200'}"><span class="text-xs font-bold ${isDone ? 'text-emerald-700' : 'text-slate-600'} truncate mr-2">${cp.title}</span><label class="switch scale-75 origin-right"><input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleStudentValidation(${student.id}, ${cp.id}, this.checked)"><span class="slider"></span></label></div>`; }).join('')}</div></div></div>`; }).join('')}</div><div id="add-student-modal" class="hidden fixed inset-0 z-[100] flex items-center justify-center p-4"><div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onclick="this.parentElement.classList.add('hidden')"></div><div class="bg-white w-full max-w-md rounded-[2rem] p-8 relative z-10 shadow-2xl"><h3 class="text-2xl font-black text-slate-900 mb-6">Nouvel Apprenti</h3><form onsubmit="event.preventDefault(); createStudent(this.name.value, this.email.value, this.password.value);" class="space-y-4"><input name="name" type="text" required placeholder="Nom complet" class="w-full bg-slate-50 border p-3 rounded-xl font-bold"><input name="email" type="email" required placeholder="Email" class="w-full bg-slate-50 border p-3 rounded-xl font-bold"><input name="password" type="text" required placeholder="Mot de passe" class="w-full bg-slate-50 border p-3 rounded-xl font-bold"><button class="w-full bg-indigo-600 text-white py-4 rounded-xl font-black mt-2">Créer le compte</button></form></div></div></div>`;
}

function renderAdmin() {
  return `<div class="h-full bg-admin-grid p-8 lg:p-12 overflow-y-auto pb-40 fade-in"><header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 max-w-5xl mx-auto gap-6"><div><h1 class="text-4xl lg:text-5xl font-black text-slate-900 mb-2">Contenu du Cours</h1><p class="text-lg text-slate-500 font-bold uppercase tracking-widest">Modifiez la structure</p></div><button onclick="addChapter()" class="bg-indigo-600 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-indigo-200 hover:scale-105 transition-all"><i data-lucide="plus-circle" class="w-5 h-5"></i> Nouveau Chapitre</button></header><div class="space-y-12 max-w-5xl mx-auto">${state.modules.map(mod => `<div class="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-200 shadow-premium group/module"><div class="flex items-center justify-between mb-8 pb-6 border-b border-slate-100"><div class="flex-1 mr-4"><input type="text" value="${mod.title}" oninput="updateChapterTitle(${mod.id}, this.value)" class="w-full text-2xl lg:text-3xl font-black text-slate-900 bg-transparent outline-none focus:text-indigo-600 transition-colors placeholder:text-slate-200" placeholder="Titre du chapitre..." /><div class="mt-2 flex items-center gap-2"><span class="text-xs font-bold text-slate-400 uppercase">Durée est. (semaines) :</span><input type="number" value="${mod.estimatedWeeks || 0}" oninput="updateChapterDuration(${mod.id}, this.value)" class="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1 text-sm font-bold text-slate-700" /></div></div><button onclick="deleteChapter(${mod.id})" class="text-slate-200 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all"><i data-lucide="trash-2" class="w-6 h-6"></i></button></div><div class="space-y-4 pl-0 lg:pl-8 border-l-0 lg:border-l-2 border-slate-100">${mod.lessons.map(l => `<div class="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group/lesson"><div class="flex items-center gap-5 overflow-hidden"><div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${l.status === 'locked' ? 'bg-slate-200 text-slate-400' : 'bg-emerald-100 text-emerald-600'}"><i data-lucide="${l.status === 'locked' ? 'lock' : 'check-circle'}" class="w-5 h-5"></i></div><div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="text-lg font-bold text-slate-800 truncate">${l.title}</p>${l.validationRequired ? '<span title="Validation requise" class="text-lg filter drop-shadow-sm">🎯</span>' : ''}</div><div class="flex items-center gap-2 mt-1"><span class="text-[10px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider">${l.type}</span><span class="text-[10px] font-bold text-slate-400">${l.duration}</span></div></div></div><button onclick="openEditor(${l.id})" class="bg-white border-2 border-slate-200 px-5 py-2 rounded-xl font-black text-xs text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm whitespace-nowrap">ÉDITER</button></div>`).join('')}<button onclick="addLesson(${mod.id})" class="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/10 transition-all flex items-center justify-center gap-2 text-sm mt-4"><i data-lucide="plus" class="w-4 h-4"></i> Ajouter une leçon</button></div></div>`).join('')}</div>${state.editingLessonId ? renderLessonEditor() : ''}</div>`;
}

function renderLessonEditor() {
  const lesson = findLesson(state.editingLessonId);
  if (!lesson) return '';
  return `<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 fade-in"><div class="absolute inset-0 modal-overlay" onclick="closeEditor()"></div><div class="bg-white w-full max-w-6xl h-full max-h-[95vh] rounded-[2.5rem] shadow-2xl z-10 flex flex-col overflow-hidden"><header class="px-8 py-6 border-b bg-slate-50 flex justify-between items-center"><div><h2 class="text-2xl font-black text-slate-900 flex items-center gap-3"><i data-lucide="edit-3" class="w-6 h-6 text-indigo-600"></i> Édition</h2><p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Leçon ID: ${lesson.id}</p></div><button onclick="closeEditor()" class="p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><i data-lucide="x" class="w-8 h-8"></i></button></header><div class="flex-1 overflow-y-auto p-8 lg:p-10 grid grid-cols-12 gap-10 bg-white"><div class="col-span-12 lg:col-span-7 space-y-8"><div class="group"><label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Titre de la leçon</label><input type="text" value="${lesson.title}" oninput="updateLessonTitle(${lesson.id}, this.value)" class="w-full text-2xl font-bold bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 outline-none transition-all" /></div><div class="group h-full flex flex-col"><label class="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Contenu Pédagogique</label><textarea oninput="updateLessonContent(${lesson.id}, this.value)" class="w-full flex-1 min-h-[300px] text-lg bg-slate-50 border-2 border-slate-100 p-6 rounded-xl focus:border-indigo-500 outline-none resize-none leading-relaxed">${lesson.content || ''}</textarea></div></div><div class="col-span-12 lg:col-span-5 space-y-6"><div class="p-6 rounded-2xl border-4 ${lesson.status === 'locked' ? 'border-slate-100 bg-slate-50' : 'border-emerald-100 bg-emerald-50/50'} transition-colors"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-3"><div class="p-3 rounded-xl ${lesson.status === 'locked' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-200 text-emerald-700'}"><i data-lucide="${lesson.status === 'locked' ? 'lock' : 'unlock'}" class="w-6 h-6"></i></div><div><h3 class="font-black text-slate-900">État Global (Brouillon)</h3><p class="text-xs font-bold ${lesson.status === 'locked' ? 'text-slate-400' : 'text-emerald-600'} uppercase">${lesson.status === 'locked' ? 'Caché' : 'Visible'}</p></div></div><label class="switch"><input type="checkbox" ${lesson.status !== 'locked' ? 'checked' : ''} onchange="toggleLessonLock(${lesson.id}, !this.checked)"><span class="slider"></span></label></div></div><div class="bg-orange-50/50 p-6 rounded-2xl border-4 border-orange-100/50"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><div class="p-3 rounded-xl bg-orange-100 text-orange-600"><span class="text-2xl leading-none filter drop-shadow-sm">🎯</span></div><div><h3 class="font-black text-slate-900">Checkpoint</h3><p class="text-xs font-bold text-orange-500 uppercase">Bloque la suite</p></div></div><label class="switch"><input type="checkbox" ${lesson.validationRequired ? 'checked' : ''} onchange="toggleLessonValidation(${lesson.id}, this.checked)"><span class="slider"></span></label></div></div><div class="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200"><div class="flex items-center gap-2 mb-4 opacity-80"><i data-lucide="video" class="w-4 h-4"></i><span class="text-xs font-black uppercase tracking-widest">Intégration Vidéo</span></div><div class="bg-indigo-800/50 p-4 rounded-xl border border-indigo-400/30"><label class="block text-[10px] uppercase font-bold text-indigo-200 mb-1">ID Wistia</label><input type="text" value="${lesson.wistiaId || ''}" oninput="updateLessonWistia(${lesson.id}, this.value)" class="w-full bg-transparent border-none text-white font-mono text-lg focus:outline-none placeholder:text-indigo-400" placeholder="ex: 30q789" /></div></div><div class="border-t border-slate-100 pt-6"><div class="flex items-center justify-between mb-4"><span class="text-xs font-black uppercase text-slate-400 tracking-widest">Fichiers joints</span><button onclick="addFile(${lesson.id})" class="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">+ Ajouter</button></div><div class="space-y-2">${lesson.files.map(f => `<div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm"><div class="flex items-center gap-3 overflow-hidden"><div class="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0"><i data-lucide="file" class="w-4 h-4"></i></div><span class="text-sm font-bold text-slate-700 truncate">${f.name}</span></div><button onclick="removeFile(${lesson.id}, '${f.name}')" class="text-slate-300 hover:text-red-500 p-1"><i data-lucide="trash" class="w-4 h-4"></i></button></div>`).join('')}</div></div></div></div><footer class="p-6 border-t bg-slate-50 flex justify-end"><button onclick="closeEditor()" class="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:translate-y-[-2px] transition-all">Enregistrer & Fermer</button></footer></div></div>`;
}

function updateNavState() {
    const desktopContainer = document.getElementById('desktop-menu-items');
    const adminContainer = document.getElementById('admin-menu-items');
    const mobileContainer = document.getElementById('mobile-nav');
    const isAdmin = getCurrentUser().role === 'admin';
    const navButton = (view, icon, label) => `<button onclick="setView('${view}')" class="group flex flex-col items-center gap-1.5 w-full relative"><div class="p-3 rounded-xl transition-all ${state.currentView === view ? 'bg-orange-50 text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}"><i data-lucide="${icon}" class="w-6 h-6 ${state.currentView === view ? 'stroke-[2.5px]' : ''}"></i></div><span class="text-[10px] font-black uppercase tracking-widest ${state.currentView === view ? 'text-orange-600' : 'text-slate-300 group-hover:text-slate-400'}">${label}</span>${state.currentView === view ? '<div class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-l-full"></div>' : ''}</button>`;
    const navButtonMobile = (view, icon) => `<button onclick="setView('${view}')" class="${state.currentView === view ? 'text-orange-600' : 'text-slate-400'}"><i data-lucide="${icon}"></i></button>`;

    if (desktopContainer) {
        desktopContainer.innerHTML = `${navButton('dashboard', 'layout-grid', 'Accueil')}${navButton('classroom', 'graduation-cap', 'Cours')}${navButton('profile', 'user', 'Compte')}`;
    }
    if (adminContainer && isAdmin) {
        // Ajout du bouton "God Mode" (Activity)
        adminContainer.innerHTML = `<button onclick="setView('admin-tracking')" class="p-3 rounded-xl transition-all group relative ${state.currentView === 'admin-tracking' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'}" title="Suivi Global"><i data-lucide="activity" class="w-6 h-6"></i></button><button onclick="setView('admin-students')" class="p-3 rounded-xl transition-all group relative ${state.currentView === 'admin-students' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'}" title="Gestion Élèves"><i data-lucide="users" class="w-6 h-6"></i></button><button onclick="setView('admin')" class="p-3 rounded-xl transition-all group relative ${state.currentView === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'}" title="Éditeur de contenu"><i data-lucide="edit" class="w-6 h-6"></i></button>`;
    }
    if (mobileContainer) {
        mobileContainer.innerHTML = `${navButtonMobile('dashboard', 'layout-grid')}${navButtonMobile('classroom', 'graduation-cap')}${isAdmin ? navButtonMobile('admin-tracking', 'activity') : ''}${navButtonMobile('profile', 'user')}`;
    }
}

function render() {
  const root = document.getElementById('root');
  if(!root) return;
  if(!state.currentUser) { root.innerHTML = renderLogin(); if (window.lucide) window.lucide.createIcons(); return; }
  const currentUser = getCurrentUser();
  const isAdmin = currentUser.role === 'admin';
  let content = '';
  switch(state.currentView) {
    case 'dashboard': content = renderDashboard(); break;
    case 'classroom': content = renderClassroom(); break;
    case 'admin': content = isAdmin ? renderAdmin() : renderDashboard(); break;
    case 'admin-students': content = isAdmin ? renderStudentManagement() : renderDashboard(); break;
    case 'admin-tracking': content = isAdmin ? renderAdminTracking() : renderDashboard(); break;
    case 'profile': content = renderProfile(); break;
    default: content = renderDashboard();
  }
  if (!document.getElementById('app-shell')) { root.innerHTML = renderShell(currentUser, content, isAdmin); updateNavState(); } else { updateNavState(); document.getElementById('main-content').innerHTML = content; }
  if(state.editingLessonId) { const editor = document.createElement('div'); editor.innerHTML = renderLessonEditor(); const existingEditor = document.querySelector('.fixed.inset-0.z-\\[100\\]'); if(!existingEditor) document.body.appendChild(editor.firstElementChild); } else { const existingEditor = document.querySelector('.fixed.inset-0.z-\\[100\\]'); if(existingEditor) existingEditor.remove(); }
  if (window.lucide) window.lucide.createIcons();
}
render();
