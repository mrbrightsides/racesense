# 🏎️ Project Story – RaceSense: COTA Real-Time Strategy Engine
## 🌟 About the Project

---

### 🎯 Inspiration

This project was born literally within hours after I found out that the telemetry competition dataset had gone public.
At the same time, I’m currently deep in my dissertation, while also being a full-time husband and dad. So the biggest challenge was obvious:
limited time, limited energy, but unlimited curiosity.

I’ve always been fascinated by how race engineers make split-second decisions based on messy, imperfect data. When I saw the known issues in this dataset—drifting ECU timestamps, missing lap counts (sometimes even jumping to 32768), inconsistent car IDs—I instantly felt:
“Okay, this is the perfect playground for data engineering and real-time reasoning.”

---

### 🏗️ How I Built the Project

The project was built through a fast but structured approach:

1. Understanding the Telemetry Chaos

COTA telemetry comes with several issues:

- Inaccurate ECU timestamps

- Missing or corrupted lap numbers

- Car numbers assigned inconsistently

- Lap and telemetry files not always aligned

So I started by finding the most stable signals: speed, longitudinal acceleration, GPS traces—and used them as anchors to reconstruct reliable lap boundaries.


2. Constructing a Clean Lap Model

To build the “RaceSense Engine,” I set up a pipeline:

a. Timestamp Normalization
Deriving a more trustworthy time axis using meta_time (receiver time) + drift compensation.

b. Lap Boundary Reconstruction

- Detect lap start via GPS loop closure

- Cross-check with speed troughs + location clustering

- Rebuild lap numbers sequentially and consistently

c. Vehicle Identity Resolver

- Prioritizing chassis number as the stable ID

- Automatically detecting updated car numbers across sessions


3. AI-Powered Racing Insights

Once the data was clean, I built an analysis layer that can generate:

- Pace delta analytics

- Tire degradation estimation

- Pit window optimization

- Fuel burn modeling

- Sector-level microstrategy insights

This project focuses on the core engine, not a full race simulator.
The priority is simple:
👉 Clean noisy telemetry, reconstruct laps accurately, and extract real-time strategy insights.

---

### 🧠 What I Learned

- Motorsport telemetry is extremely dirty by nature—and that’s what makes it fun.

- Data engineering matters far more than fancy modeling—garbage in, garbage out.

- Race analytics must be fast and precise, just like the sport itself.

- Even with limited time, focusing on core value produces meaningful results.

---

### 🧩 Challenges

- Very tight timeline.
I worked on this in micro-gaps between dissertation revisions, family duties, and everything in between.

- Dataset inconsistency.
Timestamp drift and corrupted lap counts made reconstruction more complex than expected.

- Balancing ideal vs practical.
Building a full race model wasn’t realistic in such a short time, so I focused on the most impactful components.

---

### 🚀 Conclusion

RaceSense was built from a mix of:

- love for data,

- passion for motorsport,

- a bit of acute stress,

- and extremely limited time.

The result is a cleaning + reconstruction + strategy engine that can serve as the foundation for advanced racing analytics.

With further development, RaceSense could evolve into:

- a race engineer assistant,

- pit strategy advisor,

- driver training analytics tool,

- or a multi-track real-time telemetry engine.
