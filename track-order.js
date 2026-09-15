import { auth, authReady, db } from "./firebase.js";

import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


let currentUser = null;
let unsubscribeOrder = null;

const STEPS = [
    "Placed",
    "Shipped",
    "Out for Delivery",
    "Delivered"
];


function showStatus(message) {

    const box =
        document.getElementById("trackingStatus");

    if (box) {
        box.textContent = message;
    }

}


function renderTimeline(status) {

    const timeline =
        document.getElementById("trackingTimeline");

    if (!timeline) return;

    const currentIndex =
        STEPS.indexOf(status);

    const activeIndex =
        currentIndex >= 0 ? currentIndex : 0;

    timeline.innerHTML = STEPS.map((step, index) => {

        const completed = index < activeIndex;
        const active = index === activeIndex;

        return `
            <div class="timeline-step ${completed ? "completed" : ""} ${active ? "active" : ""}">
                <div class="timeline-dot">
                    ${completed ? "✓" : active ? "●" : "○"}
                </div>
                <div class="timeline-content">
                    <strong>${step}</strong>
                    <span>${
                        active
                            ? "Current status"
                            : completed
                                ? "Completed"
                                : "Waiting"
                    }</span>
                </div>
            </div>
        `;
    }).join("");

}


function getOrderIdFromUrl() {

    const params =
        new URLSearchParams(window.location.search);

    return params.get("orderId") || "";

}


function trackOrder() {

    const input =
        document.getElementById("orderIdInput");

    const orderId =
        input.value.trim();

    if (!orderId) {
        showStatus("Please enter your Order ID.");
        return;
    }

    if (!currentUser) {
        showStatus("Please login first.");
        return;
    }

    if (unsubscribeOrder) {
        unsubscribeOrder();
        unsubscribeOrder = null;
    }

    showStatus("Checking your order...");

    // Orders are stored with the custom order ID as the document field,
    // so resolve the matching document once, then listen to it live.
    import("https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js")
        .then(async ({ collection, getDocs, query, where }) => {

            const ordersQuery = query(
                collection(db, "orders"),
                where("userId", "==", currentUser.uid),
                where("orderId", "==", orderId)
            );

            const snapshot = await getDocs(ordersQuery);

            if (snapshot.empty) {
                showStatus("Order not found.");
                renderTimeline("Placed");
                return;
            }

            const orderDoc = snapshot.docs[0];
            const orderRef = doc(db, "orders", orderDoc.id);

            unsubscribeOrder = onSnapshot(
                orderRef,
                (orderSnap) => {

                    if (!orderSnap.exists()) {
                        showStatus("Order not found.");
                        return;
                    }

                    const order = orderSnap.data();

                    if (order.userId !== currentUser.uid) {
                        showStatus("You can only track your own orders.");
                        return;
                    }

                    if (order.status === "Cancelled") {
                        showStatus("This order has been cancelled.");
                        renderTimeline("Placed");
                        return;
                    }

                    if (order.status !== "Accepted") {
                        showStatus("Tracking will be available after your order is accepted.");
                        renderTimeline("Placed");
                        return;
                    }

                    const trackingStatus =
                        order.trackingStatus || "Placed";

                    renderTimeline(trackingStatus);

                    if (trackingStatus === "Delivered") {
                        showStatus("✅ Order delivered successfully.");
                    } else if (trackingStatus === "Out for Delivery") {
                        showStatus("🚚 Your order is out for delivery.");
                    } else if (trackingStatus === "Shipped") {
                        showStatus("📦 Your order has been shipped.");
                    } else {
                        showStatus("🟢 Your order has been placed and accepted.");
                    }
                },
                (error) => {
                    console.error("Order tracking error:", error);
                    showStatus("Unable to load tracking status.");
                }
            );
        })
        .catch(error => {
            console.error("Tracking error:", error);
            showStatus("Unable to start tracking. Please try again.");
        });
}


onAuthStateChanged(auth, async (user) => {

    await authReady;

    currentUser = user;

    if (!user) {
        showStatus("Please login to track your order.");
        return;
    }

    const urlOrderId = getOrderIdFromUrl();
    const input = document.getElementById("orderIdInput");

    if (urlOrderId && input) {
        input.value = urlOrderId;
        trackOrder();
        return;
    }

    showStatus("Enter your Order ID to see delivery status.");
});


document
    .getElementById("trackBtn")
    .addEventListener("click", trackOrder);


document
    .getElementById("orderIdInput")
    .addEventListener("keydown", event => {
        if (event.key === "Enter") {
            trackOrder();
        }
    });
