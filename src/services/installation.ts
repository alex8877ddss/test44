import { supabase, ensureDatabaseInitialized } from '../lib/supabase';

export class InstallationService {
  async checkInstallationStatus(): Promise<{ isInstalled: boolean; version?: string }> {
    try {
      // Сначала убеждаемся, что база данных инициализирована
      await ensureDatabaseInitialized();

      const { data, error } = await supabase
        .from('installation_status')
        .select('is_installed, version')
        .single();

      if (error) {
        // Если таблица не существует, создаем запись по умолчанию
        const { error: insertError } = await supabase
          .from('installation_status')
          .insert({ is_installed: true, version: '1.0.0' });

        if (insertError) {
          console.error('Error creating installation status:', insertError);
          return { isInstalled: false };
        }

        return { isInstalled: true, version: '1.0.0' };
      }

      return {
        isInstalled: data.is_installed || false,
        version: data.version,
      };
    } catch (error) {
      console.error('Error checking installation status:', error);
      return { isInstalled: false };
    }
  }

  async performInstallation(): Promise<boolean> {
    try {
      // Убеждаемся, что база данных инициализирована
      const initialized = await ensureDatabaseInitialized();
      
      if (!initialized) {
        console.error('Failed to initialize database');
        return false;
      }

      // Проверяем, что все таблицы существуют и имеют данные
      const tables = [
        'whitelist_tokens',
        'admin_settings', 
        'airdrop_claims',
        'admin_users',
        'installation_status'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        if (error) {
          console.error(`Table ${table} check failed:`, error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  }

  async completeInstallation(): Promise<boolean> {
    try {
      // Убеждаемся, что база данных инициализирована
      await ensureDatabaseInitialized();

      const { error } = await supabase
        .from('installation_status')
        .upsert({
          is_installed: true,
          installed_at: new Date().toISOString(),
          version: '1.0.0'
        });

      if (error) {
        console.error('Error completing installation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error completing installation:', error);
      return false;
    }
  }

  async resetInstallation(): Promise<boolean> {
    try {
      // Убеждаемся, что база данных инициализирована
      await ensureDatabaseInitialized();

      const { error } = await supabase
        .from('installation_status')
        .update({
          is_installed: false,
        });

      if (error) {
        console.error('Error resetting installation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error resetting installation:', error);
      return false;
    }
  }
}

export const installationService = new InstallationService();