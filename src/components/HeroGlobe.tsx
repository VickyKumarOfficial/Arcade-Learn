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

      // Use larger canvas to accommodate glow effect (36rem = 576px)
      // The globe sphere will be scaled down to fit nicely within this canvas
      const fixedSize = 576; // 36rem in pixels - larger to prevent glow cutoff
      const devicePixelRatio = window.devicePixelRatio || 1;
      const internalWidth = fixedSize * devicePixelRatio;
      const internalHeight = fixedSize * devicePixelRatio;

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
        width: "auto",
        height: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "36rem",
          height: "36rem",
          maxWidth: "100%",
          maxHeight: "100%",
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
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px] flex items-center justify-center">
      {/* Outer glow effects */}
      <div className="absolute w-80 h-80 lg:w-100 lg:h-100 bg-blue-600/20 rounded-full blur-[80px]" />
      <div className="absolute w-64 h-64 lg:w-80 lg:h-80 bg-blue-500/15 rounded-full blur-[60px]" />
      
      {/* Outermost orbit ring */}
      <div  
        className="absolute w-[33rem] h-[33rem] rounded-full border border-blue-400/20"
        style={{ animation: 'spin 30s linear infinite reverse' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
      </div>
      
      {/* Second orbit ring */}
      <div 
        className="absolute w-[31rem] h-[31rem] rounded-full border border-blue-500/25"
        style={{ animation: 'spin 20s linear infinite' }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50" />
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
        className="absolute top-[5%] right-[5%] bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2 shadow-lg animate-float-slow"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-300">Active Learners</span>
          <span className="text-sm font-semibold text-white">2.4k+</span>
        </div>
      </div>
      
      <div 
        className="absolute bottom-[20%] left-[-7%] bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2 shadow-lg animate-float-slow"
        style={{ animationDelay: '1s' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-300">Roadmaps</span>
          <span className="text-sm font-semibold text-white">5+</span>
        </div>
      </div>
      
      <div 
        className="absolute bottom-[5%] right-[0%] bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2 shadow-lg animate-float-slow"
        style={{ animationDelay: '2s' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-300">Job Opportunities</span>
          <span className="text-sm font-semibold text-white">150+</span>
        </div>
      </div>
    </div>
  );
}
