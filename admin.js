/* =========================================================
   CHEMISTBOYS ADMIN DASHBOARD
   ========================================================= */

import {
    auth,
    authReady,
    db
} from "./firebase.js";

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


/* =========================================================
   ADMIN UID
   ========================================================= */

const ADMIN_UID =
    "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let allOrders = [];

let selectedOrderId = null;

let revenueChart = null;
let ordersChart = null;
let statusChart = null;
let paymentChart = null;


/* =========================================================
   ELEMENTS
   ========================================================= */

const ordersContainer =
    document.getElementById("ordersContainer");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const paymentFilter =
    document.getElementById("paymentFilter");

const deliveryModal =
    document.getElementById("deliveryModal");

const deliveryDateInput =
    document.getElementById("deliveryDateInput");


/* =========================================================
   AUTHENTICATION
   ========================================================= */

await authReady;

onAuthStateChanged(auth, user => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    /* ONLY ADMIN */

    if (user.uid !== ADMIN_UID) {

        document.body.innerHTML = `

            <div style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#eef8f6;
                font-family:Arial;
                padding:20px;
            ">

                <div style="
                    background:white;
                    padding:35px;
                    border-radius:20px;
                    text-align:center;
                    max-width:450px;
                    box-shadow:0 10px 40px rgba(0,0,0,.12);
                ">

                    <div style="
                        font-size:55px;
                    ">
                        🚫
                    </div>

                    <h2 style="
                        color:#075f55;
                    ">
                        Access Denied
                    </h2>

                    <p style="
                        color:#718987;
                    ">
                        You are not authorized
                        to access the admin panel.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    loadOrders();

});


/* =========================================================
   LOAD ORDERS - REAL TIME
   ========================================================= */

function loadOrders() {

    const ordersRef =
        collection(db, "orders");

    const ordersQuery =
        query(ordersRef);


    onSnapshot(
        ordersQuery,

        snapshot => {

            allOrders = [];


            snapshot.forEach(docSnap => {

                const data =
                    docSnap.data();


                allOrders.push({

                    firestoreId:
                        docSnap.id,

                    ...data

                });

            });


            sortOrders();

            updateDashboard();

            renderOrders();

            renderRecentOrders();

            renderTopProducts();

            updateAlerts();

        },


        error => {

            console.error(
                "Orders error:",
                error
            );


            ordersContainer.innerHTML = `

                <div class="empty-box">

                    ❌ Unable to load orders.

                    <br><br>

                    ${escapeHTML(
                        error.message
                    )}

                </div>

            `;

        }
    );

}


/* =========================================================
   SORT ORDERS
   ========================================================= */

function sortOrders() {

    allOrders.sort((a, b) => {

        const dateA =
            getOrderDate(a);

        const dateB =
            getOrderDate(b);


        return dateB - dateA;

    });

}


/* =========================================================
   GET ORDER DATE
   ========================================================= */

function getOrderDate(order) {

    if (
        order.createdAt &&
        typeof order.createdAt.toDate === "function"
    ) {

        return order.createdAt
            .toDate()
            .getTime();

    }


    if (order.orderDate) {

        const parsed =
            new Date(
                `${order.orderDate} ${
                    order.orderTime || ""
                }`
            );


        if (
            !isNaN(
                parsed.getTime()
            )
        ) {

            return parsed.getTime();

        }

    }


    return 0;

}


/* =========================================================
   GET ORDER ID
   ========================================================= */

function getOrderId(order) {

    return (
        order.id ||
        order.orderId ||
        order.firestoreId ||
        "N/A"
    );

}


/* =========================================================
   GET ITEMS
   ========================================================= */

function getItems(order) {

    let items =
        order.items ||
        order.products ||
        order.cartItems ||
        [];


    if (typeof items === "string") {

        try {

            items =
                JSON.parse(items);

        } catch {

            items = [];

        }

    }


    if (!Array.isArray(items)) {

        items = [];

    }


    return items;

}


/* =========================================================
   GET TOTAL
   ========================================================= */

function getTotal(order) {

    const directTotal =
        Number(
            order.total ??
            order.grandTotal ??
            order.amount
        );


    if (
        Number.isFinite(
            directTotal
        )
    ) {

        return directTotal;

    }


    return getItems(order).reduce(
        (sum, item) => {

            const price =
                Number(
                    item.price || 0
                );


            const quantity =
                Number(
                    item.quantity ||
                    item.qty ||
                    1
                );


            return (
                sum +
                price * quantity
            );

        },
        0
    );

}


/* =========================================================
   MONEY FORMAT
   ========================================================= */

function money(value) {

    return (
        "₹" +
        Number(
            value || 0
        ).toFixed(2)
    );

}


/* =========================================================
   GET STATUS
   ========================================================= */

function getStatus(order) {

    return (
        order.status ||
        "Processing"
    );

}


/* =========================================================
   PAYMENT NAME
   ========================================================= */

function getPaymentName(order) {

    const payment =
        String(
            order.paymentMethod ||
            ""
        ).toLowerCase();


    if (payment === "cod") {

        return "Cash on Delivery";

    }


    if (payment === "upi") {

        return "UPI";

    }


    if (payment === "online") {

        return "Online Payment";

    }


    return (
        order.paymentMethod ||
        "N/A"
    );

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {

        return "N/A";

    }


    let date;


    if (
        value &&
        typeof value.toDate === "function"
    ) {

        date =
            value.toDate();

    } else {

        date =
            new Date(value);

    }


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "N/A";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


/* =========================================================
   DELIVERY DATE FORMAT
   ========================================================= */

function formatDeliveryDate(value) {

    if (!value) {

        return "";

    }


    const date =
        new Date(
            value + "T00:00:00"
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================================
   UPDATE DASHBOARD
   ========================================================= */

function updateDashboard() {

    const totalOrders =
        allOrders.length;


    const accepted =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Accepted"
        );


    const processing =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Processing"
        );


    const cancelled =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Cancelled"
        );


    const revenue =
        accepted.reduce(
            (total, order) => {

                return (
                    total +
                    getTotal(order)
                );

            },
            0
        );


    const aov =
        accepted.length
            ? revenue /
              accepted.length
            : 0;


    const customerSet =
        new Set();


    allOrders.forEach(order => {

        const customer =
            order.userId ||
            order.email ||
            order.customerEmail ||
            order.customerName;


        if (customer) {

            customerSet.add(
                customer
            );

        }

    });


    const customers =
        customerSet.size;


    const itemsSold =
        allOrders.reduce(
            (total, order) => {

                return (
                    total +
                    getItems(order)
                        .reduce(
                            (
                                sum,
                                item
                            ) => {

                                return (
                                    sum +
                                    Number(
                                        item.quantity ||
                                        item.qty ||
                                        1
                                    )
                                );

                            },
                            0
                        )
                );

            },
            0
        );


    document.getElementById(
        "revenueValue"
    ).textContent =
        money(revenue);


    document.getElementById(
        "ordersValue"
    ).textContent =
        totalOrders;


    document.getElementById(
        "customersValue"
    ).textContent =
        customers;


    document.getElementById(
        "aovValue"
    ).textContent =
        money(aov);


    document.getElementById(
        "processingValue"
    ).textContent =
        processing.length;


    document.getElementById(
        "acceptedValue"
    ).textContent =
        accepted.length;


    document.getElementById(
        "cancelledValue"
    ).textContent =
        cancelled.length;


    document.getElementById(
        "itemsSoldValue"
    ).textContent =
        itemsSold;


    renderCharts();

}


/* =========================================================
   CHARTS
   ========================================================= */

function renderCharts() {

    if (
        typeof Chart === "undefined"
    ) {

        return;

    }


    const labels = [];

    const revenueData = [];

    const ordersData = [];


    /* LAST 7 DAYS */

    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setHours(
            0,
            0,
            0,
            0
        );


        date.setDate(
            date.getDate() - i
        );


        const key =
            date.toISOString()
                .slice(0, 10);


        labels.push(
            date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short"
                }
            )
        );


        let dayRevenue = 0;

        let dayOrders = 0;


        allOrders.forEach(order => {

            const orderDate =
                getOrderDate(order);


            if (!orderDate) {

                return;

            }


            const orderDay =
                new Date(
                    orderDate
                );


            const orderKey =
                orderDay
                    .toISOString()
                    .slice(0, 10);


            if (
                orderKey === key
            ) {

                dayOrders++;


                if (
                    getStatus(order)
                    === "Accepted"
                ) {

                    dayRevenue +=
                        getTotal(order);

                }

            }

        });


        revenueData.push(
            dayRevenue
        );


        ordersData.push(
            dayOrders
        );

    }


    /* REVENUE CHART */

    if (revenueChart) {

        revenueChart.destroy();

    }


    revenueChart =
        new Chart(
            document.getElementById(
                "revenueChart"
            ),
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Revenue",

                            data:
                                revenueData,

                            tension:
                                0.35,

                            fill:
                                true

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );


    /* ORDERS CHART */

    if (ordersChart) {

        ordersChart.destroy();

    }


    ordersChart =
        new Chart(
            document.getElementById(
                "ordersChart"
            ),
            {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Orders",

                            data:
                                ordersData

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );


    /* STATUS CHART */

    const processing =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Processing"
        ).length;


    const accepted =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Accepted"
        ).length;


    const cancelled =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Cancelled"
        ).length;


    if (statusChart) {

        statusChart.destroy();

    }


    statusChart =
        new Chart(
            document.getElementById(
                "statusChart"
            ),
            {

                type: "doughnut",

                data: {

                    labels: [

                        "Processing",
                        "Accepted",
                        "Cancelled"

                    ],

                    datasets: [

                        {

                            data: [

                                processing,
                                accepted,
                                cancelled

                            ]

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );


    /* PAYMENT CHART */

    let cod = 0;

    let upi = 0;

    let online = 0;


    allOrders.forEach(order => {

        const payment =
            String(
                order.paymentMethod ||
                ""
            ).toLowerCase();


        if (
            payment === "cod"
        ) {

            cod++;

        }


        else if (
            payment === "upi"
        ) {

            upi++;

        }


        else if (
            payment === "online"
        ) {

            online++;

        }

    });


    if (paymentChart) {

        paymentChart.destroy();

    }


    paymentChart =
        new Chart(
            document.getElementById(
                "paymentChart"
            ),
            {

                type: "pie",

                data: {

                    labels: [

                        "COD",
                        "UPI",
                        "Online"

                    ],

                    datasets: [

                        {

                            data: [

                                cod,
                                upi,
                                online

                            ]

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}


/* =========================================================
   TOP PRODUCTS
   ========================================================= */

function renderTopProducts() {

    const products = {};


    allOrders.forEach(order => {

        getItems(order).forEach(item => {

            const name =
                item.name ||
                item.title ||
                "Unknown Product";


            const quantity =
                Number(
                    item.quantity ||
                    item.qty ||
                    1
                );


            const price =
                Number(
                    item.price ||
                    0
                );


            if (
                !products[name]
            ) {

                products[name] = {

                    quantity: 0,

                    revenue: 0

                };

            }


            products[name]
                .quantity +=
                quantity;


            products[name]
                .revenue +=
                price *
                quantity;

        });

    });


    const sorted =
        Object.entries(
            products
        )
        .sort(
            (a, b) =>
                b[1].quantity -
                a[1].quantity
        )
        .slice(0, 10);


    const body =
        document.getElementById(
            "topProductsBody"
        );


    if (!sorted.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        color:#718987;
                    "
                >
                    No product data yet.
                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        sorted.map(
            (
                [name, data],
                index
            ) => `

                <tr>

                    <td>
                        #${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(name)}
                        </strong>
                    </td>

                    <td>
                        ${data.quantity}
                    </td>

                    <td>
                        ${money(data.revenue)}
                    </td>

                </tr>

            `
        )
        .join("");

}


/* =========================================================
   LIVE ALERTS
   ========================================================= */

function updateAlerts() {

    const pending =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Processing"
        ).length;


    const pendingPayments =
        allOrders.filter(
            order => {

                const paymentStatus =
                    String(
                        order.paymentStatus ||
                        ""
                    ).toLowerCase();


                return paymentStatus
                    .includes("pending");

            }
        ).length;


    const deliveryRequired =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Accepted" &&
                !order.deliveryDate
        ).length;


    document.getElementById(
        "pendingAlert"
    ).textContent =

        pending > 0

            ? `⏳ ${pending} order(s) waiting for acceptance`

            : "✅ No pending orders";


    document.getElementById(
        "paymentAlert"
    ).textContent =

        pendingPayments > 0

            ? `💳 ${pendingPayments} payment(s) pending`

            : "✅ No pending payments";


    document.getElementById(
        "deliveryAlert"
    ).textContent =

        deliveryRequired > 0

            ? `🚚 ${deliveryRequired} accepted order(s) need delivery date`

            : "✅ Delivery dates are assigned";

}


/* =========================================================
   FILTERED ORDERS
   ========================================================= */

function getFilteredOrders() {

    const search =
        searchInput
            .value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const selectedPayment =
        paymentFilter.value;


    return allOrders.filter(order => {

        const searchableText = [

            getOrderId(order),

            order.customerName,

            order.name,

            order.email,

            order.customerEmail,

            order.phone,

            order.customerPhone

        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


        const matchesSearch =
            !search ||
            searchableText.includes(
                search
            );


        const matchesStatus =
            selectedStatus === "all" ||
            getStatus(order) ===
            selectedStatus;


        const payment =
            String(
                order.paymentMethod ||
                ""
            ).toLowerCase();


        const matchesPayment =
            selectedPayment === "all" ||
            payment ===
            selectedPayment;


        return (
            matchesSearch &&
            matchesStatus &&
            matchesPayment
        );

    });

}


/* =========================================================
   RENDER FULL ORDERS
   ========================================================= */

function renderOrders() {

    const orders =
        getFilteredOrders();


    if (!orders.length) {

        ordersContainer.innerHTML = `

            <div class="empty-box">

                🧾 No matching orders found.

            </div>

        `;

        return;

    }


    ordersContainer.innerHTML =
        orders
            .map(renderOrder)
            .join("");


    attachOrderButtons();

}


/* =========================================================
   RENDER SINGLE ORDER
   ========================================================= */

function renderOrder(order) {

    const status =
        getStatus(order);


    const items =
        getItems(order);


    const deliveryHTML =

        (
            status === "Accepted" &&
            order.deliveryDate
        )

            ? `

                <div class="delivery-box">

                    🚚 Delivery Date:

                    ${escapeHTML(
                        formatDeliveryDate(
                            order.deliveryDate
                        )
                    )}

                </div>

            `

            : "";


    const buttonsHTML =

        status === "Processing"

            ? `

                <div class="order-buttons">

                    <button
                        class="accept-btn"
                        data-id="${escapeHTML(
                            order.firestoreId
                        )}"
                    >
                        ✅ Accept Order
                    </button>


                    <button
                        class="cancel-btn"
                        data-id="${escapeHTML(
                            order.firestoreId
                        )}"
                    >
                        ❌ Cancel Order
                    </button>

                </div>

            `

            : "";


    const itemsHTML =
        items.length

            ? items.map(item => {

                const name =
                    item.name ||
                    item.title ||
                    "Product";


                const price =
                    Number(
                        item.price || 0
                    );


                const quantity =
                    Number(
                        item.quantity ||
                        item.qty ||
                        1
                    );


                return `

                    <div class="product-row">

                        <div>

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                        </div>

                        <div>

                            ${money(price)}
                            ×
                            ${quantity}

                        </div>

                    </div>

                `;

            }).join("")

            : `

                <div>
                    No products found.
                </div>

            `;


    return `

        <div class="order-card">


            <div class="order-header">

                <div>

                    <h2 class="order-id">

                        🧾 Order
                        ${escapeHTML(
                            getOrderId(order)
                        )}

                    </h2>


                    <p class="order-date">

                        ${escapeHTML(
                            formatDate(
                                order.createdAt ||
                                getOrderDate(order)
                            )
                        )}

                    </p>

                </div>


                <span
                    class="
                        status
                        ${
                            status === "Accepted"
                                ? "status-accepted"
                                :
                            status === "Cancelled"
                                ? "status-cancelled"
                                :
                                "status-processing"
                        }
                    "
                >

                    ${
                        status === "Accepted"
                            ? "✅ Accepted"
                            :
                        status === "Cancelled"
                            ? "❌ Cancelled"
                            :
                            "⏳ Processing"
                    }

                </span>

            </div>


            <div class="customer-box">

                <h3>
                    👤 Customer Details
                </h3>


                <p>

                    <strong>
                        Name:
                    </strong>

                    ${escapeHTML(
                        order.customerName ||
                        order.name ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        Email:
                    </strong>

                    ${escapeHTML(
                        order.email ||
                        order.customerEmail ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        Phone:
                    </strong>

                    ${escapeHTML(
                        order.phone ||
                        order.customerPhone ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        Address:
                    </strong>

                    ${escapeHTML(
                        order.address ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        City:
                    </strong>

                    ${escapeHTML(
                        order.city ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        Pincode:
                    </strong>

                    ${escapeHTML(
                        order.pincode ||
                        "N/A"
                    )}

                </p>

            </div>


            <h3 class="products-title">

                🛒 Products

            </h3>


            <div class="product-list">

                ${itemsHTML}

            </div>


            ${deliveryHTML}


            <div class="payment-box">

                <p>

                    <strong>
                        Payment:
                    </strong>

                    ${escapeHTML(
                        getPaymentName(order)
                    )}

                </p>


                <p>

                    <strong>
                        Payment Status:
                    </strong>

                    ${escapeHTML(
                        order.paymentStatus ||
                        "N/A"
                    )}

                </p>


                <h2>

                    💰
                    ${money(
                        getTotal(order)
                    )}

                </h2>

            </div>


            ${buttonsHTML}


        </div>

    `;

}
/* =========================================================
   ORDER BUTTON EVENTS
   ========================================================= */

function attachOrderButtons() {

    document
        .querySelectorAll(".accept-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openDeliveryModal(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".cancel-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    cancelOrder(
                        button.dataset.id
                    );

                }
            );

        });

}


/* =========================================================
   OPEN DELIVERY MODAL
   ========================================================= */

function openDeliveryModal(
    firestoreId
) {

    selectedOrderId =
        firestoreId;


    const today =
        new Date();


    const yyyy =
        today.getFullYear();


    const mm =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const dd =
        String(
            today.getDate()
        ).padStart(2, "0");


    const todayString =
        `${yyyy}-${mm}-${dd}`;


    deliveryDateInput.min =
        todayString;


    deliveryDateInput.value =
        todayString;


    deliveryModal.classList.add(
        "active"
    );

}


/* =========================================================
   CLOSE DELIVERY MODAL
   ========================================================= */

document
    .getElementById("closeModalBtn")
    .addEventListener(
        "click",
        closeDeliveryModal
    );


function closeDeliveryModal() {

    deliveryModal.classList.remove(
        "active"
    );


    selectedOrderId =
        null;

}


/* =========================================================
   CONFIRM ACCEPT ORDER
   ========================================================= */

document
    .getElementById(
        "confirmDeliveryBtn"
    )
    .addEventListener(
        "click",
        async () => {

            if (!selectedOrderId) {

                return;

            }


            const selectedDate =
                deliveryDateInput.value;


            if (!selectedDate) {

                alert(
                    "Please select delivery date."
                );

                return;

            }


            const today =
                new Date();


            today.setHours(
                0,
                0,
                0,
                0
            );


            const chosenDate =
                new Date(
                    selectedDate +
                    "T00:00:00"
                );


            if (
                chosenDate < today
            ) {

                alert(
                    "Past date cannot be selected."
                );

                return;

            }


            try {

                await updateDoc(

                    doc(
                        db,
                        "orders",
                        selectedOrderId
                    ),

                    {

                        status:
                            "Accepted",

                        deliveryDate:
                            selectedDate

                    }

                );


                alert(
                    "Order accepted successfully!"
                );


                closeDeliveryModal();

            }


            catch (error) {

                console.error(
                    error
                );


                alert(
                    "Unable to accept order."
                );

            }

        }
    );


/* =========================================================
   CANCEL ORDER
   ========================================================= */

async function cancelOrder(
    firestoreId
) {

    const confirmed =
        confirm(
            "Are you sure you want to cancel this order?"
        );


    if (!confirmed) {

        return;

    }


    try {

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


        alert(
            "Order cancelled successfully."
        );

    }


    catch (error) {

        console.error(
            error
        );


        alert(
            "Unable to cancel order."
        );

    }

}


/* =========================================================
   RECENT ORDERS TABLE
   ========================================================= */

function renderRecentOrders() {

    const body =
        document.getElementById(
            "recentOrdersBody"
        );


    const recent =
        getFilteredOrders()
            .slice(0, 10);


    if (!recent.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        color:#718987;
                    "
                >
                    No orders found.
                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        recent.map(order => {

            const status =
                getStatus(order);


            return `

                <tr>

                    <td>

                        <strong>

                            ${escapeHTML(
                                getOrderId(
                                    order
                                )
                            )}

                        </strong>

                    </td>


                    <td>

                        ${escapeHTML(
                            order.customerName ||
                            order.name ||
                            "N/A"
                        )}

                    </td>


                    <td>

                        <strong>

                            ${money(
                                getTotal(order)
                            )}

                        </strong>

                    </td>


                    <td>

                        ${escapeHTML(
                            getPaymentName(
                                order
                            )
                        )}

                    </td>


                    <td>

                        <span
                            class="
                                status
                                ${
                                    status === "Accepted"
                                        ? "status-accepted"
                                        :
                                    status === "Cancelled"
                                        ? "status-cancelled"
                                        :
                                        "status-processing"
                                }
                            "
                        >

                            ${
                                status === "Accepted"
                                    ? "Accepted"
                                    :
                                status === "Cancelled"
                                    ? "Cancelled"
                                    :
                                    "Processing"
                            }

                        </span>

                    </td>


                    <td>

                        ${escapeHTML(
                            formatDate(
                                order.createdAt ||
                                getOrderDate(order)
                            )
                        )}

                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   SEARCH FILTER EVENTS
   ========================================================= */

searchInput.addEventListener(
    "input",
    () => {

        renderOrders();

        renderRecentOrders();

    }
);


statusFilter.addEventListener(
    "change",
    () => {

        renderOrders();

        renderRecentOrders();

    }
);


paymentFilter.addEventListener(
    "change",
    () => {

        renderOrders();

        renderRecentOrders();

    }
);


/* =========================================================
   EXPORT CSV
   ========================================================= */

document
    .getElementById("exportBtn")
    .addEventListener(
        "click",
        exportCSV
    );


function exportCSV() {

    const orders =
        getFilteredOrders();


    if (!orders.length) {

        alert(
            "No orders available to export."
        );

        return;

    }


    const header = [

        "Order ID",
        "Customer Name",
        "Email",
        "Phone",
        "Address",
        "City",
        "Pincode",
        "Total",
        "Payment",
        "Payment Status",
        "Order Status",
        "Delivery Date",
        "Order Date"

    ];


    const rows =
        orders.map(order => [

            getOrderId(order),

            order.customerName ||
            order.name ||
            "",

            order.email ||
            order.customerEmail ||
            "",

            order.phone ||
            order.customerPhone ||
            "",

            order.address ||
            "",

            order.city ||
            "",

            order.pincode ||
            "",

            getTotal(order),

            getPaymentName(order),

            order.paymentStatus ||
            "",

            getStatus(order),

            order.deliveryDate ||
            "",

            formatDate(
                order.createdAt ||
                getOrderDate(order)
            )

        ]);


    const csv =
        [
            header,
            ...rows
        ]
        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(value)
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`
                    )
                    .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `chemistboys-orders-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;


    link.click();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "login.html";

            }


            catch (error) {

                console.error(
                    error
                );

            }

        }
    );


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

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