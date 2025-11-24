'use client'
import type React from 'react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, Activity } from 'lucide-react';
import type { CleanedLap, TireDegradation, PitScenario } from '@/types/telemetry';

interface WhatIfScenarioProps {
  currentLap: number;
  totalLaps: number;
  laps: CleanedLap[];
  tireDegradation: TireDegradation[];
}

export function WhatIfScenario({ currentLap, totalLaps, laps, tireDegradation }: WhatIfScenarioProps): React.JSX.Element {
  
  const [selectedPitLap, setSelectedPitLap] = useState<number>(currentLap + 10);
  const [comparisonPitLap, setComparisonPitLap] = useState<number>(currentLap + 15);

  // Calculate degradation rate
  const avgDegRate = useMemo(() => {
    if (tireDegradation.length < 3) return 0.2;
    const recentDeg = tireDegradation.slice(-3);
    return recentDeg.reduce((sum: number, d: TireDegradation) => sum + d.degradationRate, 0) / recentDeg.length;
  }, [tireDegradation]);

  // Get baseline lap time
  const baselineLapTime = useMemo(() => {
    const racingLaps = laps
      .filter((lap: CleanedLap) => !lap.isPitLap && lap.lapTime > 0 && lap.lapTime < 200)
      .sort((a: CleanedLap, b: CleanedLap) => a.lapTime - b.lapTime);
    
    if (racingLaps.length === 0) return 90;
    const bestLaps = racingLaps.slice(0, Math.min(3, racingLaps.length));
    return bestLaps.reduce((sum: number, lap: CleanedLap) => sum + lap.lapTime, 0) / bestLaps.length;
  }, [laps]);

  // Calculate scenario
  const calculateScenario = (pitLap: number): PitScenario => {
    const PIT_LOSS_TIME = 25;
    const TIRE_CHANGE_BENEFIT = 2.5;

    // Time on current tires
    const lapsOnCurrentTires = pitLap - currentLap;
    let timeOnOldTires = 0;
    for (let i = 0; i < lapsOnCurrentTires; i++) {
      timeOnOldTires += baselineLapTime + (avgDegRate * (currentLap + i - 1));
    }

    // Add pit stop time
    const pitStopTime = PIT_LOSS_TIME;

    // Time on fresh tires
    const lapsOnNewTires = totalLaps - pitLap;
    let timeOnNewTires = 0;
    for (let i = 0; i < lapsOnNewTires; i++) {
      const freshTireBenefit = Math.max(0, TIRE_CHANGE_BENEFIT - (i * avgDegRate * 0.5));
      timeOnNewTires += baselineLapTime - freshTireBenefit + (avgDegRate * i * 0.3);
    }

    const totalTime = timeOnOldTires + pitStopTime + timeOnNewTires;
    const description = `Pit lap ${pitLap}: ${lapsOnCurrentTires} laps old tires, ${lapsOnNewTires} laps fresh tires`;

    return {
      pitLap,
      projectedPosition: 0,
      totalTime,
      description,
    };
  };

  const scenario1 = useMemo(() => calculateScenario(selectedPitLap), [selectedPitLap, currentLap, totalLaps, avgDegRate, baselineLapTime]);
  const scenario2 = useMemo(() => calculateScenario(comparisonPitLap), [comparisonPitLap, currentLap, totalLaps, avgDegRate, baselineLapTime]);

  const timeDifference = scenario2.totalTime - scenario1.totalTime;
  const isBetterStrategy = timeDifference > 0;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          What-If Pit Strategy Simulator
        </CardTitle>
        <CardDescription>
          Test different pit stop strategies and compare projected race times
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Scenario 1 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Scenario A: Pit on Lap</label>
            <Badge variant="default" className="text-lg px-3 py-1">
              {selectedPitLap}
            </Badge>
          </div>
          <Slider
            value={[selectedPitLap]}
            min={currentLap + 1}
            max={totalLaps - 3}
            step={1}
            onValueChange={(value: number[]) => setSelectedPitLap(value[0])}
            className="w-full"
          />
          <div className="p-3 bg-primary/10 rounded-lg space-y-1">
            <p className="text-sm">{scenario1.description}</p>
            <p className="text-2xl font-bold">
              Total Race Time: {scenario1.totalTime.toFixed(1)}s
            </p>
          </div>
        </div>

        {/* Scenario 2 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Scenario B: Pit on Lap</label>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {comparisonPitLap}
            </Badge>
          </div>
          <Slider
            value={[comparisonPitLap]}
            min={currentLap + 1}
            max={totalLaps - 3}
            step={1}
            onValueChange={(value: number[]) => setComparisonPitLap(value[0])}
            className="w-full"
          />
          <div className="p-3 bg-secondary/10 rounded-lg space-y-1">
            <p className="text-sm">{scenario2.description}</p>
            <p className="text-2xl font-bold">
              Total Race Time: {scenario2.totalTime.toFixed(1)}s
            </p>
          </div>
        </div>

        {/* Comparison */}
        <div className={`p-4 rounded-lg border-2 ${isBetterStrategy ? 'bg-green-50 dark:bg-green-950 border-green-500' : 'bg-red-50 dark:bg-red-950 border-red-500'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isBetterStrategy ? (
                <TrendingDown className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold">
                {isBetterStrategy ? 'Scenario A is FASTER' : 'Scenario B is FASTER'}
              </span>
            </div>
            <Badge variant={isBetterStrategy ? 'default' : 'destructive'} className="text-lg px-3 py-1">
              {Math.abs(timeDifference).toFixed(1)}s
            </Badge>
          </div>
          <p className="text-sm mt-2">
            {isBetterStrategy 
              ? `Pitting on lap ${selectedPitLap} saves ${timeDifference.toFixed(1)}s compared to lap ${comparisonPitLap}`
              : `Pitting on lap ${comparisonPitLap} saves ${Math.abs(timeDifference).toFixed(1)}s compared to lap ${selectedPitLap}`
            }
          </p>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Quick Presets:</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedPitLap(currentLap + 5);
                setComparisonPitLap(currentLap + 10);
              }}
            >
              Early vs Mid
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedPitLap(currentLap + 10);
                setComparisonPitLap(currentLap + 15);
              }}
            >
              Mid vs Late
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedPitLap(currentLap + 5);
                setComparisonPitLap(currentLap + 15);
              }}
            >
              Early vs Late
            </Button>
          </div>
        </div>

        {/* Strategy Insights */}
        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
          <p className="font-semibold">Current Tire Degradation:</p>
          <p>Rate: {avgDegRate.toFixed(3)}s/lap</p>
          <p>Baseline Lap: {baselineLapTime.toFixed(2)}s</p>
          <p>Pit Stop Loss: ~25s</p>
        </div>

      </CardContent>
    </Card>
  );
}
