import React from 'react';
import { CheckCircle, XCircle, Coins, DollarSign, Sparkles } from 'lucide-react';
import { Token, WhitelistToken } from '../types';

interface TokenListProps {
  tokens: Token[];
  ethBalance: number;
  ethPrice?: number;
  eligibleTokens: WhitelistToken[];
  loading: boolean;
}

const TokenList: React.FC<TokenListProps> = ({ 
  tokens, 
  ethBalance, 
  ethPrice, 
  eligibleTokens, 
  loading 
}) => {
  const formatBalance = (balance: number, decimals: number) => {
    const formatted = balance / Math.pow(10, decimals);
    return formatted.toLocaleString(undefined, { 
      maximumFractionDigits: 4,
      minimumFractionDigits: 0 
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const isTokenEligible = (tokenAddress: string) => {
    return eligibleTokens.some(
      eligible => eligible.address.toLowerCase() === tokenAddress.toLowerCase()
    );
  };

  const getAirdropAmount = (tokenAddress: string) => {
    const eligible = eligibleTokens.find(
      token => token.address.toLowerCase() === tokenAddress.toLowerCase()
    );
    return eligible?.airdrop_amount || 0;
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Loading Tokens...</h3>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 border border-gray-600/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-600 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-600 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <Coins className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Your Tokens</h3>
          <p className="text-sm text-gray-400">
            {tokens.length + 1} tokens found • {eligibleTokens.length} eligible for airdrop
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* ETH Balance */}
        <div className="flex items-center justify-between p-4 border border-gray-600/50 rounded-xl hover:border-gray-500/50 transition-colors bg-gray-700/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">ETH</span>
            </div>
            <div>
              <h4 className="font-semibold text-white">Ethereum</h4>
              <p className="text-sm text-gray-400">ETH</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white">
              {ethBalance.toFixed(4)} ETH
            </p>
            {ethPrice && (
              <p className="text-sm text-gray-400">
                {formatPrice(ethBalance * ethPrice)}
              </p>
            )}
          </div>
        </div>

        {/* Token List */}
        {tokens.map((token, index) => {
          const isEligible = isTokenEligible(token.tokenInfo.address);
          const airdropAmount = getAirdropAmount(token.tokenInfo.address);
          
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                isEligible 
                  ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10' 
                  : 'border-gray-600/50 hover:border-gray-500/50 bg-gray-700/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {token.tokenInfo.symbol?.slice(0, 3) || '?'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">
                      {token.tokenInfo.name || 'Unknown Token'}
                    </h4>
                    {isEligible ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400">{token.tokenInfo.symbol}</p>
                    {isEligible && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +{airdropAmount.toLocaleString()} tokens
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  {formatBalance(token.balance, token.tokenInfo.decimals)} {token.tokenInfo.symbol}
                </p>
                {token.tokenInfo.price && (
                  <p className="text-sm text-gray-400">
                    {formatPrice((token.balance / Math.pow(10, token.tokenInfo.decimals)) * token.tokenInfo.price.rate)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {tokens.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">No tokens found in this wallet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenList;