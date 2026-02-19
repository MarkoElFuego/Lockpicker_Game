// ============================================================
// PARTICLE SYSTEM
// Candy Crush / Zynga style particle effects.
// Sparkles, confetti, coins, stars, screen flash.
// ============================================================

const Particles = {
    canvas: null,
    ctx: null,
    particles: [],
    running: false,
    _raf: null,

    init() {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "particle-canvas";
        this.canvas.style.cssText =
            "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;";
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.resize();
        window.addEventListener("resize", () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    start() {
        if (this.running) return;
        this.running = true;
        this.loop();
    },

    stop() {
        this.running = false;
        if (this._raf) cancelAnimationFrame(this._raf);
    },

    loop() {
        if (!this.running && this.particles.length === 0) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw(this.ctx);
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }
        }

        if (this.particles.length > 0 || this.running) {
            this._raf = requestAnimationFrame(() => this.loop());
        }
    },

    // ---- SPARKLE BURST (like Candy Crush match) ----
    sparkle(x, y, count = 12, colors = null) {
        const defaultColors = ["#ffd700", "#fff8dc", "#f0c95c", "#ffffff", "#d4a337"];
        const cols = colors || defaultColors;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 2 + Math.random() * 4;
            const size = 2 + Math.random() * 4;
            this.particles.push(
                new Particle({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size,
                    color: cols[Math.floor(Math.random() * cols.length)],
                    life: 40 + Math.random() * 30,
                    gravity: 0.05,
                    friction: 0.97,
                    shape: "star",
                    spin: (Math.random() - 0.5) * 0.3,
                    shrink: 0.96,
                })
            );
        }
        this.start();
    },

    // ---- CONFETTI EXPLOSION (level complete) ----
    confetti(x, y, count = 40) {
        const colors = [
            "#ff4757", "#ffa502", "#2ed573", "#1e90ff",
            "#ffd700", "#ff6b81", "#7bed9f", "#70a1ff",
            "#d4a337", "#eccc68",
        ];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.particles.push(
                new Particle({
                    x: x + (Math.random() - 0.5) * 40,
                    y: y + (Math.random() - 0.5) * 20,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 3,
                    size: 4 + Math.random() * 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 80 + Math.random() * 60,
                    gravity: 0.12,
                    friction: 0.98,
                    shape: "rect",
                    spin: (Math.random() - 0.5) * 0.4,
                    shrink: 0.99,
                    wobble: Math.random() * 10,
                    wobbleSpeed: 0.05 + Math.random() * 0.1,
                })
            );
        }
        this.start();
    },

    // ---- COIN SHOWER (reward screen) ----
    coinShower(count = 25) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const colors = ["#ffd700", "#f0c95c", "#d4a337", "#c9a228"];

        for (let i = 0; i < count; i++) {
            const delay = i * 40;
            setTimeout(() => {
                this.particles.push(
                    new Particle({
                        x: Math.random() * w,
                        y: -20,
                        vx: (Math.random() - 0.5) * 2,
                        vy: 2 + Math.random() * 3,
                        size: 6 + Math.random() * 6,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        life: 100 + Math.random() * 60,
                        gravity: 0.08,
                        friction: 0.99,
                        shape: "coin",
                        spin: (Math.random() - 0.5) * 0.2,
                        shrink: 1,
                        wobble: Math.random() * 10,
                        wobbleSpeed: 0.03 + Math.random() * 0.05,
                    })
                );
                this.start();
            }, delay);
        }
    },

    // ---- STAR BURST (puzzle complete) ----
    starBurst(x, y, count = 8) {
        const colors = ["#ffd700", "#fff", "#f0c95c"];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 1.5 + Math.random() * 2;
            this.particles.push(
                new Particle({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 5 + Math.random() * 5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 50 + Math.random() * 30,
                    gravity: 0,
                    friction: 0.95,
                    shape: "star",
                    spin: 0.1,
                    shrink: 0.96,
                })
            );
        }
        this.start();
    },

    // ---- FLOATING TEXT (like +100) ----
    floatingText(x, y, text, color = "#ffd700", size = 24) {
        this.particles.push(
            new Particle({
                x,
                y,
                vx: 0,
                vy: -2,
                size,
                color,
                life: 60,
                gravity: -0.02,
                friction: 0.98,
                shape: "text",
                text,
                shrink: 1,
                spin: 0,
            })
        );
        this.start();
    },

    // ---- SCREEN FLASH ----
    flash(color = "rgba(255,215,0,0.3)", duration = 300) {
        const overlay = document.createElement("div");
        overlay.style.cssText =
            `position:fixed;top:0;left:0;width:100%;height:100%;background:${color};` +
            `pointer-events:none;z-index:998;opacity:1;transition:opacity ${duration}ms ease-out;`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.style.opacity = "0";
            setTimeout(() => overlay.remove(), duration);
        });
    },

    // ---- SCREEN SHAKE (Candy Crush style) ----
    screenShake(intensity = 8, duration = 400) {
        const container = document.getElementById("game-container");
        const start = performance.now();

        function animate(time) {
            const elapsed = time - start;
            const progress = elapsed / duration;
            if (progress < 1) {
                const decay = 1 - progress;
                const x = (Math.random() - 0.5) * intensity * decay * 2;
                const y = (Math.random() - 0.5) * intensity * decay * 2;
                container.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(animate);
            } else {
                container.style.transform = "";
            }
        }
        requestAnimationFrame(animate);
    },

    // ---- GLOW PULSE (on element) ----
    glowPulse(element, color = "#d4a337", duration = 600) {
        element.style.transition = `box-shadow ${duration / 2}ms ease`;
        element.style.boxShadow = `0 0 30px ${color}, 0 0 60px ${color}40`;
        setTimeout(() => {
            element.style.boxShadow = "";
        }, duration / 2);
    },

    clear() {
        this.particles = [];
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },
};

// ---- PARTICLE CLASS ----
class Particle {
    constructor(opts) {
        this.x = opts.x;
        this.y = opts.y;
        this.vx = opts.vx || 0;
        this.vy = opts.vy || 0;
        this.size = opts.size || 4;
        this.origSize = this.size;
        this.color = opts.color || "#fff";
        this.life = opts.life || 60;
        this.maxLife = this.life;
        this.gravity = opts.gravity || 0;
        this.friction = opts.friction || 1;
        this.shape = opts.shape || "circle";
        this.spin = opts.spin || 0;
        this.angle = 0;
        this.shrink = opts.shrink || 1;
        this.text = opts.text || "";
        this.wobble = opts.wobble || 0;
        this.wobbleSpeed = opts.wobbleSpeed || 0;
        this.wobbleAngle = 0;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.size *= this.shrink;
        this.angle += this.spin;
        this.wobbleAngle += this.wobbleSpeed;
        if (this.wobble) {
            this.x += Math.sin(this.wobbleAngle) * this.wobble * 0.1;
        }
        this.life--;
    }

    isDead() {
        return this.life <= 0 || this.size < 0.3;
    }

    draw(ctx) {
        const alpha = Math.min(1, this.life / (this.maxLife * 0.3));
        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        switch (this.shape) {
            case "circle":
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                break;

            case "star":
                this.drawStar(ctx, 0, 0, 4, this.size, this.size * 0.5);
                ctx.fillStyle = this.color;
                ctx.fill();
                break;

            case "rect":
                ctx.fillStyle = this.color;
                const w = this.size;
                const h = this.size * 0.6;
                ctx.fillRect(-w / 2, -h / 2, w, h);
                break;

            case "coin":
                // Gold coin with highlight
                const scaleX = Math.cos(this.wobbleAngle * 3);
                ctx.scale(scaleX, 1);
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.strokeStyle = "#b8892a";
                ctx.lineWidth = 1;
                ctx.stroke();
                // Dollar sign
                if (Math.abs(scaleX) > 0.3) {
                    ctx.fillStyle = "#8a6a1a";
                    ctx.font = `bold ${this.size}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("$", 0, 0);
                }
                break;

            case "text":
                ctx.font = `bold ${this.size}px 'Cinzel', serif`;
                ctx.fillStyle = this.color;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.strokeStyle = "rgba(0,0,0,0.5)";
                ctx.lineWidth = 3;
                ctx.strokeText(this.text, 0, 0);
                ctx.fillText(this.text, 0, 0);
                break;
        }

        ctx.restore();
        ctx.globalAlpha = 1;
    }

    drawStar(ctx, cx, cy, spikes, outerR, innerR) {
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerR);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerR);
        ctx.closePath();
    }
}
