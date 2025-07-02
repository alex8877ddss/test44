import { supabase } from '../lib/supabase';

export class InstallationService {
  async checkInstallationStatus(): Promise<{ isInstalled: boolean; version?: string }> {
    try {
      const { data, error } = await supabase
        .from('installation_status')
        .select('is_installed, version')
        .single();

      if (error) {
        // If table doesn't exist, installation is needed
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
      // The migration file will handle the database setup
      // We just need to verify the tables exist and have data
      
      // Check if whitelist_tokens table exists and has data
      const { data: whitelistData, error: whitelistError } = await supabase
        .from('whitelist_tokens')
        .select('id')
        .limit(1);

      if (whitelistError) {
        console.error('Whitelist table check failed:', whitelistError);
        return false;
      }

      // Check if admin_settings table exists and has data
      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1);

      if (settingsError) {
        console.error('Settings table check failed:', settingsError);
        return false;
      }

      // Check if airdrop_claims table exists
      const { error: claimsError } = await supabase
        .from('airdrop_claims')
        .select('id')
        .limit(1);

      if (claimsError) {
        console.error('Claims table check failed:', claimsError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  }

  async completeInstallation(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('installation_status')
        .update({
          is_installed: true,
          installed_at: new Date().toISOString(),
        })
        .eq('is_installed', false);

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
      // This method can be used to reset installation status for testing
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