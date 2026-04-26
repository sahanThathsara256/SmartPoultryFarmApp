// firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: 'AIzaSyBBjiv7n2zK1EUu5EYuGYViYT3YAAJ77C8',
  authDomain: 'smartpolutryfarmapp.firebaseapp.com',
  databaseURL: 'https://smartpolutryfarmapp-default-rtdb.firebaseio.com',
  projectId: 'smartpolutryfarmapp',
  storageBucket: 'smartpolutryfarmapp.firebasestorage.app',
  messagingSenderId: '836935709786',
  appId: '1:836935709786:web:45bc4f0b066f826cc95463',
};

const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Realtime Database (IoT usually uses this)
export const rtdb = getDatabase(app);

// Authentication
export const auth = getAuth(app);

export default app;
