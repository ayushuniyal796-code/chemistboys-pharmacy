import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCiRX_njFBAAgUzM1vHDTEYgWk1TFLjcmQ",
    authDomain: "chemistboys.firebaseapp.com",
    projectId: "chemistboys",
    storageBucket: "chemistboys.firebasestorage.app",
    messagingSenderId: "696067008650",
    appId: "1:696067008650:web:aba739ed1593d315002573",
    measurementId: "G-G3BHP0PSB0"
};


/* =========================================
   FIREBASE
========================================= */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* =========================================
   MAKE AUTH AVAILABLE TO ALL SCRIPTS
========================================= */

window.firebaseAuth = auth;


/* =========================================
   AUTH READY PROMISE
========================================= */

let resolveAuthReady;

window.firebaseAuthReady = new Promise((resolve) => {
    resolveAuthReady = resolve;
});


/* =========================================
   ELEMENTS
========================================= */

const accountBtn =
    document.getElementById("accountBtn");

const registerBtn =
    document.getElementById("registerBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const ordersBtn =
    document.getElementById("ordersBtn");


/* =========================================
   AUTH STATE
========================================= */

onAuthStateChanged(auth, (user) => {

    window.currentFirebaseUser = user || null;

    resolveAuthReady(user || null);


    /* =====================================
       LOGGED IN
    ===================================== */

    if (user) {

        const name =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Account";


        if (accountBtn) {

            accountBtn.textContent =
                `👤 ${name}`;

            accountBtn.href =
                "account.html";

        }


        if (registerBtn) {

            registerBtn.style.display =
                "none";

        }


        if (logoutBtn) {

            logoutBtn.style.display =
                "inline-block";

        }


        if (ordersBtn) {

            ordersBtn.style.display =
                "inline-block";

        }

    }


    /* =====================================
       LOGGED OUT
    ===================================== */

    else {

        if (accountBtn) {

            accountBtn.textContent =
                "👤 Login";

            accountBtn.href =
                "login.html";

        }


        if (registerBtn) {

            registerBtn.style.display =
                "inline-block";

        }


        if (logoutBtn) {

            logoutBtn.style.display =
                "none";

        }


        if (ordersBtn) {

            ordersBtn.style.display =
                "inline-block";

        }

    }

});


/* =========================================
   LOGOUT
========================================= */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

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

    });

}