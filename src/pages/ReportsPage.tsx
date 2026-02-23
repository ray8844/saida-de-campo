import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/Layout';
import { reportService, ReportFilters } from '../services/reportService';
import { brotherService } from '../services/brotherService';
import { territoryService } from '../services/territoryService';
import { Brother, Territory, FieldServiceAssignment } from '../types';
import { 
  Calendar, 
  User, 
  Map as MapIcon, 
  BarChart3, 
  Download, 
  Filter,
  ChevronRight,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatDate } from '../lib/utils';
import { isSupabaseConfigured } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportTab = 'data' | 'irmao' | 'territorio' | 'geral';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('geral');
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [assignments, setAssignments] = useState<FieldServiceAssignment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const [b, t] = await Promise.all([
          brotherService.getAll(),
          territoryService.getAll()
        ]);
        setBrothers(b);
        setTerritories(t);
      } catch (error) {
        console.error('Error loading initial report data:', error);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadReportData = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [data, s] = await Promise.all([
          reportService.getAssignments(filters),
          reportService.getGeneralStats(filters)
        ]);
        setAssignments(data);
        setStats(s);
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadReportData();
  }, [filters]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = activeTab === 'geral' ? 'Relatório Geral do Grupo' : 
                  activeTab === 'data' ? 'Relatório de Saídas por Data' :
                  activeTab === 'irmao' ? 'Relatório por Irmão' : 'Relatório por Território';

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Período: ${formatDate(filters.startDate)} até ${formatDate(filters.endDate)}`, 14, 30);

    const tableData = assignments.map(a => [
      formatDate(a.data_saida),
      a.irmao?.nome_completo || 'N/A',
      a.territorio?.nome_territorio || 'N/A',
      a.status === 'concluido' ? 'Concluído' : 'Pendente'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Data', 'Irmão', 'Território', 'Status']],
      body: tableData,
    });

    doc.save(`relatorio-${activeTab}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Relatórios" 
          description="Analise o desempenho e histórico da organização." 
        />
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Download size={18} />
          Exportar PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
        {[
          { id: 'geral', label: 'Geral', icon: BarChart3 },
          { id: 'data', label: 'Por Data', icon: Calendar },
          { id: 'irmao', label: 'Por Irmão', icon: User },
          { id: 'territorio', label: 'Por Território', icon: MapIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtros:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
          <span className="text-slate-400">até</span>
          <input 
            type="date" 
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>

        {activeTab === 'irmao' && (
          <select
            value={filters.brotherId || ''}
            onChange={(e) => setFilters({ ...filters, brotherId: e.target.value || undefined })}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
          >
            <option value="">Todos os Irmãos</option>
            {brothers.map(b => (
              <option key={b.id} value={b.id}>{b.nome_completo}</option>
            ))}
          </select>
        )}

        {activeTab === 'territorio' && (
          <select
            value={filters.territoryId || ''}
            onChange={(e) => setFilters({ ...filters, territoryId: e.target.value || undefined })}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
          >
            <option value="">Todos os Territórios</option>
            {territories.map(t => (
              <option key={t.id} value={t.id}>{t.nome_territorio}</option>
            ))}
          </select>
        )}
      </div>

      {/* Report Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {activeTab === 'geral' && stats && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total de Saídas" value={stats.totalAssignments} icon={TrendingUp} color="blue" />
                <StatCard label="Concluídas" value={stats.completedAssignments} icon={CheckCircle2} color="emerald" />
                <StatCard label="Pendentes" value={stats.totalAssignments - stats.completedAssignments} icon={Clock} color="amber" />
                <StatCard label="Taxa de Conclusão" value={`${Math.round((stats.completedAssignments / (stats.totalAssignments || 1)) * 100)}%`} icon={BarChart3} color="violet" />
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Participação por Irmão (Top 10)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.brotherParticipation} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Utilização de Territórios (Top 10)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.territoryUsage} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Distribuição Semanal</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.weeklyDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Specific Indicators for Brother/Territory */}
          {activeTab === 'irmao' && filters.brotherId && assignments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total de Participações" value={assignments.length} icon={User} color="blue" />
              <StatCard label="Territórios Diferentes" value={new Set(assignments.map(a => a.territorio_id)).size} icon={MapIcon} color="emerald" />
              <StatCard label="Última Saída" value={formatDate(assignments[0].data_saida)} icon={Calendar} color="amber" />
            </div>
          )}

          {activeTab === 'territorio' && filters.territoryId && assignments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total de Utilizações" value={assignments.length} icon={MapIcon} color="blue" />
              <StatCard label="Irmãos Diferentes" value={new Set(assignments.map(a => a.irmao_id)).size} icon={User} color="emerald" />
              <StatCard label="Última Utilização" value={formatDate(assignments[0].data_saida)} icon={Calendar} color="amber" />
            </div>
          )}

          {/* Table View for other tabs */}
          {activeTab !== 'geral' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Irmão</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Território</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Carregando dados...</td>
                      </tr>
                    ) : assignments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Nenhum registro encontrado para este período.</td>
                      </tr>
                    ) : (
                      assignments.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(a.data_saida)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                {a.irmao?.nome_completo.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-slate-900 dark:text-white">{a.irmao?.nome_completo}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{a.territorio?.nome_territorio}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                              a.status === 'concluido' 
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" 
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            )}>
                              {a.status === 'concluido' ? 'Concluído' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", colors[color])}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
