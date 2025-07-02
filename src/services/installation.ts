import { supabase, ensureDatabaseInitialized } from '../lib/supabase';

export class InstallationService {
  async checkInstallationStatus(): Promise<{ isInstalled: boolean; version?: string }> {
    try {
      // Сначала убеждаемся, что база данных инициализирована
      const initialized = await ensureDatabaseInitialized();
      
      if (!initialized) {
        return { isInstalled: false };
      }

      const { data, error } = await supabase
        .from('installation_status')
        .select('is_installed, version')
        .single();

      if (error) {
        console.error('Error checking installation status:', error);
        // Если таблица не существует или нет данных, считаем не установленным
        return { isInstalled: false };
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
        console.error('Не удалось инициализировать базу данных');
        return false;
      }

      // Проверяем, что все необходимые таблицы существуют
      const tables = [
        'whitelist_tokens',
        'admin_settings', 
        'airdrop_claims',
        'admin_users',
        'installation_status'
      ];

      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1);

          if (error) {
            console.error(`Проверка таблицы ${table} не удалась:`, error);
            return false;
          }
        } catch (error) {
          console.error(`Ошибка при проверке таблицы ${table}:`, error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Установка не удалась:', error);
      return false;
    }
  }

  async completeInstallation(): Promise<boolean> {
    try {
      // Убеждаемся, что база данных инициализирована
      const initialized = await ensureDatabaseInitialized();
      
      if (!initialized) {
        return false;
      }

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
      const initialized = await ensureDatabaseInitialized();
      
      if (!initialized) {
        return false;
      }

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