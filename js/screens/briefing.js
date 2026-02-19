// ============================================================
// BRIEFING SCREEN
// Typewriter dialogue system with character portrait.
// Uncle Arthur (and future handlers) brief the player.
// ============================================================

const BriefingScreen = {
    dialogueQueue: [],
    currentLine: 0,
    isTyping: false,
    handlerKey: null,

    init(handlerKey, dialogueLines) {
        this.handlerKey = handlerKey;
        this.dialogueQueue = dialogueLines;
        this.currentLine = 0;
        this.isTyping = false;

        const handler = DIALOGUE[handlerKey];
        const portraitEl = document.getElementById("briefing-portrait");
        const nameEl = document.getElementById("briefing-name");

        // Set portrait (placeholder - colored circle with initial)
        portraitEl.innerHTML = "";
        const avatar = document.createElement("div");
        avatar.className = "portrait-placeholder";
        avatar.textContent = handler.name.charAt(0);
        portraitEl.appendChild(avatar);

        nameEl.textContent = handler.name;

        this.bindEvents();
        this.showNextLine();
    },

    bindEvents() {
        const nextBtn = document.getElementById("btn-briefing-next");
        const skipBtn = document.getElementById("btn-briefing-skip");
        const textEl = document.getElementById("briefing-text");

        nextBtn.onclick = () => {
            if (this.isTyping) {
                // Skip typewriter, show full line
                Animations.skipTypewriter(textEl);
                this.isTyping = false;
            } else {
                this.currentLine++;
                if (this.currentLine < this.dialogueQueue.length) {
                    this.showNextLine();
                } else {
                    this.finish();
                }
            }
        };

        skipBtn.onclick = () => {
            this.finish();
        };

        // Also tap on text area to advance
        textEl.onclick = () => {
            nextBtn.click();
        };
    },

    async showNextLine() {
        const textEl = document.getElementById("briefing-text");
        const line = this.dialogueQueue[this.currentLine];

        this.isTyping = true;
        await Animations.typewriter(textEl, line, 25);
        this.isTyping = false;

        // Update next button text
        const nextBtn = document.getElementById("btn-briefing-next");
        if (this.currentLine >= this.dialogueQueue.length - 1) {
            nextBtn.textContent = "Let's Go";
        } else {
            nextBtn.textContent = "Next";
        }
    },

    finish() {
        if (this.onComplete) this.onComplete();
    },

    onComplete: null
};
