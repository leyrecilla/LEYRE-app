import React, { useState, useEffect } from 'react';
import { FileText, CheckSquare, GraduationCap, Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { icon: FileText, label: 'Notas', value: '0', color: 'bg-orange-500', path: '/notes' },
    { icon: CheckSquare, label: 'Pendientes', value: '0', color: 'bg-emerald-500', path: '/tasks' },
    { icon: GraduationCap, label: 'Aprendiendo', value: '0', color: 'bg-blue-500', path: '/learning' },
  ]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, tasksRes, learningRes] = await Promise.all([
          fetch('/api/notes'),
          fetch('/api/tasks'),
          fetch('/api/learning')
        ]);
        
        const notes = await notesRes.json();
        const tasks = await tasksRes.json();
        const learning = await learningRes.json();

        const pendingTasks = tasks.filter((t: any) => !t.completed).length;
        const completedTasks = tasks.filter((t: any) => t.completed).length;

        setStats([
          { icon: FileText, label: 'Notas', value: notes.length.toString(), color: 'bg-orange-500', path: '/notes' },
          { icon: CheckSquare, label: 'Pendientes', value: pendingTasks.toString(), color: 'bg-emerald-500', path: '/tasks' },
          { icon: GraduationCap, label: 'Aprendiendo', value: learning.length.toString(), color: 'bg-blue-500', path: '/learning' },
        ]);

        setCompletedCount(completedTasks);
        setTotalTasks(tasks.length);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchData();
  }, []);

  const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <section className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <p className="text-slate-400 font-medium">Buenos días 👋</p>
          <h2 className="text-3xl font-bold text-slate-800">¿Cómo te sientes hoy?</h2>
          <p className="text-slate-500 italic">"Tu paz mental es tu prioridad número uno."</p>
        </div>
        <div className="absolute top-0 right-0 p-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-12">
            <Sparkles size={32} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-4 lg:gap-8">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            onClick={() => navigate(stat.path)}
            className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex flex-col items-center text-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Progreso de Hoy</h3>
              <p className="text-xs text-slate-400">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <span className="text-slate-800 font-bold">{completedCount}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-xs text-slate-400 text-center">{completedCount} de {totalTasks} tareas completadas</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/notes')}
          className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
            <Plus size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Nueva Nota</h4>
            <p className="text-sm text-slate-400">Captura tus ideas</p>
          </div>
        </div>
        <div 
          onClick={() => navigate('/learning')}
          className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <GraduationCap size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Mi Aprendizaje</h4>
            <p className="text-sm text-slate-400">Sigue creciendo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
