import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, ChevronLeft, ChevronRight, Trophy, Briefcase } from "lucide-react";
import { testimonials } from "@/data/testimonials";

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentIndex];

  // Get 4 testimonials for the sliding effect (including the one sliding in)
  const getCarouselTestimonials = () => {
    const testimonialsList = [];
    for (let i = 0; i < 4; i++) {
      const index = (currentIndex + i) % testimonials.length;
      testimonialsList.push({
        ...testimonials[index],
        position: i // 0=left(x), 1=center(y), 2=right(z), 3=incoming
      });
    }
    return testimonialsList;
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-300 dark:fill-gray-600 text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  const TestimonialCard = ({ 
    testimonial, 
    position,
    featured = false 
  }: { 
    testimonial: typeof testimonials[0], 
    position: number,
    featured?: boolean
  }) => {
    return (
      <Card className={`${
        featured
          ? "shadow-2xl border-2 border-purple-500/50 dark:border-purple-400/50" 
          : "shadow-xl"
      } bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:transform hover:scale-102 group overflow-hidden h-full`}>
        <CardContent className="p-6 relative">
          {/* Quote Icon */}
          <div className={`absolute top-4 right-4 ${
            featured ? "text-purple-500/20 dark:text-purple-400/20" : "text-gray-300/30 dark:text-gray-600/30"
          }`}>
            <Quote className="w-8 h-8" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {renderStars(testimonial.rating)}
          </div>

          {/* Content */}
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm sm:text-base italic relative z-10">
            "{testimonial.content}"
          </p>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              featured
                ? "bg-gradient-to-br from-purple-500 to-pink-500" 
                : "bg-gradient-to-br from-blue-500 to-purple-500"
            } shadow-lg`}>
              {testimonial.avatar}
            </div>

            {/* Details */}
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                {testimonial.name}
              </h4>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Briefcase className="w-3 h-3" />
                <span>{testimonial.role} at {testimonial.company}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {testimonial.course}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {testimonial.achievement}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6">
            Success Stories
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of learners who transformed their careers with our roadmaps
          </p>
          <div className="flex justify-center items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.9/5 average rating from 10,000+ students</span>
          </div>
        </div>

        {/* Mobile View - Single Testimonial Carousel */}
        <div className="block lg:hidden">
          <div className="relative overflow-hidden">
            <TestimonialCard testimonial={currentTestimonial} position={1} featured={true} />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-purple-500 w-6"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-purple-300 dark:hover:bg-purple-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop View - Card-by-Card Sliding Animation */}
        <div className="hidden lg:block">
          <div className="relative h-96 overflow-hidden">
            {/* Container with 3 visible cards that slide smoothly */}
            <div className="relative w-full h-full">
              {getCarouselTestimonials().map((testimonial, index) => {
                // Calculate position for smooth sliding
                let translateX = 0;
                let opacity = 1;
                let scale = 1;
                let zIndex = 1;
                
                switch (index) {
                  case 0: // Left card (x)
                    translateX = -33.333; // -100% / 3
                    opacity = 0.7;
                    scale = 0.9;
                    zIndex = 1;
                    break;
                  case 1: // Center card (y) - featured
                    translateX = 0;
                    opacity = 1;
                    scale = 1.05;
                    zIndex = 10;
                    break;
                  case 2: // Right card (z)
                    translateX = 33.333; // 100% / 3
                    opacity = 0.7;
                    scale = 0.9;
                    zIndex = 1;
                    break;
                  case 3: // Incoming card (slides in from right)
                    translateX = 100;
                    opacity = 0;
                    scale = 0.9;
                    zIndex = 1;
                    break;
                }
                
                return (
                  <div
                    key={`${testimonial.id}-${currentIndex}-${index}`}
                    className="absolute w-1/3 transition-all duration-1000 ease-in-out"
                    style={{
                      transform: `translateX(${translateX}%) scale(${scale})`,
                      opacity: opacity,
                      zIndex: zIndex,
                      left: '33.333%'
                    }}
                  >
                    <TestimonialCard
                      testimonial={testimonial}
                      position={index}
                      featured={index === 1}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-purple-500 w-8"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-purple-300 dark:hover:bg-purple-400"
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              10K+
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Success Stories
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              95%
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Job Placement Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              3x
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Average Salary Increase
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
              50+
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Top Companies
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
