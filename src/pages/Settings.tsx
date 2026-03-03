import React, { useState } from 'react';
import { X, Sparkles, Moon, Bell, ChevronRight, LogOut, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const handleLogout = () => {
    // In a real app, clear tokens here
    window.location.href = '/';
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X size={24} className="text-slate-500" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Ajustes</h2>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-100">
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
            <button 
              onClick={() => setShowWhatsAppModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-colors"
            >
              Configurar
            </button>
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
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Bell size={20} /></div>
              <div>
                <p className="font-bold text-slate-700">Notificaciones Push</p>
                <p className="text-xs text-slate-400">Recibe alertas en tiempo real</p>
              </div>
            </div>
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>

          <div 
            onClick={() => navigate('/reminders')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Bell size={20} /></div>
              <div>
                <p className="font-bold text-slate-700">Gestionar Recordatorios</p>
                <p className="text-xs text-slate-400">Configura tus alertas programadas</p>
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

      {/* WhatsApp Modal Mockup */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Phone size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-slate-800">WhatsApp Sync</h3>
              <p className="text-slate-500">Para conectar tu cuenta, envía el código <span className="font-mono font-bold text-indigo-600">MINDFLOW-SYNC</span> al número oficial de MindFlow AI.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-sm font-bold text-slate-700">+34 600 000 000</p>
            </div>
            <button 
              onClick={() => setShowWhatsAppModal(false)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
