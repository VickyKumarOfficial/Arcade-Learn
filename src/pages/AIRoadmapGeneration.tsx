import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Route, Target, Zap, BookOpen, TrendingUp, Clock, Star, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { aiRoadmapService } from '@/services/aiRoadmapService';
import { aiService } from '@/services/aiService';
import FormattedText from '@/components/FormattedText';

interface RoadmapRecommendation {
  id: string;
  priority: number;
  score: number;
  estimatedWeeks: number;
  weeklyHours: number;
  reasoning: string;
}

interface RecommendationData {
  roadmaps: RoadmapRecommendation[];
  reasoning: {
    summary: string;
    details: string[];
    learningApproach: string[];
    nextSteps: string[];
  };
  confidence: number;
}

const AIRoadmapGeneration = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Check for survey data on component mount
  useEffect(() => {
    if (user?.id) {
      checkSurveyData();
    }
  }, [user]);

  const checkSurveyData = async () => {
    if (!user?.id) return;

    try {
      const result = await aiRoadmapService.getUserSurveyData(user.id);
      if (result.success && result.data) {
        setSurveyData(result.data);
      }
    } catch (error) {
      console.error('Error checking survey data:', error);
    }
  };

  const generateRoadmap = async () => {
    if (!user?.id) {
      setError('Please sign in to generate your personalized roadmap');
      return;
    }

    if (!surveyData) {
      setError('Please complete the survey first to generate your personalized roadmap');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, generate backend recommendations
      const backendResult = await aiRoadmapService.generateAIRoadmap(user.id);
      
      if (backendResult.success && backendResult.data) {
        const formattedRecommendations = aiRoadmapService.formatRecommendations(
          backendResult.data.recommendations
        );
        setRecommendations(formattedRecommendations);
      }

      // Then, generate AI response for detailed explanation
      setIsGeneratingAI(true);
      const aiResult = await aiService.generatePersonalizedRoadmap(surveyData);
      
      if (aiResult.success && aiResult.response) {
        setAiResponse(aiResult.response);
      } else {
        console.error('AI generation failed:', aiResult.error);
      }

    } catch (error) {
      console.error('Error generating roadmap:', error);
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setIsLoading(false);
      setIsGeneratingAI(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

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

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Survey Status & Generate Button */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                {!user ? (
                  <div className="space-y-4">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
                    <h3 className="text-xl font-semibold">Sign In Required</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Please sign in to generate your personalized AI roadmap.
                    </p>
                  </div>
                ) : !surveyData ? (
                  <div className="space-y-4">
                    <AlertCircle className="h-12 w-12 text-blue-500 mx-auto" />
                    <h3 className="text-xl font-semibold">Complete Survey First</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      To generate personalized recommendations, please complete the survey from your dashboard.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Ready to Generate!</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Your survey is complete. Generate your personalized AI roadmap now.
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Your Profile:</strong> {surveyData.userType} • {surveyData.skillLevel} • 
                          {Array.isArray(surveyData.techInterest) 
                            ? surveyData.techInterest.slice(0, 2).join(', ')
                            : surveyData.techInterest
                          }
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={generateRoadmap}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating Your Roadmap...
                        </>
                      ) : (
                        <>
                          <Bot className="h-5 w-5 mr-2" />
                          Generate AI Roadmap
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generated Recommendations */}
          {recommendations && (
            <div className="space-y-8">
              {/* Summary Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-6 w-6 text-green-600" />
                    <span>Your Personalized Recommendations</span>
                    <span className={`text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${getConfidenceColor(recommendations.confidence)}`}>
                      {getConfidenceText(recommendations.confidence)} ({Math.round(recommendations.confidence * 100)}%)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {recommendations.reasoning.summary}
                  </p>
                  {recommendations.reasoning.details.length > 0 && (
                    <div className="space-y-2">
                      {recommendations.reasoning.details.map((detail, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Roadmap Cards */}
              {recommendations.roadmaps.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.roadmaps.map((roadmap, index) => (
                    <Card key={roadmap.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-lg">Priority {roadmap.priority}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{Math.round(roadmap.score * 100)}%</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-green-600 dark:text-green-400">
                            {roadmap.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {roadmap.reasoning}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{roadmap.estimatedWeeks} weeks</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{roadmap.weeklyHours}h/week</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Next Steps */}
              {recommendations.reasoning.nextSteps.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                      <span>Your Next Steps</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2">
                      {recommendations.reasoning.nextSteps.map((step, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-300">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* AI Generated Response */}
          {aiResponse && (
            <Card className="border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-6 w-6 text-purple-600" />
                  <span>Detailed AI Analysis</span>
                  {isGeneratingAI && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-green dark:prose-invert max-w-none">
                  <FormattedText content={aiResponse} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
        </div>
      </div>
    </div>
  );
};

export default AIRoadmapGeneration;