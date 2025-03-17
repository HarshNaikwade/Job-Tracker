# Job Tracker

A modern job application tracker built with **React**, **Vite**, and **Material-UI**. The app uses **Firebase Firestore** as a backend to store job applications and **Firebase Authentication** (email/password) with a restricted access mechanism (to limit access to specific users temporarily). 

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Firebase Configuration](#firebase-configuration)
- [Running the Project](#running-the-project)

## Features

- **Job Application Tracker:** Create, update, and delete job applications.
- **Authentication:** Email/password login with restricted access (only allowed users in the Firestore `allowedUsers` collection).
- **Dark Mode:** Toggle between light and dark themes.
- **Persistent Storage:** Uses Firebase Firestore to store job applications with real-time syncing.
- **Firebase Integration:** Uses Firebase Firestore for data and Firebase Authentication for secure login.
- **Continuous Deployment:** Deployed on Netlify for fast and reliable hosting.

## Tech Stack

- **Frontend:**
  - React (Vite)
  - Material-UI (MUI)
  - Firebase Firestore & Authentication

- **Backend:**
  - Firebase Firestore (NoSQL database)

- **Hosting & Deployment:**
  - Netlify (CDN-based deployment)
  - GitHub (Version Control)

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/)
- A Firebase project set up with:
  - Firestore Database
  - Email/Password Authentication enabled
- A Netlify account (for deployment)
- A GitHub repository (for version control and Netlify integration)

## Installation & Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/harshnaikwade/job-tracker.git
   cd job-tracker
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up Firebase Configuration** (See next section)

## Firebase Configuration

To integrate Firebase into the project:

1. **Go to Firebase Console**: [Firebase](https://console.firebase.google.com/)
2. **Create a new project** (or use an existing one).
3. **Enable Firestore Database:**
   - Navigate to **Firestore Database** in the Firebase Console.
   - Click **Create Database** and follow the setup steps.
4. **Enable Authentication:**
   - Navigate to **Authentication** in the Firebase Console.
   - Enable **Email/Password** authentication under the "Sign-in method" tab.
5. **Create a Firebase Configuration File:**
   - Inside the project directory, create a new file:  
     `src/firebase.js`
   - Add the following code:

   ```js
   import { initializeApp } from "firebase/app";
   import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
   import { getFirestore } from "firebase/firestore";

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };

   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);
   const db = getFirestore(app);

   export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
   ```

   Replace the placeholder values with your actual Firebase project credentials found in **Firebase Console > Project Settings**.

6. **Set Up Allowed Users in Firestore:**
   - In Firebase Console, go to **Firestore Database**.
   - Create a **collection** named `allowedUsers`.
   - Inside the `allowedUsers` collection, add a **document**:
     - Document ID: **User UID** (You will get this from Firebase Authentication after user signup)
     - Fields:
       - **email:** 'abc@test.com'
       - **access:** `true` (This ensures only approved users can log in)

## Running the Project

1. **Start the development server:**

   ```sh
   npm run dev
   ```

   The app will be available at:  
   **[http://localhost:5173](http://localhost:5173)**

2. **Building the project for production:**

   ```sh
   npm run build
   ```

   This will generate optimized production files in the `dist/` folder.

---

