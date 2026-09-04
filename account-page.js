import {
    auth,
    authReady,
    db
} from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ========================================
// CART
// ========================================

const CART_KEY =
    "chemistboys_cart";

const OLD_CART_KEY =
    "chemistCart";


function getCart() {

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    CART_KEY
                ) || "[]"
            );

    }

    catch {

        cart = [];

    }


    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        OLD_CART_KEY
                    ) || "[]"
                );

        }

        catch {

            cart = [];

        }

    }


    return Array.isArray(cart)
        ? cart
        : [];

}


// ========================================
// AUTH
// ========================================

await authReady;


onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "auth.html";

            return;

        }


        // ==================================
        // USER DETAILS
        // ==================================

        const name =
            user.displayName ||
            "ChemistBoys User";

        const email =
            user.email ||
            "No email";


        document.getElementById(
            "userName"
        ).textContent = name;


        document.getElementById(
            "userEmail"
        ).textContent = email;


        document.getElementById(
            "detailName"
        ).textContent = name;


        document.getElementById(
            "detailEmail"
        ).textContent = email;


        // ==================================
        // CART DETAILS
        // ==================================

        const cart =
            getCart();


        let cartCount = 0;

        let cartTotal = 0;


        cart.forEach(
            (item) => {

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


                cartCount +=
                    quantity;


                cartTotal +=
                    price * quantity;

            }
        );


        document.getElementById(
            "cartCount"
        ).textContent =
            cartCount;


        document.getElementById(
            "cartTotal"
        ).textContent =
            `₹${cartTotal.toFixed(2)}`;


        // ==================================
        // LOAD ORDERS
        // ==================================

        await loadOrders(
            user.uid
        );

    }
);


// ========================================
// ORDERS
// ========================================

async function loadOrders(
    uid
) {

    try {

        const ordersQuery =
            query(

                collection(
                    db,
                    "orders"
                ),

                where(
                    "userId",
                    "==",
                    uid
                )

            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        const orders = [];


        snapshot.forEach(
            (docSnap) => {

                orders.push({

                    firestoreId:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        // Newest first

        orders.sort(
            (a, b) => {

                return (
                    getOrderTime(b)
                    -
                    getOrderTime(a)
                );

            }
        );


        document.getElementById(
            "orderCount"
        ).textContent =
            orders.length;


        if (
            orders.length === 0
        ) {

            document.getElementById(
                "latestOrder"
            ).innerHTML = `

                <p>
                    📦 You haven't placed
                    any orders yet.
                </p>

            `;

            return;

        }


        const latest =
            orders[0];


        renderLatestOrder(
            latest
        );

    }

    catch (error) {

        console.error(
            "Account Orders Error:",
            error
        );


        document.getElementById(
            "latestOrder"
        ).innerHTML = `

            <p>
                Unable to load order information.
            </p>

        `;

    }

}


// ========================================
// ORDER TIME
// ========================================

function getOrderTime(
    order
) {

    if (order.orderDateISO) {

        const time =
            new Date(
                order.orderDateISO
            ).getTime();


        if (
            Number.isFinite(time)
        ) {

            return time;

        }

    }


    if (
        order.createdAt?.seconds
    ) {

        return (
            order.createdAt.seconds
            * 1000
        );

    }


    return 0;

}


// ========================================
// LATEST ORDER
// ========================================

function renderLatestOrder(
    order
) {

    const orderId =
        order.id ||
        order.orderId ||
        order.firestoreId;


    const status =
        order.status ||
        "Processing";


    let statusClass =
        "processing";


    let statusText =
        "⏳ Processing";


    if (
        status === "Accepted"
    ) {

        statusClass =
            "accepted";

        statusText =
            "✅ Accepted";

    }


    else if (
        status === "Cancelled"
    ) {

        statusClass =
            "cancelled";

        statusText =
            "❌ Cancelled";

    }


    const total =
        getOrderTotal(order);


    let deliveryHTML =
        "";


    // Delivery date ONLY after admin accepts

    if (
        status === "Accepted" &&
        order.deliveryDate
    ) {

        deliveryHTML = `

            <div class="delivery-date">

                🚚 Delivery Date:
                ${formatDeliveryDate(
                    order.deliveryDate
                )}

            </div>

        `;

    }


    document.getElementById(
        "latestOrder"
    ).innerHTML = `

        <p>
            <strong>
                Order ID:
            </strong>

            #${escapeHTML(orderId)}

        </p>


        <p>

            <strong>
                Status:
            </strong>

            <span class="order-status ${statusClass}">
                ${statusText}
            </span>

        </p>


        <p>

            <strong>
                Total:
            </strong>

            ₹${total.toFixed(2)}

        </p>


        ${
            order.paymentMethod
            ? `
                <p>
                    <strong>
                        Payment:
                    </strong>
                    ${escapeHTML(
                        getPaymentName(
                            order.paymentMethod
                        )
                    )}
                </p>
              `
            : ""
        }


        ${
            order.orderDate
            ? `
                <p>
                    <strong>
                        Ordered:
                    </strong>
                    ${escapeHTML(
                        order.orderDate
                    )}
                </p>
              `
            : ""
        }


        ${deliveryHTML}

    `;

}


// ========================================
// TOTAL
// ========================================

function getOrderTotal(
    order
) {

    const total =
        Number(order.total);


    if (
        Number.isFinite(total) &&
        total > 0
    ) {

        return total;

    }


    const items =
        normalizeItems(order);


    return items.reduce(
        (
            sum,
            item
        ) => {

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
// ITEMS
// ========================================

function normalizeItems(
    order
) {

    let items =
        order.items ||
        order.products ||
        order.cartItems ||
        [];


    if (
        typeof items === "string"
    ) {

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
// PAYMENT
// ========================================

function getPaymentName(
    payment
) {

    if (
        payment === "cod"
    ) {

        return "Cash on Delivery";

    }


    if (
        payment === "upi"
    ) {

        return "UPI";

    }


    if (
        payment === "online"
    ) {

        return "Online Payment";

    }


    return payment;

}


// ========================================
// DELIVERY DATE
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
// LOGOUT
// ========================================

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    async () => {

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

    }
);


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

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