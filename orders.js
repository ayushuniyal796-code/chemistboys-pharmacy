import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";

const ordersContainer = document.getElementById("ordersContainer");


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getOrderTotal(order) {

    // New orders
    if (Number(order.total) > 0) {
        return Number(order.total);
    }

    // Old orders
    if (Number(order.grandTotal) > 0) {
        return Number(order.grandTotal);
    }

    if (Number(order.amount) > 0) {
        return Number(order.amount);
    }

    // Calculate from products
    const items = order.items || order.products || [];

    return items.reduce((sum, item) => {

        const price = Number(
            item.price ??
            item.productPrice ??
            0
        );

        const quantity = Number(
            item.quantity ??
            item.qty ??
            1
        );

        return sum + (price * quantity);

    }, 0);
}


function getOrderDate(order) {

    if (order.orderDateISO) {
        return new Date(order.orderDateISO);
    }

    if (order.createdAt?.toDate) {
        return order.createdAt.toDate();
    }

    return new Date(0);
}


function renderOrders(orders) {

    if (!orders.length) {

        ordersContainer.innerHTML = `
            <div class="loading">
                <h2>📦 No Orders Found</h2>
                <p>You have not placed any orders yet.</p>
            </div>
        `;

        return;
    }


    orders.sort((a, b) => {
        return getOrderDate(b) - getOrderDate(a);
    });


    ordersContainer.innerHTML = orders.map(order => {

        const items = order.items || order.products || [];

        const total = getOrderTotal(order);

        const status = order.status || "Processing";


        const statusClass =
            status.toLowerCase() === "accepted"
                ? "accepted"
                : "processing";


        const itemsHTML = items.map(item => {

            const name =
                item.name ||
                item.productName ||
                "Product";


            const price = Number(
                item.price ??
                item.productPrice ??
                0
            );


            const quantity = Number(
                item.quantity ??
                item.qty ??
                1
            );


            return `
                <div class="order-product">

                    <span>
                        ${escapeHTML(name)}
                    </span>

                    <span>
                        ₹${price} × ${quantity}
                    </span>

                </div>
            `;

        }).join("");


        return `
            <div class="admin-order-card order-card">

                <div class="order-header">

                    <div>
                        <h3>
                            Order #${escapeHTML(order.id || "N/A")}
                        </h3>

                        <p>
                            ${escapeHTML(
                                order.orderDate || ""
                            )}
                            ${escapeHTML(
                                order.orderTime || ""
                            )}
                        </p>
                    </div>


                    <div class="order-status ${statusClass}">
                        ${escapeHTML(status)}
                    </div>

                </div>


                <div class="order-products">

                    ${itemsHTML}

                </div>


                <div class="order-footer">

                    <strong>
                        Total: ₹${total}
                    </strong>

                    <span>
                        Payment:
                        ${escapeHTML(
                            order.paymentMethod === "upi"
                                ? "UPI"
                                : "Cash on Delivery"
                        )}
                    </span>

                </div>

            </div>
        `;

    }).join("");
}



async function loadOrders() {

    await authReady;


    const user = auth.currentUser;


    if (!user) {

        window.location.href = "auth.html";
        return;

    }


    let ordersQuery;


    // ADMIN
    if (user.uid === ADMIN_UID) {

        ordersQuery = query(
            collection(db, "orders")
        );

    }

    // CUSTOMER
    else {

        ordersQuery = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
        );

    }


    onSnapshot(
        ordersQuery,

        (snapshot) => {

            const orders = [];

            snapshot.forEach(doc => {

                orders.push({
                    firestoreId: doc.id,
                    ...doc.data()
                });

            });


            renderOrders(orders);

        },

        (error) => {

            console.error(
                "Orders error:",
                error
            );


            ordersContainer.innerHTML = `
                <div class="loading">

                    <h2>❌ Error Loading Orders</h2>

                    <p>
                        ${escapeHTML(error.message)}
                    </p>

                </div>
            `;

        }
    );
}


loadOrders();