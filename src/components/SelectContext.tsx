import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronDown, ChevronUp, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContextFile {
    fileName: string;
    subject: string;
    year: string;
}

interface SelectContextProps {
    availableContexts: ContextFile[];
    selectedContexts: string[];
    onContextSelect: (fileName: string) => void;
    onRefresh?: () => void;
    className?: string;
}

const SelectContext = ({
    availableContexts,
    selectedContexts,
    onContextSelect,
    onRefresh,
    className
}: SelectContextProps) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={`flex flex-col h-[calc(50vh-6rem)] ${className}`}>
            <Card className="flex flex-col h-full border-brand-primary/20">
                {/* Header */}
                <CardHeader 
                    className="pb-3 cursor-pointer hover:bg-brand-accent/30 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <CardTitle className="flex items-center justify-between text-brand-primary text-base">
                        <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Available Contexts
                        </div>
                        {isOpen ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </CardTitle>
                </CardHeader>

                {/* Content */}
                {isOpen && (
                    <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                        {availableContexts.length > 0 ? (
                            <div className="flex flex-col h-full">
                                {/* Scrollable area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {availableContexts.map((context, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg text-xs border cursor-pointer transition-all duration-200 ${
                                                selectedContexts.includes(context.fileName)
                                                    ? 'bg-brand-accent border-brand-primary text-brand-primary'
                                                    : 'bg-brand-accent/30 border-brand-primary/20 hover:bg-brand-accent/50'
                                            }`}
                                            onClick={() => onContextSelect(context.fileName)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-brand-primary">{context.fileName}</div>
                                                    <div className="text-brand-primary/70">{context.subject} ({context.year})</div>
                                                </div>
                                                {selectedContexts.includes(context.fileName) && (
                                                    <CheckCircle className="w-4 h-4 text-brand-primary" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-brand-primary/20 bg-white mt-auto">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <Badge className="text-xs bg-brand-primary text-white hover:bg-brand-secondary">
                                                {availableContexts.length} contexts
                                            </Badge>
                                            {selectedContexts.length > 0 && (
                                                <Badge variant="outline" className="text-xs border-brand-primary text-brand-primary">
                                                    {selectedContexts.length} selected
                                                </Badge>
                                            )}
                                        </div>
                                        {onRefresh && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={onRefresh}
                                                className="text-brand-primary hover:text-brand-secondary hover:bg-brand-accent"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                Refresh
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center text-brand-primary/70 p-4">
                                <div>
                                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm mb-2">No previous year papers found</p>
                                    <p className="text-xs opacity-75">Upload PDFs to get started</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        </div>
    );
};

export default SelectContext;