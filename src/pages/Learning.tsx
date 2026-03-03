import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, GraduationCap, MoreVertical, ExternalLink, ChevronRight, X, Save, Trash2, Video, FileText, Link as LinkIcon, Book, CheckCircle, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Resource {
  id?: number;
  title: string;
  url: string;
  type: string;
  category: string;
  status: string;
  description: string;
  notes: string;
  folder: string;
}

interface FolderData {
  id: number;
  name: string;
  color: string;
}

export default function LearningPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [isSaving, setIsSaving] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchResources();
    fetchFolders();
  }, []);

  const fetchResources = async () => {
    const res = await fetch('/api/learning');
    const data = await res.json();
    setResources(data);
  };

  const fetchFolders = async () => {
    const res = await fetch('/api/folders?type=learning');
    const data = await res.json();
    setFolders(data);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, type: 'learning', color: '#6366f1' })
      });
      setNewFolderName('');
      setIsFolderModalOpen(false);
      fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleSave = async (resourceToSave: Resource) => {
    if (!resourceToSave) return;
    setIsSaving(true);

    const method = resourceToSave.id ? 'PUT' : 'POST';
    const url = resourceToSave.id ? `/api/learning/${resourceToSave.id}` : '/api/learning';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceToSave)
      });
      const savedResource = await res.json();
      if (!resourceToSave.id) {
        setCurrentResource(savedResource);
      }
      fetchResources();
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error("Error saving resource:", error);
      setIsSaving(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (isEditorOpen && currentResource) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        handleSave(currentResource);
      }, 30000);
    }
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [currentResource?.title, currentResource?.url, currentResource?.type, currentResource?.status, currentResource?.description, currentResource?.notes, currentResource?.folder]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este recurso?')) return;
    try {
      await fetch(`/api/learning/${id}`, { method: 'DELETE' });
      setIsEditorOpen(false);
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const filteredResources = resources.filter(r => 
    (r.title.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'Todos' || r.status === filter || r.folder === filter)
  );

  const stats = [
    { icon: Book, label: 'Total', value: resources.length, color: 'bg-indigo-600' },
    { icon: GraduationCap, label: 'En progreso', value: resources.filter(r => r.status === 'En progreso').length, color: 'bg-orange-500' },
    { icon: CheckCircle, label: 'Completados', value: resources.filter(r => r.status === 'Completado').length, color: 'bg-emerald-500' },
  ];

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Zona de Aprendizaje</h2>
          <p className="text-slate-400">Tu espacio de crecimiento personal</p>
        </div>
        <button 
          onClick={() => setIsFolderModalOpen(true)}
          className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Folder size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex flex-col items-center text-center gap-3">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar recursos..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all card-shadow"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todos', 'Por empezar', 'En progreso', 'Completado', ...folders.map(f => f.name)].filter((v, i, a) => a.indexOf(v) === i).map(f => (
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
        {filteredResources.map(res => (
          <div 
            key={res.id} 
            onClick={() => { setCurrentResource(res); setIsEditorOpen(true); }}
            className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow space-y-4 group cursor-pointer hover:border-indigo-200 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                {res.type === 'Video' ? <Video size={24} /> : res.type === 'PDF' ? <FileText size={24} /> : <LinkIcon size={24} />}
              </div>
              <button className="p-1 text-slate-300 group-hover:text-slate-500"><MoreVertical size={18} /></button>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg line-clamp-2">{res.title}</h4>
              <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{res.status}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">{res.type}</span>
                {res.folder && <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">· {res.folder}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          setCurrentResource({ title: '', url: '', type: 'Curso', category: 'Otros', status: 'Por empezar', description: '', notes: '', folder: 'General' });
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
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 bg-white z-50 flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsEditorOpen(false)} className="p-2 text-slate-500"><X size={24} /></button>
                {isSaving && <span className="text-xs text-slate-400 animate-pulse font-medium">Guardando...</span>}
              </div>
              <div className="flex gap-2">
                {currentResource?.id && (
                  <button onClick={() => handleDelete(currentResource.id!)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={() => handleSave(currentResource!)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                  <Save size={18} /> Guardar
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto w-full">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Título</label>
                  <input 
                    type="text" 
                    placeholder="Nombre del recurso"
                    value={currentResource?.title}
                    onChange={e => setCurrentResource(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 text-xl font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Enlace (opcional)</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={currentResource?.url}
                      onChange={e => setCurrentResource(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Estado</label>
                    <select 
                      value={currentResource?.status}
                      onChange={e => setCurrentResource(prev => prev ? ({ ...prev, status: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option>Por empezar</option>
                      <option>En progreso</option>
                      <option>Completado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Carpeta</label>
                    <select 
                      value={currentResource?.folder}
                      onChange={e => setCurrentResource(prev => prev ? ({ ...prev, folder: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option>General</option>
                      <option>Cursos</option>
                      <option>Lecturas</option>
                      {folders.map(f => <option key={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Tipo</label>
                    <select 
                      value={currentResource?.type}
                      onChange={e => setCurrentResource(prev => prev ? ({ ...prev, type: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      {['Curso', 'Video', 'PDF', 'Artículo', 'Podcast', 'Libro'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Notas y Apuntes</label>
                  <div className="quill-container bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                    <ReactQuill 
                      theme="snow"
                      value={currentResource?.notes || ''}
                      onChange={notes => setCurrentResource(prev => prev ? ({ ...prev, notes }) : null)}
                      modules={quillModules}
                      placeholder="Empieza a tomar notas..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .quill-container .ql-container {
          border: none !important;
          min-height: 300px;
          font-size: 1rem;
        }
        .quill-container .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
