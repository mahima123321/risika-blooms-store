// Web Audio API Celebratory Delivery Chime & Voice Synthesizer
// Works 100% offline with 0ms network latency across mobile & desktop browsers.

export function playDeliverySuccessChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Professional 5-tone celebratory arpeggio chime (C5 -> E5 -> G5 -> C6 -> E6 harmonic shimmer)
      const notes = [
        { freq: 523.25, time: now + 0.00, dur: 0.32, gain: 0.28 }, // C5
        { freq: 659.25, time: now + 0.11, dur: 0.32, gain: 0.32 }, // E5
        { freq: 783.99, time: now + 0.22, dur: 0.38, gain: 0.36 }, // G5
        { freq: 1046.50, time: now + 0.35, dur: 0.75, gain: 0.42 }, // C6 (luxury bell)
        { freq: 1318.51, time: now + 0.40, dur: 0.85, gain: 0.25 }, // E6 (sparkle overtone)
        { freq: 1567.98, time: now + 0.45, dur: 0.95, gain: 0.20 }  // G6 (celestial decay)
      ];

      notes.forEach(({ freq, time, dur, gain: targetGain }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm bell harmonics: triangle wave with exponential decay
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(targetGain, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + dur + 0.05);
      });

      // Warm reassurance bass note (C4)
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(261.63, now + 0.35);
      bassGain.gain.setValueAtTime(0.0001, now + 0.35);
      bassGain.gain.exponentialRampToValueAtTime(0.35, now + 0.38);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now + 0.35);
      bassOsc.stop(now + 1.25);
    }
  } catch (err) {
    console.warn('Delivery audio chime notice:', err);
  }

  // Mobile Haptic Vibration Pattern (Celebratory Pulse)
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([120, 60, 180, 60, 240]);
    }
  } catch {}

  // Polite, elegant boutique voice announcement: "Congratulations! Bouquet successfully received. Thank you for choosing Rishika Blooms!"
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTimeout(() => {
        const voiceText = customMessage || 'Congratulations! Bouquet successfully received. Thank you for choosing Rishika Blooms!';
        const utterance = new SpeechSynthesisUtterance(voiceText);
        utterance.rate = 0.82; // Calm, polite, unhurried speed
        utterance.pitch = 1.05; // Warm, courteous, welcoming pitch
        utterance.volume = 1.0;

        // Choose polite, refined natural voice if available
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const refinedVoice = voices.find(v => 
            v.lang.includes('en-IN') || 
            v.name.includes('India') || 
            v.name.includes('Natural') || 
            v.name.includes('Zira') || 
            v.name.includes('Samantha') ||
            (v.name.toLowerCase().includes('female') && v.lang.includes('en'))
          ) || voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US')) || voices[0];

          if (refinedVoice) {
            utterance.voice = refinedVoice;
          }
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }, 550);
    }
  } catch (err) {
    console.warn('Speech synthesis alert notice:', err);
  }
}

/**
 * Realistic double-tone message chime for incoming SMS / WhatsApp Delivery Handover OTP.
 * Triggers realistic phone alert tone and subtle vibration.
 */
export function playIncomingMessageTone() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // High-clarity 2-step SMS chime (880 Hz A5 -> 1318.5 Hz E6)
      const tones = [
        { freq: 880, time: now, dur: 0.12, gain: 0.35 },
        { freq: 1318.5, time: now + 0.14, dur: 0.35, gain: 0.40 }
      ];

      tones.forEach(({ freq, time, dur, gain: targetGain }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(targetGain, time + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + dur + 0.04);
      });
    }
  } catch (err) {
    console.warn('Incoming SMS audio alert notice:', err);
  }

  // Mobile vibration for incoming message (two crisp pulses)
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 120]);
    }
  } catch {}
}
