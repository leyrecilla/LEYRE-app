import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MoreVertical, ChevronRight, X, Save, Trash2, Users, Gift, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BirthdayData {
  id?: number;
  name: string;
  date: string;
  category: string;
  folder: string;
}

interface FolderData {
  id: number;
  name: string;
  color: string;
}

export default function BirthdaysPage() {
  const [birthdays, setBirthdays] = useState<BirthdayData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentBirthday, setCurrentBirthday] = useState<BirthdayData | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    fetchBirthdays();
    fetchFolders();
  }, []);

  const fetchBirthdays = async () => {
    const res = await fetch('/api/birthdays');
    const data = await res.json();
    setBirthdays(data);
  };

  const fetchFolders = async () => {
    const res = await fetch('/api/folders?type=birthdays');
    const data = await res.json();
    setFolders(data);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, type: 'birthdays', color: '#6366f1' })
      });
      setNewFolderName('');
      setIsFolderModalOpen(false);
      fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBirthday) return;

    const method = currentBirthday.id ? 'PUT' : 'POST';
    const url = currentBirthday.id ? `/api/birthdays/${currentBirthday.id}` : '/api/birthdays';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentBirthday)
      });
      setIsEditorOpen(false);
      fetchBirthdays();
    } catch (error) {
      console.error("Error saving birthday:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contacto?')) return;
    try {
      await fetch(`/api/birthdays/${id}`, { method: 'DELETE' });
      setIsEditorOpen(false);
      fetchBirthdays();
    } catch (error) {
      console.error("Error deleting birthday:", error);
    }
  };

  const filteredBirthdays = birthdays.filter(b => 
    (b.name.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'Todos' || b.category === filter || b.folder === filter)
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Cumpleaños</h2>
          <p className="text-slate-400">{birthdays.length} contactos guardados</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFolderModalOpen(true)}
            className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <Folder size={20} />
          </button>
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
        {['Todos', 'Familia', 'Amigos', 'Trabajo', ...folders.map(f => f.name)].filter((v, i, a) => a.indexOf(v) === i).map(f => (
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
              setCurrentBirthday({ name: '', date: '', category: 'Familia', folder: 'Contactos' });
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
            <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-4 group hover:border-indigo-200 transition-all">
              <div 
                onClick={() => { setCurrentBirthday(b); setIsEditorOpen(true); }}
                className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl cursor-pointer"
              >
                {b.name.charAt(0)}
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => { setCurrentBirthday(b); setIsEditorOpen(true); }}>
                <h4 className="font-bold text-slate-800">{b.name}</h4>
                <div className="flex gap-2">
                  <p className="text-slate-400 text-sm">{b.date}</p>
                  {b.folder && <p className="text-indigo-400 text-sm font-bold uppercase tracking-wider">· {b.folder}</p>}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(b.id!)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => {
          setCurrentBirthday({ name: '', date: '', category: 'Familia', folder: 'Contactos' });
          setIsEditorOpen(true);
        }}
        className="fixed bottom-20 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      {/* Folder Modal */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFolderModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Nueva Carpeta</h3>
              <input 
                type="text" 
                placeholder="Nombre de la carpeta"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 mb-6"
              />
              <div className="flex gap-4">
                <button onClick={() => setIsFolderModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold">Cancelar</button>
                <button onClick={handleCreateFolder} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100">Crear</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <h3 className="text-2xl font-bold text-slate-800">{currentBirthday?.id ? 'Editar Cumpleaños' : 'Añadir Cumpleaños'}</h3>
                <div className="flex gap-2">
                  {currentBirthday?.id && (
                    <button onClick={() => handleDelete(currentBirthday.id!)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button onClick={() => setIsEditorOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
                </div>
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
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Carpeta</label>
                  <select 
                    value={currentBirthday?.folder}
                    onChange={e => setCurrentBirthday(prev => prev ? ({ ...prev, folder: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                  >
                    <option>Contactos</option>
                    <option>VIP</option>
                    {folders.map(f => <option key={f.id}>{f.name}</option>)}
                  </select>
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
