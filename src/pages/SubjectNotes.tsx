
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Upload, Search, Edit, Trash2, Eye, ArrowLeft, Plus, FileText, Download } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface SubjectNote {
  id: string;
  title: string;
  subject: string;
  grade: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
}

const SubjectNotes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  // Mock data - this would come from your Express.js backend
  const [notes, setNotes] = useState<SubjectNote[]>([
    {
      id: "1",
      title: "Photosynthesis - Complete Notes",
      subject: "Biology",
      grade: "Grade 10",
      uploadDate: "2024-01-15",
      fileSize: "2.4 MB",
      fileType: "PDF"
    },
    {
      id: "2",
      title: "Chemical Bonding Chapter",
      subject: "Chemistry",
      grade: "Grade 11",
      uploadDate: "2024-01-10",
      fileSize: "1.8 MB",
      fileType: "PDF"
    },
    {
      id: "3",
      title: "Quadratic Equations",
      subject: "Mathematics",
      grade: "Grade 9",
      uploadDate: "2024-01-08",
      fileSize: "3.2 MB",
      fileType: "PDF"
    },
  ]);

  const handleDelete = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const filteredNotes = notes.filter(note => {
    return (
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedSubject === "" || selectedSubject === "all" || note.subject === selectedSubject) &&
      (selectedGrade === "" || selectedGrade === "all" || note.grade === selectedGrade)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-full mx-auto p-6">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Subject Notes</h1>
              <p className="text-gray-600">Upload and manage your teaching materials</p>
            </div>
            <Button className="bg-brand-primary hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload New Note
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-brand-primary">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notes..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                  <SelectItem value="Grade 11">Grade 11</SelectItem>
                  <SelectItem value="Grade 12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-brand-accent rounded-lg p-8 text-center bg-brand-accent/5">
              <Upload className="w-12 h-12 text-brand-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload New Subject Notes</h3>
              <p className="text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>
              <Button className="bg-brand-secondary hover:bg-blue-600">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes List */}
        <div className="grid gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{note.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{note.subject}</Badge>
                        <Badge variant="outline">{note.grade}</Badge>
                        <span className="text-sm text-gray-500">
                          {note.fileSize} • {note.fileType} • {note.uploadDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notes Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedSubject || selectedGrade 
                  ? "No notes match your current filters" 
                  : "Start by uploading your first subject note"}
              </p>
              <Button className="bg-brand-primary hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Note
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubjectNotes;
