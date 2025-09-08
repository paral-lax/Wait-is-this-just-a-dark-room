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
      ...this.actions.activity,
      ...this.actions.jobs
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
    
    this.flashEventTitle();
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
  randomEvents = [
    {
    id: 'wanderer',
    title: 'A Stranger Approaches',
    text: 'A weary traveler emerges from the forest, drawn by the light of your fire. They look tired and hungry, but their eyes hold wisdom.',
    actions: [
        { text: 'invite them in', result: 'wanderer_accept' },
        { text: 'turn them away', result: 'wanderer_reject' },
        { text: 'offer food', result: 'wanderer_feed', cost: { food: 5 } }
    ],
    chance: 0.17,
    condition: () => this.state.fireLit && this.state.huts > this.state.villagers.length
    },
    {
    id: 'lost_child',
    title: 'Lost Child',
    text: 'A small child stumbles into your camp, crying and alone.',
    actions: [
        { text: 'take them in', result: 'mother_child_accept' },
        { text: 'give food and send away', result: 'mother_child_feed', cost: { food: 3 } },
        { text: 'ignore', result: 'mother_child_reject' }
    ],
    chance: 0.09,
    condition: () => this.state.huts > this.state.villagers.length
    },
    {
    id: 'wandering_dog',
    title: 'A Wandering Dog',
    text: 'A scruffy dog circles your settlement, tail wagging hopefully.',
    actions: [
        { text: 'feed it', result: 'dog_feed', cost: { food: 2 } },
        { text: 'chase it off', result: 'dog_chase' }
    ],
    chance: 0.07,
    condition: () => this.state.day > 2
    },
    {
    id: 'merchant_visit',
    title: 'Traveling Merchant',
    text: 'A merchant arrives, offering rare goods for trade.',
    actions: [
        { text: 'trade wood for meds', result: 'merchant_trade_meds', cost: { wood: 30 } },
        { text: 'trade fur for knife', result: 'merchant_trade_knife', cost: { fur: 10 } },
        { text: 'decline', result: 'merchant_decline' }
    ],
    chance: 0.08,
    condition: () => this.state.day > 4
    },
    {
    id: 'mysterious_note',
    title: 'Mysterious Note',
    text: 'You find a note pinned to a tree: "Beware the night. They come when the fire dies."',
    actions: [
        { text: 'burn the note', result: 'note_burn' },
        { text: 'keep the note', result: 'note_keep' }
    ],
    chance: 0.05,
    condition: () => true
    },
    {
    id: 'abandoned_cart',
    title: 'Abandoned Cart',
    text: 'A broken cart sits nearby, its contents scattered.',
    actions: [
        { text: 'search the cart', result: 'cart_search' },
        { text: 'leave it', result: 'cart_leave' }
    ],
    chance: 0.07,
    condition: () => true
    },
    {
    id: 'forest_fire',
    title: 'Forest Fire',
    text: 'Smoke rises in the distance. A forest fire threatens your settlement.',
    actions: [
        { text: 'douse with water', result: 'fire_douse', cost: { wood: 10 } },
        { text: 'evacuate', result: 'fire_evacuate' }
    ],
    chance: 0.01,
    condition: () => this.state.day > 6
    },
    {
    id: 'strange_dream',
    title: 'Strange Dream',
    text: 'You awake from a vivid dream of a place filled with light and warmth.',
    actions: [
        { text: 'ponder its meaning', result: 'dream_ponder' },
        { text: 'ignore', result: 'dream_ignore' }
    ],
    chance: 0.06,
    condition: () => this.state.isNight
    },
    {
    id: 'hidden_cache',
    title: 'Hidden Cache',
    text: 'A villager discovers a hidden cache beneath the floor.',
    actions: [
        { text: 'open it', result: 'cache_open' },
        { text: 'leave it alone', result: 'cache_leave' }
    ],
    chance: 0.07,
    condition: () => this.state.villagers.length > 0
    },
    {
    id: 'sickness_spreads',
    title: 'Sickness Spreads',
    text: 'A cough echoes through the huts. Sickness is spreading.',
    actions: [
        { text: 'use medicine', result: 'sickness_meds', cost: { meds: 2 } },
        { text: 'quarantine', result: 'sickness_quarantine' }
    ],
    chance: 0.09,
    condition: () => this.state.villagers.length > 2
    },
    {
    id: 'night_raid',
    title: 'Night Raid',
    text: 'Bandits attack under cover of darkness!',
    actions: [
        { text: 'fight back', result: 'raid_fight' },
        { text: 'hide supplies', result: 'raid_hide' },
        { text: 'surrender', result: 'raid_surrender' }
    ],
    chance: 0.05,
    condition: () => this.state.isNight && this.state.villagers.length > 3
    },
    {
    id: 'strange_herbs',
    title: 'Strange Herbs',
    text: 'A villager brings back strange herbs from the forest.',
    actions: [
        { text: 'brew medicine', result: 'herbs_brew' },
        { text: 'discard', result: 'herbs_discard' }
    ],
    chance: 0.06,
    condition: () => this.state.day > 5
    },
    {
    id: 'flooded_traps',
    title: 'Flooded Traps',
    text: 'Heavy rain floods your traps, ruining their yield.',
    actions: [
        { text: 'repair traps', result: 'traps_repair', cost: { wood: 10, stone: 5 } },
        { text: 'leave the traps destroyed', result: 'traps_leave' }
    ],
    chance: 0.07,
    condition: () => this.state.buildings.traps > 0
    },
    {
    id: 'nomad_story',
    title: 'Nomad\'s Tale',
    text: 'A passing nomad shares a story of a hidden valley rich with resources.',
    actions: [
        { text: 'ask for directions', result: 'nomad_directions', cost: { cloth: 2 } },
        { text: 'offer food', result: 'nomad_food', cost: { food: 4 } },
        { text: 'ignore', result: 'nomad_ignore' }
    ],
    chance: 0.05,
    condition: () => this.state.buildings.nomadShop > 0
    },
    {
    id: 'strange_noise',
    title: 'Strange Noise',
    text: 'A strange noise echoes from the woods at night.',
    actions: [
        { text: 'investigate', result: 'noise_investigate' },
        { text: 'stay inside', result: 'noise_stay' }
    ],
    chance: 0.08,
    condition: () => this.state.isNight
    },
    {
    id: 'supply_drop',
    title: 'Supply Drop',
    text: 'A crate falls from the sky, landing nearby.',
    actions: [
        { text: 'open crate', result: 'crate_open' },
        { text: 'leave it', result: 'crate_leave' }
    ],
    chance: 0.03,
    condition: () => this.state.day > 10
    },
    {
    id: 'wild_boar',
    title: 'Wild Boar Attack',
    text: 'A wild boar charges through your camp!',
    actions: [
        { text: 'fight', result: 'boar_fight' },
        { text: 'flee', result: 'boar_flee', cost: { food: 3 } }
    ],
    chance: 0.04,
    condition: () => this.state.day > 7
    },
    {
    id: 'old_ruins',
    title: 'Old Ruins',
    text: 'You discover ancient ruins nearby.',
    actions: [
        { text: 'explore', result: 'ruins_explore' },
        { text: 'avoid', result: 'ruins_avoid' }
    ],
    chance: 0.06,
    condition: () => this.state.day > 8
    },
    {
    id: 'mysterious_stranger',
    title: 'Mysterious Stranger',
    text: 'A cloaked figure offers to teach your villagers new skills.',
    actions: [
        { text: 'accept', result: 'stranger_accept', cost: { food: 5 } },
        { text: 'decline', result: 'stranger_decline' }
    ],
    chance: 0.05,
    condition: () => this.state.villagers.length > 2
    },
    {
    id: 'meteor_shower',
    title: 'Meteor Shower',
    text: 'Bright meteors streak across the night sky.',
    actions: [
        { text: 'watch in awe', result: 'meteor_watch' },
        { text: 'search for fragments', result: 'meteor_search' }
    ],
    chance: 0.03,
    condition: () => this.state.isNight
    },
    {
    id: 'stray_cat',
    title: 'Stray Cat',
    text: 'A stray cat appears, meowing for food.',
    actions: [
        { text: 'feed', result: 'cat_feed', cost: { food: 1 } },
        { text: 'ignore', result: 'cat_ignore' }
    ],
    chance: 0.05,
    condition: () => true
    },
    {
    id: 'strange_fungus',
    title: 'Strange Fungus',
    text: 'A strange fungus grows near your settlement.',
    actions: [
        { text: 'harvest', result: 'fungus_harvest' },
        { text: 'destroy', result: 'fungus_destroy' }
    ],
    chance: 0.04,
    condition: () => this.state.day > 3
    },
    {
    id: 'traveling_bard',
    title: 'Traveling Bard',
    text: 'A bard offers to play music for your villagers.',
    actions: [
        { text: 'listen', result: 'bard_listen', cost: { food: 2 } },
        { text: 'decline', result: 'bard_decline' }
    ],
    chance: 0.04,
    condition: () => this.state.day > 5
    },
    {
    id: 'strange_light',
    title: 'Strange Light',
    text: 'A strange light flickers in the distance.',
    actions: [
        { text: 'investigate', result: 'light_investigate' },
        { text: 'ignore', result: 'light_ignore' }
    ],
    chance: 0.03,
    condition: () => true
    },
    {
    id: 'abandoned_hut',
    title: 'Abandoned Hut',
    text: 'You find an abandoned hut nearby.',
    actions: [
        { text: 'search', result: 'hut_search' },
        { text: 'leave', result: 'hut_leave' }
    ],
    chance: 0.05,
    condition: () => this.state.day > 2
    },
    {
    id: 'mysterious_illness',
    title: 'Mysterious Illness',
    text: 'A villager falls ill with unknown symptoms.',
    actions: [
        { text: 'use medicine', result: 'illness_meds', cost: { meds: 1 } },
        { text: 'wait and see', result: 'illness_wait' }
    ],
    chance: 0.06,
    condition: () => this.state.villagers.length > 0
    },
    {
    id: 'strange_visitor',
    title: 'Strange Visitor',
    text: 'A visitor claims to know secrets of survival.',
    actions: [
        { text: 'listen', result: 'visitor_listen', cost: { food: 2 } },
        { text: 'send away', result: 'visitor_send' }
    ],
    chance: 0.05,
    condition: () => this.state.day > 3
    },
    {
    id: 'broken_tools',
    title: 'Broken Tools',
    text: 'Some of your tools break unexpectedly.',
    actions: [
        { text: 'repair', result: 'tools_repair', cost: { wood: 5, stone: 2 } },
        { text: 'replace', result: 'tools_replace', cost: { wood: 10 } }
    ],
    chance: 0.06,
    condition: () => this.resources.wood > 10
    },
    {
    id: 'strange_markings',
    title: 'Strange Markings',
    text: 'You find strange markings carved into a nearby tree.',
    actions: [
        { text: 'study', result: 'markings_study' },
        { text: 'ignore', result: 'markings_ignore' }
    ],
    chance: 0.04,
    condition: () => true
    },
    {
    id: 'sudden_storm',
    title: 'Sudden Storm',
    text: 'A sudden storm batters your settlement.',
    actions: [
        { text: 'secure huts', result: 'storm_secure', cost: { wood: 8 } },
        { text: 'wait it out', result: 'storm_wait' }
    ],
    chance: 0.05,
    condition: () => this.state.huts > 0
    },
    {
    id: 'strange_shadow',
    title: 'Strange Shadow',
    text: 'A shadow moves just beyond the firelight.',
    actions: [
        { text: 'investigate', result: 'shadow_investigate' },
        { text: 'stay close to fire', result: 'shadow_stay' }
    ],
    chance: 0.04,
    condition: () => this.state.isNight
    },
    {
    id: 'friendly_trader',
    title: 'Friendly Trader',
    text: 'A friendly trader offers a fair deal.',
    actions: [
        { text: 'trade food for fur', result: 'trader_food_fur', cost: { food: 5 } },
        { text: 'trade wood for stone', result: 'trader_wood_stone', cost: { wood: 10 } },
        { text: 'decline', result: 'trader_decline' }
    ],
    chance: 0.06,
    condition: () => this.state.day > 2
    },
    {
    id: 'strange_weather',
    title: 'Strange Weather',
    text: 'The weather shifts suddenly, bringing cold winds.',
    actions: [
        { text: 'light fire', result: 'weather_fire', cost: { wood: 5 } },
        { text: 'wait', result: 'weather_wait' }
    ],
    chance: 0.05,
    condition: () => true
    },
    {
    id: 'wild_horse',
    title: 'Wild Horse',
    text: 'A wild horse grazes nearby.',
    actions: [
        { text: 'try to tame', result: 'horse_tame', cost: { food: 3 } },
        { text: 'ignore', result: 'horse_ignore' }
    ],
    chance: 0.03,
    condition: () => this.state.day > 6
    },
    {
    id: 'strange_echo',
    title: 'Strange Echo',
    text: 'An echo repeats your words from the darkness.',
    actions: [
        { text: 'shout', result: 'echo_shout' },
        { text: 'stay silent', result: 'echo_silent' }
    ],
    chance: 0.04,
    condition: () => this.state.isNight
    },
    {
    id: 'abandoned_wagon',
    title: 'Abandoned Wagon',
    text: 'An abandoned wagon sits on the edge of the forest.',
    actions: [
        { text: 'search', result: 'wagon_search' },
        { text: 'leave', result: 'wagon_leave' }
    ],
    chance: 0.05,
    condition: () => true
    },
    {
    id: 'strange_song',
    title: 'Strange Song',
    text: 'A haunting song drifts through the night air.',
    actions: [
        { text: 'follow the sound', result: 'song_follow' },
        { text: 'cover ears', result: 'song_ignore' }
    ],
    chance: 0.03,
    condition: () => this.state.isNight
    },
    {
    id: 'hidden_passage',
    title: 'Hidden Passage',
    text: 'A hidden passage is discovered beneath your hut.',
    actions: [
        { text: 'explore', result: 'passage_explore' },
        { text: 'seal it', result: 'passage_seal', cost: { stone: 5 } }
    ],
    chance: 0.04,
    condition: () => this.state.huts > 0
    },
    {
    id: 'strange_disease',
    title: 'Strange Disease',
    text: 'A strange disease affects your crops.',
    actions: [
        { text: 'burn crops', result: 'disease_burn', cost: { wood: 5 } },
        { text: 'try medicine', result: 'disease_meds', cost: { meds: 1 } }
    ],
    chance: 0.03,
    condition: () => this.state.day > 7
    },
    {
    id: 'strange_artifact',
    title: 'Strange Artifact',
    text: 'A villager finds a strange artifact buried in the ground.',
    actions: [
        { text: 'study', result: 'artifact_study' },
        { text: 'discard', result: 'artifact_discard' }
    ],
    chance: 0.04,
    condition: () => true && this.state.villagers.length > 0
    },
    {
    id: 'strange_visitor_night',
    title: 'Night Visitor',
    text: 'A visitor arrives in the dead of night, face hidden.',
    actions: [
        { text: 'invite in', result: 'night_visitor_invite' },
        { text: 'send away', result: 'night_visitor_send' }
    ],
    chance: 0.03,
    condition: () => this.state.isNight
    },
    {
    id: 'strange_rumor',
    title: 'Strange Rumor',
    text: 'A rumor spreads among your villagers.',
    actions: [
        { text: 'investigate', result: 'rumor_investigate' },
        { text: 'ignore', result: 'rumor_ignore' }
    ],
    chance: 0.04,
    condition: () => this.state.villagers.length > 1
    },
    {
    id: 'strange_feast',
    title: 'Strange Feast',
    text: 'A villager suggests a feast to boost morale.',
    actions: [
        { text: 'hold feast', result: 'feast_hold', cost: { food: 10 } },
        { text: 'decline', result: 'feast_decline' }
    ],
    chance: 0.03,
    condition: () => this.state.villagers.length > 2 && this.resources.food > 10
    },
    {
    id: 'strange_trade',
    title: 'Strange Trade',
    text: 'A trader offers a mysterious box for a high price.',
    actions: [
        { text: 'buy box', result: 'trade_buy', cost: { wood: 20, stone: 10 } },
        { text: 'decline', result: 'trade_decline' }
    ],
    chance: 0.03,
    condition: () => this.state.day > 8
    },
    {
    id: 'strange_vision',
    title: 'Strange Vision',
    text: 'You experience a vision of a thriving settlement.',
    actions: [
        { text: 'share with villagers', result: 'vision_share' },
        { text: 'keep secret', result: 'vision_secret' }
    ],
    chance: 0.03,
    condition: () => this.state.day > 5
    },
    {
    id: 'water_poisoning',
    title: 'Water Poisoning',
    text: 'The water from your last source tasted metallic. Now, your stomach cramps violently, and the world swims before your eyes.',
    actions: [
        { text: 'tough it out', result: 'poison_tough' },
        { text: 'use medicine', result: 'poison_meds', cost: { meds: 1 }, condition: () => this.resources.meds > 0 },
        { text: 'purify water', result: 'poison_purify', cost: { wood: 20, cloth: 1 } }
    ],
    chance: 0.08,
    condition: () => this.state.day > 3
    },
    {
    id: 'sprained_ankle',
    title: 'Sprained Ankle',
    text: 'You slipped on loose rubble while scavenging. A sharp pain shoots up your leg with every step.',
    actions: [
        { text: 'rest completely', result: 'ankle_rest' },
        { text: 'fashion splint', result: 'ankle_splint', cost: { wood: 10, cloth: 5 } },
        { text: 'ignore the pain', result: 'ankle_ignore' }
    ],
    chance: 0.06,
    condition: () => true
    },
    {
    id: 'voices_woods',
    title: 'Voices in the Woods',
    text: "You're sure you hear it... just on the edge of hearing. A voice calling your name. A child's laughter. A snippet of a forgotten song.",
    actions: [
        { text: 'investigate sound', result: 'voices_investigate' },
        { text: 'ignore it', result: 'voices_ignore' },
        { text: 'shout into woods', result: 'voices_shout' }
    ],
    chance: 0.09,
    condition: () => this.state.day > 2
    },
    {
    id: 'lonely_mother_child',
    title: 'A Mother and Child',
    text: 'A tired woman approaches with a small child clinging to her dress. They both look hungry and desperate.',
    actions: [
        { text: 'welcome them', result: 'mother_child_accept' },
        { text: 'turn them away', result: 'mother_child_reject' },
        { text: 'offer food only', result: 'mother_child_feed', cost: { food: 8 } }
    ],
    chance: 0.12,
    condition: () => this.state.huts >= 2 && this.state.villagers.length < this.state.huts - 1
    },
    {
    id: 'lonely_mother_teen',
    title: 'A Mother and Teen',
    text: 'A weathered woman walks up with a teenage boy. The boy carries hunting tools and looks capable.',
    actions: [
        { text: 'welcome them both', result: 'mother_teen_accept' },
        { text: 'turn them away', result: 'mother_teen_reject' },
        { text: 'hire just the boy', result: 'mother_teen_boy' }
    ],
    chance: 0.1,
    condition: () => this.state.huts >= 2 && this.state.villagers.length < this.state.huts - 1
    },
    {
    id: 'sketchy_man',
    title: 'A Sketchy Stranger',
    text: 'A shifty-eyed man approaches your settlement. Something about him makes you uneasy, but he claims to be a skilled worker.',
    actions: [
        { text: 'hire him', result: 'sketchy_accept' },
        { text: 'turn him away', result: 'sketchy_reject' },
        { text: 'interrogate him', result: 'sketchy_question' }
    ],
    chance: 0.07,
    condition: () => this.state.huts > this.state.villagers.length
    },
    {
    id: 'old_wise_man',
    title: 'An Old Sage',
    text: 'An elderly man with knowing eyes approaches. He speaks of the old world and offers wisdom in exchange for shelter.',
    actions: [
        { text: 'welcome him', result: 'sage_accept' },
        { text: 'decline politely', result: 'sage_decline' },
        { text: 'ask for advice', result: 'sage_advice' }
    ],
    chance: 0.06,
    condition: () => this.state.huts > this.state.villagers.length && this.state.day > 5
    },
    {
    id: 'wandering_tinker',
    title: 'The Wandering Tinker',
    text: 'A hunched figure pushing a cart filled with bizarre, rattling tools and salvaged parts approaches. They have a keen, intelligent eye.',
    actions: [
        { text: 'trade for unique item', result: 'tinker_trade', cost: { stone: 20, teeth: 5 } },
        { text: 'share a meal', result: 'tinker_meal', cost: { food: 5 } },
        { text: 'ignore them', result: 'tinker_ignore' }
    ],
    chance: 0.04,
    condition: () => this.state.day > 7
    },
    {
    id: 'quiet_forager',
    title: 'The Quiet Forager',
    text: 'A person with a keen eye approaches. Their pockets are full of rare roots and herbs you usually walk right past.',
    actions: [
        { text: 'ask to learn', result: 'forager_learn' },
        { text: 'trade for herbs', result: 'forager_trade', cost: { food: 8 } },
        { text: 'demand their bag', result: 'forager_rob' }
    ],
    chance: 0.06,
    condition: () => this.state.day > 4
    },
    {
    id: 'territorial_bear',
    title: 'The Territorial Bear',
    text: 'A massive grizzly, lean and hungry, rises from behind a fallen log. It regards you not as a threat, but as a competitor—or prey.',
    actions: [
        { text: 'stand ground and shout', result: 'bear_shout' },
        { text: 'play dead', result: 'bear_dead' },
        { text: 'fight', result: 'bear_fight' },
        { text: 'flee', result: 'bear_flee', cost: { food: 10 } }
    ],
    chance: 0.04,
    condition: () => this.state.day > 6
    }
  ];

  handleEventResult(result) {
    switch (result) {
      case 'wanderer_accept':
      if (this.state.huts > this.state.villagers.length) {
        this.addVillager('wanderer', 'adult');
        this.addEvent('the stranger joins your settlement.', 'success');
      } else {
        this.addEvent('no room for the stranger.');
      }
      break;
      case 'wanderer_reject':
      this.addEvent('the stranger leaves disappointed.');
      break;
      case 'wanderer_feed':
      this.resources.wood += 10;
      this.resources.stone += 5;
      this.addEvent('grateful, the stranger shares some supplies.', 'success');
      break;

      case 'poison_tough':
      this.addStatusEffect('afflicted');
      this.addEvent('you decide to tough it out. you feel terrible.', 'error');
      break;
      case 'poison_meds':
      this.addEvent('the medicine helps. you feel better quickly.', 'success');
      break;
      case 'poison_purify':
      this.addEvent('you boil all water carefully. crisis averted.');
      break;

      case 'ankle_rest':
      this.addStatusEffect('tired');
      this.addEvent('you rest completely. your ankle heals.');
      break;
      case 'ankle_splint':
      this.addEvent('the splint helps your ankle heal faster.', 'success');
      break;
      case 'ankle_ignore':
      this.addStatusEffect('limping');
      this.addEvent('ignoring the pain makes it worse.', 'error');
      break;

      case 'voices_investigate':
      this.addStatusEffect('unease');
      this.addEvent('you find nothing, but the voices return louder.', 'error');
      break;
      case 'voices_ignore':
      this.addEvent('the voices eventually stop.');
      break;
      case 'voices_shout':
      this.addStatusEffect('unease');
      this.addEvent('the sudden silence feels worse than the voices.', 'error');
      break;

      case 'mother_child_accept':
      if (this.state.huts >= this.state.villagers.length + 2) {
        this.addVillager('mother', 'adult');
        this.addVillager('child', 'child');
        this.unlockJobsTab();
        this.addEvent('the mother and child join your settlement.', 'success');
      } else {
        this.addEvent('not enough room for both of them.');
      }
      break;
      case 'mother_child_reject':
      this.addEvent('they leave sadly, hand in hand.');
      break;
      case 'mother_child_feed':
      this.resources.stone += 8;
      this.addEvent('grateful, the mother gives you some stones.', 'success');
      break;

      case 'mother_teen_accept':
      if (this.state.huts >= this.state.villagers.length + 2) {
        this.addVillager('mother', 'adult');
        this.addVillager('teen', 'teen');
        this.unlockJobsTab();
        this.addEvent('the mother and teen join your settlement.', 'success');
      } else {
        this.addEvent('not enough room for both of them.');
      }
      break;
      case 'mother_teen_boy':
      if (this.state.huts > this.state.villagers.length) {
        this.addVillager('teen worker', 'teen');
        this.unlockJobsTab();
        this.addEvent('the boy joins you. his mother continues on.', 'success');
      }
      break;

      case 'sketchy_accept':
      this.addVillager('sketchy man', 'adult', 6);
      this.unlockJobsTab();
      this.addEvent('the sketchy man joins, but something feels off...', 'error');
      setTimeout(() => this.sketchyBetrayal(), (60000 + Math.random() * 180000) / this.speed);
      break;
      case 'sketchy_reject':
      this.addEvent('the man leaves with a dark look.');
      break;
      case 'sketchy_question':
      if (Math.random() < 0.5) {
        this.addEvent('suspicious of your questions, he leaves quickly.');
      } else {
        this.addEvent('he answers your questions satisfactorily.');
      }
      break;

      case 'sage_accept':
      if (this.state.huts > this.state.villagers.length) {
        this.addVillager('wise elder', 'adult', 8);
        this.unlockJobsTab();
        this.addStatusEffect('purpose');
        this.addEvent('the wise man joins and shares ancient knowledge.', 'success');
      } else {
        this.addEvent('no room for the elder.');
      }
      break;
      case 'sage_decline':
      this.addEvent('the old man nods understandingly and walks away.');
      break;
      case 'sage_advice':
      this.resources.meds += 2;
      this.addEvent('the elder shares medicinal wisdom.', 'success');
      break;

      case 'tinker_trade':
      this.resources.knife += 1;
      this.resources.cloth += 3;
      this.addEvent('the tinker gives you superior tools.', 'success');
      break;
      case 'tinker_meal':
      this.resources.stone += 5;
      this.addEvent('the tinker shares a map to stone deposits.', 'success');
      break;
      case 'tinker_ignore':
      this.addEvent('the tinker shuffles away, muttering.');
      break;

      case 'forager_learn':
      this.resources.meds += 3;
      this.addEvent('you learn to identify medicinal plants.', 'success');
      break;
      case 'forager_trade':
      this.resources.meds += 2;
      this.resources.cloth += 1;
      this.addEvent('you trade for rare herbs.', 'success');
      break;
      case 'forager_rob':
      if (Math.random() < 0.6) {
        this.resources.meds += 2;
        this.resources.food += 5;
        this.addStatusEffect('paranoid');
        this.addEvent('you take their supplies but feel guilty.', 'error');
      } else {
        this.addEvent('the forager fights back and escapes!', 'error');
      }
      break;

      case 'bear_shout':
      if (Math.random() < 0.6) {
        this.addEvent('the bear backs down and leaves.');
      } else {
        this.handleBearAttack();
      }
      break;
      case 'bear_dead':
      if (Math.random() < 0.3) {
        this.addEvent('the bear sniffs you and leaves.');
      } else {
        this.handleBearAttack();
      }
      break;
      case 'bear_fight':
      if (Math.random() < 0.4) {
        this.resources.fur += 8;
        this.resources.teeth += 5;
        this.resources.food += 15;
        this.addEvent('you defeat the bear and claim its hide!', 'success');
      } else {
        this.handleBearAttack();
      }
      break;
      case 'bear_flee':
      this.addEvent('you escape by dropping your food as distraction.');
      break;

      case 'lost_child':
      if (this.state.huts > this.state.villagers.length) {
        this.addVillager('lost child', 'child');
        this.addEvent('the child joins your settlement.', 'success');
      } else {
        this.addEvent('no room for the child.');
      }
      break;
      case 'mother_child_feed':
      this.resources.food -= 3;
      this.resources.stone += 2;
      this.addEvent('the child leaves with food, but the mother gives you some stones.', 'success');
      break;
      case 'dog_feed':
      this.resources.food -= 2;
      this.addStatusEffect('purpose');
      this.addEvent('the dog becomes loyal and boosts morale.', 'success');
      break;
      case 'dog_chase':
      this.addEvent('the dog runs away, tail between legs.');
      break;
      case 'merchant_trade_meds':
      this.resources.wood -= 30;
      this.resources.meds += 2;
      this.addEvent('you trade wood for medicine.', 'success');
      break;
      case 'merchant_trade_knife':
      this.resources.fur -= 10;
      this.resources.knife += 1;
      this.addEvent('you trade fur for a knife.', 'success');
      break;
      case 'merchant_decline':
      this.addEvent('the merchant shrugs and moves on.');
      break;
      case 'note_burn':
      this.addEvent('you burn the note. the warning echoes in your mind.');
      break;
      case 'note_keep':
      this.addStatusEffect('paranoid');
      this.addEvent('you keep the note. unease grows.', 'error');
      break;
      case 'cart_search':
      this.resources.food += 2;
      this.resources.wood += 5;
      this.addEvent('you find food and wood in the cart.', 'success');
      break;
      case 'cart_leave':
      this.addEvent('you leave the cart untouched.');
      break;
      case 'fire_douse':
      this.resources.wood -= 10;
      this.addEvent('you douse the fire and save your settlement.', 'success');
      break;
      case 'fire_evacuate':
      this.addStatusEffect('tired');
      this.addEvent('you evacuate. some resources lost.', 'error');
      Object.keys(this.resources).forEach(r => {
        if (r !== 'meds') this.resources[r] = Math.floor(this.resources[r] * 0.8);
      });
      break;
      case 'dream_ponder':
      this.addStatusEffect('purpose');
      this.addEvent('the dream inspires you.', 'success');
      break;
      case 'dream_ignore':
      this.addEvent('you ignore the dream.');
      break;
      case 'cache_open':
      this.resources.food += 3;
      this.resources.wood += 7;
      this.addEvent('you open the cache and find supplies.', 'success');
      break;
      case 'cache_leave':
      this.addEvent('you leave the cache untouched.');
      break;
      case 'sickness_meds':
      this.resources.meds -= 2;
      this.addEvent('you use medicine and stop the sickness.', 'success');
      break;
      case 'sickness_quarantine':
      this.addStatusEffect('afflicted');
      this.addEvent('quarantine slows the sickness, but morale drops.', 'error');
      break;
      case 'raid_fight':
      if (this.resources.spear > 0) {
        this.resources.spear -= 1;
        this.addEvent('you fight off the bandits with a spear.', 'success');
      } else {
        this.addEvent('you fight but lose some supplies.', 'error');
        Object.keys(this.resources).forEach(r => {
        this.resources[r] = Math.floor(this.resources[r] * 0.9);
        });
      }
      break;
      case 'raid_hide':
      this.addEvent('you hide your supplies. some are saved.');
      break;
      case 'raid_surrender':
      this.addEvent('you surrender. bandits take some resources.', 'error');
      Object.keys(this.resources).forEach(r => {
        this.resources[r] = Math.floor(this.resources[r] * 0.7);
      });
      break;
      case 'herbs_brew':
      this.resources.meds += 1;
      this.addEvent('you brew medicine from the herbs.', 'success');
      break;
      case 'herbs_discard':
      this.addEvent('you discard the strange herbs.');
      break;
      case 'traps_repair':
      this.resources.wood -= 10;
      this.resources.stone -= 5;
      this.addEvent('you repair the traps.', 'success');
      break;
      case 'traps_leave':
    this.state.buildings.traps = 0;
    this.addEvent('the traps got destroyed and you leave them behind.', 'error');
      break;
      case 'nomad_directions':
      this.resources.cloth -= 2;
      this.addEvent('the nomad gives you directions to a hidden valley.', 'success');
      break;
      case 'nomad_food':
      this.resources.food -= 4;
      this.addEvent('the nomad shares a story and boosts morale.', 'success');
      break;
      case 'nomad_ignore':
      this.addEvent('you ignore the nomad.');
      break;
      case 'noise_investigate':
      this.addStatusEffect('paranoid');
      this.addEvent('the noise was nothing, but you feel uneasy.', 'error');
      break;
      case 'noise_stay':
      this.addEvent('you stay inside and remain safe.');
      break;
      case 'crate_open':
      this.resources.food += 5;
      this.resources.wood += 10;
      this.addEvent('you open the crate and find food and wood.', 'success');
      break;
      case 'crate_leave':
      this.addEvent('you leave the crate untouched.');
      break;
      case 'boar_fight':
      this.resources.food += 8;
      this.resources.fur += 3;
      this.addEvent('you defeat the boar and gain food and fur.', 'success');
      break;
      case 'boar_flee':
      this.resources.food -= 3;
      this.addEvent('you flee, dropping some food.', 'error');
      break;
      case 'ruins_explore':
      this.resources.stone += 10;
      this.addEvent('you explore the ruins and find stone.', 'success');
      break;
      case 'ruins_avoid':
      this.addEvent('you avoid the ruins.');
      break;
      case 'stranger_accept':
      this.resources.food -= 5;
      this.addStatusEffect('hardened', -1);
      this.addEvent('villagers learn new skills and become hardened.', 'success');
      break;
      case 'stranger_decline':
      this.addEvent('the stranger leaves.');
      break;
      case 'meteor_watch':
      this.addStatusEffect('purpose');
      this.addEvent('the meteor shower inspires hope.', 'success');
      break;
      case 'meteor_search':
      this.resources.stone += 5;
      this.addEvent('you find meteor fragments (stone).', 'success');
      break;
      case 'cat_feed':
      this.resources.food -= 1;
      this.addEvent('the cat stays and cheers up the villagers.', 'success');
      break;
      case 'cat_ignore':
      this.addEvent('the cat wanders off.');
      break;
      case 'fungus_harvest':
      this.resources.food += 2;
      this.addEvent('you harvest the fungus for food.', 'success');
      break;
      case 'fungus_destroy':
      this.addEvent('you destroy the strange fungus.');
      break;
      case 'bard_listen':
      this.resources.food -= 2;
      this.addStatusEffect('purpose');
      this.addEvent('the music lifts everyone\'s spirits.', 'success');
      break;
      case 'bard_decline':
      this.addEvent('the bard leaves quietly.');
      break;
      case 'light_investigate':
      this.addStatusEffect('unease');
      this.addEvent('the light vanishes as you approach.', 'error');
      break;
      case 'light_ignore':
      this.addEvent('you ignore the strange light.');
      break;
      case 'hut_search':
      this.resources.food += 2;
      this.resources.wood += 3;
      this.addEvent('you find food and wood in the hut.', 'success');
      break;
      case 'hut_leave':
      this.addEvent('you leave the hut untouched.');
      break;
      case 'illness_meds':
      this.resources.meds -= 1;
      this.addEvent('the villager recovers with medicine.', 'success');
      break;
      case 'illness_wait':
      this.addStatusEffect('afflicted');
      this.addEvent('the illness spreads.', 'error');
      break;
      case 'visitor_listen':
      this.resources.food -= 2;
      this.addStatusEffect('purpose');
      this.addEvent('the visitor shares survival secrets.', 'success');
      break;
      case 'visitor_send':
      this.addEvent('the visitor leaves.');
      break;
      case 'tools_repair':
      this.resources.wood -= 5;
      this.resources.stone -= 2;
      this.addEvent('you repair your tools.', 'success');
      break;
      case 'tools_replace':
      this.resources.wood -= 10;
      this.addEvent('you replace your tools.', 'success');
      break;
      case 'markings_study':
      this.addStatusEffect('paranoid');
      this.addEvent('the markings unsettle you.', 'error');
      break;
      case 'markings_ignore':
      this.addEvent('you ignore the markings.');
      break;
      case 'storm_secure':
      this.resources.wood -= 8;
      this.addEvent('you secure the huts and weather the storm.', 'success');
      break;
      case 'storm_wait':
      this.addEvent('you wait out the storm.');
      break;
      case 'shadow_investigate':
      this.addStatusEffect('unease');
      this.addEvent('the shadow disappears, but you feel watched.', 'error');
      break;
      case 'shadow_stay':
      this.addEvent('you stay close to the fire and remain safe.');
      break;
      case 'trader_food_fur':
      this.resources.food -= 5;
      this.resources.fur += 5;
      this.addEvent('you trade food for fur.', 'success');
      break;
      case 'trader_wood_stone':
      this.resources.wood -= 10;
      this.resources.stone += 8;
      this.addEvent('you trade wood for stone.', 'success');
      break;
      case 'trader_decline':
      this.addEvent('the trader leaves.');
      break;
      case 'weather_fire':
      this.resources.wood -= 5;
      this.addEvent('the fire warms everyone against the cold.', 'success');
      break;
      case 'weather_wait':
      this.addEvent('you wait for the weather to pass.');
      break;
      case 'horse_tame':
      this.resources.food -= 3;
      this.addEvent('you tame the horse. travel may be easier soon.', 'success');
      break;
      case 'horse_ignore':
      this.addEvent('the horse runs off.');
      break;
      case 'echo_shout':
      this.addStatusEffect('paranoid');
      this.addEvent('your shout echoes back, unsettling you.', 'error');
      break;
      case 'echo_silent':
      this.addEvent('you stay silent. the echo fades.');
      break;
      case 'wagon_search':
      this.resources.food += 2;
      this.resources.wood += 4;
      this.addEvent('you find food and wood in the wagon.', 'success');
      break;
      case 'wagon_leave':
      this.addEvent('you leave the wagon untouched.');
      break;
      case 'song_follow':
      this.addStatusEffect('unease');
      this.addEvent('the song leads you nowhere. you feel uneasy.', 'error');
      break;
      case 'song_ignore':
      this.addEvent('you cover your ears and ignore the song.');
      break;
      case 'passage_explore':
      this.resources.stone += 6;
      this.addEvent('you explore the passage and find stone.', 'success');
      break;
      case 'passage_seal':
      this.resources.stone -= 5;
      this.addEvent('you seal the passage.', 'success');
      break;
      case 'disease_burn':
      this.resources.wood -= 5;
      this.addEvent('you burn the crops to stop the disease.', 'success');
      break;
      case 'disease_meds':
      this.resources.meds -= 1;
      this.addEvent('you use medicine on the crops.', 'success');
      break;
      case 'artifact_study':
      this.addStatusEffect('purpose');
      this.addEvent('the artifact inspires new ideas.', 'success');
      break;
      case 'artifact_discard':
      this.addEvent('you discard the strange artifact.');
      break;
      case 'night_visitor_invite':
      this.addStatusEffect('paranoid');
      this.addEvent('the visitor shares secrets, but you feel uneasy.', 'error');
      break;
      case 'night_visitor_send':
      this.addEvent('the visitor leaves into the night.');
      break;
      case 'rumor_investigate':
      this.addStatusEffect('paranoid');
      this.addEvent('the rumor leads to suspicion among villagers.', 'error');
      break;
      case 'rumor_ignore':
      this.addEvent('the rumor fades away.');
      break;
      case 'feast_hold':
      this.resources.food -= 10;
      this.addStatusEffect('purpose');
      this.addEvent('the feast boosts morale.', 'success');
      break;
      case 'feast_decline':
      this.addEvent('you decline the feast.');
      break;
      case 'trade_buy':
      this.resources.wood -= 20;
      this.resources.stone -= 10;
      this.resources.food += 10;
      this.addEvent('you buy the mysterious box and find food inside.', 'success');
      break;
      case 'trade_decline':
      this.addEvent('you decline the trade.');
      break;
      case 'vision_share':
      this.addStatusEffect('purpose');
      this.addEvent('sharing your vision inspires the villagers.', 'success');
      break;
      case 'vision_secret':
      this.addEvent('you keep the vision to yourself.');
      break;

      case 'water_poisoning':
      this.addStatusEffect('afflicted');
      this.addEvent('you feel sick from the water.', 'error');
      break;
      case 'poison_meds':
      this.resources.meds -= 1;
      this.addEvent('medicine helps you recover.', 'success');
      break;
      case 'poison_purify':
      this.resources.wood -= 20;
      this.resources.cloth -= 1;
      this.addEvent('you purify the water and avoid sickness.', 'success');
      break;
      case 'sprained_ankle':
      this.addStatusEffect('limping');
      this.addEvent('you sprain your ankle and limp for a while.', 'error');
      break;

      case 'voices_woods':
      this.addStatusEffect('paranoid');
      this.addEvent('the voices haunt you.', 'error');
      break;

      case 'lonely_mother_child':
      if (this.state.huts >= this.state.villagers.length + 2) {
        this.addVillager('mother', 'adult');
        this.addVillager('child', 'child');
        this.unlockJobsTab();
        this.addEvent('the mother and child join your settlement.', 'success');
      } else {
        this.addEvent('not enough room for both of them.');
      }
      break;
      case 'lonely_mother_teen':
      if (this.state.huts >= this.state.villagers.length + 2) {
        this.addVillager('mother', 'adult');
        this.addVillager('teen', 'teen');
        this.unlockJobsTab();
        if (!this.state.buildings.hunterShed) {
          this.state.buildings.hunterShed = 1;
          this.addEvent('the teen teaches your settlement hunting techniques!', 'success');
        }
        this.addEvent('the mother and teen join your settlement.', 'success');
      } else {
        this.addEvent('not enough room for both of them.');
      }
      break;
      case 'sketchy_man':
      this.addVillager('sketchy man', 'adult', 6);
      this.unlockJobsTab();
      this.addEvent('the sketchy man joins, but something feels off...', 'error');
      setTimeout(() => this.sketchyBetrayal(), (60000 + Math.random() * 180000) / this.speed);
      break;
      case 'old_wise_man':
      if (this.state.huts > this.state.villagers.length) {
        this.addVillager('wise elder', 'adult', 8);
        this.unlockJobsTab();
        this.addStatusEffect('purpose');
        this.addEvent('the wise man joins and shares ancient knowledge.', 'success');
      } else {
        this.addEvent('no room for the elder.');
      }
      break;

      case 'wandering_tinker':
      this.resources.knife += 1;
      this.resources.cloth += 3;
      this.addEvent('the tinker gives you superior tools.', 'success');
      break;
      case 'quiet_forager':
      this.resources.meds += 2;
      this.resources.cloth += 1;
      this.addEvent('you trade for rare herbs.', 'success');
      break;

      case 'territorial_bear':
      this.handleBearAttack();
      break;

      case 'tradeNomadModal':
      this.showNomadShopModal();
      break;

      default:
      this.addEvent('nothing happens.');
      break;
    }
  }
}

const game = new WaitIsThisJustADarkRoom();
