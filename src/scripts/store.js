import { CARDS_DATABASE, LEVEL_CURVE } from '../data/fitquest.js';

const KEY = 'fitquest_v9_rpg';

const defaultState = {
    gold: 0,
    playerXp: 0,         // Nouvelle stat : Expérience globale
    playerLevel: 1,      // Nouvelle stat : Niveau du joueur
    unlockedCards: ['squats', 'jacks', 'plank', 'knee_pushups'], // Deck de base
    activeDeck: ['squats', 'jacks', 'plank', 'knee_pushups'], // Cartes activées par le joueur
    
    // Stats des cartes (Niveau et Rareté individuelle)
    cardLevels: {},
    cardRarity: {}
};

export function getSave() {
    if (typeof localStorage === 'undefined') return defaultState;
    try {
        const saved = localStorage.getItem(KEY);
        let state = saved ? JSON.parse(saved) : defaultState;
        
        // Migration : Si l'ancienne save n'a pas les nouvelles stats, on fusionne
        state = { ...defaultState, ...state };
        
        // Initialiser les cartes manquantes dans les stats
        CARDS_DATABASE.forEach(c => {
            if (!state.cardLevels[c.id]) state.cardLevels[c.id] = 1;
            if (!state.cardRarity[c.id]) state.cardRarity[c.id] = 'common';
        });

        // Vérification des unlocks automatiques selon le niveau
        checkUnlocks(state);

        return state;
    } catch {
        return defaultState;
    }
}

export function saveGame(newState) {
    const current = getSave();
    const toSave = { ...current, ...newState };
    
    // Vérifier si on Level Up
    const nextLevelXp = LEVEL_CURVE[toSave.playerLevel] || 99999;
    if (toSave.playerXp >= nextLevelXp) {
        toSave.playerLevel++;
        alert(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes maintenant niveau ${toSave.playerLevel} !`);
        checkUnlocks(toSave);
    }

    localStorage.setItem(KEY, JSON.stringify(toSave));
    return toSave;
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