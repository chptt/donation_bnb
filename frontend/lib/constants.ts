export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const OPBNB_TESTNET_RPC =
  process.env.NEXT_PUBLIC_OPBNB_TESTNET_RPC ||
  "https://opbnb-testnet-rpc.bnbchain.org";

// Alias used by contract.ts
export const BSC_TESTNET_RPC = OPBNB_TESTNET_RPC;

export const BSC_TESTNET = {
  chainId: "0x15EB",        // 5611 decimal
  chainIdDecimal: 5611,
  chainName: "opBNB Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: [OPBNB_TESTNET_RPC],
  blockExplorerUrls: [
    process.env.NEXT_PUBLIC_BLOCK_EXPLORER || "https://testnet.opbnbscan.com",
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
