// ============================================================
// HAPTIC FEEDBACK
// Vibration API wrapper for mobile devices.
// ============================================================

const Haptics = {
    enabled: true,

    vibrate(pattern) {
        if (!this.enabled) return;
        if (!navigator.vibrate) return;
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Silently fail
        }
    },

    // Light tap (button press, tile flip)
    light() {
        this.vibrate(10);
    },

    // Medium bump (correct answer, pin unlock)
    medium() {
        this.vibrate(25);
    },

    // Heavy thud (error, fail)
    heavy() {
        this.vibrate([40, 30, 40]);
    },

    // Success pattern (puzzle complete)
    success() {
        this.vibrate([20, 50, 20, 50, 40]);
    },

    // Celebration (mission complete, reward)
    celebrate() {
        this.vibrate([30, 40, 30, 40, 30, 40, 60]);
    },

    // Alarm (fail / detected)
    alarm() {
        this.vibrate([100, 50, 100, 50, 200]);
    },

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};
