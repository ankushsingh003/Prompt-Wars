import { useState, useCallback } from "react";
import { Contract, solidityPackedKeccak256 } from "ethers";
import axios from "axios";
// Import contract data if it exists, otherwise use empty object
let contractData;
try {
  contractData = require("../contracts/VotingContract.json");
} catch (e) {
  contractData = { address: "0x0000000000000000000000000000000000000000", abi: [] };
}

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useVoting(signer, provider) {
  const [txHash, setTxHash]       = useState(null);
  const [txStatus, setTxStatus]   = useState(null); // "pending" | "success" | "error"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OPTION A: Direct tx — voter pays gas (simple, requires MATIC)
  const castVoteDirect = useCallback(async (electionId, candidateId) => {
    if (!signer) throw new Error("Wallet not connected");
    setIsSubmitting(true); setTxStatus("pending");
    try {
      const contract = new Contract(contractData.address, contractData.abi, signer);
      const tx = await contract.castVote(electionId, candidateId);
      setTxHash(tx.hash);
      await tx.wait(); // Wait for confirmation
      setTxStatus("success");
      return tx.hash;
    } catch (e) {
      setTxStatus("error");
      throw e;
    } finally { setIsSubmitting(false); }
  }, [signer]);

  // OPTION B: Meta-tx relay — backend pays gas (better UX, voter needs no MATIC)
  const castVoteRelay = useCallback(async (electionId, candidateId, firebaseToken) => {
    if (!signer) throw new Error("Wallet not connected");
    if (!firebaseToken) throw new Error("Authentication required");
    setIsSubmitting(true); setTxStatus("pending");
    try {
      const voterAddress = await signer.getAddress();

      // Sign the vote payload (proves intent without submitting tx)
      const msgHash = solidityPackedKeccak256(
        ["uint256", "uint256", "address"],
        [electionId, candidateId, voterAddress]
      );
      const signature = await signer.signMessage(msgHash);

      // Send to backend for relay with Firebase Auth
      const { data } = await axios.post(`${API}/api/votes/cast`, {
        electionId, candidateId, voterAddress, signature, firebaseToken
      });

      setTxHash(data.txHash);
      setTxStatus("success");
      return data;
    } catch (e) {
      setTxStatus("error");
      throw e;
    } finally { setIsSubmitting(false); }
  }, [signer]);

  // Read live results from contract
  const getResults = useCallback(async (electionId) => {
    if (!provider || !contractData.address || contractData.address === "0x0000000000000000000000000000000000000000") return [];
    try {
      const contract = new Contract(contractData.address, contractData.abi, provider);
      const [ids, names, votes] = await contract.getResults(electionId);
      return ids.map((id, i) => ({
        id: id.toString(),
        name: names[i],
        votes: Number(votes[i])
      }));
    } catch (e) {
      console.error("Error fetching results:", e);
      return [];
    }
  }, [provider]);

  return { castVoteDirect, castVoteRelay, getResults, txHash, txStatus, isSubmitting };
}
