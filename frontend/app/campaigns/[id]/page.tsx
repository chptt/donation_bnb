"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getCampaign, getCampaignDonations, donateToCampaign } from "@/lib/contract";
import { Campaign, Donation } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWallet } from "@/context/WalletContext";
import { formatBNB, formatDate, daysLeft, isExpired, shortenAddress, timeAgo } from "@/lib/utils";
import { resolveIPFS } from "@/lib/ipfs";
import { ethers } from "ethers";
import { ExternalLink, Heart, Share2, Calendar } from "lucide-react";
import { BSC_TESTNET } from "@/lib/constants";
import { toast } from "sonner";
import DonateModal from "@/components/campaign/DonateModal";

function truncateTx(hash: string) {
  return hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : "";
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isConnected, isCorrectNetwork, connect, switchNetwork } = useWallet();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonate, setShowDonate] = useState(false);

  const fetchData = async () => {
    try {
      const [c, d] = await Promise.all([
        getCampaign(Number(id)),
        getCampaignDonations(Number(id)),
      ]);
      setCampaign(c);
      setDonations(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400">Campaign not found</p>
      </div>
    );
  }

  const expired = isExpired(campaign.deadline);
  const days = daysLeft(campaign.deadline);
  const canDonate = campaign.status === "active" && !expired;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-800">
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-campaign.jpg"; }}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={campaign.status === "active" ? "success" : campaign.status === "goal_reached" ? "warning" : "default"} className="capitalize">
                {campaign.status === "goal_reached" ? "Goal Reached" : campaign.status}
              </Badge>
              <span className="rounded-full bg-gray-900/80 px-3 py-0.5 text-xs text-gray-300 capitalize">
                {campaign.category}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{campaign.title}</h1>
            <button onClick={handleShare} className="shrink-0 rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-gray-900/40">
            <div className="h-10 w-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold">
              {(campaign.creatorName || campaign.creator)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{campaign.creatorName || "Anonymous"}</p>
              <a
                href={`${BSC_TESTNET.blockExplorerUrls[0]}/address/${campaign.creator}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-yellow-400 flex items-center gap-1"
              >
                {shortenAddress(campaign.creator)} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">About this campaign</h2>
            <p className="text-gray-300 leading-relaxed">{campaign.description}</p>
            {campaign.story && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{campaign.story}</p>
              </div>
            )}
          </div>

          {/* IPFS metadata link */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Metadata stored on IPFS</p>
              <p className="text-xs text-gray-600 font-mono truncate max-w-xs">{campaign.metadataURI}</p>
            </div>
            <a
              href={resolveIPFS(campaign.metadataURI)}
              target="_blank" rel="noopener noreferrer"
              className="ml-3 shrink-0 text-xs text-yellow-400 hover:underline flex items-center gap-1"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Donations */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Donations ({donations.length})</h2>
            {donations.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-8 text-center">
                <Heart className="mx-auto h-8 w-8 text-gray-700 mb-2" />
                <p className="text-gray-500 text-sm">Be the first to donate</p>
              </div>
            ) : (
              <div className="space-y-2">
                {donations.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/40 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
                        {d.donor[2].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-white">{shortenAddress(d.donor)}</p>
                        <span className="text-xs text-gray-500">{timeAgo(new Date(d.timestamp * 1000).toISOString())}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-yellow-400 text-sm">{formatBNB(d.amount)} BNB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 space-y-5 sticky top-20">
            <div>
              <p className="text-3xl font-bold text-white">{formatBNB(campaign.amountRaised)} BNB</p>
              <p className="text-sm text-gray-400 mt-1">raised of {formatBNB(campaign.targetAmount)} BNB goal</p>
            </div>

            <ProgressBar value={campaign.progressPercent} showLabel />

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-gray-800/60 p-3">
                <p className="text-lg font-bold text-white">{campaign.donorCount}</p>
                <p className="text-xs text-gray-500">donors</p>
              </div>
              <div className="rounded-lg bg-gray-800/60 p-3">
                <p className="text-lg font-bold text-white">{campaign.progressPercent}%</p>
                <p className="text-xs text-gray-500">funded</p>
              </div>
              <div className={`rounded-lg bg-gray-800/60 p-3 ${expired ? "text-red-400" : ""}`}>
                <p className="text-lg font-bold">{expired ? "0" : days}</p>
                <p className="text-xs text-gray-500">days left</p>
              </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Deadline: {formatDate(campaign.deadline)}
            </div>

            {canDonate ? (
              isConnected ? (
                <Button className="w-full" size="lg" onClick={() => setShowDonate(true)}>
                  <Heart className="h-4 w-4" /> Donate Now
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={connect}>
                  Connect Wallet to Donate
                </Button>
              )
            ) : (
              <Button className="w-full" size="lg" disabled>
                {expired ? "Campaign Ended" : "Donate"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {showDonate && campaign && (
        <DonateModal
          campaign={campaign}
          onClose={() => setShowDonate(false)}
          onSuccess={() => { setShowDonate(false); fetchData(); }}
        />
      )}
    </div>
  );
}
