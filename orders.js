import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ========================================
// ELEMENT
// ========================================

const ordersContainer =
    document.getElementById("ordersContainer");


// ========================================
// AUTH
// ========================================

await authReady;

if (!auth.currentUser) {

    window.location.href = "auth.html";

} else {

    loadMyOrders(auth.currentUser.uid);

}


// ========================================
// LOAD MY ORDERS
// ========================================

function loadMyOrders(uid) {

    const ordersQuery =
        query(
            collection(db, "orders"),
            where("userId", "==", uid)
        );


    onSnapshot(

        ordersQuery,

        (snapshot) => {

            ordersContainer.innerHTML = "";


            const orders = [];


            snapshot.forEach((docSnap) => {

                const data =
                    docSnap.data();


                const order = {

                    firestoreId:
                        docSnap.id,

                    ...data

                };


                // Broken orders hide karo
                const orderId =
                    order.id ||
                    order.orderId;


                const items =
                    normalizeItems(order);


                if (!orderId || items.length === 0) {

                    return;

                }


                orders.push(order);

            });


            // Newest first
            orders.sort((a, b) => {

                return (
                    getOrderTime(b)
                    -
                    getOrderTime(a)
                );

            });


            if (orders.length === 0) {

                ordersContainer.innerHTML = `

                    <div class="empty-orders">

                        <h2>
                            📦 No Orders Found
                        </h2>

                        <p>
                            You have not placed any orders yet.
                        </p>

                        <a
                            href="index.html"
                            class="shop-btn"
                        >
                            🛒 Start Shopping
                        </a>

                    </div>

                `;

                return;

            }


            orders.forEach((order) => {

                renderOrder(order);

            });

        },


        (error) => {

            console.error(
                "Orders Error:",
                error
            );


            ordersContainer.innerHTML = `

                <div class="empty-orders">

                    <h2>
                        ❌ Unable to Load Orders
                    </h2>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            `;

        }

    );

}


// ========================================
// RENDER ORDER
// ========================================

function renderOrder(order) {

    const orderId =
        order.id ||
        order.orderId ||
        "N/A";


    const items =
        normalizeItems(order);


    const status =
        order.status ||
        "Processing";


    const total =
        getOrderTotal(
            order,
            items
        );


    // ====================================
    // STATUS
    // ====================================

    let statusText =
        "⏳ Processing";


    let statusClass =
        "processing";


    if (status === "Accepted") {

        statusText =
            "✅ Accepted";

        statusClass =
            "accepted";

    }


    else if (status === "Cancelled") {

        statusText =
            "❌ Cancelled";

        statusClass =
            "cancelled";

    }


    // ====================================
    // ITEMS
    // ====================================

    let itemsHTML = "";


    items.forEach((item) => {

        const name =
            item.name ||
            item.productName ||
            "Product";


        const price =
            Number(
                item.price ??
                item.productPrice
            ) || 0;


        const quantity =
            Number(
                item.quantity ??
                item.qty
            ) || 1;


        itemsHTML += `

            <div class="order-item">

                <div class="order-item-name">

                    ${escapeHTML(name)}

                </div>


                <div class="order-item-price">

                    ₹${price.toFixed(2)}
                    × ${quantity}

                </div>

            </div>

        `;

    });


    // ====================================
    // DELIVERY DATE
    // ====================================

    let deliveryHTML = "";


    /*
       IMPORTANT:

       Delivery date sirf Accepted order mein
       show hogi.

       Processing mein date nahi dikhegi.
       Cancelled mein bhi date nahi dikhegi.
    */

    if (
        status === "Accepted" &&
        order.deliveryDate
    ) {

        deliveryHTML = `

            <div class="delivery-date-box">

                🚚 Delivery:
                <strong>
                    ${escapeHTML(
                        formatDeliveryDate(
                            order.deliveryDate
                        )
                    )}
                </strong>

            </div>

        `;

    }


    // ====================================
    // PAYMENT
    // ====================================

    let payment =
        order.paymentMethod ||
        "N/A";


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


    // ====================================
    // DATE & TIME
    // ====================================

    let orderDate =
        order.orderDate ||
        "";


    let orderTime =
        order.orderTime ||
        "";


    // ====================================
    // CARD
    // ====================================

    const card =
        document.createElement("div");


    card.className =
        "order-card";


    card.innerHTML = `

        <div class="order-header">

            <div class="order-heading-left">

                <div class="order-id">

                    Order
                    <br>

                    #${escapeHTML(orderId)}

                </div>


                ${
                    orderDate
                    ? `
                        <div class="order-date">

                            ${escapeHTML(orderDate)}

                            ${
                                orderTime
                                ? " • " +
                                  escapeHTML(orderTime)
                                : ""
                            }

                        </div>
                    `
                    : ""
                }

            </div>


            <div class="order-status-wrap">

                <span
                    class="order-status ${statusClass}"
                >

                    ${statusText}

                </span>

            </div>

        </div>


        ${deliveryHTML}


        <div class="order-items">

            ${itemsHTML}

        </div>


        <div class="order-summary">

            <div class="order-total">

                <strong>
                    Total: ₹${total.toFixed(2)}
                </strong>

            </div>


            <div class="order-payment">

                Payment:
                ${escapeHTML(payment)}

            </div>

        </div>

    `;


    ordersContainer.appendChild(card);

}


// ========================================
// ORDER TIME
// ========================================

function getOrderTime(order) {

    if (order.orderDateISO) {

        const time =
            new Date(
                order.orderDateISO
            ).getTime();


        if (Number.isFinite(time)) {

            return time;

        }

    }


    if (order.createdAt?.seconds) {

        return (
            order.createdAt.seconds *
            1000
        );

    }


    return 0;

}


// ========================================
// NORMALIZE ITEMS
// ========================================

function normalizeItems(order) {

    let items =
        order.items ||
        order.products ||
        order.cartItems ||
        [];


    if (typeof items === "string") {

        try {

            items =
                JSON.parse(items);

        }

        catch {

            items = [];

        }

    }


    return Array.isArray(items)
        ? items
        : [];

}


// ========================================
// TOTAL
// ========================================

function getOrderTotal(order, items) {

    const savedTotal =
        Number(order.total);


    if (
        Number.isFinite(savedTotal) &&
        savedTotal > 0
    ) {

        return savedTotal;

    }


    const grandTotal =
        Number(order.grandTotal);


    if (
        Number.isFinite(grandTotal) &&
        grandTotal > 0
    ) {

        return grandTotal;

    }


    const amount =
        Number(order.amount);


    if (
        Number.isFinite(amount) &&
        amount > 0
    ) {

        return amount;

    }


    return items.reduce(

        (sum, item) => {

            const price =
                Number(
                    item.price ??
                    item.productPrice
                ) || 0;


            const quantity =
                Number(
                    item.quantity ??
                    item.qty
                ) || 1;


            return (
                sum +
                price * quantity
            );

        },

        0

    );

}


// ========================================
// FORMAT DELIVERY DATE
// ========================================

function formatDeliveryDate(value) {

    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(

        "en-IN",

        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }

    );

}


// ========================================
// ESCAPE HTML
// ========================================

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