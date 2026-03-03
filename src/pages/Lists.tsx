import React, { useState, useEffect } from 'react';
import { Plus, Search, List as ListIcon, MoreVertical, ChevronRight, X, Save, Trash2, CheckCircle, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface List {
  id?: number;
  title: string;
  items: string; // Stored as string in DB
  category: string;
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentList, setCurrentList] = useState<List | null>(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await fetch('/api/lists');
      const data = await res.json();
      setLists(data);
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentList) return;

    const method = currentList.id ? 'PUT' : 'POST';
    const url = currentList.id ? `/api/lists/${currentList.id}` : '/api/lists';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentList)
      });
      setIsModalOpen(false);
      fetchLists();
    } catch (error) {
      console.error("Error saving list:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta lista?')) return;
    try {
      await fetch(`/api/lists/${id}`, { method: 'DELETE' });
      fetchLists();
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

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
        <button 
          onClick={() => {
            setCurrentList({ title: '', items: '', category: 'General' });
            setIsModalOpen(true);
          }}
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 font-bold"
        >
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
        {filteredLists.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <ListIcon className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400">No hay listas guardadas</p>
          </div>
        )}
        {filteredLists.map(list => {
          const itemsArray = list.items ? list.items.split('\n').filter(i => i.trim()) : [];
          return (
            <div key={list.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow space-y-4 group hover:border-indigo-200 transition-all">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <ListIcon size={24} />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => { setCurrentList(list); setIsModalOpen(true); }}
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <MoreVertical size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(list.id!)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="cursor-pointer" onClick={() => { setCurrentList(list); setIsModalOpen(true); }}>
                <h4 className="font-bold text-slate-800 text-lg">{list.title}</h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{list.category}</p>
              </div>
              <div className="space-y-2">
                {itemsArray.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                    <Circle size={12} className="text-slate-300" />
                    <span>{item}</span>
                  </div>
                ))}
                {itemsArray.length > 3 && (
                  <p className="text-xs text-slate-300 font-medium">+{itemsArray.length - 3} elementos más</p>
                )}
                {itemsArray.length === 0 && (
                  <p className="text-xs text-slate-300 italic">Lista vacía</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{currentList?.id ? 'Editar' : 'Nueva'} Lista</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Título de la lista</label>
                  <input 
                    type="text" 
                    required
                    value={currentList?.title}
                    onChange={e => setCurrentList(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all font-bold text-slate-800"
                    placeholder="Ej: Compra Semanal"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Categoría</label>
                  <input 
                    type="text" 
                    value={currentList?.category}
                    onChange={e => setCurrentList(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all text-sm font-bold text-slate-800"
                    placeholder="Ej: Hogar"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Elementos (uno por línea)</label>
                  <textarea 
                    rows={5}
                    value={currentList?.items}
                    onChange={e => setCurrentList(prev => prev ? ({ ...prev, items: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all text-sm font-medium text-slate-800 resize-none"
                    placeholder="Leche&#10;Huevos&#10;Pan"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Guardar Lista
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
