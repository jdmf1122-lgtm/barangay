// Web Audio API emergency synthesizer for MDRRMO continuous loud ambulance siren

let audioCtx: AudioContext | null = null;
let alarmInterval: any = null;
let masterAlarmGain: GainNode | null = null;
let currentOsc1: OscillatorNode | null = null;
let currentOsc2: OscillatorNode | null = null;
let currentBuzzMod: OscillatorNode | null = null;
let currentGain: GainNode | null = null;
let isAlarmPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMasterAlarmGain(ctx: AudioContext): GainNode {
  if (!masterAlarmGain) {
    masterAlarmGain = ctx.createGain();
    masterAlarmGain.connect(ctx.destination);
  }
  return masterAlarmGain;
}

// Auto-unlock audio context on user interaction if browser autoplay policy suspended it
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

export function isAlarmSoundPlaying(): boolean {
  return isAlarmPlaying;
}

/**
 * No audible alert or alarm should be triggered — SMS text only per specification.
 */
export function playAccidentAlarmSound(): void {
  // Silent per specification: No audible alert or alarm should be triggered (SMS text only)
  isAlarmPlaying = false;
}

/**
 * Halts and permanently silences the continuous ambulance alarm siren immediately
 */
export function stopAccidentAlarmSound(): void {
  isAlarmPlaying = false;
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }

  // Instantly cut audio signal at the master alarm gain level
  if (masterAlarmGain && audioCtx) {
    try {
      masterAlarmGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterAlarmGain.gain.setValueAtTime(0, audioCtx.currentTime);
    } catch { }
  }

  if (currentOsc1) {
    try {
      currentOsc1.stop();
      currentOsc1.disconnect();
    } catch { }
    currentOsc1 = null;
  }
  if (currentOsc2) {
    try {
      currentOsc2.stop();
      currentOsc2.disconnect();
    } catch { }
    currentOsc2 = null;
  }
  if (currentBuzzMod) {
    try {
      currentBuzzMod.stop();
      currentBuzzMod.disconnect();
    } catch { }
    currentBuzzMod = null;
  }
  if (currentGain) {
    try {
      if (audioCtx) {
        currentGain.gain.cancelScheduledValues(audioCtx.currentTime);
        currentGain.gain.setValueAtTime(0, audioCtx.currentTime);
      }
      currentGain.disconnect();
    } catch { }
    currentGain = null;
  }
}

/**
 * Plays a single confirmation beep for user acknowledgement
 */
export function playActionBeep(freq = 620, duration = 0.18): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio beep error:', e);
  }
}
