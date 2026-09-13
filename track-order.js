import { auth, authReady, db } from "./firebase.js";

import {
    doc,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


let currentUser = null;
let unsubscribeLocation = null;
let marker = null;
let map = null;


// ===============================
// INITIALIZE MAP
// ===============================

function initializeMap() {

    map = L.map("map").setView([28.6139, 77.2090], 5);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);
}


// ===============================
// STATUS MESSAGE
// ===============================

function showStatus(message) {

    const box = document.getElementById("trackingStatus");

    if (box) {
        box.textContent = message;
    }
}


// ===============================
// TRACK ORDER
// ===============================

async function trackOrder() {

    const input = document.getElementById("orderIdInput");

    const orderId = input.value.trim();

    if (!orderId) {

        showStatus("Please enter your Order ID.");

        return;
    }


    if (!currentUser) {

        showStatus("Please login first.");

        return;
    }


    // Stop previous realtime listener

    if (unsubscribeLocation) {

        unsubscribeLocation();

        unsubscribeLocation = null;
    }


    try {

        showStatus("Checking your order...");


        /*
         * We support both:
         * 1. Firestore document ID
         * 2. Custom orderId / id stored inside document
         */

        let orderRef = doc(db, "orders", orderId);

        let orderSnap = await getDoc(orderRef);


        // If document ID did not work,
        // search all orders for custom orderId/id.

        if (!orderSnap.exists()) {

            const { collection, getDocs } =
                await import(
                    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
                );

            const ordersSnap =
                await getDocs(collection(db, "orders"));

            let found = null;

            ordersSnap.forEach((item) => {

                const data = item.data();

                const storedOrderId =
                    data.orderId ||
                    data.id ||
                    item.id;

                if (storedOrderId === orderId) {

                    found = item;
                }

            });


            if (!found) {

                showStatus("Order not found.");

                return;
            }


            orderRef = doc(db, "orders", found.id);

            orderSnap = found;
        }


        const order = orderSnap.data();


        // ===============================
        // SECURITY CHECK
        // ===============================

        if (order.userId !== currentUser.uid) {

            showStatus(
                "You can only track your own orders."
            );

            return;
        }


        // ===============================
        // ORDER STATUS CHECK
        // ===============================

        if (order.status !== "Accepted") {

            showStatus(
                "Live tracking will be available after your order is accepted."
            );

            return;
        }


        showStatus(
            "🚚 Live tracking is active."
        );


        // ===============================
        // LISTEN TO GPS LOCATION
        // ===============================

        const locationRef =
    doc(db, "deliveryLocations", orderId);

        unsubscribeLocation =
            onSnapshot(
                locationRef,
                (locationSnap) => {

                    if (!locationSnap.exists()) {

                        showStatus(
                            "Waiting for delivery person's location..."
                        );

                        return;
                    }


                    const location =
                        locationSnap.data();


                    if (
                        typeof location.latitude !== "number" ||
                        typeof location.longitude !== "number"
                    ) {

                        showStatus(
                            "Waiting for valid GPS location..."
                        );

                        return;
                    }


                    const latitude =
                        location.latitude;

                    const longitude =
                        location.longitude;


                    // ===============================
                    // UPDATE MAP
                    // ===============================

                    const position =
                        [latitude, longitude];


                    if (!marker) {

                        marker =
                            L.marker(position)
                                .addTo(map)
                                .bindPopup(
                                    "🚚 Delivery Person"
                                )
                                .openPopup();

                    } else {

                        marker.setLatLng(position);
                    }


                    map.setView(
                        position,
                        16
                    );


                    // ===============================
                    // LOCATION INFORMATION
                    // ===============================

                    const info =
                        document.getElementById(
                            "locationInfo"
                        );


                    if (info) {

                        let accuracyText = "";

                        if (
                            typeof location.accuracy ===
                            "number"
                        ) {

                            accuracyText =
                                `<br>GPS Accuracy: approximately ${Math.round(
                                    location.accuracy
                                )} meters`;
                        }


                        let updatedText =
                            "Location updating live";


                        if (
                            location.updatedAt
                        ) {

                            try {

                                const updatedDate =
                                    location.updatedAt
                                        .toDate
                                        ? location.updatedAt.toDate()
                                        : new Date(
                                            location.updatedAt
                                        );


                                updatedText =
                                    "Last update: " +
                                    updatedDate.toLocaleTimeString();

                            } catch (error) {

                                updatedText =
                                    "Location updating live";
                            }
                        }


                        info.innerHTML =
                            `
                            <strong>🚚 Delivery person location</strong>
                            <br>
                            Latitude: ${latitude.toFixed(6)}
                            <br>
                            Longitude: ${longitude.toFixed(6)}
                            ${accuracyText}
                            <br>
                            ${updatedText}
                            `;
                    }


                    if (
                        location.active === false
                    ) {

                        showStatus(
                            "Delivery tracking has been stopped."
                        );

                    } else {

                        showStatus(
                            "🟢 Delivery location is updating live."
                        );
                    }

                },
                (error) => {

                    console.error(
                        "Location listener error:",
                        error
                    );


                    showStatus(
                        "Unable to receive live delivery location."
                    );
                }
            );


    } catch (error) {

        console.error(
            "Tracking error:",
            error
        );


        showStatus(
            "Unable to start tracking. Please try again."
        );
    }
}


// ===============================
// AUTHENTICATION
// ===============================

onAuthStateChanged(
    auth,
    async (user) => {

        await authReady;

        currentUser = user;


        if (!user) {

            showStatus(
                "Please login to track your order."
            );

            return;
        }


        showStatus(
            "Enter your Order ID to start tracking."
        );
    }
);


// ===============================
// BUTTON
// ===============================

document
    .getElementById("trackBtn")
    .addEventListener(
        "click",
        trackOrder
    );


// ===============================
// ENTER KEY
// ===============================

document
    .getElementById("orderIdInput")
    .addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                trackOrder();
            }
        }
    );


// ===============================
// START MAP
// ===============================

initializeMap();