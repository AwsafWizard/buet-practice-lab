// ev-eco — environment, ecology, ecosystems and their services, biodiversity (Rowshan ma'am L1–L2), plus the faecal-oral route (textbook).
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-eco' as const

const lists: EvList[] = [
  {
    id: 'l-eco-env-classes',
    topic: T,
    title: 'Classification of environment',
    points: [
      { k: 'Physical environment', alt: ['abiotic environment'], d: 'atmosphere, hydrosphere, lithosphere' },
      { k: 'Biological environment', alt: ['biotic environment'], d: 'floral, faunal, microbial' },
      { k: 'Cultural environment', alt: ['social environment'], d: 'society, economy, politics' },
    ],
    seen: ['2015-16'],
    src: 'RM L1-3 p11',
  },
  {
    id: 'l-eco-spheres',
    topic: T,
    title: 'Spheres of the environment',
    points: [
      { k: 'Atmosphere', d: 'the air' },
      { k: 'Hydrosphere', d: 'all water' },
      { k: 'Lithosphere', d: 'rock and soil' },
      { k: 'Biosphere', d: 'the living part that overlaps the other three' },
    ],
    seen: [],
    src: 'RM L1-3 p11–12, p43',
  },
  {
    id: 'l-eco-levels',
    topic: T,
    title: 'Levels of organisation in ecology',
    ask: 'List the levels of organisation in ecology (smallest to largest).',
    points: [
      { k: 'Individual', d: 'acts / functions independently' },
      { k: 'Population', d: 'interbreeding organisms of one species in a defined area and time' },
      { k: 'Community', d: 'two or more species in a defined area and time' },
      { k: 'Ecosystem', d: 'community plus its environment; energy exchange and cycling of elements' },
      { k: 'Biome', alt: ['biomes'], d: 'terrestrial part of the biosphere set by rainfall and temperature' },
      { k: 'Biosphere', d: 'biological component of earth: lithosphere, hydrosphere and atmosphere' },
    ],
    ordered: true,
    hook: 'I Plan Cities, Every Building Boosts: Individual, Population, Community, Ecosystem, Biome, Biosphere.',
    seen: ['2015-16'],
    src: 'RM L1-3 p15',
  },
  {
    id: 'l-eco-biotic',
    topic: T,
    title: 'Biotic components of an ecosystem',
    points: [
      { k: 'Producers', alt: ['plants', 'autotrophs'], d: 'make food from sunlight' },
      { k: 'Consumers', alt: ['herbivores and carnivores'], d: 'eat producers or other consumers' },
      { k: 'Decomposers', alt: ['fungi and bacteria'], d: 'return nutrients to the pool' },
    ],
    seen: [],
    src: 'RM L1-3 p12, p19',
  },
  {
    id: 'l-eco-types',
    topic: T,
    title: 'Types of ecosystem',
    points: [
      { k: 'Natural ecosystem', alt: ['natural'], d: 'forest, sea, lake, desert' },
      { k: 'Artificial ecosystem', alt: ['manmade ecosystem', 'man-made'], d: 'crop field, garden, dam, zoo, aquarium' },
    ],
    seen: [],
    src: 'RM L1-3 p20',
  },
  {
    id: 'l-eco-natural',
    topic: T,
    title: 'Natural ecosystems',
    points: [
      { k: 'Aquatic ecosystem', d: 'lakes and ponds, rivers, marine' },
      { k: 'Wetland ecosystem', d: 'coastal and inland systems' },
      { k: 'Terrestrial ecosystem', d: 'grassland, forest and other biomes' },
    ],
    seen: [],
    src: 'RM L1-3 p21',
  },
  {
    id: 'l-eco-terrestrial',
    topic: T,
    title: 'Six primary terrestrial ecosystems',
    points: [
      { k: 'Tundra' },
      { k: 'Taiga', d: 'largest terrestrial ecosystem' },
      { k: 'Temperate deciduous forest' },
      { k: 'Tropical rain forest', d: 'about 7% of the earth, mostly Brazil' },
      { k: 'Grassland' },
      { k: 'Desert', d: 'about 20% of the earth' },
    ],
    hook: 'Tundra, Taiga, Temperate, Tropical, Grass, Desert.',
    seen: [],
    src: 'RM L1-3 p30',
  },
  {
    id: 'l-eco-services-cat',
    topic: T,
    title: 'Four categories of ecosystem services',
    ask: 'What are the ecosystem services? Describe with examples.',
    points: [
      { k: 'Provisioning services', alt: ['provisioning'], d: 'products obtained from the ecosystem' },
      { k: 'Regulating services', alt: ['regulating'], d: 'benefits from regulation of ecosystem processes' },
      { k: 'Cultural services', alt: ['cultural'], d: 'non-material benefits' },
      { k: 'Supporting services', alt: ['supporting'], d: 'needed for the production of all the others' },
    ],
    hook: 'Provide, Regulate, Culture, Support.',
    seen: ['2023-24'],
    src: 'RM L1-3 p44',
  },
  {
    id: 'l-eco-prov',
    topic: T,
    title: 'Provisioning services (examples)',
    points: [
      { k: 'Food' },
      { k: 'Fresh water', alt: ['freshwater'] },
      { k: 'Fuelwood' },
      { k: 'Fibre', alt: ['fiber'] },
      { k: 'Biochemicals' },
      { k: 'Genetic resources' },
    ],
    seen: ['2023-24'],
    src: 'RM L1-3 p44',
  },
  {
    id: 'l-eco-reg',
    topic: T,
    title: 'Regulating services (examples)',
    points: [
      { k: 'Climate regulation' },
      { k: 'Disease regulation' },
      { k: 'Water regulation' },
      { k: 'Water purification' },
      { k: 'Pollination' },
    ],
    seen: ['2023-24'],
    src: 'RM L1-3 p44',
  },
  {
    id: 'l-eco-cult',
    topic: T,
    title: 'Cultural services (examples)',
    points: [
      { k: 'Spiritual and religious' },
      { k: 'Recreation and ecotourism', alt: ['recreation', 'ecotourism'] },
      { k: 'Aesthetic' },
      { k: 'Inspirational' },
      { k: 'Educational' },
      { k: 'Sense of place' },
      { k: 'Cultural heritage' },
    ],
    seen: ['2023-24'],
    src: 'RM L1-3 p44',
  },
  {
    id: 'l-eco-supp',
    topic: T,
    title: 'Supporting services (examples)',
    points: [{ k: 'Soil formation' }, { k: 'Nutrient cycling' }, { k: 'Primary production' }],
    seen: ['2023-24'],
    src: 'RM L1-3 p44',
  },
  {
    id: 'l-eco-biodiv-levels',
    topic: T,
    title: 'Levels of biodiversity',
    points: [
      { k: 'Genetic diversity', d: 'variation of genes of all species' },
      { k: 'Species diversity', d: 'variety of living species in an ecosystem' },
      { k: 'Ecosystem diversity', d: 'variety of habitats, natural communities and ecological processes' },
    ],
    hook: 'Gene, Species, Ecosystem: small to big.',
    seen: ['2015-16', '2020-21'],
    src: 'RM L1-3 p47–50',
  },
  {
    id: 'l-eco-threats-nat',
    topic: T,
    title: 'Natural threats to biodiversity',
    points: [
      { k: 'Natural disaster' },
      { k: 'Low population' },
      { k: 'Low breeding rate' },
      { k: 'Narrow geographical area' },
      { k: 'Disease' },
    ],
    seen: ['2015-16', '2020-21'],
    src: 'RM L1-3 p51',
  },
  {
    id: 'l-eco-threats-anth',
    topic: T,
    title: 'Anthropogenic threats to biodiversity',
    points: [
      { k: 'Habitat destruction and modification', alt: ['habitat destruction'] },
      { k: 'Climate change' },
      { k: 'Pollution' },
      { k: 'Over-exploitation', alt: ['over exploitation'] },
      { k: 'Alien species', alt: ['invasive species'] },
      { k: 'Disease' },
      { k: 'Poaching' },
      { k: 'Poverty' },
      { k: 'Trafficking' },
    ],
    hook: 'HCP-OA-DPPT: Habitat, Climate, Pollution, Over-exploitation, Aliens, Disease, Poaching, Poverty, Trafficking.',
    seen: ['2015-16', '2020-21'],
    src: 'RM L1-3 p51',
  },
  {
    id: 'l-eco-status',
    topic: T,
    title: 'Conservation status of species',
    points: [
      { k: 'Extinct' },
      { k: 'Critically endangered', d: 'population decline above 80–90%' },
      { k: 'Endangered', d: '50–70% decline' },
      { k: 'Vulnerable', d: '30–50% decline' },
      { k: 'Near threatened', d: 'may qualify as threatened in the near future' },
    ],
    ordered: true,
    seen: [],
    src: 'RM L1-3 p52',
  },
  {
    id: 'l-eco-conserve',
    topic: T,
    title: 'Biodiversity conservation approaches',
    points: [
      { k: 'In-situ conservation', alt: ['in situ'], d: 'protect species in their natural habitat: national parks, sanctuaries, reserves, Sundarbans' },
      { k: 'Ex-situ conservation', alt: ['ex situ'], d: 'outside the habitat: zoo, botanical garden, seed and gene banks' },
    ],
    seen: ['2020-21'],
    src: 'textbook (Peavy ch.1; Aziz)',
    note: 'Not in the CE22 slides.',
  },
  {
    id: 'l-eco-fdiagram',
    topic: T,
    title: 'Routes of faecal-oral transmission (the F-diagram)',
    ask: 'Explain the transmission of diseases from faeces.',
    points: [
      { k: 'Fluids', alt: ['water', 'drinking water'], d: 'faeces wash into ponds, rivers and tubewells' },
      { k: 'Fields', alt: ['soil', 'crops'], d: 'faeces on soil and irrigated crops' },
      { k: 'Flies', alt: ['vectors', 'insects'], d: 'carry faeces to food' },
      { k: 'Fingers', alt: ['hands'], d: 'unwashed hands' },
      { k: 'Food', alt: ['foods'], d: 'contaminated food' },
    ],
    hook: 'Five F: Faeces to Fluids, Fields, Flies, Fingers, Food, then to a new Host.',
    seen: ['2015-16', '2016-17', '2017-18'],
    src: 'textbook (Wagner and Lanoix; Peavy)',
    note: 'Not in the CE22 slides.',
  },
  {
    id: 'l-eco-barriers',
    topic: T,
    title: 'Barriers that break the faecal-oral route',
    ask: 'How could you minimise the transmission of diseases from faeces?',
    points: [
      { k: 'Sanitary latrines', alt: ['safe excreta disposal', 'sanitation'], d: 'primary barrier: isolates faeces' },
      { k: 'Safe water supply', alt: ['safe drinking water', 'water treatment'], d: 'protected source, treatment, disinfection' },
      { k: 'Hand washing with soap', alt: ['hygiene promotion', 'handwashing'], d: 'before eating and after toilet' },
      { k: 'Food hygiene', d: 'cover, cook, wash' },
      { k: 'Fly and vector control', alt: ['vector control'] },
      { k: 'Wastewater and sludge treatment', alt: ['safe sludge disposal'] },
    ],
    seen: ['2017-18'],
    src: 'textbook (Peavy; WHO sanitation)',
    note: 'Not in the CE22 slides.',
  },
]

const cards: EvCard[] = [
  { id: 'c-eco-environ', topic: T, front: 'Where does the word "environment" come from and what is the definition?', back: 'French *environner*, "to encircle". Environment is **everything that affects an organism during its lifetime**: all factors it interacts with and all surroundings that encompass it.', src: 'RM L1-3 p9' },
  { id: 'c-eco-ecology', topic: T, front: 'Define ecology. Who is the father of modern ecology?', back: 'From Greek *oikos* (house). Ecology = study of how living organisms (**biota**) interact with each other and with their physical environment (**abiota**); Odum: "the study of the structure and function of nature". Father of modern ecology: **Eugene Odum**.', seen: ['2015-16'], src: 'RM L1-3 p13–14' },
  { id: 'c-eco-eco-def', topic: T, front: 'Define an ecosystem.', back: 'A living community and its abiotic surroundings that interact to give a **stable pattern of material cycling and linked energy transformations**. It is the **functional unit of ecology**.', seen: ['2023-24'], src: 'RM L1-3 p16–18' },
  { id: 'c-eco-habitat', topic: T, front: 'Habitat vs ecological niche?', back: '**Habitat** = the place where an organism lives. **Niche** = the unique functional role of an organism in its habitat. A niche is unique to a species; many species share a habitat.', src: 'RM L1-3 p17' },
  { id: 'c-eco-flow', topic: T, front: 'How do energy and minerals move in an ecosystem?', back: 'Energy flows **one way**: Sun to producer, herbivore, carnivore (heat lost at each step). Minerals **cycle**: everything dies, decomposers return nutrients to the nutrient pool and producers take them up again.', src: 'RM L1-3 p19' },
  { id: 'c-eco-biome', topic: T, front: 'What decides the boundary of a biome? What is the biosphere?', back: 'Biome = terrestrial part of the biosphere; **rainfall and temperature** set its boundary. Biosphere = the biological component of earth including lithosphere, hydrosphere and atmosphere.', src: 'RM L1-3 p42–43' },
  { id: 'c-eco-wetland', topic: T, front: 'What is a wetland? Give its classes.', back: 'Land where the water table is at, near or above the surface so that saturated, oxygen-poor soil governs the vegetation (hydrophytes, hydric soils). **Coastal** (marine, estuarine) and **inland** (riverine, lacustrine, palustrine). Example: Sundarbans.', src: 'RM L1-3 p38–41' },
  { id: 'c-eco-prov', topic: T, front: 'Give one-line meanings of provisioning, regulating, cultural and supporting services.', back: '**Provisioning**: products (food, fresh water). **Regulating**: benefits from regulation of processes (climate, water purification). **Cultural**: non-material (recreation, heritage). **Supporting**: needed for all the others (soil formation, nutrient cycling).', seen: ['2023-24'], src: 'RM L1-3 p44' },
  { id: 'c-eco-biodiv', topic: T, front: 'Define biodiversity (CBD 1992).', back: 'The variability among living organisms from all sources (terrestrial, marine and other aquatic ecosystems and the ecological complexes they belong to), including **diversity within species, between species and of ecosystems**. Sum total of all the variety and variability of life in a defined area.', seen: ['2015-16'], src: 'RM L1-3 p46' },
  { id: 'c-eco-biodiv-pyr', topic: T, front: 'In the biodiversity pyramid, which level is at the top and which at the base?', back: 'Ecosystem diversity at the top, species diversity in the middle, genetic diversity (genes) at the base.', src: 'RM L1-3 p47' },
  { id: 'c-eco-cbd-years', topic: T, front: 'Which threatened categories have which population decline?', back: 'Critically endangered: more than **80–90%**; endangered: **50–70%**; vulnerable: **30–50%**; near threatened: close to qualifying.', src: 'RM L1-3 p52' },
  { id: 'c-eco-sundarbans', topic: T, front: 'Why do natural threats make a species vulnerable?', back: 'Low population, low breeding rate, a narrow range and disease mean one disaster or one outbreak can wipe a species out; human threats (habitat loss, poaching, pollution) then add to it.', src: 'RM L1-3 p51' },
  { id: 'c-eco-env-def2', topic: T, front: 'Components of the environment?', back: '**Biotic** (producers, consumers, decomposers) and **abiotic** (atmosphere, lithosphere, hydrosphere; nutrients and cycles of gases, water, minerals). Sun supplies the energy.', src: 'RM L1-3 p12' },
  { id: 'c-eco-faecal-def', topic: T, front: 'Why is the faecal-oral route a water-supply problem?', back: 'Excreta carry pathogens (cholera, typhoid, hepatitis A, dysentery, polio, diarrhoea). If faeces reach a water source, the **water is the vehicle** for a whole community. Barriers: sanitation, safe water, hygiene.', seen: ['2016-17'], src: 'textbook (Peavy)' },
  { id: 'c-eco-fecal-tw', topic: T, front: 'Which tubewells are more likely to be faecally contaminated?', back: 'van Geen (2011, Matlab and Araihazar): faecal contamination of shallow tubewells is **inversely related to arsenic**, so low-arsenic tubewells are more prone to faecal contamination.', src: 'RM L4 p29' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-eco-env-ecology',
    topic: T,
    q: 'Write short notes on ecology and environment.',
    seen: ['2015-16'],
    a: `### Environment
1. **Meaning**: French *environner*, to encircle; everything that affects an organism during its lifetime, all the factors it interacts with and all the surroundings around it.
2. **Classes**: **physical** (atmosphere, hydrosphere, lithosphere), **biological** (floral, faunal, microbial) and **cultural** (society, economy, politics).
3. **Components**: **biotic** (producers, consumers, decomposers) and **abiotic** (air, water, soil, nutrients), driven by solar energy, with cycles of gases, water and minerals.

### Ecology
1. **Meaning**: Greek *oikos*, house; Haeckel: management of the household or living space. **Odum**: study of the structure and function of nature.
2. The study of how living organisms (**biota**) interact with each other and with their physical environment (**abiota**).
3. **Levels**: individual, population, community, ecosystem, biome, biosphere. The **ecosystem is the functional unit** of ecology.
4. **Link**: the environment is what surrounds the organism; ecology is the science of how the organism and that surrounding work together.`,
    keys: ['Environner', 'physical', 'biological', 'cultural', 'biotic', 'abiotic', 'Odum', 'ecosystem', 'functional unit'],
    lists: ['l-eco-env-classes', 'l-eco-levels'],
    src: 'RM L1-3 p9–19',
  },
  {
    id: 'a-eco-ecosystem-services',
    topic: T,
    q: 'Define ecosystem. What are the ecosystem services? Describe with examples.',
    seen: ['2023-24'],
    a: `### Ecosystem
A living community and its abiotic surroundings that interact to give a **stable pattern of material cycling and linked energy transformations**; the functional unit of ecology (for example a pond, a forest, a crop field).

### Ecosystem services
| Type | Meaning | Examples |
|---|---|---|
| **Provisioning** | products obtained from the ecosystem | food, fresh water, fuelwood, fibre, biochemicals, genetic resources |
| **Regulating** | benefits from regulation of ecosystem processes | climate regulation, disease regulation, water regulation, water purification, pollination |
| **Cultural** | non-material benefits | spiritual and religious, recreation and ecotourism, aesthetic, inspirational, educational, sense of place, cultural heritage |
| **Supporting** | needed to produce all the others | soil formation, nutrient cycling, primary production |

Example: the Sundarbans mangrove gives fish and timber (provisioning), buffers cyclones and purifies water (regulating), draws tourists (cultural) and recycles nutrients (supporting).`,
    keys: ['stable pattern of material cycling', 'Provisioning', 'Regulating', 'Cultural', 'Supporting', 'water purification', 'nutrient cycling', 'soil formation'],
    lists: ['l-eco-services-cat', 'l-eco-prov', 'l-eco-reg', 'l-eco-cult', 'l-eco-supp'],
    src: 'RM L1-3 p18, p44',
  },
  {
    id: 'a-eco-biodiversity',
    topic: T,
    q: 'Write short notes on biodiversity (levels, threats, conservation).',
    seen: ['2015-16', '2020-21'],
    a: `### Biodiversity
1. **Definition**: the sum total of all the variety and variability of life in a defined area (CBD 1992: diversity within species, between species and of ecosystems).
2. **Levels**: **genetic diversity** (variation of genes), **species diversity** (variety of species in an ecosystem) and **ecosystem diversity** (habitats, communities and processes).
3. **Natural threats**: natural disaster, low population, low breeding rate, narrow geographical area, disease.
4. **Anthropogenic threats**: habitat destruction, climate change, pollution, over-exploitation, alien species, poaching, poverty, trafficking.
5. **Status**: extinct, critically endangered (above 80–90% decline), endangered (50–70%), vulnerable (30–50%), near threatened.

### Conservation (textbook)
1. **In-situ**: protect species in the natural habitat (national parks, sanctuaries, reserves, protected wetlands such as the Sundarbans).
2. **Ex-situ**: zoos, botanical gardens, seed and gene banks.
3. Control pollution, stop habitat loss, regulate hunting and trade, control alien species, and involve local people.`,
    keys: ['Genetic diversity', 'Species diversity', 'Ecosystem diversity', 'habitat destruction', 'over-exploitation', 'alien species', 'poaching', 'In-situ', 'Ex-situ', 'critically endangered'],
    lists: ['l-eco-biodiv-levels', 'l-eco-threats-nat', 'l-eco-threats-anth', 'l-eco-status', 'l-eco-conserve'],
    src: 'RM L1-3 p46–52; conservation: textbook',
  },
  {
    id: 'a-eco-faecal',
    topic: T,
    q: 'Explain the transmission of diseases from faeces. How could you minimise it?',
    seen: ['2015-16', '2016-17', '2017-18'],
    a: `### Faecal-oral transmission (F-diagram)
Faeces of an infected person (or animal) carry pathogens: bacteria (cholera, typhoid, shigellosis), viruses (hepatitis A, polio, rotavirus), protozoa (amoebiasis, giardiasis) and helminth eggs. They reach a new host by five routes:
1. **Fluids**: faeces wash into ponds, rivers, wells and tubewells; drinking this water spreads disease to many people at once.
2. **Fields**: faeces on soil and crops irrigated with wastewater.
3. **Flies**: carry faeces to food and utensils.
4. **Fingers**: unwashed hands after defecation, touching food or children.
5. **Food**: food contaminated by hands, flies, water or fields.

### Minimising it: put barriers in the route
1. **Primary barrier**: **sanitary latrines** and safe excreta disposal so that faeces never reach the environment (pit latrine at a safe distance, more than 10 m from a tubewell).
2. **Safe water supply**: protected source, treatment and **chlorination**, safe storage.
3. **Hand washing with soap** and hygiene promotion.
4. **Food hygiene**: cover, cook, wash.
5. **Fly and vector control**; treatment and safe reuse of wastewater and sludge.`,
    keys: ['Fluids', 'Fields', 'Flies', 'Fingers', 'Food', 'sanitary latrines', 'Hand washing', 'primary barrier', 'chlorination'],
    lists: ['l-eco-fdiagram', 'l-eco-barriers'],
    src: 'textbook (Peavy; WHO) — not in the CE22 slides',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
