export const randomEvents = [
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

export function handleEventResult(result) {
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
