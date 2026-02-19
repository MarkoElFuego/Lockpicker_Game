// ============================================================
// MAIN GAME ENGINE
// State machine that manages all screens and game flow.
// States: TITLE -> BRIEFING -> MAP -> HEIST -> REWARD -> MAP...
// ============================================================

const Game = {
    state: null,        // Current game save state
    currentScreen: "screen-title",
    activeMission: null,
    activeSideQuest: null,

    // ---- INITIALIZATION ----
    init() {
        AudioManager.init();
        Particles.init();
        Tutorial.init();

        // Load settings
        this.applySettings();

        // Check for existing save
        if (SaveSystem.hasSave()) {
            document.getElementById("btn-continue").style.display = "";
        }

        this.bindTitleEvents();
    },

    applySettings() {
        try {
            const data = localStorage.getItem("lockpicker_settings");
            if (data) {
                const s = JSON.parse(data);
                if (s.sfx === false) AudioManager.muted = true;
                if (s.vibration === false) Haptics.enabled = false;
            }
        } catch (e) {}
    },

    bindTitleEvents() {
        document.getElementById("btn-new-game").onclick = () => {
            Haptics.medium();
            this.newGame();
        };

        document.getElementById("btn-continue").onclick = () => {
            Haptics.medium();
            this.continueGame();
        };
    },

    // ---- NEW GAME ----
    newGame() {
        SaveSystem.deleteSave();
        this.state = SaveSystem.defaultState();
        SaveSystem.save(this.state);
        this.startIntro();
    },

    // ---- CONTINUE ----
    continueGame() {
        this.state = SaveSystem.load();
        if (!this.state) {
            this.newGame();
            return;
        }
        this.goToMap();
    },

    // ---- INTRO SEQUENCE ----
    async startIntro() {
        const handler = LEVELS[this.state.currentCity].handler;
        const introLines = DIALOGUE[handler].intro;

        await Animations.transitionTo(this.currentScreen, "screen-briefing");
        this.currentScreen = "screen-briefing";

        BriefingScreen.onComplete = () => {
            this.state.introSeen = true;
            SaveSystem.save(this.state);
            this.goToMap();
        };

        BriefingScreen.init(handler, introLines);
    },

    // ---- MAP ----
    async goToMap() {
        await Animations.transitionTo(this.currentScreen, "screen-map");
        this.currentScreen = "screen-map";

        MapScreen.onSelectMission = (building) => {
            this.startMissionBriefing(building);
        };

        MapScreen.onSelectSideQuest = (questId) => {
            this.startSideQuest(questId);
        };

        MapScreen.onOpenShop = () => {
            this.goToShop();
        };

        MapScreen.onOpenStats = () => {
            this.goToStats();
        };

        MapScreen.onOpenSettings = () => {
            this.goToSettings();
        };

        MapScreen.init(this.state);
    },

    // ---- MISSION BRIEFING ----
    async startMissionBriefing(building) {
        this.activeMission = building;

        const handler = LEVELS[this.state.currentCity].handler;
        const briefingLines = DIALOGUE[handler].missionBriefings[building.id];

        if (!briefingLines) {
            this.startHeist(building);
            return;
        }

        await Animations.transitionTo(this.currentScreen, "screen-briefing");
        this.currentScreen = "screen-briefing";

        BriefingScreen.onComplete = () => {
            this.startHeist(building);
        };

        BriefingScreen.init(handler, briefingLines);
    },

    // ---- HEIST ----
    async startHeist(building) {
        await Animations.transitionTo(this.currentScreen, "screen-heist");
        this.currentScreen = "screen-heist";

        HeistScreen.onComplete = (mission) => {
            this.missionComplete(mission);
        };

        HeistScreen.onFail = (mission, layersCompleted, totalLayers) => {
            this.missionFailed(mission, layersCompleted, totalLayers);
        };

        HeistScreen.onUseDynamite = () => {
            if (this.state.tools.dynamite.quantity > 0) {
                this.state.tools.dynamite.quantity--;
                Haptics.heavy();
                SaveSystem.save(this.state);
                HeistScreen.skipLayer();
                HeistScreen.renderTools(this.state);
            }
        };

        HeistScreen.init(building, this.state);
    },

    // ---- MISSION COMPLETE ----
    async missionComplete(mission) {
        if (!this.state.completedMissions.includes(mission.id)) {
            this.state.completedMissions.push(mission.id);
        }
        this.state.stats.missionsCompleted++;
        Haptics.celebrate();

        await Animations.transitionTo(this.currentScreen, "screen-reward");
        this.currentScreen = "screen-reward";

        RewardScreen.onCollect = (amount, doubled) => {
            this.collectReward(mission, amount, doubled);
        };

        RewardScreen.init(mission, this.state);
    },

    // ---- MISSION FAILED ----
    async missionFailed(mission, layersCompleted, totalLayers) {
        await Animations.transitionTo(this.currentScreen, "screen-fail");
        this.currentScreen = "screen-fail";

        FailScreen.onRetry = (m) => {
            this.startHeist(m);
        };

        FailScreen.onBackToMap = () => {
            this.goToMap();
        };

        FailScreen.init(mission, layersCompleted, totalLayers);
    },

    // ---- COLLECT REWARD ----
    async collectReward(mission, amount, doubled) {
        this.state.money += amount;
        this.state.stats.totalEarnings += amount;
        Haptics.success();

        this.state.inventory.push({
            name: mission.loot.name,
            icon: mission.loot.icon,
            source: mission.name,
            value: Math.floor(amount * 0.5)
        });

        SaveSystem.save(this.state);

        const handler = LEVELS[this.state.currentCity].handler;
        const completionLines = DIALOGUE[handler].missionComplete[mission.id];

        if (completionLines && completionLines.length > 1) {
            await Animations.transitionTo(this.currentScreen, "screen-briefing");
            this.currentScreen = "screen-briefing";

            BriefingScreen.onComplete = () => {
                this.goToMap();
            };

            BriefingScreen.init(handler, completionLines);
        } else {
            this.goToMap();
        }
    },

    // ---- SHOP ----
    async goToShop() {
        await Animations.transitionTo(this.currentScreen, "screen-shop");
        this.currentScreen = "screen-shop";

        ShopScreen.onStateChange = (newState) => {
            this.state = newState;
            SaveSystem.save(this.state);
        };

        ShopScreen.onBack = () => {
            this.goToMap();
        };

        ShopScreen.init(this.state);
    },

    // ---- SETTINGS ----
    async goToSettings() {
        await Animations.transitionTo(this.currentScreen, "screen-settings");
        this.currentScreen = "screen-settings";

        SettingsScreen.onBack = () => {
            this.goToMap();
        };

        SettingsScreen.onReset = () => {
            window.location.reload();
        };

        SettingsScreen.init(this.state);
    },

    // ---- STATS ----
    async goToStats() {
        await Animations.transitionTo(this.currentScreen, "screen-stats");
        this.currentScreen = "screen-stats";

        StatsScreen.onBack = () => {
            this.goToMap();
        };

        StatsScreen.init(this.state);
    },

    // ---- SIDE QUESTS ----
    async startSideQuest(questId) {
        this.activeSideQuest = questId;

        await Animations.transitionTo(this.currentScreen, "screen-sidequest");
        this.currentScreen = "screen-sidequest";

        SideQuestScreen.onAccept = (qId) => {
            this.startSideQuestPuzzle(qId);
        };

        SideQuestScreen.onDecline = () => {
            this.goToMap();
        };

        SideQuestScreen.onComplete = (qId) => {
            this.completeSideQuest(qId);
        };

        SideQuestScreen.init(questId);
    },

    async startSideQuestPuzzle(questId) {
        const city = LEVELS[this.state.currentCity];
        const sqConfig = city.sideQuests.find(sq => sq.id === questId);
        if (!sqConfig) return;

        const tempMission = {
            id: questId,
            name: DIALOGUE.sideQuests[questId].name,
            puzzleLayers: [sqConfig.puzzle],
            loot: { name: "Gratitude", icon: "karma" }
        };

        await Animations.transitionTo(this.currentScreen, "screen-heist");
        this.currentScreen = "screen-heist";

        HeistScreen.onComplete = () => {
            this.sideQuestPuzzleComplete(questId);
        };

        HeistScreen.init(tempMission, this.state);
    },

    async sideQuestPuzzleComplete(questId) {
        await Animations.transitionTo(this.currentScreen, "screen-sidequest");
        this.currentScreen = "screen-sidequest";

        SideQuestScreen.showReward();
    },

    completeSideQuest(questId) {
        const city = LEVELS[this.state.currentCity];
        const sqConfig = city.sideQuests.find(sq => sq.id === questId);

        if (sqConfig) {
            this.state.money += sqConfig.reward.money || 0;

            if (sqConfig.reward.perk === "good_karma") {
                this.state.perks.good_karma = true;
            } else if (sqConfig.reward.perk === "free_dynamite") {
                if (!this.state.tools.dynamite) {
                    this.state.tools.dynamite = { owned: true, quantity: 1 };
                } else {
                    this.state.tools.dynamite.owned = true;
                    this.state.tools.dynamite.quantity = (this.state.tools.dynamite.quantity || 0) + 1;
                }
            }
        }

        if (!this.state.completedSideQuests.includes(questId)) {
            this.state.completedSideQuests.push(questId);
        }

        SaveSystem.save(this.state);
        this.goToMap();
    }
};

// ---- START ----
window.addEventListener("DOMContentLoaded", () => {
    Game.init();
});

// Handle resize
window.addEventListener("resize", () => {
    if (Game.currentScreen === "screen-heist" && HeistScreen.activePuzzle) {
        HeistScreen.activePuzzle.resize();
        HeistScreen.activePuzzle.draw();
    }
});
