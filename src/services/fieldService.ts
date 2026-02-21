import { supabase } from '../lib/supabase';
import { FieldServiceAssignment, FieldServiceInput, Brother, Territory } from '../types';

export const fieldService = {
  async getAll() {
    const { data, error } = await supabase
      .from('saida_de_campo')
      .select('*, irmao:irmaos(*), territorio:territorios(*), grupo:grupos(*)')
      .order('data_saida', { ascending: false });
    
    if (error) throw error;
    return data as FieldServiceAssignment[];
  },

  async getByDateAndGroup(date: string, groupId: string) {
    const { data, error } = await supabase
      .from('saida_de_campo')
      .select('*, irmao:irmaos(*), territorio:territorios(*), grupo:grupos(*)')
      .eq('data_saida', date)
      .eq('grupo_id', groupId);
    
    if (error) throw error;
    return data as FieldServiceAssignment[];
  },

  async generateAssignments(date: string, groupId: string) {
    // 1. Check if assignments already exist for this date and group
    const existing = await this.getByDateAndGroup(date, groupId);
    if (existing.length > 0) {
      throw new Error('Já existe saída gerada para esta data.');
    }

    // 2. Fetch active brothers of the group
    const { data: brothers, error: bError } = await supabase
      .from('irmaos')
      .select('*')
      .eq('grupo_id', groupId)
      .eq('ativo', true);
    
    if (bError) throw bError;

    // 3. Fetch active territories of the group
    const { data: territories, error: tError } = await supabase
      .from('territorios')
      .select('*')
      .eq('grupo_id', groupId)
      .eq('ativo', true);
    
    if (tError) throw tError;

    if (brothers.length === 0 || territories.length === 0) {
      throw new Error('É necessário ter irmãos e territórios ativos no grupo para gerar a saída.');
    }

    // 4. Fetch recent assignments to avoid repetition (last date)
    const { data: lastAssignments, error: lError } = await supabase
      .from('saida_de_campo')
      .select('irmao_id, territorio_id')
      .eq('grupo_id', groupId)
      .order('data_saida', { ascending: false })
      .limit(brothers.length);
    
    if (lError) throw lError;

    // Algorithm:
    // Shuffle territories and brothers to ensure variety
    const shuffledTerritories = [...territories].sort(() => Math.random() - 0.5);
    const shuffledBrothers = [...brothers].sort(() => Math.random() - 0.5);

    // Pick ONE brother and ONE territory
    const brother = shuffledBrothers[0];
    const territory = shuffledTerritories[0];
    
    const assignments: FieldServiceInput[] = [{
      grupo_id: groupId,
      data_saida: date, // ISO string YYYY-MM-DD
      irmao_id: brother.id,
      territorio_id: territory.id,
      status: 'gerado'
    }];

    // 5. Save to DB
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const assignmentsWithUser = assignments.map(a => ({ ...a, user_id: user.id }));

    const { data, error: iError } = await supabase
      .from('saida_de_campo')
      .insert(assignmentsWithUser)
      .select('*, irmao:irmaos(*), territorio:territorios(*)');
    
    if (iError) throw iError;
    return data as FieldServiceAssignment[];
  },

  async deleteAssignment(id: string) {
    const { error } = await supabase
      .from('saida_de_campo')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteByDateAndGroup(date: string, groupId: string) {
    const { error } = await supabase
      .from('saida_de_campo')
      .delete()
      .eq('data_saida', date)
      .eq('grupo_id', groupId);
    
    if (error) throw error;
  },

  async updateAssignment(id: string, input: Partial<FieldServiceInput>) {
    const { error } = await supabase
      .from('saida_de_campo')
      .update(input)
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateStatus(id: string, status: 'gerado' | 'concluido') {
    const { error } = await supabase
      .from('saida_de_campo')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  }
};
