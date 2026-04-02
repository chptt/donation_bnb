"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { getAllCampaigns, getCampaignsByCreator, getTotalDonatedBy, getDonatedCampaignIds, getCampaign, getCampaignDonations } from "@/lib/contract";
import { Campaign, DashboardSummary } from "@/types";
import StatCard from "@/components/dashboard/StatCard";
import DonationTrendChart from "@/components/dashboard/DonationTrendChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { formatBNB, shortenAddress, daysLeft, isExpired } from "@/lib/utils";
import { Wallet, TrendingUp, Users, LayoutGrid, Plus, AlertCircle } from "lucide-react";

interface EnrichedDonation {
  donor: string;
  amount: bigint;
  timestamp: number;
  campaignTitle?: string;
}

export default function DashboardPage() {
  const { address, isConnected, connect } = useWallet();
  const { user, setRole } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [myDonatedCampaigns, setMyDonatedCampaigns] = useState<Campaign[]>([]);
  const [totalDonated, setTotalDonated] = useState<bigint>(0n);
  const [recentDonations, setRecentDonations] = useState<EnrichedDonation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, [address]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const all = await getAllCampaigns();

      setSummary({
        totalCampaigns: all.length,
        activeCampaigns: all.filter((c) => c.status === "active").length,
        totalRaised: all.reduce((s, c) => s + c.amountRaised, 0n),
        totalDonors: all.reduce((s, c) => s + c.donorCount, 0),
      });

      // Collect recent donations for chart + activity
      const allDonations: EnrichedDonation[] = [];
      for (const c of all.slice(0, 10)) {
        const donations = await getCampaignDonations(c.id);
        for (const d of donations) {
          allDonations.push({ ...d, campaignTitle: c.title });
        }
      }
      allDonations.sort((a, b) => b.timestamp - a.timestamp);
      setRecentDonations(allDonations.slice(0, 20));

      if (address) {
        const created = await getCampaignsByCreator(address);
        setMyCampaigns(created);
        if (created.length > 0) setRole("creator");

        const donated = await getTotalDonatedBy(address);
        setTotalDonated(donated);

        const donatedIds = await getDonatedCampaignIds(address);
        const donatedCampaigns = await Promise.all(donatedIds.slice(0, 5).map(getCampaign));
        setMyDonatedCampaigns(donatedCampaigns);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user ? `Welcome, ${user.name} ðŸ‘‹` : "Dashboard"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">On-chain donation platform on opBNB</p>
        </div>
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <Button variant="outline" size="sm" onClick={connect}>
              <Wallet className="h-4 w-4" /> Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-1.5 text-xs text-gray-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {shortenAddress(address!)}
            </div>
          )}
          {isConnected && (
            <Link href="/campaigns/create">
              <Button size="sm"><Plus className="h-4 w-4" /> New Campaign</Button>
            </Link>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-300">Connect your MetaMask wallet to donate and create campaigns on opBNB.</p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Platform Overview</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Campaigns" value={summary?.totalCampaigns ?? 0} icon={LayoutGrid} iconColor="text-blue-400" />
            <StatCard title="Active Campaigns" value={summary?.activeCampaigns ?? 0} icon={TrendingUp} iconColor="text-emerald-400" />
            <StatCard title="Total Raised" value={`${formatBNB(summary?.totalRaised ?? 0n)} BNB`} icon={TrendingUp} iconColor="text-yellow-400" />
            <StatCard title="Total Donors" value={summary?.totalDonors ?? 0} icon={Users} iconColor="text-purple-400" />
          </div>
        )}
      </div>

      {isConnected && !loading && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Your Stats</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Donated" value={`${formatBNB(totalDonated)} BNB`} icon={TrendingUp} iconColor="text-yellow-400" />
            <StatCard title="Campaigns Donated" value={myDonatedCampaigns.length} icon={Users} iconColor="text-emerald-400" />
            <StatCard title="Campaigns Created" value={myCampaigns.length} icon={LayoutGrid} iconColor="text-blue-400" />
            <StatCard title="Total Raised (Creator)" value={`${formatBNB(myCampaigns.reduce((s, c) => s + c.amountRaised, 0n))} BNB`} icon={Wallet} iconColor="text-purple-400" />
          </div>
        </div>
      )}

      {myCampaigns.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">My Campaigns</h2>
            <Link href="/campaigns/create" className="text-xs text-yellow-400 hover:text-yellow-300">+ New</Link>
          </div>
          <div className="space-y-3">
            {myCampaigns.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/campaigns/${c.id}`}>
                <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-gray-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white text-sm truncate">{c.title}</p>
                      <Badge variant={c.status === "active" ? "success" : c.status === "goal_reached" ? "warning" : "default"} className="capitalize shrink-0">
                        {c.status === "goal_reached" ? "Goal Reached" : c.status}
                      </Badge>
                    </div>
                    <ProgressBar value={c.progressPercent} />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-yellow-400">{formatBNB(c.amountRaised)} BNB</p>
                    <p className="text-xs text-gray-500">{c.donorCount} donors Â· {isExpired(c.deadline) ? "Ended" : `${daysLeft(c.deadline)}d left`}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {myDonatedCampaigns.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Campaigns I Donated To</h2>
          <div className="space-y-3">
            {myDonatedCampaigns.map((c) => (
              <Link key={c.id} href={`/campaigns/${c.id}`}>
                <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-gray-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{c.title}</p>
                    <ProgressBar value={c.progressPercent} className="mt-1" />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-yellow-400">{formatBNB(c.amountRaised)} BNB</p>
                    <p className="text-xs text-gray-500">{c.progressPercent}% funded</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <DonationTrendChart donations={recentDonations} />
        <RecentActivity donations={recentDonations} />
      </div>

      <LeaderboardTable />
    </div>
  );
}
