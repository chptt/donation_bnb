"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/Button";
import { Zap, Wallet } from "lucide-react";

// No registration needed — wallet connect is the only auth
export default function RegisterPage() {
  const { isConnected, connect, connecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) router.push("/dashboard");
  }, [isConnected]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center space-y-8">
        <div>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-400 mb-4">
            <Zap className="h-7 w-7 text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">Get Started</h1>
          <p className="text-gray-400 mt-2">Connect your wallet — no sign-up required</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 space-y-6">
          <p className="text-sm text-gray-300 leading-relaxed">
            ChainGive is fully decentralized. Your wallet address is your identity — no email, no password, no backend.
          </p>
          <Button className="w-full" size="lg" onClick={connect} loading={connecting}>
            <Wallet className="h-4 w-4" /> Connect Wallet
          </Button>
          <p className="text-xs text-gray-500">
            MetaMask required. Switch to BNB Smart Chain Testnet (Chain ID: 97).
          </p>
        </div>
      </div>
    </div>
  );
}
