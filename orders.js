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


await authReady;


onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "auth.html";
        return;
    }

    loadOrders(user.uid);

});


function loadOrders(userId) {

    const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", userId)
    );


    onSnapshot(
        ordersQuery,

        (snapshot) => {

            const orders = [];


            snapshot.forEach((docSnap) => {

                const data = docSnap.data();

                const orderId =
                    data.id ||
                    data.orderId;

                const items =
                    normalizeItems(data);


                // Broken records hide karo
                if (
                    !orderId ||
                    orderId === "N/A" ||
                    items.length === 0
                ) {
                    return;
                }


                orders.push({

                    firestoreId: docSnap.id,

                    ...data,

                    id: orderId,

                    items: items

                });

            });


            // Newest order first
            orders.sort((a, b) => {

                return getOrderTime(b)
                     - getOrderTime(a);

            });


            renderOrders(orders);

        },


        (error) => {

            console.error(
                "Orders Error:",
                error
            );


            ordersContainer.innerHTML = `

                <div class="empty-orders">

                    <div class="empty-orders-icon">
                        ❌
                    </div>

                    <h2>
                        Unable to load orders
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

            items = JSON.parse(items);

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
            order.createdAt.seconds
            * 1000
        );

    }


    return 0;

}


// ========================================
// RENDER
// ========================================

function renderOrders(orders) {

    if (!orders.length) {

        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <div class="empty-orders-icon">
                    📦
                </div>

                <h2>
                    No Orders Yet
                </h2>

                <p>
                    You haven't placed any
                    orders yet.
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


    ordersContainer.innerHTML = "";


    orders.forEach((order) => {

        const card =
            document.createElement("div");


        card.className =
            "order-card";


        const items =
            order.items;


        const total =
            getOrderTotal(
                order,
                items
            );


        const status =
            order.status ||
            "Processing";


        // ====================================
        // STATUS
        // ====================================

        let statusHTML = `

            <span
                class="order-status processing"
            >
                ⏳ Processing
            </span>

        `;


        if (status === "Accepted") {

            statusHTML = `

                <span
                    class="order-status accepted"
                >
                    ✅ Accepted
                </span>

            `;

        }


        else if (
            status === "Cancelled"
        ) {

            statusHTML = `

                <span
                    class="order-status cancelled"
                >
                    ❌ Cancelled
                </span>

            `;

        }


        // ====================================
        // PAYMENT
        // ====================================

        let payment =
            order.paymentMethod ||
            "Cash on Delivery";


        if (payment === "cod") {

            payment =
                "Cash on Delivery";

        }


        else if (payment === "upi") {

            payment = "UPI";

        }


        else if (payment === "online") {

            payment =
                "Online Payment";

        }


        // ====================================
        // PRODUCTS
        // ====================================

        const itemsHTML =
            items.map((item) => {

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


                return `

                    <div class="order-item">

                        <span
                            class="order-item-name"
                        >
                            ${escapeHTML(name)}
                        </span>


                        <span
                            class="order-item-price"
                        >
                            ₹${price.toFixed(2)}
                            × ${quantity}
                        </span>

                    </div>

                `;

            }).join("");


        // ====================================
        // DELIVERY DATE
        // ====================================

        let deliveryHTML = "";


        if (order.deliveryDate) {

            deliveryHTML = `

                <div
                    class="delivery-date-box"
                >

                    🚚

                    <strong>
                        Delivery:
                    </strong>

                    ${escapeHTML(
                        formatDeliveryDate(
                            order.deliveryDate
                        )
                    )}

                </div>

            `;

        }


        // ====================================
        // FINAL CARD
        // ====================================

        card.innerHTML = `

            <div class="order-header">

                <div class="order-heading-left">

                    <div class="order-id">

                        Order #${escapeHTML(
                            order.id
                        )}

                    </div>


                    <div class="order-date">

                        ${escapeHTML(
                            order.orderDate || ""
                        )}

                        ${
                            order.orderTime
                            ? " • " +
                              escapeHTML(
                                  order.orderTime
                              )
                            : ""
                        }

                    </div>

                </div>


                <div class="order-status-wrap">

                    ${statusHTML}

                </div>

            </div>


            ${deliveryHTML}


            <div class="order-items">

                ${itemsHTML}

            </div>


            <div class="order-summary">

                <div class="order-total">

                    Total:
                    ₹${total.toFixed(2)}

                </div>


                <div class="order-payment">

                    Payment:
                    ${escapeHTML(payment)}

                </div>

            </div>

        `;


        ordersContainer.appendChild(card);

    });

}


// ========================================
// TOTAL
// ========================================

function getOrderTotal(
    order,
    items
) {

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


            return sum +
                price * quantity;

        },

        0
    );

}


// ========================================
// DELIVERY DATE FORMAT
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