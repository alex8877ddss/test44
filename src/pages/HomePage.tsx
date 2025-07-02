import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Shield, TrendingUp, Star, Coins } from 'lucide-react';
import WalletConnection from '../components/WalletConnection';
import TokenList from '../components/TokenList';
import AirdropStatus from '../components/AirdropStatus';
import { ethplorerService } from '../services/ethplorer';
import { airdropService } from '../services/airdrop';
import { Token, AirdropStatus as AirdropStatusType } from '../types';

const HomePage: React.FC = () => {
  const [currentAddress, setCurrentAddress] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ethBalance, setEthBalance] = useState(0);
  const [ethPrice, setEthPrice] = useState<number | undefined>();
  const [airdropStatus, setAirdropStatus] = useState<AirdropStatusType>({
    isEligible: false,
    eligibleTokens: [],
    totalAirdropAmount: 0,
    claimed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async (address: string) => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ethplorerService.getAddressInfo(address);
      
      setEthBalance(data.ETH.balance);
      setEthPrice(data.ETH.price?.rate);
      
      if (data.tokens && data.tokens.length > 0) {
        setTokens(data.tokens);
        const status = await airdropService.checkEligibility(data.tokens);
        status.claimed = await airdropService.hasClaimedAirdrop(address);
        setAirdropStatus(status);
      } else {
        setTokens([]);
        setAirdropStatus({
          isEligible: false,
          eligibleTokens: [],
          totalAirdropAmount: 0,
          claimed: false,
        });
      }
    } catch (err) {
      setError('Failed to fetch token data. Please check the address and try again.');
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAddress) {
      fetchTokens(currentAddress);
    }
  }, [currentAddress]);

  const handleAddressChange = (address: string) => {
    setCurrentAddress(address);
  };

  const handleAirdropClaim = () => {
    setAirdropStatus(prev => ({ ...prev, claimed: true }));
  };

  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AirdropHub
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Connect your wallet to discover eligible airdrops based on your token holdings. 
              Secure, fast, and completely free.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Analysis</h3>
              <p className="text-gray-400 text-sm">
                Real-time token analysis using Ethplorer API to check your eligibility instantly.
              </p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure & Safe</h3>
              <p className="text-gray-400 text-sm">
                We only read your wallet data. No permissions needed for transfers or signatures.
              </p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Growing Rewards</h3>
              <p className="text-gray-400 text-sm">
                Regular updates to our whitelist means more opportunities for airdrops.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <WalletConnection
              onAddressChange={handleAddressChange}
              currentAddress={currentAddress}
            />
            
            {currentAddress && (
              <AirdropStatus
                status={airdropStatus}
                address={currentAddress}
                onClaim={handleAirdropClaim}
              />
            )}
          </div>

          {/* Right Column */}
          <div>
            {currentAddress && (
              <TokenList
                tokens={tokens}
                ethBalance={ethBalance}
                ethPrice={ethPrice}
                eligibleTokens={airdropStatus.eligibleTokens}
                loading={loading}
              />
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;