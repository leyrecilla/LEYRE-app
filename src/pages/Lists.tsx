import React, { useState, useEffect } from 'react';
import { Plus, Search, List as ListIcon, MoreVertical, ChevronRight, X, Save, Trash2, CheckCircle, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface List {
  id?: number;
  title: string;
  items: string[];
  category: string;
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([
    { id: 1, title: 'Compra Semanal', items: ['Leche', 'Huevos', 'Pan', 'Fruta'], category: 'Hogar' },
    { id: 2, title: 'Películas por ver', items: ['Inception', 'Interstellar', 'The Prestige'], category: 'Ocio' },
    { id: 3, title: 'Ideas de Regalo', items: ['Libro de cocina', 'Auriculares', 'Planta'], category: 'Personal' },
  ]);
  const [search, setSearch] = useState('');

  const filteredLists = lists.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Mis Listas</h2>
          <p className="text-slate-400">Organiza tus cosas por categorías</p>
        </div>
        <button className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 font-bold">
          <Plus size={20} /> Nueva Lista
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar listas..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all card-shadow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLists.map(list => (
          <div key={list.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow space-y-4 group cursor-pointer hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <ListIcon size={24} />
              </div>
              <button className="p-2 text-slate-300 group-hover:text-slate-500"><MoreVertical size={20} /></button>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">{list.title}</h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{list.category}</p>
            </div>
            <div className="space-y-2">
              {list.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                  <Circle size={12} className="text-slate-300" />
                  <span>{item}</span>
                </div>
              ))}
              {list.items.length > 3 && (
                <p className="text-xs text-slate-300 font-medium">+{list.items.length - 3} elementos más</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
