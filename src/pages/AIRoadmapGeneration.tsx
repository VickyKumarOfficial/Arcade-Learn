import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Route, Target, Zap, BookOpen, TrendingUp } from 'lucide-react';

const AIRoadmapGeneration = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-[92px] sm:pt-[108px] pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary p-4 rounded-full">
                <Bot className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              AI Roadmap Generation ✨
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Create personalized learning roadmaps tailored to your goals, skill level, and preferences using our intelligent AI system.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Route className="h-6 w-6 text-primary" />
                  <span>Custom Paths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate unique learning paths based on your specific career goals and interests.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-primary" />
                  <span>Goal-Oriented</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI analyzes your target role and creates optimized learning sequences.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <span>Adaptive Learning</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Roadmaps that evolve based on your progress and learning patterns.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                  <span>Resource Curation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Curated resources and materials perfectly matched to your learning style.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                  <span>Progress Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Smart tracking and recommendations to keep you on the optimal path.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-6 w-6 text-cyan-600" />
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Intelligent insights and suggestions to optimize your learning journey.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Card */}
          <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-500/20 dark:to-blue-500/20">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Coming Soon!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Our AI-powered roadmap generation system is in development. 
                  Get ready for personalized learning paths like never before!
                </p>
                <Button 
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled
                >
                  Notify Me When Ready
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIRoadmapGeneration;