import { useState, useEffect } from "react";
import { IntroScreen } from "./components/IntroScreen";
import { CosmicCanvas } from "./components/CosmicCanvas";
import { CosmicHUD } from "./components/CosmicHUD";
import { audioSystem } from "./utils/audioSystem";

export default function App() {
  const [hasVisitedIntro, setHasVisitedIntro] = useState(false);
  const [activePlanetId, setActivePlanetId] = useState("sun");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [pinsCoords, setPinsCoords] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});
  const [orbitSpeedFactor, setOrbitSpeedFactor] = useState(1.0);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Clean up audio context state on dev server unmounts
  useEffect(() => {
    return () => {
      audioSystem.stopAll();
    };
  }, []);

  const handleLaunch = () => {
    // Enable browser Audio Context
    audioSystem.init();
    audioSystem.playPlanetInspectionChime();
    
    setHasVisitedIntro(true);
    setIsPlayingAudio(true);
  };

  const handlePlanetSelect = (id: string) => {
    setActivePlanetId(id);
    audioSystem.playPlanetInspectionChime();
  };

  const handleAudioToggle = () => {
    const isMuted = audioSystem.toggleMute();
    setIsPlayingAudio(!isMuted);
  };

  const handleResetRealtime = () => {
    setOrbitSpeedFactor(1.0);
    setResetTrigger((prev) => prev + 1);
  };

  const triggerSoundCue = (type: "beep" | "chime" | "hum") => {
    if (type === "beep") {
      audioSystem.playInterfaceBeep();
    } else if (type === "chime") {
      audioSystem.playPlanetInspectionChime();
    }
  };

  return (
    <div id="cosmic-root-shell" className="relative w-screen h-screen overflow-hidden bg-[#030308] text-white">
      {/* 2. Fullscreen WebGL Three.js Engine - MOUNTED ALWAYS to pre-compile WebGL shaders and avoid lag! */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${hasVisitedIntro ? 'opacity-100' : 'opacity-0'}`}>
        <CosmicCanvas
          activePlanetId={activePlanetId}
          isPlayingAudio={isPlayingAudio}
          onPinsUpdate={setPinsCoords}
          onPlanetSelect={handlePlanetSelect}
          orbitSpeedFactor={orbitSpeedFactor}
          resetTrigger={resetTrigger}
        />
      </div>

      {/* 1. Cinematic Entry Screen */}
      {!hasVisitedIntro && (
        <div className="absolute inset-0 z-50">
          <IntroScreen onLaunch={handleLaunch} />
        </div>
      )}

      {/* 3. Glassmorphism HUD Overlay Layer */}
      {hasVisitedIntro && (
        <>
          <CosmicHUD
            activePlanetId={activePlanetId}
            isPlayingAudio={isPlayingAudio}
            pinsCoords={pinsCoords}
            onPlanetSelect={handlePlanetSelect}
            onAudioToggle={handleAudioToggle}
            triggerSoundCue={triggerSoundCue}
            orbitSpeedFactor={orbitSpeedFactor}
            onOrbitSpeedChange={setOrbitSpeedFactor}
            onResetRealtime={handleResetRealtime}
          />

          {/* Subtle Ambient Vignette Lighting Filter (CSS Only) */}
          <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_60%,rgba(3,3,8,0.75)_100%)]" />
        </>
      )}
    </div>
  );
}
