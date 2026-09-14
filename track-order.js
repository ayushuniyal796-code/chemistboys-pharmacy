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

/* =========================================================
   CHEMISTBOYS - ORDER TIMELINE VIEW
   ADD THIS CODE AT THE VERY END
   DO NOT DELETE EXISTING CODE
   ========================================================= */

(() => {

    /* -----------------------------------------------------
       HIDE OLD MAP UI
       ----------------------------------------------------- */

    const hideOldMapUI = () => {

        const mapBox = document.getElementById("map");
        const infoBox = document.querySelector(".info-box");

        if (mapBox) {
            mapBox.style.display = "none";
        }

        if (infoBox) {
            infoBox.style.display = "none";
        }

    };


    hideOldMapUI();


    /* -----------------------------------------------------
       ADD TIMELINE CSS
       ----------------------------------------------------- */

    const style = document.createElement("style");

    style.textContent = `

        .cb-timeline-box {
            background: white;
            padding: 25px 22px;
            border-radius: 18px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.08);
            margin-top: 20px;
        }

        .cb-timeline-title {
            margin: 0 0 25px 0;
            color: #075f55;
            font-size: 24px;
        }

        .cb-timeline {
            position: relative;
            margin-left: 8px;
        }

        .cb-timeline-item {
            position: relative;
            padding-left: 38px;
            padding-bottom: 30px;
        }

        .cb-timeline-item:last-child {
            padding-bottom: 5px;
        }

        .cb-timeline-item::before {
            content: "";
            position: absolute;
            left: 7px;
            top: 18px;
            width: 3px;
            height: calc(100% - 5px);
            background: #d8e8e5;
        }

        .cb-timeline-item:last-child::before {
            display: none;
        }

        .cb-timeline-dot {
            position: absolute;
            left: 0;
            top: 0;
            width: 17px;
            height: 17px;
            border-radius: 50%;
            background: #d1dedb;
            border: 3px solid white;
            box-shadow: 0 0 0 2px #d1dedb;
            z-index: 2;
        }

        .cb-timeline-item.active .cb-timeline-dot {
            background: #28a745;
            box-shadow: 0 0 0 2px #28a745;
        }

        .cb-timeline-item.active::before {
            background: #28a745;
        }

        .cb-timeline-status {
            font-size: 19px;
            font-weight: 700;
            color: #222;
        }

        .cb-timeline-date {
            color: #777;
            font-size: 14px;
            margin-left: 5px;
            font-weight: 500;
        }

        .cb-timeline-message {
            margin-top: 12px;
            color: #333;
            font-size: 15px;
            line-height: 1.5;
        }

        .cb-timeline-location {
            margin-top: 5px;
            color: #667b78;
            font-size: 14px;
        }

        .cb-timeline-location strong {
            color: #075f55;
        }

        .cb-timeline-pending {
            color: #999;
        }

        @media (max-width: 600px) {

            .cb-timeline-box {
                padding: 20px 16px;
            }

            .cb-timeline-status {
                font-size: 17px;
            }

            .cb-timeline-date {
                display: block;
                margin: 4px 0 0 0;
            }

        }

    `;

    document.head.appendChild(style);


    /* -----------------------------------------------------
       CREATE TIMELINE CONTAINER
       ----------------------------------------------------- */

    const trackingBox =
        document.querySelector(".tracking-box");

    if (!trackingBox) {
        return;
    }


    let timelineBox =
        document.getElementById("cbOrderTimeline");


    if (!timelineBox) {

        timelineBox =
            document.createElement("div");

        timelineBox.id =
            "cbOrderTimeline";

        timelineBox.className =
            "cb-timeline-box";

        timelineBox.innerHTML = `

            <h2 class="cb-timeline-title">
                📦 Order Tracking
            </h2>

            <div id="cbTimelineContent">
                Enter your Order ID to see tracking details.
            </div>

        `;

        trackingBox.parentNode.insertBefore(
            timelineBox,
            trackingBox.nextSibling
        );

    }


    /* -----------------------------------------------------
       FORMAT DATE
       ----------------------------------------------------- */

    function formatTimelineDate(value) {

        if (!value) {
            return "";
        }

        try {

            let date;

            if (
                value &&
                typeof value.toDate === "function"
            ) {

                date = value.toDate();

            } else {

                date = new Date(value);

            }

            if (isNaN(date.getTime())) {
                return "";
            }

            return date.toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        } catch {

            return "";

        }

    }


    /* -----------------------------------------------------
       FIND TRACKING DATA
       ----------------------------------------------------- */

    function getTrackingDate(
        order,
        stage
    ) {

        if (
            order.tracking &&
            order.tracking[stage]
        ) {

            return (
                order.tracking[stage].timestamp ||
                order.tracking[stage].date ||
                ""
            );

        }

        return "";

    }


    /* -----------------------------------------------------
       LOCATION NAME
       ----------------------------------------------------- */

    function getLocationName(
        order,
        stage
    ) {

        if (
            order.tracking &&
            order.tracking[stage] &&
            order.tracking[stage].locationName
        ) {

            return order.tracking[stage].locationName;

        }


        return (
            order.city ||
            order.customerCity ||
            order.deliveryCity ||
            ""
        );

    }


    /* -----------------------------------------------------
       RENDER TIMELINE
       ----------------------------------------------------- */

    function renderTimeline(order) {

        const content =
            document.getElementById(
                "cbTimelineContent"
            );

        if (!content) {
            return;
        }


        const currentStatus =
            String(
                order.status ||
                "Processing"
            ).toLowerCase();


        const stages = [

            {
                key: "confirmed",
                title: "Order Confirmed",
                message:
                    "Your order has been placed."
            },

            {
                key: "processed",
                title: "Seller has processed your order.",
                message:
                    "Your order has been processed."
            },

            {
                key: "shipped",
                title: "Shipped",
                message:
                    "Your item has been shipped."
            },

            {
                key: "outForDelivery",
                title: "Out For Delivery",
                message:
                    "Your item is out for delivery."
            },

            {
                key: "delivered",
                title: "Delivered",
                message:
                    "Your item has been delivered."
            }

        ];


        let currentIndex = 0;


        if (
            currentStatus === "accepted"
        ) {

            currentIndex = 1;

        } else if (
            currentStatus === "shipped"
        ) {

            currentIndex = 2;

        } else if (
            currentStatus === "out for delivery" ||
            currentStatus === "outfordelivery"
        ) {

            currentIndex = 3;

        } else if (
            currentStatus === "delivered"
        ) {

            currentIndex = 4;

        } else if (
            currentStatus === "cancelled"
        ) {

            content.innerHTML = `

                <div style="
                    padding:15px;
                    border-radius:10px;
                    background:#fff1f1;
                    color:#b42318;
                    font-weight:700;
                ">
                    ❌ This order has been cancelled.
                </div>

            `;

            return;

        }


        let html =
            `<div class="cb-timeline">`;


        stages.forEach(
            (stage, index) => {

                const completed =
                    index <= currentIndex;


                let timestamp =
                    getTrackingDate(
                        order,
                        stage.key
                    );


                /* Old order fallback */

                if (
                    stage.key === "confirmed" &&
                    !timestamp
                ) {

                    timestamp =
                        order.createdAt ||
                        order.date ||
                        order.orderDate ||
                        "";

                }


                const dateText =
                    formatTimelineDate(
                        timestamp
                    );


                const location =
                    getLocationName(
                        order,
                        stage.key
                    );


                html += `

                    <div class="
                        cb-timeline-item
                        ${completed ? "active" : ""}
                    ">

                        <div class="cb-timeline-dot"></div>

                        <div>

                            <span class="cb-timeline-status">
                                ${stage.title}
                            </span>

                            ${
                                dateText
                                    ? `
                                        <span class="cb-timeline-date">
                                            ${dateText}
                                        </span>
                                      `
                                    : ""
                            }

                            <div class="cb-timeline-message
                                ${completed ? "" : "cb-timeline-pending"}">

                                ${
                                    completed
                                        ? stage.message
                                        : "Waiting for this step."
                                }

                            </div>

                            ${
                                completed && location
                                    ? `
                                        <div class="cb-timeline-location">
                                            📍 <strong>${location}</strong>
                                        </div>
                                      `
                                    : ""
                            }

                        </div>

                    </div>

                `;

            }
        );


        html += `</div>`;


        content.innerHTML =
            html;

    }


    /* -----------------------------------------------------
       FIND ORDER
       ----------------------------------------------------- */

    async function findOrderForTimeline(
        orderId
    ) {

        if (!window.currentFirebaseUser) {

            return null;

        }


        const user =
            window.currentFirebaseUser;


        try {

            const firestore =
                await import(
                    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
                );


            const {
                collection,
                query,
                where,
                getDocs
            } = firestore;


            /* Search by custom orderId */

            let q =
                query(
                    collection(
                        db,
                        "orders"
                    ),
                    where(
                        "userId",
                        "==",
                        user.uid
                    ),
                    where(
                        "orderId",
                        "==",
                        orderId
                    )
                );


            let snapshot =
                await getDocs(q);


            if (!snapshot.empty) {

                return snapshot.docs[0].data();

            }


            /* Search by custom id */

            q =
                query(
                    collection(
                        db,
                        "orders"
                    ),
                    where(
                        "userId",
                        "==",
                        user.uid
                    ),
                    where(
                        "id",
                        "==",
                        orderId
                    )
                );


            snapshot =
                await getDocs(q);


            if (!snapshot.empty) {

                return snapshot.docs[0].data();

            }


            /* Search by Firestore document ID */

            const orderRef =
                firestore.doc(
                    db,
                    "orders",
                    orderId
                );


            const orderSnap =
                await firestore.getDoc(
                    orderRef
                );


            if (
                orderSnap.exists() &&
                orderSnap.data().userId === user.uid
            ) {

                return orderSnap.data();

            }


            return null;

        } catch (error) {

            console.error(
                "Timeline order search error:",
                error
            );

            return null;

        }

    }


    /* -----------------------------------------------------
       TRACK BUTTON
       ----------------------------------------------------- */

    const trackButton =
        document.getElementById(
            "trackBtn"
        );


    if (
        trackButton &&
        !trackButton.dataset.timelineAttached
    ) {

        trackButton.dataset.timelineAttached =
            "true";


        trackButton.addEventListener(
            "click",
            async (event) => {

                /*
                 * Stop the OLD map tracking function
                 * from running.
                 */

                event.preventDefault();

                event.stopImmediatePropagation();


                hideOldMapUI();


                const input =
                    document.getElementById(
                        "orderIdInput"
                    );


                if (!input) {
                    return;
                }


                const orderId =
                    input.value.trim();


                const content =
                    document.getElementById(
                        "cbTimelineContent"
                    );


                if (!orderId) {

                    content.innerHTML = `
                        <div class="cb-timeline-pending">
                            Please enter your Order ID.
                        </div>
                    `;

                    return;

                }


                content.innerHTML = `
                    <div class="cb-timeline-pending">
                        Checking your order...
                    </div>
                `;


                const order =
                    await findOrderForTimeline(
                        orderId
                    );


                if (!order) {

                    content.innerHTML = `
                        <div style="
                            padding:15px;
                            border-radius:10px;
                            background:#fff1f1;
                            color:#b42318;
                            font-weight:700;
                        ">
                            Order not found or you are not
                            authorized to view this order.
                        </div>
                    `;

                    return;

                }


                renderTimeline(
                    order
                );

            },
            true
        );

    }


    /* -----------------------------------------------------
       ENTER KEY
       ----------------------------------------------------- */

    const orderInput =
        document.getElementById(
            "orderIdInput"
        );


    if (
        orderInput &&
        !orderInput.dataset.timelineAttached
    ) {

        orderInput.dataset.timelineAttached =
            "true";


        orderInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    if (trackButton) {
                        trackButton.click();
                    }

                }

            }
        );

    }


})();