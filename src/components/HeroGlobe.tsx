import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

// Utility function to convert a hex color string to a normalized RGB array
const hexToRgbNormalized = (hex: string): [number, number, number] => {
  let r = 0, g = 0, b = 0;
  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    console.warn(`Invalid hex color: ${hex}. Falling back to black.`);
    return [0, 0, 0];
  }

  return [r / 255, g / 255, b / 255];
};

interface GlobeProps {
  className?: string;
  theta?: number;
  dark?: number;
  scale?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number] | string;
  markerColor?: [number, number, number] | string;
  glowColor?: [number, number, number] | string;
}

const Globe: React.FC<GlobeProps> = ({
  className,
  theta = 0.25,
  dark = 1,
  scale = 1.1,
  diffuse = 1.2,
  mapSamples = 40000,
  mapBrightness = 6,
  baseColor = "#3b82f6", // Blue-500 for land
  markerColor = "#60a5fa", // Blue-400 for markers
  glowColor = "#1e40af", // Blue-800 for glow
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);

  // Refs for interactive rotation and dragging state
  const phiRef = useRef(0);
  const thetaRef = useRef(theta);
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const autoRotateSpeed = 0.0002; // Speed per millisecond (time-based rotation)

  useEffect(() => { 
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;

    // Resolve color props
    const resolvedBaseColor: [number, number, number] =
      typeof baseColor === "string"
        ? hexToRgbNormalized(baseColor)
        : baseColor || [0.4, 0.6509, 1];

    const resolvedMarkerColor: [number, number, number] =
      typeof markerColor === "string"
        ? hexToRgbNormalized(markerColor)
        : markerColor || [1, 0, 0];

    const resolvedGlowColor: [number, number, number] =
      typeof glowColor === "string"
        ? hexToRgbNormalized(glowColor)
        : glowColor || [0.2745, 0.5765, 0.898];

    const initGlobe = () => {
      if (!isMounted || !canvas) return;
      
      // Destroy existing globe instance first
      if (globeRef.current) {
        try {
          (globeRef.current as unknown as () => void)();
        } catch (e) {
          // Ignore cleanup errors
        }
        globeRef.current = null;
      }

      // Get the actual display size of the canvas element
      const rect = canvas.getBoundingClientRect();
      const displaySize = Math.max(rect.width, rect.height) || 400;
      const devicePixelRatio = window.devicePixelRatio || 1;
      const internalWidth = displaySize * devicePixelRatio;
      const internalHeight = displaySize * devicePixelRatio;

      canvas.width = internalWidth;
      canvas.height = internalHeight;

      try {
        globeRef.current = createGlobe(canvas, {
          devicePixelRatio: devicePixelRatio,
          width: internalWidth,
          height: internalHeight,
          phi: phiRef.current,
          theta: thetaRef.current,
          dark: dark,
          scale: scale,
          diffuse: diffuse,
          mapSamples: mapSamples,
          mapBrightness: mapBrightness,
          baseColor: resolvedBaseColor,
          markerColor: resolvedMarkerColor,
          glowColor: resolvedGlowColor,
          opacity: 1,
          offset: [0, 0],
          markers: [],
          onRender: (state: Record<string, number>) => {
            // Time-based rotation for consistent speed regardless of frame rate
            const now = Date.now();
            const deltaTime = now - lastTimeRef.current;
            lastTimeRef.current = now;
            
            if (!isDragging.current) {
              phiRef.current += autoRotateSpeed * deltaTime;
            }
            state.phi = phiRef.current;
            state.theta = thetaRef.current;
          },
        });
      } catch (e) {
        console.error("Failed to initialize globe:", e);
      }
    };

    // Mouse Interaction Handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
      canvas.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastMouseX.current;
        const deltaY = e.clientY - lastMouseY.current;
        const rotationSpeed = 0.005;

        phiRef.current += deltaX * rotationSpeed;
        thetaRef.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, thetaRef.current - deltaY * rotationSpeed)
        );

        lastMouseX.current = e.clientX;
        lastMouseY.current = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      canvas.style.cursor = "grab";
    };

    const onMouseLeave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        canvas.style.cursor = "grab";
      }
    };

    // Small delay to ensure canvas is properly mounted after HMR
    const initTimeout = setTimeout(() => {
      initGlobe();
    }, 100);

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const handleResize = () => {
      initGlobe();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mouseleave", onMouseLeave);
      }
      if (globeRef.current) {
        try {
          (globeRef.current as unknown as () => void)();
        } catch (e) {
          // Ignore cleanup errors during HMR
        }
        globeRef.current = null;
      }
    };
  }, [theta, dark, scale, diffuse, mapSamples, mapBrightness, baseColor, markerColor, glowColor]);

  return (
    <div
      className={cn(
        "flex items-center justify-center z-[10]",
        className
      )}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-[242px] sm:w-[290px] md:w-[330px] lg:w-[362px] xl:w-[410px] 2xl:w-[462px] h-[242px] sm:h-[290px] md:h-[330px] lg:h-[362px] xl:h-[410px] 2xl:h-[462px]"
        style={{
          aspectRatio: "1",
          display: "block",
          cursor: "grab",
        }}
      />
    </div>
  );
};

// Wrapper component with glow effects and floating badges
export default function HeroGlobe() {
  return (
    <div className="relative w-full h-full min-h-[290px] sm:min-h-[330px] md:min-h-[385px] lg:min-h-[420px] xl:min-h-[462px] 2xl:min-h-[520px] flex items-center justify-center overflow-visible">
      {/* Outer glow effects */}
      <div className="absolute w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-64 lg:h-64 xl:w-72 xl:h-72 2xl:w-88 2xl:h-88 bg-blue-600/20 rounded-full blur-[50px] sm:blur-[60px] lg:blur-[70px]" />
      <div className="absolute w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 xl:w-64 xl:h-64 2xl:w-76 2xl:h-76 bg-blue-500/15 rounded-full blur-[40px] sm:blur-[50px] lg:blur-[55px]" />
      
      {/* Outermost orbit ring */}
      <div  
        className="absolute w-[262px] sm:w-[315px] md:w-[362px] lg:w-[400px] xl:w-[440px] 2xl:w-[494px] h-[262px] sm:h-[315px] md:h-[362px] lg:h-[400px] xl:h-[440px] 2xl:h-[494px] rounded-full border border-blue-400/20"
        style={{ animation: 'spin 30s linear infinite reverse' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
      </div>
      
      {/* Second orbit ring */}
      <div 
        className="absolute w-[231px] sm:w-[278px] md:w-[326px] lg:w-[357px] xl:w-[404px] 2xl:w-[452px] h-[231px] sm:h-[278px] md:h-[326px] lg:h-[357px] xl:h-[404px] 2xl:h-[452px] rounded-full border border-blue-500/25"
        style={{ animation: 'spin 20s linear infinite' }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50" />
      </div>
      
      {/* The 3D Globe */}
      <Globe
        dark={1}
        scale={1.0}
        mapSamples={40000}
        mapBrightness={3}
        baseColor="#3b82f6"
        markerColor="#60a5fa"
        glowColor="#1e40af"
      />
      
      {/* Floating data badges */}
      <div 
        className="absolute -top-[5%] right-[5%] sm:-top-[4%] sm:right-[8%] md:-top-[2%] md:right-[10%] lg:-top-[3%] lg:right-[5%] xl:-top-[2%] xl:right-[8%] bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2 shadow-lg animate-float-slow z-20"
      >
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] sm:text-[10px] lg:text-xs text-slate-300">Active Learners</span>
          <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-white">2.4k+</span>
        </div>
      </div>
      
      <div 
        className="absolute bottom-[30%] -left-[5%] sm:bottom-[28%] sm:-left-[2%] md:bottom-[26%] md:-left-[5%] lg:bottom-[28%] lg:-left-[8%] xl:bottom-[26%] xl:-left-[5%] bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2 shadow-lg animate-float-slow z-20"
        style={{ animationDelay: '1s' }}
      >
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[9px] sm:text-[10px] lg:text-xs text-slate-300">Roadmaps</span>
          <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-white">5+</span>
        </div>
      </div>
      
      <div 
        className="absolute bottom-[5%] right-[5%] sm:bottom-[8%] sm:right-[8%] md:bottom-[10%] md:right-[5%] lg:bottom-[8%] lg:right-[2%] xl:bottom-[10%] xl:right-[5%] bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2 shadow-lg animate-float-slow z-20"
        style={{ animationDelay: '2s' }}
      >
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-[9px] sm:text-[10px] lg:text-xs text-slate-300">Job Opportunities</span>
          <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-white">150+</span>
        </div>
      </div>
    </div>
  );
}
