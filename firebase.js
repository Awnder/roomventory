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
  authDomain: "roomventory-3d42f.firebaseapp.com",
  projectId: "roomventory-3d42f",
  storageBucket: "roomventory-3d42f.appspot.com",
  messagingSenderId: "579687683713",
  appId: "1:579687683713:web:343bcf57d78bcb4ccbdf80",
  measurementId: "G-264895EDPQ"
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