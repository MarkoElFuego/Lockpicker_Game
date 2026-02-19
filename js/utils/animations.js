// ============================================================
// ANIMATION UTILITIES
// Zynga/Candy Crush style juicy animations.
// Bounce, overshoot, sparkle, screen transitions.
// ============================================================

const Animations = {
    // Smooth transition between screens with flash
    transitionTo(fromScreenId, toScreenId, duration = 500) {
        return new Promise(resolve => {
            const overlay = document.getElementById("transition-overlay");
            const from = document.getElementById(fromScreenId);
            const to = document.getElementById(toScreenId);

            // Slide out current screen
            from.classList.add("screen-exit");

            // Fade to black
            overlay.style.transition = `opacity ${duration * 0.4}ms ease-in`;
            overlay.style.opacity = "1";
            overlay.style.pointerEvents = "all";

            setTimeout(() => {
                from.classList.remove("active", "screen-exit");
                to.classList.add("active", "screen-enter");

                // Fade from black
                overlay.style.transition = `opacity ${duration * 0.4}ms ease-out`;
                overlay.style.opacity = "0";

                setTimeout(() => {
                    overlay.style.pointerEvents = "none";
                    to.classList.remove("screen-enter");
                    resolve();
                }, duration * 0.4);
            }, duration * 0.4);
        });
    },

    // Typewriter text effect with sound ticks
    typewriter(element, text, speed = 30) {
        return new Promise(resolve => {
            element.textContent = "";
            let i = 0;
            const cursor = document.getElementById("briefing-cursor");
            if (cursor) cursor.style.display = "inline";

            const interval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    // Tick sound every few chars
                    if (i % 3 === 0) AudioManager.play("tick");
                    i++;
                } else {
                    clearInterval(interval);
                    if (cursor) cursor.style.display = "none";
                    resolve();
                }
            }, speed);

            element._typewriterInterval = interval;
            element._typewriterText = text;
            element._typewriterResolve = resolve;
        });
    },

    // Skip typewriter
    skipTypewriter(element) {
        if (element._typewriterInterval) {
            clearInterval(element._typewriterInterval);
            element.textContent = element._typewriterText || "";
            const cursor = document.getElementById("briefing-cursor");
            if (cursor) cursor.style.display = "none";
            if (element._typewriterResolve) {
                element._typewriterResolve();
                element._typewriterResolve = null;
            }
        }
    },

    // ---- CANDY CRUSH SHAKE (with decay + spring) ----
    shake(element, intensity = 8, duration = 400) {
        const start = performance.now();
        const originalTransform = element.style.transform;

        function animate(time) {
            const elapsed = time - start;
            const progress = elapsed / duration;
            if (progress < 1) {
                const decay = 1 - progress;
                const freq = progress * 30; // increasing frequency
                const x = Math.sin(freq) * intensity * decay;
                const y = Math.cos(freq * 0.7) * intensity * decay * 0.5;
                element.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform || "";
            }
        }
        requestAnimationFrame(animate);
    },

    // ---- JUICY BOUNCE (overshoot spring) ----
    bounce(element, scaleFrom = 0, scaleTo = 1, duration = 500) {
        return new Promise(resolve => {
            const start = performance.now();
            function animate(time) {
                const elapsed = time - start;
                const t = Math.min(elapsed / duration, 1);
                // Spring overshoot curve
                const scale = scaleFrom + (scaleTo - scaleFrom) * Animations.springEase(t);
                element.style.transform = `scale(${scale})`;
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.transform = `scale(${scaleTo})`;
                    resolve();
                }
            }
            requestAnimationFrame(animate);
        });
    },

    // ---- POP IN (scale from 0 with bounce) ----
    popIn(element, delay = 0) {
        element.style.transform = "scale(0)";
        element.style.opacity = "0";
        setTimeout(() => {
            element.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease";
            element.style.transform = "scale(1)";
            element.style.opacity = "1";
        }, delay);
    },

    // ---- SLIDE IN FROM BOTTOM (with bounce) ----
    slideInUp(element, delay = 0, distance = 60) {
        element.style.transform = `translateY(${distance}px)`;
        element.style.opacity = "0";
        setTimeout(() => {
            element.style.transition = "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease";
            element.style.transform = "translateY(0)";
            element.style.opacity = "1";
        }, delay);
    },

    // ---- SLIDE IN FROM LEFT ----
    slideInLeft(element, delay = 0, distance = 80) {
        element.style.transform = `translateX(-${distance}px)`;
        element.style.opacity = "0";
        setTimeout(() => {
            element.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease";
            element.style.transform = "translateX(0)";
            element.style.opacity = "1";
        }, delay);
    },

    // ---- PULSE (Candy Crush style heartbeat) ----
    pulse(element, scale = 1.15, duration = 300) {
        element.style.transition = `transform ${duration * 0.4}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
        element.style.transform = `scale(${scale})`;
        setTimeout(() => {
            element.style.transition = `transform ${duration * 0.6}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
            element.style.transform = "scale(1)";
        }, duration * 0.4);
    },

    // ---- WIGGLE (attention getter) ----
    wiggle(element, angle = 5, duration = 500) {
        const start = performance.now();
        function animate(time) {
            const elapsed = time - start;
            const t = elapsed / duration;
            if (t < 1) {
                const decay = 1 - t;
                const rotation = Math.sin(t * Math.PI * 6) * angle * decay;
                element.style.transform = `rotate(${rotation}deg)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = "";
            }
        }
        requestAnimationFrame(animate);
    },

    // ---- FADE IN ----
    fadeIn(element, duration = 300) {
        element.style.opacity = "0";
        element.style.display = "";
        element.style.transition = `opacity ${duration}ms ease`;
        requestAnimationFrame(() => {
            element.style.opacity = "1";
        });
    },

    // ---- FADE OUT ----
    fadeOut(element, duration = 300) {
        return new Promise(resolve => {
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = "0";
            setTimeout(() => {
                element.style.display = "none";
                resolve();
            }, duration);
        });
    },

    // ---- SLIDE UP (legacy) ----
    slideUp(element, duration = 400) {
        element.style.transform = "translateY(100%)";
        element.style.display = "";
        element.style.transition = `transform ${duration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
        requestAnimationFrame(() => {
            element.style.transform = "translateY(0)";
        });
    },

    // ---- COUNT UP (with bouncy finish) ----
    countUp(element, from, to, duration = 1200, prefix = "$") {
        const start = performance.now();
        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(from + (to - from) * eased);
            element.textContent = prefix + current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Bouncy finish
                Animations.pulse(element, 1.2, 300);
            }
        }
        requestAnimationFrame(animate);
    },

    // ---- SAFE DOOR OPENING ----
    openSafe(safeElement) {
        return new Promise(resolve => {
            safeElement.classList.add("safe-opening");
            setTimeout(() => {
                safeElement.classList.add("safe-open");
                resolve();
            }, 1000);
        });
    },

    // ---- STAGGER CHILDREN (map buildings entrance) ----
    staggerChildren(parent, selector, delay = 80) {
        const children = parent.querySelectorAll(selector);
        children.forEach((child, i) => {
            child.style.opacity = "0";
            child.style.transform = "translateX(-30px) scale(0.95)";
            setTimeout(() => {
                child.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease";
                child.style.transform = "translateX(0) scale(1)";
                child.style.opacity = "1";
            }, 100 + i * delay);
        });
    },

    // ---- CELEBRATION (full combo: flash + confetti + shake) ----
    celebrate() {
        Particles.flash("rgba(255,215,0,0.2)", 400);
        Particles.confetti(window.innerWidth / 2, window.innerHeight * 0.3, 50);
        Particles.screenShake(5, 300);
    },

    // ---- REWARD CELEBRATION ----
    rewardCelebration() {
        // Delay each effect for dramatic sequence
        Particles.flash("rgba(255,255,255,0.3)", 200);
        setTimeout(() => {
            Particles.coinShower(30);
        }, 300);
        setTimeout(() => {
            Particles.sparkle(window.innerWidth / 2, window.innerHeight * 0.35, 20);
        }, 500);
        setTimeout(() => {
            Particles.confetti(window.innerWidth / 2, window.innerHeight * 0.3, 30);
        }, 800);
    },

    // ---- SPRING EASE FUNCTION ----
    springEase(t) {
        const d = 0.6; // damping
        return 1 - Math.exp(-6 * t) * Math.cos(t * Math.PI * 2.5 * d);
    },

    // ---- ELASTIC EASE ----
    elasticEase(t) {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },
};
