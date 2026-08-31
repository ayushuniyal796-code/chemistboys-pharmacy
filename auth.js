import {
    auth,
    authReady
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

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("authMessage");


        if (message) {
            message.textContent = "";
        }


        if (password.length < 6) {

            if (message) {
                message.textContent =
                    "❌ Password must be at least 6 characters.";

                message.style.color = "#e63b59";
            }

            return;
        }


        if (password !== confirmPassword) {

            if (message) {
                message.textContent =
                    "❌ Passwords do not match.";

                message.style.color = "#e63b59";
            }

            return;
        }


        try {

            if (message) {
                message.textContent =
                    "Creating your account...";

                message.style.color = "#087c6b";
            }


            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            /* SAVE USER NAME IN FIREBASE */

            await updateProfile(user, {
                displayName: name
            });


            /*
             * Make sure Firebase auth state
             * has been initialized.
             */

            await authReady;


            if (message) {
                message.textContent =
                    "✅ Account created successfully!";

                message.style.color = "#087c6b";
            }


            /*
             * User is already authenticated here.
             * No fake localStorage login is used.
             */

            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            if (!message) return;

            message.style.color =
                "#e63b59";


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                message.textContent =
                    "❌ This email is already registered.";

            } else if (
                error.code ===
                "auth/weak-password"
            ) {

                message.textContent =
                    "❌ Password is too weak.";

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message.textContent =
                    "❌ Invalid email address.";

            } else {

                message.textContent =
                    "❌ Registration failed: " +
                    error.message;

            }

        }

    });

}


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail")
                .value
                .trim();

        const password =
            document.getElementById("loginPassword")
                .value;

        const message =
            document.getElementById("loginMessage");


        if (message) {

            message.textContent =
                "Logging in...";

            message.style.color =
                "#087c6b";

        }


        try {

            /*
             * LOGIN USING THE SAME AUTH INSTANCE
             */

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            /*
             * Make sure the signed-in user
             * is available from this SAME auth instance.
             */

            await authReady;


            const user =
                userCredential.user;


            if (!user || !auth.currentUser) {

                throw new Error(
                    "Firebase authentication state was not restored."
                );

            }


            if (message) {

                message.textContent =
                    "✅ Login successful!";

                message.style.color =
                    "#087c6b";

            }


            /*
             * Direct redirect.
             * No unnecessary timeout.
             */

            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            if (!message) return;

            message.style.color =
                "#e63b59";


            if (
                error.code ===
                    "auth/invalid-credential" ||
                error.code ===
                    "auth/wrong-password" ||
                error.code ===
                    "auth/invalid-login-credentials"
            ) {

                message.textContent =
                    "❌ Incorrect email or password.";

            } else if (
                error.code ===
                "auth/user-not-found"
            ) {

                message.textContent =
                    "❌ Account not found.";

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message.textContent =
                    "❌ Invalid email address.";

            } else {

                message.textContent =
                    "❌ Login failed: " +
                    error.message;

            }

        }

    });

}


/* =========================================================
   REGISTER PASSWORD SHOW / HIDE
========================================================= */

const showPassword =
    document.getElementById("showPassword");

if (showPassword) {

    showPassword.addEventListener("click", () => {

        const input =
            document.getElementById("password");


        if (!input) return;


        if (input.type === "password") {

            input.type = "text";

            showPassword.textContent =
                "🙈";

        } else {

            input.type = "password";

            showPassword.textContent =
                "👁️";

        }

    });

}


/* =========================================================
   LOGIN PASSWORD SHOW / HIDE
========================================================= */

const showLoginPassword =
    document.getElementById("showLoginPassword");

if (showLoginPassword) {

    showLoginPassword.addEventListener("click", () => {

        const input =
            document.getElementById("loginPassword");


        if (!input) return;


        if (input.type === "password") {

            input.type = "text";

            showLoginPassword.textContent =
                "🙈";

        } else {

            input.type = "password";

            showLoginPassword.textContent =
                "👁️";

        }

    });

}