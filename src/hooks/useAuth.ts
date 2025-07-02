import { useState, useEffect } from 'react';
import { supabase, ensureDatabaseInitialized } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { adminService, AdminUser } from '../services/admin';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Инициализируем базу данных перед началом работы
    const initializeAndSetupAuth = async () => {
      try {
        const initialized = await ensureDatabaseInitialized();
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user && initialized) {
          await loadAdminUser(session.user.id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAndSetupAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const initialized = await ensureDatabaseInitialized();
          if (initialized) {
            await loadAdminUser(session.user.id);
          }
        } else {
          setAdminUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadAdminUser = async (userId: string) => {
    try {
      const initialized = await ensureDatabaseInitialized();
      if (!initialized) {
        return;
      }
      
      const adminUserData = await adminService.getCurrentAdminUser(userId);
      setAdminUser(adminUserData);
    } catch (error) {
      console.error('Error loading admin user:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const initialized = await ensureDatabaseInitialized();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      // Если пользователь успешно создан и база данных инициализирована, добавляем его в таблицу admin_users
      if (data.user && !error && initialized) {
        await supabase.from('admin_users').insert({
          id: data.user.id,
          email: data.user.email!,
          role: 'admin',
          is_active: true,
        });
      }

      return { data, error };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setAdminUser(null);
    return { error };
  };

  return {
    user,
    adminUser,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: adminUser?.role === 'admin' && adminUser?.is_active,
  };
};