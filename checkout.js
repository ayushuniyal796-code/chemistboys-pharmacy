import {
    auth,
    authReady
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


document.addEventListener("DOMContentLoaded", async function () {

    /* ==========================================
       WAIT FOR FIREBASE AUTH
    ========================================== */

    await authReady;


    /* ==========================================
       CHECK LOGIN
    ========================================== */

    const user = auth.currentUser;


    if (!user) {

        window.location.href = "login.html";

        return;

    }


    /* ==========================================
       USER INFORMATION
    ========================================== */

    const name =
        user.displayName ||
        user.email ||
        "User";


    const email =
        user.email || "";


    /*
     * Automatically fill common checkout
     * fields if they exist in checkout.html.
     */

    const nameFields = [
        "name",
        "fullName",
        "customerName",
        "userName"
    ];


    const emailFields = [
        "email",
        "customerEmail",
        "userEmail"
    ];


    nameFields.forEach(function (id) {

        const field =
            document.getElementById(id);

        if (field && !field.value) {

            field.value = name;

        }

    });


    emailFields.forEach(function (id) {

        const field =
            document.getElementById(id);

        if (field && !field.value) {

            field.value = email;

        }

    });


    /* ==========================================
       USER DISPLAY
    ========================================== */

    const userNameElements =
        document.querySelectorAll(
            "#userName, #customerName, .user-name"
        );


    userNameElements.forEach(function (element) {

        if (
            element.tagName === "INPUT" ||
            element.tagName === "TEXTAREA"
        ) {

            if (!element.value) {
                element.value = name;
            }

        } else {

            element.textContent = name;

        }

    });


    const userEmailElements =
        document.querySelectorAll(
            "#userEmail, #customerEmail, .user-email"
        );


    userEmailElements.forEach(function (element) {

        if (
            element.tagName === "INPUT" ||
            element.tagName === "TEXTAREA"
        ) {

            if (!element.value) {
                element.value = email;
            }

        } else {

            element.textContent = email;

        }

    });

});