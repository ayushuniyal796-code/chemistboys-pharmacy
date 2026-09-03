import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const ordersContainer =
    document.getElementById("ordersContainer");


// ========================================
// WAIT FOR FIREBASE AUTH
// ========================================

await authReady;


onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "auth.html";

        return;
    }

    loadMyOrders(user.uid);

});


// ========================================
// LOAD MY ORDERS
// ========================================

function loadMyOrders(userId) {

    const ordersRef = collection(db, "orders");

    const ordersQuery = query(
        ordersRef,
        where("userId", "==", userId)
    );


    onSnapshot(
        ordersQuery,

        (snapshot) => {

            let orders = [];


            snapshot.forEach((docSnap) => {

                const data = docSnap.data();

                /*
                 * IMPORTANT:
                 * Firestore document ID save rakhenge
                 * taaki status hamesha latest Firestore
                 * se aaye.
                 */

                orders.push({
                    firestoreId: docSnap.id,
                    ...data
                });

            });


            // ========================================
            // REMOVE INVALID / OLD BROKEN ORDERS
            // ========================================

            orders = orders.filter((order) => {

                // Proper order ID hona chahiye
                if (
                    !order.id ||
                    order.id === "N/A"
                ) {
                    return false;
                }


                // Products/items hona chahiye
                const items =
                    Array.isArray(order.items)
                        ? order.items
                        : Array.isArray(order.products)
                            ? order.products
                            : [];


                if (items.length === 0) {
                    return false;
                }


                return true;

            });


            // ========================================
            // SORT NEWEST FIRST
            // ========================================

            orders.sort((a, b) => {

                const dateA =
                    a.orderDateISO
                        ? new Date(a.orderDateISO).getTime()
                        : 0;

                const dateB =
                    b.orderDateISO
                        ? new Date(b.orderDateISO).getTime()
                        : 0;

                return dateB - dateA;

            });


            renderOrders(orders);

        },

        (error) => {

            console.error(
                "My Orders Error:",
                error
            );


            ordersContainer.innerHTML = `
                <div class="loading">
                    <h2>❌ Unable to load orders</h2>
                    <p>
                        ${escapeHTML(error.message)}
                    </p>
                </div>
            `;

        }

    );

}


// ========================================
// RENDER ORDERS
// ========================================

function renderOrders(orders) {

    if (!orders.length) {

        ordersContainer.innerHTML = `
            <div class="loading">
                <h2>📦 No Orders Yet</h2>

                <p>
                    You haven't placed any orders yet.
                </p>
            </div>
        `;

        return;
    }


    ordersContainer.innerHTML = "";


    orders.forEach((order) => {

        const card =
            document.createElement("div");

        card.className = "order-card";


        // ========================================
        // ORDER ITEMS
        // ========================================

        const items =
            Array.isArray(order.items)
                ? order.items
                : Array.isArray(order.products)
                    ? order.products
                    : [];


        let itemsHTML = "";


        items.forEach((item) => {

            const name =
                item.name ||
                item.productName ||
                "Product";


            const price =
                Number(item.price) ||
                Number(item.productPrice) ||
                0;


            const quantity =
                Number(item.quantity) ||
                Number(item.qty) ||
                1;


            itemsHTML += `

                <div class="order-product">

                    <div>

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                    </div>

                    <div>

                        ₹${price.toFixed(2)}
                        × ${quantity}

                    </div>

                </div>

            `;

        });


        // ========================================
        // TOTAL
        // ========================================

        let total =
            Number(order.total);


        /*
         * Agar total Firestore me proper hai,
         * wahi use hoga.
         */

        if (
            !Number.isFinite(total) ||
            total <= 0
        ) {

            total =
                Number(order.grandTotal);

        }


        /*
         * Agar old order me total nahi hai,
         * products ke prices se calculate karo.
         */

        if (
            !Number.isFinite(total) ||
            total <= 0
        ) {

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


                    return sum +
                        (price * quantity);

                },

                0
            );

        }


        // ========================================
        // STATUS
        // ========================================

        /*
         * VERY IMPORTANT:
         *
         * Status ONLY Firestore se.
         *
         * LocalStorage se Accepted nahi lenge.
         */

        const status =
            order.status || "Processing";


        let statusHTML = "";


        if (status === "Accepted") {

            statusHTML = `
                <span class="order-status accepted">
                    ✅ Accepted
                </span>
            `;

        }

        else if (status === "Cancelled") {

            statusHTML = `
                <span class="order-status cancelled">
                    ❌ Cancelled
                </span>
            `;

        }

        else {

            statusHTML = `
                <span class="order-status processing">
                    ⏳ Processing
                </span>
            `;

        }


        // ========================================
        // PAYMENT
        // ========================================

        let payment =
            order.paymentMethod ||
            "Cash on Delivery";


        if (payment === "cod") {

            payment =
                "Cash on Delivery";

        }

        else if (payment === "upi") {

            payment =
                "UPI";

        }

        else if (payment === "online") {

            payment =
                "Online Payment";

        }


        // ========================================
        // DATE
        // ========================================

        const orderDate =
            order.orderDate || "";


        const orderTime =
            order.orderTime || "";


        // ========================================
        // FINAL CARD
        // ========================================

        card.innerHTML = `

            <div class="order-card-header">

                <div>

                    <h2>
                        Order #${escapeHTML(
                            order.id
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(orderDate)}
                        ${orderTime
                            ? " " +
                              escapeHTML(orderTime)
                            : ""
                        }
                    </p>

                </div>

                <div>
                    ${statusHTML}
                </div>

            </div>


            <div class="order-products">

                ${itemsHTML}

            </div>


            <div class="order-summary">

                <strong>
                    Total:
                    ₹${total.toFixed(2)}
                </strong>

                <span>
                    Payment:
                    ${escapeHTML(payment)}
                </span>

            </div>

        `;


        ordersContainer.appendChild(card);

    });

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}