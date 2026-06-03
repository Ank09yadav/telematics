export const Config = {
  // Telematics & G-Force Thresholds (in G units)
  accelThreshold: 0.30,      // Harsh acceleration trigger
  brakeThreshold: 0.35,      // Harsh braking trigger
  cornerThreshold: 0.40,     // Harsh cornering trigger
  
  // Scoring Deductions (penalty points subtracted per incident per km)
  weightAccel: 5,
  weightBrake: 7,
  weightCorner: 6,

  // Mathematical Parameters
  gravity: 9.81,             // Acceleration due to gravity (m/s^2)
  earthRadius: 6371000,      // Earth's radius in meters (for Haversine calculations)
  
  // Simulator Parameters
  sensorPollInterval: 50,    // Sensor update rate in ms (20Hz)
  gpsPollInterval: 1000,     // Location update rate in ms (1Hz)
};
export default Config;
