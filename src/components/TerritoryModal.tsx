import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Map as MapIcon, Link as LinkIcon } from 'lucide-react';
import { Territory, TerritoryInput, Group } from '../types';
import { groupService } from '../services/groupService';
import { territoryService } from '../services/territoryService';
import { isSupabaseConfigured } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TerritoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (territory: TerritoryInput) => Promise<void>;
  territory?: Territory;
}

export function TerritoryModal({ isOpen, onClose, onSave, territory }: TerritoryModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [formData, setFormData] = useState<TerritoryInput>({
    nome_territorio: '',
    descricao: '',
    mapa_imagem_url: '',
    mapa_url: '',
    grupo_id: '',
    ativo: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (territory) {
      setFormData({
        nome_territorio: territory.nome_territorio,
        descricao: territory.descricao || '',
        mapa_imagem_url: territory.mapa_imagem_url || '',
        mapa_url: territory.mapa_url || '',
        grupo_id: territory.grupo_id,
        ativo: territory.ativo
      });
    } else {
      setFormData({
        nome_territorio: '',
        descricao: '',
        mapa_imagem_url: '',
        mapa_url: '',
        grupo_id: '',
        ativo: true
      });
    }
  }, [territory, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      alert('Configuração Necessária: As chaves do Supabase não foram encontradas. Configure-as nos Secrets para habilitar o upload de imagens.');
      return;
    }

    // Basic size check (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem é muito grande. O limite é de 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const url = await territoryService.uploadMapImage(file);
      setFormData(prev => ({ ...prev, mapa_imagem_url: url }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const msg = error.message || '';
      if (msg.includes('bucket')) {
        alert('Erro: O bucket "territory-maps" não foi encontrado no seu Supabase. Crie um bucket público com este nome no painel do Supabase.');
      } else {
        alert('Erro ao fazer upload da imagem: ' + (error.message || 'Erro desconhecido'));
      }
    } finally {
      setIsUploading(false);
      // Reset input value so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      console.error('Error saving territory:', error);
      setError(error.message || 'Erro desconhecido ao salvar território.');
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
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {territory ? 'Editar Território' : 'Novo Território'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Território *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nome_territorio}
                  onChange={(e) => setFormData({ ...formData, nome_territorio: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                  placeholder="Ex: Território 01 - Centro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[80px] dark:text-white"
                  placeholder="Detalhes sobre as ruas ou limites"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Grupo Responsável *
                  </label>
                  <select
                    required
                    value={formData.grupo_id}
                    onChange={(e) => setFormData({ ...formData, grupo_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                  >
                    <option value="">Selecione</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.nome_do_grupo}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 transition-all bg-white dark:bg-slate-950"
                    />
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      formData.ativo ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-500"
                    )}>
                      Ativo
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  URL do Mapa (Google Maps)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="url"
                    value={formData.mapa_url}
                    onChange={(e) => setFormData({ ...formData, mapa_url: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                    placeholder="https://goo.gl/maps/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Imagem do Mapa
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[120px]",
                    formData.mapa_imagem_url 
                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10" 
                      : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-500">Enviando...</span>
                    </div>
                  ) : formData.mapa_imagem_url ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-emerald-100">
                      <img 
                        src={formData.mapa_imagem_url} 
                        alt="Mapa" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-2">
                        <span className="text-white text-xs font-medium bg-black/40 px-2 py-1 rounded-full">Alterar</span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, mapa_imagem_url: '' }));
                          }}
                          className="text-white text-xs font-medium bg-red-600/60 px-2 py-1 rounded-full hover:bg-red-600"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-slate-400 mb-2" size={24} />
                      <span className="text-sm text-slate-600 font-medium">Clique para enviar imagem</span>
                      <span className="text-xs text-slate-400 mt-1">PNG, JPG ou JPEG</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
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
