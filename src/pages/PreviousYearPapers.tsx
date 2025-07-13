
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Search, Edit, Trash2, Eye, ArrowLeft, Plus, Download, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface PreviousPaper {
  id: string;
  title: string;
  subject: string;
  year: string;
  grade: string;
  examType: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
}

const PreviousYearPapers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  // Mock data - this would come from your Express.js backend
  const [papers, setPapers] = useState<PreviousPaper[]>([
    {
      id: "1",
      title: "Biology Final Examination",
      subject: "Biology",
      year: "2023",
      grade: "Grade 12",
      examType: "Final Exam",
      uploadDate: "2024-01-15",
      fileSize: "1.2 MB",
      fileType: "PDF"
    },
    {
      id: "2",
      title: "Chemistry Mid-term Test",
      subject: "Chemistry",
      year: "2023",
      grade: "Grade 11",
      examType: "Mid-term",
      uploadDate: "2024-01-12",
      fileSize: "890 KB",
      fileType: "PDF"
    },
    {
      id: "3",
      title: "Mathematics Annual Exam",
      subject: "Mathematics",
      year: "2022",
      grade: "Grade 10",
      examType: "Annual Exam",
      uploadDate: "2024-01-08",
      fileSize: "1.5 MB",
      fileType: "PDF"
    },
  ]);

  const handleDelete = (id: string) => {
    setPapers(papers.filter(paper => paper.id !== id));
  };

  const filteredPapers = papers.filter(paper => {
    return (
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedSubject === "" || selectedSubject === "all" || paper.subject === selectedSubject) &&
      (selectedYear === "" || selectedYear === "all" || paper.year === selectedYear) &&
      (selectedGrade === "" || selectedGrade === "all" || paper.grade === selectedGrade)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Previous Year Papers</h1>
              <p className="text-gray-600">Upload and manage examination papers from previous years</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload New Paper
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-green-600">Search & Filter Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search papers..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Grade" />
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
            <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50">
              <Upload className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Previous Year Papers</h3>
              <p className="text-gray-600 mb-4">Add examination papers to build your question bank</p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Papers List */}
        <div className="grid gap-4">
          {filteredPapers.map((paper) => (
            <Card key={paper.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{paper.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-green-100 text-green-700">{paper.subject}</Badge>
                        <Badge variant="outline">{paper.grade}</Badge>
                        <Badge variant="secondary">
                          <Calendar className="w-3 h-3 mr-1" />
                          {paper.year}
                        </Badge>
                        <Badge variant="outline">{paper.examType}</Badge>
                        <span className="text-sm text-gray-500">
                          {paper.fileSize} • {paper.fileType} • {paper.uploadDate}
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
                      onClick={() => handleDelete(paper.id)}
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

        {filteredPapers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Papers Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedSubject || selectedYear || selectedGrade
                  ? "No papers match your current filters" 
                  : "Start by uploading your first previous year paper"}
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Paper
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PreviousYearPapers;
