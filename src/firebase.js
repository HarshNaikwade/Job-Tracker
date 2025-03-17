// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, getDoc, doc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCDgAD5CT-Lyi-PwxPvF0Mpbmxp8q0gaY",
  authDomain: "job-tracker-e2e17.firebaseapp.com",
  projectId: "job-tracker-e2e17",
  storageBucket: "job-tracker-e2e17.firebasestorage.app",
  messagingSenderId: "791732492349",
  appId: "1:791732492349:web:05c132c1559eb32216b254",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, signOut, getDoc, doc };
