import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, Sparkles, Bot, User, Loader2, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithOracle, getSearchBasedAnswer } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hari Om. I am your spiritual guide. Ask me about your chart, planetary transits, or spiritual doubts.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';
      let groundingSource = null;

      if (useSearch) {
        const result = await getSearchBasedAnswer(userMsg.text);
        responseText = result.text || "I found nothing.";
        groundingSource = result.groundingMetadata;
      } else {
        // Convert chat history for API
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
        responseText = await chatWithOracle(history, userMsg.text) || "The stars are silent.";
      }

      // If we have grounding sources, append them
      if (groundingSource?.groundingChunks) {
        const links = groundingSource.groundingChunks
          .map((chunk: any) => chunk.web?.uri ? `[${chunk.web.title}](${chunk.web.uri})` : null)
          .filter(Boolean)
          .join(', ');
        if (links) {
          responseText += `\n\n**Sources:** ${links}`;
        }
      }

      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Apologies, I cannot connect to the cosmic consciousness right now.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-slate-900/80 border border-indigo-500/30 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-950/50 p-4 border-b border-indigo-500/20 flex justify-between items-center">
        <div className="flex items-center gap-2 text-amber-400">
          <Bot className="w-5 h-5" />
          <h3 className="font-serif font-bold">Ask the Guru</h3>
        </div>
        
        <button 
          onClick={() => setUseSearch(!useSearch)}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-all border ${
            useSearch 
              ? 'bg-indigo-600 border-indigo-400 text-white' 
              : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Globe className="w-3 h-3" />
          {useSearch ? 'Search Active' : 'Enable Search'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-xs text-slate-400">Consulting...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-950/30 border-t border-indigo-500/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={useSearch ? "Ask about current planetary transits..." : "Ask a spiritual question..."}
            className="w-full bg-slate-900 border border-indigo-500/30 rounded-xl py-3 pl-4 pr-12 text-slate-200 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          Powered by Gemini 3 Pro {useSearch && '& Google Search'}
        </p>
      </div>
    </div>
  );
};

export default ChatTab;