import { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { useVoting } from "../hooks/useVoting";

const PARTIES = [
  { name: "Indian National Congress", symbol: "✋", color: "#00BFFF", candidateId: 1 },
  { name: "Bharatiya Janata Party",  symbol: "🪷", color: "#FF9933", candidateId: 2 },
  { name: "Aam Aadmi Party",          symbol: "🧹", color: "#0000FF", candidateId: 3 },
  { name: "Bahujan Samaj Party",       symbol: "🐘", color: "#000080", candidateId: 4 },
  { name: "NOTA",                      symbol: "🚫", color: "#555",   candidateId: 5 },
];

const ELECTION_ID = 1; // Set to your deployed election ID

export default function VotingPanel() {
  const { account, signer, provider, error: walletError, loading, connect } = useWallet();
  const { castVoteRelay, getResults, txHash, txStatus, isSubmitting } = useVoting(signer, provider);

  const [selected, setSelected]   = useState(null);
  const [results, setResults]     = useState([]);
  const [hasVotedAlready, setHasVotedAlready] = useState(false);

  // Load results on mount and after vote
  useEffect(() => {
    const load = async () => {
      if (provider) {
        const res = await getResults(ELECTION_ID);
        setResults(res);
      }
    };
    load();
    const interval = setInterval(load, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [provider, getResults]);

  const handleVote = async () => {
    if (!selected) return;
    try {
      await castVoteRelay(ELECTION_ID, selected.candidateId);
      setHasVotedAlready(true);
      // Refresh results
      const res = await getResults(ELECTION_ID);
      setResults(res);
    } catch (e) {
      alert(`Vote failed: ${e.message}`);
    }
  };

  return (
    <section id="blockchain" className="blockchain-section">
      <div className="section-tag">Decentralised Voting</div>
      <h2 className="section-title">Cast Your Vote on Blockchain</h2>
      <p className="section-sub">Your vote is recorded permanently on Polygon. One wallet = one vote.</p>

      {/* Wallet connection */}
      {!account ? (
        <div className="bc-connect-prompt">
          <button className="btn-primary" onClick={connect} disabled={loading}>
            {loading ? "Connecting..." : "🦊 Connect MetaMask to Vote"}
          </button>
          {walletError && <p className="error-msg">{walletError}</p>}
        </div>
      ) : (
        <div className="bc-voting-layout">

          {/* Vote Panel */}
          <div className="bc-vote-panel">
            <div className="bc-wallet-info">
              ✅ Connected: <code>{account.slice(0,6)}...{account.slice(-4)}</code>
            </div>

            {!hasVotedAlready ? (
              <>
                <h3>Select Your Candidate</h3>
                <div className="bc-candidates">
                  {PARTIES.map((p) => (
                    <div
                      key={p.name}
                      className={`bc-candidate ${selected?.name === p.name ? "selected" : ""}`}
                      style={{ borderColor: selected?.name === p.name ? p.color : "rgba(255,255,255,0.1)" }}
                      onClick={() => setSelected(p)}
                    >
                      <span className="bc-symbol">{p.symbol}</span>
                      <span className="bc-pname">{p.name}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="btn-primary"
                  onClick={handleVote}
                  disabled={!selected || isSubmitting}
                  style={{ marginTop: '20px' }}
                >
                  {isSubmitting ? "⏳ Submitting to blockchain..." : "Cast Vote 🔒"}
                </button>
              </>
            ) : (
              <div className="bc-success">
                <div>✅ Vote recorded on Polygon!</div>
                {txHash && (
                  <a href={`https://mumbai.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="scan-link">
                    View on Polygonscan →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Live Results */}
          <div className="bc-results-panel">
            <h3>Live Results (On-Chain)</h3>
            <div className="results-list">
              {results.length > 0 ? results.map((r) => {
                const total = results.reduce((s, x) => s + x.votes, 0) || 1;
                const pct = ((r.votes / total) * 100).toFixed(1);
                return (
                  <div key={r.id} className="bc-result-row">
                    <div className="result-label">
                      <span>{r.name}</span>
                      <span>{r.votes} ({pct}%)</span>
                    </div>
                    <div className="bc-result-bar">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: "var(--saffron, #FF9933)" }} />
                    </div>
                  </div>
                );
              }) : <p className="no-data">Deploy contract and add candidates to see results.</p>}
            </div>
            <div className="bc-chain-note">
              ⛓️ Data sourced directly from Polygon smart contract
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
