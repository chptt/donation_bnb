import Link from "next/link";
import Image from "next/image";
import { Campaign } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { formatBNB, daysLeft, isExpired, shortenAddress } from "@/lib/utils";
import { Users, Clock } from "lucide-react";

interface Props {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: Props) {
  const expired = isExpired(campaign.deadline);
  const days = daysLeft(campaign.deadline);

  const statusVariant =
    campaign.status === "active" ? "success" :
    campaign.status === "goal_reached" ? "warning" : "default";

  return (
    <Link href={`/campaigns/${campaign.id}`} className="group block">
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">
        <div className="relative h-48 bg-gray-800 overflow-hidden">
          <Image
            src={campaign.image || "/placeholder-campaign.jpg"}
            alt={campaign.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-campaign.jpg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge variant={statusVariant} className="capitalize">
              {campaign.status === "goal_reached" ? "Goal Reached" : campaign.status}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <span className="rounded-full bg-gray-900/80 px-2 py-0.5 text-xs text-gray-300 capitalize">
              {campaign.category}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-white line-clamp-1 group-hover:text-yellow-400 transition-colors">
              {campaign.title}
            </h3>
            <p className="mt-1 text-sm text-gray-400 line-clamp-2">{campaign.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
              {(campaign.creatorName || campaign.creator)[0].toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">
              {campaign.creatorName || shortenAddress(campaign.creator)}
            </span>
          </div>

          <ProgressBar value={campaign.progressPercent} />

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-semibold text-white">{formatBNB(campaign.amountRaised)} BNB</p>
              <p className="text-xs text-gray-500">of {formatBNB(campaign.targetAmount)} BNB</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">{campaign.progressPercent}%</p>
              <p className="text-xs text-gray-500">funded</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-800">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {campaign.donorCount} donors
            </span>
            <span className={`flex items-center gap-1 ${expired ? "text-red-400" : "text-gray-400"}`}>
              <Clock className="h-3 w-3" />
              {expired ? "Ended" : `${days}d left`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
