import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Upload, Wand2, Sparkles } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

const Resume = () => {
  const { isAuthenticated } = useAuth();

  // Redirect non-authenticated users to AuthGuard
  if (!isAuthenticated) {
    return (
      <AuthGuard 
        title="Resume Builder & Parser"
        description="Sign in to create professional resumes or analyze your existing ones"
        featuresList={[
          "Upload and parse existing resumes",
          "Build professional resumes from scratch",
          "Get ATS readability analysis",
          "Match skills with career opportunities"
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Resume Builder & Parser
            </h1>
            <p className="text-lg text-muted-foreground">
              Create professional resumes or upload existing ones for ATS analysis
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="h-6 w-6 text-blue-600" />
                  Upload & Parse Resume
                </CardTitle>
                <CardDescription className="text-base">
                  Upload your existing resume for intelligent parsing and ATS analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-1" />
                    <p className="text-sm text-muted-foreground">
                      90%+ accuracy with Feature Scoring System
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-1" />
                    <p className="text-sm text-muted-foreground">
                      Extract skills, experience, education automatically
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-1" />
                    <p className="text-sm text-muted-foreground">
                      Get matched with relevant career opportunities
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Coming Soon...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wand2 className="h-6 w-6 text-purple-600" />
                  Build Professional Resume
                </CardTitle>
                <CardDescription className="text-base">
                  Create a stunning resume from scratch with live preview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-1" />
                    <p className="text-sm text-muted-foreground">
                      Professional templates optimized for ATS
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-1" />
                    <p className="text-sm text-muted-foreground">
                      Real-time preview while you type
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-1" />
                    <p className="text-sm text-muted-foreground">
                      Download as PDF with one click
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-md">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Coming Soon...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Powered by OpenResume Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our resume parser uses the proven OpenResume parsing algorithm with 4-step intelligent extraction:
              </p>
              <ol className="mt-4 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li><strong>Read PDF:</strong> Extract text items with position metadata using PDF.js</li>
                <li><strong>Group Text Items:</strong> Organize content into lines with noise removal</li>
                <li><strong>Section Detection:</strong> Identify resume sections (Profile, Education, Work Experience, etc.)</li>
                <li><strong>Feature Scoring:</strong> Extract attributes using machine learning-inspired scoring system</li>
              </ol>
              <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-md border">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> This feature is currently under development. We're adapting the OpenResume parser 
                  to work seamlessly with Arcade-Learn's career recommendation system.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Resume;
