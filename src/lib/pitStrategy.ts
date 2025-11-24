// RaceSense Pit Strategy Calculator
import type { CleanedLap, TireDegradation, PitRecommendation, PitScenario } from '@/types/telemetry';

/**
 * Pit Strategy Engine
 * Calculates optimal pit windows based on tire degradation and race pace
 */
export class PitStrategyCalculator {
  
  private static readonly PIT_LOSS_TIME: number = 25; // Average pit stop time loss in seconds
  private static readonly TIRE_CHANGE_BENEFIT: number = 2.5; // Lap time gain from fresh tires
  private static readonly DEGRADATION_THRESHOLD: number = 0.3; // When to consider pitting (s/lap)

  /**
   * Calculate optimal pit window
   */
  static calculatePitRecommendation(
    currentLap: number,
    laps: CleanedLap[],
    tireDeg: TireDegradation[],
    totalRaceLaps: number = 40
  ): PitRecommendation {
    
    if (tireDeg.length < 5) {
      return {
        recommendedLap: currentLap + 10,
        currentLap,
        reason: 'Insufficient data - building tire model...',
        timeSaving: 0,
        urgency: 'low',
        scenarios: [],
      };
    }

    // Get current degradation rate
    const recentDeg: TireDegradation[] = tireDeg.slice(-3);
    const avgDegRate: number = recentDeg.reduce((sum: number, d: TireDegradation) => 
      sum + d.degradationRate, 0) / recentDeg.length;

    // Calculate scenarios for different pit windows
    const scenarios: PitScenario[] = this.calculatePitScenarios(
      currentLap,
      totalRaceLaps,
      avgDegRate,
      laps
    );

    // Guard: If no scenarios (race ending), return stay-out recommendation
    if (scenarios.length === 0) {
      return {
        recommendedLap: totalRaceLaps,
        currentLap,
        reason: 'Race ending - stay out and push to the finish!',
        timeSaving: 0,
        urgency: 'low',
        scenarios: [],
      };
    }

    // Find optimal pit lap (minimum total time)
    const optimalScenario: PitScenario = scenarios.reduce((best: PitScenario, current: PitScenario) =>
      current.totalTime < best.totalTime ? current : best,
      scenarios[0] // Add initial value as safety
    );

    // Determine urgency based on degradation rate
    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (avgDegRate > this.DEGRADATION_THRESHOLD * 2) {
      urgency = 'high';
    } else if (avgDegRate > this.DEGRADATION_THRESHOLD) {
      urgency = 'medium';
    }

    // Calculate time saving vs. current strategy
    const noStopScenario: PitScenario = this.projectNoStopScenario(currentLap, totalRaceLaps, avgDegRate, laps);
    const timeSaving: number = noStopScenario.totalTime - optimalScenario.totalTime;

    // Generate recommendation reason
    let reason: string = '';
    if (optimalScenario.pitLap <= currentLap + 2) {
      reason = `Pit NOW! Tires degrading at ${avgDegRate.toFixed(3)}s/lap. Expected to save ${timeSaving.toFixed(1)}s.`;
    } else if (optimalScenario.pitLap <= currentLap + 5) {
      reason = `Pit in ${optimalScenario.pitLap - currentLap} laps. Tire deg accelerating. Save ${timeSaving.toFixed(1)}s vs no-stop.`;
    } else {
      reason = `Stay out. Optimal window: Lap ${optimalScenario.pitLap}. Current deg: ${avgDegRate.toFixed(3)}s/lap.`;
    }

    return {
      recommendedLap: optimalScenario.pitLap,
      currentLap,
      reason,
      timeSaving,
      urgency,
      scenarios,
    };
  }

  /**
   * Calculate multiple pit window scenarios
   */
  private static calculatePitScenarios(
    currentLap: number,
    totalLaps: number,
    degradationRate: number,
    laps: CleanedLap[]
  ): PitScenario[] {
    
    const scenarios: PitScenario[] = [];
    const baselineLapTime: number = this.getBaselineLapTime(laps);

    // Test pit windows from current lap to lap 30
    for (let pitLap = currentLap + 1; pitLap <= Math.min(currentLap + 15, totalLaps - 5); pitLap += 2) {
      
      // Calculate time on current tires
      const lapsOnCurrentTires: number = pitLap - currentLap;
      let timeOnOldTires: number = 0;
      for (let i = 0; i < lapsOnCurrentTires; i++) {
        timeOnOldTires += baselineLapTime + (degradationRate * (currentLap + i - 1));
      }

      // Add pit stop time
      const pitStopTime: number = this.PIT_LOSS_TIME;

      // Calculate time on fresh tires
      const lapsOnNewTires: number = totalLaps - pitLap;
      let timeOnNewTires: number = 0;
      for (let i = 0; i < lapsOnNewTires; i++) {
        // Fresh tires benefit, then gradual degradation
        const freshTireBenefit: number = Math.max(0, this.TIRE_CHANGE_BENEFIT - (i * degradationRate * 0.5));
        timeOnNewTires += baselineLapTime - freshTireBenefit + (degradationRate * i * 0.3);
      }

      const totalTime: number = timeOnOldTires + pitStopTime + timeOnNewTires;
      const description: string = `Pit lap ${pitLap}: ${lapsOnCurrentTires} laps old tires, ${lapsOnNewTires} laps fresh tires`;

      scenarios.push({
        pitLap,
        projectedPosition: 0, // Could be enhanced with competitor data
        totalTime,
        description,
      });
    }

    return scenarios.sort((a: PitScenario, b: PitScenario) => a.totalTime - b.totalTime);
  }

  /**
   * Project scenario if no pit stop is made
   */
  private static projectNoStopScenario(
    currentLap: number,
    totalLaps: number,
    degradationRate: number,
    laps: CleanedLap[]
  ): PitScenario {
    
    const baselineLapTime: number = this.getBaselineLapTime(laps);
    const remainingLaps: number = totalLaps - currentLap;
    
    let totalTime: number = 0;
    for (let i = 0; i < remainingLaps; i++) {
      totalTime += baselineLapTime + (degradationRate * (currentLap + i));
    }

    return {
      pitLap: -1,
      projectedPosition: 0,
      totalTime,
      description: 'No pit stop - run to end on current tires',
    };
  }

  /**
   * Get baseline lap time (average of best 3 laps)
   */
  private static getBaselineLapTime(laps: CleanedLap[]): number {
    const racingLaps: CleanedLap[] = laps
      .filter((lap: CleanedLap) => !lap.isPitLap && lap.lapTime > 0 && lap.lapTime < 200)
      .sort((a: CleanedLap, b: CleanedLap) => a.lapTime - b.lapTime);

    if (racingLaps.length === 0) return 90; // Default COTA lap time

    const bestLaps: CleanedLap[] = racingLaps.slice(0, Math.min(3, racingLaps.length));
    return bestLaps.reduce((sum: number, lap: CleanedLap) => sum + lap.lapTime, 0) / bestLaps.length;
  }

  /**
   * Determine if undercut opportunity exists
   */
  static analyzeUndercutOpportunity(
    currentLap: number,
    myTireDeg: TireDegradation[],
    competitorTireDeg?: TireDegradation[]
  ): { hasOpportunity: boolean; advantage: number; description: string } {
    
    if (!competitorTireDeg || myTireDeg.length < 3) {
      return {
        hasOpportunity: false,
        advantage: 0,
        description: 'Insufficient data for undercut analysis',
      };
    }

    const myDegRate: number = myTireDeg.slice(-3).reduce((sum: number, d: TireDegradation) => 
      sum + d.degradationRate, 0) / 3;
    
    const compDegRate: number = competitorTireDeg.slice(-3).reduce((sum: number, d: TireDegradation) => 
      sum + d.degradationRate, 0) / 3;

    // Undercut works if competitor's tires are degrading faster
    const hasOpportunity: boolean = compDegRate > myDegRate * 1.2;
    const advantage: number = hasOpportunity ? (compDegRate - myDegRate) * 3 : 0;

    const description: string = hasOpportunity
      ? `Undercut available! Competitor deg: ${compDegRate.toFixed(3)}s/lap vs yours: ${myDegRate.toFixed(3)}s/lap`
      : 'No clear undercut opportunity';

    return { hasOpportunity, advantage, description };
  }
}
