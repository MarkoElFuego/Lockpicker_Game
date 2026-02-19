// ============================================================
// ITEMS, TOOLS & ECONOMY DATA
// ============================================================

const ITEMS = {
    tools: {
        basic_pick: {
            id: "basic_pick",
            name: "Basic Lock Pick",
            description: "A simple tension wrench and pick. Gets the job done on simple locks.",
            icon: "pick",
            price: 0,
            owned: true,
            level: 1,
            maxLevel: 3,
            upgradeCost: [200, 500],
            effect: "Slows down slider puzzles by 10% per level",
            effectValue: [0.1, 0.2, 0.3]
        },
        tension_wrench: {
            id: "tension_wrench",
            name: "Tension Wrench Set",
            description: "Professional-grade tension tools. Essential for rotation locks.",
            icon: "wrench",
            price: 150,
            owned: false,
            level: 0,
            maxLevel: 3,
            upgradeCost: [300, 600],
            effect: "Increases rotation puzzle tolerance by 5 degrees per level",
            effectValue: [5, 10, 15]
        },
        decoder: {
            id: "decoder",
            name: "Electronic Decoder",
            description: "A pocket device that reveals partial codes. Useful for cracker puzzles.",
            icon: "decoder",
            price: 300,
            owned: false,
            level: 0,
            maxLevel: 3,
            upgradeCost: [500, 1000],
            effect: "Reveals one digit in cracker puzzles per level",
            effectValue: [1, 2, 3]
        },
        stethoscope: {
            id: "stethoscope",
            name: "Safe Stethoscope",
            description: "Listen to the tumblers. Highlights correct memory tiles briefly.",
            icon: "stethoscope",
            price: 250,
            owned: false,
            level: 0,
            maxLevel: 3,
            upgradeCost: [400, 800],
            effect: "Shows memory tiles for extra 0.5s per level",
            effectValue: [0.5, 1.0, 1.5]
        },
        blueprint: {
            id: "blueprint",
            name: "Blueprint Scanner",
            description: "Scans the lock mechanism. Shows pattern paths briefly.",
            icon: "blueprint",
            price: 350,
            owned: false,
            level: 0,
            maxLevel: 3,
            upgradeCost: [600, 1200],
            effect: "Flashes pattern path for 1s per level",
            effectValue: [1, 2, 3]
        },
        dynamite: {
            id: "dynamite",
            name: "Micro Charge",
            description: "Last resort. Instantly cracks one puzzle layer. Single use.",
            icon: "dynamite",
            price: 500,
            owned: false,
            quantity: 0,
            consumable: true,
            effect: "Skip one puzzle layer entirely"
        }
    },

    perks: {
        good_karma: {
            id: "good_karma",
            name: "Good Karma",
            description: "Your kindness is rewarded. Next tool purchase is 10% cheaper.",
            icon: "karma",
            duration: 1, // applies to next purchase only
            active: false
        },
        free_dynamite: {
            id: "free_dynamite",
            name: "Free Charge",
            description: "The Broker slipped you a micro charge.",
            icon: "dynamite",
            immediate: true,
            active: false
        }
    },

    lootValues: {
        artifact: { min: 100, max: 200 },
        ring: { min: 150, max: 300 },
        document: { min: 200, max: 500 },
        files: { min: 250, max: 600 },
        painting: { min: 500, max: 800 },
        drive: { min: 600, max: 1000 },
        list: { min: 800, max: 1500 },
        masterfiles: { min: 2000, max: 3000 }
    }
};

// Difficulty scaling for puzzles
const DIFFICULTY = {
    slider: {
        1: { speed: 2, zones: 1, tolerance: 30 },
        2: { speed: 3, zones: 2, tolerance: 25 },
        3: { speed: 4.5, zones: 2, tolerance: 18 }
    },
    rotation: {
        1: { pins: 3, tolerance: 15 },
        2: { pins: 4, tolerance: 10 },
        3: { pins: 5, tolerance: 7 }
    },
    memory: {
        1: { pairs: 3, showTime: 2000 },
        2: { pairs: 5, showTime: 1500 },
        3: { pairs: 6, showTime: 1000 }
    },
    pattern: {
        1: { nodes: 4, showTime: 2000 },
        2: { nodes: 6, showTime: 1500 },
        3: { nodes: 8, showTime: 1200 }
    },
    cracker: {
        1: { digits: 3, attempts: 8 },
        2: { digits: 4, attempts: 8 },
        3: { digits: 5, attempts: 7 }
    }
};
