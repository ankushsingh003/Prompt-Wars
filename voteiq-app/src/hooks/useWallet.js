import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

const POLYGON_MUMBAI = {
  chainId: "0x13881",
  chainName: "Mumbai Testnet",
  rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  blockExplorerUrls: ["https://mumbai.polygonscan.com"]
};

export function useWallet() {
  const [account, setAccount]   = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner]     = useState(null);
  const [network, setNetwork]   = useState(null);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Robust detection: check window.ethereum directly first
      let ethProvider = window.ethereum;
      
      if (!ethProvider) {
        ethProvider = await detectEthereumProvider();
      }

      if (!ethProvider) throw new Error("MetaMask not detected! Please ensure the extension is enabled and refresh the page.");

      const web3Provider = new BrowserProvider(ethProvider);

      // Request accounts
      await web3Provider.send("eth_requestAccounts", []);

      // Switch to Polygon Mumbai
      try {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: POLYGON_MUMBAI.chainId }] });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({ method: "wallet_addEthereumChain", params: [POLYGON_MUMBAI] });
        }
      }

      const signer  = await web3Provider.getSigner();
      const address = await signer.getAddress();
      const net     = await web3Provider.getNetwork();

      setAccount(address);
      setProvider(web3Provider);
      setSigner(signer);
      setNetwork(net.name);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for account / network changes
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on("accountsChanged", (accs) => setAccount(accs[0] || null));
    window.ethereum.on("chainChanged", () => window.location.reload());
    return () => window.ethereum.removeAllListeners();
  }, []);

  return { account, provider, signer, network, error, loading, connect };
}
