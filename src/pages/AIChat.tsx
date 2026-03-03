import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus, Settings, Send, MessageSquare, Phone } from 'lucide-react';
import { getAIResponse } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! 👋 Soy tu asistente personal de MindFlow. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAIResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Lo siento, ha ocurrido un error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { icon: '📝', text: 'Resumen de mis tareas pendientes' },
    { icon: '📚', text: 'Búscame un curso de React' },
    { icon: '💡', text: 'Consejos para mejorar mi enfoque' },
    { icon: '🧘', text: 'Sugerencias para desconectar' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Asistente AI</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Tu copiloto personal</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">
            <Phone size={14} /> WhatsApp Sync
          </button>
          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><Settings size={20} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 1 && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">¡Hola! 👋</h2>
            <p className="text-slate-500 text-center max-w-xs">Soy tu asistente personal de MindFlow. Puedo ayudarte con:</p>
            
            <div className="grid grid-cols-1 gap-3 w-full max-w-md mt-4">
              {suggestions.map((s) => (
                <button 
                  key={s.text} 
                  onClick={() => setInput(s.text)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-indigo-200 transition-all text-left group"
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm rounded-tl-none flex gap-1">
              <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 outline-none focus:border-indigo-400 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
