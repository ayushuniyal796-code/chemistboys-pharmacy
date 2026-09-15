import { auth, authReady, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";
const STEPS = ["Placed", "Shipped", "Out for Delivery", "Delivered"];

const orderIdInput = document.getElementById("orderId");
const trackingStatus = document.getElementById("trackingStatus");
const saveStatusBtn = document.getElementById("saveStatusBtn");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const message = document.getElementById("message");
const locationName = document.getElementById("locationName");
const locationUpdated = document.getElementById("locationUpdated");
const statusNote = document.getElementById("statusNote");

let watchId = null;
let currentOrderId = null;
let currentOrderRef = null;
let isAdmin = false;

function isDelivered(data) {
    return data?.trackingStatus === "Delivered" || data?.status === "Delivered";
}

function applyDeliveryLock(status) {
    const delivered = status === "Delivered";
    startBtn.disabled = delivered;
    saveStatusBtn.disabled = false;
    if (delivered) {
        startBtn.textContent = "🔒 Location Sharing Disabled (Delivered)";
        statusNote.textContent = "Status: Delivered • Live location sharing is disabled.";
    } else {
        startBtn.textContent = "📍 Start Live Location";
    }
}

await authReady;

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.uid !== ADMIN_UID) {
        document.body.innerHTML = "<h2>🚫 Access Denied</h2>";
        return;
    }

    isAdmin = true;
});

function setMessage(text, type = "normal") {
    message.textContent = text;
    message.className = `message ${type}`;
}

function historyKey(status) {
    return {
        "Placed": "placedAt",
        "Shipped": "shippedAt",
        "Out for Delivery": "outForDeliveryAt",
        "Delivered": "deliveredAt"
    }[status];
}

async function findOrder() {
    const orderId = orderIdInput.value.trim();

    if (!orderId) {
        throw new Error("Please enter Order ID.");
    }

    // First try the document ID.
    const directRef = doc(db, "orders", orderId);
    const directSnap = await getDoc(directRef);

    if (directSnap.exists()) {
        return { ref: directRef, data: directSnap.data() };
    }

    // Existing ChemistBoys orders use a generated Firestore document ID,
    // so search by the visible orderId field as a fallback.
    const { collection, getDocs, query, where } = await import(
        "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
    );

    const result = await getDocs(
        query(collection(db, "orders"), where("orderId", "==", orderId))
    );

    if (result.empty) {
        throw new Error("Order not found.");
    }

    const found = result.docs[0];
    return {
        ref: doc(db, "orders", found.id),
        data: found.data()
    };
}

async function reverseGeocode(latitude, longitude) {
    // Converts GPS coordinates into a readable place/address.
    // Customer will receive only this written address, never the coordinates.
    const url =
        "https://api.bigdatacloud.net/data/reverse-geocode-client" +
        `?latitude=${encodeURIComponent(latitude)}` +
        `&longitude=${encodeURIComponent(longitude)}` +
        "&localityLanguage=en";

    const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" }
    });

    if (!response.ok) {
        throw new Error("Location name service unavailable.");
    }

    const data = await response.json();

    const parts = [
        data.locality,
        data.city,
        data.principalSubdivision,
        data.postcode,
        data.countryName
    ]
        .filter(Boolean)
        .map(value => String(value).trim())
        .filter((value, index, array) => array.indexOf(value) === index);

    if (!parts.length) {
        throw new Error("Readable location name not found.");
    }

    return parts.join(", ");
}

async function saveStatus() {
    if (!isAdmin) return;

    try {
        setMessage("Saving delivery status...", "normal");

        const { ref, data } = await findOrder();

        if (data.status !== "Accepted") {
            throw new Error("Accept the order first before changing delivery status.");
        }

        const selected = trackingStatus.value;
        const key = historyKey(selected);

        // Delivered is terminal: stop GPS sharing and mark the location inactive.
        if (selected === "Delivered" && watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }

        const orderUpdates = {
            trackingStatus: selected,
            ...(key ? {
                [`trackingHistory.${key}`]: serverTimestamp()
            } : {})
        };

        if (selected === "Delivered") {
            orderUpdates["trackingLocation.active"] = false;
            orderUpdates["trackingLocation.updatedAt"] = serverTimestamp();
        }

        await updateDoc(ref, orderUpdates);

        if (selected === "Delivered") {
            await setDoc(
                doc(db, "deliveryLocations", orderIdInput.value.trim()),
                { active: false, updatedAt: serverTimestamp() },
                { merge: true }
            );
        }

        currentOrderId = orderIdInput.value.trim();
        currentOrderRef = ref;

        setMessage(`✓ Delivery status saved: ${selected}`, "success");
        applyDeliveryLock(selected);
        statusNote.textContent = selected === "Delivered"
            ? "Customer's Track Order page will hide delivery location."
            : "Customer's Track Order page will update automatically.";
    } catch (error) {
        console.error(error);
        setMessage(error.message || "Unable to update status.", "error");
    }
}

async function loadCurrentOrder() {
    try {
        const { ref, data } = await findOrder();
        currentOrderRef = ref;
        currentOrderId = orderIdInput.value.trim();

        const status = STEPS.includes(data.trackingStatus)
            ? data.trackingStatus
            : "Placed";

        trackingStatus.value = status;
        applyDeliveryLock(status);
        statusNote.textContent = `Current delivery status: ${status}`;

        const location = data.trackingLocation;

        if (location && location.address) {
            locationName.textContent = location.address;
            locationUpdated.textContent = location.active
                ? "🟢 Live location is currently being shared."
                : "Last shared delivery location.";
        } else {
            locationName.textContent = "No delivery location shared yet.";
            locationUpdated.textContent = "Start Live Location to share the delivery person's location.";
        }
    } catch (error) {
        currentOrderRef = null;
        setMessage(error.message || "Unable to load order.", "error");
    }
}

async function startTracking() {
    const orderId = orderIdInput.value.trim();

    if (!orderId) {
        setMessage("Please enter Order ID.", "error");
        return;
    }

    try {
        const { ref, data } = await findOrder();

        if (isDelivered(data)) {
            applyDeliveryLock("Delivered");
            setMessage("🔒 Order is delivered. Live location sharing is disabled.", "normal");
            return;
        }

        if (!navigator.geolocation) {
            setMessage("GPS is not supported on this device.", "error");
            return;
        }

        if (data.status !== "Accepted") {
            setMessage("Accept the order first before sharing delivery location.", "error");
            return;
        }

        currentOrderId = orderId;
        currentOrderRef = ref;

        setMessage("📍 Getting delivery person's location...", "normal");

        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }

        watchId = navigator.geolocation.watchPosition(
            async position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                try {
                    // Get a written place name from the GPS position.
                    let address;

                    try {
                        address = await reverseGeocode(latitude, longitude);
                    } catch (geocodeError) {
                        console.warn("Reverse geocoding failed:", geocodeError);

                        // Keep the previous written location for the customer.
                        // We never expose coordinates on the customer page.
                        await setDoc(
                            doc(db, "deliveryLocations", currentOrderId),
                            {
                                orderId: currentOrderId,
                                latitude,
                                longitude,
                                accuracy,
                                active: true,
                                updatedAt: serverTimestamp()
                            },
                            { merge: true }
                        );

                        locationUpdated.textContent =
                            "🟢 GPS updated • finding the written place name...";
                        setMessage("🟢 Location received; updating place name...", "success");
                        return;
                    }

                    // Keep raw GPS only in the admin-only collection.
                    await setDoc(
                        doc(db, "deliveryLocations", currentOrderId),
                        {
                            orderId: currentOrderId,
                            latitude,
                            longitude,
                            accuracy,
                            address,
                            active: true,
                            updatedAt: serverTimestamp()
                        },
                        { merge: true }
                    );

                    // IMPORTANT: customer's order document gets ONLY the
                    // written address, not latitude/longitude.
                    await updateDoc(currentOrderRef, {
                        trackingLocation: {
                            address,
                            active: true,
                            updatedAt: serverTimestamp()
                        }
                    });

                    locationName.textContent = address;
                    locationUpdated.textContent =
                        "🟢 Live location updated just now.";

                    setMessage("🟢 Live location is being shared.", "success");
                    statusNote.textContent =
                        `Status: ${trackingStatus.value} • Written location updated`;
                } catch (error) {
                    console.error(error);
                    setMessage("❌ Unable to save the latest location.", "error");
                }
            },
            error => {
                console.error(error);
                setMessage("❌ GPS permission/location error.", "error");
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        );
    } catch (error) {
        console.error(error);
        setMessage(error.message || "Unable to start location sharing.", "error");
    }
}

async function stopTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (!currentOrderId || !currentOrderRef) {
        setMessage("Tracking is not running.", "error");
        return;
    }

    try {
        await setDoc(
            doc(db, "deliveryLocations", currentOrderId),
            {
                active: false,
                updatedAt: serverTimestamp()
            },
            { merge: true }
        );

        await updateDoc(currentOrderRef, {
            "trackingLocation.active": false,
            "trackingLocation.updatedAt": serverTimestamp()
        });

        setMessage("⛔ Location sharing stopped.", "normal");
        locationUpdated.textContent =
            "Last shared delivery location is kept for the customer.";
    } catch (error) {
        console.error(error);
        setMessage("❌ Could not stop location sharing.", "error");
    }
}

saveStatusBtn.addEventListener("click", saveStatus);
startBtn.addEventListener("click", startTracking);
stopBtn.addEventListener("click", stopTracking);
orderIdInput.addEventListener("change", loadCurrentOrder);
orderIdInput.addEventListener("keydown", event => {
    if (event.key === "Enter") loadCurrentOrder();
});
