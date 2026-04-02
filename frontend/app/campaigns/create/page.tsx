"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { createCampaign } from "@/lib/contract";
import { uploadCampaignToIPFS } from "@/lib/ipfs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import { Upload, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  story: z.string().optional(),
  category: z.string().min(1, "Category required"),
  targetAmount: z.string().refine((v) => parseFloat(v) > 0, "Target must be > 0"),
  deadline: z.string().min(1, "Deadline required"),
});
type FormData = z.infer<typeof schema>;

type Step = "form" | "ipfs" | "tx" | "done";

export default function CreateCampaignPage() {
  const { isConnected, isCorrectNetwork, connect, switchNetwork, signer } = useWallet();
  const { user, setRole } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "other" },
  });

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Connect your wallet to create a campaign</p>
          <Button onClick={connect}>Connect Wallet</Button>
        </div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    if (!isCorrectNetwork) { await switchNetwork(); return; }
    if (!signer) return;

    setLoading(true);
    try {
      // Step 1: Upload to IPFS
      setStep("ipfs");
      toast.loading("Uploading to IPFS...", { id: "ipfs" });
      const metadataURI = await uploadCampaignToIPFS(
        {
          title: data.title,
          description: data.description,
          story: data.story || "",
          category: data.category,
          creator_name: user?.name,
        },
        imageFile
      );
      toast.dismiss("ipfs");
      toast.success("Uploaded to IPFS");

      // Step 2: Send transaction
      setStep("tx");
      const targetWei = ethers.parseEther(data.targetAmount);
      const deadlineTs = Math.floor(new Date(data.deadline).getTime() / 1000);

      const tx = await createCampaign(signer, metadataURI, targetWei, deadlineTs);
      toast.loading("Waiting for confirmation...", { id: "tx" });
      const receipt = await tx.wait();
      toast.dismiss("tx");

      // Parse CampaignCreated event for the new campaign ID
      const iface = new ethers.Interface([
        "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string metadataURI, uint256 targetAmount, uint256 deadline)",
      ]);
      let newId = 0;
      for (const log of receipt?.logs ?? []) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed?.name === "CampaignCreated") {
            newId = Number(parsed.args.campaignId);
            break;
          }
        } catch {}
      }

      // Mark user as creator
      setRole("creator");
      setCampaignId(newId);
      setStep("done");
      toast.success("Campaign is live on BNB Chain!");
    } catch (err: unknown) {
      const msg = (err as { reason?: string; message?: string }).reason || (err as Error).message || "Transaction failed";
      toast.error(msg);
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = CATEGORIES.map((c) => ({ value: c.value, label: c.label }));
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Campaign</h1>
        <p className="text-gray-400">Launch your fundraising campaign on BNB Chain</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { key: "form", label: "Details" },
          { key: "ipfs", label: "IPFS Upload" },
          { key: "tx", label: "On-Chain" },
          { key: "done", label: "Live!" },
        ].map((s, i) => {
          const steps = ["form", "ipfs", "tx", "done"];
          const currentIdx = steps.indexOf(step);
          const isDone = i < currentIdx || step === "done";
          const isActive = steps[i] === step;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                isActive ? "bg-yellow-400 text-gray-900" :
                isDone ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-500"
              )}>
                {isDone ? "âœ“" : i + 1}
              </div>
              <span className={cn("text-sm hidden sm:block", isActive ? "text-white font-medium" : "text-gray-500")}>
                {s.label}
              </span>
              {i < 3 && <div className="h-px w-6 bg-gray-800" />}
            </div>
          );
        })}
      </div>

      {step === "form" && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 space-y-5">
            <Input label="Campaign Title" placeholder="Give your campaign a compelling title" error={errors.title?.message} {...register("title")} />
            <Textarea label="Short Description" placeholder="Briefly describe your campaign" rows={3} error={errors.description?.message} {...register("description")} />
            <Textarea label="Full Story (optional)" placeholder="Tell your full story..." rows={6} {...register("story")} />
            <Select label="Category" options={categoryOptions} error={errors.category?.message} {...register("category")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Target Amount (BNB)" type="number" min="0.001" step="0.001" placeholder="1.0" error={errors.targetAmount?.message} {...register("targetAmount")} />
              <Input label="Deadline" type="date" min={minDate} error={errors.deadline?.message} {...register("deadline")} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Campaign Image</label>
              <label className={cn(
                "flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
                imagePreview ? "border-yellow-400/40" : "border-gray-700 hover:border-gray-600"
              )}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Upload to IPFS & Publish On-Chain
          </Button>
        </form>
      )}

      {(step === "ipfs" || step === "tx") && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-yellow-400/10 flex items-center justify-center">
            <Zap className="h-8 w-8 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              {step === "ipfs" ? "Uploading to IPFS..." : "Publishing on BNB Chain..."}
            </h2>
            <p className="text-gray-400 text-sm">
              {step === "ipfs" ? "Storing your campaign metadata on IPFS via Pinata" : "Confirm the transaction in MetaMask"}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 text-yellow-400">
            <div className="h-5 w-5 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin" />
            <span className="text-sm">{step === "ipfs" ? "Uploading..." : "Waiting for confirmation..."}</span>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-6">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Campaign is Live!</h2>
            <p className="text-gray-400 text-sm">Your campaign is on BNB Chain and accepting donations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            {campaignId ? (
              <Button className="flex-1" onClick={() => router.push(`/campaigns/${campaignId}`)}>View Campaign</Button>
            ) : (
              <Button className="flex-1" onClick={() => router.push("/explore")}>Explore</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
