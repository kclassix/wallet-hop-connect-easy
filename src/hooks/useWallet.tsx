
import { useState, createContext, useContext, ReactNode } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { initializeConnector, Web3ReactHooks } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { WalletConnect as WalletConnectV2 } from "@web3-react/walletconnect-v2";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { formatEther } from "ethers/lib/utils";
import { toast } from "sonner";

// Initialize connectors
const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

const [walletConnectV2, walletConnectV2Hooks] = initializeConnector<WalletConnectV2>(
  (actions) => new WalletConnectV2({
    actions,
    options: {
      projectId: '5cc6ce12efb17f5c10c798f05927b065', // Public WalletConnect project ID
      chains: [1, 3, 4, 5, 42, 56, 137],
      showQrModal: true
    }
  })
);

const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) => new CoinbaseWallet({
    actions,
    options: {
      url: `https://mainnet.infura.io/v3/84842078b09946638c03157f83405213`,
      appName: 'Wallet Hop',
    }
  })
);

export const connectors = {
  metaMask: { 
    name: "MetaMask", 
    connector: metaMask, 
    hooks: metaMaskHooks, 
    icon: "/metamask.svg" 
  },
  walletConnect: { 
    name: "WalletConnect", 
    connector: walletConnectV2, 
    hooks: walletConnectV2Hooks, 
    icon: "/walletconnect.svg" 
  },
  coinbaseWallet: { 
    name: "Coinbase Wallet", 
    connector: coinbaseWallet, 
    hooks: coinbaseWalletHooks, 
    icon: "/coinbase.svg" 
  }
};

export interface ConnectedWallet {
  id: string;
  name: string;
  address: string;
  icon: string;
  balance: string;
  connector: any;
  provider: Web3Provider | null;
  hooks: Web3ReactHooks;
}

interface WalletContextType {
  activeWallet: ConnectedWallet | null;
  connectedWallets: ConnectedWallet[];
  connectWallet: (connectorId: keyof typeof connectors) => Promise<void>;
  disconnectWallet: (walletId: string) => void;
  switchWallet: (walletId: string) => void;
  isConnecting: boolean;
  error: Error | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [activeWallet, setActiveWallet] = useState<ConnectedWallet | null>(null);
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Connect to a wallet
  const connectWallet = async (connectorId: keyof typeof connectors) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const { connector, hooks, name, icon } = connectors[connectorId];
      
      // Activate the connector
      await connector.activate();
      
      // Wait a little to ensure account and library are available
      setTimeout(async () => {
        const account = hooks.useAccount();
        const provider = hooks.useProvider() as any;
        
        if (account && provider) {
          // Convert provider to Web3Provider
          const web3Provider = new Web3Provider(provider);
          
          // Get balance
          const balance = await web3Provider.getBalance(account);
          const formattedBalance = parseFloat(formatEther(balance)).toFixed(4);
          
          // Create new wallet object
          const newWallet: ConnectedWallet = {
            id: `${connectorId}-${account}`,
            name,
            address: account,
            icon,
            balance: formattedBalance,
            connector,
            provider: web3Provider,
            hooks
          };
          
          // Add to connected wallets if not already connected
          setConnectedWallets(prev => {
            const exists = prev.some(w => w.id === newWallet.id);
            if (!exists) {
              return [...prev, newWallet];
            }
            return prev;
          });
          
          // Set as active wallet
          setActiveWallet(newWallet);
          
          toast.success("Wallet connected successfully");
        }
        setIsConnecting(false);
      }, 500);
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(err);
      setIsConnecting(false);
      toast.error(err.message || "Failed to connect wallet");
    }
  };

  // Disconnect a wallet
  const disconnectWallet = (walletId: string) => {
    const walletToDisconnect = connectedWallets.find(wallet => wallet.id === walletId);
    
    if (walletToDisconnect) {
      walletToDisconnect.connector.deactivate?.();
      // or resetState if deactivate doesn't exist
      if (!walletToDisconnect.connector.deactivate) {
        walletToDisconnect.connector.resetState?.();
      }
    }
    
    setConnectedWallets(prev => prev.filter(wallet => wallet.id !== walletId));
    
    // If we're disconnecting the active wallet, set a new active wallet or null
    if (activeWallet && activeWallet.id === walletId) {
      const remaining = connectedWallets.filter(wallet => wallet.id !== walletId);
      if (remaining.length > 0) {
        setActiveWallet(remaining[0]);
      } else {
        setActiveWallet(null);
      }
    }
    
    toast.info("Wallet disconnected");
  };

  // Switch between connected wallets
  const switchWallet = async (walletId: string) => {
    const wallet = connectedWallets.find(w => w.id === walletId);
    if (wallet) {
      try {
        setIsConnecting(true);
        
        // If there's an active wallet, deactivate it first
        if (activeWallet && activeWallet.connector.deactivate) {
          activeWallet.connector.deactivate();
        }
        
        // Activate the new wallet
        await wallet.connector.activate();
        setActiveWallet(wallet);
        setIsConnecting(false);
        toast.success(`Switched to ${wallet.name}`);
      } catch (err: any) {
        console.error("Switch error:", err);
        setError(err);
        setIsConnecting(false);
        toast.error(err.message || "Failed to switch wallet");
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{
        activeWallet,
        connectedWallets,
        connectWallet,
        disconnectWallet,
        switchWallet,
        isConnecting,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
