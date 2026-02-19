// ============================================================
// SIDE QUEST SCREEN
// NPC interactions with choices. Helping people gives perks.
// ============================================================

const SideQuestScreen = {
    questId: null,
    questData: null,
    phase: "dialogue", // dialogue, puzzle, reward

    init(questId) {
        this.questId = questId;
        this.questData = DIALOGUE.sideQuests[questId];
        this.phase = "dialogue";
        this.currentLine = 0;

        // Set portrait
        const portraitEl = document.getElementById("sq-portrait");
        portraitEl.innerHTML = "";
        const avatar = document.createElement("div");
        avatar.className = "portrait-placeholder sq-portrait-color";
        avatar.textContent = this.questData.name.charAt(0);
        portraitEl.appendChild(avatar);

        // Set name
        document.getElementById("sq-name").textContent = this.questData.name;

        // Show request dialogue
        this.showDialogue();
    },

    showDialogue() {
        const textEl = document.getElementById("sq-text");
        const choicesEl = document.getElementById("sq-choices");
        choicesEl.innerHTML = "";

        const line = this.questData.request[this.currentLine];
        textEl.textContent = "";

        Animations.typewriter(textEl, line, 25).then(() => {
            if (this.currentLine < this.questData.request.length - 1) {
                // More dialogue
                const nextBtn = document.createElement("button");
                nextBtn.className = "btn btn-small";
                nextBtn.textContent = "Next";
                nextBtn.onclick = () => {
                    this.currentLine++;
                    this.showDialogue();
                };
                choicesEl.appendChild(nextBtn);
            } else {
                // Show choices
                const helpBtn = document.createElement("button");
                helpBtn.className = "btn btn-primary";
                helpBtn.textContent = "I'll help you";
                helpBtn.onclick = () => {
                    this.phase = "puzzle";
                    if (this.onAccept) this.onAccept(this.questId);
                };

                const declineBtn = document.createElement("button");
                declineBtn.className = "btn btn-secondary";
                declineBtn.textContent = "Not right now";
                declineBtn.onclick = () => {
                    if (this.onDecline) this.onDecline();
                };

                choicesEl.appendChild(helpBtn);
                choicesEl.appendChild(declineBtn);
            }
        });
    },

    showReward() {
        this.phase = "reward";
        const textEl = document.getElementById("sq-text");
        const choicesEl = document.getElementById("sq-choices");
        choicesEl.innerHTML = "";

        this.currentLine = 0;
        this.showRewardDialogue(textEl, choicesEl);
    },

    showRewardDialogue(textEl, choicesEl) {
        const line = this.questData.success[this.currentLine];
        textEl.textContent = "";

        Animations.typewriter(textEl, line, 25).then(() => {
            choicesEl.innerHTML = "";

            if (this.currentLine < this.questData.success.length - 1) {
                const nextBtn = document.createElement("button");
                nextBtn.className = "btn btn-small";
                nextBtn.textContent = "Next";
                nextBtn.onclick = () => {
                    this.currentLine++;
                    this.showRewardDialogue(textEl, choicesEl);
                };
                choicesEl.appendChild(nextBtn);
            } else {
                // Show perk info
                const perkInfo = document.createElement("div");
                perkInfo.className = "sq-perk-info";
                perkInfo.innerHTML = `
                    <div class="perk-label">PERK RECEIVED</div>
                    <div class="perk-name">${this.questData.perkName}</div>
                    <div class="perk-desc">${this.questData.perkDescription}</div>
                `;
                choicesEl.appendChild(perkInfo);

                const doneBtn = document.createElement("button");
                doneBtn.className = "btn btn-primary";
                doneBtn.textContent = "Continue";
                doneBtn.onclick = () => {
                    if (this.onComplete) this.onComplete(this.questId);
                };
                choicesEl.appendChild(doneBtn);
            }
        });
    },

    onAccept: null,
    onDecline: null,
    onComplete: null
};
