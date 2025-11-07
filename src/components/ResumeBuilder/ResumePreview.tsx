import { useResumeBuilder } from '@/contexts/ResumeBuilderContext';
import { Download, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { resumeService } from '@/services/resumeService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const ResumePreview = () => {
  const { resume, settings } = useResumeBuilder();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [scale, setScale] = useState(0.75);

  const handleDownload = () => {
    const dataStr = JSON.stringify(resume, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resume.profile.name || 'resume'}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save your resume',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const accuracyScore = resumeService.calculateAccuracyScore(resume);
      const result = await resumeService.saveResume(
        user.id,
        resume,
        'custom-resume.pdf',
        0,
        ''
      );

      toast({
        title: 'Success!',
        description: 'Resume saved successfully',
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to save resume',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sticky top-4 flex flex-col gap-4">
      {/* Control Bar */}
      <Card className="p-4 bg-card dark:bg-gray-800 border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="dark:border-gray-600 dark:hover:bg-gray-700"
            >
              -
            </Button>
            <span className="text-sm font-medium w-12 text-center text-foreground">{Math.round(scale * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.min(1.2, scale + 0.1))}
              className="dark:border-gray-600 dark:hover:bg-gray-700"
            >
              +
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Resume
            </Button>
          </div>
        </div>
      </Card>

      {/* Resume Preview */}
      <Card className="p-4 sm:p-6 lg:p-8 bg-card dark:bg-gray-800 border-border overflow-x-auto">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
          className="w-full max-w-[8.5in] min-h-[11in] mx-auto bg-white shadow-lg p-8 sm:p-10 lg:p-12"
        >
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-4" style={{ borderColor: settings.themeColor }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: settings.themeColor }}>
              {resume.profile.name || 'Your Name'}
            </h1>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-700">
              {resume.profile.email && <span>{resume.profile.email}</span>}
              {resume.profile.phone && <span>•</span>}
              {resume.profile.phone && <span>{resume.profile.phone}</span>}
              {resume.profile.location && <span>•</span>}
              {resume.profile.location && <span>{resume.profile.location}</span>}
              {resume.profile.url && <span>•</span>}
              {resume.profile.url && <span className="text-blue-600">{resume.profile.url}</span>}
            </div>
          </div>

          {/* Summary */}
          {resume.profile.summary && (
            <div className="mb-6">
              <p className="text-sm text-gray-700 leading-relaxed">{resume.profile.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {settings.formToShow.workExperiences && resume.workExperiences.some(exp => exp.company) && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-8" style={{ backgroundColor: settings.themeColor }}></div>
                <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: settings.themeColor }}>
                  {settings.formToHeading.workExperiences}
                </h2>
              </div>
              {resume.workExperiences.map((exp, idx) => (
                exp.company && (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900">{exp.company}</h3>
                      <span className="text-sm text-gray-600">{exp.date}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{exp.jobTitle}</p>
                    {exp.descriptions.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {exp.descriptions.map((desc, i) => (
                          desc && <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Education */}
          {settings.formToShow.educations && resume.educations.some(edu => edu.school) && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-8" style={{ backgroundColor: settings.themeColor }}></div>
                <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: settings.themeColor }}>
                  {settings.formToHeading.educations}
                </h2>
              </div>
              {resume.educations.map((edu, idx) => (
                edu.school && (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900">{edu.school}</h3>
                      <span className="text-sm text-gray-600">{edu.date}</span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-700">{edu.degree}</p>
                      {edu.gpa && <span className="text-sm text-gray-600">GPA: {edu.gpa}</span>}
                    </div>
                    {edu.descriptions.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {edu.descriptions.map((desc, i) => (
                          desc && <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Projects */}
          {settings.formToShow.projects && resume.projects.some(proj => proj.project) && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-8" style={{ backgroundColor: settings.themeColor }}></div>
                <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: settings.themeColor }}>
                  {settings.formToHeading.projects}
                </h2>
              </div>
              {resume.projects.map((proj, idx) => (
                proj.project && (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900">{proj.project}</h3>
                      <span className="text-sm text-gray-600">{proj.date}</span>
                    </div>
                    {proj.descriptions.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {proj.descriptions.map((desc, i) => (
                          desc && <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Skills */}
          {settings.formToShow.skills && resume.skills.descriptions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-8" style={{ backgroundColor: settings.themeColor }}></div>
                <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: settings.themeColor }}>
                  {settings.formToHeading.skills}
                </h2>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {resume.skills.descriptions.map((skill, idx) => (
                  skill && <li key={idx}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
