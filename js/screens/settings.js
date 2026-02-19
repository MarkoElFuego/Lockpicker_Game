// ============================================================
// SETTINGS SCREEN
// Sound, vibration, tutorials, reset progress.
// ============================================================

const SettingsScreen = {
    init(gameState) {
        this.gameState = gameState;

        // Load saved settings
        const settings = this.loadSettings();

        this.setToggle("toggle-sfx", !AudioManager.muted);
        this.setToggle("toggle-vibrate", Haptics.enabled);
        this.setToggle("toggle-music", settings.music !== false);
        this.setToggle("toggle-tutorials", settings.tutorials !== false);

        this.bindEvents();
    },

    loadSettings() {
        try {
            const data = localStorage.getItem("lockpicker_settings");
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    saveSettings(settings) {
        try {
            const current = this.loadSettings();
            const merged = { ...current, ...settings };
            localStorage.setItem("lockpicker_settings", JSON.stringify(merged));
        } catch (e) {
            // Silently fail
        }
    },

    setToggle(id, on) {
        const el = document.getElementById(id);
        if (!el) return;
        el.dataset.on = on ? "true" : "false";
    },

    getToggle(id) {
        const el = document.getElementById(id);
        return el && el.dataset.on === "true";
    },

    bindEvents() {
        // Toggle handlers
        document.getElementById("toggle-sfx").onclick = () => {
            const on = !this.getToggle("toggle-sfx");
            this.setToggle("toggle-sfx", on);
            AudioManager.muted = !on;
            this.saveSettings({ sfx: on });
            Haptics.light();
        };

        document.getElementById("toggle-vibrate").onclick = () => {
            const on = !this.getToggle("toggle-vibrate");
            this.setToggle("toggle-vibrate", on);
            Haptics.enabled = on;
            if (on) Haptics.light();
            this.saveSettings({ vibration: on });
        };

        document.getElementById("toggle-music").onclick = () => {
            const on = !this.getToggle("toggle-music");
            this.setToggle("toggle-music", on);
            if (!on) AudioManager.stopMusic();
            this.saveSettings({ music: on });
            Haptics.light();
        };

        document.getElementById("toggle-tutorials").onclick = () => {
            const on = !this.getToggle("toggle-tutorials");
            this.setToggle("toggle-tutorials", on);
            this.saveSettings({ tutorials: on });
            Haptics.light();
        };

        // Reset progress
        document.getElementById("btn-reset-progress").onclick = () => {
            const btn = document.getElementById("btn-reset-progress");
            if (btn.dataset.confirm === "true") {
                // Actually reset
                SaveSystem.deleteSave();
                localStorage.removeItem("lockpicker_settings");
                localStorage.removeItem("lockpicker_tutorials_seen");
                Haptics.heavy();
                Particles.flash("rgba(231, 76, 60, 0.3)", 300);
                btn.textContent = "Reset All Progress";
                btn.dataset.confirm = "false";
                if (this.onReset) this.onReset();
            } else {
                // First tap - confirm
                btn.textContent = "TAP AGAIN TO CONFIRM";
                btn.dataset.confirm = "true";
                Animations.shake(btn, 3, 200);
                setTimeout(() => {
                    btn.textContent = "Reset All Progress";
                    btn.dataset.confirm = "false";
                }, 3000);
            }
        };

        // Back button
        document.getElementById("btn-settings-back").onclick = () => {
            if (this.onBack) this.onBack();
        };
    },

    onBack: null,
    onReset: null
};
