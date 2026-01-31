/**
 * ----------------------------------------------------------------------------
 * File: SoundEngine.js
 * Authors:
 *      Amey Thakur
 *      GitHub: https://github.com/ameythakur
 *
 *      Mega Satish
 *      GitHub: https://github.com/msatmod
 *
 * Repository: https://github.com/Amey-Thakur/REACT-TODO-APP
 * License: MIT License
 * Release Date: June 25, 2022
 * ----------------------------------------------------------------------------
 *
 * File Overview:
 * This module is responsible for the synthesized audio feedback system within
 * the React Todo App. It utilizes the Web Audio API to generate real-time
 * sound effects (beeps, shakes, victory chords) without relying on external
 * audio files. This approach ensures low latency and reduces the application's
 * bundle size, providing a premium, tactile user experience (HMI).
 *
 * Architecture:
 * - Implemented as a Singleton class to ensure a single AudioContext instance
 *   across the entire application lifecycle.
 * - Manages the AudioContext state (lazy initialization to comply with browser
 *   autoplay policies).
 * - Provides public methods for distinct application events (click, add, delete, completion).
 *
 */

/**
 * Singleton service for procedural audio generation.
 * Encapsulates Web Audio API complexity to provide simple trigger methods.
 */
class SoundEngine {
    constructor() {
        /** @type {AudioContext|null} The main web audio context. */
        this.audioCtx = null;
        /** @type {boolean} Master switch for audio feedback. */
        this.enabled = true;
    }

    /**
     * Initializes the AudioContext lazily.
     * Modern browsers require a user gesture (click/tap) before an AudioContext
     * can transition to a 'running' state. This method ensures we only create
     * the context when needed.
     */
    init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    /**
     * Sets the enabled state of the sound engine.
     * @param {boolean} val - True to enable sound, false to mute.
     */
    setEnabled(val) {
        this.enabled = val;
    }

    /**
     * Core synthesizer method.
     * Generates a sound wave with specific frequency, type, duration, and volume.
     * 
     * @param {number} freq - Frequency in Hertz.
     * @param {string} type - Waveform type ('sine', 'square', 'sawtooth', 'triangle').
     * @param {number} duration - Duration of the sound in seconds.
     * @param {number} volume - Peak gain volume (0.0 to 1.0).
     */
    createOscillator(freq, type = 'sine', duration = 0.1, volume = 0.1) {
        // Guard clause: Exit if context missing or engine disabled
        if (!this.audioCtx || !this.enabled) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        // Envelope shaping: Instant attack, exponential decay
        gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

        // Signal routing: Oscillator -> Gain -> Destination (Speakers)
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    /**
     * Triggers a short, high-pitched mechanical click.
     * Used for UI interactions like button presses.
     */
    playClick() {
        this.init();
        this.createOscillator(800, 'square', 0.05, 0.02);
    }

    /**
     * Triggers a two-tone ascending "add" sound.
     * Indicates successful item creation.
     */
    playAdd() {
        this.init();
        this.createOscillator(400, 'sine', 0.1, 0.05);
        // Second tone delayed by 50ms to create a chordal/arpeggio effect
        setTimeout(() => this.createOscillator(600, 'sine', 0.15, 0.05), 50);
    }

    /**
     * Triggers a feedback sound for toggling task completion.
     * @param {boolean} completed - The new state of the task (true = done).
     */
    playToggle(completed) {
        this.init();
        if (completed) {
            // High-pitched success shimmer (Major 3rd interval)
            this.createOscillator(1200, 'sine', 0.1, 0.03);
            setTimeout(() => this.createOscillator(1500, 'sine', 0.2, 0.02), 40);
        } else {
            // Low-pitched "uncheck" sound
            this.createOscillator(600, 'sine', 0.1, 0.03);
        }
    }

    /**
     * Triggers a harsh, "sawtooth" deletion sound.
     * Provides tactile feedback for destructive actions.
     */
    playDelete() {
        this.init();
        this.createOscillator(300, 'sawtooth', 0.1, 0.02);
    }

    /**
     * Triggers a complex, multi-harmonic victory chord.
     * executed when the user clears all tasks or hits a specific milestone.
     */
    playVictory() {
        this.init();
        if (!this.audioCtx) return;

        const baseFreq = 220; // A3
        const duration = 2.5;

        // Harmonic swell: Plays a sequence of harmonics to build a major chord
        [1, 1.5, 2, 2.5, 3].forEach((harmonic, i) => {
            setTimeout(() => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq * harmonic, this.audioCtx.currentTime);
                // Pitch bend effect: Slight frequency slide up for "uplifting" feel
                osc.frequency.exponentialRampToValueAtTime(baseFreq * harmonic * 1.5, this.audioCtx.currentTime + duration);

                // Volume envelope: Linear fade in, exponential fade out
                gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.05, this.audioCtx.currentTime + 0.5);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);

                osc.start();
                osc.stop(this.audioCtx.currentTime + duration);
            }, i * 150); // Staggered entry
        });
    }

    /**
     * Plays a gentle ambient chime for the credits sequence.
     */
    playCredits() {
        this.init();
        if (!this.audioCtx) return;
        // Pleasing ambient chime (Perfect 5th)
        this.createOscillator(660, 'sine', 1.2, 0.02);
        setTimeout(() => this.createOscillator(440, 'sine', 1.5, 0.02), 100);
    }
}

// Export as a Singleton instance
export default new SoundEngine();
