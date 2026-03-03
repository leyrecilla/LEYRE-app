import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, MoreVertical, Folder, Tag, ChevronRight, X, Save, Trash2, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Note {
  id?: number;
  title: string;
  content: string;
  folder: string;
  color: string;
  tags: string;
  created_at?: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todas');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch('/api/notes');
    const data = await res.json();
    setNotes(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNote) return;

    const method = currentNote.id ? 'PUT' : 'POST';
    const url = currentNote.id ? `/api/notes/${currentNote.id}` : '/api/notes';
    
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentNote)
      });
      setIsEditorOpen(false);
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      setIsEditorOpen(false);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const filteredNotes = notes.filter(n => 
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'Todas' || n.folder === filter)
  );

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Mis Notas</h2>
          <p className="text-slate-400">{filteredNotes.length} notas creadas</p>
        </div>
        <button className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500">
          <Folder size={20} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar notas..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all card-shadow"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todas', 'Personal', 'Ideas', 'Trabajo'].map(f => (
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

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-3xl flex items-center justify-center">
            <FileText size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Sin notas aún</h3>
            <p className="text-slate-400 max-w-xs">Crea tu primera nota para empezar a organizar tus ideas y pensamientos</p>
          </div>
          <button 
            onClick={() => {
              setCurrentNote({ title: '', content: '', folder: 'Personal', color: '#ffffff', tags: '' });
              setIsEditorOpen(true);
            }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Crear nota
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <motion.div 
              layoutId={`note-${note.id}`}
              key={note.id} 
              onClick={() => {
                setCurrentNote(note);
                setIsEditorOpen(true);
              }}
              className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow space-y-4 cursor-pointer hover:border-indigo-200 transition-all group"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{note.title || 'Sin título'}</h4>
                <button className="p-1 text-slate-300 group-hover:text-slate-500"><MoreVertical size={18} /></button>
              </div>
              <p className="text-slate-500 text-sm line-clamp-3">{note.content || 'Sin contenido...'}</p>
              <div className="flex items-center gap-2 pt-2">
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded-full border border-slate-100">
                  {note.folder}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <button 
        onClick={() => {
          setCurrentNote({ title: '', content: '', folder: 'Personal', color: '#ffffff', tags: '' });
          setIsEditorOpen(true);
        }}
        className="fixed bottom-20 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      <AnimatePresence>
        {isEditorOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 bg-white z-50 flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <button onClick={() => setIsEditorOpen(false)} className="p-2 text-slate-500"><X size={24} /></button>
              <div className="flex gap-2">
                {currentNote?.id && (
                  <button onClick={() => handleDelete(currentNote.id!)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
                <button className="p-2 text-slate-400"><Bell size={20} /></button>
                <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                  <Save size={18} /> Guardar
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto w-full">
              <input 
                type="text" 
                placeholder="Título de la nota"
                value={currentNote?.title}
                onChange={e => setCurrentNote(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                className="text-4xl font-bold text-slate-800 w-full outline-none placeholder:text-slate-200"
              />
              
              <div className="flex flex-wrap gap-3">
                <select 
                  value={currentNote?.folder}
                  onChange={e => setCurrentNote(prev => prev ? ({ ...prev, folder: e.target.value }) : null)}
                  className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-sm font-medium text-slate-500 outline-none"
                >
                  <option>Personal</option>
                  <option>Ideas</option>
                  <option>Trabajo</option>
                </select>
                <button className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400"><Palette size={20} /></button>
                <button className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-sm font-medium flex items-center gap-2">
                  <Paperclip size={18} /> Adjuntar
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Tag size={18} className="text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Añadir etiqueta..."
                  className="flex-1 outline-none text-sm text-slate-500"
                />
                <button className="px-4 py-1 border border-slate-100 rounded-lg text-xs font-bold text-slate-400">Añadir</button>
              </div>

              <textarea 
                placeholder="Empieza a escribir..."
                value={currentNote?.content}
                onChange={e => setCurrentNote(prev => prev ? ({ ...prev, content: e.target.value }) : null)}
                className="w-full flex-1 min-h-[400px] outline-none text-slate-600 leading-relaxed text-lg placeholder:text-slate-200 resize-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Bell = ({ size, className }: { size: number, className?: string }) => <BellIcon size={size} className={className} />;
import { Bell as BellIcon, Paperclip } from 'lucide-react';
