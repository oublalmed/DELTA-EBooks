
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Book } from '../types';
import { getGuidance } from '../services/geminiService';

interface ChatViewProps {
  book: Book;
  onBack: () => void;
}

const suggestedPrompts = [
  "What is the core message of this book?",
  "How can I apply these ideas to my life?",
  "Help me understand a concept I'm struggling with",
  "Give me a daily practice based on these teachings",
];

const ChatView: React.FC<ChatViewProps> = ({ book, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Welcome to the resonance chamber of "${book.title}". I am your philosophical companion, here to explore these themes with depth and care.\n\nWhat question weighs on your mind today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isTyping) return;
    const userMsg: ChatMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const response = await getGuidance(messageText, messages, book.systemPrompt);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "The connection was interrupted. Please try your question again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#fdfcf9]">
      {/* Header */}
      <header className="glass border-b border-stone-100/80 px-6 h-16 flex items-center shrink-0 z-10">
        <button onClick={onBack} className="mr-4 text-stone-400 hover:text-stone-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
            <span className="text-white text-xs">&#x2726;</span>
          </div>
          <div>
            <h2 className="text-sm font-display font-medium text-stone-800">{book.title}</h2>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">AI Companion</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center shrink-0 mr-3 mt-1">
                  <span className="text-white text-[10px]">&#x2726;</span>
                </div>
              )}
              <div className={`max-w-[80%] p-4 sm:p-5 ${
                msg.role === 'user'
                  ? 'bg-stone-800 text-white rounded-2xl rounded-br-md'
                  : 'bg-white text-stone-700 shadow-sm border border-stone-100 rounded-2xl rounded-bl-md'
              }`}>
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-serif">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center shrink-0 mr-3 mt-1">
                <span className="text-white text-[10px]">&#x2726;</span>
              </div>
              <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggested prompts (only show when there's 1 message) */}
          {messages.length === 1 && !isTyping && (
            <div className="pt-4 animate-fadeIn">
              <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-3">Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="text-sm text-stone-600 bg-white border border-stone-200 px-4 py-2 rounded-full hover:border-stone-400 hover:text-stone-800 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 sm:px-6 py-4 bg-white border-t border-stone-100">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            className="w-full pl-5 pr-14 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none resize-none text-sm focus:ring-2 focus:ring-stone-200 focus:border-transparent transition-all"
            rows={1}
            placeholder="Ask your companion anything..."
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-2 w-9 h-9 bg-stone-800 text-white rounded-lg flex items-center justify-center hover:bg-stone-700 disabled:opacity-30 disabled:hover:bg-stone-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
