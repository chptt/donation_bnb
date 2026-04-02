import { Donation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { timeAgo, formatBNB, shortenAddress, truncateTxHash } from "@/lib/utils";
import { Activity, ExternalLink } from "lucide-react";
import { BSC_TESTNET } from "@/lib/constants";

interface Props {
  donations: Donation[];
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
            {donations.map((d) => {
              const campaign = typeof d.campaign === "object" ? d.campaign : null;
              const donor = d.donor;
              return (
                <div key={d._id} className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-800/40 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs font-bold shrink-0">
                    {donor?.name?.[0]?.toUpperCase() || d.walletAddress[2].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{donor?.name || shortenAddress(d.walletAddress)}</span>
                      <span className="text-gray-400"> donated </span>
                      <span className="font-medium text-yellow-400">{formatBNB(d.amount)} BNB</span>
                    </p>
                    {campaign && (
                      <p className="text-xs text-gray-500 truncate">to {campaign.title}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">{timeAgo(d.donatedAt)}</span>
                      <a
                        href={`${BSC_TESTNET.blockExplorerUrls[0]}/tx/${d.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs text-gray-600 hover:text-yellow-400 transition-colors"
                      >
                        {truncateTxHash(d.txHash)} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5">confirmed</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
