
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { formatEther } from "ethers/lib/utils";
import { toast } from "@/components/ui/sonner";

// Define supported chains
const SUPPORTED_CHAIN_IDS = [1, 3, 4, 5, 42, 56, 137];

// Connector instances
const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    1: `https://mainnet.infura.io/v3/84842078b09946638c03157f83405213`,
    3: `https://ropsten.infura.io/v3/84842078b09946638c03157f83405213`,
    4: `https://rinkeby.infura.io/v3/84842078b09946638c03157f83405213`,
    5: `https://goerli.infura.io/v3/84842078b09946638c03157f83405213`,
    42: `https://kovan.infura.io/v3/84842078b09946638c03157f83405213`,
    56: "https://bsc-dataseed.binance.org/",
    137: "https://polygon-rpc.com/",
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});

const walletlink = new WalletLinkConnector({
  url: `https://mainnet.infura.io/v3/84842078b09946638c03157f83405213`,
  appName: "Wallet Hop",
  supportedChainIds: SUPPORTED_CHAIN_IDS,
});

export const connectors = {
  injected: { name: "MetaMask", connector: injected, icon: "/metamask.svg" },
  walletConnect: { name: "WalletConnect", connector: walletconnect, icon: "/walletconnect.svg" },
  coinbaseWallet: { name: "Coinbase Wallet", connector: walletlink, icon: "/coinbase.svg" },
};

export interface ConnectedWallet {
  id: string;
  name: string;
  address: string;
  icon: string;
  balance: string;
  connector: any;
  provider: Web3Provider | null;
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
  const { 
    activate, 
    deactivate, 
    account, 
    library, 
    active, 
    error: web3Error 
  } = useWeb3React<Web3Provider>();
  
  const [activeWallet, setActiveWallet] = useState<ConnectedWallet | null>(null);
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Connect to a wallet
  const connectWallet = async (connectorId: keyof typeof connectors) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const { connector, name, icon } = connectors[connectorId];
      
      // Activate the connector
      await activate(connector, undefined, true);
      
      // Wait a little to ensure account and library are available
      setTimeout(async () => {
        if (account && library) {
          // Get balance
          const balance = await library.getBalance(account);
          const formattedBalance = parseFloat(formatEther(balance)).toFixed(4);
          
          // Create new wallet object
          const newWallet: ConnectedWallet = {
            id: `${connectorId}-${account}`,
            name,
            address: account,
            icon,
            balance: formattedBalance,
            connector,
            provider: library
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
    setConnectedWallets(prev => prev.filter(wallet => wallet.id !== walletId));
    
    // If we're disconnecting the active wallet, set a new active wallet or null
    if (activeWallet && activeWallet.id === walletId) {
      const remaining = connectedWallets.filter(wallet => wallet.id !== walletId);
      if (remaining.length > 0) {
        setActiveWallet(remaining[0]);
        activate(remaining[0].connector);
      } else {
        setActiveWallet(null);
        deactivate();
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
        await activate(wallet.connector);
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

  // Handle Web3React errors
  useEffect(() => {
    if (web3Error) {
      setError(web3Error);
      toast.error(web3Error.message || "Wallet connection error");
    }
  }, [web3Error]);

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
