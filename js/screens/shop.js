// ============================================================
// SHOP / UPGRADE SCREEN
// Buy tools, upgrade them, sell loot.
// "Black Market" feel but for noble purposes.
// ============================================================

const ShopScreen = {
    currentTab: "tools",
    gameState: null,

    init(gameState) {
        this.gameState = gameState;
        this.updateMoney(gameState.money);
        this.switchTab("tools");
        this.bindEvents();

        // Arthur's shop comment
        const handler = DIALOGUE[LEVELS[gameState.currentCity].handler];
        const comment = handler.shopTalk[Math.floor(Math.random() * handler.shopTalk.length)];
        // Could show this as a toast or small dialogue
    },

    updateMoney(amount) {
        document.getElementById("shop-money").textContent = "$" + amount.toLocaleString();
    },

    switchTab(tab) {
        this.currentTab = tab;

        // Update tab buttons
        document.querySelectorAll(".shop-tab").forEach(t => {
            t.classList.toggle("active", t.dataset.tab === tab);
        });

        this.renderItems();
    },

    renderItems() {
        const container = document.getElementById("shop-items");
        container.innerHTML = "";

        switch (this.currentTab) {
            case "tools":
                this.renderTools(container);
                break;
            case "upgrades":
                this.renderUpgrades(container);
                break;
            case "sell":
                this.renderSellLoot(container);
                break;
        }
    },

    renderTools(container) {
        const tools = ITEMS.tools;
        const playerTools = this.gameState.tools;

        Object.keys(tools).forEach(key => {
            const tool = tools[key];
            const owned = playerTools[key]?.owned || false;

            if (tool.consumable) {
                // Consumable item (dynamite)
                const el = this.createShopItem({
                    name: tool.name,
                    description: tool.description,
                    price: tool.price,
                    icon: tool.icon,
                    buttonText: owned ? `Buy ($${tool.price})` : `Buy ($${tool.price})`,
                    buttonEnabled: this.gameState.money >= this.getDiscountedPrice(tool.price),
                    info: `Owned: ${playerTools[key]?.quantity || 0}`,
                    onClick: () => this.buyConsumable(key)
                });
                container.appendChild(el);
                return;
            }

            if (owned) return; // Already owned non-consumable, show in upgrades

            const price = this.getDiscountedPrice(tool.price);
            const el = this.createShopItem({
                name: tool.name,
                description: tool.description,
                price: price,
                icon: tool.icon,
                buttonText: `Buy ($${price})`,
                buttonEnabled: this.gameState.money >= price,
                info: tool.effect,
                onClick: () => this.buyTool(key)
            });
            container.appendChild(el);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div class="shop-empty">All tools purchased! Check Upgrades tab.</div>';
        }
    },

    renderUpgrades(container) {
        const tools = ITEMS.tools;
        const playerTools = this.gameState.tools;

        Object.keys(tools).forEach(key => {
            const tool = tools[key];
            if (tool.consumable) return;
            if (!playerTools[key]?.owned) return;

            const level = playerTools[key].level;
            if (level >= tool.maxLevel) {
                const el = this.createShopItem({
                    name: tool.name + ` [Lv.${level}]`,
                    description: tool.effect,
                    icon: tool.icon,
                    buttonText: "MAX",
                    buttonEnabled: false,
                    info: "Maximum level reached"
                });
                container.appendChild(el);
                return;
            }

            const cost = tool.upgradeCost[level - 1];
            const el = this.createShopItem({
                name: tool.name + ` [Lv.${level}]`,
                description: tool.effect,
                price: cost,
                icon: tool.icon,
                buttonText: `Upgrade ($${cost})`,
                buttonEnabled: this.gameState.money >= cost,
                info: `Level ${level} -> ${level + 1}`,
                onClick: () => this.upgradeTool(key)
            });
            container.appendChild(el);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div class="shop-empty">Buy tools first to upgrade them.</div>';
        }
    },

    renderSellLoot(container) {
        const inventory = this.gameState.inventory;

        if (inventory.length === 0) {
            container.innerHTML = '<div class="shop-empty">No loot to sell. Complete missions first!</div>';
            return;
        }

        inventory.forEach((item, index) => {
            const el = this.createShopItem({
                name: item.name,
                description: `From: ${item.source}`,
                icon: item.icon,
                buttonText: `Sell ($${item.value})`,
                buttonEnabled: true,
                info: `Value: $${item.value}`,
                onClick: () => this.sellItem(index)
            });
            container.appendChild(el);
        });
    },

    createShopItem({ name, description, price, icon, buttonText, buttonEnabled, info, onClick }) {
        const el = document.createElement("div");
        el.className = "shop-item";

        el.innerHTML = `
            <div class="shop-item-icon">${this.getToolIcon(icon)}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${name}</div>
                <div class="shop-item-desc">${description || ""}</div>
                <div class="shop-item-detail">${info || ""}</div>
            </div>
            <button class="btn btn-shop ${buttonEnabled ? "" : "btn-disabled"}">${buttonText}</button>
        `;

        if (onClick && buttonEnabled) {
            el.querySelector("button").onclick = onClick;
        }

        return el;
    },

    getToolIcon(icon) {
        const map = {
            pick: "\ud83d\udd13",
            wrench: "\ud83d\udd27",
            decoder: "\ud83d\udcdf",
            stethoscope: "\ud83e\ude7a",
            blueprint: "\ud83d\udcdc",
            dynamite: "\ud83e\udde8"
        };
        return map[icon] || "\ud83d\udee0";
    },

    getDiscountedPrice(price) {
        if (this.gameState.perks && this.gameState.perks.good_karma) {
            return Math.floor(price * 0.9);
        }
        return price;
    },

    buyTool(toolId) {
        const tool = ITEMS.tools[toolId];
        const price = this.getDiscountedPrice(tool.price);

        if (this.gameState.money < price) return;

        this.gameState.money -= price;
        this.gameState.tools[toolId] = { owned: true, level: 1 };

        // Use up good karma perk
        if (this.gameState.perks.good_karma) {
            delete this.gameState.perks.good_karma;
        }

        AudioManager.play("buy");
        this.updateMoney(this.gameState.money);
        this.renderItems();

        if (this.onStateChange) this.onStateChange(this.gameState);
    },

    buyConsumable(toolId) {
        const tool = ITEMS.tools[toolId];
        const price = this.getDiscountedPrice(tool.price);

        if (this.gameState.money < price) return;

        this.gameState.money -= price;
        if (!this.gameState.tools[toolId]) {
            this.gameState.tools[toolId] = { owned: true, quantity: 1 };
        } else {
            this.gameState.tools[toolId].owned = true;
            this.gameState.tools[toolId].quantity = (this.gameState.tools[toolId].quantity || 0) + 1;
        }

        AudioManager.play("buy");
        this.updateMoney(this.gameState.money);
        this.renderItems();

        if (this.onStateChange) this.onStateChange(this.gameState);
    },

    upgradeTool(toolId) {
        const tool = ITEMS.tools[toolId];
        const playerTool = this.gameState.tools[toolId];
        const cost = tool.upgradeCost[playerTool.level - 1];

        if (this.gameState.money < cost) return;

        this.gameState.money -= cost;
        playerTool.level++;

        AudioManager.play("upgrade");
        this.updateMoney(this.gameState.money);
        this.renderItems();

        if (this.onStateChange) this.onStateChange(this.gameState);
    },

    sellItem(index) {
        const item = this.gameState.inventory[index];
        this.gameState.money += item.value;
        this.gameState.inventory.splice(index, 1);

        AudioManager.play("coin");
        this.updateMoney(this.gameState.money);
        this.renderItems();

        if (this.onStateChange) this.onStateChange(this.gameState);
    },

    bindEvents() {
        document.querySelectorAll(".shop-tab").forEach(tab => {
            tab.onclick = () => this.switchTab(tab.dataset.tab);
        });

        document.getElementById("btn-shop-back").onclick = () => {
            if (this.onBack) this.onBack();
        };
    },

    onStateChange: null,
    onBack: null
};
