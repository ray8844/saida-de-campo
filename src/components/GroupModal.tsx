import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Group, GroupInput } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: GroupInput) => Promise<void>;
  group?: Group;
}

export function GroupModal({ isOpen, onClose, onSave, group }: GroupModalProps) {
  const [formData, setFormData] = useState<GroupInput>({
    nome_do_grupo: '',
    descricao: '',
    status: 'ativo'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setError(null);
    if (group) {
      setFormData({
        nome_do_grupo: group.nome_do_grupo,
        descricao: group.descricao || '',
        status: group.status
      });
    } else {
      setFormData({
        nome_do_grupo: '',
        descricao: '',
        status: 'ativo'
      });
    }
  }, [group, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Error saving group:', error);
      setError(error.message || 'Erro desconhecido ao salvar grupo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">
                {group ? 'Editar Grupo' : 'Novo Grupo'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome do Grupo *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nome_do_grupo}
                  onChange={(e) => setFormData({ ...formData, nome_do_grupo: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Ex: Grupo Central"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px]"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'ativo'}
                      onChange={() => setFormData({ ...formData, status: 'ativo' })}
                      className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <span className={cn(
                      "text-sm transition-colors",
                      formData.status === 'ativo' ? "text-emerald-700 font-medium" : "text-slate-500"
                    )}>Ativo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'inativo'}
                      onChange={() => setFormData({ ...formData, status: 'inativo' })}
                      className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
                    />
                    <span className={cn(
                      "text-sm transition-colors",
                      formData.status === 'inativo' ? "text-slate-700 font-medium" : "text-slate-500"
                    )}>Inativo</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
