import { supabase } from '../lib/supabase';
import { Territory, TerritoryInput } from '../types';

export const territoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('territorios')
      .select('*, grupo:grupos(*)')
      .order('nome_territorio', { ascending: true });
    
    if (error) throw error;
    return data as Territory[];
  },

  async uploadMapImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `maps/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('territory-maps')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('territory-maps')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async create(territory: TerritoryInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('territorios')
      .insert([{ ...territory, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Territory;
  },

  async update(id: string, territory: Partial<TerritoryInput>) {
    const { data, error } = await supabase
      .from('territorios')
      .update(territory)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Territory;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('territorios')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
