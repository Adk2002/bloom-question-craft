import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, BookOpen, FileText, Settings, Mail, Phone, School, Save } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
const Dashboard = () => {
  const [profile, setProfile] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@school.edu",
    phone: "+1 (555) 123-4567",
    school: "Springfield High School",
    department: "Science",
    experience: "10",
    subjects: "Physics, Chemistry, Mathematics",
    bio: "Passionate educator with 10 years of experience in science education. Specialized in creating engaging assessment materials that promote critical thinking.",
  });

  const handleSave = () => {
    // This would connect to your Express.js backend to save profile data
    console.log("Saving profile:", profile);
  };

  return <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600">
            Manage your profile, upload resources, and organize your teaching materials
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-brand-primary">12</p>
                  <p className="text-sm text-gray-600">Subject Notes</p>
                </div>
                <BookOpen className="w-8 h-8 text-brand-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-brand-secondary">8</p>
                  <p className="text-sm text-gray-600">Previous Papers</p>
                </div>
                <FileText className="w-8 h-8 text-brand-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">45</p>
                  <p className="text-sm text-gray-600">Questions Generated</p>
                </div>
                <Settings className="w-8 h-8 text-brand-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">5</p>
                  <p className="text-sm text-gray-600">Shared Chats</p>
                </div>
                <User className="w-8 h-8 text-brand-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Management Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Management</h2>
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Profile Picture & Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-primary">Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{profile.name}</h3>
                <p className="text-gray-600 mb-1 text-sm">{profile.department} Department</p>
                <p className="text-xs text-gray-500">{profile.school}</p>
                <Button variant="outline" className="mt-3 w-full text-xs">
                  Change Photo
                </Button>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-brand-primary">Personal Information</CardTitle>
                <CardDescription>
                  Update your personal and professional details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="school">School/Institution</Label>
                    <Input
                      id="school"
                      value={profile.school}
                      onChange={(e) => setProfile({...profile, school: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={profile.department} 
                      onValueChange={(value) => setProfile({...profile, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Physical Education">Physical Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profile.experience}
                      onChange={(e) => setProfile({...profile, experience: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subjects">Subjects Taught</Label>
                    <Input
                      id="subjects"
                      placeholder="e.g., Physics, Chemistry"
                      value={profile.subjects}
                      onChange={(e) => setProfile({...profile, subjects: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about your teaching philosophy..."
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSave}
                  className="bg-brand-primary hover:bg-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resources Management Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Subject Notes */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-secondary">
                <BookOpen className="w-5 h-5 mr-2" />
                Subject Notes
              </CardTitle>
              <CardDescription>
                Upload and manage your teaching materials and notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/subject-notes">
                  <Button className="w-full bg-brand-secondary hover:bg-blue-600 my-[8px]">
                    Manage Notes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Previous Year Papers */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <FileText className="w-5 h-5 mr-2" />
                Previous Year Papers
              </CardTitle>
              <CardDescription>
                Upload and organize previous examination papers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/previous-papers">
                  <Button className="w-full bg-green-600 hover:bg-green-700 my-[6px]">
                    Manage Papers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Dashboard;