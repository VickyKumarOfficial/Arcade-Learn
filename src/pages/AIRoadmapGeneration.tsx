import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Route, Target, Zap, BookOpen, TrendingUp, Clock, Star, AlertCircle, CheckCircle, Loader2, ExternalLink, Video, FileText, Code, Award, Bookmark, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { aiRoadmapService } from '@/services/aiRoadmapService';
import { aiService } from '@/services/aiService';
import { supabase } from '@/lib/supabase';
import FormattedText from '@/components/FormattedText';

interface LearningResource {
  id: string;
  title: string;
  type: 'Video' | 'Course' | 'Documentation' | 'Book' | 'Practice' | 'Interactive' | 'Tutorial';
  url: string;
  duration: string;
  cost: 'Free' | 'Paid';
  description: string;
}

interface RoadmapRecommendation {
  id: string;
  priority: number;
  score: number;
  estimatedWeeks: number;
  weeklyHours: number;
  reasoning: string;
  resources?: LearningResource[];
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
  const navigate = useNavigate();
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

    console.log('🔍 Checking survey data for user:', user.id);

    try {
      // First try the aiRoadmapService (backend approach)
      console.log('🔄 Trying backend survey check...');
      const result = await aiRoadmapService.getUserSurveyData(user.id);
      if (result.success && result.data) {
        // Validate that we have meaningful survey data
        const hasValidData = result.data && 
          typeof result.data === 'object' && 
          Object.keys(result.data).length > 0;
        
        if (hasValidData) {
          setSurveyData(result.data);
          console.log('✅ Survey data found via backend:', result.data);
          return;
        }
      }

      // Fallback: Direct Supabase query if backend fails
      console.log('🔄 Backend failed, trying direct Supabase query...');
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('user_survey_responses')
        .select('responses')
        .eq('user_id', user.id)
        .eq('is_latest', true)
        .single();

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        console.error('❌ Supabase survey query error:', supabaseError);
        setSurveyData(null);
        return;
      }

      if (supabaseData?.responses) {
        console.log('✅ Survey data found via Supabase:', supabaseData.responses);
        setSurveyData(supabaseData.responses);
      } else {
        console.log('⚠️ No survey data found for user:', user.id);
        setSurveyData(null);
      }
    } catch (error) {
      console.error('❌ Error checking survey data:', error);
      setSurveyData(null);
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

  const downloadRoadmapPDF = async () => {
    if (!user?.id) {
      setError('Please sign in to download your roadmap');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:8081/api/user/${user.id}/roadmap/download-pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ArcadeLearn_Roadmap_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('PDF download error:', error);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video className="h-4 w-4" />;
      case 'Course':
        return <Award className="h-4 w-4" />;
      case 'Documentation':
        return <FileText className="h-4 w-4" />;
      case 'Book':
        return <BookOpen className="h-4 w-4" />;
      case 'Practice':
      case 'Interactive':
        return <Code className="h-4 w-4" />;
      default:
        return <Bookmark className="h-4 w-4" />;
    }
  };

  const getResourceIconColor = (type: string) => {
    switch (type) {
      case 'Video':
        return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300';
      case 'Course':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300';
      case 'Documentation':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300';
      case 'Book':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300';
      case 'Practice':
      case 'Interactive':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300';
    }
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
                      onClick={() => navigate('/dashboard')}
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
                          <strong>Your Profile:</strong> {surveyData.userType || 'User'} • {surveyData.skillLevel || 'Beginner'} • 
                          {Array.isArray(surveyData.techInterest) 
                            ? surveyData.techInterest.slice(0, 2).join(', ') + (surveyData.techInterest.length > 2 ? '...' : '')
                            : surveyData.techInterest || 'General Interest'
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
              {/* Download PDF Button */}
              <div className="flex justify-end">
                <Button
                  onClick={downloadRoadmapPDF}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download as PDF
                    </>
                  )}
                </Button>
              </div>

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
                <div className="grid grid-cols-1 gap-8">
                  {recommendations.roadmaps.map((roadmap, index) => (
                    <Card key={roadmap.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {roadmap.priority}
                            </div>
                            <span className="text-xl">
                              {roadmap.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span className="text-sm font-semibold">{Math.round(roadmap.score * 100)}% Match</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Roadmap Description */}
                          <p className="text-gray-600 dark:text-gray-300">
                            {roadmap.reasoning}
                          </p>

                          {/* Time Estimates */}
                          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-blue-500" />
                              <span className="font-medium">{roadmap.estimatedWeeks} weeks</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-5 w-5 text-green-500" />
                              <span className="font-medium">{roadmap.weeklyHours}h/week</span>
                            </div>
                          </div>

                          {/* Learning Resources */}
                          {roadmap.resources && roadmap.resources.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-lg flex items-center space-x-2">
                                <Bookmark className="h-5 w-5 text-purple-600" />
                                <span>Curated Learning Resources</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {roadmap.resources.map((resource) => (
                                  <a
                                    key={resource.id}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start space-x-3 flex-1">
                                        <div className={`p-2 rounded-lg ${getResourceIconColor(resource.type)}`}>
                                          {getResourceIcon(resource.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {resource.title}
                                          </h5>
                                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                            {resource.description}
                                          </p>
                                          <div className="flex items-center space-x-3 mt-2 text-xs">
                                            <span className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                                              <Clock className="h-3 w-3" />
                                              <span>{resource.duration}</span>
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                                              resource.cost === 'Free' 
                                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                                                : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                                            }`}>
                                              {resource.cost}
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500">
                                              {resource.type}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
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