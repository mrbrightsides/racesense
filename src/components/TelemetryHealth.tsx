'use client'
import type React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  Clock, 
  Car, 
  RefreshCcw,
  TrendingUp,
  Shield
} from 'lucide-react';
import type { TelemetryHealthReport, VehicleIdentity } from '@/lib/dataQuality';

interface TelemetryHealthProps {
  healthReport: TelemetryHealthReport;
}

export function TelemetryHealth({ healthReport }: TelemetryHealthProps): React.JSX.Element {
  
  // Determine overall health status
  const getHealthStatus = (score: number): { 
    label: string; 
    color: string; 
    icon: React.ReactNode;
    badgeClass: string;
  } => {
    if (score >= 90) {
      return { 
        label: 'EXCELLENT', 
        color: 'text-green-400', 
        icon: <CheckCircle2 className="h-6 w-6" />,
        badgeClass: 'bg-green-950 text-green-400 border-green-800'
      };
    }
    if (score >= 70) {
      return { 
        label: 'GOOD', 
        color: 'text-blue-400', 
        icon: <Activity className="h-6 w-6" />,
        badgeClass: 'bg-blue-950 text-blue-400 border-blue-800'
      };
    }
    if (score >= 50) {
      return { 
        label: 'FAIR', 
        color: 'text-yellow-400', 
        icon: <AlertTriangle className="h-6 w-6" />,
        badgeClass: 'bg-yellow-950 text-yellow-400 border-yellow-800'
      };
    }
    return { 
      label: 'POOR', 
      color: 'text-red-400', 
      icon: <XCircle className="h-6 w-6" />,
      badgeClass: 'bg-red-950 text-red-400 border-red-800'
    };
  };

  const healthStatus = getHealthStatus(healthReport.dataQualityScore);

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="bg-gradient-to-br from-zinc-900 to-black border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white font-black tracking-wide flex items-center gap-2">
                <Shield className="h-6 w-6 text-[#EB0A1E]" />
                🧹 TELEMETRY HEALTH CHECK
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-2">
                REAL-TIME DATA QUALITY ANALYSIS & CORRECTION STATUS
              </CardDescription>
            </div>
            <div className={`flex items-center gap-3 ${healthStatus.color}`}>
              {healthStatus.icon}
              <div>
                <div className="text-4xl font-black font-mono">
                  {healthReport.dataQualityScore.toFixed(0)}
                </div>
                <div className="text-xs font-bold tracking-wider">/100</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-bold">DATA QUALITY SCORE</span>
              <Badge className={healthStatus.badgeClass}>
                {healthStatus.label}
              </Badge>
            </div>
            <Progress 
              value={healthReport.dataQualityScore} 
              className="h-3 bg-zinc-800"
            />
          </div>

          <Alert className="bg-zinc-900 border-zinc-800">
            <TrendingUp className="h-4 w-4 text-[#EB0A1E]" />
            <AlertDescription className="text-zinc-300 text-sm">
              <span className="font-bold text-white">Professional-Grade Corrections Applied:</span> Our system automatically corrects ECU time drift, 
              reconstructs corrupt lap numbers, and resolves vehicle identification issues — ensuring data integrity 
              even when raw telemetry is inaccurate.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Corrections Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-950 to-black border-blue-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400 text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              TIMESTAMPS CORRECTED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white font-mono">
              {healthReport.corrections.timestampsCorrected.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              ECU drift fixed using meta_time
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-950 to-black border-green-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-sm font-bold flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              LAPS RECONSTRUCTED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white font-mono">
              {healthReport.corrections.lapNumbersFixed}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Corrupt lap numbers recovered
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950 to-black border-purple-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-400 text-sm font-bold flex items-center gap-2">
              <Car className="h-4 w-4" />
              VEHICLES TRACKED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white font-mono">
              {healthReport.corrections.vehicleIDsResolved}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Chassis-based identification
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Timestamp Drift Analysis */}
        <Card className="bg-black/70 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white font-black text-sm tracking-wide">
              ⏱️ TIMESTAMP DRIFT ANALYSIS
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">
              ECU clock accuracy vs logger time (meta_time)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Average Drift</span>
                <span className={`font-mono font-bold ${
                  healthReport.timestampDriftPercent < 0.1 ? 'text-green-400' :
                  healthReport.timestampDriftPercent < 1 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {healthReport.timestampDriftPercent.toFixed(4)}%
                </span>
              </div>
              <Progress 
                value={Math.min(100, healthReport.timestampDriftPercent * 10)} 
                className="h-2 bg-zinc-800"
              />
            </div>
            
            <Alert className={`${
              healthReport.timestampDriftPercent < 0.1 
                ? 'bg-green-950/30 border-green-800' 
                : 'bg-yellow-950/30 border-yellow-800'
            }`}>
              <AlertDescription className="text-xs text-zinc-300">
                {healthReport.timestampDriftPercent < 0.1 ? (
                  <><CheckCircle2 className="h-3 w-3 inline mr-1 text-green-400" />
                  <span className="font-bold">Excellent:</span> ECU clock is highly accurate. Minimal corrections needed.</>
                ) : (
                  <><AlertTriangle className="h-3 w-3 inline mr-1 text-yellow-400" />
                  <span className="font-bold">Corrected:</span> ECU clock drift detected and fixed using meta_time as ground truth.</>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Lap Integrity Report */}
        <Card className="bg-black/70 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white font-black text-sm tracking-wide">
              🔄 LAP INTEGRITY REPORT
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">
              Corrupt lap detection & reconstruction status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-zinc-500 text-xs font-bold mb-1">Total Laps</div>
                <div className="text-2xl font-black text-white font-mono">
                  {healthReport.lapIntegrity.totalLaps}
                </div>
              </div>
              <div>
                <div className="text-zinc-500 text-xs font-bold mb-1">Anomalies Found</div>
                <div className="text-2xl font-black text-red-400 font-mono">
                  {healthReport.lapAnomalyCount}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Reconstruction Method</span>
                <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-300 text-xs">
                  {healthReport.lapIntegrity.lapDetectionMethod.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Confidence Level</span>
                <span className="font-mono font-bold text-green-400">
                  {(healthReport.lapIntegrity.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {healthReport.lapAnomalyCount > 0 && (
              <Alert className="bg-[#EB0A1E]/10 border-[#EB0A1E]">
                <AlertDescription className="text-xs text-zinc-300">
                  <span className="font-bold text-[#EB0A1E]">🚨 {healthReport.lapAnomalyCount} corrupt lap(s) detected</span> 
                  {' '}(including 32768 overflow bug). All laps successfully reconstructed using {healthReport.lapIntegrity.lapDetectionMethod} algorithm.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Identity Mapping */}
      <Card className="bg-black/70 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white font-black text-sm tracking-wide">
            🚗 VEHICLE IDENTIFICATION MAP
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs">
            Chassis-based vehicle tracking with car number history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthReport.vehicleIdentities.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No vehicle data available
            </div>
          ) : (
            <div className="space-y-4">
              {healthReport.vehicleIdentities.map((vehicle: VehicleIdentity, index: number) => (
                <div 
                  key={`vehicle-${vehicle.chassisNumber}-${index}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#EB0A1E] text-white font-bold">
                          CHASSIS #{vehicle.chassisNumber}
                        </Badge>
                        <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                          CAR #{vehicle.primaryCarNumber}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-500 mt-2">
                        Primary identification key (unique across all events)
                      </div>
                    </div>
                    {vehicle.carNumberChanges.length > 0 && (
                      <Badge className="bg-yellow-950 text-yellow-400 border-yellow-800">
                        {vehicle.carNumberChanges.length} Change(s)
                      </Badge>
                    )}
                  </div>

                  {vehicle.carNumbers.length > 1 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-zinc-400">CAR NUMBER HISTORY</div>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.carNumbers.map((carNum: number, idx: number) => (
                          <Badge 
                            key={`car-${carNum}-${idx}`}
                            variant="outline" 
                            className="bg-zinc-800 border-zinc-700 text-zinc-400 text-xs"
                          >
                            #{carNum}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {vehicle.carNumberChanges.length > 0 && (
                    <Alert className="bg-yellow-950/20 border-yellow-800">
                      <AlertTriangle className="h-3 w-3 text-yellow-400" />
                      <AlertDescription className="text-xs text-zinc-300">
                        <span className="font-bold text-yellow-400">Car number changed during session:</span>
                        {vehicle.carNumberChanges.map((change, idx) => (
                          <div key={`change-${idx}`} className="mt-1">
                            Lap {change.lap}: #{change.oldNumber} → #{change.newNumber}
                          </div>
                        ))}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <Alert className="bg-blue-950/20 border-blue-800">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-xs text-zinc-300">
                <span className="font-bold text-blue-400">✅ Reliable Cross-Session Matching:</span> Our system always keys by chassis_number 
                (unique identifier) with car_number as secondary metadata. This ensures accurate driver/vehicle tracking 
                even when car numbers change between events or when car_number = 000.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Corrections Applied Summary */}
      {(healthReport.carNumberMismatchCount > 0 || healthReport.recoveredLapsCount > 0) && (
        <Card className="bg-gradient-to-br from-green-950 to-black border-green-900">
          <CardHeader>
            <CardTitle className="text-green-400 font-black text-sm tracking-wide flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              ✅ CORRECTIONS SUCCESSFULLY APPLIED
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {healthReport.carNumberMismatchCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">
                  🚗 Car number mismatches detected and resolved
                </span>
                <Badge className="bg-green-800 text-white font-mono">
                  {healthReport.carNumberMismatchCount}
                </Badge>
              </div>
            )}
            {healthReport.recoveredLapsCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">
                  🔄 Corrupt laps reconstructed successfully
                </span>
                <Badge className="bg-green-800 text-white font-mono">
                  {healthReport.recoveredLapsCount}
                </Badge>
              </div>
            )}
            {healthReport.corrections.timestampsCorrected > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">
                  ⏱️ Timestamp drift corrections applied
                </span>
                <Badge className="bg-green-800 text-white font-mono">
                  {healthReport.corrections.timestampsCorrected}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
