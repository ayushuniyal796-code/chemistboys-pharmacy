import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/*
====================================================
🔥 FIREBASE CONFIG
====================================================

Apne Firebase project se ye values copy karke
yahan paste karni hain.
*/

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId:
        "YOUR_MESSAGING_SENDER_ID",

    appId:
        "YOUR_APP_ID"
};


/* Firebase Start */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* =================================================
REGISTER
================================================= */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

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
                document
                    .getElementById("authMessage");


            message.textContent =
                "";


            /* Password Match */

            if (password !== confirmPassword) {

                message.textContent =
                    "❌ Passwords do not match.";

                message.style.color =
                    "#e63b59";

                return;
            }


            try {

                message.textContent =
                    "Creating your account...";


                message.style.color =
                    "#087c6b";


                /* Create Firebase Account */

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                /* Save user's name */

                await updateProfile(
                    user,
                    {
                        displayName: name
                    }
                );


                message.textContent =
                    "✅ Account created successfully!";


                message.style.color =
                    "#087c6b";


                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 1200);


            } catch (error) {

                console.error(error);


                message.style.color =
                    "#e63b59";


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    message.textContent =
                        "❌ This email is already registered.";

                }

                else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    message.textContent =
                        "❌ Password is too weak.";

                }

                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    message.textContent =
                        "❌ Invalid email address.";

                }

                else {

                    message.textContent =
                        "❌ Registration failed. Please try again.";

                }

            }

        }
    );

}


/* =================================================
LOGIN
================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

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
                document
                    .getElementById("loginMessage");


            message.textContent =
                "Logging in...";


            message.style.color =
                "#087c6b";


            try {

                /* Real Firebase Login */

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                message.textContent =
                    "✅ Login successful!";


                message.style.color =
                    "#087c6b";


                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 800);


            } catch (error) {

                console.error(error);


                message.style.color =
                    "#e63b59";


                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    message.textContent =
                        "❌ Incorrect email or password.";

                }

                else if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    message.textContent =
                        "❌ Account not found.";

                }

                else {

                    message.textContent =
                        "❌ Login failed.";

                }

            }

        }
    );

}


/* =================================================
SHOW / HIDE PASSWORD
================================================= */

const showPassword =
    document.getElementById(
        "showPassword"
    );


if (showPassword) {

    showPassword.addEventListener(
        "click",
        () => {

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


/* LOGIN PASSWORD */

const showLoginPassword =
    document.getElementById(
        "showLoginPassword"
    );


if (showLoginPassword) {

    showLoginPassword.addEventListener(
        "click",
        () => {

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