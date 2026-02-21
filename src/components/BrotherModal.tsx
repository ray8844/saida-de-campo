import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Brother, BrotherInput, Group } from '../types';
import { groupService } from '../services/groupService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface BrotherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brother: BrotherInput) => Promise<void>;
  brother?: Brother;
}

export function BrotherModal({ isOpen, onClose, onSave, brother }: BrotherModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [formData, setFormData] = useState<BrotherInput>({
    nome_completo: '',
    telefone: '',
    email: '',
    grupo_id: '',
    ativo: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setError(null);
    const loadGroups = async () => {
      try {
        const data = await groupService.getAll();
        setGroups(data.filter(g => g.status === 'ativo'));
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };
    if (isOpen) loadGroups();
  }, [isOpen]);

  useEffect(() => {
    if (brother) {
      setFormData({
        nome_completo: brother.nome_completo,
        telefone: brother.telefone,
        email: brother.email,
        grupo_id: brother.grupo_id,
        ativo: brother.ativo
      });
    } else {
      setFormData({
        nome_completo: '',
        telefone: '',
        email: '',
        grupo_id: '',
        ativo: true
      });
    }
  }, [brother, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.grupo_id) {
      setError('Por favor, selecione um grupo.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Error saving brother:', error);
      setError(error.message || 'Erro desconhecido ao salvar irmão.');
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
                {brother ? 'Editar Irmão' : 'Novo Irmão'}
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
                  Nome Completo *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Nome completo do irmão"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Grupo *
                </label>
                <select
                  required
                  value={formData.grupo_id}
                  onChange={(e) => setFormData({ ...formData, grupo_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                >
                  <option value="">Selecione um grupo</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.nome_do_grupo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all"
                  />
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    formData.ativo ? "text-emerald-700" : "text-slate-500"
                  )}>
                    Irmão Ativo
                  </span>
                </label>
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
