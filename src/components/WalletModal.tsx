
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { connectors, useWallet } from "@/hooks/useWallet";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { connectWallet, isConnecting } = useWallet();
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);

  const handleConnect = async (connectorId: keyof typeof connectors) => {
    setSelectedConnector(connectorId);
    await connectWallet(connectorId);
    onOpenChange(false);
    setSelectedConnector(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold gradient-text">
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="outline"
            size="lg"
            disabled={isConnecting}
            className="flex items-center justify-between h-16 px-4 rounded-lg hover:bg-wallet-primary/10 hover:border-wallet-primary transition-all"
            onClick={() => handleConnect("injected")}
          >
            <span className="font-medium">MetaMask</span>
            <div className="h-8 w-8 flex items-center justify-center">
              {isConnecting && selectedConnector === "injected" ? (
                <div className="h-5 w-5 border-2 border-wallet-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img
                  src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
                  alt="MetaMask"
                  className="h-8 w-8"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/50x50/7c3aed/ffffff?text=MM";
                  }}
                />
              )}
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            disabled={isConnecting}
            className="flex items-center justify-between h-16 px-4 rounded-lg hover:bg-wallet-primary/10 hover:border-wallet-primary transition-all"
            onClick={() => handleConnect("walletConnect")}
          >
            <span className="font-medium">WalletConnect</span>
            <div className="h-8 w-8 flex items-center justify-center">
              {isConnecting && selectedConnector === "walletConnect" ? (
                <div className="h-5 w-5 border-2 border-wallet-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img
                  src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Blue%20(Default)/Icon.svg"
                  alt="WalletConnect"
                  className="h-8 w-8"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/50x50/3b82f6/ffffff?text=WC";
                  }}
                />
              )}
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            disabled={isConnecting}
            className="flex items-center justify-between h-16 px-4 rounded-lg hover:bg-wallet-primary/10 hover:border-wallet-primary transition-all"
            onClick={() => handleConnect("coinbaseWallet")}
          >
            <span className="font-medium">Coinbase Wallet</span>
            <div className="h-8 w-8 flex items-center justify-center">
              {isConnecting && selectedConnector === "coinbaseWallet" ? (
                <div className="h-5 w-5 border-2 border-wallet-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img
                  src="https://raw.githubusercontent.com/coinbase/coinbase-wallet-sdk/master/assets/coinbase-wallet-sdk.png"
                  alt="Coinbase Wallet"
                  className="h-8 w-8"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/50x50/3b82f6/ffffff?text=CB";
                  }}
                />
              )}
            </div>
          </Button>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
}
