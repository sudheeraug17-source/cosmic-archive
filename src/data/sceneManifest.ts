import { CelestialPin } from "../types";

export const CELESTIAL_PINS: CelestialPin[] = [
  {
    id: "sun",
    name: "The Sun",
    subtitle: "SOLARIS ACCRETION",
    tagline: "The Sovereign Heart of Fusion",
    color: "#ff8200",
    glowColor: "rgba(255, 130, 0, 0.75)",
    position: [-18, 0, -5],
    scale: 3.5,
    rotationSpeed: 0.001,
    description: "A colossal thermonuclear core fusing 600 million tons of hydrogen every second. Solaris accounts for 99.8% of the solar system's mass, generating the massive magnetic and atmospheric currents that hold our planetary family in orbit. Its plasma surface roars with magnetic flares, casting high-energy solar winds into the infinite dark.",
    stats: {
      diameter: "1,392,700 km",
      temperature: "15,000,000 °C (Core)",
      orbitPeriod: "230 Million Years (Galactic)",
      gravity: "274 m/s²",
      mass: "1.989 × 10³⁰ kg",
      moonsCount: 0
    },
    satellites: [],
    cameraPoses: {
      hero: { position: [-8, 2, 4], lookAt: [-18, 0, -5] },
      inspect: { position: [-12, 0.5, 0], lookAt: [-18, 0, -5] },
      flyby: { position: [-14, -2, 2], lookAt: [-18, 0, -5] },
      orbit: { position: [-15, 3, -1], lookAt: [-18, 0, -5] }
    }
  },
  {
    id: "mercury",
    name: "Mercury",
    subtitle: "AERIS REGOTH",
    tagline: "The Iron Sentinel of First Orbit",
    color: "#a4a4a4",
    glowColor: "rgba(164, 164, 164, 0.3)",
    position: [-10, -0.5, -2],
    scale: 0.5,
    rotationSpeed: 0.004,
    description: "The closest world to the Sun is an extreme, airless core of metallic iron. Suffering day temperatures hot enough to melt lead and night drops that plunge to absolute freezing, Mercury orbits at hyper velocities, a battered rock defying solar radiation. Space-probe scanning reveals deep basalt craters and pristine polar water-ice deposits locked in eternal shadow.",
    stats: {
      diameter: "4,879 km",
      temperature: "-180°C to 430°C",
      orbitPeriod: "88 Days (Earth)",
      gravity: "3.7 m/s²",
      mass: "3.285 × 10²³ kg",
      moonsCount: 0
    },
    satellites: [],
    cameraPoses: {
      hero: { position: [-5, 1, 2], lookAt: [-10, -0.5, -2] },
      inspect: { position: [-9, -0.2, -0.5], lookAt: [-10, -0.5, -2] },
      flyby: { position: [-8.8, 0.6, -1.2], lookAt: [-10, -0.5, -2] },
      orbit: { position: [-9.2, 0.3, -2.8], lookAt: [-10, -0.5, -2] }
    }
  },
  {
    id: "venus",
    name: "Venus",
    subtitle: "AURUM VEIL",
    tagline: "The Sulfur Furnace",
    color: "#ffc83b",
    glowColor: "rgba(255, 200, 59, 0.5)",
    position: [-6, 0.2, 1],
    scale: 0.9,
    rotationSpeed: -0.002, // retrograde
    description: "Wrapped inside a dense carbon-dioxide atmosphere and acidic sulfuric acid clouds, Venus is the most hostile greenhouse in the system. Atmospheric pressure equals 90 oceanic depths of Earth, turning its barren golden surface into a sprawling volcanic maze. It experiences extreme heat distortion underneath its dense amber flow grids.",
    stats: {
      diameter: "12,104 km",
      temperature: "465 °C",
      orbitPeriod: "224.7 Days (Earth)",
      gravity: "8.87 m/s²",
      mass: "4.867 × 10²⁴ kg",
      moonsCount: 0
    },
    satellites: [],
    cameraPoses: {
      hero: { position: [-3, 1.5, 5], lookAt: [-6, 0.2, 1] },
      inspect: { position: [-4.5, 0.5, 2.5], lookAt: [-6, 0.2, 1] },
      flyby: { position: [-5.2, -0.5, 2.2], lookAt: [-6, 0.2, 1] },
      orbit: { position: [-6, 1.2, -1], lookAt: [-6, 0.2, 1] }
    }
  },
  {
    id: "earth",
    name: "Earth",
    subtitle: "TERRA FIRMA",
    tagline: "The Blue Sanctuary of Genesis",
    color: "#2a75d3",
    glowColor: "rgba(42, 117, 211, 0.6)",
    position: [-1, 0, 3],
    scale: 1.1,
    rotationSpeed: 0.008,
    description: "The jewel of space-time. Earth is a magnificent sanctuary suspended in the deep void, shielded by a dynamic magnetosphere. It is the only planet confirmed to harbor carbon life, liquid oceans, dynamic seasons, and a nitrogen-oxygen balance. Deep-night scans map twinkling human cities, casting brief yellow signals into our galactic archive.",
    stats: {
      diameter: "12,742 km",
      temperature: "-89°C to 58°C",
      orbitPeriod: "365.25 Days",
      gravity: "9.81 m/s²",
      mass: "5.972 × 10²⁴ kg",
      moonsCount: 1
    },
    satellites: [
      {
        name: "luna",
        color: "#cfdfef",
        orbitRadius: 2.2,
        orbitSpeed: 0.015,
        scale: 0.25
      }
    ],
    cameraPoses: {
      hero: { position: [2, 1.8, 7], lookAt: [-1, 0, 3] },
      inspect: { position: [0.8, 0.3, 4.8], lookAt: [-1, 0, 3] },
      flyby: { position: [-0.2, -0.8, 4.2], lookAt: [-1, 0, 3] },
      orbit: { position: [-1, 1.6, 0.5], lookAt: [-1, 0, 3] }
    }
  },
  {
    id: "mars",
    name: "Mars",
    subtitle: "ARES CHRONOS",
    tagline: "The Rust Desert of Lost Streams",
    color: "#d14b2d",
    glowColor: "rgba(209, 75, 45, 0.5)",
    position: [4, -0.4, 1.5],
    scale: 0.75,
    rotationSpeed: 0.007,
    description: "The Red Planet is a frozen archaeological site of extinct rivers and immense basalt canyons. Boasting the tallest shield volcano in our solar garden—Olympus Mons—and swept by immense global dust storms, Mars contains iron-oxide dust that glows blood-red in the dark. Future archives hint that deep underground ice tables wait for human genesis.",
    stats: {
      diameter: "6,779 km",
      temperature: "-153°C to 20°C",
      orbitPeriod: "687 Days (Earth)",
      gravity: "3.71 m/s²",
      mass: "6.39 × 10²³ kg",
      moonsCount: 2
    },
    satellites: [
      {
        name: "phobos",
        color: "#a48e7e",
        orbitRadius: 1.2,
        orbitSpeed: 0.024,
        scale: 0.1
      },
      {
        name: "deimos",
        color: "#c2ae9f",
        orbitRadius: 1.6,
        orbitSpeed: 0.018,
        scale: 0.08
      }
    ],
    cameraPoses: {
      hero: { position: [7, 0.8, 5], lookAt: [4, -0.4, 1.5] },
      inspect: { position: [5.2, -0.1, 2.8], lookAt: [4, -0.4, 1.5] },
      flyby: { position: [3.3, -0.8, 2.5], lookAt: [4, -0.4, 1.5] },
      orbit: { position: [4, 0.8, -0.5], lookAt: [4, -0.4, 1.5] }
    }
  },
  {
    id: "asteroid-belt",
    name: "Asteroid Belt",
    subtitle: "PRIMORDIAL FRANTIER",
    tagline: "The Broken Ring of Fallen Worlds",
    color: "#6c6660",
    glowColor: "rgba(108, 102, 96, 0.3)",
    position: [7.5, 0, -2],
    scale: 0.8,
    rotationSpeed: 0.003,
    description: "An immense celestial disk of organic silicate compounds, basalt rocks, and rich metal iron fragments lying between Mars and Jupiter. Denied the gravitational freedom to merge into a singular planet due to Jupiter's colossal tectonic grip, the Belt consists of millions of wandering space rocks and icy asteroids spinning in frozen, rhythmic isolation.",
    stats: {
      diameter: "Cerus: 940 km (Largest)",
      temperature: "-73°C to -108°C",
      orbitPeriod: "3 to 6 Earth Years",
      gravity: "Variable (< 0.1 m/s²)",
      mass: "3% Earth Moon Mass (Total)",
      moonsCount: 0
    },
    satellites: [],
    cameraPoses: {
      hero: { position: [11.5, 4, 3], lookAt: [7.5, 0, -2] },
      inspect: { position: [8.5, 1, 0], lookAt: [7.5, 0, -2] },
      flyby: { position: [7, -1, -3], lookAt: [7.5, 0, -2] },
      orbit: { position: [6.5, 2, -1], lookAt: [7.5, 0, -2] }
    }
  },
  {
    id: "jupiter",
    name: "Jupiter",
    subtitle: "JOVIAL MAGNA",
    tagline: "The Gas Sovereign",
    color: "#cfa57c",
    glowColor: "rgba(207, 165, 124, 0.55)",
    position: [12, 1, -6],
    scale: 2.3,
    rotationSpeed: 0.015, // fast spinner
    description: "The supreme giant of the archive, 1,300 times the size of Earth. Crushed under a powerful atmospheric mantle of hydrogen gas and swirling ammonium currents, Jupiter displays a breathtaking canvas of dynamic banded zones. It is home to its Great Red Spot—a massive planetary anti-cyclonic tempest raging for centuries.",
    stats: {
      diameter: "139,820 km",
      temperature: "-110 °C",
      orbitPeriod: "11.86 Years (Earth)",
      gravity: "24.79 m/s²",
      mass: "1.898 × 10²⁷ kg",
      moonsCount: 95
    },
    satellites: [
      { name: "io", color: "#f7d63b", orbitRadius: 3.4, orbitSpeed: 0.012, scale: 0.15 },
      { name: "europa", color: "#afe7ff", orbitRadius: 3.8, orbitSpeed: 0.009, scale: 0.14 },
      { name: "ganymede", color: "#b5ac9d", orbitRadius: 4.4, orbitSpeed: 0.006, scale: 0.18 },
      { name: "callisto", color: "#8a7e6b", orbitRadius: 5.0, orbitSpeed: 0.004, scale: 0.16 }
    ],
    cameraPoses: {
      hero: { position: [16, 3, -1], lookAt: [12, 1, -6] },
      inspect: { position: [14.5, 1.2, -2.5], lookAt: [12, 1, -6] },
      flyby: { position: [10, -1, -4], lookAt: [12, 1, -6] },
      orbit: { position: [12, -2, -11], lookAt: [12, 1, -6] }
    }
  },
  {
    id: "saturn",
    name: "Saturn",
    subtitle: "KRONOS ACCRETION",
    tagline: "The Sovereign Diamond of Rings",
    color: "#e8c991",
    glowColor: "rgba(232, 201, 145, 0.45)",
    position: [18, -0.5, -12],
    scale: 1.9,
    rotationSpeed: 0.012,
    description: "Possessing an majestic ring system that stretches over 280,000 kilometers from edge to edge, Saturn is the jewel of architectural physics. Its rings are sculpted from billions of glistening ice shards and stellar dust particles locked in silent concentric tracks. Warm helium currents and high-energy polar auroras paint its gold atmosphere in soft textures.",
    stats: {
      diameter: "116,460 km",
      temperature: "-140 °C",
      orbitPeriod: "29.45 Years (Earth)",
      gravity: "10.44 m/s²",
      mass: "5.683 × 10²⁶ kg",
      moonsCount: 146
    },
    satellites: [
      { name: "titan", color: "#efc264", orbitRadius: 3.8, orbitSpeed: 0.007, scale: 0.2 },
      { name: "enceladus", color: "#ffffff", orbitRadius: 2.8, orbitSpeed: 0.011, scale: 0.08 }
    ],
    cameraPoses: {
      hero: { position: [23, 2, -6], lookAt: [18, -0.5, -12] },
      inspect: { position: [20.5, 0.8, -8.5], lookAt: [18, -0.5, -12] },
      flyby: { position: [15.2, -2.5, -10], lookAt: [18, -0.5, -12] },
      orbit: { position: [18, 4, -17], lookAt: [18, -0.5, -12] }
    }
  },
  {
    id: "uranus",
    name: "Uranus",
    subtitle: "AETHERIS CRYO",
    tagline: "The Tilted Cyan Sovereign",
    color: "#6ce0e3",
    glowColor: "rgba(108, 224, 227, 0.4)",
    position: [24, 0.5, -17],
    scale: 1.3,
    rotationSpeed: -0.008, // tipped on side
    description: "A mysterious cyan ice giant encased in pristine methane, water, and ammonia ice. Rotating completely horizontally on its axis—perhaps due to a violent collision during the genesis epoch—Uranus spins as a pale offset clock. It is wrapped inside a cluster of vertical, charcoal-dark dust rings.",
    stats: {
      diameter: "50,724 km",
      temperature: "-224 °C",
      orbitPeriod: "84 Years (Earth)",
      gravity: "8.69 m/s²",
      mass: "8.681 × 10²⁵ kg",
      moonsCount: 28
    },
    satellites: [
      { name: "titania", color: "#b9bdc4", orbitRadius: 2.1, orbitSpeed: 0.012, scale: 0.12 },
      { name: "oberon", color: "#ccd1da", orbitRadius: 2.5, orbitSpeed: 0.009, scale: 0.11 }
    ],
    cameraPoses: {
      hero: { position: [28, 2.5, -12], lookAt: [24, 0.5, -17] },
      inspect: { position: [25.8, 1.2, -14.5], lookAt: [24, 0.5, -17] },
      flyby: { position: [22, -1.2, -16], lookAt: [24, 0.5, -17] },
      orbit: { position: [24, 3.2, -21], lookAt: [24, 0.5, -17] }
    }
  },
  {
    id: "neptune",
    name: "Neptune",
    subtitle: "INDIGO COBALT",
    tagline: "The Sonic Tempest at the Border",
    color: "#274fcf",
    glowColor: "rgba(39, 79, 207, 0.5)",
    position: [29, -0.2, -22],
    scale: 1.35,
    rotationSpeed: 0.01,
    description: "The dark, cobalt sentinel overlooking the edge of our solar assembly. Swept by furious winds exceeding a supersonic 2,100 km/h, Neptune's storms carry frozen methane gales over a molten core of liquid diamonds. It is bounded by Triton—a retrograding ice-spouting moon of pure frozen nitrogen.",
    stats: {
      diameter: "49,244 km",
      temperature: "-214 °C",
      orbitPeriod: "164.8 Years (Earth)",
      gravity: "11.15 m/s²",
      mass: "1.024 × 10²⁶ kg",
      moonsCount: 16
    },
    satellites: [
      { name: "triton", color: "#afd1ea", orbitRadius: 2.2, orbitSpeed: -0.014, scale: 0.14 } // retrograde
    ],
    cameraPoses: {
      hero: { position: [33, 2, -17], lookAt: [29, -0.2, -22] },
      inspect: { position: [30.8, 0.8, -19.5], lookAt: [29, -0.2, -22] },
      flyby: { position: [27, -1.5, -21], lookAt: [29, -0.2, -22] },
      orbit: { position: [29, -2.8, -18], lookAt: [29, -0.2, -22] }
    }
  }
];
