// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBZJseKOEnlO3wevP9lt8vFZ9btZ3O2NM",
  authDomain: "foodhood-9e04f.firebaseapp.com",
  projectId: "foodhood-9e04f",
  storageBucket: "foodhood-9e04f.appspot.com",
  messagingSenderId: "451560279977",
  appId: "1:451560279977:web:9c9344e2e3432d7d053eb8",
  measurementId: "G-T2VZ2B5BPS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { app, auth };