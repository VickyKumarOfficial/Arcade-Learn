import React, { Component, ErrorInfo, ReactNode, useState, useEffect, useRef, useMemo } from "react";
import { World } from "@/components/ui/globe";
import { motion } from "framer-motion";

// Error boundary to prevent globe crashes from breaking the page
class GlobeErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Globe rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-slate-500">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-3xl">🌍</span>
            </div>
            <p className="text-sm">Globe visualization unavailable</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const globeConfig = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: false,
  atmosphereColor: "#000000",
  atmosphereAltitude: 0,
  emissive: "#062056",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255, 1)",
  ambientLight: "#38bdf8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

const colors = ["#06b6d4", "#3b82f6", "#6366f1"];

// Pre-compute arc colors at module level (no random per-render)
const pickColor = (index: number) => colors[index % colors.length];

// Reduced from 39 arcs to 18 — visually identical at globe scale but halves geometry work
const sampleArcs = [
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.1, color: pickColor(0) },
  { order: 1, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2, color: pickColor(1) },
  { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2, color: pickColor(2) },
  { order: 2, startLat: 51.5072, startLng: -0.1276, endLat: 3.139, endLng: 101.6869, arcAlt: 0.3, color: pickColor(0) },
  { order: 3, startLat: -33.8688, startLng: 151.2093, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3, color: pickColor(1) },
  { order: 3, startLat: 21.3099, startLng: -157.8581, endLat: 40.7128, endLng: -74.006, arcAlt: 0.3, color: pickColor(2) },
  { order: 4, startLat: 11.986597, startLng: 8.571831, endLat: -15.595412, endLng: -56.05918, arcAlt: 0.5, color: pickColor(0) },
  { order: 4, startLat: -34.6037, startLng: -58.3816, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.7, color: pickColor(1) },
  { order: 5, startLat: 14.5995, startLng: 120.9842, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: pickColor(2) },
  { order: 5, startLat: 34.0522, startLng: -118.2437, endLat: 48.8566, endLng: -2.3522, arcAlt: 0.2, color: pickColor(0) },
  { order: 6, startLat: -15.432563, startLng: 28.315853, endLat: 1.094136, endLng: -63.34546, arcAlt: 0.7, color: pickColor(1) },
  { order: 6, startLat: 22.3193, startLng: 114.1694, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: pickColor(2) },
  { order: 7, startLat: 48.8566, startLng: -2.3522, endLat: 52.52, endLng: 13.405, arcAlt: 0.1, color: pickColor(0) },
  { order: 8, startLat: 1.3521, startLng: 103.8198, endLat: 40.7128, endLng: -74.006, arcAlt: 0.5, color: pickColor(1) },
  { order: 9, startLat: 22.3193, startLng: 114.1694, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.7, color: pickColor(2) },
  { order: 10, startLat: -22.9068, startLng: -43.1729, endLat: 28.6139, endLng: 77.209, arcAlt: 0.7, color: pickColor(0) },
  { order: 11, startLat: 41.9028, startLng: 12.4964, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2, color: pickColor(1) },
  { order: 12, startLat: 35.6762, startLng: 139.6503, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.2, color: pickColor(2) },
];

// Check if WebGL is available (avoid loading Three.js on unsupported devices)
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

// Decorative static fallback when globe can't render
const GlobeFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-64 h-64 sm:w-80 sm:h-80">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-900/40 to-blue-600/20 border border-blue-500/20 animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-800/30 to-transparent" />
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.15), transparent 60%)',
      }} />
    </div>
  </div>
);

// Loading skeleton that matches globe dimensions
const GlobeLoadingSkeleton: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-900/30 to-blue-700/10 border border-blue-500/10" />
      <div className="absolute inset-0 rounded-full animate-spin-slow border-2 border-transparent border-t-blue-500/30" style={{ animationDuration: '3s' }} />
      <div className="absolute inset-8 rounded-full animate-spin-slow border border-transparent border-t-blue-400/20" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
    </div>
  </div>
);

const HeroGlobe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  
  // Check WebGL support once on mount
  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  // Use IntersectionObserver to only mount globe when visible
  // Also delay slightly to let the main content paint first
  useEffect(() => {
    if (!hasWebGL) return;
    
    const el = containerRef.current;
    if (!el) return;
    
    // Use requestIdleCallback (or setTimeout fallback) to defer globe loading
    // This ensures hero text/buttons render first
    let timeoutId: number;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const scheduleRender = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));
          timeoutId = scheduleRender(() => {
            setShouldRender(true);
          }) as unknown as number;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(el);
    
    return () => {
      observer.disconnect();
      if (timeoutId) {
        const cancel = window.cancelIdleCallback || clearTimeout;
        cancel(timeoutId);
      }
    };
  }, [hasWebGL]);

  // Memoize arc data since it never changes
  const arcData = useMemo(() => sampleArcs, []);

  if (!hasWebGL) {
    return <GlobeFallback />;
  }

  return (
    <GlobeErrorBoundary>
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-visible">
        {/* Globe container - responsive sizing with circular mask, offset SE */}
        <div 
          className="w-[400px] sm:w-[450px] md:w-[520px] lg:w-[560px] xl:w-[650px] 2xl:w-[760px] 3xl:w-[880px] aspect-square relative translate-x-6 translate-y-6"
          style={{
            WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 70%)",
            maskImage: "radial-gradient(circle, black 40%, transparent 70%)",
          }}
        >
          {shouldRender ? (
            <motion.div
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <World data={arcData} globeConfig={globeConfig} />
            </motion.div>
          ) : (
            <GlobeLoadingSkeleton />
          )}
        </div>
      </div>
    </GlobeErrorBoundary>
  );
};

export default HeroGlobe;
