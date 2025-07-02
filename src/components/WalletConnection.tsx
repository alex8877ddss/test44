import React, { useState } from 'react';
import { Wallet, ExternalLink, Copy, CheckCircle, Zap } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

interface WalletConnectionProps {
  onAddressChange: (address: string) => void;
  currentAddress: string;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onAddressChange, currentAddress }) => {
  const { isConnected, account, isMetaMaskInstalled, isConnecting, connectWallet, disconnectWallet } = useWeb3();
  const [manualAddress, setManualAddress] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (account) {
      onAddressChange(account);
    }
  }, [account, onAddressChange]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAddress.trim()) {
      onAddressChange(manualAddress.trim());
    }
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && currentAddress) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Wallet Connected</h3>
              <p className="text-sm text-gray-400">MetaMask</p>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>

        <div className="bg-gray-700/30 rounded-xl p-4 mb-4 border border-gray-600/30">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-gray-300">{formatAddress(currentAddress)}</span>
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setUseManualInput(!useManualInput)}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Use different address
          </button>
        </div>

        {useManualInput && (
          <form onSubmit={handleManualSubmit} className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter Ethereum address"
                className="flex-1 px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
              <button
                type="submit"
                disabled={!manualAddress.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-lg shadow-purple-500/25"
              >
                Use
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400 mb-6">Connect your MetaMask wallet or enter your address manually</p>

        <div className="space-y-3">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
          >
            {isConnecting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>

          {!isMetaMaskInstalled && (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Install MetaMask <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter Ethereum address (0x...)"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!manualAddress.trim()}
              className="w-full bg-gray-700/50 text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-600"
            >
              Check Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;