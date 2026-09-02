import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    getDocs,
    setDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================
// ADMIN UID
// ==========================================

const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


// ==========================================
// HTML ELEMENTS
// ==========================================

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


// ==========================================
// ALL ORDERS
// ==========================================

let allOrders = [];


// ==========================================
// WAIT FOR FIREBASE AUTH
// ==========================================

await authReady;


// ==========================================
// AUTH CHECK
// ==========================================

onAuthStateChanged(auth, async (user) => {

    // Not logged in
    if (!user) {

        window.location.href = "login.html";
        return;
    }


    // Logged in but NOT admin
    if (user.uid !== ADMIN_UID) {

        if (adminContent) {
            adminContent.style.display = "none";
        }

        if (accessDenied) {
            accessDenied.style.display = "block";
        }

        return;
    }


    // ======================================
    // ADMIN VERIFIED
    // ======================================

    if (accessDenied) {
        accessDenied.style.display = "none";
    }

    if (adminContent) {
        adminContent.style.display = "block";
    }


    // Load orders
    await loadOrders();

});


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    if (loading) {
        loading.style.display = "block";
    }

    if (noOrders) {
        noOrders.style.display = "none";
    }

    if (ordersContainer) {
        ordersContainer.innerHTML = "";
    }


    try {

        const ordersRef = collection(db, "orders");

        const snapshot = await getDocs(ordersRef);


        // Empty array
        allOrders = [];


        // ==================================
        // GET EVERY FIRESTORE DOCUMENT
        // ==================================

        snapshot.forEach((orderDoc) => {

            const data = orderDoc.data();

            allOrders.push({

                // VERY IMPORTANT
                // This is the real Firestore document ID
                id: orderDoc.id,

                ...data

            });

        });


        // ==================================
        // SORT NEWEST FIRST
        // ==================================

        allOrders.sort((a, b) => {

            return getOrderTime(b) - getOrderTime(a);

        });


        if (loading) {
            loading.style.display = "none";
        }


        updateDashboard();

        displayOrders(allOrders);


    } catch (error) {

        console.error("Firestore load error:", error);


        if (loading) {
            loading.style.display = "none";
        }


        if (ordersContainer) {

            ordersContainer.innerHTML = `

                <div class="order-card">

                    <h3>❌ Failed to load orders</h3>

                    <p>
                        ${escapeHTML(error.message)}
                    </p>

                </div>

            `;

        }

    }

}


// ==========================================
// GET ORDER TIME
// ==========================================

function getOrderTime(order) {

    if (!order || !order.createdAt) {
        return 0;
    }


    // Firestore Timestamp
    if (
        typeof order.createdAt.toMillis === "function"
    ) {

        return order.createdAt.toMillis();

    }


    // JavaScript Date
    if (order.createdAt instanceof Date) {

        return order.createdAt.getTime();

    }


    // String / number
    const date = new Date(order.createdAt);

    if (!isNaN(date.getTime())) {

        return date.getTime();

    }


    return 0;

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    const total = allOrders.length;


    const pending = allOrders.filter(order => {

        const status =
            String(order.status || "Pending")
                .toLowerCase();

        return status === "pending";

    }).length;


    const accepted = allOrders.filter(order => {

        const status =
            String(order.status || "")
                .toLowerCase();

        return status === "accepted";

    }).length;


    if (totalOrders) {
        totalOrders.textContent = total;
    }

    if (pendingOrders) {
        pendingOrders.textContent = pending;
    }

    if (acceptedOrders) {
        acceptedOrders.textContent = accepted;
    }

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders(orders) {

    if (!ordersContainer) {
        return;
    }


    ordersContainer.innerHTML = "";


    if (!orders || orders.length === 0) {

        if (noOrders) {
            noOrders.style.display = "block";
        }

        return;

    }


    if (noOrders) {
        noOrders.style.display = "none";
    }


    orders.forEach(order => {

        const card = createOrderCard(order);

        ordersContainer.appendChild(card);

    });

}


// ==========================================
// CREATE ORDER CARD
// ==========================================

function createOrderCard(order) {

    const card = document.createElement("div");

    card.className = "order-card";


    // ======================================
    // STATUS
    // ======================================

    const status =
        String(order.status || "Pending");


    const statusLower =
        status.toLowerCase();


    const statusClass =
        statusLower === "accepted"
            ? "accepted"
            : "pending";


    // ======================================
    // CUSTOMER DETAILS
    // ======================================

    const customerName =
        order.customerName ||
        order.name ||
        "N/A";


    const customerEmail =
        order.customerEmail ||
        order.email ||
        "N/A";


    const customerPhone =
        order.customerPhone ||
        order.phone ||
        "N/A";


    const customerAddress =
        order.customerAddress ||
        order.address ||
        "N/A";


    const customerCity =
        order.customerCity ||
        order.city ||
        "N/A";


    const customerPincode =
        order.customerPincode ||
        order.pincode ||
        "N/A";


    // ======================================
    // PAYMENT
    // ======================================

    const paymentMethod =
        order.paymentMethod ||
        "N/A";


    const paymentStatus =
        order.paymentStatus ||
        "Pending";


    // ======================================
    // DATE
    // ======================================

    const orderDate =
        formatDate(order.createdAt);


    // ======================================
    // PRODUCTS
    // ======================================

    let itemsHTML = "";


    if (
        Array.isArray(order.items) &&
        order.items.length > 0
    ) {

        order.items.forEach(item => {

            const itemName =
                item.name ||
                item.title ||
                "Product";


            const quantity =
                Number(item.quantity) || 1;


            const price =
                Number(item.price) || 0;


            const itemTotal =
                price * quantity;


            itemsHTML += `

                <div class="item">

                    <span>
                        ${escapeHTML(itemName)}
                        × ${quantity}
                    </span>

                    <span>
                        ₹${itemTotal.toFixed(2)}
                    </span>

                </div>

            `;

        });

    } else {

        itemsHTML = `

            <div class="item">

                <span>
                    No item information available
                </span>

            </div>

        `;

    }


    // ======================================
    // TOTAL
    // ======================================

    const totalAmount =
        Number(
            order.grandTotal ??
            order.total ??
            order.amount ??
            0
        );


    // ======================================
    // CARD HTML
    // ======================================

    card.innerHTML = `

        <div class="order-top">

            <div>

                <div class="order-id">

                    Order ID:
                    ${escapeHTML(order.id)}

                </div>

                <small>

                    ${escapeHTML(orderDate)}

                </small>

            </div>


            <span class="status ${statusClass}">

                ${escapeHTML(status)}

            </span>

        </div>


        <div class="customer-info">


            <div class="info-box">

                <strong>
                    Customer Name
                </strong>

                ${escapeHTML(customerName)}

            </div>


            <div class="info-box">

                <strong>
                    Email
                </strong>

                ${escapeHTML(customerEmail)}

            </div>


            <div class="info-box">

                <strong>
                    Phone
                </strong>

                ${escapeHTML(customerPhone)}

            </div>


            <div class="info-box">

                <strong>
                    City
                </strong>

                ${escapeHTML(customerCity)}

            </div>


            <div class="info-box">

                <strong>
                    Pincode
                </strong>

                ${escapeHTML(customerPincode)}

            </div>


            <div class="info-box">

                <strong>
                    Payment
                </strong>

                ${escapeHTML(paymentMethod)}

                -

                ${escapeHTML(paymentStatus)}

            </div>


            <div
                class="info-box"
                style="grid-column: 1 / -1;"
            >

                <strong>
                    Address
                </strong>

                ${escapeHTML(customerAddress)}

            </div>


        </div>


        <div class="items">

            <h3>
                🛒 Ordered Products
            </h3>

            ${itemsHTML}

        </div>


        <div class="order-bottom">


            <div class="total">

                Total:
                ₹${totalAmount.toFixed(2)}

            </div>


            <div class="actions">


                <button
                    class="accept-btn"
                    type="button"
                    ${statusLower === "accepted"
                        ? "disabled"
                        : ""}
                >

                    ${
                        statusLower === "accepted"
                            ? "✓ Accepted"
                            : "✓ Accept Order"
                    }

                </button>


                <button
                    class="delete-btn"
                    type="button"
                >

                    🗑️ Delete

                </button>


            </div>


        </div>

    `;


    // ======================================
    // ACCEPT BUTTON
    // ======================================

    const acceptButton =
        card.querySelector(".accept-btn");


    if (acceptButton) {

        acceptButton.addEventListener(
            "click",
            () => {

                acceptOrder(order);

            }
        );

    }


    // ======================================
    // DELETE BUTTON
    // ======================================

    const deleteButton =
        card.querySelector(".delete-btn");


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => {

                deleteOrder(order);

            }
        );

    }


    return card;

}


// ==========================================
// ACCEPT ORDER
// ==========================================

async function acceptOrder(order) {

    if (!order || !order.id) {

        alert("❌ Order ID not found.");

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to accept this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        // ==================================
        // GET REAL FIRESTORE DOCUMENT
        // ==================================

        const orderRef =
            doc(
                db,
                "orders",
                String(order.id)
            );


        // ==================================
        // UPDATE STATUS
        // ==================================

        await setDoc(
            orderRef,
            {
                status: "Accepted"
            },
            {
                merge: true
            }
        );


        // ==================================
        // UPDATE LOCAL ARRAY
        // ==================================

        const localOrder =
            allOrders.find(
                item => item.id === order.id
            );


        if (localOrder) {

            localOrder.status = "Accepted";

        }


        // ==================================
        // UPDATE UI
        // ==================================

        updateDashboard();

        displayOrders(allOrders);


        alert(
            "✅ Order accepted successfully!"
        );


    } catch (error) {

        console.error(
            "Accept order error:",
            error
        );


        alert(
            "❌ Failed to accept order:\n\n" +
            error.message
        );

    }

}


// ==========================================
// DELETE ORDER
// ==========================================

async function deleteOrder(order) {

    if (!order || !order.id) {

        alert("❌ Order ID not found.");

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const orderRef =
            doc(
                db,
                "orders",
                String(order.id)
            );


        await deleteDoc(orderRef);


        // Remove locally
        allOrders =
            allOrders.filter(
                item => item.id !== order.id
            );


        updateDashboard();

        displayOrders(allOrders);


        alert(
            "🗑️ Order deleted successfully!"
        );


    } catch (error) {

        console.error(
            "Delete order error:",
            error
        );


        alert(
            "❌ Failed to delete order:\n\n" +
            error.message
        );

    }

}


// ==========================================
// SEARCH
// ==========================================

if (searchOrders) {

    searchOrders.addEventListener(
        "input",
        () => {

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

                    const searchableText = `

                        ${order.id || ""}

                        ${order.customerName ||
                            order.name || ""}

                        ${order.customerEmail ||
                            order.email || ""}

                        ${order.customerPhone ||
                            order.phone || ""}

                        ${order.customerCity ||
                            order.city || ""}

                        ${order.customerPincode ||
                            order.pincode || ""}

                        ${order.status || ""}

                        ${order.paymentMethod || ""}

                    `.toLowerCase();


                    return searchableText.includes(
                        search
                    );

                });


            displayOrders(filtered);

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "❌ Logout failed."
                );

            }

        }
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(timestamp) {

    if (!timestamp) {

        return "Date not available";

    }


    let date;


    // Firestore Timestamp
    if (
        typeof timestamp.toDate === "function"
    ) {

        date = timestamp.toDate();

    }

    // Date object
    else if (timestamp instanceof Date) {

        date = timestamp;

    }

    // String / number
    else {

        date = new Date(timestamp);

    }


    if (isNaN(date.getTime())) {

        return "Date not available";

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

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}