"use client";
import { useEffect, useRef, useState, memo } from "react";
import { Color } from "three";
import ThreeGlobe from "three-globe";
import { useThree, Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Lazy load globe GeoJSON data only when the globe actually renders
// This removes ~407KB from the critical path
let countriesCache: any = null;
const loadCountries = async () => {
  if (countriesCache) return countriesCache;
  const module = await import("@/data/globe.json");
  countriesCache = module.default;
  return countriesCache;
};

const RING_PROPAGATION_SPEED = 3;
const cameraZ = 300;

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

export const Globe = memo(function Globe({ globeConfig, data }: WorldProps) {
  const globeRef = useRef<ThreeGlobe | null>(null);
  const groupRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const ringsTimerRef = useRef<number>(0);

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  // Initialize globe only once, with animateIn disabled for faster first paint
  useEffect(() => {
    if (!globeRef.current && groupRef.current) {
      globeRef.current = new ThreeGlobe({ animateIn: false });
      groupRef.current.add(globeRef.current);
      setIsInitialized(true);
    }
  }, []);

  // Build material when globe is initialized or when relevant props change
  useEffect(() => {
    if (!globeRef.current || !isInitialized) return;

    const globeMaterial = globeRef.current.globeMaterial() as unknown as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    globeMaterial.color = new Color(globeConfig.globeColor);
    globeMaterial.emissive = new Color(globeConfig.emissive);
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity || 0.1;
    globeMaterial.shininess = globeConfig.shininess || 0.9;
  }, [
    isInitialized,
    globeConfig.globeColor,
    globeConfig.emissive,
    globeConfig.emissiveIntensity,
    globeConfig.shininess,
  ]);

  // Build data when globe is initialized or when data changes
  // Countries JSON loaded lazily to avoid blocking initial bundle
  useEffect(() => {
    if (!globeRef.current || !isInitialized || !data) return;

    let cancelled = false;

    const buildGlobe = async () => {
      const countries = await loadCountries();
      if (cancelled || !globeRef.current) return;

      const arcs = data;
      // Use Map for O(1) dedup instead of O(n²) findIndex
      const pointSet = new Map<string, { size: number; order: number; color: string; lat: number; lng: number }>();

      for (let i = 0; i < arcs.length; i++) {
        const arc = arcs[i];
        const startKey = `${arc.startLat},${arc.startLng}`;
        const endKey = `${arc.endLat},${arc.endLng}`;

        if (!pointSet.has(startKey)) {
          pointSet.set(startKey, {
            size: defaultProps.pointSize,
            order: arc.order,
            color: arc.color,
            lat: arc.startLat,
            lng: arc.startLng,
          });
        }
        if (!pointSet.has(endKey)) {
          pointSet.set(endKey, {
            size: defaultProps.pointSize,
            order: arc.order,
            color: arc.color,
            lat: arc.endLat,
            lng: arc.endLng,
          });
        }
      }

      const filteredPoints = Array.from(pointSet.values());

      globeRef.current
        .hexPolygonsData(countries.features)
        .hexPolygonResolution(2)  // Lower resolution = much faster geometry (was 3)
        .hexPolygonMargin(0.7)
        .showAtmosphere(defaultProps.showAtmosphere)
        .atmosphereColor(defaultProps.atmosphereColor)
        .atmosphereAltitude(defaultProps.atmosphereAltitude)
        .hexPolygonColor(() => defaultProps.polygonColor);

      globeRef.current
        .arcsData(data)
        .arcStartLat((d) => (d as { startLat: number }).startLat)
        .arcStartLng((d) => (d as { startLng: number }).startLng)
        .arcEndLat((d) => (d as { endLat: number }).endLat)
        .arcEndLng((d) => (d as { endLng: number }).endLng)
        .arcColor((e: any) => (e as { color: string }).color)
        .arcAltitude((e) => (e as { arcAlt: number }).arcAlt)
        .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
        .arcDashLength(defaultProps.arcLength)
        .arcDashInitialGap((e) => (e as { order: number }).order)
        .arcDashGap(15)
        .arcDashAnimateTime(() => defaultProps.arcTime);

      globeRef.current
        .pointsData(filteredPoints)
        .pointColor((e) => (e as { color: string }).color)
        .pointsMerge(true)
        .pointAltitude(0.0)
        .pointRadius(2);

      globeRef.current
        .ringsData([])
        .ringColor(() => defaultProps.polygonColor)
        .ringMaxRadius(defaultProps.maxRings)
        .ringPropagationSpeed(RING_PROPAGATION_SPEED)
        .ringRepeatPeriod(
          (defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings,
        );
    };

    buildGlobe();

    return () => { cancelled = true; };
  }, [
    isInitialized,
    data,
    defaultProps.pointSize,
    defaultProps.showAtmosphere,
    defaultProps.atmosphereColor,
    defaultProps.atmosphereAltitude,
    defaultProps.polygonColor,
    defaultProps.arcLength,
    defaultProps.arcTime,
    defaultProps.rings,
    defaultProps.maxRings,
  ]);

  // Handle rings animation using useFrame (syncs with render loop, no extra timers)
  useFrame((_, delta) => {
    if (!globeRef.current || !isInitialized || !data) return;

    ringsTimerRef.current += delta;
    if (ringsTimerRef.current < 2) return; // Every ~2 seconds
    ringsTimerRef.current = 0;

    const numberOfRings = Math.floor((data.length * 4) / 5);
    const indices = new Set<number>();
    while (indices.size < numberOfRings) {
      indices.add(Math.floor(Math.random() * data.length));
    }

    const ringsData = data
      .filter((_d, i) => indices.has(i))
      .map((d) => ({
        lat: d.startLat,
        lng: d.startLng,
        color: d.color,
      }));

    globeRef.current.ringsData(ringsData);
  });

  return <group ref={groupRef} />;
});

export function WebGLRendererConfig() {
  const { gl, size } = useThree();

  useEffect(() => {
    // Cap pixel ratio at 2 for performance on high-DPI screens
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.setSize(size.width, size.height);
    gl.setClearColor(0x000000, 0);
    gl.setClearAlpha(0);
  }, [gl, size]);

  return null;
}

export const World = memo(function World(props: WorldProps) {
  const { globeConfig } = props;
  return (
    <Canvas
      camera={{
        fov: 50,
        near: 180,
        far: 1800,
        position: [0, 0, cameraZ],
      }}
      gl={{
        antialias: false,        // Disable AA for faster render (globe is masked/blurred anyway)
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: "default",
      }}
      dpr={[1, 1.5]}             // Cap canvas resolution for performance
      style={{ width: "100%", height: "100%", background: "transparent" }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        gl.setClearAlpha(0);
        scene.background = null;
      }}
    >
      <WebGLRendererConfig />
      <ambientLight
        color={globeConfig.ambientLight}
        intensity={0.6}
      />
      <directionalLight
        color={globeConfig.directionalLeftLight}
        position={[-400, 100, 400]}
      />
      <directionalLight
        color={globeConfig.directionalTopLight}
        position={[-200, 500, 200]}
      />
      <pointLight
        color={globeConfig.pointLight}
        position={[-200, 500, 200]}
        intensity={0.8}
      />
      <Globe {...props} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotateSpeed={1}
        autoRotate={true}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
});

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr: number[] = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}
