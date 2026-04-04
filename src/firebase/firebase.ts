import {initializeApp} from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDPRGXE6tRJGnLMjawl91Z_AndoEwIZg3U",
  authDomain: "internshala-clone-530e7.firebaseapp.com",
  projectId: "internshala-clone-530e7",
  storageBucket: "internshala-clone-530e7.appspot.com",
  messagingSenderId: "856728029727",
  appId: "1:856728029727:web:f0d8256b1cabb537d1632a",
  measurementId: "G-N9YKE9Z6YD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const provider=new GoogleAuthProvider();