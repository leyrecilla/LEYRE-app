import React, { useState, useEffect } from 'react';
import { Plus, Search, GraduationCap, MoreVertical, ExternalLink, ChevronRight, X, Save, Trash2, Video, FileText, Link as LinkIcon, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Resource {
  id?: number;
  title: string;
  url: string;
  type: string;
  category: string;
  status: string;
  description: string;
  notes: string;
}

export default function LearningPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const res = await fetch('/api/learning');
    const data = await res.json();
    setResources(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentResource) return;
    await fetch('/api/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentResource)
    });
    setIsEditorOpen(false);
    fetchResources();
  };

  const filteredResources = resources.filter(r => 
    (r.title.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'Todos' || r.status === filter)
  );

  const stats = [
    { icon: Book, label: 'Total', value: resources.length, color: 'bg-indigo-600' },
    { icon: GraduationCap, label: 'En progreso', value: resources.filter(r => r.status === 'En progreso').length, color: 'bg-orange-500' },
    { icon: CheckCircle, label: 'Completados', value: resources.filter(r => r.status === 'Completado').length, color: 'bg-emerald-500' },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Zona de Aprendizaje</h2>
        <p className="text-slate-400">Tu espacio de crecimiento personal</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex flex-col items-center text-center gap-3">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar recursos..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all card-shadow"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todos', 'Por empezar', 'En progreso', 'Completado'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              filter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(res => (
          <div key={res.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow space-y-4 group cursor-pointer hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                {res.type === 'Video' ? <Video size={24} /> : res.type === 'PDF' ? <FileText size={24} /> : <LinkIcon size={24} />}
              </div>
              <button className="p-1 text-slate-300 group-hover:text-slate-500"><MoreVertical size={18} /></button>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg line-clamp-2">{res.title}</h4>
              <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{res.status}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">{res.type}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          setCurrentResource({ title: '', url: '', type: 'Curso', category: 'Otros', status: 'Por empezar', description: '', notes: '' });
          setIsEditorOpen(true);
        }}
        className="fixed bottom-20 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      <AnimatePresence>
        {isEditorOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 bg-white z-50 flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <button onClick={() => setIsEditorOpen(false)} className="p-2 text-slate-500"><X size={24} /></button>
              <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                <Save size={18} /> Guardar
              </button>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-2xl mx-auto w-full">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Título</label>
                  <input 
                    type="text" 
                    placeholder="Nombre del recurso"
                    value={currentResource?.title}
                    onChange={e => setCurrentResource(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Enlace (opcional)</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={currentResource?.url}
                    onChange={e => setCurrentResource(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Tipo de recurso</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Curso', 'Video', 'PDF', 'Artículo', 'Podcast', 'Libro'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setCurrentResource(prev => prev ? ({ ...prev, type: t }) : null)}
                        className={cn(
                          "py-3 rounded-xl text-xs font-bold border transition-all",
                          currentResource?.type === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-100"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { CheckCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
