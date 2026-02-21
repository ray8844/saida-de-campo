import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Map, 
  Calendar, 
  FileText, 
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut,
  LogIn
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Grupos', path: '/grupos' },
  { icon: UserCircle, label: 'Irmãos', path: '/irmaos' },
  { icon: Map, label: 'Territórios', path: '/territorios' },
  { icon: Calendar, label: 'Saída de Campo', path: '/saida-de-campo' },
  { icon: FileText, label: 'Relatórios', path: '/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const filteredMenuItems = user 
    ? menuItems 
    : menuItems.filter(item => item.path === '/');

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Calendar size={18} />
          </div>
          Organizador
        </h1>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen z-50 transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Calendar size={20} />
            </div>
            Organizador
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">Saída de Campo</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={cn(
                  "transition-colors",
                  "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                )} />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {user ? (
            <>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Usuário</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{user?.email}</p>
              </div>
              
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium"
              >
                <LogOut size={20} />
                Sair do Sistema
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-emerald-600 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-600/20"
            >
              <LogIn size={20} />
              Entrar no Sistema
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
