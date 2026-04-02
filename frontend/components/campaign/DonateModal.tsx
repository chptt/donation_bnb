"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { donateToCampaign } from "@/lib/contract";
import { Campaign } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BSC_TESTNET } from "@/lib/constants";
import { toast } from "sonner";
import { X, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { formatBNB } from "@/lib/utils";

interface Props {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "input" | "confirm" | "pending" | "success" | "error";

export default function DonateModal({ campaign, onClose, onSuccess }: Props) {
  const { address, isConnected, isCorrectNetwork, connect, switchNetwork, signer } = useWallet();

  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!isConnected) { await connect(); return; }
    if (!isCorrectNetwork) { await switchNetwork(); return; }
    setStep("confirm");
  };

  const confirmDonate = async () => {
    if (!signer) return;
    setStep("pending");
    setError("");
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await donateToCampaign(signer, campaign.id, amountWei);
      setTxHash(tx.hash);
      await tx.wait();
      setStep("success");
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { reason?: string; message?: string }).reason || (err as Error).message || "Transaction failed";
      setError(msg);
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Donate to Campaign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-lg bg-gray-800/60 p-4">
            <p className="text-sm font-medium text-white line-clamp-1">{campaign.title}</p>
            <p className="text-xs text-gray-400 mt-1">
              {formatBNB(campaign.amountRaised)} / {formatBNB(campaign.targetAmount)} BNB raised
            </p>
          </div>

          {step === "input" && (
            <>
              <Input
                label="Donation Amount (BNB)"
                type="number"
                min="0.001"
                step="0.001"
                placeholder="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="flex gap-2">
                {["0.01", "0.05", "0.1", "0.5"].map((v) => (
                  <button key={v} onClick={() => setAmount(v)}
                    className="flex-1 rounded-lg border border-gray-700 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                    {v}
                  </button>
                ))}
              </div>
              {!isConnected && (
                <p className="text-xs text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Connect your wallet to donate
                </p>
              )}
              {isConnected && !isCorrectNetwork && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Switch to BNB Testnet
                </p>
              )}
              <Button className="w-full" onClick={handleDonate} disabled={!amount}>
                {!isConnected ? "Connect Wallet" : !isCorrectNetwork ? "Switch Network" : "Donate Now"}
              </Button>
            </>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-yellow-400/10 border border-yellow-400/20 p-4 space-y-2">
                <p className="text-sm text-gray-300">You are about to donate</p>
                <p className="text-2xl font-bold text-yellow-400">{amount} BNB</p>
                <p className="text-xs text-gray-500">to {campaign.title}</p>
              </div>
              <p className="text-xs text-gray-500">MetaMask will open to confirm. Gas fees apply.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>Back</Button>
                <Button className="flex-1" onClick={confirmDonate}>Confirm & Send</Button>
              </div>
            </div>
          )}

          {step === "pending" && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-yellow-400/30 border-t-yellow-400 animate-spin" />
              <p className="text-white font-medium">Transaction in progress...</p>
              <p className="text-sm text-gray-400">Waiting for blockchain confirmation</p>
              {txHash && (
                <a href={`${BSC_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:underline">
                  View on BscScan <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
              <p className="text-white font-medium">Donation Successful!</p>
              <p className="text-sm text-gray-400">Thank you for supporting this campaign</p>
              {txHash && (
                <a href={`${BSC_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:underline">
                  View transaction <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <Button className="w-full" onClick={onClose}>Close</Button>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button className="flex-1" onClick={() => setStep("input")}>Try Again</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
