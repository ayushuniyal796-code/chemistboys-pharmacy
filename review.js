import {
    auth,
    authReady,
    db
} from "./firebase.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


let selectedRating = 0;
let currentUser = null;


// ===============================
// AUTH
// ===============================

await authReady;

currentUser = auth.currentUser;


// ===============================
// ELEMENTS
// ===============================

const stars = document.querySelectorAll(
    "#starRating button"
);

const ratingText = document.getElementById(
    "ratingText"
);

const reviewText = document.getElementById(
    "reviewText"
);

const charCount = document.getElementById(
    "charCount"
);

const submitReview = document.getElementById(
    "submitReview"
);

const reviewMessage = document.getElementById(
    "reviewMessage"
);

const reviewsList = document.getElementById(
    "reviewsList"
);

const averageNumber = document.getElementById(
    "averageNumber"
);


// ===============================
// STAR RATING
// ===============================

stars.forEach((star) => {

    star.addEventListener("click", () => {

        selectedRating =
            Number(star.dataset.rating);

        updateStars();

    });

});


function updateStars() {

    stars.forEach((star) => {

        const rating =
            Number(star.dataset.rating);

        if (rating <= selectedRating) {

            star.classList.add("active");

        } else {

            star.classList.remove("active");

        }

    });


    const ratingMessages = {
        1: "Very bad",
        2: "Needs improvement",
        3: "Good",
        4: "Very good",
        5: "Excellent!"
    };

    ratingText.textContent =
        ratingMessages[selectedRating] ||
        "Select a rating";
}


// ===============================
// CHARACTER COUNT
// ===============================

reviewText.addEventListener(
    "input",
    () => {

        charCount.textContent =
            reviewText.value.length;

    }
);


// ===============================
// SUBMIT REVIEW
// ===============================

submitReview.addEventListener(
    "click",
    async () => {

        reviewMessage.textContent = "";
        reviewMessage.style.color = "";


        // LOGIN CHECK

        if (!currentUser) {

            reviewMessage.textContent =
                "Please login before submitting a review.";

            reviewMessage.style.color = "#d93025";

            return;
        }


        // RATING CHECK

        if (selectedRating === 0) {

            reviewMessage.textContent =
                "Please select a star rating.";

            reviewMessage.style.color = "#d93025";

            return;
        }


        // TEXT CHECK

        const text =
            reviewText.value.trim();


        if (!text) {

            reviewMessage.textContent =
                "Please write your review.";

            reviewMessage.style.color = "#d93025";

            return;
        }


        if (text.length < 3) {

            reviewMessage.textContent =
                "Review must contain at least 3 characters.";

            reviewMessage.style.color = "#d93025";

            return;
        }


        try {

            submitReview.disabled = true;

            submitReview.textContent =
                "Submitting...";


            const reviewerName =
                currentUser.displayName ||
                currentUser.email?.split("@")[0] ||
                "ChemistBoys Customer";


            await addDoc(
                collection(db, "reviews"),
                {

                    userId: currentUser.uid,

                    name: reviewerName,

                    email: currentUser.email || "",

                    rating: selectedRating,

                    review: text,

                    createdAt: serverTimestamp()

                }
            );


            reviewMessage.textContent =
                "Thank you! Your review has been submitted ⭐";

            reviewMessage.style.color =
                "#188038";


            // RESET

            selectedRating = 0;

            updateStars();

            reviewText.value = "";

            charCount.textContent = "0";


        } catch (error) {

            console.error(
                "Review submission error:",
                error
            );

            reviewMessage.textContent =
                "Unable to submit review. Please try again.";

            reviewMessage.style.color =
                "#d93025";

        } finally {

            submitReview.disabled = false;

            submitReview.textContent =
                "⭐ Submit Review";

        }

    }
);


// ===============================
// LOAD REVIEWS REAL-TIME
// ===============================

const reviewsQuery = query(
    collection(db, "reviews"),
    orderBy("createdAt", "desc")
);


onSnapshot(
    reviewsQuery,
    (snapshot) => {

        reviewsList.innerHTML = "";


        if (snapshot.empty) {

            reviewsList.innerHTML = `
                <div class="no-reviews">
                    <div style="font-size:35px;">⭐</div>
                    <p>No reviews yet.</p>
                    <p>Be the first person to review ChemistBoys!</p>
                </div>
            `;

            averageNumber.textContent = "0.0";

            return;
        }


        let totalRating = 0;


        snapshot.forEach((doc) => {

            const data = doc.data();

            const rating =
                Number(data.rating) || 0;

            totalRating += rating;


            const name =
                escapeHTML(
                    data.name ||
                    "ChemistBoys Customer"
                );


            const review =
                escapeHTML(
                    data.review ||
                    ""
                );


            const date =
                formatDate(
                    data.createdAt
                );


            const starsHTML =
                createStars(rating);


            const card =
                document.createElement("div");

            card.className =
                "review-card";


            card.innerHTML = `

                <div class="review-top">

                    <div class="reviewer-name">
                        👤 ${name}
                    </div>

                    <div class="review-date">
                        ${date}
                    </div>

                </div>

                <div class="review-stars">
                    ${starsHTML}
                </div>

                <div class="review-content">
                    ${review}
                </div>

            `;


            reviewsList.appendChild(card);

        });


        const average =
            totalRating / snapshot.size;


        averageNumber.textContent =
            average.toFixed(1);

    },

    (error) => {

        console.error(
            "Reviews loading error:",
            error
        );


        reviewsList.innerHTML = `
            <div class="no-reviews">
                Unable to load reviews right now.
            </div>
        `;

    }
);


// ===============================
// CREATE STAR HTML
// ===============================

function createStars(rating) {

    let result = "";

    for (let i = 1; i <= 5; i++) {

        result +=
            i <= rating
                ? "★"
                : "☆";

    }

    return result;
}


// ===============================
// DATE
// ===============================

function formatDate(timestamp) {

    if (!timestamp) {
        return "Just now";
    }


    try {

        const date =
            timestamp.toDate();


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch {

        return "Just now";

    }
}


// ===============================
// SECURITY
// ===============================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}