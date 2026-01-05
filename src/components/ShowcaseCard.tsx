import { useRef, useState, MouseEvent, useEffect } from "react";

interface ShowcaseCardProps {
    imageSrc?: string; // Path to the dashboard/preview image
    fallbackContent?: boolean; // Show placeholder if no image
}

const ShowcaseCard = ({ imageSrc, fallbackContent = true }: ShowcaseCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // Percentage position for spotlight
    const [isVisible, setIsVisible] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Reduced rotation - max 4 degrees instead of 10
        const rotateXValue = ((mouseY - centerY) / (rect.height / 2));
        const rotateYValue = ((mouseX - centerX) / (rect.width / 2));

        // Calculate mouse position as percentage for spotlight effect
        const xPercent = ((mouseX - rect.left) / rect.width) * 100;
        const yPercent = ((mouseY - rect.top) / rect.height) * 100;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
        setMousePos({ x: xPercent, y: yPercent });
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setMousePos({ x: 50, y: 50 });
    };

    return (
        <div className="w-full flex justify-center perspective-[1000px] pt-12 sm:pt-24 xl:pt-32 pb-0 bg-black overflow-hidden relative px-4 sm:px-6 lg:px-8">
            {/* Background Glow Effect - subtle blue underneath */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 h-3/5 bg-blue-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />

            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transformStyle: "preserve-3d",
                    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                }}
                className="relative z-10 w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl aspect-[16/9] rounded-xl xl:rounded-2xl bg-black/40 backdrop-blur-md shadow-2xl cursor-pointer group transition-transform duration-100 ease-out"
            >
                {/* Spotlight effect overlay - follows cursor */}
                <div
                    className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    style={{
                        background: `radial-gradient(circle 400px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 20%, transparent 70%)`
                    }}
                />

                {/* Image Content */}
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt="Platform Preview"
                        className={`absolute inset-0 w-full h-full object-cover object-top rounded-xl transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                    />
                )}

                {/* Fallback Placeholder Content - shown when no image or image not loaded */}
                {(!imageSrc || !imageLoaded) && fallbackContent && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-16 text-center select-none">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                            <svg
                                className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h3 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white mb-4">
                            Interactive Learning Platform
                        </h3>

                        <p className="text-slate-400 max-w-lg text-sm sm:text-base leading-relaxed">
                            Experience a new way of mastering tech skills with our interactive roadmaps and hands-on challenges.
                        </p>

                        {/* Decorative Elements inside card to give depth */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 blur-3xl rounded-full" />
                        <div className="absolute top-10 left-10 w-20 h-1 bg-white/10 rounded-full" />
                        <div className="absolute top-14 left-10 w-10 h-1 bg-white/10 rounded-full" />

                        {/* Floating UI Elements Simulation */}
                        <div className="absolute right-8 top-8 w-16 h-12 sm:w-24 sm:h-16 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm transform rotate-6 translate-z-0 transition-transform duration-500 group-hover:translate-z-12 shadow-lg" />
                        <div className="absolute left-8 bottom-8 w-24 h-8 sm:w-32 sm:h-10 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm transform -rotate-3 translate-z-0 transition-transform duration-500 group-hover:translate-z-8 shadow-lg" />
                    </div>
                )}

                {/* Subtle inner border glow when image is shown */}
                {imageSrc && imageLoaded && (
                    <div className="absolute inset-0 rounded-xl border border-blue-500/20 pointer-events-none" />
                )}

                {/* Bottom gradient fade - darker linear fade from lower half */}
                <div 
                    className="absolute bottom-0 left-0 right-0 h-[55%] z-30 pointer-events-none rounded-b-xl"
                    style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.92) 60%, rgba(0,0,0,0.98) 80%, rgba(0,0,0,1) 100%)'
                    }}
                />
            </div>
        </div>
    );
};

export default ShowcaseCard;
