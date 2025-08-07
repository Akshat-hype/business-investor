import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQvk8RDMKF7rSVFtwKA4kOfZpMtd2uVJI",
  authDomain: "business-investor-project.firebaseapp.com",
  projectId: "business-investor-project",
  storageBucket: "business-investor-project.firebasestorage.app",
  messagingSenderId: "873966298799",
  appId: "1:873966298799:web:898e4e4cdf82c1e5af565a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
