import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   CHEMISTBOYS FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyCiRX_njFBAAgUzM1vHDTEYgWkT1FLjcmQ",

    authDomain: "chemistboys.firebaseapp.com",

    projectId: "chemistboys",

    storageBucket: "chemistboys.firebasestorage.app",

    messagingSenderId: "696067008650",

    appId: "1:696067008650:web:aba739ed1593d315002573",

    measurementId: "G-G3BHP0PSB0"

};


/* =========================================================
   INITIALIZE FIREBASE — ONLY ONCE
========================================================= */

const app =
    initializeApp(firebaseConfig);


/* =========================================================
   SINGLE FIREBASE AUTH INSTANCE
========================================================= */

export const auth =
    getAuth(app);


/* =========================================================
   FIREBASE AUTH READY
========================================================= */

export const authReady =
    new Promise((resolve) => {

        const unsubscribe =
            onAuthStateChanged(
                auth,
                () => {

                    unsubscribe();

                    resolve();

                }
            );

    });