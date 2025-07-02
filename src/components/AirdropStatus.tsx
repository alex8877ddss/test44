import React, { useState } from 'react';
import { Gift, Sparkles, CheckCircle2, AlertCircle, ExternalLink, Zap, Star } from 'lucide-react';
import { AirdropStatus as AirdropStatusType } from '../types';
import { airdropService } from '../services/airdrop';

interface AirdropStatusProps {
  status: AirdropStatusType;
  address: string;
  onClaim: () => void;
}

const AirdropStatus: React.FC<AirdropStatusProps> = ({ status, address, onClaim }) => {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);

    try {
      await airdropService.claimAirdrop(address, status.eligibleTokens);
      setClaimed(true);
      onClaim();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim airdrop');
    } finally {
      setClaiming(false);
    }
  };

  if (!status.isEligible) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Not Eligible</h3>
          <p className="text-gray-400 mb-4">
            You don't currently hold any tokens that are eligible for the airdrop.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-400">
              <strong>Tip:</strong> Hold whitelisted tokens like SHIB, LINK, UNI, or DAI to become eligible for future airdrops.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">🎉 Airdrop Claimed!</h3>
          <p className="text-gray-400 mb-4">
            Your airdrop has been successfully claimed and is being processed.
          </p>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-emerald-400">
              <strong>Total Claimed:</strong> {status.totalAirdropAmount.toLocaleString()} tokens
            </p>
          </div>
          <button className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium">
            View on Etherscan <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">🎉 You're Eligible!</h3>
        <p className="text-gray-400 mb-6">
          You can claim an airdrop based on your token holdings
        </p>

        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-amber-400">Total Airdrop Amount</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {status.totalAirdropAmount.toLocaleString()} tokens
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-white text-left">Eligible tokens:</h4>
          {status.eligibleTokens.map((token, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {token.symbol.slice(0, 2)}
                  </span>
                </div>
                <span className="font-medium text-white">{token.symbol}</span>
              </div>
              <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                +{token.airdrop_amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
        >
          {claiming ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Claim Airdrop
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 mt-3">
          Tokens will be sent to your connected wallet address
        </p>
      </div>
    </div>
  );
};

export default AirdropStatus;