import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, BookOpen, FileText, Plus, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
const Dashboard = () => {
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

        {/* Main Dashboard Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Profile Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-primary">
                <User className="w-5 h-5 mr-2" />
                Profile Management
              </CardTitle>
              <CardDescription>
                Update your personal information and teaching preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/profile">
                <Button className="w-full bg-brand-primary hover:bg-purple-700 my-[2px]">
                  Manage Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

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