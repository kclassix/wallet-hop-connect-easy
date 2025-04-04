
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConnectedWallet, useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";
import { PenLine } from "lucide-react";

interface WalletCardProps {
  wallet: ConnectedWallet;
  isActive: boolean;
}

export function WalletCard({ wallet, isActive }: WalletCardProps) {
  const { switchWallet, disconnectWallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureResult, setSignatureResult] = useState<string | null>(null);

  // Format address to display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sign a message with the wallet
  const signMessage = async () => {
    try {
      setIsSigning(true);
      setSignatureResult(null);
      
      // Get the signer from the wallet's provider
      const signer = wallet.provider?.getSigner();
      if (!signer) {
        throw new Error("Signer not available");
      }

      // Sign a simple message
      const message = `Hello from Wallet Hop! Signing with address: ${wallet.address} at ${new Date().toISOString()}`;
      const signature = await signer.signMessage(message);
      
      // Show a preview of the signature
      setSignatureResult(signature.substring(0, 20) + "...");
    } catch (error: any) {
      console.error("Signing error:", error);
      setSignatureResult("Failed: " + (error.message || "Unknown error"));
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Card 
      className={cn(
        "glass-card transition-all duration-300 hover:shadow-lg",
        isActive ? "border-wallet-primary border-2" : "hover:border-wallet-secondary"
      )}
    >
      <CardContent className="p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              <img 
                src={wallet.icon} 
                alt={wallet.name} 
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/50x50/7c3aed/ffffff?text=W";
                }}
              />
            </div>
            <div>
              <h3 className="font-medium">{wallet.name}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="text-sm text-muted-foreground hover:text-wallet-primary flex items-center"
                      onClick={copyAddress}
                    >
                      {formatAddress(wallet.address)}
                      {copied ? (
                        <span className="ml-1 text-green-500 text-xs">Copied!</span>
                      ) : null}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy address</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">{wallet.balance} ETH</p>
          </div>
        </div>

        {signatureResult && (
          <div className="mb-2 text-xs bg-muted p-2 rounded-md overflow-hidden text-ellipsis">
            <span className="font-medium">Signature:</span> {signatureResult}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button 
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center text-wallet-primary border-wallet-primary"
            onClick={signMessage}
            disabled={isSigning}
          >
            <PenLine className="mr-1 h-4 w-4" />
            {isSigning ? "Signing..." : "Sign Message"}
          </Button>
          
          {!isActive ? (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-wallet-primary hover:bg-wallet-primary/90"
              onClick={() => switchWallet(wallet.id)}
            >
              Switch
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-wallet-primary border-wallet-primary"
              disabled
            >
              Active
            </Button>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="w-full hover:text-destructive hover:border-destructive"
          onClick={() => disconnectWallet(wallet.id)}
        >
          Disconnect
        </Button>
      </CardContent>
    </Card>
  );
}
