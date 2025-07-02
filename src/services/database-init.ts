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
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS whitelist_tokens (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          address text UNIQUE NOT NULL,
          name text NOT NULL,
          symbol text NOT NULL,
          airdrop_amount integer NOT NULL DEFAULT 0,
          is_active boolean DEFAULT true,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        ALTER TABLE whitelist_tokens ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can read active whitelist tokens" ON whitelist_tokens;
        CREATE POLICY "Public can read active whitelist tokens"
          ON whitelist_tokens
          FOR SELECT
          USING (is_active = true);

        DROP POLICY IF EXISTS "Authenticated users can manage whitelist tokens" ON whitelist_tokens;
        CREATE POLICY "Authenticated users can manage whitelist tokens"
          ON whitelist_tokens
          FOR ALL
          TO authenticated
          USING (true);

        CREATE INDEX IF NOT EXISTS idx_whitelist_tokens_address ON whitelist_tokens(address);
        CREATE INDEX IF NOT EXISTS idx_whitelist_tokens_active ON whitelist_tokens(is_active);
      `
    });

    if (error) {
      console.error('Error creating whitelist_tokens table:', error);
      throw error;
    }
  }

  private async createAirdropClaimsTable(): Promise<void> {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS airdrop_claims (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          wallet_address text NOT NULL,
          tokens_claimed jsonb NOT NULL DEFAULT '[]'::jsonb,
          total_amount integer NOT NULL DEFAULT 0,
          transaction_hash text,
          status text NOT NULL DEFAULT 'pending',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'airdrop_claims_status_check'
          ) THEN
            ALTER TABLE airdrop_claims ADD CONSTRAINT airdrop_claims_status_check 
            CHECK (status IN ('pending', 'completed', 'failed'));
          END IF;
        END $$;

        ALTER TABLE airdrop_claims ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can read claims" ON airdrop_claims;
        CREATE POLICY "Public can read claims"
          ON airdrop_claims
          FOR SELECT
          USING (true);

        DROP POLICY IF EXISTS "Public can create claims" ON airdrop_claims;
        CREATE POLICY "Public can create claims"
          ON airdrop_claims
          FOR INSERT
          WITH CHECK (true);

        DROP POLICY IF EXISTS "Authenticated users can update claims" ON airdrop_claims;
        CREATE POLICY "Authenticated users can update claims"
          ON airdrop_claims
          FOR UPDATE
          TO authenticated
          USING (true);

        CREATE INDEX IF NOT EXISTS idx_airdrop_claims_wallet ON airdrop_claims(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_airdrop_claims_status ON airdrop_claims(status);
      `
    });

    if (error) {
      console.error('Error creating airdrop_claims table:', error);
      throw error;
    }
  }

  private async createAdminSettingsTable(): Promise<void> {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_settings (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          key text UNIQUE NOT NULL,
          value text NOT NULL,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can read settings" ON admin_settings;
        CREATE POLICY "Public can read settings"
          ON admin_settings
          FOR SELECT
          USING (true);

        DROP POLICY IF EXISTS "Authenticated users can manage settings" ON admin_settings;
        CREATE POLICY "Authenticated users can manage settings"
          ON admin_settings
          FOR ALL
          TO authenticated
          USING (true);

        CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
      `
    });

    if (error) {
      console.error('Error creating admin_settings table:', error);
      throw error;
    }
  }

  private async createAdminUsersTable(): Promise<void> {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_users (
          id uuid PRIMARY KEY,
          email text NOT NULL,
          role text NOT NULL DEFAULT 'admin',
          is_active boolean DEFAULT true,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can read own data" ON admin_users;
        CREATE POLICY "Users can read own data"
          ON admin_users
          FOR SELECT
          TO authenticated
          USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Authenticated users can manage admin users" ON admin_users;
        CREATE POLICY "Authenticated users can manage admin users"
          ON admin_users
          FOR ALL
          TO authenticated
          USING (true);
      `
    });

    if (error) {
      console.error('Error creating admin_users table:', error);
      throw error;
    }
  }

  private async createInstallationStatusTable(): Promise<void> {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS installation_status (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          is_installed boolean DEFAULT false,
          installed_at timestamptz DEFAULT now(),
          version text DEFAULT '1.0.0'
        );

        ALTER TABLE installation_status ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can read installation status" ON installation_status;
        CREATE POLICY "Public can read installation status"
          ON installation_status
          FOR SELECT
          USING (true);

        DROP POLICY IF EXISTS "Authenticated users can update installation status" ON installation_status;
        CREATE POLICY "Authenticated users can update installation status"
          ON installation_status
          FOR ALL
          TO authenticated
          USING (true);
      `
    });

    if (error) {
      console.error('Error creating installation_status table:', error);
      throw error;
    }
  }

  private async insertDefaultData(): Promise<void> {
    // Проверяем и вставляем данные по умолчанию для whitelist_tokens
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

    // Проверяем и вставляем настройки по умолчанию
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

    // Проверяем и вставляем статус установки
    const { data: installData } = await supabase
      .from('installation_status')
      .select('id')
      .limit(1);

    if (!installData || installData.length === 0) {
      await supabase.from('installation_status').insert([
        { is_installed: true, version: '1.0.0' }
      ]);
    }
  }

  async initializeDatabase(): Promise<boolean> {
    try {
      console.log('Проверка и создание таблиц базы данных...');

      // Создаем все необходимые таблицы
      await this.createWhitelistTokensTable();
      await this.createAirdropClaimsTable();
      await this.createAdminSettingsTable();
      await this.createAdminUsersTable();
      await this.createInstallationStatusTable();

      // Вставляем данные по умолчанию
      await this.insertDefaultData();

      console.log('База данных успешно инициализирована');
      return true;
    } catch (error) {
      console.error('Ошибка при инициализации базы данных:', error);
      return false;
    }
  }

  async checkAndInitialize(): Promise<boolean> {
    try {
      // Проверяем основные таблицы
      const tables = ['whitelist_tokens', 'airdrop_claims', 'admin_settings', 'admin_users', 'installation_status'];
      const missingTables = [];

      for (const table of tables) {
        const exists = await this.tableExists(table);
        if (!exists) {
          missingTables.push(table);
        }
      }

      if (missingTables.length > 0) {
        console.log(`Отсутствующие таблицы: ${missingTables.join(', ')}`);
        return await this.initializeDatabase();
      }

      console.log('Все таблицы существуют');
      return true;
    } catch (error) {
      console.error('Ошибка при проверке таблиц:', error);
      return await this.initializeDatabase();
    }
  }
}

export const databaseInitService = new DatabaseInitService();