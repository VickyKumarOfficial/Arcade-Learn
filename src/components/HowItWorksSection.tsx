import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  Users, 
  Bot, 
  Award, 
  Briefcase, 
  TrendingUp,
  ArrowRight,
  Star,
  Clock,
  Target
} from "lucide-react";

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Choose Your Roadmap",
      description: "Start your journey by selecting a curated learning path designed by industry experts.",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      details: [
        "Browse expert-curated roadmaps",
        "Select based on your career goals", 
        "View estimated duration and difficulty"
      ]
    },
    {
      id: 2,
      title: "Learn & Complete Modules",
      description: "Progress through structured modules with hands-on projects and real-world resources.",
      icon: PlayCircle,
      color: "from-green-500 to-emerald-500",
      details: [
        "Interactive learning modules",
        "Hands-on projects and exercises",
        "Real-world industry resources"
      ]
    },
    {
      id: 3,
      title: "Take Assessments",
      description: "Test your knowledge with mini-assessments at the end of each sub-topic.",
      icon: CheckCircle2,
      color: "from-orange-500 to-yellow-500",
      details: [
        "Mini-assessments per sub-topic",
        "Immediate feedback on progress",
        "Knowledge validation checkpoints"
      ]
    },
    {
      id: 4,
      title: "Get Expert Help",
      description: "Clarify doubts through live sessions with experts or instant AI assistance.",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      details: [
        "Live doubt-solving sessions",
        "Expert mentorship",
        "24/7 AI chatbot support"
      ]
    },
    {
      id: 5,
      title: "Final Evaluation",
      description: "Complete comprehensive tests or projects evaluated by industry experts or AI.",
      icon: Target,
      color: "from-red-500 to-rose-500",
      details: [
        "Comprehensive final tests",
        "Real-world project building",
        "Expert & AI evaluation"
      ]
    },
    {
      id: 6,
      title: "Earn Certification",
      description: "Achieve minimum threshold scores to receive industry-recognized certificates.",
      icon: Award,
      color: "from-indigo-500 to-purple-500",
      details: [
        "Industry-recognized certificates",
        "Minimum threshold scoring",
        "Skill validation credentials"
      ]
    },
    {
      id: 7,
      title: "Career Opportunities",
      description: "Explore job opportunities and get career guidance based on your newly acquired skills.",
      icon: Briefcase,
      color: "from-teal-500 to-blue-500",
      details: [
        "Skill-matched job recommendations",
        "Expert career guidance",
        "Interview preparation training"
      ]
    }
  ];

  const features = [
    {
      icon: Clock,
      title: "Self-Paced Learning",
      description: "Learn at your own speed with flexible scheduling"
    },
    {
      icon: Star,
      title: "Expert-Curated",
      description: "Content designed by industry professionals"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Direct path to career advancement opportunities"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-normal">
            How It
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your complete learning journey from beginner to industry-ready professional. 
            Follow our proven 7-step process to master new skills and advance your career.
          </p>
        </div>

        {/* Interactive Journey Map */}
        <div className="mb-16">
          <div className="relative max-w-7xl mx-auto">
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 lg:gap-8 xl:gap-12 relative z-20 px-4 mb-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                
                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center cursor-pointer transition-all duration-300 px-2 py-4"
                    onClick={() => setActiveStep(index)}
                  >
                    {/* Step Icon */}
                    <div className={`
                      relative w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300 transform hover:scale-110
                      ${isActive 
                        ? `bg-gradient-to-r ${step.color} shadow-lg scale-110` 
                        : isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-md'
                          : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600'
                      }
                    `}>
                      <Icon className={`w-10 h-10 ${
                        isActive || isCompleted 
                          ? 'text-white' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                      {isCompleted && !isActive && (
                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                        <span className="text-base font-bold text-gray-700 dark:text-gray-300">{step.id}</span>
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className={`text-lg font-semibold text-center transition-colors px-2 ${
                      isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                );
              })}
            </div>

            {/* Progress Line - Now below the steps */}
            <div className="relative px-8">
              <div className="hidden lg:block h-2 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full"></div>
              <div 
                className="hidden lg:block absolute top-0 left-8 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `calc(${((activeStep + 1) / steps.length) * 100}% - 64px)` }}
              ></div>
              
              {/* Progress indicators for each step */}
              <div className="hidden lg:flex justify-between items-center absolute top-1/2 left-8 right-8 transform -translate-y-1/2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      index <= activeStep
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Step Details */}
        <div className="mb-16">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${steps[activeStep].color} flex items-center justify-center mr-4`}>
                      {React.createElement(steps[activeStep].icon, { className: "w-8 h-8 text-white" })}
                    </div>
                    <div>
                      <Badge className="mb-2">Step {steps[activeStep].id}</Badge>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {steps[activeStep].title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {steps[activeStep].description}
                  </p>
                  <ul className="space-y-3">
                    {steps[activeStep].details.map((detail, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center">
                  <div className={`w-64 h-64 rounded-2xl bg-gradient-to-br ${steps[activeStep].color} flex items-center justify-center shadow-2xl`}>
                    {React.createElement(steps[activeStep].icon, { className: "w-32 h-32 text-white opacity-80" })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="flex items-center"
            >
              Previous
            </Button>
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === activeStep 
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <Button
              onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
              disabled={activeStep === steps.length - 1}
              className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of learners who have successfully transformed their careers with our roadmaps.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
            >
              Explore Roadmaps
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
