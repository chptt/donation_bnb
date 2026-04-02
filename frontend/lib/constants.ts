export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const BSC_TESTNET_RPC =
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC ||
  "https://data-seed-prebsc-1-s1.binance.org:8545/";

export const BSC_TESTNET = {
  chainId: "0x61",
  chainIdDecimal: 97,
  chainName: "BNB Smart Chain Testnet",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: [
    process.env.NEXT_PUBLIC_BSC_TESTNET_RPC ||
      "https://data-seed-prebsc-1-s1.binance.org:8545/",
  ],
  blockExplorerUrls: [
    process.env.NEXT_PUBLIC_BLOCK_EXPLORER || "https://testnet.bscscan.com",
  ],
};

export const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
  "https://gateway.pinata.cloud/ipfs/";

export const CATEGORIES = [
  { value: "education",    label: "Education" },
  { value: "health",       label: "Health" },
  { value: "environment",  label: "Environment" },
  { value: "arts",         label: "Arts & Culture" },
  { value: "community",    label: "Community" },
  { value: "technology",   label: "Technology" },
  { value: "other",        label: "Other" },
];

export const SORT_OPTIONS = [
  { value: "newest",      label: "Newest First" },
  { value: "oldest",      label: "Oldest First" },
  { value: "most_funded", label: "Most Funded" },
  { value: "ending_soon", label: "Ending Soon" },
  { value: "most_donors", label: "Most Donors" },
];
