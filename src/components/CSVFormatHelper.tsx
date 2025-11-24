'use client'

import type React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';

export function CSVFormatHelper(): React.JSX.Element {
  const requiredColumns = [
    { name: 'meta_time', type: 'float', description: 'Timestamp in milliseconds' },
    { name: 'ecu_time', type: 'float', description: 'ECU timestamp (may drift)' },
    { name: 'lap', type: 'int', description: 'Current lap number' },
    { name: 'car_number', type: 'int', description: 'Car identifier (sticker on car side)' },
    { name: 'chassis_number', type: 'int', description: 'Chassis ID (used when car_number is 000)' },
    { name: 'Speed', type: 'float', description: 'Actual vehicle speed (km/h)' },
    { name: 'Gear', type: 'int', description: 'Current gear selection' },
    { name: 'nmot', type: 'float', description: 'Engine RPM' },
    { name: 'ath', type: 'float', description: 'Throttle blade position (0-100%)' },
    { name: 'aps', type: 'float', description: 'Accelerator pedal position (0-100%)' },
    { name: 'pbrake_f', type: 'float', description: 'Front brake pressure (bar)' },
    { name: 'pbrake_r', type: 'float', description: 'Rear brake pressure (bar)' },
    { name: 'accx_can', type: 'float', description: 'Forward/backward acceleration (G\'s)' },
    { name: 'accy_can', type: 'float', description: 'Lateral acceleration (G\'s)' },
    { name: 'Steering_Angle', type: 'float', description: 'Steering wheel angle (degrees)' },
    { name: 'VBOX_Long_Minutes', type: 'float', description: 'GPS longitude (degrees)' },
    { name: 'VBOX_Lat_Min', type: 'float', description: 'GPS latitude (degrees)' },
    { name: 'Laptrigger_lapdist_dls', type: 'float', description: 'Distance from start/finish (meters)' },
  ];

  const headerRow = requiredColumns.map(col => col.name).join(',');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <CardTitle>Expected CSV Format</CardTitle>
        </div>
        <CardDescription>
          RaceSense expects telemetry data with exactly 18 columns in this order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="font-semibold">Header Row (scroll to see all columns)</span>
            <ArrowRight className="h-4 w-4 animate-pulse" />
          </div>
          <div className="relative p-3 bg-muted rounded-lg overflow-x-auto">
            <code className="text-primary font-mono text-xs whitespace-nowrap block">
              {headerRow}
            </code>
          </div>
          <p className="text-xs text-muted-foreground italic">
            💡 Tip: Scroll horizontally to view all 18 required columns
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">All Required Columns ({requiredColumns.length}):</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
            {requiredColumns.map((col) => (
              <div key={col.name} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="font-mono font-semibold text-xs">{col.name}</code>
                    <Badge variant="outline" className="text-xs">{col.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{col.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-sm font-semibold mb-2">Data Quality Features:</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span><strong>Auto-corrects lap count errors</strong> (e.g., 32768 → valid lap number)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span><strong>Handles timestamp drift</strong> between ECU and meta_time</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span><strong>Cleans sensor noise</strong> and filters outliers automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span><strong>Detects pit stops</strong> via speed patterns and GPS zones</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span><strong>Smart vehicle ID</strong>: Uses chassis_number when car_number is 000</span>
            </li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}
