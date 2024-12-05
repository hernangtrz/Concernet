// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyC03bpH14JzjNVcn94R2yWZttv46rU9K-4",
  authDomain: "concernet-ecd78.firebaseapp.com",
  projectId: "concernet-ecd78",
  storageBucket: "concernet-ecd78.firebasestorage.app",
  messagingSenderId: "222116199448",
  appId: "1:222116199448:web:81cd31ae947795a5b5576d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export { signInWithEmailAndPassword, signOut };
export { db };
