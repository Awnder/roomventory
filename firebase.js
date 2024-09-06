// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
  authDomain: "roomventory-c42a1.firebaseapp.com",
  projectId: "roomventory-c42a1",
  storageBucket: "roomventory-c42a1.appspot.com",
  messagingSenderId: "39853762534",
  appId: "1:39853762534:web:f0177a1f57ae6923fe9827",
  measurementId: "G-09GXH3GWX3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;


if (typeof window !== 'undefined') {
    // Client-side code
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
  
  const db = getFirestore(app)
  export {db, analytics}