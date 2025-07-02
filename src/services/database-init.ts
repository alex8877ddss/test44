import { supabase } from '../lib/supabase';

export class DatabaseInitService {
  private async createTableWithDirectSQL(tableName: string, createSQL: string): Promise<boolean> {
    try {
      // Проверяем существование таблицы
      const { error: checkError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (!checkError) {
        // Таблица уже существует
        return true;
      }

      // Таблица не существует, создаем её через SQL
      const { error } = await supabase.rpc('exec', { 
        sql: createSQL 
      });

      if (error) {
        console.error(`Ошибка создания таблицы ${tableName}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Ошибка при создании таблицы ${tableName}:`, error);
      return false;
    }
  }

  private async createTablesDirectly(): Promise<boolean> {
    try {
      // Создаем таблицы по одной, используя простые INSERT операции
      
      // 1. Создаем whitelist_tokens
      const { error: whitelistError } = await supabase
        .from('whitelist_tokens')
        .select('*')
        .limit(1);

      if (whitelistError && whitelistError.code === '42P01') {
        // Таблица не существует, но мы не можем её создать без миграций
        console.error('Таблица whitelist_tokens не существует');
        return false;
      }

      // 2. Проверяем admin_users
      const { error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1);

      if (adminError && adminError.code === '42P01') {
        console.error('Таблица admin_users не существует');
        return false;
      }

      // 3. Проверяем admin_settings
      const { error: settingsError } = await supabase
        .from('admin_settings')
        .select('*')
        .limit(1);

      if (settingsError && settingsError.code === '42P01') {
        console.error('Таблица admin_settings не существует');
        return false;
      }

      // 4. Проверяем airdrop_claims
      const { error: claimsError } = await supabase
        .from('airdrop_claims')
        .select('*')
        .limit(1);

      if (claimsError && claimsError.code === '42P01') {
        console.error('Таблица airdrop_claims не существует');
        return false;
      }

      // 5. Проверяем installation_status
      const { error: installError } = await supabase
        .from('installation_status')
        .select('*')
        .limit(1);

      if (installError && installError.code === '42P01') {
        console.error('Таблица installation_status не существует');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ошибка при проверке таблиц:', error);
      return false;
    }
  }

  private async insertDefaultData(): Promise<void> {
    try {
      // Check and insert default whitelist tokens
      const { data: whitelistData, error: whitelistError } = await supabase
        .from('whitelist_tokens')
        .select('id')
        .limit(1);

      if (!whitelistError && (!whitelistData || whitelistData.length === 0)) {
        const { error } = await supabase.from('whitelist_tokens').insert([
          { address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', name: 'Shiba Inu', symbol: 'SHIB', airdrop_amount: 1000000, is_active: true },
          { address: '0x514910771af9ca656af840dff83e8264ecf986ca', name: 'Chainlink', symbol: 'LINK', airdrop_amount: 50, is_active: true },
          { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', name: 'Uniswap', symbol: 'UNI', airdrop_amount: 100, is_active: true },
          { address: '0x6b175474e89094c44da98b954eedeac495271d0f', name: 'Dai Stablecoin', symbol: 'DAI', airdrop_amount: 500, is_active: true },
          { address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', name: 'Polygon', symbol: 'MATIC', airdrop_amount: 200, is_active: true },
          { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', name: 'Wrapped Bitcoin', symbol: 'WBTC', airdrop_amount: 1, is_active: true }
        ]);
        
        if (error) {
          console.error('Ошибка вставки токенов по умолчанию:', error);
        }
      }

      // Check and insert default settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1);

      if (!settingsError && (!settingsData || settingsData.length === 0)) {
        const { error } = await supabase.from('admin_settings').insert([
          { key: 'ethplorer_api_key', value: 'freekey' },
          { key: 'platform_name', value: 'AirdropHub' },
          { key: 'max_claims_per_address', value: '1' },
          { key: 'airdrop_enabled', value: 'true' }
        ]);
        
        if (error) {
          console.error('Ошибка вставки настроек по умолчанию:', error);
        }
      }

      // Check and insert installation status
      const { data: installData, error: installError } = await supabase
        .from('installation_status')
        .select('id')
        .limit(1);

      if (!installError && (!installData || installData.length === 0)) {
        const { error } = await supabase.from('installation_status').insert([
          { is_installed: true, version: '1.0.0' }
        ]);
        
        if (error) {
          console.error('Ошибка вставки статуса установки:', error);
        }
      }
    } catch (error) {
      console.error('Ошибка вставки данных по умолчанию:', error);
    }
  }

  private async tableExists(tableName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      return !error || error.code !== '42P01';
    } catch (error) {
      return false;
    }
  }

  async initializeDatabase(): Promise<boolean> {
    try {
      console.log('Начинаем инициализацию базы данных...');

      // Проверяем существование таблиц
      const tablesExist = await this.createTablesDirectly();
      
      if (!tablesExist) {
        throw new Error('Не удалось найти или создать необходимые таблицы. Пожалуйста, выполните миграции в Supabase.');
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
        console.error(`Отсутствующие таблицы: ${missingTables.join(', ')}`);
        console.error('Необходимо выполнить миграции в Supabase Dashboard');
        return false;
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