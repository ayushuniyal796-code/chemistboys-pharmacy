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

    apiKey: "AIzaSyCiRX_njFBAAgUzM1vHDTEYgWk1TFLjcmQ",

    authDomain: "chemistboys.firebaseapp.com",

    projectId: "chemistboys",

    storageBucket: "chemistboys.firebasestorage.app",

    messagingSenderId: "696067008650",

    appId: "1:696067008650:web:aba739ed1593d315002573",

    measurementId: "G-G3BHP0PSB0"
};


/* ==========================================
   FIREBASE
========================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


/* ==========================================
   AUTH STATE
========================================== */

window.firebaseAuthReady = new Promise((resolve) => {

    onAuthStateChanged(auth, (user) => {

        window.currentFirebaseUser = user;

        updateAccountUI(user);

        resolve(user);

    });

});


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
   UPDATE ACCOUNT UI
========================================== */

function updateAccountUI(user) {

    if (user) {

        const name =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Account";


        /* ACCOUNT */

        if (accountBtn) {

            accountBtn.textContent =
                `👤 ${name}`;

            accountBtn.href =
                "account.html";

        }


        /* REGISTER HIDE */

        if (registerBtn) {

            registerBtn.style.display =
                "none";

        }


        /* LOGOUT SHOW */

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

        /* LOGIN */

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

}


/* ==========================================
   LOGOUT
========================================== */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.currentFirebaseUser =
                null;

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