// エラーハンドリング
window.onerror = function(msg, url, line) {
    const el = document.getElementById('error-trap');
    if(el) { 
        el.style.display = 'block'; 
        el.innerText = `ERROR: ${msg} (Line ${line})`; 
    }
    return false;
};

// --- 定数 ---
const CONF = { initTurns: 150, maxFloor: 10, itemMax: 3 };
const SAVE_KEY = 'trd_save_data_final';

const JOBS = [
    { id:'novice', name:'Novice', req:null, bonus:{}, desc:"特徴なし" },
    { id:'warrior', name:'Warrior', req:{t_min:60}, bonus:{phys:1.2}, desc:"物攻+20%", skill:{name:"Braver", type:"phys", mp:5, pwr:2.2, acc:0.9, desc:"強力な一撃"} },
    { id:'wizard', name:'Wizard', req:{t_max:40}, bonus:{mag:1.2}, desc:"魔攻+20%", skill:{name:"Fireball", type:"mag", mp:6, pwr:2.0, acc:1.0, desc:"大爆発"} },
    { id:'guardian', name:'Guardian', req:{d_min:60}, bonus:{def:0.8}, desc:"被ダメ-20%", skill:{name:"IronWall", type:"def", mp:4, pwr:0, acc:1.0, desc:"鉄壁(ダメ1/4)"} },
    { id:'rogue', name:'Rogue', req:{d_max:40}, bonus:{eva:0.2}, desc:"回避+20%", skill:{name:"Mug", type:"phys", mp:4, pwr:1.0, acc:1.0, desc:"攻撃＆強奪"} },
    { id:'sniper', name:'Sniper', req:{r_min:60}, bonus:{crit:0.2}, desc:"Crit+20%", skill:{name:"Headshot", type:"phys", mp:5, pwr:1.5, acc:1.0, desc:"確定クリティカル"} },
    { id:'cleric', name:'Cleric', req:{r_max:40}, bonus:{heal:1.3}, desc:"回復+30%", skill:{name:"Pray", type:"heal", mp:6, pwr:0, acc:1.0, desc:"大回復"} },
    
    // Hybrid
    { id:'paladin', name:'Paladin', req:{t_min:60, d_min:60}, bonus:{phys:1.1, def:0.85}, desc:"物+10% 耐-15%", priority:2, skill:{name:"HolyBlade", type:"hyb", mp:6, pwr:2.0, acc:0.95, desc:"聖なる剣"} },
    { id:'assassin', name:'Assassin', req:{t_min:60, d_max:40}, bonus:{phys:1.1, crit:0.1}, desc:"物+10% Crit+10%", priority:2, skill:{name:"Backstab", type:"phys", mp:5, pwr:1.8, acc:1.0, desc:"必中・高威力"} },
    { id:'sage', name:'Sage', req:{t_max:40, r_max:40}, bonus:{mag:1.1, heal:1.2}, desc:"魔+10% 回+20%", priority:2, skill:{name:"BigBang", type:"mag", mp:10, pwr:2.5, acc:1.0, desc:"究極魔法"} },
    { id:'sentinel', name:'Sentinel', req:{d_min:60, r_max:40}, bonus:{def:0.7, time:1}, desc:"耐-30% 撃破時時+1", priority:2, skill:{name:"Aegis", type:"def", mp:5, pwr:0, acc:1.0, desc:"絶対防御"} },
    { id:'reaper', name:'Reaper', req:{t_max:40, r_min:60}, bonus:{mag:1.1, crit:0.1}, desc:"魔+10% 即死使い", priority:2, skill:{name:"Execution", type:"mag", mp:8, pwr:1.0, acc:0.9, desc:"確率即死", isInstantDeath:true} },

    // High Tier
    { id:'samurai', name:'Samurai', req:{t_min:80, r_min:80}, bonus:{phys:1.3, crit:0.2}, desc:"物+30% Crit+20%", priority:3, skill:{name:"Zantetsu", type:"phys", mp:8, pwr:3.0, acc:0.85, desc:"一撃必殺"} },
    { id:'archmage', name:'Archmage', req:{t_max:20, r_max:20}, bonus:{mag:1.3, heal:1.3}, desc:"魔+30% 回+30%", priority:3, skill:{name:"Meteor", type:"mag", mp:12, pwr:3.5, acc:1.0, desc:"隕石召喚"} },
    { id:'ninja', name:'Ninja', req:{d_max:20, r_min:80}, bonus:{eva:0.25, crit:0.2}, desc:"避+25% Crit+20%", priority:3, skill:{name:"Assassinate", type:"phys", mp:8, pwr:2.0, acc:1.0, desc:"即死攻撃", isInstantDeath:true} }
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
    enemy: null, chest: null, gameOver: false, isCharging: false, isStunned: false
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
    const b = 5 + (g.lv * 1.0); 
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
        if(!j.req) continue;
        let ok = true;
        if(j.req.t_min!==undefined && t<=j.req.t_min) ok=false;
        if(j.req.t_max!==undefined && t>=j.req.t_max) ok=false;
        if(j.req.d_min!==undefined && d<=j.req.d_min) ok=false;
        if(j.req.d_max!==undefined && d>=j.req.d_max) ok=false;
        if(j.req.r_min!==undefined && r<=j.req.r_min) ok=false;
        if(j.req.r_max!==undefined && r>=j.req.r_max) ok=false;
        if(ok && (j.priority||1)>bestP) { best=j; bestP=j.priority||1; }
    }
    g.currentJob = best;
}
function getDeck() {
    const t=g.axis.T, d=g.axis.D, r=g.axis.R;
    let basic = {id:'atk', name:"Attack", type:"phys", mp:0, pwr:1.0, acc:0.95, desc:"通常攻撃"};
    if (['wizard','archmage','sage','reaper'].includes(g.currentJob.id)) {
            basic = {id:'mag_atk', name:"Magic Shot", type:"mag", mp:2, pwr:0.8, acc:1.0, desc:"魔力攻撃"};
    }
    const deck = [basic];

    if(t>60) deck.push({id:'smash', name:"Smash", type:"phys", mp:4, pwr:1.7, acc:0.75, cap:0.7, desc:"強打(70%)"});
    else if(t<40) deck.push({id:'ice', name:"IceBolt", type:"mag", mp:8, pwr:1.3, acc:1.0, desc:"氷魔法"});
    else deck.push({id:'fire', name:"FireBlade", type:"hyb", mp:8, pwr:1.5, acc:0.95, desc:"炎剣"});
    
    if(d>60) deck.push({id:'guard', name:"Guard", type:"def", mp:0, pwr:0, acc:1.0, desc:"防御"});
    else if(d<40) deck.push({id:'trip', name:"Trip", type:"def", mp:3, pwr:0, acc:0.8, desc:"足払(行動阻止)"});
    else deck.push({id:'parry', name:"Parry", type:"buff", mp:0, pwr:0, acc:1.0, desc:"パリィ(0MP)"});
    
    if(r>60) deck.push({id:'snipe', name:"Snipe", type:"phys", mp:4, pwr:1.0, acc:1.0, desc:"必中"});
    else if(r<40) deck.push({id:'heal', name:"Heal", type:"heal", mp:8, pwr:0, acc:1.0, desc:"回復"});
    else deck.push({id:'focus', name:"Focus", type:"buff", mp:2, pwr:0, acc:1.0, desc:"集中"});

    if(g.currentJob.skill) { deck.push(g.currentJob.skill); }
    return deck;
}

function calcHit(acc, type, s, cap) {
    let r = acc; if(type==='phys'||type==='hyb') r += (s.DEX * 0.01);
    if(g.enemy) r -= g.enemy.eva;
    let res = Math.min(1.0, Math.max(0.0, r));
    if(cap !== undefined) res = Math.min(res, cap);
    return res;
}
function calcDmg(pwr, type, s) {
    if(type==='heal'||type==='def'||type==='buff') return {min:0,max:0};
    let base = 0;
    if(type==='phys') base=s.STR; else if(type==='mag') base=s.INT; else if(type==='hyb') base=(s.STR+s.INT)*0.6;
    else if(type==='bomb') return {min:30, max:30};
    const jb = g.currentJob.bonus; let mod = 1.0;
    if(type==='phys' && jb.phys) mod *= jb.phys; if(type==='mag' && jb.mag) mod *= jb.mag;
    let val = Math.floor(base * pwr * mod); if(val < 1) val = 1;
    if(!g.enemy) return {min:0, max:0};
    let def = 0;
    if(type==='phys'||type==='hyb') def=(g.enemy.lv*1.5)*(g.enemy.defMod||1); else if(type==='mag') def=(g.enemy.lv*1.0)*(g.enemy.mDefMod||1);
    const net = Math.max(1, val - Math.floor(def/2));
    return {min:Math.floor(net*0.9), max:Math.floor(net*1.1)};
}

function log(msg, cls="") { const d=document.createElement('div'); d.className=cls; d.innerText=msg; document.getElementById('log-list').prepend(d); }
function consumeTime(v) {
    if(g.gameOver) return false;
    g.turns -= v; if(g.turns<=0) { g.gameOver=true; log("寿命が尽きた...","l-red"); updateUI(); return false; } return true;
}

function actExplore() {
    if(g.gameOver || !consumeTime(1)) return;
    g.searchCount = (g.searchCount||0)+1;
    if(!g.stairsFound && g.searchCount >= 20) { g.stairsFound=true; log("やっと階段発見(天井)","l-grn"); updateUI(); return; }
    const r = Math.random();
    if(r<0.6) startBattle(); else if(r<0.7) startChest();
    else if(r<0.8) {
        const k=['T','D','R'][Math.floor(Math.random()*3)]; const v=Math.random()<.5?5:-5;
        g.axis[k]=Math.max(0,Math.min(100, g.axis[k]+v)); log("磁場異常！性格変動","l-yel");
    } else {
        if(!g.stairsFound) { g.stairsFound=true; log("階段発見","l-grn"); } else { g.exp+=5; log("瓦礫(Exp微増)","l-gry"); }
    }
    updateUI();
}
function startBattle(fE=null) {
    let e; if(fE) e=fE;
    else { const lv=g.floor+Math.floor(Math.random()*2); const t=ENEMY_TYPES[Math.floor(Math.random()*ENEMY_TYPES.length)]; e={...t, lv:lv, type:t.id, mhp:Math.floor((20+lv*8)*t.hpMod), hp:Math.floor((20+lv*8)*t.hpMod), atk:5+lv*2}; }
    g.enemy=e; g.isCharging=false; g.isStunned=false; g.parryActive=false; g.state='BATTLE';
    log(`[遭遇] ${e.name} Lv${e.lv}`, e.isBoss?"l-boss":"l-red"); updateUI();
}
function startChest() { g.state='CHEST'; g.chest={ trap:Math.random()<0.5, item:Object.keys(ITEM_DATA)[Math.floor(Math.random()*4)], identified:false, inspected:false }; log("宝箱発見","l-yel"); }

function actBattle(sk) {
    if(g.gameOver || !g.enemy || g.enemy.hp<=0 || g.state!=='BATTLE') return;
    g.mp -= sk.mp; const s = getStats();
    
    if(sk.type==='heal') {
        const v = Math.floor((20*g.currentJob.bonus.heal||20)+s.MND*2); g.hp=Math.min(g.mhp, g.hp+v); log(`HP${v}回復`,"l-grn"); enemyTurn(); updateUI(); return;
    }
    if(sk.id==='trip') {
        if(Math.random() < 0.8) { g.enemy.isStunned=true; log("足払い成功！","l-grn"); } else log("足払い失敗","l-gry");
        enemyTurn(); updateUI(); return;
    }
    if(sk.id==='parry') { g.parryActive = true; log("構えた！(Parry)","l-grn"); enemyTurn(); updateUI(); return; }
    if(sk.type==='def'||sk.type==='buff') { log(`${sk.name}!`,"l-grn"); enemyTurn(true); updateUI(); return; }

    if(sk.isInstantDeath) {
        let rate = 0.5; 
        if(g.enemy.isBoss) rate = (g.floor===5) ? 0.10 : 0.03;
        if(Math.random() < rate) {
            log(`即死発動！！ ${g.enemy.name}を葬った！`,"l-kill"); g.enemy.hp=0; winBattle(); updateUI(); return;
        } else {
            log("即死失敗... (1dmg)","l-gry"); g.enemy.hp-=1;
        }
    } else {
        const hit = calcHit(sk.acc, sk.type, s, sk.cap);
        if(Math.random() > hit) log("ミス！","l-gry");
        else {
            const range = calcDmg(sk.pwr, sk.type, s);
            let dmg = Math.floor(range.min + Math.random()*(range.max-range.min+1));
            let cr=0.05; if(sk.id==='snipe') cr=0.3; if(g.currentJob.bonus.crit) cr+=g.currentJob.bonus.crit;
            if(Math.random()<cr) { dmg=Math.floor(dmg*1.5); log("Critical!!","l-red"); }
            g.enemy.hp -= dmg; log(`${sk.name}! ${dmg}dmg`,"l-blu");
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
    if(g.enemy.isStunned) { log("敵は動けない...","l-grn"); g.enemy.isStunned = false; return; }
    
    const s = getStats();
    const agiDiff = Math.max(0, s.AGI - (g.enemy.lv*4));
    if(Math.random() < agiDiff*0.01) { log("敵を置き去りにした！","l-spd"); return; }

    if(g.isCharging) {
        g.isCharging = false;
        let dmg = Math.floor(g.enemy.atk * 3);
        if(g.currentJob.bonus.def) dmg = Math.floor(dmg * g.currentJob.bonus.def);
        if(guard) dmg = Math.floor(dmg/3);
        else if(g.parryActive) { 
            g.parryActive=false; 
            const cut = 0.3 + Math.random()*0.7; 
            const just = cut>0.95; 
            let cutDmg = Math.floor(dmg * (1.0 - cut));
            log(`Parry! 軽減${Math.floor(cut*100)}%`,"l-blu");
            dmg = cutDmg;
            if(just) { 
                const counter = Math.floor(s.DEX*2); g.enemy.hp -= counter; log(`反撃！ ${counter}dmg`,"l-grn"); 
                if(g.enemy.hp<=0){winBattle();return;} 
            }
        }
        g.hp -= dmg; log(`【溜め攻撃】 ${dmg}dmg!!`,"l-dmg");
        if(g.hp<=0) { g.gameOver=true; log("敗北...","l-red"); }
        return;
    }

    const acts = g.enemy.act || ['atk'];
    const act = acts[Math.floor(Math.random()*acts.length)];

    if(act === 'heal') {
        let h = Math.floor(g.enemy.mhp * 0.15); g.enemy.hp = Math.min(g.enemy.mhp, g.enemy.hp + h);
        log(`再生(+${h})`, "l-red"); return;
    }
    if(act === 'charge') { g.isCharging = true; log(`力を溜めている...！`,"l-chg"); return; }

    let eva = s.AGI*0.015; if(g.currentJob.bonus.eva) eva+=g.currentJob.bonus.eva;
    if(act==='atk' && !guard && !g.parryActive && Math.random()<eva) { log("回避！","l-grn"); return; }

    let dmg = 0;
    if(act === 'mag') { dmg = Math.max(5, g.enemy.atk - Math.floor(s.MND/2)); log(`呪い！`,"l-dmg"); } 
    else { dmg = Math.max(1, g.enemy.atk - Math.floor(s.VIT/3)); }
    
    if(g.currentJob.bonus.def && act==='atk') dmg = Math.floor(dmg * g.currentJob.bonus.def);
    if(guard && act==='atk') dmg = Math.floor(dmg/2);

    if(g.parryActive && act==='atk') {
        g.parryActive = false;
        const cut = 0.3 + Math.random()*0.7;
        const just = cut > 0.95;
        const cutDmg = Math.floor(dmg * (1.0 - cut));
        log(`Parry! 軽減${Math.floor(cut*100)}%`,"l-blu");
        dmg = cutDmg;
        if(just) { const counter = Math.floor(s.DEX*2); g.enemy.hp -= counter; log(`反撃！ ${counter}dmg`,"l-grn"); if(g.enemy.hp<=0){winBattle();return;} }
    }

    g.hp -= dmg; log(`被弾 ${dmg}dmg`,"l-dmg");
    if(g.hp<=0) { g.gameOver=true; log("敗北...","l-red"); }
}

function winBattle() {
    const gain = 15 + g.enemy.lv*5; g.exp+=gain;
    if(g.currentJob.bonus.time) { g.turns = Math.min(g.maxTurns, g.turns+1); log(`勝利(Exp+${gain}, 寿命+1)`, "l-grn"); }
    else { log(`勝利(Exp+${gain}, 寿命-2)`, "l-grn"); consumeTime(2); }

    if(g.enemy.isBoss && g.floor===5) {
        g.state='EXPLORE'; g.enemy=null; log("中ボス撃破！6階へ","l-boss");
        g.floor++; g.stairsFound=false; g.searchCount=0;
        log("全回復！","l-grn"); g.hp=g.mhp; g.mp=g.mmp; 
        saveGame();
    } else if(g.enemy.isBoss && g.floor===10) {
        g.state='EXPLORE'; g.enemy=null; g.gameOver=true;
        log("魔王撃破！ALL CLEAR!!","l-boss");
        document.getElementById('cmd-grid').innerHTML = `<button class="cmd-btn" style="grid-column:1/-1; border-color:#ff0; color:#ff0;" onclick="resetGame()">THE END (Reset)</button>`;
        return;
    } else {
        g.state='EXPLORE'; g.enemy=null;
        if(Math.random()<0.1) { 
            const items = Object.keys(ITEM_DATA);
            const it = items[Math.floor(Math.random()*items.length)];
            if(it === 'clock') { g.turns = Math.min(g.maxTurns, g.turns + 10); log("時計発見! 寿命+10", "l-yel"); }
            else {
                if(g.items[it] < CONF.itemMax) { g.items[it]++; log(`${ITEM_DATA[it].name}取得`, "l-yel"); }
                else { log(`${ITEM_DATA[it].name}は持てない`, "l-gry"); }
            }
        }
    }
    if(g.exp>=g.next) { g.exp-=g.next; g.next=Math.floor(g.next*1.2); g.lv++; showLvUp(); }
}

function actInspect() { if(g.gameOver) return; if(g.mp<2){log("MP不足","l-gry");return;} g.mp-=2; const s=getStats(); g.chest.inspected=true; if(Math.random()<(30+s.INT*2)/100) { g.chest.identified=true; log("鑑定成功","l-blu"); } else log("不明...","l-gry"); updateUI(); }
function actDisarm() { if(g.gameOver) return; if(g.mp<3){log("MP不足","l-gry");return;} g.mp-=3; const s=getStats(); if(Math.random()<(30+s.DEX*2)/100) { log("解除成功","l-grn"); g.chest.trap=false; actOpen(false); } else { log("失敗!","l-red"); actOpen(true); } }
function actOpen(f) {
    if(g.gameOver) return;
    if(g.chest.trap||f) { const d=10+g.floor*2; g.hp-=d; log(`爆発! ${d}dmg`,"l-dmg"); if(g.hp<=0){g.gameOver=true; updateUI(); return;} }
    const it = g.chest.item;
    if(it === 'clock') { g.turns = Math.min(g.maxTurns, g.turns + 10); log("時計発見! 寿命+10", "l-yel"); }
    else {
        if(g.items[it] < CONF.itemMax) { g.items[it]++; log(`${ITEM_DATA[it].name}入手`, "l-yel"); }
        else { log(`${ITEM_DATA[it].name}は持てない`, "l-gry"); }
    }
    g.state='EXPLORE'; g.chest=null; updateUI();
}
function useItem(k) {
    if(g.gameOver) return;
    if(k==='bomb' && (!g.enemy||g.state!=='BATTLE')) { log("敵がいない","l-gry"); return; }
    if(g.state==='BATTLE' && !['bomb','potion','ether'].includes(k)) { log("
