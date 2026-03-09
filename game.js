// ============================================
// WAR.IO - GAME ENGINE
// Jetpack Arena Shooter
// ============================================

'use strict';



// --- Constants ---
const GRAVITY = 0.45;
const JETPACK_THRUST = -0.72;
const MAX_FUEL = 100;
const FUEL_USE = 0.55;
const FUEL_REGEN = 0.18;
const MOVE_SPEED = 3.2;
const AIR_FRICTION = 0.985;
const GROUND_FRICTION = 0.82;
const MAX_FALL_SPEED = 10;
const MAX_FLY_SPEED = 7;
const PLAYER_W = 24;
const PLAYER_H = 36;
const RESPAWN_TIME = 3000;
const PICKUP_RANGE = 50;
const MAX_GRENADES = 4;
const GRENADE_SPEED = 9;
const GRENADE_FUSE = 2200;
const GRENADE_RADIUS = 120;
const GRENADE_DAMAGE = 85;
const GRENADE_COOLDOWN = 1200;
const RELOAD_TIMES = { pistol: 0, smg: 1800, shotgun: 2200, sniper: 2500, rocket: 3000 };
const GIB_LIFETIME = 4000;
const GIB_BOUNCE_DAMP = 0.45;
const GIB_FRICTION = 0.97;

// --- Leveling System ---
const XP_PER_KILL = 25;
const LEVEL_THRESHOLDS = [0, 50, 120, 220, 350, 520, 730, 1000, 1350, 1800, 2400];
const LEVEL_PERKS = {
    2: { name: 'FAST RELOAD', desc: 'Reload 25% faster', icon: '⚡' },
    3: { name: 'EXTRA GRENADES', desc: '+2 grenades per life', icon: '💣' },
    5: { name: 'AKIMBO', desc: 'Dual-wield pistols!', icon: '🔫' },
    7: { name: 'EXTENDED MAGS', desc: '+50% magazine size', icon: '📦' },
    8: { name: 'ARMOR PLATING', desc: '+20 max health', icon: '🛡️' },
    10: { name: 'EXPLOSIVE ROUNDS', desc: 'Bullets explode on hit', icon: '💥' }
};

// --- Weapon Definitions ---
const WEAPONS = {
    pistol: { name: 'PISTOL', damage: 18, fireRate: 350, bulletSpeed: 14, ammo: Infinity, spread: 0.03, recoil: 1.5, color: '#ffe066', bulletW: 10, bulletH: 3, auto: false, explosive: false, pellets: 1, ricochet: 0 },
    smg: { name: 'SMG', damage: 12, fireRate: 80, bulletSpeed: 16, ammo: 120, spread: 0.07, recoil: 0.8, color: '#ffa726', bulletW: 8, bulletH: 2, auto: true, explosive: false, pellets: 1, ricochet: 0 },
    shotgun: { name: 'SHOTGUN', damage: 9, fireRate: 600, bulletSpeed: 13, ammo: 30, spread: 0.18, recoil: 4, color: '#ff7043', bulletW: 6, bulletH: 3, auto: false, explosive: false, pellets: 7, ricochet: 0 },
    sniper: { name: 'SNIPER', damage: 70, fireRate: 1000, bulletSpeed: 28, ammo: 15, spread: 0.005, recoil: 6, color: '#29b6f6', bulletW: 18, bulletH: 2, auto: false, explosive: false, pellets: 1, ricochet: 0, laser: true },
    rocket: { name: 'ROCKET', damage: 55, fireRate: 1200, bulletSpeed: 8, ammo: 8, spread: 0.02, recoil: 5, color: '#ef5350', bulletW: 12, bulletH: 5, auto: false, explosive: true, pellets: 1, explodeRadius: 70, ricochet: 0 },
    bouncer: { name: 'BOUNCER', damage: 22, fireRate: 300, bulletSpeed: 12, ammo: 40, spread: 0.04, recoil: 2, color: '#e040fb', bulletW: 8, bulletH: 4, auto: false, explosive: false, pellets: 1, ricochet: 3 }
};

// --- Weapon Skins ---
const WEAPON_SKINS = ['Default', 'Gold', 'Neon', 'Arctic', 'Camo'];
const SKIN_COLORS = {
    Default: null,
    Gold: { body: '#ffd700', accent: '#ff8f00', barrel: '#ffab00', glow: 'rgba(255,215,0,0.3)' },
    Neon: { body: '#00e5ff', accent: '#76ff03', barrel: '#e040fb', glow: 'rgba(0,229,255,0.4)' },
    Arctic: { body: '#e0e0e0', accent: '#90caf9', barrel: '#b0bec5', glow: 'rgba(200,200,255,0.2)' },
    Camo: { body: '#4e6b3e', accent: '#3e5a2e', barrel: '#6d8b5e', glow: null }
};

// --- Shield ---
const SHIELD_MAX = 40;
const SHIELD_REGEN_DELAY = 5000;
const SHIELD_REGEN_RATE = 0.08;

// --- Game Modes ---
const GAME_MODES = ['Free For All', 'Team Deathmatch', '1v1 Duel', 'Battle Royale'];

// --- Kill Streaks ---
const STREAK_REWARDS = {
    3: { name: 'AIRSTRIKE', desc: 'Missiles from above!', icon: '🚀' },
    5: { name: 'SHIELD BOOST', desc: 'Full shield recharge!', icon: '🛡️' },
    7: { name: 'DEATH RAIN', desc: 'Explosive barrage!', icon: '☄️' }
};

// --- Challenges ---
const CHALLENGE_POOL = [
    { id: 'headshot3', desc: 'Get 3 headshots', target: 3, stat: 'headshots', icon: '🎯' },
    { id: 'grenade2', desc: 'Kill 2 with grenades', target: 2, stat: 'grenadeKills', icon: '💣' },
    { id: 'streak5', desc: 'Reach 5 kill streak', target: 5, stat: 'maxStreak', icon: '🔥' },
    { id: 'sniper3', desc: 'Get 3 sniper kills', target: 3, stat: 'sniperKills', icon: '🔭' },
    { id: 'nodie', desc: 'Win without dying', target: 0, stat: 'deathless', icon: '👻' },
    { id: 'quick5', desc: 'Get 5 kills in 60s', target: 5, stat: 'quickKills', icon: '⚡' },
    { id: 'bounce2', desc: 'Get 2 ricochet kills', target: 2, stat: 'bounceKills', icon: '↩️' }
];

// --- Medals ---
const MEDAL_DEFS = {
    firstBlood: { name: 'First Blood', icon: '🩸', desc: 'Get the first kill' },
    dominator: { name: 'Dominator', icon: '👑', desc: 'Get 10+ kills in one game' },
    untouchable: { name: 'Untouchable', icon: '🛡️', desc: 'Win without dying' },
    headhunter: { name: 'Head Hunter', icon: '🎯', desc: 'Get 5 headshots in one game' },
    demolitionist: { name: 'Demolitionist', icon: '💥', desc: 'Get 3+ grenade kills' },
    sharpshooter: { name: 'Sharpshooter', icon: '🔭', desc: 'Get 3+ sniper kills' },
    streak7: { name: 'Unstoppable', icon: '🔥', desc: 'Reach a 7-kill streak' }
};

// --- Announcer ---
const ANNOUNCER_MSGS = {
    2: 'DOUBLE KILL', 3: 'TRIPLE KILL', 4: 'QUAD KILL', 5: 'PENTA KILL', 6: 'RAMPAGE',
    streak3: 'KILLING SPREE', streak5: 'DOMINATING', streak7: 'UNSTOPPABLE', streak10: 'GODLIKE'
};
const ANNOUNCER_COLORS = {
    'DOUBLE KILL': '#ffd700', 'TRIPLE KILL': '#ff9800', 'QUAD KILL': '#f44336', 'PENTA KILL': '#e040fb',
    'RAMPAGE': '#ff1744', 'KILLING SPREE': '#ff9800', 'DOMINATING': '#f44336', 'UNSTOPPABLE': '#e040fb', 'GODLIKE': '#ff1744'
};

// --- Customization ---
const ARMOR_COLORS = [
    { name: 'Cyan', hex: '#00e5ff' }, { name: 'Red', hex: '#ef5350' }, { name: 'Green', hex: '#66bb6a' },
    { name: 'Purple', hex: '#ab47bc' }, { name: 'Orange', hex: '#ff9800' }, { name: 'Pink', hex: '#ec407a' },
    { name: 'Gold', hex: '#ffd740' }, { name: 'White', hex: '#eceff1' }
];
const VISOR_COLORS = [
    { name: 'Green', hex: 'rgba(0,230,100,0.5)' }, { name: 'Cyan', hex: 'rgba(0,230,255,0.5)' },
    { name: 'Red', hex: 'rgba(255,50,50,0.5)' }, { name: 'Gold', hex: 'rgba(255,215,0,0.5)' },
    { name: 'Purple', hex: 'rgba(180,50,255,0.5)' }, { name: 'White', hex: 'rgba(255,255,255,0.5)' }
];
const HEADSHOT_MULT = 2.0;
const HEADSHOT_ZONE = 0.3; // top 30% of entity height

const BOT_NAMES = ['Ghost', 'Viper', 'Hawk', 'Storm', 'Blaze', 'Shadow', 'Wolf', 'Cobra', 'Falcon', 'Thunder', 'Reaper', 'Phantom', 'Rogue', 'Titan', 'Spartan'];
const DIFFICULTY_PRESETS = {
    Easy: { reactionTime: 800, aimAccuracy: 0.35, aggressiveness: 0.3, movementSkill: 0.3 },
    Medium: { reactionTime: 450, aimAccuracy: 0.6, aggressiveness: 0.55, movementSkill: 0.55 },
    Hard: { reactionTime: 200, aimAccuracy: 0.82, aggressiveness: 0.75, movementSkill: 0.8 },
    Insane: { reactionTime: 100, aimAccuracy: 0.95, aggressiveness: 0.9, movementSkill: 0.95 }
};
const DIFF_NAMES = ['Easy', 'Medium', 'Hard', 'Insane'];
const MAP_NAMES = ['Desert Base', 'Jungle Ruins', 'Bunker'];

// --- Audio Engine (procedural) ---
class AudioEngine {
    constructor() {
        this.enabled = true;
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.enabled = false; }
    }
    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
    play(type) {
        if (!this.enabled) return;
        try {
            const now = this.ctx.currentTime;
            const g = this.ctx.createGain();
            g.connect(this.ctx.destination);
            const o = this.ctx.createOscillator();
            const n = this.ctx.createBufferSource();
            switch (type) {
                case 'shoot_pistol': this._noise(g, 0.15, 0.08, now); this._tone(g, 800, 200, 0.06, now, 'square'); break;
                case 'shoot_smg': this._noise(g, 0.1, 0.05, now); this._tone(g, 1000, 300, 0.04, now, 'square'); break;
                case 'shoot_shotgun': this._noise(g, 0.25, 0.12, now); this._tone(g, 400, 100, 0.1, now, 'sawtooth'); break;
                case 'shoot_sniper': this._noise(g, 0.2, 0.15, now); this._tone(g, 1500, 200, 0.12, now, 'sine'); break;
                case 'shoot_rocket': this._noise(g, 0.15, 0.2, now); this._tone(g, 200, 80, 0.2, now, 'sawtooth'); break;
                case 'shoot_bouncer': this._tone(g, 1200, 600, 0.06, now, 'sine'); this._tone(g, 800, 1400, 0.04, now, 'square'); break;
                case 'explode': this._noise(g, 0.35, 0.4, now); this._tone(g, 100, 30, 0.3, now, 'sawtooth'); break;
                case 'hit': this._tone(g, 600, 200, 0.05, now, 'square'); break;
                case 'headshot': this._tone(g, 2000, 2500, 0.08, now, 'sine'); this._tone(g, 1500, 2000, 0.06, now, 'square'); break;
                case 'death': this._tone(g, 300, 80, 0.3, now, 'sawtooth'); break;
                case 'pickup': this._tone(g, 800, 1200, 0.1, now, 'sine'); break;
                case 'shield_hit': this._tone(g, 1000, 500, 0.06, now, 'sine'); this._tone(g, 600, 300, 0.04, now, 'triangle'); break;
                case 'shield_break': this._noise(g, 0.2, 0.15, now); this._tone(g, 800, 200, 0.1, now, 'sawtooth'); break;
                case 'streak': this._tone(g, 600, 1200, 0.1, now, 'sine'); setTimeout(() => { try { const g2 = this.ctx.createGain(); g2.connect(this.ctx.destination); this._tone(g2, 800, 1600, 0.08, this.ctx.currentTime, 'sine'); } catch (e) { } }, 100); break;
                case 'airstrike': this._noise(g, 0.3, 0.5, now); this._tone(g, 200, 50, 0.4, now, 'sawtooth'); break;
                case 'ricochet': this._tone(g, 2000 + Math.random() * 1000, 500, 0.04, now, 'sine'); break;
                case 'jetpack': this._noise(g, 0.04, 0.08, now); break;
                case 'grenade_throw': this._tone(g, 500, 300, 0.08, now, 'sine'); this._noise(g, 0.08, 0.06, now); break;
                case 'grenade_bounce': this._tone(g, 400, 200, 0.03, now, 'square'); break;
                case 'gib_bounce': this._tone(g, 250 + Math.random() * 200, 100, 0.02, now, 'triangle'); break;
                case 'reload': this._tone(g, 600, 900, 0.06, now, 'sine'); setTimeout(() => { try { const g2 = this.ctx.createGain(); g2.connect(this.ctx.destination); this._tone(g2, 900, 1100, 0.06, this.ctx.currentTime, 'sine'); } catch (e) { } }, 150); break;
            }
        } catch (e) { }
    }
    _noise(g, vol, dur, t) {
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
        const s = this.ctx.createBufferSource(); s.buffer = buf;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        s.connect(g); s.start(t); s.stop(t + dur);
    }
    _tone(g, f1, f2, dur, t, type) {
        const o = this.ctx.createOscillator(); o.type = type;
        o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(f2, 20), t + dur);
        g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); o.start(t); o.stop(t + dur);
    }
}

// --- Particle System ---
class Particle {
    constructor(x, y, vx, vy, life, size, color, gravity = true, shrink = true) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.life = life; this.maxLife = life; this.size = size;
        this.color = color; this.gravity = gravity; this.shrink = shrink; this.dead = false;
    }
    update(dt) {
        this.x += this.vx; this.y += this.vy;
        if (this.gravity) this.vy += 0.15;
        this.vx *= 0.98; this.life -= 16;
        if (this.life <= 0) this.dead = true;
    }
    draw(ctx, cam) {
        const a = Math.max(0, this.life / this.maxLife);
        const s = this.shrink ? this.size * a : this.size;
        ctx.globalAlpha = a;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cam.x - s / 2, this.y - cam.y - s / 2, s, s);
        ctx.globalAlpha = 1;
    }
}

class ParticleSystem {
    constructor() { this.particles = []; }
    add(p) { this.particles.push(p); }
    update() { this.particles.forEach(p => p.update()); this.particles = this.particles.filter(p => !p.dead); }
    draw(ctx, cam) { this.particles.forEach(p => p.draw(ctx, cam)); }
    muzzleFlash(x, y, angle) {
        for (let i = 0; i < 6; i++) {
            const a = angle + (Math.random() - 0.5) * 0.5;
            const sp = 2 + Math.random() * 4;
            this.add(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp, 120 + Math.random() * 80, 2 + Math.random() * 3, ['#fff', '#ffe066', '#ffa726'][i % 3]));
        }
    }
    blood(x, y) {
        for (let i = 0; i < 8; i++) {
            const a = Math.random() * Math.PI * 2; const sp = 1 + Math.random() * 3;
            this.add(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 1, 200 + Math.random() * 200, 2 + Math.random() * 2, ['#ff3333', '#cc0000', '#ff6666'][i % 3]));
        }
    }
    explosion(x, y, radius) {
        // Core fireball
        for (let i = 0; i < 50; i++) {
            const a = Math.random() * Math.PI * 2; const sp = 0.5 + Math.random() * 8;
            const c = ['#fff', '#fffde7', '#ffcc00', '#ff9900', '#ff5500', '#ff2200', '#cc0000'][i % 7];
            const sz = 2 + Math.random() * 6;
            this.add(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp - Math.random() * 2, 250 + Math.random() * 350, sz, c));
        }
        // Smoke ring
        for (let i = 0; i < 20; i++) {
            const a = Math.random() * Math.PI * 2; const sp = 0.3 + Math.random() * 2.5;
            this.add(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 0.5, 600 + Math.random() * 400, 6 + Math.random() * 10, 'rgba(80,80,80,0.6)', true, true));
        }
        // Sparks
        for (let i = 0; i < 25; i++) {
            const a = Math.random() * Math.PI * 2; const sp = 3 + Math.random() * 7;
            this.add(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 2, 400 + Math.random() * 300, 1.5 + Math.random() * 2, ['#fff', '#ffe066', '#ffa726'][i % 3], true, false));
        }
        // Debris
        for (let i = 0; i < 12; i++) {
            const a = Math.random() * Math.PI * 2; const sp = 2 + Math.random() * 4;
            this.add(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 3, 500 + Math.random() * 500, 3 + Math.random() * 4, ['#5d4037', '#795548', '#4e342e'][i % 3], true, false));
        }
    }
    jetpackTrail(x, y) {
        for (let i = 0; i < 2; i++) {
            const c = ['#00e5ff', '#4dd0e1', '#80deea', '#b2ebf2', '#fff'][Math.random() * 5 | 0];
            this.add(new Particle(x + (Math.random() - 0.5) * 8, y, (Math.random() - 0.5) * 0.8, 1.5 + Math.random() * 2.5, 120 + Math.random() * 80, 2 + Math.random() * 4, c, false, true));
        }
        // Hot core
        this.add(new Particle(x + (Math.random() - 0.5) * 3, y, 0, 1 + Math.random(), 80, 2 + Math.random() * 2, '#fff', false, true));
    }
    shellEject(x, y, dir) {
        this.add(new Particle(x, y, -dir * (1.5 + Math.random() * 2.5), -2.5 - Math.random() * 2, 500, 2, '#ffd700', true, false));
        this.add(new Particle(x, y, -dir * (1 + Math.random() * 1.5), -1.5 - Math.random() * 1.5, 400, 1.5, '#ffab00', true, false));
    }
}

// --- Damage Numbers ---
class DamageNumber {
    constructor(x, y, dmg, isHeadshot) {
        this.x = x; this.y = y; this.vy = -1.5 - Math.random(); this.vx = (Math.random() - 0.5) * 1.5;
        this.text = Math.ceil(dmg); this.headshot = isHeadshot;
        this.life = 1200; this.maxLife = 1200; this.dead = false;
    }
    update() { this.x += this.vx; this.y += this.vy; this.vy += 0.02; this.life -= 16; if (this.life <= 0) this.dead = true; }
    draw(ctx, cam) {
        const a = Math.max(0, this.life / this.maxLife);
        ctx.save(); ctx.globalAlpha = a;
        ctx.font = this.headshot ? 'bold 16px Orbitron' : 'bold 12px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.headshot ? '#ff1744' : '#fff';
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2;
        const sx = this.x - cam.x, sy = this.y - cam.y;
        ctx.strokeText(this.text, sx, sy);
        ctx.fillText(this.text, sx, sy);
        if (this.headshot) { ctx.fillStyle = '#ffd700'; ctx.font = 'bold 9px Orbitron'; ctx.fillText('HEADSHOT', sx, sy - 14); }
        ctx.restore();
    }
}

// --- Blood Decal ---
class BloodDecal {
    constructor(x, y, platformRef) {
        this.x = x; this.y = y; this.platform = platformRef;
        this.w = 4 + Math.random() * 12; this.h = 2 + Math.random() * 3;
        this.life = 30000; this.dead = false;
    }
    update() { this.life -= 16; if (this.life <= 0) this.dead = true; }
    draw(ctx, cam) {
        const a = Math.min(1, this.life / 5000);
        ctx.save(); ctx.globalAlpha = a * 0.6;
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(this.x - cam.x - this.w / 2, this.y - cam.y - this.h / 2, this.w, this.h);
        ctx.restore();
    }
}

// --- Hit Marker ---
class HitMarker {
    constructor(x, y, headshot) {
        this.x = x; this.y = y; this.headshot = headshot;
        this.life = 250; this.maxLife = 250; this.dead = false;
    }
    update() { this.life -= 16; if (this.life <= 0) this.dead = true; }
    draw(ctx, cam) {
        const a = this.life / this.maxLife;
        const s = this.headshot ? 10 : 7;
        ctx.save(); ctx.globalAlpha = a;
        ctx.strokeStyle = this.headshot ? '#ff1744' : '#fff';
        ctx.lineWidth = this.headshot ? 2.5 : 1.5;
        const sx = this.x - cam.x, sy = this.y - cam.y;
        ctx.beginPath(); ctx.moveTo(sx - s, sy - s); ctx.lineTo(sx - s / 3, sy - s / 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx + s, sy - s); ctx.lineTo(sx + s / 3, sy - s / 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx - s, sy + s); ctx.lineTo(sx - s / 3, sy + s / 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx + s, sy + s); ctx.lineTo(sx + s / 3, sy + s / 3); ctx.stroke();
        ctx.restore();
    }
}

// --- Map Generation ---
function generateMap(mapIndex, w, h) {
    const platforms = [];
    const spawns = [];
    const pickups = [];
    // Floor
    platforms.push({ x: 0, y: h - 40, w: w, h: 40, color: '#3e2723' });
    // Walls
    platforms.push({ x: 0, y: 0, w: 20, h: h, color: '#4e342e' });
    platforms.push({ x: w - 20, y: 0, w: 20, h: h, color: '#4e342e' });
    // Ceiling
    platforms.push({ x: 0, y: 0, w: w, h: 20, color: '#4e342e' });

    if (mapIndex === 0) { // Desert Base
        const c1 = '#8d6e63', c2 = '#a1887f', c3 = '#6d4c41';
        platforms.push({ x: 100, y: h - 160, w: 200, h: 20, color: c1 });
        platforms.push({ x: 400, y: h - 120, w: 150, h: 20, color: c2 });
        platforms.push({ x: 600, y: h - 220, w: 180, h: 20, color: c1 });
        platforms.push({ x: 850, y: h - 160, w: 200, h: 20, color: c3 });
        platforms.push({ x: 1100, y: h - 280, w: 160, h: 20, color: c1 });
        platforms.push({ x: 1350, y: h - 180, w: 220, h: 20, color: c2 });
        platforms.push({ x: 1600, y: h - 130, w: 140, h: 20, color: c1 });
        platforms.push({ x: 1800, y: h - 250, w: 180, h: 20, color: c3 });
        platforms.push({ x: 300, y: h - 340, w: 120, h: 20, color: c2 });
        platforms.push({ x: 700, y: h - 400, w: 200, h: 20, color: c1 });
        platforms.push({ x: 1050, y: h - 450, w: 150, h: 20, color: c2 });
        platforms.push({ x: 1500, y: h - 380, w: 180, h: 20, color: c3 });
        platforms.push({ x: 200, y: h - 520, w: 160, h: 20, color: c1 });
        platforms.push({ x: 900, y: h - 560, w: 200, h: 20, color: c2 });
        platforms.push({ x: 1600, y: h - 500, w: 140, h: 20, color: c1 });
        // Vertical walls for cover
        platforms.push({ x: 500, y: h - 160, w: 15, h: 120, color: c3 });
        platforms.push({ x: 1200, y: h - 320, w: 15, h: 100, color: c3 });
        platforms.push({ x: 1700, y: h - 180, w: 15, h: 140, color: c3 });
    } else if (mapIndex === 1) { // Jungle Ruins
        const c1 = '#2e7d32', c2 = '#388e3c', c3 = '#1b5e20';
        platforms.push({ x: 80, y: h - 140, w: 180, h: 20, color: c1 });
        platforms.push({ x: 350, y: h - 200, w: 160, h: 20, color: c2 });
        platforms.push({ x: 570, y: h - 140, w: 200, h: 20, color: c1 });
        platforms.push({ x: 820, y: h - 260, w: 180, h: 20, color: c3 });
        platforms.push({ x: 1050, y: h - 180, w: 200, h: 20, color: c1 });
        platforms.push({ x: 1300, y: h - 300, w: 160, h: 20, color: c2 });
        platforms.push({ x: 1550, y: h - 200, w: 180, h: 20, color: c1 });
        platforms.push({ x: 1780, y: h - 280, w: 160, h: 20, color: c3 });
        platforms.push({ x: 200, y: h - 380, w: 140, h: 20, color: c2 });
        platforms.push({ x: 500, y: h - 420, w: 220, h: 20, color: c1 });
        platforms.push({ x: 900, y: h - 480, w: 180, h: 20, color: c3 });
        platforms.push({ x: 1200, y: h - 500, w: 200, h: 20, color: c2 });
        platforms.push({ x: 1600, y: h - 440, w: 160, h: 20, color: c1 });
        platforms.push({ x: 400, y: h - 580, w: 160, h: 20, color: c3 });
        platforms.push({ x: 1000, y: h - 600, w: 200, h: 20, color: c2 });
        // Vines (vertical)
        platforms.push({ x: 750, y: h - 260, w: 12, h: 220, color: c3 });
        platforms.push({ x: 1450, y: h - 300, w: 12, h: 260, color: c3 });
    } else { // Bunker
        const c1 = '#455a64', c2 = '#546e7a', c3 = '#37474f';
        platforms.push({ x: 100, y: h - 130, w: 220, h: 20, color: c1 });
        platforms.push({ x: 380, y: h - 180, w: 180, h: 20, color: c2 });
        platforms.push({ x: 620, y: h - 250, w: 200, h: 20, color: c1 });
        platforms.push({ x: 880, y: h - 160, w: 180, h: 20, color: c3 });
        platforms.push({ x: 1120, y: h - 300, w: 200, h: 20, color: c1 });
        platforms.push({ x: 1380, y: h - 200, w: 160, h: 20, color: c2 });
        platforms.push({ x: 1600, y: h - 280, w: 190, h: 20, color: c1 });
        platforms.push({ x: 1850, y: h - 160, w: 120, h: 20, color: c3 });
        platforms.push({ x: 250, y: h - 360, w: 180, h: 20, color: c2 });
        platforms.push({ x: 700, y: h - 440, w: 160, h: 20, color: c1 });
        platforms.push({ x: 1050, y: h - 500, w: 200, h: 20, color: c3 });
        platforms.push({ x: 1500, y: h - 460, w: 180, h: 20, color: c2 });
        // Tunnels
        platforms.push({ x: 450, y: h - 250, w: 15, h: 70, color: c3 });
        platforms.push({ x: 620, y: h - 250, w: 15, h: 70, color: c3 });
        platforms.push({ x: 450, y: h - 250, w: 185, h: 15, color: c3 });
        platforms.push({ x: 1100, y: h - 380, w: 15, h: 80, color: c3 });
        platforms.push({ x: 1320, y: h - 380, w: 15, h: 80, color: c3 });
        platforms.push({ x: 1100, y: h - 380, w: 235, h: 15, color: c3 });
    }

    // Spawns on platforms
    for (let i = 4; i < platforms.length; i++) {
        const p = platforms[i];
        if (p.h <= 25 && p.w > 60) spawns.push({ x: p.x + p.w / 2, y: p.y - PLAYER_H });
    }
    spawns.push({ x: w / 2, y: h - 80 });
    if (spawns.length < 8) { for (let i = 0; i < 5; i++) spawns.push({ x: 200 + Math.random() * (w - 400), y: h - 80 }); }

    // Weapon pickups
    const wpnKeys = Object.keys(WEAPONS).filter(k => k !== 'pistol');
    for (let i = 0; i < 6; i++) {
        const sp = spawns[i % spawns.length];
        pickups.push({ x: sp.x + (Math.random() - 0.5) * 100, y: sp.y - 20, weapon: wpnKeys[i % wpnKeys.length], respawnTime: 15000, dead: false, deathTime: 0 });
    }
    // Shield pickups
    for (let i = 0; i < 2; i++) {
        const sp = spawns[(i + 3) % spawns.length];
        pickups.push({ x: sp.x + (Math.random() - 0.5) * 80, y: sp.y - 20, weapon: 'shield', respawnTime: 20000, dead: false, deathTime: 0 });
    }

    return { platforms, spawns, pickups, w, h };
}

// --- Entity (Player/Bot) ---
class Entity {
    constructor(x, y, name, isPlayer = false, teamColor = null) {
        this.x = x; this.y = y; this.vx = 0; this.vy = 0;
        this.w = PLAYER_W; this.h = PLAYER_H;
        this.name = name; this.isPlayer = isPlayer;
        this.health = 100; this.maxHealth = 100;
        this.fuel = MAX_FUEL; this.alive = true;
        this.weapon = 'pistol'; this.ammo = Infinity; this.maxAmmo = Infinity;
        this.aimAngle = 0; this.facingRight = true;
        this.onGround = false; this.jetpacking = false;
        this.lastShot = 0; this.kills = 0; this.deaths = 0;
        this.color = teamColor || `hsl(${Math.random() * 360},70%,55%)`;
        this.bodyColor = `hsl(${Math.random() * 360},50%,35%)`;
        this.skinColor = '#e8b89d';
        this.visorColor = 'rgba(0,230,255,0.5)';
        this.weaponSkin = 'Default';
        this.respawnTimer = 0; this.invulnTime = 0;
        this.walkFrame = 0; this.walkTimer = 0;
        // Shield
        this.shield = 0; this.maxShield = SHIELD_MAX;
        this.lastDamageTime = 0;
        // Kill Streak
        this.streak = 0; this.maxStreak = 0;
        this.multiKillTimer = 0; this.multiKillCount = 0;
        // Team
        this.team = null;
        // Grenades
        this.grenades = MAX_GRENADES;
        this.lastGrenade = 0;
        // Reload system
        this.reloading = false;
        this.reloadTimer = 0;
        this.reloadDuration = 0;
        // Leveling
        this.xp = 0;
        this.level = 1;
        this.akimbo = false;
        this.explosiveRounds = false;
        this.reloadMult = 1;
        this.magMult = 1;
    }
    get cx() { return this.x + this.w / 2; }
    get cy() { return this.y + this.h / 2; }
    getWeapon() { return WEAPONS[this.weapon]; }
    equipWeapon(key) {
        this.weapon = key; this.ammo = WEAPONS[key].ammo; this.maxAmmo = WEAPONS[key].ammo;
        this.reloading = false; this.reloadTimer = 0;
    }
    startReload(game) {
        if (this.reloading) return;
        if (this.weapon === 'pistol') return; // pistol has infinite ammo
        if (this.ammo >= this.maxAmmo) return;
        this.reloading = true;
        this.reloadDuration = RELOAD_TIMES[this.weapon] || 2000;
        this.reloadTimer = this.reloadDuration;
        if (game) game.audio.play('reload');
    }
    updateReload(dt, game) {
        if (!this.reloading) return;
        this.reloadTimer -= dt;
        if (this.reloadTimer <= 0) {
            this.reloading = false;
            this.reloadTimer = 0;
            this.ammo = this.maxAmmo;
            if (game) game.audio.play('reload');
        }
    }
    takeDamage(dmg, attacker, game, hitAngle) {
        if (!this.alive || this.invulnTime > 0) return;

        // In multiplayer, we don't apply damage to RemotePlayers locally.
        // We wait for the victim to report their own damage/death.
        // UNLESS it's the local player taking damage.
        if (game.isMultiplayer && !this.isPlayer) {
            // Just show visual effects
            game.particles.blood(this.cx, this.cy);
            return;
        }

        this.lastDamageTime = performance.now();
        // Shield absorbs first
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, dmg);
            this.shield -= absorbed;
            dmg -= absorbed;
            game.audio.play(this.shield <= 0 ? 'shield_break' : 'shield_hit');
            if (dmg <= 0) return;
        }
        this.health -= dmg;
        this.lastHitAngle = hitAngle !== undefined ? hitAngle : (attacker ? Math.atan2(this.cy - attacker.cy, this.cx - attacker.cx) : Math.random() * Math.PI * 2);
        this.lastHitForce = dmg;
        game.particles.blood(this.cx, this.cy);
        if (this.health <= 0) { this.die(attacker, game); }
    }
    addXP(amount, game) {
        this.xp += amount;
        let newLevel = 1;
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.xp >= LEVEL_THRESHOLDS[i]) { newLevel = i + 1; break; }
        }
        if (newLevel > this.level) {
            this.level = newLevel;
            this.applyPerks(game);
            if (this.isPlayer && game) game.showLevelUp(this.level);
        }
    }
    applyPerks(game) {
        if (this.level >= 2) this.reloadMult = 0.75;
        if (this.level >= 3) this.grenades = Math.min(this.grenades + 2, MAX_GRENADES + 2);
        if (this.level >= 5) this.akimbo = true;
        if (this.level >= 7) this.magMult = 1.5;
        if (this.level >= 8) { this.maxHealth = 120; this.health = Math.min(this.health + 20, 120); }
        if (this.level >= 10) this.explosiveRounds = true;
    }
    die(killer, game) {
        this.alive = false; this.deaths++;
        this.streak = 0;
        this.respawnTimer = RESPAWN_TIME;
        game.audio.play('death');
        // Spawn ragdoll gibs
        const force = Math.min((this.lastHitForce || 20) * 0.15, 8);
        const ang = this.lastHitAngle || 0;
        const explosive = force > 4;
        game.spawnGibs(this, ang, force, explosive);
        game.particles.blood(this.cx, this.cy);
        game.particles.blood(this.cx, this.cy);
        if (explosive) {
            game.particles.explosion(this.cx, this.cy, 30);
            game.screenShake = Math.max(game.screenShake, 10);
        }
        if (killer && killer !== this) {
            killer.kills++;
            killer.addXP(XP_PER_KILL, game);
            game.addKillFeed(killer.name, this.name, killer.weapon);
            if (killer.isPlayer) game.checkWinCondition();
        }
    }
    respawn(spawns, spawnIdx = null) {
        const idx = spawnIdx !== null ? spawnIdx % spawns.length : (Math.random() * spawns.length | 0);
        const sp = spawns[idx];
        this.x = sp.x - this.w / 2; this.y = sp.y;
        this.vx = 0; this.vy = 0;
        this.health = this.maxHealth; this.fuel = MAX_FUEL;
        this.alive = true; this.weapon = 'pistol'; this.ammo = Infinity; this.maxAmmo = Infinity;
        this.invulnTime = 1500;
        this.grenades = MAX_GRENADES;
        this.reloading = false; this.reloadTimer = 0;
        this.lastHitAngle = 0; this.lastHitForce = 0;
        this.shield = 0; this.lastDamageTime = 0;
    }
}

// --- Multiplayer Classes ---
class RemotePlayer extends Entity {
    constructor(id, x, y, name, color) {
        super(x, y, name, false, color);
        this.id = id;
        this.targetX = x;
        this.targetY = y;
        this.targetAngle = 0;
        this.lerpSpeed = 0.25;
        this.lastUpdate = performance.now();
    }
    updateFromState(state) {
        this.targetX = state.x;
        this.targetY = state.y;
        this.vx = state.vx;
        this.vy = state.vy;
        this.targetAngle = state.aimAngle;
        this.facingRight = state.facingRight;
        this.health = state.health;
        this.fuel = state.fuel;
        this.weapon = state.weapon;
        this.ammo = state.ammo;
        this.alive = state.isAlive;
        this.kills = state.kills;
        this.deaths = state.deaths;
        this.level = state.level;
        this.xp = state.xp;
        this.jetpacking = state.jetpacking;
        if (state.color) this.color = state.color;
        if (state.bodyColor) this.bodyColor = state.bodyColor;
        if (state.visorColor) this.visorColor = state.visorColor;
        this.lastUpdate = performance.now();
    }
    interpolate() {
        if (!this.alive) return;
        this.x += (this.targetX - this.x) * this.lerpSpeed;
        this.y += (this.targetY - this.y) * this.lerpSpeed;
        this.aimAngle += (this.targetAngle - this.aimAngle) * 0.3;
    }
}

class MultiplayerClient {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.connections = new Map(); // PeerID -> Conn
        this.playerId = null;
        this.roomCode = null;
        this.remotePlayers = new Map(); // id -> RemotePlayer
        this.isConnected = false;
        this.isHost = false;
        this.updateInterval = null;
        this.lobbyPlayers = [];
    }

    async initPeer() {
        return new Promise((resolve, reject) => {
            if (this.peer) return resolve();
            this.peer = new Peer();
            this.peer.on('open', (id) => {
                this.playerId = id;
                console.log('My peer ID is: ' + id);
                resolve();
            });
            this.peer.on('error', (err) => {
                console.error('PeerJS Error:', err);
                reject(err);
            });
        });
    }

    async createLobby(name) {
        await this.initPeer();
        this.isHost = true;
        this.roomCode = this.playerId; // Use full ID for reliability
        this.lobbyPlayers = [{
            id: this.playerId,
            name,
            isHost: true,
            color: ARMOR_COLORS[this.game.customization.armorIdx].hex,
            bodyColor: `hsl(${Math.random() * 360},50%,35%)`, // Standard logic from Entity constructor
            visorColor: VISOR_COLORS[this.game.customization.visorIdx].hex
        }];
        this.isConnected = true;

        // Listen for connections
        this.peer.on('connection', (conn) => {
            conn.on('open', () => {
                console.log('Connected to: ' + conn.peer);
                this.connections.set(conn.peer, conn);
                conn.on('data', (data) => this.handleMessage(data, conn.peer));
            });
            conn.on('close', () => {
                this.connections.delete(conn.peer);
                this.lobbyPlayers = this.lobbyPlayers.filter(p => p.id !== conn.peer);
                this.broadcast({ type: 'lobby_state', players: this.lobbyPlayers });
                this.updateLobbyUI({ players: this.lobbyPlayers });
            });
        });

        const codeDisplay = document.getElementById('display-room-code');
        if (codeDisplay) {
            codeDisplay.textContent = this.roomCode;
            codeDisplay.style.cursor = 'pointer';
            codeDisplay.title = 'Click to Copy';
            codeDisplay.onclick = () => {
                navigator.clipboard.writeText(this.roomCode);
                this.game.showAnnouncement('ID COPIED!', '#00e5ff');
            };
        }
        this.updateLobbyUI({ players: this.lobbyPlayers });
    }

    async joinLobby(code, name) {
        await this.initPeer();
        this.isHost = false;
        this.roomCode = code.trim();
        const targetPeerId = this.roomCode;

        const conn = this.peer.connect(targetPeerId);
        conn.on('open', () => {
            this.isConnected = true;
            this.connections.set(targetPeerId, conn);
            this.send('join_request', {
                name,
                color: ARMOR_COLORS[this.game.customization.armorIdx].hex,
                bodyColor: `hsl(${Math.random() * 360},50%,35%)`,
                visorColor: VISOR_COLORS[this.game.customization.visorIdx].hex
            });
            conn.on('data', (data) => this.handleMessage(data));
        });
        conn.on('close', () => {
            this.isConnected = false;
            this.game.showAnnouncement('HOST DISCONNECTED', '#ff0000');
            setTimeout(() => window.location.reload(), 3000);
        });
        conn.on('error', (err) => {
            alert("Lobby not found. Make sure the code is correct.");
        });
    }

    send(type, data) {
        const msg = JSON.stringify({ type, playerId: this.playerId, ...data });
        if (this.isHost) {
            // As host, we handle our own message
            this.handleMessage(JSON.parse(msg));
        } else {
            // As client, send to host
            this.connections.forEach(conn => conn.send(msg));
        }
    }

    broadcast(data) {
        if (!this.isHost) return;
        const msg = JSON.stringify(data);
        this.connections.forEach(conn => conn.send(msg));
    }

    handleMessage(msg, fromPeerId) {
        // Handle incoming JSON if it's a string
        if (typeof msg === 'string') msg = JSON.parse(msg);

        switch (msg.type) {
            case 'join_request':
                if (this.isHost) {
                    this.lobbyPlayers.push({
                        id: fromPeerId,
                        name: msg.name,
                        isHost: false,
                        color: msg.color,
                        bodyColor: msg.bodyColor,
                        visorColor: msg.visorColor
                    });
                    this.broadcast({ type: 'lobby_state', players: this.lobbyPlayers });
                    this.updateLobbyUI({ players: this.lobbyPlayers });
                }
                break;

            case 'lobby_state':
                this.lobbyPlayers = msg.players;
                this.updateLobbyUI(msg);
                break;

            case 'game_start':
                if (this.isHost) this.broadcast(msg);
                this.game.startMultiplayerMatch(msg.settings);
                break;

            case 'player_update':
                if (this.isHost) {
                    // Update state and relay
                    this.syncRemoteState(msg);
                } else {
                    this.syncPlayers(msg.players);
                }
                break;

            case 'player_action':
                if (this.isHost) {
                    // Host handles logic then broadcasts
                    this.handleHostAction(msg);
                } else {
                    this.handleRemoteAction(msg);
                }
                break;

            case 'remote_action':
                this.handleRemoteAction(msg);
                break;

            case 'game_state':
                this.syncPlayers(msg.players);
                break;
        }
    }

    // Host-specific logic moved from server.py
    syncRemoteState(msg) {
        const p = this.lobbyPlayers.find(pl => pl.id === msg.playerId);
        if (p) {
            p.state = msg.state;
            p.state.id = p.id;
            p.state.name = p.name;
        }

        // At 20Hz, broadcast all states
        if (!this.broadcastTimer) {
            this.broadcastTimer = setTimeout(() => {
                const states = this.lobbyPlayers.map(pl => {
                    if (pl.state) return pl.state;
                    // Fallback for players (like host) who haven't sent an update yet
                    return {
                        id: pl.id,
                        name: pl.name,
                        x: 0, y: 0,
                        color: pl.color || ARMOR_COLORS[this.game.customization.armorIdx].hex,
                        isAlive: false
                    };
                });
                this.broadcast({ type: 'game_state', players: states });
                this.broadcastTimer = null;
            }, 50);
        }
    }

    handleHostAction(msg) {
        const action = msg.action;
        const data = msg.data;
        const playerId = msg.playerId;

        if (action === 'hit') {
            this.broadcast({ type: 'remote_action', playerId, action: 'hit', data });
        } else if (action === 'request_respawn') {
            const spawnIdx = Math.floor(Math.random() * 10);
            this.broadcast({ type: 'remote_action', playerId, action: 'respawn', data: { spawnIdx } });
        } else {
            this.broadcast({ type: 'remote_action', playerId, action, data });
        }
    }

    updateLobbyUI(state) {
        const list = document.getElementById('player-list');
        if (!list) return;
        list.innerHTML = '';
        state.players.forEach(p => {
            const div = document.createElement('div');
            div.className = 'player-slot';
            div.innerHTML = `<span>${p.name}${p.id === this.playerId ? ' (You)' : ''}</span> ${p.isHost ? '<span style="color:#ffd700;font-size:0.7rem">HOST</span>' : ''}`;
            list.appendChild(div);
        });

        const startBtn = document.getElementById('btn-start-multiplayer');
        const waitMsg = document.getElementById('waiting-msg');
        if (this.isHost) {
            startBtn?.classList.remove('hidden');
            waitMsg?.classList.add('hidden');
        } else {
            startBtn?.classList.add('hidden');
            waitMsg?.classList.remove('hidden');
        }
    }

    syncPlayers(playerData) {
        playerData.forEach(pData => {
            if (pData.id === this.playerId) return;

            if (!this.remotePlayers.has(pData.id)) {
                const rp = new RemotePlayer(pData.id, pData.x, pData.y, pData.name, pData.color);
                this.remotePlayers.set(pData.id, rp);
                this.game.entities.push(rp);
            }
            const rp = this.remotePlayers.get(pData.id);
            rp.updateFromState(pData);
        });

        // Cleanup
        const currentIds = playerData.map(p => p.id);
        for (const [id, rp] of this.remotePlayers.entries()) {
            if (!currentIds.includes(id)) {
                this.game.entities = this.game.entities.filter(e => e !== rp);
                this.remotePlayers.delete(id);
            }
        }
    }

    handleRemoteAction(msg) {
        const isSelf = msg.playerId === this.playerId;
        const rp = this.remotePlayers.get(msg.playerId);
        const isSelfVictim = msg.action === 'hit' && msg.data.victimId === this.playerId;

        if (!rp && !isSelf && !isSelfVictim) return;

        switch (msg.action) {
            case 'shoot':
                if (!isSelf && rp) this.game.spawnRemoteBullets(rp, msg.data);
                break;
            case 'grenade':
                if (!isSelf && rp) this.game.spawnRemoteGrenade(rp, msg.data);
                break;
            case 'hit':
                if (isSelfVictim) {
                    const shooter = this.remotePlayers.get(msg.data.shooterId) || (msg.data.shooterId === this.playerId ? this.game.player : null);
                    this.game.player.takeDamage(msg.data.damage, shooter, this.game);
                } else if (!isSelf) {
                    const victim = this.remotePlayers.get(msg.data.victimId) || (msg.data.victimId === this.playerId ? this.game.player : null);
                    if (victim) {
                        this.game.particles.blood(victim.cx, victim.cy);
                        this.game.damageNumbers.push(new DamageNumber(victim.cx, victim.y - 5, msg.data.damage, false));
                    }
                }
                break;
            case 'respawn':
                const playerToRespawn = (msg.playerId === this.playerId) ? this.game.player : this.remotePlayers.get(msg.playerId);
                if (playerToRespawn) {
                    playerToRespawn.respawn(this.game.map.spawns, msg.data.spawnIdx);
                    if (msg.playerId === this.playerId) {
                        document.getElementById('respawn-overlay').classList.add('hidden');
                    }
                }
                break;
        }
    }

    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            if (!this.game.player) return;
            this.send('player_update', {
                state: {
                    x: this.game.player.x,
                    y: this.game.player.y,
                    vx: this.game.player.vx,
                    vy: this.game.player.vy,
                    aimAngle: this.game.player.aimAngle,
                    facingRight: this.game.player.facingRight,
                    health: this.game.player.health,
                    fuel: this.game.player.fuel,
                    weapon: this.game.player.weapon,
                    ammo: this.game.player.ammo,
                    isAlive: this.game.player.alive,
                    kills: this.game.player.kills,
                    deaths: this.game.player.deaths,
                    level: this.game.player.level,
                    xp: this.game.player.xp,
                    jetpacking: this.game.player.jetpacking,
                    color: this.game.player.color,
                    bodyColor: this.game.player.bodyColor,
                    visorColor: this.game.player.visorColor
                }
            });
        }, 50);
    }
}

// --- Gib (Ragdoll Body Part) ---
class Gib {
    constructor(x, y, vx, vy, type, color, bodyColor, skinColor) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.type = type; // 'head','helmet','torso','leg_l','leg_r','arm','boot'
        this.color = color;
        this.bodyColor = bodyColor;
        this.skinColor = skinColor || '#e8b89d';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.3;
        this.life = GIB_LIFETIME;
        this.maxLife = GIB_LIFETIME;
        this.dead = false;
        this.onGround = false;
        this.bounced = 0;
    }
    update(game) {
        if (this.dead) return;
        this.life -= 16;
        if (this.life <= 0) { this.dead = true; return; }
        // Physics
        this.vy += GRAVITY * 0.8;
        this.vx *= GIB_FRICTION;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;
        // Slow rotation when on ground
        if (this.onGround) {
            this.rotSpeed *= 0.9;
            this.vx *= 0.92;
        }
        // Platform collision
        this.onGround = false;
        for (const p of game.map.platforms) {
            const gw = 8, gh = 8;
            if (this.x + gw > p.x && this.x - gw < p.x + p.w &&
                this.y + gh > p.y && this.y - gh < p.y + p.h) {
                const overlapX = Math.min(this.x + gw - p.x, p.x + p.w - (this.x - gw));
                const overlapY = Math.min(this.y + gh - p.y, p.y + p.h - (this.y - gh));
                if (overlapY < overlapX) {
                    if (this.y < p.y + p.h / 2) {
                        this.y = p.y - gh;
                        this.vy = -Math.abs(this.vy) * GIB_BOUNCE_DAMP;
                        this.onGround = Math.abs(this.vy) < 1;
                        this.rotSpeed *= 0.7;
                    } else {
                        this.y = p.y + p.h + gh;
                        this.vy = Math.abs(this.vy) * GIB_BOUNCE_DAMP;
                    }
                    if (this.bounced < 3 && Math.abs(this.vy) > 0.5) {
                        game.audio.play('gib_bounce');
                        // Blood splat on bounce
                        game.particles.blood(this.x, this.y);
                    }
                    this.bounced++;
                } else {
                    if (this.x < p.x + p.w / 2) {
                        this.x = p.x - gw;
                        this.vx = -Math.abs(this.vx) * GIB_BOUNCE_DAMP;
                    } else {
                        this.x = p.x + p.w + gw;
                        this.vx = Math.abs(this.vx) * GIB_BOUNCE_DAMP;
                    }
                    this.rotSpeed = -this.rotSpeed * 0.5;
                }
            }
        }
        // Map floor
        if (this.y > game.map.h - 20) {
            this.y = game.map.h - 20;
            this.vy = -Math.abs(this.vy) * GIB_BOUNCE_DAMP;
            this.onGround = true;
        }
    }
    draw(ctx, cam) {
        const alpha = Math.max(0, Math.min(1, this.life / (this.maxLife * 0.3)));
        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.translate(this.x - cam.x, this.y - cam.y);
        ctx.rotate(this.rotation);
        switch (this.type) {
            case 'head':
                ctx.fillStyle = this.skinColor;
                ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
                // Eye
                ctx.fillStyle = '#fff';
                ctx.fillRect(1, -1, 2, 1.5);
                ctx.fillStyle = '#000';
                ctx.fillRect(2, -0.5, 1, 1);
                break;
            case 'helmet':
                ctx.fillStyle = this.color;
                ctx.beginPath(); ctx.arc(0, -1, 6, Math.PI, Math.PI * 2); ctx.fill();
                ctx.fillRect(-6, -2, 12, 3);
                ctx.fillStyle = 'rgba(0,230,255,0.4)';
                ctx.fillRect(-3, -1, 5, 2);
                break;
            case 'torso':
                ctx.fillStyle = this.color;
                ctx.fillRect(-8, -10, 16, 18);
                // Armor detail
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fillRect(-7, -6, 14, 1);
                ctx.fillRect(-7, -1, 14, 1);
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(-6, -10, 12, 3);
                break;
            case 'leg_l': case 'leg_r':
                ctx.fillStyle = this.bodyColor;
                ctx.fillRect(-2, -6, 5, 10);
                // Boot
                ctx.fillStyle = '#333';
                ctx.fillRect(-2, 3, 6, 4);
                break;
            case 'arm':
                ctx.fillStyle = this.bodyColor;
                ctx.fillRect(-2, -2, 12, 4);
                // Glove
                ctx.fillStyle = '#333';
                ctx.fillRect(8, -2, 3, 4);
                break;
            case 'weapon':
                ctx.fillStyle = this.color;
                ctx.fillRect(-6, -2, 12, 4);
                ctx.fillStyle = '#444';
                ctx.fillRect(4, -1, 4, 2);
                break;
        }
        ctx.restore();
    }
}

// --- Bullet ---
class Bullet {
    constructor(x, y, vx, vy, owner, weaponKey) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.owner = owner; this.weaponKey = weaponKey;
        this.w = WEAPONS[weaponKey].bulletW; this.h = WEAPONS[weaponKey].bulletH;
        this.damage = WEAPONS[weaponKey].damage;
        this.color = WEAPONS[weaponKey].color;
        this.explosive = WEAPONS[weaponKey].explosive;
        this.explodeRadius = WEAPONS[weaponKey].explodeRadius || 0;
        this.ricochetLeft = WEAPONS[weaponKey].ricochet || 0;
        this.life = 1500; this.dead = false;
        this.dist = 0; this.maxDist = 1200;
    }
    update(game) {
        const prevX = this.x, prevY = this.y;
        this.x += this.vx; this.y += this.vy;
        if (!this.explosive) this.vy += 0.03;
        this.dist += Math.sqrt((this.x - prevX) ** 2 + (this.y - prevY) ** 2);
        this.life -= 16;
        if (this.life <= 0 || this.dist > this.maxDist) { this.dead = true; return; }
        // Hit platforms
        for (const p of game.map.platforms) {
            if (this.x > p.x && this.x < p.x + p.w && this.y > p.y && this.y < p.y + p.h) {
                if (this.ricochetLeft > 0) {
                    // Ricochet: reflect off surface
                    this.ricochetLeft--;
                    const fromTop = this.y - p.y, fromBot = p.y + p.h - this.y;
                    const fromLeft = this.x - p.x, fromRight = p.x + p.w - this.x;
                    const minV = Math.min(fromTop, fromBot), minH = Math.min(fromLeft, fromRight);
                    if (minV < minH) { this.vy = -this.vy * 0.85; this.y = fromTop < fromBot ? p.y - 1 : p.y + p.h + 1; }
                    else { this.vx = -this.vx * 0.85; this.x = fromLeft < fromRight ? p.x - 1 : p.x + p.w + 1; }
                    this.damage *= 0.8; // lose energy
                    game.audio.play('ricochet');
                    game.particles.add(new Particle(this.x, this.y, (Math.random() - 0.5) * 2, -Math.random() * 2, 200, 2, '#fff'));
                } else {
                    this.dead = true;
                    if (this.explosive) this.explode(game);
                }
                return;
            }
        }
        // Hit entities
        for (const e of game.entities) {
            if (e === this.owner || !e.alive) continue;
            // Team check
            if (this.owner.team && e.team === this.owner.team) continue;
            if (this.x > e.x && this.x < e.x + e.w && this.y > e.y && this.y < e.y + e.h) {
                this.dead = true;
                if (this.explosive) { this.explode(game); }
                else {
                    const hitAng = Math.atan2(this.vy, this.vx);
                    // Headshot detection: top 30% of body
                    const isHeadshot = (this.y - e.y) < (e.h * HEADSHOT_ZONE);
                    let finalDmg = this.damage;
                    if (isHeadshot) {
                        finalDmg *= HEADSHOT_MULT;
                        game.audio.play('headshot');
                    } else {
                        game.audio.play('hit');
                    }

                    // Multiplayer: Only the shooter's client handles the hit authoritativeley
                    if (game.isMultiplayer) {
                        if (this.owner.isPlayer) {
                            // I hit someone (RemotePlayer or Bot)!
                            e.takeDamage(finalDmg, this.owner, game, hitAng);
                            game.multiplayer.send('player_action', {
                                action: 'hit',
                                data: { victimId: e.id, damage: finalDmg, shooterId: this.owner.id }
                            });
                        } else {
                            // I am seeing a remote bullet. Just show effects, don't apply damage.
                            game.particles.blood(e.cx, e.cy);
                        }
                    } else {
                        e.takeDamage(finalDmg, this.owner, game, hitAng);
                    }

                    // Knockback (even for remote bullets for visual feedback)
                    e.vx += Math.cos(hitAng) * this.damage * 0.05;
                    e.vy += Math.sin(hitAng) * this.damage * 0.05 - 0.5;
                    // Spawn damage number and hit marker
                    if (game.damageNumbers) {
                        game.damageNumbers.push(new DamageNumber(e.cx, e.y - 5, finalDmg, isHeadshot));
                        game.hitMarkers.push(new HitMarker(this.x, this.y, isHeadshot));
                    }
                    // Blood decal on nearest platform
                    if (game.bloodDecals) {
                        for (const p of game.map.platforms) {
                            if (e.x + e.w > p.x && e.x < p.x + p.w && e.y + e.h >= p.y - 5 && e.y + e.h <= p.y + 10) {
                                game.bloodDecals.push(new BloodDecal(e.cx + (Math.random() - 0.5) * 10, p.y, p));
                                break;
                            }
                        }
                    }
                    // Track headshot stat
                    if (isHeadshot && this.owner.isPlayer && game.matchStats) game.matchStats.headshots++;
                    // Track weapon-specific kills
                    if (!e.alive && this.owner.isPlayer && game.matchStats) {
                        if (this.weaponKey === 'sniper') game.matchStats.sniperKills++;
                        if (this.ricochetLeft < (WEAPONS[this.weaponKey].ricochet || 0)) game.matchStats.bounceKills++;
                    }
                }
                return;
            }
        }
    }
    explode(game) {
        game.audio.play('explode');
        game.particles.explosion(this.x, this.y, this.explodeRadius);
        game.screenShake = 12;
        for (const e of game.entities) {
            const dx = e.cx - this.x, dy = e.cy - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.explodeRadius && e.alive) {
                const dmg = this.damage * (1 - dist / this.explodeRadius);
                const hitAng = Math.atan2(dy, dx);
                e.takeDamage(dmg, this.owner, game, hitAng + Math.PI);
                const force = 7 * (1 - dist / this.explodeRadius);
                if (dist > 0) { e.vx += dx / dist * force; e.vy += dy / dist * force - 4; }
            }
        }
    }
    draw(ctx, cam) {
        ctx.save();
        ctx.translate(this.x - cam.x, this.y - cam.y);
        ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color; ctx.shadowBlur = 6;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}

// --- Grenade ---
class Grenade {
    constructor(x, y, vx, vy, owner) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.owner = owner;
        this.radius = 6; this.fuseTimer = GRENADE_FUSE;
        this.dead = false; this.bounces = 0;
        this.rotation = 0;
    }
    update(game) {
        this.x += this.vx; this.y += this.vy;
        this.vy += GRAVITY * 0.6;
        this.vx *= 0.99;
        this.rotation += this.vx * 0.1;
        this.fuseTimer -= 16;
        // Flash warning when about to explode
        if (this.fuseTimer <= 0) { this.explode(game); return; }
        // Platform collision with bounce
        for (const p of game.map.platforms) {
            if (this.x + this.radius > p.x && this.x - this.radius < p.x + p.w &&
                this.y + this.radius > p.y && this.y - this.radius < p.y + p.h) {
                const overlapX = Math.min(this.x + this.radius - p.x, p.x + p.w - (this.x - this.radius));
                const overlapY = Math.min(this.y + this.radius - p.y, p.y + p.h - (this.y - this.radius));
                if (overlapY < overlapX) {
                    if (this.y < p.y + p.h / 2) { this.y = p.y - this.radius; this.vy = -this.vy * 0.4; }
                    else { this.y = p.y + p.h + this.radius; this.vy = -this.vy * 0.4; }
                } else {
                    if (this.x < p.x + p.w / 2) { this.x = p.x - this.radius; this.vx = -this.vx * 0.4; }
                    else { this.x = p.x + p.w + this.radius; this.vx = -this.vx * 0.4; }
                }
                this.bounces++;
                if (this.bounces <= 3) game.audio.play('grenade_bounce');
                // Slow down on each bounce
                this.vx *= 0.7; this.vy *= 0.7;
                break;
            }
        }
    }
    explode(game) {
        this.dead = true;
        game.audio.play('explode');
        game.particles.explosion(this.x, this.y, GRENADE_RADIUS);
        game.screenShake = 22;
        game.flashAlpha = 0.4;
        // Shockwave ring effect
        game.shockwaves.push({ x: this.x, y: this.y, radius: 5, maxRadius: GRENADE_RADIUS * 1.5, speed: 6, alpha: 0.8 });
        for (const e of game.entities) {
            if (!e.alive) continue;
            const dx = e.cx - this.x, dy = e.cy - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < GRENADE_RADIUS) {
                const dmg = GRENADE_DAMAGE * (1 - dist / GRENADE_RADIUS);

                if (game.isMultiplayer) {
                    if (this.owner.isPlayer) {
                        e.takeDamage(dmg, this.owner, game);
                        game.multiplayer.send('player_action', {
                            action: 'hit',
                            data: { victimId: e.id, damage: dmg, shooterId: this.owner.id }
                        });
                    }
                } else {
                    e.takeDamage(dmg, this.owner, game);
                }

                const force = 10 * (1 - dist / GRENADE_RADIUS);
                if (dist > 0) { e.vx += dx / dist * force; e.vy += dy / dist * force - 6; }
            }
        }
    }
    draw(ctx, cam) {
        const sx = this.x - cam.x, sy = this.y - cam.y;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.rotation);
        // Grenade body
        const flashRate = this.fuseTimer < 800 ? 80 : this.fuseTimer < 1500 ? 200 : 500;
        const flashing = this.fuseTimer < 1500 && Math.sin(performance.now() / flashRate * Math.PI) > 0;
        ctx.fillStyle = flashing ? '#ff3333' : '#556b2f';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // Pin detail
        ctx.fillStyle = '#8b8b00';
        ctx.fillRect(-2, -this.radius - 3, 4, 4);
        // Glow when about to explode
        if (this.fuseTimer < 1000) {
            ctx.strokeStyle = `rgba(255,50,50,${0.5 + Math.sin(performance.now() / 60) * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }
}

// --- Bot AI ---
class BotAI {
    constructor(entity, difficulty) {
        this.entity = entity; this.diff = difficulty;
        this.targetEnemy = null; this.moveDir = 0;
        this.wantJet = false; this.wantShoot = false; this.wantGrenade = false;
        this.thinkTimer = 0; this.dodgeTimer = 0;
        this.pathTarget = null;
    }
    update(game, dt) {
        if (!this.entity.alive) return;
        this.thinkTimer -= dt;
        if (this.thinkTimer <= 0) {
            this.thinkTimer = this.diff.reactionTime + Math.random() * 200;
            this.think(game);
        }
        // Apply decisions
        const e = this.entity;
        if (this.moveDir !== 0) { e.vx += this.moveDir * MOVE_SPEED * 0.15; e.facingRight = this.moveDir > 0; }
        if (this.wantJet && e.fuel > 0) { e.vy += JETPACK_THRUST * 0.7; e.fuel -= FUEL_USE; e.jetpacking = true; }
        else { e.jetpacking = false; }
        if (this.targetEnemy && this.targetEnemy.alive) {
            const dx = this.targetEnemy.cx - e.cx, dy = this.targetEnemy.cy - e.cy;
            let targetAngle = Math.atan2(dy, dx);
            // Add inaccuracy
            targetAngle += (Math.random() - 0.5) * (1 - this.diff.aimAccuracy) * 0.8;
            e.aimAngle += (targetAngle - e.aimAngle) * 0.1;
            e.facingRight = dx > 0;
            if (this.wantShoot) this.tryShoot(game);
        }
        // Grenade throwing
        if (this.wantGrenade) this.tryThrowGrenade(game);
        // Auto reload for bots
        if (e.ammo <= 0 && e.weapon !== 'pistol' && !e.reloading) e.startReload(game);
        e.updateReload(dt, game);
    }
    think(game) {
        const e = this.entity;
        // Find nearest enemy
        let nearest = null, nearDist = Infinity;
        for (const other of game.entities) {
            if (other === e || !other.alive) continue;
            const d = Math.sqrt((other.cx - e.cx) ** 2 + (other.cy - e.cy) ** 2);
            if (d < nearDist) { nearDist = d; nearest = other; }
        }
        this.targetEnemy = nearest;
        // Movement decision
        if (nearest) {
            const dx = nearest.cx - e.cx;
            const optimalDist = 150 + Math.random() * 150;
            if (nearDist > optimalDist + 50) this.moveDir = Math.sign(dx);
            else if (nearDist < optimalDist - 50) this.moveDir = -Math.sign(dx);
            else this.moveDir = Math.random() > 0.5 ? 1 : -1;
            // Retreat if low health
            if (e.health < 30 && this.diff.movementSkill > 0.4) this.moveDir = -Math.sign(dx);
        } else {
            this.moveDir = Math.random() > 0.5 ? 1 : -1;
        }
        // Jetpack decision
        this.wantJet = false;
        if (e.y > game.map.h - 200 && e.fuel > 20) this.wantJet = true;
        if (nearest && nearest.cy < e.cy - 50 && e.fuel > 15) this.wantJet = Math.random() < this.diff.movementSkill;
        if (e.vy > 4 && e.fuel > 5) this.wantJet = true;
        if (Math.random() < 0.15 * this.diff.movementSkill) this.wantJet = true;
        // Shoot decision
        this.wantShoot = nearest && nearDist < 600 && Math.random() < this.diff.aggressiveness;
        // Grenade decision: throw when enemies are clustered or nearby
        this.wantGrenade = false;
        if (nearest && nearDist < 250 && nearDist > 60 && e.grenades > 0 && Math.random() < 0.03 * this.diff.aggressiveness) this.wantGrenade = true;
        // Weapon pickup
        if (e.weapon === 'pistol' || e.ammo <= 0) {
            let nearPickup = null, npd = Infinity;
            for (const pk of game.map.pickups) {
                if (pk.dead) continue;
                const d = Math.sqrt((pk.x - e.cx) ** 2 + (pk.y - e.cy) ** 2);
                if (d < npd) { npd = d; nearPickup = pk; }
            }
            if (nearPickup && npd < 200) {
                this.moveDir = Math.sign(nearPickup.x - e.cx);
                if (nearPickup.y < e.cy - 30) this.wantJet = true;
            }
        }
        // Dodge rockets
        for (const b of game.bullets) {
            if (b.owner === e || !b.explosive) continue;
            const dx = b.x - e.cx, dy = b.y - e.cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150 && this.diff.movementSkill > 0.5) {
                this.moveDir = dx > 0 ? -1 : 1;
                this.wantJet = true;
            }
        }
    }
    tryThrowGrenade(game) {
        const e = this.entity, now = performance.now();
        if (e.grenades <= 0 || now - e.lastGrenade < GRENADE_COOLDOWN) return;
        e.lastGrenade = now; e.grenades--;
        const ang = e.aimAngle + (Math.random() - 0.5) * 0.3;
        const spd = GRENADE_SPEED * (0.6 + Math.random() * 0.4);
        game.grenades.push(new Grenade(e.cx, e.cy - 5, Math.cos(ang) * spd, Math.sin(ang) * spd - 3, e));
        game.audio.play('grenade_throw');
    }
    tryShoot(game) {
        const e = this.entity, w = e.getWeapon(), now = performance.now();
        if (e.reloading) return;
        if (now - e.lastShot < w.fireRate) return;
        if (e.ammo <= 0) { e.startReload(game); return; }
        e.lastShot = now;
        if (e.ammo !== Infinity) e.ammo--;
        const gunX = e.cx + Math.cos(e.aimAngle) * 18;
        const gunY = e.cy + Math.sin(e.aimAngle) * 18;
        for (let i = 0; i < w.pellets; i++) {
            const a = e.aimAngle + (Math.random() - 0.5) * w.spread * 2;
            const bvx = Math.cos(a) * w.bulletSpeed;
            const bvy = Math.sin(a) * w.bulletSpeed;
            game.bullets.push(new Bullet(gunX, gunY, bvx, bvy, e, e.weapon));
        }
        game.audio.play('shoot_' + e.weapon);
        game.particles.muzzleFlash(gunX, gunY, e.aimAngle);
        game.particles.shellEject(e.cx, e.cy - 5, e.facingRight ? 1 : -1);
    }
}

// --- Camera ---
class Camera {
    constructor(canvasW, canvasH) {
        this.x = 0; this.y = 0; this.w = canvasW; this.h = canvasH;
        this.targetX = 0; this.targetY = 0;
        this.shakeX = 0; this.shakeY = 0;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
    }
    follow(entity, mapW, mapH) {
        this.zoom += (this.targetZoom - this.zoom) * 0.1;

        const vw = this.w / this.zoom;
        const vh = this.h / this.zoom;

        this.targetX = entity.cx - vw / 2;
        this.targetY = entity.cy - vh / 2;

        this.x += (this.targetX - this.x) * 0.08;
        this.y += (this.targetY - this.y) * 0.08;

        // Constraint boundaries based on visible world size
        this.x = Math.max(0, Math.min(this.x, mapW - vw));
        this.y = Math.max(0, Math.min(this.y, mapH - vh));
    }
    applyShake(intensity) {
        this.shakeX = (Math.random() - 0.5) * intensity;
        this.shakeY = (Math.random() - 0.5) * intensity;
        this.x += this.shakeX; this.y += this.shakeY;
    }
}

// --- Main Game ---
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.audio = new AudioEngine();
        this.particles = new ParticleSystem();
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.entities = []; this.bullets = []; this.bots = []; this.grenades = []; this.gibs = [];
        this.damageNumbers = []; this.hitMarkers = []; this.bloodDecals = [];
        this.shockwaves = []; this.flashAlpha = 0;
        this.player = null; this.map = null;
        this.keys = {}; this.mouse = { x: 0, y: 0, down: false };
        this.screenShake = 0; this.running = false;
        this.killFeedEntries = []; this.gameOver = false;
        this.levelUpDisplay = null;

        // Time scale (for slowmo kill cam)
        this.timeScale = 1; this.slowmoTimer = 0;

        // Match stats for challenges/medals
        this.matchStats = { headshots: 0, grenadeKills: 0, sniperKills: 0, bounceKills: 0, maxStreak: 0, firstBlood: false, quickKills: 0, quickKillTimer: 0 };

        // Active challenges (3 per match)
        this.activeChallenges = [];

        // Session medals earned this match
        this.earnedMedals = [];

        // Prestige (persistent via localStorage)
        this.prestige = parseInt(localStorage.getItem('wario_prestige') || '0');
        this.allMedals = JSON.parse(localStorage.getItem('wario_medals') || '[]');

        // Customization
        this.customization = {
            armorIdx: 0, visorIdx: 0, skinIdx: 0,
            ...(JSON.parse(localStorage.getItem('wario_custom') || '{}'))
        };

        // Settings
        this.settings = { botCount: 7, difficulty: 'Medium', killTarget: 20, sound: true, map: 0, gameMode: 0 };

        // Battle Royale zone
        this.brZone = null;

        this.multiplayer = new MultiplayerClient(this);
        this.isMultiplayer = false;

        this.setupInput();
        this.setupMenus();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.camera) { this.camera.w = this.canvas.width; this.camera.h = this.canvas.height; }
    }

    setupInput() {
        window.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'e' && this.running) this.tryPickup();
            if (e.key.toLowerCase() === 'g' && this.running) this.playerThrowGrenade();
            if (e.key.toLowerCase() === 'r' && this.running) this.playerManualReload();
            // Zoom controls
            if ((e.key === '=' || e.key === '+') && this.running) this.camera.targetZoom = Math.min(2.5, this.camera.targetZoom + 0.1);
            if ((e.key === '-' || e.key === '_') && this.running) this.camera.targetZoom = Math.max(0.5, this.camera.targetZoom - 0.1);
            if (e.key.toLowerCase() === '0' && this.running) this.camera.targetZoom = 1.0;
        });
        window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX; this.mouse.y = e.clientY;
            const ch = document.getElementById('crosshair');
            if (ch) { ch.style.left = e.clientX + 'px'; ch.style.top = e.clientY + 'px'; }
        });
        window.addEventListener('mousedown', e => {
            if (e.button === 0) { this.mouse.down = true; }
            if (e.button === 2 && this.running) { this.playerThrowGrenade(); }
            this.audio.resume();
        });
        window.addEventListener('mouseup', e => { if (e.button === 0) this.mouse.down = false; });
        window.addEventListener('wheel', e => {
            if (!this.running) return;
            if (e.deltaY < 0) this.camera.targetZoom = Math.min(2.5, this.camera.targetZoom + 0.1);
            else this.camera.targetZoom = Math.max(0.5, this.camera.targetZoom - 0.1);
        });
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    setupMenus() {
        document.getElementById('btn-play').onclick = () => this.startGame();
        document.getElementById('btn-settings').onclick = () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('settings-panel').classList.remove('hidden');
        };
        document.getElementById('btn-back-settings').onclick = () => {
            document.getElementById('settings-panel').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        };
        document.getElementById('btn-customize').onclick = () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('customize-panel').classList.remove('hidden');
            this.updateCustomizeUI();
        };
        document.getElementById('btn-back-customize').onclick = () => {
            document.getElementById('customize-panel').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
            localStorage.setItem('wario_custom', JSON.stringify(this.customization));
        };
        document.getElementById('btn-play-again').onclick = () => this.startGame();
        document.getElementById('btn-main-menu').onclick = () => {
            document.getElementById('game-over-screen').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        };
        // Settings controls
        document.querySelectorAll('.setting-minus,.setting-plus').forEach(btn => {
            btn.onclick = () => {
                const s = btn.dataset.setting;
                const inc = btn.classList.contains('setting-plus') ? 1 : -1;
                if (s === 'botCount') { this.settings.botCount = Math.max(1, Math.min(12, this.settings.botCount + inc)); }
                if (s === 'difficulty') { let i = DIFF_NAMES.indexOf(this.settings.difficulty) + inc; i = Math.max(0, Math.min(DIFF_NAMES.length - 1, i)); this.settings.difficulty = DIFF_NAMES[i]; }
                if (s === 'killTarget') { this.settings.killTarget = Math.max(5, Math.min(50, this.settings.killTarget + inc * 5)); }
                if (s === 'sound') { this.settings.sound = !this.settings.sound; this.audio.enabled = this.settings.sound; }
                if (s === 'map') { this.settings.map = (this.settings.map + inc + MAP_NAMES.length) % MAP_NAMES.length; }
                if (s === 'gameMode') { this.settings.gameMode = (this.settings.gameMode + inc + GAME_MODES.length) % GAME_MODES.length; }
                if (s === 'armorColor') { this.customization.armorIdx = (this.customization.armorIdx + inc + ARMOR_COLORS.length) % ARMOR_COLORS.length; this.updateCustomizeUI(); }
                if (s === 'visorColor') { this.customization.visorIdx = (this.customization.visorIdx + inc + VISOR_COLORS.length) % VISOR_COLORS.length; this.updateCustomizeUI(); }
                if (s === 'weaponSkin') { this.customization.skinIdx = (this.customization.skinIdx + inc + WEAPON_SKINS.length) % WEAPON_SKINS.length; this.updateCustomizeUI(); }
                this.updateSettingsUI();
            };
        });
        this.updateSettingsUI();

        // Multiplayer Menus
        document.getElementById('btn-multiplayer').onclick = () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('multiplayer-lobby').classList.remove('hidden');
            document.getElementById('lobby-selection').classList.remove('hidden');
            document.getElementById('lobby-waiting').classList.add('hidden');
        };

        document.getElementById('btn-create-lobby').onclick = async () => {
            const name = prompt("Enter your name:", "Soldier") || "Soldier";
            await this.multiplayer.createLobby(name);
            document.getElementById('lobby-selection').classList.add('hidden');
            document.getElementById('lobby-waiting').classList.remove('hidden');
            this.isMultiplayer = true;
        };

        document.getElementById('btn-join-lobby').onclick = async () => {
            const code = document.getElementById('lobby-code-input').value;
            if (!code) return alert("Enter a room ID!");
            const name = prompt("Enter your name:", "Soldier") || "Soldier";
            await this.multiplayer.joinLobby(code, name);
            document.getElementById('lobby-selection').classList.add('hidden');
            document.getElementById('lobby-waiting').classList.remove('hidden');
            this.isMultiplayer = true;
        };

        document.getElementById('btn-start-multiplayer').onclick = () => {
            this.multiplayer.send('game_start', { settings: this.settings });
        };

        document.getElementById('btn-back-lobby').onclick = () => {
            document.getElementById('multiplayer-lobby').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
            // TODO: Disconnect
        };
    }

    startMultiplayerMatch(settings) {
        this.settings = { ...this.settings, ...settings };
        this.startGame(true);
        this.multiplayer.startUpdateLoop();
    }

    updateCustomizeUI() {
        const a = ARMOR_COLORS[this.customization.armorIdx];
        const v = VISOR_COLORS[this.customization.visorIdx];
        const acEl = document.getElementById('setting-armorColor');
        if (acEl) { acEl.textContent = a.name; acEl.style.color = a.hex; }
        const vcEl = document.getElementById('setting-visorColor');
        if (vcEl) vcEl.textContent = v.name;
        const wsEl = document.getElementById('setting-weaponSkin');
        if (wsEl) wsEl.textContent = WEAPON_SKINS[this.customization.skinIdx];
        const pdEl = document.getElementById('prestige-display');
        if (pdEl) pdEl.textContent = this.prestige > 0 ? '⭐'.repeat(this.prestige) : '☆ 0';
        const md = document.getElementById('medals-display');
        if (md) md.textContent = this.allMedals.map(m => MEDAL_DEFS[m]?.icon || '').join(' ');
    }

    updateSettingsUI() {
        if (!document.getElementById('setting-botCount')) return;
        document.getElementById('setting-botCount').textContent = this.settings.botCount;
        document.getElementById('setting-difficulty').textContent = this.settings.difficulty;
        document.getElementById('setting-killTarget').textContent = this.settings.killTarget;
        document.getElementById('setting-sound').textContent = this.settings.sound ? 'ON' : 'OFF';
        document.getElementById('setting-map').textContent = MAP_NAMES[this.settings.map];
        const gmEl = document.getElementById('setting-gameMode');
        if (gmEl) gmEl.textContent = GAME_MODES[this.settings.gameMode];
    }

    startGame(isMultiplayer = false) {
        this.isMultiplayer = isMultiplayer;
        this.audio.resume();
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('settings-panel').classList.add('hidden');
        document.getElementById('customize-panel')?.classList.add('hidden');
        document.getElementById('multiplayer-lobby')?.classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('target-count').textContent = this.settings.killTarget;
        const modeName = GAME_MODES[this.settings.gameMode];
        const modeLabel = document.getElementById('hud-mode-label');
        if (modeLabel) modeLabel.textContent = modeName.toUpperCase();

        // Init map
        const mapW = 2000, mapH = 800;
        this.map = generateMap(this.settings.map, mapW, mapH);
        this.entities = []; this.bullets = []; this.bots = []; this.grenades = []; this.gibs = [];
        this.damageNumbers = []; this.hitMarkers = []; this.bloodDecals = [];
        this.shockwaves = []; this.flashAlpha = 0;
        this.particles = new ParticleSystem();
        this.killFeedEntries = []; this.gameOver = false;
        this.screenShake = 0; this.levelUpDisplay = null;
        this.timeScale = 1; this.slowmoTimer = 0;
        this.matchStats = { headshots: 0, grenadeKills: 0, sniperKills: 0, bounceKills: 0, maxStreak: 0, firstBlood: false, quickKills: 0, quickKillTimer: 0 };
        this.earnedMedals = [];
        this.brZone = null;

        // Challenges (3 random)
        const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5);
        this.activeChallenges = shuffled.slice(0, 3).map(c => ({ ...c, progress: 0, completed: false }));

        // Create player with customization
        const sp = this.map.spawns[0];
        this.player = new Entity(sp.x, sp.y, 'You', true, ARMOR_COLORS[this.customization.armorIdx].hex);
        this.player.bodyColor = '#1a237e';
        this.player.visorColor = VISOR_COLORS[this.customization.visorIdx].hex;
        this.player.weaponSkin = WEAPON_SKINS[this.customization.skinIdx];
        this.entities.push(this.player);

        if (this.isMultiplayer) {
            // In MP, we add existing remote players
            for (const rp of this.multiplayer.remotePlayers.values()) {
                this.entities.push(rp);
            }
        } else {
            // Game mode bot count
            let botCount = this.settings.botCount;
            if (modeName === '1v1 Duel') botCount = 1;

            // Create bots
            const usedNames = [...BOT_NAMES].sort(() => Math.random() - 0.5);
            const diff = DIFFICULTY_PRESETS[this.settings.difficulty];
            for (let i = 0; i < botCount; i++) {
                const bsp = this.map.spawns[(i + 1) % this.map.spawns.length];
                const bot = new Entity(bsp.x, bsp.y, usedNames[i % usedNames.length], false);
                this.entities.push(bot);
                const bd = { ...diff };
                bd.aimAccuracy = Math.max(0.1, bd.aimAccuracy + (Math.random() - 0.5) * 0.15);
                bd.reactionTime = Math.max(80, bd.reactionTime + (Math.random() - 0.5) * 200);
                this.bots.push(new BotAI(bot, bd));
            }
        }

        // Team Deathmatch
        if (modeName === 'Team Deathmatch') {
            this.player.team = 'blue'; this.player.color = '#42a5f5';
            if (!this.isMultiplayer) {
                this.entities.forEach((e, i) => { if (!e.isPlayer) { e.team = i % 2 === 0 ? 'blue' : 'red'; e.color = e.team === 'blue' ? '#42a5f5' : '#ef5350'; } });
            }
        }
        // Battle Royale
        if (modeName === 'Battle Royale') {
            this.brZone = { x: mapW / 2, y: mapH / 2, radius: Math.max(mapW, mapH), shrinkRate: 0.08, minRadius: 80, damage: 0.3 };
        }
        // 1v1 harder bot
        if (!this.isMultiplayer && modeName === '1v1 Duel' && this.bots.length > 0) {
            this.bots[0].config.aimAccuracy = Math.min(0.9, diff.aimAccuracy + 0.15);
            this.bots[0].config.reactionTime = Math.max(100, diff.reactionTime - 100);
        }

        this.running = true;
        if (!this._loopStarted) { this._loopStarted = true; this.gameLoop(); }
    }

    gameLoop() {
        if (!this.running) { requestAnimationFrame(() => this.gameLoop()); return; }
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        const now = performance.now();
        // Player controls
        if (this.player.alive) {
            if (this.keys['a']) { this.player.vx -= MOVE_SPEED * 0.2; this.player.facingRight = false; }
            if (this.keys['d']) { this.player.vx += MOVE_SPEED * 0.2; this.player.facingRight = true; }
            if (this.keys['w'] && this.player.fuel > 0) {
                this.player.vy += JETPACK_THRUST;
                this.player.fuel -= FUEL_USE;
                this.player.jetpacking = true;
                this.particles.jetpackTrail(this.player.cx, this.player.y + this.player.h);
                if (Math.random() < 0.15) this.audio.play('jetpack');
            } else { this.player.jetpacking = false; }
            if (this.keys['s']) { this.player.vy += 0.5; }
            // Aim at mouse
            const worldMX = this.mouse.x / this.camera.zoom + this.camera.x;
            const worldMY = this.mouse.y / this.camera.zoom + this.camera.y;
            this.player.aimAngle = Math.atan2(worldMY - this.player.cy, worldMX - this.player.cx);
            this.player.facingRight = Math.cos(this.player.aimAngle) > 0;
            // Shoot
            if (this.mouse.down && !this.player.reloading) this.playerShoot();
            // Auto reload when out of ammo
            if (this.player.ammo <= 0 && this.player.weapon !== 'pistol' && !this.player.reloading) this.player.startReload(this);
            // Update reload timer
            this.player.updateReload(16, this);
        } else {
            this.player.respawnTimer -= 16;
            document.getElementById('respawn-overlay').classList.remove('hidden');
            const seconds = Math.ceil(this.player.respawnTimer / 1000);
            document.getElementById('respawn-timer').textContent = seconds > 100 ? "WAITING..." : seconds;
            if (this.player.respawnTimer <= 0) {
                if (this.isMultiplayer) {
                    this.multiplayer.send('player_action', { action: 'request_respawn' });
                    this.player.respawnTimer = 999999; // Wait for server signal
                } else {
                    this.player.respawn(this.map.spawns);
                    document.getElementById('respawn-overlay').classList.add('hidden');
                }
            }
        }

        // Update all entities physics
        for (const e of this.entities) {
            if (!e.alive) {
                if (!e.isPlayer && !this.isMultiplayer) {
                    e.respawnTimer -= 16;
                    if (e.respawnTimer <= 0) e.respawn(this.map.spawns);
                }
                continue;
            }

            // Multiplayer: Remote players handle their own state via interpolation
            if (e instanceof RemotePlayer) {
                e.interpolate();
                // We still want to handle walk animations for remote players
                if (Math.abs(e.vx) > 0.5) { e.walkTimer += 16; if (e.walkTimer > 150) { e.walkFrame = (e.walkFrame + 1) % 4; e.walkTimer = 0; } }
                else e.walkFrame = 0;
                continue;
            }

            // Gravity
            e.vy += GRAVITY;
            // Clamp speeds
            e.vy = Math.max(-MAX_FLY_SPEED, Math.min(MAX_FALL_SPEED, e.vy));
            e.vx = Math.max(-8, Math.min(8, e.vx));
            // Apply velocity
            e.x += e.vx; e.y += e.vy;
            // Friction
            e.vx *= e.onGround ? GROUND_FRICTION : AIR_FRICTION;
            // Fuel regen on ground
            if (e.onGround && !e.jetpacking) e.fuel = Math.min(MAX_FUEL, e.fuel + FUEL_REGEN * 3);
            else if (!e.jetpacking) e.fuel = Math.min(MAX_FUEL, e.fuel + FUEL_REGEN);
            // Invulnerability timer
            if (e.invulnTime > 0) e.invulnTime -= 16;
            // Walk animation
            if (e.onGround && Math.abs(e.vx) > 0.5) { e.walkTimer += 16; if (e.walkTimer > 150) { e.walkFrame = (e.walkFrame + 1) % 4; e.walkTimer = 0; } }
            else e.walkFrame = 0;
            // Platform collision
            e.onGround = false;
            for (const p of this.map.platforms) {
                if (e.x + e.w > p.x && e.x < p.x + p.w && e.y + e.h > p.y && e.y < p.y + p.h) {
                    // Resolve collision
                    const overlapX = Math.min(e.x + e.w - p.x, p.x + p.w - e.x);
                    const overlapY = Math.min(e.y + e.h - p.y, p.y + p.h - e.y);
                    if (overlapY < overlapX) {
                        if (e.y + e.h / 2 < p.y + p.h / 2) { e.y = p.y - e.h; e.vy = Math.min(0, e.vy); e.onGround = true; }
                        else { e.y = p.y + p.h; e.vy = Math.max(0, e.vy); }
                    } else {
                        if (e.x + e.w / 2 < p.x + p.w / 2) { e.x = p.x - e.w; e.vx = 0; }
                        else { e.x = p.x + p.w; e.vx = 0; }
                    }
                }
            }
            // Map bounds
            e.x = Math.max(20, Math.min(this.map.w - 20 - e.w, e.x));
            e.y = Math.max(20, Math.min(this.map.h - 40 - e.h, e.y));
        }

        // Bot AI
        for (const bot of this.bots) bot.update(this, 16);

        // Bullets
        for (const b of this.bullets) b.update(this);
        this.bullets = this.bullets.filter(b => !b.dead);

        // Grenades
        for (const g of this.grenades) g.update(this);
        this.grenades = this.grenades.filter(g => !g.dead);

        // Gibs (ragdoll body parts)
        for (const gib of this.gibs) gib.update(this);
        this.gibs = this.gibs.filter(g => !g.dead);

        // Weapon pickups
        for (const pk of this.map.pickups) {
            if (pk.dead) {
                if (now - pk.deathTime > pk.respawnTime) pk.dead = false;
                continue;
            }
            for (const e of this.entities) {
                if (!e.alive) continue;
                const dist = Math.sqrt((pk.x - e.cx) ** 2 + (pk.y - e.cy) ** 2);
                if (dist < PICKUP_RANGE) {
                    if (e.isPlayer) {
                        document.getElementById('pickup-prompt').classList.remove('hidden');
                        document.getElementById('pickup-weapon-name').textContent = pk.weapon === 'shield' ? 'SHIELD' : WEAPONS[pk.weapon].name;
                    } else if (!e.isPlayer) {
                        if (pk.weapon === 'shield') {
                            if (e.shield < e.maxShield) { e.shield = SHIELD_MAX; pk.dead = true; pk.deathTime = now; }
                        } else if (e.weapon === 'pistol' || e.ammo <= 0) {
                            e.equipWeapon(pk.weapon);
                            pk.dead = true; pk.deathTime = now;
                            this.audio.play('pickup');
                        }
                    }
                }
            }
        }
        // Hide pickup prompt if not near any
        if (this.player.alive) {
            let nearPickup = false;
            for (const pk of this.map.pickups) {
                if (pk.dead) continue;
                if (Math.sqrt((pk.x - this.player.cx) ** 2 + (pk.y - this.player.cy) ** 2) < PICKUP_RANGE) { nearPickup = true; break; }
            }
            if (!nearPickup) document.getElementById('pickup-prompt').classList.add('hidden');
        }

        // Particles
        this.particles.update();

        // Damage numbers, hit markers, blood decals
        for (const dn of this.damageNumbers) dn.update();
        this.damageNumbers = this.damageNumbers.filter(d => !d.dead);
        for (const hm of this.hitMarkers) hm.update();
        this.hitMarkers = this.hitMarkers.filter(h => !h.dead);
        for (const bd of this.bloodDecals) bd.update();
        if (this.bloodDecals.length > 100) this.bloodDecals = this.bloodDecals.slice(-80);
        this.bloodDecals = this.bloodDecals.filter(b => !b.dead);

        // Shield regen for all entities
        const now2 = performance.now();
        for (const e of this.entities) {
            if (!e.alive) continue;
            if (e.shield < e.maxShield && now2 - e.lastDamageTime > SHIELD_REGEN_DELAY) {
                e.shield = Math.min(e.maxShield, e.shield + SHIELD_REGEN_RATE);
            }
        }

        // Battle Royale zone
        if (this.brZone) {
            if (this.brZone.radius > this.brZone.minRadius) {
                this.brZone.radius -= this.brZone.shrinkRate;
            }
            // Damage entities outside zone
            for (const e of this.entities) {
                if (!e.alive) continue;
                const dx = e.cx - this.brZone.x, dy = e.cy - this.brZone.y;
                if (Math.sqrt(dx * dx + dy * dy) > this.brZone.radius) {
                    e.health -= this.brZone.damage;
                    if (e.health <= 0) e.die(null, this);
                }
            }
            // Show warning for player
            const brWarn = document.getElementById('br-zone-warning');
            if (brWarn) {
                const pdx = this.player.cx - this.brZone.x, pdy = this.player.cy - this.brZone.y;
                brWarn.classList.toggle('hidden', Math.sqrt(pdx * pdx + pdy * pdy) <= this.brZone.radius || !this.player.alive);
            }
        }

        // Slowmo timer
        if (this.slowmoTimer > 0) {
            this.slowmoTimer -= 16;
            if (this.slowmoTimer <= 0) { this.timeScale = 1; this.slowmoTimer = 0; }
        }

        // Shockwaves
        this.shockwaves.forEach(s => { s.radius += s.speed; s.alpha *= 0.92; });
        this.shockwaves = this.shockwaves.filter(s => s.alpha > 0.02 && s.radius < s.maxRadius);

        // Flash fade
        if (this.flashAlpha > 0) this.flashAlpha *= 0.88;

        // Camera
        if (this.player.alive) this.camera.follow(this.player, this.map.w, this.map.h);
        if (this.screenShake > 0) { this.camera.applyShake(this.screenShake); this.screenShake *= 0.85; if (this.screenShake < 0.5) this.screenShake = 0; }

        // Level up display timer
        if (this.levelUpDisplay && performance.now() - this.levelUpDisplay.time > 3000) this.levelUpDisplay = null;

        // Challenge HUD update
        this.updateChallengeHUD();

        // Update HUD
        this.updateHUD();
    }

    playerThrowGrenade() {
        const p = this.player, now = performance.now();
        if (!p.alive || p.grenades <= 0 || now - p.lastGrenade < GRENADE_COOLDOWN) return;
        p.lastGrenade = now; p.grenades--;
        const spd = GRENADE_SPEED;
        const g = new Grenade(p.cx, p.cy - 5, Math.cos(p.aimAngle) * spd, Math.sin(p.aimAngle) * spd - 3, p);
        this.grenades.push(g);
        this.audio.play('grenade_throw');

        if (this.isMultiplayer) {
            this.multiplayer.send('player_action', {
                action: 'grenade',
                data: { vx: g.vx, vy: g.vy }
            });
        }
    }

    playerManualReload() {
        const p = this.player;
        if (!p.alive || p.weapon === 'pistol' || p.reloading) return;
        if (p.ammo >= p.maxAmmo) return;
        p.startReload(this);
    }

    playerShoot() {
        const p = this.player, w = p.getWeapon(), now = performance.now();
        if (p.reloading) return;
        if (now - p.lastShot < w.fireRate) return;
        if (p.ammo <= 0) { p.startReload(this); return; }
        if (!w.auto && now - p.lastShot < w.fireRate + 50 && p.lastShot > 0) return;
        p.lastShot = now;
        if (p.ammo !== Infinity) p.ammo--;
        const gunX = p.cx + Math.cos(p.aimAngle) * 20;
        const gunY = p.cy + Math.sin(p.aimAngle) * 20;
        for (let i = 0; i < w.pellets; i++) {
            const a = p.aimAngle + (Math.random() - 0.5) * w.spread * 2;
            this.bullets.push(new Bullet(gunX, gunY, Math.cos(a) * w.bulletSpeed, Math.sin(a) * w.bulletSpeed, p, p.weapon));
        }
        // Recoil
        p.vx -= Math.cos(p.aimAngle) * w.recoil * 0.3;
        p.vy -= Math.sin(p.aimAngle) * w.recoil * 0.3;
        // Akimbo: fire second bullet offset
        if (p.akimbo && p.weapon === 'pistol') {
            const g2X = p.cx + Math.cos(p.aimAngle + 0.15) * 20;
            const g2Y = p.cy + Math.sin(p.aimAngle + 0.15) * 20 - 6;
            const a2 = p.aimAngle + (Math.random() - 0.5) * w.spread * 2;
            this.bullets.push(new Bullet(g2X, g2Y, Math.cos(a2) * w.bulletSpeed, Math.sin(a2) * w.bulletSpeed, p, p.weapon));
            this.particles.muzzleFlash(g2X, g2Y, p.aimAngle);
        }
        this.audio.play('shoot_' + p.weapon);
        this.particles.muzzleFlash(gunX, gunY, p.aimAngle);
        this.particles.shellEject(p.cx, p.cy - 5, p.facingRight ? 1 : -1);
        this.screenShake = Math.min(this.screenShake + w.recoil * 0.5, 8);

        if (this.isMultiplayer) {
            this.multiplayer.send('player_action', {
                action: 'shoot',
                data: { angle: p.aimAngle, weapon: p.weapon }
            });
        }
    }

    spawnRemoteBullets(rp, data) {
        const w = WEAPONS[data.weapon];
        const gunX = rp.cx + Math.cos(data.angle) * 20;
        const gunY = rp.cy + Math.sin(data.angle) * 20;
        for (let i = 0; i < w.pellets; i++) {
            const a = data.angle + (Math.random() - 0.5) * w.spread * 2;
            this.bullets.push(new Bullet(gunX, gunY, Math.cos(a) * w.bulletSpeed, Math.sin(a) * w.bulletSpeed, rp, data.weapon));
        }
        this.audio.play('shoot_' + data.weapon);
        this.particles.muzzleFlash(gunX, gunY, data.angle);
        this.particles.shellEject(rp.cx, rp.cy - 5, rp.facingRight ? 1 : -1);
    }

    spawnRemoteGrenade(rp, data) {
        this.grenades.push(new Grenade(rp.cx, rp.cy - 5, data.vx, data.vy, rp));
        this.audio.play('grenade_throw');
    }

    tryPickup() {
        for (const pk of this.map.pickups) {
            if (pk.dead) continue;
            const dist = Math.sqrt((pk.x - this.player.cx) ** 2 + (pk.y - this.player.cy) ** 2);
            if (dist < PICKUP_RANGE) {
                if (pk.weapon === 'shield') {
                    this.player.shield = SHIELD_MAX;
                } else {
                    this.player.equipWeapon(pk.weapon);
                }
                pk.dead = true; pk.deathTime = performance.now();
                this.audio.play('pickup');
                document.getElementById('pickup-prompt').classList.add('hidden');
                break;
            }
        }
    }

    addKillFeed(killer, victim, weapon) {
        const div = document.createElement('div');
        div.className = 'kill-feed-entry';
        div.innerHTML = `<span class="killer">${killer}</span><span class="weapon-icon">⚔</span><span class="victim">${victim}</span>`;
        document.getElementById('kill-feed').appendChild(div);
        setTimeout(() => div.remove(), 4000);

        // Player-specific tracking
        if (killer === 'You') {
            // First blood
            if (!this.matchStats.firstBlood) { this.matchStats.firstBlood = true; this.showAnnouncement('FIRST BLOOD', '#ff5722'); }
            // Kill streak
            this.player.streak++;
            this.player.maxStreak = Math.max(this.player.maxStreak, this.player.streak);
            this.matchStats.maxStreak = Math.max(this.matchStats.maxStreak, this.player.streak);
            const streakEl = document.getElementById('hud-streak');
            if (streakEl) {
                streakEl.style.display = this.player.streak >= 2 ? 'block' : 'none';
                document.getElementById('streak-text').textContent = '🔥 STREAK: ' + this.player.streak;
            }
            // Streak rewards
            if (STREAK_REWARDS[this.player.streak]) {
                this.triggerStreakReward(this.player.streak);
            }
            // Streak announcer
            const sKey = 'streak' + this.player.streak;
            if (ANNOUNCER_MSGS[sKey]) this.showAnnouncement(ANNOUNCER_MSGS[sKey], ANNOUNCER_COLORS[ANNOUNCER_MSGS[sKey]] || '#ffd700');
            // Multi-kill
            this.player.multiKillCount++;
            clearTimeout(this._multiKillTimeout);
            this._multiKillTimeout = setTimeout(() => { this.player.multiKillCount = 0; }, 4000);
            if (this.player.multiKillCount >= 2 && ANNOUNCER_MSGS[this.player.multiKillCount]) {
                this.showAnnouncement(ANNOUNCER_MSGS[this.player.multiKillCount], ANNOUNCER_COLORS[ANNOUNCER_MSGS[this.player.multiKillCount]] || '#ffd700');
                this.audio.play('streak');
            }
            // Quick kills tracking
            this.matchStats.quickKills++;
            clearTimeout(this._quickKillTimeout);
            this._quickKillTimeout = setTimeout(() => { this.matchStats.quickKills = 0; }, 60000);
            // Slowmo on final kill
            if (this.player.kills >= this.settings.killTarget) {
                this.timeScale = 0.3; this.slowmoTimer = 1500;
            }
        }
    }

    spawnGibs(entity, hitAngle, force, explosive) {
        const cx = entity.cx, cy = entity.cy;
        const baseVX = Math.cos(hitAngle) * force;
        const baseVY = Math.sin(hitAngle) * force;
        const spread = explosive ? 2.5 : 1.2;
        const wc = WEAPONS[entity.weapon] ? WEAPONS[entity.weapon].color : '#888';
        const gibDefs = [
            { type: 'head', ox: 0, oy: -14, vxm: 0.6, vym: -1.8 },
            { type: 'helmet', ox: 0, oy: -18, vxm: 0.8, vym: -2.2 },
            { type: 'torso', ox: 0, oy: -2, vxm: 0.3, vym: -0.5 },
            { type: 'leg_l', ox: -4, oy: 12, vxm: -0.4, vym: 0.3 },
            { type: 'leg_r', ox: 4, oy: 12, vxm: 0.5, vym: 0.4 },
            { type: 'arm', ox: 8, oy: -4, vxm: 1.2, vym: -0.8 },
            { type: 'weapon', ox: 14, oy: -4, vxm: 1.5, vym: -1.0 },
        ];
        for (const gd of gibDefs) {
            const vx = baseVX * spread + gd.vxm * (2 + Math.random() * 3) + (Math.random() - 0.5) * 3;
            const vy = baseVY * spread + gd.vym * (2 + Math.random() * 2) - 2 - Math.random() * 3;
            const gibColor = (gd.type === 'weapon') ? wc : entity.color;
            this.gibs.push(new Gib(
                cx + gd.ox, cy + gd.oy,
                vx, vy,
                gd.type, gibColor, entity.bodyColor, entity.skinColor
            ));
        }
        // Extra blood particles for gore
        for (let i = 0; i < 15; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 1 + Math.random() * 4;
            this.particles.add(new Particle(cx, cy, Math.cos(a) * sp + baseVX * 0.3, Math.sin(a) * sp + baseVY * 0.3 - 1, 300 + Math.random() * 300, 2 + Math.random() * 3, ['#ff3333', '#cc0000', '#990000', '#ff6666'][i % 4]));
        }
    }

    showLevelUp(level) {
        this.levelUpDisplay = { level, time: performance.now() };
        const perk = LEVEL_PERKS[level];
        if (perk) {
            const div = document.createElement('div');
            div.className = 'kill-feed-entry';
            div.innerHTML = `<span class="killer">LEVEL ${level}</span><span class="weapon-icon">${perk.icon}</span><span class="victim">${perk.name}</span>`;
            document.getElementById('kill-feed').appendChild(div);
            setTimeout(() => div.remove(), 5000);
        }
    }

    checkWinCondition() {
        if (this.player.kills >= this.settings.killTarget) this.endGame(true);
        for (const e of this.entities) {
            if (!e.isPlayer && e.kills >= this.settings.killTarget) this.endGame(false);
        }
    }

    endGame(playerWon) {
        this.running = false; this.gameOver = true;
        document.getElementById('hud').classList.add('hidden');
        const screen = document.getElementById('game-over-screen');
        screen.classList.remove('hidden');
        const title = document.getElementById('game-over-title');
        title.textContent = playerWon ? 'VICTORY!' : 'DEFEAT';
        title.className = 'game-over-title ' + (playerWon ? 'victory' : 'defeat');
        // Award medals
        this.awardMedals(playerWon);
        // Prestige check
        if (playerWon && this.player.level >= 10) {
            this.prestige++;
            localStorage.setItem('wario_prestige', this.prestige.toString());
            this.showAnnouncement('PRESTIGE ' + this.prestige + '!', '#ffd700');
        }
        const stats = document.getElementById('game-over-stats');
        stats.innerHTML = `
            <div class="stat-item"><span class="stat-label">KILLS</span><span class="stat-val">${this.player.kills}</span></div>
            <div class="stat-item"><span class="stat-label">DEATHS</span><span class="stat-val">${this.player.deaths}</span></div>
            <div class="stat-item"><span class="stat-label">LEVEL</span><span class="stat-val">${this.player.level}</span></div>
            <div class="stat-item"><span class="stat-label">HEADSHOTS</span><span class="stat-val">${this.matchStats.headshots}</span></div>
            <div class="stat-item"><span class="stat-label">MAX STREAK</span><span class="stat-val">${this.matchStats.maxStreak}</span></div>
        `;
        const medalsDiv = document.getElementById('game-over-medals');
        if (medalsDiv) medalsDiv.textContent = this.earnedMedals.map(m => MEDAL_DEFS[m]?.icon || '').join(' ');
    }

    showAnnouncement(text, color) {
        const el = document.getElementById('announcer');
        if (!el) return;
        const div = document.createElement('div');
        div.className = 'announcer-text';
        div.style.color = color || '#ffd700';
        div.style.textShadow = `0 0 20px ${color || '#ffd700'}, 0 2px 8px rgba(0,0,0,0.8)`;
        div.textContent = text;
        el.appendChild(div);
        setTimeout(() => div.remove(), 2500);
        this.audio.play('streak');
    }

    triggerStreakReward(streak) {
        const reward = STREAK_REWARDS[streak];
        if (!reward) return;
        this.showAnnouncement(reward.icon + ' ' + reward.name, '#ff9800');
        if (streak === 3) {
            // Airstrike: spawn explosions on random enemies
            this.audio.play('airstrike');
            for (const e of this.entities) {
                if (e.isPlayer || !e.alive) continue;
                if (Math.random() < 0.5) {
                    this.particles.explosion(e.cx, e.cy - 50, 60);
                    e.takeDamage(40, this.player, this, -Math.PI / 2);
                    this.screenShake = 15;
                }
            }
        } else if (streak === 5) {
            // Shield boost
            this.player.shield = SHIELD_MAX;
        } else if (streak === 7) {
            // Death rain: explosive particles everywhere
            this.audio.play('airstrike');
            for (let i = 0; i < 8; i++) {
                const rx = this.player.cx + (Math.random() - 0.5) * 400;
                const ry = 50;
                setTimeout(() => {
                    this.grenades.push(new Grenade(rx, ry, (Math.random() - 0.5) * 2, 3, this.player));
                }, i * 200);
            }
        }
    }

    updateChallengeHUD() {
        const el = document.getElementById('hud-challenges');
        if (!el) return;
        el.innerHTML = '';
        for (const c of this.activeChallenges) {
            const prog = c.stat === 'deathless' ? (this.player.deaths === 0 ? 1 : 0) : (this.matchStats[c.stat] || 0);
            c.progress = prog;
            if (!c.completed && prog >= c.target && c.stat !== 'deathless') c.completed = true;
            if (c.stat === 'deathless' && this.gameOver && this.player.deaths === 0) c.completed = true;
            const d = document.createElement('div');
            d.style.cssText = `font-family:Rajdhani;font-size:0.65rem;color:${c.completed ? '#4cff50' : 'rgba(255,255,255,0.5)'};letter-spacing:1px;background:rgba(0,0,0,0.3);padding:2px 8px;border-radius:4px;border-left:2px solid ${c.completed ? '#4cff50' : 'rgba(255,255,255,0.15)'}`;
            d.textContent = `${c.icon} ${c.desc} [${Math.min(prog, c.target)}/${c.target}]`;
            el.appendChild(d);
        }
    }

    awardMedals(playerWon) {
        const ms = this.matchStats;
        if (ms.firstBlood && !this.allMedals.includes('firstBlood')) { this.earnedMedals.push('firstBlood'); this.allMedals.push('firstBlood'); }
        if (this.player.kills >= 10 && !this.allMedals.includes('dominator')) { this.earnedMedals.push('dominator'); this.allMedals.push('dominator'); }
        if (playerWon && this.player.deaths === 0 && !this.allMedals.includes('untouchable')) { this.earnedMedals.push('untouchable'); this.allMedals.push('untouchable'); }
        if (ms.headshots >= 5 && !this.allMedals.includes('headhunter')) { this.earnedMedals.push('headhunter'); this.allMedals.push('headhunter'); }
        if (ms.grenadeKills >= 3 && !this.allMedals.includes('demolitionist')) { this.earnedMedals.push('demolitionist'); this.allMedals.push('demolitionist'); }
        if (ms.sniperKills >= 3 && !this.allMedals.includes('sharpshooter')) { this.earnedMedals.push('sharpshooter'); this.allMedals.push('sharpshooter'); }
        if (ms.maxStreak >= 7 && !this.allMedals.includes('streak7')) { this.earnedMedals.push('streak7'); this.allMedals.push('streak7'); }
        localStorage.setItem('wario_medals', JSON.stringify(this.allMedals));
    }

    updateHUD() {
        const p = this.player;
        // Health bar
        const hpPct = Math.max(0, p.health);
        const hpFill = document.getElementById('health-bar-fill');
        hpFill.style.width = hpPct + '%';
        hpFill.className = 'hud-bar-fill health-fill' + (hpPct < 30 ? ' low' : hpPct < 60 ? ' medium' : '');
        document.getElementById('health-text').textContent = Math.ceil(hpPct);
        // Fuel bar
        const fuelPct = Math.max(0, (p.fuel / MAX_FUEL) * 100);
        const fuelFill = document.getElementById('fuel-bar-fill');
        fuelFill.style.width = fuelPct + '%';
        fuelFill.className = 'hud-bar-fill fuel-fill' + (fuelPct < 25 ? ' low' : '');
        document.getElementById('fuel-text').textContent = Math.ceil(fuelPct);
        // Shield bar
        const shieldRow = document.getElementById('hud-shield-row');
        if (shieldRow) {
            if (p.shield > 0 || p.maxShield > 0) {
                shieldRow.style.display = 'flex';
                const sPct = Math.max(0, (p.shield / SHIELD_MAX) * 100);
                document.getElementById('shield-bar-fill').style.width = sPct + '%';
                document.getElementById('shield-text').textContent = Math.ceil(p.shield);
            } else { shieldRow.style.display = 'none'; }
        }
        // Weapon
        const wpnName = p.reloading ? p.getWeapon().name + ' ↻' : p.getWeapon().name;
        document.getElementById('weapon-name').textContent = wpnName;
        const ammoTxt = p.reloading ? 'RELOADING' : (p.ammo === Infinity ? '∞' : p.ammo);
        document.getElementById('ammo-count').textContent = ammoTxt;
        // Grenade count
        document.getElementById('grenade-count').textContent = '🧨 ' + p.grenades;
        // Level & XP
        const xpEl = document.getElementById('xp-bar-fill');
        const lvlEl = document.getElementById('level-text');
        if (xpEl && lvlEl) {
            const curThresh = LEVEL_THRESHOLDS[p.level - 1] || 0;
            const nextThresh = LEVEL_THRESHOLDS[p.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
            const pct = Math.min(100, ((p.xp - curThresh) / (nextThresh - curThresh)) * 100);
            xpEl.style.width = pct + '%';
            lvlEl.textContent = 'LVL ' + p.level;
        }
        // Stats
        document.getElementById('kill-count').textContent = p.kills;
        document.getElementById('death-count').textContent = p.deaths;
        // Leaderboard
        const sorted = [...this.entities].sort((a, b) => b.kills - a.kills).slice(0, 6);
        const lb = document.getElementById('leaderboard-list');
        lb.innerHTML = sorted.map((e, i) => `<div class="lb-entry${e.isPlayer ? ' is-player' : ''}"><span class="lb-rank">${i + 1}</span><span class="lb-name">${e.name}</span><span class="lb-kills">${e.kills}</span></div>`).join('');
    }

    render() {
        const ctx = this.ctx, cam = this.camera;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Background
        this.drawBackground(ctx, cam);

        // Apply Camera Zoom for Gameplay
        ctx.save();
        ctx.scale(cam.zoom, cam.zoom);

        // Platforms
        for (const p of this.map.platforms) {
            // Platform gradient
            const pg = ctx.createLinearGradient(p.x - cam.x, p.y - cam.y, p.x - cam.x, p.y - cam.y + p.h);
            pg.addColorStop(0, p.color);
            pg.addColorStop(1, this._darken(p.color, 0.6));
            ctx.fillStyle = pg;
            ctx.fillRect(p.x - cam.x, p.y - cam.y, p.w, p.h);
            // Top edge highlight
            if (p.h <= 25) {
                const eg = ctx.createLinearGradient(p.x - cam.x, p.y - cam.y, p.x - cam.x, p.y - cam.y + 4);
                eg.addColorStop(0, 'rgba(255,255,255,0.3)');
                eg.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = eg;
                ctx.fillRect(p.x - cam.x, p.y - cam.y, p.w, 4);
            }
            // Bottom shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(p.x - cam.x, p.y - cam.y + p.h - 2, p.w, 2);
            // Side edges
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(p.x - cam.x, p.y - cam.y, 2, p.h);
            ctx.fillRect(p.x - cam.x + p.w - 2, p.y - cam.y, 2, p.h);
        }
        // Weapon pickups with distinct icons
        for (const pk of this.map.pickups) {
            if (pk.dead) continue;
            const wx = pk.x - cam.x, wy = pk.y - cam.y + Math.sin(performance.now() / 400) * 5;
            ctx.save();
            if (pk.weapon === 'shield') {
                // Shield pickup - purple orb
                ctx.beginPath(); ctx.arc(wx, wy, 14, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(124,77,255,0.2)'; ctx.fill();
                ctx.strokeStyle = '#b388ff'; ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 300) * 0.3; ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#b388ff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('🛡', wx, wy + 5);
                ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Rajdhani'; ctx.fillText('SHIELD', wx, wy - 18);
            } else {
                // Weapon pickup
                ctx.beginPath(); ctx.arc(wx, wy, 16, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this._hexToRgb(WEAPONS[pk.weapon].color)},0.15)`; ctx.fill();
                ctx.strokeStyle = WEAPONS[pk.weapon].color; ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 300) * 0.3; ctx.stroke();
                ctx.globalAlpha = 1;
                this.drawWeaponIcon(ctx, wx, wy, pk.weapon, 0.7);
                ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Rajdhani'; ctx.textAlign = 'center';
                ctx.fillText(WEAPONS[pk.weapon].name, wx, wy - 18);
            }
            ctx.restore();
        }
        // Shockwave rings
        for (const s of this.shockwaves) {
            ctx.save();
            ctx.strokeStyle = `rgba(255,200,50,${s.alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(s.x - cam.x, s.y - cam.y, s.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255,100,20,${s.alpha * 0.5})`;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(s.x - cam.x, s.y - cam.y, s.radius * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        // Entities
        for (const e of this.entities) {
            if (!e.alive) continue;
            this.drawEntity(ctx, cam, e);
        }
        // Bullets with trails
        for (const b of this.bullets) {
            b.draw(ctx, cam);
            // Bullet trail
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = b.color;
            ctx.lineWidth = b.h * 0.8;
            ctx.beginPath();
            ctx.moveTo(b.x - cam.x, b.y - cam.y);
            ctx.lineTo(b.x - b.vx * 2 - cam.x, b.y - b.vy * 2 - cam.y);
            ctx.stroke();
            ctx.restore();
        }
        // Grenades
        for (const g of this.grenades) g.draw(ctx, cam);
        // Gibs (ragdoll body parts)
        for (const gib of this.gibs) gib.draw(ctx, cam);
        // Blood decals
        for (const bd of this.bloodDecals) bd.draw(ctx, cam);
        // Damage numbers
        for (const dn of this.damageNumbers) dn.draw(ctx, cam);
        // Hit markers
        for (const hm of this.hitMarkers) hm.draw(ctx, cam);
        // Laser sight for sniper
        for (const e of this.entities) {
            if (!e.alive || !WEAPONS[e.weapon]?.laser) continue;
            const sx = e.cx - cam.x + Math.cos(e.aimAngle) * 15;
            const sy = e.cy - 4 - cam.y + Math.sin(e.aimAngle) * 15;
            ctx.save(); ctx.globalAlpha = 0.3; ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 1;
            ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(e.aimAngle) * 600, sy + Math.sin(e.aimAngle) * 600);
            ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        }
        // Shield bubble render
        for (const e of this.entities) {
            if (!e.alive || e.shield <= 0) continue;
            const a = e.shield / SHIELD_MAX;
            ctx.save(); ctx.globalAlpha = a * 0.3;
            ctx.strokeStyle = '#b388ff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(e.cx - cam.x, e.cy - cam.y, e.w / 2 + 4, e.h / 2 + 3, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
        // Battle Royale zone
        if (this.brZone) {
            ctx.save(); ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#ff0000';
            // Draw red outside zone
            ctx.beginPath(); ctx.rect(0, 0, this.canvas.width, this.canvas.height);
            ctx.arc(this.brZone.x - cam.x, this.brZone.y - cam.y, this.brZone.radius, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.globalAlpha = 0.4; ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.brZone.x - cam.x, this.brZone.y - cam.y, this.brZone.radius, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
        // Particles 
        this.particles.draw(ctx, cam);

        ctx.restore();

        // Slowmo vignette
        if (this.timeScale < 1) {
            ctx.save();
            const grad = ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.3, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.7);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, 'rgba(0,0,0,0.4)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px Orbitron'; ctx.textAlign = 'center';
            ctx.fillText('★ FINAL KILL ★', this.canvas.width / 2, 60);
            ctx.restore();
        }
        // Screen flash
        if (this.flashAlpha > 0.01) {
            ctx.fillStyle = `rgba(255,200,100,${this.flashAlpha})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        // Level up display
        if (this.levelUpDisplay) {
            const t = (performance.now() - this.levelUpDisplay.time) / 3000;
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - t * 1.5);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 28px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('LEVEL ' + this.levelUpDisplay.level, this.canvas.width / 2, this.canvas.height / 2 - 50 - t * 30);
            const perk = LEVEL_PERKS[this.levelUpDisplay.level];
            if (perk) {
                ctx.font = 'bold 16px Rajdhani';
                ctx.fillStyle = '#fff';
                ctx.fillText(perk.icon + ' ' + perk.name + ' — ' + perk.desc, this.canvas.width / 2, this.canvas.height / 2 - 20 - t * 30);
            }
            ctx.restore();
        }
        // Vignette
        const vg = ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.3, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.7);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _darken(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r * factor | 0},${g * factor | 0},${b * factor | 0})`;
    }
    _hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    }

    drawWeaponIcon(ctx, x, y, weaponKey, scale = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        const wc = WEAPONS[weaponKey].color;
        switch (weaponKey) {
            case 'pistol':
                ctx.fillStyle = '#666'; ctx.fillRect(-6, -3, 12, 6); // body
                ctx.fillStyle = '#444'; ctx.fillRect(-8, -2, 4, 4); // grip
                ctx.fillStyle = wc; ctx.fillRect(4, -2, 6, 3); // barrel
                ctx.fillStyle = '#888'; ctx.fillRect(-2, -5, 3, 3); // hammer
                break;
            case 'smg':
                ctx.fillStyle = '#555'; ctx.fillRect(-10, -3, 20, 6); // body
                ctx.fillStyle = '#444'; ctx.fillRect(-6, 2, 5, 6); // magazine
                ctx.fillStyle = wc; ctx.fillRect(8, -2, 8, 3); // barrel
                ctx.fillStyle = '#666'; ctx.fillRect(-12, -2, 4, 4); // stock
                ctx.fillStyle = '#777'; ctx.fillRect(4, -5, 3, 3); // sight
                break;
            case 'shotgun':
                ctx.fillStyle = '#6d4c41'; ctx.fillRect(-12, -3, 10, 6); // stock
                ctx.fillStyle = '#555'; ctx.fillRect(-4, -4, 20, 7); // body
                ctx.fillStyle = wc; ctx.fillRect(14, -3, 6, 5); // barrel end
                ctx.fillStyle = '#444'; ctx.fillRect(0, 3, 8, 3); // pump
                ctx.fillStyle = '#333'; ctx.fillRect(14, -4, 2, 7); // muzzle
                break;
            case 'sniper':
                ctx.fillStyle = '#555'; ctx.fillRect(-14, -2, 28, 4); // long body
                ctx.fillStyle = wc; ctx.fillRect(12, -1, 10, 2); // barrel
                ctx.fillStyle = '#888'; ctx.fillRect(-4, -7, 8, 5); // scope
                ctx.fillStyle = '#aaa'; ctx.beginPath(); ctx.arc(-4, -5, 2.5, 0, Math.PI * 2); ctx.fill(); // lens
                ctx.fillStyle = '#6d4c41'; ctx.fillRect(-16, -2, 5, 5); // stock
                ctx.fillStyle = '#444'; ctx.fillRect(2, 1, 3, 4); // magazine
                break;
            case 'rocket':
                ctx.fillStyle = '#555'; ctx.fillRect(-10, -4, 22, 8); // tube
                ctx.fillStyle = wc; ctx.fillRect(10, -3, 6, 6); // warhead
                ctx.fillStyle = '#888'; ctx.fillRect(-12, -3, 4, 6); // exhaust
                ctx.fillStyle = '#444'; ctx.fillRect(-4, -7, 3, 4); // sight
                ctx.fillStyle = '#333'; ctx.fillRect(0, 3, 6, 3); // grip
                break;
            case 'bouncer':
                ctx.fillStyle = '#555'; ctx.fillRect(-8, -3, 16, 6);
                ctx.fillStyle = wc; ctx.fillRect(6, -2, 8, 4);
                ctx.fillStyle = '#444'; ctx.fillRect(-10, -2, 4, 4);
                ctx.fillStyle = '#b388ff'; ctx.fillRect(2, -6, 4, 3);
                ctx.fillStyle = wc; ctx.beginPath(); ctx.arc(14, 0, 2, 0, Math.PI * 2); ctx.fill();
                break;
        }
        ctx.restore();
    }

    drawBackground(ctx, cam) {
        const mapIdx = this.settings.map;
        const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        if (mapIdx === 0) { grad.addColorStop(0, '#0d0500'); grad.addColorStop(0.3, '#1a0a00'); grad.addColorStop(0.7, '#3e1800'); grad.addColorStop(1, '#5d3a1a'); }
        else if (mapIdx === 1) { grad.addColorStop(0, '#040d04'); grad.addColorStop(0.3, '#0a1a0a'); grad.addColorStop(0.7, '#1a3818'); grad.addColorStop(1, '#2d5a2d'); }
        else { grad.addColorStop(0, '#050810'); grad.addColorStop(0.3, '#0a0f1a'); grad.addColorStop(0.7, '#1a252e'); grad.addColorStop(1, '#2d3a3a'); }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Stars
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 60; i++) {
            const sx = ((i * 173 + 50) % this.canvas.width + (cam.x * 0.02) % this.canvas.width + this.canvas.width) % this.canvas.width;
            const sy = ((i * 97 + 30) % this.canvas.height);
            const sz = 0.5 + (i % 3) * 0.5;
            ctx.globalAlpha = 0.1 + (Math.sin(performance.now() / 1000 + i) * 0.1);
            ctx.fillRect(sx, sy, sz, sz);
        }
        ctx.globalAlpha = 1;
        // Parallax mountains (far)
        const mColors = mapIdx === 0 ? ['#2a1500', '#3d2000'] : mapIdx === 1 ? ['#0d2a0d', '#153615'] : ['#121a22', '#1a2530'];
        this._drawMountainLayer(ctx, cam, 0.03, this.canvas.height * 0.55, mColors[0], 200, 80);
        this._drawMountainLayer(ctx, cam, 0.06, this.canvas.height * 0.65, mColors[1], 150, 60);
    }

    _drawMountainLayer(ctx, cam, parallax, baseY, color, segW, maxH) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height);
        const offsetX = cam.x * parallax;
        for (let x = -segW; x < this.canvas.width + segW; x += segW / 2) {
            const wx = x + offsetX;
            const h = maxH * (0.3 + 0.7 * Math.abs(Math.sin(wx * 0.003 + 1.5) * Math.cos(wx * 0.007)));
            ctx.lineTo(x, baseY - h);
        }
        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.closePath();
        ctx.fill();
    }

    drawEntity(ctx, cam, e) {
        const sx = e.x - cam.x, sy = e.y - cam.y;
        const flashAlpha = e.invulnTime > 0 ? 0.5 + Math.sin(performance.now() / 50) * 0.5 : 1;
        ctx.globalAlpha = flashAlpha;
        const legOff = e.onGround ? Math.sin(e.walkFrame * Math.PI / 2) * 3 : 0;
        const flip = e.facingRight ? 1 : -1;
        const cx = sx + e.w / 2, armY = sy + e.h / 2 - 4;

        // Shadow
        if (e.onGround) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(cx, sy + e.h + 1, 10, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Jetpack unit (back)
        ctx.fillStyle = '#455a64';
        ctx.fillRect(cx - (e.facingRight ? 10 : 2), sy + 10, 6, 14);
        ctx.fillStyle = '#37474f';
        ctx.fillRect(cx - (e.facingRight ? 9 : 1), sy + 12, 4, 4);
        ctx.fillRect(cx - (e.facingRight ? 9 : 1), sy + 18, 4, 4);

        // Boots
        ctx.fillStyle = '#333';
        ctx.fillRect(sx + 3, sy + e.h - 5 + legOff, 7, 5);
        ctx.fillRect(sx + e.w - 10, sy + e.h - 5 - legOff, 7, 5);

        // Legs with detail
        ctx.fillStyle = e.bodyColor;
        ctx.fillRect(sx + 5, sy + e.h - 14 + legOff, 5, 10);
        ctx.fillRect(sx + e.w - 10, sy + e.h - 14 - legOff, 5, 10);

        // Torso with armor
        const tg = ctx.createLinearGradient(sx, sy + 8, sx, sy + e.h - 14);
        tg.addColorStop(0, e.color);
        tg.addColorStop(1, this._darken(e.color.startsWith('#') ? e.color : '#4488aa', 0.7));
        ctx.fillStyle = tg;
        ctx.fillRect(sx + 2, sy + 8, e.w - 4, e.h - 22);
        // Armor plate lines
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(sx + 3, sy + 12, e.w - 6, 1);
        ctx.fillRect(sx + 3, sy + 18, e.w - 6, 1);
        // Collar
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(sx + 4, sy + 8, e.w - 8, 3);

        // Head
        ctx.fillStyle = e.skinColor;
        ctx.beginPath();
        ctx.arc(cx, sy + 8, 7, 0, Math.PI * 2);
        ctx.fill();

        // Helmet (full coverage military style)
        const hg = ctx.createLinearGradient(cx, sy, cx, sy + 12);
        hg.addColorStop(0, e.color);
        hg.addColorStop(1, this._darken(e.color.startsWith('#') ? e.color : '#4488aa', 0.7));
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(cx, sy + 6, 8, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 8, sy + 5, 16, 4);
        // Visor
        ctx.fillStyle = e.visorColor || 'rgba(0,230,255,0.5)';
        ctx.fillRect(cx + (e.facingRight ? 1 : -7), sy + 6, 6, 3);
        // Visor shine
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(cx + (e.facingRight ? 2 : -5), sy + 6, 2, 1);

        // Arm + Weapon
        ctx.save();
        ctx.translate(cx, armY);
        ctx.rotate(e.aimAngle);
        // Arm
        ctx.fillStyle = e.bodyColor;
        ctx.fillRect(0, -2.5, 14, 5);
        // Glove
        ctx.fillStyle = '#333';
        ctx.fillRect(12, -2.5, 3, 5);
        // Weapon (unique per type)
        this.drawWeaponIcon(ctx, 20, 0, e.weapon, 0.85);
        ctx.restore();

        // Akimbo second arm (if applicable)
        if (e.akimbo && e.weapon === 'pistol') {
            ctx.save();
            ctx.translate(cx, armY - 5);
            ctx.rotate(e.aimAngle + 0.15);
            ctx.fillStyle = e.bodyColor;
            ctx.fillRect(0, -2, 12, 4);
            ctx.fillStyle = '#333';
            ctx.fillRect(10, -2, 3, 4);
            this.drawWeaponIcon(ctx, 18, 0, 'pistol', 0.75);
            ctx.restore();
        }

        // Jetpack flames
        if (e.jetpacking && e.fuel > 0) {
            const fh = 6 + Math.random() * 12;
            const fw = 6 + Math.random() * 4;
            // Outer flame
            const fg = ctx.createLinearGradient(cx, sy + e.h, cx, sy + e.h + fh);
            fg.addColorStop(0, 'rgba(0,229,255,0.8)');
            fg.addColorStop(0.4, 'rgba(0,150,200,0.6)');
            fg.addColorStop(1, 'rgba(0,100,150,0)');
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.moveTo(cx - fw / 2, sy + e.h);
            ctx.lineTo(cx + fw / 2, sy + e.h);
            ctx.lineTo(cx + (Math.random() - 0.5) * 3, sy + e.h + fh);
            ctx.closePath();
            ctx.fill();
            // Inner flame
            ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.4})`;
            ctx.beginPath();
            ctx.moveTo(cx - 2, sy + e.h);
            ctx.lineTo(cx + 2, sy + e.h);
            ctx.lineTo(cx, sy + e.h + fh * 0.5);
            ctx.closePath();
            ctx.fill();
        }

        // Name tag
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        const nm = e.name;
        ctx.font = 'bold 10px Rajdhani';
        ctx.textAlign = 'center';
        const tw = ctx.measureText(nm).width;
        ctx.fillRect(cx - tw / 2 - 3, sy - 18, tw + 6, 12);
        ctx.fillStyle = e.isPlayer ? '#00e5ff' : '#fff';
        ctx.fillText(nm, cx, sy - 9);

        // Level badge
        if (e.level > 1) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 7px Orbitron';
            ctx.fillText('L' + e.level, cx, sy - 20);
        }

        // Health bar
        if (!e.isPlayer) {
            const bw = 32, bh = 4;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(cx - bw / 2, sy - 5, bw, bh);
            const hpPct = e.health / e.maxHealth;
            const hg2 = ctx.createLinearGradient(cx - bw / 2, 0, cx - bw / 2 + bw * hpPct, 0);
            if (hpPct > 0.5) { hg2.addColorStop(0, '#4cff50'); hg2.addColorStop(1, '#69ff6e'); }
            else if (hpPct > 0.25) { hg2.addColorStop(0, '#ffeb3b'); hg2.addColorStop(1, '#fff176'); }
            else { hg2.addColorStop(0, '#ff3d3d'); hg2.addColorStop(1, '#ff6b6b'); }
            ctx.fillStyle = hg2;
            ctx.fillRect(cx - bw / 2, sy - 5, bw * hpPct, bh);
            // Border
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(cx - bw / 2, sy - 5, bw, bh);
        }
        ctx.globalAlpha = 1;
    }
}

// --- Init ---
const game = new Game();
