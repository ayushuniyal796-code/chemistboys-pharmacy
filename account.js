import {
    auth,
    authReady
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =================================================
   GLOBAL AUTH STATE
================================================= */

let currentUser = null;


/* =================================================
   HEADER ELEMENTS
================================================= */

const accountBtn =
    document.getElementById("accountBtn");

const registerBtn =
    document.getElementById("registerBtn");

const ordersBtn =
    document.getElementById("ordersBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


/* =================================================
   UPDATE HEADER
================================================= */

function updateHeader(user) {

    currentUser = user || null;


    if (currentUser) {

        const name =
            currentUser.displayName ||
            currentUser.email ||
            "Account";


        // Account button
        if (accountBtn) {

            accountBtn.textContent =
                `👤 ${name}`;

            accountBtn.href =
                "account.html";

        }


        // Register hide
        if (registerBtn) {

            registerBtn.style.display =
                "none";

        }


        // Orders show
        if (ordersBtn) {

            ordersBtn.style.display =
                "inline-block";

        }


        // Logout show
        if (logoutBtn) {

            logoutBtn.style.display =
                "inline-block";

        }

    } else {

        // Account → Login
        if (accountBtn) {

            accountBtn.textContent =
                "👤 Login";

            accountBtn.href =
                "login.html";

        }


        // Register show
        if (registerBtn) {

            registerBtn.style.display =
                "inline-block";

        }


        // Orders hide
        if (ordersBtn) {

            ordersBtn.style.display =
                "none";

        }


        // Logout hide
        if (logoutBtn) {

            logoutBtn.style.display =
                "none";

        }

    }

}


/* =================================================
   FIREBASE AUTH STATE
================================================= */

onAuthStateChanged(
    auth,
    (user) => {

        updateHeader(user);

        // Other scripts can access current user
        window.currentFirebaseUser =
            user || null;

    }
);


/* =================================================
   LOGOUT
================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.currentFirebaseUser =
                    null;

                window.location.href =
                    "index.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "❌ Logout failed. Please try again."
                );

            }

        }
    );

}


/* =================================================
   AUTH READY
================================================= */

window.firebaseAuthReady =
    authReady;