# Telemetry Data Specification

## Overview

RaceSense expects telemetry data in CSV format with 18 mandatory parameters. This specification aligns with Toyota GR Cup Series telemetry standards for Circuit of the Americas.

---

## CSV Format

### Header Row (Required)

```
meta_time,ecu_time,lap,car_number,chassis_number,Speed,Gear,nmot,ath,aps,pbrake_f,pbrake_r,accx_can,accy_can,Steering_Angle,VBOX_Long_Minutes,VBOX_Lat_Min,Laptrigger_lapdist_dls
```

**Important**: 
- Header row must match exactly (case-sensitive)
- All 18 columns required in this order
- No additional columns allowed

---

## Parameter Definitions

### 1. Timing Parameters

#### `meta_time`
- **Description**: Logger timestamp (ground truth)
- **Format**: ISO 8601 string (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Example**: `2024-03-15T14:23:45.123Z`
- **Usage**: Primary time reference for correction
- **Required**: ✅ Yes

#### `ecu_time`
- **Description**: ECU timestamp (may drift)
- **Format**: ISO 8601 string or Unix timestamp
- **Example**: `2024-03-15T14:23:45.120Z`
- **Usage**: Secondary time reference, subject to drift correction
- **Required**: ✅ Yes

---

### 2. Session Parameters

#### `lap`
- **Description**: Lap number
- **Type**: Integer
- **Range**: 1-999
- **Special Values**: 
  - `0` = Out lap / formation lap
  - `32768` = **Corrupt value** (requires reconstruction)
- **Usage**: Lap segmentation, may be corrected by reconstruction algorithm
- **Required**: ✅ Yes

#### `car_number`
- **Description**: Race number displayed on car
- **Type**: Integer
- **Range**: 0-999
- **Special Values**:
  - `0` or `000` = Missing/unassigned
- **Usage**: Display purposes, NOT reliable for vehicle identification
- **Required**: ✅ Yes
- **Note**: Can change between sessions

#### `chassis_number`
- **Description**: Unique vehicle identifier
- **Type**: String
- **Format**: Alphanumeric (e.g., `GR24-001`, `CH12345`)
- **Usage**: **Primary key** for vehicle tracking
- **Required**: ✅ Yes
- **Note**: Never changes, always unique

---

### 3. Speed & Drivetrain

#### `Speed`
- **Description**: Vehicle speed
- **Type**: Float
- **Unit**: km/h
- **Range**: 0-400
- **Precision**: 0.1 km/h
- **Example**: `185.3`
- **Required**: ✅ Yes

#### `Gear`
- **Description**: Current gear selection
- **Type**: Integer
- **Range**: 0-6
- **Values**:
  - `0` = Neutral
  - `1-6` = Forward gears
  - `-1` = Reverse (rare)
- **Required**: ✅ Yes

#### `nmot`
- **Description**: Engine RPM
- **Type**: Integer
- **Unit**: RPM
- **Range**: 0-10000
- **Example**: `7500`
- **Required**: ✅ Yes

---

### 4. Pedal Inputs

#### `ath`
- **Description**: Throttle position
- **Type**: Float
- **Unit**: Percentage (%)
- **Range**: 0-100
- **Precision**: 0.1%
- **Example**: `85.5`
- **Required**: ✅ Yes

#### `aps`
- **Description**: Accelerator pedal sensor
- **Type**: Float
- **Unit**: Percentage (%)
- **Range**: 0-100
- **Precision**: 0.1%
- **Example**: `82.3`
- **Note**: May differ slightly from `ath` due to sensor position
- **Required**: ✅ Yes

---

### 5. Braking System

#### `pbrake_f`
- **Description**: Front brake pressure
- **Type**: Float
- **Unit**: bar
- **Range**: 0-200
- **Precision**: 0.1 bar
- **Example**: `45.8`
- **Required**: ✅ Yes

#### `pbrake_r`
- **Description**: Rear brake pressure
- **Type**: Float
- **Unit**: bar
- **Range**: 0-200
- **Precision**: 0.1 bar
- **Example**: `38.2`
- **Note**: Typically lower than front due to brake bias
- **Required**: ✅ Yes

---

### 6. G-Forces

#### `accx_can`
- **Description**: Lateral acceleration (side-to-side)
- **Type**: Float
- **Unit**: g (gravitational force)
- **Range**: -3.0 to +3.0
- **Precision**: 0.01g
- **Example**: `1.25` (right turn), `-1.18` (left turn)
- **Convention**: Positive = right, Negative = left
- **Required**: ✅ Yes

#### `accy_can`
- **Description**: Longitudinal acceleration (fore-aft)
- **Type**: Float
- **Unit**: g (gravitational force)
- **Range**: -3.0 to +3.0
- **Precision**: 0.01g
- **Example**: `0.95` (acceleration), `-1.5` (braking)
- **Convention**: Positive = acceleration, Negative = braking
- **Required**: ✅ Yes

---

### 7. Steering

#### `Steering_Angle`
- **Description**: Steering wheel angle
- **Type**: Float
- **Unit**: degrees
- **Range**: -900 to +900 (2.5 turns lock-to-lock)
- **Precision**: 0.1°
- **Example**: `45.5` (right), `-38.2` (left)
- **Convention**: Positive = right, Negative = left
- **Required**: ✅ Yes

---

### 8. GPS Position

#### `VBOX_Long_Minutes`
- **Description**: GPS longitude
- **Type**: Float
- **Unit**: Decimal degrees
- **Format**: Minutes component (e.g., `97.641234`)
- **Range**: -180 to +180
- **Precision**: 6 decimal places
- **Example**: `97.641234` (COTA longitude ~97.64°W)
- **Required**: ✅ Yes

#### `VBOX_Lat_Min`
- **Description**: GPS latitude
- **Type**: Float
- **Unit**: Decimal degrees
- **Format**: Minutes component (e.g., `30.132456`)
- **Range**: -90 to +90
- **Precision**: 6 decimal places
- **Example**: `30.132456` (COTA latitude ~30.13°N)
- **Required**: ✅ Yes

---

### 9. Distance

#### `Laptrigger_lapdist_dls`
- **Description**: Distance along lap
- **Type**: Float
- **Unit**: meters
- **Range**: 0-5513 (COTA lap length)
- **Precision**: 0.1m
- **Example**: `2834.5`
- **Usage**: Used for lap reconstruction and sector timing
- **Required**: ✅ Yes

---

## Data Quality Issues & Solutions

### Issue 1: ECU Time Drift

**Problem**: `ecu_time` may be inaccurate due to ECU clock drift

**Detection**: Compare `ecu_time` vs `meta_time`

**Solution**: RaceSense automatically corrects using `meta_time` as ground truth

**Algorithm**: Rolling window offset correction (5-second window)

---

### Issue 2: Corrupt Lap Numbers

**Problem**: Lap numbers occasionally show `32768` (2^15 overflow)

**Detection**: Lap number >999 or sudden jumps

**Solution**: RaceSense reconstructs laps using:
1. Time-based segmentation
2. GPS start/finish line detection
3. Distance-based lap boundaries

**Output**: Corrected lap numbers with confidence scores

---

### Issue 3: Missing Car Numbers

**Problem**: Car number may be `0` or inconsistent across sessions

**Detection**: Car number = 0 or changes for same chassis

**Solution**: RaceSense uses `chassis_number` as primary key

**Mapping**: Builds chassis ↔ car number mapping table

---

## Sample Data Row

```csv
2024-03-15T14:23:45.123Z,2024-03-15T14:23:45.120Z,5,42,GR24-042,185.3,4,7500,85.5,82.3,45.8,38.2,1.25,0.95,45.5,97.641234,30.132456,2834.5
```

---

## Validation Rules

RaceSense validates every row against these rules:

| Parameter | Validation |
|-----------|-----------|
| `meta_time` | Valid ISO 8601 timestamp |
| `ecu_time` | Valid timestamp format |
| `lap` | Integer, 0-999 (or 32768 = flagged) |
| `car_number` | Integer, 0-999 |
| `chassis_number` | Non-empty string |
| `Speed` | Float, 0-400 km/h |
| `Gear` | Integer, -1 to 6 |
| `nmot` | Integer, 0-10000 RPM |
| `ath` | Float, 0-100% |
| `aps` | Float, 0-100% |
| `pbrake_f` | Float, 0-200 bar |
| `pbrake_r` | Float, 0-200 bar |
| `accx_can` | Float, -3.0 to +3.0 g |
| `accy_can` | Float, -3.0 to +3.0 g |
| `Steering_Angle` | Float, -900 to +900° |
| `VBOX_Long_Minutes` | Float, valid longitude |
| `VBOX_Lat_Min` | Float, valid latitude |
| `Laptrigger_lapdist_dls` | Float, 0-5513m |

**Invalid rows are logged but do not stop processing.**

---

## Export Formats

### JSON Export Structure

```json
{
  "session": {
    "date": "2024-03-15",
    "track": "Circuit of the Americas",
    "totalLaps": 20,
    "vehicles": ["GR24-042", "GR24-018"]
  },
  "telemetry": [
    {
      "meta_time": "2024-03-15T14:23:45.123Z",
      "Speed": 185.3,
      // ... all 18 parameters
    }
  ],
  "dataQuality": {
    "timestampDrift": 0.5,
    "lapsReconstructed": 2,
    "vehicleChanges": []
  },
  "statistics": {
    "fastestLap": "1:45.234",
    "averageLap": "1:47.891",
    // ... lap statistics
  }
}
```

---

## Integration Notes

### Sampling Rate
- **Expected**: 10 Hz (10 samples/second)
- **Minimum**: 5 Hz
- **Maximum**: 100 Hz

### File Size
- **Typical**: 5-20 MB per session
- **Maximum supported**: 100 MB

### Track-Specific Values

**Circuit of the Americas (COTA)**:
- Lap length: 5,513 meters
- GPS center: ~30.13°N, 97.64°W
- Typical lap time: 1:45 - 1:50 (GR Cup)
- Sectors: 3 (Start → T1, T1 → T12, T12 → Finish)

---

## Troubleshooting

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required column: Speed" | Header mismatch | Ensure exact header format |
| "Invalid Speed value: -10" | Out of range | Check sensor calibration |
| "Lap 32768 detected" | ECU overflow | Automatic reconstruction applied |
| "Car number 0 for chassis GR24-042" | Missing race number | Chassis used for tracking |

---

## References

- **Toyota GR Cup Technical Regulations**: [Link to regulations]
- **COTA Track Map**: https://circuitoftheamericas.com/track
- **Telemetry Systems**: VBOX Sport, AIM MXS, Motec C125

---

**Last Updated**: January 2025  
**Version**: 1.0.0
