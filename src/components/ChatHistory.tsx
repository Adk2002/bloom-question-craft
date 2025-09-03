import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {History, Clock } from "lucide-react";

interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
}

interface ChatHistoryProps {
    chatSessions: ChatSession[];
    onSelectSession?: (sessionId: string) => void;
    className?: string;
}

const ChatHistory = ({ chatSessions, onSelectSession, className }: ChatHistoryProps) => {
    return (
        <Card className={`border-brand-primary/20 ${className}`}>
            <CardHeader
                className="pb-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-t-lg"
            >
                <CardTitle className="flex items-center text-white text-base">
                    <div className="flex items-center text-brand-primary">
                        <History className="w-4 h-4 mr-2 text-brand-primary" />
                        Chat History
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {chatSessions.map((session) => (
                        <div
                            key={session.id}
                            className="p-3 border border-brand-primary/20 rounded-lg hover:bg-brand-accent cursor-pointer transition-all duration-200 hover:shadow-md hover:border-brand-primary/30"
                            onClick={() => onSelectSession?.(session.id)}
                        >
                            <h4 className="font-medium text-sm text-brand-primary mb-1 truncate">
                                {session.title}
                            </h4>
                            <p className="text-xs text-brand-primary/70 mb-2 line-clamp-2">
                                {session.lastMessage}
                            </p>
                            <div className="flex items-center text-xs text-brand-primary/60">
                                <Clock className="w-3 h-3 mr-1" />
                                {session.timestamp.toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ChatHistory;