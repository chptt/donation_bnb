import { useMemo } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import ChainGiveABI from "@/lib/contracts/ChainGive.json";
import { CONTRACT_ADDRESS } from "@/lib/constants";

export function useContract(withSigner = false) {
  const { signer, provider } = useWallet();

  return useMemo(() => {
    const address = ChainGiveABI.address || CONTRACT_ADDRESS;
    if (!address) return null;
    if (withSigner && signer) return new ethers.Contract(address, ChainGiveABI.abi, signer);
    if (provider) return new ethers.Contract(address, ChainGiveABI.abi, provider);
    // Fallback: read-only with public RPC
    const fallback = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_BSC_TESTNET_RPC ||
        "https://data-seed-prebsc-1-s1.binance.org:8545/"
    );
    return new ethers.Contract(address, ChainGiveABI.abi, fallback);
  }, [signer, provider, withSigner]);
}
