// ============================================================
// DIALOGUE DATA - Lock Picker: Global Heist
// Robin Hood narrative - our lockpicker helps people in need
// ============================================================

const DIALOGUE = {
    // ---- LONDON: Uncle Arthur ----
    arthur: {
        name: "Uncle Arthur",
        portrait: "arthur",
        intro: [
            "Ah, there you are, lad. I've been waiting.",
            "The name's Arthur. Some call me a thief... but that's not quite right, is it?",
            "We don't steal, lad. We *recover*. We right wrongs. We open doors for those who've been locked out.",
            "London is full of people who need our help. Powerful men lock away what doesn't belong to them.",
            "Your hands... steady, precise. I've seen that gift before. You're a natural.",
            "Let me show you the ropes. Together, we'll make things right in this city.",
            "Now then — let's have a look at the map, shall we?"
        ],
        missionBriefings: {
            museum_storage: [
                "Right, lad. Listen carefully.",
                "The Hargrove Museum has a storage vault. Inside are artifacts stolen from small nations — taken during colonial times.",
                "The museum board refuses to return them. Says they're 'preserving history.' Rubbish.",
                "A group of historians has been fighting for years to get these pieces back to their homeland.",
                "We're going to help them. Get in, open the vault, and recover the artifacts.",
                "The lock is basic — a good place to start. Show me what you've got."
            ],
            jeweler_safe: [
                "This one's personal, lad.",
                "Old Mrs. Whitmore — sweetest lady you'd ever meet — had her late husband's ring stolen.",
                "A crooked jeweler named Finch bought it from the thief. Keeps it in his shop safe.",
                "She can't afford a lawyer, and the police won't help. That's where we come in.",
                "The safe has a combination lock. Shouldn't be too difficult for someone with your talent.",
                "Get the ring back. That's all that matters."
            ],
            bank_vault: [
                "Now this is a bigger job, lad. The Meridian Bank.",
                "A corrupt banker named Holloway has been embezzling pension funds from retired workers.",
                "Thousands of people losing their life savings while he buys yachts.",
                "Inside his private vault are the ledgers — proof of every dirty transaction.",
                "We get those documents to the press, and Holloway goes down. The pensions get restored.",
                "Multiple locks on this one. Stay sharp."
            ],
            mansion_study: [
                "Lord Ashcroft. Nasty piece of work.",
                "He's been blackmailing local shop owners — forcing them to sell their properties cheap.",
                "In his study safe, he keeps the evidence — photos, forged documents, the lot.",
                "We destroy those files, and those families can breathe again.",
                "His mansion has tight security, but the safe itself? That's our domain.",
                "Careful now. This one has layers."
            ],
            warehouse_office: [
                "There's a warehouse down by the docks. Belongs to a company called Greystone Ltd.",
                "They've been dumping toxic waste in the river — poisoning the East End neighborhoods.",
                "The environmental reports proving it? Locked in the site manager's office safe.",
                "Local activists have been fighting this for years but can't get the evidence.",
                "We open that safe, get the documents, and hand them to the right people.",
                "Simple lock, but the place will be guarded. In and out, lad."
            ],
            gallery_vault: [
                "The Pemberton Gallery. Prestigious place... on the surface.",
                "Behind closed doors, they traffic stolen art. Paintings taken from families during wartime.",
                "One family in particular — the Rosenbergs — lost everything. Their grandfather's paintings are in that vault.",
                "We're going to return what belongs to them.",
                "The gallery vault is sophisticated. Multiple security layers.",
                "Take your time, but get it done."
            ],
            hotel_penthouse: [
                "The Grand Regent Hotel. Penthouse suite.",
                "A diplomat named Vasquez has been staying there — on the run from an international warrant.",
                "He's carrying a hard drive with evidence of arms deals to conflict zones.",
                "Interpol can't touch him because of diplomatic immunity. But we can get that drive.",
                "The penthouse safe is top-of-the-line. You'll need your best tools.",
                "This could save lives, lad. Real lives."
            ],
            courthouse_records: [
                "The old courthouse on Fleet Street.",
                "A judge — I won't say his name yet — has been taking bribes to send innocent people to prison.",
                "His private records room has the proof. Payment records, case files, all of it.",
                "Three families have loved ones behind bars for crimes they didn't commit.",
                "We get those records out, and justice gets served. Real justice this time.",
                "The locks are judicial-grade. This won't be easy."
            ],
            embassy_safe: [
                "This is the big one, lad. The Karovian Embassy.",
                "Inside their basement safe is a list — names of whistleblowers in Karovia.",
                "If that list reaches Karovia, those people disappear. Permanently.",
                "A contact inside the embassy tipped us off. We have a window of two hours.",
                "Embassy-grade security. The best locks money can buy.",
                "People's lives depend on us. No pressure, eh?"
            ],
            tower_vault: [
                "The Blackmore Tower. The final job in London.",
                "Everything we've done — the artifacts, the evidence, the documents — it all leads here.",
                "Sir Reginald Blackmore. The puppet master. He's connected to every corrupt figure we've taken down.",
                "His private vault contains the master files — the entire network exposed.",
                "This is the most complex vault in the city. Every type of lock, every security measure.",
                "But I believe in you, lad. You've earned this moment. Let's finish what we started."
            ]
        },
        missionComplete: {
            museum_storage: [
                "Brilliant work, lad! The artifacts are on their way home.",
                "The historians are overjoyed. You've done something truly good today."
            ],
            jeweler_safe: [
                "Mrs. Whitmore has her ring back. She cried, lad. Happy tears.",
                "That's what this is all about. Not the money — the people."
            ],
            bank_vault: [
                "The ledgers are with the press. Holloway won't sleep well tonight.",
                "Thousands of pensioners will get their money back. You did that."
            ],
            mansion_study: [
                "Ashcroft's blackmail files are destroyed. Those shop owners are free.",
                "Sometimes the best thing you can steal is someone's leverage over others."
            ],
            warehouse_office: [
                "The environmental evidence is with the activists now.",
                "Greystone's dumping operation will be shut down. The river will recover. The people will recover."
            ],
            gallery_vault: [
                "The Rosenberg paintings are going home, lad.",
                "Three generations they've waited. You just closed that chapter for them."
            ],
            hotel_penthouse: [
                "The hard drive is on its way to Interpol through... unofficial channels.",
                "Vasquez's arms deals are done. You've stopped weapons flowing to war zones."
            ],
            courthouse_records: [
                "The judge's records are in safe hands now. Three innocent people will be freed.",
                "Justice. Real justice. That's what we deliver, lad."
            ],
            embassy_safe: [
                "The list is destroyed. Those whistleblowers are safe now.",
                "They'll never know your name, but they owe you their lives."
            ],
            tower_vault: [
                "We did it, lad. Blackmore's entire network... exposed.",
                "London is a better place tonight because of what we've done.",
                "But the world is bigger than London, isn't it?",
                "I've got a cousin in Rome... name's Luigi. Bit loud, but his heart's in the right place.",
                "He says they need someone with your particular skills over there.",
                "What do you say, lad? Ready for the next chapter?"
            ]
        },
        shopTalk: [
            "Spend wisely, lad. Good tools make good work.",
            "Ah, shopping! Remember — invest in your picks. They'll never let you down.",
            "A craftsman is only as good as his tools. Choose well.",
            "The best lock pick in the world is useless without the right hands. Lucky you've got both."
        ],
        encouragement: [
            "You've got this, lad. Steady hands.",
            "Remember — patience is our greatest tool.",
            "Take your time. The lock isn't going anywhere.",
            "Feel the mechanism. Let it tell you its secrets."
        ]
    },

    // ---- SIDE QUEST NPCs ----
    sideQuests: {
        crying_lady: {
            name: "Lady Pemberton",
            portrait: "crying_lady",
            request: [
                "*sobbing* Oh, please... you must help me.",
                "My husband passed away last month, and his will — it's locked in our family safe.",
                "The solicitor changed the locks and is trying to claim the estate for himself.",
                "I have nothing. My children have nothing. The will proves it all belongs to us.",
                "Can you open the safe? I'll reward you however I can..."
            ],
            success: [
                "The will! Oh thank heavens, the will is safe!",
                "Bless you, dear. You've saved my family.",
                "Please, take this. It's not much, but it's all I can offer right now."
            ],
            perkName: "Good Karma",
            perkDescription: "Next tool purchase is 10% cheaper"
        },
        shady_merchant: {
            name: "The Broker",
            portrait: "shady_merchant",
            request: [
                "Psst... hey. Yeah, you. Come here.",
                "I hear you're good with locks. I've got a proposition.",
                "There's a storage unit across town. Inside are medical supplies — insulin, antibiotics.",
                "A price-gouging distributor locked them up to create artificial shortage. Drive prices up.",
                "People are going without medicine. Help me crack it open, and we distribute them free.",
                "Oh, and I'll make it worth your while. Got some... special tools."
            ],
            success: [
                "Beautiful work. Those supplies will be at the free clinic by morning.",
                "Here — take this. Military-grade equipment. You'll need it for the bigger jobs.",
                "Nice doing business with a professional."
            ],
            perkName: "Free Dynamite",
            perkDescription: "Receive 1x Dynamite charge"
        }
    },

    // ---- UI TEXT ----
    ui: {
        skip: "Skip",
        next: "Next",
        collect: "Collect",
        doubleReward: "Watch Ad (2x)",
        backToMap: "Back to Map",
        buyTool: "Buy",
        upgradeTool: "Upgrade",
        sellLoot: "Sell",
        startHeist: "Start Heist",
        newGame: "New Game",
        continueGame: "Continue",
        missionComplete: "MISSION COMPLETE",
        safeOpened: "SAFE OPENED!",
        locked: "LOCKED",
        unlocked: "UNLOCKED",
        hintText: "Need a hint?"
    }
};
