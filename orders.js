/* CHEMISTBOYS - MY ORDERS */

import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


document.addEventListener("DOMContentLoaded", async () => {

    const container =
        document.getElementById("ordersContainer");

    if (!container) return;


    // =========================
    // WAIT FOR FIREBASE AUTH
    // =========================

    await authReady;

    const user = auth.currentUser;


    if (!user) {

        container.innerHTML = `
            <div class="empty-orders">

                <div class="empty-orders-icon">
                    🔐
                </div>

                <h2>Please Login</h2>

                <p>
                    Please login to view your orders.
                </p>

                <a
                    href="login.html"
                    class="shop-btn"
                >
                    🔑 Login
                </a>

            </div>
        `;

        return;
    }


    // =========================
    // FIRESTORE QUERY
    // =========================

    let ordersQuery;


    if (user.uid === ADMIN_UID) {

        // Admin can see all orders
        ordersQuery =
            query(
                collection(db, "orders")
            );

    } else {

        // Customer can see ONLY their own orders
        ordersQuery =
            query(
                collection(db, "orders"),
                where(
                    "userId",
                    "==",
                    user.uid
                )
            );
    }


    // =========================
    // REAL-TIME ORDERS
    // =========================

    onSnapshot(
        ordersQuery,

        snapshot => {

            if (snapshot.empty) {

                container.innerHTML = `
                    <div class="empty-orders">

                        <div class="empty-orders-icon">
                            📦
                        </div>

                        <h2>No Orders Yet</h2>

                        <p>
                            You haven't placed any orders yet.
                        </p>

                    </div>
                `;

                return;
            }


            container.innerHTML = "";


            // =========================
            // SORT NEWEST FIRST
            // =========================

            const documents =
                [...snapshot.docs].sort(
                    (a, b) => {

                        const dateA =
                            a.data().orderDateISO ||
                            "";

                        const dateB =
                            b.data().orderDateISO ||
                            "";

                        return dateB.localeCompare(dateA);
                    }
                );


            documents.forEach(docSnap => {

                const order =
                    docSnap.data();


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
                        getItemPrice(item);


                    const quantity =
                        getItemQuantity(item);


                    const itemTotal =
                        price * quantity;


                    itemsHTML += `

                        <div class="order-item">

                            <span>
                                ${escapeHTML(name)}
                                × ${quantity}
                            </span>

                            <strong>
                                ₹${itemTotal}
                            </strong>

                        </div>

                    `;
                });


                if (!itemsHTML) {

                    itemsHTML = `

                        <div class="order-item">

                            <span>
                                No item details available
                            </span>

                        </div>

                    `;
                }


                // =========================
                // TOTAL
                // =========================

                let total =
                    getOrderTotal(
                        order,
                        items
                    );


                // Safety fallback
                if (
                    !Number.isFinite(total) ||
                    total < 0
                ) {

                    total = 0;

                }


                // =========================
                // STATUS
                // =========================

                const status =
                    order.status ||
                    "Processing";


                // =========================
                // PAYMENT
                // =========================

                let payment =
                    "Pending";


                if (
                    order.paymentMethod === "cod"
                ) {

                    payment =
                        "Cash on Delivery";

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
                    order.orderDate ||
                    "N/A";


                const orderTime =
                    order.orderTime ||
                    "N/A";


                const deliveryDate =
                    order.deliveryDate ||
                    "N/A";


                // =========================
                // CREATE CARD
                // =========================

                const card =
                    document.createElement("div");


                card.className =
                    "order-card";


                card.innerHTML = `

                    <div class="order-header">

                        <div class="order-id">

                            Order #
                            ${escapeHTML(
                                order.id ||
                                docSnap.id
                            )}

                        </div>

                        <div class="order-status">

                            ${escapeHTML(status)}

                        </div>

                    </div>


                    <div class="order-info">

                        <p>

                            📅
                            <strong>
                                Order Date:
                            </strong>

                            ${escapeHTML(orderDate)}

                        </p>


                        <p>

                            🕐
                            <strong>
                                Order Time:
                            </strong>

                            ${escapeHTML(orderTime)}

                        </p>


                        <p>

                            🚚
                            <strong>
                                Expected Delivery:
                            </strong>

                            ${escapeHTML(deliveryDate)}

                        </p>


                        <p>

                            💳
                            <strong>
                                Payment:
                            </strong>

                            ${escapeHTML(payment)}

                        </p>


                        <p>

                            📦
                            <strong>
                                Order Status:
                            </strong>

                            ${escapeHTML(status)}

                        </p>

                    </div>


                    <div class="order-items">

                        ${itemsHTML}

                    </div>


                    <div class="order-total">

                        Total:
                        ₹${total.toFixed(2)}

                    </div>

                `;


                container.appendChild(card);

            });

        },


        error => {

            console.error(
                "Orders Error:",
                error
            );


            container.innerHTML = `

                <div class="empty-orders">

                    <div class="empty-orders-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Orders
                    </h2>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>

                </div>

            `;
        }
    );

});


// =====================================================
// GET ITEM PRICE
// =====================================================

function getItemPrice(item) {

    const price =
        Number(item.price);


    if (
        Number.isFinite(price) &&
        price > 0
    ) {

        return price;

    }


    const productPrice =
        Number(item.productPrice);


    if (
        Number.isFinite(productPrice) &&
        productPrice > 0
    ) {

        return productPrice;

    }


    return 0;
}


// =====================================================
// GET ITEM QUANTITY
// =====================================================

function getItemQuantity(item) {

    const quantity =
        Number(item.quantity);


    if (
        Number.isFinite(quantity) &&
        quantity > 0
    ) {

        return quantity;

    }


    const qty =
        Number(item.qty);


    if (
        Number.isFinite(qty) &&
        qty > 0
    ) {

        return qty;

    }


    return 1;
}


// =====================================================
// GET ORDER TOTAL
// =====================================================

function getOrderTotal(order, items) {

    // First priority: Firestore total
    const total =
        Number(order.total);


    if (
        Number.isFinite(total) &&
        total > 0
    ) {

        return total;

    }


    // Second priority: grandTotal
    const grandTotal =
        Number(order.grandTotal);


    if (
        Number.isFinite(grandTotal) &&
        grandTotal > 0
    ) {

        return grandTotal;

    }


    // Third priority: amount
    const amount =
        Number(order.amount);


    if (
        Number.isFinite(amount) &&
        amount > 0
    ) {

        return amount;

    }


    // Final fallback:
    // Calculate from products
    if (items.length > 0) {

        return items.reduce(
            (sum, item) => {

                const price =
                    getItemPrice(item);

                const quantity =
                    getItemQuantity(item);

                return (
                    sum +
                    price * quantity
                );

            },
            0
        );
    }


    return 0;
}


// =====================================================
// HTML SAFETY
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}