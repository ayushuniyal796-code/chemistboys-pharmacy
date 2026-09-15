import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    getDocs,
    onSnapshot,
    query,
    where,
    doc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const STEPS = ["Placed", "Shipped", "Out for Delivery", "Delivered"];
const HISTORY_KEYS = {
    "Placed": "placedAt",
    "Shipped": "shippedAt",
    "Out for Delivery": "outForDeliveryAt",
    "Delivered": "deliveredAt"
};

let currentUser = null;
let unsubscribeOrder = null;

function showStatus(text, type = "normal") {
    const box = document.getElementById("trackingStatus");
    if (!box) return;
    box.textContent = text;
    box.className = `status-box ${type}`;
}

function getOrderIdFromUrl() {
    return new URLSearchParams(window.location.search).get("orderId") || "";
}

function formatTime(value) {
    if (!value) return "";

    try {
        const date = typeof value.toDate === "function"
            ? value.toDate()
            : new Date(value);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch {
        return "";
    }
}

function renderTimeline(status, history = {}) {
    const timeline = document.getElementById("trackingTimeline");
    if (!timeline) return;

    const activeIndex = Math.max(0, STEPS.indexOf(status));

    timeline.innerHTML = STEPS.map((step, index) => {
        // The current status is already achieved, so it also gets a tick.
        // Only future steps remain hollow.
        const completed = index <= activeIndex;
        const active = false;

        const key = HISTORY_KEYS[step];
        const stamp = formatTime(history[key]);

        let label;

        if (completed) {
            label = stamp ? `Completed • ${stamp}` : "Completed";
        } else if (active) {
            label = stamp ? `Current status • ${stamp}` : "Current status";
        } else {
            label = "Waiting";
        }

        return `
            <div class="step ${completed ? "completed" : ""} ${active ? "active" : ""}">
                <div class="dot">${completed ? "✓" : active ? "•" : "○"}</div>
                <div class="content">
                    <strong>${step}</strong>
                    <small>${label}</small>
                </div>
            </div>
        `;
    }).join("");
}

function renderStatusMessage(status) {
    const box = document.getElementById("statusMessage");
    if (!box) return;

    const messages = {
        "Placed": "📦 Order placed successfully.",
        "Shipped": "📦 Order shipped successfully.",
        "Out for Delivery": "🚚 Order is out for delivery.",
        "Delivered": "🎉 Order delivered successfully."
    };

    box.textContent = messages[status] || "";
    box.style.display = messages[status] ? "block" : "none";
}

function renderLocation(location, trackingStatus = "Placed") {
    const locationCard = document.querySelector(".location-card");
    const locationText = document.getElementById("locationText");
    const locationUpdated = document.getElementById("locationUpdated");

    if (!locationText || !locationUpdated) return;

    // Once the order is delivered, never show the delivery person's location.
    if (trackingStatus === "Delivered") {
        if (locationCard) locationCard.style.display = "none";
        return;
    }

    if (locationCard) locationCard.style.display = "";

    // Customer gets ONLY the written location name/address.
    // Latitude/longitude are intentionally never rendered here.
    if (!location || !location.address) {
        locationText.textContent =
            "Waiting for the delivery location to be shared...";
        locationUpdated.textContent =
            "The delivery person's latest place will appear here.";
        return;
    }

    locationText.innerHTML =
        `<span class="live-dot"></span>${escapeHTML(location.address)}`;

    const time = formatTime(location.updatedAt);

    locationUpdated.textContent =
        (location.active
            ? "Live delivery location"
            : "Last shared delivery location") +
        (time ? ` • Updated ${time}` : "");
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function findOwnOrder(orderId) {
    // Avoid a composite Firestore index by querying only the user's orders
    // and matching the visible order ID locally.
    const snap = await getDocs(
        query(
            collection(db, "orders"),
            where("userId", "==", currentUser.uid)
        )
    );

    return snap.docs.find(item => {
        const data = item.data();
        return data.orderId === orderId;
    }) || null;
}

async function trackOrder() {
    const input = document.getElementById("orderIdInput");
    const orderId = input.value.trim();

    if (!orderId) {
        showStatus("Please enter your Order ID.", "error");
        return;
    }

    if (!currentUser) {
        showStatus("Please login first.", "error");
        return;
    }

    if (unsubscribeOrder) {
        unsubscribeOrder();
        unsubscribeOrder = null;
    }

    showStatus("Checking your order...", "normal");

    try {
        const found = await findOwnOrder(orderId);

        if (!found) {
            showStatus("Order not found in your account.", "error");
            renderTimeline("Placed");
            renderStatusMessage("Placed");
            renderLocation(null, "Placed");
            return;
        }

        const orderRef = doc(db, "orders", found.id);

        unsubscribeOrder = onSnapshot(
            orderRef,
            snapshot => {
                if (!snapshot.exists()) {
                    showStatus("Order not found.", "error");
                    return;
                }

                const order = snapshot.data();

                if (order.userId !== currentUser.uid) {
                    showStatus("You can only track your own orders.", "error");
                    return;
                }

                if (order.status === "Cancelled") {
                    showStatus("This order has been cancelled.", "error");
                    renderTimeline("Placed", {});
                    renderStatusMessage("Placed");
                    renderLocation(null, "Placed");
                    return;
                }

                if (order.status !== "Accepted") {
                    showStatus(
                        "Tracking will be available after your order is accepted.",
                        "normal"
                    );
                    renderTimeline("Placed", {});
                    renderStatusMessage("Placed");
                    renderLocation(null);
                    return;
                }

                const trackingStatus = STEPS.includes(order.trackingStatus)
                    ? order.trackingStatus
                    : "Placed";

                renderTimeline(
                    trackingStatus,
                    order.trackingHistory || {}
                );
                renderStatusMessage(trackingStatus);

                renderLocation(order.trackingLocation, trackingStatus);

                if (trackingStatus === "Delivered") {
                    showStatus("✅ Your order has been delivered successfully.", "success");
                } else if (trackingStatus === "Out for Delivery") {
                    showStatus("🚚 Your order is out for delivery.", "success");
                } else if (trackingStatus === "Shipped") {
                    showStatus("📦 Your order has been shipped.", "success");
                } else {
                    showStatus("🟢 Your order has been placed and accepted.", "success");
                }
            },
            error => {
                console.error(error);
                showStatus("Unable to load tracking status.", "error");
            }
        );
    } catch (error) {
        console.error(error);
        showStatus("Unable to start tracking. Please try again.", "error");
    }
}

await authReady;

onAuthStateChanged(auth, user => {
    currentUser = user;

    if (!user) {
        showStatus("Please login to track your order.", "error");
        return;
    }

    const urlId = getOrderIdFromUrl();
    const input = document.getElementById("orderIdInput");

    if (urlId && input) {
        input.value = urlId;
        trackOrder();
    } else {
        showStatus("Enter your Order ID to see delivery status.", "normal");
        renderTimeline("Placed");
        renderStatusMessage("Placed");
    }
});

document.getElementById("trackBtn").addEventListener("click", trackOrder);

document.getElementById("orderIdInput").addEventListener("keydown", event => {
    if (event.key === "Enter") trackOrder();
});
