// ============================================================
// HEIST SCREEN
// Manages puzzle layer sequencing for a mission.
// Each building has N puzzle layers. Complete all to win.
// ============================================================

const HeistScreen = {
    mission: null,
    currentLayer: 0,
    totalLayers: 0,
    activePuzzle: null,
    toolBonuses: {},

    init(mission, gameState) {
        this.mission = mission;
        this.currentLayer = 0;
        this.totalLayers = mission.puzzleLayers.length;
        this.activePuzzle = null;

        // Calculate tool bonuses
        this.toolBonuses = this.calculateBonuses(gameState);

        // Update header
        document.getElementById("heist-location").textContent = mission.name;
        this.updateLayerDisplay();

        // Render tool bar
        this.renderTools(gameState);

        // Start first puzzle
        this.startLayer();
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

    updateLayerDisplay() {
        const el = document.getElementById("heist-layers");
        el.innerHTML = "";
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

        // Dynamite button (if owned)
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
            // All layers complete!
            if (this.onComplete) this.onComplete(this.mission);
            return;
        }

        const layerInfo = this.mission.puzzleLayers[this.currentLayer];
        const canvas = document.getElementById("puzzle-canvas");

        // Resize canvas to container
        const container = document.getElementById("heist-puzzle-area");
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Create puzzle instance
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
        this.activePuzzle.start();
    },

    layerComplete() {
        AudioManager.play("layer_complete");

        if (this.activePuzzle) {
            this.activePuzzle.stop();
            this.activePuzzle = null;
        }

        // Sparkle effect on puzzle area
        const puzzleArea = document.getElementById("heist-puzzle-area");
        const rect = puzzleArea.getBoundingClientRect();
        Particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
        Particles.flash("rgba(46, 204, 113, 0.15)", 200);

        this.currentLayer++;

        if (this.currentLayer >= this.totalLayers) {
            // Mission complete! Full celebration
            this.updateLayerDisplay();
            Animations.celebrate();
            setTimeout(() => {
                if (this.onComplete) this.onComplete(this.mission);
            }, 800);
        } else {
            // Next layer after brief pause
            this.updateLayerDisplay();

            // Star burst between layers
            Particles.starBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);

            setTimeout(() => {
                this.startLayer();
            }, 800);
        }
    },

    skipLayer() {
        // Used by dynamite
        if (this.activePuzzle) {
            this.activePuzzle.stop();
            this.activePuzzle = null;
        }
        this.layerComplete();
    },

    cleanup() {
        if (this.activePuzzle) {
            this.activePuzzle.stop();
            this.activePuzzle = null;
        }
    },

    onComplete: null,
    onUseDynamite: null
};
