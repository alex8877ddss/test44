import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'user';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'admin' | 'user';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'user';
          is_active?: boolean;
          updated_at?: string;
        };
      };
      whitelist_tokens: {
        Row: {
          id: string;
          address: string;
          name: string;
          symbol: string;
          airdrop_amount: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          address: string;
          name: string;
          symbol: string;
          airdrop_amount: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          address?: string;
          name?: string;
          symbol?: string;
          airdrop_amount?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      airdrop_claims: {
        Row: {
          id: string;
          wallet_address: string;
          tokens_claimed: any;
          total_amount: number;
          transaction_hash: string | null;
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          tokens_claimed: any;
          total_amount: number;
          transaction_hash?: string | null;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          tokens_claimed?: any;
          total_amount?: number;
          transaction_hash?: string | null;
          status?: 'pending' | 'completed' | 'failed';
          updated_at?: string;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          updated_at?: string;
        };
      };
      installation_status: {
        Row: {
          id: string;
          is_installed: boolean;
          installed_at: string;
          version: string;
        };
        Insert: {
          id?: string;
          is_installed?: boolean;
          installed_at?: string;
          version?: string;
        };
        Update: {
          id?: string;
          is_installed?: boolean;
          installed_at?: string;
          version?: string;
        };
      };
    };
  };
};