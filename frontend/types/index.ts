// ─── On-chain raw structs ─────────────────────────────────────────────────────

export interface ChainCampaign {
  id: bigint;
  creator: string;
  metadataURI: string;
  targetAmount: bigint;
  amountRaised: bigint;
  deadline: bigint;
  isActive: boolean;
  donorCount: bigint;
}

export interface ChainDonation {
  donor: string;
  amount: bigint;
  timestamp: bigint;
}

// ─── IPFS metadata ────────────────────────────────────────────────────────────

export interface CampaignMetadata {
  title: string;
  description: string;
  story?: string;
  category: string;
  image: string; // ipfs:// URI
  creator_name?: string;
  created_at?: string;
  version?: string;
}

// ─── Enriched campaign (chain + IPFS) ────────────────────────────────────────

export interface Campaign {
  id: number;
  creator: string;           // wallet address
  metadataURI: string;       // ipfs:// URI
  targetAmount: bigint;
  amountRaised: bigint;
  deadline: number;          // unix timestamp
  isActive: boolean;
  donorCount: number;
  // from IPFS
  title: string;
  description: string;
  story?: string;
  category: string;
  image: string;             // resolved image URI
  creatorName?: string;
  // computed
  progressPercent: number;
  status: "active" | "goal_reached" | "ended";
}

export interface Donation {
  donor: string;             // wallet address
  amount: bigint;
  timestamp: number;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardCampaign extends Campaign {
  rank: number;
}

export interface LeaderboardDonor {
  rank: number;
  address: string;
  totalDonated: bigint;
  donationCount: number;
}

// ─── User (wallet-based, no backend) ─────────────────────────────────────────

export interface User {
  address: string;
  name: string;   // stored in localStorage
  role: "donor" | "creator";
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: bigint;
  totalDonors: number;
}

export interface TrendPoint {
  date: string;
  amount: number;
}
