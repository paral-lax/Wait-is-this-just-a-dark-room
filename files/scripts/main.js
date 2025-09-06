class WaitIsThisJustADarkRoom {
  constructor() {
    this.speed = 1;
    this.theme = 'dark';
    this.resources = { 
      wood: 0, 
      food: 0, 
      fur: 0, 
      stone: 0, 
      teeth: 0,
      spear: 0,
      knife: 0,
      cloth: 0,
      leather: 0,
      meds: 0
    };
    this.state = {
      day: 0,
      isNight: false,
      fireLit: false,
      fireWarmth: 0,
      lastFireStoke: 0,
      huts: 0,
      buildings: { traps: 0, nomadShop: 0, hunterShed: 0 },
      villagers: [],
      activeEvents: [],
      unlockedTabs: ['room'],
      lastRandomEvent: 0,
      lastEventTitle: 0,
      statusEffects: [],
      hasJobsUnlocked: false
    };
    this.events = [];
    this.cooldowns = {};
    this.activeTab = 'room';
    
    this.tabs = {
      room: { 
        name: 'Room', 
        unlock: () => true 
      },
      activity: { 
        name: 'Activity', 
        unlock: () => this.state.fireLit 
      },
      craft: { 
        name: 'Craft', 
        unlock: () => this.resources.wood >= 20 
      },
      build: { 
        name: 'Build', 
        unlock: () => this.resources.wood >= 50 
      },
      jobs: {
        name: 'Population',
        unlock: () => this.state.hasJobsUnlocked,
        hidden: () => !this.state.hasJobsUnlocked
      },
      map: { 
        name: 'Map', 
        unlock: () => false
      }
    };

    this.actions = {
      room: [
        { id: 'lightFire', name: 'light fire', cost: { wood: 10 }, condition: () => !this.state.fireLit, tooltip: 'cost: 10 wood' },
        { id: 'stokeFire', name: 'stoke fire', cost: {}, condition: () => this.state.fireLit, tooltip: 'keep the fire burning\ncosts more wood with more villagers', cooldown: 10000 },
        { id: 'investigate', name: 'investigate', cost: {}, cooldown: 5000, tooltip: 'look around the room' },
        { id: 'sleep', name: 'sleep', cost: {}, cooldown: 8000, condition: () => this.state.isNight, tooltip: 'rest until morning\nonly available at night' }
      ],
      craft: [
        { id: 'craftSpear', name: 'craft spear', cost: { wood: 15, stone: 5 }, tooltip: 'cost: 15 wood, 5 stone\nimproves hunting' },
        { id: 'craftKnife', name: 'craft knife', cost: { wood: 10, stone: 8, teeth: 3 }, tooltip: 'cost: 10 wood, 8 stone, 3 teeth\nimproves gathering' },
        { id: 'craftCloth', name: 'weave cloth', cost: { fur: 5 }, tooltip: 'cost: 5 fur\nuseful for trading' },
        { id: 'craftLeather', name: 'tan leather', cost: { fur: 8, teeth: 2 }, tooltip: 'cost: 8 fur, 2 teeth\ndurable material' },
        { id: 'craftMeds', name: 'make medicine', cost: { cloth: 2, teeth: 1 }, tooltip: 'cost: 2 cloth, 1 teeth\nheals villagers' }
      ],
      build: [
        { id: 'buildTrap', name: 'build trap', cost: { wood: 10, stone: 5 }, tooltip: 'cost: 10 wood, 5 stone\npassive food income' },
        { id: 'buildHut', name: 'build hut', cost: { wood: 100, stone: 20, fur: 10 }, tooltip: 'cost: 100 wood, 20 stone, 10 fur\nhouses 1 villager' },
        { id: 'buildNomadShop', name: "nomad's shop", cost: { wood: 150, stone: 30, cloth: 8 }, tooltip: 'cost: 150 wood, 30 stone, 8 cloth\nallows trading with nomads' },
        { id: 'buildHunterShed', name: "hunter's shed", cost: { wood: 80, stone: 15, leather: 5 }, condition: () => this.state.huts >= 2, tooltip: 'cost: 80 wood, 15 stone, 5 leather\nimproves hunting efficiency' },
        { id: 'buildWorkshop', name: 'build workshop', cost: { wood: 200, stone: 50, cloth: 5 }, condition: () => this.state.huts >= 3, tooltip: 'cost: 200 wood, 50 stone, 5 cloth\nunlocks advanced crafting' }
      ],
      activity: [
        { id: 'gatherWood', name: 'gather wood', cost: {}, cooldown: 15000, tooltip: 'collect wood from forest\nmore people = more wood' },
        { id: 'hunt', name: 'hunt', cost: {}, cooldown: 8000, tooltip: 'hunt for food and materials' },
        { id: 'scavenge', name: 'scavenge', cost: {}, cooldown: 6000, tooltip: 'search for useful items' },
        { id: 'checkTraps', name: 'check traps', cost: { food: 1 }, cooldown: 4000, condition: () => this.state.buildings.traps > 0, tooltip: 'cost: 1 food\ncheck trap yields' },
        { id: 'tradeNomad', name: 'trade with nomad', cost: {}, cooldown: 30000, condition: () => this.state.buildings.nomadShop > 0, tooltip: 'trade with visiting nomads' }
      ],
      jobs: [],
      map: [
        { id: 'placeholder', name: 'in development', cost: {}, tooltip: 'coming soon', disabled: true }
      ]
    };

    this.statusEffectTypes = {
      afflicted: { name: 'Afflicted', type: 'negative', duration: 180000 },
      limping:   { name: 'Limping',   type: 'negative', duration: 90000 },
      unease:    { name: 'Unease',    type: 'negative', duration: 60000 },
      tired:     { name: 'Tired',     type: 'negative', duration: 30000 },
      paranoid:  { name: 'Paranoid',  type: 'negative', duration: 120000 },
      purpose:   { name: 'Purpose',   type: 'positive', duration: 90000 },
      hardened: { name: 'Hardened', type: 'positive', duration: -1 }
    };

    this.init();
  }

  init() {
    this.addEvent('something feels off about this place.', 'error');
    this.updateUnlockedTabs();
    this.renderTabs();
    this.renderActions();
    this.render();
    this.startGameLoop();
    this.loadGame();
    this.setupTooltips();
    this.setupCheatListener();
    setInterval(() => {
      this.saveGame(true);
    }, 60000);
  }

  setupTooltips() {
    const tooltip = document.getElementById('tooltip');
    document.addEventListener('mouseover', e => {
      if (e.target.title) {
        tooltip.textContent = e.target.title;
        tooltip.style.display = 'block';
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 25 + 'px';
      }
    });
    document.addEventListener('mouseout', () => {
      tooltip.style.display = 'none';
    });
    document.addEventListener('mousemove', e => {
      if (tooltip.style.display === 'block') {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 25 + 'px';
      }
    });
  }

  addEvent(text, type = 'normal') {
  this.events.unshift({ text, time: Date.now(), type });
  if (this.events.length > 15) this.events.pop();
  this.renderEvents();
  }

  flashEventTitle() {
    const baseTitle = this.getTitle();
    let flashCount = 0;
    const flash = () => {
      if (flashCount >= 6) {
        document.title = baseTitle;
        return;
      }
      document.title = (flashCount % 2 === 0) ? `${baseTitle} | EVENT!` : baseTitle;
      flashCount++;
      setTimeout(flash, 1000);
    };
    flash();
  }

  getTitle() {
    const pop = this.state.villagers.length;
    const huts = this.state.huts;
    
    if (pop >= 2 && huts >= 2) {
      if (pop >= 30) return 'a small city';
      if (pop >= 25) return 'a large town';
      if (pop >= 20) return 'a small town';
      if (pop >= 15) return 'a huge village';
      if (pop >= 12) return 'a bigger village'; 
      if (pop >= 10) return 'a big village';
      if (pop >= 8) return 'a normal sized village';
      if (pop >= 5) return 'a little village';
      if (pop >= 3) return 'a tiny village';
      return 'a settlement';
    }
    if (huts >= 1) return 'a firelit hut';
    if (this.state.fireLit) return 'a roaring fire';
    return 'a dimly lit room';
  }

  addStatusEffect(type, duration = null) {
    const effectType = this.statusEffectTypes[type];
    if (!effectType) return;

    const existingEffect = this.state.statusEffects.find(e => e.type === type);
    if (existingEffect) {
      existingEffect.endTime = Date.now() + (duration || effectType.duration);
      this.saveGame(true);
      return;
    }

    this.state.statusEffects.push({
      type: type,
      name: effectType.name,
      effectType: effectType.type,
      endTime: duration === -1 ? -1 : Date.now() + (duration || effectType.duration)
    });
    this.addEvent(`you are now ${effectType.name.toLowerCase()}.`, effectType.type === 'positive' ? 'success' : 'error');
    this.saveGame(true);
  }

  removeStatusEffect(type) {
  this.state.statusEffects = this.state.statusEffects.filter(e => e.type !== type);
  this.saveGame(true);
  }

  hasStatusEffect(type) {
    return this.state.statusEffects.some(e => e.type === type);
  }

  updateStatusEffects() {
    const now = Date.now();
    this.state.statusEffects = this.state.statusEffects.filter(effect => {
      if (effect.endTime === -1) return true;
      if (now >= effect.endTime) {
        this.addEvent(`you are no longer ${effect.name.toLowerCase()}.`);
        return false;
      }
      return true;
    });
  }

  updateDayNightCycle() {
    const dayLength = 240000 / this.speed;
    const nightLength = 120000 / this.speed;
    const totalCycle = dayLength + nightLength;

    const currentTime = Date.now() - (this.startTime || Date.now());
    const cyclePosition = currentTime % totalCycle;

    let hour, minute;
    if (cyclePosition < dayLength) {
      const dayProgress = cyclePosition / dayLength;
      hour = Math.floor(6 + dayProgress * 12);
      minute = Math.floor((dayProgress * 12 - (hour - 6)) * 60);
    } else {
      const nightProgress = (cyclePosition - dayLength) / nightLength;
      hour = Math.floor(18 + nightProgress * 12);
      if (hour >= 24) hour -= 24;
      minute = Math.floor((nightProgress * 12 - (hour >= 18 ? hour - 18 : hour + 6)) * 60);
    }

    let sleepAllowed = false;
    if (hour >= 20 || (hour === 19 && minute >= 30)) {
      sleepAllowed = true;
    }

    const wasNight = this.state.isNight;
    this.state.isNight = cyclePosition > dayLength;
    this.state.sleepButtonEnabled = sleepAllowed;

    if (this.state.sleeping) {
      const wakeHour = 6 + Math.floor(Math.random() * 3);
      let wakeMinute;
      if (wakeHour === 6) {
        wakeMinute = 15 + Math.floor(Math.random() * 45);
      } else if (wakeHour === 7) {
        wakeMinute = Math.floor(Math.random() * 60);
      } else {
        wakeMinute = Math.floor(Math.random() * 11);
      }
      const totalMinutes = (wakeHour - 6) * 60 + wakeMinute;
      const newCyclePosition = (totalMinutes / (12 * 60)) * dayLength;
      this.startTime = Date.now() - newCyclePosition;
      this.state.sleeping = false;
      this.state.isNight = false;
      this.state.day++;
      const wakeMessages = [
        `You wake up at ${wakeHour}:${wakeMinute.toString().padStart(2, '0')} am. A new day begins.`,
        `At ${wakeHour}:${wakeMinute.toString().padStart(2, '0')} am, you open your eyes to a new day.`,
        `You stir awake around ${wakeHour}:${wakeMinute.toString().padStart(2, '0')} am, ready to face the day.`,
        `The sun greets you as you rise at ${wakeHour}:${wakeMinute.toString().padStart(2, '0')} am.`,
        `You crawl out of your rest at ${wakeHour}:${wakeMinute.toString().padStart(2, '0')} am — another day awaits.`
      ];
      const message = wakeMessages[Math.floor(Math.random() * wakeMessages.length)];
      this.addEvent(message);
      this.triggerRandomEvent();
      return;
    }

    if (!wasNight && this.state.isNight) {
      if (!this.state.sleeping) {
        const nightMessages = [
        "Night falls. You can now sleep.",
        "Darkness creeps in — it is now night.",
        "The sun vanishes beyond the horizon. Night begins.",
        "Shadows deepen as night takes hold.",
        "The air cools — night has fallen."
      ];
      const message = nightMessages[Math.floor(Math.random() * nightMessages.length)];
      this.addEvent(message);
      }
      this.triggerRandomEvent();
    } else if (wasNight && !this.state.isNight) {
      if (!this.state.sleeping) {
        const dawnMessages = [
          "Dawn breaks. A new day begins.",
          "The first light of morning spills across the land.",
          "You hear birds in the distance as dawn arrives.",
          "A pale glow announces the coming of day.",
          "The darkness recedes — morning has come."
        ];
        const message = dawnMessages[Math.floor(Math.random() * dawnMessages.length)];
        this.addEvent(message);
        this.state.day++;
        this.triggerRandomEvent();
      }
    }
  }

  updateUnlockedTabs() {
    Object.keys(this.tabs).forEach(tab => {
      if (this.tabs[tab].unlock() && !this.state.unlockedTabs.includes(tab)) {
        this.state.unlockedTabs.push(tab);
        this.addEvent(`new area unlocked: ${this.tabs[tab].name.toLowerCase()}`, 'success');
      }
    });
  }

  renderTabs() {
    const tabsEl = document.getElementById('tabs');
    tabsEl.innerHTML = '';
    
    Object.keys(this.tabs).forEach(tabId => {
      const tab = document.createElement('div');
      const isUnlocked = this.state.unlockedTabs.includes(tabId);
      const isAvailable = this.tabs[tabId].unlock();
      const isHidden = this.tabs[tabId].hidden && this.tabs[tabId].hidden();
      
      if (isHidden) return;
      
      tab.className = `tab ${tabId === this.activeTab ? 'active' : ''} ${!isUnlocked || !isAvailable ? 'locked' : ''}`;
      tab.textContent = this.tabs[tabId].name;
      
      if (isUnlocked && isAvailable) {
        tab.onclick = () => {
          this.activeTab = tabId;
          this.renderTabs();
          this.renderActions();
        };
      }
      tabsEl.appendChild(tab);
    });
  }

  renderActions() {
    const content = document.getElementById('actionContent');
    content.innerHTML = '';
    
    if (this.activeTab === 'jobs') {
      content.className = 'action-content jobs-content';
      this.renderJobsTab(content);
      return;
    } else {
      content.className = 'action-content';
    }
    
    if (!this.actions[this.activeTab]) return;
    
    this.actions[this.activeTab].forEach(action => {
      if (action.condition && !action.condition()) return;

      if (this.activeTab === 'build' && action.id !== 'buildTrap' && action.cost) {
        const entries = Object.entries(action.cost);
        if (entries.length > 0) {
          let minRatio = Infinity;
          for (const [res, req] of entries) {
            const required = Number(req) || 0;
            if (required <= 0) continue;
            const have = Number(this.resources[res] || 0);
            const ratio = have / required;
            if (ratio < minRatio) minRatio = ratio;
          }
          if (minRatio === Infinity || minRatio < 0.5) {
            return;
          }
        }
      }

      if (action.disabled) {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = action.name;
        btn.disabled = true;
        btn.title = action.tooltip || '';
        content.appendChild(btn);
        return;
      }
      
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.textContent = action.name;
      btn.title = action.tooltip || '';
      
      const canAfford = this.canAfford(action.cost);
      const onCooldown = this.isOnCooldown(action.id);
      btn.disabled = !canAfford || onCooldown;
      
      btn.onclick = () => this.performAction(action.id);
      content.appendChild(btn);
    });
  }

  jobSelections = {};

  renderJobsTab(content) {
    const summaryBar = document.createElement('div');
    summaryBar.style.background = 'var(--bg-tertiary)';
    summaryBar.style.border = '1px solid var(--border-light)';
    summaryBar.style.padding = '8px';
    summaryBar.style.marginBottom = '10px';
    summaryBar.style.fontSize = '11px';
    summaryBar.style.textAlign = 'center';
    let woodGain = 0, foodGain = 0, furGain = 0, stoneGain = 0, teethGain = 0, clothGain = 0, leatherGain = 0, medsGain = 0;
    let foodLoss = 0, medsLoss = 0;
    this.state.villagers.forEach(villager => {
      const eff = villager.health >= 8 ? 1 : villager.health >= 6 ? 0.8 : villager.health >= 4 ? 0.6 : 0.4;
      switch (villager.job) {
        case 'gatherer':
          woodGain += (villager.type === 'child' ? 3 : 5) * eff * (10/3);
          break;
        case 'hunter':
          foodLoss += 1 + Math.floor(Math.random() * 2);
          foodGain += 1 * eff * (10/3) * (this.state.buildings.hunterShed > 0 ? 1.2 : 1.0);
          furGain += 0.5 * eff * (10/3) * (this.state.buildings.hunterShed > 0 ? 1.2 : 1.0);
          break;
        case 'scavenger':
          stoneGain += 0.2 * eff * (10/3);
          break;
        case 'trapper':
          if (this.state.buildings.traps >= 5) {
            foodLoss += 0.5 * (10/3);
            furGain += 0.3 * eff * (10/3);
            teethGain += 0.2 * eff * (10/3);
          }
          break;
        case 'guard':
          break;
      }
    });
    summaryBar.innerHTML = `
      <b>items per 10s:</b>
      ${woodGain ? `+${woodGain.toFixed(1)} wood ` : ''}
      ${foodGain ? `+${foodGain.toFixed(1)} food ` : ''}
      ${furGain ? `+${furGain.toFixed(1)} fur ` : ''}
      ${stoneGain ? `+${stoneGain.toFixed(1)} stone ` : ''}
      ${teethGain ? `+${teethGain.toFixed(1)} teeth ` : ''}
      ${clothGain ? `+${clothGain.toFixed(1)} cloth ` : ''}
      ${leatherGain ? `+${leatherGain.toFixed(1)} leather ` : ''}
      ${medsGain ? `+${medsGain.toFixed(1)} meds ` : ''}
      ${foodLoss ? `<span style="color:var(--text-error)">-${foodLoss.toFixed(1)} food</span> ` : ''}
      ${medsLoss ? `<span style="color:var(--text-error)">-${medsLoss.toFixed(1)} meds</span> ` : ''}
    `;
    content.appendChild(summaryBar);

    if (this.state.villagers.length === 0) {
      content.innerHTML += '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">no villagers to assign jobs</div>';
      return;
    }

    this.state.villagers.forEach((villager, idx) => {
      const jobDiv = document.createElement('div');
      jobDiv.className = 'job-assignment';

      const info = document.createElement('div');
      info.className = 'villager-info';

      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.alignItems = 'center';
      topRow.style.gap = '8px';

      const name = document.createElement('div');
      name.className = 'villager-name';
      name.textContent = villager.name;

      const healthPercent = Math.round((villager.health / 10) * 100);
      const healthBar = document.createElement('div');
      healthBar.className = 'health-bar';
      healthBar.style.margin = '0 4px';
      healthBar.style.width = '60px';
      healthBar.style.height = '8px';
      healthBar.style.display = 'inline-block';
      healthBar.style.verticalAlign = 'middle';
      healthBar.style.position = 'relative';

      const healthFill = document.createElement('div');
      healthFill.className = 'health-fill' + (villager.health <= 5 ? ' low' : '');
      healthFill.style.width = `${healthPercent}%`;
      healthFill.style.height = '100%';
      healthFill.style.transition = 'width 0.3s ease';

      healthBar.appendChild(healthFill);

      topRow.appendChild(name);
      topRow.appendChild(healthBar);

      if (villager.health < 10) {
        const healBtn = document.createElement('button');
        healBtn.className = 'action-btn';
        healBtn.style.fontSize = '9px';
        healBtn.style.padding = '0 4px';
        healBtn.style.height = '18px';
        healBtn.style.width = '32px';
        healBtn.style.minWidth = '32px';
        healBtn.style.marginLeft = '2px';
        healBtn.textContent = 'Heal';
        healBtn.title = villager.health < 3 ? 'cost: 3 meds' : 'cost: 1 med';
        healBtn.disabled = villager.health < 3 ? this.resources.meds < 3 : this.resources.meds < 1;
        healBtn.onclick = () => {
          if (villager.health < 3 && this.resources.meds >= 3) {
            this.resources.meds -= 3;
            villager.health = 10;
            this.addEvent(`You fully heal ${villager.name}.`, 'success');
          } else if (villager.health < 10 && this.resources.meds >= 1) {
            this.resources.meds -= 1;
            villager.health = Math.min(10, villager.health + 3);
            this.addEvent(`You heal ${villager.name} for 3 HP.`, 'success');
          }
          this.render();
        };
        topRow.appendChild(healBtn);
      }

      const fireBtn = document.createElement('button');
  fireBtn.className = 'action-btn';
  fireBtn.style.fontSize = '11px';
  fireBtn.style.padding = '2px 8px';
  fireBtn.style.height = '26px';
  fireBtn.style.width = '40px';
  fireBtn.style.minWidth = '40px';
  fireBtn.style.marginLeft = '2px';
  fireBtn.textContent = 'fire';
  fireBtn.title = 'remove this villager from your settlement';
  fireBtn.onclick = () => {
        const overlay = document.getElementById('modalOverlay');
        const titleEl = document.getElementById('modalTitle');
        const textEl = document.getElementById('modalText');
        const actionsEl = document.getElementById('modalActions');
        titleEl.textContent = `Fire ${villager.name}?`;
        textEl.textContent = `Are you sure you want to fire ${villager.name}? They may react badly.`;
        actionsEl.innerHTML = '';

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'modal-btn danger';
        confirmBtn.textContent = 'Fire';
        confirmBtn.onclick = () => {
          overlay.style.display = 'none';
          this.state.villagers.splice(idx, 1);
          if (!this.firedVillagers) this.firedVillagers = [];
          this.firedVillagers.push({
            name: villager.name,
            type: villager.type,
            angry: false,
            comeback: false,
            firedTime: Date.now()
          });
          if (Math.random() < 0.3) {
            let msg = `${villager.name} is furious at being fired! `;
            const steal = ['food', 'wood', 'fur', 'stone', 'teeth', 'cloth', 'leather', 'meds'];
            steal.forEach(res => {
              if (this.resources[res] > 0 && Math.random() < 0.5) {
                const amt = Math.min(this.resources[res], Math.ceil(Math.random() * 8));
                this.resources[res] -= amt;
                msg += `Stole ${amt} ${res}. `;
              }
            });
            if (this.state.villagers.length > 0 && Math.random() < 0.4) {
              const victim = this.state.villagers[Math.floor(Math.random() * this.state.villagers.length)];
              if (Math.random() < 0.5) {
                this.state.villagers = this.state.villagers.filter(v => v !== victim);
                msg += `${victim.name} was killed in the chaos! `;
              } else {
                victim.health = Math.max(1, victim.health - Math.floor(Math.random() * 5 + 2));
                msg += `${victim.name} was badly injured! `;
              }
            }
            this.addEvent(msg, 'error');
            this.firedVillagers[this.firedVillagers.length - 1].angry = true;
          } else {
            this.addEvent(`${villager.name} leaves quietly.`, 'success');
          }
          this.render();
        };
        actionsEl.appendChild(confirmBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-btn';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => {
          overlay.style.display = 'none';
        };
        actionsEl.appendChild(cancelBtn);

        overlay.style.display = 'flex';
      };
      topRow.appendChild(fireBtn);

      info.appendChild(topRow);

      const details = document.createElement('div');
      details.className = 'villager-details';
      details.style.fontSize = '10px';
      details.style.color = 'var(--text-secondary)';
      details.style.marginTop = '2px';
      details.innerHTML = `Type: ${villager.type || 'adult'} | Health: ${villager.health}/10 (${healthPercent}%)`;

      info.appendChild(details);

      const select = document.createElement('select');
      select.className = 'job-select';

      const jobs = this.getAvailableJobs(villager);
      jobs.forEach(job => {
        const option = document.createElement('option');
        option.value = job;
        option.textContent = job;
        option.selected = villager.job === job;
        select.appendChild(option);
      });

      select.onchange = () => {
        villager.job = select.value;
        this.jobSelections[villager.id] = select.value;
        this.addEvent(`${villager.name} assigned to ${select.value}.`);
        this.render();
      };
      
      if (this.jobSelections[villager.id]) {
        select.value = this.jobSelections[villager.id];
      }

      jobDiv.appendChild(info);
      jobDiv.appendChild(select);
      content.appendChild(jobDiv);
    });

    if (this.firedVillagers && this.state.isNight) {
      this.firedVillagers.forEach(fired => {
        if (fired.angry && !fired.comeback && Math.random() < 0.09) {
          fired.comeback = true;
          let msg = `${fired.name} returns in the night! `;
          if (Math.random() < 0.5) {
            const steal = ['food', 'wood', 'fur', 'stone', 'teeth', 'cloth', 'leather', 'meds'];
            steal.forEach(res => {
              if (this.resources[res] > 0 && Math.random() < 0.5) {
                const amt = Math.min(this.resources[res], Math.ceil(Math.random() * 12));
                this.resources[res] -= amt;
                msg += `Stole ${amt} ${res}. `;
              }
            });
            msg += 'They vanish into the darkness.';
          } else {
            if (this.resources.wood > 0) {
              const amt = Math.min(this.resources.wood, Math.ceil(Math.random() * 30 + 10));
              this.resources.wood -= amt;
              msg += `Set fire to your wood supply! Lost ${amt} wood.`;
            } else {
              msg += 'Tried to burn your wood, but you had none.';
            }
          }
          this.addEvent(msg, 'error');
        }
      });
    }
  }

  getAvailableJobs(villager) {
    const jobs = ['unemployed', 'gatherer'];
    if (villager.type === 'child') {
      jobs.push('scavenger');
    } else {
      jobs.push('scavenger');
      if (this.state.buildings.hunterShed > 0) jobs.push('hunter');
      if (this.state.buildings.traps >= 5) jobs.push('trapper');
      if (this.state.villagers.length >= 6) jobs.push('guard');
    }
    return jobs;
  }

  updateFire() {
    if (this.state.fireLit) {
      const timeSinceStoke = Date.now() - this.state.lastFireStoke;
      if (timeSinceStoke > 240000 / this.speed) {
        this.state.fireLit = false;
        this.state.fireWarmth = 0;
        this.addEvent('the fire dies out.', 'error');
      }
    }
  }

  canAfford(cost) {
    return Object.entries(cost).every(([resource, amount]) => 
      this.resources[resource] >= amount
    );
  }

  isOnCooldown(actionId) {
    return this.cooldowns[actionId] && Date.now() < this.cooldowns[actionId];
  }

  performAction(actionId) {
    const allActions = [
      ...this.actions.room, 
      ...this.actions.craft, 
      ...this.actions.build, 
      ...this.actions.activity
    ];
    const action = allActions.find(a => a.id === actionId);
    if (!action || this.isOnCooldown(actionId) || !this.canAfford(action.cost)) return;

    Object.entries(action.cost).forEach(([resource, amount]) => {
      this.resources[resource] -= amount;
    });

    if (action.cooldown) {
      this.cooldowns[actionId] = Date.now() + (action.cooldown / this.speed);
    }

    this.handleAction(actionId);
    this.render();
  }

  handleAction(actionId) {
    switch (actionId) {
      case 'lightFire':
        this.state.fireLit = true;
        this.state.fireWarmth = 100;
        this.state.lastFireStoke = Date.now();
        this.addEvent('the fire is lit.', 'success');
        break;
      case 'stokeFire':
        const villagerCount = this.state.villagers.length + 1;
        const woodCost = Math.max(1, Math.floor(villagerCount / 2));
        if (this.resources.wood >= woodCost) {
          this.resources.wood -= woodCost;
          this.state.fireWarmth = 100;
          this.state.lastFireStoke = Date.now();
          if (this.resources.wood >= woodCost) {
            const successMessages = [
              `The fire grows brighter. Used ${woodCost} wood.`,
              `You feed ${woodCost} wood into the flames, and they flare up.`,
              `The fire crackles warmly as you add ${woodCost} wood.`,
              `You place ${woodCost} wood on the fire, and it burns stronger.`,
              `${woodCost} wood consumed — the fire now glows with renewed life.`
            ];

            const message = successMessages[Math.floor(Math.random() * successMessages.length)];
            this.addEvent(message);
          } else {
            const failMessages = [
              "Not enough wood to stoke the fire.",
              "You search your pack, but there isn’t enough wood.",
              "The fire sputters — you lack the wood to feed it.",
              "You can’t find enough wood to keep the flames alive.",
              "Without more wood, the fire begins to weaken."
            ];

            const message = failMessages[Math.floor(Math.random() * failMessages.length)];
            this.addEvent(message, 'error');
          }
        }
        break;
      case 'investigate':
        this.investigate();
        this.triggerRandomEvent(0.25);
        break;
      case 'sleep':
        if (this.state.isNight) {
          this.addEvent('you sleep through the night.');
          this.state.villagers.forEach(villager => {
            if (villager.health < 10) {
              villager.health = Math.min(10, villager.health + 1);
            }
          });
          this.state.sleeping = true;
        } else {
          this.addEvent('you can only sleep at night.', 'error');
        }
        break;
      case 'gatherWood':
        this.gatherWood();
        this.triggerRandomEvent(0.15);
        break;
      case 'hunt':
        this.hunt();
        this.triggerRandomEvent(0.20);
        break;
      case 'scavenge':
        this.scavenge();
        this.triggerRandomEvent(0.25);
        break;
      case 'checkTraps':
        this.checkTraps();
        this.triggerRandomEvent(0.10);
        break;
      case 'tradeNomad':
        this.tradeWithNomad();
        this.triggerRandomEvent(0.05);
        break;
      case 'craftSpear':
        this.resources.spear++;
        this.addEvent('you craft a spear.', 'success');
        break;
      case 'craftKnife':
        this.resources.knife++;
        this.addEvent('you craft a knife.', 'success');
        break;
      case 'craftCloth':
        this.resources.cloth++;
        this.addEvent('you weave some cloth.', 'success');
        break;
      case 'craftLeather':
        this.resources.leather++;
        this.addEvent('you tan some leather.', 'success');
        break;
      case 'craftMeds':
        this.resources.meds++;
        this.addEvent('you make some medicine.', 'success');
        break;
      case 'buildTrap':
        this.state.buildings.traps++;
        this.addEvent('you build a trap.', 'success');
        break;
      case 'buildHut':
        this.state.huts++;
        this.addEvent('you build a hut.', 'success');
        break;
      case 'buildNomadShop':
        this.state.buildings.nomadShop++;
        this.addEvent("you build a nomad's shop.", 'success');
        break;
      case 'buildHunterShed':
        this.state.buildings.hunterShed++;
        this.addEvent("you build a hunter's shed.", 'success');
        break;
      case 'buildWorkshop':
        this.state.buildings.workshop = true;
        this.addEvent('you build a workshop.', 'success');
        break;
    }
  }

  gatherWood() {
    const totalPeople = 1 + this.state.villagers.length;
    const hasKnife = this.resources.knife > 0;
    let amount;

    if (totalPeople === 1) amount = 10 + Math.floor(Math.random() * 11);
    else if (totalPeople === 2) amount = 12 + Math.floor(Math.random() * 10);
    else if (totalPeople === 3) amount = 15 + Math.floor(Math.random() * 9);
    else if (totalPeople === 4) amount = 20 + Math.floor(Math.random() * 11);
    else if (totalPeople === 5) amount = 24 + Math.floor(Math.random() * 14);
    else if (totalPeople === 6) amount = 30 + Math.floor(Math.random() * 11);
    else if (totalPeople === 7) amount = 52;
    else if (totalPeople === 8) amount = 53 + Math.floor(Math.random() * 7);
    else amount = 60 + Math.floor(Math.random() * (totalPeople * 3));

    if (hasKnife) amount = Math.floor(amount * 1.3);
    
    if (this.hasStatusEffect('limping')) amount = Math.floor(amount * 0.7);
    if (this.hasStatusEffect('afflicted')) amount = Math.floor(amount * 0.6);
    if (this.hasStatusEffect('purpose')) amount = Math.floor(amount * 1.2);
    
    this.resources.wood += amount;
    const stones = Math.floor(Math.random() * 6);
    if (!this.resources.stone) this.resources.stone = 0;
    this.resources.stone += stones;
    if (stones > 0) {
      this.addEvent(`You gather ${amount} wood and ${stones} stones.`);
    } else {
      this.addEvent(`You gather ${amount} wood.`);
    }

    this.triggerRandomEvent();
  }

  hunt() {
    const hasSpear = this.resources.spear > 0;
    const hasKnife = this.resources.knife > 0;
    const hasShed = this.state.buildings.hunterShed > 0;
    
    if (this.hasStatusEffect('limping')) {
      this.addEvent('you cannot hunt while limping.', 'error');
      return;
    }
    
    let food = 2 + Math.floor(Math.random() * 4);
    let fur = 1 + Math.floor(Math.random() * 3);
    let teeth = Math.random() < 0.3 ? 1 : 0;
    
    if (hasSpear) {
      food = Math.floor(food * 1.5);
      fur = Math.floor(fur * 1.3);
      teeth += Math.random() < 0.5 ? 1 : 0;
    }
    if (hasKnife) {
      fur = Math.floor(fur * 1.4);
      teeth += Math.random() < 0.3 ? 1 : 0;
    }
    if (hasShed) {
      food = Math.floor(food * 1.2);
      fur = Math.floor(fur * 1.2);
    }
    
    if (this.hasStatusEffect('afflicted') && Math.random() < 0.4) {
    const messages = [
      "You feel too sick to hunt properly.",
      "Your body aches and you fail to focus on the hunt.",
      "Nausea overwhelms you, ruining your efforts.",
      "Your sickness weakens your aim.",
      "A wave of dizziness makes hunting impossible."
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    this.addEvent(message, 'error');
    return;
  }
    
    this.resources.food += food;
    this.resources.fur += fur;
    this.resources.teeth += teeth;
    
    this.addEvent(`you hunt successfully. ${food} food, ${fur} fur gained.`);
    this.triggerRandomEvent();
  }

  scavenge() {
    const finds = [];
    const chance = Math.random();
    
    if (this.hasStatusEffect('afflicted') && Math.random() < 0.3) {
    const messages = [
      "You feel too weak to scavenge effectively.",
      "Your illness slows you down, making scavenging difficult.",
      "A wave of fatigue forces you to stop searching.",
      "You cough violently, drawing attention and wasting time.",
      "Your dizziness causes you to miss useful supplies."
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    this.addEvent(message, 'error');
    return;
  }
    
    if (chance < 0.3) {
      const stones = 2 + Math.floor(Math.random() * 4);
      this.resources.stone += stones;
      finds.push(`${stones} stones`);
    }
    
    if (chance < 0.2) {
      this.resources.cloth += 1;
      finds.push('some old cloth');
    }
    
    if (chance < 0.15) {
      const food = 1 + Math.floor(Math.random() * 3);
      this.resources.food += food;
      finds.push(`${food} preserved food`);
    }
    
    if (chance < 0.1) {
      this.resources.teeth += 2;
      finds.push('animal bones');
    }
    
    if (finds.length === 0) {
      this.addEvent('you find nothing useful.');
    } else {
      this.addEvent(`you scavenge: ${finds.join(', ')}.`);
    }
    
    this.triggerRandomEvent();
  }

  checkTraps() {
    const trapCount = this.state.buildings.traps;
    let totalFood = 0;
    let totalFur = 0;
    this.cooldowns['checkTraps'] = Date.now() + (10000 / this.speed);
    
    for (let i = 0; i < trapCount; i++) {
      if (Math.random() < 0.6) {
        totalFood += 1 + Math.floor(Math.random() * 3);
        if (Math.random() < 0.4) totalFur += 1;
      }
    }
    
    if (totalFood > 0) {
      this.resources.food += totalFood;
      this.resources.fur += totalFur;
      this.addEvent(`traps caught ${totalFood} food${totalFur > 0 ? ` and ${totalFur} fur` : ''}.`);
    } else {
      this.addEvent('the traps are empty.');
    }
  }

  tradeWithNomad() {
    const trades = [
      { give: { wood: 50 }, get: { meds: 3, cloth: 2 } },
      { give: { stone: 30 }, get: { spear: 1, leather: 2 } },
      { give: { fur: 20 }, get: { knife: 1, meds: 2 } },
      { give: { food: 25 }, get: { stone: 15, teeth: 5 } },
      { give: { cloth: 10 }, get: { food: 30, fur: 8 } }
    ];
    
    const availableTrades = trades.filter(trade => this.canAfford(trade.give));
    
    if (availableTrades.length === 0) {
    const messages = [
      "The nomad has nothing you can afford.",
      "You rummage through the nomad's goods, but everything is beyond your means.",
      "The nomad shakes their head — you cannot afford a single item.",
      "You realize you do not have enough to trade for anything useful.",
      "The nomad's wares glimmer, but all are out of reach."
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    this.addEvent(message, 'error');
    return;
  }
    
    const trade = availableTrades[Math.floor(Math.random() * availableTrades.length)];
    
    Object.entries(trade.give).forEach(([resource, amount]) => {
      this.resources[resource] -= amount;
    });
    Object.entries(trade.get).forEach(([resource, amount]) => {
      this.resources[resource] += amount;
    });
    
    const giveText = Object.entries(trade.give).map(([r, a]) => `${a} ${r}`).join(', ');
    const getText = Object.entries(trade.get).map(([r, a]) => `${a} ${r}`).join(', ');
    
    this.addEvent(`traded ${giveText} for ${getText}.`, 'success');
  }

  investigate() {
    const events = [
      { text: 'You find nothing of interest.', chance: 0.15 },
      { text: 'You discover some old stones.', chance: 0.12, reward: { stone: 2 + Math.floor(Math.random() * 4) } },
      { text: 'Strange markings on the wall catch your eye.', chance: 0.1 },
      { text: 'You hear distant sounds from outside.', chance: 0.08 },
      { text: 'There are deep scratches in the wood...', chance: 0.08 },
      { text: 'You find traces of ash and bone.', chance: 0.05 },
      { text: 'A loose floorboard reveals a small cache.', chance: 0.1, reward: { food: 2, wood: 5 } },
      { text: 'You find an old tool.', chance: 0.05, reward: { knife: 1 } },
      { text: 'You discover a hidden medical kit.', chance: 0.03, reward: { meds: 2 } },
      { text: 'You stumble on an abandoned backpack.', chance: 0.05, reward: { food: 1, cloth: 2 } },
      { text: 'A faint whisper echoes through the room… but no one is there.', chance: 0.02 },
      { text: 'You find a locked box. Its secrets remain hidden… for now.', chance: 0.02 },
      { text: 'You uncover a pile of shattered pottery.', chance: 0.06 },
      { text: 'An old chair lies broken in the corner.', chance: 0.06 },
      { text: 'You brush aside dust to reveal faded carvings.', chance: 0.07 },
      { text: 'A cracked lantern rests uselessly on the floor.', chance: 0.05 },
      { text: 'A cold draft creeps through unseen cracks.', chance: 0.04 },
      { text: 'You spot scraps of fabric caught on a nail.', chance: 0.05 },
      { text: 'The air feels heavier here, as if something lingers.', chance: 0.03 },
      { text: 'You hear the faint scurrying of rats nearby.', chance: 0.04 },
      { text: 'You find a small stash of firewood.', chance: 0.04, reward: { wood: 9 } },
    ];

    const rand = Math.random();
    let cumulative = 0;

    for (const event of events) {
      cumulative += event.chance;
      if (rand <= cumulative) {
        this.addEvent(event.text);

        if (event.reward) {
          Object.entries(event.reward).forEach(([resource, amount]) => {
            this.resources[resource] = (this.resources[resource] || 0) + amount;
          });
        }

        if (event.penalty) {
          Object.entries(event.penalty).forEach(([stat, amount]) => {
            this.stats[stat] = (this.stats[stat] || 0) + amount;
          });
        }

        break;
      }
    }

    this.triggerRandomEvent();
  }

  triggerRandomEvent() {
    const now = Date.now();
    if (now - this.state.lastRandomEvent < 60000 / this.speed) return;
    
    let eventChance = this.state.isNight ? 0.4 : 0.25;
    if (this.hasStatusEffect('paranoid')) eventChance *= 1.5;
    
    if (Math.random() < eventChance) {
      const availableEvents = this.randomEvents.filter(event => 
        event.condition() && Math.random() < event.chance
      );
      
      if (availableEvents.length > 0) {
        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        this.showModal(event.id, event.title, event.text, event.actions);
        this.flashEventTitle();
        this.state.lastRandomEvent = now;
      }
    }
  }

  showModal(eventId, title, text, actions) {
    const overlay = document.getElementById('modalOverlay');
    const titleEl = document.getElementById('modalTitle');
    const textEl = document.getElementById('modalText');
    const actionsEl = document.getElementById('modalActions');
    
    titleEl.textContent = title;
    textEl.textContent = text;
    actionsEl.innerHTML = '';
    
    actions.forEach(action => {
      if (action.condition && !action.condition()) return;
      
      const btn = document.createElement('button');
      btn.className = 'modal-btn';
      btn.textContent = action.text;
      
      const canAfford = !action.cost || this.canAfford(action.cost);
      btn.disabled = !canAfford;
      
      btn.onclick = () => {
        if (action.cost) {
          Object.entries(action.cost).forEach(([resource, amount]) => {
            this.resources[resource] -= amount;
          });
        }
        this.handleEventResult(action.result);
        overlay.style.display = 'none';
        this.render();
      };
      
      actionsEl.appendChild(btn);
    });
    
    overlay.style.display = 'flex';
  }

  handleBearAttack() {
    if (this.state.villagers.length > 0 && Math.random() < 0.5) {
      const victim = this.state.villagers.pop();
      this.addEvent(`${victim.name} was killed by the bear.`, 'error');
    } else {
      this.addStatusEffect('afflicted');
      this.addEvent('the bear mauls you before retreating.', 'error');
    }
  }

  sketchyBetrayal() {
    const sketchyGuy = this.state.villagers.find(v => v.name === 'sketchy man');
    if (!sketchyGuy) return;

    this.state.villagers = this.state.villagers.filter(v => v !== sketchyGuy);
    
    this.resources.food = Math.max(0, this.resources.food - 10);
    this.resources.wood = Math.max(0, this.resources.wood - 20);
    
    if (this.state.villagers.length > 0 && Math.random() < 0.3) {
      const victim = this.state.villagers.pop();
      this.addEvent(`the sketchy man killed ${victim.name} and fled with supplies!`, 'error');
    } else {
      this.addEvent('the sketchy man stole supplies and fled in the night!', 'error');
    }
    
    this.flashTitle();
  }

  addVillager(name, type = 'adult', health = 10) {
    const villager = {
      id: Date.now() + Math.random(),
      name: name,
      type: type,
      job: 'unemployed',
      health: health
    };
    this.state.villagers.push(villager);
  }

  unlockJobsTab() {
    if (!this.state.hasJobsUnlocked) {
      this.state.hasJobsUnlocked = true;
      this.addEvent('jobs tab unlocked!', 'success');
    }
  }

  updateFire() {
    if (this.state.fireLit) {
      const timeSinceStoke = Date.now() - this.state.lastFireStoke;
      if (timeSinceStoke > 120000 / this.speed) {
        this.state.fireLit = false;
        this.state.fireWarmth = 0;
        this.addEvent('the fire dies out.', 'error');
      }
    }
  }

  updateVillagers() {
    this.state.villagers.forEach(villager => {
      const multiplier = this.speed / 10;
      let efficiency = 1.0;
      
      if (villager.health >= 8) efficiency = 1.0;
      else if (villager.health >= 6) efficiency = 0.8;
      else if (villager.health >= 4) efficiency = 0.6;
      else efficiency = 0.4;
      
      switch (villager.job) {
        case 'gatherer':
          const woodGain = (villager.type === 'child' ? 3 : 5) * efficiency * multiplier;
          this.resources.wood += woodGain;
          break;
        case 'hunter':
          if (villager.type !== 'child' && this.state.huts >= 2) {
            const huntBonus = this.state.buildings.hunterShed > 0 ? 1.2 : 1.0;
            this.resources.food += 1 * efficiency * multiplier * huntBonus;
            this.resources.fur += 0.5 * efficiency * multiplier * huntBonus;
          }
          break;
        case 'scavenger':
          if (Math.random() < 0.2 * efficiency) {
            this.resources.stone += 1 * multiplier;
          }
          break;
        case 'trapper':
          if (this.state.huts >= 2 && this.resources.food >= 1) {
            this.resources.food -= 0.5 * multiplier;
            if (Math.random() < 0.3 * efficiency) {
              this.resources.fur += 1 * multiplier;
            }
            if (Math.random() < 0.2 * efficiency) {
              this.resources.teeth += 1 * multiplier;
            }
          }
          break;
        case 'guard':
          break;
      }
      
      if (villager.health < 10 && Math.random() < 0.01) {
        villager.health = Math.min(10, villager.health + 1);
      }
      
      if (villager.job !== 'unemployed' && villager.health > 3 && Math.random() < 0.005) {
        villager.health = Math.max(1, villager.health - 1);
        if (villager.health <= 5) {
          this.addEvent(`${villager.name} is getting tired from overwork.`, 'error');
        }
      }
    });
    
    Object.keys(this.resources).forEach(key => {
      this.resources[key] = Math.floor(this.resources[key]);
    });
  }

  startGameLoop() {
    this.startTime = Date.now();
    setInterval(() => {
      this.updateFire();
      this.updateDayNightCycle();
      this.updateVillagers();
      this.updateStatusEffects();
      this.updateUnlockedTabs();
      this.render();
    }, 3000);
    
    setInterval(() => this.saveGame(), 60000);
    
    setInterval(() => this.triggerRandomEvent(), (30000 + Math.random() * 30000) / this.speed);
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', this.theme);
    document.getElementById('themeBtn').textContent = this.theme === 'dark' ? 'light' : 'dark';
  }

  render() {
  this.renderEvents();
  this.renderInventoryTabs();
  this.renderVillage();
  this.renderStatus();
  this.renderTabs();
  this.renderActions();
  this.renderStatusEffects();
  document.getElementById('gameTitle').textContent = this.getTitle();
  document.title = this.getTitle();
  }

  renderStatusEffects() {
    const container = document.getElementById('statusEffects');
    container.innerHTML = '';
    
    this.state.statusEffects.forEach(effect => {
      const div = document.createElement('div');
      div.className = `status-effect ${effect.effectType}`;
      div.textContent = effect.name;
      
      if (effect.endTime !== -1) {
        const timeLeft = Math.max(0, effect.endTime - Date.now());
        const minutes = Math.ceil(timeLeft / 60000);
        div.title = `${minutes}m remaining`;
      } else {
        div.title = 'Permanent';
      }
      
      container.appendChild(div);
    });
  }

  renderEvents() {
    const list = document.getElementById('eventsList');
    list.innerHTML = '';
    
    this.events.slice(0, 10).forEach((event, index) => {
      const div = document.createElement('div');
      let className = 'event';
      
      if (index > 0) className += ` fade-${Math.min(index, 5)}`;
      
      if (event.type === 'error') className += ' error';
      if (event.type === 'success') className += ' success';
      
      div.className = className;
      div.textContent = event.text;
      list.appendChild(div);
    });
  }

  renderInventoryTabs() {
    const invList = document.getElementById('inventoryList');
    invList.innerHTML = '';
    if (!this.inventoryTab) this.inventoryTab = 'resources';
    const tabs = document.createElement('div');
    tabs.style.display = 'flex';
    tabs.style.borderBottom = '1px solid var(--border)';
    tabs.style.marginBottom = '8px';
    ['resources', 'items'].forEach(tab => {
      const tabBtn = document.createElement('button');
      tabBtn.textContent = tab;
      tabBtn.style.flex = '1';
      tabBtn.style.padding = '6px 0';
      tabBtn.style.background = this.inventoryTab === tab ? 'var(--bg-quaternary)' : 'var(--bg-tertiary)';
      tabBtn.style.border = 'none';
      tabBtn.style.color = 'var(--text-primary)';
      tabBtn.style.cursor = 'pointer';
      tabBtn.style.fontFamily = "'Courier New', monospace";
      tabBtn.style.textTransform = 'lowercase';
      tabBtn.onclick = () => {
        this.inventoryTab = tab;
        this.renderInventoryTabs();
      };
      tabs.appendChild(tabBtn);
    });
    invList.appendChild(tabs);
    let items;
    if (this.inventoryTab === 'resources') {
      items = ['wood', 'food', 'fur', 'stone', 'teeth'];
    } else {
      items = ['spear', 'knife', 'cloth', 'leather', 'meds'];
    }
    items.forEach(key => {
      const item = document.createElement('div');
      item.className = 'inv-item';
      item.innerHTML = `<span style="font-family:'Courier New', monospace;text-transform:lowercase;">${key}</span><span style="font-family:'Courier New', monospace;">${Math.floor(this.resources[key] || 0)}</span>`;
      invList.appendChild(item);
    });
  }
  
  setupCheatListener() {
    const cheatSeq = ['r','u','i','n','t','h','e','f','u','n'];
    let cheatIdx = 0;
    let cheatTimer = null;
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === cheatSeq[cheatIdx]) {
        if (cheatIdx === 0) {
          cheatTimer = setTimeout(() => { cheatIdx = 0; }, 15000);
        }
        cheatIdx++;
        if (cheatIdx === cheatSeq.length) {
          cheatIdx = 0;
          clearTimeout(cheatTimer);
          this.enableCheatMenu();
        }
      } else {
        cheatIdx = 0;
        clearTimeout(cheatTimer);
      }
    });
  }

  enableCheatMenu() {
    if (document.getElementById('cheatBtn')) return;
    const footer = document.querySelector('.footer');
    const cheatBtn = document.createElement('button');
    cheatBtn.id = 'cheatBtn';
    cheatBtn.textContent = 'Cheats';
    cheatBtn.onclick = () => this.showCheatMenu();
    footer.appendChild(cheatBtn);
    localStorage.setItem('cheatsEnabled', 'true');
  }

  showCheatMenu() {
    alert('Cheat menu coming soon!');
  }

  renderVillage() {
    const info = document.getElementById('villageInfo');
    info.innerHTML = `
      <div>buildings: ${this.state.huts}</div>
      <div>traps: ${this.state.buildings.traps || 0}</div>
      ${this.state.buildings.nomadShop > 0 ? `<div>nomad shop: ${this.state.buildings.nomadShop}</div>` : ''}
      ${this.state.buildings.hunterShed > 0 ? `<div>hunter shed: ${this.state.buildings.hunterShed}</div>` : ''}
      <div>population: ${this.state.villagers.length}</div>
      <hr style="border:0;border-top:1px solid var(--border);margin:6px 0;">
    `;
    
    const jobCounts = {};
    this.state.villagers.forEach(villager => {
      jobCounts[villager.job] = (jobCounts[villager.job] || 0) + 1;
    });
    
    Object.entries(jobCounts).forEach(([job, count]) => {
      const div = document.createElement('div');
      div.className = 'villager';
      div.innerHTML = `<span>${job}s</span><span>${count}</span>`;
      info.appendChild(div);
    });
  }

  renderStatus() {
    document.getElementById('fireStatus').textContent = this.state.fireLit ? 'burning' : 'unlit';
    document.getElementById('dayCounter').textContent = this.state.day;
    document.getElementById('population').textContent = this.state.villagers.length;
    const dayLength = 240000 / this.speed;
    const nightLength = 120000 / this.speed;
    const totalCycle = dayLength + nightLength;
    const currentTime = Date.now() - (this.startTime || Date.now());
    const cyclePosition = currentTime % totalCycle;

    let hour, minute, ampm;
    if (cyclePosition < dayLength) {
      const dayProgress = cyclePosition / dayLength;
      hour = Math.floor(6 + dayProgress * 12);
      minute = Math.floor((dayProgress * 12 - (hour - 6)) * 60);
    } else {
      const nightProgress = (cyclePosition - dayLength) / nightLength;
      hour = Math.floor(18 + nightProgress * 12);
      if (hour >= 24) hour -= 24;
      minute = Math.floor((nightProgress * 12 - (hour >= 18 ? hour - 18 : hour + 6)) * 60);
    }
    ampm = hour < 12 ? 'am' : 'pm';
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;
    const displayMinute = minute.toString().padStart(2, '0');
    document.getElementById('timeIndicator').textContent = `${displayHour}:${displayMinute} ${ampm}`;
  }

  showSpeedModal() {
    const overlay = document.getElementById('modalOverlay');
    const titleEl = document.getElementById('modalTitle');
    const textEl = document.getElementById('modalText');
    const actionsEl = document.getElementById('modalActions');

    titleEl.textContent = 'Game Speed';
    textEl.textContent = 'Choose your speed mode.\nClassic is normal speed (1x).\nHyper is double speed (2x).';

    actionsEl.innerHTML = '';

    let closeBtn = document.getElementById('modalCloseBtn');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.id = 'modalCloseBtn';
      closeBtn.textContent = '×';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '8px';
      closeBtn.style.right = '12px';
      closeBtn.style.background = 'none';
      closeBtn.style.border = 'none';
      closeBtn.style.color = 'var(--text-primary)';
      closeBtn.style.fontSize = '20px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.zIndex = '10';
      closeBtn.onclick = () => {
        overlay.style.display = 'none';
      };
      const modal = overlay.querySelector('.modal');
      if (modal && !modal.contains(closeBtn)) {
        modal.appendChild(closeBtn);
      }
    }

    const classicBtn = document.createElement('button');
    classicBtn.className = 'modal-btn' + (this.speed === 1 ? ' selected-speed' : '');
    classicBtn.textContent = 'Classic';
    classicBtn.onclick = () => {
      if (this.speed !== 1) {
        this.speed = 1;
        this.addEvent('classic mode enabled.');
        this.render();
      }
      overlay.style.display = 'none';
    };
    actionsEl.appendChild(classicBtn);

    const hyperBtn = document.createElement('button');
    hyperBtn.className = 'modal-btn' + (this.speed === 2 ? ' selected-speed' : '');
    hyperBtn.textContent = 'Hyper';
    hyperBtn.onclick = () => {
      if (this.speed !== 2) {
        this.speed = 2;
        this.addEvent('hyper mode enabled.');
        this.render();
      }
      overlay.style.display = 'none';
    };
    actionsEl.appendChild(hyperBtn);

    const style = document.createElement('style');
    style.textContent = `
      .modal-btn.selected-speed {
        border-width: 1.5px !important;
        border-color: #fff !important;
      }
    `;
    document.head.appendChild(style);

    overlay.style.display = 'flex';
  }

  showCredits() {
      const overlay = document.getElementById('modalOverlay');
      const titleEl = document.getElementById('modalTitle');
      const textEl = document.getElementById('modalText');
      const actionsEl = document.getElementById('modalActions');

      titleEl.textContent = 'Wait, is this just A Dark Room?';
      textEl.innerHTML = `I was bored and wanted to see what would happen if I recoded A Dark Room.<br><br>
      Big thanks to <a href="https://adarkroom.doublespeakgames.com/" target="_blank" style="color: #fff; text-decoration: underline;">A Dark Room</a> for the incredible inspiration - make sure to check out the original game too!<br><br>
      This edition includes better day/night cycles, status effects, health mechanics, new trades, extended random events, and psychological elements.<br><br>
      <a style="color: #fff;">Made by parallax</a>`;

      actionsEl.innerHTML = '';

      let closeBtn = document.getElementById('modalCloseBtn');
      if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.id = 'modalCloseBtn';
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '8px';
        closeBtn.style.right = '12px';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'var(--text-primary)';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '10';
        closeBtn.onclick = () => {
          overlay.style.display = 'none';
        };
        const modal = overlay.querySelector('.modal');
        if (modal && !modal.querySelector('#modalCloseBtn')) {
          modal.style.position = 'relative';
          modal.appendChild(closeBtn);
        }
      }

      const githubBtn = document.createElement('button');
      githubBtn.className = 'modal-btn';
      githubBtn.textContent = 'View on GitHub';
      githubBtn.onclick = () => {
        window.open('https://github.com/paral-lax/Wait-is-this-just-a-dark-room', '_blank');
        overlay.style.display = 'none';
      };
      actionsEl.appendChild(githubBtn);

      const websiteBtn = document.createElement('button');
      websiteBtn.className = 'modal-btn';
      websiteBtn.textContent = 'Visit Website';
      websiteBtn.onclick = () => {
        window.open('https://parallax.dev', '_blank');
        overlay.style.display = 'none';
      };
      actionsEl.appendChild(websiteBtn);

      const originalBtn = document.createElement('button');
      originalBtn.className = 'modal-btn';
      originalBtn.textContent = 'Play Original';
      originalBtn.onclick = () => {
        window.open('https://adarkroom.doublespeakgames.com/', '_blank');
        overlay.style.display = 'none';
      };
      actionsEl.appendChild(originalBtn);

      overlay.style.display = 'flex';
      }

  reset() {
    const overlay = document.getElementById('modalOverlay');
    const titleEl = document.getElementById('modalTitle');
    const textEl = document.getElementById('modalText');
    const actionsEl = document.getElementById('modalActions');

    titleEl.textContent = 'Reset Progress';
    textEl.textContent = 'Are you sure you want to reset all progress? This cannot be undone.';
    actionsEl.innerHTML = '';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'modal-btn danger';
    confirmBtn.textContent = 'Reset';
    confirmBtn.onclick = () => {
      localStorage.removeItem('darkroom_save');
      overlay.style.display = 'none';
      location.reload();
    };
    actionsEl.appendChild(confirmBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
      overlay.style.display = 'none';
    };
    actionsEl.appendChild(cancelBtn);

    overlay.style.display = 'flex';
  }

  saveGame(showToast = false) {
    const saveData = {
      resources: this.resources,
      state: this.state,
      events: this.events,
      speed: this.speed,
      theme: this.theme,
      startTime: this.startTime,
      saveTime: Date.now()
    };
    localStorage.setItem('darkroom_save', JSON.stringify(saveData));
    
    if (showToast) {
      const toast = document.getElementById('toast');
      toast.style.display = 'block';
      setTimeout(() => toast.style.display = 'none', 1500);
    }
  }

  loadGame() {
    const saveData = localStorage.getItem('darkroom_save');
    if (saveData) {
      try {
        const data = JSON.parse(saveData);
        this.resources = { ...this.resources, ...data.resources };
        this.state = { ...this.state, ...data.state };
        this.events = data.events || this.events;
        this.speed = data.speed || 1;
        this.theme = data.theme || 'dark';
        this.startTime = data.startTime || Date.now();
        
        this.state.villagers.forEach(villager => {
          if (!villager.health) villager.health = 10;
          if (!villager.type) villager.type = 'adult';
        });
        
        document.body.setAttribute('data-theme', this.theme);
        document.getElementById('themeBtn').textContent = this.theme === 'dark' ? 'light' : 'dark';
        
        if (this.events.length === 0) {
          this.addEvent('something feels off about this place.', 'error');
        }
        
        this.render();
      } catch (e) {
        console.error('Failed to load save data');
      }
    }
  }
}

const game = new WaitIsThisJustADarkRoom();
