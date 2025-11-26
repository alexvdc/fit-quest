export const ACHIEVEMENTS = [
    { id: 'first_blood', title: 'Premier Pas', desc: 'Terminer 1 séance', icon: 'footprints', check: (stats, state) => stats.totalSessions >= 1 },
    { id: 'warmup', title: 'Échauffé', desc: 'Atteindre le niveau 3', icon: 'flame', check: (stats, state) => state.playerLevel >= 3 },
    { id: 'centurion', title: 'Centurion', desc: 'Faire 100 répétitions', icon: 'biceps-flexed', check: (stats, state) => stats.totalReps >= 100 },
    { id: 'tank', title: 'Machine', desc: 'Brûler 500 kcal', icon: 'zap', check: (stats, state) => stats.totalCalories >= 500 },
    { id: 'rich', title: 'Investisseur', desc: 'Posséder 500 Or', icon: 'coins', check: (stats, state) => state.gold >= 500 },
    { id: 'veteran', title: 'Vétéran', desc: 'Atteindre le niveau 10', icon: 'crown', check: (stats, state) => state.playerLevel >= 10 }
];