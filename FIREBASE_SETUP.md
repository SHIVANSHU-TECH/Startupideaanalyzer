# Firebase Configuration Instructions

To complete the Firebase Authentication setup, you need to:

1. **Create a Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Create a project" or select an existing project
   - Follow the setup wizard

2. **Enable Authentication**
   - In your Firebase project console, go to Authentication
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider
   - Enable "Google" provider (optional but recommended)

3. **Create a Web App**
   - In your Firebase project console, click the web app icon (</>)
   - Register your app with a nickname (e.g., "Startup Idea Analyzer")
   - Copy the Firebase configuration object

4. **Enable Firestore Database**
   - In your Firebase project console, go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location for your database

5. **Update Environment Variables**
   Replace the placeholder values in your .env.local file with your actual Firebase configuration:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-actual-app-id
   ```

6. **Set up Firestore Security Rules**
   In Firestore Database > Rules, use these rules for development:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read and write their own user document
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Users can read and write their own ideas
       match /ideas/{ideaId} {
         allow read, write: if request.auth != null && 
           (resource == null || resource.data.userId == request.auth.uid);
       }
       
       // Users can read and write their own reports
       match /reports/{reportId} {
         allow read, write: if request.auth != null && 
           (resource == null || resource.data.userId == request.auth.uid);
       }
     }
   }
   ```

7. **Restart Your Development Server**
   After updating the environment variables, restart your Next.js development server:
   ```bash
   npm run dev
   ```

## Features Now Available with Firebase Auth:

✅ **Email/Password Authentication**
- User registration with name, email, password
- User login with email/password
- Password reset functionality
- User profile management

✅ **Google OAuth Authentication**
- One-click Google sign-in/sign-up
- Automatic user profile creation

✅ **Real-time User State Management**
- Automatic login state persistence
- Real-time auth state changes
- Proper logout functionality

✅ **Firestore Data Storage**
- User profiles stored in Firestore
- Ideas stored with user association
- Real-time data synchronization

✅ **Enhanced Security**
- Firebase Auth handles all authentication security
- Firestore security rules protect user data
- No JWT tokens to manage manually

✅ **Seamless Integration**
- Pending idea submission after login/signup
- Automatic redirect to analysis page
- User-specific dashboards

## Testing the Firebase Integration:

1. **Start the development server** (should be running on port 3001)
2. **Visit the home page** and submit a startup idea
3. **Sign up or login** - you'll be redirected to complete the idea submission
4. **View your dashboard** - see your submitted ideas and analytics
5. **View analysis results** - see the AI-powered analysis of your ideas

The application now uses Firebase for all authentication and user data storage, while maintaining the existing AI analysis and UI functionality.