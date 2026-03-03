import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckSquare, MoreVertical, Calendar, Flag, ChevronRight, X, Save, Trash2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id?: number;
  title: string;
  description: string;
  priority: string;
  due_date: string;
  completed: number;
  tags: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;
    
    const method = currentTask.id ? 'PUT' : 'POST';
    const url = currentTask.id ? `/api/tasks/${currentTask.id}` : '/api/tasks';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTask)
      });
      setIsCreatorOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const toggleComplete = async (task: Task) => {
    const updated = { ...task, completed: task.completed ? 0 : 1 };
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      fetchTasks();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const filteredTasks = tasks.filter(t => 
    (t.title.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'Todas' || (filter === 'Pendientes' && !t.completed) || (filter === 'Completadas' && t.completed)) &&
    (!hideCompleted || !t.completed)
  );

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Mis Tareas</h2>
          <p className="text-slate-400">{tasks.filter(t => !t.completed).length} pendientes · {tasks.filter(t => t.completed).length} completadas</p>
        </div>
        <button className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500">
          <Upload size={20} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar tareas..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all card-shadow"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todas', 'Pendientes', 'Completadas'].map(f => (
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

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <EyeOff size={18} />
          <span className="text-sm font-medium">Ocultar completadas</span>
        </div>
        <button 
          onClick={() => setHideCompleted(!hideCompleted)}
          className={cn(
            "w-12 h-6 rounded-full relative transition-colors",
            hideCompleted ? "bg-indigo-600" : "bg-slate-200"
          )}
        >
          <div className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
            hideCompleted ? "right-1" : "left-1"
          )}></div>
        </button>
      </div>

      <div className="space-y-4">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-4 group">
            <button 
              onClick={() => toggleComplete(task)}
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-transparent hover:border-indigo-400"
              )}
            >
              <Check size={18} />
            </button>
            <div className="flex-1">
              <h4 className={cn("font-bold text-slate-800 transition-all", task.completed && "line-through text-slate-300")}>
                {task.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded flex items-center gap-1">
                  <Flag size={10} /> {task.priority}
                </span>
                <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded flex items-center gap-1">
                  <Calendar size={10} /> {task.due_date || 'Sin fecha'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setCurrentTask(task); setIsCreatorOpen(true); }}
                className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              <button 
                onClick={() => handleDelete(task.id!)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          setCurrentTask({ title: '', description: '', priority: 'Media', due_date: '', completed: 0, tags: '' });
          setIsCreatorOpen(true);
        }}
        className="fixed bottom-20 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      <AnimatePresence>
        {isCreatorOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-lg rounded-t-3xl lg:rounded-3xl p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-800">{currentTask?.id ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
                <button onClick={() => setIsCreatorOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Título</label>
                  <input 
                    type="text" 
                    placeholder="¿Qué hay que hacer?"
                    value={currentTask?.title}
                    onChange={e => setCurrentTask(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Descripción</label>
                  <textarea 
                    placeholder="Añade detalles..."
                    value={currentTask?.description}
                    onChange={e => setCurrentTask(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 h-24 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Prioridad</label>
                    <select 
                      value={currentTask?.priority}
                      onChange={e => setCurrentTask(prev => prev ? ({ ...prev, priority: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option>Baja</option>
                      <option>Media</option>
                      <option>Alta</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Fecha</label>
                    <input 
                      type="date"
                      value={currentTask?.due_date}
                      onChange={e => setCurrentTask(prev => prev ? ({ ...prev, due_date: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                {currentTask?.id ? 'Guardar Cambios' : 'Crear Tarea'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { EyeOff, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
