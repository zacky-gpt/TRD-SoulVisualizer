// エラーハンドリング
window.onerror = function(msg, url, line) {
    const el = document.getElementById('error-trap');
    if(el) { el.style.display = 'block'; el.innerText = `ERROR: ${msg} (Line ${line})`; }
    return false;
};

// --- 定数 ---
const CONF = { initTurns: 150, maxFloor: 10, itemMax: 3 };
const SAVE_KEY = 'trd_save_data_v26_axis_fix'; // Key updated

const JOBS = [
    { id:'novice', name:'Novice', req:null, bonus:{}, desc:"凡人", priority:1, skill:{id:'Guts', name:"Guts", type:"buff", cd:15, pwr:0, acc:1.0, desc:"食いしばり(2T)"} },
    { id:'veteran', name:'Veteran', req:{lv_min:10}, bonus:{phys:1.1, mag:1.1, def:0.9}, desc:"熟練者(全能微増)", priority:1.2, skill:{id:'Guts+', name:"Guts+", type:"buff", cd:15, pwr:0, acc:1.0, desc:"食いしばり(3T)+攻UP"} },
    { id:'hero', name:'Hero', req:{lv_min:20}, bonus:{phys:1.2, mag:1.2, def:0.8, eva:0.1}, desc:"英雄(全能強化)", priority:1.5, skill:{id:'Awakening', name:"Awakening", type:"buff", cd:20, pwr:0, acc:1.0, desc:"覚醒(4T不死+全強化)"} },

    { id:'warrior', name:'Warrior', req:{t_min:70}, bonus:{phys:1.2}, desc:"物攻+20%", priority:2, skill:{id:'Braver', name:"Braver", type:"phys", cd:10, pwr:2.5, acc:0.95, desc:"必殺の一撃"} },
    { id:'wizard', name:'Wizard', req:{t_max:30}, bonus:{mag:1.2}, desc:"魔攻+20%", priority:2, skill:{id:'Fireball', name:"Fireball", type:"mag", cd:8, pwr:2.2, acc:1.0, desc:"大爆発"} },
    { id:'guardian', name:'Guardian', req:{d_min:70}, bonus:{def:0.8}, desc:"被ダメ-20%", priority:2, skill:{id:'IronWall', name:"IronWall", type:"def", cd:15, pwr:0, acc:1.0, desc:"完全防御(1T)"} },
    { id:'rogue', name:'Rogue', req:{d_max:30}, bonus:{eva:0.2}, desc:"回避+20%", priority:2, skill:{id:'Mug', name:"Mug", type:"phys", cd:6, pwr:1.0, acc:1.0, desc:"確定強奪"} },
    { id:'sniper', name:'Sniper', req:{r_min:70}, bonus:{crit:0.2}, desc:"Crit+20%", priority:2, skill:{id:'Headshot', name:"Headshot", type:"phys", cd:8, pwr:1.8, acc:1.0, desc:"確定クリティカル"} },
    { id:'cleric', name:'Cleric', req:{r_max:30}, bonus:{heal:1.3}, desc:"回復+30%", priority:2, skill:{id:'Pray', name:"Pray", type:"heal", cd:12, pwr:0, acc:1.0, desc:"特大回復"} },
    
    { id:'paladin', name:'Paladin', req:{t_min:70, d_min:70}, bonus:{phys:1.1, def:0.85}, desc:"物+10% 耐-15%", priority:2, skill:{id:'HolyBlade', name:"HolyBlade", type:"hyb", cd:10, pwr:2.2, acc:1.0, desc:"聖なる剣(対霊特効)"} },
    { id:'assassin', name:'Assassin', req:{t_min:70, d_max:30}, bonus:{phys:1.1, crit:0.1}, desc:"物+10% Crit+10%", priority:2, skill:{id:'Backstab', name:"Backstab", type:"phys", cd:10, pwr:2.0, acc:1.0, desc:"背後から一撃"} },
    { id:'sage', name:'Sage', req:{t_max:30, r_max:30}, bonus:{mag:1.1, heal:1.2}, desc:"魔+10% 回+20%", priority:2, skill:{id:'BigBang', name:"BigBang", type:"mag", cd:15, pwr:3.0, acc:1.0, desc:"究極魔法"} },
    { id:'sentinel', name:'Sentinel', req:{d_min:70, r_max:30}, bonus:{def:0.7, time:1}, desc:"耐-30% 撃破時時+1", priority:2, skill:{id:'Aegis', name:"Aegis", type:"buff", cd:12, pwr:0, acc:1.0, desc:"絶対防御壁"} },
    { id:'reaper', name:'Reaper', req:{t_max:30, r_min:70}, bonus:{mag:1.1, crit:0.1}, desc:"魔+10% 即死使い", priority:2, skill:{id:'Execution', name:"Execution", type:"mag", cd:12, pwr:1.0, acc:0.9, desc:"確率即死", isInstantDeath:true} },

    { id:'samurai', name:'Samurai', req:{t_min:85, r_min:85}, bonus:{phys:1.3, crit:0.2}, desc:"物+30% Crit+20%", priority:3, skill:{id:'Zantetsu', name:"Zantetsu", type:"phys", cd:15, pwr:3.5, acc:1.0, desc:"一撃必殺"} },
    { id:'archmage', name:'Archmage', req:{t_max:15, r_max:15}, bonus:{mag:1.3, heal:1.3}, desc:"魔+30% 回+30%", priority:3, skill:{id:'Meteor', name:"Meteor", type:"mag", cd:18, pwr:4.0, acc:1.0, desc:"隕石召喚"} },
    { id:'ninja', name:'Ninja', req:{d_max:15, r_min:85}, bonus:{eva:0.25, crit:0.2}, desc:"避+25% Crit+20%", priority:3, skill:{id:'Assassinate', name:"Assassinate", type:"phys", cd:12, pwr:2.2, acc:1.0, desc:"即死攻撃", isInstantDeath:true} }
];

const ENEMY_TYPES = [
    { id: 'slime', name: 'Slime', hpMod: 0.8, defMod: 1.5, mDefMod: 0.2, eva: 0, act:['atk','atk','heal'], desc: '再生能力' },
    { id: 'bat', name: 'Bat', hpMod: 0.6, defMod: 0.5, mDefMod: 0.5, eva: 0.25, act:['atk'], desc: '高回避' },
    { id: 'golem', name: 'Golem', hpMod: 1.4, defMod: 1.1, mDefMod: 0.8, eva: -0.1, act:['atk','atk','charge'], desc: 'タメ攻撃注意' },
    { id: 'ghost', name: 'Ghost', hpMod: 0.6, defMod: 2.5, mDefMod: 0.4, eva: 0.1, act:['mag'], desc: '物理耐性/呪い' }
];
const BOSSES = {
    5: { id:'cerberus', name:'Cerberus', hp:200, atk:15, defMod:1.0, mDefMod:1.0, eva:0.05, act:['atk','atk','charge','mag'], desc:'【中ボス】地獄の番犬' },
    10: { id:'overlord', name:'Overlord', hp:500, atk:25, defMod:1.2, mDefMod:1.2, eva:0.1, act:['atk','mag','charge','heal'], desc:'【BOSS】螺旋の終焉' }
};
const ITEM_DATA = {
    potion: { name: "Potion", desc: "HP50回復", type: "heal", val: 50 },
    ether:  { name: "Ether", desc: "MP20回復", type: "mp", val: 20 },
    bomb:   { name: "Bomb", desc: "防御無視30dmg", type: "dmg", val: 30 },
    clock:  { name: "Clock", desc: "寿命+10", type: "turn", val: 10 }
};

const INITIAL_G = {
    state: 'EXPLORE', floor: 1, stairsFound: false, searchCount: 0,
    turns: CONF.initTurns, maxTurns: CONF.initTurns,
    lv: 1, exp: 0, next: 30, hp: 25, mhp: 25, mp: 10, mmp: 10, 
    axis: { T: 50, D: 50, R: 50 }, 
    items: { potion: 1, bomb: 0, ether: 1, clock: 0 },
    enemy: null, chest: null, gameOver: false, isCharging: false, isStunned: false,
    isFocused: false, jobSkillCd: 0, immortalTurns: 0, awakening: false, guardStance: false
};

let g = JSON.parse(JSON.stringify(INITIAL_G));
g.currentJob = JOBS[0];

// --- Global Functions ---

function saveGame() {
    if(g.gameOver) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(g)); log("記録しました", "l-sys"); }
    catch(e) { log("保存失敗", "l-red"); }
}
function loadGame() {
    try {
        const d = localStorage.getItem(SAVE_KEY);
        if(!d) { log("記録がありません", "l-gry"); return; }
        const loaded = JSON.parse(d);
        g = { ...INITIAL_G, ...loaded };
        updateJob(); log("記録を読込", "l-sys"); updateUI();
    } catch(e) { log("読込失敗", "l-red"); }
}
function resetGame() {
    if(!confirm("リセットしますか？")) return;
    localStorage.removeItem(SAVE_KEY); location.reload();
}

function getStats() {
    let b = 5 + (g.lv * 1.0); 
    if(g.awakening) b *= 1.5;
    const a = g.axis;
    return {
        STR: Math.floor(b * (a.T/50)), INT: Math.floor(b * ((100-a.T)/50)),
        VIT: Math.floor(b * (a.D/50)), AGI: Math.floor(b * ((100-a.D)/50)),
        DEX: Math.floor(b * (a.R/50)), MND: Math.floor(b * ((100-a.R)/50))
    };
}
function updateJob() {
    const t=g.axis.T, d=g.axis.D, r=g.axis.R; let best=JOBS[0], bestP=0;
    for(let j of JOBS) {
        if(j.req && j.req.lv_min) {
            if(g.lv < j.req.lv_min) continue;
        }
        if(j.req) {
            if(j.req.t_min!==undefined && t < j.req.t_min) continue;
            if(j.req.t_max!==undefined && t > j.req.t_max) continue;
            if(j.req.d_min!==undefined && d < j.req.d_min) continue;
            if(j.req.d_max!==undefined && d > j.req.d_max) continue;
            if(j.req.r_min!==undefined && r < j.req.r_min) continue;
            if(j.req.r_max!==undefined && r > j.req.r_max) continue;
        }
        const p = j.priority || 1;
        if(p > bestP) { best=j; bestP=p; }
        else if(p === bestP) {
            if(j.id !== 'novice' && j.id !== 'veteran' && j.id !== 'hero') best=j; 
        }
    }
    if(g.currentJob.id !== best.id) {
        g.currentJob = best;
        g.jobSkillCd = 0;
    } else {
        g.currentJob = best;
    }
}
function getDeck() {
    const t=g.axis.T, d=g.axis.D, r=g.axis.R;
    let basic = {id:'atk', name:"Attack", type:"phys", mp:0, pwr:1.0, acc:0.95, desc:"通常攻撃"};
    if (['wizard','archmage','sage','reaper'].includes(g.currentJob.id)) {
            basic = {id:'mag_atk', name:"Magic Shot", type:"mag", mp:2, pwr:0.8, acc:1.0, desc:"魔力攻撃"};
    }
    const deck = [basic];

    if(t>=60) deck.push({id:'smash', name:"Smash", type:"phys", mp:4, pwr:1.7, acc:0.75, cap:0.7, desc:"強打(70%)"});
    else if(t<=40) deck.push({id:'ice', name:"IceBolt", type:"mag", mp:8, pwr:1.3, acc:1.0, desc:"氷魔法"});
    else deck.push({id:'fire', name:"FireBlade", type:"hyb", mp:8, pwr:1.5, acc:0.95, desc:"炎剣"});
    
    if(d>=60) deck.push({id:'guard', name:"Guard", type:"def", mp:0, pwr:0, acc:1.0, desc:"防御"});
    else if(d<=40) deck.push({id:'trip', name:"Trip", type:"def", mp:3, pwr:0, acc:0.8, desc:"足払(行動阻止)"});
    else deck.push({id:'parry', name:"Parry", type:"buff", mp:0, pwr:0, acc:1.0, desc:"パリィ(0MP)"});
    
    if(r>=60) deck.push({id:'snipe', name:"Snipe", type:"phys", mp:4, pwr:1.0, acc:1.0, desc:"必中"});
    else if(r<=40) deck.push({id:'heal', name:"Heal", type:"heal", mp:8, pwr:0, acc:1.0, desc:"回復"});
    else deck.push({id:'focus', name:"Focus", type:"buff", mp:2, pwr:0, acc:1.0, desc:"集中"});

    if(g.currentJob.skill) { deck.push(g.currentJob.skill); }
    return deck;
}

function calcHit(acc, type, s, cap) {
    if(g.isFocused) return 1.0;
    let r = acc; if(type==='phys'||type==='hyb') r += (s.DEX * 0.01);
    if(g.enemy) r -= g.enemy.eva;
    let res = Math.min(1.0, Math.max(0.0, r));
    if(cap !== undefined) res = Math.min(res, cap);
    return res;
}
function calcDmg(sk, s) {
    const type = sk.type;
    const pwr = sk.pwr;

    if(type==='heal'||type==='def'||type==='buff') return {min:0,max:0};
    let base = 0;
    if(type==='phys') base=s.STR; else if(type==='mag') base=s.INT; else if(type==='hyb') base=(s.STR+s.INT)*0.6;
    else if(type==='bomb') return {min:30, max:30};

    const jb = g.currentJob.bonus; let mod = 1.0;
    if(type==='phys' && jb.phys) mod *= jb.phys; if(type==='mag' && jb.mag) mod *= jb.mag;
    
    if(g.currentJob.id === 'paladin' && g.enemy.id === 'ghost' && sk.name === 'HolyBlade') mod *= 2.0;

    let val = Math.floor(base * pwr * mod); if(val < 1) val = 1;
    if(!g.enemy) return {min:0, max:0};
    
    let def = 0;
    if(type==='phys'||type==='hyb') def=(g.enemy.lv*1.5)*(g.enemy.defMod||1); else if(type==='mag') def=(g.enemy.lv*1.0)*(g.enemy.mDefMod||1);
    const net = Math.max(1, val - Math.floor(def/2));
    return {min:Math.floor(net*0.9), max:Math.floor(net*1.1)};
}

// Actions
function log(msg, cls="") { const d=document.createElement('div'); d.className=cls; d.innerText=msg; document.getElementById('log-list').prepend(d); }
function consumeTime(v) {
    if(g.gameOver) return false;
    g.turns -= v; 
    if(g.jobSkillCd > 0) g.jobSkillCd = Math.max(0, g.jobSkillCd - v);
    if(g.immortalTurns > 0) g.immortalTurns = Math.max(0, g.immortalTurns - v);
    if(g.turns<=0) { g.gameOver=true; log("寿命が尽きた...","l-red"); updateUI(); return false; } 
    return true;
}
function tickBattleTurns() {
    if(g.jobSkillCd > 0) g.jobSkillCd--;
    if(g.immortalTurns > 0) g.immortalTurns--;
}

function actExplore() {
    if(g.gameOver || !consumeTime(1)) return;
    
    // イベント判定
    const r = Math.random();
    let eventOccurred = false;

    if(r<0.6) { startBattle(); eventOccurred=true; }
    else if(r<0.7) { startChest(); eventOccurred=true; }
    else if(r<0.8) {
        const k=['T','D','R'][Math.floor(Math.random()*3)]; const v=Math.random()<.5?5:-5;
        g.axis[k]=Math.max(0,Math.min(100, g.axis[k]+v)); log("磁場異常！性格変動","l-yel");
        eventOccurred=true;
    }

    // 階段判定
    g.searchCount = (g.searchCount || 0) + 1;
    const findChance = g.searchCount * 0.1; 
    if(!g.stairsFound && Math.random() < findChance) {
        g.stairsFound = true;
        if(eventOccurred) log("...そして階段も見つけた！","l-grn");
        else log(`階段を発見した！(捜索${g.searchCount}回目)`, "l-grn");
    } else if(!eventOccurred) {
        g.exp += 5;
        log(`気配が強まる...(${Math.floor(findChance*100)}%)`, "l-gry");
    }

    updateUI();
}

function startBattle(fE=null) {
    let e; if(fE) e=fE;
    else { 
        const lv=Math.floor(g.floor*1.3) + Math.floor(Math.random()*2); 
        const t=ENEMY_TYPES[Math.floor(Math.random()*ENEMY_TYPES.length)]; 
        e={...t, lv:lv, type:t.id, mhp:Math.floor((20+lv*8)*t.hpMod), hp:Math.floor((20+lv*8)*t.hpMod), atk:5+lv*2}; 
    }
    g.enemy=e; g.isCharging=false; g.isStunned=false; g.parryActive=false; g.isFocused=false; g.guardStance=0;
    g.state = 'BATTLE';
    log(`[遭遇] ${g.enemy.name} Lv${g.enemy.lv}`, g.enemy.isBoss?"l-boss":"l-red"); updateUI();
}
function startChest() { 
    g.state='CHEST'; 
    g.chest={ trap:Math.random()<0.5, item:Object.keys(ITEM_DATA)[Math.floor(Math.random()*4)], identified:false, inspected:false }; 
    log("宝箱発見","l-yel");
    updateUI(); 
}

function actBattle(sk) {
    if(g.gameOver || !g.enemy || g.enemy.hp<=0 || g.state!=='BATTLE') return;
    if(sk.cd && g.jobSkillCd > 0) { log(`充填中... (あと${g.jobSkillCd}T)`,"l-gry"); return; }
    
    g.mp -= (sk.mp||0); 
    if(sk.cd) g.jobSkillCd = sk.cd; 
    
    tickBattleTurns(); 

    const s = getStats();
    
    if(sk.type==='heal') {
        const v = Math.floor((20*g.currentJob.bonus.heal||20)+s.MND*2); g.hp=Math.min(g.mhp, g.hp+v); log(`HP${v}回復`,"l-grn"); enemyTurn(); updateUI(); return;
    }
    if(sk.id==='trip') {
        if(Math.random() < 0.8) { 
            g.enemy.isStunned=true; 
            if(g.isCharging){ g.isCharging=false; log("足払い！ため解除！","l-grn"); }
            else log("足払い成功！","l-grn"); 
        } else log("足払い失敗","l-gry");
        enemyTurn(); updateUI(); return;
    }
    if(sk.id==='parry') { g.parryActive = true; log("構えた！(Parry)","l-grn"); enemyTurn(); updateUI(); return; }
    if(sk.id==='focus') { g.isFocused = true; log("集中！(次回必中Crit)","l-grn"); enemyTurn(); updateUI(); return; }
    
    if(sk.id==='Guts' || sk.id==='Guts+') { 
        g.immortalTurns = sk.id==='Guts'?3:4; 
        if(sk.id==='Guts+') g.awakening=true; 
        log("ド根性！食いしばり付与","l-grn"); enemyTurn(); updateUI(); return; 
    }
    if(sk.id==='Awakening') { 
        g.immortalTurns = 5; g.awakening=true; 
        log("覚醒！能力UP＆不死！","l-spd"); enemyTurn(); updateUI(); return; 
    }
    
    if(sk.id==='IronWall' || sk.id==='Aegis' || sk.name==='Guard') { 
        g.guardStance = (sk.id==='IronWall' || sk.id==='Aegis') ? 2 : 1; 
        log(`${sk.name}! (防御)`,"l-grn"); enemyTurn(); updateUI(); return; 
    }

    if(sk.id==='Mug') {
        const hit = calcHit(sk.acc, sk.type, s);
        if(Math.random() > hit) log("ミス！","l-gry");
        else {
            const d = calcDmg(sk, s);
            let dmg = Math.floor(d.min + Math.random()*(d.max-d.min));
            applyDamageToEnemy(dmg, sk.name);
            const items = Object.keys(ITEM_DATA);
            const it = items[Math.floor(Math.random()*items.length)];
            if(g.items[it] < CONF.itemMax) { g.items[it]++; log(`盗んだ！${ITEM_DATA[it].name}`,"l-yel"); }
            else log(`盗んだが持てない`,"l-gry");
        }
        if(g.enemy.hp <= 0) winBattle(); else enemyTurn();
        updateUI(); return;
    }

    if(sk.isInstantDeath) {
        let rate = 0.5; 
        if(g.enemy.isBoss) rate = (g.floor===5) ? 0.10 : 0.03;
        if(Math.random() < rate) {
            log(`即死発動！！ ${g.enemy.name}を葬った！`,"l-kill"); g.enemy.hp=0; winBattle(); updateUI(); return;
        } else {
            log("即死失敗... (1dmg)","l-gry"); applyDamageToEnemy(1, "即死ミス");
        }
    } else {
        const hit = calcHit(sk.acc, sk.type, s, sk.cap);
        if(Math.random() > hit) log("ミス！","l-gry");
        else {
            const range = calcDmg(sk, s);
            let dmg = Math.floor(range.min + Math.random()*(range.max-range.min+1));
            let cr=0.05; 
            if(sk.id==='snipe' || g.isFocused) cr=1.0; 
            else if(g.currentJob.bonus.crit) cr+=g.currentJob.bonus.crit;
            
            if(Math.random()<cr) { dmg=Math.floor(dmg*1.5); log("Critical!!","l-red"); }
            applyDamageToEnemy(dmg, sk.name);
            
            if(g.isFocused) g.isFocused = false; 
        }
    }
    if(g.enemy.hp <= 0) winBattle(); else enemyTurn();
    
    if(!g.gameOver && g.enemy && g.enemy.hp > 0) {
        const diff = s.AGI - (g.enemy.lv * 4);
        if(Math.random() < diff*0.01) { log("再行動！","l-spd"); return; }
    }
    updateUI();
}

function enemyTurn(guard=false) {
    if(g.gameOver || !g.enemy || g.enemy.hp<=0) return;
    
    if(g.enemy.isStunned) {
        log("敵は動けない...","l-grn");
        g.enemy.isStunned = false;
        g.guardStance = 0;
        tickBattleTurns();
        return;
    }
    
    const s = getStats();
    const agiDiff = Math.max(0, s.AGI - (g
