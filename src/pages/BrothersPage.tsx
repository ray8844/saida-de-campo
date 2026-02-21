import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, UserCircle, Phone, Mail, Users } from 'lucide-react';
import { PageHeader } from '../components/Layout';
import { brotherService } from '../services/brotherService';
import { groupService } from '../services/groupService';
import { Brother, BrotherInput, Group } from '../types';
import { BrotherModal } from '../components/BrotherModal';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function BrothersPage() {
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrother, setEditingBrother] = useState<Brother | undefined>();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [brothersData, groupsData] = await Promise.all([
        brotherService.getAll(),
        groupService.getAll()
      ]);
      setBrothers(brothersData);
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

  const handleSave = async (formData: BrotherInput) => {
    if (editingBrother) {
      await brotherService.update(editingBrother.id, formData);
    } else {
      await brotherService.create(formData);
    }
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este irmão?')) {
      try {
        await brotherService.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting brother:', error);
        alert('Erro ao excluir irmão.');
      }
    }
  };

  const filteredBrothers = brothers.filter(brother => {
    const matchesSearch = brother.nome_completo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'todos' || brother.grupo_id === groupFilter;
    const matchesStatus = statusFilter === 'todos' || 
                         (statusFilter === 'ativo' ? brother.ativo : !brother.ativo);
    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Irmãos" 
          description="Gerencie os irmãos e suas designações de grupo." 
        />
        <button
          onClick={() => {
            setEditingBrother(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          Novo Irmão
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome..."
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Irmão</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grupo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Carregando irmãos...
                  </td>
                </tr>
              ) : filteredBrothers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum irmão encontrado.
                  </td>
                </tr>
              ) : (
                filteredBrothers.map((brother) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={brother.id} 
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                          <UserCircle size={24} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{brother.nome_completo}</p>
                          <p className="text-xs text-slate-400">Cadastrado em {new Date(brother.data_cadastro).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {brother.telefone && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone size={12} />
                            {brother.telefone}
                          </div>
                        )}
                        {brother.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail size={12} />
                            {brother.email}
                          </div>
                        )}
                        {!brother.telefone && !brother.email && <span className="text-slate-300">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                        {brother.grupo?.nome_do_grupo || 'Sem Grupo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        brother.ativo 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-red-100 text-red-700"
                      )}>
                        {brother.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingBrother(brother);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(brother.id)}
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

      <BrotherModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        brother={editingBrother}
      />
    </div>
  );
}
