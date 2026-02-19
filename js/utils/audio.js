// ============================================================
// AUDIO MANAGER
// Handles SFX and music. Works with placeholder until real assets.
// ============================================================

const AudioManager = {
    sounds: {},
    music: null,
    musicVolume: 0.3,
    sfxVolume: 0.7,
    muted: false,

    init() {
        // Pre-define sound names - actual files loaded when available
        this.soundNames = [
            "click", "lock_open", "lock_fail", "pick_move",
            "coin", "paper", "swoosh", "typewriter",
            "success", "layer_complete", "safe_open",
            "buy", "upgrade", "hint"
        ];
    },

    loadSound(name, path) {
        try {
            const audio = new Audio(path);
            audio.preload = "auto";
            this.sounds[name] = audio;
        } catch (e) {
            // Silently fail - sounds are optional
        }
    },

    play(name) {
        if (this.muted || !this.sounds[name]) return;
        try {
            const sound = this.sounds[name].cloneNode();
            sound.volume = this.sfxVolume;
            sound.play().catch(() => {});
        } catch (e) {
            // Silently fail
        }
    },

    playMusic(path) {
        if (this.music) {
            this.music.pause();
        }
        try {
            this.music = new Audio(path);
            this.music.loop = true;
            this.music.volume = this.musicVolume;
            this.music.play().catch(() => {});
        } catch (e) {
            // Silently fail
        }
    },

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music = null;
        }
    },

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted && this.music) {
            this.music.pause();
        } else if (!this.muted && this.music) {
            this.music.play().catch(() => {});
        }
        return this.muted;
    }
};
