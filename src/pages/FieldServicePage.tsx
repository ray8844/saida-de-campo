import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Calendar as CalendarIcon, Users, Map as MapIcon, CheckCircle2, Clock, Sparkles, Download, Edit2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/Layout';
import { fieldService } from '../services/fieldService';
import { groupService } from '../services/groupService';
import { brotherService } from '../services/brotherService';
import { territoryService } from '../services/territoryService';
import { FieldServiceAssignment, Group, Brother, Territory } from '../types';
import { EditAssignmentModal } from '../components/EditAssignmentModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function FieldServicePage() {
  const [assignments, setAssignments] = useState<FieldServiceAssignment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedGroup, setSelectedGroup] = useState('');
  
  const [editingAssignment, setEditingAssignment] = useState<FieldServiceAssignment | null>(null);
  
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [groupsData, brothersData, territoriesData] = await Promise.all([
        groupService.getAll(),
        brotherService.getAll(),
        territoryService.getAll()
      ]);
      setGroups(groupsData);
      setBrothers(brothersData);
      setTerritories(territoriesData);
      
      if (groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssignments = async () => {
    if (!selectedDate || !selectedGroup) return;
    setIsLoading(true);
    try {
      const data = await fieldService.getByDateAndGroup(selectedDate, selectedGroup);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [selectedDate, selectedGroup]);

  const handleGenerate = async () => {
    if (!selectedDate || !selectedGroup) {
      alert('Selecione uma data e um grupo.');
      return;
    }
    
    setIsGenerating(true);
    try {
      await fieldService.generateAssignments(selectedDate, selectedGroup);
      loadAssignments();
    } catch (error: any) {
      alert(error.message || 'Erro ao gerar saída.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!selectedDate || !selectedGroup) return;
    
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Toda a Saída',
      message: 'Deseja realmente excluir TODA a saída desta data? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await fieldService.deleteByDateAndGroup(selectedDate, selectedGroup);
          await loadAssignments();
        } catch (error: any) {
          alert('Erro ao excluir saída: ' + error.message);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleDeleteIndividual = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Designação',
      message: 'Deseja realmente excluir esta designação individual?',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await fieldService.deleteAssignment(id);
          await loadAssignments();
        } catch (error: any) {
          alert('Erro ao excluir designação: ' + error.message);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleSaveEdit = async (id: string, brotherId: string, territoryId: string) => {
    // Basic validation: check if brother or territory is already used in this date/group
    const isBrotherUsed = assignments.some(a => a.id !== id && a.irmao_id === brotherId);
    const isTerritoryUsed = assignments.some(a => a.id !== id && a.territorio_id === territoryId);

    if (isBrotherUsed) {
      alert('Este irmão já possui uma designação nesta data.');
      return;
    }
    if (isTerritoryUsed) {
      alert('Este território já foi designado nesta data.');
      return;
    }

    await fieldService.updateAssignment(id, { irmao_id: brotherId, territorio_id: territoryId });
    loadAssignments();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'gerado' ? 'concluido' : 'gerado';
    await fieldService.updateStatus(id, newStatus);
    loadAssignments();
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Saída de Campo" 
        description="Organize e acompanhe as designações semanais de território." 
      />

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon size={14} />
              Data da Saída
            </label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Users size={14} />
              Grupo de Campo
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.nome_do_grupo}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3 lg:col-span-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={20} />
                  Gerar Saída
                </>
              )}
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={assignments.length === 0 || isLoading}
              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all disabled:opacity-50"
              title="Excluir toda a saída desta data"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Irmão</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Território</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Carregando designações...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma designação para esta data. Clique em "Gerar Saída".
                  </td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={a.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          {a.irmao?.nome_completo.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{a.irmao?.nome_completo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapIcon size={14} className="text-blue-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{a.territorio?.nome_territorio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(a.id, a.status)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                          a.status === 'concluido' 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" 
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                        )}
                      >
                        {a.status === 'concluido' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {a.status === 'concluido' ? 'Concluído' : 'Gerado'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingAssignment(a)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteIndividual(a.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
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

      {editingAssignment && (
        <EditAssignmentModal 
          isOpen={!!editingAssignment}
          onClose={() => setEditingAssignment(null)}
          assignment={editingAssignment}
          brothers={brothers.filter(b => b.grupo_id === selectedGroup)}
          territories={territories.filter(t => t.grupo_id === selectedGroup)}
          onSave={handleSaveEdit}
        />
      )}

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
    </div>
  );
}
