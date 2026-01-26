
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Book } from '../types';
import { getGuidance } from '../services/geminiService';

interface ChatViewProps {
  book: Book;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ book, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Welcome to the resonance chamber of "${book.title}". I'm here to explore these specific philosophical themes with you. How can I guide you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      // Corrected call to getGuidance to use the new signature
      const response = await getGuidance(input, messages, book.systemPrompt);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connectivity is lost in the noise. Let us try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      <header className="bg-white border-b border-stone-100 px-6 h-16 flex items-center shrink-0 z-10">
        <button onClick={onBack} className="mr-4 text-stone-400 hover:text-stone-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-800 italic">{book.title} Companion</h2>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-3xl ${msg.role === 'user' ? 'bg-stone-800 text-white rounded-br-none' : 'bg-white text-stone-800 shadow-sm border border-stone-100 rounded-bl-none'}`}>
                <p className="text-md leading-relaxed whitespace-pre-wrap italic font-serif">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 bg-white border-t border-stone-100">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            className="w-full pl-6 pr-16 py-4 bg-stone-100 border-none rounded-2xl outline-none resize-none"
            rows={1}
            placeholder="Explore the philosophy..."
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping} className="absolute right-3 bottom-3 p-2 bg-rose-600 text-white rounded-xl">
             ➔
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
