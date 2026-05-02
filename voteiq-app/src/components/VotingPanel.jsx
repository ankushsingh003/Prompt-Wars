import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";
import { useVoting } from "../hooks/useVoting";

const PARTIES = [
  { name: "Indian National Congress", symbol: "✋", color: "#00BFFF", candidateId: 1 },
  { name: "Bharatiya Janata Party",   symbol: "🪷", color: "#FF9933", candidateId: 2 },
  { name: "Aam Aadmi Party",          symbol: "🧹", color: "#0000FF", candidateId: 3 },
  { name: "Bahujan Samaj Party",      symbol: "🐘", color: "#000080", candidateId: 4 },
  { name: "NOTA",                     symbol: "🚫", color: "#555",    candidateId: 5 },
];

const ELECTION_ID = 1;

export default function VotingPanel() {
  const { user, signInWithGoogle } = useAuth();
  const { account, signer, provider, error: walletError, loading, connect } = useWallet();
  const { castVoteRelay, getResults, txHash, isSubmitting } = useVoting(signer, provider);

  const [selected, setSelected]             = useState(null);
  const [results, setResults]               = useState([]);
  const [hasVotedAlready, setHasVotedAlready] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (provider) {
        const res = await getResults(ELECTION_ID);
        setResults(res);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [provider, getResults]);

  const handleVote = async () => {
    if (!selected || !user) return;
    try {
      const token = await user.getIdToken();
      await castVoteRelay(ELECTION_ID, selected.candidateId, token);
      setHasVotedAlready(true);
      const res = await getResults(ELECTION_ID);
      setResults(res);
    } catch (e) {
      alert(`Vote failed: ${e.message}`);
    }
  };

  return (
    <section id="secure-voting" aria-labelledby="secure-voting-title" className="blockchain-section">
      <div className="section-tag">Decentralised Voting</div>
      <h2 id="secure-voting-title" className="section-title">Cast Your Secure Vote</h2>
      <p className="section-sub">
        Your vote is recorded permanently on Polygon. One wallet = one vote.
      </p>

      {!user ? (
        <div className="bc-connect-prompt">
          <button
            aria-label="Sign in with Google to verify identity before voting"
            className="btn-primary"
            onClick={signInWithGoogle}
          >
            🔑 Step 1: Sign in with Google
          </button>
          <p style={{ marginTop: "10px", fontSize: "12px", color: "var(--ink-3)" }}>
            Sign in to verify your identity before voting.
          </p>
        </div>
      ) : !account ? (
        <div className="bc-connect-prompt">
          <p style={{ marginBottom: "15px", fontSize: "14px" }}>
            👋 Hello, <strong>{user.displayName}</strong>!
          </p>
          <button
            aria-label="Connect MetaMask wallet to proceed with voting"
            className="btn-primary"
            onClick={connect}
            disabled={loading}
          >
            {loading ? "Connecting…" : "🦊 Step 2: Connect MetaMask"}
          </button>
          {walletError && <p className="error-msg" role="alert">{walletError}</p>}
        </div>
      ) : (
        <div className="bc-voting-layout">
          {/* Vote Panel */}
          <div className="bc-vote-panel">
            <div className="bc-wallet-info">
              ✅ Connected: <code>{account.slice(0, 6)}…{account.slice(-4)}</code>
            </div>

            {!hasVotedAlready ? (
              <>
                <h3 id="candidate-label" style={{ marginBottom: "16px", fontSize: "16px", fontWeight: 700 }}>
                  Select Your Candidate
                </h3>
                <div className="bc-candidates" role="radiogroup" aria-labelledby="candidate-label">
                  {PARTIES.map((p) => {
                    const isSelected = selected?.name === p.name;
                    return (
                      <button
                        key={p.name}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Vote for ${p.name}`}
                        className={`bc-candidate${isSelected ? " selected" : ""}`}
                        style={{
                          borderColor: isSelected ? p.color : "var(--border)",
                          background: isSelected ? `${p.color}18` : "var(--white)",
                        }}
                        onClick={() => setSelected(p)}
                      >
                        <span className="bc-symbol" aria-hidden="true">{p.symbol}</span>
                        <span className="bc-pname">{p.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn-primary"
                  onClick={handleVote}
                  disabled={!selected || isSubmitting}
                  style={{ marginTop: "20px", width: "100%" }}
                  aria-label={isSubmitting ? "Processing vote on blockchain" : selected ? `Cast vote for ${selected.name}` : "Select a candidate first"}
                >
                  {isSubmitting ? "⏳ Processing secure vote…" : "Cast Secure Vote 🔒"}
                </button>
              </>
            ) : (
              <div className="bc-success">
                <div role="status" aria-live="polite">✅ Vote recorded on Polygon!</div>
                {txHash && (
                  <a
                    href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="scan-link"
                    aria-label="View transaction on Polygonscan (opens in new tab)"
                  >
                    View on Polygonscan →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Live Results */}
          <div className="bc-results-panel" aria-labelledby="live-results-label">
            <h3 id="live-results-label">Live Results (On-Chain)</h3>
            <div className="results-list" role="list" aria-label="Party vote counts">
              {results.length > 0 ? (
                results.map((r) => {
                  const total = results.reduce((s, x) => s + x.votes, 0) || 1;
                  const pct = ((r.votes / total) * 100).toFixed(1);
                  return (
                    <div key={r.id} className="bc-result-row" role="listitem">
                      <div className="result-label">
                        <span>{r.name}</span>
                        <span>{r.votes} ({pct}%)</span>
                      </div>
                      <div
                        className="bc-result-bar"
                        role="progressbar"
                        aria-valuenow={parseFloat(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${r.name}: ${pct}%`}
                      >
                        <div className="bar-fill" style={{ width: `${pct}%`, background: "var(--saffron, #FF9933)" }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-data">Deploy contract and add candidates to see results.</p>
              )}
            </div>
            <div className="bc-chain-note">⛓️ Data sourced directly from Polygon smart contract</div>
          </div>
        </div>
      )}
    </section>
  );
}
