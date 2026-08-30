import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const firebaseConfig = {

    apiKey: "AIzaSyCiRX_njFBAAgUzM1vHDTEYgWkT1FLjcmQ",

    authDomain: "chemistboys.firebaseapp.com",

    projectId: "chemistboys",

    storageBucket: "chemistboys.firebasestorage.app",

    messagingSenderId: "696067008650",

    appId: "1:696067008650:web:aba739ed1593d315002573",

    measurementId: "G-G3BHP0PSB0"

};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);


export const authReady = new Promise((resolve) => {

    const unsubscribe = onAuthStateChanged(
        auth,
        () => {

            unsubscribe();

            resolve();

        }
    );

});