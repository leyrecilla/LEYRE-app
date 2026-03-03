import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, FileText, MoreVertical, Folder, Tag, ChevronRight, X, Save, Trash2, Palette, Paperclip, Bell as BellIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Note {
  id?: number;
  title: string;
  content: string;
  folder: string;
  color: string;
  tags: string;
  created_at?: string;
}

interface FolderData {
  id: number;
  name: string;
  color: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [isSaving, setIsSaving] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchNotes();
    fetchFolders();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch('/api/notes');
    const data = await res.json();
    setNotes(data);
  };

  const fetchFolders = async () => {
    const res = await fetch('/api/folders?type=notes');
    const data = await res.json();
    setFolders(data);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, type: 'notes', color: '#6366f1' })
      });
      setNewFolderName('');
      setIsFolderModalOpen(false);
      fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleSave = async (noteToSave: Note) => {
    if (!noteToSave) return;
    setIsSaving(true);

    const method = noteToSave.id ? 'PUT' : 'POST';
    const url = noteToSave.id ? `/api/notes/${noteToSave.id}` : '/api/notes';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteToSave)
      });
      const savedNote = await res.json();
      if (!noteToSave.id) {
        setCurrentNote(savedNote);
      }
      fetchNotes();
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error("Error saving note:", error);
      setIsSaving(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (isEditorOpen && currentNote) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        handleSave(currentNote);
      }, 30000);
    }
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [currentNote?.title, currentNote?.content, currentNote?.folder]);

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

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Mis Notas</h2>
          <p className="text-slate-400">{filteredNotes.length} notas creadas</p>
        </div>
        <button 
          onClick={() => setIsFolderModalOpen(true)}
          className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
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
        {['Todas', ...folders.map(f => f.name), 'Personal', 'Ideas', 'Trabajo'].filter((v, i, a) => a.indexOf(v) === i).map(f => (
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
              <div 
                className="text-slate-500 text-sm line-clamp-3 overflow-hidden h-15"
                dangerouslySetInnerHTML={{ __html: note.content || 'Sin contenido...' }}
              />
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
                {currentNote?.id && (
                  <button onClick={() => handleDelete(currentNote.id!)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
                <button className="p-2 text-slate-400"><BellIcon size={20} /></button>
                <button onClick={() => handleSave(currentNote!)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                  <Save size={18} /> Guardar
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                    {folders.map(f => <option key={f.id}>{f.name}</option>)}
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

                <div className="quill-container flex-1 min-h-[500px]">
                  <ReactQuill 
                    theme="snow"
                    value={currentNote?.content || ''}
                    onChange={content => setCurrentNote(prev => prev ? ({ ...prev, content }) : null)}
                    modules={quillModules}
                    placeholder="Empieza a escribir..."
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .quill-container .ql-container {
          border: none !important;
          font-size: 1.125rem;
          color: #334155;
        }
        .quill-container .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 8px 0 !important;
        }
        .quill-container .ql-editor {
          padding: 20px 0 !important;
          min-height: 400px;
        }
        .quill-container .ql-editor.ql-blank::before {
          left: 0 !important;
          color: #e2e8f0 !important;
          font-style: normal !important;
        }
      `}</style>
    </div>
  );
}
