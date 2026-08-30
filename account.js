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

    apiKey: "AIzaSyCiRX-njBfJAAgUzM1vHDTEYgWk1TFLjcmQ",

    authDomain:
        "chemistboys.firebaseapp.com",

    projectId:
        "chemistboys",

    storageBucket:
        "chemistboys.firebasestorage.app",

    messagingSenderId:
        "696067008650",

    appId:
        "1:696067008650:web:aba739ed1593d315002573",

    measurementId:
        "G-G3BHP0PSB0"
};


/* ==========================================
   FIREBASE INITIALIZE
========================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


/* ==========================================
   ELEMENTS
========================================== */

const accountBtn =
    document.getElementById("accountBtn");

const registerBtn =
    document.getElementById("registerBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const ordersBtn =
    document.getElementById("ordersBtn");


/* ==========================================
   CHECK LOGIN STATUS
========================================== */

onAuthStateChanged(auth, (user) => {

    /*
     * VERY IMPORTANT
     * script.js isi variable ko check karega.
     */

    window.currentFirebaseUser = user;


    /* ======================================
       USER LOGGED IN
    ====================================== */

    if (user) {

        const name =
            user.displayName ||
            (user.email
                ? user.email.split("@")[0]
                : "Account");


        /* ACCOUNT BUTTON */

        if (accountBtn) {

            accountBtn.textContent =
                `👤 ${name}`;

            accountBtn.href =
                "account.html";

        }


        /* REGISTER BUTTON HIDE */

        if (registerBtn) {

            registerBtn.style.display =
                "none";

        }


        /* LOGOUT SHOW */

        if (logoutBtn) {

            logoutBtn.style.display =
                "inline-block";

        }


        /* ORDERS SHOW */

        if (ordersBtn) {

            ordersBtn.style.display =
                "inline-block";

        }

    }


    /* ======================================
       USER LOGGED OUT
    ====================================== */

    else {

        /*
         * Firebase user nahi hai
         */

        window.currentFirebaseUser = null;


        /* ACCOUNT BUTTON */

        if (accountBtn) {

            accountBtn.textContent =
                "👤 Login";

            accountBtn.href =
                "login.html";

        }


        /* REGISTER SHOW */

        if (registerBtn) {

            registerBtn.style.display =
                "inline-block";

        }


        /* LOGOUT HIDE */

        if (logoutBtn) {

            logoutBtn.style.display =
                "none";

        }


        /* ORDERS */

        if (ordersBtn) {

            ordersBtn.style.display =
                "inline-block";

        }

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

                window.currentFirebaseUser =
                    null;

                alert(
                    "You have been logged out."
                );

                window.location.href =
                    "index.html";

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Logout failed. Please try again."
                );

            }

        }
    );

}