import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  User,
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ChatHistory from "@/components/ChatHistory";
import SelectContext from "@/components/SelectContext";
import InputField from "@/components/InputField";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: Array<{
    fileName: string;
    subject: string;
    year: string;
    score: string;
  }>;
  isGenerating?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ContextFile {
  fileName: string;
  subject: string;
  year: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m here to help you generate questions based on Bloom\'s Taxonomy using your uploaded previous year papers. Please set your preferences and tell me what kind of questions you need.',
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [marksDistribution, setMarksDistribution] = useState('');
  const [questionPattern, setQuestionPattern] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [subject, setSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedContent, setLastGeneratedContent] = useState('');
  const [availableContexts, setAvailableContexts] = useState<ContextFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);

  // Mock chat history data
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Biology Questions - Photosynthesis',
      lastMessage: 'Generated 15 questions on plant biology',
      timestamp: new Date(Date.now() - 86400000)
    },
    {
      id: '2',
      title: 'Mathematics - Algebra',
      lastMessage: 'Created polynomial equations worksheet',
      timestamp: new Date(Date.now() - 172800000)
    },
    {
      id: '3',
      title: 'Chemistry - Periodic Table',
      lastMessage: 'Generated MCQs on chemical elements',
      timestamp: new Date(Date.now() - 259200000)
    }
  ]);

  // Simulate context fetching for demo
  useEffect(() => {
    setAvailableContexts([
      { fileName: "Mathematics_2023.pdf", subject: "Mathematics", year: "2023" },
      { fileName: "Physics_2022.pdf", subject: "Physics", year: "2022" },
      { fileName: "Chemistry_2023.pdf", subject: "Chemistry", year: "2023" },
      { fileName: "Biology_2023.pdf", subject: "Biology", year: "2023" }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: 'Generating questions using your uploaded papers and Bloom\'s Taxonomy...',
      timestamp: new Date(),
      isGenerating: true
    };

    setMessages(prev => [...prev, loadingMessage]);
    setIsGenerating(true);

    // Simulate API call with mock response
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));

      const mockResponse = `**Question Paper: ${subject || 'General'} - ${totalMarks || '100'} Marks**

# Knowledge Level Questions (Bloom's Level 1)

**Q1. [2 marks]** Define photosynthesis and state its importance in the ecosystem.

**Q2. [2 marks]** List the main components of a plant cell.

# Comprehension Level Questions (Bloom's Level 2)

**Q3. [4 marks]** Explain the process of cellular respiration and its relationship with photosynthesis.

**Q4. [4 marks]** Describe the structure and function of chloroplasts.

# Application Level Questions (Bloom's Level 3)

**Q5. [6 marks]** A plant is kept in a dark room for 48 hours. Predict what would happen to the glucose production and explain your reasoning.

# Analysis Level Questions (Bloom's Level 4)

**Q6. [8 marks]** Compare and contrast C3, C4, and CAM photosynthesis pathways. Analyze their advantages in different environmental conditions.

# Synthesis Level Questions (Bloom's Level 5)

**Q7. [10 marks]** Design an experiment to demonstrate the effect of light intensity on the rate of photosynthesis. Include variables, methodology, and expected results.

# Evaluation Level Questions (Bloom's Level 6)

**Q8. [10 marks]** Evaluate the impact of deforestation on global carbon cycle and climate change. Justify your answer with scientific evidence.

---
**Total: 46 marks**
*Note: Adjust marks distribution as per your requirements*`;

      const botMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: mockResponse,
        timestamp: new Date(),
        sources: [
          { fileName: "Biology_2023.pdf", subject: "Biology", year: "2023", score: "95%" },
          { fileName: "Science_2022.pdf", subject: "Science", year: "2022", score: "87%" }
        ]
      };

      setMessages(prev => [...prev, botMessage]);
      setLastGeneratedContent(mockResponse);
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownloadPDF = async () => {
    if (!lastGeneratedContent) {
      alert('Please generate questions first');
      return;
    }

    // Mock PDF download
    alert('PDF download would be implemented with backend integration');
  };

  const handleContextSelect = (fileName: string) => {
    setSelectedContexts(prev =>
      prev.includes(fileName)
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName]
    );
  };

  const handleSelectSession = (sessionId: string) => {
    console.log('Selected session:', sessionId);
    // Here you would load the selected chat session
  };

  const formatBotMessage = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={index} className="font-bold text-brand-primary mb-2">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      } else if (line.startsWith('#')) {
        return (
          <div key={index} className="font-semibold text-lg mb-2 text-brand-primary">
            {line.replace(/^#+\s/, '')}
          </div>
        );
      } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <div key={index} className="ml-4 mb-1">
            {line}
          </div>
        );
      } else if (line.trim()) {
        return (
          <div key={index} className="mb-2">
            {line}
          </div>
        );
      } else {
        return <div key={index} className="mb-2"></div>;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-accent via-brand-accent/50 to-brand-accent/30">
      <Navbar />

      <div className="max-w-full mx-auto p-4">
        {/* Update grid layout to be more balanced */}
        <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Adjust left sidebar width */}
          <div className="lg:col-span-1 space-y-4 max-h-full overflow-hidden flex flex-col">
            <ChatHistory
              chatSessions={chatSessions}
              onSelectSession={handleSelectSession}
            />
            <SelectContext
              availableContexts={availableContexts}
              selectedContexts={selectedContexts}
              onContextSelect={handleContextSelect}
              onRefresh={() => console.log('Refreshing contexts...')}
            />
          </div>

          {/* Adjust main chat area width */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <Card className="flex-1 flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm h-full">
              <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white text-xl">
                  <Sparkles className="w-6 h-6 mr-2" />
                  AI Question Generator
                </CardTitle>
              </CardHeader>

              {/* Error Alert */}
              {error && (
                <div className="mx-6 mt-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Chat Messages */}
              <CardContent className="flex-1 flex flex-col p-6">
                <div className="flex-1 overflow-y-auto space-y-6 mb-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-4 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${message.type === 'user'
                          ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white'
                          : 'bg-gradient-to-br from-brand-accent to-brand-accent/70 text-brand-primary border-2 border-brand-primary/20'
                        }`}>
                        {message.isGenerating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : message.type === 'user' ? (
                          <User className="w-5 h-5" />
                        ) : (
                          <Bot className="w-5 h-5" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl shadow-md ${message.type === 'user'
                            ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white ml-auto'
                            : 'bg-white border border-brand-primary/20'
                          }`}
                      >
                        <div className="text-sm">
                          {message.type === 'bot' && !message.isGenerating ?
                            formatBotMessage(message.content) :
                            message.content
                          }
                        </div>

                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-brand-primary/20">
                            <div className="text-xs text-brand-primary mb-2 font-medium">Sources used:</div>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-brand-primary/30 text-brand-primary">
                                  {source.fileName} ({source.score})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <span className={`text-xs mt-2 block ${message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                          }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Field Component */}
                <InputField
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  onSendMessage={handleSendMessage}
                  isGenerating={isGenerating}
                  subject={subject}
                  setSubject={setSubject}
                  totalMarks={totalMarks}
                  setTotalMarks={setTotalMarks}
                  questionPattern={questionPattern}
                  setQuestionPattern={setQuestionPattern}
                  marksDistribution={marksDistribution}
                  setMarksDistribution={setMarksDistribution}
                  onDownloadPDF={handleDownloadPDF}
                  hasGeneratedContent={!!lastGeneratedContent}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;