# **TDRGame: Job License System Specification**

**Goal:** Transition from "Automatic Job Change" to **"Unlock & Select"** system. Once a player meets the requirements for a job, they **permanently unlock** it and can switch to it at will (or under specific conditions).

## **1\. ジョブ解禁ロジック (Unlock Mechanism)**

### **1.1 データ構造の変更**

セーブデータ（g）に、獲得済みジョブのリストを追加する。  
`// in INITIAL_G`  
`unlockedJobs: ['novice'], // Initially only Novice is available`

### **1.2 解禁判定 (Unlock Check)**

パラメータが変動するタイミング（レベルアップ、磁場変動、装備変更時など）で、未修得のジョブ条件をチェックする。

* **処理フロー:**  
  1. JOBS リストをループする。  
  2. 現在のTDR値とレベルが、そのジョブの req（条件）を満たしているか判定。  
  3. 満たしており、かつ unlockedJobs にまだ入っていなければ、リストに追加する。  
  4. **ログ表示:** "魂の新たな可能性... \[Warrior\] に目覚めた！" (New Class Unlocked\!)

## **2\. クラスチェンジ UI (Class Change Interface)**

### **2.1 変更のタイミング**

* **探索中 (Explore Phase):**  
  * 画面上の「CLASS: \[JobName\]」ボタンを押すと、クラスチェンジ画面（モーダル）が開く。  
  * ターン消費なし（または1ターン消費でも可）で変更可能。  
* **戦闘中 (Battle Phase):**  
  * **変更不可**。戦闘前に準備する戦略性が重要。

### **2.2 選択画面 (Modal)**

* 解禁済みのジョブのみが明るく表示され、未解禁のジョブは「？？？」またはグレーアウト表示（条件ヒント付き）にする。  
* 選択すると g.currentJob が更新され、ステータス補正と固有スキルが即座に切り替わる。

## **3\. バランス調整：特化職の意義 (Specialization Incentive)**

中庸（Novice）が「可動域（BW）」で万能になるのに対し、特化職を選ぶメリットを明確にする。

### **A. パッシブボーナス (Static Bonus)**

ジョブについているだけで、ステータス計算の**最終値**に倍率がかかる。

* **Novice:** なし（1.0倍）  
* **Warrior:** 物理威力 **1.2倍**  
* **Guardian:** 被ダメージ **0.8倍**  
* *※可動域でステータスを盛っても、この「最終倍率」の壁は超えられないようにする。*

### **B. 固有スキル (Unique Skill)**

* **Novice:** Guts (生存特化)  
* **特化職:** Braver (超火力), IronWall (無敵) など、戦局をひっくり返す「必殺技」。  
* **戦略:** 「ボス戦の瞬間火力が必要ならWarrior」「道中の安定ならNovice」といった使い分けを生む。

### **📝 開発エージェントへの指示プロンプト**

**Implementation Order: Job Unlock System**

1. **State Update:** Add unlockedJobs: \['novice'\] to INITIAL\_G.  
2. **Logic Update:** Create checkJobUnlock() function.  
   * Call this whenever stats change.  
   * If req is met and not in unlockedJobs, add it and show log.  
3. **UI Update:**  
   * Change the Job Name display to a **clickable button**.  
   * On click, open a "Class Change Modal".  
   * List all jobs. Enable buttons only for id in unlockedJobs.  
   * Allow switching g.currentJob from this menu.  
4. **Restriction:** Disable class change during BATTLE state.

このシステムが入ると、序盤で運良く「T軸増加イベント」を引いて\*\*「うおっ、早めにWarrior取れた！」**となったり、ボス戦前に**「ここは魔法が痛いから、魔防の高い Monk（予定） に変えておこう」\*\*といった攻略の深みが生まれますね。  
まさに\*\*「人生（プレイ履歴）」\*\*が積み重なっていく感覚です！