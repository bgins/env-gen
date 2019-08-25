import { AudioContext } from "standardized-audio-context";
import { Envelope } from "../../env-gen";

const audioContext = new AudioContext();
let oscillatorNode = null;

const amp = audioContext.createGain();
amp.gain.setValueAtTime(0.1, audioContext.currentTime);

const envSettings = { attackTime: 1, decayTime: 1, sustainLevel: 0.5, releaseTime: 1 };
// const envSettings = { initialLevel: 0.5, attackTime: 2, decayTime: 2, sustainLevel: 0.3, releaseTime: 3 };
// const envSettings = { attackTime: 2, attackFinalLevel: 0.3, decayTime: 2, sustainLevel: 0.3, releaseTime: 2 };
// const envSettings = {
//   initialLevel: 0.8,
//   attackTime: 2,
//   attackFinalLevel: 0.3,
//   decayTime: 2,
//   sustainLevel: 0.5,
//   releaseTime: 3
// };

const ampEnv = new Envelope(audioContext, envSettings);

const masterGain = audioContext.createGain();
masterGain.gain.setValueAtTime(0.3, audioContext.currentTime);

amp.connect(masterGain);
ampEnv.connect(amp.gain);
masterGain.connect(audioContext.destination);

document.getElementById("start").addEventListener("click", () => {
  if (audioContext.currentTime < ampEnv.getEndTime()) {
    oscillatorNode.stop(audioContext.currentTime + 1000);
    ampEnv.retrigger(audioContext.currentTime, { attackTime: 0.1, decayTime: 2, sustainLevel: 0.2, releaseTime: 3 });
  } else {
    oscillatorNode = audioContext.createOscillator();
    oscillatorNode.type = "sine";
    oscillatorNode.connect(amp);

    const now = audioContext.currentTime;

    oscillatorNode.start(now);
    ampEnv.openGate(now);
  }
});

document.getElementById("stop").addEventListener("click", () => {
  const now = audioContext.currentTime;
  ampEnv.closeGate(now);

  const stopAt = ampEnv.getEndTime();

  oscillatorNode.stop(stopAt);
});
