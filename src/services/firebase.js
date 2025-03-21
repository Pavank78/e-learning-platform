// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDssMZ8jvYCbttcYTQ094oocva0_WCW4h4",
  authDomain: "e-learning-platform-4ced4.firebaseapp.com",
  projectId: "e-learning-platform-4ced4",
  storageBucket: "e-learning-platform-4ced4.appspot.com",
  messagingSenderId: "158819234500",
  appId: "1:158819234500:web:1b14c961d6b3309a058f91",
  measurementId: "G-15VRLCSNWQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;