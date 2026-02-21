import React, { useState } from 'react';
import { X, Save, User, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Brother, Territory, FieldServiceAssignment } from '../types';

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: FieldServiceAssignment;
  brothers: Brother[];
  territories: Territory[];
  onSave: (id: string, brotherId: string, territoryId: string) => Promise<void>;
}

export function EditAssignmentModal({ 
  isOpen, 
  onClose, 
  assignment, 
  brothers, 
  territories, 
  onSave 
}: EditAssignmentModalProps) {
  const [brotherId, setBrotherId] = useState(assignment.irmao_id);
  const [territoryId, setTerritoryId] = useState(assignment.territorio_id);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(assignment.id, brotherId, territoryId);
      onClose();
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Erro ao salvar alteração.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Designação</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <User size={16} className="text-emerald-600" />
                  Irmão
                </label>
                <select
                  value={brotherId}
                  onChange={(e) => setBrotherId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                >
                  {brothers.map(b => (
                    <option key={b.id} value={b.id}>{b.nome_completo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <MapIcon size={16} className="text-blue-600" />
                  Território
                </label>
                <select
                  value={territoryId}
                  onChange={(e) => setTerritoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                >
                  {territories.map(t => (
                    <option key={t.id} value={t.id}>{t.nome_territorio}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={20} />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
