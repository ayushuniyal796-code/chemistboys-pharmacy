import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", async function () {

    await authReady;

    const user = auth.currentUser;

    // User login nahi hai
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Admin nahi hai
    if (user.uid !== ADMIN_UID) {

        document.body.innerHTML = `
            <div style="
                text-align:center;
                padding:60px 20px;
                font-family:Arial;
            ">

                <h1>🚫 Access Denied</h1>

                <p>
                    You are not authorized to access the Admin Panel.
                </p>

                <button
                    onclick="logoutAdmin()"
                    style="
                        padding:12px 25px;
                        border:none;
                        border-radius:8px;
                        background:#dc3545;
                        color:white;
                        cursor:pointer;
                    "
                >
                    Logout
                </button>

            </div>
        `;

        return;
    }

    // Admin hai
    loadOrders();

});


// ======================================================
// LOAD ORDERS
// ======================================================

async function loadOrders() {

    const ordersContainer =
        document.getElementById("ordersContainer");

    if (!ordersContainer) return;


    ordersContainer.innerHTML = `
        <p style="
            text-align:center;
            padding:30px;
        ">
            Loading orders...
        </p>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(db, "orders")
            );


        // No orders
        if (snapshot.empty) {

            ordersContainer.innerHTML = `
                <div style="
                    text-align:center;
                    padding:40px;
                ">

                    <h2>📦 No Orders Yet</h2>

                    <p>
                        Customer orders will appear here.
                    </p>

                </div>
            `;

            return;
        }


        let orders = [];


        snapshot.forEach(function (orderDoc) {

            const data = orderDoc.data();

            orders.push({

                // Real Firestore document ID
                firestoreId: orderDoc.id,

                // All order data
                ...data

            });

        });


        // ==================================================
        // NEWEST ORDER FIRST
        // ==================================================

        orders.sort(function (a, b) {

            const dateA =
                a.createdAt?.seconds || 0;

            const dateB =
                b.createdAt?.seconds || 0;

            return dateB - dateA;

        });


        ordersContainer.innerHTML = "";


        // ==================================================
        // DISPLAY EACH ORDER
        // ==================================================

        orders.forEach(function (order) {


            const card =
                document.createElement("div");


            card.className =
                "admin-order-card";


            // ==================================================
            // ORDER STATUS
            // ==================================================

            const status =
                order.status || "Processing";


            // ==================================================
            // PAYMENT STATUS
            // ==================================================

            let paymentText = "Pending";


            if (
                order.paymentMethod === "cod"
            ) {

                paymentText =
                    "Cash on Delivery";

            }

            else if (
                order.paymentMethod === "upi" ||
                order.paymentMethod === "online"
            ) {

                if (
                    order.paymentStatus === "Paid"
                ) {

                    paymentText =
                        "Paid Online";

                } else {

                    paymentText =
                        "Online Payment - Pending";

                }

            }


            // ==================================================
            // CALCULATE TOTAL
            // ==================================================

            /*
                Priority:

                1. order.total
                2. order.grandTotal
                3. items price × quantity

                Isse Accepted order me ₹0 ka problem
                nahi aayega agar total kisi aur field me ho.
            */

            let total =
                Number(order.total);


            if (
                !Number.isFinite(total) ||
                total <= 0
            ) {

                total =
                    Number(order.grandTotal);

            }


            // Agar total phir bhi nahi mila
            if (
                !Number.isFinite(total) ||
                total <= 0
            ) {

                total = 0;


                if (
                    Array.isArray(order.items)
                ) {

                    order.items.forEach(function (item) {

                        const price =
                            Number(item.price) || 0;

                        const quantity =
                            Number(item.quantity) || 1;

                        total +=
                            price * quantity;

                    });

                }

            }


            // ==================================================
            // ITEMS
            // ==================================================

            let itemsHTML = "";


            if (
                Array.isArray(order.items) &&
                order.items.length > 0
            ) {

                order.items.forEach(function (item) {

                    const name =
                        item.name || "Medicine";


                    const price =
                        Number(item.price) || 0;


                    const quantity =
                        Number(item.quantity) || 1;


                    const itemTotal =
                        price * quantity;


                    itemsHTML += `

                        <div style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            padding:8px 0;
                            border-bottom:1px solid #eee;
                        ">

                            <span>
                                ${name} × ${quantity}
                            </span>

                            <strong>
                                ₹${itemTotal}
                            </strong>

                        </div>

                    `;

                });

            }

            else {

                itemsHTML = `
                    <p>
                        No item details available
                    </p>
                `;

            }


            // ==================================================
            // ORDER CARD
            // ==================================================

            card.innerHTML = `

                <div style="
                    padding:20px;
                    margin-bottom:20px;
                    border-radius:12px;
                    background:white;
                    box-shadow:0 2px 10px rgba(0,0,0,0.1);
                ">


                    <!-- HEADER -->

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:15px;
                    ">

                        <h2 style="
                            margin:0;
                        ">
                            Order #${order.id || "N/A"}
                        </h2>


                        <span style="
                            padding:6px 12px;
                            border-radius:20px;

                            background:
                            ${
                                status === "Accepted"
                                ? "#d4edda"
                                : "#fff3cd"
                            };

                            color:
                            ${
                                status === "Accepted"
                                ? "#155724"
                                : "#856404"
                            };
                        ">

                            ${status}

                        </span>

                    </div>


                    <hr>


                    <!-- CUSTOMER DETAILS -->

                    <h3>
                        👤 Customer Details
                    </h3>


                    <p>
                        <strong>Name:</strong>
                        ${order.customerName || "N/A"}
                    </p>


                    <p>
                        <strong>Email:</strong>
                        ${order.email || "N/A"}
                    </p>


                    <p>
                        <strong>Phone:</strong>
                        ${order.phone || "N/A"}
                    </p>


                    <p>
                        <strong>Address:</strong>
                        ${order.address || "N/A"}
                    </p>


                    <p>
                        <strong>City:</strong>
                        ${order.city || "N/A"}
                    </p>


                    <p>
                        <strong>Pincode:</strong>
                        ${order.pincode || "N/A"}
                    </p>


                    <hr>


                    <!-- ORDER DETAILS -->

                    <h3>
                        📦 Order Details
                    </h3>


                    <p>
                        <strong>Order Date:</strong>
                        ${order.orderDate || "N/A"}
                    </p>


                    <p>
                        <strong>Order Time:</strong>
                        ${order.orderTime || "N/A"}
                    </p>


                    <p>
                        <strong>Expected Delivery:</strong>
                        ${order.deliveryDate || "N/A"}
                    </p>


                    <p>
                        <strong>Payment:</strong>
                        ${paymentText}
                    </p>


                    <!-- ITEMS -->

                    <h3>
                        🛒 Items
                    </h3>


                    <div>
                        ${itemsHTML}
                    </div>


                    <!-- TOTAL -->

                    <h2 style="
                        margin-top:18px;
                        font-size:22px;
                    ">

                        Total:
                        ₹${total}

                    </h2>


                    <!-- BUTTONS -->

                    <div style="
                        display:flex;
                        gap:10px;
                        margin-top:18px;
                        flex-wrap:wrap;
                    ">


                        ${
                            status !== "Accepted"

                            ? `

                                <button
                                    class="accept-order-btn"
                                    data-firestore-id="${order.firestoreId}"
                                    style="
                                        padding:10px 18px;
                                        border:none;
                                        border-radius:7px;
                                        background:#28a745;
                                        color:white;
                                        cursor:pointer;
                                    "
                                >

                                    ✅ Accept Order

                                </button>

                            `

                            : `

                                <button
                                    disabled
                                    style="
                                        padding:10px 18px;
                                        border:none;
                                        border-radius:7px;
                                        background:#6c757d;
                                        color:white;
                                    "
                                >

                                    ✅ Accepted

                                </button>

                            `
                        }


                        <button
                            class="delete-order-btn"
                            data-firestore-id="${order.firestoreId}"
                            style="
                                padding:10px 18px;
                                border:none;
                                border-radius:7px;
                                background:#dc3545;
                                color:white;
                                cursor:pointer;
                            "
                        >

                            🗑️ Delete

                        </button>


                    </div>

                </div>

            `;


            ordersContainer.appendChild(card);

        });


        // ==================================================
        // ACCEPT BUTTONS
        // ==================================================

        document
            .querySelectorAll(".accept-order-btn")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const firestoreId =
                            this.dataset.firestoreId;


                        acceptOrder(
                            firestoreId
                        );

                    }
                );

            });


        // ==================================================
        // DELETE BUTTONS
        // ==================================================

        document
            .querySelectorAll(".delete-order-btn")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const firestoreId =
                            this.dataset.firestoreId;


                        deleteOrder(
                            firestoreId
                        );

                    }
                );

            });


    }

    catch (error) {

        console.error(
            "Error loading orders:",
            error
        );


        ordersContainer.innerHTML = `

            <div style="
                text-align:center;
                padding:30px;
                color:red;
            ">

                <h2>
                    ❌ Error Loading Orders
                </h2>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// ======================================================
// ACCEPT ORDER
// ======================================================

async function acceptOrder(
    firestoreId
) {

    if (!firestoreId) {

        alert(
            "Invalid Firestore Order ID"
        );

        return;

    }


    try {

        /*
            IMPORTANT:

            Yahan sirf status change ho raha hai.

            total ko touch nahi kar rahe.
        */

        await updateDoc(

            doc(
                db,
                "orders",
                firestoreId
            ),

            {
                status: "Accepted"
            }

        );


        alert(
            "✅ Order Accepted"
        );


        // Orders reload
        loadOrders();

    }

    catch (error) {

        console.error(
            "Accept order error:",
            error
        );


        alert(
            "❌ Failed to accept order: " +
            error.message
        );

    }

}


// ======================================================
// DELETE ORDER
// ======================================================

async function deleteOrder(
    firestoreId
) {

    if (!firestoreId) {

        alert(
            "Invalid Order ID"
        );

        return;

    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this order?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await deleteDoc(

            doc(
                db,
                "orders",
                firestoreId
            )

        );


        alert(
            "🗑️ Order Deleted"
        );


        // Reload
        loadOrders();

    }

    catch (error) {

        console.error(
            "Delete order error:",
            error
        );


        alert(
            "❌ Failed to delete order: " +
            error.message
        );

    }

}


// ======================================================
// LOGOUT
// ======================================================

window.logoutAdmin =
    async function () {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    };