# JobTrackr

![JobTrackr Logo](https://img.shields.io/badge/JobTrackr-Job%20Application%20Tracker-blue)

JobTrackr is a comprehensive job application tracking platform designed to help job seekers organize their job search process. Keep track of all your applications, interviews, and job opportunities in one centralized location.

## Features

- **User Authentication**: Secure login, registration, and password reset functionality
- **Application Tracking**: Record and monitor all your job applications in one place
- **Status Management**: Track application statuses (Applied, Interviewing, Waiting, Rejected, Offer)
- **Dashboard Overview**: Visualize your job search progress with intuitive statistics
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Data Persistence**: All data is securely stored in Firebase

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn-ui components
- **Build Tool**: Vite
- **Backend & Database**: Firebase (Authentication, Firestore)
- **State Management**: React Context API
- **Routing**: React Router
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd jobtrackr
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Firebase Configuration

The project is configured to work with Firebase. You can use the existing Firebase configuration for testing purposes, or replace it with your own:

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google provider)
3. Create a Firestore database
4. Update the Firebase configuration in `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Add Applications**: Record new job applications with company details, position, and status
3. **Track Progress**: Update application statuses as you progress through the hiring process
4. **View Statistics**: Monitor your application success rate and interview conversion

## Deployment

The application can be deployed to any static site hosting service:

1. Build the production version:
   ```bash
   npm run build
   # or
   yarn build
   # or
   pnpm build
   ```

2. Deploy the content of the `dist` folder to your hosting service of choice (Netlify, Vercel, Firebase Hosting, etc.)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
