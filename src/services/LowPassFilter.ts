/**
 * LowPassFilter implementation to strip high-frequency road bumps
 * and vibration noise from sensors.
 */
export class LowPassFilter {
  private alpha: number;
  private lastValue: number[] | null = null;

  /**
   * @param alpha Smoothing factor between 0 and 1. Smaller values mean more smoothing.
   */
  constructor(alpha: number = 0.15) {
    this.alpha = alpha;
  }

  /**
   * Filters the incoming vector values
   */
  public filter(newValue: number[]): number[] {
    if (!this.lastValue) {
      this.lastValue = [...newValue];
      return this.lastValue;
    }
    for (let i = 0; i < newValue.length; i++) {
      this.lastValue[i] = this.alpha * newValue[i] + (1 - this.alpha) * this.lastValue[i];
    }
    return [...this.lastValue];
  }

  /**
   * Resets the filter state
   */
  public reset(): void {
    this.lastValue = null;
  }
}
