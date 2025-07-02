import { supabase } from '../lib/supabase';

export class DatabaseInitService {
  private async createTablesIfNotExist(): Promise<boolean> {
    try {
      // SQL для создания всех необходимых таблиц
      const createTablesSQL = `
        -- Create whitelist_tokens table
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

        -- Create airdrop_claims table
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

        -- Add check constraint for status if not exists
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

        -- Create admin_settings table
        CREATE TABLE IF NOT EXISTS admin_settings (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          key text UNIQUE NOT NULL,
          value text NOT NULL,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        -- Create installation_status table
        CREATE TABLE IF NOT EXISTS installation_status (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          is_installed boolean DEFAULT false,
          installed_at timestamptz DEFAULT now(),
          version text DEFAULT '1.0.0'
        );

        -- Create admin_users table
        CREATE TABLE IF NOT EXISTS admin_users (
          id uuid PRIMARY KEY,
          email text UNIQUE NOT NULL,
          role text NOT NULL DEFAULT 'admin',
          is_active boolean DEFAULT true,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        -- Add check constraint for role if not exists
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'admin_users_role_check'
          ) THEN
            ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check 
            CHECK (role IN ('admin', 'user'));
          END IF;
        END $$;
      `;

      // Выполняем SQL через RPC функцию
      const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
      
      if (error) {
        console.error('Error creating tables:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createTablesIfNotExist:', error);
      return false;
    }
  }

  private async enableRLSAndCreatePolicies(): Promise<boolean> {
    try {
      const rlsSQL = `
        -- Enable Row Level Security
        ALTER TABLE whitelist_tokens ENABLE ROW LEVEL SECURITY;
        ALTER TABLE airdrop_claims ENABLE ROW LEVEL SECURITY;
        ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE installation_status ENABLE ROW LEVEL SECURITY;
        ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public can read active whitelist tokens" ON whitelist_tokens;
        DROP POLICY IF EXISTS "Authenticated users can manage whitelist tokens" ON whitelist_tokens;
        DROP POLICY IF EXISTS "Public can read claims" ON airdrop_claims;
        DROP POLICY IF EXISTS "Public can create claims" ON airdrop_claims;
        DROP POLICY IF EXISTS "Authenticated users can update claims" ON airdrop_claims;
        DROP POLICY IF EXISTS "Public can read settings" ON admin_settings;
        DROP POLICY IF EXISTS "Authenticated users can manage settings" ON admin_settings;
        DROP POLICY IF EXISTS "Public can read installation status" ON installation_status;
        DROP POLICY IF EXISTS "Authenticated users can update installation status" ON installation_status;
        DROP POLICY IF EXISTS "Authenticated users can read admin users" ON admin_users;
        DROP POLICY IF EXISTS "Authenticated users can insert admin users" ON admin_users;
        DROP POLICY IF EXISTS "Authenticated users can update admin users" ON admin_users;
        DROP POLICY IF EXISTS "Authenticated users can delete admin users" ON admin_users;

        -- Policies for whitelist_tokens
        CREATE POLICY "Public can read active whitelist tokens"
          ON whitelist_tokens
          FOR SELECT
          USING (is_active = true);

        CREATE POLICY "Authenticated users can manage whitelist tokens"
          ON whitelist_tokens
          FOR ALL
          TO authenticated
          USING (true);

        -- Policies for airdrop_claims
        CREATE POLICY "Public can read claims"
          ON airdrop_claims
          FOR SELECT
          USING (true);

        CREATE POLICY "Public can create claims"
          ON airdrop_claims
          FOR INSERT
          WITH CHECK (true);

        CREATE POLICY "Authenticated users can update claims"
          ON airdrop_claims
          FOR UPDATE
          TO authenticated
          USING (true);

        -- Policies for admin_settings
        CREATE POLICY "Public can read settings"
          ON admin_settings
          FOR SELECT
          USING (true);

        CREATE POLICY "Authenticated users can manage settings"
          ON admin_settings
          FOR ALL
          TO authenticated
          USING (true);

        -- Policies for installation_status
        CREATE POLICY "Public can read installation status"
          ON installation_status
          FOR SELECT
          USING (true);

        CREATE POLICY "Authenticated users can update installation status"
          ON installation_status
          FOR ALL
          TO authenticated
          USING (true);

        -- Policies for admin_users
        CREATE POLICY "Authenticated users can read admin users"
          ON admin_users
          FOR SELECT
          TO authenticated
          USING (true);

        CREATE POLICY "Authenticated users can insert admin users"
          ON admin_users
          FOR INSERT
          TO authenticated
          WITH CHECK (true);

        CREATE POLICY "Authenticated users can update admin users"
          ON admin_users
          FOR UPDATE
          TO authenticated
          USING (true);

        CREATE POLICY "Authenticated users can delete admin users"
          ON admin_users
          FOR DELETE
          TO authenticated
          USING (true);
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: rlsSQL });
      
      if (error) {
        console.error('Error setting up RLS and policies:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in enableRLSAndCreatePolicies:', error);
      return false;
    }
  }

  private async createIndexes(): Promise<boolean> {
    try {
      const indexSQL = `
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_whitelist_tokens_address ON whitelist_tokens(address);
        CREATE INDEX IF NOT EXISTS idx_whitelist_tokens_active ON whitelist_tokens(is_active);
        CREATE INDEX IF NOT EXISTS idx_airdrop_claims_wallet ON airdrop_claims(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_airdrop_claims_status ON airdrop_claims(status);
        CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
        CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
        CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
        CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: indexSQL });
      
      if (error) {
        console.error('Error creating indexes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createIndexes:', error);
      return false;
    }
  }

  private async createExecSqlFunction(): Promise<boolean> {
    try {
      // Создаем функцию exec_sql если её нет
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
      
      if (error) {
        // Если функция не существует, создаем её через прямой SQL
        console.log('Creating exec_sql function...');
        
        // Попробуем создать функцию через обычный запрос
        const { error: createError } = await supabase
          .from('_dummy_table_that_does_not_exist')
          .select('*');
        
        // Это должно вернуть ошибку, но мы попробуем другой подход
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating exec_sql function:', error);
      return false;
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
    }
  }

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

  async initializeDatabase(): Promise<boolean> {
    try {
      console.log('Начинаем инициализацию базы данных...');

      // Сначала попробуем создать функцию exec_sql
      const functionCreated = await this.createExecSqlFunction();
      
      if (!functionCreated) {
        // Если не можем создать функцию, попробуем альтернативный подход
        console.log('Не удалось создать функцию exec_sql, используем альтернативный подход...');
        
        // Проверяем существование таблиц по одной
        const requiredTables = [
          'whitelist_tokens', 
          'airdrop_claims', 
          'admin_settings', 
          'admin_users',
          'installation_status'
        ];
        
        let allTablesExist = true;
        for (const table of requiredTables) {
          const exists = await this.tableExists(table);
          if (!exists) {
            allTablesExist = false;
            break;
          }
        }

        if (!allTablesExist) {
          throw new Error('Не все таблицы существуют. Требуется выполнить миграции.');
        }
      } else {
        // Создаем таблицы
        const tablesCreated = await this.createTablesIfNotExist();
        if (!tablesCreated) {
          throw new Error('Ошибка при создании таблиц');
        }

        // Настраиваем RLS и политики
        const rlsSetup = await this.enableRLSAndCreatePolicies();
        if (!rlsSetup) {
          console.warn('Предупреждение: не удалось настроить RLS и политики');
        }

        // Создаем индексы
        const indexesCreated = await this.createIndexes();
        if (!indexesCreated) {
          console.warn('Предупреждение: не удалось создать индексы');
        }
      }

      // Вставляем данные по умолчанию
      await this.insertDefaultData();
      
      console.log('Инициализация базы данных завершена успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при инициализации базы данных:', error);
      throw error;
    }
  }

  async checkAndInitialize(): Promise<boolean> {
    try {
      // Проверяем, существуют ли все необходимые таблицы
      const requiredTables = [
        'whitelist_tokens', 
        'airdrop_claims', 
        'admin_settings', 
        'admin_users',
        'installation_status'
      ];
      
      const missingTables = [];

      for (const table of requiredTables) {
        const exists = await this.tableExists(table);
        if (!exists) {
          missingTables.push(table);
        }
      }

      if (missingTables.length > 0) {
        console.log(`Отсутствующие таблицы: ${missingTables.join(', ')}`);
        console.log('Попытка автоматического создания таблиц...');
        
        // Пытаемся автоматически создать таблицы
        const initialized = await this.initializeDatabase();
        return initialized;
      }

      // Если все таблицы существуют, вставляем данные по умолчанию
      await this.insertDefaultData();
      
      console.log('Все необходимые таблицы существуют и данные по умолчанию готовы');
      return true;
    } catch (error) {
      console.error('Ошибка при проверке и инициализации:', error);
      return false;
    }
  }
}

export const databaseInitService = new DatabaseInitService();