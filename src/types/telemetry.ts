// RaceSense Type Definitions

export interface RawTelemetryPoint {
  meta_time: number;
  ecu_time: number;
  lap: number;
  car_number: number;
  chassis_number?: number; // Unique chassis ID (e.g., 004 in GR86-004-78)
  speed: number; // km/h
  gear: number;
  nmot: number; // Engine RPM
  ath: number; // Throttle blade position (0-100%)
  aps: number; // Accelerator pedal position (0-100%)
  pbrake_f: number; // Front brake pressure (bar)
  pbrake_r: number; // Rear brake pressure (bar)
  accx_can: number; // Forward/backward acceleration (G's)
  accy_can: number; // Lateral acceleration (G's)
  steering_angle: number; // Steering wheel angle (degrees)
  vbox_long_minutes: number; // GPS longitude (degrees)
  vbox_lat_min: number; // GPS latitude (degrees)
  laptrigger_lapdist_dls: number; // Distance from start/finish (meters)
  // Legacy aliases for backward compatibility
  throttle?: number;
  brake?: number;
  steering?: number;
  rpm?: number;
  latitude?: number;
  longitude?: number;
}

export interface CleanedLap {
  lapNumber: number;
  carNumber: number;
  chassisNumber?: number; // Unique chassis ID
  lapTime: number; // in seconds
  avgSpeed: number;
  maxSpeed: number;
  telemetryPoints: CleanedTelemetryPoint[];
  isPitLap: boolean;
  sectorTimes?: number[];
}

export interface CleanedTelemetryPoint {
  time: number;
  speed: number; // km/h
  gear: number;
  nmot: number; // Engine RPM
  ath: number; // Throttle blade (0-100%)
  aps: number; // Pedal position (0-100%)
  pbrake_f: number; // Front brake (bar)
  pbrake_r: number; // Rear brake (bar)
  accx_can: number; // Forward/backward G's
  accy_can: number; // Lateral G's
  steering_angle: number; // Steering (degrees)
  vbox_long_minutes: number; // GPS longitude
  vbox_lat_min: number; // GPS latitude
  laptrigger_lapdist_dls: number; // Distance from S/F (m)
}

export interface TireDegradation {
  lapNumber: number;
  lapTime: number;
  degradationRate: number; // seconds per lap increase
  predictedNextLap: number;
  confidence: number;
}

export interface PitRecommendation {
  recommendedLap: number;
  currentLap: number;
  reason: string;
  timeSaving: number; // expected time gain in seconds
  urgency: 'low' | 'medium' | 'high';
  scenarios: PitScenario[];
}

export interface PitScenario {
  pitLap: number;
  projectedPosition: number;
  totalTime: number;
  description: string;
}

export interface RaceStrategy {
  carNumber: number;
  chassisNumber?: number; // Unique chassis ID (used when car_number is 000)
  currentLap: number;
  totalLaps: number;
  laps: CleanedLap[];
  tireDegradation: TireDegradation[];
  pitRecommendations: PitRecommendation[];
  averageLapTime: number;
  bestLapTime: number;
}
