# **Class 1 Monster Skill Specification**

**Goal:** Define unique skills for Class 1 enemies to highlight the TDR-Hex mechanics. These skills rely on the enemy's high stat (T/D/R) to threaten specific player builds.

## **1\. スキルデータ構造 (Data Schema)**

`ENEMY_TYPES` の `act` 配列に含まれるスキルIDに対応する詳細データ。

JavaScript  
// js/data.js (Add to SKILL\_DATA or define inside enemy logic)  
const ENEMY\_SKILLS \= {  
    // ... definition below  
};

---

## **2\. 各モンスターの特殊技詳細**

### **💧 Slime (MND特化 / 物理防壁)**

* **Skill:** **`Regenerate` (再生)**  
* **Trigger:** HPが 50% を下回った時に高確率で使用。  
* **Type:** Heal  
* **Logic:**  
  * `HealAmount = MaxHP * 0.2` (最大HPの20%回復)  
  * **Effect:** 物理でチマチマ削るプレイヤー（低DEX/低INT）を絶望させる。「火力不足だと詰む」ことを教える。

### **🌪️ Bat (AGI特化 / 回避)**

* **Skill:** **`DualWing` (二連撃)**  
* **Trigger:** ランダム (30%)  
* **Type:** Physical (Multi-hit)  
* **Logic:**  
  * `Damage = (ATK * 0.6) * 2 hits`  
  * **Effect:** 1発あたりは軽いが、2回判定があるため「回避（AGI）」が低いと削られやすい。また、こちらの「パリィ」や「回避反撃」の試行回数を増やす餌にもなる。

### **⛰️ Golem (VIT特化 / 高HP)**

* **Skill:** **`Charge` (ためる)**  
* **Trigger:** ランダム (20%)、またはHP満タン時。  
* **Type:** Buff / State Change  
* **Logic:**  
  * **Turn 1:** `isCharging = true` をセット。ログ:「ゴーレムは力を溜めている！」  
  * **Turn 2 (Attack):** 通常攻撃の **2.5倍** のダメージを与える。その後 `isCharging = false`。  
  * **Effect:** 「防御（Guard）」や「足払い（Trip）」の重要性を教える。まともに食らうと即死級。

### **⚡ Bee (DEX特化 / 貫通)**

* **Skill:** **`NeedleShot` (毒針)**  
* **Trigger:** ランダム (30%)  
* **Type:** Physical (High Crit)  
* **Logic:**  
  * **Crit Rate:** `Base(5%) + 50%` (固定で50%加算)  
  * **Def Penetration:** クリティカル時、防御力を100%無視。  
  * **Effect:** MND（物理防御）を高めたタンク殺し。「防御力だけでなくHP（VIT）も上げないと事故る」ことを教える。

### **🔥 Skeleton (STR特化 / 物理・魔防)**

* **Skill:** **`SkullBash` (強打)**  
* **Trigger:** ランダム (40%)  
* **Type:** Physical (Heavy)  
* **Logic:**  
  * **Power:** `ATK * 1.5`  
  * **Accuracy:** `75%` (固定キャップ)  
  * **Effect:** シンプルな高火力。避ける（AGI）か、受ける（VIT/MND）かの二択を迫る。

### **❄️ Magician (INT特化 / 魔攻)**

* **Skill:** **`IceBolt` (氷弾)**  
* **Trigger:** 常時 (通常攻撃の代わりに使用)  
* **Type:** Magical (Sure Hit)  
* **Logic:**  
  * **Power:** `INT * 1.2`  
  * **Hit:** **必中 (回避不可能)**  
  * **Resistance:** プレイヤーの **STR** で軽減判定を行う。  
  * **Effect:** 「回避特化（AGI）」の天敵。STR（魔法防御）を上げないと削り殺されることを教える。

---

## **📝 エージェントへの実装指示メモ**

**Implementation Note for Enemy AI:**

Please implement a simple AI router in `enemyTurn()`:

1. **Check Conditions:** e.g., If Slime HP \< 50%, 50% chance to use `Regenerate`.  
2. **Check Charge:** If `g.enemy.isCharging` is true, force a heavy attack logic (2.5x dmg) and reset flag.  
3. **Skill Selection:** If no condition met, pick a random action from `ENEMY_TYPES[id].act`.  
   * Map strings like `'mag'` to specific skill logic (e.g., Magician uses `IceBolt`).

**Key Mechanics:**

* **Bee's NeedleShot:** Must calculate Critical Chance with a massive bonus (+50%) to simulate dangerous piercing attacks.  
* **Magician's IceBolt:** Must skip the Evasion check (Always hits).

