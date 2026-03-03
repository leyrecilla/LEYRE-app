import React, { useState, useEffect } from 'react';
import { Plus, Search, Bell, MoreVertical, Calendar, Clock, ChevronRight, X, Save, Trash2, AlertCircle, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReminderData {
  id?: number;
  title: string;
  date: string;
  time: string;
  priority: string;
  completed: boolean | number;
  folder: string;
}

interface FolderData {
  id: number;
  name: string;
  color: string;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<ReminderData | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    fetchReminders();
    fetchFolders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      setReminders(data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  const fetchFolders = async () => {
    const res = await fetch('/api/folders?type=reminders');
    const data = await res.json();
    setFolders(data);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, type: 'reminders', color: '#6366f1' })
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
    if (!currentReminder) return;

    const method = currentReminder.id ? 'PUT' : 'POST';
    const url = currentReminder.id ? `/api/reminders/${currentReminder.id}` : '/api/reminders';
    
    // Ensure completed is stored as 0 or 1 for SQLite
    const payload = {
      ...currentReminder,
      completed: currentReminder.completed ? 1 : 0
    };

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      fetchReminders();
    } catch (error) {
      console.error("Error saving reminder:", error);
    }
  };

  const toggleComplete = async (reminder: ReminderData) => {
    const updated = { ...reminder, completed: !reminder.completed ? 1 : 0 };
    try {
      await fetch(`/api/reminders/${reminder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      fetchReminders();
    } catch (error) {
      console.error("Error toggling reminder:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este recordatorio?')) return;
    try {
      await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const filteredReminders = reminders.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'Todos' || r.folder === filter)
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Recordatorios</h2>
          <p className="text-slate-400">Tus alertas y notificaciones</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFolderModalOpen(true)}
            className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <Folder size={20} />
          </button>
          <button 
            onClick={() => {
              setCurrentReminder({ title: '', date: new Date().toISOString().split('T')[0], time: '12:00', priority: 'Media', completed: 0, folder: 'General' });
              setIsModalOpen(true);
            }}
            className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 font-bold"
          >
            <Plus size={20} /> Nuevo
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar recordatorios..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all card-shadow"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todos', ...folders.map(f => f.name)].filter((v, i, a) => a.indexOf(v) === i).map(f => (
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

      <div className="space-y-4">
        {filteredReminders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <Bell className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400">No hay recordatorios pendientes</p>
          </div>
        )}
        {filteredReminders.map(reminder => (
          <div key={reminder.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-4 group hover:border-indigo-200 transition-all">
            <button 
              onClick={() => toggleComplete(reminder)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                reminder.completed ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              )}
            >
              <Bell size={24} />
            </button>
            <div className="flex-1 cursor-pointer" onClick={() => { setCurrentReminder(reminder); setIsModalOpen(true); }}>
              <h4 className={cn("font-bold text-slate-800", reminder.completed && "line-through text-slate-300")}>{reminder.title}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={10} /> {reminder.date}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={10} /> {reminder.time}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                  reminder.priority === 'Alta' ? "bg-red-50 text-red-600" : reminder.priority === 'Media' ? "bg-orange-50 text-orange-600" : "bg-slate-50 text-slate-400"
                )}>
                  {reminder.priority}
                </span>
                {reminder.folder && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600">
                    {reminder.folder}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleDelete(reminder.id!)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

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
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{currentReminder?.id ? 'Editar' : 'Nuevo'} Recordatorio</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Título</label>
                  <input 
                    type="text" 
                    required
                    value={currentReminder?.title}
                    onChange={e => setCurrentReminder(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all font-bold text-slate-800"
                    placeholder="¿Qué quieres recordar?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Fecha</label>
                    <input 
                      type="date" 
                      required
                      value={currentReminder?.date}
                      onChange={e => setCurrentReminder(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Hora</label>
                    <input 
                      type="time" 
                      required
                      value={currentReminder?.time}
                      onChange={e => setCurrentReminder(prev => prev ? ({ ...prev, time: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all text-sm font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Prioridad</label>
                    <select 
                      value={currentReminder?.priority}
                      onChange={e => setCurrentReminder(prev => prev ? ({ ...prev, priority: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option>Baja</option>
                      <option>Media</option>
                      <option>Alta</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Carpeta</label>
                    <select 
                      value={currentReminder?.folder}
                      onChange={e => setCurrentReminder(prev => prev ? ({ ...prev, folder: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option>General</option>
                      <option>Personal</option>
                      <option>Trabajo</option>
                      {folders.map(f => <option key={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Guardar Recordatorio
                </button>
              </form>
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
