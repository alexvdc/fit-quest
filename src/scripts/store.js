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
    lastLoginDate: null,
    currentStreak: 0,
    
    // NOUVEAU : Historique des entraînements
    history: [] 
};

export function getSave() {
    if (typeof localStorage === 'undefined') return defaultState;
    try {
        const saved = localStorage.getItem(KEY);
        let state = saved ? JSON.parse(saved) : defaultState;
        
        // Fusionner avec le défaut pour s'assurer que 'history' existe
        state = { ...defaultState, ...state };
        
        checkUnlocks(state);
        checkStreak(state);

        return state;
    } catch {
        return defaultState;
    }
}

// NOUVEAU : Calcul des statistiques globales
export function getGlobalStats(state) {
    const history = state.history || [];
    let totalReps = 0;
    let totalSeconds = 0;
    
    history.forEach(entry => {
        if (entry.unit === 'Sec') {
            totalSeconds += entry.value;
        } else {
            totalReps += entry.value;
        }
    });

    return {
        totalSessions: history.length,
        totalReps: totalReps,
        totalMinutes: Math.floor(totalSeconds / 60)
    };
}

function checkStreak(state) {
    const today = new Date().toISOString().split('T')[0];
    
    if (!state.lastLoginDate) {
        state.lastLoginDate = today;
        state.currentStreak = 1;
        saveGame(state);
        return;
    }

    if (state.lastLoginDate === today) return;

    const last = new Date(state.lastLoginDate);
    const now = new Date(today);
    const diffTime = Math.abs(now - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        state.currentStreak++;
        state.lastLoginDate = today;
        state.gold += 10; 
    } else {
        state.currentStreak = 1;
        state.lastLoginDate = today;
    }
    
    saveGame(state);
}

export function saveGame(newState) {
    const current = getSave();
    // On préserve l'historique existant si newState ne le fournit pas explicitement
    const history = newState.history || current.history || [];
    
    const finalState = { ...current, ...newState, history };
    
    const nextLevelXp = LEVEL_CURVE[finalState.playerLevel] || 99999;
    if (finalState.playerXp >= nextLevelXp) {
        finalState.playerLevel++;
        checkUnlocks(finalState);
    }

    localStorage.setItem(KEY, JSON.stringify(finalState));
    return finalState;
}

function checkUnlocks(state) {
    let hasNewUnlock = false;
    CARDS_DATABASE.forEach(card => {
        if (!state.unlockedCards.includes(card.id) && state.playerLevel >= card.unlockLevel) {
            state.unlockedCards.push(card.id);
            state.activeDeck.push(card.id);
            hasNewUnlock = true;
        }
    });
    if (hasNewUnlock && typeof localStorage !== 'undefined') {
        localStorage.setItem(KEY, JSON.stringify(state));
    }
}

export function gainXp(amount) {
    const state = getSave();
    state.playerXp += amount;
    saveGame(state);
}