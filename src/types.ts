export interface PlanetStats {
  diameter: string;
  temperature: string;
  orbitPeriod: string;
  gravity: string;
  mass: string;
  moonsCount: number;
}

export interface CameraPose {
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface Satellite {
  name: string;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  scale: number;
}

export interface CelestialPin {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  color: string; // Hex code or RGB
  glowColor: string;
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
  description: string;
  stats: PlanetStats;
  satellites: Satellite[];
  cameraPoses: {
    hero: CameraPose;
    inspect: CameraPose;
    flyby: CameraPose;
    orbit: CameraPose;
  };
}

export interface CosmicMessage {
  sender: "user" | "cosmic-ai";
  text: string;
  timestamp: string;
}
