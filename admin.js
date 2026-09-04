// ============================================================
// CHEMISTBOYS - ADMIN DASHBOARD
// ============================================================

import {
    auth,
    authReady,
    db
} from "./firebase.js";

import {
    collection,
    onSnapshot,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ============================================================
// ADMIN CONFIGURATION
// ============================================================

const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let allOrders = [];

let selectedOrderId = null;

let revenueChart = null;
let ordersChart = null;
let statusChart = null;
let paymentChart = null;


// ============================================================
// SHORT DOM FUNCTION
// ============================================================

function $(id) {
    return document.getElementById(id);
}


// ============================================================
// TEXT HELPER
// ============================================================

function setText(id, value) {

    const element = $(id);

    if (element) {
        element.textContent = value;
    }
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// MONEY FORMAT
// ============================================================

function formatMoney(value) {

    const number = Number(value) || 0;

    return "₹" +
        number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
}


// ============================================================
// ORDER ID
// ============================================================

function getOrderId(order) {

    return (
        order.id ||
        order.orderId ||
        order.orderID ||
        "Unknown"
    );
}


// ============================================================
// ORDER ITEMS
// ============================================================

function getItems(order) {

    let items =
        order.items ||
        order.products ||
        order.cartItems ||
        [];

    if (typeof items === "string") {

        try {

            items = JSON.parse(items);

        } catch {

            items = [];

        }

    }

    return Array.isArray(items)
        ? items
        : [];
}


// ============================================================
// ORDER TOTAL
// ============================================================

function getTotal(order) {

    const total =
        order.total ??
        order.grandTotal ??
        order.amount ??
        0;

    const number = Number(total);

    return Number.isNaN(number)
        ? 0
        : number;
}


// ============================================================
// CUSTOMER NAME
// ============================================================

function getCustomerName(order) {

    return (
        order.customerName ||
        order.name ||
        order.userName ||
        "Customer"
    );
}


// ============================================================
// CUSTOMER EMAIL
// ============================================================

function getCustomerEmail(order) {

    return (
        order.customerEmail ||
        order.email ||
        "N/A"
    );
}


// ============================================================
// CUSTOMER PHONE
// ============================================================

function getCustomerPhone(order) {

    return (
        order.customerPhone ||
        order.phone ||
        "N/A"
    );
}


// ============================================================
// CUSTOMER ADDRESS
// ============================================================

function getCustomerAddress(order) {

    return (
        order.customerAddress ||
        order.address ||
        "N/A"
    );
}


// ============================================================
// CUSTOMER CITY
// ============================================================

function getCustomerCity(order) {

    return (
        order.customerCity ||
        order.city ||
        "N/A"
    );
}


// ============================================================
// CUSTOMER PINCODE
// ============================================================

function getCustomerPincode(order) {

    return (
        order.customerPincode ||
        order.pincode ||
        "N/A"
    );
}


// ============================================================
// PAYMENT METHOD
// ============================================================

function getPaymentMethod(order) {

    const payment =
        order.paymentMethod ||
        order.payment ||
        "Unknown";

    const value =
        String(payment).toLowerCase();

    if (
        value.includes("cash") ||
        value.includes("cod")
    ) {

        return "COD";

    }

    if (
        value.includes("upi") ||
        value.includes("online")
    ) {

        return "UPI";

    }

    return payment;
}


// ============================================================
// PAYMENT STATUS
// ============================================================

function getPaymentStatus(order) {

    return (
        order.paymentStatus ||
        "Pending"
    );
}


// ============================================================
// ORDER STATUS
// ============================================================

function getStatus(order) {

    return (
        order.status ||
        "Processing"
    );
}


// ============================================================
// DELIVERY DATE
// ============================================================

function getDeliveryDate(order) {

    return order.deliveryDate || "";
}


// ============================================================
// TIMESTAMP
// ============================================================

function getTimestamp(order) {

    const value =
        order.createdAt ||
        order.timestamp ||
        order.date;

    if (!value) {
        return 0;
    }


    // Firestore Timestamp

    if (
        typeof value === "object" &&
        value.seconds
    ) {

        return value.seconds * 1000;

    }


    const date =
        new Date(value).getTime();

    return Number.isNaN(date)
        ? 0
        : date;
}


// ============================================================
// ORDER DATE
// ============================================================

function getOrderDate(order) {

    const timestamp =
        getTimestamp(order);

    if (!timestamp) {
        return "N/A";
    }

    return new Date(
        timestamp
    ).toLocaleString(
        "en-IN"
    );
}


// ============================================================
// DELIVERY DATE FORMAT
// ============================================================

function formatDeliveryDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

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


// ============================================================
// SHORT DATE
// ============================================================

function formatShortDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short"
        }
    );
}


// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

async function checkAdmin() {

    await authReady;

    const user =
        auth.currentUser;


    // Not logged in

    if (!user) {

        window.location.href =
            "auth.html";

        return false;
    }


    // Logged in but not admin

    if (
        user.uid !== ADMIN_UID
    ) {

        document.body.innerHTML = `

            <div style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#f4f8f7;
                padding:30px;
                font-family:Arial,sans-serif;
            ">

                <div style="
                    background:white;
                    max-width:450px;
                    width:100%;
                    padding:45px 30px;
                    border-radius:24px;
                    text-align:center;
                    box-shadow:0 15px 50px rgba(0,0,0,.10);
                ">

                    <div style="
                        font-size:60px;
                        margin-bottom:15px;
                    ">
                        🚫
                    </div>

                    <h2 style="
                        color:#075f55;
                        margin-bottom:10px;
                    ">
                        Access Denied
                    </h2>

                    <p style="
                        color:#718987;
                        line-height:1.6;
                    ">
                        You are not authorized to access
                        the ChemistBoys Admin Dashboard.
                    </p>

                    <button
                        onclick="window.location.href='index.html'"
                        style="
                            margin-top:20px;
                            padding:13px 25px;
                            border:0;
                            border-radius:12px;
                            background:#087c6b;
                            color:white;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        Go Home
                    </button>

                </div>

            </div>

        `;

        return false;
    }


    return true;
}


// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            "[data-section]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.section;

                showSection(section);

            }
        );

    });

}


// ============================================================
// SHOW SECTION
// ============================================================

function showSection(sectionName) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const section =
        $(sectionName);

    if (section) {

        section.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.section
                === sectionName
            ) {

                button.classList.add(
                    "active"
                );

            }

        });


    const titles = {

        dashboard: "Dashboard",

        orders: "Orders",

        customers: "Customers",

        products: "Products",

        payments: "Payments",

        analytics: "Analytics"

    };


    setText(
        "pageTitle",
        titles[sectionName] ||
        "Dashboard"
    );


    // Mobile sidebar close

    const sidebar =
        $("sidebar");

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

}


// ============================================================
// MOBILE SIDEBAR
// ============================================================

function setupMobileMenu() {

    const menuButton =
        $("mobileMenuBtn");

    const sidebar =
        $("sidebar");


    if (
        !menuButton ||
        !sidebar
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// ============================================================
// REALTIME FIRESTORE ORDERS
// ============================================================

function listenToOrders() {

    const ordersRef =
        collection(
            db,
            "orders"
        );


    onSnapshot(

        ordersRef,

        snapshot => {

            allOrders = [];


            snapshot.forEach(
                orderDoc => {

                    allOrders.push({

                        firestoreId:
                            orderDoc.id,

                        ...orderDoc.data()

                    });

                }
            );


            // Latest orders first

            allOrders.sort(
                (a, b) =>
                    getTimestamp(b)
                    -
                    getTimestamp(a)
            );


            renderEverything();

        },


        error => {

            console.error(
                "Firestore error:",
                error
            );


            const container =
                $("ordersContainer");


            if (container) {

                container.innerHTML = `

                    <div class="empty-state">

                        ❌ Unable to load orders.

                        <br>

                        Please check Firebase
                        Firestore rules.

                    </div>

                `;

            }

        }

    );

}


// ============================================================
// RENDER EVERYTHING
// ============================================================

function renderEverything() {

    renderDashboard();

    renderRecentOrders();

    renderOrders();

    renderCustomers();

    renderProducts();

    renderPayments();

    renderAnalytics();

}


// ============================================================
// DASHBOARD
// ============================================================

function renderDashboard() {

    const acceptedOrders =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Accepted"
        );


    const processingOrders =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Processing"
        );


    const cancelledOrders =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Cancelled"
        );


    const revenue =
        acceptedOrders.reduce(
            (sum, order) =>
                sum +
                getTotal(order),
            0
        );


    const customers =
        new Set();


    allOrders.forEach(order => {

        customers.add(
            order.userId ||
            getCustomerEmail(order)
        );

    });


    const itemsSold =
        acceptedOrders.reduce(
            (sum, order) => {

                const items =
                    getItems(order);


                return sum +
                    items.reduce(
                        (
                            itemTotal,
                            item
                        ) => {

                            return (
                                itemTotal +
                                Number(
                                    item.quantity ||
                                    item.qty ||
                                    1
                                )
                            );

                        },
                        0
                    );

            },
            0
        );


    const aov =
        acceptedOrders.length
            ? revenue /
              acceptedOrders.length
            : 0;


    setText(
        "revenueValue",
        formatMoney(revenue)
    );


    setText(
        "ordersValue",
        allOrders.length
    );


    setText(
        "customersValue",
        customers.size
    );


    setText(
        "aovValue",
        formatMoney(aov)
    );


    setText(
        "processingValue",
        processingOrders.length
    );


    setText(
        "acceptedValue",
        acceptedOrders.length
    );


    setText(
        "cancelledValue",
        cancelledOrders.length
    );


    setText(
        "itemsSoldValue",
        itemsSold
    );


    renderAlerts();

}


// ============================================================
// DASHBOARD ALERTS
// ============================================================

function renderAlerts() {

    const processing =
        allOrders.filter(
            order =>
                getStatus(order)
                === "Processing"
        );


    const pendingPayments =
        allOrders.filter(
            order =>
                String(
                    getPaymentStatus(order)
                )
                .toLowerCase()
                .includes("pending")
        );


    const missingDeliveryDate =
        allOrders.filter(
            order => {

                return (
                    getStatus(order)
                    === "Accepted" &&
                    !getDeliveryDate(order)
                );

            }
        );


    setAlert(
        "pendingAlert",
        processing.length,
        "Processing orders"
    );


    setAlert(
        "paymentAlert",
        pendingPayments.length,
        "Pending payments"
    );


    setAlert(
        "deliveryAlert",
        missingDeliveryDate.length,
        "Accepted orders need delivery date"
    );

}


function setAlert(
    id,
    count,
    label
) {

    const element =
        $(id);

    if (!element) {
        return;
    }


    element.innerHTML = `

        <strong>
            ${count}
        </strong>

        ${escapeHTML(label)}

    `;

}


// ============================================================
// RECENT ORDERS
// ============================================================


function renderRecentOrders() {

    const tbody =
        $("recentOrdersBody");


    if (!tbody) {
        return;
    }


    const orders =
        allOrders.slice(
            0,
            8
        );


    if (!orders.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6">
                    No orders yet
                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        orders.map(order => {

            const status =
                getStatus(order);


            return `

                <tr>

                    <td>
                        <strong>
                            #${escapeHTML(
                                getOrderId(order)
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            getCustomerName(order)
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            getTotal(order)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getPaymentMethod(order)
                        )}
                    </td>

                    <td>

                        <span class="
                            status
                            ${status.toLowerCase()}
                        ">

                            ${escapeHTML(
                                status
                            )}

                        </span>

                    </td>

                    <td>
                        ${escapeHTML(
                            getOrderDate(order)
                        )}
                    </td>

                </tr>

            `;

        }).join("");

}


// ============================================================
// ORDERS
// ============================================================

function renderOrders() {

    const container =
        $("ordersContainer");


    if (!container) {
        return;
    }


    const search =
        (
            $("searchInput")?.value ||
            ""
        )
        .toLowerCase()
        .trim();


    const statusFilter =
        (
            $("statusFilter")?.value ||
            "all"
        )
        .toLowerCase();


    const paymentFilter =
        (
            $("paymentFilter")?.value ||
            "all"
        )
        .toLowerCase();


    const filtered =
        allOrders.filter(order => {


            const searchable = [

                getOrderId(order),

                getCustomerName(order),

                getCustomerEmail(order),

                getCustomerPhone(order),

                getCustomerCity(order)

            ]
            .join(" ")
            .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(
                    search
                );


            const status =
                getStatus(order)
                .toLowerCase();


            const payment =
                getPaymentMethod(order)
                .toLowerCase();


            const matchesStatus =
                statusFilter === "all" ||
                status === statusFilter;


            const matchesPayment =
                paymentFilter === "all" ||
                payment === paymentFilter;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment
            );

        });


    if (!filtered.length) {

        container.innerHTML = `

            <div class="empty-state">

                📦 No matching orders found.

            </div>

        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(
                renderOrderCard
            )
            .join("");

}


// ============================================================
// ORDER CARD
// ============================================================

function renderOrderCard(order) {

    const status =
        getStatus(order);


    const items =
        getItems(order);


    const deliveryDate =
        getDeliveryDate(order);


    let itemsHTML = "";


    if (items.length) {

        itemsHTML =
            items.map(item => {

                const name =
                    item.name ||
                    item.productName ||
                    "Product";


                const quantity =
                    Number(
                        item.quantity ||
                        item.qty ||
                        1
                    );


                const price =
                    Number(
                        item.price ||
                        item.productPrice ||
                        0
                    );


                return `

                    <div class="
                        admin-order-item
                    ">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    name
                                )}
                            </strong>

                            <small>
                                × ${quantity}
                            </small>

                        </div>

                        <strong>
                            ${formatMoney(
                                price *
                                quantity
                            )}
                        </strong>

                    </div>

                `;

            }).join("");

    } else {

        itemsHTML = `

            <div class="muted">
                No item details
            </div>

        `;

    }


    let actions = "";


    // Processing

    if (
        status === "Processing"
    ) {

        actions = `

            <button
                class="accept-btn"
                data-action="accept"
                data-id="${escapeHTML(
                    order.firestoreId
                )}"
            >
                ✓ Accept Order
            </button>

            <button
                class="cancel-btn"
                data-action="cancel"
                data-id="${escapeHTML(
                    order.firestoreId
                )}"
            >
                ✕ Cancel
            </button>

        `;

    }


    // Accepted

    else if (
        status === "Accepted"
    ) {

        actions = `

            <button
                class="delivery-btn"
                data-action="delivery"
                data-id="${escapeHTML(
                    order.firestoreId
                )}"
            >
                📅 Change Delivery Date
            </button>

            <button
                class="cancel-btn"
                data-action="cancel"
                data-id="${escapeHTML(
                    order.firestoreId
                )}"
            >
                ✕ Cancel
            </button>

        `;

    }


    // Cancelled

    else {

        actions = `

            <span class="order-closed">

                Order
                ${escapeHTML(status)}

            </span>

        `;

    }


    return `

        <div class="
            admin-order-card
        ">


            <!-- TOP -->

            <div class="
                admin-order-top
            ">

                <div>

                    <h3>
                        #${escapeHTML(
                            getOrderId(order)
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            getOrderDate(order)
                        )}
                    </p>

                </div>


                <span class="
                    order-status
                    ${status.toLowerCase()}
                ">

                    ${escapeHTML(
                        status
                    )}

                </span>

            </div>


            <!-- CUSTOMER / ADDRESS / PAYMENT / TOTAL -->

            <div class="
                admin-order-grid
            ">


                <div>

                    <h4>
                        Customer
                    </h4>

                    <p>
                        <strong>
                            ${escapeHTML(
                                getCustomerName(order)
                            )}
                        </strong>
                    </p>

                    <p>
                        ${escapeHTML(
                            getCustomerEmail(order)
                        )}
                    </p>

                    <p>
                        ${escapeHTML(
                            getCustomerPhone(order)
                        )}
                    </p>

                </div>


                <div>

                    <h4>
                        Address
                    </h4>

                    <p>
                        ${escapeHTML(
                            getCustomerAddress(order)
                        )}
                    </p>

                    <p>
                        ${escapeHTML(
                            getCustomerCity(order)
                        )}
                        -
                        ${escapeHTML(
                            getCustomerPincode(order)
                        )}
                    </p>

                </div>


                <div>

                    <h4>
                        Payment
                    </h4>

                    <p>
                        <strong>
                            ${escapeHTML(
                                getPaymentMethod(order)
                            )}
                        </strong>
                    </p>

                    <p>
                        ${escapeHTML(
                            getPaymentStatus(order)
                        )}
                    </p>

                </div>


                <div>

                    <h4>
                        Total
                    </h4>

                    <p class="admin-total">
                        ${formatMoney(
                            getTotal(order)
                        )}
                    </p>

                </div>

            </div>


            <!-- ITEMS -->

            <div class="
                admin-items
            ">

                <h4>
                    Order Items
                </h4>

                ${itemsHTML}

            </div>


            <!-- DELIVERY DATE -->

            ${
                deliveryDate
                ? `

                    <div class="
                        admin-delivery-date
                    ">

                        📅 Delivery Date:

                        <strong>
                            ${escapeHTML(
                                formatDeliveryDate(
                                    deliveryDate
                                )
                            )}
                        </strong>

                    </div>

                `
                : ""
            }


            <!-- ACTIONS -->

            <div class="
                admin-order-actions
            ">

                ${actions}

            </div>


        </div>

    `;

}


// ============================================================
// ORDER BUTTON ACTIONS
// ============================================================
function setupOrderActions() {

    document.addEventListener(
        "click",
        event => {


            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            const orderId =
                button.dataset.id;


            if (!orderId) {
                return;
            }


            if (
                action === "accept"
            ) {

                openDeliveryModal(
                    orderId
                );

            }


            if (
                action === "delivery"
            ) {

                openDeliveryModal(
                    orderId
                );

            }


            if (
                action === "cancel"
            ) {

                cancelOrder(
                    orderId
                );

            }

        }
    );

}


// ============================================================
// OPEN DELIVERY MODAL
// ============================================================

function openDeliveryModal(orderId) {

    selectedOrderId =
        orderId;


    const modal =
        $("deliveryModal");


    const input =
        $("deliveryDateInput");


    if (
        !modal ||
        !input
    ) {

        return;

    }


    // Today

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        )
        .padStart(
            2,
            "0"
        );


    const todayString =
        `${year}-${month}-${day}`;


    // Past dates blocked

    input.min =
        todayString;


    input.value = "";


    modal.classList.add(
        "active"
    );

}


// ============================================================
// CLOSE DELIVERY MODAL
// ============================================================

function closeDeliveryModal() {

    selectedOrderId =
        null;


    const modal =
        $("deliveryModal");


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


// ============================================================
// ACCEPT ORDER
// ============================================================

async function confirmDeliveryDate() {

    if (!selectedOrderId) {
        return;
    }


    const input =
        $("deliveryDateInput");


    if (
        !input ||
        !input.value
    ) {

        alert(
            "Please select a delivery date."
        );

        return;

    }


    const selectedDate =
        input.value;


    // Today

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    // Selected

    const chosenDate =
        new Date(
            `${selectedDate}T00:00:00`
        );


    // Past date check

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


        closeDeliveryModal();


    } catch (error) {

        console.error(
            "Accept order error:",
            error
        );


        alert(
            "Unable to accept order. Please try again."
        );

    }

}


// ============================================================
// CANCEL ORDER
// ============================================================

async function cancelOrder(orderId) {

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
                orderId
            ),

            {

                status:
                    "Cancelled"

            }

        );


    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );


        alert(
            "Unable to cancel order."
        );

    }

}


// ============================================================
// CUSTOMERS SECTION
// ============================================================

function renderCustomers() {

    const container =
        $("customersContainer");


    if (!container) {
        return;
    }


    const customersMap =
        new Map();


    allOrders.forEach(order => {

        const key =
            order.userId ||
            getCustomerEmail(order);


        if (
            !customersMap.has(key)
        ) {

            customersMap.set(
                key,
                {

                    name:
                        getCustomerName(order),

                    email:
                        getCustomerEmail(order),

                    phone:
                        getCustomerPhone(order),

                    orders:
                        0,

                    spending:
                        0

                }
            );

        }


        const customer =
            customersMap.get(key);


        customer.orders++;


        if (
            getStatus(order)
            === "Accepted"
        ) {

            customer.spending +=
                getTotal(order);

        }

    });


    const customers =
        Array.from(
            customersMap.values()
        );


    if (!customers.length) {

        container.innerHTML = `

            <div class="empty-state">

                👥 No customers yet.

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <div class="
            table-wrapper
        ">

            <table>

                <thead>

                    <tr>

                        <th>
                            Customer
                        </th>

                        <th>
                            Email
                        </th>

                        <th>
                            Phone
                        </th>

                        <th>
                            Orders
                        </th>

                        <th>
                            Spending
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${customers.map(
                        customer => `

                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        customer.name
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    customer.email
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    customer.phone
                                )}
                            </td>

                            <td>
                                ${customer.orders}
                            </td>

                            <td>
                                ${formatMoney(
                                    customer.spending
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>

    `;

}


// ============================================================
// PRODUCTS SECTION
// ============================================================

function renderProducts() {

    const container =
        $("productsContainer");


    if (!container) {
        return;
    }


    const products =
        new Map();


    allOrders
        .filter(
            order =>
                getStatus(order)
                === "Accepted"
        )
        .forEach(order => {

            getItems(order)
                .forEach(item => {

                    const name =
                        item.name ||
                        item.productName ||
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
                            item.productPrice ||
                            0
                        );


                    if (
                        !products.has(name)
                    ) {

                        products.set(
                            name,
                            {

                                name:
                                    name,

                                quantity:
                                    0,

                                revenue:
                                    0

                            }
                        );

                    }


                    const product =
                        products.get(name);


                    product.quantity +=
                        quantity;


                    product.revenue +=
                        price *
                        quantity;

                });

        });


    const productList =
        Array.from(
            products.values()
        )
        .sort(
            (a, b) =>
                b.quantity -
                a.quantity
        );


    if (!productList.length) {

        container.innerHTML = `

            <div class="empty-state">

                📦 No product sales yet.

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <div class="
            table-wrapper
        ">

            <table>

                <thead>

                    <tr>

                        <th>
                            Product
                        </th>

                        <th>
                            Units Sold
                        </th>

                        <th>
                            Revenue
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${productList.map(
                        product => `

                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${product.quantity}
                            </td>

                            <td>
                                ${formatMoney(
                                    product.revenue
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>

    `;

}


// ============================================================
// PAYMENTS SECTION
// ============================================================
function renderProducts() {

    const container =
        $("productsContainer");


    if (!container) {
        return;
    }


    const products =
        new Map();


    allOrders
        .filter(
            order =>
                getStatus(order)
                === "Accepted"
        )
        .forEach(order => {

            getItems(order)
                .forEach(item => {

                    const name =
                        item.name ||
                        item.productName ||
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
                            item.productPrice ||
                            0
                        );


                    if (
                        !products.has(name)
                    ) {

                        products.set(
                            name,
                            {

                                name:
                                    name,

                                quantity:
                                    0,

                                revenue:
                                    0

                            }
                        );

                    }


                    const product =
                        products.get(name);


                    product.quantity +=
                        quantity;


                    product.revenue +=
                        price *
                        quantity;

                });

        });


    const productList =
        Array.from(
            products.values()
        )
        .sort(
            (a, b) =>
                b.quantity -
                a.quantity
        );


    if (!productList.length) {

        container.innerHTML = `

            <div class="empty-state">

                📦 No product sales yet.

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <div class="
            table-wrapper
        ">

            <table>

                <thead>

                    <tr>

                        <th>
                            Product
                        </th>

                        <th>
                            Units Sold
                        </th>

                        <th>
                            Revenue
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${productList.map(
                        product => `

                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${product.quantity}
                            </td>

                            <td>
                                ${formatMoney(
                                    product.revenue
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>

    `;

}


// ============================================================
// PAYMENTS SECTION
// ============================================================

function renderPayments() {

    const container =
        $("paymentsContainer");


    if (!container) {
        return;
    }


    const cod =
        allOrders.filter(
            order =>
                getPaymentMethod(order)
                === "COD"
        ).length;


    const upi =
        allOrders.filter(
            order =>
                getPaymentMethod(order)
                === "UPI"
        ).length;


    const pending =
        allOrders.filter(
            order =>
                String(
                    getPaymentStatus(order)
                )
                .toLowerCase()
                .includes("pending")
        ).length;


    container.innerHTML = `

        <div class="
            payment-stats
        ">


            <div class="
                payment-stat-card
            ">

                <span>
                    💵 COD Orders
                </span>

                <strong>
                    ${cod}
                </strong>

            </div>


            <div class="
                payment-stat-card
            ">

                <span>
                    📱 UPI Orders
                </span>

                <strong>
                    ${upi}
                </strong>

            </div>


            <div class="
                payment-stat-card
            ">

                <span>
                    ⏳ Pending Payments
                </span>

                <strong>
                    ${pending}
                </strong>

            </div>


        </div>


        <div class="
            table-wrapper
        ">

            <table>

                <thead>

                    <tr>

                        <th>
                            Order
                        </th>

                        <th>
                            Customer
                        </th>

                        <th>
                            Method
                        </th>

                        <th>
                            Payment Status
                        </th>

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${allOrders.map(
                        order => `

                        <tr>

                            <td>
                                #${escapeHTML(
                                    getOrderId(order)
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    getCustomerName(order)
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    getPaymentMethod(order)
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    getPaymentStatus(order)
                                )}
                            </td>

                            <td>
                                ${formatMoney(
                                    getTotal(order)
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>

    `;

}


// ============================================================
// ANALYTICS
// ============================================================

function renderAnalytics() {

    if (
        typeof Chart === "undefined"
    ) {

        return;

    }


    renderRevenueChart();

    renderOrdersChart();

    renderStatusChart();

    renderPaymentChart();

    renderTopProducts();

}


// ============================================================
// REVENUE CHART
// ============================================================

function renderRevenueChart() {

    const canvas =
        $("revenueChart");


    if (!canvas) {
        return;
    }


    const days = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setDate(
            date.getDate() - i
        );


        days.push(
            date
                .toISOString()
                .split("T")[0]
        );

    }


    const values =
        days.map(day => {

            return allOrders
                .filter(order => {

                    if (
                        getStatus(order)
                        !== "Accepted"
                    ) {

                        return false;

                    }


                    const timestamp =
                        getTimestamp(order);


                    if (!timestamp) {
                        return false;
                    }


                    const orderDay =
                        new Date(
                            timestamp
                        )
                        .toISOString()
                        .split("T")[0];


                    return (
                        orderDay === day
                    );

                })
                .reduce(
                    (sum, order) =>
                        sum +
                        getTotal(order),
                    0
                );

        });


    if (revenueChart) {

        revenueChart.destroy();

    }


    revenueChart =
        new Chart(
            canvas,
            {

                type:
                    "line",

                data: {

                    labels:
                        days.map(
                            formatShortDate
                        ),

                    datasets: [

                        {

                            label:
                                "Revenue",

                            data:
                                values,

                            tension:
                                0.35,

                            fill:
                                false

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


// ============================================================
// ORDERS CHART
// ============================================================

function renderOrdersChart() {

    const canvas =
        $("ordersChart");


    if (!canvas) {
        return;
    }


    const days = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setDate(
            date.getDate() - i
        );


        days.push(
            date
                .toISOString()
                .split("T")[0]
        );

    }


    const values =
        days.map(day => {

            return allOrders.filter(
                order => {

                    const timestamp =
                        getTimestamp(order);


                    if (!timestamp) {
                        return false;
                    }


                    const orderDay =
                        new Date(
                            timestamp
                        )
                        .toISOString()
                        .split("T")[0];


                    return (
                        orderDay === day
                    );

                }
            ).length;

        });


    if (ordersChart) {

        ordersChart.destroy();

    }


    ordersChart =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels:
                        days.map(
                            formatShortDate
                        ),

                    datasets: [

                        {

                            label:
                                "Orders",

                            data:
                                values

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0

                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// STATUS CHART
// ============================================================
function renderStatusChart() {

    const canvas =
        $("statusChart");


    if (!canvas) {
        return;
    }


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
            canvas,
            {

                type:
                    "doughnut",

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

}


// ============================================================
// PAYMENT CHART
// ============================================================

function renderPaymentChart() {

    const canvas =
        $("paymentChart");


    if (!canvas) {
        return;
    }


    const cod =
        allOrders.filter(
            order =>
                getPaymentMethod(order)
                === "COD"
        ).length;


    const upi =
        allOrders.filter(
            order =>
                getPaymentMethod(order)
                === "UPI"
        ).length;


    if (paymentChart) {

        paymentChart.destroy();

    }


    paymentChart =
        new Chart(
            canvas,
            {

                type:
                    "pie",

                data: {

                    labels: [

                        "COD",

                        "UPI"

                    ],

                    datasets: [

                        {

                            data: [

                                cod,

                                upi

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


// ============================================================
// TOP PRODUCTS
// ============================================================

function renderTopProducts() {

    const tbody =
        $("topProductsBody");


    if (!tbody) {
        return;
    }


    const products =
        new Map();


    allOrders
        .filter(
            order =>
                getStatus(order)
                === "Accepted"
        )
        .forEach(order => {

            getItems(order)
                .forEach(item => {

                    const name =
                        item.name ||
                        item.productName ||
                        "Unknown Product";


                    const quantity =
                        Number(
                            item.quantity ||
                            item.qty ||
                            1
                        );


                    products.set(
                        name,
                        (
                            products.get(name)
                            || 0
                        ) +
                        quantity
                    );

                });

        });


    const topProducts =
        Array.from(
            products.entries()
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(
            0,
            10
        );


    if (!topProducts.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="2">
                    No product sales yet
                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        topProducts
            .map(
                ([name, quantity]) => `

                <tr>

                    <td>
                        ${escapeHTML(name)}
                    </td>

                    <td>
                        ${quantity}
                    </td>

                </tr>

            `
            )
            .join("");

}


// ============================================================
// SEARCH AND FILTERS
// ============================================================

function setupFilters() {

    const search =
        $("searchInput");


    const status =
        $("statusFilter");


    const payment =
        $("paymentFilter");


    if (search) {

        search.addEventListener(
            "input",
            renderOrders
        );

    }


    if (status) {

        status.addEventListener(
            "change",
            renderOrders
        );

    }


    if (payment) {

        payment.addEventListener(
            "change",
            renderOrders
        );

    }

}


// ============================================================
// DELIVERY MODAL
// ============================================================

function setupDeliveryModal() {

    const closeButton =
        $("closeModalBtn");


    const confirmButton =
        $("confirmDeliveryBtn");


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeDeliveryModal
        );

    }


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            confirmDeliveryDate
        );

    }


    const modal =
        $("deliveryModal");


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    closeDeliveryModal();

                }

            }
        );

    }

}


// ============================================================
// EXPORT ORDERS CSV
// ============================================================

function exportOrdersCSV() {

    if (!allOrders.length) {

        alert(
            "No orders available to export."
        );

        return;

    }


    const headers = [

        "Order ID",

        "Customer",

        "Email",

        "Phone",

        "Address",

        "City",

        "Pincode",

        "Total",

        "Payment Method",

        "Payment Status",

        "Status",

        "Delivery Date",

        "Order Date"

    ];


    const rows =
        allOrders.map(order => [

            getOrderId(order),

            getCustomerName(order),

            getCustomerEmail(order),

            getCustomerPhone(order),

            getCustomerAddress(order),

            getCustomerCity(order),

            getCustomerPincode(order),

            getTotal(order),

            getPaymentMethod(order),

            getPaymentStatus(order),

            getStatus(order),

            getDeliveryDate(order),

            getOrderDate(order)

        ]);


    const csv = [

        headers,

        ...rows

    ]
    .map(row =>

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
        URL.createObjectURL(blob);


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "chemistboys-orders.csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


// ============================================================
// EXPORT BUTTON
// ============================================================

function setupExport() {

    const button =
        $("exportBtn");


    if (button) {

        button.addEventListener(
            "click",
            exportOrdersCSV
        );

    }

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    try {

        await signOut(auth);

        window.location.href =
            "auth.html";

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


// ============================================================
// LOGOUT BUTTON
// ============================================================

function setupLogout() {

    const button =
        $("logoutBtn");


    if (button) {

        button.addEventListener(
            "click",
            logout
        );

    }

}


// ============================================================
// INITIALIZE ADMIN DASHBOARD
// ============================================================

async function init() {

    const allowed =
        await checkAdmin();


    if (!allowed) {
        return;
    }


    setupNavigation();

    setupMobileMenu();

    setupFilters();

    setupOrderActions();

    setupDeliveryModal();

    setupExport();

    setupLogout();


    // Start realtime Firestore listener

    listenToOrders();


    // Open Dashboard by default

    showSection(
        "dashboard"
    );

}


// ============================================================
// START
// ============================================================

init();