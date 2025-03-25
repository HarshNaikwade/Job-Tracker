import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication helpers
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Job Applications helpers
export const addApplication = async (userId, applicationData) => {
  try {
    // Check if user is authenticated before attempting to write
    if (!auth.currentUser) {
      throw new Error("User must be logged in to add applications");
    }

    const applicationsRef = collection(db, "applications");
    return await addDoc(applicationsRef, {
      ...applicationData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding application:", error);
    // If it's a permission error, provide more helpful message
    if (error.code === "permission-denied") {
      throw new Error(
        "Firebase permissions error. Please make sure your Firebase rules allow writing to the 'applications' collection."
      );
    }
    throw error;
  }
};

export const getApplications = async (userId) => {
  try {
    // Check if user is authenticated before attempting to read
    if (!auth.currentUser) {
      throw new Error("User must be logged in to get applications");
    }

    const applicationsRef = collection(db, "applications");

    try {
      // First attempt with orderBy
      const q = query(
        applicationsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to regular dates
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
    } catch (indexError) {
      // If we get an index error, check if it's the specific index error
      if (indexError.code === "failed-precondition") {
        console.warn(
          "Missing Firestore index. As a fallback, fetching without ordering. Please create the required index using the link in the error message."
        );

        // Fallback query without ordering as a temporary solution
        const fallbackQuery = query(
          applicationsRef,
          where("userId", "==", userId)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);

        // We'll sort in memory since we can't use orderBy
        const results = fallbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }));

        // Sort in memory by createdAt descending
        return results.sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.getTime() : 0;
          const dateB = b.createdAt ? b.createdAt.getTime() : 0;
          return dateB - dateA; // Descending order
        });
      }

      // If it's a different error, rethrow it
      throw indexError;
    }
  } catch (error) {
    console.error("Error getting applications:", error);
    // If it's a permission error, provide more helpful message
    if (error.code === "permission-denied") {
      throw new Error(
        "Firebase permissions error. Please make sure your Firebase rules allow reading from the 'applications' collection."
      );
    }
    throw error;
  }
};

export const updateApplication = async (applicationId, updateData) => {
  try {
    // Check if user is authenticated before attempting to update
    if (!auth.currentUser) {
      throw new Error("User must be logged in to update applications");
    }

    const applicationRef = doc(db, "applications", applicationId);
    return await updateDoc(applicationRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating application:", error);
    if (error.code === "permission-denied") {
      throw new Error(
        "Firebase permissions error. Please make sure your Firebase rules allow updating the 'applications' collection."
      );
    }
    throw error;
  }
};

export const deleteApplication = async (applicationId) => {
  try {
    // Check if user is authenticated before attempting to delete
    if (!auth.currentUser) {
      throw new Error("User must be logged in to delete applications");
    }

    const applicationRef = doc(db, "applications", applicationId);
    return await deleteDoc(applicationRef);
  } catch (error) {
    console.error("Error deleting application:", error);
    if (error.code === "permission-denied") {
      throw new Error(
        "Firebase permissions error. Please make sure your Firebase rules allow deleting from the 'applications' collection."
      );
    }
    throw error;
  }
};

export const APPLICATION_STATUS = {
  APPLIED: "Applied",
  IN_PROGRESS: "In Progress",
  WAITING: "Waiting",
  REJECTED: "Rejected",
  APPROVED: "Approved",
};

export { app, auth, db };
