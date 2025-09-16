import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Camera } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import Navigation from '@/components/Navigation';

const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  // Update form data when user changes (to keep it in sync)
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.firstName.trim()) {
      alert('First name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('Email is required');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Starting profile update with data:', formData);
      
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });
      
      console.log('Profile update completed successfully');
      setIsEditing(false);
      
      // You could add a success toast notification here
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      // Show the actual error message for debugging
      alert('Failed to update profile: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName.charAt(0)}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-20">
          <AuthGuard 
            title="Access Your Profile"
            description="Sign in to view and manage your profile information"
            featuresList={[
              "Update your personal information",
              "Upload a profile picture",
              "Manage your account settings",
              "View your learning progress"
            ]}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                <AvatarFallback className="text-xl">
                  {user && getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute bottom-0 right-0 rounded-full p-2 bg-white dark:bg-gray-800"
                onClick={() => {
                  // TODO: Implement avatar upload
                  console.log('Upload avatar clicked');
                }}
              >
                <Camera className="w-3 h-3" />
              </Button>
            </div>
            <CardTitle className="mt-4">
              {user?.firstName} {user?.lastName}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave} 
                    className="flex-1"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        phone: user?.phone || '',
                        email: user?.email || '',
                      });
                    }}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="w-full"
                  variant="outline"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
};

export default Profile;
