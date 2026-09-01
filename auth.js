import {
    auth
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   REGISTER
========================================================= */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById("name")
                    ?.value
                    .trim();


            const email =
                document.getElementById("email")
                    ?.value
                    .trim();


            const password =
                document.getElementById("password")
                    ?.value || "";


            const confirmPassword =
                document.getElementById("confirmPassword")
                    ?.value || "";


            const message =
                document.getElementById("authMessage");


            if (!message) {
                return;
            }


            message.textContent = "";


            /* =================================================
               VALIDATION
            ================================================= */

            if (!name) {

                message.textContent =
                    "❌ Please enter your name.";

                message.style.color =
                    "#e63b59";

                return;

            }


            if (!email) {

                message.textContent =
                    "❌ Please enter your email.";

                message.style.color =
                    "#e63b59";

                return;

            }


            if (password.length < 6) {

                message.textContent =
                    "❌ Password must be at least 6 characters.";

                message.style.color =
                    "#e63b59";

                return;

            }


            if (password !== confirmPassword) {

                message.textContent =
                    "❌ Passwords do not match.";

                message.style.color =
                    "#e63b59";

                return;

            }


            /* =================================================
               CREATE ACCOUNT
            ================================================= */

            try {

                message.textContent =
                    "Creating your account...";

                message.style.color =
                    "#087c6b";


                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                /* =================================================
                   SAVE DISPLAY NAME
                ================================================= */

                await updateProfile(
                    userCredential.user,
                    {
                        displayName: name
                    }
                );


                message.textContent =
                    "✅ Account created successfully!";

                message.style.color =
                    "#087c6b";


                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                message.style.color =
                    "#e63b59";


                switch (error.code) {

                    case "auth/email-already-in-use":

                        message.textContent =
                            "❌ This email is already registered.";

                        break;


                    case "auth/invalid-email":

                        message.textContent =
                            "❌ Invalid email address.";

                        break;


                    case "auth/weak-password":

                        message.textContent =
                            "❌ Password is too weak.";

                        break;


                    case "auth/api-key-not-valid":

                        message.textContent =
                            "❌ Firebase API key is invalid.";

                        break;


                    case "auth/network-request-failed":

                        message.textContent =
                            "❌ Network error. Check your internet connection.";

                        break;


                    default:

                        message.textContent =
                            "❌ Registration failed: " +
                            error.message;

                }

            }

        }
    );

}


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById("loginEmail")
                    ?.value
                    .trim();


            const password =
                document.getElementById("loginPassword")
                    ?.value || "";


            const message =
                document.getElementById("loginMessage");


            if (!message) {
                return;
            }


            message.textContent =
                "Logging in...";

            message.style.color =
                "#087c6b";


            if (!email || !password) {

                message.textContent =
                    "❌ Please enter email and password.";

                message.style.color =
                    "#e63b59";

                return;

            }


            /* =================================================
               SIGN IN
            ================================================= */

            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                message.textContent =
                    "✅ Login successful!";

                message.style.color =
                    "#087c6b";


                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                message.style.color =
                    "#e63b59";


                switch (error.code) {

                    case "auth/invalid-credential":

                    case "auth/wrong-password":

                        message.textContent =
                            "❌ Incorrect email or password.";

                        break;


                    case "auth/user-not-found":

                        message.textContent =
                            "❌ Account not found.";

                        break;


                    case "auth/invalid-email":

                        message.textContent =
                            "❌ Invalid email address.";

                        break;


                    case "auth/api-key-not-valid":

                        message.textContent =
                            "❌ Firebase API key is invalid.";

                        break;


                    case "auth/network-request-failed":

                        message.textContent =
                            "❌ Network error. Check your internet connection.";

                        break;


                    default:

                        message.textContent =
                            "❌ Login failed: " +
                            error.message;

                }

            }

        }
    );

}


/* =========================================================
   REGISTER PASSWORD SHOW / HIDE
========================================================= */

const showPassword =
    document.getElementById("showPassword");


if (showPassword) {

    showPassword.addEventListener(
        "click",
        function () {

            const input =
                document.getElementById("password");


            if (!input) {
                return;
            }


            if (input.type === "password") {

                input.type =
                    "text";

                showPassword.textContent =
                    "🙈";

            } else {

                input.type =
                    "password";

                showPassword.textContent =
                    "👁️";

            }

        }
    );

}


/* =========================================================
   CONFIRM PASSWORD SHOW / HIDE
========================================================= */

const showConfirmPassword =
    document.getElementById(
        "showConfirmPassword"
    );


if (showConfirmPassword) {

    showConfirmPassword.addEventListener(
        "click",
        function () {

            const input =
                document.getElementById(
                    "confirmPassword"
                );


            if (!input) {
                return;
            }


            if (input.type === "password") {

                input.type =
                    "text";

                showConfirmPassword.textContent =
                    "🙈";

            } else {

                input.type =
                    "password";

                showConfirmPassword.textContent =
                    "👁️";

            }

        }
    );

}


/* =========================================================
   LOGIN PASSWORD SHOW / HIDE
========================================================= */

const showLoginPassword =
    document.getElementById(
        "showLoginPassword"
    );


if (showLoginPassword) {

    showLoginPassword.addEventListener(
        "click",
        function () {

            const input =
                document.getElementById(
                    "loginPassword"
                );


            if (!input) {
                return;
            }


            if (input.type === "password") {

                input.type =
                    "text";

                showLoginPassword.textContent =
                    "🙈";

            } else {

                input.type =
                    "password";

                showLoginPassword.textContent =
                    "👁️";

            }

        }
    );

}