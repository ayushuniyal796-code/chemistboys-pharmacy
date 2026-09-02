import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ===============================
// ADMIN UID
// ===============================

const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


// ===============================
// HTML ELEMENTS
// ===============================

const adminContent = document.getElementById("adminContent");
const accessDenied = document.getElementById("accessDenied");

const ordersContainer = document.getElementById("ordersContainer");
const loading = document.getElementById("loading");
const noOrders = document.getElementById("noOrders");

const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const acceptedOrders = document.getElementById("acceptedOrders");

const searchOrders = document.getElementById("searchOrders");
const logoutBtn = document.getElementById("logoutBtn");


// ===============================
// STORE ORDERS
// ===============================

let allOrders = [];


// ===============================
// CHECK ADMIN LOGIN
// ===============================

await authReady;

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;
    }


    // Check admin UID

    if (user.uid !== ADMIN_UID) {

        adminContent.style.display = "none";
        accessDenied.style.display = "block";

        return;
    }


    // Admin verified

    accessDenied.style.display = "none";
    adminContent.style.display = "block";

    await loadOrders();

});


// ===============================
// LOAD ORDERS FROM FIRESTORE
// ===============================

async function loadOrders() {

    loading.style.display = "block";
    noOrders.style.display = "none";
    ordersContainer.innerHTML = "";

    try {

        const ordersSnapshot = await getDocs(
            collection(db, "orders")
        );


        allOrders = [];


        ordersSnapshot.forEach((orderDoc) => {

            allOrders.push({
                id: orderDoc.id,
                ...orderDoc.data()
            });

        });


        // Newest orders first

        allOrders.sort((a, b) => {

            const dateA = getOrderTime(a);
            const dateB = getOrderTime(b);

            return dateB - dateA;

        });


        loading.style.display = "none";

        updateDashboard();

        displayOrders(allOrders);


    } catch (error) {

        console.error("Error loading orders:", error);

        loading.style.display = "none";

        ordersContainer.innerHTML = `
            <div class="order-card">
                <h3>❌ Failed to load orders</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;

    }

}


// ===============================
// GET ORDER TIME
// ===============================

function getOrderTime(order) {

    if (!order.createdAt) {
        return 0;
    }


    // Firestore Timestamp

    if (typeof order.createdAt.toMillis === "function") {
        return order.createdAt.toMillis();
    }


    // JavaScript Date

    if (order.createdAt instanceof Date) {
        return order.createdAt.getTime();
    }


    return 0;

}


// ===============================
// DASHBOARD COUNTS
// ===============================

function updateDashboard() {

    const total = allOrders.length;


    const pending = allOrders.filter(order => {

        return String(order.status || "Pending").toLowerCase()
            === "pending";

    }).length;


    const accepted = allOrders.filter(order => {

        return String(order.status || "").toLowerCase()
            === "accepted";

    }).length;


    totalOrders.textContent = total;
    pendingOrders.textContent = pending;
    acceptedOrders.textContent = accepted;

}


// ===============================
// DISPLAY ORDERS
// ===============================

function displayOrders(orders) {

    ordersContainer.innerHTML = "";


    if (orders.length === 0) {

        noOrders.style.display = "block";
        return;

    }


    noOrders.style.display = "none";


    orders.forEach(order => {

        const card = createOrderCard(order);

        ordersContainer.appendChild(card);

    });

}


// ===============================
// CREATE ORDER CARD
// ===============================

function createOrderCard(order) {

    const card = document.createElement("div");

    card.className = "order-card";


    const status = order.status || "Pending";

    const statusClass =
        status.toLowerCase() === "accepted"
            ? "accepted"
            : "pending";


    const orderDate = formatDate(order.createdAt);


    // Customer information

    const customerName =
        order.customerName || order.name || "N/A";

    const customerEmail =
        order.customerEmail || order.email || "N/A";

    const customerPhone =
        order.customerPhone || order.phone || "N/A";

    const customerAddress =
        order.customerAddress || order.address || "N/A";

    const customerCity =
        order.customerCity || order.city || "N/A";

    const customerPincode =
        order.customerPincode || order.pincode || "N/A";


    // Payment information

    const paymentMethod =
        order.paymentMethod || "N/A";

    const paymentStatus =
        order.paymentStatus || "Pending";


    // Items

    let itemsHTML = "";


    if (Array.isArray(order.items) && order.items.length > 0) {

        order.items.forEach(item => {

            const itemName =
                item.name || item.title || "Product";

            const quantity =
                Number(item.quantity) || 1;

            const price =
                Number(item.price) || 0;

            itemsHTML += `
                <div class="item">
                    <span>
                        ${escapeHTML(itemName)}
                        × ${quantity}
                    </span>

                    <span>
                        ₹${(price * quantity).toFixed(2)}
                    </span>
                </div>
            `;

        });

    } else {

        itemsHTML = `
            <div class="item">
                <span>No item information available</span>
            </div>
        `;

    }


    // Total

    const totalAmount =
        Number(
            order.grandTotal ??
            order.total ??
            order.amount ??
            0
        );


    card.innerHTML = `

        <div class="order-top">

            <div>
                <div class="order-id">
                    Order ID: ${escapeHTML(order.id)}
                </div>

                <small>
                    ${orderDate}
                </small>
            </div>

            <span class="status ${statusClass}">
                ${escapeHTML(status)}
            </span>

        </div>


        <div class="customer-info">

            <div class="info-box">
                <strong>Customer Name</strong>
                ${escapeHTML(customerName)}
            </div>

            <div class="info-box">
                <strong>Email</strong>
                ${escapeHTML(customerEmail)}
            </div>

            <div class="info-box">
                <strong>Phone</strong>
                ${escapeHTML(customerPhone)}
            </div>

            <div class="info-box">
                <strong>City</strong>
                ${escapeHTML(customerCity)}
            </div>

            <div class="info-box">
                <strong>Pincode</strong>
                ${escapeHTML(customerPincode)}
            </div>

            <div class="info-box">
                <strong>Payment</strong>
                ${escapeHTML(paymentMethod)}
                - ${escapeHTML(paymentStatus)}
            </div>

            <div class="info-box" style="grid-column: 1 / -1;">
                <strong>Address</strong>
                ${escapeHTML(customerAddress)}
            </div>

        </div>


        <div class="items">

            <h3>🛒 Ordered Products</h3>

            ${itemsHTML}

        </div>


        <div class="order-bottom">

            <div class="total">
                Total: ₹${totalAmount.toFixed(2)}
            </div>


            <div class="actions">

                <button
                    class="accept-btn"
                    data-id="${escapeHTML(order.id)}"
                    ${status.toLowerCase() === "accepted" ? "disabled" : ""}
                >
                    ${status.toLowerCase() === "accepted"
                        ? "✓ Accepted"
                        : "✓ Accept Order"}
                </button>


                <button
                    class="delete-btn"
                    data-id="${escapeHTML(order.id)}"
                >
                    🗑️ Delete
                </button>

            </div>

        </div>

    `;


    // Accept button

    const acceptButton =
        card.querySelector(".accept-btn");


    if (acceptButton) {

        acceptButton.addEventListener("click", () => {

            acceptOrder(order.id);

        });

    }


    // Delete button

    const deleteButton =
        card.querySelector(".delete-btn");


    if (deleteButton) {

        deleteButton.addEventListener("click", () => {

            deleteOrder(order.id);

        });

    }


    return card;

}


// ===============================
// ACCEPT ORDER
// ===============================

async function acceptOrder(orderId) {

    const confirmed =
        confirm("Are you sure you want to accept this order?");


    if (!confirmed) {
        return;
    }


    try {

        await updateDoc(
            doc(db, "orders", orderId),
            {
                status: "Accepted"
            }
        );


        // Update local data

        const order =
            allOrders.find(item => item.id === orderId);


        if (order) {
            order.status = "Accepted";
        }


        updateDashboard();


        // Refresh display

        displayOrders(allOrders);


    } catch (error) {

        console.error("Accept order error:", error);

        alert(
            "Failed to accept order: " +
            error.message
        );

    }

}


// ===============================
// DELETE ORDER
// ===============================

async function deleteOrder(orderId) {

    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(db, "orders", orderId)
        );


        // Remove from local array

        allOrders =
            allOrders.filter(
                order => order.id !== orderId
            );


        updateDashboard();

        displayOrders(allOrders);


    } catch (error) {

        console.error("Delete order error:", error);

        alert(
            "Failed to delete order: " +
            error.message
        );

    }

}


// ===============================
// SEARCH ORDERS
// ===============================

searchOrders.addEventListener("input", () => {

    const search =
        searchOrders.value
            .toLowerCase()
            .trim();


    if (!search) {

        displayOrders(allOrders);
        return;

    }


    const filtered =
        allOrders.filter(order => {

            const text = `

                ${order.id || ""}

                ${order.customerName || order.name || ""}

                ${order.customerEmail || order.email || ""}

                ${order.customerPhone || order.phone || ""}

                ${order.customerCity || order.city || ""}

                ${order.status || ""}

            `.toLowerCase();


            return text.includes(search);

        });


    displayOrders(filtered);

});


// ===============================
// LOGOUT
// ===============================

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error("Logout error:", error);

    }

});


// ===============================
// FORMAT DATE
// ===============================

function formatDate(timestamp) {

    if (!timestamp) {
        return "Date not available";
    }


    let date;


    if (typeof timestamp.toDate === "function") {

        date = timestamp.toDate();

    } else if (timestamp instanceof Date) {

        date = timestamp;

    } else {

        date = new Date(timestamp);

    }


    if (isNaN(date.getTime())) {
        return "Date not available";
    }


    return date.toLocaleString("en-IN", {

        day: "2-digit",
        month: "short",
        year: "numeric",

        hour: "2-digit",
        minute: "2-digit"

    });

}


// ===============================
// SECURITY: ESCAPE HTML
// ===============================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}