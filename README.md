# RaceSense: COTA Real-Time Strategy Engine

**AI-Powered Racing Analytics for Circuit of the Americas**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🏁 Overview

**RaceSense** is a professional-grade real-time racing analytics tool designed for the **Toyota GR Cup Series** at Circuit of the Americas (COTA). Built for the **Hack the Track 2025** competition, it provides race engineers with AI-powered strategic insights during live racing sessions.

### 🎯 Competition Category
**Real-Time Analytics** - Delivering actionable insights that influence race-day decisions.

---

## ✨ Key Features

### 📊 Core Analytics
- **Real-Time Telemetry Processing** - Handles all 18 official telemetry parameters
- **Multi-Scenario Pit Strategy** - Analyzes 8+ pit window combinations
- **Tire Degradation Modeling** - Predictive wear analysis with compound tracking
- **Delta Time Analysis** - Sector-by-sector performance comparison
- **What-If Scenario Simulator** - Test alternative strategies in real-time

### 🔧 Data Quality Engineering
- **Timestamp Correction Engine** - Fixes ECU clock drift using meta_time as ground truth
- **Lap Reconstruction Algorithm** - Repairs corrupt lap numbers (e.g., 32768 overflow)
- **Vehicle ID System** - Chassis-based identification with car number mapping
- **Telemetry Health Dashboard** - Comprehensive data quality metrics

### 📈 Visualization
- **Interactive Charts** - Lap times, tire wear, and delta time analysis
- **Live Strategy Alerts** - Dramatic pit window notifications
- **Race Summary Panel** - Complete session analysis with statistics

### 💾 Export & Integration
- **JSON Export** - Raw data with full telemetry preservation
- **PDF Reports** - Professional strategy summaries
- **PNG Graphics** - High-quality chart exports

---

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Export**: jsPDF, html2canvas

### Core Modules
- `telemetry.ts` - Telemetry processing and validation
- `dataQuality.ts` - Timestamp correction, lap reconstruction, vehicle ID
- `pitStrategy.ts` - Multi-scenario pit strategy calculations
- `sampleData.ts` - COTA-specific sample data

---

## 📋 Telemetry Specifications

**18 Official Parameters:**

| Parameter | Description | Unit |
|-----------|-------------|------|
| meta_time | Logger timestamp (ground truth) | ISO 8601 |
| ecu_time | ECU timestamp | ISO 8601 |
| lap | Lap number | Integer |
| car_number | Race number | Integer |
| chassis_number | Unique vehicle ID | String |
| Speed | Vehicle speed | km/h |
| Gear | Current gear | 1-6 |
| nmot | Engine RPM | RPM |
| ath | Throttle position | % |
| aps | Accelerator pedal | % |
| pbrake_f | Front brake pressure | bar |
| pbrake_r | Rear brake pressure | bar |
| accx_can | Lateral acceleration | g |
| accy_can | Longitudinal acceleration | g |
| Steering_Angle | Steering input | degrees |
| VBOX_Long_Minutes | GPS longitude | decimal |
| VBOX_Lat_Min | GPS latitude | decimal |
| Laptrigger_lapdist_dls | Lap distance | meters |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/mrbrightsides/racesense-cota.git
cd racesense-cota

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000`

### CSV Data Format

Upload telemetry CSV with this exact header row:

```
meta_time,ecu_time,lap,car_number,chassis_number,Speed,Gear,nmot,ath,aps,pbrake_f,pbrake_r,accx_can,accy_can,Steering_Angle,VBOX_Long_Minutes,VBOX_Lat_Min,Laptrigger_lapdist_dls
```

Sample data is included - click "Load Sample Data" to explore without CSV upload.

---

## 📖 Documentation

- [TECHNICAL.md](TECHNICAL.md) - Detailed technical implementation
- [DATA_SPECIFICATION.md](DATA_SPECIFICATION.md) - Complete telemetry specifications
- [SETUP.md](SETUP.md) - Deployment and configuration guide

---

## 🎨 UI/UX Highlights

- **Toyota Racing Theme** - Professional dark UI inspired by Toyota GR racing
- **Responsive Design** - Optimized for pit lane tablets and desktop monitors
- **Real-Time Updates** - Live recalculation as data streams in
- **Export Ready** - One-click PDF/PNG generation for team briefings

---

## 🏆 Competition Alignment

### Real-Time Analytics Brief
✅ **Actionable Insights** - Pit strategy recommendations influence race decisions  
✅ **Live Processing** - Real-time telemetry analysis during sessions  
✅ **Data Quality** - Professional-grade error correction and validation  
✅ **Visual Communication** - Clear charts for quick decision-making  

### Innovation Points
- **Hybrid lap reconstruction** using time + GPS data
- **Meta_time-based timestamp correction** for ECU clock drift
- **Chassis-based vehicle tracking** for session continuity
- **Multi-scenario pit strategy** with what-if analysis

---

## 📦 Deployment

### Vercel (Recommended)

```bash
# Connect to Vercel
vercel

# Deploy to production
vercel --prod
```

### Environment Variables
No external API keys required - runs standalone.

---

## 👨‍💻 Author

**Built by**: [mrbrightsides](https://github.com/mrbrightsides)  
**Website**: [elpeef.com](https://elpeef.com)  
**Competition**: Hack the Track 2025

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Toyota GR Cup Series for telemetry specifications
- Circuit of the Americas for track data
- Hack the Track organizers for the competition

---

**Ready to revolutionize race strategy at COTA.** 🏁🚀
