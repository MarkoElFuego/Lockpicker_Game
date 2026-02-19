// ============================================================
// MAP SCREEN
// Isometric-style London city map. Player taps buildings
// to select missions. Side quest NPCs appear with markers.
// ============================================================

const MapScreen = {
    currentCity: null,
    buildings: [],
    sideQuests: [],
    selectedBuilding: null,

    init(gameState) {
        this.currentCity = LEVELS[gameState.currentCity];
        this.updateBuildings(gameState);
        this.updateMoney(gameState.money);
        this.render(gameState);
        this.bindEvents(gameState);
    },

    updateBuildings(gameState) {
        this.buildings = this.currentCity.buildings.map(b => {
            const building = { ...b };
            building.completed = gameState.completedMissions.includes(b.id);
            // Unlock logic
            if (b.unlocked) {
                building.unlocked = true;
            } else if (b.requiresComplete) {
                building.unlocked = gameState.completedMissions.includes(b.requiresComplete);
            }
            return building;
        });

        this.sideQuests = this.currentCity.sideQuests.map(sq => {
            const quest = { ...sq };
            quest.completed = gameState.completedSideQuests.includes(sq.id);
            quest.visible = gameState.completedMissions.includes(sq.appearsAfter) && !quest.completed;
            return quest;
        });
    },

    updateMoney(amount) {
        document.getElementById("map-money").textContent = "$" + amount.toLocaleString();
    },

    render(gameState) {
        const area = document.getElementById("map-area");
        area.innerHTML = "";

        document.getElementById("map-city").textContent = this.currentCity.name.toUpperCase();

        // Render buildings
        this.buildings.forEach((b, index) => {
            const el = document.createElement("div");
            el.className = "map-building";
            el.dataset.id = b.id;

            if (b.completed) el.classList.add("completed");
            else if (b.unlocked) el.classList.add("unlocked");
            else el.classList.add("locked");

            // Building icon placeholder
            const icon = document.createElement("div");
            icon.className = "building-icon";
            icon.textContent = this.getBuildingEmoji(b.icon);

            const name = document.createElement("div");
            name.className = "building-name";
            name.textContent = b.name;

            const diff = document.createElement("div");
            diff.className = "building-diff";
            for (let i = 0; i < 5; i++) {
                const star = document.createElement("span");
                star.textContent = i < b.difficulty ? "\u2605" : "\u2606";
                star.className = i < b.difficulty ? "star-filled" : "star-empty";
                diff.appendChild(star);
            }

            const status = document.createElement("div");
            status.className = "building-status";
            if (b.completed) {
                status.textContent = "COMPLETED";
                status.classList.add("status-complete");
            } else if (!b.unlocked) {
                status.textContent = "LOCKED";
                status.classList.add("status-locked");
            }

            el.appendChild(icon);
            el.appendChild(name);
            el.appendChild(diff);
            el.appendChild(status);

            // Connection line to next
            if (index < this.buildings.length - 1) {
                const connector = document.createElement("div");
                connector.className = "building-connector";
                if (b.completed) connector.classList.add("connector-active");
                el.appendChild(connector);
            }

            area.appendChild(el);
        });

        // Render side quests
        this.sideQuests.forEach(sq => {
            if (!sq.visible) return;

            const el = document.createElement("div");
            el.className = "map-sidequest";
            el.dataset.id = sq.id;

            const marker = document.createElement("div");
            marker.className = "sq-marker";
            marker.textContent = "!";

            const sqData = DIALOGUE.sideQuests[sq.id];
            const name = document.createElement("div");
            name.className = "sq-label";
            name.textContent = sqData.name;

            el.appendChild(marker);
            el.appendChild(name);
            area.appendChild(el);
        });
    },

    getBuildingEmoji(icon) {
        const map = {
            museum: "\ud83c\udfdb",
            jewelry: "\ud83d\udc8d",
            bank: "\ud83c\udfe6",
            mansion: "\ud83c\udff0",
            warehouse: "\ud83c\udfed",
            gallery: "\ud83d\uddbc",
            hotel: "\ud83c\udfe8",
            courthouse: "\u2696",
            embassy: "\ud83c\udfdb",
            tower: "\ud83d\uddfc"
        };
        return map[icon] || "\ud83c\udfe2";
    },

    bindEvents(gameState) {
        const area = document.getElementById("map-area");

        // Remove old listener if exists
        if (this._mapClickHandler) {
            area.removeEventListener("click", this._mapClickHandler);
        }

        this._mapClickHandler = (e) => {
            const building = e.target.closest(".map-building");
            if (building) {
                const id = building.dataset.id;
                const b = this.buildings.find(x => x.id === id);
                if (b && b.unlocked && !b.completed) {
                    if (this.onSelectMission) this.onSelectMission(b);
                } else if (b && !b.unlocked) {
                    Animations.shake(building, 3, 200);
                }
                return;
            }

            const sidequest = e.target.closest(".map-sidequest");
            if (sidequest) {
                const id = sidequest.dataset.id;
                if (this.onSelectSideQuest) this.onSelectSideQuest(id);
            }
        };

        area.addEventListener("click", this._mapClickHandler);

        document.getElementById("btn-shop").onclick = () => {
            if (this.onOpenShop) this.onOpenShop();
        };

        document.getElementById("btn-tools").onclick = () => {
            if (this.onOpenTools) this.onOpenTools();
        };
    },

    // Callbacks set by game.js
    onSelectMission: null,
    onSelectSideQuest: null,
    onOpenShop: null,
    onOpenTools: null
};
