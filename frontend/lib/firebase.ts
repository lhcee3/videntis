import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getFirestore(app)

// Auth helpers
export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())
export const logOut = () => signOut(auth)

// Watchlist helpers
export async function getWatchlist(userId: string): Promise<string[]> {
  const ref = doc(db, "users", userId)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data().watchlist || []) : []
}

export async function addToWatchlist(userId: string, ticker: string) {
  const ref = doc(db, "users", userId)
  await setDoc(ref, { watchlist: arrayUnion(ticker) }, { merge: true })
}

export async function removeFromWatchlist(userId: string, ticker: string) {
  const ref = doc(db, "users", userId)
  await updateDoc(ref, { watchlist: arrayRemove(ticker) })
}

// Prediction history (for accuracy tracking)
export async function savePrediction(ticker: string, predictedPrice: number) {
  const today = new Date().toISOString().split("T")[0]
  const ref = doc(db, "predictions", `${ticker}_${today}`)
  await setDoc(ref, {
    ticker,
    predicted_at: today,
    predicted_price: predictedPrice,
    actual_price: null,
    created_at: new Date(),
  }, { merge: true })
}

// Portfolio helpers
export interface Holding {
  ticker: string
  shares: number
  buyPrice: number
  addedAt: string
}

export async function getPortfolio(userId: string): Promise<Holding[]> {
  const ref = collection(db, "users", userId, "portfolio")
  const snap = await getDocs(ref)
  return snap.docs.map(d => d.data() as Holding)
}

export async function saveHolding(userId: string, holding: Holding) {
  const ref = doc(db, "users", userId, "portfolio", holding.ticker)
  await setDoc(ref, holding)
}

export async function removeHolding(userId: string, ticker: string) {
  const ref = doc(db, "users", userId, "portfolio", ticker)
  await deleteDoc(ref)
}
