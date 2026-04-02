import { useState, useEffect } from "react";
import { fetchMetadata, CampaignIPFSMetadata } from "@/lib/ipfs";

const cache = new Map<string, CampaignIPFSMetadata>();

/**
 * Hook to fetch and cache IPFS metadata from a URI.
 * Returns { data, loading, error }
 */
export function useIPFSMetadata(uri: string | null | undefined) {
  const [data, setData] = useState<CampaignIPFSMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uri || !uri.startsWith("ipfs://")) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cache
    if (cache.has(uri)) {
      setData(cache.get(uri)!);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchMetadata(uri)
      .then((metadata) => {
        cache.set(uri, metadata);
        setData(metadata);
        setError(null);
      })
      .catch((err) => {
        console.error("IPFS fetch error:", err);
        setError(err.message || "Failed to fetch metadata");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [uri]);

  return { data, loading, error };
}
