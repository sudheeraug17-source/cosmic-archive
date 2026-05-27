import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { audioSystem } from "../utils/audioSystem";

interface IntroScreenProps {
  onLaunch: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onLaunch }) => {
  const [percent, setPercent] = useState(0);
  const [statusText, setStatusText] = useState("Initializing Core Quantum Files...");
  const [complete, setComplete] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isLaunchingRef = useRef(false);

  useEffect(() => {
    isLaunchingRef.current = isLaunching;
  }, [isLaunching]);

  // Elegant screen intro transition-in fade
  useEffect(() => {
    const t = setTimeout(() => {
      setIsReady(true);
    }, 120);
    return () => clearTimeout(t);
  }, []);

  // Loading bar animation
  useEffect(() => {
    const texts = [
      "Securing orbital coordinates...",
      "Mapping Solaris accretion flares...",
      "Connecting Gemini context arrays...",
      "Synthesizing ambient WebGL shards...",
      "Initializing creator telemetry: SUDHEER...",
      "Quantum Archive System: ENGAGED"
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setComplete(true);
          return 100;
        }
        
        // Progress text transitions
        const step = Math.floor(Math.random() * 8) + 4;
        const nextPercent = Math.min(prev + step, 100);

        if (nextPercent > (currentIdx + 1) * (100 / texts.length) && currentIdx < texts.length - 1) {
          currentIdx++;
          setStatusText(texts[currentIdx]);
        }

        return nextPercent;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Procedural 2D rotating galaxy background in loader
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Array<{ x: number; y: number; r: number; color: string; speed: number; angle: number; dist: number }> = [];
    const pCount = 200;

    // Build spiral galaxy branches
    for (let i = 0; i < pCount; i++) {
      const arm = i % 2 === 0 ? 0 : Math.PI; // Two main branches
      const dist = Math.random() * 320 + 30;
      const angle = arm + (dist * 0.015) + (Math.random() - 0.5) * 0.35;
      
      particles.push({
        x: 0,
        y: 0,
        r: Math.random() * 1.8 + 0.5,
        color: i % 3 === 0 ? "rgba(34, 211, 238, 0.7)" : i % 3 === 1 ? "rgba(255, 130, 0, 0.65)" : "rgba(255, 255, 255, 0.8)",
        speed: 0.001 + (1 / dist) * 0.15,
        angle: angle,
        dist: dist
      });
    }

    const render = () => {
      // Create deep cinematic screen trail blend during hyperspace warp speed
      ctx.fillStyle = isLaunchingRef.current ? "rgba(3, 3, 8, 0.45)" : "rgba(3, 3, 8, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centX = canvas.width / 2;
      const centY = canvas.height / 2;

      // Draw galactic core glow backplate (dilated during launch)
      const coreLightRadius = isLaunchingRef.current ? 480 : 200;
      const coreGrad = ctx.createRadialGradient(centX, centY, 0, centX, centY, coreLightRadius);
      coreGrad.addColorStop(0, isLaunchingRef.current ? "rgba(255, 130, 0, 0.35)" : "rgba(255, 130, 0, 0.08)");
      coreGrad.addColorStop(0.5, isLaunchingRef.current ? "rgba(34, 211, 238, 0.12)" : "rgba(34, 211, 238, 0.03)");
      coreGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render star clusters with linear velocity stretch calculations on engagement
      particles.forEach((p) => {
        if (isLaunchingRef.current) {
          p.speed = p.speed * 1.05 + 0.0012; // Exponential angular acceleration
          p.dist = p.dist * 1.045 + 0.5;      // Exponential radial explosion
          p.r = Math.min(p.r + 0.045, 4.5);   // Enlarge slightly to look like solar dust streaks
        } else {
          p.angle += p.speed;
        }

        p.x = centX + Math.cos(p.angle) * p.dist;
        p.y = centY + Math.sin(p.angle) * p.dist;

        if (isLaunchingRef.current) {
          // Draw high-velocity motion vectors (streaks)
          const prevX = centX + Math.cos(p.angle - p.speed * 1.8) * (p.dist * 0.95);
          const prevY = centY + Math.sin(p.angle - p.speed * 1.8) * (p.dist * 0.95);
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.r * 1.25;
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          // Draw standard rotating ambient star body
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div 
      id="intro-loader-backdrop" 
      className={`absolute inset-0 bg-[#030308] flex items-center justify-center z-50 overflow-hidden font-sans select-none transition-all duration-[1500ms] ease-in-out ${
        isLaunching ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Dynamic rotating galaxy Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover opacity-80" />

      {/* Floating Hologram Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,16,24,0)_30%,rgba(13,16,24,0.9)_100%)] w-full h-full" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,35,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,35,0.05)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Narrative Card Module - div:nth-of-type(3) - fully controlled with custom cinematic entry & exit transitions */}
      <div 
        className={`relative text-center p-8 max-w-xl flex flex-col items-center transition-all duration-[1400ms] cubic-bezier(0.16, 1, 0.3, 1) ${
          !isReady 
            ? "opacity-0 scale-95 translate-y-6 blur-md" 
            : isLaunching 
              ? "opacity-0 scale-110 blur-2xl -translate-y-4 pointer-events-none" 
              : "opacity-100 scale-100 blur-0 translate-y-0"
        }`}
      >
        
        {/* Animated Badge */}
        <div className="flex items-center gap-2 border border-cyan-500/25 bg-cyan-950/20 px-4 py-1.5 rounded-full mb-8 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400 font-bold">
            STELLAR OBSERVATORY GRID ACTIVE
          </span>
        </div>

        {/* Creator Identity with metallic sheen typography */}
        <h1 className="text-6xl md:text-8xl font-black tracking-[0.28em] uppercase font-mono relative leading-none bg-gradient-to-r from-white via-[#ffca3b] to-cyan-300 bg-clip-text text-transparent filter drop-shadow-[0_2px_20px_rgba(34,211,238,0.25)] select-text">
          SUDHEER
        </h1>

        <h2 className="text-sm md:text-md tracking-[0.65em] text-gray-400 font-light uppercase mt-4">
          THE COSMIC ARCHIVE
        </h2>
        <p className="text-[10px] md:text-xs tracking-[0.25em] text-cyan-400/80 uppercase mt-2 font-mono">
          Explore The Infinite
        </p>

        {/* Loading details section */}
        <div className="w-64 mt-12 flex flex-col items-center">
          <div className="flex justify-between w-full text-[9px] font-mono tracking-widest text-cyan-500/80 mb-2 uppercase min-h-[14px]">
            <span>{statusText}</span>
            <span>{percent}%</span>
          </div>
          
          <div className="w-full h-[5px] bg-white/5 border border-white/10 rounded-full overflow-hidden p-[1px] relative animate-scan-glow">
            {/* High-frequency animated diagonal scanner overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent w-full h-full -skew-x-12 animate-laser-sheen" />
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(34,211,238,0.9)] relative"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Interactive Core Engage sync CTA */}
          {complete && (
            <button
              onClick={() => {
                if (isLaunching) return;
                setIsLaunching(true);
                audioSystem.init();
                audioSystem.playCinematicStartupSwell();
                setTimeout(() => {
                  onLaunch();
                }, 1500); // perfectly aligned with synth swell climax and backdrop fade-out timelines
              }}
              id="btn-engage-archive"
              className="mt-8 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-amber-500 text-black hover:from-cyan-400 hover:to-amber-400 text-xs font-mono font-bold uppercase tracking-widest rounded-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(34,211,238,0.45)] w-full max-w-sm"
            >
              ENGAGE COSMIC ARCHIVE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
