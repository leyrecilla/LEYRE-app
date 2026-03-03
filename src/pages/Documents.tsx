import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, MoreVertical, Folder, Tag, ChevronRight, X, Save, Trash2, File, Download, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Document {
  id?: number;
  title: string;
  type: string;
  folder: string;
  size: string;
  last_modified: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoc) return;

    const method = currentDoc.id ? 'PUT' : 'POST';
    const url = currentDoc.id ? `/api/documents/${currentDoc.id}` : '/api/documents';
    
    const payload = {
      ...currentDoc,
      last_modified: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      fetchDocs();
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) return;
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      fetchDocs();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Documentos</h2>
          <p className="text-slate-400">Gestiona tus archivos importantes</p>
        </div>
        <button 
          onClick={() => {
            setCurrentDoc({ title: '', type: 'PDF', folder: 'General', size: '0 KB', last_modified: '' });
            setIsModalOpen(true);
          }}
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 font-bold"
        >
          <Plus size={20} /> Subir
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar documentos..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all card-shadow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <FileText className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400">No hay documentos guardados</p>
          </div>
        )}
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow space-y-4 group hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                <File size={24} />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setCurrentDoc(doc); setIsModalOpen(true); }}
                  className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id!)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="cursor-pointer" onClick={() => { setCurrentDoc(doc); setIsModalOpen(true); }}>
              <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{doc.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{doc.type}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{doc.size}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded-full border border-slate-100">
                {doc.folder}
              </span>
              <span className="text-[10px] text-slate-300 font-medium">{doc.last_modified}</span>
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
                <h3 className="text-xl font-bold text-slate-800">{currentDoc?.id ? 'Editar' : 'Subir'} Documento</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Nombre del archivo</label>
                  <input 
                    type="text" 
                    required
                    value={currentDoc?.title}
                    onChange={e => setCurrentDoc(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all font-bold text-slate-800"
                    placeholder="Ej: Proyecto MindFlow.pdf"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Tipo</label>
                    <select 
                      value={currentDoc?.type}
                      onChange={e => setCurrentDoc(prev => prev ? ({ ...prev, type: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all text-sm font-bold text-slate-800"
                    >
                      <option>PDF</option>
                      <option>Word</option>
                      <option>Excel</option>
                      <option>Imagen</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Carpeta</label>
                    <input 
                      type="text" 
                      value={currentDoc?.folder}
                      onChange={e => setCurrentDoc(prev => prev ? ({ ...prev, folder: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all text-sm font-bold text-slate-800"
                      placeholder="Ej: Trabajo"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Tamaño</label>
                  <input 
                    type="text" 
                    value={currentDoc?.size}
                    onChange={e => setCurrentDoc(prev => prev ? ({ ...prev, size: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-indigo-400 transition-all text-sm font-bold text-slate-800"
                    placeholder="Ej: 2.4 MB"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Guardar Documento
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
