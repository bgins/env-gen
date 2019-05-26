import { IAudioContext, IAudioParam, IGainNode, IConstantSourceNode } from "standardized-audio-context";

class Envelope {
  settings: IEnvelopeSettings;
  audioContext: IAudioContext;
  targetParam: IAudioParam;
  gateOpenAt: number;
  gateClosedAt: number;
  endReleaseAt: number;

  constructor(audioContext: IAudioContext, settings: IEnvelopeSettings) {
    this.settings = settings;
    this.audioContext = audioContext;
  }

  connect(targetParam: IAudioParam): void {
    this.targetParam = targetParam;
  }

  openGate(gateOpenAt: number): void {
    this.gateOpenAt = gateOpenAt;

    this.targetParam.setValueAtTime(0.0001, gateOpenAt);
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
  // initialLevel: number;
  // delayTime: number;
  attackTime: number;
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
