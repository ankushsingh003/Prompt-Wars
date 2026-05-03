const { ethers } = require("ethers");
// Use a placeholder if the file doesn't exist yet (it will be created by deploy script)
let contractData;
try {
  contractData = require("../../voteiq-app/src/contracts/VotingContract.json");
} catch (e) {
  contractData = { address: "0x0000000000000000000000000000000000000000", abi: [] };
}

// Provider: read-only connection to Polygon
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL || "https://rpc-mumbai.maticvigil.com");

// Signer: backend wallet (for relaying gas)
const relayerKey = process.env.RELAYER_PRIVATE_KEY;
const isValidRelayerKey = relayerKey && relayerKey.startsWith("0x") && relayerKey.length === 66;

const relayerWallet = isValidRelayerKey 
  ? new ethers.Wallet(relayerKey, provider)
  : null;

if (!isValidRelayerKey) {
  console.warn("⚠️ RELAYER_PRIVATE_KEY is invalid or a placeholder. Secure voting relay is disabled.");
}

// Contract instances
const contractRead  = new ethers.Contract(contractData.address, contractData.abi, provider);
const contractWrite = relayerWallet 
  ? new ethers.Contract(contractData.address, contractData.abi, relayerWallet)
  : null;

module.exports = {
  // Get all results for an election
  getResults: async (electionId) => {
    try {
      if (!contractRead.getResults) return [];
      const [ids, names, votes] = await contractRead.getResults(electionId);
      return ids.map((id, i) => ({
        id: id.toString(),
        name: names[i],
        votes: votes[i].toString()
      }));
    } catch (e) {
      console.error("Error fetching results:", e);
      return [];
    }
  },

  // Relay a vote on behalf of voter (meta-transaction pattern)
  relayVote: async (electionId, candidateId, voterAddress, signature) => {
    if (!contractWrite) throw new Error("Relayer wallet not configured");

    // Verify voter signed the payload themselves
    const msgHash = ethers.solidityPackedKeccak256(
      ["uint256", "uint256", "address"],
      [electionId, candidateId, voterAddress]
    );
    const recovered = ethers.recoverAddress(ethers.hashMessage(ethers.getBytes(msgHash)), signature);
    if (recovered.toLowerCase() !== voterAddress.toLowerCase()) {
      throw new Error("Invalid signature");
    }

    // Relay the tx (backend pays gas)
    const tx = await contractWrite.castVote(electionId, candidateId, {
      gasLimit: 300000
    });
    await tx.wait();
    return tx.hash;
  },

  // Check if an address has voted (calling the public mapping getter)
  hasVoted: async (electionId, address) => {
    try {
      if (typeof contractRead.hasVoted !== "function") {
        console.warn("⚠️ hasVoted mapping not found in ABI");
        return false;
      }
      return await contractRead.hasVoted(electionId, address);
    } catch (e) {
      console.error("Error checking hasVoted:", e.message);
      return false;
    }
  },

  // Subscribe to VoteCast events (real-time)
  listenToVotes: (electionId, callback) => {
    if (typeof contractRead.on === "function") {
      contractRead.on("VoteCast", (eid, voter, candidateId, timestamp) => {
        if (eid.toString() === electionId.toString()) {
          callback({ voter, candidateId: candidateId.toString(), timestamp: timestamp.toString() });
        }
      });
    }
  }
};
