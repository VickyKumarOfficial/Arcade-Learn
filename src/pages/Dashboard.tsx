import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BACKEND_URL } from '@/config/env';
import { 
  Trophy, 
  Star, 
  Target, 
  BookOpen, 
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Flame,
  BarChart3,
  Lock,
  LogIn,
  Upload,
  FileText,
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
  ArrowRight,
  Sparkles
} from "lucide-react";
import axios from "axios";
import type { Resume } from "@/types/resume";
import { getUserLevelTag, getStarProgress } from "@/lib/gamification";
import Navigation from "@/components/Navigation";
import { UserStatsCard } from "@/components/UserStatsCard";
import { useGameTest } from "@/contexts/GameTestContext";
import { useAuth } from "@/contexts/AuthContext";
import { roadmaps } from "@/data/roadmaps";
import { useNavigate } from "react-router-dom";
import { getLevelProgress, getLevelTitle } from "@/lib/gamification";
import { 
  getRoadmapWithProgress, 
  getCompletedRoadmaps, 
  getInProgressRoadmaps
} from "@/lib/gamification";
import { 
  StreakBadge, 
  ProgressBadge
} from "@/components/StyledBadges";
import ActivityHeatmap from "@/components/ActivityHeatmap";

interface ActiveResumeRecord {
  file_name?: string;
  file_url?: string | null;
  resume_data?: Resume | null;
}

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const buildResumePreviewHtml = (resume: Resume, fileName?: string) => {
  const profile = resume.profile || {};
  const experiences = (resume.workExperiences || [])
    .map((exp) => `
      <section class="block">
        <h3>${escapeHtml(exp.jobTitle || 'Role')}</h3>
        <p class="muted">${escapeHtml(exp.company || '')}${exp.date ? ` • ${escapeHtml(exp.date)}` : ''}</p>
        ${(exp.descriptions || []).map((desc) => `<li>${escapeHtml(desc)}</li>`).join('')}
      </section>
    `)
    .join('');

  const education = (resume.educations || [])
    .map((edu) => `
      <section class="block">
        <h3>${escapeHtml(edu.institution || 'Institution')}</h3>
        <p class="muted">${escapeHtml(edu.degree || '')}${edu.date ? ` • ${escapeHtml(edu.date)}` : ''}</p>
      </section>
    `)
    .join('');

  const projects = (resume.projects || [])
    .map((proj) => `
      <section class="block">
        <h3>${escapeHtml(proj.name || 'Project')}</h3>
        <p>${escapeHtml(proj.description || '')}</p>
      </section>
    `)
    .join('');

  const skills = (resume.skills?.featuredSkills || []).map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(fileName || 'Resume')}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111827; background: #fff; }
      h1 { margin-bottom: 6px; }
      h2 { margin-top: 24px; font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
      h3 { margin: 0; font-size: 15px; }
      .muted { color: #6b7280; margin: 4px 0 0; }
      .header { margin-bottom: 12px; }
      .block { margin: 12px 0; }
      ul { margin: 8px 0 0 18px; padding: 0; }
      li { margin-bottom: 4px; }
      .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
      .chip { border: 1px solid #d1d5db; border-radius: 999px; padding: 4px 10px; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${escapeHtml(profile.name || 'Resume')}</h1>
      <p class="muted">${escapeHtml(profile.email || '')}${profile.phone ? ` • ${escapeHtml(profile.phone)}` : ''}${profile.location ? ` • ${escapeHtml(profile.location)}` : ''}</p>
    </div>

    <h2>Work Experience</h2>
    ${experiences || '<p class="muted">No work experience added.</p>'}

    <h2>Education</h2>
    ${education || '<p class="muted">No education added.</p>'}

    <h2>Skills</h2>
    <div class="chips">${skills || '<p class="muted">No skills added.</p>'}</div>

    <h2>Projects</h2>
    ${projects || '<p class="muted">No projects added.</p>'}
  </body>
</html>`;
};

const Dashboard = () => {
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [activeResume, setActiveResume] = useState<ActiveResumeRecord | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const { state } = useGameTest();
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Check if user has uploaded resume
  useEffect(() => {
    const checkResumeStatus = async () => {
      if (!user?.id) {
        setResumeLoading(false);
        return;
      }

      try {
        const [statusResponse, activeResumeResponse] = await Promise.all([
          axios.get(
          `${BACKEND_URL}/api/user/${user.id}/resume/status`
          ),
          axios.get(`${BACKEND_URL}/api/user/${user.id}/resume/active`),
        ]);
        
        setHasResume(statusResponse.data.hasResume);
        setActiveResume(activeResumeResponse.data || null);
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
        console.log('Fetching job recommendations (Dashboard)...', { userId: user.id, hasResume });
        const response = await axios.get(
          `${BACKEND_URL}/api/user/${user.id}/jobs/recommendations?limit=3`
        );
        // console.log("Backend url =", import.meta.env.VITE_BACKEND_URL);
        console.log('Job recommendations response (Dashboard):', response.data.recommendations);
        const recs = response.data?.recommendations || [];
        console.log('Setting recommendations:', recs, 'Length:', recs.length);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching job recommendations:', error);
      } finally {
        setLoadingRecs(false);
      }
    };

    if (hasResume === true) {
      fetchRecommendations();
    }
  }, [user?.id, hasResume]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 sm:pt-20 pb-12">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <Card className="bg-card backdrop-blur-sm border border-border shadow-lg p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 sm:pt-20 pb-12">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <Card className="bg-card backdrop-blur-sm border border-border shadow-xl max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Dashboard Access Required
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Please log in to view your learning dashboard, track your progress, and start your learning journey.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    size="lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In to Continue
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/signup')}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Create New Account
                  </Button>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      New to ArcadeLearn?
                    </p>
                    <Button 
                      onClick={() => navigate('/roadmaps')}
                      variant="ghost"
                      className="w-full text-primary hover:text-primary/90 hover:bg-primary/10"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Learning Roadmaps
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate stats with new scoring system
  const totalScore = state.userData.totalScore;
  const totalStars = state.userData.totalStars;
  const levelTag = getUserLevelTag(totalScore);
  const starProgress = getStarProgress(totalScore);
  
  // Calculate completed roadmaps with real-time data
  const completedRoadmaps = getCompletedRoadmaps(state.userData.completedComponents);
  const inProgressRoadmaps = getInProgressRoadmaps(state.userData.completedComponents);
  const roadmapsWithProgress = getRoadmapWithProgress(state.userData.completedComponents);
  
  // Calculate overall progress
  const totalComponents = roadmaps.reduce((total, roadmap) => total + roadmap.components.length, 0);
  const completedComponentsCount = state.userData.totalComponentsCompleted;
  const overallProgress = totalComponents > 0 ? (completedComponentsCount / totalComponents) * 100 : 0;

  // Get recent badges (last 5 unlocked)
  const recentBadges = state.userData.badges
    .filter(badge => badge.unlocked)
    .sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    })
    .slice(0, 5);

  const totalUnlockedBadges = state.userData.badges.filter(b => b.unlocked).length;

  const handleViewResume = () => {
    const fileUrl = activeResume?.file_url;
    if (fileUrl && /^(https?:|blob:|data:)/i.test(fileUrl)) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const resumeData = activeResume?.resume_data;
    if (resumeData) {
      const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (previewWindow) {
        previewWindow.document.open();
        previewWindow.document.write(
          buildResumePreviewHtml(resumeData, activeResume?.file_name || 'Resume Preview')
        );
        previewWindow.document.close();
      }
      return;
    }

    navigate('/resume-builder');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Badges Modal */}
      {showAllAchievements && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Badge system coming soon!</p>
              <Button onClick={() => setShowAllAchievements(false)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="pt-16 sm:pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Track your learning progress and achievements
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <UserStatsCard userData={state.userData} />
            </div>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed Roadmaps</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{completedRoadmaps.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{inProgressRoadmaps.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Components</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{completedComponentsCount}/{totalComponents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Heatmap */}
          {user?.id && (
            <div className="mb-8 w-full">
              <ActivityHeatmap userId={user.id} />
            </div>
          )}

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Upload Resume Card */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Upload Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[320px]">
                {resumeLoading ? (
                  <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Checking resume...</p>
                  </div>
                ) : hasResume ? (
                  <div className="h-full min-h-[260px] flex flex-col justify-between gap-4">
                    <div className="rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50/70 dark:bg-green-950/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-500/15">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">
                              Resume Uploaded
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Your resume is parsed and ready for job matching
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30">
                          Active
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-200/60 dark:border-blue-800/50 bg-blue-50/70 dark:bg-blue-950/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                      Keep your resume updated for better role relevance.
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={handleViewResume}
                        className="w-full bg-black hover:bg-black/90 text-white dark:bg-black dark:hover:bg-black/90"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                      </Button>
                      <Button 
                        onClick={() => navigate('/aim')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Update Resume
                      </Button>
                    </div>

                    <Button
                      onClick={() => navigate('/resume-builder')}
                      variant="outline"
                      className="w-full"
                    >
                      Build Resume
                    </Button>
                  </div>
                ) : (
                  <div className="h-full min-h-[260px] flex flex-col justify-between gap-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15">
                          <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            No Resume Yet
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Upload your resume to unlock personalized job recommendations
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white/70 dark:bg-gray-900/40">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          90%+ parsing
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white/70 dark:bg-gray-900/40">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Target className="h-4 w-4 text-blue-500" />
                          AI matching
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white/70 dark:bg-gray-900/40">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Briefcase className="h-4 w-4 text-green-500" />
                          Instant recs
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => navigate('/aim')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resume
                      </Button>
                      <Button
                        onClick={() => navigate('/resume-builder')}
                        variant="outline"
                        className="w-full"
                      >
                        Build Resume
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Recommendations Card */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                  Job Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Finding matches...</p>
                  </div>
                ) : !hasResume ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="text-5xl">💼</div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Upload Resume First
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Get personalized job recommendations based on your skills and experience
                      </div>
                    </div>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="text-5xl">🔍</div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Matches Yet
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Check back soon for new opportunities
                      </div>
                      <Button 
                        onClick={() => navigate('/jobs')}
                        variant="outline"
                        size="sm"
                      >
                        Browse All Jobs
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((rec, index) => (
                      <div 
                        key={rec.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer"
                        onClick={() => window.open(rec.url, '_blank')}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {rec.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {rec.company_name}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs flex-shrink-0">
                            {rec.matchPercentage}% match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{rec.location}</span>
                        </div>
                      </div>
                    ))}
                    <Button 
                      onClick={() => navigate('/aim')}
                      variant="outline"
                      className="w-full mt-2"
                      size="sm"
                    >
                      View All Recommendations
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Badges Section */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Badges
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllAchievements(true)}
                  className="text-sm"
                >
                  View All ({totalUnlockedBadges})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentBadges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center"
                    >
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <div className="font-semibold text-sm">{badge.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No badges earned yet.</p>
                  <p className="text-sm mt-1">Complete your first test to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Courses Section */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Completed Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedRoadmaps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedRoadmaps.map((roadmap) => (
                    <div 
                      key={roadmap.id}
                      className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-500"
                      onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-xl shadow-lg`}>
                        {roadmap.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {roadmap.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {roadmap.components.length} components • {roadmap.difficulty}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Completed
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-yellow-500">⭐</span>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {roadmap.components.length} components
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No completed courses yet.</p>
                  <p className="text-sm mt-1">Start learning to see your completed roadmaps here!</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/roadmaps')}
                  >
                    Browse Roadmaps
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* In Progress Courses */}
          {inProgressRoadmaps.length > 0 && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  In Progress Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inProgressRoadmaps.map((roadmap) => {
                    const completedCount = roadmap.components.filter(comp => comp.completed).length;
                    const progressPercent = (completedCount / roadmap.components.length) * 100;
                    
                    return (
                      <div 
                        key={roadmap.id}
                        className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-500"
                        onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-xl shadow-lg`}>
                          {roadmap.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {roadmap.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {completedCount}/{roadmap.components.length} components • {roadmap.difficulty}
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {Math.round(progressPercent)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
