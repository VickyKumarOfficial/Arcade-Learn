import React, { useEffect, useState, useCallback } from "react";
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
  BarChart3,
  X,
  CheckCircle2
} from "lucide-react";
import axios from "axios";
import { readPdf } from "@/services/resumeParser/readPdf";
import { groupTextItemsIntoLines } from "@/services/resumeParser/groupTextItemsIntoLines";
import { groupLinesIntoSections } from "@/services/resumeParser/groupLinesIntoSections";
import { extractResumeFromSections } from "@/services/resumeParser/extractResumeFromSections";
import { resumeService } from "@/services/resumeService";
import { useToast } from "@/hooks/use-toast";
import type { Resume } from "@/types/resume";

const Aim = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  
  // Resume upload states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; url: string } | null>(null);
  const [parsedResume, setParsedResume] = useState<Resume | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [isHovering, setIsHovering] = useState(false);

  // Check if user has uploaded resume
  useEffect(() => {
    const checkResumeStatus = async () => {
      if (!user?.id) {
        setResumeLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081'}/api/user/${user.id}/resume/status`
        );
        console.log("Backend url =",import.meta.env.VITE_BACKEND_URL);
        setHasResume(response.data.hasResume);
        setResumeLoading(false);
      } catch (error) {
        console.error('Error checking resume status:', error);
        setResumeLoading(false);
      }
    };

    checkResumeStatus();
  }, [user?.id]);

  // Fetch job recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id || !hasResume) return;

      try {
        setLoadingRecs(true);
        console.log('Fetching job recommendations (Aim)...', { userId: user.id, hasResume });
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081'}/api/user/${user.id}/jobs/recommendations?limit=5`
        );
        console.log("Backend url =", import.meta.env.VITE_BACKEND_URL);
        console.log('Job recommendations response (Aim):', response.data.recommendations);
        const recs = response.data?.recommendations || [];
        console.log('Setting recommendations:', recs, 'Length:', recs.length);
        setRecommendations(recs);
        setUserProfile(response.data?.userProfile || null);
      } catch (error) {
        console.error('Error fetching job recommendations:', error);
      } finally {
        setLoadingRecs(false);
      }
    };

    if (hasResume === true) {
      fetchRecommendations();
    }
  }, [user?.id, hasResume]); // Re-fetch when resume status changes

  // Handle file upload
  const handleFileChange = useCallback(async (file: File) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported");
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size must be less than 5MB");
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadError("");
    setIsProcessing(true);

    try {
      const fileUrl = URL.createObjectURL(file);
      setUploadedFile({
        name: file.name,
        size: file.size,
        url: fileUrl,
      });

      // Parse PDF
      const textItems = await readPdf(fileUrl);
      const lines = groupTextItemsIntoLines(textItems);
      const sections = groupLinesIntoSections(lines);
      const resume = extractResumeFromSections(sections);
      
      setParsedResume(resume);

      // Auto-save to backend
      if (user?.id) {
        setIsSaving(true);
        const result = await resumeService.saveResume(
          user.id,
          resume,
          file.name,
          file.size,
          fileUrl
        );

        if (result.success) {
          setHasResume(true);
          const accuracyScore = resumeService.calculateAccuracyScore(resume);
          toast({
            title: "✅ Resume Uploaded Successfully!",
            description: `Parsed with ${accuracyScore}% accuracy. Finding job matches...`,
          });
        } else {
          throw new Error(result.error || "Failed to save resume");
        }
      }
    } catch (error) {
      console.error("Error processing resume:", error);
      setUploadError("Failed to process resume. Please try again.");
      toast({
        title: "Upload failed",
        description: "Failed to process your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsSaving(false);
    }
  }, [user?.id, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsHovering(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileChange(droppedFile);
      }
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileChange(selectedFile);
      }
    },
    [handleFileChange]
  );

  const handleRemoveFile = useCallback(() => {
    if (uploadedFile?.url) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    setUploadedFile(null);
    setParsedResume(null);
    setUploadError("");
  }, [uploadedFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-[92px] sm:pt-[108px] pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                Career Hub
              </h1>
              <p className="text-lg text-muted-foreground">
                Upload your resume and discover personalized job opportunities
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Resume Upload Section - 1 column */}
              <Card className="lg:col-span-1 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Your Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Checking status...</p>
                    </div>
                  ) : isProcessing || isSaving ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
                      <p className="font-semibold text-foreground mb-1">
                        {isProcessing ? "Processing Resume..." : "Saving..."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isProcessing ? "Parsing your resume with AI" : "Storing to your profile"}
                      </p>
                    </div>
                  ) : uploadedFile && parsedResume ? (
                    <div className="space-y-4">
                      <div className="text-center py-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="font-semibold text-green-700 dark:text-green-300">Successfully Uploaded!</p>
                        <p className="text-sm text-green-600 dark:text-green-400 mb-2">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                      </div>
                      <Button 
                        onClick={handleRemoveFile}
                        variant="outline"
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Upload Different Resume
                      </Button>
                    </div>
                  ) : hasResume ? (
                    <div className="space-y-4">
                      <div className="text-center py-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="font-semibold text-green-700 dark:text-green-300">Resume Active</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Receiving job matches</p>
                      </div>
                      
                      {/* File upload dropzone for updating */}
                      <div
                        className={`border-2 border-dashed rounded-lg transition-all duration-200 ${
                          isHovering
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <div className="p-6 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium mb-1">Update Resume</p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Drop PDF here or click to browse
                          </p>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleInputChange}
                            className="hidden"
                            id="resume-update"
                          />
                          <label htmlFor="resume-update">
                            <Button type="button" size="sm" variant="outline" asChild>
                              <span>Choose File</span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* File upload dropzone */}
                      <div
                        className={`border-2 border-dashed rounded-lg transition-all duration-200 ${
                          isHovering
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <Upload className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground mb-1">Drop your resume here</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            or click to browse files
                          </p>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleInputChange}
                            className="hidden"
                            id="resume-upload"
                          />
                          <label htmlFor="resume-upload">
                            <Button type="button" asChild>
                              <span>
                                <FileText className="h-4 w-4 mr-2" />
                                Choose PDF File
                              </span>
                            </Button>
                          </label>
                          <p className="text-xs text-muted-foreground mt-3">PDF only, max 5MB</p>
                        </div>
                      </div>

                      {uploadError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                        </div>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          <span>90%+ accuracy parsing</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          <span>AI job matching</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Recommendations - 2 columns */}
              <Card className="lg:col-span-2 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Top Job Matches
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRecs ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3 text-muted-foreground">Finding perfect matches...</span>
                    </div>
                  ) : !hasResume ? (
                    <div className="text-center py-12 bg-muted/50 rounded-lg">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-semibold text-foreground mb-2">Upload Resume to See Matches</p>
                      <p className="text-sm text-muted-foreground mb-4">Get AI-powered job recommendations tailored to your skills</p>
                      <Button onClick={() => navigate('/resume')} size="sm">
                        Upload Now
                      </Button>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="text-center py-12 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                        No matches available yet
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                        Check back soon for new opportunities!
                      </p>
                      <Button onClick={() => navigate('/jobs')} variant="outline" size="sm">
                        Browse All Jobs
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.slice(0, 5).map((rec, index) => (
                        <div 
                          key={rec.id}
                          className="p-4 rounded-lg border border-border hover:border-primary transition-all cursor-pointer"
                          onClick={() => window.open(rec.url, '_blank')}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  #{index + 1}
                                </Badge>
                                <Badge className="bg-primary/20 text-primary">
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  {rec.matchPercentage}%
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-foreground truncate mb-1">
                                {rec.title}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Building2 className="h-3 w-3" />
                                <span>{rec.company_name}</span>
                                {rec.location && (
                                  <>
                                    <span>•</span>
                                    <MapPin className="h-3 w-3" />
                                    <span>{rec.location}</span>
                                  </>
                                )}
                              </div>
                              {rec.matchReason && (
                                <p className="text-xs text-muted-foreground italic truncate">
                                  {rec.matchReason}
                                </p>
                              )}
                            </div>
                            <Button size="sm" variant="default">
                              Apply
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Browse Job Board</CardTitle>
                  <CardDescription>Explore all available opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/jobs')} 
                    className="w-full"
                    variant="outline"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    View All Jobs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Build Custom Resume</CardTitle>
                  <CardDescription>Create a professional resume from scratch</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/resume-builder')} 
                    className="w-full"
                    variant="outline"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Resume Builder
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Aim;
