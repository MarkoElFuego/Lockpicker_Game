// ============================================================
// PATTERN PUZZLE
// Nodes appear on screen. A path lights up between them.
// Player must trace the same path by tapping nodes in order.
// Like an electronic lock pattern.
// ============================================================

class PatternPuzzle {
    constructor(canvas, difficulty, toolBonuses = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.difficulty = difficulty;

        const config = DIFFICULTY.pattern[difficulty];
        this.totalNodes = config.nodes;
        this.showTime = config.showTime + (toolBonuses.extraShowTime || 0);

        this.nodes = [];
        this.correctPath = [];
        this.playerPath = [];
        this.phase = "waiting"; // waiting, showing, input, complete
        this.solved = false;
        this.running = false;
        this.showingStep = 0;

        this.generatePattern();
        this.onComplete = null;

        this.resize();
        this.bindEvents();
    }

    generatePattern() {
        // Place 9 nodes in a 3x3 grid (like Android pattern lock)
        this.nodes = [];
        const positions = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                positions.push({ row, col, index: row * 3 + col });
            }
        }
        this.nodes = positions;

        // Generate a random path using `totalNodes` of the 9 nodes
        const available = [...Array(9).keys()];
        this.correctPath = [];
        for (let i = 0; i < this.totalNodes; i++) {
            const idx = Math.floor(Math.random() * available.length);
            this.correctPath.push(available[idx]);
            available.splice(idx, 1);
        }
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.w = this.canvas.width;
        this.h = this.canvas.height;

        // Node positions
        const gridSize = Math.min(this.w, this.h * 0.6) * 0.7;
        const startX = (this.w - gridSize) / 2;
        const startY = this.h * 0.18;
        const gap = gridSize / 2;

        this.nodePositions = this.nodes.map(n => ({
            x: startX + n.col * gap + gap / 2,
            y: startY + n.row * gap + gap / 2,
            index: n.index
        }));
        this.nodeRadius = Math.min(25, gridSize / 8);
    }

    bindEvents() {
        const handler = (e) => {
            e.preventDefault();
            if (this.phase !== "input" || !this.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            // Find closest node
            for (const np of this.nodePositions) {
                const dist = Math.sqrt((x - np.x) ** 2 + (y - np.y) ** 2);
                if (dist <= this.nodeRadius * 1.5) {
                    this.tapNode(np.index);
                    break;
                }
            }
        };

        this.canvas.addEventListener("touchstart", handler);
        this.canvas.addEventListener("mousedown", handler);
        this._handler = handler;
    }

    tapNode(nodeIndex) {
        if (this.playerPath.includes(nodeIndex)) return;

        const expectedIndex = this.correctPath[this.playerPath.length];

        if (nodeIndex === expectedIndex) {
            // Correct!
            this.playerPath.push(nodeIndex);
            AudioManager.play("pick_move");
            this.draw();

            if (this.playerPath.length === this.correctPath.length) {
                // Pattern complete!
                this.phase = "complete";
                this.solved = true;
                this.running = false;
                AudioManager.play("lock_open");
                setTimeout(() => {
                    if (this.onComplete) this.onComplete();
                }, 500);
            }
        } else {
            // Wrong!
            AudioManager.play("lock_fail");
            Animations.shake(this.canvas, 6, 200);
            this.playerPath = [];
            this.draw();
        }
    }

    start() {
        this.running = true;
        this.phase = "showing";
        this.showingStep = 0;
        this.animateShowPath();
    }

    animateShowPath() {
        if (this.showingStep <= this.correctPath.length) {
            this.draw();
            this.showingStep++;
            setTimeout(() => this.animateShowPath(), 500);
        } else {
            // Hold for a moment then hide
            setTimeout(() => {
                this.phase = "input";
                this.showingStep = 0;
                this.draw();
            }, this.showTime);
        }
    }

    stop() {
        this.running = false;
        this.canvas.removeEventListener("touchstart", this._handler);
        this.canvas.removeEventListener("mousedown", this._handler);
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);

        // Title
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("Trace the Pattern", this.w / 2, 30);

        // Draw path lines (showing phase)
        if (this.phase === "showing" && this.showingStep > 1) {
            ctx.strokeStyle = "#3498db";
            ctx.lineWidth = 4;
            ctx.shadowColor = "#3498db";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            for (let i = 0; i < this.showingStep && i < this.correctPath.length; i++) {
                const np = this.nodePositions[this.correctPath[i]];
                if (i === 0) ctx.moveTo(np.x, np.y);
                else ctx.lineTo(np.x, np.y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Draw player path lines
        if (this.phase === "input" && this.playerPath.length > 1) {
            ctx.strokeStyle = "#2ecc71";
            ctx.lineWidth = 4;
            ctx.shadowColor = "#2ecc71";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let i = 0; i < this.playerPath.length; i++) {
                const np = this.nodePositions[this.playerPath[i]];
                if (i === 0) ctx.moveTo(np.x, np.y);
                else ctx.lineTo(np.x, np.y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Draw nodes
        for (const np of this.nodePositions) {
            const isInShowPath = this.phase === "showing" &&
                this.correctPath.slice(0, this.showingStep).includes(np.index);
            const isInPlayerPath = this.playerPath.includes(np.index);
            const isNextTarget = this.phase === "input" &&
                this.correctPath[this.playerPath.length] === np.index;

            // Outer circle
            ctx.beginPath();
            ctx.arc(np.x, np.y, this.nodeRadius, 0, Math.PI * 2);

            if (isInPlayerPath) {
                ctx.fillStyle = "#2ecc71";
                ctx.shadowColor = "#2ecc71";
                ctx.shadowBlur = 12;
            } else if (isInShowPath) {
                ctx.fillStyle = "#3498db";
                ctx.shadowColor = "#3498db";
                ctx.shadowBlur = 12;
            } else {
                ctx.fillStyle = "#1a1a2e";
                ctx.shadowBlur = 0;
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            // Border
            ctx.strokeStyle = isInPlayerPath ? "#2ecc71" :
                              isInShowPath ? "#3498db" : "#4a4a6a";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner dot
            ctx.beginPath();
            ctx.arc(np.x, np.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = isInPlayerPath ? "#fff" :
                            isInShowPath ? "#fff" : "#4a4a6a";
            ctx.fill();
        }

        // Instructions
        ctx.fillStyle = "#8899aa";
        ctx.font = "14px 'Courier New', monospace";
        ctx.textAlign = "center";

        if (this.phase === "showing") {
            ctx.fillStyle = "rgba(52, 152, 219, 0.8)";
            ctx.font = "bold 18px 'Courier New', monospace";
            ctx.fillText("WATCH THE PATTERN", this.w / 2, this.h - 60);
        } else if (this.phase === "input") {
            ctx.fillText("Tap the nodes in the correct order", this.w / 2, this.h - 60);
            ctx.fillText(`${this.playerPath.length} / ${this.correctPath.length}`, this.w / 2, this.h - 35);
        }
    }
}
