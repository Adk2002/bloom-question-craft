
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Send, Download, Settings, MessageSquare, Bot, User, History, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m here to help you generate questions based on Bloom\'s Taxonomy. Please set your preferences and tell me what subject or topic you\'d like questions for.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [marksDistribution, setMarksDistribution] = useState('');
  const [questionPattern, setQuestionPattern] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [subject, setSubject] = useState('');
  
  // Mock chat history data
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Biology Questions - Photosynthesis',
      lastMessage: 'Generated 15 questions on plant biology',
      timestamp: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: '2',
      title: 'Mathematics - Algebra',
      lastMessage: 'Created polynomial equations worksheet',
      timestamp: new Date(Date.now() - 172800000) // 2 days ago
    },
    {
      id: '3',
      title: 'Chemistry - Periodic Table',
      lastMessage: 'Generated MCQs on chemical elements',
      timestamp: new Date(Date.now() - 259200000) // 3 days ago
    }
  ]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I\'ve received your request. Based on your preferences, I\'ll generate questions following Bloom\'s Taxonomy levels. This would typically connect to your Express.js backend to generate the actual questions.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleDownloadPDF = () => {
    // This would connect to your Express.js backend to generate and download PDF
    console.log('Downloading question paper as PDF...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          
          {/* Chat History Panel */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-primary">
                <History className="w-5 h-5 mr-2" />
                Chat History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium text-sm text-gray-900 mb-1 truncate">
                    {session.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {session.lastMessage}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {session.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))}
              {chatSessions.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Section */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-primary">
                <MessageSquare className="w-5 h-5 mr-2" />
                Question Generation Chat
              </CardTitle>
            </CardHeader>
            
            {/* Chat Messages */}
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-80">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-brand-primary text-white' 
                        : 'bg-brand-accent text-brand-primary'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-brand-primary text-white ml-auto'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className={`text-xs mt-1 block ${
                        message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Question Preferences Section */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-brand-primary text-base">
                    <Settings className="w-4 h-4 mr-2" />
                    Question Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="subject" className="text-sm">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics, Science"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="totalMarks" className="text-sm">Total Marks</Label>
                      <Input
                        id="totalMarks"
                        type="number"
                        placeholder="e.g., 100"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="questionPattern" className="text-sm">Question Pattern</Label>
                      <Select value={questionPattern} onValueChange={setQuestionPattern}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subjective">Subjective</SelectItem>
                          <SelectItem value="objective">Objective</SelectItem>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="mixed">Mixed Pattern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Button 
                        onClick={handleDownloadPDF}
                        className="w-full bg-brand-secondary hover:bg-blue-600 h-8 mt-5"
                      >
                        <Download className="w-3 h-3 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="marksDistribution" className="text-sm">Marks Distribution</Label>
                    <Textarea
                      id="marksDistribution"
                      placeholder="e.g., 10 questions × 2 marks = 20 marks (Knowledge)&#10;5 questions × 4 marks = 20 marks (Application)..."
                      value={marksDistribution}
                      onChange={(e) => setMarksDistribution(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Input Section */}
              <div className="flex gap-2">
                <Input
                  placeholder="Describe the questions you need (e.g., 'Generate 10 questions on photosynthesis covering all Bloom's levels')"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-brand-primary hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
