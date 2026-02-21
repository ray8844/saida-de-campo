import { supabase } from '../lib/supabase';
import { Group, GroupInput } from '../types';

export const groupService = {
  async getAll() {
    const { data, error } = await supabase
      .from('grupos')
      .select('*')
      .order('nome_do_grupo', { ascending: true });
    
    if (error) throw error;
    return data as Group[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('grupos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Group;
  },

  async create(group: GroupInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('grupos')
      .insert([{ ...group, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Group;
  },

  async update(id: string, group: Partial<GroupInput>) {
    const { data, error } = await supabase
      .from('grupos')
      .update(group)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Group;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('grupos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
