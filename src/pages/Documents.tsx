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
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, title: 'Proyecto MindFlow.pdf', type: 'PDF', folder: 'Trabajo', size: '2.4 MB', last_modified: 'Hace 2 horas' },
    { id: 2, title: 'Presupuesto 2025.xlsx', type: 'Excel', folder: 'Finanzas', size: '1.1 MB', last_modified: 'Ayer' },
    { id: 3, title: 'Contrato Alquiler.docx', type: 'Word', folder: 'Personal', size: '850 KB', last_modified: '3 Mar 2025' },
  ]);
  const [search, setSearch] = useState('');

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
        <button className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 font-bold">
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
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow space-y-4 group cursor-pointer hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                <File size={24} />
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Eye size={18} /></button>
                <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Download size={18} /></button>
              </div>
            </div>
            <div>
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
    </div>
  );
}
