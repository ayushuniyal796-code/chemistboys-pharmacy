import {
    auth
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =================================================
   REGISTER
================================================= */

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


        message.textContent = "";


        if (password.length < 6) {

            message.textContent =
                "❌ Password must be at least 6 characters.";

            message.style.color = "#e63b59";

            return;
        }


        if (password !== confirmPassword) {

            message.textContent =
                "❌ Passwords do not match.";

            message.style.color = "#e63b59";

            return;
        }


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


            const user =
                userCredential.user;


            await updateProfile(user, {
                displayName: name
            });


            /*
             * Confirm user is actually available
             * in the SAME Firebase auth instance.
             */

            if (!auth.currentUser) {

                throw new Error(
                    "Firebase authentication was not established."
                );

            }


            message.textContent =
                "✅ Account created successfully!";

            message.style.color =
                "#087c6b";


            /*
             * Direct redirect.
             * No artificial timeout.
             */

            window.location.href =
                "index.html";

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


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


/* =================================================
   LOGIN
================================================= */

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


        message.textContent =
            "Logging in...";

        message.style.color =
            "#087c6b";


        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            /*
             * IMPORTANT:
             * Login successful hone ke baad
             * SAME auth instance mein user hona chahiye.
             */

            if (!auth.currentUser) {

                throw new Error(
                    "Firebase login completed but currentUser is unavailable."
                );

            }


            console.log(
                "Logged in user:",
                user.uid,
                user.email,
                user.displayName
            );


            message.textContent =
                "✅ Login successful!";

            message.style.color =
                "#087c6b";


            /*
             * No setTimeout.
             * Firebase sign-in already completed.
             */

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
                error.code ===
                    "auth/invalid-credential" ||
                error.code ===
                    "auth/wrong-password"
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


/* =================================================
   REGISTER PASSWORD SHOW / HIDE
================================================= */

const showPassword =
    document.getElementById("showPassword");

if (showPassword) {

    showPassword.addEventListener("click", () => {

        const input =
            document.getElementById("password");


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


/* =================================================
   LOGIN PASSWORD SHOW / HIDE
================================================= */

const showLoginPassword =
    document.getElementById("showLoginPassword");

if (showLoginPassword) {

    showLoginPassword.addEventListener("click", () => {

        const input =
            document.getElementById("loginPassword");


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