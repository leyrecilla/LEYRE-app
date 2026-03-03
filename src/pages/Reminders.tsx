import React, { useState, useEffect } from 'react';
import { Plus, Search, Bell, MoreVertical, Calendar, Clock, ChevronRight, X, Save, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Reminder {
  id?: number;
  title: string;
  date: string;
  time: string;
  priority: string;
  completed: boolean;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 1, title: 'Reunión con el equipo', date: '2025-03-04', time: '10:00', priority: 'Alta', completed: false },
    { id: 2, title: 'Comprar comida para el gato', date: '2025-03-05', time: '18:00', priority: 'Media', completed: false },
    { id: 3, title: 'Llamar al médico', date: '2025-03-06', time: '09:00', priority: 'Baja', completed: true },
  ]);
  const [search, setSearch] = useState('');

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
        <button className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 font-bold">
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
        {filteredReminders.map(reminder => (
          <div key={reminder.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-4 group cursor-pointer hover:border-indigo-200 transition-all">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              reminder.completed ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
            )}>
              <Bell size={24} />
            </div>
            <div className="flex-1">
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
            <button className="p-2 text-slate-300 group-hover:text-slate-500"><MoreVertical size={20} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
