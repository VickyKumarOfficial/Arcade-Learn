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
          ? "shadow-2xl border-2 border-primary ring-2 ring-primary/30" 
          : "shadow-xl border border-border"
      } bg-card backdrop-blur-sm hover:transform hover:scale-102 group overflow-hidden h-full transition-all duration-300`}>
        <CardContent className="p-6 relative">
          {/* Quote Icon */}
          <div className={`absolute top-4 right-4 ${
            featured ? "text-primary/20" : "text-muted-foreground/30"
          }`}>
            <Quote className="w-8 h-8" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {renderStars(testimonial.rating)}
          </div>

          {/* Content */}
          <p className="text-foreground mb-6 leading-relaxed text-sm sm:text-base italic relative z-10">
            "{testimonial.content}"
          </p>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              featured
                ? "bg-primary" 
                : "bg-primary"
            } shadow-lg`}>
              {testimonial.avatar}
            </div>

            {/* Details */}
            <div className="flex-1">
              <h4 className="font-bold text-foreground text-sm sm:text-base">
                {testimonial.name}
              </h4>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                <Briefcase className="w-3 h-3" />
                <span>{testimonial.role} at {testimonial.company}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {testimonial.course}
                </Badge>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
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
    <section className="py-12 sm:py-16 lg:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-5 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Customer Reviews
          </h2>
          {/* <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6">
            Success Stories
          </h2> */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of learners who transformed their careers with our roadmaps
          </p>
          <div className="flex justify-center items-center gap-2 mt-4 text-sm text-muted-foreground">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/90 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/90 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
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
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-primary/50"
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
                // Calculate position for smooth sliding with increased gaps
                let translateX = 0;
                let opacity = 1;
                let scale = 1;
                let zIndex = 1;
                
                switch (index) {
                  case 0: // Left card (x) - more exposed
                    translateX = -70; // Increased from -33.333 to show more of the card
                    opacity = 0.8; // Slightly more visible
                    scale = 0.92; // Slightly larger
                    zIndex = 1;
                    break;
                  case 1: // Center card (y) - featured
                    translateX = 0;
                    opacity = 1;
                    scale = 1.05;
                    zIndex = 10;
                    break;
                  case 2: // Right card (z) - more exposed
                    translateX = 70; // Increased from 33.333 to show more of the card
                    opacity = 0.8; // Slightly more visible
                    scale = 0.92; // Slightly larger
                    zIndex = 1;
                    break;
                  case 3: // Incoming card (slides in from right)
                    translateX = 120; // Moved further right to give more space
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
              className="bg-card p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-border"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="bg-card p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-border"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
              10K+
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              Success Stories
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
              95%
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              Job Placement Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
              3x
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              Average Salary Increase
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
              50+
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              Top Companies
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
