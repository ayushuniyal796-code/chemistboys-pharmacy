import {
    auth,
    authReady
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


let currentUser = null;


const accountBtn =
    document.getElementById("accountBtn");

const registerBtn =
    document.getElementById("registerBtn");

const ordersBtn =
    document.getElementById("ordersBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


function updateHeader(user) {

    currentUser = user || null;

    window.currentFirebaseUser =
        currentUser;


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

    } else {

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


onAuthStateChanged(
    auth,
    (user) => {

        updateHeader(user);

    }
);


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


window.firebaseAuthReady =
    authReady;