// ============================================================
// SLIDER PUZZLE
// A moving indicator slides back and forth. Tap when it's in
// the green "sweet spot" zone to unlock each pin.
// Think: timing-based lock picking.
// ============================================================

class SliderPuzzle {
    constructor(canvas, difficulty, toolBonuses = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.difficulty = difficulty;

        const config = DIFFICULTY.slider[difficulty];
        this.speed = config.speed * (1 - (toolBonuses.slowdown || 0));
        this.totalZones = config.zones;
        this.tolerance = config.tolerance;

        this.currentZone = 0;
        this.position = 0; // 0 to 1
        this.direction = 1;
        this.running = false;
        this.solved = false;
        this.failed = false;

        this.zones = [];
        this.generateZones();

        this.onComplete = null;
        this.onFail = null;

        this.resize();
        this.bindEvents();
    }

    generateZones() {
        this.zones = [];
        for (let i = 0; i < this.totalZones; i++) {
            const sweetSpot = 0.2 + Math.random() * 0.6; // between 20% and 80%
            this.zones.push({
                center: sweetSpot,
                tolerance: this.tolerance / 100,
                hit: false
            });
        }
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.w = this.canvas.width;
        this.h = this.canvas.height;
    }

    bindEvents() {
        const handler = (e) => {
            e.preventDefault();
            if (!this.running) return;
            this.checkHit();
        };
        this.canvas.addEventListener("touchstart", handler);
        this.canvas.addEventListener("mousedown", handler);
        this._handler = handler;
    }

    checkHit() {
        const zone = this.zones[this.currentZone];
        const dist = Math.abs(this.position - zone.center);

        if (dist <= zone.tolerance) {
            // Hit! Sparkle on the sweet spot
            zone.hit = true;
            AudioManager.play("lock_open");
            Animations.pulse(this.canvas, 1.03);
            const rect = this.canvas.getBoundingClientRect();
            Particles.sparkle(
                rect.left + 40 + zone.center * (this.w - 80),
                rect.top + this.h * 0.5,
                8,
                ["#2ecc71", "#27ae60", "#ffffff"]
            );
            this.currentZone++;

            if (this.currentZone >= this.totalZones) {
                this.solved = true;
                this.running = false;
                setTimeout(() => {
                    if (this.onComplete) this.onComplete();
                }, 300);
            }
        } else {
            // Miss!
            AudioManager.play("lock_fail");
            Animations.shake(this.canvas, 8, 200);
            // Reset current zone (not all - be forgiving)
            this.zones[this.currentZone].center = 0.2 + Math.random() * 0.6;
        }
    }

    start() {
        this.running = true;
        this.loop();
    }

    stop() {
        this.running = false;
        this.canvas.removeEventListener("touchstart", this._handler);
        this.canvas.removeEventListener("mousedown", this._handler);
    }

    loop() {
        if (!this.running) return;

        // Move slider
        this.position += this.direction * this.speed * 0.008;
        if (this.position >= 1) { this.position = 1; this.direction = -1; }
        if (this.position <= 0) { this.position = 0; this.direction = 1; }

        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    draw() {
        const ctx = this.ctx;
        const w = this.w;
        const h = this.h;

        ctx.clearRect(0, 0, w, h);

        const barY = h * 0.5;
        const barH = 50;
        const barX = 40;
        const barW = w - 80;
        const radius = 12;

        // Background track
        ctx.fillStyle = "#1a1a2e";
        ctx.beginPath();
        ctx.roundRect(barX, barY - barH / 2, barW, barH, radius);
        ctx.fill();

        // Draw zones
        const zone = this.zones[this.currentZone];
        if (zone) {
            const zoneX = barX + (zone.center - zone.tolerance) * barW;
            const zoneW = zone.tolerance * 2 * barW;
            ctx.fillStyle = "rgba(46, 204, 113, 0.4)";
            ctx.beginPath();
            ctx.roundRect(zoneX, barY - barH / 2, zoneW, barH, 4);
            ctx.fill();

            // Sweet spot center line
            ctx.strokeStyle = "#2ecc71";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(barX + zone.center * barW, barY - barH / 2);
            ctx.lineTo(barX + zone.center * barW, barY + barH / 2);
            ctx.stroke();
        }

        // Completed zones markers
        for (let i = 0; i < this.currentZone; i++) {
            const z = this.zones[i];
            const markerX = barX + z.center * barW;
            ctx.fillStyle = "#2ecc71";
            ctx.beginPath();
            ctx.arc(markerX, barY - barH / 2 - 12, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Slider indicator
        const sliderX = barX + this.position * barW;
        ctx.fillStyle = "#e74c3c";
        ctx.shadowColor = "#e74c3c";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(sliderX - 4, barY - barH / 2 - 4, 8, barH + 8, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Progress dots at top
        const dotY = barY - barH / 2 - 35;
        for (let i = 0; i < this.totalZones; i++) {
            ctx.fillStyle = i < this.currentZone ? "#2ecc71" : "#444";
            ctx.beginPath();
            ctx.arc(w / 2 + (i - (this.totalZones - 1) / 2) * 25, dotY, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Instructions
        ctx.fillStyle = "#8899aa";
        ctx.font = "14px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("TAP when the marker hits the green zone", w / 2, barY + barH / 2 + 40);

        // Zone counter
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px 'Courier New', monospace";
        ctx.fillText(`Pin ${this.currentZone + 1} of ${this.totalZones}`, w / 2, 30);
    }
}
