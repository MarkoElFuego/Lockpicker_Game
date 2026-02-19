// ============================================================
// ROTATION PUZZLE
// A circular dial lock. Player rotates a dial to align pins
// at the correct angle. Like cracking a combination safe.
// ============================================================

class RotationPuzzle {
    constructor(canvas, difficulty, toolBonuses = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.difficulty = difficulty;

        const config = DIFFICULTY.rotation[difficulty];
        this.totalPins = config.pins;
        this.tolerance = config.tolerance + (toolBonuses.extraTolerance || 0);

        this.currentPin = 0;
        this.angle = 0; // current dial angle in degrees
        this.targetAngles = [];
        this.solved = false;
        this.running = false;

        this.isDragging = false;
        this.lastTouchAngle = 0;

        this.generateTargets();
        this.onComplete = null;

        this.resize();
        this.bindEvents();
    }

    generateTargets() {
        this.targetAngles = [];
        for (let i = 0; i < this.totalPins; i++) {
            this.targetAngles.push(Math.floor(Math.random() * 360));
        }
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.w = this.canvas.width;
        this.h = this.canvas.height;
        this.centerX = this.w / 2;
        this.centerY = this.h / 2;
        this.radius = Math.min(this.w, this.h) * 0.32;
    }

    bindEvents() {
        const getAngle = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const x = clientX - rect.left - this.centerX;
            const y = clientY - rect.top - this.centerY;
            return Math.atan2(y, x) * (180 / Math.PI);
        };

        const onStart = (e) => {
            e.preventDefault();
            if (!this.running) return;
            this.isDragging = true;
            this.lastTouchAngle = getAngle(e);
        };

        const onMove = (e) => {
            e.preventDefault();
            if (!this.isDragging || !this.running) return;
            const newAngle = getAngle(e);
            let delta = newAngle - this.lastTouchAngle;
            // Handle wrap-around
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;
            this.angle = (this.angle + delta + 360) % 360;
            this.lastTouchAngle = newAngle;
            this.draw();
        };

        const onEnd = (e) => {
            e.preventDefault();
            if (!this.isDragging || !this.running) return;
            this.isDragging = false;
            this.checkPin();
        };

        this.canvas.addEventListener("touchstart", onStart);
        this.canvas.addEventListener("touchmove", onMove);
        this.canvas.addEventListener("touchend", onEnd);
        this.canvas.addEventListener("mousedown", onStart);
        this.canvas.addEventListener("mousemove", onMove);
        this.canvas.addEventListener("mouseup", onEnd);

        this._events = { onStart, onMove, onEnd };
    }

    checkPin() {
        const target = this.targetAngles[this.currentPin];
        let diff = Math.abs(this.angle - target);
        if (diff > 180) diff = 360 - diff;

        if (diff <= this.tolerance) {
            // Pin unlocked!
            AudioManager.play("lock_open");
            Animations.pulse(this.canvas, 1.03);
            this.currentPin++;

            if (this.currentPin >= this.totalPins) {
                this.solved = true;
                this.running = false;
                const rect = this.canvas.getBoundingClientRect();
                Particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
                Particles.flash("rgba(46, 204, 113, 0.2)", 300);
                setTimeout(() => {
                    if (this.onComplete) this.onComplete();
                }, 300);
            }
        }
    }

    start() {
        this.running = true;
        this.draw();
    }

    stop() {
        this.running = false;
    }

    draw() {
        const ctx = this.ctx;
        const w = this.w;
        const h = this.h;
        const cx = this.centerX;
        const cy = this.centerY;
        const r = this.radius;

        ctx.clearRect(0, 0, w, h);

        // Outer ring
        ctx.strokeStyle = "#2a2a4a";
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Dial notches
        for (let i = 0; i < 36; i++) {
            const a = (i * 10) * Math.PI / 180;
            const inner = i % 9 === 0 ? r - 25 : r - 15;
            ctx.strokeStyle = i % 9 === 0 ? "#8899aa" : "#444";
            ctx.lineWidth = i % 9 === 0 ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
            ctx.lineTo(cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10));
            ctx.stroke();
        }

        // Target zone (hint)
        if (this.currentPin < this.totalPins) {
            const target = this.targetAngles[this.currentPin];
            const tRad = target * Math.PI / 180;
            const tolRad = this.tolerance * Math.PI / 180;

            ctx.strokeStyle = "rgba(46, 204, 113, 0.3)";
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.arc(cx, cy, r, tRad - tolRad, tRad + tolRad);
            ctx.stroke();

            // Target marker
            ctx.fillStyle = "#2ecc71";
            ctx.beginPath();
            ctx.arc(
                cx + Math.cos(tRad) * r,
                cy + Math.sin(tRad) * r,
                6, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Current position indicator
        const aRad = this.angle * Math.PI / 180;
        ctx.strokeStyle = "#e74c3c";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#e74c3c";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(aRad) * (r - 5), cy + Math.sin(aRad) * (r - 5));
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Center knob
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
        gradient.addColorStop(0, "#4a4a6a");
        gradient.addColorStop(1, "#2a2a4a");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#6a6a8a";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Completed pins
        const dotY = cy + r + 50;
        for (let i = 0; i < this.totalPins; i++) {
            ctx.fillStyle = i < this.currentPin ? "#2ecc71" : "#444";
            ctx.beginPath();
            ctx.arc(w / 2 + (i - (this.totalPins - 1) / 2) * 25, dotY, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Instructions
        ctx.fillStyle = "#8899aa";
        ctx.font = "14px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("ROTATE the dial, RELEASE on the green zone", w / 2, dotY + 35);

        // Pin counter
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px 'Courier New', monospace";
        ctx.fillText(`Tumbler ${this.currentPin + 1} of ${this.totalPins}`, w / 2, cy - r - 30);
    }
}
