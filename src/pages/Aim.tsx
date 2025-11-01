import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Upload,
  Wand2,
  ArrowRight,
  Target,
  Sparkles,
  Briefcase,
  TrendingUp,
  MapPin,
  DollarSign,
  ExternalLink,
  Loader2,
  Building2,
  BarChart3
} from "lucide-react";
import axios from "axios";

const Aim = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch job recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) return;

      try {
        setLoadingRecs(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081'}/api/user/${user.id}/jobs/recommendations?limit=5`
        );
        
        setRecommendations(response.data.recommendations || []);
        setUserProfile(response.data.userProfile || null);
      } catch (error) {
        console.error('Error fetching job recommendations:', error);
      } finally {
        setLoadingRecs(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchRecommendations();
    }
  }, [isAuthenticated, user?.id]);

  // Redirect non-authenticated users to AuthGuard
  if (!isAuthenticated) {
    return <AuthGuard 
      title="Define Your Career Aim"
      description="Sign in to access resume builder and career planning tools"
      featuresList={[
        "Build professional resumes",
        "Upload and parse existing resumes",
        "Get ATS readiness analysis",
        "Match skills with career opportunities"
      ]}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Career Aim
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Build your professional resume and plan your career journey
            </p>
          </div>

          {/* Main Content - Resume Management */}
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                Resume Management
              </CardTitle>
              <CardDescription className="text-base">
                Create professional resumes or upload existing ones for ATS analysis and career matching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload & Parse Resume Card */}
                <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Upload className="h-5 w-5 text-blue-600" />
                      Upload & Parse Resume
                    </CardTitle>
                    <CardDescription>
                      Upload your existing resume for intelligent parsing and ATS analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p>90%+ accuracy with Feature Scoring System</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p>Extract skills, experience, education automatically</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p>Get matched with relevant career opportunities</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate('/resume')} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Resume
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Build Professional Resume Card */}
                <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wand2 className="h-5 w-5 text-purple-600" />
                      Build Professional Resume
                    </CardTitle>
                    <CardDescription>
                      Create a stunning resume from scratch with live preview
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p>Professional templates optimized for ATS</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p>Real-time preview while you type</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p>Export as PDF or JSON instantly</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate('/resume-builder')} 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      size="lg"
                    >
                      <Wand2 className="h-5 w-5 mr-2" />
                      Build Resume
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Why Choose Our Resume Tools?
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <p className="font-medium mb-1">🎯 ATS-Optimized</p>
                    <p className="text-xs">Ensure your resume passes Applicant Tracking Systems</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">🚀 Career Matching</p>
                    <p className="text-xs">Get matched with relevant job opportunities</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">📊 Smart Analysis</p>
                    <p className="text-xs">AI-powered parsing with 90%+ accuracy</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">💾 Secure Storage</p>
                    <p className="text-xs">Your resume data is safely stored and encrypted</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Recommendations Section - NEW */}
          <Card className="mb-8 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Briefcase className="h-7 w-7 text-green-600 dark:text-green-400" />
                Job Recommendations
              </CardTitle>
              <CardDescription className="text-base">
                Get AI-powered job recommendations matched to your skills, experience, and career goals from our curated job board
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-300 dark:border-green-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  How It Works
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Upload Your Resume</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Our AI extracts your skills, experience, and career details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">AI Analyzes Job Market</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">We scan thousands of jobs from top companies daily</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Get Matched Opportunities</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive personalized job recommendations ranked by relevance</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Skill Matching</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Jobs matched based on your technical and soft skills
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Location Preference</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Filter by location, remote, hybrid, or on-site options
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Salary Insights</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View salary ranges for positions that match your profile
                  </p>
                </div>
              </div>

              {/* Top Matched Jobs - Dynamic */}
              {loadingRecs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  <span className="ml-3 text-muted-foreground">Finding perfect matches for you...</span>
                </div>
              ) : recommendations.length > 0 ? (
                <div id="recommendations" className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      🎯 Top Matches For You
                    </h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {recommendations.length} opportunities
                    </Badge>
                  </div>

                  {recommendations.map((job, index) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">#{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
                                  {job.title}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <Building2 className="h-4 w-4" />
                                  <span>{job.company_name}</span>
                                  {job.location && (
                                    <>
                                      <span>•</span>
                                      <MapPin className="h-4 w-4" />
                                      <span>{job.location}</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <BarChart3 className="h-3 w-3 mr-1" />
                                    {job.matchPercentage}% Match
                                  </Badge>
                                  <Badge variant="outline">{job.type}</Badge>
                                  {job.salary && (
                                    <Badge variant="secondary">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      {job.salary}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                  {job.matchReason}
                                </p>
                              </div>
                            </div>
                          </div>
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                              Apply
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="text-center pt-4">
                    <Button
                      onClick={() => navigate('/jobs')}
                      variant="outline"
                      size="lg"
                      className="border-green-300 dark:border-green-700"
                    >
                      View All {recommendations.length > 0 ? `${recommendations.length}+` : ''} Job Opportunities
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : userProfile ? (
                <div className="text-center py-8 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                    No job recommendations available yet.
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Check back soon! We're constantly adding new opportunities.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Upload className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <p className="text-blue-900 dark:text-blue-100 font-semibold mb-2">
                    Upload your resume to get personalized recommendations
                  </p>
                  <Button
                    onClick={() => navigate('/resume')}
                    className="mt-3 bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume Now
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/jobs')}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold"
                  size="lg"
                >
                  <Briefcase className="h-5 w-5 mr-2" />
                  Browse All Jobs
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                {userProfile && (
                  <Button
                    onClick={() => document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="outline"
                    className="flex-1 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                    size="lg"
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {recommendations.length > 0 ? `View ${recommendations.length} Matches` : 'Check Recommendations'}
                  </Button>
                )}
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong className="text-blue-600 dark:text-blue-400">💡 Pro Tip:</strong> Keep your resume updated to receive the most accurate job recommendations. Our AI learns from your profile to suggest better matches over time!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Quick Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-medium mb-1">Keep It Updated</p>
                    <p className="text-xs">Regularly update your resume with new skills and experiences</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <p className="font-medium mb-1">Use Professional Format</p>
                    <p className="text-xs">Choose clean, ATS-friendly templates</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <p className="font-medium mb-1">Tailor for Each Job</p>
                    <p className="text-xs">Customize your resume for specific positions</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="font-medium mb-1">Highlight Achievements</p>
                    <p className="text-xs">Use metrics and concrete examples</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Aim;
