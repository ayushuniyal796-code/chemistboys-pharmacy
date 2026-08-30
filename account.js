import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCiRX_njBfJAAgUzM1vHDTEYgWk1TFLjcmQ",
    authDomain: "chemistboys.firebaseapp.com",
    projectId: "chemistboys",
    storageBucket: "chemistboys.firebasestorage.app",
    messagingSenderId: "696067008650",
    appId: "1:696067008650:web:aba739ed1593d315002573",
    measurementId: "G-G3BHP0PSB0"
};


/* =========================================================
   FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* =========================================================
   GLOBAL AUTH STATE
========================================================= */

window.currentFirebaseUser = null;


/*
   Ye promise Firebase ka login status confirm
   hone tak wait karega.
*/

window.firebaseAuthReady = new Promise((resolve) => {

    const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {

            window.currentFirebaseUser = user;

            resolve(user);

            unsubscribe();
        }
    );

});


/* =========================================================
   HEADER ELEMENTS
========================================================= */

const accountBtn =
    document.getElementById("accountBtn");

const registerBtn =
    document.getElementById("registerBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const ordersBtn =
    document.getElementById("ordersBtn");


/* =========================================================
   KEEP HEADER UPDATED
========================================================= */

onAuthStateChanged(auth, (user) => {

    window.currentFirebaseUser = user;


    if (user) {

        console.log(
            "LOGIN ACTIVE:",
            user.email
        );


        const name =
            user.displayName ||
            user.email.split("@")[0];


        /* ACCOUNT BUTTON */

        if (accountBtn) {

            accountBtn.textContent =
                "👤 " + name;

            accountBtn.href =
                "account.html";

        }


        /* REGISTER */

        if (registerBtn) {

            registerBtn.style.display =
                "none";

        }


        /* LOGOUT */

        if (logoutBtn) {

            logoutBtn.style.display =
                "inline-block";

        }


        /* ORDERS */

        if (ordersBtn) {

            ordersBtn.style.display =
                "inline-block";

        }

    }

    else {

        console.log(
            "USER NOT LOGGED IN"
        );


        /* ACCOUNT */

        if (accountBtn) {

            accountBtn.textContent =
                "👤 Login";

            accountBtn.href =
                "login.html";

        }


        /* REGISTER */

        if (registerBtn) {

            registerBtn.style.display =
                "inline-block";

        }


        /* LOGOUT */

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


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.currentFirebaseUser =
                    null;

                alert(
                    "✅ You have been logged out."
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
                    "❌ Logout failed."
                );

            }

        }
    );

}


/* =========================================================
   GLOBAL AUTH
========================================================= */

window.firebaseAuth = auth;