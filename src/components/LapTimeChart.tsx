'use client';

import type React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { CleanedLap } from '@/types/telemetry';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';
import html2canvas from 'html2canvas';

interface LapTimeChartProps {
  laps: CleanedLap[];
  currentLap?: number;
}

export const LapTimeChart: React.FC<LapTimeChartProps> = ({ laps, currentLap }) => {
  const exportChart = async (): Promise<void> => {
    const chartElement = document.getElementById('lap-time-chart');
    if (!chartElement) return;

    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lap-time-chart-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

  const chartData = laps
    .filter((lap: CleanedLap) => !lap.isPitLap && lap.lapTime > 0 && lap.lapTime < 300)
    .map((lap: CleanedLap) => ({
      lap: lap.lapNumber,
      lapTime: parseFloat(lap.lapTime.toFixed(2)),
      avgSpeed: parseFloat(lap.avgSpeed.toFixed(1)),
    }));

  // Debug: log if no data
  if (chartData.length === 0 && laps.length > 0) {
    console.warn(`⚠️ LapTimeChart: ${laps.length} laps provided but 0 passed filter. First lap:`, {
      isPitLap: laps[0]?.isPitLap,
      lapTime: laps[0]?.lapTime,
      avgSpeed: laps[0]?.avgSpeed
    });
  }

  const bestLapTime: number = chartData.length > 0 
    ? Math.min(...chartData.map((d: { lap: number; lapTime: number; avgSpeed: number }) => d.lapTime))
    : 0;

  return (
    <Card className="w-full" id="lap-time-chart">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Lap Time Analysis</CardTitle>
            <CardDescription>
              Track lap times and tire degradation progression
              {bestLapTime > 0 && ` • Best: ${bestLapTime.toFixed(2)}s`}
            </CardDescription>
          </div>
          <Button onClick={exportChart} variant="outline" size="sm" className="gap-2">
            <Image className="h-4 w-4" />
            PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="lap" 
              label={{ value: 'Lap Number', position: 'insideBottom', offset: -5 }}
              className="text-xs"
            />
            <YAxis 
              label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft' }}
              domain={['dataMin - 2', 'dataMax + 2']}
              className="text-xs"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => [`${value}s`, 'Lap Time']}
            />
            <Legend />
            {currentLap && (
              <ReferenceLine 
                x={currentLap} 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: 'Current', position: 'top' }}
              />
            )}
            {bestLapTime > 0 && (
              <ReferenceLine 
                y={bestLapTime} 
                stroke="hsl(var(--chart-2))" 
                strokeDasharray="3 3"
                label={{ value: 'Best', position: 'right' }}
              />
            )}
            <Line 
              type="monotone" 
              dataKey="lapTime" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Lap Time"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
