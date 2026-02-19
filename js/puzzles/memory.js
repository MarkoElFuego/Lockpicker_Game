// ============================================================
// MEMORY PUZZLE
// Tumbler pins light up in sequence. Player must remember
// and tap them in the correct order. Like a safe's internal
// mechanism pattern.
// ============================================================

class MemoryPuzzle {
    constructor(canvas, difficulty, toolBonuses = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.difficulty = difficulty;

        const config = DIFFICULTY.memory[difficulty];
        this.totalPairs = config.pairs;
        this.showTime = config.showTime + (toolBonuses.extraShowTime || 0);

        this.tiles = [];
        this.flipped = [];
        this.matched = [];
        this.canClick = false;
        this.solved = false;
        this.running = false;

        this.generateTiles();
        this.onComplete = null;

        this.resize();
        this.bindEvents();
    }

    generateTiles() {
        // Create pairs of symbols
        const symbols = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
        const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
                         "#1abc9c", "#e67e22", "#e91e63", "#00bcd4", "#8bc34a"];
        this.tiles = [];

        for (let i = 0; i < this.totalPairs; i++) {
            const tile = { symbol: symbols[i], color: colors[i], id: i };
            this.tiles.push({ ...tile }, { ...tile });
        }

        // Shuffle
        for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
        }

        // Calculate grid
        const total = this.tiles.length;
        this.cols = total <= 6 ? 3 : 4;
        this.rows = Math.ceil(total / this.cols);
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.w = this.canvas.width;
        this.h = this.canvas.height;

        // Calculate tile dimensions
        const padding = 15;
        const areaW = this.w - padding * 2;
        const areaH = this.h * 0.65;
        const startY = this.h * 0.12;

        this.tileW = Math.min(80, (areaW - (this.cols - 1) * 10) / this.cols);
        this.tileH = Math.min(80, (areaH - (this.rows - 1) * 10) / this.rows);
        this.gridStartX = (this.w - (this.cols * this.tileW + (this.cols - 1) * 10)) / 2;
        this.gridStartY = startY;
    }

    bindEvents() {
        const handler = (e) => {
            e.preventDefault();
            if (!this.canClick || !this.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            const tileIndex = this.getTileAt(x, y);
            if (tileIndex === -1) return;
            if (this.flipped.includes(tileIndex)) return;
            if (this.matched.includes(tileIndex)) return;

            this.flipTile(tileIndex);
        };

        this.canvas.addEventListener("touchstart", handler);
        this.canvas.addEventListener("mousedown", handler);
        this._handler = handler;
    }

    getTileAt(x, y) {
        for (let i = 0; i < this.tiles.length; i++) {
            const col = i % this.cols;
            const row = Math.floor(i / this.cols);
            const tx = this.gridStartX + col * (this.tileW + 10);
            const ty = this.gridStartY + row * (this.tileH + 10);

            if (x >= tx && x <= tx + this.tileW && y >= ty && y <= ty + this.tileH) {
                return i;
            }
        }
        return -1;
    }

    flipTile(index) {
        this.flipped.push(index);
        AudioManager.play("pick_move");
        this.draw();

        if (this.flipped.length === 2) {
            this.canClick = false;
            const [a, b] = this.flipped;

            if (this.tiles[a].id === this.tiles[b].id) {
                // Match!
                setTimeout(() => {
                    this.matched.push(a, b);
                    this.flipped = [];
                    AudioManager.play("lock_open");
                    this.draw();
                    this.canClick = true;

                    if (this.matched.length === this.tiles.length) {
                        this.solved = true;
                        this.running = false;
                        const rect = this.canvas.getBoundingClientRect();
                        Particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
                        Particles.flash("rgba(46, 204, 113, 0.2)", 300);
                        setTimeout(() => {
                            if (this.onComplete) this.onComplete();
                        }, 300);
                    }
                }, 400);
            } else {
                // No match
                setTimeout(() => {
                    AudioManager.play("lock_fail");
                    Animations.shake(this.canvas, 4, 150);
                    this.flipped = [];
                    this.draw();
                    this.canClick = true;
                }, 800);
            }
        }
    }

    start() {
        this.running = true;

        // Show all tiles briefly, then hide
        this.showAll = true;
        this.draw();

        setTimeout(() => {
            this.showAll = false;
            this.canClick = true;
            this.draw();
        }, this.showTime);
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
        ctx.fillText(`Match the Tumblers`, this.w / 2, 30);

        // Draw tiles
        for (let i = 0; i < this.tiles.length; i++) {
            const col = i % this.cols;
            const row = Math.floor(i / this.cols);
            const tx = this.gridStartX + col * (this.tileW + 10);
            const ty = this.gridStartY + row * (this.tileH + 10);
            const tile = this.tiles[i];

            const isFlipped = this.flipped.includes(i) || this.showAll;
            const isMatched = this.matched.includes(i);

            if (isMatched) {
                // Matched - green glow
                ctx.fillStyle = "rgba(46, 204, 113, 0.2)";
                ctx.strokeStyle = "#2ecc71";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(tx, ty, this.tileW, this.tileH, 8);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "#2ecc71";
                ctx.font = `bold ${this.tileW * 0.3}px 'Courier New', monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(tile.symbol, tx + this.tileW / 2, ty + this.tileH / 2);
            } else if (isFlipped) {
                // Flipped - show symbol
                ctx.fillStyle = "rgba(255,255,255,0.1)";
                ctx.strokeStyle = tile.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(tx, ty, this.tileW, this.tileH, 8);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = tile.color;
                ctx.font = `bold ${this.tileW * 0.3}px 'Courier New', monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(tile.symbol, tx + this.tileW / 2, ty + this.tileH / 2);
            } else {
                // Hidden
                ctx.fillStyle = "#1a1a2e";
                ctx.strokeStyle = "#3a3a5a";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(tx, ty, this.tileW, this.tileH, 8);
                ctx.fill();
                ctx.stroke();

                // Lock icon (simple keyhole)
                ctx.fillStyle = "#3a3a5a";
                ctx.beginPath();
                ctx.arc(tx + this.tileW / 2, ty + this.tileH / 2 - 5, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(tx + this.tileW / 2 - 3, ty + this.tileH / 2, 6, 10);
            }
        }

        // Progress
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#8899aa";
        ctx.font = "14px 'Courier New', monospace";
        ctx.textAlign = "center";
        const matchCount = this.matched.length / 2;
        ctx.fillText(`Matched: ${matchCount} / ${this.totalPairs}`, this.w / 2, this.h - 30);

        if (this.showAll) {
            ctx.fillStyle = "rgba(231, 76, 60, 0.8)";
            ctx.font = "bold 18px 'Courier New', monospace";
            ctx.fillText("MEMORIZE!", this.w / 2, this.h - 60);
        }
    }
}
