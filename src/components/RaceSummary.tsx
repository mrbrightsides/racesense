'use client'

import type React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Clock, Zap, Download, FileText, Image } from 'lucide-react';
import type { CleanedLap, TireDegradation, PitRecommendation } from '@/types/telemetry';

interface RaceSummaryProps {
  laps: CleanedLap[];
  tireDegradation: TireDegradation[];
  pitRecommendations: PitRecommendation[];
  totalLaps: number;
  carNumber: number;
  onExportJSON: () => void;
  onExportPDF: () => void;
  onExportPNG: () => void;
}

export function RaceSummary({ 
  laps, 
  tireDegradation, 
  pitRecommendations,
  totalLaps,
  carNumber,
  onExportJSON,
  onExportPDF,
  onExportPNG
}: RaceSummaryProps): React.JSX.Element {
  
  // Calculate key insights
  const racingLaps = laps.filter(lap => !lap.isPitLap && lap.lapTime > 0 && lap.lapTime < 200);
  const bestLap = racingLaps.reduce((best, lap) => 
    lap.lapTime < best.lapTime ? lap : best
  , racingLaps[0] || { lapTime: 0, lapNumber: 0 });
  
  const averageLapTime = racingLaps.length > 0
    ? racingLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / racingLaps.length
    : 0;
  
  const totalDegradation = tireDegradation.length > 0
    ? tireDegradation[tireDegradation.length - 1].lapTime - tireDegradation[0].lapTime
    : 0;
  
  const avgDegRate = tireDegradation.length > 1
    ? totalDegradation / tireDegradation.length
    : 0;
  
  // Find critical moments
  const highUrgencyMoments = pitRecommendations.filter(rec => rec.urgency === 'high');
  const optimalPitWindow = pitRecommendations.find(rec => rec.urgency === 'high')?.recommendedPitLap || 0;
  
  // Calculate potential time savings
  const actualPitLap = laps.findIndex(lap => lap.isPitLap) + 1;
  const timeSavingsEstimate = actualPitLap > 0 && optimalPitWindow > 0
    ? Math.abs(actualPitLap - optimalPitWindow) * avgDegRate
    : 0;

  return (
    <Card id="race-summary-card" className="border-2 border-primary shadow-lg">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-full">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Race Summary</CardTitle>
              <CardDescription>
                Performance Analysis • Car #{carNumber} • {totalLaps} Laps
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onExportJSON} variant="outline" size="sm" title="Export as JSON">
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button onClick={onExportPDF} variant="outline" size="sm" title="Export as PDF Report">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={onExportPNG} variant="default" size="sm" title="Export as PNG Image">
              <Image className="h-4 w-4 mr-2" />
              PNG
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" /> Best Lap
            </p>
            <p className="text-2xl font-bold text-green-600">
              {bestLap.lapTime.toFixed(2)}s
            </p>
            <p className="text-xs text-muted-foreground">Lap {bestLap.lapNumber}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Average Pace
            </p>
            <p className="text-2xl font-bold">
              {averageLapTime.toFixed(2)}s
            </p>
            <p className="text-xs text-muted-foreground">
              +{(averageLapTime - bestLap.lapTime).toFixed(2)}s vs best
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Tire Degradation
            </p>
            <p className="text-2xl font-bold text-orange-600">
              +{totalDegradation.toFixed(2)}s
            </p>
            <p className="text-xs text-muted-foreground">
              ~{(avgDegRate * 100).toFixed(1)}ms/lap
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Consistency</p>
            <p className="text-2xl font-bold">
              {tireDegradation[0]?.confidence 
                ? `${(tireDegradation[0].confidence * 100).toFixed(0)}%`
                : 'N/A'
              }
            </p>
            <p className="text-xs text-muted-foreground">Lap time variance</p>
          </div>
        </div>

        {/* Strategic Insights */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Strategic Insights</h3>
          
          {optimalPitWindow > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Badge variant="default" className="mt-0.5">KEY FINDING</Badge>
                <div className="flex-1">
                  <p className="font-semibold">Optimal Pit Window: Lap {optimalPitWindow}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on tire degradation analysis and pace predictions.
                    {actualPitLap > 0 && actualPitLap !== optimalPitWindow && (
                      <span className="block mt-1 text-orange-600 font-medium">
                        Actual pit: Lap {actualPitLap} 
                        {timeSavingsEstimate > 0 && (
                          <> • Estimated time loss: ~{timeSavingsEstimate.toFixed(1)}s</>
                        )}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {highUrgencyMoments.length > 0 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="font-semibold text-orange-900 dark:text-orange-100">
                {highUrgencyMoments.length} Critical Decision Point(s)
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                High-urgency pit recommendations were triggered during the race, 
                indicating significant performance drop-off.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">Racing Laps Completed</p>
              <p className="text-2xl font-bold mt-1">{racingLaps.length}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">Pit Stops Detected</p>
              <p className="text-2xl font-bold mt-1">
                {laps.filter(lap => lap.isPitLap).length}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations Summary */}
        <div className="space-y-2">
          <h3 className="font-semibold">RaceSense Recommendations</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Monitor tire degradation rate continuously - current rate: 
                <strong> {(avgDegRate * 1000).toFixed(0)}ms/lap</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Plan pit stops around lap {optimalPitWindow || 'TBD'} based on current degradation curve
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Target consistency: Best lap delta of +{(averageLapTime - bestLap.lapTime).toFixed(2)}s 
                suggests room for improvement in pace management
              </span>
            </li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}
