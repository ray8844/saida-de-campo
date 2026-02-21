import { supabase } from '../lib/supabase';
import { Profile, Settings } from '../types';

export const profileService = {
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Profile;
    } catch (e) {
      console.warn('Profile service error:', e);
      return null;
    }
  },

  async updateSettings(settings: Settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    } catch (e) {
      console.error('Error updating settings:', e);
      localStorage.setItem('app_settings', JSON.stringify(settings));
      return null;
    }
  }
};
