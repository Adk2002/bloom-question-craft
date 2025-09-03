import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Send, Settings, ChevronDown, ChevronUp, Download } from "lucide-react";

interface InputFieldProps {
    inputMessage: string;
    setInputMessage: (message: string) => void;
    onSendMessage: () => void;
    isGenerating: boolean;
    // Preferences
    subject: string;
    setSubject: (subject: string) => void;
    totalMarks: string;
    setTotalMarks: (marks: string) => void;
    questionPattern: string;
    setQuestionPattern: (pattern: string) => void;
    marksDistribution: string;
    setMarksDistribution: (distribution: string) => void;
    // Actions
    onDownloadPDF?: () => void;
    hasGeneratedContent?: boolean;
}

const InputField = ({
    inputMessage,
    setInputMessage,
    onSendMessage,
    isGenerating,
    subject,
    setSubject,
    totalMarks,
    setTotalMarks,
    questionPattern,
    setQuestionPattern,
    marksDistribution,
    setMarksDistribution,
    onDownloadPDF,
    hasGeneratedContent
}: InputFieldProps) => {
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    return (
        <div className="space-y-4">
            {/* Quick Preferences Drawer */}
            <Collapsible open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
                <CollapsibleTrigger asChild>
                    <Card className="border-brand-primary/20 shadow-md cursor-pointer hover:bg-brand-accent transition-colors">
                        <CardHeader className="pb-3 bg-gradient-to-r from-brand-accent to-brand-accent/70 rounded-t-lg">
                            <CardTitle className="flex items-center justify-between text-brand-primary text-base">
                                <div className="flex items-center">
                                    <Settings className="w-5 h-5 mr-2" />
                                    Question Preferences
                                </div>
                                {isPreferencesOpen ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <Card className="mt-2 border-brand-primary/20">
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-brand-primary font-medium">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="e.g., Mathematics, Science"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="totalMarks" className="text-brand-primary font-medium">Total Marks</Label>
                                    <Input
                                        id="totalMarks"
                                        placeholder="e.g., 100"
                                        value={totalMarks}
                                        onChange={(e) => setTotalMarks(e.target.value)}
                                        className="border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="questionPattern" className="text-brand-primary font-medium">Question Pattern</Label>
                                <Select value={questionPattern} onValueChange={setQuestionPattern}>
                                    <SelectTrigger className="border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary">
                                        <SelectValue placeholder="Select pattern" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mixed">Mixed (MCQ + Short + Long)</SelectItem>
                                        <SelectItem value="mcq">Multiple Choice Only</SelectItem>
                                        <SelectItem value="short">Short Answer Only</SelectItem>
                                        <SelectItem value="long">Long Answer Only</SelectItem>
                                        <SelectItem value="practical">Practical Questions</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="marksDistribution" className="text-brand-primary font-medium">Marks Distribution</Label>
                                <Textarea
                                    id="marksDistribution"
                                    placeholder="e.g., 10 questions × 2 marks = 20 marks (Knowledge) 5 questions × 4 marks = 20 marks (Application)..."
                                    value={marksDistribution}
                                    onChange={(e) => setMarksDistribution(e.target.value)}
                                    className="min-h-[80px] border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary resize-none"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <Badge variant="outline" className="border-brand-primary/30 text-brand-primary">📚 Full Bloom's Taxonomy</Badge>
                                <Badge variant="outline" className="border-brand-primary/30 text-brand-primary">📝 MCQ Format</Badge>
                                <Badge variant="outline" className="border-brand-primary/30 text-brand-primary">🎯 Higher Order Thinking</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>

            {/* Input Field */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <Textarea
                        placeholder="Describe the questions you need (e.g., 'Generate 10 questions on photosynthesis covering all Bloom's levels')"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isGenerating}
                        className="min-h-[60px] resize-none border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary bg-white/90"
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={onSendMessage}
                        disabled={!inputMessage.trim() || isGenerating}
                        className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white px-6 py-3 h-auto"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Send'}
                    </Button>

                    {hasGeneratedContent && onDownloadPDF && (
                        <Button
                            variant="outline"
                            onClick={onDownloadPDF}
                            className="border-brand-primary/30 text-brand-primary hover:bg-brand-accent px-4 py-3 h-auto"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InputField;