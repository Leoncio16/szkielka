import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtb-FIkElVZsVgAc0htmPiilUQUd0S7jM",
  authDomain: "glasses-2be29.firebaseapp.com",
  projectId: "glasses-2be29",
  storageBucket: "glasses-2be29.firebasestorage.app",
  messagingSenderId: "311978976478",
  appId: "1:311978976478:web:26112dbdec565043e9ce4f",
  measurementId: "G-01JHNRYJLJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

