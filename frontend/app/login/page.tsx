"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/Button";
import { Zap, Wallet } from "lucide-react";

export default function LoginPage() {
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
          <h1 className="text-2xl font-bold text-white">Connect to ChainGive</h1>
          <p className="text-gray-400 mt-2">No account needed — your wallet is your identity</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 space-y-6">
          <div className="space-y-3 text-left">
            {[
              "Connect your MetaMask wallet",
              "Browse and donate to campaigns",
              "Create your own fundraising campaign",
              "All data lives on BNB Chain + IPFS",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="h-5 w-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {item}
              </div>
            ))}
          </div>

          <Button className="w-full" size="lg" onClick={connect} loading={connecting}>
            <Wallet className="h-4 w-4" /> Connect Wallet
          </Button>

          <p className="text-xs text-gray-500">
            MetaMask required. Make sure you&apos;re on BNB Smart Chain Testnet.
          </p>
        </div>
      </div>
    </div>
  );
}
