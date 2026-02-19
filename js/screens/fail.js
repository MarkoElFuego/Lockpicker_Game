// ============================================================
// FAIL / GAME OVER SCREEN
// Shown when player runs out of time on a puzzle.
// Dramatic "DETECTED" screen with retry option.
// ============================================================

const FailScreen = {
    mission: null,
    layersCompleted: 0,
    totalLayers: 0,

    init(mission, layersCompleted, totalLayers) {
        this.mission = mission;
        this.layersCompleted = layersCompleted;
        this.totalLayers = totalLayers;

        // Set fail icon (alarm/siren)
        document.getElementById("fail-icon").textContent = "\uD83D\uDEA8";

        // Randomize fail message
        const messages = [
            "Security alerted. You've been spotted.",
            "The alarm triggered. Time ran out.",
            "Locks reset. The window has closed.",
            "Too slow. The guards are coming.",
            "Detection imminent. Abort mission."
        ];
        document.getElementById("fail-subtitle").textContent =
            messages[Math.floor(Math.random() * messages.length)];

        // Stats
        const statsEl = document.getElementById("fail-stats");
        statsEl.innerHTML = `
            <div class="fail-stat">
                <span class="fail-stat-label">Layers Cracked</span>
                <span class="fail-stat-value">${layersCompleted} / ${totalLayers}</span>
            </div>
            <div class="fail-stat">
                <span class="fail-stat-label">Location</span>
                <span class="fail-stat-value">${mission.name}</span>
            </div>
        `;

        // Effects
        Haptics.alarm();
        Particles.flash("rgba(231, 76, 60, 0.3)", 400);

        this.bindEvents();
    },

    bindEvents() {
        document.getElementById("btn-fail-retry").onclick = () => {
            if (this.onRetry) this.onRetry(this.mission);
        };

        document.getElementById("btn-fail-map").onclick = () => {
            if (this.onBackToMap) this.onBackToMap();
        };
    },

    onRetry: null,
    onBackToMap: null
};
