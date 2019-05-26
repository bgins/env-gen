import { IAudioContext, IAudioParam, IGainNode, IConstantSourceNode } from "standardized-audio-context";

class Envelope {
  settings: IEnvelopeSettings = {
    initialLevel: 0,
    attackTime: 0,
    attackMaxLevel: 1,
    decayTime: 0,
    sustainLevel: 1,
    releaseTime: 0
  };
  audioContext: IAudioContext;
  targetParam: IAudioParam;
  gateOpenAt: number;
  gateClosedAt: number;
  endReleaseAt: number;

  constructor(audioContext: IAudioContext, settings: IEnvelopeSettings) {
    this.audioContext = audioContext;

    this.settings.attackTime = settings.attackTime;
    this.settings.decayTime = settings.decayTime;
    this.settings.sustainLevel = settings.sustainLevel;
    this.settings.releaseTime = settings.releaseTime;

    if (settings.initialLevel) this.settings.initialLevel = settings.initialLevel;
    if (settings.attackMaxLevel) this.settings.attackMaxLevel = settings.attackMaxLevel;
  }

  connect(targetParam: IAudioParam): void {
    this.targetParam = targetParam;
  }

  openGate(gateOpenAt: number): void {
    this.gateOpenAt = gateOpenAt;

    this.targetParam.setValueAtTime(this.settings.initialLevel, gateOpenAt);
    this.targetParam.linearRampToValueAtTime(1, gateOpenAt + this.settings.attackTime);
    this.targetParam.exponentialRampToValueAtTime(
      this.settings.sustainLevel,
      gateOpenAt + this.settings.attackTime + this.settings.decayTime
    );
  }

  closeGate(gateClosedAt: number): void {
    this.gateClosedAt = gateClosedAt;
    this.targetParam.exponentialRampToValueAtTime(0.0001, gateClosedAt + this.settings.releaseTime);
  }

  stop(stopAt: number): void {}

  retrigger(retriggerAt: number): void {
    // determine current phase with startTime and time for phases
    // * cancelAndHoldAt
    // * determine level to start and calculate remainig time
    // schedule remaining events
  }
}

interface IEnvelopeSettings {
  initialLevel?: number;
  // delayTime: number;
  attackTime: number;
  attackMaxLevel?: number;
  // holdTime: number;
  decayTime: number;
  sustainLevel: number;
  releaseTime: number;
  // attackCurveType: string?
  // decayCurveType: string?
  // releaseCurveType: string?
  // velocityScaling: number;
}

export default Envelope;
