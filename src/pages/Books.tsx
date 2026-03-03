import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, MoreVertical, Star, ChevronRight, X, Save, Trash2, Book, Bookmark, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Book {
  id?: number;
  title: string;
  author: string;
  category: string;
  status: string;
  pages_read: number;
  total_pages: number;
  start_date: string;
  notes: string;
  quotes: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const res = await fetch('/api/books');
    const data = await res.json();
    setBooks(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBook) return;
    await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentBook)
    });
    setIsEditorOpen(false);
    fetchBooks();
  };

  const filteredBooks = books.filter(b => 
    (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'Todos' || b.status === filter)
  );

  const stats = [
    { icon: Book, label: 'Total', value: books.length, color: 'bg-indigo-600' },
    { icon: Bookmark, label: 'Leyendo', value: books.filter(b => b.status === 'Leyendo').length, color: 'bg-blue-500' },
    { icon: CheckCircle, label: 'Leídos', value: books.filter(b => b.status === 'Completado').length, color: 'bg-emerald-500' },
    { icon: Clock, label: 'Pendientes', value: books.filter(b => b.status === 'Por leer').length, color: 'bg-slate-500' },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Mi biblioteca</h2>
        <p className="text-slate-400">Tu colección de lecturas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-3xl border border-slate-100 card-shadow flex flex-col items-center text-center gap-2">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar libros..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all card-shadow"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todos', 'Por leer', 'Leyendo', 'Completado'].map(f => (
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
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex gap-4 group cursor-pointer hover:border-indigo-200 transition-all">
            <div className="w-24 h-32 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
              <Book size={40} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 text-lg line-clamp-2">{book.title}</h4>
                  <button className="p-1 text-slate-300 group-hover:text-slate-500"><MoreVertical size={18} /></button>
                </div>
                <p className="text-slate-400 text-sm">{book.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded-full border border-slate-100">
                  {book.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          setCurrentBook({ title: '', author: '', category: 'Otros', status: 'Por leer', pages_read: 0, total_pages: 0, start_date: '', notes: '', quotes: '' });
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
                    placeholder="Nombre del libro"
                    value={currentBook?.title}
                    onChange={e => setCurrentBook(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Autor</label>
                  <input 
                    type="text" 
                    placeholder="Nombre del autor"
                    value={currentBook?.author}
                    onChange={e => setCurrentBook(prev => prev ? ({ ...prev, author: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Estado</label>
                    <select 
                      value={currentBook?.status}
                      onChange={e => setCurrentBook(prev => prev ? ({ ...prev, status: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option>Por leer</option>
                      <option>Leyendo</option>
                      <option>Completado</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Categoría</label>
                    <select 
                      value={currentBook?.category}
                      onChange={e => setCurrentBook(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option>Ficción</option>
                      <option>No ficción</option>
                      <option>Productividad</option>
                      <option>Otros</option>
                    </select>
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

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
