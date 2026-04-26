// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBBjiv7n2zK1EUu5EYuGYViYT3YAAJ77C8',
  authDomain: 'smartpolutryfarmapp.firebaseapp.com',
  databaseURL: 'https://smartpolutryfarmapp-default-rtdb.firebaseio.com',
  projectId: 'smartpolutryfarmapp',
  storageBucket: 'smartpolutryfarmapp.firebasestorage.app',
  messagingSenderId: '836935709786',
  appId: '1:836935709786:web:45bc4f0b066f826cc95463',
  measurementId: 'G-M1MKYFWPDM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
