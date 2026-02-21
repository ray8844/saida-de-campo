import React, { useState } from 'react';
import { PageHeader } from '../components/Layout';
import { useSettings } from '../contexts/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Monitor, Type, Layout as LayoutIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { InstallPWA } from '../components/InstallPWA';

export function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async (newSettings: any) => {
    await updateSettings(newSettings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Configurações" 
          description="Personalize sua experiência no Organizador de Saída de Campo." 
        />
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-200"
            >
              <CheckCircle2 size={16} />
              Configurações salvas!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InstallPWA />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Theme Section */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Sun size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tema do Sistema</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'claro', label: 'Claro', icon: Sun },
              { id: 'escuro', label: 'Escuro', icon: Moon },
              { id: 'automatico', label: 'Auto', icon: Monitor },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSave({ theme: theme.id })}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  settings.theme === theme.id 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400" 
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <theme.icon size={24} />
                <span className="text-xs font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Font Size Section */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Type size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tamanho da Fonte</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'pequena', label: 'Pequena', size: 'text-xs' },
              { id: 'media', label: 'Média', size: 'text-sm' },
              { id: 'grande', label: 'Grande', size: 'text-base' },
            ].map((font) => (
              <button
                key={font.id}
                onClick={() => handleSave({ font_size: font.id })}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                  settings.font_size === font.id 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" 
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <span className={cn("font-bold", font.size)}>Aa</span>
                <span className="text-xs font-medium">{font.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Layout Mode Section */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <LayoutIcon size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Modo de Layout</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'padrao', label: 'Padrão' },
              { id: 'compacto', label: 'Compacto' },
            ].map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleSave({ layout_mode: layout.id })}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  settings.layout_mode === layout.id 
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400" 
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <span className="text-sm font-medium">{layout.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Preview Section */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pré-visualização</h3>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
            <p className="font-bold text-slate-900 dark:text-white">Título de Exemplo</p>
            <p className="text-slate-600 dark:text-slate-400">
              Este é um texto de exemplo para você ver como as configurações de tema e fonte afetam a leitura do sistema.
            </p>
            <div className="flex gap-2 pt-2">
              <div className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs">Botão</div>
              <div className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs">Badge</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
