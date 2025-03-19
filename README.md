# Job Tracker

A modern job application tracker built with **React**, **Vite**, and **Material-UI**, utilizing **Firebase Firestore** for real-time job application storage and **Firebase Authentication** with support for Google Sign-In and email/password login.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Firebase Configuration](#firebase-configuration)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Deployment on Netlify](#deployment-on-netlify)

## Features

- **Job Application Tracker:** Create, update, and delete job applications.
- **Authentication:** Google Sign-In and Email/Password login.
- **User-Specific Data:** Each user can only access their own job applications.
- **Dark Mode:** Toggle between light and dark themes.
- **Persistent Storage:** Uses Firebase Firestore to store job applications with real-time syncing.
- **Firebase Integration:** Uses Firebase Firestore for data and Firebase Authentication for secure login.
- **Mobile-Friendly UI:** Fully responsive design for mobile and desktop.
- **Continuous Deployment:** Deployed on Netlify for fast and reliable hosting.
- **Automated Job Tracking:** Gmail integration for extracting job application details (coming soon).

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
  - Authentication (Google & Email/Password Sign-In enabled)
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
   - Enable **Google Sign-In** and **Email/Password Authentication** under the "Sign-in method" tab.
5. **Set Up Allowed Users in Firestore:**
   - In Firebase Console, go to **Firestore Database**.
   - Create a **collection** named `allowedUsers`.
   - Inside the `allowedUsers` collection, add a **document**:
     - Document ID: **User UID** (You will get this from Firebase Authentication after user signup)
     - Fields:
       - **email:** 'abc@test.com'
       - **access:** `true` (This ensures only approved users can log in)

## Environment Variables

To securely store Firebase credentials, set up an `.env` file locally and add the following:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### **Security Tip:**
🚨 **Do not commit this file to GitHub!** Add `.env` to your `.gitignore`:

```gitignore
.env
```

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

## Deployment on Netlify

### **Set Environment Variables on Netlify:**
1. Go to [Netlify Dashboard](https://app.netlify.com/).
2. Select your project.
3. Click **"Site settings"** → **"Environment variables"**.
4. Add each variable from your `.env` file (without quotes):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### **Trigger a New Deploy:**
1. Go to **"Deploys"** in Netlify.
2. Click **"Trigger deploy"** → "Deploy site".

Once deployed, your app will be live on Netlify! 🚀
