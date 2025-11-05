import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  Calendar,
  Shield,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Target,
  Star,
  BookOpen,
  Plus,
  Link as LinkIcon,
  Github,
  Linkedin
} from "lucide-react";

interface EditableField {
  firstName: boolean;
  lastName: boolean;
  phone: boolean;
}

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState<EditableField>({
    firstName: false,
    lastName: false,
    phone: false,
  });
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);

  // Profile Data States
  const [personalDetails, setPersonalDetails] = useState({
    bio: "",
    location: "",
    dateOfBirth: "",
    currentEducation: "",
    currentCompany: "",
    jobTitle: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: ""
  });

  const [skills, setSkills] = useState<Skill[]>([
    { name: "JavaScript", level: "Intermediate" },
    { name: "React", level: "Intermediate" }
  ]);

  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>([
    "JavaScript", "Python"
  ]);

  const [frameworksTools, setFrameworksTools] = useState<string[]>([
    "React", "Node.js", "Git"
  ]);

  const [interests, setInterests] = useState({
    areasOfInterest: ["Web Development", "AI/ML"],
    careerGoals: ["Get a job", "Build projects"],
    learningPreferences: ["Videos", "Projects"]
  });

  // Edit states for sections
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Temporary input states
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [newLanguage, setNewLanguage] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newPreference, setNewPreference] = useState("");

  // Redirect non-authenticated users to AuthGuard
  if (!isAuthenticated) {
    return <AuthGuard 
      title="Access Your Profile"
      description="Sign in to view and manage your profile information"
      featuresList={[
        "View your personal information",
        "Update your details", 
        "Manage account settings",
        "Access learning dashboard"
      ]}
    />;
  }

  const handleEdit = (field: keyof EditableField) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field: keyof EditableField) => {
    setEditMode(prev => ({ ...prev, [field]: false }));
    setFormData(prev => ({
      ...prev,
      [field]: user?.[field] || "",
    }));
  };

  const handleSave = async (field: keyof EditableField) => {
    setLoading(true);
    try {
      await updateProfile({ [field]: formData[field] });
      setEditMode(prev => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      // Reset to original value on error
      setFormData(prev => ({
        ...prev,
        [field]: user?.[field] || "",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditableField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Section editing handlers
  const handleEditSection = (section: string) => {
    setEditingSection(section);
  };

  const handleSaveSection = (section: string) => {
    setEditingSection(null);
    // TODO: Save to backend when ready
    console.log('Saving section:', section);
  };

  const handleCancelSection = () => {
    setEditingSection(null);
  };

  // Skill handlers
  const addSkill = () => {
    if (newSkillName.trim()) {
      setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
      setNewSkillName("");
      setNewSkillLevel("Beginner");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Language handlers
  const addLanguage = () => {
    if (newLanguage.trim() && !programmingLanguages.includes(newLanguage.trim())) {
      setProgrammingLanguages([...programmingLanguages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    setProgrammingLanguages(programmingLanguages.filter(l => l !== lang));
  };

  // Tool handlers
  const addTool = () => {
    if (newTool.trim() && !frameworksTools.includes(newTool.trim())) {
      setFrameworksTools([...frameworksTools, newTool.trim()]);
      setNewTool("");
    }
  };

  const removeTool = (tool: string) => {
    setFrameworksTools(frameworksTools.filter(t => t !== tool));
  };

  // Interest handlers
  const addInterest = () => {
    if (newInterest.trim() && !interests.areasOfInterest.includes(newInterest.trim())) {
      setInterests({
        ...interests,
        areasOfInterest: [...interests.areasOfInterest, newInterest.trim()]
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests({
      ...interests,
      areasOfInterest: interests.areasOfInterest.filter(i => i !== interest)
    });
  };

  // Goal handlers
  const addGoal = () => {
    if (newGoal.trim() && !interests.careerGoals.includes(newGoal.trim())) {
      setInterests({
        ...interests,
        careerGoals: [...interests.careerGoals, newGoal.trim()]
      });
      setNewGoal("");
    }
  };

  const removeGoal = (goal: string) => {
    setInterests({
      ...interests,
      careerGoals: interests.careerGoals.filter(g => g !== goal)
    });
  };

  // Preference handlers
  const addPreference = () => {
    if (newPreference.trim() && !interests.learningPreferences.includes(newPreference.trim())) {
      setInterests({
        ...interests,
        learningPreferences: [...interests.learningPreferences, newPreference.trim()]
      });
      setNewPreference("");
    }
  };

  const removePreference = (pref: string) => {
    setInterests({
      ...interests,
      learningPreferences: interests.learningPreferences.filter(p => p !== pref)
    });
  };

  const renderEditableField = (
    field: keyof EditableField,
    label: string,
    icon: React.ReactNode,
    value: string,
    placeholder: string
  ) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="flex items-center gap-3">
        {editMode[field] ? (
          <>
            <Input
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
              disabled={loading}
            />
            <Button
              size="sm"
              onClick={() => handleSave(field)}
              disabled={loading || !formData[field].trim()}
              className="px-4 py-2"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancel(field)}
              disabled={loading}
              className="px-4 py-2"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-gray-900 dark:text-white">
                {value || `No ${label.toLowerCase()} provided`}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(field)}
              className="px-4 py-2"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="pt-16 sm:pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your personal information and account settings
              </p>
            </div>
            
            {/* Profile Header Card */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                      {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Account Active
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center md:justify-start gap-2 text-lg mb-4">
                      <Mail className="h-5 w-5" />
                      {user?.email}
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Member since October 2024
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Verified Account
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="h-6 w-6" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </div>
                  {editingSection !== 'personal' ? (
                    <Button onClick={() => handleEditSection('personal')} variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Section
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveSection('personal')} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancelSection} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  {renderEditableField(
                    "firstName",
                    "First Name",
                    <User className="h-4 w-4" />,
                    user?.firstName || "",
                    "Enter your first name"
                  )}
                  
                  {renderEditableField(
                    "lastName",
                    "Last Name",
                    <User className="h-4 w-4" />,
                    user?.lastName || "",
                    "Enter your last name"
                  )}
                </div>

                {/* Contact & Location */}
                <div className="grid md:grid-cols-2 gap-6">
                  {renderEditableField(
                    "phone",
                    "Phone Number",
                    <Phone className="h-4 w-4" />,
                    user?.phone || "",
                    "Enter your phone number"
                  )}
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    {editingSection === 'personal' ? (
                      <Input
                        value={personalDetails.location}
                        onChange={(e) => setPersonalDetails({...personalDetails, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                        <p className="text-gray-900 dark:text-white">
                          {personalDetails.location || "No location provided"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Bio
                  </Label>
                  {editingSection === 'personal' ? (
                    <Textarea
                      value={personalDetails.bio}
                      onChange={(e) => setPersonalDetails({...personalDetails, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border min-h-[100px]">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {personalDetails.bio || "No bio provided"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Education & Work */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Current Education
                    </Label>
                    {editingSection === 'personal' ? (
                      <Input
                        value={personalDetails.currentEducation}
                        onChange={(e) => setPersonalDetails({...personalDetails, currentEducation: e.target.value})}
                        placeholder="e.g., B.Tech CSE, Year 3"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                        <p className="text-gray-900 dark:text-white">
                          {personalDetails.currentEducation || "Not specified"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Current Company
                    </Label>
                    {editingSection === 'personal' ? (
                      <Input
                        value={personalDetails.currentCompany}
                        onChange={(e) => setPersonalDetails({...personalDetails, currentCompany: e.target.value})}
                        placeholder="Company name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                        <p className="text-gray-900 dark:text-white">
                          {personalDetails.currentCompany || "Not working"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Social Profiles
                  </Label>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      {editingSection === 'personal' ? (
                        <Input
                          value={personalDetails.githubUrl}
                          onChange={(e) => setPersonalDetails({...personalDetails, githubUrl: e.target.value})}
                          placeholder="https://github.com/username"
                          className="flex-1"
                        />
                      ) : (
                        <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                          {personalDetails.githubUrl ? (
                            <a href={personalDetails.githubUrl} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 dark:text-blue-400 hover:underline">
                              {personalDetails.githubUrl}
                            </a>
                          ) : (
                            <span className="text-gray-500">No GitHub profile</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Linkedin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      {editingSection === 'personal' ? (
                        <Input
                          value={personalDetails.linkedinUrl}
                          onChange={(e) => setPersonalDetails({...personalDetails, linkedinUrl: e.target.value})}
                          placeholder="https://linkedin.com/in/username"
                          className="flex-1"
                        />
                      ) : (
                        <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                          {personalDetails.linkedinUrl ? (
                            <a href={personalDetails.linkedinUrl} target="_blank" rel="noopener noreferrer"
                               className="text-blue-600 dark:text-blue-400 hover:underline">
                              {personalDetails.linkedinUrl}
                            </a>
                          ) : (
                            <span className="text-gray-500">No LinkedIn profile</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      {editingSection === 'personal' ? (
                        <Input
                          value={personalDetails.portfolioUrl}
                          onChange={(e) => setPersonalDetails({...personalDetails, portfolioUrl: e.target.value})}
                          placeholder="https://yourportfolio.com"
                          className="flex-1"
                        />
                      ) : (
                        <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                          {personalDetails.portfolioUrl ? (
                            <a href={personalDetails.portfolioUrl} target="_blank" rel="noopener noreferrer"
                               className="text-blue-600 dark:text-blue-400 hover:underline">
                              {personalDetails.portfolioUrl}
                            </a>
                          ) : (
                            <span className="text-gray-500">No portfolio</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Code className="h-6 w-6" />
                      Skills & Technologies
                    </CardTitle>
                    <CardDescription>
                      Add your technical skills, programming languages, and tools
                    </CardDescription>
                  </div>
                  {editingSection !== 'skills' ? (
                    <Button onClick={() => handleEditSection('skills')} variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Section
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveSection('skills')} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancelSection} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills with Proficiency */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Skills & Proficiency</Label>
                  {editingSection === 'skills' && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="Skill name"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <select
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(e.target.value as any)}
                        className="px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <Button onClick={addSkill} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="space-y-2">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                        <div className="flex items-center gap-3 flex-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{skill.name}</span>
                          <Badge variant={
                            skill.level === 'Advanced' ? 'default' :
                            skill.level === 'Intermediate' ? 'secondary' : 'outline'
                          }>
                            {skill.level}
                          </Badge>
                        </div>
                        {editingSection === 'skills' && (
                          <Button onClick={() => removeSkill(index)} variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Programming Languages */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Programming Languages</Label>
                  {editingSection === 'skills' && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Add a language"
                        onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                      />
                      <Button onClick={addLanguage} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {programmingLanguages.map((lang, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                        {lang}
                        {editingSection === 'skills' && (
                          <button onClick={() => removeLanguage(lang)} className="ml-2 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Frameworks & Tools */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Frameworks & Tools</Label>
                  {editingSection === 'skills' && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value)}
                        placeholder="Add a framework or tool"
                        onKeyPress={(e) => e.key === 'Enter' && addTool()}
                      />
                      <Button onClick={addTool} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {frameworksTools.map((tool, index) => (
                      <Badge key={index} variant="outline" className="text-sm py-1.5 px-3">
                        {tool}
                        {editingSection === 'skills' && (
                          <button onClick={() => removeTool(tool)} className="ml-2 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests Section */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Target className="h-6 w-6" />
                      Interests & Goals
                    </CardTitle>
                    <CardDescription>
                      Define your learning interests, career goals, and preferences
                    </CardDescription>
                  </div>
                  {editingSection !== 'interests' ? (
                    <Button onClick={() => handleEditSection('interests')} variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Section
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveSection('interests')} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancelSection} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Areas of Interest */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Areas of Interest</Label>
                  {editingSection === 'interests' && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="e.g., Web Development, AI/ML"
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      />
                      <Button onClick={addInterest} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {interests.areasOfInterest.map((interest, index) => (
                      <Badge key={index} variant="default" className="text-sm py-2 px-4">
                        {interest}
                        {editingSection === 'interests' && (
                          <button onClick={() => removeInterest(interest)} className="ml-2 hover:text-red-200">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Career Goals */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Career Goals</Label>
                  {editingSection === 'interests' && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="e.g., Get a job, Build projects"
                        onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                      />
                      <Button onClick={addGoal} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {interests.careerGoals.map((goal, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                        {goal}
                        {editingSection === 'interests' && (
                          <button onClick={() => removeGoal(goal)} className="ml-2 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Learning Preferences */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Learning Preferences</Label>
                  {editingSection === 'interests' && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newPreference}
                        onChange={(e) => setNewPreference(e.target.value)}
                        placeholder="e.g., Videos, Projects, Reading"
                        onKeyPress={(e) => e.key === 'Enter' && addPreference()}
                      />
                      <Button onClick={addPreference} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {interests.learningPreferences.map((pref, index) => (
                      <Badge key={index} variant="outline" className="text-sm py-2 px-4 border-2">
                        {pref}
                        {editingSection === 'interests' && (
                          <button onClick={() => removePreference(pref)} className="ml-2 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Personalized Learning
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your interests and goals help us recommend the perfect courses and roadmaps for you, 
                        even without a resume!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-6 w-6" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Secure account information that cannot be modified for security reasons.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Verified</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Email address cannot be changed for security reasons. Contact support if you need to update your email.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Security Notice</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your account is protected with industry-standard security measures. 
                        We recommend keeping your personal information up to date for the best experience.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

