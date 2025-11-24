'use client'
import type React, { useEffect } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, RotateCcw, Sparkles, Download, FileText, Image, Home } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileUploader } from '@/components/FileUploader';
import { LapTimeChart } from '@/components/LapTimeChart';
import { TireDegradationChart } from '@/components/TireDegradationChart';
import { PitStrategyPanel } from '@/components/PitStrategyPanel';
import { DeltaTimeChart } from '@/components/DeltaTimeChart';
import { WhatIfScenario } from '@/components/WhatIfScenario';
import { DramaticAlert } from '@/components/DramaticAlert';
import { RaceSummary } from '@/components/RaceSummary';
import { CSVFormatHelper } from '@/components/CSVFormatHelper';
import { Footer } from '@/components/Footer';
import { Documentation } from '@/components/Documentation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelemetryHealth } from '@/components/TelemetryHealth';
import { TelemetryProcessor } from '@/lib/telemetry';
import { PitStrategyCalculator } from '@/lib/pitStrategy';
import { generateSampleCOTAData, sampleDataInfo } from '@/lib/sampleData';
import type { RawTelemetryPoint, CleanedLap, TireDegradation, PitRecommendation, RaceStrategy } from '@/types/telemetry';
import type { TelemetryHealthReport } from '@/lib/dataQuality';
import { sdk } from "@farcaster/miniapp-sdk";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";

export default function RaceSenseDashboard(): React.JSX.Element {
    const isInFarcaster = useIsInFarcaster()
    const { addMiniApp } = useAddMiniApp();
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }

      }

    

      tryAddMiniApp()
    }, [addMiniApp])
    useQuickAuth(isInFarcaster)
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (document.readyState !== 'complete') {
            await new Promise<void>(resolve => {
              if (document.readyState === 'complete') {
                resolve()
              } else {
                window.addEventListener('load', () => resolve(), { once: true })
              }

            })
          }

    

          await sdk.actions.ready()
          console.log('Farcaster SDK initialized successfully - app fully loaded')
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error)
          
          setTimeout(async () => {
            try {
              await sdk.actions.ready()
              console.log('Farcaster SDK initialized on retry')
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError)
            }

          }, 1000)
        }

      }

    

      initializeFarcaster()
    }, [])
  const [rawData, setRawData] = useState<string | null>(null);
  const [raceStrategy, setRaceStrategy] = useState<RaceStrategy | null>(null);
  const [healthReport, setHealthReport] = useState<TelemetryHealthReport | null>(null);
  const [currentLap, setCurrentLap] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [totalLaps, setTotalLaps] = useState<number>(40);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [showDocs, setShowDocs] = useState<boolean>(false);

  // Process CSV data with flexible column mapping
  const processData = useCallback((csvData: string) => {
    try {
      const lines: string[] = csvData.trim().split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        console.error('CSV file is empty or has no data rows');
        return;
      }

      const headers: string[] = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Create flexible column mapping - supports various naming conventions
      const getColumnIndex = (possibleNames: string[]): number => {
        for (const name of possibleNames) {
          const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
          if (index !== -1) return index;
        }
        return -1;
      };

      const columnMap = {
        meta_time: getColumnIndex(['meta_time', 'metatime', 'timestamp', 'time']),
        ecu_time: getColumnIndex(['ecu_time', 'ecutime', 'ecu']),
        lap: getColumnIndex(['lap', 'lapnumber', 'lap_number']),
        car_number: getColumnIndex(['car_number', 'carnumber', 'car', 'number']),
        chassis_number: getColumnIndex(['chassis_number', 'chassisnumber', 'chassis']),
        speed: getColumnIndex(['speed', 'velocity']),
        gear: getColumnIndex(['gear']),
        nmot: getColumnIndex(['nmot', 'rpm', 'engine_rpm', 'enginerpm']),
        ath: getColumnIndex(['ath', 'throttle', 'throttle_position']),
        aps: getColumnIndex(['aps', 'throttle', 'accelerator']),
        pbrake_f: getColumnIndex(['pbrake_f', 'pbrakef', 'brake_front', 'brakefront']),
        pbrake_r: getColumnIndex(['pbrake_r', 'pbraker', 'brake_rear', 'brakerear']),
        accx_can: getColumnIndex(['accx_can', 'accx', 'accel_x', 'acceleration_x']),
        accy_can: getColumnIndex(['accy_can', 'accy', 'accel_y', 'acceleration_y']),
        steering_angle: getColumnIndex(['steering_angle', 'steeringangle', 'steering']),
        vbox_long_minutes: getColumnIndex(['vbox_long_minutes', 'longitude', 'long', 'lon']),
        vbox_lat_min: getColumnIndex(['vbox_lat_min', 'latitude', 'lat']),
        laptrigger_lapdist_dls: getColumnIndex(['laptrigger_lapdist_dls', 'lapdist', 'distance', 'lap_distance']),
      };

      // Helper to safely get value from row
      const getValue = (values: string[], key: keyof typeof columnMap): string => {
        const index = columnMap[key];
        return index !== -1 && index < values.length ? values[index] : '';
      };
      
      const rawPoints: RawTelemetryPoint[] = lines.slice(1).map((line: string, lineIndex: number) => {
        const values: string[] = line.split(',').map(v => v.trim());
        
        // Parse with fallbacks
        const point: RawTelemetryPoint = {
          meta_time: parseFloat(getValue(values, 'meta_time')) || parseFloat(getValue(values, 'ecu_time')) || lineIndex * 100,
          ecu_time: parseFloat(getValue(values, 'ecu_time')) || parseFloat(getValue(values, 'meta_time')) || lineIndex * 100,
          lap: parseInt(getValue(values, 'lap')) || 1,
          car_number: parseInt(getValue(values, 'car_number')) || 0,
          chassis_number: getValue(values, 'chassis_number') ? parseInt(getValue(values, 'chassis_number')) : undefined,
          speed: parseFloat(getValue(values, 'speed')) || 0,
          gear: parseInt(getValue(values, 'gear')) || 0,
          nmot: parseFloat(getValue(values, 'nmot')) || 0,
          ath: parseFloat(getValue(values, 'ath')) || 0,
          aps: parseFloat(getValue(values, 'aps')) || 0,
          pbrake_f: parseFloat(getValue(values, 'pbrake_f')) || 0,
          pbrake_r: parseFloat(getValue(values, 'pbrake_r')) || 0,
          accx_can: parseFloat(getValue(values, 'accx_can')) || 0,
          accy_can: parseFloat(getValue(values, 'accy_can')) || 0,
          steering_angle: parseFloat(getValue(values, 'steering_angle')) || 0,
          vbox_long_minutes: parseFloat(getValue(values, 'vbox_long_minutes')) || 0,
          vbox_lat_min: parseFloat(getValue(values, 'vbox_lat_min')) || 0,
          laptrigger_lapdist_dls: parseFloat(getValue(values, 'laptrigger_lapdist_dls')) || 0,
        };
        
        return point;
      }).filter(point => point.meta_time > 0 || point.ecu_time > 0); // Filter out completely invalid rows

      if (rawPoints.length === 0) {
        console.error('No valid data points found in CSV');
        return;
      }

      console.log(`✅ Loaded ${rawPoints.length} telemetry points from ${lines.length - 1} CSV rows`);

      // Process telemetry with health check
      const { laps: cleanedLaps, healthReport: health } = TelemetryProcessor.processWithHealthCheck(rawPoints);
      const tireDeg: TireDegradation[] = TelemetryProcessor.calculateTireDegradation(cleanedLaps);
      setHealthReport(health);
      
      // Calculate initial strategy
      const racingLaps: CleanedLap[] = cleanedLaps.filter((lap: CleanedLap) => 
        !lap.isPitLap && lap.lapTime > 0 && lap.lapTime < 200
      );
      
      const avgLapTime: number = racingLaps.length > 0
        ? racingLaps.reduce((sum: number, lap: CleanedLap) => sum + lap.lapTime, 0) / racingLaps.length
        : 0;
      
      const bestLapTime: number = racingLaps.length > 0
        ? Math.min(...racingLaps.map((lap: CleanedLap) => lap.lapTime))
        : 0;

      const maxLap: number = Math.max(...cleanedLaps.map((lap: CleanedLap) => lap.lapNumber));
      setTotalLaps(maxLap);

      setRaceStrategy({
        carNumber: rawPoints[0]?.car_number || 0,
        chassisNumber: rawPoints[0]?.chassis_number,
        currentLap: 1,
        totalLaps: maxLap,
        laps: cleanedLaps,
        tireDegradation: tireDeg,
        pitRecommendations: [],
        averageLapTime: avgLapTime,
        bestLapTime: bestLapTime,
      });

      setCurrentLap(1);
    } catch (error) {
      console.error('Error processing data:', error);
    }
  }, []);

  // Update strategy as race progresses
  useEffect(() => {
    if (!raceStrategy) return;

    const visibleLaps: CleanedLap[] = raceStrategy.laps.filter((lap: CleanedLap) => lap.lapNumber <= currentLap);
    const visibleTireDeg: TireDegradation[] = raceStrategy.tireDegradation.filter(
      (deg: TireDegradation) => deg.lapNumber <= currentLap
    );

    const recommendation: PitRecommendation = PitStrategyCalculator.calculatePitRecommendation(
      currentLap,
      visibleLaps,
      visibleTireDeg,
      totalLaps
    );

    // Show dramatic alert for high urgency
    if (recommendation.urgency === 'high') {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000); // Hide after 5 seconds
    }

    setRaceStrategy((prev: RaceStrategy | null) => 
      prev ? { ...prev, currentLap, pitRecommendations: [recommendation] } : null
    );
  }, [currentLap, raceStrategy?.laps, raceStrategy?.tireDegradation, totalLaps]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !raceStrategy) return;

    const interval = setInterval(() => {
      setCurrentLap((prev: number) => {
        if (prev >= totalLaps) {
          setIsPlaying(false);
          setShowSummary(true); // Show summary when race ends
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalLaps, raceStrategy]);

  const handleDataLoaded = useCallback((data: string) => {
    setRawData(data);
    processData(data);
  }, [processData]);

  const loadSampleData = useCallback(() => {
    const sampleData = generateSampleCOTAData();
    handleDataLoaded(sampleData);
  }, [handleDataLoaded]);

  const exportJSON = useCallback(() => {
    if (!raceStrategy) return;
    
    const report = {
      metadata: {
        carNumber: raceStrategy.carNumber,
        totalLaps: raceStrategy.totalLaps,
        exportDate: new Date().toISOString(),
      },
      performance: {
        bestLapTime: raceStrategy.bestLapTime,
        averageLapTime: raceStrategy.averageLapTime,
        totalRacingLaps: raceStrategy.laps.filter(l => !l.isPitLap).length,
      },
      tireDegradation: raceStrategy.tireDegradation,
      pitRecommendations: raceStrategy.pitRecommendations,
      laps: raceStrategy.laps.map(lap => ({
        lapNumber: lap.lapNumber,
        lapTime: lap.lapTime,
        avgSpeed: lap.avgSpeed,
        isPitLap: lap.isPitLap,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `racesense-strategy-car${raceStrategy.carNumber}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [raceStrategy]);

  const exportPDF = useCallback(() => {
    if (!raceStrategy) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🏁 RaceSense Strategy Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Circuit of the Americas', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Race Information', 20, yPos);
    yPos += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Car Number: ${raceStrategy.carNumber}`, 25, yPos);
    yPos += 6;
    pdf.text(`Total Laps: ${raceStrategy.totalLaps}`, 25, yPos);
    yPos += 6;
    pdf.text(`Export Date: ${new Date().toLocaleString()}`, 25, yPos);
    yPos += 12;

    // Performance Summary
    pdf.setFont('helvetica', 'bold');
    pdf.text('Performance Summary', 20, yPos);
    yPos += 7;

    const racingLaps = raceStrategy.laps.filter(l => !l.isPitLap && l.lapTime > 0);
    const bestLap = racingLaps.length > 0 ? racingLaps.reduce((best, lap) => 
      lap.lapTime < best.lapTime ? lap : best
    ) : null;

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Best Lap Time: ${raceStrategy.bestLapTime > 0 ? raceStrategy.bestLapTime.toFixed(3) + 's' : 'N/A'} (Lap ${bestLap?.lapNumber || '-'})`, 25, yPos);
    yPos += 6;
    pdf.text(`Average Lap Time: ${raceStrategy.averageLapTime > 0 ? raceStrategy.averageLapTime.toFixed(3) + 's' : 'N/A'}`, 25, yPos);
    yPos += 6;
    pdf.text(`Total Racing Laps: ${racingLaps.length}`, 25, yPos);
    yPos += 6;

    const totalDeg = raceStrategy.tireDegradation.length > 0 
      ? raceStrategy.tireDegradation[raceStrategy.tireDegradation.length - 1].degradation 
      : 0;
    pdf.text(`Total Tire Degradation: ${totalDeg.toFixed(3)}s`, 25, yPos);
    yPos += 12;

    // Strategic Insights
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strategic Insights', 20, yPos);
    yPos += 7;

    pdf.setFont('helvetica', 'normal');
    if (raceStrategy.pitRecommendations.length > 0) {
      const rec = raceStrategy.pitRecommendations[0];
      pdf.text(`Optimal Pit Window: Lap ${rec.recommendedPitLap}`, 25, yPos);
      yPos += 6;
      pdf.text(`Strategy: ${rec.strategy}`, 25, yPos);
      yPos += 6;
      pdf.text(`Urgency Level: ${rec.urgency.toUpperCase()}`, 25, yPos);
      yPos += 6;
      if (rec.timeSaving) {
        pdf.text(`Estimated Time Saving: ${rec.timeSaving.toFixed(2)}s`, 25, yPos);
        yPos += 6;
      }
    } else {
      pdf.text('No pit recommendations available', 25, yPos);
      yPos += 6;
    }

    yPos += 6;
    const consistency = racingLaps.length > 0 
      ? 1 - (Math.max(...racingLaps.map(l => l.lapTime)) - Math.min(...racingLaps.map(l => l.lapTime))) / raceStrategy.averageLapTime
      : 0;
    pdf.text(`Consistency Score: ${(consistency * 100).toFixed(1)}%`, 25, yPos);
    yPos += 12;

    // Lap Times Table
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('Lap-by-Lap Breakdown', 20, yPos);
    yPos += 7;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Lap', 25, yPos);
    pdf.text('Time (s)', 55, yPos);
    pdf.text('Speed (km/h)', 85, yPos);
    pdf.text('Type', 125, yPos);
    yPos += 5;

    pdf.setFont('helvetica', 'normal');
    raceStrategy.laps.slice(0, 35).forEach((lap) => {
      if (yPos > 280) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(lap.lapNumber.toString(), 25, yPos);
      pdf.text(lap.lapTime > 0 ? lap.lapTime.toFixed(2) : '-', 55, yPos);
      pdf.text(lap.avgSpeed > 0 ? lap.avgSpeed.toFixed(1) : '-', 85, yPos);
      pdf.text(lap.isPitLap ? 'PIT' : 'Racing', 125, yPos);
      yPos += 5;
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(
        'Generated by RaceSense • Hack the Track',
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    pdf.save(`racesense-report-car${raceStrategy.carNumber}-${Date.now()}.pdf`);
  }, [raceStrategy]);

  const exportPNG = useCallback(async () => {
    const summaryElement = document.getElementById('race-summary-card');
    if (!summaryElement || !raceStrategy) return;

    try {
      const canvas = await html2canvas(summaryElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `racesense-summary-car${raceStrategy.carNumber}-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  }, [raceStrategy]);

  const togglePlayback = useCallback(() => {
    setIsPlaying((prev: boolean) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentLap(1);
    setIsPlaying(false);
  }, []);

  const handleSkipForward = useCallback(() => {
    setCurrentLap((prev: number) => Math.min(prev + 5, totalLaps));
  }, [totalLaps]);

  const handleBackToHome = useCallback(() => {
    setRawData(null);
    setRaceStrategy(null);
    setHealthReport(null);
    setCurrentLap(1);
    setIsPlaying(false);
    setShowAlert(false);
    setShowSummary(false);
    setActiveTab('analytics');
  }, []);

  if (!raceStrategy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-6">
        {/* Checkered flag pattern overlay */}
        <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: `repeating-conic-gradient(#ffffff 0% 25%, transparent 0% 50%)`,
          backgroundSize: '40px 40px',
        }} />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="text-center space-y-6 py-12">
            {/* Toyota GR Branding */}
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-[#EB0A1E] to-red-700 rounded-full mb-4">
              <span className="text-white font-black text-xs tracking-widest">TOYOTA GAZOO RACING</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white">
              <span className="bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">
                RACESENSE
              </span>
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-[#EB0A1E] to-transparent" />
            
            <p className="text-2xl font-bold text-red-500 tracking-wide">
              COTA REAL-TIME STRATEGY ENGINE
            </p>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              AI-POWERED RACE ANALYTICS • CLEANS NOISY TELEMETRY • RECONSTRUCTS LAPS<br/>
              DELIVERS PIT, PACE, AND TIRE STRATEGY LIKE A PRO RACE ENGINEER
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={loadSampleData} 
              size="lg" 
              className="gap-2 bg-[#EB0A1E] hover:bg-red-700 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-red-500/50 border-2 border-red-600"
            >
              <Sparkles className="h-6 w-6" />
              🏁 LOAD SAMPLE RACE DATA
            </Button>
            <div className="text-sm text-zinc-400 font-mono">
              {sampleDataInfo.description} • <span className="text-[#EB0A1E] font-bold">{sampleDataInfo.laps} LAPS</span> • CAR #{sampleDataInfo.carNumber} • CHASSIS #{sampleDataInfo.chassisNumber}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-4 py-1 text-zinc-500 font-bold tracking-widest">OR UPLOAD YOUR OWN CSV</span>
            </div>
          </div>

          <FileUploader onDataLoaded={handleDataLoaded} />
          
          <CSVFormatHelper />

          {/* Documentation Section */}
          <div className="mt-8">
            <Button 
              onClick={() => setShowDocs(!showDocs)}
              variant="outline"
              className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-bold"
            >
              {showDocs ? '📚 Hide Documentation' : '📚 View Documentation'}
            </Button>
            {showDocs && (
              <div className="mt-4">
                <Documentation />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const visibleLaps: CleanedLap[] = raceStrategy.laps.filter((lap: CleanedLap) => lap.lapNumber <= currentLap);
  const visibleTireDeg: TireDegradation[] = raceStrategy.tireDegradation.filter(
    (deg: TireDegradation) => deg.lapNumber <= currentLap
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-4 md:p-6">
      {/* Racing stripes background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 100px, #EB0A1E 100px, #EB0A1E 105px)`,
      }} />
      {/* Dramatic Alert Overlay */}
      {raceStrategy?.pitRecommendations[0] && (
        <DramaticAlert
          show={showAlert}
          urgency={raceStrategy.pitRecommendations[0].urgency}
          message={`🏁 PIT STOP RECOMMENDED!`}
          details={`Lap ${raceStrategy.pitRecommendations[0].recommendedPitLap} • Tire degradation: ${(raceStrategy.pitRecommendations[0].timeSaving || 0).toFixed(1)}s`}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 bg-[#EB0A1E] rounded text-white font-black text-xs tracking-widest">
                TOYOTA GR
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
                RACESENSE
              </h1>
            </div>
            <p className="text-zinc-400 font-mono text-sm">
              🏁 CIRCUIT OF THE AMERICAS • <span className="text-[#EB0A1E] font-bold">CAR #{raceStrategy.carNumber}</span>
              {raceStrategy.chassisNumber && <span className="text-zinc-500"> • CHASSIS #{raceStrategy.chassisNumber}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleBackToHome} variant="outline" size="sm" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Home className="h-4 w-4" />
              BACK
            </Button>
            <Badge variant="outline" className="text-lg px-4 py-2 bg-black border-[#EB0A1E] text-white font-mono font-bold">
              LAP {currentLap} / {totalLaps}
            </Badge>
            {raceStrategy.pitRecommendations[0] && (
              <Badge 
                className={`font-black tracking-wider ${raceStrategy.pitRecommendations[0].urgency === 'high' ? 'bg-[#EB0A1E] text-white animate-pulse' : 'bg-yellow-600 text-black'}`}
              >
                {raceStrategy.pitRecommendations[0].urgency.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        {/* Playback Controls */}
        <Card className="bg-black/70 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-black tracking-wide">⏱️ RACE REPLAY CONTROLS</CardTitle>
            <CardDescription className="text-zinc-400">
              SIMULATE REAL-TIME RACE PROGRESSION AND STRATEGY DECISIONS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={handleReset} variant="outline" size="icon" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button onClick={togglePlayback} size="icon" className="bg-[#EB0A1E] hover:bg-red-700 text-white">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSkipForward} variant="outline" size="icon" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <SkipForward className="h-4 w-4" />
              </Button>
              <div className="flex-1 px-4">
                <Slider
                  value={[currentLap]}
                  min={1}
                  max={totalLaps}
                  step={1}
                  onValueChange={(value: number[]) => setCurrentLap(value[0])}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 font-bold">SPEED:</span>
                <Button
                  variant={playbackSpeed === 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlaybackSpeed(1)}
                  className={playbackSpeed === 1 ? 'bg-[#EB0A1E] hover:bg-red-700' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'}
                >
                  1X
                </Button>
                <Button
                  variant={playbackSpeed === 2 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlaybackSpeed(2)}
                  className={playbackSpeed === 2 ? 'bg-[#EB0A1E] hover:bg-red-700' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'}
                >
                  2X
                </Button>
                <Button
                  variant={playbackSpeed === 5 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlaybackSpeed(5)}
                  className={playbackSpeed === 5 ? 'bg-[#EB0A1E] hover:bg-red-700' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'}
                >
                  5X
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-zinc-900 to-black border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 font-bold text-xs tracking-wider">CURRENT LAP TIME</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-white font-mono">
                {visibleLaps.length > 0 
                  ? `${visibleLaps[visibleLaps.length - 1].lapTime.toFixed(2)}s`
                  : '-'
                }
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-950 to-black border-green-900">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-500 font-bold text-xs tracking-wider">⚡ BEST LAP</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-green-400 font-mono">
                {raceStrategy.bestLapTime > 0 
                  ? `${raceStrategy.bestLapTime.toFixed(2)}s`
                  : '-'
                }
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-zinc-900 to-black border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 font-bold text-xs tracking-wider">AVERAGE PACE</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-white font-mono">
                {raceStrategy.averageLapTime > 0 
                  ? `${raceStrategy.averageLapTime.toFixed(2)}s`
                  : '-'
                }
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-950 to-black border-red-900">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#EB0A1E] font-bold text-xs tracking-wider">🛞 TIRE AGE</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-red-400 font-mono">
                {currentLap} <span className="text-sm text-zinc-500">LAPS</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800">
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-[#EB0A1E] data-[state=active]:text-white font-bold"
            >
              📊 RACE ANALYTICS
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="data-[state=active]:bg-[#EB0A1E] data-[state=active]:text-white font-bold"
            >
              🧹 TELEMETRY HEALTH
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            {/* Pit Strategy */}
            <PitStrategyPanel recommendation={raceStrategy.pitRecommendations[0] || null} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LapTimeChart laps={visibleLaps} currentLap={currentLap} />
              <TireDegradationChart tireDegradation={visibleTireDeg} currentLap={currentLap} />
            </div>

            {/* Week 2 Features: Delta Time & What-If */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeltaTimeChart 
                laps={visibleLaps} 
                currentLap={currentLap}
                bestLapTime={raceStrategy.bestLapTime}
                averageLapTime={raceStrategy.averageLapTime}
              />
              <WhatIfScenario
                currentLap={currentLap}
                totalLaps={totalLaps}
                laps={visibleLaps}
                tireDegradation={visibleTireDeg}
              />
            </div>

            {/* Race Summary - Shows when race ends or can be toggled */}
            {(showSummary || currentLap >= totalLaps) && (
              <RaceSummary
                laps={raceStrategy.laps}
                tireDegradation={raceStrategy.tireDegradation}
                pitRecommendations={raceStrategy.pitRecommendations}
                totalLaps={totalLaps}
                carNumber={raceStrategy.carNumber}
                onExportJSON={exportJSON}
                onExportPDF={exportPDF}
                onExportPNG={exportPNG}
              />
            )}

            {/* Show summary button if race is ongoing */}
            {!showSummary && currentLap < totalLaps && currentLap > 10 && (
              <div className="flex justify-center">
                <Button onClick={() => setShowSummary(!showSummary)} variant="outline">
                  {showSummary ? 'Hide' : 'Preview'} Race Summary
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            {healthReport ? (
              <TelemetryHealth healthReport={healthReport} />
            ) : (
              <Card className="bg-black/70 border-zinc-800">
                <CardContent className="py-12 text-center text-zinc-500">
                  No health data available. Load telemetry data first.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Documentation Access */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setShowDocs(!showDocs)}
            variant="outline"
            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-bold"
          >
            📚 {showDocs ? 'Hide' : 'View'} Documentation
          </Button>
        </div>

        {showDocs && <Documentation />}

        {/* Footer */}
        <Card className="bg-black/70 border-zinc-800 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Footer />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
