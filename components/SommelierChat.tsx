import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { askSommelier } from '../services/geminiService';
import { ChatMessage } from '../types';

interface SommelierChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SommelierChat: React.FC<SommelierChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou seu Sommelier Virtual da MV Frios. Quer dicas de como usar sua mussarela hoje? Posso sugerir vinhos ou receitas!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const response = await askSommelier(userMessage);

    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:px-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 pointer-events-auto" 
        onClick={onClose}
      />
      
      {/* Chat Window */}
      <div className="relative w-full sm:w-[400px] h-[80vh] sm:h-[600px] bg-white shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="bg-mv-blue-700 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-mv-yellow-400" />
            <h3 className="font-semibold">Sommelier MV Frios</h3>
          </div>
          <button onClick={onClose} className="hover:bg-mv-blue-800 p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-mv-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-tl-none shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-mv-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-mv-blue-500 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-mv-blue-500 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Qual vinho combina?"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-mv-blue-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="p-2 bg-mv-blue-600 text-white rounded-full hover:bg-mv-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};