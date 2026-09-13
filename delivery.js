import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const ADMIN_UID =
    "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


let currentUser = null;
let watchId = null;
let tracking = false;


const orderInput =
    document.getElementById("orderId");

const startBtn =
    document.getElementById("startTrackingBtn");

const stopBtn =
    document.getElementById("stopTrackingBtn");

const statusBox =
    document.getElementById("trackingStatus");

const locationBox =
    document.getElementById("locationInfo");

const logoutBtn =
    document.getElementById("logoutBtn");


function showStatus(message, type = "") {

    statusBox.textContent = message;

    statusBox.className = "status-box";

    if (type) {
        statusBox.classList.add(type);
    }
}


await authReady;


onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.uid !== ADMIN_UID) {

        document.body.innerHTML =
            "<h2>🚫 Access Denied</h2>";

        return;
    }

    currentUser = user;

});


/* =========================
   CHECK ORDER
========================= */

async function checkOrder(orderId) {

    let snapshot;

    // First check custom "id" field
    const q1 = query(
        collection(db, "orders"),
        where("id", "==", orderId)
    );

    snapshot = await getDocs(q1);

    // If not found, check old "orderId" field
    if (snapshot.empty) {

        const q2 = query(
            collection(db, "orders"),
            where("orderId", "==", orderId)
        );

        snapshot = await getDocs(q2);
    }


    if (snapshot.empty) {

        throw new Error(
            "Order not found."
        );

    }


    const orderDoc =
        snapshot.docs[0];

    const order =
        orderDoc.data();


    if (order.status !== "Accepted") {

        throw new Error(
            "This order has not been accepted yet."
        );

    }


    return order;
}


/* =========================
   START GPS TRACKING
========================= */

async function startTracking() {

    if (tracking) {
        return;
    }


    const orderId =
        orderInput.value.trim();


    if (!orderId) {

        showStatus(
            "Please enter an Order ID.",
            "warning"
        );

        return;
    }


    if (!navigator.geolocation) {

        showStatus(
            "GPS is not supported by this browser.",
            "error"
        );

        return;
    }


    try {

        showStatus(
            "Checking order...",
            ""
        );


        await checkOrder(orderId);


        showStatus(
            "Requesting GPS permission...",
            "warning"
        );


        watchId =
            navigator.geolocation.watchPosition(

                async (position) => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    const accuracy =
                        position.coords.accuracy;


                    tracking = true;

                    startBtn.disabled = true;

                    stopBtn.disabled = false;


                    showStatus(
                        "🟢 Live GPS tracking is active.",
                        "success"
                    );


                    locationBox.innerHTML = `
                        <strong>Current Location</strong><br>
                        Latitude: ${latitude.toFixed(6)}<br>
                        Longitude: ${longitude.toFixed(6)}<br>
                        Accuracy: ±${Math.round(accuracy)} meters
                    `;


                    try {

                        await setDoc(

                            doc(
                                db,
                                "deliveryLocations",
                                orderId
                            ),

                            {
                                orderId: orderId,

                                latitude: latitude,

                                longitude: longitude,

                                accuracy: accuracy,

                                updatedAt: new Date(),

                                active: true,

                                deliveryUserId:
                                    currentUser
                                        ? currentUser.uid
                                        : null
                            },

                            {
                                merge: true
                            }

                        );


                    } catch (error) {

                        console.error(
                            "Firebase location error:",
                            error
                        );


                        showStatus(
                            "GPS received, but Firebase update failed.",
                            "error"
                        );

                    }

                },


                (error) => {

                    tracking = false;

                    startBtn.disabled = false;

                    stopBtn.disabled = true;


                    if (error.code === 1) {

                        showStatus(
                            "GPS permission was denied.",
                            "error"
                        );

                    } else if (error.code === 2) {

                        showStatus(
                            "GPS location is unavailable.",
                            "error"
                        );

                    } else if (error.code === 3) {

                        showStatus(
                            "GPS request timed out.",
                            "error"
                        );

                    } else {

                        showStatus(
                            "Unable to get GPS location.",
                            "error"
                        );

                    }

                },


                {
                    enableHighAccuracy: true,

                    maximumAge: 5000,

                    timeout: 10000
                }

            );

    } catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "error"
        );

    }

}


/* =========================
   STOP GPS TRACKING
========================= */

async function stopTracking() {

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;

    }


    tracking = false;

    startBtn.disabled = false;

    stopBtn.disabled = true;


    const orderId =
        orderInput.value.trim();


    if (orderId) {

        try {

            await setDoc(

                doc(
                    db,
                    "deliveryLocations",
                    orderId
                ),

                {
                    active: false,

                    updatedAt: new Date()
                },

                {
                    merge: true
                }

            );

        } catch (error) {

            console.error(
                "Unable to stop Firebase tracking:",
                error
            );

        }

    }


    showStatus(
        "⛔ Live tracking stopped.",
        ""
    );

}


/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await stopTracking();

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(error);

        }

    }
);


/* =========================
   BUTTON EVENTS
========================= */

startBtn.addEventListener(
    "click",
    startTracking
);


stopBtn.addEventListener(
    "click",
    stopTracking
);