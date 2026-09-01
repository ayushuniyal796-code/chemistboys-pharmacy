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


            if (password.length < 6) {

                showError(
                    message,
                    "❌ Password must be at least 6 characters."
                );

                return;

            }


            if (password !== confirmPassword) {

                showError(
                    message,
                    "❌ Passwords do not match."
                );

                return;

            }


            try {

                showSuccess(
                    message,
                    "Creating your account..."
                );


                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                await updateProfile(
                    userCredential.user,
                    {
                        displayName: name
                    }
                );


                showSuccess(
                    message,
                    "✅ Account created successfully!"
                );


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


                showFirebaseError(
                    message,
                    error,
                    "Registration"
                );

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


            showSuccess(
                message,
                "Logging in..."
            );


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                showSuccess(
                    message,
                    "✅ Login successful!"
                );


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


                showFirebaseError(
                    message,
                    error,
                    "Login"
                );

            }

        }
    );

}


/* =========================================================
   REGISTER PASSWORD SHOW / HIDE
========================================================= */

const showPassword =
    document.getElementById(
        "showPassword"
    );


if (showPassword) {

    showPassword.addEventListener(
        "click",
        function () {

            const input =
                document.getElementById(
                    "password"
                );


            if (input.type === "password") {

                input.type = "text";

                showPassword.textContent =
                    "🙈";

            } else {

                input.type = "password";

                showPassword.textContent =
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


            if (input.type === "password") {

                input.type = "text";

                showLoginPassword.textContent =
                    "🙈";

            } else {

                input.type = "password";

                showLoginPassword.textContent =
                    "👁️";

            }

        }
    );

}


/* =========================================================
   MESSAGE HELPERS
========================================================= */

function showSuccess(
    element,
    text
) {

    if (!element) return;

    element.textContent =
        text;

    element.style.color =
        "#087c6b";

}


function showError(
    element,
    text
) {

    if (!element) return;

    element.textContent =
        text;

    element.style.color =
        "#e63b59";

}


/* =========================================================
   FIREBASE ERROR HANDLING
========================================================= */

function showFirebaseError(
    element,
    error,
    type
) {

    if (!element) return;


    const code =
        error.code || "";


    if (
        code ===
        "auth/email-already-in-use"
    ) {

        showError(
            element,
            "❌ This email is already registered."
        );

    }

    else if (
        code ===
        "auth/weak-password"
    ) {

        showError(
            element,
            "❌ Password is too weak."
        );

    }

    else if (
        code ===
        "auth/invalid-email"
    ) {

        showError(
            element,
            "❌ Invalid email address."
        );

    }

    else if (
        code ===
            "auth/invalid-credential" ||
        code ===
            "auth/wrong-password"
    ) {

        showError(
            element,
            "❌ Incorrect email or password."
        );

    }

    else if (
        code ===
        "auth/user-not-found"
    ) {

        showError(
            element,
            "❌ Account not found."
        );

    }

    else if (
        code ===
        "auth/api-key-not-valid"
    ) {

        showError(
            element,
            "❌ Firebase API key is invalid."
        );

    }

    else {

        showError(
            element,
            `❌ ${type} failed: ${error.message}`
        );

    }

}