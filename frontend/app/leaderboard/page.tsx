"use client";
import { useState, useEffect, useMemo } from "react";
import { getAllCampaigns, getCampaignDonations } from "@/lib/contract";
import { Campaign, LeaderboardCampaign, LeaderboardDonor } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatBNB, shortenAddress, getRankBadge, daysLeft, isExpired } from "@/lib/utils";
import { Trophy, TrendingUp, Users, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "campaigns" | "donors";
type CampaignSort = "amountRaised" | "donorCount";

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaignSort, setCampaignSort] = useState<CampaignSort>("amountRaised");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donors, setDonors] = useState<LeaderboardDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await getAllCampaigns();
      setCampaigns(all);

      // Build donor leaderboard from all campaign donations
      const donorMap = new Map<string, { totalDonated: bigint; donationCount: number }>();
      await Promise.all(
        all.map(async (c) => {
          const donations = await getCampaignDonations(c.id);
          for (const d of donations) {
            const existing = donorMap.get(d.donor) ?? { totalDonated: 0n, donationCount: 0 };
            donorMap.set(d.donor, {
              totalDonated: existing.totalDonated + d.amount,
              donationCount: existing.donationCount + 1,
            });
          }
        })
      );

      const donorList: LeaderboardDonor[] = Array.from(donorMap.entries())
        .map(([address, stats], i) => ({ rank: i + 1, address, ...stats }))
        .sort((a, b) => Number(b.totalDonated - a.totalDonated))
        .map((d, i) => ({ ...d, rank: i + 1 }));

      setDonors(donorList);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const rankedCampaigns: LeaderboardCampaign[] = useMemo(() => {
    const sorted = [...campaigns].sort((a, b) =>
      campaignSort === "amountRaised"
        ? Number(b.amountRaised - a.amountRaised)
        : b.donorCount - a.donorCount
    );
    return sorted.map((c, i) => ({ ...c, rank: i + 1 }));
  }, [campaigns, campaignSort]);

  const top3C = rankedCampaigns.slice(0, 3);
  const top3D = donors.slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-sm text-yellow-400">
          <Trophy className="h-4 w-4" /> Live Rankings
        </div>
        <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
        <p className="text-gray-400">Real-time rankings from on-chain data</p>
        <p className="text-xs text-gray-600">Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 60s</p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="flex rounded-xl border border-gray-800 overflow-hidden p-1 bg-gray-900/60">
          <button onClick={() => setTab("campaigns")} className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all", tab === "campaigns" ? "bg-yellow-400 text-gray-900" : "text-gray-400 hover:text-white")}>
            <Zap className="h-4 w-4" /> Campaigns
          </button>
          <button onClick={() => setTab("donors")} className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all", tab === "donors" ? "bg-yellow-400 text-gray-900" : "text-gray-400 hover:text-white")}>
            <Users className="h-4 w-4" /> Donors
          </button>
        </div>
        <button onClick={fetchData} className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      {tab === "campaigns" && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCampaignSort("amountRaised")} className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors border", campaignSort === "amountRaised" ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-400" : "border-gray-700 text-gray-500 hover:text-gray-300")}>
            <TrendingUp className="h-3.5 w-3.5" /> Most Funded
          </button>
          <button onClick={() => setCampaignSort("donorCount")} className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors border", campaignSort === "donorCount" ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-400" : "border-gray-700 text-gray-500 hover:text-gray-300")}>
            <Users className="h-3.5 w-3.5" /> Most Donors
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <>
          {/* Top 3 podium */}
          {(tab === "campaigns" ? top3C : top3D).length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 0, 2].map((idx) => {
                const item = tab === "campaigns" ? top3C[idx] : top3D[idx];
                if (!item) return <div key={idx} />;
                const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                const isCampaign = tab === "campaigns";
                const c = item as LeaderboardCampaign;
                const d = item as LeaderboardDonor;
                return (
                  <div key={rank} className={cn("rounded-2xl border p-4 text-center space-y-2",
                    rank === 1 ? "border-yellow-400/40 bg-yellow-400/5 scale-105 shadow-lg shadow-yellow-400/10" :
                    rank === 2 ? "border-gray-500/40 bg-gray-500/5" : "border-orange-700/40 bg-orange-900/5"
                  )}>
                    <div className="text-3xl">{getRankBadge(rank)}</div>
                    <div className="h-10 w-10 mx-auto rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-sm">
                      {isCampaign ? c.creator[2].toUpperCase() : d.address[2].toUpperCase()}
                    </div>
                    <p className="text-xs font-medium text-white line-clamp-2">
                      {isCampaign ? c.title : shortenAddress(d.address)}
                    </p>
                    <p className="text-sm font-bold text-yellow-400">
                      {isCampaign ? `${formatBNB(c.amountRaised)} BNB` : `${formatBNB(d.totalDonated)} BNB`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <Card>
            <CardContent className="pt-6">
              {tab === "campaigns" ? (
                rankedCampaigns.length === 0 ? <EmptyState /> : (
                  <div className="space-y-2">
                    {rankedCampaigns.map((c) => (
                      <Link key={c.id} href={`/campaigns/${c.id}`}>
                        <div className={cn("flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-gray-800/60", c.rank <= 3 ? "border border-yellow-400/20 bg-yellow-400/5" : "border border-transparent")}>
                          <div className="w-10 text-center shrink-0">
                            {c.rank <= 3 ? <span className="text-xl">{getRankBadge(c.rank)}</span> : <span className="text-sm font-bold text-gray-500">#{c.rank}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate">{c.title}</p>
                            <p className="text-xs text-gray-500">{shortenAddress(c.creator)} · {c.category}</p>
                            <ProgressBar value={c.progressPercent} className="mt-2" />
                          </div>
                          <div className="text-right shrink-0 space-y-0.5">
                            <p className="font-semibold text-yellow-400 text-sm">{formatBNB(c.amountRaised)} BNB</p>
                            <p className="text-xs text-gray-500">{c.donorCount} donors</p>
                            <p className="text-xs text-gray-600">{isExpired(c.deadline) ? "Ended" : `${daysLeft(c.deadline)}d left`}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                donors.length === 0 ? <EmptyState /> : (
                  <div className="space-y-2">
                    {donors.map((d) => (
                      <div key={d.address} className={cn("flex items-center gap-4 rounded-xl p-4", d.rank <= 3 ? "border border-yellow-400/20 bg-yellow-400/5" : "border border-transparent")}>
                        <div className="w-10 text-center shrink-0">
                          {d.rank <= 3 ? <span className="text-xl">{getRankBadge(d.rank)}</span> : <span className="text-sm font-bold text-gray-500">#{d.rank}</span>}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                          {d.address[2].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm">{shortenAddress(d.address)}</p>
                          <p className="text-xs text-gray-500">{d.donationCount} donations</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-yellow-400 text-sm">{formatBNB(d.totalDonated)} BNB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <Trophy className="mx-auto h-12 w-12 text-gray-700 mb-4" />
      <p className="text-gray-400 font-medium">No data yet</p>
      <p className="text-gray-600 text-sm mt-1">Rankings appear once donations are made</p>
      <Link href="/explore" className="mt-4 inline-block">
        <Button size="sm" variant="outline">Explore Campaigns</Button>
      </Link>
    </div>
  );
}
