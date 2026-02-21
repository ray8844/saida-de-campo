import { supabase } from '../lib/supabase';
import { Brother, BrotherInput } from '../types';

export const brotherService = {
  async getAll() {
    const { data, error } = await supabase
      .from('irmaos')
      .select('*, grupo:grupos(*)')
      .order('nome_completo', { ascending: true });
    
    if (error) throw error;
    return data as Brother[];
  },

  async getByGroup(groupId: string) {
    const { data, error } = await supabase
      .from('irmaos')
      .select('*, grupo:grupos(*)')
      .eq('grupo_id', groupId)
      .order('nome_completo', { ascending: true });
    
    if (error) throw error;
    return data as Brother[];
  },

  async create(brother: BrotherInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('irmaos')
      .insert([{ ...brother, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Brother;
  },

  async update(id: string, brother: Partial<BrotherInput>) {
    const { data, error } = await supabase
      .from('irmaos')
      .update(brother)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Brother;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('irmaos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
