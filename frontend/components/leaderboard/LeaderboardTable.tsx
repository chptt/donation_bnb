"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllCampaigns, getCampaignDonations } from "@/lib/contract";
import { LeaderboardCampaign, LeaderboardDonor } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatBNB, shortenAddress, getRankBadge } from "@/lib/utils";
import { Trophy, TrendingUp, Users, RefreshCw } from "lucide-react";

type Tab = "campaigns" | "donors";
type CampaignSort = "amountRaised" | "donorCount";

export default function LeaderboardTable() {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaignSort, setCampaignSort] = useState<CampaignSort>("amountRaised");
  const [campaigns, setCampaigns] = useState<LeaderboardCampaign[]>([]);
  const [donors, setDonors] = useState<LeaderboardDonor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await getAllCampaigns();
      const sorted = [...all].sort((a, b) =>
        campaignSort === "amountRaised"
          ? Number(b.amountRaised - a.amountRaised)
          : b.donorCount - a.donorCount
      );
      setCampaigns(sorted.slice(0, 10).map((c, i) => ({ ...c, rank: i + 1 })));

      if (tab === "donors") {
        const donorMap = new Map<string, { totalDonated: bigint; donationCount: number }>();
        await Promise.all(all.map(async (c) => {
          const donations = await getCampaignDonations(c.id);
          for (const d of donations) {
            const e = donorMap.get(d.donor) ?? { totalDonated: 0n, donationCount: 0 };
            donorMap.set(d.donor, { totalDonated: e.totalDonated + d.amount, donationCount: e.donationCount + 1 });
          }
        }));
        const list: LeaderboardDonor[] = Array.from(donorMap.entries())
          .map(([address, s]) => ({ rank: 0, address, ...s }))
          .sort((a, b) => Number(b.totalDonated - a.totalDonated))
          .slice(0, 10)
          .map((d, i) => ({ ...d, rank: i + 1 }));
        setDonors(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab, campaignSort]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <CardTitle>Leaderboard</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="text-gray-500 hover:text-gray-300 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="flex rounded-lg border border-gray-800 overflow-hidden">
              <button onClick={() => setTab("campaigns")} className={`px-4 py-1.5 text-xs font-medium transition-colors ${tab === "campaigns" ? "bg-yellow-400 text-gray-900" : "text-gray-400 hover:text-white"}`}>
                Campaigns
              </button>
              <button onClick={() => setTab("donors")} className={`px-4 py-1.5 text-xs font-medium transition-colors ${tab === "donors" ? "bg-yellow-400 text-gray-900" : "text-gray-400 hover:text-white"}`}>
                Donors
              </button>
            </div>
          </div>
        </div>
        {tab === "campaigns" && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => setCampaignSort("amountRaised")} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${campaignSort === "amountRaised" ? "bg-yellow-400/20 text-yellow-400" : "text-gray-500 hover:text-gray-300"}`}>
              <TrendingUp className="h-3 w-3" /> Most Funded
            </button>
            <button onClick={() => setCampaignSort("donorCount")} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${campaignSort === "donorCount" ? "bg-yellow-400/20 text-yellow-400" : "text-gray-500 hover:text-gray-300"}`}>
              <Users className="h-3 w-3" /> Most Donors
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : tab === "campaigns" ? (
          campaigns.length === 0 ? <EmptyState /> : (
            <div className="space-y-2">
              {campaigns.map((c) => (
                <Link key={c.id} href={`/campaigns/${c.id}`}>
                  <div className={`flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-gray-800/60 ${c.rank <= 3 ? "border border-yellow-400/20 bg-yellow-400/5" : "border border-transparent"}`}>
                    <div className="w-10 text-center">
                      {c.rank <= 3 ? <span className="text-xl">{getRankBadge(c.rank)}</span> : <span className="text-sm font-bold text-gray-500">#{c.rank}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{c.title}</p>
                      <p className="text-xs text-gray-500">{shortenAddress(c.creator)}</p>
                      <ProgressBar value={c.progressPercent} className="mt-2" />
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-yellow-400 text-sm">{formatBNB(c.amountRaised)} BNB</p>
                      <p className="text-xs text-gray-500">{c.donorCount} donors</p>
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
                <div key={d.address} className={`flex items-center gap-4 rounded-xl p-4 ${d.rank <= 3 ? "border border-yellow-400/20 bg-yellow-400/5" : "border border-transparent"}`}>
                  <div className="w-10 text-center">
                    {d.rank <= 3 ? <span className="text-xl">{getRankBadge(d.rank)}</span> : <span className="text-sm font-bold text-gray-500">#{d.rank}</span>}
                  </div>
                  <div className="h-9 w-9 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-sm shrink-0">
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
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <Trophy className="mx-auto h-10 w-10 text-gray-700 mb-3" />
      <p className="text-gray-500 text-sm">No data yet</p>
    </div>
  );
}
