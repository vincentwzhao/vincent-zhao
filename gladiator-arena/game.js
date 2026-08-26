(() => {
  'use strict';

  // ---------------------------------------------------------------------
  // Setup & constants
  // ---------------------------------------------------------------------

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Offscreen canvas that accumulates permanent blood/sand decals so we
  // don't have to redraw hundreds of splatters every frame.
  const decalCanvas = document.createElement('canvas');
  decalCanvas.width = W;
  decalCanvas.height = H;
  const dctx = decalCanvas.getContext('2d');

  const ARENA = { cx: W / 2, cy: H / 2 + 30, rx: 400, ry: 240 };

  const KEYS = new Set();
  const mouse = { x: W / 2, y: H / 2, downLeft: false, downRight: false };

  // ---------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
  const lerp = (a, b, t) => a + (b - a) * t;
  function angleDiff(a, b) {
    let d = (b - a) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function clampToArena(pos, radius) {
    const nx = (pos.x - ARENA.cx) / (ARENA.rx - radius);
    const ny = (pos.y - ARENA.cy) / (ARENA.ry - radius);
    const m = Math.hypot(nx, ny);
    if (m > 1) {
      pos.x = ARENA.cx + (nx / m) * (ARENA.rx - radius);
      pos.y = ARENA.cy + (ny / m) * (ARENA.ry - radius);
    }
  }

  // ---------------------------------------------------------------------
  // Tiny synthesized audio (no external assets)
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

    function tone({ freq = 440, dur = 0.12, type = 'sine', vol = 0.2, glideTo = null, delay = 0 }) {
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

    function noiseBurst({ dur = 0.15, vol = 0.2, delay = 0, filterFreq = 1200 }) {
      if (muted) return;
      const ac = ensure();
      if (!ac) return;
      const t0 = ac.currentTime + delay;
      const bufferSize = Math.floor(ac.sampleRate * dur);
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const src = ac.createBufferSource();
      src.buffer = buffer;
      const filt = ac.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = filterFreq;
      const gain = ac.createGain();
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      src.connect(filt).connect(gain).connect(ac.destination);
      src.start(t0);
    }

    return {
      swing: () => noiseBurst({ dur: 0.09, vol: 0.15, filterFreq: 2200 }),
      hit: () => { noiseBurst({ dur: 0.08, vol: 0.28, filterFreq: 700 }); tone({ freq: 90, dur: 0.09, type: 'square', vol: 0.12 }); },
      block: () => tone({ freq: 520, dur: 0.08, type: 'triangle', vol: 0.18, glideTo: 300 }),
      hurt: () => tone({ freq: 180, dur: 0.18, type: 'sawtooth', vol: 0.15, glideTo: 60 }),
      dodge: () => tone({ freq: 300, dur: 0.12, type: 'sine', vol: 0.12, glideTo: 500 }),
      death: () => tone({ freq: 220, dur: 0.5, type: 'sawtooth', vol: 0.18, glideTo: 40 }),
      waveStart: () => { tone({ freq: 196, dur: 0.35, type: 'sawtooth', vol: 0.15 }); tone({ freq: 246, dur: 0.35, type: 'sawtooth', vol: 0.15, delay: 0.12 }); },
      pickup: () => tone({ freq: 500, dur: 0.14, type: 'sine', vol: 0.16, glideTo: 900 }),
      gameover: () => { tone({ freq: 160, dur: 0.6, type: 'sawtooth', vol: 0.16, glideTo: 40 }); },
      victory: () => { tone({ freq: 392, dur: 0.2, type: 'triangle', vol: 0.18 }); tone({ freq: 523, dur: 0.2, type: 'triangle', vol: 0.18, delay: 0.15 }); tone({ freq: 659, dur: 0.4, type: 'triangle', vol: 0.18, delay: 0.3 }); },
      setMuted(v) { muted = v; },
      isMuted: () => muted,
      unlock() { ensure(); }
    };
  })();

  // ---------------------------------------------------------------------
  // Particles & floating text
  // ---------------------------------------------------------------------

  let particles = [];
  let floaters = [];
  let screenShake = 0;

  function spawnParticles(x, y, count, opts = {}) {
    const { color = '#b02020', speed = 160, life = 0.5, size = 3 } = opts;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(speed * 0.3, speed);
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(life * 0.6, life),
        maxLife: life,
        size: rand(size * 0.6, size * 1.4),
        color
      });
    }
  }

  function spawnFloater(x, y, text, color = '#fff') {
    floaters.push({ x, y, text, color, life: 0.9, maxLife: 0.9, vy: -40 });
  }

  function drawDecalSplat(x, y, r, color) {
    dctx.save();
    dctx.translate(x, y);
    dctx.rotate(rand(0, Math.PI * 2));
    dctx.fillStyle = color;
    dctx.globalAlpha = rand(0.35, 0.6);
    for (let i = 0; i < randInt(3, 6); i++) {
      const ox = rand(-r, r);
      const oy = rand(-r * 0.6, r * 0.6);
      const rr = rand(r * 0.2, r * 0.5);
      dctx.beginPath();
      dctx.ellipse(ox, oy, rr, rr * rand(0.5, 0.9), 0, 0, Math.PI * 2);
      dctx.fill();
    }
    dctx.restore();
  }

  // ---------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------

  window.addEventListener('keydown', (e) => {
    KEYS.add(e.key.toLowerCase());
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault();
    if (e.key.toLowerCase() === 'p' || e.key === 'Escape') togglePause();
  });
  window.addEventListener('keyup', (e) => KEYS.delete(e.key.toLowerCase()));

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * W;
    mouse.y = ((e.clientY - rect.top) / rect.height) * H;
  });
  canvas.addEventListener('mousedown', (e) => {
    Audio_.unlock();
    if (e.button === 0) mouse.downLeft = true;
    if (e.button === 2) mouse.downRight = true;
  });
  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.downLeft = false;
    if (e.button === 2) mouse.downRight = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  function movementVector() {
    let x = 0, y = 0;
    if (KEYS.has('w') || KEYS.has('arrowup')) y -= 1;
    if (KEYS.has('s') || KEYS.has('arrowdown')) y += 1;
    if (KEYS.has('a') || KEYS.has('arrowleft')) x -= 1;
    if (KEYS.has('d') || KEYS.has('arrowright')) x += 1;
    const m = Math.hypot(x, y);
    if (m > 0) { x /= m; y /= m; }
    return { x, y };
  }

  // ---------------------------------------------------------------------
  // Player
  // ---------------------------------------------------------------------

  const PLAYER_BASE = {
    radius: 18,
    speed: 230,
    maxHp: 100,
    maxStamina: 100,
    staminaRegen: 32,
    staminaRegenDelay: 0.45,
    attackDamage: 26,
    attackRange: 78,
    attackArc: Math.PI * 0.62,
    attackCooldown: 0.42,
    attackDuration: 0.16,
    attackStaminaCost: 16,
    dodgeDuration: 0.22,
    dodgeCooldown: 0.55,
    dodgeSpeedMult: 3.2,
    dodgeStaminaCost: 24,
    blockReduction: 0.78,
    blockStaminaDrain: 24,
    blockSpeedMult: 0.45
  };

  function makePlayer() {
    return {
      x: ARENA.cx, y: ARENA.cy + 150,
      facing: -Math.PI / 2,
      hp: PLAYER_BASE.maxHp,
      stamina: PLAYER_BASE.maxStamina,
      staminaRegenTimer: 0,
      attackTimer: 0,
      attackCooldownTimer: 0,
      attacking: false,
      attackHitIds: new Set(),
      dodgeTimer: 0,
      dodgeCooldownTimer: 0,
      dodging: false,
      dodgeDir: { x: 0, y: 0 },
      blocking: false,
      invuln: 0,
      hurtFlash: 0,
      hitStun: 0,
      alive: true,
      kills: 0,
      walkCycle: 0
    };
  }

  let player = makePlayer();

  // ---------------------------------------------------------------------
  // Enemy definitions
  // ---------------------------------------------------------------------

  const ENEMY_TYPES = {
    swordsman: {
      name: 'Swordsman', radius: 17, speed: 150, maxHp: 55, damage: 12,
      range: 58, arc: Math.PI * 0.55, telegraph: 0.38, cooldown: 1.15, duration: 0.22,
      color: '#9c4b3c', accent: '#d9c08a', scoreValue: 10
    },
    spearman: {
      name: 'Spearman', radius: 16, speed: 130, maxHp: 42, damage: 15,
      range: 92, arc: Math.PI * 0.28, telegraph: 0.5, cooldown: 1.5, duration: 0.26,
      color: '#3c6a4b', accent: '#d9c08a', scoreValue: 14
    },
    brute: {
      name: 'Brute', radius: 24, speed: 100, maxHp: 170, damage: 26,
      range: 66, arc: Math.PI * 0.7, telegraph: 0.55, cooldown: 1.9, duration: 0.3,
      color: '#4b4238', accent: '#e8c168', scoreValue: 30
    },
    champion: {
      name: 'Champion', radius: 26, speed: 145, maxHp: 420, damage: 22,
      range: 80, arc: Math.PI * 0.6, telegraph: 0.32, cooldown: 1.0, duration: 0.22,
      color: '#7a1414', accent: '#e8c168', scoreValue: 200, boss: true
    }
  };

  let enemies = [];
  let nextEnemyId = 1;

  function spawnEnemy(type) {
    const def = ENEMY_TYPES[type];
    const angle = rand(0, Math.PI * 2);
    const x = ARENA.cx + Math.cos(angle) * (ARENA.rx - def.radius - 4);
    const y = ARENA.cy + Math.sin(angle) * (ARENA.ry - def.radius - 4);
    enemies.push({
      id: nextEnemyId++,
      type, def,
      x, y,
      facing: angleTo({ x, y }, player),
      hp: def.maxHp,
      maxHp: def.maxHp,
      state: 'chase', // chase, telegraph, attack, recover, stagger
      stateTimer: 0,
      cooldownTimer: rand(0, 0.6),
      hurtFlash: 0,
      knockbackX: 0, knockbackY: 0,
      spinAttack: false,
      alive: true
    });
  }

  // ---------------------------------------------------------------------
  // Waves
  // ---------------------------------------------------------------------

  let wave = 0;
  let waveActive = false;
  let waveTransitionTimer = 0;
  let pendingSpawns = 0;
  let gameGen = 0;
  let score = 0;
  let bestScore = Number(localStorage.getItem('gladiator_highscore') || 0);
  let victoryShown = false;

  function buildWaveComposition(n) {
    if (n % 5 === 0) {
      const list = ['champion'];
      const extra = Math.min(2, Math.floor(n / 5) - 1);
      for (let i = 0; i < extra; i++) list.push('swordsman');
      return list;
    }
    const list = [];
    const total = Math.min(3 + Math.floor(n * 1.15), 12);
    for (let i = 0; i < total; i++) {
      const r = Math.random();
      if (n >= 4 && r < 0.22) list.push('brute');
      else if (n >= 2 && r < 0.55) list.push('spearman');
      else list.push('swordsman');
    }
    return list;
  }

  function startNextWave() {
    wave++;
    const comp = buildWaveComposition(wave);
    const gen = gameGen;
    let i = 0;
    pendingSpawns = comp.length;
    const spawnNext = () => {
      if (gen !== gameGen || i >= comp.length) return;
      spawnEnemy(comp[i]);
      i++;
      pendingSpawns--;
      if (i < comp.length) setTimeout(spawnNext, rand(160, 420));
    };
    spawnNext();
    waveActive = true;
    Audio_.waveStart();
    showBanner(comp.includes('champion') ? `WAVE ${wave} — CHAMPION` : `WAVE ${wave}`);
    updateHud();
  }

  // ---------------------------------------------------------------------
  // Banner / toast UI
  // ---------------------------------------------------------------------

  const bannerEl = document.getElementById('wave-banner');
  const toastEl = document.getElementById('toast');
  let bannerTimer = null;
  let toastTimer = null;

  function showBanner(text) {
    bannerEl.textContent = text;
    bannerEl.classList.remove('hidden');
    requestAnimationFrame(() => bannerEl.classList.add('show'));
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      bannerEl.classList.remove('show');
      setTimeout(() => bannerEl.classList.add('hidden'), 400);
    }, 1600);
  }

  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.remove('hidden');
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.classList.add('hidden'), 400);
    }, 2200);
  }

  // ---------------------------------------------------------------------
  // Game state machine
  // ---------------------------------------------------------------------

  let gameState = 'start'; // start, playing, paused, gameover
  const startScreen = document.getElementById('start-screen');
  const pauseScreen = document.getElementById('pause-screen');
  const gameoverScreen = document.getElementById('gameover-screen');
  const muteBtn = document.getElementById('mute-btn');

  document.getElementById('start-btn').addEventListener('click', () => {
    Audio_.unlock();
    startGame();
  });
  document.getElementById('restart-btn').addEventListener('click', () => {
    startGame();
  });
  muteBtn.addEventListener('click', () => {
    Audio_.setMuted(!Audio_.isMuted());
    muteBtn.textContent = Audio_.isMuted() ? '🔇' : '🔊';
  });

  function togglePause() {
    if (gameState === 'playing') {
      gameState = 'paused';
      pauseScreen.classList.remove('hidden');
    } else if (gameState === 'paused') {
      gameState = 'playing';
      pauseScreen.classList.add('hidden');
    }
  }

  function startGame() {
    gameGen++;
    player = makePlayer();
    enemies = [];
    particles = [];
    floaters = [];
    dctx.clearRect(0, 0, W, H);
    wave = 0;
    score = 0;
    victoryShown = false;
    waveActive = false;
    pendingSpawns = 0;
    waveTransitionTimer = 0.6;
    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameState = 'playing';
    updateHud();
  }

  function endGame() {
    gameState = 'gameover';
    Audio_.gameover();
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('gladiator_highscore', String(bestScore));
    }
    document.getElementById('gameover-title').textContent = 'YOU HAVE FALLEN';
    document.getElementById('gameover-subtitle').textContent = 'The sand drinks deep. The crowd roars for the next name.';
    document.getElementById('gameover-stats').innerHTML = `
      <div class="stat"><span class="num">${wave}</span><span class="lbl">WAVES SURVIVED</span></div>
      <div class="stat"><span class="num">${player.kills}</span><span class="lbl">KILLS</span></div>
      <div class="stat"><span class="num">${score}</span><span class="lbl">SCORE</span></div>
      <div class="stat"><span class="num">${bestScore}</span><span class="lbl">BEST</span></div>
    `;
    gameoverScreen.classList.remove('hidden');
    updateHud();
  }

  // ---------------------------------------------------------------------
  // HUD updates
  // ---------------------------------------------------------------------

  const hpFill = document.getElementById('hp-fill');
  const staFill = document.getElementById('sta-fill');
  const waveNumEl = document.getElementById('wave-num');
  const scoreNumEl = document.getElementById('score-num');
  const bestNumEl = document.getElementById('best-num');

  function updateHud() {
    hpFill.style.width = `${clamp((player.hp / PLAYER_BASE.maxHp) * 100, 0, 100)}%`;
    staFill.style.width = `${clamp((player.stamina / PLAYER_BASE.maxStamina) * 100, 0, 100)}%`;
    waveNumEl.textContent = wave;
    scoreNumEl.textContent = score;
    bestNumEl.textContent = Math.max(bestScore, score);
  }

  // ---------------------------------------------------------------------
  // Combat helpers
  // ---------------------------------------------------------------------

  function damagePlayer(amount, sourceX, sourceY) {
    if (player.invuln > 0 || !player.alive) return;
    let dmg = amount;
    if (player.blocking) {
      dmg *= (1 - PLAYER_BASE.blockReduction);
      Audio_.block();
      spawnParticles(player.x, player.y, 6, { color: '#e8c168', speed: 120, life: 0.3, size: 2 });
    } else {
      Audio_.hurt();
      player.hitStun = 0.12;
      screenShake = Math.min(screenShake + 8, 18);
    }
    player.hp -= dmg;
    player.hurtFlash = 0.25;
    spawnFloater(player.x, player.y - 30, `-${Math.round(dmg)}`, '#ff6b6b');
    if (!player.blocking) {
      const a = angleTo({ x: sourceX, y: sourceY }, player);
      player.x += Math.cos(a) * 14;
      player.y += Math.sin(a) * 14;
      spawnParticles(player.x, player.y, 10, { color: '#b02020' });
    }
    if (player.hp <= 0) {
      player.hp = 0;
      player.alive = false;
      drawDecalSplat(player.x, player.y, 26, '#5a0f0f');
      spawnParticles(player.x, player.y, 26, { color: '#7a1414', speed: 220, life: 0.8, size: 4 });
      screenShake = 24;
      setTimeout(endGame, 700);
    }
    updateHud();
  }

  function damageEnemy(enemy, amount, knockAngle) {
    enemy.hp -= amount;
    enemy.hurtFlash = 0.15;
    enemy.knockbackX = Math.cos(knockAngle) * 260;
    enemy.knockbackY = Math.sin(knockAngle) * 260;
    spawnFloater(enemy.x, enemy.y - enemy.def.radius - 10, `${Math.round(amount)}`, '#fff2c8');
    spawnParticles(enemy.x, enemy.y, 8, { color: '#b02020' });
    Audio_.hit();
    if (enemy.hp <= 0 && enemy.alive) {
      enemy.alive = false;
      enemy.hp = 0;
      player.kills++;
      score += enemy.def.scoreValue;
      drawDecalSplat(enemy.x, enemy.y, enemy.def.radius * 1.4, '#5a0f0f');
      spawnParticles(enemy.x, enemy.y, 22, { color: '#7a1414', speed: 200, life: 0.7, size: 4 });
      Audio_.death();
      if (enemy.def.boss) {
        screenShake = Math.min(screenShake + 16, 20);
        showToast('The Champion has fallen!');
        if (wave === 10 && !victoryShown) {
          victoryShown = true;
          Audio_.victory();
          showToast('The crowd chants your name — you are the arena\'s new legend!');
        }
      }
      updateHud();
    }
  }

  // ---------------------------------------------------------------------
  // Update loop
  // ---------------------------------------------------------------------

  let lastTime = performance.now();

  function update(dt) {
    if (gameState !== 'playing') return;

    // Wave management
    if (!waveActive) {
      waveTransitionTimer -= dt;
      if (waveTransitionTimer <= 0) startNextWave();
    }

    updatePlayer(dt);
    for (const e of enemies) updateEnemy(e, dt);
    enemies = enemies.filter(e => e.alive);

    if (waveActive && enemies.length === 0 && pendingSpawns === 0) {
      waveActive = false;
      waveTransitionTimer = 1.4;
      score += 15 + wave * 3;
      showToast(`Wave ${wave} cleared! The crowd roars.`);
      updateHud();
    }

    updateParticles(dt);
    if (screenShake > 0) screenShake = Math.max(0, screenShake - dt * 40);
  }

  function updatePlayer(dt) {
    if (!player.alive) return;

    if (player.staminaRegenTimer > 0) player.staminaRegenTimer -= dt;
    else player.stamina = clamp(player.stamina + PLAYER_BASE.staminaRegen * dt, 0, PLAYER_BASE.maxStamina);

    if (player.invuln > 0) player.invuln -= dt;
    if (player.hurtFlash > 0) player.hurtFlash -= dt;
    if (player.hitStun > 0) player.hitStun -= dt;

    // Facing follows mouse
    if (!player.dodging) {
      player.facing = angleTo(player, mouse);
    }

    // Blocking
    const wantsBlock = (mouse.downRight || KEYS.has('e')) && !player.dodging && !player.attacking && player.hitStun <= 0;
    player.blocking = wantsBlock && player.stamina > 0;
    if (player.blocking) {
      player.stamina = clamp(player.stamina - PLAYER_BASE.blockStaminaDrain * dt, 0, PLAYER_BASE.maxStamina);
      player.staminaRegenTimer = PLAYER_BASE.staminaRegenDelay;
    }

    // Movement
    const mv = movementVector();
    let speed = PLAYER_BASE.speed;
    if (player.blocking) speed *= PLAYER_BASE.blockSpeedMult;
    if (player.hitStun > 0) speed *= 0.2;

    if (player.dodging) {
      player.dodgeTimer -= dt;
      player.x += player.dodgeDir.x * PLAYER_BASE.speed * PLAYER_BASE.dodgeSpeedMult * dt;
      player.y += player.dodgeDir.y * PLAYER_BASE.speed * PLAYER_BASE.dodgeSpeedMult * dt;
      if (player.dodgeTimer <= 0) player.dodging = false;
    } else {
      player.x += mv.x * speed * dt;
      player.y += mv.y * speed * dt;
      if (mv.x !== 0 || mv.y !== 0) player.walkCycle += dt * 10;
    }
    clampToArena(player, PLAYER_BASE.radius);

    if (player.dodgeCooldownTimer > 0) player.dodgeCooldownTimer -= dt;
    const wantsDodge = KEYS.has('shift');
    if (wantsDodge && !player.dodging && player.dodgeCooldownTimer <= 0 && player.stamina >= PLAYER_BASE.dodgeStaminaCost && !player.blocking) {
      player.dodging = true;
      player.dodgeTimer = PLAYER_BASE.dodgeDuration;
      player.dodgeCooldownTimer = PLAYER_BASE.dodgeCooldown;
      player.invuln = PLAYER_BASE.dodgeDuration + 0.08;
      player.stamina -= PLAYER_BASE.dodgeStaminaCost;
      player.staminaRegenTimer = PLAYER_BASE.staminaRegenDelay;
      let d = mv;
      if (d.x === 0 && d.y === 0) d = { x: Math.cos(player.facing), y: Math.sin(player.facing) };
      player.dodgeDir = d;
      Audio_.dodge();
      spawnParticles(player.x, player.y, 8, { color: '#c9a06a', speed: 90, life: 0.3, size: 2 });
    }

    // Attacking
    if (player.attackCooldownTimer > 0) player.attackCooldownTimer -= dt;
    const wantsAttack = (mouse.downLeft || KEYS.has(' ')) && !player.blocking && !player.dodging;
    if (wantsAttack && !player.attacking && player.attackCooldownTimer <= 0 && player.stamina >= PLAYER_BASE.attackStaminaCost) {
      player.attacking = true;
      player.attackTimer = PLAYER_BASE.attackDuration;
      player.attackCooldownTimer = PLAYER_BASE.attackCooldown;
      player.stamina -= PLAYER_BASE.attackStaminaCost;
      player.staminaRegenTimer = PLAYER_BASE.staminaRegenDelay;
      player.attackHitIds.clear();
      Audio_.swing();
    }
    if (player.attacking) {
      player.attackTimer -= dt;
      const progress = 1 - (player.attackTimer / PLAYER_BASE.attackDuration);
      for (const e of enemies) {
        if (!e.alive || player.attackHitIds.has(e.id)) continue;
        const d = dist(player, e);
        if (d <= PLAYER_BASE.attackRange + e.def.radius) {
          const ang = angleTo(player, e);
          if (Math.abs(angleDiff(player.facing, ang)) <= PLAYER_BASE.attackArc / 2) {
            player.attackHitIds.add(e.id);
            damageEnemy(e, PLAYER_BASE.attackDamage, ang);
          }
        }
      }
      if (player.attackTimer <= 0) player.attacking = false;
    }
  }

  function updateEnemy(e, dt) {
    if (!e.alive) return;
    if (e.hurtFlash > 0) e.hurtFlash -= dt;

    // Knockback friction
    if (Math.abs(e.knockbackX) > 1 || Math.abs(e.knockbackY) > 1) {
      e.x += e.knockbackX * dt;
      e.y += e.knockbackY * dt;
      e.knockbackX *= 0.86;
      e.knockbackY *= 0.86;
      clampToArena(e, e.def.radius);
    }

    const d = dist(e, player);
    const toPlayer = angleTo(e, player);

    switch (e.state) {
      case 'chase': {
        e.facing = toPlayer;
        if (player.alive && d > e.def.range * 0.75) {
          e.x += Math.cos(toPlayer) * e.def.speed * dt;
          e.y += Math.sin(toPlayer) * e.def.speed * dt;
          clampToArena(e, e.def.radius);
        }
        e.cooldownTimer -= dt;
        if (player.alive && d <= e.def.range && e.cooldownTimer <= 0) {
          e.state = 'telegraph';
          e.stateTimer = e.def.telegraph;
        }
        break;
      }
      case 'telegraph': {
        e.facing = lerp(e.facing, toPlayer, 0.12);
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.state = 'attack';
          e.stateTimer = e.def.duration;
          e.hasHit = false;
        }
        break;
      }
      case 'attack': {
        e.stateTimer -= dt;
        if (!e.hasHit && e.stateTimer <= e.def.duration * 0.5) {
          e.hasHit = true;
          if (player.alive) {
            const dd = dist(e, player);
            if (dd <= e.def.range + PLAYER_BASE.radius) {
              const ang = angleTo(e, player);
              if (Math.abs(angleDiff(e.facing, ang)) <= e.def.arc / 2 + 0.15) {
                damagePlayer(e.def.damage, e.x, e.y);
              }
            }
          }
        }
        if (e.stateTimer <= 0) {
          e.state = 'recover';
          e.stateTimer = 0.25;
        }
        break;
      }
      case 'recover': {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.state = 'chase';
          e.cooldownTimer = e.def.cooldown;
        }
        break;
      }
    }

    // Soft separation so enemies don't perfectly stack
    for (const other of enemies) {
      if (other === e || !other.alive) continue;
      const dd = dist(e, other);
      const minDist = e.def.radius + other.def.radius + 6;
      if (dd > 0 && dd < minDist) {
        const push = (minDist - dd) / 2;
        const a = angleTo(other, e);
        e.x += Math.cos(a) * push * 0.5;
        e.y += Math.sin(a) * push * 0.5;
      }
    }
    clampToArena(e, e.def.radius);
  }

  function updateParticles(dt) {
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.9;
      p.vy *= 0.9;
    }
    floaters = floaters.filter(f => f.life > 0);
    for (const f of floaters) {
      f.life -= dt;
      f.y += f.vy * dt;
      f.vy *= 0.94;
    }
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------

  let torchFlicker = 0;
  const crowdDots = [];
  (function buildCrowd() {
    const tiers = 4;
    for (let t = 0; t < tiers; t++) {
      const rx = ARENA.rx + 40 + t * 34;
      const ry = ARENA.ry + 30 + t * 26;
      const count = 46 + t * 14;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + rand(-0.02, 0.02);
        crowdDots.push({
          a, rx, ry,
          phase: rand(0, Math.PI * 2),
          hue: [`#c9a06a`, `#8a6a4a`, `#b3854a`, `#7a5a3a`, `#d8ad63`][randInt(0, 4)]
        });
      }
    }
  })();

  const torches = [];
  (function buildTorches() {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      torches.push({
        x: ARENA.cx + Math.cos(a) * (ARENA.rx + 14),
        y: ARENA.cy + Math.sin(a) * (ARENA.ry + 14),
        phase: rand(0, 10)
      });
    }
  })();

  function drawArena() {
    // Sky / exterior
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#1a120a');
    skyGrad.addColorStop(1, '#3a2a18');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Crowd tiers (draw outer to inner)
    for (let t = 3; t >= 0; t--) {
      const rx = ARENA.rx + 40 + t * 34;
      const ry = ARENA.ry + 30 + t * 26;
      ctx.fillStyle = `rgba(20,14,8,${0.15 + t * 0.05})`;
      ctx.beginPath();
      ctx.ellipse(ARENA.cx, ARENA.cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const d of crowdDots) {
      const bob = Math.sin(torchFlicker * 2 + d.phase) * 1.5;
      const x = ARENA.cx + Math.cos(d.a) * d.rx;
      const y = ARENA.cy + Math.sin(d.a) * d.ry + bob;
      ctx.fillStyle = d.hue;
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stone rim
    ctx.strokeStyle = 'var(--stone)';
    ctx.strokeStyle = '#8b8074';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.ellipse(ARENA.cx, ARENA.cy, ARENA.rx + 13, ARENA.ry + 13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#4b4238';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(ARENA.cx, ARENA.cy, ARENA.rx + 2, ARENA.ry + 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Sand floor
    const sandGrad = ctx.createRadialGradient(ARENA.cx, ARENA.cy - 40, 40, ARENA.cx, ARENA.cy, ARENA.rx);
    sandGrad.addColorStop(0, '#e3bd7c');
    sandGrad.addColorStop(1, '#b3854a');
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.ellipse(ARENA.cx, ARENA.cy, ARENA.rx, ARENA.ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // subtle sand texture rings
    ctx.strokeStyle = 'rgba(120,85,40,0.15)';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.ellipse(ARENA.cx, ARENA.cy, ARENA.rx * (i / 4), ARENA.ry * (i / 4), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Decals (blood stains)
    ctx.drawImage(decalCanvas, 0, 0);

    // Torches
    for (const t of torches) {
      const flick = 0.7 + Math.sin(torchFlicker * 8 + t.phase) * 0.15 + Math.random() * 0.1;
      ctx.fillStyle = '#2c2620';
      ctx.fillRect(t.x - 3, t.y - 6, 6, 26);
      const grad = ctx.createRadialGradient(t.x, t.y - 14, 1, t.x, t.y - 14, 16 * flick);
      grad.addColorStop(0, `rgba(255,200,90,${0.9 * flick})`);
      grad.addColorStop(1, 'rgba(255,120,20,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(t.x, t.y - 14, 16 * flick, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,180,60,${flick})`;
      ctx.beginPath();
      ctx.ellipse(t.x, t.y - 12, 3.5, 7 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawEntityShadow(x, y, r) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.65, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHumanoid(x, y, facing, radius, bodyColor, accentColor, opts = {}) {
    const { flash = 0, walkBob = 0, weaponExtend = 0, weaponArc = 0.6, shielded = false, weaponLen = null } = opts;
    drawEntityShadow(x, y, radius);
    const bob = Math.sin(walkBob) * 1.5;

    ctx.save();
    ctx.translate(x, y + bob);

    // Body
    ctx.fillStyle = flash > 0 ? '#ffffff' : bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chest accent stripe
    ctx.fillStyle = flash > 0 ? '#ffe' : accentColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // Facing wedge (helmet visor direction)
    ctx.save();
    ctx.rotate(facing);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(radius * 0.2, -radius * 0.35);
    ctx.lineTo(radius * 1.05, 0);
    ctx.lineTo(radius * 0.2, radius * 0.35);
    ctx.closePath();
    ctx.fill();

    // Weapon
    const len = (weaponLen || radius * 2.1) + weaponExtend;
    ctx.strokeStyle = '#d8d8d8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(radius * 0.3, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(radius * 0.1, -3, radius * 0.35, 6);

    if (shielded) {
      ctx.fillStyle = 'rgba(200,170,90,0.9)';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.5, 0, radius * 0.55, radius * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4b4238';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }

  function drawAttackArc(x, y, facing, range, arc, progress, color) {
    ctx.save();
    ctx.globalAlpha = 0.55 * (1 - Math.abs(progress - 0.5) * 1.2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, range * (0.4 + progress * 0.6), facing - arc / 2, facing + arc / 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawTelegraph(e) {
    const t = 1 - (e.stateTimer / e.def.telegraph);
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.35 * Math.sin(t * Math.PI);
    ctx.strokeStyle = '#ff3b3b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.def.range, e.facing - e.def.arc / 2, e.facing + e.def.arc / 2);
    ctx.lineTo(e.x, e.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,40,40,0.12)';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawHealthBar(x, y, w, h, ratio, color) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x - w / 2, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x - w / 2, y, w * clamp(ratio, 0, 1), h);
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - w / 2, y, w, h);
  }

  function drawPlayer() {
    if (!player.alive) return;
    const p = PLAYER_BASE;
    let weaponExtend = 0;
    if (player.attacking) {
      const progress = 1 - (player.attackTimer / p.attackDuration);
      weaponExtend = Math.sin(progress * Math.PI) * 18;
      drawAttackArc(player.x, player.y, player.facing, p.attackRange, p.attackArc, progress, '#fff2c8');
    }
    const flash = player.hurtFlash > 0 ? Math.sin(player.hurtFlash * 40) * 0.5 + 0.5 : 0;
    ctx.save();
    if (player.invuln > 0 && !player.attacking) ctx.globalAlpha = 0.6 + Math.sin(performance.now() / 40) * 0.2;
    drawHumanoid(player.x, player.y, player.facing, p.radius, '#3a5a8a', '#e8c168', {
      flash: player.blocking ? 0 : flash,
      walkBob: player.walkCycle,
      weaponExtend,
      shielded: player.blocking,
      weaponLen: p.radius * 2.3
    });
    ctx.restore();
  }

  function drawEnemy(e) {
    if (!e.alive) return;
    if (e.state === 'telegraph') drawTelegraph(e);
    let weaponExtend = 0;
    if (e.state === 'attack') {
      const progress = 1 - (e.stateTimer / e.def.duration);
      weaponExtend = Math.sin(progress * Math.PI) * 16;
      drawAttackArc(e.x, e.y, e.facing, e.def.range, e.def.arc, progress, '#ff9b6b');
    }
    const flash = e.hurtFlash > 0 ? 1 : (e.state === 'telegraph' ? Math.sin(performance.now() / 60) * 0.3 + 0.3 : 0);
    drawHumanoid(e.x, e.y, e.facing, e.def.radius, e.def.color, e.def.accent, {
      flash,
      weaponExtend,
      weaponLen: e.def.radius * (e.type === 'spearman' ? 3.2 : 2.1)
    });
    const barW = e.def.radius * 2.2;
    drawHealthBar(e.x, e.y - e.def.radius - (e.def.boss ? 22 : 14), barW, e.def.boss ? 8 : 5, e.hp / e.maxHp, e.def.boss ? '#ffcf4d' : '#e34d4d');
    if (e.def.boss) {
      ctx.save();
      ctx.font = 'bold 12px Georgia, serif';
      ctx.fillStyle = '#ffcf4d';
      ctx.textAlign = 'center';
      ctx.fillText('CHAMPION', e.x, e.y - e.def.radius - 28);
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const f of floaters) {
      ctx.globalAlpha = clamp(f.life / f.maxLife, 0, 1);
      ctx.font = 'bold 16px Georgia, serif';
      ctx.fillStyle = f.color;
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    ctx.save();
    if (screenShake > 0) {
      ctx.translate(rand(-screenShake, screenShake), rand(-screenShake, screenShake));
    }
    drawArena();

    // Depth-sort player + enemies by y for a pseudo-3D feel
    const all = [{ y: player.y, draw: drawPlayer }, ...enemies.map(e => ({ y: e.y, draw: () => drawEnemy(e) }))];
    all.sort((a, b) => a.y - b.y);
    for (const item of all) item.draw();

    drawParticles();
    ctx.restore();
  }

  // ---------------------------------------------------------------------
  // Main loop
  // ---------------------------------------------------------------------

  function frame(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    torchFlicker += dt;

    update(dt);
    render();

    requestAnimationFrame(frame);
  }

  updateHud();
  requestAnimationFrame(frame);
})();
