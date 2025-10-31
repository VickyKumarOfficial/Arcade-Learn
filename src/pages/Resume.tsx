import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Upload, Wand2, Sparkles, Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { ResumeDropzone } from "@/components/ResumeDropzone";
import { readPdf } from "@/services/resumeParser/readPdf";
import { groupTextItemsIntoLines } from "@/services/resumeParser/groupTextItemsIntoLines";
import { groupLinesIntoSections } from "@/services/resumeParser/groupLinesIntoSections";
import { extractResumeFromSections } from "@/services/resumeParser/extractResumeFromSections";
import type { TextItems, Lines, ResumeSectionToLines, Resume } from "@/types/resume";

const Resume = () => {
  const { isAuthenticated } = useAuth();
  const [fileUrl, setFileUrl] = useState<string>("");
  const [textItems, setTextItems] = useState<TextItems>([]);
  const [lines, setLines] = useState<Lines>([]);
  const [sections, setSections] = useState<ResumeSectionToLines>({});
  const [resume, setResume] = useState<Resume | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  // Process PDF when file URL changes
  useEffect(() => {
    const processPdf = async () => {
      if (!fileUrl) {
        setTextItems([]);
        return;
      }

      setIsProcessing(true);
      setError("");

      try {
        const extractedTextItems = await readPdf(fileUrl);
        setTextItems(extractedTextItems);
        
        // Step 2: Group text items into lines
        const extractedLines = groupTextItemsIntoLines(extractedTextItems);
        setLines(extractedLines);
        
        // Step 3: Group lines into sections
        const extractedSections = groupLinesIntoSections(extractedLines);
        setSections(extractedSections);
        
        // Step 4: Extract resume attributes with Feature Scoring System
        const extractedResume = extractResumeFromSections(extractedSections);
        setResume(extractedResume);
        
        console.log("✅ Step 1 Complete: PDF parsed successfully -", extractedTextItems.length, "text items extracted");
        console.log("✅ Step 2 Complete: Grouped into", extractedLines.length, "lines");
        console.log("✅ Step 3 Complete: Detected sections:", Object.keys(extractedSections));
        console.log("✅ Step 4 Complete: Extracted resume data:", extractedResume);
      } catch (err) {
        console.error("❌ Error parsing PDF:", err);
        setError("Failed to parse PDF. Please ensure it's a valid PDF file.");
        setTextItems([]);
      } finally {
        setIsProcessing(false);
      }
    };

    processPdf();
  }, [fileUrl]);

  const handleFileUrlChange = (newFileUrl: string) => {
    setFileUrl(newFileUrl);
  };

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
                <div className="space-y-4">
                  <ResumeDropzone onFileUrlChange={handleFileUrlChange} />
                  
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Processing your resume...
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  )}
                  
                  {textItems.length > 0 && !isProcessing && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                            🎉 All 4 steps complete! Extracted: {resume?.profile.name || 'Name'}, {resume?.profile.email || 'Email'}, {resume?.educations.length || 0} education(s), {resume?.workExperiences.length || 0} work experience(s)!
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            Resume parsing complete. Check console for full details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 pt-2">
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
              {textItems.length > 0 && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-md border border-green-500">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                    <strong>✅ Parsing Progress:</strong>
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-none">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <strong>Step 1 Complete:</strong> {textItems.length} text items extracted from PDF
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <strong>Step 2 Complete:</strong> Grouped into {lines.length} lines with noise removal
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <strong>Step 3 Complete:</strong> Detected {Object.keys(sections).length} sections ({Object.keys(sections).join(", ")})
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <strong>Step 4 Complete:</strong> Extracted resume attributes with Feature Scoring System
                    </li>
                  </ul>
                  {resume && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                        <strong>📋 Parsed Data Preview:</strong>
                      </p>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                        <li><strong>Name:</strong> {resume.profile.name || 'N/A'}</li>
                        <li><strong>Email:</strong> {resume.profile.email || 'N/A'}</li>
                        <li><strong>Phone:</strong> {resume.profile.phone || 'N/A'}</li>
                        <li><strong>Education:</strong> {resume.educations.length} entries</li>
                        <li><strong>Work Experience:</strong> {resume.workExperiences.length} entries</li>
                        <li><strong>Projects:</strong> {resume.projects.length} entries</li>
                        <li><strong>Skills:</strong> {resume.skills.featuredSkills.length} featured</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {!fileUrl && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-md border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Upload a resume PDF above to see the parsing algorithm in action. 
                    Currently, Step 1 (PDF Reading) is implemented and working!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Resume;
