
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Send, Download, Settings, MessageSquare, Bot, User } from "lucide-react";
import Navbar from "@/components/Navbar";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
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
          
          {/* Preferences Panel */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-primary">
                <Settings className="w-5 h-5 mr-2" />
                Question Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, Science"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  placeholder="e.g., 100"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="questionPattern">Question Pattern</Label>
                <Select value={questionPattern} onValueChange={setQuestionPattern}>
                  <SelectTrigger>
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
                <Label htmlFor="marksDistribution">Marks Distribution</Label>
                <Textarea
                  id="marksDistribution"
                  placeholder="e.g., 10 questions × 2 marks = 20 marks (Knowledge)
5 questions × 4 marks = 20 marks (Application)
..."
                  value={marksDistribution}
                  onChange={(e) => setMarksDistribution(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleDownloadPDF}
                className="w-full bg-brand-secondary hover:bg-blue-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
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
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
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
