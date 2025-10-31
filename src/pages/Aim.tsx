import React from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Upload,
  Wand2,
  ArrowRight,
  Target,
  Sparkles
} from "lucide-react";

const Aim = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
