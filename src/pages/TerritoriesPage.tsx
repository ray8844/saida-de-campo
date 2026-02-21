import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Map as MapIcon, ExternalLink, Users, Image as ImageIcon, X } from 'lucide-react';
import { PageHeader } from '../components/Layout';
import { territoryService } from '../services/territoryService';
import { groupService } from '../services/groupService';
import { Territory, TerritoryInput, Group } from '../types';
import { TerritoryModal } from '../components/TerritoryModal';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function TerritoriesPage() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<Territory | undefined>();
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [territoriesData, groupsData] = await Promise.all([
        territoryService.getAll(),
        groupService.getAll()
      ]);
      setTerritories(territoriesData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData: TerritoryInput) => {
    if (editingTerritory) {
      await territoryService.update(editingTerritory.id, formData);
    } else {
      await territoryService.create(formData);
    }
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este território?')) {
      try {
        await territoryService.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting territory:', error);
        alert('Erro ao excluir território.');
      }
    }
  };

  const filteredTerritories = territories.filter(t => {
    const matchesSearch = t.nome_territorio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'todos' || t.grupo_id === groupFilter;
    const matchesStatus = statusFilter === 'todos' || 
                         (statusFilter === 'ativo' ? t.ativo : !t.ativo);
    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Territórios" 
          description="Gerencie as áreas de pregação e seus respectivos mapas." 
        />
        <button
          onClick={() => {
            setEditingTerritory(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          Novo Território
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar território..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="text-slate-400" size={18} />
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-sm font-medium text-slate-600"
              >
                <option value="todos">Todos os Grupos</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.nome_do_grupo}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-sm font-medium text-slate-600"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Território</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grupo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mapa</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Carregando territórios...
                  </td>
                </tr>
              ) : filteredTerritories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum território encontrado.
                  </td>
                </tr>
              ) : (
                filteredTerritories.map((t) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={t.id} 
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <MapIcon size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{t.nome_territorio}</p>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{t.descricao || 'Sem descrição'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                        {t.grupo?.nome_do_grupo || 'Sem Grupo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {t.mapa_imagem_url && (
                          <button 
                            onClick={() => setSelectedMap(t.mapa_imagem_url!)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                          >
                            <ImageIcon size={14} />
                            Ver Mapa
                          </button>
                        )}
                        {t.mapa_url && (
                          <a 
                            href={t.mapa_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                          >
                            <ExternalLink size={14} />
                            Link
                          </a>
                        )}
                        {!t.mapa_imagem_url && !t.mapa_url && <span className="text-slate-300 text-xs">Sem mapa</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        t.ativo 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {t.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingTerritory(t);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TerritoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        territory={editingTerritory}
      />

      {/* Map Image Viewer Modal */}
      <AnimatePresence>
        {selectedMap && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedMap(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedMap(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <X size={20} />
              </button>
              <img 
                src={selectedMap} 
                alt="Mapa do Território" 
                className="w-full h-auto max-h-[85vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
