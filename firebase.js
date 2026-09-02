import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyCiRX_njFBAAgUzM1vHDTEYgWk1TFLjcmQ",
    authDomain: "chemistboys.firebaseapp.com",
    projectId: "chemistboys",
    storageBucket: "chemistboys.firebasestorage.app",
    messagingSenderId: "696067008650",
    appId: "1:696067008650:web:aba739ed1593d315002573",
    measurementId: "G-G3BHP0PSB0"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase Authentication
export const auth = getAuth(app);


// Cloud Firestore
export const db = getFirestore(app);


// Wait until Firebase knows the current login state
export const authReady = new Promise((resolve) => {

    const unsubscribe = onAuthStateChanged(auth, () => {

        unsubscribe();

        resolve();

    });

});