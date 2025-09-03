const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let firebaseApp;

const initializeFirebase = () => {
  if (!firebaseApp && !admin.apps.length) {
    try {
      console.log('🔄 Initializing Firebase Admin SDK...');
      
      // For Google Cloud deployment (uses Application Default Credentials)
      if (process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT) {
        console.log('☁️ Using Google Cloud default credentials');
        
        firebaseApp = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT
        });
      }
      // For production with environment variables
      else if (process.env.FIREBASE_PRIVATEKEY && process.env.FIREBASE_CLIENT_EMAIL) {
        console.log('🔑 Using environment variables for Firebase credentials');
        
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATEKEY.replace(/\\n/g, '\n')
          })
        });
      }
      // For development with service account key file
      else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('📁 Using service account key file for development');
        
        // Resolve the path relative to the project root
        const serviceAccountPath = path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
        console.log('📁 Service account path:', serviceAccountPath);
        
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(require(serviceAccountPath)),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      else {
        throw new Error('No valid Firebase configuration found. Please set up Firebase credentials.');
      }

      console.log('✅ Firebase Admin initialized successfully');
      console.log('🏗️ Project ID:', process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT);
      
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin:', error.message);
      throw new Error(`Failed to initialize Firebase: ${error.message}`);
    }
  } else if (admin.apps.length > 0) {
    firebaseApp = admin.apps[0];
    console.log('🔄 Using existing Firebase Admin app');
  }
  
  return firebaseApp;
};

const getFirestore = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.firestore();
};

module.exports = {
  initializeFirebase,
  getFirestore,
  admin
};
