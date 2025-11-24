'use client';

import type React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { TireDegradation } from '@/types/telemetry';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';
import html2canvas from 'html2canvas';

interface TireDegradationChartProps {
  tireDegradation: TireDegradation[];
  currentLap?: number;
}

export const TireDegradationChart: React.FC<TireDegradationChartProps> = ({ tireDegradation, currentLap }) => {
  const exportChart = async (): Promise<void> => {
    const chartElement = document.getElementById('tire-deg-chart');
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
          a.download = `tire-degradation-chart-${Date.now()}.png`;
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

  const chartData = tireDegradation.map((deg: TireDegradation) => ({
    lap: deg.lapNumber,
    lapTime: parseFloat(deg.lapTime.toFixed(2)),
    predicted: parseFloat(deg.predictedNextLap.toFixed(2)),
    degRate: parseFloat((deg.degradationRate * 1000).toFixed(1)), // Convert to ms for readability
    confidence: parseFloat((deg.confidence * 100).toFixed(0)),
  }));

  // Debug: log if no data
  if (chartData.length === 0 && tireDegradation.length > 0) {
    console.warn(`⚠️ TireDegradationChart: ${tireDegradation.length} points provided but mapping failed`);
  }

  const avgDegRate: number = chartData.length > 0
    ? chartData.reduce((sum: number, d: { lap: number; lapTime: number; predicted: number; degRate: number; confidence: number }) => sum + d.degRate, 0) / chartData.length
    : 0;

  return (
    <Card className="w-full" id="tire-deg-chart">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Tire Degradation Model</CardTitle>
            <CardDescription>
              Real-time tire performance prediction
              {avgDegRate > 0 && ` • Avg deg rate: ${avgDegRate.toFixed(0)}ms/lap`}
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
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorLapTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="lap" 
              label={{ value: 'Lap Number', position: 'insideBottom', offset: -5 }}
              className="text-xs"
            />
            <YAxis 
              label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft' }}
              domain={['dataMin - 1', 'dataMax + 1']}
              className="text-xs"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => {
                if (name === 'degRate') return [`${value}ms/lap`, 'Deg Rate'];
                if (name === 'confidence') return [`${value}%`, 'Confidence'];
                return [`${value}s`, name];
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="lapTime" 
              stroke="hsl(var(--chart-1))" 
              fill="url(#colorLapTime)"
              strokeWidth={2}
              name="Actual Lap Time"
            />
            <Area 
              type="monotone" 
              dataKey="predicted" 
              stroke="hsl(var(--chart-3))" 
              fill="url(#colorPredicted)"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted Next Lap"
            />
            <Line 
              type="monotone" 
              dataKey="degRate" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              yAxisId="right"
              name="Deg Rate (ms/lap)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
