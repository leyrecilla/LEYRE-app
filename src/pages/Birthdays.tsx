import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MoreVertical, ChevronRight, X, Save, Trash2, Users, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Birthday {
  id?: number;
  name: string;
  date: string;
  category: string;
}

export default function BirthdaysPage() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentBirthday, setCurrentBirthday] = useState<Birthday | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    const res = await fetch('/api/birthdays');
    const data = await res.json();
    setBirthdays(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBirthday) return;
    await fetch('/api/birthdays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentBirthday)
    });
    setIsEditorOpen(false);
    fetchBirthdays();
  };

  const filteredBirthdays = birthdays.filter(b => 
    (b.name.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'Todos' || b.category === filter)
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Cumpleaños</h2>
          <p className="text-slate-400">{birthdays.length} contactos guardados</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm"><Users size={20} /></button>
          <button className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500"><Calendar size={20} /></button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar contactos..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all card-shadow"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todos', 'Familia', 'Amigos', 'Trabajo'].map(f => (
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

      {filteredBirthdays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-3xl flex items-center justify-center">
            <Gift size={48} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Sin cumpleaños guardados</h3>
            <p className="text-slate-400 max-w-xs">Agrega los cumpleaños de tus seres queridos para no olvidar ninguna fecha especial.</p>
          </div>
          <button 
            onClick={() => {
              setCurrentBirthday({ name: '', date: '', category: 'Familia' });
              setIsEditorOpen(true);
            }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Añadir cumpleaños
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBirthdays.map(b => (
            <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-4 group cursor-pointer hover:border-indigo-200 transition-all">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                {b.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">{b.name}</h4>
                <p className="text-slate-400 text-sm">{b.date}</p>
              </div>
              <button className="p-2 text-slate-300 group-hover:text-slate-500"><MoreVertical size={20} /></button>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => {
          setCurrentBirthday({ name: '', date: '', category: 'Familia' });
          setIsEditorOpen(true);
        }}
        className="fixed bottom-20 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-lg rounded-t-3xl lg:rounded-3xl p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-800">Añadir Cumpleaños</h3>
                <button onClick={() => setIsEditorOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
                  <input 
                    type="text" 
                    placeholder="Nombre del contacto"
                    value={currentBirthday?.name}
                    onChange={e => setCurrentBirthday(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Fecha</label>
                    <input 
                      type="date"
                      value={currentBirthday?.date}
                      onChange={e => setCurrentBirthday(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Categoría</label>
                    <select 
                      value={currentBirthday?.category}
                      onChange={e => setCurrentBirthday(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option>Familia</option>
                      <option>Amigos</option>
                      <option>Trabajo</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Guardar contacto
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
