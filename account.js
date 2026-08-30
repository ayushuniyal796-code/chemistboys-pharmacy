import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* ==========================================
   FIREBASE CONFIG
   ========================================== */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId:
        "YOUR_MESSAGING_SENDER_ID",

    appId:
        "YOUR_APP_ID"
};


/* ==========================================
   FIREBASE INITIALIZE
   ========================================== */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* ==========================================
   ELEMENTS
   ========================================== */

const accountBtn =
    document.getElementById("accountBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


/* ==========================================
   CHECK LOGIN STATUS
   ========================================== */

onAuthStateChanged(auth, (user) => {

    if (user) {

        /*
        User logged in
        */

        const name =
            user.displayName ||
            user.email.split("@")[0];


        accountBtn.textContent =
            `👤 ${name}`;


        accountBtn.href =
            "account.html";


        logoutBtn.style.display =
            "inline-block";


    } else {

        /*
        User logged out
        */

        accountBtn.textContent =
            "👤 Login";


        accountBtn.href =
            "login.html";


        logoutBtn.style.display =
            "none";

    }

});


/* ==========================================
   LOGOUT
   ========================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                alert(
                    "You have been logged out."
                );

                window.location.href =
                    "index.html";

            } catch (error) {

                console.error(error);

                alert(
                    "Logout failed."
                );

            }

        }
    );

}