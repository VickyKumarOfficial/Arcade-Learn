import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2,
  Calendar,
  Building2,
  Award
} from "lucide-react";
import type { Resume } from "@/types/resume";

interface ResumeDisplayProps {
  resume: Resume;
}

export const ResumeDisplay = ({ resume }: ResumeDisplayProps) => {
  const { profile, educations, workExperiences, projects, skills } = resume;

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.name && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{profile.name}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base break-all">{profile.email}</p>
                </div>
              </div>
            )}
            
            {profile.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{profile.phone}</p>
                </div>
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-base">{profile.location}</p>
                </div>
              </div>
            )}
            
            {profile.url && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Website/LinkedIn</p>
                  <a 
                    href={profile.url.startsWith('http') ? profile.url : `https://${profile.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:underline break-all"
                  >
                    {profile.url}
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {profile.summary && (
            <div className="pt-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">Summary</p>
              <p className="text-base leading-relaxed">{profile.summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education Section */}
      {educations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Education ({educations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {educations.map((education, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {education.school && (
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {education.school}
                        </h3>
                      )}
                      {education.degree && (
                        <p className="text-base text-muted-foreground mt-1">
                          {education.degree}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {education.date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {education.date}
                        </div>
                      )}
                      {education.gpa && (
                        <Badge variant="secondary" className="mt-2">
                          GPA: {education.gpa}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {education.descriptions.length > 0 && (
                    <ul className="space-y-2 mt-3">
                      {education.descriptions.map((desc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground mt-1">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Work Experience Section */}
      {workExperiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Work Experience ({workExperiences.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {workExperiences.map((work, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {work.jobTitle && (
                        <h3 className="text-lg font-semibold">{work.jobTitle}</h3>
                      )}
                      {work.company && (
                        <p className="text-base text-muted-foreground mt-1 flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {work.company}
                        </p>
                      )}
                    </div>
                    {work.date && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                        <Calendar className="h-4 w-4" />
                        {work.date}
                      </div>
                    )}
                  </div>
                  
                  {work.descriptions.length > 0 && (
                    <ul className="space-y-2 mt-3">
                      {work.descriptions.map((desc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground mt-1">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-orange-600" />
              Projects ({projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.map((project, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    {project.project && (
                      <h3 className="text-lg font-semibold">{project.project}</h3>
                    )}
                    {project.date && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                        <Calendar className="h-4 w-4" />
                        {project.date}
                      </div>
                    )}
                  </div>
                  
                  {project.descriptions.length > 0 && (
                    <ul className="space-y-2 mt-3">
                      {project.descriptions.map((desc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground mt-1">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      {(skills.featuredSkills.length > 0 || skills.descriptions.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-cyan-600" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.featuredSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Featured Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.featuredSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {skills.descriptions.length > 0 && (
              <div>
                {skills.featuredSkills.length > 0 && <Separator className="my-4" />}
                <p className="text-sm font-medium text-muted-foreground mb-3">Additional Skills</p>
                <ul className="space-y-2">
                  {skills.descriptions.map((desc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {educations.length === 0 && 
       workExperiences.length === 0 && 
       projects.length === 0 && 
       skills.featuredSkills.length === 0 && 
       skills.descriptions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No additional information found in the resume.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
