import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  Thermometer, 
  Orbit, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Activity, 
  Info, 
  Compass, 
  Search,
  MessageSquare,
  RefreshCw,
  Sliders,
  X
} from "lucide-react";
import { CELESTIAL_PINS } from "../data/sceneManifest";
import { CelestialPin, CosmicMessage } from "../types";

// ================= ROTATING PLANET PROCEDURAL CANVAS COMPONENT =================
interface RotatingPlanetIconProps {
  id: string;
  color: string;
  isActive: boolean;
}

const RotatingPlanetIcon: React.FC<RotatingPlanetIconProps> = ({ id, color, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      offset += 0.28; // gentle, slow cosmic speed of rotation
      const w = canvas.width;
      const h = canvas.height;
      const r = w / 2 - 6; // planet radius leaving space for rings/glowing halos
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw solar/atmosphere custom visual glow fields
      if (id === "sun") {
        const glow = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r + 5);
        glow.addColorStop(0, "rgba(255, 90, 0, 0.5)");
        glow.addColorStop(0.5, "rgba(255, 170, 0, 0.2)");
        glow.addColorStop(1, "rgba(255, 230, 100, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const glow = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r + 3);
        glow.addColorStop(0, `${color}38`);
        glow.addColorStop(1, `${color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // We clip the rendering path inside the planet sphere boundary for perfect texture wrapping
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // 2. Base surface ambient lighting map
      const baseGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r);
      if (id === "sun") {
        baseGrad.addColorStop(0, "#fffae8");
        baseGrad.addColorStop(0.3, "#ffa812");
        baseGrad.addColorStop(1, "#cd3700");
      } else if (id === "mercury") {
        baseGrad.addColorStop(0, "#d2d2d0");
        baseGrad.addColorStop(0.6, "#7c7c79");
        baseGrad.addColorStop(1, "#363635");
      } else if (id === "venus") {
        baseGrad.addColorStop(0, "#fff5cf");
        baseGrad.addColorStop(0.5, "#db9b39");
        baseGrad.addColorStop(1, "#753909");
      } else if (id === "earth") {
        baseGrad.addColorStop(0, "#aef2ff");
        baseGrad.addColorStop(0.4, "#2a7ee6");
        baseGrad.addColorStop(1, "#071c45");
      } else if (id === "mars") {
        baseGrad.addColorStop(0, "#ffa893");
        baseGrad.addColorStop(0.5, "#bf4e22");
        baseGrad.addColorStop(1, "#4f1101");
      } else if (id === "jupiter") {
        baseGrad.addColorStop(0, "#ffd0a3");
        baseGrad.addColorStop(0.5, "#ba6d2f");
        baseGrad.addColorStop(1, "#542407");
      } else if (id === "saturn") {
        baseGrad.addColorStop(0, "#ffeba0");
        baseGrad.addColorStop(0.6, "#c49658");
        baseGrad.addColorStop(1, "#573216");
      } else if (id === "uranus") {
        baseGrad.addColorStop(0, "#ebfeff");
        baseGrad.addColorStop(0.5, "#6bc1cb");
        baseGrad.addColorStop(1, "#144e55");
      } else if (id === "neptune") {
        baseGrad.addColorStop(0, "#a8d6ff");
        baseGrad.addColorStop(0.5, "#2259cc");
        baseGrad.addColorStop(1, "#041442");
      }
      ctx.fillStyle = baseGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // 3. Draw rotating organic surface features & atmospheric clouds
      const tX = (offset % (r * 4)) - r * 2; // wrap around textures

      if (id === "sun") {
        // Solar activity zones
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.beginPath();
        ctx.ellipse(cx - tX, cy - 2, r * 0.25, r * 0.1, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - tX + r * 2, cy + 4, r * 0.18, r * 0.08, 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else if (id === "earth") {
        // Continental landmasses
        ctx.fillStyle = "#3b8c34";
        const drawLand = (ox: number) => {
          ctx.beginPath();
          ctx.ellipse(cx + ox - r * 0.3, cy - r * 0.25, r * 0.45, r * 0.35, 0.2, 0, Math.PI * 2);
          ctx.ellipse(cx + ox + r * 0.6, cy + r * 0.15, r * 0.55, r * 0.4, -0.15, 0, Math.PI * 2);
          ctx.ellipse(cx + ox - r * 0.55, cy + r * 0.4, r * 0.25, r * 0.35, 0.1, 0, Math.PI * 2);
          ctx.fill();
        };
        drawLand(tX);
        drawLand(tX - r * 2.8);
        drawLand(tX + r * 2.8);

        // High weather clouds
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        const drawClouds = (oc: number) => {
          ctx.beginPath();
          ctx.ellipse(cx + oc - r * 0.1, cy - r * 0.4, r * 0.7, r * 0.14, -0.05, 0, Math.PI * 2);
          ctx.ellipse(cx + oc + r * 0.5, cy + r * 0.3, r * 0.65, r * 0.12, 0.1, 0, Math.PI * 2);
          ctx.fill();
        };
        drawClouds(tX * 1.35);
        drawClouds(tX * 1.35 - r * 2.8);
        drawClouds(tX * 1.35 + r * 2.8);
      } else if (id === "mercury") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        for (let j = -2; j <= 2; j++) {
          const modX = (tX * 0.9 + j * r * 0.95) % (r * 3.2);
          ctx.beginPath();
          ctx.arc(cx + modX - r * 1.4, cy + j * r * 0.3, r * 0.16, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (id === "venus") {
        ctx.fillStyle = "rgba(255, 240, 190, 0.28)";
        ctx.fillRect(cx - r, cy - r * 0.4 + Math.sin(offset * 0.08) * 1, r * 2, r * 0.2);
        ctx.fillRect(cx - r, cy + r * 0.25 + Math.cos(offset * 0.06) * 1, r * 2, r * 0.18);
      } else if (id === "mars") {
        // Red-rust continents
        ctx.fillStyle = "rgba(92, 23, 1, 0.42)";
        const drawMarsFields = (ox: number) => {
          ctx.beginPath();
          ctx.ellipse(cx + ox - r * 0.35, cy + r * 0.15, r * 0.42, r * 0.3, 0.1, 0, Math.PI * 2);
          ctx.ellipse(cx + ox + r * 0.55, cy - r * 0.2, r * 0.38, r * 0.25, -0.1, 0, Math.PI * 2);
          ctx.fill();
        };
        drawMarsFields(tX);
        drawMarsFields(tX - r * 2.8);
        drawMarsFields(tX + r * 2.8);

        // North pole ice cap
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.beginPath();
        ctx.arc(cx, cy - r, r * 0.32, 0, Math.PI);
        ctx.fill();
      } else if (id === "jupiter") {
        // Striated gas belts
        ctx.fillStyle = "rgba(130, 48, 8, 0.48)";
        ctx.fillRect(cx - r, cy - r * 0.48, r * 2, r * 0.15);
        ctx.fillRect(cx - r, cy + r * 0.12, r * 2, r * 0.18);

        // Great Red Spot
        ctx.fillStyle = "#de2c2c";
        const spotX = cx + ((tX * 1.1 + r * 0.4) % (r * 2.4)) - r * 1.2;
        ctx.beginPath();
        ctx.ellipse(spotX, cy + r * 0.22, r * 0.32, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (id === "saturn") {
        ctx.fillStyle = "rgba(100, 72, 35, 0.38)";
        ctx.fillRect(cx - r, cy - r * 0.25, r * 2, r * 0.12);
        ctx.fillRect(cx - r, cy + r * 0.28, r * 2, r * 0.1);
      } else if (id === "neptune") {
        ctx.fillStyle = "rgba(10, 25, 115, 0.45)";
        ctx.fillRect(cx - r, cy - r * 0.35, r * 2, r * 0.16);
        ctx.fillRect(cx - r, cy + r * 0.22, r * 2, r * 0.14);

        // Great Dark Spot
        ctx.fillStyle = "rgba(2, 6, 42, 0.85)";
        const dsX = cx + ((tX * 1.1) % (r * 2.6)) - r * 1.3;
        ctx.beginPath();
        ctx.ellipse(dsX, cy - r * 0.1, r * 0.28, r * 0.15, -0.08, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 4. Back rings of Saturn (under planet layers) aren't drawn separately but front ring is beautiful:
      if (id === "saturn") {
        ctx.strokeStyle = "rgba(224, 185, 115, 0.82)";
        ctx.lineWidth = 3.6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.6, r * 0.4, -Math.PI / 11, 0, Math.PI);
        ctx.stroke();

        ctx.strokeStyle = "rgba(242, 212, 162, 0.42)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.82, r * 0.46, -Math.PI / 11, 0, Math.PI);
        ctx.stroke();
      }

      // 5. Glossy 3D spherical light model overlay (key and fill lighting shadows)
      const shine = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
      shine.addColorStop(0, "rgba(255, 255, 255, 0.42)");
      shine.addColorStop(0.35, "rgba(255, 255, 255, 0.05)");
      shine.addColorStop(1, "rgba(0, 0, 0, 0.65)");
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [id, color]);

  return (
    <div className={`relative flex items-center justify-center transition-all duration-300 ${isActive ? "scale-105" : "hover:scale-110"}`}>
      <canvas 
        ref={canvasRef} 
        width={48} 
        height={48} 
        className={`w-12 h-12 object-contain transition-all duration-500 ${
          isActive 
            ? "drop-shadow-[0_0_12px_rgba(34,211,238,0.85)]" 
            : "opacity-80 hover:opacity-100"
        }`} 
      />
    </div>
  );
};

interface CosmicHUDProps {
  activePlanetId: string;
  isPlayingAudio: boolean;
  pinsCoords: Record<string, { x: number; y: number; visible: boolean }>;
  onPlanetSelect: (id: string) => void;
  onAudioToggle: () => void;
  triggerSoundCue: (type: "beep" | "chime" | "hum") => void;
  orbitSpeedFactor: number;
  onOrbitSpeedChange: (speed: number) => void;
  onResetRealtime: () => void;
}

export const CosmicHUD: React.FC<CosmicHUDProps> = ({
  activePlanetId,
  isPlayingAudio,
  pinsCoords,
  onPlanetSelect,
  onAudioToggle,
  triggerSoundCue,
  orbitSpeedFactor,
  onOrbitSpeedChange,
  onResetRealtime
}) => {
  const activePlanet = CELESTIAL_PINS.find((p) => p.id === activePlanetId) || CELESTIAL_PINS[0];

  const [aiInput, setAiInput] = useState("");
  const [messages, setMessages] = useState<CosmicMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set initial greeting on planet change
  useEffect(() => {
    const greeting: CosmicMessage = {
      sender: "cosmic-ai",
      text: `Scanning coordinate matrix for **${activePlanet.name}**... Data packet initialized. I am ready to recount its structural mysteries. Ask me anything, or run orbital scans.`,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages([greeting]);
  }, [activePlanetId]);

  // Autoscroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiLoading]);

  // Call server-side Gemini API
  const handleAskCoreAI = async (questionText?: string) => {
    const prompt = questionText || aiInput;
    if (!prompt.trim() || isAiLoading) return;

    triggerSoundCue("beep");

    const userMsg: CosmicMessage = {
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/gemini/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planet: activePlanet.name,
          customQuestion: prompt
        })
      });

      const data = await response.json();
      const botMsg: CosmicMessage = {
        sender: "cosmic-ai",
        text: data.text || "Cosmic frequency disconnected. No data stream received.",
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, botMsg]);
      triggerSoundCue("chime");
    } catch (err) {
      console.error("AI fetch failed:", err);
      const errMsg: CosmicMessage = {
        sender: "cosmic-ai",
        text: `Unable to project quantum signal. Offline backups indicate ${activePlanet.name} is classified as ${activePlanet.tagline}. Error in sync telemetry.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const predefinedPrompts = [
    { label: "Scan Core Composition", text: "Explain the elemental and core structural composition of this world." },
    { label: "Analyse Extreme Weather", text: "What are the atmospheric anomalies, extreme wind systems, or temperature variations here?" },
    { label: "Investigate Gravitational Field", text: "Discuss the gravitational pull, electromagnetic tides, and orbital anomalies surrounding this celestial object." }
  ];

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-6 pointer-events-none select-none font-sans text-gray-150">
      
      {/* ================= HEADER SECTION ================= */}
      <header className="flex items-start justify-between w-full pointer-events-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            <h1 className="text-xl md:text-2xl font-black tracking-widest text-white uppercase font-mono bg-clip-text">
              SUDHEER <span className="text-cyan-400 font-light font-sans">— THE COSMIC ARCHIVE</span>
            </h1>
          </div>
          <p className="text-[10px] md:text-xs tracking-widest text-[#6f7f98] font-mono uppercase">
            Quantized Observatory Terminal v4.12 // 2026-05-26
          </p>
        </div>

        {/* Floating Utilities */}
        <div className="flex items-center gap-3 bg-[#0d1017]/85 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-lg shadow-2xl">
          <button 
            onClick={() => {
              triggerSoundCue("beep");
              onAudioToggle();
            }}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#a1b3cf] hover:text-cyan-400 cursor-pointer transition-colors animate-pulse"
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline text-cyan-400">Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-gray-500" />
                <span className="hidden sm:inline">Sound Muted</span>
              </>
            )}
          </button>
          <div className="w-[1px] h-4 bg-white/10" />
          <button 
            onClick={() => {
              triggerSoundCue("beep");
              onOrbitSpeedChange(orbitSpeedFactor === 0 ? 1.0 : 0);
            }}
            className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-2.5 py-1.5 rounded-md cursor-pointer transition-all border ${
              orbitSpeedFactor === 0 
                ? "text-red-400 bg-red-950/20 border-red-500/30" 
                : "text-cyan-400 bg-cyan-950/30 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)] font-semibold text-shadow"
            }`}
            title={orbitSpeedFactor === 0 ? "Resume orbits" : "Pause speed of orbits"}
          >
            <Orbit className={`w-4 h-4 ${orbitSpeedFactor > 0 ? "animate-spin text-cyan-400" : "text-gray-500"}`} style={{ animationDuration: orbitSpeedFactor > 0 ? `${4 / orbitSpeedFactor}s` : undefined }} />
            <span className="hidden sm:inline text-[10px] tracking-wider font-semibold uppercase">
              {orbitSpeedFactor === 0 ? "Simulation Paused" : `Orbits: ${orbitSpeedFactor}x`}
            </span>
          </button>
          <div className="w-[1px] h-4 bg-white/10" />
          <button 
            onClick={() => {
              triggerSoundCue("chime");
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className={`p-1.5 rounded transition-colors cursor-pointer ${isSidebarOpen ? "text-cyan-400 bg-cyan-950/30 border border-cyan-800/30" : "text-[#a1b3cf] hover:text-cyan-400 hover:bg-white/5"}`}
            title="Toggle Infographics Pane"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-white/10" />
          <button 
            onClick={() => {
              triggerSoundCue("chime");
              setIsAiPanelOpen(!isAiPanelOpen);
            }}
            className={`p-1.5 rounded transition-colors cursor-pointer ${isAiPanelOpen ? "text-cyan-400 bg-cyan-950/30 border border-cyan-800/30" : "text-[#a1b3cf] hover:text-cyan-400 hover:bg-white/5"}`}
            title="Toggle Cosmic AI Advisor"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </header>


      {/* ================= DYNAMIC 3D ACTION PINS (CANVAS-PROJECTED) ================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        {CELESTIAL_PINS.map((pin) => {
          const coord = pinsCoords[pin.id];
          if (!coord || !coord.visible) return null;

          // Don't show pin text if it's too close to the screen boundaries
          if (coord.x < 5 || coord.x > 95 || coord.y < 5 || coord.y > 95) return null;

          const isCurrent = pin.id === activePlanetId;

          return (
            <div 
              key={pin.id}
              className="absolute pointer-events-auto group -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300"
              style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              onClick={() => {
                triggerSoundCue("chime");
                onPlanetSelect(pin.id);
              }}
            >
              {/* Pulsing targeting Reticle */}
              <div className="relative flex items-center justify-center">
                <div 
                  className={`absolute w-8 h-8 rounded-full border-2 transition-all duration-500 group-hover:scale-125
                    ${isCurrent ? "border-cyan-400 scale-110" : "border-white/20 group-hover:border-white/50"}`} 
                  style={{ borderColor: isCurrent ? pin.color : undefined }}
                />
                <div 
                  className={`w-2.5 h-2.5 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-130
                    ${isCurrent ? "scale-110" : "bg-white/60"}`}
                  style={{ backgroundColor: pin.color }}
                />
                
                {/* Projected Line Bracket */}
                <div className="absolute left-6 h-[1px] w-8 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                {/* Info Card Tooltip */}
                <div className={`absolute left-14 flex flex-col bg-[#080b11]/90 backdrop-blur-lg border text-left p-3 rounded-lg shadow-2xl min-w-[200px] pointer-events-none transition-all duration-300 opacity-0 -translate-x-4
                  ${isCurrent ? "opacity-100 translate-x-0 border-cyan-500/30" : "group-hover:opacity-100 group-hover:translate-x-0 border-white/10"}`}>
                  <span className="text-[9px] font-mono text-cyan-400 tracking-wider uppercase">{pin.subtitle}</span>
                  <span className="text-sm font-bold text-white tracking-wide">{pin.name}</span>
                  <span className="text-[10px] text-[#6a7d97] italic mt-0.5">{pin.tagline}</span>
                  
                  {isCurrent && (
                    <div className="flex items-center gap-1.5 text-[9px] text-[#1cd1c9] mt-2 font-mono uppercase bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/30 w-fit">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                      Active Probe Focus
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {/* ================= MIDDLE WORKSPACE LAYOUT ================= */}
      <main className="flex-1 flex flex-col md:flex-row justify-between items-stretch gap-6 my-4 md:my-6 pointer-events-none min-h-0">
        
        {/* LEFT PANEL: PLANETARY INFOGRAPHIC & SCIENTIFIC STATS SHEET */}
        {isSidebarOpen ? (
          <section className="w-full md:w-[350px] bg-[#070a0f]/80 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col justify-between pointer-events-auto transition-all duration-300 overflow-y-auto max-h-[75vh] md:max-h-none relative">
            <div className="flex flex-col gap-4">
              {/* Category Breadcrumbs with Close Button Overlay */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5c6e8e] tracking-widest uppercase">
                  <span>Sol Grid</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-cyan-400">{activePlanet.subtitle}</span>
                </div>
                <button
                  onClick={() => {
                    triggerSoundCue("beep");
                    setIsSidebarOpen(false);
                  }}
                  className="p-1 text-gray-500 hover:text-cyan-400 hover:bg-white/5 rounded cursor-pointer transition-colors"
                  title="Remove metrics panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title Header */}
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-3xl font-black text-white tracking-wide uppercase font-sans">
                  {activePlanet.name}
                </h2>
                <p className="text-xs text-cyan-300 font-mono tracking-widest uppercase mt-1">
                  {activePlanet.tagline}
                </p>
              </div>

              {/* Description bio */}
              <p className="text-xs leading-relaxed text-[#9ab0cd]">
                {activePlanet.description}
              </p>

              {/* Scientific telemetry statistics table */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between border-b border-white/5 py-1.5 text-xs">
                  <div className="flex items-center gap-2 text-[#687e9e] font-mono">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Equatorial Dia.</span>
                  </div>
                  <span className="text-white font-mono font-medium">{activePlanet.stats.diameter}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1.5 text-xs">
                  <div className="flex items-center gap-2 text-[#687e9e] font-mono">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>Mean Temp.</span>
                  </div>
                  <span className="text-white font-mono font-medium">{activePlanet.stats.temperature}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1.5 text-xs">
                  <div className="flex items-center gap-2 text-[#687e9e] font-mono">
                    <Orbit className="w-3.5 h-3.5" />
                    <span>Orbital Period</span>
                  </div>
                  <span className="text-white font-mono font-medium">{activePlanet.stats.orbitPeriod}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1.5 text-xs">
                  <div className="flex items-center gap-2 text-[#687e9e] font-mono">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Escape Gravity</span>
                  </div>
                  <span className="text-white font-mono font-medium">{activePlanet.stats.gravity}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1.5 text-xs">
                  <div className="flex items-center gap-2 text-[#687e9e] font-mono">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Mass Weight</span>
                  </div>
                  <span className="text-white font-mono font-medium">{activePlanet.stats.mass}</span>
                </div>
              </div>
            </div>

            {/* Quantum Orbit Speed Controls (Time-Dilation style widget) */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[#5d6f8f] uppercase">
                  Quantum Orbit Speed (Time-Dilation)
                </span>
                <span className="text-[9px] font-semibold text-cyan-400 font-mono">
                  {orbitSpeedFactor === 1.0 ? "REAL-TIME" : `${orbitSpeedFactor}x`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {([
                  { label: "PAUSE", factor: 0.0 },
                  { label: "0.5x", factor: 0.5 },
                  { label: "1.0x", factor: 1.0 },
                  { label: "3.5x", factor: 3.5 },
                  { label: "10x", factor: 10.0 }
                ] as const).map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      triggerSoundCue("beep");
                      onOrbitSpeedChange(item.factor);
                    }}
                    className={`text-[9px] font-mono uppercase py-1.5 rounded border cursor-pointer transition-all duration-300
                      ${orbitSpeedFactor === item.factor 
                        ? "bg-cyan-500/25 border-cyan-400/80 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)] font-bold animate-pulse" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Reset to Real-time & Calibrated Baseline layout with indicator info */}
              <button
                onClick={() => {
                  triggerSoundCue("chime");
                  onResetRealtime();
                }}
                className="mt-2.5 w-full flex items-center justify-center gap-2 text-[9px] font-mono font-bold uppercase tracking-widest py-2 rounded-md border border-cyan-500/35 text-cyan-300 bg-cyan-950/25 hover:bg-cyan-900/35 hover:scale-[1.01] hover:text-white hover:border-cyan-400/80 transition-all duration-300 cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.1)] active:scale-[0.98]"
                title="Reset simulation to real-time (1.0x) and snap planets to calibrated start alignment positions"
              >
                <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: "12s" }} />
                <span>Reset to Real-time</span>
              </button>
            </div>
          </section>
        ) : (
          <div className="hidden md:block w-0" />
        )}

        {/* RIGHT PANEL: GEMINI "COSMIC AI GUIDE" PANEL */}
        {isAiPanelOpen ? (
          <section className="w-full md:w-[380px] bg-[#070a0f]/80 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col justify-between pointer-events-auto h-[480px] md:h-auto overflow-hidden self-end md:self-stretch relative">
            
            {/* Header with Close option */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 h-fit w-fit bg-cyan-950/40 border border-cyan-800/30 rounded">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                    COSMIC AI GUIDE
                  </h3>
                  <p className="text-[9px] text-[#5b6e8a] font-mono uppercase">
                    Model: GEMINI-3.5-FLASH // LIVE SPECTRUM
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
                <button
                  type="button"
                  onClick={() => {
                    triggerSoundCue("beep");
                    setIsAiPanelOpen(false);
                  }}
                  className="p-1 text-gray-500 hover:text-cyan-400 hover:bg-white/5 rounded cursor-pointer transition-colors"
                  title="Remove AI panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Flow Area */}
            <div className="flex-1 overflow-y-auto mb-4 border border-white/5 rounded-lg p-3 bg-black/35 flex flex-col gap-3 min-h-0">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}
                >
                  <div 
                    className={`text-[11px] p-2.5 rounded-lg leading-relaxed text-[#c3d5ef] shadow-inner
                      ${msg.sender === "user" 
                        ? "bg-cyan-950/40 border border-cyan-800/50 rounded-tr-none text-right" 
                        : "bg-white/5 border border-white/5 rounded-tl-none text-left"}`}
                  >
                    {msg.text.split("\n\n").map((para, pIdx) => (
                      <p key={pIdx} className="mb-1 last:mb-0">
                        {para.replace(/\*\*(.*?)\*\*/g, "$1")}
                      </p>
                    ))}
                  </div>
                  <span className="text-[8px] text-[#4d5c75] font-mono">{msg.timestamp}</span>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-2 self-start bg-white/5 border border-white/5 p-2.5 rounded-lg rounded-tl-none animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Interstellar Uplink Syncing...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick analysis suggestions */}
            <div className="flex flex-col gap-1 mb-3">
              <span className="text-[8.5px] font-mono tracking-widest text-[#546886] uppercase">Analyse Coordinates:</span>
              <div className="flex flex-wrap gap-1">
                {predefinedPrompts.map((p, i) => (
                  <button
                    key={i}
                    disabled={isAiLoading}
                    onClick={() => handleAskCoreAI(p.text)}
                    className="text-[9px] text-[#819abf] bg-white/5 hover:bg-cyan-950/30 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/20 px-2 py-1 rounded cursor-pointer transition-all duration-300"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAskCoreAI();
              }}
              className="flex gap-2 font-mono"
            >
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                disabled={isAiLoading}
                placeholder={`Query Cosmic AI about ${activePlanet.name}...`}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-white placeholder-gray-600 font-sans"
              />
              <button
                type="submit"
                disabled={isAiLoading}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black px-3.5 rounded-lg shadow-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </form>
          </section>
        ) : (
          <div className="hidden md:block w-0" />
        )}
      </main>


      {/* ================= FOOTER DOCK NAVIGATION ================= */}
      <footer className="w-full relative flex items-center justify-center pointer-events-auto border-t border-white/10 pt-4 pb-4 px-4 bg-[#070a0f]/50 backdrop-blur-lg">
        {/* Playback beat ticker telemetry */}
        <div className="hidden lg:flex absolute top-[-30px] left-4 items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="text-[#92a5c4] uppercase tracking-wider">Sector Arc:</span>
            <span className="text-white font-medium">COSMIC_ARCHIVE_SEC_{activePlanetId.toUpperCase()}</span>
          </div>
        </div>

        {/* Scroll Celestial selection carousel */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto w-full max-w-7xl mx-auto scrollbar-none">
          {CELESTIAL_PINS.map((pin) => {
            const isCurrent = pin.id === activePlanetId;
            return (
              <button
                key={pin.id}
                onClick={() => {
                  triggerSoundCue("beep");
                  onPlanetSelect(pin.id);
                }}
                className={`relative flex flex-col items-center justify-center flex-1 gap-1.5 p-2 rounded-xl border transition-all duration-300 cursor-pointer min-w-[76px] max-w-[120px] group
                  ${isCurrent 
                    ? "bg-cyan-950/40 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110 z-10" 
                    : "bg-black/35 border-white/5 text-gray-400 hover:bg-white/5 hover:border-cyan-500/30 hover:text-white hover:-translate-y-1 hover:scale-105 hover:shadow-[0_5px_15px_rgba(34,211,238,0.15)]"}`}
              >
                {/* Stunning slowly rotating 3D-like procedural planet element */}
                <RotatingPlanetIcon id={pin.id} color={pin.color} isActive={isCurrent} />
                
                <span className={`text-[9px] font-mono tracking-wider uppercase transition-colors duration-300 ${isCurrent ? "text-cyan-400 font-bold" : "text-[#a2b5cf] hover:text-cyan-300"}`}>
                  {pin.name}
                </span>
                
                {isCurrent && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-cyan-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
