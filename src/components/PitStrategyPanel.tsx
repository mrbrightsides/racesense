'use client';

import type React from 'react';
import type { PitRecommendation } from '@/types/telemetry';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface PitStrategyPanelProps {
  recommendation: PitRecommendation | null;
}

export const PitStrategyPanel: React.FC<PitStrategyPanelProps> = ({ recommendation }) => {
  if (!recommendation) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pit Strategy</CardTitle>
          <CardDescription>Building strategy model...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Analyzing telemetry data to generate pit recommendations.</p>
        </CardContent>
      </Card>
    );
  }

  const urgencyColors: Record<'low' | 'medium' | 'high', string> = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  };

  const urgencyIcons: Record<'low' | 'medium' | 'high', React.ReactElement> = {
    low: <CheckCircle className="h-4 w-4" />,
    medium: <Info className="h-4 w-4" />,
    high: <AlertTriangle className="h-4 w-4" />,
  };

  const isImmediatePit: boolean = recommendation.recommendedLap <= recommendation.currentLap + 2;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Pit Strategy Recommendation</CardTitle>
            <CardDescription>
              Lap {recommendation.currentLap} of race • Analyzing tire performance
            </CardDescription>
          </div>
          <Badge className={urgencyColors[recommendation.urgency]}>
            {urgencyIcons[recommendation.urgency]}
            <span className="ml-1 capitalize">{recommendation.urgency}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isImmediatePit ? (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-600">Pit Window Open!</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {recommendation.reason}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Strategy Update</AlertTitle>
            <AlertDescription>{recommendation.reason}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Recommended Pit Lap</p>
            <p className="text-2xl font-bold text-primary">Lap {recommendation.recommendedLap}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Expected Time Saving</p>
            <p className="text-2xl font-bold text-green-600">
              {recommendation.timeSaving > 0 ? '+' : ''}{recommendation.timeSaving.toFixed(1)}s
            </p>
          </div>
        </div>

        {recommendation.scenarios.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Pit Window Analysis</h4>
            <div className="space-y-2">
              {recommendation.scenarios.slice(0, 3).map((scenario, index) => (
                <div 
                  key={scenario.pitLap}
                  className={`p-3 rounded-lg border ${
                    index === 0 ? 'bg-primary/5 border-primary' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {index === 0 && '🏆 '}{scenario.description}
                      </p>
                    </div>
                    <p className="text-sm font-mono">
                      {(scenario.totalTime / 60).toFixed(2)} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
