import { useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth || !auth.onAuthStateChanged) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && db) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);
          const userWithProfile = Object.assign(Object.create(Object.getPrototypeOf(firebaseUser)), firebaseUser);
          userWithProfile.profile = snap.exists() ? snap.data() : {};
          setUser(userWithProfile);
        } catch (e) {
          console.error("Error fetching user profile:", e);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createOrUpdateUserDoc(result.user);
      return result.user;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const signInWithEmail = async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const registerWithEmail = async (email, password, displayName) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await createOrUpdateUserDoc(result.user, { displayName });
      return result.user;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const createOrUpdateUserDoc = async (firebaseUser, extra = {}) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || extra.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        hasVoted: false,
        quizScores: [],
      });
    } else {
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logout,
  };
}
