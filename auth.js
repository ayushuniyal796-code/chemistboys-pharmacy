import { auth } from "./firebase.js";

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
            document.getElementById("name")?.value.trim();

        const email =
            document.getElementById("email")?.value.trim();

        const password =
            document.getElementById("password")?.value || "";

        const confirmPassword =
            document.getElementById("confirmPassword")?.value || "";

        const message =
            document.getElementById("authMessage");


        if (!message) return;


        if (!name) {
            message.textContent = "❌ Please enter your name.";
            return;
        }

        if (password.length < 6) {
            message.textContent =
                "❌ Password must be at least 6 characters.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent =
                "❌ Passwords do not match.";
            return;
        }


        try {

            message.textContent =
                "Creating your account...";
            message.style.color = "#087c6b";


            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            /* SAVE USER NAME IN FIREBASE */

            await updateProfile(
                userCredential.user,
                {
                    displayName: name
                }
            );


            message.textContent =
                "✅ Account created successfully!";


            /* Firebase has already signed the user in */

            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            message.style.color =
                "#e63b59";


            if (error.code === "auth/email-already-in-use") {

                message.textContent =
                    "❌ This email is already registered.";

            } else if (error.code === "auth/invalid-email") {

                message.textContent =
                    "❌ Invalid email address.";

            } else if (error.code === "auth/weak-password") {

                message.textContent =
                    "❌ Password is too weak.";

            } else if (error.code === "auth/api-key-not-valid") {

                message.textContent =
                    "❌ Firebase API key is invalid.";

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
            document.getElementById("loginEmail")?.value.trim();

        const password =
            document.getElementById("loginPassword")?.value || "";

        const message =
            document.getElementById("loginMessage");


        if (!message) return;


        if (!email || !password) {

            message.textContent =
                "❌ Please enter email and password.";

            message.style.color =
                "#e63b59";

            return;
        }


        try {

            message.textContent =
                "Logging in...";

            message.style.color =
                "#087c6b";


            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            message.textContent =
                "✅ Login successful!";


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            message.style.color =
                "#e63b59";


            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password"
            ) {

                message.textContent =
                    "❌ Incorrect email or password.";

            } else if (error.code === "auth/user-not-found") {

                message.textContent =
                    "❌ Account not found.";

            } else if (error.code === "auth/invalid-email") {

                message.textContent =
                    "❌ Invalid email address.";

            } else if (error.code === "auth/api-key-not-valid") {

                message.textContent =
                    "❌ Firebase API key is invalid.";

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
            showPassword.textContent = "🙈";

        } else {

            input.type = "password";
            showPassword.textContent = "👁️";

        }

    });

}


/* =========================================================
   CONFIRM PASSWORD SHOW / HIDE
========================================================= */

const showConfirmPassword =
    document.getElementById("showConfirmPassword");

if (showConfirmPassword) {

    showConfirmPassword.addEventListener("click", () => {

        const input =
            document.getElementById("confirmPassword");

        if (!input) return;


        if (input.type === "password") {

            input.type = "text";
            showConfirmPassword.textContent = "🙈";

        } else {

            input.type = "password";
            showConfirmPassword.textContent = "👁️";

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
            showLoginPassword.textContent = "🙈";

        } else {

            input.type = "password";
            showLoginPassword.textContent = "👁️";

        }

    });

}