import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase/config";

export function useFirestoreVotes(user) {
  const [voteResults, setVoteResults] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recentVotes, setRecentVotes] = useState([]);

  // Real-time listener for vote tallies
  useEffect(() => {
    const resultsRef = collection(db, "election_results");
    const unsubscribe = onSnapshot(resultsRef, (snapshot) => {
      const results = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setVoteResults(results.sort((a, b) => b.votes - a.votes));
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for recent votes feed
  useEffect(() => {
    const votesRef = collection(db, "votes");
    const q = query(votesRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const votes = snapshot.docs.slice(0, 10).map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setRecentVotes(votes);
    });
    return () => unsubscribe();
  }, []);

  // Check if current user has voted
  useEffect(() => {
    if (!user) return;
    const checkVoted = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setHasVoted(snap.data().hasVoted || false);
      }
    };
    checkVoted();
  }, [user]);

  const castVote = useCallback(
    async (partyName, partySymbol) => {
      if (!user) throw new Error("Please sign in to vote");
      if (hasVoted) throw new Error("You have already voted");

      setIsSubmitting(true);
      setError(null);

      try {
        // 1. Record the vote in votes collection
        await addDoc(collection(db, "votes"), {
          userId: user.uid,
          userEmail: user.email,
          party: partyName,
          symbol: partySymbol,
          timestamp: serverTimestamp(),
        });

        // 2. Update tally in election_results
        const resultRef = doc(db, "election_results", partyName);
        const resultSnap = await getDoc(resultRef);
        if (resultSnap.exists()) {
          await updateDoc(resultRef, { votes: increment(1) });
        } else {
          await setDoc(resultRef, {
            party: partyName,
            symbol: partySymbol,
            votes: 1,
          });
        }

        // 3. Mark user as voted
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { hasVoted: true, votedFor: partyName });

        setHasVoted(true);
      } catch (e) {
        setError(e.message);
        throw e;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, hasVoted]
  );

  return {
    voteResults,
    hasVoted,
    isSubmitting,
    error,
    recentVotes,
    castVote,
  };
}
