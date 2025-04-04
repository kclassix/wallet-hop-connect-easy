
import { Web3ReactProvider } from "@web3-react/core";
import { WalletProvider } from "@/hooks/useWallet";
import { WalletConnect } from "@/components/WalletConnect";

// Import all the connectors and hooks from our updated wallet hook file
import { connectors } from "@/hooks/useWallet";

const Index = () => {
  return (
    <Web3ReactProvider
      connectors={[
        [connectors.metaMask.connector, connectors.metaMask.hooks],
        [connectors.walletConnect.connector, connectors.walletConnect.hooks],
        [connectors.coinbaseWallet.connector, connectors.coinbaseWallet.hooks]
      ]}
    >
      <WalletProvider>
        <div className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-wallet-background">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-2 gradient-text">Wallet Hop</h1>
            <p className="text-lg text-muted-foreground">
              Connect and switch between multiple wallets without disconnecting
            </p>
          </header>
          
          <main className="flex-1">
            <WalletConnect />
          </main>
          
          <footer className="mt-12 text-center text-sm text-muted-foreground">
            <p>Built with Web3-React and WalletConnect</p>
          </footer>
        </div>
      </WalletProvider>
    </Web3ReactProvider>
  );
};

export default Index;
