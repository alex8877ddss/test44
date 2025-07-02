import { supabase, ensureDatabaseInitialized } from '../lib/supabase';

export class InstallationService {
  async checkInstallationStatus(): Promise<{ isInstalled: boolean; version?: string }> {
    try {
      // First ensure database is initialized
      await ensureDatabaseInitialized();

      const { data, error } = await supabase
        .from('installation_status')
        .select('is_installed, version')
        .single();

      if (error) {
        console.error('Error checking installation status:', error);
        // If table doesn't exist or no data, assume not installed
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
      // Ensure database is initialized
      const initialized = await ensureDatabaseInitialized();
      
      if (!initialized) {
        console.error('Database not properly initialized. Please run the migration in Supabase.');
        return false;
      }

      // Check that all required tables exist
      const tables = [
        'whitelist_tokens',
        'admin_settings', 
        'airdrop_claims',
        'installation_status'
      ];

      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1);

          if (error) {
            console.error(`Table ${table} check failed:`, error);
            return false;
          }
        } catch (error) {
          console.error(`Error checking table ${table}:`, error);
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
      // Ensure database is initialized
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
      // Ensure database is initialized
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