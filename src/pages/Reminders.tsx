import React, { useState, useEffect } from 'react';
import { Plus, Search, Bell, MoreVertical, Calendar, Clock, ChevronRight, X, Save, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Reminder {
  id?: number;
  title: string;
  date: string;
  time: string;
  priority: string;
  completed: boolean | number;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    fetchReminders();
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

  const toggleComplete = async (reminder: Reminder) => {
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
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Recordatorios</h2>
          <p className="text-slate-400">Tus alertas y notificaciones</p>
        </div>
        <button 
          onClick={() => {
            setCurrentReminder({ title: '', date: new Date().toISOString().split('T')[0], time: '12:00', priority: 'Media', completed: 0 });
            setIsModalOpen(true);
          }}
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 font-bold"
        >
          <Plus size={20} /> Nuevo
        </button>
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Prioridad</label>
                  <div className="flex gap-2">
                    {['Baja', 'Media', 'Alta'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentReminder(prev => prev ? ({ ...prev, priority: p }) : null)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold transition-all border",
                          currentReminder?.priority === p 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                            : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                        )}
                      >
                        {p}
                      </button>
                    ))}
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
