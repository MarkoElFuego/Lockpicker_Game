// ============================================================
// ANIMATION UTILITIES
// Shared animation helpers for transitions, tweens, etc.
// ============================================================

const Animations = {
    // Smooth transition between screens
    transitionTo(fromScreenId, toScreenId, duration = 400) {
        return new Promise(resolve => {
            const overlay = document.getElementById("transition-overlay");
            const from = document.getElementById(fromScreenId);
            const to = document.getElementById(toScreenId);

            // Fade to black
            overlay.style.transition = `opacity ${duration / 2}ms ease-in`;
            overlay.style.opacity = "1";
            overlay.style.pointerEvents = "all";

            setTimeout(() => {
                from.classList.remove("active");
                to.classList.add("active");

                // Fade from black
                overlay.style.transition = `opacity ${duration / 2}ms ease-out`;
                overlay.style.opacity = "0";

                setTimeout(() => {
                    overlay.style.pointerEvents = "none";
                    resolve();
                }, duration / 2);
            }, duration / 2);
        });
    },

    // Typewriter text effect
    typewriter(element, text, speed = 30) {
        return new Promise(resolve => {
            element.textContent = "";
            let i = 0;
            const cursor = document.getElementById("briefing-cursor");
            if (cursor) cursor.style.display = "inline";

            const interval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(interval);
                    if (cursor) cursor.style.display = "none";
                    resolve();
                }
            }, speed);

            // Store interval so it can be skipped
            element._typewriterInterval = interval;
            element._typewriterText = text;
            element._typewriterResolve = resolve;
        });
    },

    // Skip typewriter - show full text immediately
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

    // Shake effect (for wrong answers)
    shake(element, intensity = 5, duration = 300) {
        const start = performance.now();
        const originalTransform = element.style.transform;

        function animate(time) {
            const elapsed = time - start;
            if (elapsed < duration) {
                const x = (Math.random() - 0.5) * intensity * 2;
                const y = (Math.random() - 0.5) * intensity * 2;
                element.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform || "";
            }
        }
        requestAnimationFrame(animate);
    },

    // Pulse effect (for correct answers)
    pulse(element, scale = 1.1, duration = 200) {
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `scale(${scale})`;
        setTimeout(() => {
            element.style.transform = "scale(1)";
        }, duration);
    },

    // Fade in element
    fadeIn(element, duration = 300) {
        element.style.opacity = "0";
        element.style.display = "";
        element.style.transition = `opacity ${duration}ms ease`;
        requestAnimationFrame(() => {
            element.style.opacity = "1";
        });
    },

    // Fade out element
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

    // Slide up from bottom
    slideUp(element, duration = 400) {
        element.style.transform = "translateY(100%)";
        element.style.display = "";
        element.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        requestAnimationFrame(() => {
            element.style.transform = "translateY(0)";
        });
    },

    // Number counter animation
    countUp(element, from, to, duration = 1000, prefix = "$") {
        const start = performance.now();
        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.floor(from + (to - from) * eased);
            element.textContent = prefix + current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    },

    // Safe door opening animation (CSS class toggle)
    openSafe(safeElement) {
        return new Promise(resolve => {
            safeElement.classList.add("safe-opening");
            setTimeout(() => {
                safeElement.classList.add("safe-open");
                resolve();
            }, 1000);
        });
    }
};
