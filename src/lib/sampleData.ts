// Sample COTA Telemetry Data Generator
// Generates realistic race data for judges to test immediately

export function generateSampleCOTAData(): string {
  const headers = 'meta_time,ecu_time,lap,car_number,chassis_number,Speed,Gear,nmot,ath,aps,pbrake_f,pbrake_r,accx_can,accy_can,Steering_Angle,VBOX_Long_Minutes,VBOX_Lat_Min,Laptrigger_lapdist_dls';
  const laps = 35; // 35-lap race
  const pointsPerLap = 120; // ~2min lap @ 1Hz sampling
  const carNumber = 42;
  const chassisNumber = 7; // Unique chassis ID (e.g., GR86-007-42)
  
  // COTA characteristics
  const baselineLapTime = 128.5; // seconds
  const tireDegPerLap = 0.08; // degrades 0.08s per lap
  
  const rows: string[] = [headers];
  let currentTime = 0;
  
  for (let lap = 1; lap <= laps; lap++) {
    // Simulate pit stop on lap 18
    const isPitLap = lap === 18;
    const pointsThisLap = isPitLap ? 180 : pointsPerLap; // Pit lap takes longer
    
    // Calculate lap time with tire degradation
    const tireDeg = (lap - 1) * tireDegPerLap;
    const lapTime = baselineLapTime + tireDeg + (Math.random() * 0.5 - 0.25);
    const timeStep = (lapTime * 1000) / pointsThisLap;
    
    for (let point = 0; point < pointsThisLap; point++) {
      const progress = point / pointsThisLap;
      
      // Simulate speed profile (slow corners, fast straights)
      let speed: number;
      if (isPitLap && progress > 0.3 && progress < 0.7) {
        speed = 20 + Math.random() * 10; // Pit lane speed
      } else {
        // COTA has long straight then technical sections
        if (progress < 0.15 || (progress > 0.5 && progress < 0.65)) {
          speed = 160 + Math.random() * 15; // Straights
        } else {
          speed = 70 + Math.random() * 30; // Corners
        }
      }
      
      // Gear
      const gear = Math.min(6, Math.floor(speed / 25) + 1);
      
      // Engine RPM (nmot) correlates with speed
      const nmot = 4000 + (speed * 45) + Math.random() * 500;
      
      // Throttle blade (ath) based on speed profile
      const ath = speed > 120 ? 85 + Math.random() * 15 : 30 + Math.random() * 40;
      
      // Accelerator pedal position (aps) - closely follows ath
      const aps = ath + (Math.random() * 5 - 2.5);
      
      // Brake pressures (front/rear in bar)
      const braking = speed < 80;
      const pbrake_f = braking ? 60 + Math.random() * 40 : Math.random() * 5; // bar
      const pbrake_r = braking ? 40 + Math.random() * 30 : Math.random() * 3; // bar
      
      // Acceleration (G's)
      const isAccelerating = ath > 70;
      const isBraking = pbrake_f > 20;
      const accx_can = isAccelerating ? 0.3 + Math.random() * 0.4 : (isBraking ? -0.8 - Math.random() * 0.5 : Math.random() * 0.2);
      
      // Lateral acceleration (G's) - more in corners
      const accy_can = speed < 100 ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 0.6;
      
      // Steering angle (degrees)
      const steering_angle = speed < 100 ? -250 + Math.random() * 500 : -80 + Math.random() * 160;
      
      // GPS (VBOX format)
      const vbox_lat_min = 30.1328 + Math.sin(progress * Math.PI * 2) * 0.01;
      const vbox_long_minutes = -97.6411 + Math.cos(progress * Math.PI * 2) * 0.015;
      
      // Distance from start/finish line (meters)
      const trackLength = 5513; // COTA is 5.513 km
      const laptrigger_lapdist_dls = progress * trackLength;
      
      const ecuTime = currentTime;
      const metaTime = currentTime + (Math.random() * 50 - 25); // Simulate timestamp drift
      
      rows.push(
        `${metaTime.toFixed(0)},${ecuTime.toFixed(0)},${lap},${carNumber},${chassisNumber},` +
        `${speed.toFixed(1)},${gear},${nmot.toFixed(0)},${ath.toFixed(1)},${aps.toFixed(1)},` +
        `${pbrake_f.toFixed(1)},${pbrake_r.toFixed(1)},${accx_can.toFixed(3)},${accy_can.toFixed(3)},` +
        `${steering_angle.toFixed(1)},${vbox_long_minutes.toFixed(6)},${vbox_lat_min.toFixed(6)},${laptrigger_lapdist_dls.toFixed(1)}`
      );
      
      currentTime += timeStep;
    }
  }
  
  return rows.join('\n');
}

export const sampleDataInfo = {
  description: 'Toyota GR Cup Series - Circuit of the Americas',
  laps: 35,
  carNumber: 42,
  chassisNumber: 7,
  features: [
    'Realistic tire degradation (0.08s/lap)',
    'Pit stop on lap 18',
    'COTA-specific speed profiles',
    'Timestamp drift simulation',
    'Noisy sensor data',
  ],
};
