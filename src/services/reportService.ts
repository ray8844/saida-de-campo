import { supabase } from '../lib/supabase';
import { FieldServiceAssignment } from '../types';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  groupId?: string;
  brotherId?: string;
  territoryId?: string;
}

export const reportService = {
  async getAssignments(filters: ReportFilters) {
    let query = supabase
      .from('saida_de_campo')
      .select('*, irmao:irmaos(*), territorio:territorios(*)')
      .gte('data_saida', filters.startDate)
      .lte('data_saida', filters.endDate)
      .order('data_saida', { ascending: false });

    if (filters.brotherId) {
      query = query.eq('irmao_id', filters.brotherId);
    }

    if (filters.territoryId) {
      query = query.eq('territorio_id', filters.territoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as FieldServiceAssignment[];
  },

  async getGeneralStats(filters: ReportFilters) {
    const assignments = await this.getAssignments(filters);
    
    // Aggregate by brother
    const brotherParticipation: Record<string, { name: string, count: number }> = {};
    // Aggregate by territory
    const territoryUsage: Record<string, { name: string, count: number }> = {};
    // Aggregate by week
    const weeklyDistribution: Record<string, number> = {};

    assignments.forEach(a => {
      if (a.irmao) {
        brotherParticipation[a.irmao_id] = {
          name: a.irmao.nome_completo,
          count: (brotherParticipation[a.irmao_id]?.count || 0) + 1
        };
      }
      if (a.territorio) {
        territoryUsage[a.territorio_id] = {
          name: a.territorio.nome_territorio,
          count: (territoryUsage[a.territorio_id]?.count || 0) + 1
        };
      }
      
      const week = format(new Date(a.data_saida), 'yyyy-ww');
      weeklyDistribution[week] = (weeklyDistribution[week] || 0) + 1;
    });

    return {
      totalAssignments: assignments.length,
      completedAssignments: assignments.filter(a => a.status === 'concluido').length,
      brotherParticipation: Object.values(brotherParticipation).sort((a, b) => b.count - a.count).slice(0, 10),
      territoryUsage: Object.values(territoryUsage).sort((a, b) => b.count - a.count).slice(0, 10),
      weeklyDistribution: Object.entries(weeklyDistribution).map(([week, count]) => ({ week, count })).sort((a, b) => a.week.localeCompare(b.week))
    };
  }
};
