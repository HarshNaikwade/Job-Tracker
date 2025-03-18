import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAa_3ecFLXt9A8aDAAFVqV-Fr1ToMWUAYM",
  authDomain: "job-tracker-5e121.firebaseapp.com",
  projectId: "job-tracker-5e121",
  storageBucket: "job-tracker-5e121.firebasestorage.app",
  messagingSenderId: "265696793940",
  appId: "1:265696793940:web:e32497acf00129939724c1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set up providers for Google sign-in
const provider = new GoogleAuthProvider();

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  provider,
};
