export const ACHIEVEMENTS = [
    // --- DÉBUTANT ---
    { id: 'first_blood', title: 'Premier Pas', desc: 'Terminer 1 séance', icon: 'footprints', check: (stats, state) => stats.totalSessions >= 1 },
    { id: 'warmup', title: 'Échauffé', desc: 'Atteindre le niveau 3', icon: 'flame', check: (stats, state) => state.playerLevel >= 3 },
    
    // --- VOLUME ---
    { id: 'centurion', title: 'Centurion', desc: 'Faire 100 répétitions', icon: 'biceps-flexed', check: (stats, state) => stats.totalReps >= 100 },
    { id: 'spartan', title: 'Spartiate', desc: 'Faire 300 répétitions', icon: 'swords', check: (stats, state) => stats.totalReps >= 300 },
    { id: 'titan_reps', title: 'Titan', desc: 'Faire 1000 répétitions', icon: 'dumbbell', check: (stats, state) => stats.totalReps >= 1000 },
    
    // --- CALORIES ---
    { id: 'tank', title: 'Machine', desc: 'Brûler 500 kcal', icon: 'zap', check: (stats, state) => stats.totalCalories >= 500 },
    { id: 'furnace', title: 'Fournaise', desc: 'Brûler 2000 kcal', icon: 'fire-extinguisher', check: (stats, state) => stats.totalCalories >= 2000 },

    // --- RICHESSE ---
    { id: 'rich', title: 'Investisseur', desc: 'Posséder 500 Or', icon: 'coins', check: (stats, state) => state.gold >= 500 },
    { id: 'millionaire', title: 'Millionnaire', desc: 'Posséder 2000 Or', icon: 'gem', check: (stats, state) => state.gold >= 2000 },

    // --- PROGRESSION ---
    { id: 'veteran', title: 'Vétéran', desc: 'Atteindre le niveau 10', icon: 'crown', check: (stats, state) => state.playerLevel >= 10 },
    { id: 'legend', title: 'Légende', desc: 'Atteindre le niveau 20', icon: 'trophy', check: (stats, state) => state.playerLevel >= 20 },

    // --- STREAK ---
    { id: 'dedicated', title: 'Dévoué', desc: 'Série de 3 jours', icon: 'calendar-check', check: (stats, state) => state.currentStreak >= 3 },
    { id: 'unstoppable', title: 'Inarrêtable', desc: 'Série de 7 jours', icon: 'infinity', check: (stats, state) => state.currentStreak >= 7 },

    // --- COLLECTION ---
    { id: 'collector', title: 'Collectionneur', desc: 'Débloquer 5 cartes', icon: 'library', check: (stats, state) => state.unlockedCards.length >= 5 },
    { id: 'deck_master', title: 'Maître du Deck', desc: 'Débloquer 10 cartes', icon: 'layers', check: (stats, state) => state.unlockedCards.length >= 10 }
];