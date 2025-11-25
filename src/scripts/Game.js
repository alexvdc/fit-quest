import { CARDS_DATABASE, CARD_TYPES, BOSSES_DATA, WEEKLY_SCHEDULE, RARITY_CONFIG, ULTIMATE_CARD } from '../data/fitquest.js';

export class Game {
    constructor() {
        this.state = {
            gold: 100, // Un peu d'or au départ pour tester
            cardLevels: {},
            cardRarity: {},
            level: 1,
            bossHp: 300, 
            maxBossHp: 300,
            dayIndex: 0,
            hasUltimate: false,
            energy: 0,
            activeCard: null
        };
        this.timerInterval = null;
    }

    init() {
        console.log("🎮 FitQuest Ascension: Démarrage...");
        this.loadSave();
        this.updateDayIndex();
        window.game = this; // Expose l'instance pour les boutons onclick
        
        // Initialisation de la vue
        this.updateGoldDisplay();
        if(window.lucide) window.lucide.createIcons();
    }

    // --- NAVIGATION ---
    switchScene(sceneName) {
        document.querySelectorAll('.scene').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`scene-${sceneName}`);
        if (target) target.classList.add('active');
        
        if (sceneName === 'game') this.startCombatSession();
        if (sceneName === 'collection') this.renderCollection();
        
        setTimeout(() => { if(window.lucide) window.lucide.createIcons(); }, 100);
    }

    // --- LOGIQUE DE JEU ---
    startCombatSession() {
        this.spawnBoss();
        this.dealHand();
        this.updateCombatUI();
    }

    spawnBoss() {
        const bossIndex = (this.state.level - 1) % BOSSES_DATA.length;
        const boss = BOSSES_DATA[bossIndex];
        // Calcul PV Boss
        this.state.maxBossHp = Math.floor((300 + (this.state.level * 50)) * boss.hpMultiplier);
        this.state.bossHp = this.state.maxBossHp;

        document.getElementById('bossName').innerText = boss.name;
        document.getElementById('bossDesc').innerText = boss.desc;
        
        // Image Boss
        const img = document.getElementById('bossImage');
        img.src = `${boss.artQuery || 'dark'}`;
    }

    dealHand() {
        const hand = document.getElementById('handArea');
        hand.innerHTML = '';
        
        // Sélectionne 3 cartes au hasard
        const deck = CARDS_DATABASE;
        for(let i=0; i<3; i++) {
            const card = deck[Math.floor(Math.random() * deck.length)];
            const cardEl = this.createCardElement(card, false);
            hand.appendChild(cardEl);
        }
    }

    // --- COEUR DU DESIGN : CRÉATION DE CARTE ---
    createCardElement(cardData, isCollection = false) {
        const lvl = this.state.cardLevels[cardData.id] || 1;
        const rarity = this.state.cardRarity[cardData.id] || 'common';
        const typeInfo = CARD_TYPES[cardData.type];
        
        // Calculs stats
        let dmg = Math.floor((cardData.baseDmg + (lvl-1)*cardData.dmgScale) * RARITY_CONFIG[rarity].multiplier);
        let cost = cardData.baseCost + (lvl-1)*cardData.costScale;
        const upgradePrice = 100 * lvl;

        // Image Auto : Si pas d'image, on en génère une stylée
        const imgUrl = this.getCardImage(cardData.type, cardData.id);

        const el = document.createElement('div');
        el.className = `card ${rarity}`;
        el.style.setProperty('--card-color', typeInfo.color);

        // --- HTML COMPLEXE POUR L'EFFET HOLO ---
        el.innerHTML = `
            <div class="card-inner">
                <div class="card-image-container">
                    <img src="${imgUrl}" class="card-img" alt="${cardData.name}" loading="lazy">
                    <div class="card-image-overlay"></div>
                    <div class="card-mana" style="border-color:${typeInfo.color}">${cost}</div>
                </div>
                
                <div class="card-body">
                    <div>
                        <div class="card-type" style="color:${typeInfo.color}">
                            <i data-lucide="${typeInfo.icon}"></i> ${typeInfo.label}
                        </div>
                        <div class="card-title">${cardData.name}</div>
                        <div class="card-desc">${cardData.desc}</div>
                    </div>
                    
                    ${!isCollection ? `<div class="card-dmg" style="color:${typeInfo.color}">${dmg}</div>` : ''}
                    
                    ${isCollection ? `
                        <div style="margin-top:10px; border-top:1px solid #333; padding-top:10px; display:flex; gap:5px;">
                            <button class="upgrade-btn" style="flex:1; font-size:0.7rem; padding:5px; background:#333; color:white; border:none; border-radius:4px;">UP ${upgradePrice}$</button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- COUCHES HOLOGRAPHIQUES -->
                <div class="card-shine"></div>
                <div class="card-glare"></div>
            </div>
        `;

        // EVENTS 3D TILT
        el.addEventListener('mousemove', (e) => this.handleTilt(e, el));
        el.addEventListener('mouseleave', () => this.resetTilt(el));

        // CLIC ACTION
        if(isCollection) {
            el.querySelector('.upgrade-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.upgradeCard(cardData.id, upgradePrice);
            });
        } else {
            el.addEventListener('click', () => this.openTraining(cardData, dmg, cost));
        }

        return el;
    }

    // --- HELPER IMAGES AUTOMATIQUES ---
    getCardImage(type, id) {
        // Mots-clés pour Unsplash basés sur le type
        const keywords = {
            'STR': 'gym,weightlifting,muscles,intense,red',
            'AGI': 'running,sprinter,sneakers,speed,blue',
            'DEF': 'yoga,abs,plank,fortress,green',
            'ULT': 'lightning,galaxy,explosion,power'
        };
        
        // On utilise l'ID pour générer un index "pseudo-aléatoire" stable
        // pour que la même carte ait toujours la même image
        const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        // URL Unsplash Source (redirection vers une vraie image)
        return `https://source.unsplash.com/400x600/?${keywords[type]}&sig=${seed}`;
    }

    // --- PHYSIQUE DE LA CARTE (TILT 3D) ---
    handleTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calcul de la rotation (-15deg à +15deg)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -12; 
        const rotateY = ((x - centerX) / centerX) * 12;

        // Application CSS
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        
        // Déplacement du reflet (Shine)
        const shine = card.querySelector('.card-shine');
        if(shine) {
            // On positionne le centre du gradient sous la souris
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        }
    }

    resetTilt(card) {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
    }

    // --- COLLECTION ---
    renderCollection() {
        const grid = document.getElementById('collectionGrid');
        if(!grid) return;
        grid.innerHTML = ''; // Nettoyage
        
        CARDS_DATABASE.forEach(card => {
            const el = this.createCardElement(card, true);
            grid.appendChild(el);
        });
    }

    // --- UPGRADE SYSTEM ---
    upgradeCard(id, price) {
        if(this.state.gold >= price) {
            this.state.gold -= price;
            this.state.cardLevels[id] = (this.state.cardLevels[id] || 1) + 1;
            this.save();
            this.updateGoldDisplay();
            this.renderCollection(); // Rafraichir l'affichage
        } else {
            alert("Pas assez d'or !");
        }
    }

    // --- MODAL TRAINING ---
    openTraining(card, dmg, cost) {
        this.state.activeCard = { ...card, currentDmg: dmg };
        
        const modal = document.getElementById('trainingModal');
        document.getElementById('modalTitle').innerText = card.name;
        document.getElementById('modalInstruction').innerText = `${cost} ${card.unit}`;
        document.getElementById('modalTutorial').innerText = card.tutorial;
        
        modal.classList.add('active');
    }

    completeTraining() {
        if(!this.state.activeCard) return;
        
        // Logique simplifiée
        this.state.bossHp -= this.state.activeCard.currentDmg;
        this.state.gold += 20;
        
        if(this.state.bossHp <= 0) {
            this.state.level++;
            alert("BOSS VAINCU !");
            this.spawnBoss();
        }

        this.updateCombatUI();
        this.updateGoldDisplay();
        this.closeTraining();
        this.dealHand(); // Nouvelle main
        this.save();
    }

    closeTraining() {
        document.getElementById('trainingModal').classList.remove('active');
    }

    // --- SAVE / LOAD UTILS ---
    save() {
        const data = {
            gold: this.state.gold,
            cardLevels: this.state.cardLevels,
            level: this.state.level
        };
        localStorage.setItem('fitquest_v6', JSON.stringify(data));
    }

    loadSave() {
        const saved = localStorage.getItem('fitquest_v6');
        if(saved) this.state = { ...this.state, ...JSON.parse(saved) };
    }

    updateDayIndex() {
        const today = new Date().getDay();
        const schedule = WEEKLY_SCHEDULE[today];
        const el = document.getElementById('menuDayTheme');
        if(el) el.innerText = schedule ? `PROGRAMME : ${schedule.name}` : 'REPOS';
    }

    updateGoldDisplay() {
        ['menuGold', 'collectionGold', 'gameGold'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.innerText = this.state.gold;
        });
    }

    updateCombatUI() {
        document.getElementById('currentHp').innerText = Math.max(0, this.state.bossHp);
        document.getElementById('maxHp').innerText = this.state.maxBossHp;
        const pct = (Math.max(0, this.state.bossHp) / this.state.maxBossHp) * 100;
        document.getElementById('hpFill').style.width = `${pct}%`;
    }
}