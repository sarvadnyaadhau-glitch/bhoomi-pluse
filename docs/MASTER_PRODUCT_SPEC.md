# SENSOTECH — MASTER PRODUCT SPECIFICATION

## 1. Product thesis
SENSOTECH is a farmer-first personal farm intelligence, decision and income system.

**Core principle:** deep intelligence inside, extremely simple outside.

The farmer-facing app exposes a small set of simple destinations while a much larger capability layer works underneath.

## 2. Initial scale
- Initial production target: 1,000 farmers.
- Architecture must be designed for horizontal scaling beyond the initial target without a full rewrite.
- Core farmer experience is free.
- No fabricated production data.

## 3. Farmer-facing navigation
1. Home / Today
2. My Farm
3. Scan
4. Ask SENSOTECH
5. Market
6. News
7. More

## 4. Home / Today
Purpose: answer **"What matters for my farm right now?"**

Top area:
- Farm status
- Important action(s)
- Weather → action
- Crop status
- Farm health
- Ask SENSOTECH voice/text entry
- Scan shortcut
- Market shortcut
- Revenue opportunity shortcut

Scrollable lower section:
### Live Soil & Sensor Data
Only when a sensor is connected:
- Nitrogen (N)
- Phosphorus (P)
- Potassium (K)
- pH
- EC
- Soil moisture
- Soil temperature
- Sensor connection/health
- Last updated timestamp
- Full sensor details/history entry point

When no sensor is connected, show Soil Intelligence based on available satellite, weather, farm history and permitted agricultural data. Never display invented sensor readings.

## 5. My Farm
- Multiple farms
- Farm boundary/map
- Farm area/acreage
- Crop and sowing date
- Crop age
- Crop stage
- Farm health score
- Today's farm brief
- Tomorrow's farm brief
- Farm history
- Season scorecard
- Farm DNA
- Farm Memory AI
- Farm efficiency score

## 6. Scan / Crop Doctor
Flow:
Capture → photo quality check → crop identification → symptom/problem analysis → evidence → confidence → next action → save to Farm Memory.

Capabilities:
- Disease detection
- Pest damage detection
- Nutrient symptoms
- Plant stress
- Severity
- Multi-angle photo guidance
- Geo-tagging
- Before/after timeline
- Problem bookmarks
- Photo + satellite cross-check
- Photo + weather cross-check
- Human/expert escalation

## 7. Ask SENSOTECH AI
- Text and voice
- Hindi, Marathi, English first
- Farmer-context aware
- Evidence/source explanation
- Confidence/uncertainty
- Data conflict detection
- Don't Spend Yet
- No Action state
- What-if simulator
- Farm Memory search
- Personalized recommendations
- Expert escalation

## 8. Intelligence stack
### Farm context
Location, field boundary, acreage, crop, sowing date, crop stage, history.

### Ground data
pH, EC, NPK, moisture, soil temperature, sensor health/calibration.

### Remote sensing
Sentinel-1, Sentinel-2, NDVI, NDRE, GNDVI, EVI, SAVI, NDMI, NDWI, temporal change, vegetation/field stress, anomalies, water stress.

### Vision
Crop ID, disease/pest symptoms, nutrient symptoms, plant stress, severity, photo quality.

### Environment
Rainfall, temperature, humidity, wind, forecast and weather risk.

### Economics
Input cost, labour, machinery, yield, price, transport, storage, revenue, net realization.

### Decision layer
Question → relevant data/tools → evidence fusion → confidence → recommendation → action → farmer feedback → Farm Memory.

## 9. Weather → Action
- Live/5/7/10-day forecast
- Rainfall
- Temperature
- Humidity
- Wind
- Rain probability
- Alerts
- Heat risk
- Heavy rain risk
- Waterlogging risk
- Spray window
- Sowing window
- Harvest window
- Irrigation window
- Fertilizer application window
- Work-day recommendation

## 10. Water intelligence
- Irrigation recommendation
- Water requirement
- Water budget
- Water-use history
- Rainfall vs irrigation
- Water reserve estimate
- Water stress alert
- Irrigation delay recommendation
- Season water projection
- Sensor-based irrigation intelligence

## 11. Pest / disease intelligence
- Pest risk
- Disease risk
- Early warning
- Regional pest wave
- Crop-stage risk
- Weather-linked risk
- Satellite stress correlation
- Photo confirmation
- Field inspection alert
- Need-to-intervene assessment
- Pest history
- Farm-specific pest history

## 12. Crop intelligence
- Crop recommendation
- Top 5 crops
- Suitability
- Duration
- Water requirement
- Risk score
- Expected yield range
- Rotation history
- Alternative crop
- Crop comparison
- Diversification
- Crop selection simulator

## 13. Farm planner
- Crop calendar
- Sowing schedule
- Irrigation schedule
- Nutrient schedule
- Pest monitoring schedule
- Harvest schedule
- Selling schedule
- Daily checklist
- 7-day work planner
- Work timeline
- Missed-task alert
- Missed-task impact
- Next required input
- Tomorrow's work plan

## 14. Input intelligence
- Fertilizer recommendation
- NPK requirement
- Input planner
- Seed requirement
- Fertilizer requirement
- Input cost estimate
- Purchase checker
- Input price comparison
- Stock-at-home
- Purchase reminder
- Input waste detection
- Input-to-field traceability
- Seed lot diary
- Input proof photo
- Bill scanner
- Bill analyzer

## 15. Money / profit
- Expense tracker
- Income tracker
- Cost per acre
- Cost per quintal
- Revenue per acre
- ROI by crop
- Break-even price
- Break-even yield
- Profit calculator
- Yield scenario
- Price scenario
- Loss simulator
- Input cost benchmark
- Spending anomaly/help
- Season financial report

## 16. Market / selling
- Nearby mandi
- Current price
- Min/modal/max
- Arrivals
- 7-day trend
- 30-day trend
- Seasonal trend
- MSP information
- e-NAM information
- Transport cost
- Net realization
- Sell now vs wait
- Market comparison
- Harvest-to-market optimizer
- Buyer information
- FPO information
- Warehouse information
- Storage vs sell calculator
- Transport planner
- Transport cost per quintal

## 17. Harvest / post-harvest
- Harvest readiness
- Yield estimator
- Harvest quantity planner
- Post-harvest loss tracking
- Expected vs actual yield
- Produce quality scan
- Visual grade estimate
- Storage decision
- Warehouse locator
- Cold storage information
- Packaging requirement
- Transport planning
- Sell/store comparison

## 18. Machinery / labour
- Machine vs labour calculator
- Machine rental information
- Availability
- Farm equipment list
- Equipment maintenance
- Repair reminders
- Fuel tracker
- Fuel cost
- Labour requirement
- Labour cost estimate
- Worker attendance
- Farm work cost

## 19. Government
- Government schemes
- Personalized matching
- Eligibility checker
- Document checklist
- Deadlines
- Reminders
- Status
- Government GR simplifier
- Official source badge
- Farmer ID information
- Benefit tracker
- Crop insurance
- Insurance dates
- Loss reporting guidance

## 20. Farmer News
- Government news
- New schemes
- GR/notifications
- Crop news
- District news
- Market news
- MSP/procurement news
- Weather alerts
- Pest alerts
- For You feed
- 2-minute summaries
- What Changed?
- Deadline alerts
- Official-source verification

## 21. Farm records
- Digital farm diary
- Voice farm diary
- Voice + photo record
- Sowing record
- Fertilizer record
- Spray record
- Irrigation record
- Harvest record
- Selling record
- Expense record
- Crop decision journal
- Personal farming notebook
- Local knowledge vault
- Farm history search
- Repeat problem detector

## 22. Local intelligence
- Agriculture office
- KVK locator
- Soil lab locator
- Agriculture service map
- Machinery service
- Local crop calendar
- Local pest alerts
- Local weather events
- Nearby FPO
- Nearby warehouse
- Nearby buyer
- Nearby market
- Village-level risk alert

## 23. Emergency / risk
- Farm emergency button
- Flood alert
- Heavy rain damage record
- Storm damage record
- Drought stress record
- Crop damage photo
- GPS + timestamp evidence
- Disaster timeline
- Insurance documentation support
- Emergency agriculture contacts
- High-risk field alert

## 24. Advanced intelligence
- Farm experiment mode
- Farm benchmark
- Farm improvement plan
- Farm risk radar
- Recommendation change alert
- Evidence timeline
- Data conflict alert
- Photo quality AI
- No Action mode
- Don't Spend Yet
- What-if engine
- Farm digital proof
- Community early warning
- Personal Farm Copilot
- Revenue opportunity ranking
- Income goal planner
- Unused resource opportunity scanner
- Local demand opportunity matching
- Farm revenue diversification score

## 25. Revenue Booster
Core question: **"How can this farm generate more income?"**

Rank realistic opportunities by:
- investment
- labour
- duration
- risk
- local demand
- available space/resources
- season
- expected revenue/net range

Examples can include compatible intercropping, unused area opportunities, mushroom farming, services, storage or other locally relevant opportunities. Always show assumptions and ranges; never guarantee income.

## 26. Commercial ecosystem
Farmer remains free for core intelligence. Revenue can come from ecosystem participants:
- crop procurement margin
- B2B sourcing
- tractor/machinery leads or bookings
- drone service leads/bookings
- transport leads/bookings
- storage leads/bookings
- input intent / clearly labelled sponsored placement / transaction
- repair/service leads
- provider SaaS
- enterprise/FPO SaaS
- agricultural intelligence reports/dashboards/APIs
- buyer network subscriptions/matching/transactions

No raw personal farmer data sales. Sponsored recommendations must be clearly identified.

## 27. Experience
- Offline mode
- Low-data mode
- Auto sync
- Voice-first mode
- Large farmer-friendly controls
- Marathi/Hindi/English first
- Day/night mode
- PWA/mobile-ready architecture
- Push notifications
- Alert prioritization
- Family access
- Farm report export
- Consent/data controls

## 28. Trust and safety rules
- Never fabricate sensor, weather, satellite, market or government data.
- Never invent a source or official scheme.
- Show data provenance when useful.
- Express uncertainty explicitly.
- Do not promise blanket accuracy.
- Do not guarantee diagnosis, yield, price or profit.
- Weak/conflicting evidence can result in inspection or "Don't Spend Yet".

## 29. UI rule
Hundreds of backend capabilities are grouped behind simple workflows. The farmer normally sees only a small set of relevant actions at one time.

**Target farmer feeling:** premium, trustworthy, calm, powerful and effortless — a farmer should feel the app treats their farm like an important asset, not like a generic information feed.
