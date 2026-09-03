import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    query,
    onSnapshot,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const ADMIN_UID =
    "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


const ordersContainer =
    document.getElementById("ordersContainer");


// ========================================
// AUTH CHECK
// ========================================

await authReady;


onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href =
            "auth.html";

        return;
    }


    if (user.uid !== ADMIN_UID) {

        ordersContainer.innerHTML = `

            <div class="loading">

                <h2>
                    ❌ Access Denied
                </h2>

                <p>
                    You are not authorized
                    to access Admin Panel.
                </p>

            </div>

        `;

        return;
    }


    loadOrders();

});


// ========================================
// LOAD ORDERS
// ========================================

function loadOrders() {

    /*
       orderBy() intentionally nahi use kiya.
       Isse purane orders bhi safely load honge
       even agar unme orderDateISO missing ho.
    */

    const ordersQuery =
        query(
            collection(db, "orders")
        );


    onSnapshot(

        ordersQuery,

        (snapshot) => {

            if (snapshot.empty) {

                ordersContainer.innerHTML = `

                    <div class="loading">

                        <h2>
                            📦 No Orders
                        </h2>

                        <p>
                            No customer orders found.
                        </p>

                    </div>

                `;

                return;
            }


            const orders = [];


            snapshot.forEach((docSnap) => {

                orders.push({

                    firestoreId:
                        docSnap.id,

                    ...docSnap.data()

                });

            });


            // Newest orders first
            orders.sort((a, b) => {

                return (
                    getOrderTime(b)
                    -
                    getOrderTime(a)
                );

            });


            ordersContainer.innerHTML =
                "";


            orders.forEach((order) => {

                renderOrder(
                    order,
                    order.firestoreId
                );

            });

        },


        (error) => {

            console.error(
                "Orders Error:",
                error
            );


            ordersContainer.innerHTML = `

                <div class="loading">

                    <h2>
                        ❌ Error Loading Orders
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
// RENDER ORDER
// ========================================

function renderOrder(
    order,
    firestoreId
) {

    const card =
        document.createElement("div");


    card.className =
        "admin-order-card";


    const items =
        normalizeItems(order);


    // ====================================
    // PRODUCTS
    // ====================================

    let itemsHTML = "";


    items.forEach((item) => {

        const name =
            item.name ||
            item.productName ||
            "Product";


        const quantity =
            Number(
                item.quantity ??
                item.qty
            ) || 1;


        const price =
            Number(
                item.price ??
                item.productPrice
            ) || 0;


        itemsHTML += `

            <div style="
                padding:10px 0;
                border-bottom:
                    1px solid #e8efed;
            ">

                <strong>
                    ${escapeHTML(name)}
                </strong>

                <br>

                <small>
                    ₹${price.toFixed(2)}
                    × ${quantity}
                </small>

            </div>

        `;

    });


    // ====================================
    // TOTAL
    // ====================================

    const total =
        getOrderTotal(
            order,
            items
        );


    // ====================================
    // STATUS
    // ====================================

    const status =
        order.status ||
        "Processing";


    let statusText =
        "⏳ Processing";


    let statusBackground =
        "#fff3cd";


    let statusColor =
        "#856404";


    if (status === "Accepted") {

        statusText =
            "✅ Accepted";

        statusBackground =
            "#d4edda";

        statusColor =
            "#155724";

    }


    else if (
        status === "Cancelled"
    ) {

        statusText =
            "❌ Cancelled";

        statusBackground =
            "#f8d7da";

        statusColor =
            "#721c24";

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
    // DELIVERY DATE
    // ====================================

    let deliveryHTML = "";


    if (order.deliveryDate) {

        deliveryHTML = `

            <div style="
                margin-top:15px;
                padding:12px 15px;
                border-radius:12px;
                background:#edf9f6;
                color:#087c6b;
                font-weight:700;
            ">

                🚚 Delivery Date:
                ${escapeHTML(
                    formatDeliveryDate(
                        order.deliveryDate
                    )
                )}

            </div>

        `;

    }


    // ====================================
    // BUTTONS
    // ====================================

    let buttonsHTML = "";


    if (
        status !== "Accepted" &&
        status !== "Cancelled"
    ) {

        buttonsHTML = `

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
                        flex:1;
                        min-width:140px;
                        background:#0ca88f;
                        color:white;
                        border:none;
                        padding:13px 18px;
                        border-radius:10px;
                        cursor:pointer;
                        font-weight:800;
                    "
                >
                    ✅ Accept Order
                </button>


                <button
                    class="cancel-order-btn"
                    data-id="${firestoreId}"
                    style="
                        flex:1;
                        min-width:140px;
                        background:#dc3545;
                        color:white;
                        border:none;
                        padding:13px 18px;
                        border-radius:10px;
                        cursor:pointer;
                        font-weight:800;
                    "
                >
                    ❌ Cancel Order
                </button>

            </div>

        `;

    }


    // ====================================
    // CARD HTML
    // ====================================

    card.innerHTML = `

        <div style="
            background:white;
            border-radius:18px;
            padding:25px;
            margin-bottom:20px;
            box-shadow:
                0 5px 20px
                rgba(0,0,0,.08);
        ">


            <!-- HEADER -->

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
                margin-bottom:20px;
            ">

                <div>

                    <h2 style="
                        margin:0;
                        color:#075f55;
                        font-size:21px;
                    ">

                        🧾 Order
                        ${escapeHTML(
                            order.id ||
                            order.orderId ||
                            firestoreId
                        )}

                    </h2>


                    <p style="
                        margin:6px 0 0;
                        color:#718987;
                        font-size:14px;
                    ">

                        ${escapeHTML(
                            order.orderDate ||
                            ""
                        )}

                        ${
                            order.orderTime
                            ? " • " +
                              escapeHTML(
                                  order.orderTime
                              )
                            : ""
                        }

                    </p>

                </div>


                <div style="
                    flex-shrink:0;
                    font-weight:800;
                    padding:10px 15px;
                    border-radius:25px;
                    background:${statusBackground};
                    color:${statusColor};
                    white-space:nowrap;
                ">

                    ${statusText}

                </div>

            </div>


            <!-- CUSTOMER -->

            <div style="
                background:#f7fbfa;
                padding:17px;
                border-radius:13px;
                margin-bottom:18px;
            ">

                <h3 style="
                    margin-top:0;
                    color:#075f55;
                ">
                    👤 Customer Details
                </h3>


                <p>
                    <strong>Name:</strong>
                    ${escapeHTML(
                        order.customerName ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(
                        order.email ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(
                        order.phone ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>Address:</strong>
                    ${escapeHTML(
                        order.address ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>City:</strong>
                    ${escapeHTML(
                        order.city ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>Pincode:</strong>
                    ${escapeHTML(
                        order.pincode ||
                        "N/A"
                    )}
                </p>

            </div>


            <!-- PRODUCTS -->

            <h3 style="
                color:#075f55;
            ">
                🛒 Products
            </h3>


            <div style="
                background:#fafdfc;
                padding:12px 15px;
                border-radius:12px;
            ">

                ${itemsHTML}

            </div>


            <!-- DELIVERY -->

            ${deliveryHTML}


            <!-- PAYMENT -->

            <div style="
                margin-top:20px;
                padding:17px;
                background:#f7fbfa;
                border-radius:13px;
            ">

                <p>
                    <strong>
                        Payment:
                    </strong>

                    ${escapeHTML(payment)}

                </p>


                <p>
                    <strong>
                        Payment Status:
                    </strong>

                    ${escapeHTML(
                        order.paymentStatus ||
                        "Pending"
                    )}

                </p>


                <h2 style="
                    color:#075f55;
                    margin-bottom:0;
                ">

                    💰 ₹${total.toFixed(2)}

                </h2>

            </div>


            <!-- BUTTONS -->

            ${buttonsHTML}

        </div>

    `;


    ordersContainer.appendChild(card);


    // ====================================
    // ACCEPT BUTTON
    // ====================================

    const acceptBtn =
        card.querySelector(
            ".accept-order-btn"
        );


    if (acceptBtn) {

        acceptBtn.addEventListener(
            "click",
            () => {

                openDeliveryCalendar(
                    firestoreId
                );

            }
        );

    }


    // ====================================
    // CANCEL BUTTON
    // ====================================

    const cancelBtn =
        card.querySelector(
            ".cancel-order-btn"
        );


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

                    cancelBtn.disabled =
                        true;


                    cancelBtn.textContent =
                        "Cancelling...";


                    await updateDoc(

                        doc(
                            db,
                            "orders",
                            firestoreId
                        ),

                        {
                            status:
                                "Cancelled"
                        }

                    );

                }


                catch (error) {

                    console.error(
                        "Cancel Error:",
                        error
                    );


                    cancelBtn.disabled =
                        false;


                    cancelBtn.textContent =
                        "❌ Cancel Order";


                    alert(
                        "Order cancel nahi ho paya."
                    );

                }

            }
        );

    }

}


// ========================================
// DELIVERY DATE CALENDAR
// ========================================

function openDeliveryCalendar(
    firestoreId
) {

    const today =
        getTodayISO();


    const modal =
        document.createElement("div");


    modal.className =
        "delivery-modal";


    modal.innerHTML = `

        <div class="delivery-modal-box">


            <button
                type="button"
                class="delivery-close"
            >
                ×
            </button>


            <div class="delivery-icon">
                🚚
            </div>


            <h2>
                Select Delivery Date
            </h2>


            <p>
                Select the date on which
                this order will be delivered.
            </p>


            <label>
                Delivery Date
            </label>


            <input
                type="date"
                id="deliveryDateInput"
                min="${today}"
                value="${today}"
            />


            <div class="delivery-modal-actions">


                <button
                    type="button"
                    class="delivery-cancel-btn"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    class="delivery-confirm-btn"
                >
                    ✅ Accept Order
                </button>


            </div>

        </div>

    `;


    document.body.appendChild(modal);


    const input =
        modal.querySelector(
            "#deliveryDateInput"
        );


    const closeBtn =
        modal.querySelector(
            ".delivery-close"
        );


    const cancelBtn =
        modal.querySelector(
            ".delivery-cancel-btn"
        );


    const confirmBtn =
        modal.querySelector(
            ".delivery-confirm-btn"
        );


    function closeModal() {

        modal.remove();

    }


    closeBtn.addEventListener(
        "click",
        closeModal
    );


    cancelBtn.addEventListener(
        "click",
        closeModal
    );


    // ====================================
    // CONFIRM ACCEPT
    // ====================================

    confirmBtn.addEventListener(
        "click",
        async () => {

            const deliveryDate =
                input.value;


            if (!deliveryDate) {

                alert(
                    "Please select delivery date."
                );

                return;

            }


            // Extra protection
            if (
                deliveryDate < today
            ) {

                alert(
                    "Past date select nahi kar sakte."
                );

                return;

            }


            try {

                confirmBtn.disabled =
                    true;


                confirmBtn.textContent =
                    "Saving...";


                await updateDoc(

                    doc(
                        db,
                        "orders",
                        firestoreId
                    ),

                    {

                        status:
                            "Accepted",

                        deliveryDate:
                            deliveryDate

                    }

                );


                closeModal();

            }


            catch (error) {

                console.error(
                    "Accept Error:",
                    error
                );


                confirmBtn.disabled =
                    false;


                confirmBtn.textContent =
                    "✅ Accept Order";


                alert(
                    "Order accept nahi ho paya."
                );

            }

        }
    );


    // Close by clicking outside
    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );

}


// ========================================
// TODAY DATE
// ========================================

function getTodayISO() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    return (
        `${year}-${month}-${day}`
    );

}


// ========================================
// FORMAT DELIVERY DATE
// ========================================

function formatDeliveryDate(
    value
) {

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
// GET TOTAL
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


            return (
                sum +
                price * quantity
            );

        },

        0
    );

}


// ========================================
// LOGOUT
// ========================================

window.logoutAdmin =
    async function () {

        try {

            await signOut(auth);


            window.location.href =
                "index.html";

        }

        catch (error) {

            console.error(
                "Logout Error:",
                error
            );

        }

    };


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