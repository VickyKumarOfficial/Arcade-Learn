import { useState, useCallback, useRef } from 'react';

// Interactive CSS animated globe - responds to cursor movement
export default function HeroGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Handle mouse movement for interactive rotation
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Calculate mouse position relative to center (-1 to 1)
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    // Apply rotation (limited range for subtle effect)
    setRotation({ x: y * 7.5, y: x * 7.5 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Smoothly return to original position
    setRotation({ x: 0, y: 0 });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] lg:min-h-[500px] flex items-center justify-center cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Outer glow effects - intensifies on hover */}
      <div 
        className="absolute w-80 h-80 lg:w-96 lg:h-96 bg-blue-600/20 rounded-full blur-[80px] transition-all duration-500"
        style={{ 
          animationDuration: '4s',
          opacity: isHovered ? 0.4 : 0.2,
          transform: `scale(${isHovered ? 1.1 : 1})`,
        }} 
      />
      <div className="absolute w-64 h-64 lg:w-80 lg:h-80 bg-blue-500/15 rounded-full blur-[60px]" />
      
      {/* Main globe container - applies 3D rotation based on cursor */}
      <div 
        className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${-rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        
        {/* Outermost orbit ring */}
        <div 
          className="absolute -inset-12 rounded-full border border-blue-400/20"
          style={{ 
            animation: 'spin 30s linear infinite reverse',
          }}
        >
          {/* Orbiting dot on outer ring */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
        </div>
        
        {/* Second orbit ring */}
        <div 
          className="absolute -inset-6 rounded-full border border-blue-500/25"
          style={{ 
            animation: 'spin 20s linear infinite',
          }}
        >
          {/* Orbiting dot */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50" />
        </div>
        
        {/* Main sphere */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Dark ocean base */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
          
          {/* Ocean texture with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-blue-800/30" />
          
          {/* Dotted world map pattern - this creates the continents effect */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cstyle%3E.dot%7Bfill:%2360A5FA;%7D%3C/style%3E%3Cg%3E%3C!-- North America --%3E%3Ccircle class='dot' cx='80' cy='45' r='2'/%3E%3Ccircle class='dot' cx='85' cy='50' r='2'/%3E%3Ccircle class='dot' cx='75' cy='50' r='2'/%3E%3Ccircle class='dot' cx='70' cy='55' r='2'/%3E%3Ccircle class='dot' cx='80' cy='55' r='2'/%3E%3Ccircle class='dot' cx='90' cy='55' r='2'/%3E%3Ccircle class='dot' cx='65' cy='60' r='2'/%3E%3Ccircle class='dot' cx='75' cy='60' r='2'/%3E%3Ccircle class='dot' cx='85' cy='60' r='2'/%3E%3Ccircle class='dot' cx='95' cy='60' r='2'/%3E%3Ccircle class='dot' cx='70' cy='65' r='2'/%3E%3Ccircle class='dot' cx='80' cy='65' r='2'/%3E%3Ccircle class='dot' cx='90' cy='65' r='2'/%3E%3Ccircle class='dot' cx='75' cy='70' r='2'/%3E%3Ccircle class='dot' cx='85' cy='70' r='2'/%3E%3Ccircle class='dot' cx='95' cy='70' r='2'/%3E%3Ccircle class='dot' cx='80' cy='75' r='2'/%3E%3Ccircle class='dot' cx='90' cy='75' r='2'/%3E%3Ccircle class='dot' cx='85' cy='80' r='2'/%3E%3C!-- South America --%3E%3Ccircle class='dot' cx='115' cy='100' r='2'/%3E%3Ccircle class='dot' cx='120' cy='105' r='2'/%3E%3Ccircle class='dot' cx='110' cy='110' r='2'/%3E%3Ccircle class='dot' cx='120' cy='110' r='2'/%3E%3Ccircle class='dot' cx='115' cy='115' r='2'/%3E%3Ccircle class='dot' cx='125' cy='115' r='2'/%3E%3Ccircle class='dot' cx='120' cy='120' r='2'/%3E%3Ccircle class='dot' cx='115' cy='125' r='2'/%3E%3Ccircle class='dot' cx='120' cy='130' r='2'/%3E%3Ccircle class='dot' cx='115' cy='135' r='2'/%3E%3Ccircle class='dot' cx='110' cy='140' r='2'/%3E%3Ccircle class='dot' cx='105' cy='145' r='2'/%3E%3C!-- Europe --%3E%3Ccircle class='dot' cx='190' cy='45' r='2'/%3E%3Ccircle class='dot' cx='200' cy='45' r='2'/%3E%3Ccircle class='dot' cx='185' cy='50' r='2'/%3E%3Ccircle class='dot' cx='195' cy='50' r='2'/%3E%3Ccircle class='dot' cx='205' cy='50' r='2'/%3E%3Ccircle class='dot' cx='180' cy='55' r='2'/%3E%3Ccircle class='dot' cx='190' cy='55' r='2'/%3E%3Ccircle class='dot' cx='200' cy='55' r='2'/%3E%3Ccircle class='dot' cx='210' cy='55' r='2'/%3E%3Ccircle class='dot' cx='185' cy='60' r='2'/%3E%3Ccircle class='dot' cx='195' cy='60' r='2'/%3E%3Ccircle class='dot' cx='205' cy='60' r='2'/%3E%3Ccircle class='dot' cx='190' cy='65' r='2'/%3E%3Ccircle class='dot' cx='200' cy='65' r='2'/%3E%3C!-- Africa --%3E%3Ccircle class='dot' cx='195' cy='85' r='2'/%3E%3Ccircle class='dot' cx='205' cy='85' r='2'/%3E%3Ccircle class='dot' cx='190' cy='90' r='2'/%3E%3Ccircle class='dot' cx='200' cy='90' r='2'/%3E%3Ccircle class='dot' cx='210' cy='90' r='2'/%3E%3Ccircle class='dot' cx='185' cy='95' r='2'/%3E%3Ccircle class='dot' cx='195' cy='95' r='2'/%3E%3Ccircle class='dot' cx='205' cy='95' r='2'/%3E%3Ccircle class='dot' cx='215' cy='95' r='2'/%3E%3Ccircle class='dot' cx='190' cy='100' r='2'/%3E%3Ccircle class='dot' cx='200' cy='100' r='2'/%3E%3Ccircle class='dot' cx='210' cy='100' r='2'/%3E%3Ccircle class='dot' cx='195' cy='105' r='2'/%3E%3Ccircle class='dot' cx='205' cy='105' r='2'/%3E%3Ccircle class='dot' cx='200' cy='110' r='2'/%3E%3Ccircle class='dot' cx='195' cy='115' r='2'/%3E%3Ccircle class='dot' cx='205' cy='115' r='2'/%3E%3Ccircle class='dot' cx='200' cy='120' r='2'/%3E%3C!-- Asia --%3E%3Ccircle class='dot' cx='240' cy='45' r='2'/%3E%3Ccircle class='dot' cx='250' cy='45' r='2'/%3E%3Ccircle class='dot' cx='260' cy='45' r='2'/%3E%3Ccircle class='dot' cx='270' cy='45' r='2'/%3E%3Ccircle class='dot' cx='235' cy='50' r='2'/%3E%3Ccircle class='dot' cx='245' cy='50' r='2'/%3E%3Ccircle class='dot' cx='255' cy='50' r='2'/%3E%3Ccircle class='dot' cx='265' cy='50' r='2'/%3E%3Ccircle class='dot' cx='275' cy='50' r='2'/%3E%3Ccircle class='dot' cx='285' cy='50' r='2'/%3E%3Ccircle class='dot' cx='230' cy='55' r='2'/%3E%3Ccircle class='dot' cx='240' cy='55' r='2'/%3E%3Ccircle class='dot' cx='250' cy='55' r='2'/%3E%3Ccircle class='dot' cx='260' cy='55' r='2'/%3E%3Ccircle class='dot' cx='270' cy='55' r='2'/%3E%3Ccircle class='dot' cx='280' cy='55' r='2'/%3E%3Ccircle class='dot' cx='290' cy='55' r='2'/%3E%3Ccircle class='dot' cx='225' cy='60' r='2'/%3E%3Ccircle class='dot' cx='235' cy='60' r='2'/%3E%3Ccircle class='dot' cx='245' cy='60' r='2'/%3E%3Ccircle class='dot' cx='255' cy='60' r='2'/%3E%3Ccircle class='dot' cx='265' cy='60' r='2'/%3E%3Ccircle class='dot' cx='275' cy='60' r='2'/%3E%3Ccircle class='dot' cx='285' cy='60' r='2'/%3E%3Ccircle class='dot' cx='295' cy='60' r='2'/%3E%3Ccircle class='dot' cx='230' cy='65' r='2'/%3E%3Ccircle class='dot' cx='240' cy='65' r='2'/%3E%3Ccircle class='dot' cx='250' cy='65' r='2'/%3E%3Ccircle class='dot' cx='260' cy='65' r='2'/%3E%3Ccircle class='dot' cx='270' cy='65' r='2'/%3E%3Ccircle class='dot' cx='280' cy='65' r='2'/%3E%3Ccircle class='dot' cx='290' cy='65' r='2'/%3E%3Ccircle class='dot' cx='300' cy='65' r='2'/%3E%3Ccircle class='dot' cx='235' cy='70' r='2'/%3E%3Ccircle class='dot' cx='245' cy='70' r='2'/%3E%3Ccircle class='dot' cx='255' cy='70' r='2'/%3E%3Ccircle class='dot' cx='265' cy='70' r='2'/%3E%3Ccircle class='dot' cx='275' cy='70' r='2'/%3E%3Ccircle class='dot' cx='285' cy='70' r='2'/%3E%3Ccircle class='dot' cx='295' cy='70' r='2'/%3E%3Ccircle class='dot' cx='240' cy='75' r='2'/%3E%3Ccircle class='dot' cx='250' cy='75' r='2'/%3E%3Ccircle class='dot' cx='260' cy='75' r='2'/%3E%3Ccircle class='dot' cx='270' cy='75' r='2'/%3E%3Ccircle class='dot' cx='280' cy='75' r='2'/%3E%3Ccircle class='dot' cx='290' cy='75' r='2'/%3E%3Ccircle class='dot' cx='300' cy='75' r='2'/%3E%3Ccircle class='dot' cx='245' cy='80' r='2'/%3E%3Ccircle class='dot' cx='255' cy='80' r='2'/%3E%3Ccircle class='dot' cx='265' cy='80' r='2'/%3E%3Ccircle class='dot' cx='275' cy='80' r='2'/%3E%3Ccircle class='dot' cx='285' cy='80' r='2'/%3E%3Ccircle class='dot' cx='295' cy='80' r='2'/%3E%3C!-- India --%3E%3Ccircle class='dot' cx='260' cy='85' r='2'/%3E%3Ccircle class='dot' cx='270' cy='85' r='2'/%3E%3Ccircle class='dot' cx='255' cy='90' r='2'/%3E%3Ccircle class='dot' cx='265' cy='90' r='2'/%3E%3Ccircle class='dot' cx='275' cy='90' r='2'/%3E%3Ccircle class='dot' cx='260' cy='95' r='2'/%3E%3Ccircle class='dot' cx='270' cy='95' r='2'/%3E%3Ccircle class='dot' cx='265' cy='100' r='2'/%3E%3C!-- Australia --%3E%3Ccircle class='dot' cx='320' cy='115' r='2'/%3E%3Ccircle class='dot' cx='330' cy='115' r='2'/%3E%3Ccircle class='dot' cx='340' cy='115' r='2'/%3E%3Ccircle class='dot' cx='315' cy='120' r='2'/%3E%3Ccircle class='dot' cx='325' cy='120' r='2'/%3E%3Ccircle class='dot' cx='335' cy='120' r='2'/%3E%3Ccircle class='dot' cx='345' cy='120' r='2'/%3E%3Ccircle class='dot' cx='320' cy='125' r='2'/%3E%3Ccircle class='dot' cx='330' cy='125' r='2'/%3E%3Ccircle class='dot' cx='340' cy='125' r='2'/%3E%3Ccircle class='dot' cx='325' cy='130' r='2'/%3E%3Ccircle class='dot' cx='335' cy='130' r='2'/%3E%3Ccircle class='dot' cx='330' cy='135' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '200% 100%',
              backgroundPosition: 'center',
              animation: 'scrollMap 30s linear infinite',
              opacity: 0.9,
            }}
          />
          
          {/* Additional scattered dots for more realistic effect */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(96, 165, 250, 0.6) 1px, transparent 1px),
                               radial-gradient(circle at 70% 25%, rgba(96, 165, 250, 0.5) 1px, transparent 1px),
                               radial-gradient(circle at 45% 60%, rgba(96, 165, 250, 0.4) 1px, transparent 1px),
                               radial-gradient(circle at 80% 70%, rgba(96, 165, 250, 0.5) 1px, transparent 1px),
                               radial-gradient(circle at 30% 75%, rgba(96, 165, 250, 0.4) 1px, transparent 1px)`,
              backgroundSize: '100% 100%',
            }}
          />
          
          {/* Atmosphere glow effect */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(147, 197, 253, 0.15) 0%, transparent 50%)',
            }}
          />
          
          {/* Highlight/shine effect */}
          <div className="absolute top-3 left-3 w-1/4 h-1/4 bg-gradient-to-br from-white/15 to-transparent rounded-full blur-sm" />
          
          {/* Edge atmosphere glow */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: 'inset 0 0 30px rgba(96, 165, 250, 0.3), inset 0 0 60px rgba(59, 130, 246, 0.2)',
            }}
          />
        </div>
        
        {/* Wireframe overlay - horizontal lines */}
        <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
          {[...Array(7)].map((_, i) => (
            <div 
              key={`h-${i}`}
              className="absolute left-0 right-0 border-t border-blue-300/50"
              style={{ 
                top: `${15 + i * 12}%`,
                transform: `scaleX(${Math.sin((i + 1) * 0.4) * 0.3 + 0.7})`,
              }}
            />
          ))}
        </div>
        
        {/* Wireframe overlay - vertical curves (simulated) */}
        <div className="absolute inset-0 rounded-full border border-blue-400/30" />
        <div className="absolute inset-[10%] rounded-full border border-blue-400/20" />
        <div className="absolute inset-[25%] rounded-full border border-blue-400/15" />
        
        {/* Floating particles around the globe */}
        <div className="absolute -inset-8">
          {/* Particle 1 */}
          <div 
            className="absolute top-[10%] left-[20%] w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-float-slow"
          />
          {/* Particle 2 */}
          <div 
            className="absolute top-[30%] right-[10%] w-1.5 h-1.5 bg-blue-300 rounded-full opacity-50 animate-float-medium"
            style={{ animationDelay: '1s' }}
          />
          {/* Particle 3 */}
          <div 
            className="absolute bottom-[20%] left-[15%] w-1 h-1 bg-blue-500 rounded-full opacity-70 animate-float-fast"
            style={{ animationDelay: '0.5s' }}
          />
          {/* Particle 4 */}
          <div 
            className="absolute bottom-[35%] right-[20%] w-0.5 h-0.5 bg-blue-400 rounded-full opacity-60 animate-float-slow"
            style={{ animationDelay: '2s' }}
          />
          {/* Particle 5 */}
          <div 
            className="absolute top-[50%] left-[5%] w-1 h-1 bg-blue-300 rounded-full opacity-50 animate-float-medium"
            style={{ animationDelay: '1.5s' }}
          />
          {/* Particle 6 */}
          <div 
            className="absolute top-[15%] right-[25%] w-0.5 h-0.5 bg-blue-500 rounded-full opacity-40 animate-float-fast"
            style={{ animationDelay: '0.8s' }}
          />
        </div>
        
        {/* Glow ring around sphere */}
        <div 
          className="absolute -inset-1 rounded-full"
          style={{
            background: 'radial-gradient(circle, transparent 60%, rgba(59, 130, 246, 0.3) 70%, transparent 80%)',
          }}
        />
        
        {/* Animated pulsing ring */}
        <div 
          className="absolute -inset-2 rounded-full border-2 border-blue-500/20 animate-pulse"
          style={{ animationDuration: '3s' }}
        />
      </div>
      
      {/* Floating data badges (like Meridian design) */}
      <div 
        className="absolute top-[15%] right-[10%] bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2 shadow-lg animate-float-slow"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-300">Active Learners</span>
          <span className="text-sm font-semibold text-white">2.4k+</span>
        </div>
      </div>
      
      <div 
        className="absolute bottom-[20%] left-[5%] bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2 shadow-lg animate-float-medium"
        style={{ animationDelay: '1s' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-300">Roadmaps</span>
          <span className="text-sm font-semibold text-white">5+</span>
        </div>
      </div>
    </div>
  );
}
