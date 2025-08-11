import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { useChatBot } from '@/contexts/ChatBotContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const { isChatBotOpen, closeChatBot, openChatBot } = useChatBot();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI shopping assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isChatBotOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatBotOpen]);

  const simulateBotResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    let botResponse = '';
    
    // Simple response logic based on user input
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      botResponse = "Hello! How can I assist you with your shopping today?";
    } else if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
      botResponse = "I can help you find products! What are you looking for? You can describe the item or upload an image.";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      botResponse = "I can help you find the best prices! What product are you interested in?";
    } else if (lowerMessage.includes('size') || lowerMessage.includes('fit')) {
      botResponse = "For sizing questions, I can help you find the right fit. What type of clothing are you looking for?";
    } else if (lowerMessage.includes('review') || lowerMessage.includes('rating')) {
      botResponse = "I can help you find product reviews and ratings. Which product would you like to know more about?";
    } else if (lowerMessage.includes('image') || lowerMessage.includes('photo')) {
      botResponse = "Great! You can upload an image and I'll help you find similar products. Just drag and drop or click to upload.";
    } else {
      botResponse = "I'm here to help with your shopping! You can ask me about products, prices, sizes, reviews, or upload an image to find similar items.";
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Simulate bot response
    await simulateBotResponse(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isChatBotOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={openChatBot}
            className="bg-primary text-white p-4 rounded-full shadow-2xl hover:bg-primary/90 transition-all duration-300 hover:scale-110"
            title="Chat with AI Assistant"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isChatBotOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 h-96 flex flex-col">
            {/* Header */}
            <div className="bg-primary text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Shopping Assistant</h3>
                  <p className="text-xs text-white/80">Online • Usually responds instantly</p>
                </div>
              </div>
              <button
                onClick={closeChatBot}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot; 