import { CARDS_DATABASE, BOSSES_DATA, CARD_TYPES, RARITY_CONFIG, WEEKLY_SCHEDULE, QUEST_DATABASE, WORLD_MAP, SHOP_ITEMS } from '../data/fitquest.js';
import { getSave, saveGame, getGlobalStats } from './store.js';
import { ACHIEVEMENTS } from '../data/achievements.js';

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
        
        this.showDailyTheme();
        this.updateWeekBar();

        this.spawnBoss();
        this.dealHand();
        this.updateUI();
        this.bindModalEvents();
    }

    updateWeekBar() {
        const today = new Date().getDay();
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
        console.log(`📅 Programme du jour : ${schedule.name} (${schedule.desc})`);
    }

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

    createCardDOM(cardData, isCollection = true) {
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

    openTraining(card, dmg, cost) {
        this.activeCard = { ...card, finalDmg: dmg, finalCost: cost };
        
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

    updateQuests(card, calories, goldEarned) {
        if (!this.state.dailyQuests || !this.state.dailyQuests.quests) return;

        let hasUpdate = false;
        
        this.state.dailyQuests.quests.forEach(userQuest => {
            if (userQuest.claimed) return; 

            const questDef = QUEST_DATABASE.find(q => q.id === userQuest.id);
            if (!questDef) return;

            if (questDef.type === 'count_type' && questDef.filter === card.type) {
                userQuest.progress += 1;
                hasUpdate = true;
            }
            else if (questDef.type === 'reps' && card.unit === 'Reps') {
                userQuest.progress += card.finalCost; 
                hasUpdate = true;
            }
            else if (questDef.type === 'calories') {
                userQuest.progress += calories;
                hasUpdate = true;
            }
            else if (questDef.type === 'gold') {
                userQuest.progress += goldEarned;
                hasUpdate = true;
            }
            else if (questDef.type === 'damage') {
                userQuest.progress += card.finalDmg;
                hasUpdate = true;
            }

            if (userQuest.progress > questDef.target) userQuest.progress = questDef.target;
        });

        if (hasUpdate) saveGame(this.state);
    }

    checkAchievements() {
        const stats = getGlobalStats(this.state);
        let hasNew = false;
        if (!this.state.unlockedAchievements) this.state.unlockedAchievements = [];
        ACHIEVEMENTS.forEach(ach => {
            if (!this.state.unlockedAchievements.includes(ach.id)) {
                if (ach.check(stats, this.state)) {
                    this.state.unlockedAchievements.push(ach.id);
                    this.showToast(ach);
                    hasNew = true;
                }
            }
        });
        if (hasNew) saveGame(this.state);
    }

    showToast(ach) {
        const container = document.body;
        const div = document.createElement('div');
        div.className = 'achievement-toast';
        div.innerHTML = `<div class="toast-icon"><i data-lucide="${ach.icon}"></i></div><div class="toast-content"><div class="toast-title">SUCCÈS DÉBLOQUÉ !</div><div class="toast-name">${ach.title}</div></div>`;
        container.appendChild(div);
        if(window['lucide']) window['lucide'].createIcons({ root: div });
        setTimeout(() => div.classList.add('show'), 100);
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 500); }, 4000);
    }

    completeTraining() {
        if(!this.activeCard) return;

        const hand = document.getElementById('handArea');
        let cardEl = null;
        if (hand) {
            const cards = hand.querySelectorAll('.card');
            cards.forEach(c => {
                if (c.querySelector('.card-title').innerText === this.activeCard.name) {
                    cardEl = c;
                }
            });
        }

        this.animateCardThrow(cardEl, () => {
            // Trigger boss damage animation
            this.animateBossDamage(this.activeCard.finalDmg);
            
            this.bossHp -= this.activeCard.finalDmg;
            this.state.gold += 20; 
            this.state.playerXp = (this.state.playerXp || 0) + 50;

            const weight = this.state.userData?.weight || 75;
            const met = this.activeCard.met || 4.0;
            let durationMinutes = (this.activeCard.unit === 'Sec') ? this.activeCard.finalCost / 60 : (this.activeCard.finalCost * 3) / 60;
            const calories = Math.round((met * 3.5 * weight) / 200 * durationMinutes);

            if (!this.state.history) this.state.history = [];
            this.state.history.unshift({ date: Date.now(), name: this.activeCard.name, value: this.activeCard.finalCost, unit: this.activeCard.unit, xp: 50, calories: calories });
            if (this.state.history.length > 50) this.state.history.pop();

            this.updateQuests(this.activeCard, calories, 20);

            const bossContainer = document.getElementById('bossContainer');
            if(bossContainer) {
                bossContainer.style.transform = "scale(0.9) rotate(5deg)";
                setTimeout(() => bossContainer.style.transform = "scale(1)", 300);
            }
            
            saveGame(this.state);
            this.checkAchievements();

            if(this.bossHp <= 0) {
                const urlParams = new URLSearchParams(window.location.search);
                const stageId = parseInt(urlParams.get('stage'));

                if (stageId) {
                    const stage = WORLD_MAP.find(s => s.id === stageId);
                    const reward = stage ? stage.goldReward : 50;
                    
                    this.state.gold += reward;
                    
                    if (this.state.maxStage <= stageId) {
                        this.state.maxStage = stageId + 1;
                    }
                    
                    saveGame(this.state);
                    alert(`VICTOIRE ! +${reward} OR ! Stage suivant débloqué !`);
                    window.location.href = '/map';
                } else {
                    this.state.level++;
                    saveGame(this.state);
                    alert("BOSS VAINCU ! NIVEAU SUIVANT !");
                    window.location.reload();
                }
            } else {
                this.updateUI();
                this.dealHand();
            }
        });
        
        this.closeModal();
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



    spawnBoss() {
        const bossEl = document.getElementById('bossName');
        if(!bossEl) return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const stageId = parseInt(urlParams.get('stage'));
        
        let boss;
        let hpMult = 1;

        if (stageId) {
            const stage = WORLD_MAP.find(s => s.id === stageId);
            if (stage) {
                boss = BOSSES_DATA[stage.bossIndex];
                hpMult = boss.hpMultiplier + (stageId * 0.2);
                console.log(`⚔️ Mode Histoire : Stage ${stageId} vs ${boss.name}`);
            }
        }

        if (!boss) {
            let lvl = this.state.level;
            if (!lvl || lvl < 1) lvl = 1; 
            const bossIndex = (lvl - 1) % BOSSES_DATA.length;
            boss = BOSSES_DATA[bossIndex] || BOSSES_DATA[0];
            hpMult = boss.hpMultiplier + (lvl * 0.1);
        }

        if (!boss) return;

        this.maxBossHp = Math.floor(300 * hpMult);
        this.bossHp = this.maxBossHp;
        bossEl.innerText = boss.name;
        
        const img = document.getElementById('bossImage');
        if(img) img.src = `${boss.artQuery || 'dark'}`;
    }

    dealHand() {
        const hand = document.getElementById('handArea');
        if(!hand) return;
        hand.innerHTML = '';

        // Récupérer le dos de carte équipé
        const equippedBackId = this.state.equipped?.cardBack || 'cb_default';
        const shopItem = SHOP_ITEMS.find(i => i.id === equippedBackId);
        const backClass = shopItem ? shopItem.cssClass : 'back-default';

        const today = new Date().getDay();
        const dailySchedule = WEEKLY_SCHEDULE[today];
        const activeDeckIds = this.state.activeDeck || [];
        
        let playerDeck = CARDS_DATABASE.filter(c => activeDeckIds.includes(c.id));
        
        if(playerDeck.length === 0) {
            playerDeck = CARDS_DATABASE.filter(c => c.unlockLevel === 1);
        }

        const handCards = [];
        
        const focusCards = playerDeck.filter(c => dailySchedule.focus.includes(c.type));
        
        if (focusCards.length > 0) {
            const randomFocus = focusCards[Math.floor(Math.random() * focusCards.length)];
            handCards.push(randomFocus);
        }

        let attempts = 0;
        while (handCards.length < 3 && attempts < 20) {
            const randomCard = playerDeck[Math.floor(Math.random() * playerDeck.length)];
            const alreadyInHand = handCards.some(c => c.id === randomCard.id);
            if (!alreadyInHand) {
                handCards.push(randomCard);
            }
            attempts++;
        }

        handCards.forEach((card, index) => {
            const cardEl = this.createCardDOM(card, false);
            
            const backEl = document.createElement('div');
            backEl.className = `card-back-face ${backClass}`;
            cardEl.appendChild(backEl);

            cardEl.classList.add('facedown');
            cardEl.classList.add('dealing');
            hand.appendChild(cardEl);

            setTimeout(() => {
                cardEl.classList.remove('dealing');
                setTimeout(() => {
                    cardEl.classList.remove('facedown');
                }, 600 + (index * 400));
            }, 100 + (index * 200));
        });
    }

    animateCardThrow(cardElement, callback) {
        if (!cardElement) { if(callback) callback(); return; }

        cardElement.classList.add('facedown');
        
        setTimeout(() => {
            cardElement.style.transition = "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
            cardElement.style.transform = "translateY(-300px) scale(0.2) rotateX(180deg)";
            cardElement.style.opacity = "0";

            setTimeout(() => {
                if(callback) callback();
                cardElement.remove();
            }, 600);
        }, 600);
    }

    animateBossDamage(amount) {
        const bossImg = document.getElementById('bossImage');
        const arena = document.getElementById('arena');
        
        // 1. Shake & Flash Boss
        if (bossImg) {
            bossImg.classList.remove('boss-hit');
            void bossImg.offsetWidth; // Trigger reflow
            bossImg.classList.add('boss-hit');

            setTimeout(() => {
                bossImg.classList.remove('boss-hit');
            }, 1000);
        }

        // 2. Floating Damage Text
        if (arena) {
            const dmgEl = document.createElement('div');
            dmgEl.className = 'damage-popup';
            dmgEl.innerText = `-${amount}`;
            arena.appendChild(dmgEl);
            
            // Remove after animation
            setTimeout(() => {
                dmgEl.remove();
            }, 1200);
        }

        // 3. Vibrate
        if (navigator.vibrate) navigator.vibrate(200);
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
