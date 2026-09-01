/* =========================================================
   CHEMISTBOYS - CHECKOUT
========================================================= */

import {
    auth,
    authReady
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   CHECKOUT AUTHENTICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /* =====================================================
           WAIT FOR FIREBASE AUTH
        ===================================================== */

        await authReady;


        /* =====================================================
           GET CURRENT USER
        ===================================================== */

        const user =
            auth.currentUser;


        /* =====================================================
           NOT LOGGED IN
        ===================================================== */

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        /* =====================================================
           USER INFORMATION
        ===================================================== */

        const name =
            user.displayName ||
            user.email ||
            "User";


        const email =
            user.email ||
            "";


        /* =====================================================
           FILL NAME FIELDS
        ===================================================== */

        const nameFields = [
            "name",
            "fullName",
            "customerName",
            "userName"
        ];


        nameFields.forEach(
            function (id) {

                const field =
                    document.getElementById(id);


                if (!field) {

                    return;

                }


                if (!field.value) {

                    field.value =
                        name;

                }

            }
        );


        /* =====================================================
           FILL EMAIL FIELDS
        ===================================================== */

        const emailFields = [
            "email",
            "customerEmail",
            "userEmail"
        ];


        emailFields.forEach(
            function (id) {

                const field =
                    document.getElementById(id);


                if (!field) {

                    return;

                }


                if (!field.value) {

                    field.value =
                        email;

                }

            }
        );


        /* =====================================================
           DISPLAY USER NAME
        ===================================================== */

        const userNameElements =
            document.querySelectorAll(
                "#userName, #customerName, .user-name"
            );


        userNameElements.forEach(
            function (element) {

                if (
                    element.tagName === "INPUT" ||
                    element.tagName === "TEXTAREA"
                ) {

                    element.value =
                        name;

                } else {

                    element.textContent =
                        name;

                }

            }
        );


        /* =====================================================
           DISPLAY USER EMAIL
        ===================================================== */

        const userEmailElements =
            document.querySelectorAll(
                "#userEmail, #customerEmail, .user-email"
            );


        userEmailElements.forEach(
            function (element) {

                if (
                    element.tagName === "INPUT" ||
                    element.tagName === "TEXTAREA"
                ) {

                    element.value =
                        email;

                } else {

                    element.textContent =
                        email;

                }

            }
        );


        /* =====================================================
           AUTH STATE LISTENER
        ===================================================== */

        onAuthStateChanged(
            auth,
            function (currentUser) {

                if (!currentUser) {

                    window.location.href =
                        "login.html";

                }

            }
        );

    }
);