export const CARD_TYPES = {
    STR: { label: "Force", color: "#ef4444", icon: "dumbbell" }, 
    AGI: { label: "Cardio", color: "#3b82f6", icon: "wind" }, 
    DEF: { label: "Gainage", color: "#10b981", icon: "shield" },
    ULT: { label: "Ultime", color: "#facc15", icon: "zap" }
};

export const RARITY_CONFIG = {
    common: { name: "Commune", multiplier: 1, color: "#71717a" },
    rare: { name: "Rare", multiplier: 1.3, color: "#3b82f6" },
    epic: { name: "Épique", multiplier: 1.6, color: "#a855f7" },
    legendary: { name: "Légendaire", multiplier: 2.2, color: "#fbbf24" }
};

export const LEVEL_CURVE = [
    0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 6000, 8000, 10000
];

// --- PROGRAMME HEBDOMADAIRE ---
// 0 = Dimanche, 1 = Lundi, ...
export const WEEKLY_SCHEDULE = [
    { name: "Dimanche Détente", focus: ['DEF', 'AGI'], desc: "Récupération active et souplesse." },
    { name: "Lundi Force", focus: ['STR'], desc: "On commence la semaine en puissance." },
    { name: "Mardi Cardio", focus: ['AGI'], desc: "Faites monter le rythme cardiaque." },
    { name: "Mercredi Gainage", focus: ['DEF'], desc: "Renforcement de la ceinture abdominale." },
    { name: "Jeudi Jambes", focus: ['STR', 'AGI'], desc: "Mélange explosif pour le bas du corps." },
    { name: "Vendredi Guerrier", focus: ['STR', 'DEF'], desc: "Force et stabilité avant le week-end." },
    { name: "Samedi Mix", focus: ['STR', 'AGI', 'DEF'], desc: "Tout est permis !" }
];

export const BOSSES_DATA = [
    { name: "Golem de Sédentarité", hpMultiplier: 1, artQuery: "/boss/golem.webp" },
    { name: "L'Hydre du Stress", hpMultiplier: 1.2, artQuery: "boss/hydre.webp" },
    { name: "Spectre de la Flemme", hpMultiplier: 0.9, artQuery: "boss/spectre.webp" },
    { name: "Titan de la Malbouffe", hpMultiplier: 1.5, artQuery: "boss/titan.webp" },
    { name: "Le Roi du Canapé", hpMultiplier: 2.0, artQuery: "boss/king.webp" }
];

export const CARDS_DATABASE = [
    // --- NIVEAU 1 (Départ) ---
    { id: 'squats', name: 'Squats', type: 'STR', unit: 'Reps', desc: 'Jambes en béton.', baseDmg: 35, dmgScale: 10, baseCost: 15, costScale: 5, unlockLevel: 1, tutorial: "Dos droit, fesses en arrière." },
    { id: 'jacks', name: 'Jumping Jacks', type: 'AGI', unit: 'Reps', desc: 'Cardio fun.', baseDmg: 25, dmgScale: 5, baseCost: 20, costScale: 5, unlockLevel: 1, tutorial: "Ecartez bras et jambes en sautant." },
    { id: 'plank', name: 'Planche', type: 'DEF', unit: 'Sec', duration: true, desc: 'Gainage total.', baseDmg: 40, dmgScale: 15, baseCost: 20, costScale: 10, unlockLevel: 1, tutorial: "Sur les coudes, corps aligné." },
    { id: 'knee_pushups', name: 'Pompes Genoux', type: 'STR', unit: 'Reps', desc: 'Haut du corps.', baseDmg: 30, dmgScale: 8, baseCost: 10, costScale: 2, unlockLevel: 1, tutorial: "Sur les genoux, poitrine au sol." },

    // --- NIVEAU 2 ---
    { id: 'lunges', name: 'Fentes', type: 'STR', unit: 'Reps', desc: 'Unilatéral.', baseDmg: 45, dmgScale: 12, baseCost: 10, costScale: 2, unlockLevel: 2, tutorial: "Un grand pas en avant, descendez." },
    { id: 'high_knees', name: 'Montées Genoux', type: 'AGI', unit: 'Sec', duration: true, desc: 'Sprint sur place.', baseDmg: 35, dmgScale: 10, baseCost: 20, costScale: 5, unlockLevel: 2, tutorial: "Genoux hauteur bassin, rythme rapide." },
    { id: 'glute_bridge', name: 'Pont Fessier', type: 'DEF', unit: 'Reps', desc: 'Chaîne postérieure.', baseDmg: 35, dmgScale: 10, baseCost: 15, costScale: 5, unlockLevel: 2, tutorial: "Dos au sol, levez le bassin." },

    // --- NIVEAU 3 ---
    { id: 'pushups', name: 'Pompes', type: 'STR', unit: 'Reps', desc: 'Classique.', baseDmg: 50, dmgScale: 15, baseCost: 10, costScale: 2, unlockLevel: 3, tutorial: "Corps gainé, poitrine frôle le sol." },
    { id: 'wall_sit', name: 'La Chaise', type: 'DEF', unit: 'Sec', duration: true, desc: 'Isométrie cuisses.', baseDmg: 45, dmgScale: 12, baseCost: 30, costScale: 10, unlockLevel: 3, tutorial: "Dos au mur, cuisses parallèles au sol." },
    { id: 'skaters', name: 'Patineurs', type: 'AGI', unit: 'Reps', desc: 'Agilité latérale.', baseDmg: 40, dmgScale: 10, baseCost: 20, costScale: 5, unlockLevel: 3, tutorial: "Sautez d'un pied sur l'autre latéralement." },

    // --- NIVEAU 4 (Haltères optionnels) ---
    { id: 'bicep_curl', name: 'Curl Biceps', type: 'STR', unit: 'Reps', desc: 'Avec poids/eau.', baseDmg: 40, dmgScale: 10, baseCost: 12, costScale: 2, unlockLevel: 4, tutorial: "Contrôlez la montée et la descente." },
    { id: 'shadow_box', name: 'Shadow Box', type: 'AGI', unit: 'Sec', duration: true, desc: 'Combat.', baseDmg: 40, dmgScale: 10, baseCost: 30, costScale: 15, unlockLevel: 4, tutorial: "Enchaînez les coups dans le vide." },
    { id: 'superman', name: 'Superman', type: 'DEF', unit: 'Sec', duration: true, desc: 'Lombaires.', baseDmg: 45, dmgScale: 10, baseCost: 20, costScale: 5, unlockLevel: 4, tutorial: "Au sol, levez bras et jambes tendus." },

    // --- NIVEAU 5+ ---
    { id: 'burpees', name: 'Burpees', type: 'AGI', unit: 'Reps', desc: 'Explosif.', baseDmg: 80, dmgScale: 25, baseCost: 5, costScale: 2, unlockLevel: 5, tutorial: "Sol > Pompe > Saut. Courage !" },
    { id: 'side_plank', name: 'Gainage Latéral', type: 'DEF', unit: 'Sec', duration: true, desc: 'Obliques.', baseDmg: 50, dmgScale: 12, baseCost: 20, costScale: 5, unlockLevel: 5, tutorial: "En appui sur un avant-bras." },
    { id: 'diamond_pushups', name: 'Pompes Diamant', type: 'STR', unit: 'Reps', desc: 'Triceps focus.', baseDmg: 60, dmgScale: 18, baseCost: 8, costScale: 2, unlockLevel: 6, tutorial: "Mains jointes sous la poitrine." },
    { id: 'mountain_climber', name: 'Mtn Climber', type: 'AGI', unit: 'Sec', duration: true, desc: 'Intensité.', baseDmg: 50, dmgScale: 12, baseCost: 20, costScale: 10, unlockLevel: 6, tutorial: "Position pompe, courir au sol." },
    { id: 'jump_squats', name: 'Squats Sautés', type: 'STR', unit: 'Reps', desc: 'Puissance.', baseDmg: 55, dmgScale: 15, baseCost: 10, costScale: 5, unlockLevel: 7, tutorial: "Squat + extension explosive." }
];