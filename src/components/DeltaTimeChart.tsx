'use client'
import type React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';
import html2canvas from 'html2canvas';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { CleanedLap } from '@/types/telemetry';

interface DeltaTimeChartProps {
  laps: CleanedLap[];
  currentLap: number;
  bestLapTime: number;
  averageLapTime: number;
}

export function DeltaTimeChart({ laps, currentLap, bestLapTime, averageLapTime }: DeltaTimeChartProps): React.JSX.Element {
  
  const exportChart = async (): Promise<void> => {
    const chartElement = document.getElementById('delta-time-chart');
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
          a.download = `delta-time-chart-${Date.now()}.png`;
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

  // Calculate delta times
  const chartData = laps
    .filter((lap: CleanedLap) => !lap.isPitLap && lap.lapTime > 0 && lap.lapTime < 200)
    .map((lap: CleanedLap) => ({
      lapNumber: lap.lapNumber,
      deltaToBest: lap.lapTime - bestLapTime,
      deltaToAverage: lap.lapTime - averageLapTime,
      lapTime: lap.lapTime,
    }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }> }): React.JSX.Element | null => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as { lapNumber: number; deltaToBest: number; deltaToAverage: number; lapTime: number };
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold">Lap {data.lapNumber}</p>
          <p className="text-sm">Lap Time: {data.lapTime.toFixed(2)}s</p>
          <p className="text-sm text-green-600">
            Δ to Best: {data.deltaToBest >= 0 ? '+' : ''}{data.deltaToBest.toFixed(2)}s
          </p>
          <p className="text-sm text-blue-600">
            Δ to Avg: {data.deltaToAverage >= 0 ? '+' : ''}{data.deltaToAverage.toFixed(2)}s
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card id="delta-time-chart">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Delta Time Analysis</CardTitle>
            <CardDescription>
              Lap time difference vs. best lap and field average
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
              dataKey="lapNumber" 
              label={{ value: 'Lap Number', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Delta Time (s)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="deltaToBest" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Δ to Best Lap"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="deltaToAverage" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Δ to Average"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="font-semibold text-green-700 dark:text-green-300">Best Lap Reference</p>
            <p className="text-2xl font-bold text-green-600">{bestLapTime.toFixed(2)}s</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="font-semibold text-blue-700 dark:text-blue-300">Field Average</p>
            <p className="text-2xl font-bold text-blue-600">{averageLapTime.toFixed(2)}s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
