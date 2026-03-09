### **戦闘メカニクス詳細修正 (Mechanics Refinement)**

**Subject: CORRECTION \- Battle Mechanics & Guts Specification**

Please update your implementation plan. The previous understanding was too simplified. Implement the logic exactly as follows to ensure game balance.

#### **1\. Critical & Penetration (DEX Interaction)**

Critical hits do **NOT** automatically ignore 100% defense. The penetration rate scales with the DEX difference.

* **Trigger Condition:**  
  * `CritRate = Base(5%) + (Attacker.DEX - Defender.DEX) * 0.02`  
* **Effect (On Critical):**  
  * Instead of ignoring defense completely, apply a **Defense Cut Rate**.  
  * `DefCutRate = 0.50 + (Attacker.DEX - Defender.DEX) * 0.01`  
  * *Min: 50%, Max: 100% (at \+50 DEX difference).*  
  * *Logic:* A master sniper (High DEX) finds the perfect gap in armor.

**2.Evasion & Counter Mechanics**

**Goal:** Refine the evasion logic to separate "Evasion" and "Counter Attack" into two distinct probability checks based on AGI difference. This prevents high AGI from being too overpowered by requiring a second check for the counterattack.

**Logic Flow (in `enemyTurn`):**

1. **Step 1: Evasion Check**  
   * Calculate `EvaChance = (Defender.AGI - Attacker.AGI) * 0.025`.  
   * If `Math.random() < EvaChance`: **Evasion Successful** (Damage \= 0).  
   * Else: Proceed to take damage.  
2. **Step 2: Counter Check (Only if Evasion Successful)**  
   * Calculate `CounterChance = (Defender.AGI - Attacker.AGI) * 0.025`. (Same formula as evasion).  
   * If `Math.random() < CounterChance`:  
     * **Trigger Counter Attack.**  
     * `Damage = Defender.AGI * 0.5` (Fixed damage).  
     * Log: "Sonic Counter\!"  
   * Else:  
     * Log: "Dodged\!" (No counter).

**Reason:** Just because you dodge doesn't mean you are in a position to strike back. A second check based on speed difference simulates the "overwhelming speed" required to counter-attack.

#### **3\. Skill: "Guts" (Novice Exclusive)**

"Guts" is **NOT a passive trait**. It is an **Active Buff Skill** with a Cooldown.

* **Type:** Active Buff (Duration: 3 turns).  
* **Cost:** 0 MP.  
* **Effect:** While active, if HP drops to \<= 0, HP becomes 1\.  
* **Cooldown Mechanics:**  
  * **Base CD:** 15 Turns.  
  * **Reduction:** CD decreases by:  
    1. Passing a turn in Battle.  
    2. **Consuming Life Limit** (Exploration/Resting).  
  * *Logic:* Time spent exploring also refreshes the fighting spirit.

**UI/Text Specification Update:**

* **Novice Description:** Should serve as a tutorial hint.  
  * *Text:* "基本職。各ジョブに強力な固有技が存在する。" (Basic job. Every job has a powerful unique skill.)  
* **Guts Description:** Should explain the unique skill mechanic.  
  * *Text:* "食いしばり(2T)。ジョブ固有技はMP不使用。" (Endure (2T). Job unique skills do not use MP.)

// Middle Path  
    {   
        id: 'novice',   
        name: 'Novice',   
        req: null,   
        bonus: {},   
        // ↓ ここを変更  
        desc: "基本職。各ジョブに強力な固有技が存在する。",   
        priority: 1,   
        skill: {  
            id: 'Guts',   
            name: "Guts",   
            type: "buff",   
            cd: 15,   
            pwr: 0,   
            acc: 1.0,   
            // ↓ ここを変更  
            desc: "食いしばり(2T)。ジョブ固有技はMP不使用。"   
        }   
    },  
