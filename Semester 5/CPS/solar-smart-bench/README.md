# Solar Smart Bench — CPS Simulator (M2 prototype)

Local browser application for the Solar-Powered Smart Public Bench concept. It combines a Three.js digital-twin view, a simplified energy/thermal model, supervisory EMS rules, a PID fan controller, and live telemetry charts.

## Requirements

- Node.js **20.19+** or **22.12+** (required by current Vite releases).
- npm (bundled with Node.js).
- Internet access for the first `npm install` and for the Google Fonts stylesheet. The application itself runs locally after dependencies are installed.

## Run locally

1. Extract the project ZIP.
2. Open a terminal in the `solar-smart-bench` folder.
3. Run:

   ```bash
   npm install
   
4. Open the local URL printed by Vite (normally `http://localhost:5173`).
5. To create a production build, run `npm run build`. To preview it, run `npm run preview`.

## Project structure

```text
solar-smart-bench/
├── index.html
├── package.json
├── README.md
└── src/
    ├── main.js
    ├── style.css
    ├── simulation/
    │   ├── config.js
    │   ├── model.js
    │   ├── pid.js
    │   └── ems.js
    ├── scene/
    │   └── bench3d.js
    └── ui/
        ├── dashboard.js
        └── charts.js
```

## Included in M2

- Orbitable, zoomable 3D bench scene (drag to orbit; scroll to zoom; reset-camera button).
- Solar irradiance input and PV power calculation.
- Wireless, USB, and LED load toggles; total DC load and battery SOC response.
- Ambient temperature and additional enclosure heat input.
- PID-controlled or manually controlled fan.
- Live SOC, battery temperature, PV output, and total-load charts.
- A simple EMS that sheds wireless charging below 20% SOC, USB below 15%, and LED below 10%; all noncritical user loads are shed at 55 °C.

## Important model notes

This is a **conceptual simulation**, not a certified battery-management system, electrical design, or validated physical digital twin. It is intended for explaining system behavior and demonstrating CPS integration.

The app reuses the M1 v0.3 baseline:

- Battery candidate model: 12.8 V, 20 Ah, 256 Wh; 4 A design charge-current limit; 20 A discharge-current limit; internal resistance model 0.05 Ω.
- PV assumptions: 0.6 m² active area, 20% reference efficiency, 120 Wp, −0.004/°C temperature coefficient, 95% MPPT efficiency.
- Loads: 3 W controller/sensors, 20 W wireless transmitter input, 18 W USB, 8 W LED maximum, 1.68 W fan maximum.
- Thermal assumptions: 2550 J/K lumped thermal capacity, 2.5 W/K natural conductance, 2.538 W/K effective added fan conductance at full command.
- Numerical integration: 2.5 s fixed step. The UI advances 60 simulated seconds per real-time second for demonstration.

Provisional assumptions requiring later calibration:

1. PV cell temperature is estimated as ambient temperature + 5 °C.
2. The 2.538 W/K fan conductance is an estimated effective value; it is **not** derived directly from the fan's free-air CFM rating.
3. `Heat input` is a hypothetical heat disturbance coupled into the battery enclosure, not a measured accessory loss.
4. PID gains in `src/simulation/config.js` are demonstration starting values, not tuned gains from a measured plant.
5. The app treats the battery path efficiencies as 95% each direction and uses coulomb counting with unity coulombic efficiency.
6. EMS thresholds are project demonstration logic. In particular, 55 °C is a project noncritical-load shutdown policy, while 45 °C charge inhibit and 60 °C discharge limit are the battery-model temperature limits used here.

## Model equations

PV after MPPT:

`P_pv = A · G · η_ref · [1 + γ(T_cell − 25)] · η_MPPT`

Load:

`P_load = P_controller + P_wireless + P_USB + P_LED + P_fan,max · u_f³`

Battery SOC (coulomb counting):

`dSOC/dt = +I_ch/(3600 C_Ah)` during charging, and `−I_dis/(3600 C_Ah)` during discharging.

Battery thermal model:

`C_th · dT_b/dt = I_b² R_int + Q_aux − (UA_0 + UA_fan · u_f)(T_b − T_amb)`

PID output is clipped to 0–100% and includes conditional-integration anti-windup plus a filtered derivative term.

## Suggested M2 acceptance checks

1. Set irradiance to 0 W/m²: PV output should become 0 W.
2. Raise irradiance: PV power should rise approximately linearly, with a small temperature correction.
3. Toggle wireless / USB / LED individually: the DC load should change by about 20 W / 18 W / 8 W respectively (fan power may add up to 1.68 W).
4. Pause the simulation, change an input, and confirm the displayed instantaneous preview updates; resume to integrate SOC and temperature over time.
5. Increase heat input: battery temperature should trend upward unless cooling is sufficient.
6. Switch between AUTO PID and MANUAL fan. In AUTO, increase temperature above setpoint and check that fan command rises. In MANUAL, the slider should directly set fan command.
7. At low SOC, EMS should shed lower-priority loads in order. At high battery temperature, it should shed all three user loads.

## Known prototype limitations

- Wireless and USB wattages represent input power drawn at the DC bus, not power received by a phone.
- Presence detection, foreign-object detection, real BMS cell-voltage behavior, DC/DC converter switching, MPPT dynamics, battery voltage/SOC curves, detailed solar-cell thermal dynamics, and airflow CFD are not modeled.
- The 3D geometry is parametric and conceptual; it is not a fabrication drawing or dimensionally verified product model.

## M3 — Smart Solar Bus Shelter integration

- Single state: `advanceSimulation()` / `previewState()` in `model.js` produce the only state object; dashboard, charts and the 3D scene only read it.
- New config blocks in `config.js`: `loads.displayAvgW` (ASSUMPTION), `display`, `lighting`, `ems.shedDisplayBelowSocPct`, `ems.capLedBelowSocPct`, `ems.ledCapLevel`.
- Automatic lighting (rule-based): lux hysteresis 80/120, PIR hold 300 simulation seconds, LED OFF / DIM_25 / FULL_100.
- `npm run validate` runs the headless regression + validation scenarios (no new dependencies).
- M1 reproduction: use lighting mode MANUAL + FULL 100% (the old LED switch behaviour) and the e-paper switch OFF.
