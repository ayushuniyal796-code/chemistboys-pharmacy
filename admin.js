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
/* =========================================================
   CUSTOMER REVIEWS MANAGEMENT
   ========================================================= */

async function loadAdminReviews() {

    const container =
        document.getElementById(
            "adminReviewsContainer"
        );

    const countElement =
        document.getElementById(
            "adminReviewCount"
        );

    const averageElement =
        document.getElementById(
            "adminAverageRating"
        );


    if (!container) {
        return;
    }


    // SECURITY CHECK
    if (
        !auth.currentUser ||
        auth.currentUser.uid !== ADMIN_UID
    ) {
        return;
    }


    try {

        const reviewsQuery =
            query(
                collection(db, "reviews")
            );


        onSnapshot(
            reviewsQuery,

            snapshot => {

                container.innerHTML = "";


                if (snapshot.empty) {

                    countElement.textContent =
                        "0";

                    averageElement.textContent =
                        "0.0 ⭐";

                    container.innerHTML = `
                        <div class="empty-box">
                            ⭐ No customer reviews yet.
                        </div>
                    `;

                    return;
                }


                const reviews = [];


                snapshot.forEach(
                    reviewDoc => {

                        reviews.push({

                            id: reviewDoc.id,

                            ...reviewDoc.data()

                        });

                    }
                );


                // NEWEST FIRST
                reviews.sort(
                    (a, b) => {

                        const dateA =
                            a.createdAt &&
                            typeof a.createdAt.toDate === "function"
                                ? a.createdAt.toDate().getTime()
                                : 0;

                        const dateB =
                            b.createdAt &&
                            typeof b.createdAt.toDate === "function"
                                ? b.createdAt.toDate().getTime()
                                : 0;

                        return dateB - dateA;

                    }
                );


                let totalRating = 0;


                reviews.forEach(
                    review => {

                        totalRating +=
                            Number(
                                review.rating
                            ) || 0;


                        const card =
                            document.createElement(
                                "div"
                            );

                        card.className =
                            "admin-review-card";


                        const name =
                            escapeHTML(
                                review.name ||
                                "ChemistBoys Customer"
                            );


                        const email =
                            escapeHTML(
                                review.email ||
                                "No email"
                            );


                        const text =
                            escapeHTML(
                                review.review ||
                                ""
                            );


                        const rating =
                            Number(
                                review.rating
                            ) || 0;


                        const date =
                            adminReviewDate(
                                review.createdAt
                            );


                        card.innerHTML = `

                            <div class="admin-review-top">

                                <div class="admin-review-name">
                                    👤 ${name}
                                </div>

                                <div class="admin-review-date">
                                    ${date}
                                </div>

                            </div>


                            <div class="admin-review-stars">
                                ${adminReviewStars(rating)}
                            </div>


                            <div class="admin-review-text">
                                ${text}
                            </div>


                            <div class="admin-review-email">
                                📧 ${email}
                            </div>


                            <button
                                class="admin-delete-review"
                            >
                                🗑️ Delete Review
                            </button>

                        `;


                        const deleteButton =
                            card.querySelector(
                                ".admin-delete-review"
                            );


                        deleteButton.addEventListener(
                            "click",
                            async () => {

                                const confirmed =
                                    confirm(
                                        "Are you sure you want to permanently delete this review?"
                                    );


                                if (!confirmed) {
                                    return;
                                }


                                try {

                                    deleteButton.disabled =
                                        true;

                                    deleteButton.textContent =
                                        "Deleting...";


                                    const {
                                        deleteDoc
                                    } = await import(
                                        "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
                                    );


                                    await deleteDoc(
                                        doc(
                                            db,
                                            "reviews",
                                            review.id
                                        )
                                    );


                                } catch (error) {

                                    console.error(
                                        "Admin review delete error:",
                                        error
                                    );


                                    deleteButton.disabled =
                                        false;

                                    deleteButton.textContent =
                                        "🗑️ Delete Review";


                                    alert(
                                        "Unable to delete review."
                                    );

                                }

                            }
                        );


                        container.appendChild(
                            card
                        );

                    }
                );


                countElement.textContent =
                    reviews.length;


                const average =
                    totalRating /
                    reviews.length;


                averageElement.textContent =
                    average.toFixed(1) +
                    " ⭐";

            },


            error => {

                console.error(
                    "Admin reviews error:",
                    error
                );


                container.innerHTML = `

                    <div class="empty-box">

                        ❌ Unable to load reviews.

                        <br><br>

                        ${escapeHTML(
                            error.message
                        )}

                    </div>

                `;

            }
        );


    } catch (error) {

        console.error(
            "Admin review setup error:",
            error
        );

    }

}


/* =========================================================
   REVIEW STARS
   ========================================================= */

function adminReviewStars(rating) {

    let stars = "";

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= rating
                ? "★"
                : "☆";

    }

    return stars;
}


/* =========================================================
   REVIEW DATE
   ========================================================= */

function adminReviewDate(timestamp) {

    if (!timestamp) {
        return "Just now";
    }


    try {

        return timestamp
            .toDate()
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    } catch {

        return "Just now";

    }

}


/* =========================================================
   START REVIEWS
   ========================================================= */

loadAdminReviews();


/* =========================================================
   CHEMISTBOYS - ORDER TRACKING STATUS CONTROL
   ADD THIS CODE AT THE VERY END OF admin.js
   DO NOT DELETE OR MODIFY EXISTING CODE
   ========================================================= */

(() => {

    const trackingStyle = document.createElement("style");

    trackingStyle.textContent = `
        .cb-tracking-controls {
            margin-top: 15px;
            padding: 15px;
            border-top: 1px solid #ddd;
        }

        .cb-tracking-title {
            font-weight: 700;
            margin-bottom: 10px;
            color: #075f55;
        }

        .cb-status-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .cb-status-btn {
            border: none;
            padding: 9px 13px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        .cb-status-btn:hover {
            opacity: 0.85;
        }

        .cb-status-btn.shipped {
            background: #e8f1ff;
            color: #1455a0;
        }

        .cb-status-btn.out {
            background: #fff4d6;
            color: #8a5a00;
        }

        .cb-status-btn.delivered {
            background: #e4f7e9;
            color: #18733b;
        }

        .cb-status-current {
            margin-top: 10px;
            font-size: 14px;
            color: #555;
        }

        .cb-status-message {
            margin-top: 8px;
            font-size: 14px;
            font-weight: 600;
        }
    `;

    document.head.appendChild(trackingStyle);


    /* -----------------------------------------------------
       FIRESTORE STATUS UPDATE
       ----------------------------------------------------- */

    async function updateDeliveryStatus(
        orderId,
        newStatus,
        trackingStage,
        message
    ) {

        try {

            if (!orderId) {
                console.error("Order ID missing");
                return;
            }

            const firestore =
                await import(
                    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
                );

            const {
                doc,
                updateDoc,
                serverTimestamp
            } = firestore;


            const orderRef =
                doc(
                    db,
                    "orders",
                    orderId
                );


            await updateDoc(
                orderRef,
                {

                    status: newStatus,

                    [`tracking.${trackingStage}`]: {
                        timestamp: serverTimestamp(),
                        locationName: "Dehradun",
                        message: message
                    },

                    trackingUpdatedAt:
                        serverTimestamp()

                }
            );


            console.log(
                "Order status updated:",
                newStatus
            );


            alert(
                `Order status changed to ${newStatus}`
            );


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                "Unable to update order status."
            );

        }

    }


    /* -----------------------------------------------------
       ADD BUTTONS TO ORDER CARDS
       ----------------------------------------------------- */

    function addTrackingControls() {

        /*
         * This tries to find existing order cards
         * without changing their existing HTML.
         */

        const possibleCards =
            document.querySelectorAll(
                ".order-card, .order-item, .admin-order-card, [data-order-id]"
            );


        possibleCards.forEach(
            (card) => {

                if (
                    card.dataset.cbTrackingAdded === "true"
                ) {
                    return;
                }


                /*
                 * Try to find Order ID.
                 */

                let orderId =
                    card.dataset.orderId ||
                    card.getAttribute("data-order-id");


                if (!orderId) {

                    const text =
                        card.innerText || "";


                    const match =
                        text.match(
                            /CB[A-Z0-9]+/i
                        );


                    if (match) {
                        orderId =
                            match[0];
                    }

                }


                if (!orderId) {
                    return;
                }


                card.dataset.cbTrackingAdded =
                    "true";


                const controls =
                    document.createElement("div");


                controls.className =
                    "cb-tracking-controls";


                controls.innerHTML = `

                    <div class="cb-tracking-title">
                        📦 Delivery Status
                    </div>

                    <div class="cb-status-buttons">

                        <button
                            type="button"
                            class="cb-status-btn shipped"
                            data-status="Shipped">
                            🚚 Mark Shipped
                        </button>

                        <button
                            type="button"
                            class="cb-status-btn out"
                            data-status="Out For Delivery">
                            🛵 Out For Delivery
                        </button>

                        <button
                            type="button"
                            class="cb-status-btn delivered"
                            data-status="Delivered">
                            ✅ Mark Delivered
                        </button>

                    </div>

                    <div class="cb-status-current">
                        Order ID: <strong>${orderId}</strong>
                    </div>

                    <div class="cb-status-message"></div>

                `;


                card.appendChild(
                    controls
                );


                const messageBox =
                    controls.querySelector(
                        ".cb-status-message"
                    );


                const buttons =
                    controls.querySelectorAll(
                        ".cb-status-btn"
                    );


                buttons.forEach(
                    (button) => {

                        button.addEventListener(
                            "click",
                            async () => {

                                const status =
                                    button.dataset.status;


                                let stage;
                                let message;


                                if (
                                    status === "Shipped"
                                ) {

                                    stage =
                                        "shipped";

                                    message =
                                        "Your item has been shipped.";

                                } else if (
                                    status === "Out For Delivery"
                                ) {

                                    stage =
                                        "outForDelivery";

                                    message =
                                        "Your item is out for delivery.";

                                } else if (
                                    status === "Delivered"
                                ) {

                                    stage =
                                        "delivered";

                                    message =
                                        "Your item has been delivered.";

                                }


                                button.disabled =
                                    true;


                                await updateDeliveryStatus(
                                    orderId,
                                    status,
                                    stage,
                                    message
                                );


                                button.disabled =
                                    false;


                                if (messageBox) {

                                    messageBox.textContent =
                                        `✓ ${status} updated`;

                                }

                            }
                        );

                    }
                );

            }
        );

    }


    /* -----------------------------------------------------
       WATCH FOR REALTIME ADMIN ORDER CARDS
       ----------------------------------------------------- */

    addTrackingControls();


    const trackingObserver =
        new MutationObserver(
            () => {

                addTrackingControls();

            }
        );


    trackingObserver.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

})();

/* =========================================================
   CHEMISTBOYS - SAFE STATUS UPDATE
   ADD THIS BELOW THE PREVIOUS CODE
   DO NOT DELETE EXISTING CODE
   ========================================================= */

(() => {

    document.addEventListener("click", async (event) => {

        const button =
            event.target.closest(".cb-status-btn");

        if (!button) return;

        // Stop the previous status handler
        event.preventDefault();
        event.stopImmediatePropagation();

        const controls =
            button.closest(".cb-tracking-controls");

        if (!controls) return;

        const orderIdElement =
            controls.querySelector(".cb-status-current");

        if (!orderIdElement) return;

        const text =
            orderIdElement.innerText || "";

        const match =
            text.match(/Order ID:\s*([A-Za-z0-9_-]+)/i);

        if (!match) {
            alert("Order ID not found.");
            return;
        }

        const orderId =
            match[1];

        const status =
            button.dataset.status;

        let trackingStage;
        let message;

        if (status === "Shipped") {

            trackingStage = "shipped";
            message = "Your item has been shipped.";

        } else if (status === "Out For Delivery") {

            trackingStage = "outForDelivery";
            message = "Your item is out for delivery.";

        } else if (status === "Delivered") {

            trackingStage = "delivered";
            message = "Your item has been delivered.";

        } else {
            return;
        }

        try {

            const firestore =
                await import(
                    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
                );

            const {
                collection,
                query,
                where,
                getDocs,
                updateDoc,
                doc,
                serverTimestamp
            } = firestore;


            /* -----------------------------------------
               FIND ORDER USING CUSTOM ORDER ID
               ----------------------------------------- */

            const ordersRef =
                collection(db, "orders");

            const q =
                query(
                    ordersRef,
                    where("orderId", "==", orderId)
                );

            const snapshot =
                await getDocs(q);


            if (snapshot.empty) {

                alert(
                    "Order not found in Firestore."
                );

                return;
            }


            const orderDoc =
                snapshot.docs[0];


            /* -----------------------------------------
               UPDATE ACTUAL FIRESTORE DOCUMENT
               ----------------------------------------- */

            await updateDoc(
                doc(
                    db,
                    "orders",
                    orderDoc.id
                ),
                {

                    status: status,

                    [`tracking.${trackingStage}`]: {

                        timestamp:
                            serverTimestamp(),

                        locationName:
                            "Dehradun",

                        message:
                            message

                    },

                    trackingUpdatedAt:
                        serverTimestamp()

                }
            );


            alert(
                `✅ Order ${orderId} marked as ${status}`
            );


        } catch (error) {

            console.error(
                "Delivery status error:",
                error
            );

            alert(
                "❌ Status update failed."
            );

        }

    }, true);

})();

/* =========================================================
   CHEMISTBOYS - FINAL STATUS UPDATE FIX
   ADD AT THE VERY END OF admin.js
   DO NOT DELETE EXISTING CODE
   ========================================================= */

window.addEventListener("click", async (event) => {

    const button =
        event.target.closest(".cb-status-btn");

    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const controls =
        button.closest(".cb-tracking-controls");

    if (!controls) return;

    const orderText =
        controls.querySelector(
            ".cb-status-current"
        )?.innerText || "";

    const match =
        orderText.match(
            /Order ID:\s*([A-Za-z0-9_-]+)/i
        );

    if (!match) {
        alert("❌ Order ID not found.");
        return;
    }

    const orderId =
        match[1];

    const status =
        button.dataset.status;

    let stage = "";
    let message = "";

    if (status === "Shipped") {

        stage = "shipped";
        message =
            "Your item has been shipped.";

    } else if (
        status === "Out For Delivery"
    ) {

        stage = "outForDelivery";
        message =
            "Your item is out for delivery.";

    } else if (
        status === "Delivered"
    ) {

        stage = "delivered";
        message =
            "Your item has been delivered.";

    } else {
        return;
    }


    button.disabled = true;

    try {

        const firestore =
            await import(
                "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
            );

        const {
            collection,
            query,
            where,
            getDocs,
            updateDoc,
            doc,
            serverTimestamp
        } = firestore;


        const ordersRef =
            collection(
                db,
                "orders"
            );


        /* -----------------------------------------
           FIRST: SEARCH BY orderId
           ----------------------------------------- */

        let orderSnapshot =
            await getDocs(
                query(
                    ordersRef,
                    where(
                        "orderId",
                        "==",
                        orderId
                    )
                )
            );


        /* -----------------------------------------
           SECOND: SEARCH BY id
           ----------------------------------------- */

        if (orderSnapshot.empty) {

            orderSnapshot =
                await getDocs(
                    query(
                        ordersRef,
                        where(
                            "id",
                            "==",
                            orderId
                        )
                    )
                );

        }


        if (orderSnapshot.empty) {

            alert(
                "❌ Order not found in Firestore."
            );

            button.disabled = false;

            return;
        }


        const orderDoc =
            orderSnapshot.docs[0];


        console.log(
            "Updating Firestore document:",
            orderDoc.id
        );


        /* -----------------------------------------
           UPDATE REAL FIRESTORE DOCUMENT
           ----------------------------------------- */

        await updateDoc(
            doc(
                db,
                "orders",
                orderDoc.id
            ),
            {

                status: status,

                [`tracking.${stage}`]: {

                    timestamp:
                        serverTimestamp(),

                    locationName:
                        "Dehradun",

                    message:
                        message

                },

                trackingUpdatedAt:
                    serverTimestamp()

            }
        );


        console.log(
            "✅ Firestore updated successfully"
        );


        alert(
            `✅ ${orderId} → ${status}`
        );


    } catch (error) {

        console.error(
            "❌ FINAL STATUS UPDATE ERROR:",
            error
        );

        alert(
            "❌ Firestore update failed:\n" +
            error.message
        );

    } finally {

        button.disabled = false;

    }

}, true);

/* =========================================================
   CHEMISTBOYS - FINAL DELIVERY STATUS FIX
   APPEND ONLY - DO NOT DELETE EXISTING CODE
   ========================================================= */

(() => {

    const FIRESTORE_URL =
        "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

    let fixingStatus = false;


    async function saveDeliveryStatus(
        orderId,
        newStatus,
        trackingStage
    ) {

        if (fixingStatus) return;

        fixingStatus = true;

        try {

            /*
             * Find the REAL Firestore document from
             * the realtime-loaded allOrders array.
             */

            const order = allOrders.find(
                item =>
                    String(getOrderId(item)).trim()
                    === String(orderId).trim()
            );


            if (!order || !order.firestoreId) {

                throw new Error(
                    "Order document not found"
                );

            }


            const {
                serverTimestamp
            } = await import(
                FIRESTORE_URL
            );


            const updateData = {

                status: newStatus,

                trackingUpdatedAt:
                    serverTimestamp(),

                [`tracking.${trackingStage}`]: {

                    timestamp:
                        serverTimestamp(),

                    locationName:
                        "Dehradun",

                    message:
                        trackingStage === "shipped"
                            ? "Your item has been shipped."
                            : trackingStage === "outForDelivery"
                                ? "Your item is out for delivery."
                                : "Your order has been delivered."

                }

            };


            await updateDoc(

                doc(
                    db,
                    "orders",
                    order.firestoreId
                ),

                updateData

            );


            console.log(
                "ChemistBoys status saved:",
                orderId,
                newStatus
            );


        } catch (error) {

            console.error(
                "FINAL DELIVERY STATUS ERROR:",
                error
            );

            alert(
                "Unable to update order status.\n\n" +
                error.message
            );

        } finally {

            fixingStatus = false;

        }

    }


    /*
     * IMPORTANT:
     * Capture phase runs BEFORE the old delivery handlers.
     * Therefore the old conflicting handler will NOT run.
     */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".cb-status-btn"
                );


            if (!button) return;


            event.preventDefault();

            event.stopPropagation();

            event.stopImmediatePropagation();


            const card =
                button.closest(
                    ".order-card, .order-item, .admin-order-card, [data-order-id]"
                );


            let orderId =
                button.dataset.orderId ||
                card?.dataset.orderId;


            if (!orderId) {

                const text =
                    card?.textContent || "";

                const match =
                    text.match(
                        /CB[A-Z0-9]+/i
                    );

                if (match) {

                    orderId =
                        match[0];

                }

            }


            const newStatus =
                button.dataset.status;


            let trackingStage =
                "shipped";


            if (
                newStatus ===
                "Out For Delivery"
            ) {

                trackingStage =
                    "outForDelivery";

            }

            if (
                newStatus ===
                "Delivered"
            ) {

                trackingStage =
                    "delivered";

            }


            if (
                !orderId ||
                !newStatus
            ) {

                console.error(
                    "Missing order ID/status"
                );

                return;

            }


            saveDeliveryStatus(
                orderId,
                newStatus,
                trackingStage
            );

        },

        true
    );


    /*
     * Keep delivery buttons only for Accepted+
     * orders. Processing orders keep their original
     * Accept / Cancel controls.
     */

    function fixDeliveryButtonVisibility() {

        document
            .querySelectorAll(
                ".order-card, .order-item, .admin-order-card, [data-order-id]"
            )
            .forEach(card => {

                const orderId =
                    card.dataset.orderId ||
                    (
                        card.textContent.match(
                            /CB[A-Z0-9]+/i
                        ) || []
                    )[0];


                if (!orderId) return;


                const order =
                    allOrders.find(
                        item =>
                            String(
                                getOrderId(item)
                            ).trim()
                            ===
                            String(
                                orderId
                            ).trim()
                    );


                if (!order) return;


                const status =
                    getStatus(order);


                const deliverySection =
                    card.querySelector(
                        ".cb-tracking"
                    );


                if (
                    deliverySection
                ) {

                    if (
                        status ===
                        "Processing"
                    ) {

                        deliverySection.style.display =
                            "none";

                    } else {

                        deliverySection.style.display =
                            "";

                    }

                }

            });

    }


    /*
     * Run after realtime order rendering.
     */

    const observer =
        new MutationObserver(
            () => {

                fixDeliveryButtonVisibility();

            }
        );


    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );


    setTimeout(
        fixDeliveryButtonVisibility,
        500
    );

})();