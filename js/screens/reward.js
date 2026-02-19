// ============================================================
// REWARD / REVEAL SCREEN
// Spectacular safe opening animation, loot reveal, and
// money collection.
// ============================================================

const RewardScreen = {
    mission: null,
    lootValue: 0,

    init(mission, gameState) {
        this.mission = mission;

        // Calculate loot value
        const lootInfo = ITEMS.lootValues[mission.loot.icon] || mission.reward;
        this.lootValue = Math.floor(
            lootInfo.min + Math.random() * (lootInfo.max - lootInfo.min)
        );

        // Set up display
        document.getElementById("reward-title").textContent = "SAFE OPENED!";

        // Safe animation placeholder
        const safeEl = document.getElementById("reward-safe");
        safeEl.innerHTML = "";
        safeEl.className = "reward-safe";

        const safeDoor = document.createElement("div");
        safeDoor.className = "safe-door";
        safeDoor.innerHTML = '<div class="safe-handle"></div>';
        safeEl.appendChild(safeDoor);

        const safeInner = document.createElement("div");
        safeInner.className = "safe-inner";
        safeEl.appendChild(safeInner);

        // Loot info
        document.getElementById("reward-loot").textContent = mission.loot.name;
        document.getElementById("reward-value").textContent = "";

        // Story message from Arthur
        const handler = DIALOGUE[LEVELS[gameState.currentCity].handler];
        const completionDialogue = handler.missionComplete[mission.id];
        const message = completionDialogue
            ? completionDialogue[0]
            : "Well done, lad!";
        document.getElementById("reward-message").textContent = message;

        // Animate
        this.animate(safeEl);

        this.bindEvents();
    },

    async animate(safeEl) {
        // Wait a moment, then open safe
        await new Promise(r => setTimeout(r, 500));

        safeEl.classList.add("safe-opening");
        AudioManager.play("safe_open");

        await new Promise(r => setTimeout(r, 1000));
        safeEl.classList.add("safe-open");

        // Sparkle burst on safe opening
        const rect = safeEl.getBoundingClientRect();
        Particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
        Particles.flash("rgba(255,215,0,0.15)", 300);

        // Count up money
        await new Promise(r => setTimeout(r, 400));
        AudioManager.play("coin");
        Animations.countUp(
            document.getElementById("reward-value"),
            0, this.lootValue, 1200
        );

        // Celebration effects
        Animations.rewardCelebration();
    },

    bindEvents() {
        document.getElementById("btn-reward-collect").onclick = () => {
            if (this.onCollect) this.onCollect(this.lootValue, false);
        };

        document.getElementById("btn-reward-double").onclick = () => {
            // In real app, this would show an ad
            // For now, just double the reward
            if (this.onCollect) this.onCollect(this.lootValue * 2, true);
        };
    },

    onCollect: null
};
