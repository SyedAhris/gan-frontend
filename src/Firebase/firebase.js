// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDexfRVzloKhyg4Jsxvlbnvg1GtjLRL488",
  authDomain: "urdugan-fd007.firebaseapp.com",
  projectId: "urdugan-fd007",
  storageBucket: "urdugan-fd007.appspot.com",
  messagingSenderId: "872703526029",
  appId: "1:872703526029:web:53b04e8333cc02ed3ccec4",
  measurementId: "G-9C6LTYYV6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);