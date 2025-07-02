export interface Token {
  tokenInfo: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    price?: {
      rate: number;
      currency: string;
    };
  };
  balance: number;
  rawBalance: string;
}

export interface EthplorerResponse {
  address: string;
  ETH: {
    balance: number;
    price?: {
      rate: number;
      currency: string;
    };
  };
  tokens?: Token[];
}

export interface WhitelistToken {
  id?: string;
  address: string;
  name: string;
  symbol: string;
  airdrop_amount: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AirdropStatus {
  isEligible: boolean;
  eligibleTokens: WhitelistToken[];
  totalAirdropAmount: number;
  claimed: boolean;
}

export interface AirdropClaim {
  id?: string;
  wallet_address: string;
  tokens_claimed: WhitelistToken[];
  total_amount: number;
  transaction_hash?: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  ethplorerApiKey: string;
  totalAirdropsCompleted: number;
  totalTokensDistributed: number;
}