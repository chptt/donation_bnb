"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { getTotalDonatedBy, getDonatedCampaignIds, getCampaign, getCampaignDonations } from "@/lib/contract";
import { Campaign, Donation } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatBNB, shortenAddress, timeAgo } from "@/lib/utils";
import { BSC_TESTNET } from "@/lib/constants";
import { Wallet, History, Edit3, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { address, isConnected, connect } = useWallet();
  const { user, setDisplayName } = useAuth();

  const [totalDonated, setTotalDonated] = useState<bigint>(0n);
  const [donations, setDonations] = useState<{ campaign: Campaign; donation: Donation }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");

  useEffect(() => {
    if (address) fetchData();
    else setLoading(false);
  }, [address]);

  const fetchData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [donated, ids] = await Promise.all([
        getTotalDonatedBy(address),
        getDonatedCampaignIds(address),
      ]);
      setTotalDonated(donated);

      // Get donations per campaign
      const results: { campaign: Campaign; donation: Donation }[] = [];
      for (const id of ids.slice(0, 10)) {
        const [campaign, campaignDonations] = await Promise.all([
          getCampaign(id),
          getCampaignDonations(id),
        ]);
        const myDonations = campaignDonations.filter(
          (d) => d.donor.toLowerCase() === address.toLowerCase()
        );
        for (const d of myDonations) {
          results.push({ campaign, donation: d });
        }
      }
      results.sort((a, b) => b.donation.timestamp - a.donation.timestamp);
      setDonations(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    setDisplayName(nameInput.trim());
    setEditing(false);
    toast.success("Display name updated");
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Connect your wallet to view your profile</p>
          <Button onClick={connect}>Connect Wallet</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="h-20 w-20 mx-auto rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-3xl font-bold">
                {(user?.name || address || "?")[0].toUpperCase()}
              </div>

              {editing ? (
                <div className="space-y-2">
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Display name"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button size="sm" className="flex-1" onClick={handleSaveName}>Save</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-lg font-bold text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{shortenAddress(address!)}</p>
                    <Badge variant="info" className="mt-2 capitalize">{user?.role || "donor"}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setNameInput(user?.name || ""); setEditing(true); }}>
                    <Edit3 className="h-3.5 w-3.5" /> Edit Display Name
                  </Button>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{formatBNB(totalDonated)}</p>
                  <p className="text-xs text-gray-500">BNB donated</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{donations.length}</p>
                  <p className="text-xs text-gray-500">donations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-yellow-400" /> Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Connected</span>
                </div>
                <p className="text-xs text-gray-400 font-mono break-all">{address}</p>
                <a
                  href={`${BSC_TESTNET.blockExplorerUrls[0]}/address/${address}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:underline"
                >
                  View on BscScan <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation history */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-yellow-400" />
                <CardTitle className="text-base">Donation History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-gray-800 animate-pulse" />
                  ))}
                </div>
              ) : donations.length === 0 ? (
                <div className="py-10 text-center">
                  <History className="mx-auto h-8 w-8 text-gray-700 mb-2" />
                  <p className="text-gray-500 text-sm">No donations yet</p>
                  <Link href="/explore" className="mt-3 inline-block text-xs text-yellow-400 hover:underline">
                    Explore campaigns
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map(({ campaign, donation }, i) => (
                    <Link key={i} href={`/campaigns/${campaign.id}`}>
                      <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/40 p-4 hover:border-gray-700 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{campaign.title}</p>
                          <span className="text-xs text-gray-500">
                            {timeAgo(new Date(donation.timestamp * 1000).toISOString())}
                          </span>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="font-semibold text-yellow-400 text-sm">{formatBNB(donation.amount)} BNB</p>
                          <Badge variant="success" className="text-xs">confirmed</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
