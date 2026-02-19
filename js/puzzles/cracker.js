// ============================================================
// CRACKER PUZZLE (Code Breaker / Mastermind)
// Player must guess a numeric code. After each guess they get
// feedback: correct digit+position, correct digit wrong position.
// Like cracking a digital safe code.
// ============================================================

class CrackerPuzzle {
    constructor(canvas, difficulty, toolBonuses = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.difficulty = difficulty;

        const config = DIFFICULTY.cracker[difficulty];
        this.digits = config.digits;
        this.maxAttempts = config.attempts;
        this.revealedDigits = toolBonuses.revealDigits || 0;

        this.code = [];
        this.guesses = [];
        this.currentInput = [];
        this.solved = false;
        this.failed = false;
        this.running = false;
        this.selectedDigit = 0;

        this.generateCode();
        this.onComplete = null;
        this.onFail = null;

        this.resize();
        this.bindEvents();
    }

    generateCode() {
        this.code = [];
        for (let i = 0; i < this.digits; i++) {
            this.code.push(Math.floor(Math.random() * 10));
        }

        // Apply decoder tool - reveal some digits
        this.hints = new Array(this.digits).fill(null);
        if (this.revealedDigits > 0) {
            const indices = [...Array(this.digits).keys()];
            for (let i = 0; i < Math.min(this.revealedDigits, this.digits - 1); i++) {
                const idx = Math.floor(Math.random() * indices.length);
                this.hints[indices[idx]] = this.code[indices[idx]];
                indices.splice(idx, 1);
            }
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
            if (!this.running || this.solved || this.failed) return;

            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            this.handleTap(x, y);
        };

        this.canvas.addEventListener("touchstart", handler);
        this.canvas.addEventListener("mousedown", handler);
        this._handler = handler;
    }

    handleTap(x, y) {
        // Must match draw() coordinates exactly
        const numpadStartY = this.h - 180;
        const numpadW = Math.min(this.w - 40, 300);
        const numpadX = (this.w - numpadW) / 2;
        const btnW = numpadW / 5;
        const btnH = 45;

        // Number buttons (0-9) in 2 rows
        for (let i = 0; i < 10; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const bx = numpadX + col * btnW + 4;
            const by = numpadStartY + row * (btnH + 8);

            if (x >= bx && x <= bx + btnW - 8 && y >= by && y <= by + btnH) {
                if (this.currentInput.length < this.digits) {
                    this.currentInput.push(i);
                    AudioManager.play("pick_move");
                    this.draw();
                }
                return;
            }
        }

        // Submit & Delete buttons (must match draw())
        const actionY = numpadStartY + 2 * (btnH + 8) + 5;
        const actionW = numpadW * 0.45;

        // Submit button
        const submitX = numpadX;
        if (x >= submitX && x <= submitX + actionW && y >= actionY && y <= actionY + 38) {
            this.submitGuess();
            return;
        }

        // Delete button
        const delX = numpadX + numpadW - actionW;
        if (x >= delX && x <= delX + actionW && y >= actionY && y <= actionY + 38) {
            this.currentInput.pop();
            this.draw();
            return;
        }
    }

    submitGuess() {
        if (this.currentInput.length !== this.digits) return;

        const guess = [...this.currentInput];
        const result = this.evaluateGuess(guess);
        this.guesses.push({ guess, result });
        this.currentInput = [];

        if (result.correct === this.digits) {
            // Cracked!
            this.solved = true;
            this.running = false;
            AudioManager.play("lock_open");
            this.draw();
            setTimeout(() => {
                if (this.onComplete) this.onComplete();
            }, 500);
        } else if (this.guesses.length >= this.maxAttempts) {
            // Failed
            this.failed = true;
            this.running = false;
            AudioManager.play("lock_fail");
            Animations.shake(this.canvas, 10, 300);
            this.draw();
            // Give another chance after showing code
            setTimeout(() => {
                this.guesses = [];
                this.failed = false;
                this.running = true;
                this.generateCode();
                this.draw();
            }, 2000);
        } else {
            AudioManager.play("click");
            this.draw();
        }
    }

    evaluateGuess(guess) {
        let correct = 0; // right digit, right position
        let misplaced = 0; // right digit, wrong position
        const codeUsed = new Array(this.digits).fill(false);
        const guessUsed = new Array(this.digits).fill(false);

        // First pass: correct positions
        for (let i = 0; i < this.digits; i++) {
            if (guess[i] === this.code[i]) {
                correct++;
                codeUsed[i] = true;
                guessUsed[i] = true;
            }
        }

        // Second pass: misplaced
        for (let i = 0; i < this.digits; i++) {
            if (guessUsed[i]) continue;
            for (let j = 0; j < this.digits; j++) {
                if (codeUsed[j]) continue;
                if (guess[i] === this.code[j]) {
                    misplaced++;
                    codeUsed[j] = true;
                    break;
                }
            }
        }

        return { correct, misplaced };
    }

    start() {
        this.running = true;
        this.draw();
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
        ctx.fillText(`Crack the ${this.digits}-Digit Code`, this.w / 2, 28);

        // Attempts remaining
        ctx.fillStyle = "#e74c3c";
        ctx.font = "12px 'Courier New', monospace";
        ctx.fillText(
            `Attempts: ${this.guesses.length} / ${this.maxAttempts}`,
            this.w / 2, 50
        );

        // Hint row (from decoder tool)
        const hintY = 75;
        const digitW = 35;
        const hintStartX = (this.w - this.digits * (digitW + 8)) / 2;
        for (let i = 0; i < this.digits; i++) {
            const hx = hintStartX + i * (digitW + 8);
            if (this.hints[i] !== null) {
                ctx.fillStyle = "rgba(46, 204, 113, 0.2)";
                ctx.strokeStyle = "#2ecc71";
            } else {
                ctx.fillStyle = "rgba(255,255,255,0.05)";
                ctx.strokeStyle = "#3a3a5a";
            }
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(hx, hintY, digitW, 40, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = this.hints[i] !== null ? "#2ecc71" : "#555";
            ctx.font = "bold 20px 'Courier New', monospace";
            ctx.textAlign = "center";
            ctx.fillText(
                this.hints[i] !== null ? this.hints[i].toString() : "?",
                hx + digitW / 2, hintY + 27
            );
        }

        // Previous guesses
        const guessStartY = 130;
        const rowH = 32;
        for (let g = 0; g < this.guesses.length; g++) {
            const gy = guessStartY + g * rowH;
            const { guess, result } = this.guesses[g];

            // Digits
            for (let d = 0; d < guess.length; d++) {
                const gx = hintStartX + d * (digitW + 8);
                ctx.fillStyle = "#1a1a2e";
                ctx.beginPath();
                ctx.roundRect(gx, gy, digitW, 26, 4);
                ctx.fill();

                ctx.fillStyle = "#aaa";
                ctx.font = "bold 16px 'Courier New', monospace";
                ctx.textAlign = "center";
                ctx.fillText(guess[d].toString(), gx + digitW / 2, gy + 19);
            }

            // Result indicators
            const rx = hintStartX + this.digits * (digitW + 8) + 5;
            ctx.fillStyle = "#2ecc71";
            ctx.font = "bold 14px 'Courier New', monospace";
            ctx.textAlign = "left";
            ctx.fillText(`${result.correct}`, rx, gy + 19);
            ctx.fillStyle = "#f39c12";
            ctx.fillText(`${result.misplaced}`, rx + 25, gy + 19);
        }

        // Legend
        if (this.guesses.length > 0) {
            const legendY = guessStartY - 15;
            const rx = hintStartX + this.digits * (digitW + 8) + 5;
            ctx.fillStyle = "#2ecc71";
            ctx.font = "10px 'Courier New', monospace";
            ctx.textAlign = "left";
            ctx.fillText("OK", rx, legendY);
            ctx.fillStyle = "#f39c12";
            ctx.fillText("~", rx + 25, legendY);
        }

        // Current input
        const inputY = this.h - 240;
        for (let i = 0; i < this.digits; i++) {
            const ix = hintStartX + i * (digitW + 8);
            ctx.fillStyle = i < this.currentInput.length ? "rgba(52, 152, 219, 0.3)" : "rgba(255,255,255,0.05)";
            ctx.strokeStyle = i < this.currentInput.length ? "#3498db" : "#3a3a5a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(ix, inputY, digitW, 40, 6);
            ctx.fill();
            ctx.stroke();

            if (i < this.currentInput.length) {
                ctx.fillStyle = "#3498db";
                ctx.font = "bold 22px 'Courier New', monospace";
                ctx.textAlign = "center";
                ctx.fillText(this.currentInput[i].toString(), ix + digitW / 2, inputY + 28);
            }
        }

        // Numpad
        const numpadStartY = this.h - 180;
        const numpadW = Math.min(this.w - 40, 300);
        const numpadX = (this.w - numpadW) / 2;
        const btnW = numpadW / 5;
        const btnH = 45;

        for (let i = 0; i < 10; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const bx = numpadX + col * btnW + 4;
            const by = numpadStartY + row * (btnH + 8);

            ctx.fillStyle = "#1a1a2e";
            ctx.strokeStyle = "#4a4a6a";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(bx, by, btnW - 8, btnH, 8);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px 'Courier New', monospace";
            ctx.textAlign = "center";
            ctx.fillText(i.toString(), bx + (btnW - 8) / 2, by + 30);
        }

        // Submit & Delete buttons
        const actionY = numpadStartY + 2 * (btnH + 8) + 5;
        const actionW = numpadW * 0.45;

        // Submit
        const submitX = numpadX;
        ctx.fillStyle = this.currentInput.length === this.digits ? "#2ecc71" : "#333";
        ctx.beginPath();
        ctx.roundRect(submitX, actionY, actionW, 38, 8);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px 'Courier New', monospace";
        ctx.fillText("SUBMIT", submitX + actionW / 2, actionY + 24);

        // Delete
        const delX = numpadX + numpadW - actionW;
        ctx.fillStyle = "#e74c3c";
        ctx.beginPath();
        ctx.roundRect(delX, actionY, actionW, 38, 8);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText("DELETE", delX + actionW / 2, actionY + 24);

        // Failed message
        if (this.failed) {
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, this.w, this.h);
            ctx.fillStyle = "#e74c3c";
            ctx.font = "bold 24px 'Courier New', monospace";
            ctx.textAlign = "center";
            ctx.fillText("CODE WAS: " + this.code.join(""), this.w / 2, this.h / 2 - 10);
            ctx.fillStyle = "#8899aa";
            ctx.font = "14px 'Courier New', monospace";
            ctx.fillText("Resetting...", this.w / 2, this.h / 2 + 20);
        }
    }
}
