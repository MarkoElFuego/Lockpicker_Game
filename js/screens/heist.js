// ============================================================
// HEIST SCREEN
// Manages puzzle layer sequencing for a mission.
// Each building has N puzzle layers. Complete all to win.
// Now includes countdown timer for urgency.
// ============================================================

const HeistScreen = {
    mission: null,
    currentLayer: 0,
    totalLayers: 0,
    activePuzzle: null,
    toolBonuses: {},

    // Timer
    timerTotal: 0,
    timerRemaining: 0,
    timerInterval: null,
    timerWarned: false,

    init(mission, gameState) {
        this.mission = mission;
        this.currentLayer = 0;
        this.totalLayers = mission.puzzleLayers.length;
        this.activePuzzle = null;
        this.timerWarned = false;

        // Calculate tool bonuses
        this.toolBonuses = this.calculateBonuses(gameState);

        // Calculate timer: base time per layer + bonus
        const baseTime = this.totalLayers * 30; // 30s per layer
        const difficultyBonus = this.totalLayers * 10; // extra 10s per layer for multi-layer
        this.timerTotal = baseTime + difficultyBonus;
        this.timerRemaining = this.timerTotal;

        // Update header
        document.getElementById("heist-location").textContent = mission.name;
        this.updateLayerDisplay();
        this.updateTimerDisplay();

        // Render tool bar
        this.renderTools(gameState);

        // Show tutorial then start first puzzle
        this.startWithTutorial();
    },

    async startWithTutorial() {
        const layerInfo = this.mission.puzzleLayers[this.currentLayer];
        await Tutorial.show(layerInfo.type);
        this.startLayer();
        this.startTimer();
    },

    calculateBonuses(gameState) {
        const bonuses = {};
        const tools = gameState.tools;

        if (tools.basic_pick.owned && tools.basic_pick.level > 0) {
            bonuses.slowdown = ITEMS.tools.basic_pick.effectValue[tools.basic_pick.level - 1];
        }
        if (tools.tension_wrench.owned && tools.tension_wrench.level > 0) {
            bonuses.extraTolerance = ITEMS.tools.tension_wrench.effectValue[tools.tension_wrench.level - 1];
        }
        if (tools.decoder.owned && tools.decoder.level > 0) {
            bonuses.revealDigits = ITEMS.tools.decoder.effectValue[tools.decoder.level - 1];
        }
        if (tools.stethoscope.owned && tools.stethoscope.level > 0) {
            bonuses.extraShowTime = ITEMS.tools.stethoscope.effectValue[tools.stethoscope.level - 1] * 1000;
        }
        if (tools.blueprint.owned && tools.blueprint.level > 0) {
            bonuses.extraShowTime = (bonuses.extraShowTime || 0) +
                ITEMS.tools.blueprint.effectValue[tools.blueprint.level - 1] * 1000;
        }

        return bonuses;
    },

    // ---- TIMER ----
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timerRemaining--;
            this.updateTimerDisplay();

            // Warning at 25%
            if (!this.timerWarned && this.timerRemaining <= this.timerTotal * 0.25) {
                this.timerWarned = true;
                Haptics.heavy();
                Particles.flash("rgba(231, 76, 60, 0.15)", 200);
            }

            if (this.timerRemaining <= 0) {
                this.stopTimer();
                this.timeUp();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    updateTimerDisplay() {
        const el = document.getElementById("heist-timer");
        if (!el) return;
        const mins = Math.floor(this.timerRemaining / 60);
        const secs = this.timerRemaining % 60;
        el.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;

        // Color based on remaining time
        const pct = this.timerRemaining / this.timerTotal;
        if (pct <= 0.15) {
            el.className = "heist-timer timer-critical";
        } else if (pct <= 0.25) {
            el.className = "heist-timer timer-warning";
        } else {
            el.className = "heist-timer";
        }
    },

    timeUp() {
        if (this.activePuzzle) {
            this.activePuzzle.stop();
            this.activePuzzle = null;
        }

        AudioManager.play("lock_fail");
        Haptics.alarm();
        Animations.shake(document.getElementById("heist-puzzle-area"), 12, 500);
        Particles.flash("rgba(231, 76, 60, 0.3)", 500);

        setTimeout(() => {
            if (this.onFail) {
                this.onFail(this.mission, this.currentLayer, this.totalLayers);
            }
        }, 800);
    },

    updateLayerDisplay() {
        const el = document.getElementById("heist-layers");
        el.innerHTML = "";

        // Timer element
        const timer = document.createElement("span");
        timer.id = "heist-timer";
        timer.className = "heist-timer";
        el.appendChild(timer);

        for (let i = 0; i < this.totalLayers; i++) {
            const dot = document.createElement("span");
            dot.className = "layer-dot";
            if (i < this.currentLayer) dot.classList.add("layer-complete");
            else if (i === this.currentLayer) dot.classList.add("layer-active");
            el.appendChild(dot);
        }

        // Layer type label
        if (this.currentLayer < this.totalLayers) {
            const layerInfo = this.mission.puzzleLayers[this.currentLayer];
            const label = document.createElement("span");
            label.className = "layer-label";
            label.textContent = ` Layer ${this.currentLayer + 1}: ${this.getPuzzleName(layerInfo.type)}`;
            el.appendChild(label);
        }
    },

    getPuzzleName(type) {
        const names = {
            slider: "Pin Tumbler",
            rotation: "Dial Lock",
            memory: "Tumbler Match",
            pattern: "Circuit Trace",
            cracker: "Code Breaker"
        };
        return names[type] || type;
    },

    renderTools(gameState) {
        const container = document.getElementById("heist-tools");
        container.innerHTML = "";

        if (gameState.tools.dynamite.owned && gameState.tools.dynamite.quantity > 0) {
            const btn = document.createElement("button");
            btn.className = "btn btn-tool";
            btn.textContent = `Dynamite (${gameState.tools.dynamite.quantity})`;
            btn.onclick = () => {
                if (this.onUseDynamite) this.onUseDynamite();
            };
            container.appendChild(btn);
        }
    },

    startLayer() {
        if (this.currentLayer >= this.totalLayers) {
            this.stopTimer();
            if (this.onComplete) this.onComplete(this.mission);
            return;
        }

        const layerInfo = this.mission.puzzleLayers[this.currentLayer];
        const canvas = document.getElementById("puzzle-canvas");

        const container = document.getElementById("heist-puzzle-area");
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        switch (layerInfo.type) {
            case "slider":
                this.activePuzzle = new SliderPuzzle(canvas, layerInfo.difficulty, this.toolBonuses);
                break;
            case "rotation":
                this.activePuzzle = new RotationPuzzle(canvas, layerInfo.difficulty, this.toolBonuses);
                break;
            case "memory":
                this.activePuzzle = new MemoryPuzzle(canvas, layerInfo.difficulty, this.toolBonuses);
                break;
            case "pattern":
                this.activePuzzle = new PatternPuzzle(canvas, layerInfo.difficulty, this.toolBonuses);
                break;
            case "cracker":
                this.activePuzzle = new CrackerPuzzle(canvas, layerInfo.difficulty, this.toolBonuses);
                break;
        }

        this.activePuzzle.onComplete = () => {
            this.layerComplete();
        };

        this.updateLayerDisplay();
        this.updateTimerDisplay();
        this.activePuzzle.start();
    },

    layerComplete() {
        AudioManager.play("layer_complete");
        Haptics.success();

        if (this.activePuzzle) {
            this.activePuzzle.stop();
            this.activePuzzle = null;
        }

        const puzzleArea = document.getElementById("heist-puzzle-area");
        const rect = puzzleArea.getBoundingClientRect();
        Particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
        Particles.flash("rgba(46, 204, 113, 0.15)", 200);

        // Bonus time for completing layer
        this.timerRemaining = Math.min(this.timerRemaining + 10, this.timerTotal);

        this.currentLayer++;

        if (this.currentLayer >= this.totalLayers) {
            this.stopTimer();
            this.updateLayerDisplay();
            Animations.celebrate();
            setTimeout(() => {
                if (this.onComplete) this.onComplete(this.mission);
            }, 800);
        } else {
            this.updateLayerDisplay();
            this.updateTimerDisplay();

            Particles.starBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);

            setTimeout(() => {
                this.startLayer();
            }, 800);
        }
    },

    skipLayer() {
        if (this.activePuzzle) {
            this.activePuzzle.stop();
            this.activePuzzle = null;
        }
        this.layerComplete();
    },

    cleanup() {
        this.stopTimer();
        if (this.activePuzzle) {
            this.activePuzzle.stop();
            this.activePuzzle = null;
        }
    },

    onComplete: null,
    onFail: null,
    onUseDynamite: null
};
