import { TelemetryEvent, DriveSettings } from '../types/telemetry';

export class EventDetector {
  private lastEventTimestamps: Record<string, number> = {
    harsh_acceleration: 0,
    harsh_braking: 0,
    harsh_cornering: 0,
  };

  private cooldownMs = 4000; // 4 seconds cooldown between same event types

  // Gravity tracking vector (for orientation-independent linear acceleration calculation)
  private gravity: number[] = [0, 0, 9.81]; 
  private gravityAlpha = 0.02; // Heavy smoothing to capture gravity direction

  /**
   * Processes new accelerometer and gyroscope samples, along with vehicle speed.
   * Returns a TelemetryEvent if a harsh behavior is detected, or null.
   * 
   * @param accelRaw Accelerometer vector [x, y, z] in m/s^2
   * @param gyroRaw Gyroscope vector [x, y, z] in rad/s
   * @param speedMps Current GPS speed in m/s
   * @param prevSpeedMps Previous GPS speed in m/s
   * @param lat Current latitude
   * @param lon Current longitude
   * @param settings Threshold settings
   */
  public processSample(
    accelRaw: number[],
    gyroRaw: number[],
    speedMps: number,
    prevSpeedMps: number,
    lat: number,
    lon: number,
    settings: DriveSettings
  ): TelemetryEvent | null {
    const timestamp = Date.now();

    // 1. Update the gravity vector estimate (Low pass filter raw accelerometer)
    for (let i = 0; i < 3; i++) {
      this.gravity[i] = this.gravityAlpha * accelRaw[i] + (1 - this.gravityAlpha) * this.gravity[i];
    }

    // 2. Subtract gravity to get linear acceleration vector (removing device orientation bias)
    const linearAccel = [
      accelRaw[0] - this.gravity[0],
      accelRaw[1] - this.gravity[1],
      accelRaw[2] - this.gravity[2],
    ];

    // 3. Compute dynamic linear G-Force magnitude
    const linearAccelMag = Math.sqrt(
      linearAccel[0] ** 2 + linearAccel[1] ** 2 + linearAccel[2] ** 2
    );
    const dynamicG = linearAccelMag / 9.81;

    // 4. Compute rotational angular velocity magnitude from Gyroscope
    const angularSpeed = Math.sqrt(gyroRaw[0] ** 2 + gyroRaw[1] ** 2 + gyroRaw[2] ** 2);

    // 5. Speed delta from GPS (acceleration rate in m/s per second)
    const speedDelta = speedMps - prevSpeedMps;

    // --- DETECTION LOGIC ---

    // Harsh Braking: High G-Force and speed decreasing
    if (
      dynamicG >= settings.brakeThreshold &&
      (speedDelta < -0.5 || linearAccel[1] < -settings.brakeThreshold * 9.81) // secondary axial check
    ) {
      if (timestamp - this.lastEventTimestamps.harsh_braking > this.cooldownMs) {
        this.lastEventTimestamps.harsh_braking = timestamp;
        return {
          timestamp,
          type: 'harsh_braking',
          latitude: lat,
          longitude: lon,
          magnitude: parseFloat(dynamicG.toFixed(3)),
          description: `Harsh braking detected! Deceleration of ${dynamicG.toFixed(2)}G.`,
        };
      }
    }

    // Harsh Acceleration: High G-Force and speed increasing
    if (
      dynamicG >= settings.accelThreshold &&
      (speedDelta > 0.4 || linearAccel[1] > settings.accelThreshold * 9.81)
    ) {
      if (timestamp - this.lastEventTimestamps.harsh_acceleration > this.cooldownMs) {
        this.lastEventTimestamps.harsh_acceleration = timestamp;
        return {
          timestamp,
          type: 'harsh_acceleration',
          latitude: lat,
          longitude: lon,
          magnitude: parseFloat(dynamicG.toFixed(3)),
          description: `Harsh acceleration detected! Surge of ${dynamicG.toFixed(2)}G.`,
        };
      }
    }

    // Harsh Cornering: High angular velocity (rotational speed) OR high lateral G-force
    // 0.5 rad/s is ~28.6 deg/s (rapid steering angle change)
    const lateralThresholdG = settings.cornerThreshold || 0.40;
    if (
      angularSpeed > 0.55 || 
      (dynamicG >= lateralThresholdG && Math.abs(linearAccel[0]) > lateralThresholdG * 9.81)
    ) {
      if (timestamp - this.lastEventTimestamps.harsh_cornering > this.cooldownMs) {
        this.lastEventTimestamps.harsh_cornering = timestamp;
        const mag = Math.max(dynamicG, angularSpeed);
        return {
          timestamp,
          type: 'harsh_cornering',
          latitude: lat,
          longitude: lon,
          magnitude: parseFloat(mag.toFixed(3)),
          description: `Harsh cornering detected! Lateral force: ${dynamicG.toFixed(2)}G, Rotational rate: ${(angularSpeed * 57.2958).toFixed(1)}°/s.`,
        };
      }
    }

    return null;
  }

  /**
   * Resets detector states
   */
  public reset(): void {
    this.lastEventTimestamps = {
      harsh_acceleration: 0,
      harsh_braking: 0,
      harsh_cornering: 0,
    };
    this.gravity = [0, 0, 9.81];
  }
}
