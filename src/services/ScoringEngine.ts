import { TelemetryEvent, DriveSettings } from '../types/telemetry';

export class ScoringEngine {
  /**
   * Calculates the overall safety score for a trip.
   * Starts at 100 and applies deductions based on event counts, weighted by severity 
   * and normalized per kilometer to prevent punishing longer trips disproportionately.
   * 
   * @param events List of events triggered during the trip
   * @param distanceMeters Distance of the trip in meters
   * @param settings Weighted deduction settings
   */
  public static calculateScore(
    events: TelemetryEvent[],
    distanceMeters: number,
    settings: DriveSettings
  ): number {
    // If the trip is extremely short (less than 150m), return a perfect score.
    if (distanceMeters < 150) {
      return 100;
    }

    const distanceKm = distanceMeters / 1000;

    // Count occurrences of each event type
    const accelCount = events.filter(e => e.type === 'harsh_acceleration').length;
    const brakeCount = events.filter(e => e.type === 'harsh_braking').length;
    const cornerCount = events.filter(e => e.type === 'harsh_cornering').length;

    // Weighted event total
    const weightedScoreDeductions =
      accelCount * settings.weightAccel +
      brakeCount * settings.weightBrake +
      cornerCount * settings.weightCorner;

    // Normalization factor: Deductions are calculated per kilometer,
    // with a scaling factor to determine score impact.
    // e.g., if there are 2 events in a 10km drive, the event rate is 0.2 events/km.
    // We scale the deduction rate so that 1 event/km reduces the score by about 10 points.
    const eventRatePerKm = weightedScoreDeductions / distanceKm;
    const rawScore = 100 - eventRatePerKm * 8;

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }

  /**
   * Helper to evaluate a score into a descriptive category with color hexes
   */
  public static getSafetyTier(score: number): { tier: string; color: string } {
    if (score >= 90) return { tier: 'Excellent', color: '#10B981' }; // Emerald Green
    if (score >= 80) return { tier: 'Good', color: '#3B82F6' };      // Safe Blue
    if (score >= 70) return { tier: 'Fair', color: '#F59E0B' };      // Amber Warning
    return { tier: 'Poor', color: '#EF4444' };                       // Crimson Red
  }
}
