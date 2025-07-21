import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import {
  User,
  Mail,
  Phone,
  School,
  Save,
  ArrowLeft,
  Upload,
  Trash2,
  Camera,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  phoneNumber?: string;
  profileImage?: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    institution: "",
    department: "",

  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = "http://localhost:3000/api";

  // Get JWT token from localStorage or your auth context
  const getToken = () => {
    return localStorage.getItem("auth_token");
  };
  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        const userData = result.user;
        setProfile({
          id: userData.id,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phoneNumber || "",
          institution: userData.institution || "",
          department: userData.department || "",
          profileImage: userData.profileImage,
        });
      } else {
        setError(result.message || "Failed to fetch profile");
      }
    } catch (err) {
      setError("Error fetching profile");
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      // This would be your update profile endpoint - you'll need to create this
      const response = await fetch(`${API_BASE_URL}/profile/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          phoneNumber: profile.phone,
          institution: profile.institution,
          department: profile.department,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Error updating profile");
      console.error("Update profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file: File) => {
    try {
      setUploading(true);
      setError("");

      // Validate file
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        );
        return;
      }

      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }

      const token = getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(`${API_BASE_URL}/profile/upload-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setProfile((prev) => ({
          ...prev,
          profileImage: result.user.profileImage,
        }));
        setSuccess("Profile picture updated successfully!");
        setTimeout(() => setSuccess(""), 3000);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(result.message || "Failed to upload profile picture");
      }
    } catch (err) {
      setError("Error uploading profile picture");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Delete profile picture
  const deleteProfilePicture = async () => {
    try {
      setUploading(true);
      setError("");

      const token = getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/delete-picture`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setProfile((prev) => ({ ...prev, profileImage: undefined }));
        setSuccess("Profile picture deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete profile picture");
      }
    } catch (err) {
      setError("Error deleting profile picture");
      console.error("Delete error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadProfilePicture(file);
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    // Open the file picker
    fileInputRef.current?.click();

    // If a file is already selected, upload it
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      uploadProfilePicture(file);
    }
  };

  // Load profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-auto bg-gray-50">

      <div className="max-w-full mx-auto">

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Picture & Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-primary">
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-300 mx-auto">
                  {profile.profileImage ? (
                    <img
                      src={`${API_BASE_URL.replace("/api", "")}${
                        profile.profileImage
                      }`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-primary flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                {profile.profileImage && (
                  <button
                    onClick={deleteProfilePicture}
                    disabled={uploading}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-1">
                {profile.name || "User Name"}
              </h3>
              <p className="text-gray-600 mb-2">
                {profile.department || "Department"}
              </p>
              <p className="text-sm text-gray-500">
                {profile.institution || "Institution"}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                className="mt-4 w-full border border-gray-300 rounded px-4 py-2"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Change Photo"}
              </button>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-brand-primary">
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal and professional details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled // Email usually shouldn't be editable
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="institution">School/Institution</Label>
                <Input
                  id="institution"
                  value={profile.institution}
                  onChange={(e) =>
                    setProfile({ ...profile, institution: e.target.value })
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={profile.department}
                    onValueChange={(value) =>
                      setProfile({ ...profile, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Social Studies">
                        Social Studies
                      </SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Physical Education">
                        Physical Education
                      </SelectItem>
                      <SelectItem value="Computer Science">
                        Computer Science
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>



              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-brand-primary hover:bg-purple-700"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
