# Technical Documentation

## Architecture Overview

RaceSense is built as a Next.js 14 application using the App Router pattern, with a focus on real-time data processing and professional-grade analytics.

---

## Core Components

### 1. Data Processing Pipeline

#### Telemetry Processor (`src/lib/telemetry.ts`)

**Purpose**: Central telemetry processing engine

**Key Functions**:
- `processTelemetryData(csvContent: string)` - Main processing pipeline
- `validateTelemetryRow(row)` - Row-level validation
- `calculateLapStatistics(data)` - Aggregate lap metrics
- `generateExportData(data, format)` - Multi-format export

**Processing Steps**:
1. CSV parsing with header validation
2. Row-by-row type conversion and validation
3. Data quality pass (via `dataQuality.ts`)
4. Lap segmentation and aggregation
5. Statistical analysis (mean, median, std dev)

**Validation Rules**:
- All 18 parameters must be present
- Speed: 0-400 km/h
- Gear: 0-6
- RPM: 0-10000
- Throttle/Brake: 0-100%
- GPS coordinates: Valid lat/long ranges

---

#### Data Quality Engine (`src/lib/dataQuality.ts`)

**Purpose**: Professional-grade data cleaning and correction

##### A. Timestamp Correction Engine

**Problem**: ECU timestamps (`ecu_time`) can drift due to clock inaccuracies

**Solution**: 
- Use `meta_time` (logger timestamp) as ground truth
- Calculate offset between meta_time and ecu_time
- Apply rolling window correction (5-second window)
- Detect and flag drift >100ms

**Algorithm**:
```typescript
function correctTimestamps(data: TelemetryPoint[]): TimestampCorrection {
  const offsets = data.map(p => 
    new Date(p.meta_time).getTime() - new Date(p.ecu_time).getTime()
  );
  
  const corrected = data.map((point, i) => {
    const window = offsets.slice(Math.max(0, i-25), i+25); // 5s @ 10Hz
    const avgOffset = window.reduce((a,b) => a+b) / window.length;
    return {
      ...point,
      correctedTime: new Date(new Date(point.ecu_time).getTime() + avgOffset)
    };
  });
  
  return { corrected, driftPercent, anomalyCount };
}
```

**Output**:
- Corrected timestamps
- Drift percentage
- Anomaly count (>100ms deviations)

---

##### B. Lap Reconstruction Algorithm

**Problem**: Lap numbers can be corrupt (e.g., 32768 = 2^15 overflow)

**Solution**: Hybrid reconstruction using:
1. **Time-based detection** - Identify lap boundaries via timing patterns
2. **GPS-based detection** - Start/finish line crossings (if GPS available)
3. **Fallback** - Use original lap numbers if valid

**Algorithm**:
```typescript
function reconstructLaps(data: TelemetryPoint[]): LapReconstruction {
  const sorted = data.sort((a,b) => 
    new Date(a.meta_time).getTime() - new Date(b.meta_time).getTime()
  );
  
  let currentLap = 1;
  const reconstructed = [];
  
  for (let i = 1; i < sorted.length; i++) {
    const timeDelta = getTimeDelta(sorted[i], sorted[i-1]);
    const isStartFinish = detectStartFinish(sorted[i], sorted[i-1]); // GPS check
    
    if (timeDelta > LAP_TIME_THRESHOLD || isStartFinish) {
      currentLap++;
    }
    
    reconstructed.push({ ...sorted[i], reconstructedLap: currentLap });
  }
  
  return { reconstructed, anomaliesFixed, confidence };
}
```

**Detection Heuristics**:
- Time gap >120s = new lap
- GPS crossing start/finish line
- Speed drop + position reset

**Output**:
- Reconstructed lap numbers
- Anomalies fixed count
- Confidence score per lap

---

##### C. Vehicle ID System

**Problem**: Car numbers can be 000, change between sessions, or be missing

**Solution**: Chassis-based identification
- **Primary key**: `chassis_number` (always unique)
- **Secondary**: `car_number` (optional, can change)
- Build mapping table showing chassis ↔ car number history

**Algorithm**:
```typescript
function identifyVehicles(data: TelemetryPoint[]): VehicleReport {
  const mapping: Map<string, Set<string>> = new Map();
  
  data.forEach(point => {
    if (!mapping.has(point.chassis_number)) {
      mapping.set(point.chassis_number, new Set());
    }
    mapping.get(point.chassis_number)!.add(point.car_number.toString());
  });
  
  const changes = Array.from(mapping.entries())
    .filter(([chassis, numbers]) => numbers.size > 1)
    .map(([chassis, numbers]) => ({
      chassis,
      carNumbers: Array.from(numbers),
      changeDetected: true
    }));
  
  return { vehicles: Array.from(mapping.keys()), changes };
}
```

**Output**:
- List of unique chassis
- Car number mapping per chassis
- Change alerts when car numbers differ

---

### 2. Strategy Engine (`src/lib/pitStrategy.ts`)

**Purpose**: Multi-scenario pit strategy optimization

**Input Parameters**:
- Current lap
- Total race laps
- Tire compounds used
- Lap time data
- Fuel consumption rate
- Pit stop time

**Algorithm**:
```typescript
function calculatePitStrategies(data): PitStrategy[] {
  const strategies = [];
  
  // Generate scenarios: 0-3 stops
  for (let stops = 0; stops <= 3; stops++) {
    const windows = generatePitWindows(stops, totalLaps);
    
    windows.forEach(window => {
      const strategy = {
        stops,
        windows: window,
        totalTime: calculateTotalTime(window, data),
        tireLife: calculateTireLife(window, data),
        fuelStrategy: calculateFuel(window, data),
        riskLevel: assessRisk(window, data)
      };
      
      strategies.push(strategy);
    });
  }
  
  return strategies.sort((a,b) => a.totalTime - b.totalTime);
}
```

**Calculations**:
- **Total race time** = (lap time × laps) + (pit stops × pit time) + (tire degradation penalty)
- **Tire life** = track_severity × stint_length × compound_factor
- **Risk assessment** = based on weather, traffic, safety car probability

**Output**: Ranked list of strategies with:
- Optimal pit windows
- Expected total time
- Tire life remaining
- Risk level (Low/Medium/High)

---

### 3. Frontend Architecture

#### Component Hierarchy

```
page.tsx (Main container)
├── FileUploader.tsx (CSV handling)
├── Documentation.tsx (Expandable docs)
├── [Dashboard Mode]
│   ├── Tabs (Analytics | Telemetry Health)
│   ├── [Analytics Tab]
│   │   ├── DramaticAlert.tsx (Pit window alerts)
│   │   ├── PitStrategyPanel.tsx (Strategy table)
│   │   ├── LapTimeChart.tsx (Recharts line chart)
│   │   ├── TireDegradationChart.tsx (Multi-line chart)
│   │   ├── DeltaTimeChart.tsx (Comparison chart)
│   │   ├── WhatIfScenario.tsx (Scenario simulator)
│   │   └── RaceSummary.tsx (Statistics panel)
│   └── [Telemetry Health Tab]
│       └── TelemetryHealth.tsx (Data quality dashboard)
└── Footer.tsx (Credits)
```

#### State Management

**No Redux/Zustand** - Uses React built-in hooks:
- `useState` for local component state
- `useMemo` for expensive calculations (strategy engine)
- `useCallback` for event handlers

**Key State**:
```typescript
const [csvData, setCsvData] = useState<string>('');
const [processedData, setProcessedData] = useState<ProcessedTelemetry | null>(null);
const [selectedCompound, setSelectedCompound] = useState<'soft' | 'medium' | 'hard'>('medium');
const [activeTab, setActiveTab] = useState<'analytics' | 'health'>('analytics');
```

---

### 4. Export System

#### PDF Export (`jsPDF`)
- Captures strategy panel + charts
- A4 landscape format
- 300 DPI quality
- Includes Toyota branding

#### PNG Export (`html2canvas`)
- High-resolution chart capture
- Transparent background option
- Individual chart download

#### JSON Export
- Raw telemetry data
- Processed statistics
- Strategy calculations
- Metadata (session info, corrections applied)

---

## Data Flow

```
CSV Upload
    ↓
Parse & Validate (telemetry.ts)
    ↓
Data Quality Pass (dataQuality.ts)
    ├── Timestamp Correction
    ├── Lap Reconstruction
    └── Vehicle ID Mapping
    ↓
Lap Segmentation & Aggregation
    ↓
Strategy Calculation (pitStrategy.ts)
    ↓
React State Update
    ↓
Component Re-render
    ├── Charts (Recharts)
    ├── Alerts (Dramatic notifications)
    └── Summaries (Statistics panels)
```

---

## Performance Optimizations

1. **Memoization**: Strategy calculations cached with `useMemo`
2. **Lazy Loading**: Charts render only when visible
3. **Virtualization**: Large datasets use windowed rendering (if >10k points)
4. **Debouncing**: What-if scenario inputs debounced (300ms)

---

## Type Safety

**Strict TypeScript Mode**:
- No implicit `any`
- All parameters typed
- Interface-first design

**Key Types** (`src/types/telemetry.ts`):
```typescript
interface TelemetryPoint {
  meta_time: string;
  ecu_time: string;
  lap: number;
  car_number: number;
  chassis_number: string;
  Speed: number;
  Gear: number;
  nmot: number;
  ath: number;
  aps: number;
  pbrake_f: number;
  pbrake_r: number;
  accx_can: number;
  accy_can: number;
  Steering_Angle: number;
  VBOX_Long_Minutes: number;
  VBOX_Lat_Min: number;
  Laptrigger_lapdist_dls: number;
}

interface ProcessedTelemetry {
  raw: TelemetryPoint[];
  laps: LapData[];
  statistics: SessionStatistics;
  dataQuality: DataQualityReport;
}
```

---

## Testing Strategy

**Manual Testing Focus**:
- CSV upload with valid/invalid data
- Sample data functionality
- Export in all formats
- What-if scenario edge cases
- Data quality corrections

**Validation**:
- All 18 parameters required
- Numeric ranges enforced
- Timestamp formats validated
- GPS coordinates checked

---

## Deployment

**Platform**: Vercel (Recommended)

**Build Command**: `next build`

**Output**: Static + Server Components (App Router)

**Environment**: Node.js 18+ runtime

**No External APIs**: Fully self-contained application

---

## Future Enhancements

- WebSocket support for live telemetry streaming
- Machine learning tire degradation models
- Weather API integration
- Multi-session comparison
- Driver performance profiles
- Predictive lap times using ML

---

**Last Updated**: Nov 2025  
**Version**: 1.0.0
