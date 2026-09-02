import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


document.addEventListener("DOMContentLoaded", async function () {

    const ordersContainer =
        document.getElementById("ordersContainer");

    if (!ordersContainer) {
        return;
    }


    // Wait for Firebase authentication
    await authReady;


    const user = auth.currentUser;


    // User not logged in
    if (!user) {

        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <div class="empty-orders-icon">🔐</div>

                <h2>Please Login</h2>

                <p>
                    Please login to view your orders.
                </p>

                <a href="login.html" class="shop-btn">
                    🔑 Login
                </a>
            </div>
        `;

        return;
    }


    // =========================================
    // FIRESTORE ORDER QUERY
    // =========================================

    let ordersQuery;


    if (user.uid === ADMIN_UID) {

        // Admin can see all orders
        ordersQuery =
            query(
                collection(db, "orders")
            );

    } else {

        // Customer can see only their orders
        ordersQuery =
            query(
                collection(db, "orders"),
                where("userId", "==", user.uid)
            );

    }


    // =========================================
    // REAL-TIME ORDERS
    // =========================================

    onSnapshot(
        ordersQuery,

        function (snapshot) {

            let orders = [];


            snapshot.forEach(function (doc) {

                orders.push({
                    firestoreId: doc.id,
                    ...doc.data()
                });

            });


            // Newest first
            orders.sort(function (a, b) {

                const dateA =
                    a.createdAt?.seconds ||
                    0;

                const dateB =
                    b.createdAt?.seconds ||
                    0;

                return dateB - dateA;

            });


            // No orders
            if (orders.length === 0) {

                ordersContainer.innerHTML = `

                    <div class="empty-orders">

                        <div class="empty-orders-icon">
                            📦
                        </div>

                        <h2>
                            No Orders Yet
                        </h2>

                        <p>
                            You haven't placed any orders yet.
                        </p>

                        <a
                            href="index.html"
                            class="shop-btn"
                        >
                            🛍️ Start Shopping
                        </a>

                    </div>

                `;

                return;
            }


            // Clear container
            ordersContainer.innerHTML = "";


            // =====================================
            // DISPLAY ORDERS
            // =====================================

            orders.forEach(function (order) {

                const orderCard =
                    document.createElement("div");

                orderCard.className =
                    "order-card";


                // =================================
                // ITEMS
                // =================================

                let itemsHTML = "";


                if (
                    Array.isArray(order.items) &&
                    order.items.length > 0
                ) {

                    order.items.forEach(function (item) {

                        const itemName =
                            item.name ||
                            "Medicine";

                        const itemPrice =
                            Number(item.price) || 0;

                        const quantity =
                            Number(item.quantity) || 1;

                        const itemTotal =
                            itemPrice * quantity;


                        itemsHTML += `

                            <div class="order-item">

                                <span>
                                    ${itemName}
                                    × ${quantity}
                                </span>

                                <strong>
                                    ₹${itemTotal}
                                </strong>

                            </div>

                        `;

                    });

                } else {

                    itemsHTML = `

                        <div class="order-item">

                            <span>
                                No item details available
                            </span>

                        </div>

                    `;

                }


                // =================================
                // STATUS
                // =================================

                const status =
                    order.status ||
                    "Processing";


                // =================================
                // PAYMENT
                // =================================

                let paymentText =
                    "Pending";


                if (
                    order.paymentMethod === "cod"
                ) {

                    paymentText =
                        "Cash on Delivery";

                }
                else if (
                    order.paymentMethod === "online" ||
                    order.paymentMethod === "upi"
                ) {

                    if (
                        order.paymentStatus === "Paid"
                    ) {

                        paymentText =
                            "Paid Online";

                    }
                    else {

                        paymentText =
                            "Online Payment - Pending";

                    }

                }


                // =================================
                // TOTAL
                // =================================

                const total =
                    Number(order.total) || 0;


                // =================================
                // CARD
                // =================================

                orderCard.innerHTML = `

                    <div class="order-header">

                        <div class="order-id">

                            Order #${
                                order.id ||
                                order.firestoreId ||
                                "N/A"
                            }

                        </div>


                        <div class="order-status">

                            ${status}

                        </div>

                    </div>


                    <div class="order-info">

                        <p>

                            📅

                            <strong>
                                Order Date:
                            </strong>

                            ${order.orderDate || "N/A"}

                        </p>


                        <p>

                            🕐

                            <strong>
                                Order Time:
                            </strong>

                            ${order.orderTime || "N/A"}

                        </p>


                        <p>

                            🚚

                            <strong>
                                Expected Delivery:
                            </strong>

                            ${order.deliveryDate || "N/A"}

                        </p>


                        <p>

                            💳

                            <strong>
                                Payment:
                            </strong>

                            ${paymentText}

                        </p>


                        <p>

                            📦

                            <strong>
                                Order Status:
                            </strong>

                            ${status}

                        </p>

                    </div>


                    <div class="order-items">

                        ${itemsHTML}

                    </div>


                    <div class="order-total">

                        Total:
                        ₹${total}

                    </div>

                `;


                ordersContainer.appendChild(
                    orderCard
                );

            });

        },

        function (error) {

            console.error(
                "Firestore Orders Error:",
                error
            );


            ordersContainer.innerHTML = `

                <div class="empty-orders">

                    <div class="empty-orders-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Orders
                    </h2>

                    <p>
                        ${error.message}
                    </p>

                </div>

            `;

        }

    );

});