import React, { useState } from 'react';
import { X, Sparkles, Moon, Bell, ChevronRight, LogOut, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    // In a real app, clear tokens here
    window.location.href = '/';
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl">
          <X size={24} className="text-slate-500" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Ajustes</h2>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            L
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Leyre Tris Fernandez</h3>
            <p className="text-slate-400">leyre.tf@gmail.com</p>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center gap-4">
          <div className="text-indigo-600"><Sparkles size={24} /></div>
          <div>
            <h4 className="font-bold text-indigo-900">¡Bienvenido a MindFlow!</h4>
            <p className="text-sm text-indigo-700">Tu segundo cerebro está listo para ayudarte</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Integraciones</h3>
        <div className="bg-white rounded-3xl border border-slate-100 card-shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Phone size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-700">WhatsApp Sync</p>
                <p className="text-xs text-slate-400">Habla con tu cerebro desde WhatsApp</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100">Configurar</button>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-4 text-center">
            <div className="w-32 h-32 bg-white border border-slate-100 rounded-xl flex items-center justify-center p-2">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MindFlowSync" 
                alt="QR Code" 
                className="w-full h-full opacity-50 grayscale"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-slate-400">Escanea este código para vincular tu cuenta de WhatsApp con MindFlow AI</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Preferencias</h3>
        <div className="bg-white rounded-3xl border border-slate-100 card-shadow divide-y divide-slate-50">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Moon size={20} /></div>
              <div>
                <p className="font-bold text-slate-700">Modo oscuro</p>
                <p className="text-xs text-slate-400">Activa el tema oscuro</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${darkMode ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
          <div 
            onClick={() => navigate('/reminders')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Bell size={20} /></div>
              <div>
                <p className="font-bold text-slate-700">Notificaciones</p>
                <p className="text-xs text-slate-400">Gestiona las alertas</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
          </div>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full bg-white p-4 rounded-2xl border border-slate-100 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
      >
        <LogOut size={20} />
        Cerrar sesión
      </button>
    </div>
  );
}
