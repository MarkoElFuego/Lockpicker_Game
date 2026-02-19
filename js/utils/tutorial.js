// ============================================================
// TUTORIAL OVERLAY SYSTEM
// Shows first-time instructions for each puzzle type.
// Animated hand/indicator demonstrates the mechanic.
// ============================================================

const Tutorial = {
    seen: {},

    init() {
        try {
            const data = localStorage.getItem("lockpicker_tutorials_seen");
            this.seen = data ? JSON.parse(data) : {};
        } catch (e) {
            this.seen = {};
        }
    },

    shouldShow(puzzleType) {
        // Check settings
        try {
            const settings = localStorage.getItem("lockpicker_settings");
            if (settings) {
                const parsed = JSON.parse(settings);
                if (parsed.tutorials === false) return false;
            }
        } catch (e) {}

        return !this.seen[puzzleType];
    },

    markSeen(puzzleType) {
        this.seen[puzzleType] = true;
        try {
            localStorage.setItem("lockpicker_tutorials_seen", JSON.stringify(this.seen));
        } catch (e) {}
    },

    show(puzzleType) {
        return new Promise(resolve => {
            if (!this.shouldShow(puzzleType)) {
                resolve();
                return;
            }

            const data = this.getData(puzzleType);
            if (!data) {
                resolve();
                return;
            }

            const overlay = document.getElementById("tutorial-overlay");
            document.getElementById("tutorial-title").textContent = data.title;
            document.getElementById("tutorial-text").textContent = data.text;

            // Animated demo
            const animEl = document.getElementById("tutorial-anim");
            animEl.innerHTML = data.anim;

            overlay.style.display = "flex";
            Haptics.light();

            document.getElementById("btn-tutorial-ok").onclick = () => {
                overlay.style.display = "none";
                this.markSeen(puzzleType);
                Haptics.light();
                resolve();
            };
        });
    },

    getData(type) {
        const tutorials = {
            slider: {
                title: "PIN TUMBLER",
                text: "TAP when the red marker enters the green zone. Time it right to unlock each pin!",
                anim: `<div class="tut-slider">
                    <div class="tut-track">
                        <div class="tut-zone"></div>
                        <div class="tut-marker"></div>
                    </div>
                    <div class="tut-hand">\u261D\uFE0F</div>
                </div>`
            },
            rotation: {
                title: "DIAL LOCK",
                text: "DRAG to rotate the dial. Release when the red line aligns with the green target zone.",
                anim: `<div class="tut-rotation">
                    <div class="tut-dial">
                        <div class="tut-dial-line"></div>
                        <div class="tut-dial-target"></div>
                    </div>
                    <div class="tut-hand tut-hand-drag">\u261D\uFE0F</div>
                </div>`
            },
            memory: {
                title: "TUMBLER MATCH",
                text: "Memorize the tile positions, then tap pairs to match them. Find all pairs to unlock!",
                anim: `<div class="tut-memory">
                    <div class="tut-tile tut-tile-show">I</div>
                    <div class="tut-tile tut-tile-hidden">?</div>
                    <div class="tut-tile tut-tile-hidden">?</div>
                    <div class="tut-tile tut-tile-show">I</div>
                </div>`
            },
            pattern: {
                title: "CIRCUIT TRACE",
                text: "Watch the pattern light up, then tap the nodes in the same order to trace it.",
                anim: `<div class="tut-pattern">
                    <div class="tut-node tut-node-1"></div>
                    <div class="tut-node tut-node-2"></div>
                    <div class="tut-node tut-node-3"></div>
                    <svg class="tut-path" viewBox="0 0 120 40"><line x1="20" y1="20" x2="60" y2="20" stroke="#3498db" stroke-width="3"/><line x1="60" y1="20" x2="100" y2="20" stroke="#3498db" stroke-width="3"/></svg>
                </div>`
            },
            cracker: {
                title: "CODE BREAKER",
                text: "Guess the secret code. Green = right digit, right spot. Orange = right digit, wrong spot.",
                anim: `<div class="tut-cracker">
                    <div class="tut-code">
                        <span class="tut-digit">3</span>
                        <span class="tut-digit">7</span>
                        <span class="tut-digit">1</span>
                    </div>
                    <div class="tut-feedback">
                        <span class="tut-fb-green">1</span>
                        <span class="tut-fb-orange">1</span>
                    </div>
                </div>`
            }
        };
        return tutorials[type] || null;
    }
};
