import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Mail, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  Calendar,
  Shield,
  FileText,
  ArrowRight
} from "lucide-react";

interface EditableField {
  firstName: boolean;
  lastName: boolean;
  phone: boolean;
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
      <div className="pt-[92px] sm:pt-[108px] pb-12">
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
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-6 w-6" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details. Click the edit button next to any field to make changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
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
                
                {renderEditableField(
                  "phone",
                  "Phone Number",
                  <Phone className="h-4 w-4" />,
                  user?.phone || "",
                  "Enter your phone number"
                )}
              </CardContent>
            </Card>

            {/* Resume Management */}
            <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Resume Management
                </CardTitle>
                <CardDescription>
                  Build professional resumes or upload existing ones for ATS analysis and career matching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">✓</span>
                    </div>
                    <p>Upload and parse existing resumes with 90%+ accuracy</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">✓</span>
                    </div>
                    <p>Build stunning resumes with professional templates</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">✓</span>
                    </div>
                    <p>Match your skills with relevant career opportunities</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/resume')} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Manage Resume
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
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

