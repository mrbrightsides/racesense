// RaceSense Telemetry Processing Engine
import type { 
  RawTelemetryPoint, 
  CleanedLap, 
  CleanedTelemetryPoint,
  TireDegradation 
} from '@/types/telemetry';
import { 
  TimestampCorrector, 
  LapReconstructor, 
  VehicleIdentifier,
  TelemetryHealthAnalyzer
} from './dataQuality';
import type { TelemetryHealthReport } from './dataQuality';

/**
 * Data Cleaning Pipeline
 * Handles COTA dataset issues: lap count errors, noisy sensors, timestamp drift
 */
export class TelemetryProcessor {
  
  /**
   * Clean outliers and noisy sensor data
   */
  static cleanTelemetryPoint(point: RawTelemetryPoint): CleanedTelemetryPoint {
    return {
      time: point.meta_time, // Use meta_time instead of ECU time
      speed: this.cleanSpeed(point.speed),
      gear: Math.max(0, Math.min(6, point.gear)),
      nmot: this.clampValue(point.nmot || point.rpm || 0, 0, 15000),
      ath: this.clampValue(point.ath || point.throttle || 0, 0, 100),
      aps: this.clampValue(point.aps || point.throttle || 0, 0, 100),
      pbrake_f: this.clampValue(point.pbrake_f || (point.brake ? point.brake / 2 : 0), 0, 200), // bar
      pbrake_r: this.clampValue(point.pbrake_r || (point.brake ? point.brake / 2 : 0), 0, 200), // bar
      accx_can: this.clampValue(point.accx_can || 0, -5, 5), // G's
      accy_can: this.clampValue(point.accy_can || 0, -5, 5), // G's
      steering_angle: this.clampValue(point.steering_angle || point.steering || 0, -900, 900), // degrees
      vbox_long_minutes: point.vbox_long_minutes || point.longitude || 0,
      vbox_lat_min: point.vbox_lat_min || point.latitude || 0,
      laptrigger_lapdist_dls: point.laptrigger_lapdist_dls || 0, // meters
    };
  }

  /**
   * Remove speed spikes and outliers
   */
  static cleanSpeed(speed: number): number {
    // COTA max speed ~180 mph, remove impossible values
    if (speed < 0 || speed > 200) return 0;
    return speed;
  }

  /**
   * Clamp sensor values to realistic ranges
   */
  static clampValue(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Detect and fix lap count errors (32768 bug)
   */
  static fixLapNumbers(data: RawTelemetryPoint[]): RawTelemetryPoint[] {
    let correctedLap: number = 1;
    let lastValidLap: number = 1;

    return data.map((point: RawTelemetryPoint) => {
      // Detect lap count error
      if (point.lap === 32768 || point.lap < 0 || point.lap > 100) {
        return { ...point, lap: correctedLap };
      }

      // Detect lap increment
      if (point.lap > lastValidLap) {
        correctedLap = point.lap;
        lastValidLap = point.lap;
      }

      return { ...point, lap: correctedLap };
    });
  }

  /**
   * Reconstruct lap boundaries using GPS + speed patterns
   * Now uses professional-grade lap reconstruction algorithms
   */
  static reconstructLaps(data: RawTelemetryPoint[]): CleanedLap[] {
    const laps: Map<number, RawTelemetryPoint[]> = new Map();

    // Use hybrid lap reconstruction (time-based + GPS if available)
    const reconstruction = LapReconstructor.reconstructLapsHybrid(data);
    const fixedData: RawTelemetryPoint[] = reconstruction.data;

    // Group by lap
    fixedData.forEach((point: RawTelemetryPoint) => {
      if (!laps.has(point.lap)) {
        laps.set(point.lap, []);
      }
      laps.get(point.lap)!.push(point);
    });

    // Process each lap
    const processedLaps: CleanedLap[] = [];
    laps.forEach((points: RawTelemetryPoint[], lapNumber: number) => {
      if (points.length < 10) return; // Skip invalid laps

      const cleanedPoints: CleanedTelemetryPoint[] = points.map((p: RawTelemetryPoint) => 
        this.cleanTelemetryPoint(p)
      );

      const speeds: number[] = cleanedPoints.map((p: CleanedTelemetryPoint) => p.speed);
      const times: number[] = cleanedPoints.map((p: CleanedTelemetryPoint) => p.time);

      const lapTime: number = (times[times.length - 1] - times[0]) / 1000; // Convert to seconds
      const avgSpeed: number = speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length;
      const maxSpeed: number = Math.max(...speeds);

      // Detect pit lap (significant speed drop + low avg speed)
      const isPitLap: boolean = avgSpeed < 60 || lapTime > 180;

      processedLaps.push({
        lapNumber,
        carNumber: points[0].car_number,
        chassisNumber: points[0].chassis_number,
        lapTime,
        avgSpeed,
        maxSpeed,
        telemetryPoints: cleanedPoints,
        isPitLap,
      });
    });

    return processedLaps.sort((a: CleanedLap, b: CleanedLap) => a.lapNumber - b.lapNumber);
  }

  /**
   * Calculate tire degradation across laps
   */
  static calculateTireDegradation(laps: CleanedLap[]): TireDegradation[] {
    // Filter out pit laps and invalid laps
    const racingLaps: CleanedLap[] = laps.filter((lap: CleanedLap) => 
      !lap.isPitLap && lap.lapTime > 0 && lap.lapTime < 200
    );

    if (racingLaps.length < 3) return [];

    const degradation: TireDegradation[] = [];
    const baselineLapTime: number = Math.min(...racingLaps.slice(0, 3).map((l: CleanedLap) => l.lapTime));

    for (let i = 0; i < racingLaps.length; i++) {
      const lap: CleanedLap = racingLaps[i];
      const previousLaps: CleanedLap[] = racingLaps.slice(Math.max(0, i - 2), i + 1);
      
      // Calculate degradation rate (lap time increase per lap)
      const degRate: number = previousLaps.length > 1
        ? (lap.lapTime - previousLaps[0].lapTime) / previousLaps.length
        : 0;

      // Predict next lap time using linear regression
      const predictedNextLap: number = lap.lapTime + degRate;

      // Confidence based on consistency
      const stdDev: number = this.calculateStdDev(previousLaps.map((l: CleanedLap) => l.lapTime));
      const confidence: number = Math.max(0, Math.min(1, 1 - stdDev / 5));

      degradation.push({
        lapNumber: lap.lapNumber,
        lapTime: lap.lapTime,
        degradationRate: degRate,
        predictedNextLap,
        confidence,
      });
    }

    return degradation;
  }

  /**
   * Calculate standard deviation
   */
  static calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const avg: number = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    const squareDiffs: number[] = values.map((value: number) => Math.pow(value - avg, 2));
    const avgSquareDiff: number = squareDiffs.reduce((a: number, b: number) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Apply smoothing to remove noise
   */
  static applySmoothingFilter(values: number[], windowSize: number = 3): number[] {
    const smoothed: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start: number = Math.max(0, i - Math.floor(windowSize / 2));
      const end: number = Math.min(values.length, i + Math.floor(windowSize / 2) + 1);
      const window: number[] = values.slice(start, end);
      const avg: number = window.reduce((a: number, b: number) => a + b, 0) / window.length;
      smoothed.push(avg);
    }
    return smoothed;
  }

  /**
   * Process telemetry with comprehensive data quality corrections
   * Returns both cleaned laps and health report
   */
  static processWithHealthCheck(data: RawTelemetryPoint[]): {
    laps: CleanedLap[];
    healthReport: TelemetryHealthReport;
  } {
    // Apply timestamp corrections
    const timestampCorrections = TimestampCorrector.analyzeTimeDrift(data);
    const correctedData = TimestampCorrector.applyCorrections(data, timestampCorrections);

    // Reconstruct laps using hybrid algorithm
    const reconstruction = LapReconstructor.reconstructLapsHybrid(correctedData);
    const processedData = reconstruction.data;

    // Process laps normally
    const cleanedLaps = this.reconstructLaps(data); // Use original data for comparison

    // Generate comprehensive health report
    const healthReport = TelemetryHealthAnalyzer.generateHealthReport(data, processedData);

    return {
      laps: cleanedLaps,
      healthReport,
    };
  }
}
