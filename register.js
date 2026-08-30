document.addEventListener("DOMContentLoaded", function () {

    const registerForm =
        document.getElementById("registerForm");

    if (!registerForm) {
        console.error("Register form not found.");
        return;
    }


    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        /* ================= VALIDATION ================= */

        if (!name || !email || !password || !confirmPassword) {

            alert("Please fill all fields.");
            return;

        }


        if (password.length < 6) {

            alert("Password must be at least 6 characters.");
            return;

        }


        if (password !== confirmPassword) {

            alert("Passwords do not match.");
            return;

        }


        /* ================= GET USERS ================= */

        let users = [];

        try {

            users =
                JSON.parse(
                    localStorage.getItem("chemistUsers")
                ) || [];

        } catch (error) {

            users = [];

        }


        /* ================= CHECK EMAIL ================= */

        const existingUser =
            users.find(
                user =>
                    user.email.toLowerCase() ===
                    email.toLowerCase()
            );


        if (existingUser) {

            alert(
                "An account with this email already exists. Please login."
            );

            return;

        }


        /* ================= CREATE USER ================= */

        const newUser = {

            id:
                "CBUSER" +
                Date.now(),

            name: name,

            email: email,

            password: password,

            createdAt:
                new Date().toISOString()

        };


        users.push(newUser);


        /* ================= SAVE USER ================= */

        localStorage.setItem(
            "chemistUsers",
            JSON.stringify(users)
        );


        /* ================= LOGIN USER ================= */

        localStorage.setItem(
            "chemistCurrentUser",
            JSON.stringify({

                id: newUser.id,

                name: newUser.name,

                email: newUser.email

            })
        );


        /* ================= SUCCESS ================= */

        alert(
            "✅ Registration successful! Welcome to ChemistBoys."
        );


        window.location.href =
            "index.html";

    });

});