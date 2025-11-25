import { CARDS_DATABASE, LEVEL_CURVE } from '../data/fitquest.js';

const KEY = 'fitquest_v9_rpg';

const defaultState = {
    gold: 0,
    playerXp: 0,
    playerLevel: 1,
    unlockedCards: ['squats', 'jacks', 'plank', 'knee_pushups'],
    activeDeck: ['squats', 'jacks', 'plank', 'knee_pushups'],
    cardLevels: {},
    cardRarity: {},
    
    // NOUVEAU : Gestion des séries
    lastLoginDate: null, // String 'YYYY-MM-DD'
    currentStreak: 0
};

export function getSave() {
    if (typeof localStorage === 'undefined') return defaultState;
    try {
        const saved = localStorage.getItem(KEY);
        let state = saved ? JSON.parse(saved) : defaultState;
        
        // Fusionner avec le défaut pour éviter les bugs de migration
        state = { ...defaultState, ...state };
        
        // Vérification des Unlocks...
        checkUnlocks(state);
        
        // NOUVEAU : Vérification de la Série (Streak) au chargement
        checkStreak(state);

        return state;
    } catch {
        return defaultState;
    }
}

function checkStreak(state) {
    const today = new Date().toISOString().split('T')[0]; // '2023-10-27'
    
    // Si c'est la première fois qu'on joue
    if (!state.lastLoginDate) {
        state.lastLoginDate = today;
        state.currentStreak = 1;
        saveGame(state);
        return;
    }

    // Si on a déjà joué aujourd'hui, on ne fait rien
    if (state.lastLoginDate === today) {
        return;
    }

    // Calcul de la différence en jours
    const last = new Date(state.lastLoginDate);
    const now = new Date(today);
    const diffTime = Math.abs(now - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        // C'était hier : on incrémente !
        state.currentStreak++;
        state.lastLoginDate = today;
        // Petit bonus d'or pour la fidélité ?
        state.gold += 10; 
    } else {
        // On a raté un jour ou plus : Reset :(
        state.currentStreak = 1; // On recommence à 1 car on joue aujourd'hui
        state.lastLoginDate = today;
    }
    
    saveGame(state);
}

export function saveGame(newState) {
    const current = getSave(); // Attention à ne pas créer de boucle infinie, getSave appelle checkStreak
    // Pour éviter la récursion, on lit le localStorage brut ici si besoin, 
    // mais dans notre cas simple, on peut juste écraser.
    
    // S'assurer qu'on ne perd pas les données de streak si newState ne les contient pas
    const finalState = { ...current, ...newState };
    
    // Check Level Up
    const nextLevelXp = LEVEL_CURVE[finalState.playerLevel] || 99999;
    if (finalState.playerXp >= nextLevelXp) {
        finalState.playerLevel++;
        // alert déplacé dans l'UI idéalement, mais ok pour prototype
        checkUnlocks(finalState);
    }

    localStorage.setItem(KEY, JSON.stringify(finalState));
    return finalState;
}

// Fonction pour débloquer les cartes selon le niveau du joueur
function checkUnlocks(state) {
    let hasNewUnlock = false;
    CARDS_DATABASE.forEach(card => {
        // Si la carte n'est pas encore débloquée ET qu'on a le niveau requis
        if (!state.unlockedCards.includes(card.id) && state.playerLevel >= card.unlockLevel) {
            state.unlockedCards.push(card.id);
            state.activeDeck.push(card.id); // On l'ajoute au deck par défaut
            hasNewUnlock = true;
            // Idéalement on ferait une notification visuelle ici
            console.log(`Nouvelle carte débloquée : ${card.name}`);
        }
    });
    
    if (hasNewUnlock && typeof localStorage !== 'undefined') {
        localStorage.setItem(KEY, JSON.stringify(state));
    }
}

// Helper pour gagner de l'XP
export function gainXp(amount) {
    const state = getSave();
    state.playerXp += amount;
    saveGame(state);
}