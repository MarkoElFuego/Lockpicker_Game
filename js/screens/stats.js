// ============================================================
// STATS / ACHIEVEMENTS SCREEN
// Player dossier and achievement badges.
// ============================================================

const StatsScreen = {
    achievements: [
        { id: "first_heist", name: "First Job", desc: "Complete your first mission", icon: "\uD83D\uDD13", check: s => s.stats.missionsCompleted >= 1 },
        { id: "five_heists", name: "Seasoned Pro", desc: "Complete 5 missions", icon: "\uD83C\uDFC6", check: s => s.stats.missionsCompleted >= 5 },
        { id: "all_london", name: "London Cleared", desc: "Complete all London missions", icon: "\uD83C\uDDEC\uD83C\uDDE7", check: s => s.stats.missionsCompleted >= 10 },
        { id: "big_earner", name: "Big Earner", desc: "Earn $5,000 total", icon: "\uD83D\uDCB0", check: s => s.stats.totalEarnings >= 5000 },
        { id: "rich", name: "Kingpin", desc: "Earn $15,000 total", icon: "\uD83D\uDC51", check: s => s.stats.totalEarnings >= 15000 },
        { id: "tool_master", name: "Well Equipped", desc: "Own all 5 tools", icon: "\uD83D\uDEE0\uFE0F", check: s => {
            const t = s.tools;
            return t.basic_pick.owned && t.tension_wrench.owned && t.decoder.owned && t.stethoscope.owned && t.blueprint.owned;
        }},
        { id: "upgrader", name: "Upgraded", desc: "Upgrade any tool to level 3", icon: "\u2B50", check: s => {
            return Object.values(s.tools).some(t => t.level >= 3);
        }},
        { id: "kind_heart", name: "Kind Heart", desc: "Complete a side quest", icon: "\u2764\uFE0F", check: s => s.completedSideQuests.length >= 1 },
        { id: "both_quests", name: "Robin Hood", desc: "Complete all side quests", icon: "\uD83C\uDFF9", check: s => s.completedSideQuests.length >= 2 },
    ],

    init(gameState) {
        this.gameState = gameState;
        this.renderStats();
        this.renderAchievements();
        this.bindEvents();
    },

    renderStats() {
        const s = this.gameState;
        const grid = document.getElementById("stats-grid");
        grid.innerHTML = "";

        const stats = [
            { label: "Missions Done", value: s.stats.missionsCompleted, icon: "\uD83C\uDFAF" },
            { label: "Total Earnings", value: "$" + s.stats.totalEarnings.toLocaleString(), icon: "\uD83D\uDCB5" },
            { label: "Current Cash", value: "$" + s.money.toLocaleString(), icon: "\uD83D\uDCB0" },
            { label: "Side Quests", value: s.completedSideQuests.length, icon: "\uD83D\uDC9C" },
            { label: "Tools Owned", value: Object.values(s.tools).filter(t => t.owned && !ITEMS.tools[Object.keys(s.tools).find(k => s.tools[k] === t)]?.consumable).length, icon: "\uD83D\uDD27" },
            { label: "Inventory", value: s.inventory.length + " items", icon: "\uD83C\uDF92" },
        ];

        stats.forEach(stat => {
            const el = document.createElement("div");
            el.className = "stat-card";
            el.innerHTML = `
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            `;
            grid.appendChild(el);
        });

        Animations.staggerChildren(grid, ".stat-card", 60);
    },

    renderAchievements() {
        const list = document.getElementById("achievements-list");
        list.innerHTML = "";

        this.achievements.forEach(ach => {
            const unlocked = ach.check(this.gameState);
            const el = document.createElement("div");
            el.className = "achievement-item" + (unlocked ? " achievement-unlocked" : "");
            el.innerHTML = `
                <div class="achievement-icon">${unlocked ? ach.icon : "\uD83D\uDD12"}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${unlocked ? ach.name : "???"}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                </div>
            `;
            list.appendChild(el);
        });

        Animations.staggerChildren(list, ".achievement-item", 50);
    },

    bindEvents() {
        document.getElementById("btn-stats-back").onclick = () => {
            if (this.onBack) this.onBack();
        };
    },

    onBack: null
};
