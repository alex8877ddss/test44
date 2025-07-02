import { supabase } from '../lib/supabase';

export class DatabaseInitService {
  private async tableExists(tableName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }

  private async createWhitelistTokensTable(): Promise<void> {
    const { error } = await supabase.rpc('create_whitelist_tokens_table');
    
    if (error) {
      console.error('Error creating whitelist_tokens table:', error);
      throw error;
    }
  }

  private async createAirdropClaimsTable(): Promise<void> {
    const { error } = await supabase.rpc('create_airdrop_claims_table');
    
    if (error) {
      console.error('Error creating airdrop_claims table:', error);
      throw error;
    }
  }

  private async createAdminSettingsTable(): Promise<void> {
    const { error } = await supabase.rpc('create_admin_settings_table');
    
    if (error) {
      console.error('Error creating admin_settings table:', error);
      throw error;
    }
  }

  private async createAdminUsersTable(): Promise<void> {
    const { error } = await supabase.rpc('create_admin_users_table');
    
    if (error) {
      console.error('Error creating admin_users table:', error);
      throw error;
    }
  }

  private async createInstallationStatusTable(): Promise<void> {
    const { error } = await supabase.rpc('create_installation_status_table');
    
    if (error) {
      console.error('Error creating installation_status table:', error);
      throw error;
    }
  }

  private async insertDefaultData(): Promise<void> {
    try {
      // Check and insert default whitelist tokens
      const { data: whitelistData } = await supabase
        .from('whitelist_tokens')
        .select('id')
        .limit(1);

      if (!whitelistData || whitelistData.length === 0) {
        await supabase.from('whitelist_tokens').insert([
          { address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', name: 'Shiba Inu', symbol: 'SHIB', airdrop_amount: 1000000, is_active: true },
          { address: '0x514910771af9ca656af840dff83e8264ecf986ca', name: 'Chainlink', symbol: 'LINK', airdrop_amount: 50, is_active: true },
          { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', name: 'Uniswap', symbol: 'UNI', airdrop_amount: 100, is_active: true },
          { address: '0x6b175474e89094c44da98b954eedeac495271d0f', name: 'Dai Stablecoin', symbol: 'DAI', airdrop_amount: 500, is_active: true },
          { address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', name: 'Polygon', symbol: 'MATIC', airdrop_amount: 200, is_active: true },
          { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', name: 'Wrapped Bitcoin', symbol: 'WBTC', airdrop_amount: 1, is_active: true }
        ]);
      }

      // Check and insert default settings
      const { data: settingsData } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1);

      if (!settingsData || settingsData.length === 0) {
        await supabase.from('admin_settings').insert([
          { key: 'ethplorer_api_key', value: 'freekey' },
          { key: 'platform_name', value: 'AirdropHub' },
          { key: 'max_claims_per_address', value: '1' },
          { key: 'airdrop_enabled', value: 'true' }
        ]);
      }

      // Check and insert installation status
      const { data: installData } = await supabase
        .from('installation_status')
        .select('id')
        .limit(1);

      if (!installData || installData.length === 0) {
        await supabase.from('installation_status').insert([
          { is_installed: true, version: '1.0.0' }
        ]);
      }
    } catch (error) {
      console.error('Error inserting default data:', error);
      // Don't throw here as tables might not exist yet
    }
  }

  async initializeDatabase(): Promise<boolean> {
    try {
      console.log('Database initialization skipped - tables should be created via Supabase migrations');
      
      // Try to insert default data if tables exist
      await this.insertDefaultData();
      
      console.log('Default data insertion completed');
      return true;
    } catch (error) {
      console.error('Error during database initialization:', error);
      return false;
    }
  }

  async checkAndInitialize(): Promise<boolean> {
    try {
      // Check if basic tables exist
      const tables = ['whitelist_tokens', 'airdrop_claims', 'admin_settings', 'installation_status'];
      const missingTables = [];

      for (const table of tables) {
        const exists = await this.tableExists(table);
        if (!exists) {
          missingTables.push(table);
        }
      }

      if (missingTables.length > 0) {
        console.log(`Missing tables: ${missingTables.join(', ')}`);
        console.log('Please run the database migration in Supabase SQL Editor');
        return false;
      }

      // If all tables exist, try to insert default data
      await this.insertDefaultData();
      
      console.log('All tables exist and default data is ready');
      return true;
    } catch (error) {
      console.error('Error checking tables:', error);
      return false;
    }
  }
}

export const databaseInitService = new DatabaseInitService();