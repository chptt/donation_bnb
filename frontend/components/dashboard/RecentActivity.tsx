import { Donation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatBNB, shortenAddress } from "@/lib/utils";
import { Activity } from "lucide-react";
import { ethers } from "ethers";

interface EnrichedDonation {
  donor: string;
  amount: bigint;
  timestamp: number;
  campaignTitle?: string;
}

interface Props {
  donations: EnrichedDonation[];
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RecentActivity({ donations }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-yellow-400" />
          <CardTitle>Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {donations.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">No activity yet</div>
        ) : (
          <div className="space-y-3">
            {donations.map((d, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-800/40 transition-colors">
                <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs font-bold shrink-0">
                  {d.donor[2].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-medium">{shortenAddress(d.donor)}</span>
                    <span className="text-gray-400"> donated </span>
                    <span className="font-medium text-yellow-400">{formatBNB(d.amount)} BNB</span>
                  </p>
                  {d.campaignTitle && (
                    <p className="text-xs text-gray-500 truncate">to {d.campaignTitle}</p>
                  )}
                  <span className="text-xs text-gray-600">{timeAgo(d.timestamp)}</span>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5 shrink-0">
                  confirmed
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
