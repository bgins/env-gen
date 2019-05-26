import { AudioContext } from "standardized-audio-context";
import Envelope from "./envgen";

const audioContext = new AudioContext();
let oscillatorNode = null;

const amp = audioContext.createGain();
amp.gain.setValueAtTime(0.1, audioContext.currentTime);

const envSettings = { attackTime: 0.5, decayTime: 0.5, sustainLevel: 1, releaseTime: 1 };
const ampEnv = new Envelope(audioContext, envSettings);

const masterGain = audioContext.createGain();
masterGain.gain.setValueAtTime(0.3, audioContext.currentTime);

amp.connect(masterGain);
ampEnv.connect(amp.gain);
masterGain.connect(audioContext.destination);

document.getElementById("start").addEventListener("click", () => {
  oscillatorNode = audioContext.createOscillator();
  oscillatorNode.type = "sine";
  oscillatorNode.connect(amp);

  const now = audioContext.currentTime;

  oscillatorNode.start(now);
  ampEnv.openGate(now);
});

document.getElementById("stop").addEventListener("click", () => {
  const now = audioContext.currentTime;
  ampEnv.closeGate(now);

  const stopAt = now + envSettings.releaseTime;
  oscillatorNode.stop(stopAt);

  oscillatorNode = null;
});
