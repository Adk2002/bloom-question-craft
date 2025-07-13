
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, BookOpen, User, Lightbulb, Target, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Generate Questions with
              <span className="text-brand-primary block mt-2">Bloom's Taxonomy</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create comprehensive question papers tailored to different cognitive levels. 
              Perfect for teachers who want to enhance their assessment strategies.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/chat">
              <Button size="lg" className="bg-brand-primary hover:bg-purple-700 text-white px-8 py-3 text-lg">
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Generating Questions
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white px-8 py-3 text-lg"
              >
                <User className="w-5 h-5 mr-2" />
                Teacher Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose QuestionCraft?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed specifically for educators to create meaningful assessments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-primary">
              <CardHeader>
                <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-brand-primary" />
                </div>
                <CardTitle className="text-brand-primary">Bloom's Taxonomy Based</CardTitle>
                <CardDescription>
                  Generate questions across all cognitive levels - from remembering to creating
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-secondary">
              <CardHeader>
                <div className="w-12 h-12 bg-brand-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-brand-secondary" />
                </div>
                <CardTitle className="text-brand-secondary">Customizable Patterns</CardTitle>
                <CardDescription>
                  Choose from subjective, objective, or MCQ formats with flexible mark distribution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-accent">
              <CardHeader>
                <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-600">Teacher-Friendly</CardTitle>
                <CardDescription>
                  Simple, intuitive interface designed with educators in mind
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Question Creation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join educators who are already creating better assessments with QuestionCraft
          </p>
          <Link to="/chat">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              <BookOpen className="w-5 h-5 mr-2" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
