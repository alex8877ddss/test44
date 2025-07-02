import { supabase } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class AdminService {
  async getCurrentAdminUser(userId: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching admin user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching admin user:', error);
      return null;
    }
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin users:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  }

  async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating admin user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating admin user:', error);
      return false;
    }
  }

  async deactivateAdminUser(id: string): Promise<boolean> {
    return this.updateAdminUser(id, { is_active: false });
  }

  async activateAdminUser(id: string): Promise<boolean> {
    return this.updateAdminUser(id, { is_active: true });
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('id', userId)
        .single();

      if (error) {
        return false;
      }

      return data.role === 'admin' && data.is_active;
    } catch (error) {
      return false;
    }
  }
}

export const adminService = new AdminService();