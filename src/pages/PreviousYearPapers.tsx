//PreviousYearPaper.tsx
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Search, Edit, Trash2, Eye, ArrowLeft, Plus, Download, Calendar, X, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface PreviousPaper {
  id: string;
  title: string;
  subject: string;
  year: number;
  classLevel: string;
  board: string;
  language?: string;
  semester?: string;
  institution?: string;
  department?: string;
  courseCode?: string;
  uploadDate: string;
  fileSize: number;
  isVectorized: boolean;
}

interface UploadForm {
  title: string;
  year: string;
  subject: string;
  classLevel: string;
  board: string;
  language: string;
  semester: string;
  institution: string;
  courseCode: string;
}

const PreviousYearPapers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadForm, setUploadForm] = useState<UploadForm>({
    title: "",
    year: "",
    subject: "",
    classLevel: "",
    board: "",
    language: "en",
    semester: "",
    institution: "",
    courseCode: ""
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - this would come from your Express.js backend
  const [papers, setPapers] = useState<PreviousPaper[]>([]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication required');
        }
        const response = await fetch('/api/pyq/my-pyqs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch papers');
        const data = await response.json();
        setPapers(data.data.pyqs); // Adjusted to match API response structure
      } catch (error) {
        console.error(error);
      }
    };
    fetchPapers();
  }, []);

  // Get auth token (implement based on your auth system)
  const getAuthToken = (): string => {
    return localStorage.getItem('authToken') || '';
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      if (pdfFiles.length !== files.length) {
        setUploadStatus({
          type: 'error',
          message: 'Only PDF files are allowed!'
        });
        return;
      }
      setSelectedFiles(pdfFiles);
      setUploadStatus(null);
    }
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle form input changes
  const handleFormChange = (field: keyof UploadForm, value: string) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Upload files to backend
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus({
        type: 'error',
        message: 'Please select at least one PDF file'
      });
      return;
    }

    // Validate required fields
    const { title, year, subject, classLevel, board } = uploadForm;
    if (!title || !year || !subject || !classLevel || !board) {
      setUploadStatus({
        type: 'error',
        message: 'Please fill in all required fields: Title, Year, Subject, Class Level, and Board'
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      
      // Append files
      selectedFiles.forEach(file => {
        formData.append('pyqFiles', file);
      });

      // Append form fields
      Object.entries(uploadForm).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // Update headers to include the correct content type
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pyq/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Remove Content-Type header to let browser set it with boundary
        },
        body: formData,
        credentials: 'include' // Add this line
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUploadStatus({
          type: 'success',
          message: `Successfully uploaded ${result.data.totalUploaded} file(s)!`
        });

        // Reset form
        setSelectedFiles([]);
        setUploadForm({
          title: "",
          year: "",
          subject: "",
          classLevel: "",
          board: "",
          language: "en",
          semester: "",
          institution: "",
          courseCode: ""
        });
        
        // Close upload form after 3 seconds
        setTimeout(() => {
          setShowUploadForm(false);
          setUploadStatus(null);
        }, 3000);

        // Refresh papers list (in real app, you'd refetch from API)
        // fetchUserPYQs();

      } else {
        setUploadStatus({
          type: 'error',
          message: result.message || 'Upload failed'
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token'); // Make sure to use the same key as login
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/pyq/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in again');
        }
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPapers(papers.filter(paper => paper.id !== id));
      } else {
        throw new Error(result.message || 'Failed to delete paper');
      }
    } catch (error) {
      console.error('Delete error:', error);
      // Show error to user
      alert(error instanceof Error ? error.message : 'Error deleting paper');
    }
  };

  const filteredPapers = papers.filter(paper => {
    return (
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedSubject === "" || selectedSubject === "all" || paper.subject === selectedSubject) &&
      (selectedYear === "" || selectedYear === "all" || paper.year.toString() === selectedYear) &&
      (selectedGrade === "" || selectedGrade === "all" || `Grade ${paper.classLevel}` === selectedGrade)
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Previous Year Papers</h1>
              <p className="text-gray-600">Upload and manage examination papers from previous years</p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
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
                  <SelectItem value="Computer">Computer</SelectItem>
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

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-green-600">Upload Previous Year Papers</CardTitle>
              <CardDescription>Fill in the details and select PDF files to upload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Status */}
              {uploadStatus && (
                <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                  uploadStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {uploadStatus.type === 'success' ? 
                    <CheckCircle className="w-5 h-5" /> : 
                    <AlertCircle className="w-5 h-5" />
                  }
                  <span>{uploadStatus.message}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <Input
                    placeholder="e.g., Physics Final Exam 2023"
                    value={uploadForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year *</label>
                  <Input
                    type="number"
                    placeholder="2023"
                    value={uploadForm.year}
                    onChange={(e) => handleFormChange('year', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject *</label>
                  <Select value={uploadForm.subject} onValueChange={(value) => handleFormChange('subject', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Computer">Computer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Class Level *</label>
                  <Select value={uploadForm.classLevel} onValueChange={(value) => handleFormChange('classLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">Class 9</SelectItem>
                      <SelectItem value="10">Class 10</SelectItem>
                      <SelectItem value="11">Class 11</SelectItem>
                      <SelectItem value="12">Class 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Board *</label>
                  <Select value={uploadForm.board} onValueChange={(value) => handleFormChange('board', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="ICSE">ICSE</SelectItem>
                      <SelectItem value="State Board">State Board</SelectItem>
                      <SelectItem value="IB">IB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <Select value={uploadForm.language} onValueChange={(value) => handleFormChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="bn">Bengali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <Input
                    placeholder="e.g., 1st Semester"
                    value={uploadForm.semester}
                    onChange={(e) => handleFormChange('semester', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Institution</label>
                  <Input
                    placeholder="e.g., DPS Delhi"
                    value={uploadForm.institution}
                    onChange={(e) => handleFormChange('institution', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course Code</label>
                  <Input
                    placeholder="e.g., PHY101"
                    value={uploadForm.courseCode}
                    onChange={(e) => handleFormChange('courseCode', e.target.value)}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Upload PDF Files</label>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center bg-green-50">
                  <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Select PDF files to upload (Max 5 files, 50MB each)</p>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Selected Files:</h4>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadForm(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Papers
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                        <Badge variant="outline">Class {paper.classLevel}</Badge>
                        <Badge variant="secondary">
                          <Calendar className="w-3 h-3 mr-1" />
                          {paper.year}
                        </Badge>
                        <Badge variant="outline">{paper.board}</Badge>
                        {paper.isVectorized ? (
                          <Badge className="bg-blue-100 text-blue-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Processed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Processing...</Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatFileSize(paper.fileSize)} • PDF • {paper.uploadDate}
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
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowUploadForm(true)}
              >
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