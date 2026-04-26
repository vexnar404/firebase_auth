// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASnyF8qVSX2YOOVmD1f1adBVWj1Oq8jvM",
  authDomain: "auth-i1.firebaseapp.com",
  projectId: "auth-i1",
  storageBucket: "auth-i1.firebasestorage.app",
  messagingSenderId: "64676709857",
  appId: "1:64676709857:web:2c1b4c792c524c88f47ea0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);