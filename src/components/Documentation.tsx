'use client'
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function Documentation(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <Card className="bg-black/70 border-zinc-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-black tracking-wide">📚 RACESENSE DOCUMENTATION</CardTitle>
          <CardDescription className="text-zinc-400">
            Comprehensive guide to the real-time strategy engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            
            {/* Project Overview */}
            <AccordionItem value="overview" className="border-zinc-800">
              <AccordionTrigger className="text-white hover:text-[#EB0A1E]">
                🎯 Project Overview
              </AccordionTrigger>
              <AccordionContent className="text-zinc-300 space-y-3">
                <div>
                  <h4 className="font-bold text-white mb-2">What is RaceSense?</h4>
                  <p className="text-sm leading-relaxed">
                    RaceSense is an AI-powered real-time racing analytics tool designed specifically for the 
                    <span className="text-[#EB0A1E] font-bold"> Circuit of the Americas (COTA)</span>. 
                    It simulates real-time race strategies, providing pit stop optimization, pace analysis, 
                    and tire degradation insights during live races.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-white mb-2">Key Features</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Real-time telemetry processing with <Badge variant="outline" className="text-xs text-white border-white">18 parameters</Badge></li>
                    <li>Intelligent data cleaning and lap reconstruction</li>
                    <li>Multi-scenario pit strategy calculations</li>
                    <li>Live tire degradation modeling</li>
                    <li>Delta time analysis and what-if scenarios</li>
                    <li>Professional-grade data quality reporting</li>
                    <li>Export capabilities (JSON, PDF, PNG)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2">Competition Category</h4>
                  <Badge className="bg-[#EB0A1E]">Real-Time Analytics</Badge>
                  <p className="text-sm mt-2">
                    Built for Hack the Track competition, targeting professional-grade 
                    engineering decisions during live races.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Data Quality Features */}
            <AccordionItem value="data-quality" className="border-zinc-800">
              <AccordionTrigger className="text-white hover:text-[#EB0A1E]">
                🧹 Data Quality & Cleaning
              </AccordionTrigger>
              <AccordionContent className="text-zinc-300 space-y-4">
                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    ⏱️ Timestamp Correction Engine
                  </h4>
                  <p className="text-sm mb-2">
                    <strong>Problem:</strong> ECU clocks can drift, causing telemetry misalignment.
                  </p>
                  <p className="text-sm mb-2">
                    <strong>Solution:</strong> Uses <code className="text-[#EB0A1E] bg-black px-1.5 py-0.5 rounded">meta_time</code> as ground truth:
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                    <li>Detects drift patterns (&gt;100ms deviations)</li>
                    <li>Applies rolling window correction</li>
                    <li>Calculates overall drift percentage</li>
                    <li>Ensures accurate time-series analysis</li>
                  </ul>
                  <div className="mt-3 text-xs text-zinc-500 italic">
                    💡 "Our system corrects ECU time drift, ensuring telemetry alignment even when the car's clock is inaccurate."
                  </div>
                </div>

                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    🚗 Vehicle Identification System
                  </h4>
                  <p className="text-sm mb-2">
                    <strong>Problem:</strong> Car numbers can be 000 or change between events.
                  </p>
                  <p className="text-sm mb-2">
                    <strong>Solution:</strong> Chassis-based identification system:
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                    <li>Always keys by <code className="text-[#EB0A1E] bg-black px-1.5 py-0.5 rounded">chassis_number</code> (unique & reliable)</li>
                    <li>Treats car number as optional/secondary</li>
                    <li>Builds mapping table: chassis ↔ car numbers</li>
                    <li>Detects and flags car number changes</li>
                  </ul>
                  <div className="mt-3 text-xs text-zinc-500 italic">
                    💡 "Reliable cross-session driver matching via chassis-based vehicle identification."
                  </div>
                </div>

                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    🔄 Lap Reconstruction Algorithm
                  </h4>
                  <p className="text-sm mb-2">
                    <strong>Problem:</strong> ECU errors cause corrupt lap numbers (typically 32768 overflow).
                  </p>
                  <p className="text-sm mb-2">
                    <strong>Solution:</strong> Hybrid reconstruction using:
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                    <li><strong>Time-based segmentation:</strong> Lap time pattern analysis</li>
                    <li><strong>GPS-based detection:</strong> Start/finish line crossing</li>
                    <li><strong>Fallback:</strong> Telemetry lap numbers when reliable</li>
                    <li>Generates Lap Integrity Report with confidence scores</li>
                  </ul>
                  <div className="mt-3 text-xs text-zinc-500 italic">
                    💡 "Intelligent lap reconstruction that fixes corrupt ECU data using hybrid time/GPS detection."
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-950 to-zinc-900 p-4 rounded-lg border border-green-900">
                  <h4 className="font-bold text-green-400 mb-2">📊 Telemetry Health Dashboard</h4>
                  <p className="text-sm mb-2">
                    Comprehensive data quality metrics showing:
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                    <li><strong>Data Quality Score (0-100):</strong> Overall health rating</li>
                    <li><strong>Timestamp Drift %:</strong> ECU clock accuracy</li>
                    <li><strong>Lap Anomaly Count:</strong> Detected corrupt lap numbers</li>
                    <li><strong>Vehicle ID Mapping:</strong> Chassis-based tracking</li>
                    <li><strong>Corrections Applied:</strong> Transparent processing summary</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Telemetry Specifications */}
            <AccordionItem value="telemetry" className="border-zinc-800">
              <AccordionTrigger className="text-white hover:text-[#EB0A1E]">
                📡 Telemetry Specifications
              </AccordionTrigger>
              <AccordionContent className="text-zinc-300 space-y-3">
                <div>
                  <h4 className="font-bold text-white mb-2">Required CSV Format</h4>
                  <div className="bg-black p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
                    meta_time,ecu_time,lap,car_number,chassis_number,Speed,Gear,nmot,ath,aps,pbrake_f,pbrake_r,accx_can,accy_can,Steering_Angle,VBOX_Long_Minutes,VBOX_Lat_Min,Laptrigger_lapdist_dls
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2">Parameter Definitions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">meta_time</strong>
                      <p className="text-xs text-zinc-400">Logger reception time (accurate ground truth)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">ecu_time</strong>
                      <p className="text-xs text-zinc-400">ECU clock (may drift or have errors)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">lap</strong>
                      <p className="text-xs text-zinc-400">Lap number (may corrupt to 32768)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">car_number</strong>
                      <p className="text-xs text-zinc-400">Race number (optional, can change)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">chassis_number</strong>
                      <p className="text-xs text-zinc-400">Unique vehicle ID (primary key)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">Speed</strong>
                      <p className="text-xs text-zinc-400">Vehicle speed (km/h)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">Gear</strong>
                      <p className="text-xs text-zinc-400">Current gear selection</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">nmot</strong>
                      <p className="text-xs text-zinc-400">Engine RPM</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">ath</strong>
                      <p className="text-xs text-zinc-400">Throttle position (%)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">aps</strong>
                      <p className="text-xs text-zinc-400">Accelerator pedal position</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">pbrake_f</strong>
                      <p className="text-xs text-zinc-400">Front brake pressure</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">pbrake_r</strong>
                      <p className="text-xs text-zinc-400">Rear brake pressure</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">accx_can</strong>
                      <p className="text-xs text-zinc-400">Lateral acceleration (G)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">accy_can</strong>
                      <p className="text-xs text-zinc-400">Longitudinal acceleration (G)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">Steering_Angle</strong>
                      <p className="text-xs text-zinc-400">Steering wheel angle (degrees)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">VBOX_Long_Minutes</strong>
                      <p className="text-xs text-zinc-400">GPS longitude (decimal minutes)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">VBOX_Lat_Min</strong>
                      <p className="text-xs text-zinc-400">GPS latitude (decimal minutes)</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <strong className="text-[#EB0A1E]">Laptrigger_lapdist_dls</strong>
                      <p className="text-xs text-zinc-400">Distance from start/finish line</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-950 border border-yellow-800 p-3 rounded">
                  <p className="text-yellow-200 text-sm">
                    <strong>⚠️ Note:</strong> All 18 parameters are fully supported. The system handles 
                    missing values, drift corrections, and data anomalies automatically.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Analytics Features */}
            <AccordionItem value="analytics" className="border-zinc-800">
              <AccordionTrigger className="text-white hover:text-[#EB0A1E]">
                📊 Analytics & Strategy Features
              </AccordionTrigger>
              <AccordionContent className="text-zinc-300 space-y-3">
                <div className="space-y-3">
                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                    <h4 className="font-bold text-white mb-2">🏁 Real-Time Lap Analysis</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Live lap time tracking and comparison</li>
                      <li>Best lap identification and highlighting</li>
                      <li>Average pace calculation (excludes pit laps)</li>
                      <li>Lap-by-lap progression visualization</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                    <h4 className="font-bold text-white mb-2">🛞 Tire Degradation Modeling</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Progressive lap time increase tracking</li>
                      <li>Compound-specific degradation curves</li>
                      <li>Predictive modeling for future laps</li>
                      <li>Visual degradation trend analysis</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                    <h4 className="font-bold text-white mb-2">⛽ Multi-Scenario Pit Strategy</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>1-Stop Strategy:</strong> Single pit optimization</li>
                      <li><strong>2-Stop Strategy:</strong> Two-stop window calculation</li>
                      <li><strong>No-Stop Strategy:</strong> Push-to-finish analysis</li>
                      <li>Urgency levels: Low, Medium, High (with alerts)</li>
                      <li>Time saving projections for each strategy</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                    <h4 className="font-bold text-white mb-2">⚡ Delta Time Comparison</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Delta to best lap (real-time gap analysis)</li>
                      <li>Delta to average pace (consistency tracking)</li>
                      <li>Visual positive/negative indicators</li>
                      <li>Trend identification over race progression</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                    <h4 className="font-bold text-white mb-2">🔮 What-If Scenarios</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Interactive pit lap selection</li>
                      <li>Real-time strategy impact calculation</li>
                      <li>Finish time projections</li>
                      <li>Compare multiple strategy outcomes</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-red-950 to-zinc-900 p-3 rounded border border-red-900">
                    <h4 className="font-bold text-red-400 mb-2">🚨 Dramatic Pit Alerts</h4>
                    <p className="text-sm">
                      High-urgency pit recommendations trigger full-screen alerts with:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside mt-2">
                      <li>Pulsing red overlay with checkered flag pattern</li>
                      <li>Recommended pit lap and tire degradation info</li>
                      <li>Auto-dismiss after 5 seconds</li>
                      <li>Professional race engineer experience</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Export & Integration */}
            <AccordionItem value="export" className="border-zinc-800">
              <AccordionTrigger className="text-white hover:text-[#EB0A1E]">
                📤 Export & Integration
              </AccordionTrigger>
              <AccordionContent className="text-zinc-300 space-y-3">
                <div>
                  <h4 className="font-bold text-white mb-2">Supported Export Formats</h4>
                  <div className="space-y-3">
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs text-white border-white">JSON</Badge>
                        <span className="text-sm font-bold">Structured Data Export</span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        Complete race data including metadata, performance metrics, tire degradation, 
                        pit recommendations, and lap-by-lap breakdown. Ideal for post-race analysis 
                        and integration with other tools.
                      </p>
                    </div>

                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs text-white border-white">PDF</Badge>
                        <span className="text-sm font-bold">Professional Report</span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        Multi-page formatted report with race information, performance summary, 
                        strategic insights, and lap-by-lap breakdown. Includes consistency scores 
                        and professional branding.
                      </p>
                    </div>

                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs text-white border-white">PNG</Badge>
                        <span className="text-sm font-bold">Visual Summary</span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        High-resolution image capture of the race summary card, perfect for 
                        social media sharing, presentations, or quick visual reference.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-950 border border-blue-800 p-3 rounded">
                  <h4 className="font-bold text-blue-300 mb-2">🔗 Integration Ready</h4>
                  <p className="text-sm text-zinc-300">
                    All exports include timestamps, car identification, and comprehensive telemetry 
                    data for easy integration with external analysis tools, databases, or team dashboards.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Technical Architecture */}
            <AccordionItem value="architecture" className="border-zinc-800">
              <AccordionTrigger className="text-white hover:text-[#EB0A1E]">
                ⚙️ Technical Architecture
              </AccordionTrigger>
              <AccordionContent className="text-zinc-300 space-y-3">
                <div>
                  <h4 className="font-bold text-white mb-2">Technology Stack</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <Badge variant="outline" className="text-white border-white">Next.js</Badge>
                    <Badge variant="outline" className="text-white border-white">TypeScript</Badge>
                    <Badge variant="outline" className="text-white border-white">React</Badge>
                    <Badge variant="outline" className="text-white border-white">Tailwind CSS</Badge>
                    <Badge variant="outline" className="text-white border-white">shadcn/ui</Badge>
                    <Badge variant="outline" className="text-white border-white">Recharts</Badge>
                    <Badge variant="outline" className="text-white border-white">jsPDF</Badge>
                    <Badge variant="outline" className="text-white border-white">html2canvas</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2">Core Modules</h4>
                  <ul className="text-sm space-y-2">
                    <li>
                      <code className="text-[#EB0A1E] bg-black px-2 py-1 rounded">TelemetryProcessor</code>
                      <span className="text-zinc-400"> - Data cleaning, lap reconstruction, health checks</span>
                    </li>
                    <li>
                      <code className="text-[#EB0A1E] bg-black px-2 py-1 rounded">PitStrategyCalculator</code>
                      <span className="text-zinc-400"> - Multi-scenario strategy optimization</span>
                    </li>
                    <li>
                      <code className="text-[#EB0A1E] bg-black px-2 py-1 rounded">DataQuality</code>
                      <span className="text-zinc-400"> - Timestamp correction, vehicle ID, lap integrity</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2">Data Processing Pipeline</h4>
                  <div className="bg-black p-3 rounded text-xs font-mono space-y-1">
                    <div className="text-green-400">1. CSV Upload → Raw Data Parsing</div>
                    <div className="text-yellow-400">2. Data Quality Analysis → Corrections Applied</div>
                    <div className="text-blue-400">3. Lap Reconstruction → Clean Lap Array</div>
                    <div className="text-purple-400">4. Tire Degradation Modeling → Trend Analysis</div>
                    <div className="text-red-400">5. Strategy Calculation → Pit Recommendations</div>
                    <div className="text-zinc-400">6. Real-time Updates → Live Dashboard</div>
                  </div>
                </div>

                <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                  <h4 className="font-bold text-white mb-2">Performance Optimizations</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Client-side processing for instant feedback</li>
                    <li>Efficient array filtering for lap visibility</li>
                    <li>Memorized calculations to prevent re-renders</li>
                    <li>Progressive data loading for large datasets</li>
                    <li>Optimized chart rendering with Recharts</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Usage Guide */}
            <AccordionItem value="usage" className="border-zinc-800">
              <AccordionTrigger className="text-white hover:text-[#EB0A1E]">
                🎮 Usage Guide
              </AccordionTrigger>
              <AccordionContent className="text-zinc-300 space-y-3">
                <div>
                  <h4 className="font-bold text-white mb-2">Getting Started</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>
                      <strong>Load Data:</strong>
                      <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-zinc-400">
                        <li>Click "LOAD SAMPLE RACE DATA" for demo (40 laps, COTA)</li>
                        <li>Or upload your own CSV with 18-parameter telemetry</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Review Telemetry Health:</strong>
                      <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-zinc-400">
                        <li>Check the "TELEMETRY HEALTH" tab</li>
                        <li>Review data quality score and corrections applied</li>
                        <li>Verify chassis/car number mapping</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Analyze Race Strategy:</strong>
                      <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-zinc-400">
                        <li>Use playback controls to simulate race progression</li>
                        <li>Monitor pit recommendations and urgency levels</li>
                        <li>Compare delta times and tire degradation</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Explore What-If Scenarios:</strong>
                      <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-zinc-400">
                        <li>Test different pit stop timing</li>
                        <li>Calculate potential time savings</li>
                        <li>Optimize final strategy</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Export Results:</strong>
                      <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-zinc-400">
                        <li>Generate JSON data for integration</li>
                        <li>Create PDF reports for team review</li>
                        <li>Export PNG images for presentations</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                  <h4 className="font-bold text-white mb-2">Playback Controls</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Play/Pause:</strong> Start/stop race simulation</li>
                    <li><strong>Speed Control:</strong> 1x, 2x, 5x playback speeds</li>
                    <li><strong>Skip Forward:</strong> Jump ahead 5 laps</li>
                    <li><strong>Reset:</strong> Return to lap 1</li>
                    <li><strong>Slider:</strong> Manually navigate to any lap</li>
                  </ul>
                </div>

                <div className="bg-green-950 border border-green-800 p-3 rounded">
                  <h4 className="font-bold text-green-300 mb-2">💡 Pro Tips</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-zinc-300">
                    <li>Watch for dramatic alerts on high-urgency pit recommendations</li>
                    <li>Use delta time chart to identify consistency issues</li>
                    <li>Compare different tire strategies in what-if scenarios</li>
                    <li>Export JSON for integration with team analysis tools</li>
                    <li>Check telemetry health score before making strategic decisions</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
