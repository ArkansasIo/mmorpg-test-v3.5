# Data Models & Schemas Reference
## Universe Civilization: Empire at War

This document defines the core data models, state interfaces, formula engines, and balance matrices powering Universe Civilization: Empire at War.

---

## 1. Resource Economy Model (`ResourceState`)

The empire economy operates on six primary industrial elements, two demographic life-support consumables, and one operational action token:

```typescript
export interface ResourceState {
  credits: number;       // Universal galactic currency for trade & market transactions
  metal: number;         // Primary structural mineral for hulls, armor, and construction
  crystal: number;       // Electronic and optic semiconductor for energy grids and research
  deuterium: number;     // Heavy hydrogen isotope used for fleet propulsion and fusion reactors
  naquadah: number;      // Super-heavy element required for hyperspace drives and ancient technology
  energy: number;        // Net available power balance (Produced - Consumed)
  energyProduced: number;// Total gross megawatt production from solar & fusion
  energyConsumed: number;// Total gross megawatt consumption by active facilities
  food: number;          // Consumable nourishment supporting population growth
  water: number;         // Purified moisture sustaining biosphere stability
  population: number;    // Total citizens and skilled workforce across all colonies
  attackTurns: number;   // Action turns used for combat, expeditions, and blitzes
  maxTurns: number;      // Maximum accumulation ceiling for action turns (default: 300)
}
```

---

## 2. Mathematical Cost Scaling Engine

Facility upgrades and technological research follow exponential growth curves to incentivize expansion into new colonies:

### A. Mine & Facility Cost Formula
$$\text{Cost}_{\text{Metal}}(\text{Level}) = \text{BaseMetal} \times 1.5^{(\text{Level} - 1)}$$
$$\text{Cost}_{\text{Crystal}}(\text{Level}) = \text{BaseCrystal} \times 1.6^{(\text{Level} - 1)}$$
$$\text{Cost}_{\text{Deuterium}}(\text{Level}) = \text{BaseDeut} \times 1.5^{(\text{Level} - 1)}$$

### B. Energy Consumption Formula
$$\text{Energy}(\text{Level}) = 10 \times \text{Level} \times 1.1^{\text{Level}}$$

### C. Metal Mine Hourly Production Formula
$$\text{Production}_{\text{Metal}} = 30 \times \text{Level} \times 1.1^{\text{Level}} \times \text{GovernmentMultiplier} \times \text{OfficerMultiplier}$$

---

## 3. Planetary Colony Model (`Colony`)

```typescript
export interface Colony {
  id: string;
  name: string;
  coordinate: string;       // [Universe : Galaxy : System : Slot], e.g. "1:204:8"
  type: 'homeworld' | 'colony' | 'moon' | 'outpost';
  fieldsUsed: number;       // Current developed building lots
  fieldsMax: number;        // Maximum planetary surface slots (expandable via Terraformer)
  temperatureMin: number;   // Coldest surface temperature (°C)
  temperatureMax: number;   // Warmest surface temperature (°C) - governs solar satellite output
  diameterKm: number;       // Celestial diameter determining baseline field count
  facilities: Record<string, number>; // Building ID -> Current Upgrade Level
  defenses: Record<string, number>;   // Defense ID -> Built Unit Count
  ships: Record<string, number>;      // Ship ID -> Docked Fleet Count
  resources: ResourceState;
  hasMoon: boolean;
  moonId?: string;
  governorId?: string;      // Assigned Commander ID
}
```

---

## 4. 90-Class Naval Roster Hierarchy (`unitRoster90.ts`)

Warships and civilian support vessels are partitioned into eight distinct naval classes:

| Class Tier | Typical Hull Hull Points | Roles | Example Ships |
| :--- | :--- | :--- | :--- |
| **Tier 1: Light Escorts** | 2,000 - 8,000 | Screen, Recon, Interception | F-302 Fighter, Scout Sloop, Interceptor |
| **Tier 2: Corvettes & Frigates** | 10,000 - 30,000 | Flak, Anti-Fighter, Escort | Prometheus Mk-I, Daedalus Frigate, Ion Raider |
| **Tier 3: Destroyers & Cruisers** | 40,000 - 120,000 | Primary Line of Battle | Odyssey Cruiser, Beliskner Warship, Ha'tak |
| **Tier 4: Battlecruisers** | 150,000 - 450,000 | Heavy Orbital Strike | O'Neill Class Battlecruiser, Vor'nak Battlecruiser |
| **Tier 5: Battleships & Carriers** | 600,000 - 1,800,000 | Fleet Command & Fighter Wings | Ancient Aurora Battleship, Super-Ha'tak |
| **Tier 6: Dreadnoughts** | 2,500,000 - 6,000,000 | Siege & Planetary Bombardment | Anubis Mothership, Ori Warship, Asgard Science Flagship |
| **Tier 7: Titans & Motherships** | 10,000,000 - 30,000,000 | Mobile Command Center | Asuran City Ship, Apophis Flagship, Destiny |
| **Tier 8: World-Killers** | 50,000,000+ | Strategic Star System Decimator | Dakara Superweapon Ship, Singularity Colossus |

---

## 5. EVE-Style Modular Ship Fitting (`ShipFittingView.tsx`)

Ships feature distinct fitting capacity constraints:
- **CPU Capacity (tf)**: Consumed by target computers, electronic counter-measures (ECM), and sensor arrays.
- **Powergrid Capacity (MW)**: Consumed by heavy weapon batteries, beam cannons, and shield hardeners.
- **Slot Hardpoints**:
  - **High Slots**: Energy weapons, projectile cannons, missile launchers, and spinal lances.
  - **Medium Slots**: Shield boosters, warp scramblers, afterburners, and sensor boosters.
  - **Low Slots**: Armor plates, damage control units, gyrostabilizers, and heat sinks.
  - **Rig Slots**: Permanent hull modifications offering specialized combat multipliers.

---

## 6. Six-Type Armor Resistance Engine

Combat damage calculations evaluate 6 distinct damage channels against respective armor absorption percentages:

$$\text{DamageDealt} = \sum_{\text{type} \in \text{Types}} \text{IncomingDamage}_{\text{type}} \times \left(1 - \frac{\text{Resistance}_{\text{type}}}{100}\right)$$

1. **Kinetic**: Shells, railguns, mass drivers, and fragmentation torpedoes.
2. **Thermal**: Lasers, plasma cannons, and particle lances.
3. **Explosive**: Concussion missiles, nuclear warheads, and antimatter charges.
4. **Corrosive**: Acidic warheads, bio-toxins, and nanite swarms.
5. **Graviton**: Gravimetric imploders and miniature event horizon projectors.
6. **Neutron**: Radiation pulses and subatomic particle streams.

---

## 7. 30 Multiverse Universes & 2,700 Galaxies Topology (`multiverseData.ts`)

The celestial atlas spans 30 distinct cosmic dimensions connected via Dimensional Supergates:
- **Total Universes**: 30
- **Galaxies per Universe**: 90
- **Total Galaxies in Cosmos**: 2,700
- **Star Systems per Galaxy**: 999
- **Orbital Positions per System**: 15 (Slots 1-3: Hot/Solar; Slots 4-12: Temperate Habitable; Slots 13-15: Cryo/Gas)
- **Total Coordinate Address Space**: 40,459,500 planetary slots accessible via `[U:G:S:P]`.
