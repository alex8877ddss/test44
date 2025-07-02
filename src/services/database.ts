import { supabase } from '../lib/supabase';
import { WhitelistToken, AirdropClaim } from '../types';

export class DatabaseService {
  // Whitelist management
  async getWhitelist(): Promise<WhitelistToken[]> {
    const { data, error } = await supabase
      .from('whitelist_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching whitelist:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      address: item.address,
      name: item.name,
      symbol: item.symbol,
      airdrop_amount: item.airdrop_amount,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  async addToWhitelist(token: Omit<WhitelistToken, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const { error } = await supabase
      .from('whitelist_tokens')
      .insert({
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        airdrop_amount: token.airdrop_amount,
        is_active: token.is_active,
      });

    if (error) {
      console.error('Error adding to whitelist:', error);
      return false;
    }

    return true;
  }

  async updateWhitelistToken(id: string, updates: Partial<WhitelistToken>): Promise<boolean> {
    const { error } = await supabase
      .from('whitelist_tokens')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating whitelist token:', error);
      return false;
    }

    return true;
  }

  async removeFromWhitelist(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('whitelist_tokens')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing from whitelist:', error);
      return false;
    }

    return true;
  }

  // Airdrop claims management
  async createAirdropClaim(claim: Omit<AirdropClaim, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('airdrop_claims')
      .insert({
        wallet_address: claim.wallet_address,
        tokens_claimed: claim.tokens_claimed,
        total_amount: claim.total_amount,
        transaction_hash: claim.transaction_hash,
        status: claim.status,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating airdrop claim:', error);
      return null;
    }

    return data.id;
  }

  async getAirdropClaims(): Promise<AirdropClaim[]> {
    const { data, error } = await supabase
      .from('airdrop_claims')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching airdrop claims:', error);
      return [];
    }

    return data;
  }

  async hasClaimedAirdrop(walletAddress: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('airdrop_claims')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('status', 'completed')
      .limit(1);

    if (error) {
      console.error('Error checking airdrop claim:', error);
      return false;
    }

    return data.length > 0;
  }

  async updateAirdropClaim(id: string, updates: Partial<AirdropClaim>): Promise<boolean> {
    const { error } = await supabase
      .from('airdrop_claims')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating airdrop claim:', error);
      return false;
    }

    return true;
  }

  // Settings management
  async getSetting(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error('Error fetching setting:', error);
      return null;
    }

    return data.value;
  }

  async setSetting(key: string, value: string): Promise<boolean> {
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error setting value:', error);
      return false;
    }

    return true;
  }

  // Statistics
  async getStatistics() {
    const [claimsResult, whitelistResult] = await Promise.all([
      supabase.from('airdrop_claims').select('total_amount, status'),
      supabase.from('whitelist_tokens').select('is_active, airdrop_amount'),
    ]);

    const claims = claimsResult.data || [];
    const whitelist = whitelistResult.data || [];

    const totalClaims = claims.length;
    const completedClaims = claims.filter(c => c.status === 'completed').length;
    const totalDistributed = claims
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + c.total_amount, 0);
    const activeTokens = whitelist.filter(t => t.is_active).length;
    const totalAirdropPool = whitelist
      .filter(t => t.is_active)
      .reduce((sum, t) => sum + t.airdrop_amount, 0);

    return {
      totalClaims,
      completedClaims,
      totalDistributed,
      activeTokens,
      totalAirdropPool,
      totalWhitelistTokens: whitelist.length,
    };
  }
}

export const databaseService = new DatabaseService();