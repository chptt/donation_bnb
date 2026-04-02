/**
 * Direct contract + IPFS data layer — no backend required.
 * All reads come from the BNB Chain smart contract and IPFS.
 */
import { ethers } from "ethers";
import ChainGiveABI from "@/lib/contracts/ChainGive.json";
import { CONTRACT_ADDRESS, BSC_TESTNET_RPC } from "@/lib/constants";
import { fetchMetadata, resolveIPFS } from "@/lib/ipfs";
import { Campaign, ChainCampaign, ChainDonation, Donation } from "@/types";

// ─── Provider ────────────────────────────────────────────────────────────────

function getProvider() {
  return new ethers.JsonRpcProvider(BSC_TESTNET_RPC);
}

function getContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const address = (ChainGiveABI as { address?: string }).address || CONTRACT_ADDRESS;
  const p = signerOrProvider ?? getProvider();
  return new ethers.Contract(address, ChainGiveABI.abi, p);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeStatus(c: ChainCampaign): Campaign["status"] {
  const now = Math.floor(Date.now() / 1000);
  if (!c.isActive || Number(c.deadline) < now) return "ended";
  if (c.amountRaised >= c.targetAmount) return "goal_reached";
  return "active";
}

function computeProgress(raised: bigint, target: bigint): number {
  if (target === 0n) return 0;
  return Math.min(100, Math.round(Number((raised * 10000n) / target) / 100));
}

/** Enrich a raw chain campaign with IPFS metadata */
async function enrichCampaign(raw: ChainCampaign): Promise<Campaign> {
  let title = `Campaign #${raw.id}`;
  let description = "";
  let story = "";
  let category = "other";
  let image = "/placeholder-campaign.jpg";
  let creatorName: string | undefined;

  try {
    const meta = await fetchMetadata(raw.metadataURI);
    title = meta.title || title;
    description = meta.description || "";
    story = meta.story || "";
    category = meta.category || "other";
    image = meta.image ? resolveIPFS(meta.image) : "/placeholder-campaign.jpg";
    creatorName = meta.creator_name;
  } catch {
    // IPFS fetch failed — use defaults
  }

  return {
    id: Number(raw.id),
    creator: raw.creator,
    metadataURI: raw.metadataURI,
    targetAmount: raw.targetAmount,
    amountRaised: raw.amountRaised,
    deadline: Number(raw.deadline),
    isActive: raw.isActive,
    donorCount: Number(raw.donorCount),
    title,
    description,
    story,
    category,
    image,
    creatorName,
    progressPercent: computeProgress(raw.amountRaised, raw.targetAmount),
    status: computeStatus(raw),
  };
}

// ─── Campaign reads ───────────────────────────────────────────────────────────

export async function getAllCampaigns(): Promise<Campaign[]> {
  const contract = getContract();
  const raws: ChainCampaign[] = await contract.getAllCampaigns();
  // Enrich in parallel, filter out campaigns with no metadataURI
  const valid = raws.filter((c) => c.metadataURI && c.metadataURI.length > 0);
  return Promise.all(valid.map(enrichCampaign));
}

export async function getCampaign(id: number): Promise<Campaign> {
  const contract = getContract();
  const raw: ChainCampaign = await contract.getCampaign(id);
  return enrichCampaign(raw);
}

export async function getCampaignCount(): Promise<number> {
  const contract = getContract();
  const count: bigint = await contract.getCampaignCount();
  return Number(count);
}

export async function getCampaignsByCreator(address: string): Promise<Campaign[]> {
  const contract = getContract();
  const ids: bigint[] = await contract.getCampaignsByCreator(address);
  return Promise.all(ids.map((id) => getCampaign(Number(id))));
}

// ─── Donation reads ───────────────────────────────────────────────────────────

export async function getCampaignDonations(campaignId: number): Promise<Donation[]> {
  const contract = getContract();
  const raws: ChainDonation[] = await contract.getCampaignDonations(campaignId);
  return raws.map((d) => ({
    donor: d.donor,
    amount: d.amount,
    timestamp: Number(d.timestamp),
  }));
}

export async function getTotalDonatedBy(address: string): Promise<bigint> {
  const contract = getContract();
  return contract.getTotalDonatedBy(address);
}

export async function getDonatedCampaignIds(address: string): Promise<number[]> {
  const contract = getContract();
  try {
    const ids: bigint[] = await contract.getDonatedCampaigns(address);
    return ids.map(Number);
  } catch {
    return [];
  }
}

// ─── Write functions (require signer) ────────────────────────────────────────

export async function createCampaign(
  signer: ethers.Signer,
  metadataURI: string,
  targetWei: bigint,
  deadlineTs: number
): Promise<ethers.ContractTransactionResponse> {
  const contract = getContract(signer);
  return contract.createCampaign(metadataURI, targetWei, deadlineTs);
}

export async function donateToCampaign(
  signer: ethers.Signer,
  campaignId: number,
  amountWei: bigint
): Promise<ethers.ContractTransactionResponse> {
  const contract = getContract(signer);
  return contract.donateToCampaign(campaignId, { value: amountWei });
}

export async function deactivateCampaign(
  signer: ethers.Signer,
  campaignId: number
): Promise<ethers.ContractTransactionResponse> {
  const contract = getContract(signer);
  return contract.deactivateCampaign(campaignId);
}
