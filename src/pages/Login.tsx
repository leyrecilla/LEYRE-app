import React, { useState } from 'react';
import { Sparkles, Mail, Lock, ChevronRight, Github, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mx-auto rotate-12">
            <Sparkles size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800">MindFlow</h1>
            <p className="text-slate-400 font-medium tracking-widest uppercase text-xs mt-2">Tu segundo cerebro</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 card-shadow space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Bienvenido de nuevo</h2>
            <p className="text-slate-400 text-sm">Inicia sesión para acceder a tu cerebro</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-400 transition-all"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
            >
              Entrar <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-300 font-bold">O continúa con</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-600 font-bold text-sm">
              <Chrome size={18} /> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-600 font-bold text-sm">
              <Github size={18} /> GitHub
            </button>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm">
          ¿No tienes cuenta? <button className="text-indigo-600 font-bold">Regístrate gratis</button>
        </p>
      </div>
    </div>
  );
}
