// ==========================================
// CHEMISTBOYS ADMIN DASHBOARD
// ==========================================

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


// ==========================================
// ADMIN UID
// ==========================================

const ADMIN_UID = "gtTvd6XSgqXVaIrp67cM6gEJP0u2";


// ==========================================
// GLOBAL DATA
// ==========================================

let allOrders = [];
let selectedOrderId = null;

let revenueChart = null;
let ordersChart = null;
let statusChart = null;
let paymentChart = null;


// ==========================================
// HELPERS
// ==========================================

function $(id) {
    return document.getElementById(id);
}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getOrderId(order) {

    return order.id ||
           order.orderId ||
           order.orderID ||
           "Unknown";
}


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

    return Array.isArray(items) ? items : [];
}


function getTotal(order) {

    const total =
        order.total ??
        order.grandTotal ??
        order.amount ??
        0;

    const number = Number(total);

    if (!Number.isNaN(number)) {
        return number;
    }

    return 0;
}


function getCustomerName(order) {

    return (
        order.customerName ||
        order.name ||
        order.userName ||
        "Customer"
    );
}


function getCustomerEmail(order) {

    return (
        order.customerEmail ||
        order.email ||
        "N/A"
    );
}


function getPaymentMethod(order) {

    const payment =
        order.paymentMethod ||
        order.payment ||
        "Unknown";

    const value = String(payment).toLowerCase();

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


function getPaymentStatus(order) {

    return (
        order.paymentStatus ||
        "Pending"
    );
}


function getStatus(order) {

    return (
        order.status ||
        "Processing"
    );
}


function getOrderDate(order) {

    const value =
        order.createdAt ||
        order.timestamp ||
        order.date ||
        null;

    if (!value) {
        return "N/A";
    }

    try {

        if (
            typeof value === "object" &&
            value.seconds
        ) {

            return new Date(
                value.seconds * 1000
            ).toLocaleString("en-IN");
        }

        const date = new Date(value);

        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleString("en-IN");
        }

    } catch {}

    return "N/A";
}


function getCustomerPhone(order) {

    return (
        order.customerPhone ||
        order.phone ||
        "N/A"
    );
}


function getCustomerAddress(order) {

    return (
        order.customerAddress ||
        order.address ||
        "N/A"
    );
}


function getCustomerCity(order) {

    return (
        order.customerCity ||
        order.city ||
        "N/A"
    );
}


function getCustomerPincode(order) {

    return (
        order.customerPincode ||
        order.pincode ||
        "N/A"
    );
}


function getDeliveryDate(order) {

    return order.deliveryDate || "";
}


// ==========================================
// AUTH PROTECTION
// ==========================================

async function checkAdmin() {

    await authReady;

    const user = auth.currentUser;

    if (!user) {

        window.location.href = "auth.html";
        return false;
    }

    if (user.uid !== ADMIN_UID) {

        document.body.innerHTML = `
            <div style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#f4f8f7;
                font-family:Arial,sans-serif;
                text-align:center;
                padding:30px;
            ">

                <div style="
                    background:white;
                    padding:40px;
                    border-radius:20px;
                    box-shadow:0 10px 40px rgba(0,0,0,.08);
                    max-width:450px;
                ">

                    <div style="font-size:50px;">🚫</div>

                    <h2 style="margin:15px 0;">
                        Access Denied
                    </h2>

                    <p style="color:#666;">
                        You are not authorized to access
                        the ChemistBoys Admin Dashboard.
                    </p>

                    <button
                        onclick="window.location.href='index.html'"
                        style="
                            margin-top:20px;
                            padding:12px 22px;
                            border:none;
                            border-radius:10px;
                            background:#087c6b;
                            color:white;
                            cursor:pointer;
                            font-weight:700;
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


// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

function setupNavigation() {

    const navButtons =
        document.querySelectorAll("[data-section]");

    navButtons.forEach(button => {

        button.addEventListener("click", () => {

            const section =
                button.dataset.section;

            showSection(section);

        });

    });

}


function showSection(sectionName) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const selected =
        document.getElementById(sectionName);

    if (selected) {
        selected.classList.add("active");
    }


    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            button.classList.remove("active");

            if (
                button.dataset.section === sectionName
            ) {
                button.classList.add("active");
            }

        });


    const title =
        $("pageTitle");

    const titles = {

        dashboard: "Dashboard",

        orders: "Orders",

        customers: "Customers",

        products: "Products",

        payments: "Payments",

        analytics: "Analytics"

    };


    if (title) {

        title.textContent =
            titles[sectionName] ||
            "Dashboard";

    }


    // Mobile sidebar close

    const sidebar =
        $("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

}


// ==========================================
// MOBILE MENU
// ==========================================

function setupMobileMenu() {

    const menuBtn =
        $("mobileMenuBtn");

    const sidebar =
        $("sidebar");

    if (!menuBtn || !sidebar) {
        return;
    }

    menuBtn.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });

}


// ==========================================
// REALTIME FIRESTORE ORDERS
// ==========================================

function listenToOrders() {

    const ordersRef =
        collection(db, "orders");


    onSnapshot(
        ordersRef,

        snapshot => {

            allOrders = [];

            snapshot.forEach(orderDoc => {

                allOrders.push({

                    firestoreId: orderDoc.id,

                    ...orderDoc.data()

                });

            });


            // Latest first

            allOrders.sort((a, b) => {

                const dateA =
                    getTimestamp(a);

                const dateB =
                    getTimestamp(b);

                return dateB - dateA;

            });


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
                        Please check Firestore rules.
                    </div>
                `;

            }

        }
    );

}


function getTimestamp(order) {

    const value =
        order.createdAt ||
        order.timestamp ||
        order.date;


    if (!value) {
        return 0;
    }


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


// ==========================================
// RENDER EVERYTHING
// ==========================================

function renderEverything() {

    renderDashboard();

    renderRecentOrders();

    renderOrders();

    renderCustomers();

    renderProducts();

    renderPayments();

    renderAnalytics();

}


// ==========================================
// DASHBOARD
// ==========================================

function renderDashboard() {

    const totalOrders =
        allOrders.length;


    const acceptedOrders =
        allOrders.filter(
            order => getStatus(order) === "Accepted"
        );


    const processingOrders =
        allOrders.filter(
            order => getStatus(order) === "Processing"
        );


    const cancelledOrders =
        allOrders.filter(
            order => getStatus(order) === "Cancelled"
        );


    const revenue =
        acceptedOrders.reduce(
            (sum, order) =>
                sum + getTotal(order),
            0
        );


    const customers =
        new Set(
            allOrders.map(order => {

                return (
                    order.userId ||
                    getCustomerEmail(order)
                );

            })
        );


    const itemsSold =
        acceptedOrders.reduce(
            (sum, order) => {

                const items =
                    getItems(order);

                return sum +
                    items.reduce(
                        (total, item) => {

                            return total +
                                Number(
                                    item.quantity ||
                                    item.qty ||
                                    1
                                );

                        },
                        0
                    );

            },
            0
        );


    const aov =
        acceptedOrders.length
            ? revenue / acceptedOrders.length
            : 0;


    setText(
        "revenueValue",
        formatMoney(revenue)
    );


    setText(
        "ordersValue",
        totalOrders
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


// ==========================================
// ALERTS
// ==========================================

function renderAlerts() {

    const pendingOrders =
        allOrders.filter(
            order => getStatus(order) === "Processing"
        );


    const pendingPayments =
        allOrders.filter(order => {

            const status =
                String(
                    getPaymentStatus(order)
                ).toLowerCase();

            return (
                status.includes("pending")
            );

        });


    const missingDelivery =
        allOrders.filter(order => {

            return (
                getStatus(order) === "Accepted" &&
                !getDeliveryDate(order)
            );

        });


    setAlert(
        "pendingAlert",
        pendingOrders.length,
        "Processing orders"
    );


    setAlert(
        "paymentAlert",
        pendingPayments.length,
        "Pending payments"
    );


    setAlert(
        "deliveryAlert",
        missingDelivery.length,
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


    if (count > 0) {

        element.innerHTML = `
            <strong>${count}</strong>
            ${escapeHTML(label)}
        `;

    } else {

        element.innerHTML = `
            <strong>0</strong>
            ${escapeHTML(label)}
        `;

    }

}


// ==========================================
// RECENT ORDERS
// ==========================================

function renderRecentOrders() {

    const tbody =
        $("recentOrdersBody");

    if (!tbody) {
        return;
    }


    const recent =
        allOrders.slice(0, 8);


    if (!recent.length) {

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
        recent.map(order => {

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
                        <span class="status ${getStatus(order)
                            .toLowerCase()}">
                            ${escapeHTML(
                                getStatus(order)
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


// ==========================================
// ORDERS SECTION
// ==========================================

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
        ).toLowerCase().trim();


    const statusFilter =
        (
            $("statusFilter")?.value ||
            "all"
        ).toLowerCase();


    const paymentFilter =
        (
            $("paymentFilter")?.value ||
            "all"
        ).toLowerCase();


    let orders =
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
                searchable.includes(search);


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


    if (!orders.length) {

        container.innerHTML = `
            <div class="empty-state">
                📦 No matching orders found.
            </div>
        `;

        return;
    }


    container.innerHTML =
        orders.map(renderOrderCard).join("");

}


// ==========================================
// ORDER CARD
// ==========================================

function renderOrderCard(order) {

    const firestoreId =
        order.firestoreId;


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
                    <div class="admin-order-item">

                        <div>
                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <small>
                                × ${quantity}
                            </small>
                        </div>

                        <strong>
                            ${formatMoney(
                                price * quantity
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


    if (status === "Processing") {

        actions = `
            <button
                class="accept-btn"
                data-action="accept"
                data-id="${escapeHTML(
                    firestoreId
                )}"
            >
                ✓ Accept Order
            </button>

            <button
                class="cancel-btn"
                data-action="cancel"
                data-id="${escapeHTML(
                    firestoreId
                )}"
            >
                ✕ Cancel
            </button>
        `;

    } else if (status === "Accepted") {

        actions = `
            <button
                class="delivery-btn"
                data-action="delivery"
                data-id="${escapeHTML(
                    firestoreId
                )}"
            >
                📅 Change Delivery Date
            </button>

            <button
                class="cancel-btn"
                data-action="cancel"
                data-id="${escapeHTML(
                    firestoreId
                )}"
            >
                ✕ Cancel
            </button>
        `;

    } else {

        actions = `
            <span class="order-closed">
                Order ${escapeHTML(status)}
            </span>
        `;

    }


    return `
        <div class="admin-order-card">

            <div class="admin-order-top">

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
                    ${escapeHTML(status)}
                </span>

            </div>


            <div class="admin-order-grid">

                <div>

                    <h4>Customer</h4>

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

                    <h4>Address</h4>

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

                    <h4>Payment</h4>

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

                    <h4>Total</h4>

                    <p class="admin-total">
                        ${formatMoney(
                            getTotal(order)
                        )}
                    </p>

                </div>

            </div>


            <div class="admin-items">

                <h4>Order Items</h4>

                ${itemsHTML}

            </div>


            ${
                deliveryDate
                ? `
                    <div class="admin-delivery-date">
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


            <div class="admin-order-actions">

                ${actions}

            </div>

        </div>
    `;

}


// ==========================================
// ORDER ACTIONS
// ==========================================

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


            const id =
                button.dataset.id;


            if (!id) {
                return;
            }


            if (action === "accept") {

                openDeliveryModal(id);

            }


            if (action === "delivery") {

                openDeliveryModal(id);

            }


            if (action === "cancel") {

                cancelOrder(id);

            }

        }
    );

}


// ==========================================
// DELIVERY MODAL
// ==========================================

function openDeliveryModal(orderId) {

    selectedOrderId =
        orderId;


    const modal =
        $("deliveryModal");

    const input =
        $("deliveryDateInput");


    if (!modal || !input) {
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
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    const todayString =
        `${year}-${month}-${day}`;


    input.min =
        todayString;


    input.value = "";


    modal.classList.add("active");

}


function closeDeliveryModal() {

    selectedOrderId =
        null;


    const modal =
        $("deliveryModal");


    if (modal) {
        modal.classList.remove("active");
    }

}


async function confirmDeliveryDate() {

    if (!selectedOrderId) {
        return;
    }


    const input =
        $("deliveryDateInput");


    if (!input || !input.value) {

        alert(
            "Please select a delivery date."
        );

        return;
    }


    const selectedDate =
        input.value;


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const chosen =
        new Date(
            `${selectedDate}T00:00:00`
        );


    if (chosen < today) {

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

                status: "Accepted",

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
            "Unable to update order. Please try again."
        );

    }

}


// ==========================================
// CANCEL ORDER
// ==========================================

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

                status: "Cancelled"

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


        if (!customersMap.has(key)) {

            customersMap.set(
                key,
                {

                    name:
                        getCustomerName(order),

                    email:
                        getCustomerEmail(order),

                    phone:
                        getCustomerPhone(order),

                    orders: 0,

                    spending: 0

                }
            );

        }


        const customer =
            customersMap.get(key);


        customer.orders++;


        if (
            getStatus(order) === "Accepted"
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
        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Customer</th>

                        <th>Email</th>

                        <th>Phone</th>

                        <th>Orders</th>

                        <th>Spending</th>

                    </tr>

                </thead>


                <tbody>

                    ${customers.map(customer => {

                        return `
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
                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>
    `;

}


// ==========================================
// PRODUCTS
// ==========================================

function renderProducts() {

    const container =
        $("productsContainer");

    if (!container) {
        return;
    }


    const productMap =
        new Map();


    allOrders
        .filter(
            order =>
                getStatus(order) === "Accepted"
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
                        !productMap.has(name)
                    ) {

                        productMap.set(
                            name,
                            {

                                name,

                                quantity: 0,

                                revenue: 0

                            }
                        );

                    }


                    const product =
                        productMap.get(name);


                    product.quantity +=
                        quantity;


                    product.revenue +=
                        price * quantity;

                });

        });


    const products =
        Array.from(
            productMap.values()
        )
        .sort(
            (a, b) =>
                b.quantity -
                a.quantity
        );


    if (!products.length) {

        container.innerHTML = `
            <div class="empty-state">
                📦 No product sales yet.
            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Product</th>

                        <th>Units Sold</th>

                        <th>Revenue</th>

                    </tr>

                </thead>


                <tbody>

                    ${products.map(product => {

                        return `
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
                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>
    `;

}


// ==========================================
// PAYMENTS
// ==========================================

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
                .toLowerCase()
                === "cod"
        ).length;


    const upi =
        allOrders.filter(
            order =>
                getPaymentMethod(order)
                .toLowerCase()
                === "upi"
        ).length;


    const pending =
        allOrders.filter(order => {

            return String(
                getPaymentStatus(order)
            )
            .toLowerCase()
            .includes("pending");

        }).length;


    container.innerHTML = `

        <div class="payment-stats">

            <div class="payment-stat-card">

                <span>💵 COD Orders</span>

                <strong>
                    ${cod}
                </strong>

            </div>


            <div class="payment-stat-card">

                <span>📱 UPI Orders</span>

                <strong>
                    ${upi}
                </strong>

            </div>


            <div class="payment-stat-card">

                <span>⏳ Pending Payments</span>

                <strong>
                    ${pending}
                </strong>

            </div>

        </div>


        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Order</th>

                        <th>Customer</th>

                        <th>Method</th>

                        <th>Payment Status</th>

                        <th>Total</th>

                    </tr>

                </thead>


                <tbody>

                    ${allOrders.map(order => {

                        return `
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
                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>

    `;

}


// ==========================================
// ANALYTICS
// ==========================================

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


// ==========================================
// REVENUE CHART
// ==========================================

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


                    const date =
                        new Date(timestamp)
                            .toISOString()
                            .split("T")[0];


                    return date === day;

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

                type: "line",

                data: {

                    labels:
                        days.map(
                            day =>
                                formatShortDate(day)
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

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: true
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true

                        }

                    }

                }

            }
        );

}

