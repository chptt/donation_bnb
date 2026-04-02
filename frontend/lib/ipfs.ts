import { IPFS_GATEWAY } from "./constants";

const PINATA_API = "https://api.pinata.cloud";

/** Build auth headers — supports both JWT and legacy API key/secret */
function pinataHeaders(includeContentType = false): Record<string, string> {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
  const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

  if (!jwt && (!apiKey || !secretKey)) {
    throw new Error(
      "Pinata credentials not configured. Set NEXT_PUBLIC_PINATA_JWT or NEXT_PUBLIC_PINATA_API_KEY + NEXT_PUBLIC_PINATA_SECRET_KEY in .env.local"
    );
  }

  const headers: Record<string, string> = {};
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  } else {
    headers["pinata_api_key"] = apiKey!;
    headers["pinata_secret_api_key"] = secretKey!;
  }
  if (includeContentType) headers["Content-Type"] = "application/json";
  return headers;
}

/** Campaign metadata shape stored on IPFS */
export interface CampaignIPFSMetadata {
  title: string;
  description: string;
  story?: string;
  category: string;
  image: string; // ipfs:// URI or empty string
  creator_name?: string;
  created_at: string; // ISO timestamp
  version: "1.0";
}

/** Build a metadata object ready for IPFS upload */
export function buildCampaignMetadata(
  fields: Omit<CampaignIPFSMetadata, "created_at" | "version">
): CampaignIPFSMetadata {
  return {
    ...fields,
    created_at: new Date().toISOString(),
    version: "1.0",
  };
}

/**
 * Upload an image file to IPFS via Pinata.
 * Returns the IPFS URI: ipfs://<CID>
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: `chaingive-image-${Date.now()}` })
  );
  formData.append(
    "pinataOptions",
    JSON.stringify({ cidVersion: 1 })
  );

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: pinataHeaders(), // no Content-Type — let browser set multipart boundary
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata image upload failed: ${err}`);
  }

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
}

/**
 * Upload JSON metadata to IPFS via Pinata.
 * Returns the IPFS URI: ipfs://<CID>
 */
export async function uploadMetadataToIPFS(metadata: object): Promise<string> {
  const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: pinataHeaders(true),
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: `chaingive-campaign-${Date.now()}` },
      pinataOptions: { cidVersion: 1 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata JSON upload failed: ${err}`);
  }

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
}

/**
 * Upload image (if provided) then metadata to IPFS.
 * Returns the metadata IPFS URI: ipfs://<CID>
 */
export async function uploadCampaignToIPFS(
  fields: Omit<CampaignIPFSMetadata, "created_at" | "version" | "image">,
  imageFile?: File | null
): Promise<string> {
  let imageURI = "";

  if (imageFile) {
    imageURI = await uploadImageToIPFS(imageFile);
  }

  const metadata = buildCampaignMetadata({ ...fields, image: imageURI });
  return uploadMetadataToIPFS(metadata);
}

/**
 * Fetch JSON metadata from an IPFS URI.
 */
export async function fetchMetadata(uri: string): Promise<CampaignIPFSMetadata> {
  const url = resolveIPFS(uri);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch IPFS metadata: ${uri}`);
  return res.json();
}

/**
 * Convert ipfs:// URI to a public HTTP gateway URL.
 */
export function resolveIPFS(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return `${IPFS_GATEWAY}${uri.slice(7)}`;
  }
  if (uri.startsWith("http")) return uri;
  return `${IPFS_GATEWAY}${uri}`;
}
