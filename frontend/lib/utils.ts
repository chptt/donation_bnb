import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { ethers } from "ethers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBNB(wei: bigint | string | number, decimals = 4): string {
  try {
    const val = typeof wei === "bigint" ? wei : BigInt(wei.toString());
    const bnb = parseFloat(ethers.formatEther(val));
    return bnb.toFixed(decimals);
  } catch {
    return "0.0000";
  }
}

export function weiToBNB(wei: bigint | string): number {
  try {
    return parseFloat(ethers.formatEther(typeof wei === "bigint" ? wei : BigInt(wei)));
  } catch {
    return 0;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatDate(ts: number | string | Date): string {
  const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
  return format(d, "MMM d, yyyy");
}

export function timeAgo(ts: number | string | Date): string {
  const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isExpired(deadline: number): boolean {
  return Date.now() / 1000 > deadline;
}

export function daysLeft(deadline: number): number {
  const diff = deadline - Date.now() / 1000;
  return Math.max(0, Math.ceil(diff / 86400));
}

export function progressPercent(raised: bigint, target: bigint): number {
  if (target === 0n) return 0;
  return Math.min(100, Math.round(Number((raised * 100n) / target)));
}

export function getRankBadge(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export function truncateTx(hash: string): string {
  if (!hash) return "";
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
