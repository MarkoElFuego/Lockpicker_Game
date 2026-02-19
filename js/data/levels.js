// ============================================================
// LEVEL DATA - London (MVP)
// 10 buildings, each with puzzle layers
// ============================================================

const LEVELS = {
    london: {
        name: "London",
        handler: "arthur",
        buildings: [
            {
                id: "museum_storage",
                name: "Hargrove Museum",
                description: "Recover stolen colonial artifacts",
                gridX: 2, gridY: 1,
                icon: "museum",
                difficulty: 1,
                reward: { min: 100, max: 200 },
                loot: { name: "Ancient Artifacts", icon: "artifact" },
                puzzleLayers: [
                    { type: "slider", difficulty: 1 }
                ],
                unlocked: true,
                completed: false,
                story: "Artifacts stolen during colonial times, locked away by a museum that refuses to return them."
            },
            {
                id: "jeweler_safe",
                name: "Finch's Jewelry",
                description: "Return Mrs. Whitmore's stolen ring",
                gridX: 4, gridY: 2,
                icon: "jewelry",
                difficulty: 1,
                reward: { min: 150, max: 300 },
                loot: { name: "Wedding Ring", icon: "ring" },
                puzzleLayers: [
                    { type: "rotation", difficulty: 1 }
                ],
                unlocked: false,
                completed: false,
                requiresComplete: "museum_storage",
                story: "A widow's wedding ring, stolen and sold to a crooked jeweler."
            },
            {
                id: "bank_vault",
                name: "Meridian Bank",
                description: "Expose the pension fund embezzler",
                gridX: 1, gridY: 3,
                icon: "bank",
                difficulty: 2,
                reward: { min: 300, max: 500 },
                loot: { name: "Financial Ledgers", icon: "document" },
                puzzleLayers: [
                    { type: "slider", difficulty: 2 },
                    { type: "rotation", difficulty: 1 }
                ],
                unlocked: false,
                completed: false,
                requiresComplete: "jeweler_safe",
                story: "A corrupt banker embezzling pension funds from thousands of retirees."
            },
            {
                id: "mansion_study",
                name: "Ashcroft Manor",
                description: "Destroy blackmail evidence",
                gridX: 3, gridY: 3,
                icon: "mansion",
                difficulty: 2,
                reward: { min: 350, max: 600 },
                loot: { name: "Blackmail Files", icon: "files" },
                puzzleLayers: [
                    { type: "memory", difficulty: 1 },
                    { type: "slider", difficulty: 2 }
                ],
                unlocked: false,
                completed: false,
                requiresComplete: "bank_vault",
                story: "A lord blackmailing shop owners to seize their properties."
            },
            {
                id: "warehouse_office",
                name: "Greystone Warehouse",
                description: "Retrieve toxic waste evidence",
                gridX: 5, gridY: 4,
                icon: "warehouse",
                difficulty: 2,
                reward: { min: 300, max: 550 },
                loot: { name: "Environmental Reports", icon: "document" },
                puzzleLayers: [
                    { type: "pattern", difficulty: 1 },
                    { type: "rotation", difficulty: 2 }
                ],
                unlocked: false,
                completed: false,
                requiresComplete: "mansion_study",
                story: "A company poisoning East End neighborhoods with illegal toxic dumping."
            },
            {
                id: "gallery_vault",
                name: "Pemberton Gallery",
                description: "Recover stolen wartime paintings",
                gridX: 2, gridY: 5,
                icon: "gallery",
                difficulty: 3,
                reward: { min: 500, max: 800 },
                loot: { name: "Rosenberg Paintings", icon: "painting" },
                puzzleLayers: [
                    { type: "slider", difficulty: 2 },
                    { type: "memory", difficulty: 2 },
                    { type: "cracker", difficulty: 1 }
                ],
                unlocked: false,
                completed: false,
                requiresComplete: "warehouse_office",
                story: "Paintings stolen from a Jewish family during wartime, trafficked through a prestigious gallery."
            },
            {
                id: "hotel_penthouse",
                name: "Grand Regent Hotel",
                description: "Retrieve arms deal evidence",
                gridX: 4, gridY: 5,
                icon: "hotel",
                difficulty: 3,
                reward: { min: 600, max: 1000 },
                loot: { name: "Encrypted Hard Drive", icon: "drive" },
                puzzleLayers: [
                    { type: "rotation", difficulty: 2 },
                    { type: "pattern", difficulty: 2 },
                    { type: "cracker", difficulty: 1 }
                ],
                unlocked: false,
                completed: false,
                requiresComplete: "gallery_vault",
                story: "A diplomat running arms to conflict zones, protected by diplomatic immunity."
            },
            {
                id: "courthouse_records",
                name: "Fleet St. Courthouse",
                description: "Expose the corrupt judge",
                gridX: 1, gridY: 6,
                icon: "courthouse",
                difficulty: 4,
                reward: { min: 800, max: 1200 },
                loot: { name: "Bribery Records", icon: "document" },
                puzzleLayers: [
                    { type: "cracker", difficulty: 2 },
                    { type: "memory", difficulty: 2 },
                    { type: "slider", difficulty: 3 }
                ],
                unlocked: false,
                completed: false,
                requiresComplete: "hotel_penthouse",
                story: "A judge taking bribes to imprison innocent people."
            },
            {
                id: "embassy_safe",
                name: "Karovian Embassy",
                description: "Protect the whistleblowers",
                gridX: 3, gridY: 7,
                icon: "embassy",
                difficulty: 4,
                reward: { min: 1000, max: 1500 },
                loot: { name: "Whistleblower List", icon: "list" },
                puzzleLayers: [
                    { type: "pattern", difficulty: 3 },
                    { type: "rotation", difficulty: 3 },
                    { type: "cracker", difficulty: 2 },
                    { type: "memory", difficulty: 2 }
                ],
                unlocked: false,
                completed: false,
                requiresComplete: "courthouse_records",
                story: "A list of whistleblowers that would be killed if it reaches the wrong hands."
            },
            {
                id: "tower_vault",
                name: "Blackmore Tower",
                description: "Take down the puppet master",
                gridX: 3, gridY: 8,
                icon: "tower",
                difficulty: 5,
                reward: { min: 2000, max: 3000 },
                loot: { name: "Master Network Files", icon: "masterfiles" },
                puzzleLayers: [
                    { type: "slider", difficulty: 3 },
                    { type: "rotation", difficulty: 3 },
                    { type: "memory", difficulty: 3 },
                    { type: "pattern", difficulty: 3 },
                    { type: "cracker", difficulty: 3 }
                ],
                unlocked: false,
                completed: false,
                requiresComplete: "embassy_safe",
                story: "The puppet master behind every corrupt figure in London. This ends here."
            }
        ],
        sideQuests: [
            {
                id: "crying_lady",
                appearsAfter: "jeweler_safe",
                gridX: 5, gridY: 1,
                completed: false,
                puzzle: { type: "rotation", difficulty: 1 },
                reward: { money: 50, perk: "good_karma" }
            },
            {
                id: "shady_merchant",
                appearsAfter: "warehouse_office",
                gridX: 1, gridY: 4,
                completed: false,
                puzzle: { type: "slider", difficulty: 2 },
                reward: { money: 100, perk: "free_dynamite" }
            }
        ]
    }
};
