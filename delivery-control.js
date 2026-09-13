import {
    auth,
    authReady,
    db
} from "./firebase.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const ADMIN_UID =
    "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


const orderIdInput =
    document.getElementById("orderId");

const startBtn =
    document.getElementById("startBtn");

const stopBtn =
    document.getElementById("stopBtn");

const message =
    document.getElementById("message");

const gps =
    document.getElementById("gps");


let watchId = null;
let currentOrderId = null;


await authReady;


onAuthStateChanged(auth, user => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.uid !== ADMIN_UID) {

        document.body.innerHTML =
            "<h2>🚫 Access Denied</h2>";

        return;
    }

});


startBtn.addEventListener(
    "click",
    startTracking
);


stopBtn.addEventListener(
    "click",
    stopTracking
);


function startTracking() {

    const orderId =
        orderIdInput.value.trim();

    if (!orderId) {

        message.textContent =
            "Please enter Order ID.";

        return;
    }


    if (!navigator.geolocation) {

        message.textContent =
            "GPS is not supported on this device.";

        return;
    }


    currentOrderId = orderId;


    message.textContent =
        "📍 Getting delivery person's location...";


    watchId =
        navigator.geolocation.watchPosition(

            async position => {

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;


                gps.textContent =
                    `Latitude: ${lat.toFixed(6)}
                     | Longitude: ${lng.toFixed(6)}`;


                try {

                    await setDoc(
                        doc(
                            db,
                            "deliveryLocations",
                            currentOrderId
                        ),
                        {
                            orderId:
                                currentOrderId,

                            latitude:
                                lat,

                            longitude:
                                lng,

                            active:
                                true,

                            updatedAt:
                                serverTimestamp()
                        },
                        {
                            merge:true
                        }
                    );


                    message.textContent =
                        "🟢 Live location is being shared.";

                } catch (error) {

                    console.error(error);

                    message.textContent =
                        "❌ Unable to save location.";
                }

            },

            error => {

                console.error(error);

                message.textContent =
                    "❌ GPS permission/location error.";
            },

            {
                enableHighAccuracy:true,
                maximumAge:5000,
                timeout:10000
            }
        );

}


async function stopTracking() {

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;
    }


    if (!currentOrderId) {

        message.textContent =
            "Tracking is not running.";

        return;
    }


    try {

        await setDoc(
            doc(
                db,
                "deliveryLocations",
                currentOrderId
            ),
            {
                active:false,
                updatedAt:
                    serverTimestamp()
            },
            {
                merge:true
            }
        );


        message.textContent =
            "⛔ Live location sharing stopped.";

    } catch (error) {

        console.error(error);

        message.textContent =
            "❌ Could not stop tracking.";
    }

}