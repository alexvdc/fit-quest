import { CARDS_DATABASE, LEVEL_CURVE, QUEST_DATABASE } from '../data/fitquest.js';
import { ACHIEVEMENTS } from '../data/achievements.js';

const KEY = 'fitquest_v12_1_quests'; // Nouvelle version pour migration propre

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
    history: [],
    userData: { weight: 75, height: 175 },
    unlockedAchievements: [],
    
    // NOUVEAU : Quêtes du jour
    dailyQuests: {
        date: null, // Pour savoir quand reset
        quests: []  // Liste des quêtes actives [{id, progress, claimed}]
    }
};

export function getSave() {
    if (typeof localStorage === 'undefined') return defaultState;
    try {
        const saved = localStorage.getItem(KEY);
        let state = saved ? JSON.parse(saved) : defaultState;
        state = { ...defaultState, ...state };
        
        // Patchs
        if (!state.dailyQuests) state.dailyQuests = { date: null, quests: [] };
        if (!state.unlockedAchievements) state.unlockedAchievements = [];

        checkUnlocks(state);
        checkStreak(state);
        checkDailyQuests(state); // Génération des quêtes

        return state;
    } catch {
        return defaultState;
    }
}

// NOUVEAU : Générateur de quêtes
function checkDailyQuests(state) {
    const today = new Date().toISOString().split('T')[0];
    
    // Si la date des quêtes n'est pas aujourd'hui, on reset
    if (state.dailyQuests.date !== today) {
        console.log("🔄 Génération de nouvelles quêtes pour :", today);
        
        // On mélange et on prend 3 quêtes au hasard
        const shuffled = [...QUEST_DATABASE].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        state.dailyQuests = {
            date: today,
            quests: selected.map(q => ({
                id: q.id,
                progress: 0,
                claimed: false
            }))
        };
        
        localStorage.setItem(KEY, JSON.stringify(state));
    }
}

export function getGlobalStats(state) {
    const history = state.history || [];
    let totalReps = 0, totalSeconds = 0, totalCalories = 0;
    history.forEach(entry => {
        if (entry.unit === 'Sec') totalSeconds += entry.value;
        else totalReps += entry.value;
        if (entry.calories) totalCalories += entry.calories;
    });
    return { totalSessions: history.length, totalReps: totalReps, totalMinutes: Math.floor(totalSeconds / 60), totalCalories: Math.floor(totalCalories) };
}

function checkStreak(state) {
    const today = new Date().toISOString().split('T')[0];
    if (!state.lastLoginDate) { state.lastLoginDate = today; state.currentStreak = 1; localStorage.setItem(KEY, JSON.stringify(state)); return; }
    if (state.lastLoginDate === today) return;
    const last = new Date(state.lastLoginDate);
    const now = new Date(today);
    const diffDays = Math.ceil(Math.abs(now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) { state.currentStreak++; state.gold += 10; } 
    else { state.currentStreak = 1; }
    state.lastLoginDate = today;
    localStorage.setItem(KEY, JSON.stringify(state));
}

export function saveGame(newState) {
    const current = getSave();
    const history = newState.history || current.history || [];
    const finalState = { ...current, ...newState, history };
    
    const nextLevelXp = LEVEL_CURVE[finalState.playerLevel] || 99999;
    if (finalState.playerXp >= nextLevelXp) { 
        finalState.playerLevel++; 
        checkUnlocks(finalState); 
    }
    
    // Check Achievements
    checkAchievements(finalState);

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
    if (hasNewUnlock && typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(state));
}

function checkAchievements(state) {
    if (!state.unlockedAchievements) state.unlockedAchievements = [];
    const stats = getGlobalStats(state);

    ACHIEVEMENTS.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id)) {
            if (ach.check(stats, state)) {
                state.unlockedAchievements.push(ach.id);
                
                // Dispatch event for Toast
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('achievement-unlocked', {
                        detail: { title: ach.title, icon: ach.icon }
                    }));
                }
            }
        }
    });
}

export function gainXp(amount) {
    const state = getSave();
    state.playerXp += amount;
    saveGame(state);
}