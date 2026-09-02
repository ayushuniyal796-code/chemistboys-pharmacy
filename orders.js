import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";

document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("ordersContainer");

    if (!container) return;

    await authReady;

    const user = auth.currentUser;

    if (!user) {
        container.innerHTML = `
            <div class="empty-orders">
                <div class="empty-orders-icon">🔐</div>
                <h2>Please Login</h2>
                <p>Please login to view your orders.</p>
                <a href="login.html" class="shop-btn">🔑 Login</a>
            </div>
        `;
        return;
    }

    let q;

    if (user.uid === ADMIN_UID) {
        q = query(collection(db, "orders"));
    } else {
        q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
        );
    }

    onSnapshot(q, snapshot => {

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-orders">
                    <div class="empty-orders-icon">📦</div>
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";

        snapshot.forEach(docSnap => {

            const order = docSnap.data();

            // =========================
            // ITEMS
            // =========================

            const items =
                Array.isArray(order.items)
                    ? order.items
                    : Array.isArray(order.products)
                        ? order.products
                        : [];

            let itemsHTML = "";

            items.forEach(item => {

                const name =
                    item.name ||
                    item.productName ||
                    "Medicine";

                const price =
                    Number(item.price) ||
                    Number(item.productPrice) ||
                    0;

                const quantity =
                    Number(item.quantity) ||
                    Number(item.qty) ||
                    1;

                itemsHTML += `
                    <div class="order-item">
                        <span>${name} × ${quantity}</span>
                        <strong>₹${price * quantity}</strong>
                    </div>
                `;
            });

            if (!itemsHTML) {
                itemsHTML = `
                    <div class="order-item">
                        <span>No item details available</span>
                    </div>
                `;
            }

            // =========================
            // TOTAL
            // =========================

            let total =
                Number(order.total) ||
                Number(order.grandTotal) ||
                Number(order.amount) ||
                0;

            // If total field is missing, calculate from items
            if (total === 0 && items.length > 0) {

                total = items.reduce((sum, item) => {

                    const price =
                        Number(item.price) ||
                        Number(item.productPrice) ||
                        0;

                    const quantity =
                        Number(item.quantity) ||
                        Number(item.qty) ||
                        1;

                    return sum + (price * quantity);

                }, 0);
            }

            // =========================
            // STATUS
            // =========================

            const status =
                order.status || "Processing";

            // =========================
            // PAYMENT
            // =========================

            let payment = "Pending";

            if (order.paymentMethod === "cod") {
                payment = "Cash on Delivery";
            }
            else if (
                order.paymentMethod === "upi" ||
                order.paymentMethod === "online"
            ) {
                payment =
                    order.paymentStatus === "Paid"
                        ? "Paid Online"
                        : "Online Payment - Pending";
            }

            // =========================
            // DATE / TIME
            // =========================

            const orderDate =
                order.orderDate || "N/A";

            const orderTime =
                order.orderTime || "N/A";

            const deliveryDate =
                order.deliveryDate || "N/A";

            // =========================
            // ORDER CARD
            // =========================

            const card = document.createElement("div");

            card.className = "order-card";

            card.innerHTML = `

                <div class="order-header">

                    <div class="order-id">
                        Order #${order.id || docSnap.id}
                    </div>

                    <div class="order-status">
                        ${status}
                    </div>

                </div>

                <div class="order-info">

                    <p>
                        📅 <strong>Order Date:</strong>
                        ${orderDate}
                    </p>

                    <p>
                        🕐 <strong>Order Time:</strong>
                        ${orderTime}
                    </p>

                    <p>
                        🚚 <strong>Expected Delivery:</strong>
                        ${deliveryDate}
                    </p>

                    <p>
                        💳 <strong>Payment:</strong>
                        ${payment}
                    </p>

                    <p>
                        📦 <strong>Order Status:</strong>
                        ${status}
                    </p>

                </div>

                <div class="order-items">

                    ${itemsHTML}

                </div>

                <div class="order-total">

                    Total: ₹${total}

                </div>
            `;

            container.appendChild(card);

        });

    }, error => {

        console.error("Orders Error:", error);

        container.innerHTML = `
            <div class="empty-orders">
                <h2>Unable to Load Orders</h2>
                <p>${error.message}</p>
            </div>
        `;

    });

});