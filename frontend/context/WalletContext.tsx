"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ethers } from "ethers";
import { BSC_TESTNET } from "@/lib/constants";
import { toast } from "sonner";

interface WalletContextType {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  isConnected: false,
  isCorrectNetwork: false,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);

  const isConnected = !!address;
  const isCorrectNetwork = chainId === BSC_TESTNET.chainIdDecimal;

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_TESTNET.chainId }],
      });
    } catch (err: unknown) {
      // Chain not added yet — add it
      if ((err as { code: number }).code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BSC_TESTNET],
        });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not detected. Please install MetaMask.");
      return;
    }
    setConnecting(true);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();
      const _address = await _signer.getAddress();
      const network = await _provider.getNetwork();
      const _chainId = Number(network.chainId);

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
      setChainId(_chainId);

      if (_chainId !== BSC_TESTNET.chainIdDecimal) {
        toast.warning("Wrong network. Switching to BNB Testnet...");
        await switchNetwork();
      } else {
        toast.success("Wallet connected");
      }

      // Listen for account/chain changes
      window.ethereum.on("accountsChanged", (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs.length === 0) {
          setAddress(null);
          setSigner(null);
        } else {
          setAddress(accs[0]);
        }
      });

      window.ethereum.on("chainChanged", (newChainId: unknown) => {
        setChainId(parseInt(newChainId as string, 16));
        window.location.reload();
      });
    } catch (err) {
      toast.error("Failed to connect wallet");
      console.error(err);
    } finally {
      setConnecting(false);
    }
  }, [switchNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    toast.info("Wallet disconnected");
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, provider, signer, chainId, isConnected, isCorrectNetwork, connecting, connect, disconnect, switchNetwork }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
