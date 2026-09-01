/* =========================================================
   CHEMISTBOYS - REGISTER
========================================================= */

import {
    auth,
    authReady
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   REGISTER FORM
========================================================= */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =================================================
               GET FORM VALUES
            ================================================= */

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            const message =
                document.getElementById("authMessage");


            /* =================================================
               CLEAR MESSAGE
            ================================================= */

            if (message) {

                message.textContent = "";

            }


            /* =================================================
               VALIDATION
            ================================================= */

            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                if (message) {

                    message.textContent =
                        "❌ Please fill all fields.";

                    message.style.color =
                        "#e63b59";

                }

                return;

            }


            if (password.length < 6) {

                if (message) {

                    message.textContent =
                        "❌ Password must be at least 6 characters.";

                    message.style.color =
                        "#e63b59";

                }

                return;

            }


            if (password !== confirmPassword) {

                if (message) {

                    message.textContent =
                        "❌ Passwords do not match.";

                    message.style.color =
                        "#e63b59";

                }

                return;

            }


            /* =================================================
               CREATE FIREBASE ACCOUNT
            ================================================= */

            try {

                if (message) {

                    message.textContent =
                        "Creating your account...";

                    message.style.color =
                        "#087c6b";

                }


                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                /* =================================================
                   SET DISPLAY NAME
                ================================================= */

                await updateProfile(
                    userCredential.user,
                    {
                        displayName: name
                    }
                );


                /* =================================================
                   WAIT FOR AUTH STATE
                ================================================= */

                await authReady;


                /* =================================================
                   SUCCESS
                ================================================= */

                if (message) {

                    message.textContent =
                        "✅ Account created successfully!";

                    message.style.color =
                        "#087c6b";

                }


                /* =================================================
                   REDIRECT
                ================================================= */

                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                if (message) {

                    message.style.color =
                        "#e63b59";

                }


                /* =================================================
                   FIREBASE ERRORS
                ================================================= */

                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    if (message) {

                        message.textContent =
                            "❌ This email is already registered. Please login.";

                    }

                }


                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    if (message) {

                        message.textContent =
                            "❌ Invalid email address.";

                    }

                }


                else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    if (message) {

                        message.textContent =
                            "❌ Password is too weak.";

                    }

                }


                else if (
                    error.code ===
                    "auth/api-key-not-valid"
                ) {

                    if (message) {

                        message.textContent =
                            "❌ Firebase API key is invalid.";

                    }

                }


                else {

                    if (message) {

                        message.textContent =
                            "❌ Registration failed: " +
                            error.message;

                    }

                }

            }

        }
    );

}