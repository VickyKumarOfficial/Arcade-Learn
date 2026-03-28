import { useRef, useMemo, useEffect, useState, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Error boundary for 3D canvas
class Canvas3DErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Hero3D Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// Store mouse position globally for 3D scene
interface MousePosition {
  x: number;
  y: number;
}

// Simple floating sphere
const FloatingSphere = ({
  position,
  color,
  size,
  speed,
  mousePosition,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  mousePosition: MousePosition;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // Floating animation
    const floatY = Math.sin(time * speed) * 0.4;
    const floatX = Math.cos(time * speed * 0.7) * 0.3;

    // Mouse influence
    const mouseInfluence = 0.3;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      initialPos.current.x + mousePosition.x * mouseInfluence + floatX,
      0.02
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      initialPos.current.y + mousePosition.y * mouseInfluence * 0.5 + floatY,
      0.02
    );

    // Rotation
    meshRef.current.rotation.x += 0.005 * speed;
    meshRef.current.rotation.y += 0.008 * speed;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[size, 1]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
    </mesh>
  );
};

// Simple torus ring
const FloatingTorus = ({
  position,
  color,
  size,
  speed,
  mousePosition,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  mousePosition: MousePosition;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    const floatY = Math.sin(time * speed + 1) * 0.3;
    const floatX = Math.cos(time * speed * 0.5) * 0.2;

    const mouseInfluence = 0.25;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      initialPos.current.x + mousePosition.x * mouseInfluence + floatX,
      0.02
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      initialPos.current.y + mousePosition.y * mouseInfluence * 0.5 + floatY,
      0.02
    );

    meshRef.current.rotation.x += 0.003 * speed;
    meshRef.current.rotation.y += 0.006 * speed;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[size, size * 0.3, 16, 32]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
    </mesh>
  );
};

// Particle field for depth
const ParticleField = ({ count = 40, mousePosition }: { count?: number; mousePosition: MousePosition }) => {
  const points = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 3;
    }
    return positions;
  }, [count]);

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(particlePositions, 3)
      );
    }
  }, [particlePositions]);

  useFrame((state) => {
    if (!points.current) return;
    const time = state.clock.elapsedTime;
    points.current.rotation.y = mousePosition.x * 0.08 + time * 0.02;
    points.current.rotation.x = mousePosition.y * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial size={0.04} color="#60A5FA" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
};

// Glowing ring
const GlowRing = ({ mousePosition }: { mousePosition: MousePosition }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const time = state.clock.elapsedTime;
    const scale = 1 + Math.sin(time * 1.5) * 0.03;
    ringRef.current.scale.set(scale, scale, 1);
    ringRef.current.rotation.x = mousePosition.y * 0.15;
    ringRef.current.rotation.y = mousePosition.x * 0.15;
  });

  return (
    <mesh ref={ringRef} position={[0, 0, -4]}>
      <torusGeometry args={[2.5, 0.015, 16, 80]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={0.25} />
    </mesh>
  );
};

// Main 3D Scene - simplified
const Scene = ({ mousePosition }: { mousePosition: MousePosition }) => {
  return (
    <>
      {/* Floating shapes */}
      <FloatingSphere position={[-4, 2, -2]} color="#3B82F6" size={0.8} speed={0.8} mousePosition={mousePosition} />
      <FloatingTorus position={[4.5, 1.5, -3]} color="#60A5FA" size={0.6} speed={1.1} mousePosition={mousePosition} />
      <FloatingSphere position={[-3, -2, -2.5]} color="#93C5FD" size={0.7} speed={0.9} mousePosition={mousePosition} />
      <FloatingTorus position={[3.5, -1.5, -4]} color="#2563EB" size={0.5} speed={1} mousePosition={mousePosition} />
      <FloatingSphere position={[0, 3, -5]} color="#1D4ED8" size={0.4} speed={0.7} mousePosition={mousePosition} />

      {/* Particles */}
      <ParticleField count={60} mousePosition={mousePosition} />

      {/* Central ring */}
      <GlowRing mousePosition={mousePosition} />
    </>
  );
};

// Hook to detect reduced motion preference
const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
};

// Hook to detect mobile/small screens
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Main component export
interface Hero3DBackgroundProps {
  mousePosition: MousePosition;
}

const Hero3DBackground = ({ mousePosition }: Hero3DBackgroundProps) => {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || reducedMotion || isMobile) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas3DErrorBoundary fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ background: 'transparent' }}
        >
          <Scene mousePosition={mousePosition} />
        </Canvas>
      </Canvas3DErrorBoundary>
    </div>
  );
};

export default Hero3DBackground;
