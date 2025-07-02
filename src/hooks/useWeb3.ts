import { useState, useEffect } from 'react';

interface Web3State {
  isConnected: boolean;
  account: string | null;
  isMetaMaskInstalled: boolean;
}

export const useWeb3 = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    account: null,
    isMetaMaskInstalled: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkMetaMask = () => {
      const isInstalled = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
      setWeb3State(prev => ({ ...prev, isMetaMaskInstalled: isInstalled }));
      
      if (isInstalled) {
        checkConnection();
      }
    };

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWeb3State(prev => ({
            ...prev,
            isConnected: true,
            account: accounts[0],
          }));
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkMetaMask();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWeb3State(prev => ({
            ...prev,
            isConnected: true,
            account: accounts[0],
          }));
        } else {
          setWeb3State(prev => ({
            ...prev,
            isConnected: false,
            account: null,
          }));
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!web3State.isMetaMaskInstalled) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWeb3State(prev => ({
          ...prev,
          isConnected: true,
          account: accounts[0],
        }));
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWeb3State(prev => ({
      ...prev,
      isConnected: false,
      account: null,
    }));
  };

  return {
    ...web3State,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
};

declare global {
  interface Window {
    ethereum?: any;
  }
}