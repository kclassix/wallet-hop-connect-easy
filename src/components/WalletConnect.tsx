
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletModal } from "./WalletModal";
import { useWallet } from "@/hooks/useWallet";
import { WalletCard } from "./WalletCard";

export function WalletConnect() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { activeWallet, connectedWallets } = useWallet();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-6">
        {connectedWallets.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Connected Wallets</h2>
              <Button 
                onClick={() => setWalletModalOpen(true)}
                className="bg-wallet-primary hover:bg-wallet-primary/90"
              >
                Connect New Wallet
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {connectedWallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  isActive={activeWallet?.id === wallet.id}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="glass-card p-8 text-center max-w-md w-full mb-6">
              <h2 className="text-2xl font-bold mb-4 gradient-text">No Wallets Connected</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to start managing your crypto assets and interacting with Web3 applications.
              </p>
              <Button 
                onClick={() => setWalletModalOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-wallet-primary to-wallet-secondary hover:opacity-90 text-white"
              >
                Connect Wallet
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Supports MetaMask, WalletConnect, Coinbase Wallet and more
            </p>
          </div>
        )}
      </div>

      <WalletModal 
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
      />
    </div>
  );
}
