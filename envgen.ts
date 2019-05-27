import { IAudioContext, IAudioParam } from "standardized-audio-context";

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
  gateOpen: Boolean = false;
  gateOpenAt: number;
  startDecayAt: number;
  startSustainAt: number;
  gateClosedAt: number;
  endAt: number;

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
    this.gateOpen = true;
    this.gateOpenAt = gateOpenAt;
    this.startDecayAt = gateOpenAt + this.settings.attackTime;
    this.startSustainAt = this.startDecayAt + this.settings.decayTime;
    this.endAt = Infinity;

    this.targetParam.setValueAtTime(this.settings.initialLevel, gateOpenAt);
    this.targetParam.linearRampToValueAtTime(this.settings.attackMaxLevel, this.startDecayAt);
    this.targetParam.exponentialRampToValueAtTime(this.settings.sustainLevel, this.startSustainAt);
  }

  closeGate(gateClosedAt: number): void {
    this.gateOpen = false;
    this.gateClosedAt = gateClosedAt;
    this.endAt = gateClosedAt + this.settings.releaseTime;
    this.targetParam.exponentialRampToValueAtTime(0.0001, this.endAt);
  }

  getEndTime(): number {
    return this.endAt;
  }

  retrigger(retriggerAt: number): void {
    if (this.gateOpen) {
      if (retriggerAt < this.startDecayAt) {
        console.log("retrigger in attack phase");
      } else if (retriggerAt >= this.startDecayAt && retriggerAt < this.startSustainAt) {
        console.log("retrigger in decay phase");

        this.targetParam.cancelAndHoldAtTime(retriggerAt);

        const currentValue =
          this.settings.attackMaxLevel *
          Math.pow(
            this.settings.sustainLevel / this.settings.attackMaxLevel,
            retriggerAt - this.startDecayAt / this.settings.decayTime
          );

        this.reschedule(retriggerAt, currentValue);
      } else {
        console.log("retrigger in sustain phase");

        this.targetParam.cancelAndHoldAtTime(retriggerAt);

        this.reschedule(retriggerAt, this.settings.sustainLevel);
      }
    } else {
      if (retriggerAt > this.gateClosedAt && retriggerAt <= this.gateClosedAt + this.settings.releaseTime) {
        console.log("retrigger in release phase");

        this.targetParam.cancelAndHoldAtTime(retriggerAt);

        const currentValue =
          this.settings.sustainLevel *
          Math.pow(0.0001 / this.settings.sustainLevel, retriggerAt - this.gateClosedAt / this.settings.releaseTime);

        this.reschedule(retriggerAt, currentValue);
      } else {
        console.log("retrigger after envelope completed");
        this.targetParam.cancelAndHoldAtTime(retriggerAt);
        this.openGate(retriggerAt);
      }
    }
  }

  private reschedule(retriggerAt: number, currentValue: number): void {
    // compute would-have-been start time given current value and attackTime
    const attackWouldHaveStartedAt = this.linearAttackStartTime(retriggerAt, currentValue);

    this.startDecayAt = attackWouldHaveStartedAt + this.settings.attackTime;
    this.startSustainAt = this.startDecayAt + this.settings.decayTime;

    this.targetParam.linearRampToValueAtTime(this.settings.attackMaxLevel, this.startDecayAt);
    this.targetParam.exponentialRampToValueAtTime(this.settings.sustainLevel, this.startSustainAt);
  }

  private linearAttackStartTime(currentTime: number, currentValue: number): number {
    return (
      currentTime -
      ((this.settings.attackTime * (currentValue - this.settings.initialLevel)) / this.settings.attackMaxLevel -
        this.settings.initialLevel)
    );
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
