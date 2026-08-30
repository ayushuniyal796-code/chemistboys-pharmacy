import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyCiRX_njFBAAgUzM1vHDTEYgWk1TFLjcmQ",
    authDomain: "chemistboys.firebaseapp.com",
    projectId: "chemistboys",
    storageBucket: "chemistboys.firebasestorage.app",
    messagingSenderId: "696067008650",
    appId: "1:696067008650:web:aba739ed1593d315002573",
    measurementId: "G-G3BHP0PSB0"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* =========================
   REGISTER
========================= */

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

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
                "Creating account...";


            const result =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            await updateProfile(result.user, {
                displayName: name
            });


            /*
             * Force Firebase to refresh
             * the user profile.
             */

            await result.user.reload();


            message.textContent =
                "✅ Registration successful!";


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 500);


        } catch (error) {

            console.error(error);

            message.textContent =
                "❌ Registration failed: " +
                error.message;

        }

    });

}


/* =========================
   LOGIN
========================= */

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");


        try {

            message.textContent =
                "Logging in...";


            const result =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            await result.user.reload();


            message.textContent =
                "✅ Login successful!";


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 500);


        } catch (error) {

            console.error(error);

            message.textContent =
                "❌ Login failed: " +
                error.message;

        }

    });

}