import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { TableSkeleton } from './LoadingSkeleton';

interface ChatMessage {
  id: string;
  message: string;
  isUserMessage: boolean;
  aiResponse?: string;
  context?: string;
  createdAt: string;
}

interface AiChatProps {
  context?: 'pause' | 'fail' | 'general';
  sessionId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function AiChat({ context = 'general', sessionId, onClose, isModal = false }: AiChatProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: chatHistory = [], isLoading } = useQuery({
    queryKey: ['/api/ai/history'],
    queryFn: () => apiRequest('/api/ai/history'),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) => apiRequest('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/history'] });
      setMessage('');
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      setIsTyping(true);
      sendMessageMutation.mutate({
        message: message.trim(),
        context,
        sessionId,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory]);

  // Show contextual greeting based on situation
  const getContextualGreeting = () => {
    switch (context) {
      case 'pause':
        return "I noticed you paused your session. Is there something on your mind? I'm here to help you stay focused! 💪";
      case 'fail':
        return "Don't worry about not completing that session! It's all part of the learning process. What would you like to try differently next time?";
      default:
        return "Hi! I'm your AI focus coach. I'm here to help you stay productive and overcome any challenges you're facing. How can I assist you today?";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const ChatContent = () => (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          AI Focus Coach
        </CardTitle>
        {isModal && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="flex flex-col h-full">
        <div className="flex-1 pr-4 mb-4 overflow-y-auto" style={{ height: isModal ? '400px' : '300px' }}>
          <div ref={scrollAreaRef} className="space-y-4">
            {/* Initial greeting */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 max-w-sm">
                  <p className="text-sm">{getContextualGreeting()}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1">Now</span>
              </div>
            </div>

            {/* Chat history */}
            {chatHistory.map((chat: ChatMessage) => (
              <div key={chat.id} className="space-y-3">
                {/* User message */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex-1 flex justify-end">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-sm">
                      <p className="text-sm">{chat.message}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* AI response */}
                {chat.aiResponse && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 max-w-sm">
                        <p className="text-sm">{chat.aiResponse}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {formatTime(chat.createdAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about staying focused..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
          <ChatContent />
        </Card>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <ChatContent />
    </Card>
  );
}