// RaceSense Data Quality & Correction Engine
// Handles real-world telemetry issues: ECU time drift, corrupt lap numbers, vehicle ID inconsistencies

import type { RawTelemetryPoint } from '@/types/telemetry';

/**
 * Timestamp Correction Result
 */
export interface TimestampCorrection {
  originalEcuTime: number;
  correctedTimestamp: number;
  driftOffset: number; // milliseconds
  confidence: number; // 0-1
}

/**
 * Vehicle Identity with Chassis-based tracking
 */
export interface VehicleIdentity {
  chassisNumber: number;
  carNumbers: number[]; // Car numbers used (can change per event)
  primaryCarNumber: number;
  lastSeenCarNumber: number;
  carNumberChanges: Array<{ lap: number; oldNumber: number; newNumber: number }>;
}

/**
 * Lap Integrity Report
 */
export interface LapIntegrityReport {
  totalLaps: number;
  corruptedLaps: number[];
  reconstructedLaps: number[];
  lapDetectionMethod: 'telemetry' | 'time-based' | 'gps-based' | 'hybrid';
  confidence: number;
}

/**
 * Overall Telemetry Health Metrics
 */
export interface TelemetryHealthReport {
  timestampDriftPercent: number;
  lapAnomalyCount: number;
  carNumberMismatchCount: number;
  recoveredLapsCount: number;
  dataQualityScore: number; // 0-100
  vehicleIdentities: VehicleIdentity[];
  lapIntegrity: LapIntegrityReport;
  corrections: {
    timestampsCorrected: number;
    lapNumbersFixed: number;
    vehicleIDsResolved: number;
  };
}

/**
 * 🔧 Timestamp Correction Engine
 * Uses meta_time (logger clock) as ground truth to correct ECU time drift
 */
export class TimestampCorrector {
  
  /**
   * Analyze and correct ECU time drift using meta_time as reference
   */
  static analyzeTimeDrift(data: RawTelemetryPoint[]): TimestampCorrection[] {
    if (data.length < 10) return [];

    const corrections: TimestampCorrection[] = [];
    
    // Calculate initial offset (first valid point)
    const firstPoint: RawTelemetryPoint = data[0];
    let baselineOffset: number = firstPoint.meta_time - firstPoint.ecu_time;

    data.forEach((point: RawTelemetryPoint, index: number) => {
      // Calculate current drift
      const expectedEcuTime: number = point.meta_time - baselineOffset;
      const actualEcuTime: number = point.ecu_time;
      const drift: number = expectedEcuTime - actualEcuTime;

      // Detect significant drift (>100ms) and recalculate offset
      if (Math.abs(drift) > 100 && index > 0) {
        // Use rolling window to smooth offset correction
        const window: RawTelemetryPoint[] = data.slice(Math.max(0, index - 5), index + 1);
        const avgOffset: number = window.reduce((sum: number, p: RawTelemetryPoint) => 
          sum + (p.meta_time - p.ecu_time), 0) / window.length;
        baselineOffset = avgOffset;
      }

      const correctedTimestamp: number = point.meta_time; // Always trust meta_time
      const confidence: number = Math.max(0, Math.min(1, 1 - Math.abs(drift) / 1000));

      corrections.push({
        originalEcuTime: actualEcuTime,
        correctedTimestamp,
        driftOffset: drift,
        confidence,
      });
    });

    return corrections;
  }

  /**
   * Calculate overall timestamp drift percentage
   */
  static calculateDriftPercentage(corrections: TimestampCorrection[]): number {
    if (corrections.length === 0) return 0;

    const totalDrift: number = corrections.reduce((sum: number, c: TimestampCorrection) => 
      sum + Math.abs(c.driftOffset), 0);
    
    const avgDrift: number = totalDrift / corrections.length;
    const maxExpectedTime: number = corrections[corrections.length - 1].correctedTimestamp;
    
    return (avgDrift / maxExpectedTime) * 100;
  }

  /**
   * Apply corrections to raw data
   */
  static applyCorrections(data: RawTelemetryPoint[], corrections: TimestampCorrection[]): RawTelemetryPoint[] {
    return data.map((point: RawTelemetryPoint, index: number) => ({
      ...point,
      ecu_time: corrections[index]?.correctedTimestamp || point.meta_time,
    }));
  }
}

/**
 * 🚗 Vehicle Identification System
 * Always keys by chassis_number (unique), with car_number as secondary
 */
export class VehicleIdentifier {
  
  /**
   * Build vehicle identity map from telemetry
   * Handles cases where car_number = 000 or changes between events
   */
  static buildVehicleMap(data: RawTelemetryPoint[]): Map<number, VehicleIdentity> {
    const vehicleMap: Map<number, VehicleIdentity> = new Map();

    data.forEach((point: RawTelemetryPoint, index: number) => {
      const chassis: number = point.chassis_number || 0;
      const carNum: number = point.car_number || 0;

      if (!vehicleMap.has(chassis)) {
        // Create new vehicle identity
        vehicleMap.set(chassis, {
          chassisNumber: chassis,
          carNumbers: [carNum],
          primaryCarNumber: carNum,
          lastSeenCarNumber: carNum,
          carNumberChanges: [],
        });
      } else {
        const vehicle: VehicleIdentity = vehicleMap.get(chassis)!;
        
        // Detect car number change
        if (carNum !== vehicle.lastSeenCarNumber && carNum !== 0) {
          vehicle.carNumberChanges.push({
            lap: point.lap,
            oldNumber: vehicle.lastSeenCarNumber,
            newNumber: carNum,
          });
          
          if (!vehicle.carNumbers.includes(carNum)) {
            vehicle.carNumbers.push(carNum);
          }
          
          vehicle.lastSeenCarNumber = carNum;
        }
      }
    });

    return vehicleMap;
  }

  /**
   * Get vehicle identity by chassis or car number
   */
  static getVehicleIdentity(
    vehicleMap: Map<number, VehicleIdentity>, 
    chassisOrCarNumber: number,
    isChassisNumber: boolean = true
  ): VehicleIdentity | null {
    if (isChassisNumber) {
      return vehicleMap.get(chassisOrCarNumber) || null;
    }
    
    // Search by car number
    for (const vehicle of vehicleMap.values()) {
      if (vehicle.carNumbers.includes(chassisOrCarNumber)) {
        return vehicle;
      }
    }
    
    return null;
  }

  /**
   * Count car number mismatches/changes
   */
  static countCarNumberMismatches(vehicleMap: Map<number, VehicleIdentity>): number {
    let total: number = 0;
    vehicleMap.forEach((vehicle: VehicleIdentity) => {
      total += vehicle.carNumberChanges.length;
    });
    return total;
  }
}

/**
 * 🔄 Lap Reconstruction Engine
 * Fixes corrupt lap numbers (32768 bug) and rebuilds lap boundaries
 */
export class LapReconstructor {
  
  private static readonly CORRUPT_LAP_THRESHOLD: number = 1000; // Lap numbers > 1000 are corrupt
  private static readonly LAP_32768_BUG: number = 32768; // Common ECU overflow
  
  /**
   * Detect corrupt lap numbers
   */
  static detectCorruptLaps(data: RawTelemetryPoint[]): number[] {
    const corruptLaps: Set<number> = new Set();
    
    data.forEach((point: RawTelemetryPoint) => {
      if (point.lap === this.LAP_32768_BUG || 
          point.lap < 0 || 
          point.lap > this.CORRUPT_LAP_THRESHOLD) {
        corruptLaps.add(point.lap);
      }
    });
    
    return Array.from(corruptLaps);
  }

  /**
   * Reconstruct laps using time-based segmentation
   * Detects lap boundaries via time gaps and speed patterns
   */
  static reconstructLapsTimeBased(data: RawTelemetryPoint[]): RawTelemetryPoint[] {
    if (data.length === 0) return [];

    const reconstructed: RawTelemetryPoint[] = [];
    let currentLap: number = 1;
    let lastValidLap: number = 1;
    let lastTime: number = data[0].meta_time;
    
    // Average lap time at COTA (GR Cup: ~90-120 seconds)
    const expectedLapTime: number = 100000; // milliseconds

    data.forEach((point: RawTelemetryPoint, index: number) => {
      const timeSinceLastPoint: number = point.meta_time - lastTime;
      
      // Detect lap boundary: significant time gap or explicit lap increment
      const isLapBoundary: boolean = 
        timeSinceLastPoint > expectedLapTime * 0.8 || // Time-based detection
        (point.lap > lastValidLap && point.lap < this.CORRUPT_LAP_THRESHOLD); // Valid lap increment

      if (isLapBoundary && index > 0) {
        currentLap++;
      }

      // Check if current point has valid lap number
      if (point.lap > 0 && point.lap < this.CORRUPT_LAP_THRESHOLD) {
        currentLap = point.lap;
        lastValidLap = point.lap;
      }

      reconstructed.push({
        ...point,
        lap: currentLap,
      });

      lastTime = point.meta_time;
    });

    return reconstructed;
  }

  /**
   * Reconstruct laps using GPS position (if available)
   * Detects start/finish line crossings
   */
  static reconstructLapsGPSBased(data: RawTelemetryPoint[]): RawTelemetryPoint[] {
    if (data.length === 0) return [];

    const reconstructed: RawTelemetryPoint[] = [];
    let currentLap: number = 1;
    
    // COTA Start/Finish Line GPS coordinates (approximate)
    const SF_LINE_LAT: number = 30.1328; // degrees
    const SF_LINE_THRESHOLD: number = 0.001; // ~100 meters

    let lastLat: number = data[0].vbox_lat_min;

    data.forEach((point: RawTelemetryPoint, index: number) => {
      // Detect S/F line crossing via GPS
      const crossedSFLine: boolean = 
        point.vbox_lat_min !== 0 &&
        Math.abs(point.vbox_lat_min - SF_LINE_LAT) < SF_LINE_THRESHOLD &&
        Math.abs(lastLat - SF_LINE_LAT) > SF_LINE_THRESHOLD;

      if (crossedSFLine && index > 0) {
        currentLap++;
      }

      reconstructed.push({
        ...point,
        lap: currentLap,
      });

      lastLat = point.vbox_lat_min;
    });

    return reconstructed;
  }

  /**
   * Hybrid reconstruction: Uses best available method
   */
  static reconstructLapsHybrid(data: RawTelemetryPoint[]): {
    data: RawTelemetryPoint[];
    method: 'telemetry' | 'time-based' | 'gps-based' | 'hybrid';
  } {
    const corruptLaps: number[] = this.detectCorruptLaps(data);
    
    // If no corruption, use original telemetry
    if (corruptLaps.length === 0) {
      return { data, method: 'telemetry' };
    }

    // Check if GPS data is available
    const hasGPS: boolean = data.some((p: RawTelemetryPoint) => 
      p.vbox_lat_min !== 0 && p.vbox_long_minutes !== 0
    );

    if (hasGPS) {
      // Try GPS-based reconstruction first
      const gpsReconstructed: RawTelemetryPoint[] = this.reconstructLapsGPSBased(data);
      return { data: gpsReconstructed, method: 'gps-based' };
    }

    // Fallback to time-based reconstruction
    const timeReconstructed: RawTelemetryPoint[] = this.reconstructLapsTimeBased(data);
    return { data: timeReconstructed, method: 'time-based' };
  }

  /**
   * Generate lap integrity report
   */
  static generateIntegrityReport(
    originalData: RawTelemetryPoint[],
    reconstructedData: RawTelemetryPoint[]
  ): LapIntegrityReport {
    const corruptedLaps: number[] = this.detectCorruptLaps(originalData);
    
    // Find which laps were reconstructed
    const reconstructedLaps: number[] = [];
    originalData.forEach((orig: RawTelemetryPoint, index: number) => {
      if (orig.lap !== reconstructedData[index]?.lap) {
        reconstructedLaps.push(reconstructedData[index]?.lap || 0);
      }
    });

    const uniqueReconstructed: number[] = Array.from(new Set(reconstructedLaps));
    
    const totalLaps: number = Math.max(...reconstructedData.map((p: RawTelemetryPoint) => p.lap));
    const confidence: number = 1 - (corruptedLaps.length / (totalLaps || 1));

    return {
      totalLaps,
      corruptedLaps,
      reconstructedLaps: uniqueReconstructed,
      lapDetectionMethod: 'hybrid',
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  }
}

/**
 * 📊 Telemetry Health Analyzer
 * Combines all data quality metrics into a comprehensive report
 */
export class TelemetryHealthAnalyzer {
  
  /**
   * Generate comprehensive health report
   */
  static generateHealthReport(
    originalData: RawTelemetryPoint[],
    processedData: RawTelemetryPoint[]
  ): TelemetryHealthReport {
    // Timestamp analysis
    const timestampCorrections: TimestampCorrection[] = TimestampCorrector.analyzeTimeDrift(originalData);
    const timestampDriftPercent: number = TimestampCorrector.calculateDriftPercentage(timestampCorrections);

    // Vehicle identification
    const vehicleMap: Map<number, VehicleIdentity> = VehicleIdentifier.buildVehicleMap(originalData);
    const carNumberMismatchCount: number = VehicleIdentifier.countCarNumberMismatches(vehicleMap);

    // Lap reconstruction
    const corruptedLaps: number[] = LapReconstructor.detectCorruptLaps(originalData);
    const lapIntegrity: LapIntegrityReport = LapReconstructor.generateIntegrityReport(
      originalData,
      processedData
    );

    // Calculate overall data quality score (0-100)
    const dataQualityScore: number = this.calculateQualityScore({
      timestampDriftPercent,
      lapAnomalyCount: corruptedLaps.length,
      carNumberMismatchCount,
      totalDataPoints: originalData.length,
    });

    return {
      timestampDriftPercent,
      lapAnomalyCount: corruptedLaps.length,
      carNumberMismatchCount,
      recoveredLapsCount: lapIntegrity.reconstructedLaps.length,
      dataQualityScore,
      vehicleIdentities: Array.from(vehicleMap.values()),
      lapIntegrity,
      corrections: {
        timestampsCorrected: timestampCorrections.filter((c: TimestampCorrection) => 
          Math.abs(c.driftOffset) > 10
        ).length,
        lapNumbersFixed: lapIntegrity.reconstructedLaps.length,
        vehicleIDsResolved: vehicleMap.size,
      },
    };
  }

  /**
   * Calculate overall data quality score (0-100)
   */
  private static calculateQualityScore(metrics: {
    timestampDriftPercent: number;
    lapAnomalyCount: number;
    carNumberMismatchCount: number;
    totalDataPoints: number;
  }): number {
    let score: number = 100;

    // Deduct points for timestamp drift (max -20 points)
    score -= Math.min(20, metrics.timestampDriftPercent * 2);

    // Deduct points for lap anomalies (max -30 points)
    const lapAnomalyRatio: number = metrics.lapAnomalyCount / (metrics.totalDataPoints || 1);
    score -= Math.min(30, lapAnomalyRatio * 1000);

    // Deduct points for car number mismatches (max -15 points)
    score -= Math.min(15, metrics.carNumberMismatchCount * 5);

    return Math.max(0, Math.min(100, score));
  }
}
