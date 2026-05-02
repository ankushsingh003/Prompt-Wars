import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase/config";

export function useFirestoreQuiz(user) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userBestScore, setUserBestScore] = useState(null);

  // Fetch leaderboard top 10
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const q = query(
        collection(db, "quiz_scores"),
        orderBy("score", "desc"),
        limit(10)
      );
      const snap = await getDocs(q);
      setLeaderboard(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchLeaderboard();
  }, []);

  const saveScore = useCallback(
    async (score, total) => {
      if (!user) return;
      try {
        const entry = {
          userId: user.uid,
          displayName: user.displayName || user.email,
          score,
          total,
          percentage: Math.round((score / total) * 100),
          timestamp: serverTimestamp(),
        };

        // Save score to quiz_scores collection
        await addDoc(collection(db, "quiz_scores"), entry);

        // Update user profile with score history
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          quizScores: arrayUnion({ score, total, timestamp: new Date().toISOString() }),
        });

        if (!userBestScore || score > userBestScore) {
          setUserBestScore(score);
        }
      } catch (e) {
        console.error("Failed to save score:", e);
      }
    },
    [user, userBestScore]
  );

  return { leaderboard, userBestScore, saveScore };
}
