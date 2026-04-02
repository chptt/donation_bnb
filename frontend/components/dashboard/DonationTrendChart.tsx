"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp } from "lucide-react";
import { ethers } from "ethers";

interface DonationPoint {
  timestamp: number;
  amount: bigint;
}

interface Props {
  donations: DonationPoint[];
}

export default function DonationTrendChart({ donations }: Props) {
  // Group by day (last 7 days)
  const now = Date.now();
  const days: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    days[key] = 0;
  }

  for (const d of donations) {
    const ts = d.timestamp * 1000;
    if (now - ts > 7 * 86400000) continue;
    const key = new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (key in days) {
      days[key] += parseFloat(ethers.formatEther(d.amount));
    }
  }

  const formatted = Object.entries(days).map(([date, amount]) => ({
    date,
    amount: parseFloat(amount.toFixed(4)),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-yellow-400" />
          <CardTitle>Donation Trend (7 days)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {formatted.every((d) => d.amount === 0) ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            No donation data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }}
                labelStyle={{ color: "#9ca3af" }}
                formatter={(value: unknown) => [`${value} BNB`, "Amount"]}
              />
              <Area type="monotone" dataKey="amount" stroke="#facc15" strokeWidth={2} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
