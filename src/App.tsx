import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  LayoutGrid, 
  CheckSquare, 
  FileText, 
  BookOpen, 
  Settings, 
  Sparkles, 
  Moon, 
  Menu, 
  X, 
  Plus, 
  Search,
  Calendar,
  GraduationCap,
  FolderOpen,
  List as ListIcon,
  Bell,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const location = useLocation();
  const menuItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: FileText, label: 'Notas', path: '/notes' },
    { icon: CheckSquare, label: 'Tareas', path: '/tasks' },
    { icon: Bell, label: 'Recordatorios', path: '/reminders' },
    { icon: Calendar, label: 'Cumpleaños', path: '/birthdays' },
    { icon: GraduationCap, label: 'Aprendizaje', path: '/learning' },
    { icon: FolderOpen, label: 'Documentos', path: '/documents' },
    { icon: BookOpen, label: 'Libros', path: '/books' },
    { icon: ListIcon, label: 'Listas', path: '/lists' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-white z-50 border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          !isOpen && "lg:static"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-800">MindFlow</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Tu segundo cerebro</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
              )}
            >
              <item.icon size={20} className={cn(location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <Link 
            to="/settings" 
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Settings size={20} />
            <span className="font-medium">Ajustes</span>
          </Link>
        </div>
      </motion.aside>
    </>
  );
};

const Header = ({ onMenuOpen, darkMode, toggleDarkMode }: { onMenuOpen: () => void, darkMode: boolean, toggleDarkMode: () => void }) => {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      // Map reminders to notification format
      const mapped = data.map((r: any) => ({
        id: r.id,
        title: r.title,
        message: `${r.date} a las ${r.time}`,
        time: r.priority,
        read: !!r.completed
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.read).map(n => 
        fetch(`/api/reminders/${n.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: 1 })
        })
      ));
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: 1 })
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuOpen} className="lg:hidden p-2 text-slate-500">
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 w-64 lg:w-96">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar en tu cerebro..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => navigate('/ai')}
          className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
        >
          <Sparkles size={20} />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        Marcar todo como leído
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={cn("p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer", !n.read && "bg-indigo-50/30")}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-slate-800">{n.title}</p>
                            {!n.read && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5"></div>}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                          <p className={cn(
                            "text-[10px] mt-2 uppercase font-bold tracking-wider",
                            n.time === 'Alta' ? "text-red-500" : "text-slate-400"
                          )}>{n.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="mx-auto text-slate-200 mb-2" size={32} />
                        <p className="text-sm text-slate-400">No tienes notificaciones</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 text-center">
                    <button 
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate('/reminders');
                      }}
                      className="text-xs text-slate-500 font-bold hover:text-indigo-600"
                    >
                      Ver todos los recordatorios
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={toggleDarkMode}
          className={cn(
            "p-2.5 rounded-xl transition-colors",
            darkMode ? "bg-slate-800 text-yellow-400" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Moon size={20} />
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: CheckSquare, label: 'Tareas', path: '/tasks' },
    { icon: FileText, label: 'Notas', path: '/notes' },
    { icon: BookOpen, label: 'Libros', path: '/books' },
    { icon: Sparkles, label: 'AI', path: '/ai' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 h-16 flex items-center justify-around px-2 z-40">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
            location.pathname === item.path ? "text-indigo-600" : "text-slate-400"
          )}
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

import Dashboard from './pages/Home';
import AIChat from './pages/AIChat';
import SettingsPage from './pages/Settings';
import NotesPage from './pages/Notes';
import TasksPage from './pages/Tasks';
import BooksPage from './pages/Books';
import LearningPage from './pages/Learning';
import BirthdaysPage from './pages/Birthdays';
import DocumentsPage from './pages/Documents';
import ListsPage from './pages/Lists';
import RemindersPage from './pages/Reminders';
import LoginPage from './pages/Login';

// --- Main App ---

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className={cn("flex min-h-screen transition-colors duration-300", darkMode ? "bg-slate-950" : "bg-slate-50")}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            onMenuOpen={() => setIsSidebarOpen(true)} 
            darkMode={darkMode} 
            toggleDarkMode={() => setDarkMode(!darkMode)} 
          />
          
          <main className="flex-1 pb-20 lg:pb-8 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/learning" element={<LearningPage />} />
              <Route path="/birthdays" element={<BirthdaysPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/lists" element={<ListsPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/ai" element={<AIChat />} />
              <Route path="/settings" element={<SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>

          <BottomNav />
        </div>
      </div>
    </Router>
  );
}
