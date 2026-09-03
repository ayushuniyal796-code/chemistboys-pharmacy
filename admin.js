import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";

const ordersContainer = document.getElementById("ordersContainer");


// ===============================
// AUTH CHECK
// ===============================

await authReady;

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "auth.html";
        return;
    }

    if (user.uid !== ADMIN_UID) {

        ordersContainer.innerHTML = `
            <div class="loading">
                <h2>❌ Access Denied</h2>
                <p>You are not authorized to access Admin Panel.</p>
            </div>
        `;

        return;
    }

    loadOrders();
});


// ===============================
// LOAD ORDERS
// ===============================

function loadOrders() {

    const ordersQuery = query(
        collection(db, "orders"),
        orderBy("orderDateISO", "desc")
    );

    onSnapshot(
        ordersQuery,
        (snapshot) => {

            if (snapshot.empty) {

                ordersContainer.innerHTML = `
                    <div class="loading">
                        <h2>📦 No Orders</h2>
                        <p>No customer orders found.</p>
                    </div>
                `;

                return;
            }

            ordersContainer.innerHTML = "";

            snapshot.forEach((docSnap) => {

                const order = docSnap.data();

                renderOrder(
                    order,
                    docSnap.id
                );

            });

        },
        (error) => {

            console.error("Orders Error:", error);

            ordersContainer.innerHTML = `
                <div class="loading">
                    <h2>❌ Error Loading Orders</h2>
                    <p>${escapeHTML(error.message)}</p>
                </div>
            `;

        }
    );
}


// ===============================
// RENDER ORDER
// ===============================

function renderOrder(order, firestoreId) {

    const card = document.createElement("div");

    card.className = "admin-order-card";

    const items = Array.isArray(order.items)
        ? order.items
        : [];

    let itemsHTML = "";

    items.forEach((item) => {

        const name =
            item.name ||
            item.productName ||
            "Product";

        const quantity =
            Number(item.quantity) ||
            Number(item.qty) ||
            1;

        const price =
            Number(item.price) ||
            Number(item.productPrice) ||
            0;

        itemsHTML += `
            <div style="
                padding:8px 0;
                border-bottom:1px solid #eee;
            ">
                <strong>${escapeHTML(name)}</strong>
                <br>
                <small>
                    ₹${price} × ${quantity}
                </small>
            </div>
        `;

    });


    // ===============================
    // TOTAL
    // ===============================

    let total = Number(order.total);

    if (!total || total <= 0) {

        total = Number(order.grandTotal);

    }

    if (!total || total <= 0) {

        total = Number(order.amount);

    }

    if (!total || total <= 0) {

        total = items.reduce(
            (sum, item) => {

                const price =
                    Number(item.price) ||
                    Number(item.productPrice) ||
                    0;

                const quantity =
                    Number(item.quantity) ||
                    Number(item.qty) ||
                    1;

                return sum + price * quantity;

            },
            0
        );

    }


    // ===============================
    // STATUS
    // ===============================

    const status =
        order.status ||
        "Processing";


    let statusClass = "";

    if (status === "Accepted") {
        statusClass = "accepted";
    }

    else if (status === "Cancelled") {
        statusClass = "cancelled";
    }

    else {
        statusClass = "processing";
    }


    // ===============================
    // CARD
    // ===============================

    card.innerHTML = `

        <div style="
            background:white;
            border-radius:18px;
            padding:25px;
            margin-bottom:20px;
            box-shadow:0 5px 20px rgba(0,0,0,.08);
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
                flex-wrap:wrap;
                margin-bottom:20px;
            ">

                <div>

                    <h2 style="
                        margin:0;
                        color:#075f55;
                    ">
                        🧾 Order ${escapeHTML(order.id || firestoreId)}
                    </h2>

                    <p style="
                        margin:5px 0;
                        color:#718987;
                    ">
                        ${escapeHTML(order.orderDate || "")}
                        ${escapeHTML(order.orderTime || "")}
                    </p>

                </div>


                <div style="
                    font-weight:bold;
                    padding:10px 16px;
                    border-radius:20px;
                    background:
                        ${
                            status === "Accepted"
                            ? "#d4edda"
                            : status === "Cancelled"
                            ? "#f8d7da"
                            : "#fff3cd"
                        };
                    color:
                        ${
                            status === "Accepted"
                            ? "#155724"
                            : status === "Cancelled"
                            ? "#721c24"
                            : "#856404"
                        };
                ">

                    ${
                        status === "Accepted"
                        ? "✅ Accepted"
                        : status === "Cancelled"
                        ? "❌ Cancelled"
                        : "⏳ Processing"
                    }

                </div>

            </div>


            <!-- CUSTOMER -->

            <div style="
                background:#f7fbfa;
                padding:15px;
                border-radius:12px;
                margin-bottom:15px;
            ">

                <h3>👤 Customer Details</h3>

                <p>
                    <strong>Name:</strong>
                    ${escapeHTML(order.customerName || "N/A")}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(order.email || "N/A")}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(order.phone || "N/A")}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${escapeHTML(order.address || "N/A")}
                </p>

                <p>
                    <strong>City:</strong>
                    ${escapeHTML(order.city || "N/A")}
                </p>

                <p>
                    <strong>Pincode:</strong>
                    ${escapeHTML(order.pincode || "N/A")}
                </p>

            </div>


            <!-- PRODUCTS -->

            <div>

                <h3>🛒 Products</h3>

                ${itemsHTML}

            </div>


            <!-- PAYMENT -->

            <div style="
                margin-top:20px;
                padding:15px;
                background:#f7fbfa;
                border-radius:12px;
            ">

                <p>
                    <strong>Payment:</strong>
                    ${escapeHTML(order.paymentMethod || "N/A")}
                </p>

                <p>
                    <strong>Payment Status:</strong>
                    ${escapeHTML(order.paymentStatus || "Pending")}
                </p>

                <h2 style="color:#075f55;">
                    💰 ₹${total.toFixed(2)}
                </h2>

            </div>


            <!-- BUTTONS -->

            ${
                status !== "Accepted" &&
                status !== "Cancelled"

                ? `

                <div style="
                    display:flex;
                    gap:10px;
                    margin-top:20px;
                    flex-wrap:wrap;
                ">

                    <button
                        class="accept-order-btn"
                        data-id="${firestoreId}"
                        style="
                            background:#0ca88f;
                            color:white;
                            border:none;
                            padding:12px 20px;
                            border-radius:8px;
                            cursor:pointer;
                            font-weight:bold;
                        "
                    >
                        ✅ Accept Order
                    </button>


                    <button
                        class="cancel-order-btn"
                        data-id="${firestoreId}"
                        style="
                            background:#dc3545;
                            color:white;
                            border:none;
                            padding:12px 20px;
                            border-radius:8px;
                            cursor:pointer;
                            font-weight:bold;
                        "
                    >
                        ❌ Cancel Order
                    </button>

                </div>

                `

                : ""

            }

        </div>
    `;


    ordersContainer.appendChild(card);


    // ===============================
    // ACCEPT
    // ===============================

    const acceptBtn =
        card.querySelector(".accept-order-btn");

    if (acceptBtn) {

        acceptBtn.addEventListener(
            "click",
            async () => {

                try {

                    acceptBtn.disabled = true;

                    await updateDoc(
                        doc(db, "orders", firestoreId),
                        {
                            status: "Accepted"
                        }
                    );

                }

                catch (error) {

                    console.error(
                        "Accept Error:",
                        error
                    );

                    acceptBtn.disabled = false;

                    alert(
                        "Order accept nahi ho paya."
                    );

                }

            }
        );

    }


    // ===============================
    // CANCEL
    // ===============================

    const cancelBtn =
        card.querySelector(".cancel-order-btn");

    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            async () => {

                const confirmCancel =
                    confirm(
                        "Kya aap is order ko Cancel karna chahte ho?"
                    );

                if (!confirmCancel) {
                    return;
                }


                try {

                    cancelBtn.disabled = true;

                    await updateDoc(
                        doc(db, "orders", firestoreId),
                        {
                            status: "Cancelled"
                        }
                    );

                }

                catch (error) {

                    console.error(
                        "Cancel Error:",
                        error
                    );

                    cancelBtn.disabled = false;

                    alert(
                        "Order cancel nahi ho paya."
                    );

                }

            }
        );

    }

}


// ===============================
// LOGOUT
// ===============================

window.logoutAdmin = async function () {

    try {

        await signOut(auth);

        window.location.href = "index.html";

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

};


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}