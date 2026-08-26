(() => {
  'use strict';

  // ---------------------------------------------------------------------
  // Map data: regions (decorative land shapes), nodes (cities), edges (routes)
  // ---------------------------------------------------------------------

  const REGIONS = [
    { id: 'britannia', frontier: false, points: [[90,60],[180,40],[230,70],[220,130],[190,170],[130,175],[80,140],[60,95]] },
    { id: 'gallia', frontier: false, points: [[150,160],[230,140],[300,150],[330,190],[310,250],[260,300],[200,290],[160,250],[140,200]] },
    { id: 'germania', frontier: true, points: [[290,70],[400,55],[470,90],[460,150],[400,190],[330,185],[280,150],[270,110]] },
    { id: 'hispania', frontier: false, points: [[30,280],[100,260],[170,270],[190,330],[180,400],[130,450],[70,440],[30,380],[20,320]] },
    { id: 'italia', frontier: false, points: [[400,220],[440,215],[460,240],[480,300],[500,360],[490,420],[460,450],[440,410],[430,340],[410,280]] },
    { id: 'sicilia', frontier: false, points: [[445,455],[480,450],[470,485],[440,480]] },
    { id: 'africa', frontier: false, points: [[230,470],[320,460],[420,470],[500,480],[520,520],[480,560],[400,570],[320,565],[260,540],[230,500]] },
    { id: 'aegyptus', frontier: false, points: [[610,480],[680,460],[750,470],[770,520],[750,570],[690,590],[630,570],[605,530]] },
    { id: 'judea', frontier: false, points: [[720,400],[780,390],[810,420],[800,460],[760,470],[725,450]] },
    { id: 'syria', frontier: false, points: [[700,300],[770,290],[820,310],[830,360],[800,390],[750,395],[710,370],[695,335]] },
    { id: 'asia', frontier: false, points: [[560,220],[650,200],[730,215],[770,260],[750,320],[690,340],[630,330],[580,300],[555,260]] },
    { id: 'thracia', frontier: false, points: [[470,150],[540,140],[600,155],[610,200],[580,230],[520,225],[480,200]] },
    { id: 'achaea', frontier: false, points: [[460,270],[530,260],[570,290],[580,340],[560,400],[520,420],[480,400],[460,350],[450,310]] }
  ];

  const NODES = {
    roma: { name: 'Roma', region: 'Italia', x: 450, y: 320, capital: true,
      blurb: 'The heart of the Empire. Marble temples, the roaring Circus, and the Senate itself — every road, quite literally, leads here.' },
    londinium: { name: 'Londinium', region: 'Britannia', x: 150, y: 110,
      blurb: 'A damp, young trading town at the edge of the known world, ringed by fog and wary tribes beyond the frontier ditch.' },
    lutetia: { name: 'Lutetia', region: 'Gallia', x: 230, y: 215,
      blurb: 'An island town on a river in the heart of Gaul, its markets thick with wine, wool, and Gallic bravado.' },
    colonia: { name: 'Colonia', region: 'Germania', x: 370, y: 120,
      blurb: 'A raw frontier fortress on the Rhine, palisade fresh-cut, legionaries watching the dark forests beyond.' },
    tarraco: { name: 'Tarraco', region: 'Hispania', x: 110, y: 345,
      blurb: 'A sun-baked port of olive oil and silver, its amphitheatre newly built on the cliffs above the sea.' },
    carthago: { name: 'Carthago', region: 'Africa', x: 370, y: 510,
      blurb: 'Risen from Punic ashes into a grain-rich Roman jewel, its harbor thick with ships bound for the capital.' },
    alexandria: { name: 'Alexandria', region: 'Aegyptus', x: 690, y: 520,
      blurb: 'Lighthouse, library, and the granary of Rome — a city of scholars, merchants, and the endless Nile at its back.' },
    hierosolyma: { name: 'Hierosolyma', region: 'Judea', x: 770, y: 430,
      blurb: 'A hill city of ancient stone and older faith, garrisoned by legionaries and watched closely from afar.' },
    antiochia: { name: 'Antiochia', region: 'Syria', x: 770, y: 340,
      blurb: 'One of the great cities of the East — a crossroads of silk caravans, spice traders, and a dozen tongues at once.' },
    ephesus: { name: 'Ephesus', region: 'Asia', x: 660, y: 270,
      blurb: 'A glittering Aegean port beneath its great temple, harbor thick with traders from every shore of the sea.' },
    byzantium: { name: 'Byzantium', region: 'Thracia', x: 550, y: 180,
      blurb: 'A walled city astride the strait between two continents, toll-keeper of every ship bound for the Black Sea.' },
    athenae: { name: 'Athenae', region: 'Achaea', x: 520, y: 340,
      blurb: 'Weathered marble and older glories — philosophers still argue beneath the shadow of the Acropolis.' }
  };

  const EDGES = [
    ['roma', 'lutetia', 2], ['roma', 'tarraco', 2], ['roma', 'carthago', 2],
    ['roma', 'athenae', 2], ['roma', 'byzantium', 3],
    ['lutetia', 'londinium', 1], ['lutetia', 'colonia', 1], ['lutetia', 'tarraco', 2],
    ['tarraco', 'carthago', 2],
    ['byzantium', 'athenae', 1], ['byzantium', 'ephesus', 1],
    ['ephesus', 'antiochia', 2], ['ephesus', 'athenae', 1],
    ['antiochia', 'hierosolyma', 1],
    ['hierosolyma', 'alexandria', 2],
    ['carthago', 'alexandria', 3]
  ];

  const adjacency = {};
  for (const id of Object.keys(NODES)) adjacency[id] = [];
  for (const [a, b, cost] of EDGES) {
    adjacency[a].push({ to: b, cost });
    adjacency[b].push({ to: a, cost });
  }

  // ---------------------------------------------------------------------
  // Narrative content
  // ---------------------------------------------------------------------

  const FIRST_VISIT = {
    roma: { title: 'The Forum', text: 'You set out with the Forum crowd still ringing in your ears — hawkers, orators, and the ever-present smell of incense and bread. A patrician eyes your travel pack.',
      choices: [
        { label: 'Buy a blessing from the temple priests', effects: { gold: -10, glory: 8 }, result: 'The priest marks your brow with oil and murmurs a favor to Fortuna. Onlookers nod approvingly.' },
        { label: 'Save your coin and move on', effects: { gold: 5 }, result: 'You pocket a few stray denarii dropped in the crowd\'s scramble and slip away unnoticed.' }
      ] },
    londinium: { title: 'Fog Over the Thames', text: 'The town is smaller than you expected, half timber and half mud, but the tin merchants here are shrewd and the beer is strong.',
      choices: [
        { label: 'Trade for British tin', effects: { gold: 12, glory: -2 }, result: 'You strike a fair bargain, though the local governor mutters that "provincials shouldn\'t undercut Roman traders."' },
        { label: 'Visit the garrison commander', effects: { glory: 10, gold: -5 }, result: 'You share wine with the commander, who is glad for news from Rome and speaks well of you afterward.' }
      ] },
    lutetia: { title: 'The River Island', text: 'Gaulish traders haggle in accented Latin over amphorae of wine. A druidic elder watches you from the treeline beyond the walls, unreadable.',
      choices: [
        { label: 'Barter boldly in the market', effects: { gold: 10 }, result: 'Your haggling wins you a good price on Gallic wine, which you resell for a tidy profit downstream.' },
        { label: 'Offer respect to the elder', effects: { glory: 6, health: -4 }, result: 'The elder shares a bitter local remedy as a gesture of trust. It works, though your stomach protests all night.' }
      ] },
    colonia: { title: 'The Rhine Frontier', text: 'Fresh-cut palisades and the smell of woodsmoke. Legionaries drill in the mud while scouts report movement in the dark forest beyond the river.',
      choices: [
        { label: 'Join the legionaries on watch', effects: { glory: 12, health: -8 }, result: 'A cold, tense night on the wall earns you real respect from the garrison — and a nasty chill.' },
        { label: 'Keep to the warm tavern', effects: { health: 5, glory: -3 }, result: 'You rest well, though a passing centurion notes your absence from the wall with a raised eyebrow.' }
      ] },
    tarraco: { title: 'Cliffside Amphitheatre', text: 'The new amphitheatre gleams white above the harbor. Fishermen haul in silver-scaled catches as olive oil merchants shout over the din.',
      choices: [
        { label: 'Invest in an olive oil shipment', effects: { gold: 15, health: -3 }, result: 'The venture pays off after a rough sea crossing supervising the cargo yourself.' },
        { label: 'Watch the games at the amphitheatre', effects: { glory: 7, gold: -6 }, result: 'You cheer alongside the local elite, who remember a generous, well-mannered guest.' }
      ] },
    carthago: { title: 'Rebuilt from Ashes', text: 'Carthage rises again beneath Roman rule, harbor thick with grain ships. Ruins of the old Punic city still poke through the newer stone.',
      choices: [
        { label: 'Explore the old Punic ruins', effects: { glory: 5, health: -5 }, result: 'You find a weathered inscription and copy it carefully — scholars back in Rome will want to see this.' },
        { label: 'Broker a grain shipping deal', effects: { gold: 18 }, result: 'You secure a share in a grain convoy bound for Ostia. Rome always needs bread.' }
      ] },
    alexandria: { title: 'Lighthouse and Library', text: 'The Great Lighthouse burns even by day\'s light, and scholars from every corner of the world argue beneath the Library\'s colonnades.',
      choices: [
        { label: 'Pay for an hour among the scrolls', effects: { gold: -8, glory: 10 }, result: 'You leave with borrowed wisdom and a few names worth dropping in the Senate one day.' },
        { label: 'Haggle with Nile grain traders', effects: { gold: 14 }, result: 'The traders respect a sharp bargain, and you walk away with coin to spare.' }
      ] },
    hierosolyma: { title: 'City on the Hill', text: 'Ancient stone streets wind uphill past markets thick with spice, cloth, and pilgrims from every province of the East.',
      choices: [
        { label: 'Share a meal with a local merchant family', effects: { glory: 8, gold: -4 }, result: 'Their hospitality is genuine, and you leave with a useful letter of introduction for the road ahead.' },
        { label: 'Keep your visit brief and businesslike', effects: { health: 4 }, result: 'You rest well at a quiet inn, though you learn little of the city\'s deeper currents.' }
      ] },
    antiochia: { title: 'Crossroads of the East', text: 'Silk, spice, and a dozen languages fill the air. This is one of the greatest cities you have ever seen — bigger, in places, than Rome itself.',
      choices: [
        { label: 'Invest in a silk caravan', effects: { gold: -15, glory: 4 }, result: 'The caravan hasn\'t returned yet, but word is it\'s making good time along the eastern roads.' },
        { label: 'Dine with the provincial governor', effects: { glory: 12, gold: -5 }, result: 'The governor is glad of Roman company and speaks warmly of you to his correspondents.' }
      ] },
    ephesus: { title: 'The Aegean Harbor', text: 'The great temple dominates the skyline, and the harbor below teems with ships from every shore of the wine-dark sea.',
      choices: [
        { label: 'Make an offering at the temple', effects: { glory: 9, gold: -6 }, result: 'The priests accept your offering with solemn approval. Word of a pious traveler spreads.' },
        { label: 'Book passage with a fast trading captain', effects: { gold: 8 }, result: 'You strike a useful deal for future travel and pocket a commission besides.' }
      ] },
    byzantium: { title: 'Gateway of Two Seas', text: 'Ships queue at the strait, paying toll to pass between two continents. The walls here have turned back more than one invader.',
      choices: [
        { label: 'Study the city\'s famous fortifications', effects: { glory: 6, health: -2 }, result: 'You climb the walls at dawn and understand at once why this city has never truly fallen.' },
        { label: 'Trade for goods bound for the Black Sea', effects: { gold: 11 }, result: 'You turn a modest profit reselling furs and amber from the northern trade routes.' }
      ] },
    athenae: { title: 'Shadow of the Acropolis', text: 'Weathered marble columns rise over streets where philosophers still gather to argue, much as they always have.',
      choices: [
        { label: 'Attend a public philosophy debate', effects: { glory: 7 }, result: 'You ask a sharp question that draws approving murmurs from the crowd — a small but real reputation earned.' },
        { label: 'Sell curiosities to visiting Romans', effects: { gold: 9, glory: -2 }, result: 'A tidy profit, though a local scholar mutters about tourists treating history like a marketplace.' }
      ] }
  };

  const REVISIT_EVENTS = {
    roma: [
      { title: 'Whispers in the Senate', text: 'A senator you barely know nods to you in the Forum, as if you share a secret. Do you play along?',
        choices: [
          { label: 'Nod back knowingly', effects: { glory: 6 }, result: 'Whatever the secret was, you are now quietly associated with it. Your name circulates a little further.' },
          { label: 'Ignore it and move on', effects: {}, result: 'Better not to be tangled in Senate intrigue you don\'t understand.' }
        ] },
      { title: 'The Grain Dole', text: 'A line for the grain dole stretches around the block. A friend offers to get you to the front.',
        choices: [
          { label: 'Take the shortcut', effects: { gold: 6, glory: -3 }, result: 'You save time, but a few in line remember the favoritism unkindly.' },
          { label: 'Wait your turn like everyone else', effects: { glory: 4 }, result: 'Small as it is, your patience is noticed by the plebs around you.' }
        ] }
    ],
    londinium: [
      { title: 'Tribal Envoy', text: 'An envoy from beyond the frontier ditch arrives seeking an audience with any Roman of standing. You happen to be nearby.',
        choices: [
          { label: 'Hear the envoy out', effects: { glory: 8, health: -3 }, result: 'The long, cold negotiation earns you real respect, though your bones ache from the damp hall.' },
          { label: 'Let the garrison handle it', effects: {}, result: 'Diplomacy is not your trade today. You leave it to the professionals.' }
        ] },
      { title: 'Tin Wagon Trouble', text: 'A merchant\'s cart has lost a wheel on the muddy road, spilling tin ingots everywhere.',
        choices: [
          { label: 'Help load the cargo', effects: { gold: 5, health: -4 }, result: 'Filthy, exhausting work — but the grateful merchant pays you fairly.' },
          { label: 'Walk past', effects: {}, result: 'Not your problem, and not your mud.' }
        ] }
    ],
    lutetia: [
      { title: 'The Wine Auction', text: 'A cask of exceptional Gallic wine goes up for bid at the riverside market.',
        choices: [
          { label: 'Bid high', effects: { gold: -10, glory: 5 }, result: 'You win the cask and share it generously — your reputation as a patron grows.' },
          { label: 'Let it go', effects: { gold: 2 }, result: 'You save your coin for the road ahead.' }
        ] }
    ],
    colonia: [
      { title: 'Scouts Return', text: 'Scouts stumble back through the gate reporting movement in the forest. The garrison is on edge.',
        choices: [
          { label: 'Volunteer to help fortify the wall', effects: { glory: 10, health: -6 }, result: 'A hard day\'s labor, but the centurion himself thanks you by name.' },
          { label: 'Stay well clear of the commotion', effects: { health: 3 }, result: 'Discretion, in this case, is the better part of valor.' }
        ] }
    ],
    tarraco: [
      { title: 'Storm Damage', text: 'A recent storm has damaged the docks, and the harbormaster is short-handed on coin to repair them.',
        choices: [
          { label: 'Contribute to the repairs', effects: { gold: -8, glory: 7 }, result: 'The harbormaster makes sure the local council hears of your generosity.' },
          { label: 'Offer sympathy but no coin', effects: {}, result: 'Well-meant words, though they won\'t rebuild a dock.' }
        ] }
    ],
    carthago: [
      { title: 'The Grain Convoy', text: 'A grain convoy bound for Rome needs one more investor to fill its hold before the tide turns.',
        choices: [
          { label: 'Buy in', effects: { gold: -12, glory: 3 }, result: 'A gamble on the sea, but word later reaches you the convoy arrived safely and sold well.' },
          { label: 'Pass on this one', effects: { gold: 3 }, result: 'You keep your coin close and watch the ships depart without you.' }
        ] }
    ],
    alexandria: [
      { title: 'A Scholar\'s Request', text: 'A librarian asks for help funding the copying of a rare scroll before it crumbles to dust.',
        choices: [
          { label: 'Fund the copy', effects: { gold: -9, glory: 9 }, result: 'Your name is inscribed in the colophon as a patron of learning. It will outlast you.' },
          { label: 'Wish them luck and move on', effects: {}, result: 'Some things are simply not your fight today.' }
        ] }
    ],
    hierosolyma: [
      { title: 'A Dispute in the Market', text: 'Two merchants argue loudly over a scale that seems to favor one of them. A crowd gathers.',
        choices: [
          { label: 'Suggest an impartial reweighing', effects: { glory: 6 }, result: 'Cooler heads prevail, and both merchants thank the fair-minded traveler.' },
          { label: 'Slip away from the argument', effects: { health: 2 }, result: 'Not every quarrel needs a Roman referee.' }
        ] }
    ],
    antiochia: [
      { title: 'Caravan Fortunes', text: 'Word arrives from the silk caravan you once backed — mixed news, some profit, some loss.',
        choices: [
          { label: 'Reinvest the returns', effects: { gold: -6, glory: 4 }, result: 'Slow and steady, your reputation as a reliable partner builds.' },
          { label: 'Take the profit and walk away', effects: { gold: 10 }, result: 'A clean, modest gain, banked and safe.' }
        ] }
    ],
    ephesus: [
      { title: 'Festival of the Harbor', text: 'A local festival fills the harbor with music, food, and a fair amount of good-natured chaos.',
        choices: [
          { label: 'Join the festivities', effects: { glory: 5, gold: -4 }, result: 'You dance badly and are loved for it. A fine, foolish evening.' },
          { label: 'Watch quietly from a tavern', effects: { health: 3 }, result: 'A restful evening, if a slightly lonely one.' }
        ] }
    ],
    byzantium: [
      { title: 'The Toll Dispute', text: 'A ship\'s captain refuses to pay the strait toll, and tempers rise on the docks.',
        choices: [
          { label: 'Mediate the dispute', effects: { glory: 7 }, result: 'A fair compromise is reached, and both sides remember your even hand.' },
          { label: 'Let the toll-keepers handle it', effects: {}, result: 'Their job, not yours.' }
        ] }
    ],
    athenae: [
      { title: 'An Old Rivalry', text: 'Two philosophy schools have turned a scholarly disagreement into a shouting match in the agora.',
        choices: [
          { label: 'Offer a Roman perspective', effects: { glory: 6, gold: -2 }, result: 'Both sides briefly unite to mock Roman philosophy, but respect your nerve.' },
          { label: 'Buy a cup of wine and watch', effects: { gold: -3, health: 3 }, result: 'Free entertainment, cheaply bought.' }
        ] }
    ]
  };

  const ROAD_EVENTS = [
    { title: 'Bandits on the Road', text: 'A ragged band blocks the path ahead, eyeing your travel pack.',
      choices: [
        { label: 'Stand and fight', effects: { health: -14, gold: 8 }, result: 'A brutal scuffle, but you drive them off and recover a purse they\'d stolen from someone else.' },
        { label: 'Pay them off', effects: { gold: -10 }, result: 'A frustrating loss, but you keep moving with your skin intact.' }
      ] },
    { title: 'Storm at Sea', text: 'Dark clouds roll in as your ship rides low, deep-loaded swells testing the crew\'s nerve.',
      choices: [
        { label: 'Help the crew ride it out', effects: { health: -8, glory: 4 }, result: 'Exhausted but proud, the crew now speaks well of the passenger who pulled their weight.' },
        { label: 'Stay below and pray to Neptune', effects: { health: -3 }, result: 'A miserable, seasick crossing, but you arrive intact.' }
      ] },
    { title: 'A Fellow Traveler', text: 'A merchant on the same road offers to share news, wine, and the burden of a long journey.',
      choices: [
        { label: 'Share the wine and trade stories', effects: { glory: 3, health: 2 }, result: 'Good company makes the miles pass quickly, and you part on friendly terms.' },
        { label: 'Keep to yourself', effects: {}, result: 'A quiet, uneventful stretch of road.' }
      ] },
    { title: 'Roman Patrol', text: 'A patrol of legionaries stops you to check your papers and business.',
      choices: [
        { label: 'Answer respectfully and share news of Rome', effects: { glory: 4 }, result: 'The centurion nods approvingly and waves you through without delay.' },
        { label: 'Bribe them to hurry things along', effects: { gold: -6 }, result: 'They pocket the coin without comment and let you pass just the same.' }
      ] },
    { title: 'A Sudden Fever', text: 'The road takes its toll — you wake one morning aching and feverish.',
      choices: [
        { label: 'Rest an extra day at a wayside inn', effects: { health: 6, gold: -5 }, result: 'The rest and a hot meal set you right again.' },
        { label: 'Push on regardless', effects: { health: -10 }, result: 'A grim, grueling stretch, but you refuse to lose the time.' }
      ] },
    { title: 'A Local Guide', text: 'A local offers, for a price, to show you a faster route to your destination.',
      choices: [
        { label: 'Hire the guide', effects: { gold: -5, health: 3 }, result: 'The shortcut spares you a rough stretch of road.' },
        { label: 'Trust your own sense of direction', effects: {}, result: 'You manage well enough on your own.' }
      ] }
  ];

  // ---------------------------------------------------------------------
  // Character backgrounds
  // ---------------------------------------------------------------------

  const BACKGROUNDS = [
    { id: 'legionary', name: 'Retired Legionary', desc: 'Hardened by years on the frontier. Tougher, but light of purse and short on political grace.',
      stats: { health: 120, gold: 30, glory: 10 } },
    { id: 'merchant', name: 'Traveling Merchant', desc: 'A sharp eye for a deal and a fat coin-purse, if not much of a fighter.',
      stats: { health: 90, gold: 100, glory: 0 } },
    { id: 'envoy', name: "Senator's Envoy", desc: 'Well-connected and well-mannered, arriving with letters of introduction already in hand.',
      stats: { health: 90, gold: 50, glory: 20 } }
  ];

  const START_TURNS = 26;
  const MAX_HEALTH = 150;

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  let state = null;

  function newState(background) {
    return {
      background,
      health: background.stats.health,
      gold: background.stats.gold,
      glory: background.stats.glory,
      turns: START_TURNS,
      current: 'roma',
      visited: new Set(['roma']),
      lastEventAt: {},
      alive: true
    };
  }

  // ---------------------------------------------------------------------
  // Audio (synthesized, no external assets)
  // ---------------------------------------------------------------------

  const Audio_ = (() => {
    let actx = null;
    let muted = false;
    function ensure() {
      if (!actx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        actx = AC ? new AC() : null;
      }
      return actx;
    }
    function tone({ freq = 440, dur = 0.15, type = 'sine', vol = 0.15, glideTo = null, delay = 0 }) {
      if (muted) return;
      const ac = ensure();
      if (!ac) return;
      const t0 = ac.currentTime + delay;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t0 + dur);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    return {
      click: () => tone({ freq: 300, dur: 0.06, type: 'triangle', vol: 0.1 }),
      travel: () => { tone({ freq: 220, dur: 0.18, type: 'sine', vol: 0.12 }); tone({ freq: 330, dur: 0.18, type: 'sine', vol: 0.1, delay: 0.08 }); },
      gain: () => tone({ freq: 500, dur: 0.14, type: 'sine', vol: 0.14, glideTo: 780 }),
      loss: () => tone({ freq: 260, dur: 0.16, type: 'sawtooth', vol: 0.13, glideTo: 120 }),
      end: () => { tone({ freq: 392, dur: 0.22, type: 'triangle', vol: 0.15 }); tone({ freq: 523, dur: 0.3, type: 'triangle', vol: 0.15, delay: 0.18 }); },
      death: () => tone({ freq: 200, dur: 0.5, type: 'sawtooth', vol: 0.15, glideTo: 40 }),
      setMuted(v) { muted = v; },
      isMuted: () => muted,
      unlock() { ensure(); }
    };
  })();

  // ---------------------------------------------------------------------
  // DOM references
  // ---------------------------------------------------------------------

  const svg = document.getElementById('map-svg');
  const regionsLayer = document.getElementById('regions-layer');
  const roadsLayer = document.getElementById('roads-layer');
  const nodesLayer = document.getElementById('nodes-layer');
  const seaTexture = document.getElementById('sea-texture');

  const hpFill = document.getElementById('hp-fill');
  const gloryValue = document.getElementById('glory-value');
  const goldValue = document.getElementById('gold-value');
  const turnsValue = document.getElementById('turns-value');
  const visitedValue = document.getElementById('visited-value');

  const infoPanel = document.getElementById('info-panel');
  const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
  const infoName = document.getElementById('info-name');
  const infoDesc = document.getElementById('info-desc');
  const infoStatus = document.getElementById('info-status');
  const infoTravelBtn = document.getElementById('info-travel-btn');
  const infoCloseBtn = document.getElementById('info-close-btn');
  const romeReturnBtn = document.getElementById('rome-return-btn');

  const eventOverlay = document.getElementById('event-overlay');
  const eventTitle = document.getElementById('event-title');
  const eventText = document.getElementById('event-text');
  const eventChoices = document.getElementById('event-choices');

  const startScreen = document.getElementById('start-screen');
  const classGrid = document.getElementById('class-grid');
  const startBtn = document.getElementById('start-btn');
  const endScreen = document.getElementById('end-screen');
  const restartBtn = document.getElementById('restart-btn');
  const muteBtn = document.getElementById('mute-btn');

  // ---------------------------------------------------------------------
  // Static decorative rendering (sea texture, regions)
  // ---------------------------------------------------------------------

  function buildSeaTexture() {
    for (let i = 0; i < 26; i++) {
      const y = 20 + i * 26;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = `M0,${y} `;
      for (let x = 0; x <= 1000; x += 40) {
        d += `q20,${(i % 2 === 0) ? 8 : -8} 40,0 `;
      }
      path.setAttribute('d', d);
      path.setAttribute('stroke', 'rgba(255,255,255,0.05)');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-width', '1.5');
      seaTexture.appendChild(path);
    }
  }

  function polyStr(points) {
    return points.map(p => p.join(',')).join(' ');
  }

  function buildRegions() {
    for (const region of REGIONS) {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', polyStr(region.points));
      poly.setAttribute('class', `region ${region.frontier ? 'frontier' : ''}`);
      poly.dataset.regionId = region.id;
      regionsLayer.appendChild(poly);
    }
  }

  function buildRoads() {
    for (const [a, b, cost] of EDGES) {
      const na = NODES[a], nb = NODES[b];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', na.x); line.setAttribute('y1', na.y);
      line.setAttribute('x2', nb.x); line.setAttribute('y2', nb.y);
      line.setAttribute('class', 'road');
      line.dataset.a = a; line.dataset.b = b;
      roadsLayer.appendChild(line);
    }
  }

  function buildNodes() {
    for (const [id, node] of Object.entries(NODES)) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `node-group ${node.capital ? 'capital' : ''}`);
      g.setAttribute('transform', `translate(${node.x},${node.y})`);
      g.dataset.id = id;

      const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hitArea.setAttribute('class', 'node-hit');
      hitArea.setAttribute('x', '-16');
      hitArea.setAttribute('y', '-16');
      hitArea.setAttribute('width', '130');
      hitArea.setAttribute('height', '32');
      g.appendChild(hitArea);

      const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulse.setAttribute('class', 'node-pulse');
      pulse.setAttribute('r', '10');
      g.appendChild(pulse);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('class', 'node-dot');
      dot.setAttribute('r', node.capital ? '12' : '8');
      g.appendChild(dot);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'node-label');
      label.setAttribute('x', '12');
      label.setAttribute('y', '4');
      label.textContent = node.name;
      g.appendChild(label);

      g.addEventListener('click', () => onNodeClick(id));
      nodesLayer.appendChild(g);
    }
  }

  // ---------------------------------------------------------------------
  // Dynamic map state rendering
  // ---------------------------------------------------------------------

  let selectedNode = null;

  function reachableFromCurrent() {
    if (!state) return new Map();
    const map = new Map();
    for (const edge of adjacency[state.current]) map.set(edge.to, edge.cost);
    return map;
  }

  function renderMapState() {
    const reachable = reachableFromCurrent();

    for (const region of REGIONS) {
      const el = regionsLayer.querySelector(`[data-region-id="${region.id}"]`);
      const nodeId = Object.keys(NODES).find(k => NODES[k].region.toLowerCase() === region.id);
      const visited = nodeId && state.visited.has(nodeId);
      el.classList.toggle('unvisited', !visited && region.id !== 'sicilia');
    }

    roadsLayer.querySelectorAll('.road').forEach(line => {
      const a = line.dataset.a, b = line.dataset.b;
      const isReachable = (a === state.current && reachable.has(b)) || (b === state.current && reachable.has(a));
      line.classList.toggle('reachable', isReachable);
    });

    nodesLayer.querySelectorAll('.node-group').forEach(g => {
      const id = g.dataset.id;
      g.classList.toggle('visited', state.visited.has(id));
      g.classList.toggle('current', id === state.current);
      g.classList.toggle('reachable', reachable.has(id));
    });

    romeReturnBtn.classList.toggle('hidden', !(state.current === 'roma' && state.visited.size >= 4));
  }

  // ---------------------------------------------------------------------
  // HUD
  // ---------------------------------------------------------------------

  function updateHud() {
    hpFill.style.width = `${Math.max(0, Math.min(100, (state.health / MAX_HEALTH) * 100))}%`;
    gloryValue.textContent = state.glory;
    goldValue.textContent = state.gold;
    turnsValue.textContent = Math.max(0, state.turns);
    visitedValue.textContent = state.visited.size;
  }

  // ---------------------------------------------------------------------
  // Info panel interactions
  // ---------------------------------------------------------------------

  function setInfoPanelVisible(visible) {
    infoPanel.classList.toggle('hidden', !visible);
    sidebarPlaceholder.classList.toggle('hidden', visible);
  }

  function onNodeClick(id) {
    Audio_.click();
    selectedNode = id;
    const node = NODES[id];
    const reachable = reachableFromCurrent();
    infoName.textContent = node.name;
    infoDesc.textContent = state.visited.has(id) ? node.blurb : (reachable.has(id) ? 'An unfamiliar province. You know only rumors of what awaits there.' : 'A distant province, unknown to you and out of reach from here.');

    if (id === state.current) {
      infoStatus.textContent = 'You are here.';
      infoTravelBtn.classList.add('hidden');
    } else if (reachable.has(id)) {
      const cost = reachable.get(id);
      const affordable = state.turns >= cost;
      infoStatus.textContent = affordable ? `Connected by road/sea route — ${cost} turn${cost > 1 ? 's' : ''} to travel.` : `Requires ${cost} turns — you don't have enough remaining.`;
      infoTravelBtn.classList.remove('hidden');
      infoTravelBtn.disabled = !affordable;
      infoTravelBtn.textContent = `Travel (${cost} turn${cost > 1 ? 's' : ''})`;
    } else {
      infoStatus.textContent = 'Not directly connected to your current location.';
      infoTravelBtn.classList.add('hidden');
    }
    setInfoPanelVisible(true);
  }

  infoCloseBtn.addEventListener('click', () => setInfoPanelVisible(false));

  infoTravelBtn.addEventListener('click', () => {
    if (!selectedNode) return;
    travelTo(selectedNode);
  });

  romeReturnBtn.addEventListener('click', () => concludeJourney());

  // ---------------------------------------------------------------------
  // Travel & events
  // ---------------------------------------------------------------------

  function travelTo(id) {
    const reachable = reachableFromCurrent();
    if (!reachable.has(id)) return;
    const cost = reachable.get(id);
    if (state.turns < cost) return;

    Audio_.travel();
    state.turns -= cost;
    state.current = id;
    setInfoPanelVisible(false);
    updateHud();
    renderMapState();

    const firstVisit = !state.visited.has(id);
    state.visited.add(id);
    updateHud();
    renderMapState();

    let event;
    if (firstVisit) {
      event = FIRST_VISIT[id];
    } else if (cost >= 2 && Math.random() < 0.4) {
      event = ROAD_EVENTS[Math.floor(Math.random() * ROAD_EVENTS.length)];
    } else {
      const pool = REVISIT_EVENTS[id] || [];
      let pick = pool[Math.floor(Math.random() * pool.length)];
      if (pool.length > 1 && state.lastEventAt[id] === pick) {
        pick = pool.find(e => e !== state.lastEventAt[id]) || pick;
      }
      state.lastEventAt[id] = pick;
      event = pick;
    }
    showEvent(event || { title: NODES[id].name, text: NODES[id].blurb, choices: [{ label: 'Continue', effects: {}, result: 'You take in the sights and move on.' }] });
  }

  function showEvent(event) {
    eventTitle.textContent = event.title;
    eventText.textContent = event.text;
    eventChoices.innerHTML = '';
    for (const choice of event.choices) {
      const btn = document.createElement('button');
      btn.className = 'event-choice-btn';
      const deltaText = describeEffects(choice.effects);
      btn.innerHTML = `${choice.label}${deltaText ? `<span class="delta">${deltaText}</span>` : ''}`;
      btn.addEventListener('click', () => resolveChoice(choice));
      eventChoices.appendChild(btn);
    }
    eventOverlay.classList.remove('hidden');
  }

  function describeEffects(effects) {
    if (!effects) return '';
    const parts = [];
    if (effects.gold) parts.push(`${effects.gold > 0 ? '+' : ''}${effects.gold} denarii`);
    if (effects.glory) parts.push(`${effects.glory > 0 ? '+' : ''}${effects.glory} glory`);
    if (effects.health) parts.push(`${effects.health > 0 ? '+' : ''}${effects.health} health`);
    return parts.join(' · ');
  }

  function resolveChoice(choice) {
    const fx = choice.effects || {};
    state.gold = Math.max(0, state.gold + (fx.gold || 0));
    state.glory = Math.max(0, state.glory + (fx.glory || 0));
    state.health = Math.max(0, Math.min(MAX_HEALTH, state.health + (fx.health || 0)));

    if ((fx.gold || 0) > 0 || (fx.glory || 0) > 0) Audio_.gain();
    else if ((fx.gold || 0) < 0 || (fx.health || 0) < 0) Audio_.loss();

    eventText.textContent = choice.result;
    eventChoices.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'event-choice-btn';
    btn.textContent = state.health <= 0 ? 'Continue...' : 'Continue your journey';
    btn.addEventListener('click', () => {
      eventOverlay.classList.add('hidden');
      updateHud();
      renderMapState();
      if (state.health <= 0) {
        endGame('death');
      } else if (state.turns <= 0) {
        endGame('turns');
      }
    });
    eventChoices.appendChild(btn);
    updateHud();
  }

  function concludeJourney() {
    endGame('early');
  }

  // ---------------------------------------------------------------------
  // Endings
  // ---------------------------------------------------------------------

  function endGame(reason) {
    state.alive = reason !== 'death';
    let title, subtitle, flavor;

    if (reason === 'death') {
      Audio_.death();
      title = 'A Roman\'s Grave, Far From Home';
      subtitle = 'Your Journey Ends';
      flavor = `Your strength gave out far from the Forum. Word will reach Rome slowly, if it reaches at all — one more traveler the provinces quietly kept. You had seen ${state.visited.size} of the Empire's twelve provinces.`;
    } else {
      Audio_.end();
      const score = state.glory * 2 + state.gold * 0.5;
      if (score >= 140) { title = 'Triumph in the Forum'; flavor = 'You return laden with glory and gold both. The Senate takes notice, and for a while, all of Rome speaks your name.'; }
      else if (score >= 90) { title = 'An Honored Citizen'; flavor = 'You return with a solid reputation and a fuller purse than you left with. Not everyone gets a Triumph — but you\'ll be remembered fondly.'; }
      else if (score >= 50) { title = 'A Modest Return'; flavor = 'Your journey was no legend, but a life well-spent on the road, with stories enough to outlast a few dinners.'; }
      else if (score >= 20) { title = 'A Quiet Homecoming'; flavor = 'You slip back into Roman life much as you left it — a little wiser, a little more tired, largely unnoticed.'; }
      else { title = 'Faded into the Crowd'; flavor = 'The provinces kept more from you than they gave. You return to Rome with little to show, and the city, vast as ever, does not pause to notice.'; }
      subtitle = reason === 'early' ? 'You Chose to Return' : 'Your Time Has Run Out';
    }

    document.getElementById('end-title').textContent = title;
    document.getElementById('end-subtitle').textContent = subtitle;
    document.getElementById('end-flavor').textContent = flavor;
    document.getElementById('end-stats').innerHTML = `
      <div class="stat"><span class="num">${state.visited.size}</span><span class="lbl">PROVINCES SEEN</span></div>
      <div class="stat"><span class="num">${state.glory}</span><span class="lbl">GLORY</span></div>
      <div class="stat"><span class="num">${state.gold}</span><span class="lbl">DENARII</span></div>
      <div class="stat"><span class="num">${Math.max(0, state.turns)}</span><span class="lbl">TURNS LEFT</span></div>
    `;
    eventOverlay.classList.add('hidden');
    setInfoPanelVisible(false);
    endScreen.classList.remove('hidden');
  }

  // ---------------------------------------------------------------------
  // Start / restart flow
  // ---------------------------------------------------------------------

  let chosenBackground = null;

  function buildClassCards() {
    for (const bg of BACKGROUNDS) {
      const card = document.createElement('div');
      card.className = 'class-card';
      card.innerHTML = `
        <h4>${bg.name}</h4>
        <p>${bg.desc}</p>
        <div class="stats">
          <span>&#9829; ${bg.stats.health}</span>
          <span>&#9906; ${bg.stats.gold}</span>
          <span>&#9733; ${bg.stats.glory}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        chosenBackground = bg;
        classGrid.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        startBtn.disabled = false;
      });
      classGrid.appendChild(card);
    }
  }

  startBtn.addEventListener('click', () => {
    if (!chosenBackground) return;
    Audio_.unlock();
    startGame(chosenBackground);
  });
  restartBtn.addEventListener('click', () => {
    startScreen.classList.remove('hidden');
    endScreen.classList.add('hidden');
  });
  muteBtn.addEventListener('click', () => {
    Audio_.setMuted(!Audio_.isMuted());
    muteBtn.textContent = Audio_.isMuted() ? '♫̸' : '♪';
  });

  function startGame(background) {
    state = newState(background);
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    eventOverlay.classList.add('hidden');
    setInfoPanelVisible(false);
    updateHud();
    renderMapState();
  }

  // ---------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------

  buildSeaTexture();
  buildRegions();
  buildRoads();
  buildNodes();
  buildClassCards();

  state = newState(BACKGROUNDS[0]);
  updateHud();
  renderMapState();
})();
