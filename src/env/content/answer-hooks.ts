// Memory hooks for the model answers (Learn tab). One per answer that no hooked list already covers:
// a first-letter mnemonic, a picture, or a one-line contrast. Merged onto EV_ANSWERS in ./index.ts.
// Markdown inline (**bold**) is allowed. Keep each to one or two short lines.

export const EV_ANSWER_HOOKS: Record<string, string> = {
  // ── Tanvir sir: aeration ──
  'a-aer-objectives': 'Aeration **adds** O₂ and **takes away** gases: **add** O₂ → oxidise Fe, Mn, S²⁻; **strip** CO₂, H₂S, VOCs → less corrosion, taste and odour.',
  'a-aer-types': '**G-S-D-M**, "Good Showers Don’t Mess": Gravity (cascade, tray), Spray, Diffuser, Mechanical. Ground water: the multiple-tray (gravity) aerator wins.',
  'a-aer-twofilm': 'Picture two thin skins at the surface, a **gas film** over a **liquid film**: gas must diffuse through both; the liquid film is the bottleneck, so thin it (turbulence, bigger area).',

  // ── Tanvir sir: advanced treatment ──
  'a-att-ro-ed': '**RO pushes the water** through the membrane with pressure; **ED pulls the ions** through membranes with voltage. RO: water moves. ED: ions move (only ionised ones).',
  'a-att-ro-apps': '**D-P-U-R-R-W**, "Dirty Ponds Usually Run Really Wet": Desalination, Pretreatment, Ultrapure water, Recovery of materials, Reduction of waste volume, Water reuse.',
  'a-att-desal': '**R-E-D-F-I**, "RED FIsh": Reverse osmosis, Electrodialysis, Distillation, Freezing, Ion exchange; every one is limited by **cost** (energy) and **brine disposal**.',
  'a-att-ac-use': '**T-O-C** it removes (Taste & odour, Organics, Colour), and why it works: huge **surface** that is **regenerable**.',
  'a-att-prep': '**Roast → Activate → Size**: char it without air, oxidise it hot to open the pores, then crush (GAC) or grind (PAC). Spent GAC goes back to the furnace.',
  'a-att-gac-pac': '**GAC = a bed you rebuild** (granules, regenerable, costly plant). **PAC = a powder you throw away** (dosed like a chemical, cheap to start, hard to regenerate).',
  'a-att-phys-chem': '**Physical = Velcro**: van der Waals, many layers, reversible. **Chemical = glue**: a real bond, one layer, site-specific, irreversible.',
  'a-att-ads-mech': 'Molecules go where energy is **lower**; the trip is **film → pore → surface** (transport), then they stick by **physical** or **chemical** bonds; ions depend on **pH and ionic strength**.',
  'a-att-ac-vs-ix': '**Carbon catches organics** (molecules stick, nothing swapped). **Resin swaps ions** (one ion out for one in). Carbon: heat to regenerate; resin: brine, acid or alkali.',

  // ── Rowshan ma’am: Bangladesh water supply ──
  'a-bdws-equity': 'Equity = **who pays more for less**: the slum poor (35% of people on 4% of land) get no legal pipe, buy from vendors and pay more. Fix: **legal connections, pro-poor tariff, surface water, reach the hard-to-reach**.',
  'a-bdws-coastal-hilly': 'Coast = **salt** (+ As, Fe): RWH, PSF, SST, deep HTW, desalination, MAR. Hills = **can’t drill** (+ Fe, Mn): gravity flow, RWH, infiltration gallery, protect springs.',
  'a-bdws-haor-ars': 'Haor = **under water half the year**: raised deep HTW / DTW, AIRP, RWH. Arsenic belt = **go deep or treat**: DTW, removal plants (SIDKO), surface water, PSF, WSP.',
  'a-bdws-saltwater': 'Fresh water **floats** like oil on salt water. Pump 1 m down → salt cone rises **40 m** up. Remedies: **skim shallow** (radial wells), **push back** (recharge wells).',
  'a-bdws-psf': '**Pond → Sand → Store**: pump pond water onto filter sand over gravel and underdrain, collect it in a clear-water tank. Care: scrape the sand; limit: dries up with the pond.',

  // ── Rowshan ma’am: climate and energy ──
  'a-climate-vapour': '**Hotter → wetter air → hotter**: CO₂ warms a little, warm air holds more vapour, vapour traps more heat. Vapour is the **amplifier**, not the trigger (more than doubles the warming).',
  'a-climate-nexus': 'Energy **uses** the environment and **dumps** on it. Fix it with **S-R-C**: Switch (renewables), Reduce (efficiency), Capture (CO₂, scrubbers).',
  'a-climate-energy-bd': 'BD runs on **gas and oil**, renewables only **5.6%**. Water ↔ energy: **energy for water** (DTW and WASA pumps), **water for energy** (cooling, hydro).',
  'a-climate-renew-challenges': '**L-H-I-L-T-G**, "Little Hope In Lighting The Grid": Land, High cost, Intermittency (storage), Limited resources, Technology & skills, Grid integration.',
  'a-climate-engineer': 'The engineer guards the **W-W-S-A-C-E-E-P** of a town, "**Water Waste Solid Air Climate EIA Ecosystems People**": water, wastewater, solid waste, air, climate, EIA, ecosystems, public health.',

  // ── Tanvir sir: coagulation ──
  'a-coag-forces': 'Two forces in a tug-of-war: **charge pushes apart** (electrostatic repulsion), **van der Waals pulls together**. Coagulation lowers the barrier so the pull wins.',
  'a-coag-dlc': 'Squeeze the cloud: more counter-ions → thinner double layer → lower zeta → particles touch. Higher charge squeezes harder: Na⁺ : Ca²⁺ : Al³⁺ need **1000 : 16 : 1.3** (Schulze–Hardy); never restabilises. Natural example: **river clay meets sea salt → delta**.',
  'a-coag-dlc-vs-an': '**DLC squeezes** (ions only crowd the layer: no overdose, no reversal). **Adsorption neutralises** (ions stick: stoichiometric dose, overdose reverses the charge).',
  'a-coag-sweep': '**A net in the water**: dose enough to precipitate Al(OH)₃, the flocs sweep colloids as they sink. Fewer colloids → **more** coagulant needed.',
  'a-coag-camp': '**Gt = how hard × how long** (G = intensity, t = time) = number of collisions. Design flocculators by G and Gt together.',
  'a-coag-factors': '**C-A-P-T-M-T-I**, "Cats And Pigs Take Mud To Islands": Colloid concentration, Alkalinity, pH, Type & dose of coagulant, Mixing, Temperature, Ions present.',
  'a-coag-vs-floc': '**Coagulation = chemistry, fast** (destabilise, flash mix, seconds, high G). **Flocculation = physics, slow** (grow flocs, gentle mix, 20–45 min, low G, Gt).',
  'a-coag-dose': 'Four zones as dose rises: **No – Yes – No – Yes** (none, charge neutralisation, restabilisation, sweep). Low turbidity → too few particles: **add clay** (bentonite); low alkalinity → **add lime/soda**.',

  // ── Snigdha ma’am: demand ──
  'a-dem-percap': '**Total yearly use ÷ (population × 365)** in lpcd, including loss and waste, taken for the design period.',
  'a-dem-nrw': 'NRW = water **made but not paid for**. Three bins: **Real** (leaks), **Apparent** (theft, bad meters), **Unbilled authorised**. Cut it → more **revenue**, viability.',
  'a-dem-leak': 'Effects: **Water, Pressure, Contamination, Damage** lost. Find it: **Audit → District meter → Night flow → Step test → Listen (acoustic) → Pitometer → Check meters**: from the whole city down to the pipe.',
  'a-dem-fire': 'Small in a year, **huge in an hour**. Kuichling **700√P**, Freeman **250(P/5 + 10)** gpm, P in thousands; NBFU for big cities. Two uses: occupancy and street hydrants.',
  'a-dem-design-period': '20–30 years. Factors **U-E-F-P-P-S-I**, "Use Every Fund, Plan Population Shift In": Useful life, Ease of extension, Funds, Performance, Population growth, Shift of community, Industry.',
  'a-dem-mgmt': 'Objectives **R-R-P-P**: Reduce use, Reduce losses, Postpone new works, Protect the source. Losses: walk the water **from source to tap**: intake, raw main, plant, transmission, reservoir, mains, connections, home.',
  'a-dem-variations': '**Season → day → hour** (storage reservoir, service reservoir, pump). Peak factors **R 2.5, I 1.4, C 4, F 1**: "Residents twice-and-a-half, Industry steady, Commerce rushes".',

  // ── Tanvir sir: disinfection ──
  'a-dis-pre-post': '**Pre = before the plant, big dose, many jobs** (algae, Fe, taste) but more THM. **Post = after the filter, small dose, one job**: disinfect and leave a residual.',
  'a-dis-bp': 'The curve goes **up-down-up**: reducers eat Cl₂ (flat), chloramines form (rise), they get destroyed (fall to the breakpoint), then **free residual** rises 1 : 1.',
  'a-dis-thm': '**Remove, Move, Swap**: remove the precursors (coagulation, activated carbon), move the chlorine after filtration, swap to ozone / ClO₂ / UV / chloramine; and trim dose and time.',
  'a-dis-dbp': 'Each disinfectant leaves its signature: **Cl₂ → THMs**, chloramine → less of them, **ClO₂ → chlorite**, **O₃ → bromate** (with bromide), **UV → none known**.',

  // ── Snigdha ma’am: distribution ──
  'a-dist-requirements': '**Q-P-F-L-W-S**, "Quiet Pipes Feed Lots With Safety": Quality kept, Pressure enough, Fire flow, Layout so no one is cut off, Water-tight, Sewer 1 m away.',
  'a-dist-methods': '**Gravity** = free but needs a hill. **Direct pumping** = only when pumped, dies with the power. **Pump + storage** = the usual: reliable but costly. (Plus individual sources.)',
  'a-dist-continuous': '**Continuous is clean**: positive pressure keeps dirt out, fire water always there, smaller pipes. Intermittent = negative pressure sucks in dirt, home storage, waste when taps are left open.',
  'a-dist-deadend': '**A tree**: trunk → branches → twigs that end. Cheap, easy, extendable; but **dead ends stagnate**, need flushing, and one repair cuts off everything downstream.',
  'a-dist-looped': '**A net**: every pipe fed from two sides, so water circulates and a break is fed from the other way; cost: more pipe, more valves, and sizing needs **Hardy Cross**.',
  'a-dist-hardy-assume': 'Assume Q with continuity → compute **H = kQˣ** → **ΔQ = −ΣH / (x ΣH/Q)** (H with sign, H/Q without) → correct every pipe (common pipes get both loops’ Δ) → repeat until Δ is small.',
  'a-dist-hardy-derive': 'Two laws: **in = out** at a node, **ΣH = 0** round a loop. Put Q = Q₀ + Δ in H = kQˣ, binomial-expand, drop Δ², set ΣH = 0 → ΔQ = −ΣH/(xΣH/Q).',
  'a-dist-reservoir': 'A reservoir is a **B-P-E-F** bank: Balance the hourly demand, keep Pressure, Emergency (breakdown) store, Fire reserve. Capacity = balancing + breakdown + fire.',
  'a-dist-branched-design': '**Map → Layout → Peak flow per branch → Pick pipe size → Head loss → Check terminal pressure ≥ 30 psi**; resize and repeat.',

  // ── Tanvir sir: Fe, Mn, As ──
  'a-fe-ph': 'Numbers climb **Fe 7.5 → Mn 8.5–9 → As 9**: iron oxidises near neutral, Mn needs pH ~9 (8.5 with Cl₂ / potash), As(III) ionises only above 9 (lime).',
  'a-fe-diff': 'Fe and Mn **oxidise and settle on their own**; As **doesn’t precipitate alone**: it must ionise and ride on a floc (co-precipitation), so oxidise it **before** the floc forms.',
  'a-fe-as-ioniz': '**As(III) is shy (neutral H₃AsO₃), As(V) is charged.** Two ways to charge it: (1) **oxidise** with Cl₂ / potash → As(V) ions; (2) **raise pH above 9** with lime → As(III) ions.',
  'a-fe-as-methods': '**A-B-C**: **A**dd oxidant + floc (Cl₂/KMnO₄ then FeCl₃/alum), **B**ase it with lime + floc, **C**oated media filter (iron oxide / activated alumina). All rely on a positive floc surface.',
  'a-fe-as-theory': 'Theory: As sticks to **positive hydroxide flocs**. Criteria: it must be **ionised first** (oxidise, or pH > 9). Process: **1st ionise, 2nd co-precipitate** with alum or iron.',
  'a-fe-as-ph-iron': '**Iron is the free taxi** (its floc carries As away; low-iron water needs added FeCl₃). **pH sets both the ticket and the taxi**: the As species and the floc charge.',
  'a-fe-trains': 'Ground water **A-S-F-D-S**: Aerate, Soften, Filter, Disinfect, Store. Surface water **P-C-F-S-F-A-D-S**: Presettle, Coagulate, Flocculate, Settle, Filter, Adsorb, Disinfect, Store. GW fights **dissolved** stuff, SW fights **suspended** stuff.',

  // ── Tanvir sir: filtration ──
  'a-filt-ssf-removal': 'The **Schmutzdecke is a living skin**: particles are **trapped** (interception, adsorption), **eaten** (biological action), and **settle** (sedimentation in the pores) and flocculate.',
  'a-filt-ssf-rsf': '**Slow = biology, fine sand, 0.1–0.4 m/h, scrape.** **Rapid = chemistry (alum floc), coarse sand, 5–10 m/h, backwash.** D₁₀ 0.1–0.3 vs 0.45–0.55 mm.',
  'a-filt-media': '**SSF: fine, any grading** (D₁₀ 0.1–0.3, U 2–3). **RSF: coarse, uniform** (D₁₀ 0.45–0.55, U 1.2–1.7), or dual / mixed media.',
  'a-filt-rough': 'A **coarse pre-filter for muddy water**: gravel beds (horizontal, up-flow, down-flow) store lots of silt before an SSF. Big storage, cheap; but bulky and cleaning is a chore.',
  'a-filt-dual': 'Backwash puts the **fine sand on top**, which clogs the surface. Fix: put **light coarse coal on top, heavy fine sand (and garnet) below**; density keeps it **coarse → fine** after every backwash, so the whole depth works.',
  'a-filt-backwash': '**When**: head runs out, or breakthrough. **How**: water **up** through the bed, it **expands**, grains **rub** (shear) and the dirt washes to the troughs.',

  // ── Snigdha ma’am: groundwater ──
  'a-gw-vertical': 'From the top: **Soil → Vadose → Capillary fringe → Saturation**: "Some Very Clever Students". Aeration zone above the water table, saturation below.',
  'a-gw-aquifers': '**Unconfined** = open top (water table). **Confined** = sandwich under pressure (piezometric surface, may flow). **Leaky** = sandwich with a leaky aquitard. **Perched** = a puddle on a clay lens above the main table.',
  'a-gw-flow-well': 'Pump → water flows in from **all sides** through **ever-smaller cylinders**, so it **speeds up** and the slope steepens → an **inverted cone** of depression; drawdown, radius R; cones overlap → interference.',
  'a-gw-dupuit': 'Steps: **Q = K·i·A** with i = dy/dx and A = 2πxy → separate → integrate from r to R and d to D → **Q = πK(D² − d²)/ln(R/r)**. Assumptions: radial, flat gradient = slope, steady.',
  'a-gw-thiem': 'Same as Dupuit but the **area is 2πxb** (thickness fixed): Q = K(dy/dx)(2πxb) → integrate → **Q = 2πKb(D − d)/ln(R/r)**. Unconfined: **squares**; confined: **b**.',
  'a-gw-storage': '**S (confined)** = water from **squeezing** the aquifer: tiny, 0.005–0.00005. **Sy (unconfined)** = water from **draining** the pores: big, 0.01–0.30. Both "per unit area per unit head drop", so Sy is the unconfined storativity.',
  'a-gw-k-notes': '**K = speed at gradient 1** (Darcy, how easily soil passes water). **T = K × b**: flow through a whole strip of aquifer, unit width, at gradient 1.',
  'a-gw-interference': 'Two cones overlap → **drawdowns add** → each well yields less and lifts higher; space wells **250–500 ft** apart.',
  'a-gw-salt': 'Fresh water **floats** on salt (Ghyben–Herzberg: **1 m drawdown → 40 m rise** of the interface). Options: **skim** (shallow radial wells), **recharge** (barrier), **extract** salt, move **inland**, harvest rain.',
  'a-gw-springs': 'A gravity spring = the **water table pokes out** of the ground and water flows by gravity from an unconfined aquifer; flow rises and falls with the table. (Artesian spring: pressure-driven.)',

  // ── Rowshan ma’am: intake ──
  'a-intake-def': 'An intake is the **front door**: it safely draws water at chosen levels into the withdrawal conduit. Types by **source** (river, canal, reservoir, lake), **position** (submerged, exposed), **water inside** (wet, dry).',
  'a-intake-design': '**V-P-G-I-S-S-S-H**, "Very Pretty Girls In Some Sunny Seaside Hotels": Velocity ≤ 0.3 fps, Ports at levels (≥ 2 m below top, 1 m above bed), Gates, Ice, Structure (FS), Safety, Screens, Hydraulics.',
  'a-intake-dry-wet': '**Wet = the tower fills** with water to reservoir level; a shaft inside draws it. **Dry = the tower is empty**; ports pipe water straight in, so it floats up (buoyancy) and must be **heavier**.',

  // ── Tanvir sir: ion exchange ──
  'a-ix-softening': '**Swap Ca and Mg for Na** on a resin; bypass some to blend; when exhausted, **soak in brine** to swap back. Plus: no sludge, simple. Minus: needs clear water, adds Na, brine waste.',
  'a-ix-breakthrough': 'Effluent stays **flat and low**, the exchange zone slides down the bed, then the curve **shoots up** at breakthrough → stop and regenerate before exhaustion.',
  'a-ix-demin': '**Cations first, then anions**: H-resin swaps every cation for H⁺, OH-resin swaps every anion for OH⁻, and **H⁺ + OH⁻ = water**. Regenerate with **acid** (H₂SO₄/HCl) and **caustic** (NaOH).',
  'a-ix-vs-lime': '**IX = small, clean, no sludge, but fussy** (needs turbidity-free water, adds Na). **Lime–soda = big, messy sludge, but tough** (takes turbid water, also removes Fe, Mn, TDS).',

  // ── Rowshan ma’am: pumps ──
  'a-pump-airlift': '**Bubbles make the water light**: air blown in at the bottom makes a froth lighter than the water outside, so it rises. Plus: **no moving parts**, OK with sand. Minus: **poor efficiency**, needs deep submergence and a compressor.',
  'a-pump-priming-cav': 'Submersible = **always under water**, so its impeller is always full: **no priming** and plenty of NPSH, so **no cavitation**. Cavitation = vapour bubbles that form and **implode**.',
  'a-pump-npsh': '**Available must beat required**: NPSHa is what the suction side offers above vapour pressure; the pump drops it by NPSHr inside. If NPSHa < NPSHr the water boils → cavitation. Keep a **1 m** margin.',

  // ── Rowshan ma’am: rainwater harvesting ──
  'a-rwh-approaches': '**Demand side** sizes for the driest stretch (bigger tank). **Supply side** (mass curve) uses what rain actually gives (smaller, cheaper). Take the **smaller** of the two.',
  'a-rwh-quality': 'Dirt comes from the **air, the roof and the tank** (pH, wet and dry deposition, leaching, microbes, minerals). Manage **before** (first-flush diverter, design) and **after** storage (disinfect).',

  // ── Tanvir sir: sedimentation ──
  'a-sed-sor': '**SOR = Q / A = the critical settling velocity**. A particle settling faster than SOR is fully removed, whatever the depth: **deeper basin, longer fall, same time**. So area decides, not depth.',
  'a-sed-plate': 'Plates **stack many shallow floors** into one tank: huge area, short fall, laminar flow, sludge slides off: **smaller, cheaper, higher loading**.',

  // ── Tanvir sir: softening ──
  'a-soft-nch': 'Lime can’t touch CaSO₄ / CaCl₂, so **soda ash brings the carbonate**: Ca²⁺ + CO₃²⁻ → CaCO₃↓ at pH > 10.3. (Or ion exchange.)',
  'a-soft-soda': '**Soda when there is non-carbonate hardness**; **recarbonate when pH is high** after excess lime, to 8.4–8.6, so CaCO₃ doesn’t crust the filters and pipes.',
  'a-soft-recarb': '**Stabilise = neither scale nor rust.** Recarbonate = **bubble CO₂** to drop the pH to 8.4–8.6 and stop the precipitation, after lime softening.',
  'a-soft-twostage': '**Two stops**: first CO₂ to ~10.3 then **settle out** the CaCO₃, then CO₂ to 8.4–8.6. Settling in between means **less CO₂** and less hardness slips back.',
  'a-soft-ph-alk': '**pH: Ca at 10.3, Mg at 11–11.3.** **Alkalinity is the carbonate hardness**: if alk ≥ hardness, lime alone; if alk < hardness, add **soda ash**.',
  'a-soft-flow-lowalk': 'Low alkalinity → **lime + soda**: Rapid mix → Flocculate → Settle → Recarbonate → Filter → Chlorinate. "**Real Fish Swim Right For China**".',
  'a-soft-bar': 'Two bars in mg/L as CaCO₃: **cations on top (Ca, Mg, Na), anions below (HCO₃, SO₄, Cl)**, CO₂ in front. Overlap of Ca+Mg with HCO₃ = **carbonate hardness**, the rest = non-carbonate.',

  // ── Rowshan ma’am: transmission ──
  'a-trans-corr-factors': 'Corrosion is a **battery** (anode, cathode, electrolyte). It speeds up with **W-D-V-C-M-D-S**: Water quality (low pH, soft), Dissolved O₂, Velocity, Cavitation, Microbes, Dissimilar metals, Soil.',
  'a-trans-corr-control': '**Stop the battery**: make the water stable (LI ≈ 0), cover the metal (lining, coating), give it a sacrificial anode (cathodic), insulate dissimilar metals, add inhibitors, remove O₂, moderate velocity, use non-corroding pipe.',
  'a-trans-corr-galvanic': 'Two metals in water = a **battery**: the more **active** one is the anode and dies. Rate depends on the **gap in the galvanic series** and the **area ratio**. Stop it: insulate, coat, use similar metals.',
  'a-trans-corr-micro': 'In soil with **no oxygen**, **sulphate-reducing bacteria** turn SO₄ into **H₂S**, which attacks iron → FeS. Control: coating, cathodic protection, good backfill.',
  'a-trans-hammer': 'Slam a valve and the water column **crashes into it**: a high-pressure wave runs back to the tank, returns as a low-pressure wave, and **bounces** back and forth until friction kills it.',
  'a-trans-hammer-control': 'Causes: anything **sudden** (valve, pump stop or start, trapped air). Remedies: **go slow** (valves), **give it somewhere to go** (surge tank, air chamber, relief valve), **keep it spinning** (flywheel), keep velocity low.',

  // ── Snigdha ma’am: wells ──
  'a-well-types': '**Shallow** (No. 6, Rower, Disco: suction, ≤ 7.5 m) → **Deep-set** (Tara, Tara II, Moon, Bangla, Mark-II: ≤ 30 m) → **Deep** (DTW, ≥ 75 m).',
  'a-well-no6': 'No. 6 **sucks**: the plunger makes a vacuum and the **air pressure pushes** water up. Theory 10 m, practice **7.5 m (22–25 ft)**; below that, switch to a deep-set (Tara) pump.',
  'a-well-tara': 'Tara **pushes**: a piston **below the water level** lifts it by displacement, so no suction limit (to 15 m). Problems: direct action (tiring), buoyancy, leaks, modest output, parts fail.',
  'a-well-tara-vs-no6': '**No. 6 sucks, Tara pushes.** No. 6: piston above water, suction, ≤ 7.5 m. Tara: piston below water, force, ≤ 15 m.',
  'a-well-sinking': '**S-J-C-R**, "Some Jets Can Rotate": Standard (percussion, rock), Jetting (soft soil, BD favourite), Core drill, Rotary (mud). Test bore by jetting, main bore by rotary.',
  'a-well-rotary': '**Direct**: mud goes **down the pipe, up the annulus**. **Reverse**: water goes **down the annulus, up the big pipe** (pumped). Reverse = clean water, big holes, easy development.',
  'a-well-sludger': 'Hand-made pump: a pipe with a **flap valve** at the bottom, **lifted and dropped by hand**; each drop lets slurry in and the valve holds it; casing sinks as it goes.',
  'a-well-failure': '**I-C-C-F-M**, "Ice Cream Can Fail Machines": Incrustation, Corrosion, Clogging by fines, Falling water table, Mechanical failure. Typical life 15–20 years.',
  'a-well-dtw': 'Top to bottom: **Housing pipe → Reducing socket → Blind pipe → Screen → Sand trap**, wrapped in **gravel pack** and sealed with grout. "**H**ouses **R**arely **B**uild **S**and **T**raps".',
  'a-well-development': '**Why**: wash out the mud, settle the gravel, get sand-free water, lower losses, longer life. **How**: **P-C-S-B-J-C**: Pumping (1.5×), Compressed air, Surging, Back-washing, Jetting, Chemicals.',
  'a-well-screen-length': 'Length pays more than diameter: **double the length ≈ double the yield**. Screen **70 / 75 / 80%** of the aquifer for < 25 / 25–50 / > 50 ft thick, at most about 100 ft long.',
  'a-well-maintenance': '**R-I-C-A-P-R**, "Records In Case Anything Possibly Rusts": keep Records, Inspect, Clean / redevelop, Acid treat, Protect & disinfect the head, Repair or replace.',
  'a-well-sst': 'A **shallow well in a gravel jacket**: the shroud lets a **wider slot** work in fine sand, so it yields more; still limited by suction lift.',

  // ── Tanvir sir: water quality ──
  'a-wq-significance': 'For each impurity write **health or nuisance + the limit**: e.g. As → cancer, F → teeth & bones, Pb → nerves, Mn → stains, E. coli → faecal pathogens, NO₃ → blue baby, DO → taste, CO₂ → corrosion, hardness → scale and soap.',
  'a-wq-sources': 'Sort every source into **Nature, Farm, Factory, Sewage**: NO₃ → fertiliser and sewage; coliform → faeces; colour → humus, Fe; Cr, Pb → industry & old pipes; Fe, As → aquifer rock; CO₂, H₂S → decay underground.',
  'a-wq-causes': '**Turbidity = particles** (clay, silt, microbes). **Colour = dissolved** (humus, Fe, Mn, algae). **Odour = organics** (H₂S, algae, phenol). **Taste = salts and metals**.',
  'a-wq-carbonic': 'Two switches at **pH 6.3 and 10.3**: below 6.3 mostly **CO₂**, between them **HCO₃⁻**, above 10.3 **CO₃²⁻**. End points: 4.5 (all CO₂) and 8.3 (all HCO₃⁻).',
  'a-wq-pm-alk': '**P stops at Pink** (phenolphthalein, pH 8.3: OH⁻ + ½CO₃²⁻). **M goes all the way to Methyl orange** (pH 4.5: everything = total alkalinity).',
  'a-wq-turb-colour': '**Turbidity scatters, colour tints.** Turbidity = suspended particles (NTU); colour = dissolved organics and metals (Hazen), **apparent** with turbidity, **true** after it is removed.',
  'a-wq-acidity': '**Natural = CO₂, weak**, titrate to 8.3, aggressive. **Mineral = strong acids** (H₂SO₄, HCl), pH below 4.5, from mines and factories.',
  'a-wq-indicator': 'Indicators are the **smoke, not the fire**: E. coli means faeces → pathogens are possible; it is easier and cheaper than chasing every pathogen. Target **0 per 100 mL**.',
  'a-wq-pops': '**POPs = old poisons that won’t leave** (DDT, PCBs, dioxins: persist, bioaccumulate). **CECs = new suspects, not yet regulated** (drugs, hormones, PFAS, microplastics).',
  'a-wq-natural-hardness': '**Rain + soil CO₂ → carbonic acid → dissolves limestone**: Ca²⁺, Mg²⁺ = hardness, HCO₃⁻ = alkalinity. Gypsum and salts add the non-carbonate part.',
  'a-wq-sw-gw': '**Surface water is variable and dirty-looking** (turbidity, microbes, DO high). **Ground water is steady and clear but loaded** (minerals, Fe, Mn, CO₂, H₂S, low DO). SW → coagulate & filter; GW → aerate.',
  'a-wq-bd-health': '**A-I-F-S-N**: **A**rsenic (skin lesions, cancer), **I**ron & Mn (stains, Mn → nerves), **F**luoride (fluorosis), **S**alinity (hypertension), **N**itrate (blue baby).',

  // ── Snigdha ma’am: water supply system ──
  'a-ws-sources': '**S-G-R-W-S-S-I**, "Some Girls Read While Sitting Silently Inside": Surface, Ground, Rain, Wastewater (reuse), Storm water, Saltwater, Ice-cap.',
  'a-ws-hydro': 'Water **goes up** (evaporation, transpiration), **gathers** (condensation, clouds), **comes down** (precipitation), **gets away** (runoff, infiltration, groundwater flow to the sea). It is nature’s **renewal**.',
  'a-ws-sw-gw': '**GW: clean but mineral** (Fe, Mn, As), steady, cheap to treat, may deplete. **SW: plentiful but dirty** (turbidity, microbes), needs full treatment, costlier plant.',
}
