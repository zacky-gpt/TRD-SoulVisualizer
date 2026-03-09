### **通常攻撃の厳密仕様 (Normal Attack Strict Spec)**

**Subject: CRITICAL CLARIFICATION \- Normal Attack Logic**

**IMPORTANT:** The "Normal Attack" logic is unique and highly specific. Please ignore standard RPG conventions and implement exactly as follows.

**1\. Concept: Spectrum Strike** The Normal Attack is a **Physical Motion** that carries **Hybrid Energy**.

* **Delivery:** Physical (Can be evaded via AGI).  
* **Payload:** Mixture of Physical and Magical damage based on the **T-Axis** ratio.

**2\. Hit Determination (Physical)** Even if the attack contains high magical energy (INT), the delivery method is a physical strike.

* **Logic:** Use **Physical Evasion Formula**.  
* *Result:* High AGI enemies (like Bats) can dodge Normal Attacks even from Wizards.

**3\. Damage Calculation (Split & Sum)** Do **NOT** average the defense stats. Calculate damage components separately against their respective counters, then sum them up.

* **Step A: Determine Ratios (T-Axis)**  
  * `Ratio_Phys = Player.Axis.T / 100`  
  * `Ratio_Mag = (100 - Player.Axis.T) / 100`  
* **Step B: Calculate Raw Components**  
  * `Raw_Phys = BaseAttackPower * Ratio_Phys`  
  * `Raw_Mag = BaseAttackPower * Ratio_Mag`  
* **Step C: Apply Defense (The Twist)**  
  * `Dmg_Phys = Raw_Phys * (1.0 - Enemy.MND_Cut_Rate)`  
    * *Physical part is blocked by MND (Fluidity).*  
  * `Dmg_Mag = Raw_Mag * (1.0 - Enemy.STR_Cut_Rate)`  
    * *Magical part is blocked by STR (Heat).*  
* **Step D: Total**  
  * `FinalDamage = Dmg_Phys + Dmg_Mag`


