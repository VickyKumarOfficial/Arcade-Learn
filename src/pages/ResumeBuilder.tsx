import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { ResumeBuilderProvider } from '@/contexts/ResumeBuilderContext';
import { ProfileForm } from '@/components/ResumeBuilder/ProfileForm';
import { WorkExperiencesForm } from '@/components/ResumeBuilder/WorkExperiencesForm';
import { EducationsForm } from '@/components/ResumeBuilder/EducationsForm';
import { ProjectsForm } from '@/components/ResumeBuilder/ProjectsForm';
import { SkillsForm } from '@/components/ResumeBuilder/SkillsForm';
import { ResumePreview } from '@/components/ResumeBuilder/ResumePreview';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResumeBuilderContent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/resume')}
            className="mb-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resume Parser
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Resume Builder
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Create your professional resume with real-time preview
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Side - Forms */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-240px)] lg:max-h-[calc(100vh-200px)] pr-2 lg:pr-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <ProfileForm />
            <WorkExperiencesForm />
            <EducationsForm />
            <ProjectsForm />
            <SkillsForm />
            
            <div className="pb-8"></div>
          </div>

          {/* Right Side - Preview */}
          <div className="lg:sticky lg:top-24 lg:self-start h-fit">
            <ResumePreview />
          </div>
        </div>
      </div>
    </div>
  );
};

const ResumeBuilder = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <AuthGuard
        title="Resume Builder"
        description="Sign in to create and save your professional resume"
        featuresList={[
          "Create professional resumes",
          "Real-time preview",
          "Export as PDF or JSON",
          "Save multiple resumes"
        ]}
      />
    );
  }

  return (
    <ResumeBuilderProvider>
      <ResumeBuilderContent />
    </ResumeBuilderProvider>
  );
};

export default ResumeBuilder;
