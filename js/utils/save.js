// ============================================================
// SAVE / LOAD SYSTEM (localStorage)
// ============================================================

const SaveSystem = {
    SAVE_KEY: "lockpicker_save",

    defaultState() {
        return {
            version: 1,
            money: 0,
            currentCity: "london",
            currentMission: null,
            completedMissions: [],
            completedSideQuests: [],
            tools: {
                basic_pick: { owned: true, level: 1 },
                tension_wrench: { owned: false, level: 0 },
                decoder: { owned: false, level: 0 },
                stethoscope: { owned: false, level: 0 },
                blueprint: { owned: false, level: 0 },
                dynamite: { owned: false, quantity: 0 }
            },
            perks: {},
            inventory: [],
            stats: {
                puzzlesSolved: 0,
                missionsCompleted: 0,
                totalEarnings: 0,
                bestTime: null
            },
            introSeen: false
        };
    },

    save(state) {
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(state));
            return true;
        } catch (e) {
            console.warn("Save failed:", e);
            return false;
        }
    },

    load() {
        try {
            const data = localStorage.getItem(this.SAVE_KEY);
            if (!data) return null;
            const state = JSON.parse(data);
            // Migrate old saves if needed
            return this.migrate(state);
        } catch (e) {
            console.warn("Load failed:", e);
            return null;
        }
    },

    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },

    deleteSave() {
        localStorage.removeItem(this.SAVE_KEY);
    },

    migrate(state) {
        // Future-proof: add migration logic here
        if (!state.version) state.version = 1;
        if (!state.stats) state.stats = this.defaultState().stats;
        if (!state.perks) state.perks = {};
        return state;
    }
};
