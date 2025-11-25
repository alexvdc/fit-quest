import { CARDS_DATABASE, BOSSES_DATA, CARD_TYPES, RARITY_CONFIG, WEEKLY_SCHEDULE } from '../data/fitquest.js';
import { getSave, saveGame } from './store.js';

export class GameSession {
    constructor() {
        this.state = getSave();
        this.bossHp = 300;
        this.maxBossHp = 300;
        this.activeCard = null;
        this.timerInterval = null;
    }

    init() {
        if (!document.getElementById('arena')) return;
        console.log("🎮 GameSession: Initialisation...");
        
        // Afficher le thème du jour dans l'UI si possible
        this.showDailyTheme();
        this.updateWeekBar(); // <-- NOUVEL APPEL

        this.spawnBoss();
        this.dealHand();
        this.updateUI();
        this.bindModalEvents();
    }

    // --- GESTION BARRE SEMAINE ---
    updateWeekBar() {
        const today = new Date().getDay(); // 0 (Dim) à 6 (Sam)
        const days = document.querySelectorAll('.week-bar .day');
        
        days.forEach(dayEl => {
            const dayIndex = parseInt(dayEl.getAttribute('data-d'));
            if (dayIndex === today) {
                dayEl.classList.add('active');
            } else {
                dayEl.classList.remove('active');
            }
        });
    }

    showDailyTheme() {
        const today = new Date().getDay();
        const schedule = WEEKLY_SCHEDULE[today];
        // Si tu as un élément pour afficher le thème, on l'utilise
        // Sinon on pourrait l'ajouter plus tard dans le HUD
        console.log(`📅 Programme du jour : ${schedule.name} (${schedule.desc})`);
    }

    // ... (Méthodes bindModalEvents, upgradeCard, ascendCard... restent identiques)
    // JE GARDE LA STRUCTURE POUR NE PAS CASSER LE RESTE
    
    bindModalEvents() {
        const btnComplete = document.getElementById('btnComplete');
        const btnCancel = document.getElementById('btnCancel');
        if(btnComplete) btnComplete.onclick = () => this.completeTraining();
        if(btnCancel) btnCancel.onclick = () => this.closeModal();
    }

    getUpgradeCost(level) { return Math.floor(100 * Math.pow(1.2, level - 1)); }

    upgradeCard(cardData, cardElement) {
        const lvl = this.state.cardLevels[cardData.id] || 1;
        const cost = this.getUpgradeCost(lvl);
        if (this.state.gold >= cost) {
            this.state.gold -= cost;
            this.state.cardLevels[cardData.id] = lvl + 1;
            saveGame(this.state);
            this.refreshCardUI(cardData, cardElement);
        } else { alert(`Pas assez d'or !`); }
    }

    getAscensionInfo(currentRarity) {
        const nextMap = { 'common': 'rare', 'rare': 'epic', 'epic': 'legendary' };
        const costMap = { 'common': 500, 'rare': 2500, 'epic': 10000 };
        const next = nextMap[currentRarity];
        return next ? { rarity: next, cost: costMap[currentRarity] } : null;
    }

    ascendCard(cardData, cardElement) {
        const currentRarity = this.state.cardRarity[cardData.id] || 'common';
        const ascension = this.getAscensionInfo(currentRarity);
        if (!ascension) return;
        if (this.state.gold >= ascension.cost) {
            this.state.gold -= ascension.cost;
            this.state.cardRarity[cardData.id] = ascension.rarity;
            saveGame(this.state);
            this.refreshCardUI(cardData, cardElement);
        } else { alert(`Pas assez d'or !`); }
    }

    refreshCardUI(cardData, cardElement) {
        if (cardElement) cardElement.replaceWith(this.createCardDOM(cardData, true));
        const colGold = document.getElementById('collectionGold');
        if(colGold) colGold.innerText = this.state.gold;
    }

    // --- CRÉATION CARTE (HOLO) ---
    createCardDOM(cardData, isCollection = true) {
        // ... Code de création identique à la version précédente ...
        // Je réutilise le code exact pour ne pas perdre l'effet holo
        const lvl = this.state.cardLevels[cardData.id] || 1;
        const rarity = this.state.cardRarity[cardData.id] || 'common';
        const typeInfo = CARD_TYPES[cardData.type];
        let dmg = Math.floor((cardData.baseDmg + (lvl-1)*cardData.dmgScale) * RARITY_CONFIG[rarity].multiplier);
        let cost = cardData.baseCost + (lvl-1)*cardData.costScale;
        const upgradeCost = this.getUpgradeCost(lvl);
        const canUpgrade = this.state.gold >= upgradeCost;
        const ascension = this.getAscensionInfo(rarity);
        const canAscend = ascension && this.state.gold >= ascension.cost;

        const bgGradient = `linear-gradient(135deg, ${typeInfo.color}22 0%, ${typeInfo.color}00 100%), radial-gradient(circle at 50% 30%, #202025 0%, #101012 100%)`;
        const bgIcon = `<i data-lucide="${typeInfo.icon || 'activity'}" class="bg-icon" style="color:${typeInfo.color}"></i>`;

        const el = document.createElement('div');
        el.className = `card ${rarity}`;
        el.style.setProperty('--card-color', typeInfo.color);
        
        let html = `
            <div class="card-inner" style="background: ${bgGradient}">
                <div class="card-cost" style="border-color:${typeInfo.color}">${cost} ${cardData.unit === 'Sec' ? 's' : ''}</div>
                <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.6); padding:2px 8px; border-radius:10px; font-size:0.7rem; color:#fff; border:1px solid rgba(255,255,255,0.2); z-index:5;">LVL ${lvl}</div>
                <div class="card-visual">${bgIcon}<div class="card-overlay"></div></div>
                <div class="card-content">
                    <div>
                        <div class="card-type" style="color:${typeInfo.color}"><i data-lucide="${typeInfo.icon || 'activity'}" width="12"></i> ${typeInfo.label}</div>
                        <div class="card-title">${cardData.name}</div>
                        <div class="card-desc">${cardData.desc}</div>
                    </div>
                    <div style="font-weight:800; font-size:1.6rem; color:${typeInfo.color}; text-shadow: 0 0 10px ${typeInfo.color}40;">${dmg}</div>
                </div>
                <div class="card-shine"></div>`;

        if (isCollection) {
            html += `
                <div style="padding:10px; background:rgba(0,0,0,0.4); border-top:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; gap:5px; z-index:20; position:relative;">
                    <button class="btn-upgrade" style="width:100%; padding:6px; background:${canUpgrade ? '#333' : '#1a1a1a'}; color:${canUpgrade ? '#fff' : '#555'}; border:1px solid ${canUpgrade ? '#555' : '#333'}; border-radius:6px; font-family:'Rajdhani'; font-weight:700; cursor:${canUpgrade ? 'pointer' : 'not-allowed'}; display:flex; justify-content:space-between; font-size:0.8rem;">
                        <span>+1 NIV</span><span>${upgradeCost} 💰</span>
                    </button>
                    ${ascension ? `<button class="btn-ascend" style="width:100%; padding:8px; background:${canAscend ? RARITY_CONFIG[ascension.rarity].color+'44' : '#1a1a1a'}; color:${canAscend ? '#fff' : '#555'}; border:1px solid ${canAscend ? RARITY_CONFIG[ascension.rarity].color : '#333'}; border-radius:6px; font-family:'Rajdhani'; font-weight:800; cursor:${canAscend ? 'pointer' : 'not-allowed'}; display:flex; justify-content:center; align-items:center; gap:5px; font-size:0.8rem; text-transform:uppercase;"><span>ÉVOLUER ${RARITY_CONFIG[ascension.rarity].name}</span></button>` : `<div style="text-align:center; color:${RARITY_CONFIG['legendary'].color}; font-size:0.7rem; font-weight:bold; padding:5px;">RARITÉ MAX</div>`}
                </div>`;
        }
        html += `</div>`;
        el.innerHTML = html;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const mx = (x / rect.width) * 100;
            const my = (y / rect.height) * 100;
            const rx = (y - rect.height/2)/-12;
            const ry = (x - rect.width/2)/12;
            el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05)`;
            el.style.setProperty('--mx', `${mx}%`);
            el.style.setProperty('--my', `${my}%`);
        });
        el.addEventListener('mouseleave', () => { el.style.transform = 'perspective(1000px) scale(1)'; el.style.setProperty('--mx', '50%'); el.style.setProperty('--my', '50%'); });
        setTimeout(() => { if(window['lucide']) window['lucide'].createIcons({ root: el }); }, 0);

        if (isCollection) {
            const btnUp = el.querySelector('.btn-upgrade');
            const btnAsc = el.querySelector('.btn-ascend');
            if(btnUp) btnUp.onclick = (e) => { e.stopPropagation(); this.upgradeCard(cardData, el); };
            if(btnAsc) btnAsc.onclick = (e) => { e.stopPropagation(); this.ascendCard(cardData, el); };
        } else {
            el.addEventListener('click', () => { this.openTraining(cardData, dmg, cost); });
        }
        return el;
    }

    // ... (openTraining, startTimer, formatTime, closeModal identiques) ...
    openTraining(card, dmg, cost) {
        this.activeCard = { ...card, finalDmg: dmg };
        const modal = document.getElementById('trainingModal');
        if(!modal) return;
        const title = document.getElementById('modalTitle');
        const tuto = document.getElementById('modalTutorial');
        const instruc = document.getElementById('modalInstruction');
        const timerBox = document.getElementById('timerContainer');
        const timerDisplay = document.getElementById('modalTimer');
        const btn = document.getElementById('btnComplete');
        if(title) title.innerText = card.name;
        if(tuto) tuto.innerText = card.tutorial;
        if(instruc) instruc.innerText = `${cost} ${card.unit}`;
        if (card.duration) {
            if(timerBox) timerBox.classList.remove('hidden');
            if(btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.innerText = "PRÉPAREZ-VOUS..."; }
            if(timerDisplay && btn) this.startTimer(cost, timerDisplay, btn);
        } else {
            if(timerBox) timerBox.classList.add('hidden');
            if(btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "J'AI FINI MES REPS"; }
        }
        modal.classList.add('active');
    }

    startTimer(seconds, display, btn) {
        let left = seconds;
        display.innerText = this.formatTime(left);
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            left--;
            display.innerText = this.formatTime(left);
            if(left <= 0) {
                clearInterval(this.timerInterval);
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.innerText = "VALIDER";
                if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }
        }, 1000);
    }
    formatTime(s) { const m = Math.floor(s/60); const sec = s%60; return `${m}:${sec < 10 ? '0'+sec : sec}`; }
    closeModal() {
        const modal = document.getElementById('trainingModal');
        if(modal) modal.classList.remove('active');
        if(this.timerInterval) clearInterval(this.timerInterval);
        this.activeCard = null;
    }

    completeTraining() {
        if(!this.activeCard) return;
        
        this.bossHp -= this.activeCard.finalDmg;
        this.state.gold += 20; 
        this.state.playerXp = (this.state.playerXp || 0) + 50;

        const bossContainer = document.getElementById('bossContainer');
        if(bossContainer) {
            bossContainer.style.transform = "scale(0.9) rotate(5deg)";
            bossContainer.style.filter = "sepia(1) hue-rotate(-50deg) saturate(5)"; 
            setTimeout(() => {
                bossContainer.style.transform = "scale(1)";
                bossContainer.style.filter = "none";
            }, 300);
        }

        saveGame(this.state);

        if(this.bossHp <= 0) {
            this.state.level++;
            saveGame(this.state);
            alert("BOSS VAINCU ! NIVEAU SUIVANT !");
            window.location.reload();
        } else {
            this.updateUI();
            this.dealHand();
        }
        this.closeModal();
    }

    spawnBoss() {
        const bossEl = document.getElementById('bossName');
        if(!bossEl) return;
        
        // SÉCURITÉ 1 : On force le niveau à 1 s'il est invalide (0, null, undefined)
        let lvl = this.state.level;
        if (!lvl || lvl < 1) lvl = 1; 

        // SÉCURITÉ 2 : Fallback si l'index dépasse le tableau
        const bossIndex = (lvl - 1) % BOSSES_DATA.length;
        const boss = BOSSES_DATA[bossIndex] || BOSSES_DATA[0]; 

        // SÉCURITÉ 3 : Si malgré tout boss est vide (impossible normalement), on return
        if (!boss) {
            console.error("Erreur critique: Données boss introuvables");
            return;
        }

        this.maxBossHp = Math.floor((300 + (lvl * 50)) * boss.hpMultiplier);
        this.bossHp = this.maxBossHp;
        bossEl.innerText = boss.name;
        
        const img = document.getElementById('bossImage');
        // if(img) img.src = `https://images.unsplash.com/photo-1620570623421-26c94843d920?w=500&q=80`;
        if(img) img.src = `${boss.artQuery || 'dark'}`;
    }

    // --- DEAL HAND INTELLIGENTE (GAME MASTER) ---
    dealHand() {
        const hand = document.getElementById('handArea');
        if(!hand) return;
        hand.innerHTML = '';

        // 1. Récupérer la config
        const today = new Date().getDay();
        const dailySchedule = WEEKLY_SCHEDULE[today];
        const activeDeckIds = this.state.activeDeck || [];
        
        // Obtenir les objets cartes complets du deck joueur
        let playerDeck = CARDS_DATABASE.filter(c => activeDeckIds.includes(c.id));
        
        // Fallback si deck vide
        if(playerDeck.length === 0) {
            playerDeck = CARDS_DATABASE.filter(c => c.unlockLevel === 1);
        }

        // 2. Préparer la main
        const handCards = [];

        // 3. Essayer de trouver une carte "Focus du Jour"
        const focusCards = playerDeck.filter(c => dailySchedule.focus.includes(c.type));
        
        if (focusCards.length > 0) {
            // On prend 1 carte du focus au hasard
            const randomFocus = focusCards[Math.floor(Math.random() * focusCards.length)];
            handCards.push(randomFocus);
        }

        // 4. Compléter la main avec des cartes aléatoires (sans doublons)
        // On essaye de remplir jusqu'à 3 cartes
        let attempts = 0;
        while (handCards.length < 3 && attempts < 20) {
            const randomCard = playerDeck[Math.floor(Math.random() * playerDeck.length)];
            
            // Vérifier si pas déjà dans la main
            const alreadyInHand = handCards.some(c => c.id === randomCard.id);
            
            if (!alreadyInHand) {
                handCards.push(randomCard);
            }
            attempts++;
        }

        // 5. Afficher
        handCards.forEach(card => {
            // On crée la carte en mode "JEU" (false)
            hand.appendChild(this.createCardDOM(card, false));
        });
    }

    updateUI() {
        const hpFill = document.getElementById('hpFill');
        const hpText = document.getElementById('bossHpText');
        const goldText = document.getElementById('gameGold');
        if(hpFill) hpFill.style.width = `${(this.bossHp/this.maxBossHp)*100}%`;
        if(hpText) hpText.innerText = `${Math.max(0,this.bossHp)} / ${this.maxBossHp}`;
        if(goldText) goldText.innerText = this.state.gold;
    }
}