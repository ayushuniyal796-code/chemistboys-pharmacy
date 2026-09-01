import {
    auth,
    authReady
} from "./firebase.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   CURRENT USER
========================================================= */

let currentUser = null;


/* =========================================================
   HEADER ELEMENTS
========================================================= */

const accountBtn =
    document.getElementById("accountBtn");

const registerBtn =
    document.getElementById("registerBtn");

const ordersBtn =
    document.getElementById("ordersBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


/* =========================================================
   UPDATE HEADER
========================================================= */

function updateHeader(user) {

    currentUser =
        user || null;


    window.currentFirebaseUser =
        currentUser;


    /* =====================================================
       LOGGED IN
    ===================================================== */

    if (currentUser) {

        const name =
            currentUser.displayName ||
            currentUser.email ||
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


        if (ordersBtn) {

            ordersBtn.style.display =
                "inline-block";

        }


        if (logoutBtn) {

            logoutBtn.style.display =
                "inline-block";

        }

    }


    /* =====================================================
       LOGGED OUT
    ===================================================== */

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


        if (ordersBtn) {

            ordersBtn.style.display =
                "none";

        }


        if (logoutBtn) {

            logoutBtn.style.display =
                "none";

        }

    }

}


/* =========================================================
   WAIT FOR FIREBASE AUTH
========================================================= */

await authReady;


/* =========================================================
   INITIAL USER STATE
========================================================= */

updateHeader(
    auth.currentUser
);


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            try {

                await signOut(auth);


                currentUser =
                    null;


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


/* =========================================================
   GLOBAL AUTH READY
========================================================= */

window.firebaseAuthReady =
    authReady;