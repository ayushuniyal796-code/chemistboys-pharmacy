/* =========================================================
   CHEMISTBOYS - FIREBASE AUTHENTICATION
   LOGIN + REGISTER
========================================================= */

import {
    auth
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* =====================================================
           LOGIN FORM
        ===================================================== */

        const loginForm =
            document.getElementById("loginForm");


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const email =
                        document
                            .getElementById("loginEmail")
                            .value
                            .trim();


                    const password =
                        document
                            .getElementById("loginPassword")
                            .value;


                    const message =
                        document.getElementById(
                            "loginMessage"
                        );


                    if (!email || !password) {

                        if (message) {
                            message.textContent =
                                "Please fill all fields.";
                        }

                        return;

                    }


                    const button =
                        loginForm.querySelector(
                            'button[type="submit"]'
                        );


                    try {

                        if (button) {
                            button.disabled = true;
                            button.textContent =
                                "🔄 Logging in...";
                        }


                        if (message) {
                            message.textContent =
                                "Checking account...";
                        }


                        /* Firebase Login */

                        await signInWithEmailAndPassword(
                            auth,
                            email,
                            password
                        );


                        if (message) {
                            message.textContent =
                                "✅ Login successful!";
                        }


                        /*
                         * Firebase auth state is now updated.
                         * Redirect to home.
                         */

                        window.location.href =
                            "index.html";


                    } catch (error) {

                        console.error(
                            "Login error:",
                            error
                        );


                        if (message) {

                            switch (error.code) {

                                case "auth/invalid-credential":
                                case "auth/wrong-password":
                                case "auth/user-not-found":

                                    message.textContent =
                                        "❌ Invalid email or password.";

                                    break;


                                case "auth/invalid-email":

                                    message.textContent =
                                        "❌ Please enter a valid email.";

                                    break;


                                case "auth/too-many-requests":

                                    message.textContent =
                                        "❌ Too many attempts. Try again later.";

                                    break;


                                default:

                                    message.textContent =
                                        "❌ Login failed. Please try again.";

                            }

                        }


                        if (button) {

                            button.disabled = false;

                            button.textContent =
                                "🔐 Login";

                        }

                    }

                }
            );

        }


        /* =====================================================
           REGISTER FORM
        ===================================================== */

        const registerForm =
            document.getElementById("registerForm");


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


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
                        document.getElementById(
                            "authMessage"
                        );


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
                                "Please fill all fields.";
                        }

                        return;

                    }


                    if (password.length < 6) {

                        if (message) {
                            message.textContent =
                                "❌ Password must be at least 6 characters.";
                        }

                        return;

                    }


                    if (password !== confirmPassword) {

                        if (message) {
                            message.textContent =
                                "❌ Passwords do not match.";
                        }

                        return;

                    }


                    const button =
                        registerForm.querySelector(
                            'button[type="submit"]'
                        );


                    try {

                        if (button) {

                            button.disabled = true;

                            button.textContent =
                                "🔄 Creating account...";

                        }


                        if (message) {

                            message.textContent =
                                "Creating your Firebase account...";

                        }


                        /* =================================================
                           CREATE FIREBASE USER
                        ================================================= */

                        const userCredential =
                            await createUserWithEmailAndPassword(
                                auth,
                                email,
                                password
                            );


                        const user =
                            userCredential.user;


                        /* =================================================
                           SAVE DISPLAY NAME IN FIREBASE
                        ================================================= */

                        await updateProfile(
                            user,
                            {
                                displayName: name
                            }
                        );


                        if (message) {

                            message.textContent =
                                "✅ Account created successfully!";

                        }


                        /*
                         * Firebase automatically logs the newly
                         * created user in.
                         */

                        window.location.href =
                            "index.html";


                    } catch (error) {

                        console.error(
                            "Registration error:",
                            error
                        );


                        if (message) {

                            switch (error.code) {

                                case "auth/email-already-in-use":

                                    message.textContent =
                                        "❌ This email is already registered. Please login.";

                                    break;


                                case "auth/invalid-email":

                                    message.textContent =
                                        "❌ Please enter a valid email.";

                                    break;


                                case "auth/weak-password":

                                    message.textContent =
                                        "❌ Password is too weak. Use at least 6 characters.";

                                    break;


                                default:

                                    message.textContent =
                                        "❌ Registration failed. Please try again.";

                            }

                        }


                        if (button) {

                            button.disabled = false;

                            button.textContent =
                                "📝 Create Account";

                        }

                    }

                }
            );

        }


        /* =====================================================
           LOGIN PASSWORD SHOW / HIDE
        ===================================================== */

        const showLoginPassword =
            document.getElementById(
                "showLoginPassword"
            );


        const loginPassword =
            document.getElementById(
                "loginPassword"
            );


        if (
            showLoginPassword &&
            loginPassword
        ) {

            showLoginPassword.addEventListener(
                "click",
                function () {

                    if (
                        loginPassword.type ===
                        "password"
                    ) {

                        loginPassword.type =
                            "text";

                        showLoginPassword.textContent =
                            "🙈";

                    } else {

                        loginPassword.type =
                            "password";

                        showLoginPassword.textContent =
                            "👁️";

                    }

                }
            );

        }


        /* =====================================================
           REGISTER PASSWORD SHOW / HIDE
        ===================================================== */

        const showPassword =
            document.getElementById(
                "showPassword"
            );


        const passwordInput =
            document.getElementById(
                "password"
            );


        if (
            showPassword &&
            passwordInput
        ) {

            showPassword.addEventListener(
                "click",
                function () {

                    if (
                        passwordInput.type ===
                        "password"
                    ) {

                        passwordInput.type =
                            "text";

                        showPassword.textContent =
                            "🙈";

                    } else {

                        passwordInput.type =
                            "password";

                        showPassword.textContent =
                            "👁️";

                    }

                }
            );

        }

    }
);