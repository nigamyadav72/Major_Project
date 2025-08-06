import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatBotContextType {
  isChatBotOpen: boolean;
  openChatBot: () => void;
  closeChatBot: () => void;
  toggleChatBot: () => void;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (context === undefined) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};

interface ChatBotProviderProps {
  children: ReactNode;
}

export const ChatBotProvider: React.FC<ChatBotProviderProps> = ({ children }) => {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  const openChatBot = () => setIsChatBotOpen(true);
  const closeChatBot = () => setIsChatBotOpen(false);
  const toggleChatBot = () => setIsChatBotOpen(prev => !prev);

  const value: ChatBotContextType = {
    isChatBotOpen,
    openChatBot,
    closeChatBot,
    toggleChatBot,
  };

  return (
    <ChatBotContext.Provider value={value}>
      {children}
    </ChatBotContext.Provider>
  );
}; 