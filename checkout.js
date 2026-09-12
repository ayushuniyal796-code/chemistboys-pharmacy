import { auth, authReady, db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ======================================================
// CONFIG
// ======================================================

const CART_KEY = "chemistboys_cart";
const OLD_CART_KEY = "chemistCart";

const UPI_ID = "ayushuniyal.cyberlab@fam";


// ======================================================
// DOM ELEMENTS
// ======================================================

const checkoutForm = document.getElementById("checkoutForm");

const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");
const customerPhone = document.getElementById("customerPhone");
const customerAddress = document.getElementById("customerAddress");
const customerCity = document.getElementById("customerCity");
const customerPincode = document.getElementById("customerPincode");

const paymentMethod = document.getElementById("paymentMethod");

const checkoutItems = document.getElementById("checkoutItems");

const subtotalElement = document.getElementById("subtotal");
const deliveryChargeElement = document.getElementById("deliveryCharge");
const grandTotalElement = document.getElementById("grandTotal");

const placeOrderBtn = document.getElementById("placeOrderBtn");


// ======================================================
// GLOBAL USER
// ======================================================

let currentUser = null;


// ======================================================
// AUTH READY
// ======================================================

async function waitForAuthentication() {

    await authReady;

    currentUser = auth.currentUser;

    if (!currentUser) {
        window.location.href = "auth.html";
        return false;
    }

    return true;
}


// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(auth, (user) => {

    currentUser = user;

    if (!user) {
        window.location.href = "auth.html";
        return;
    }

    if (customerName) {
        customerName.value = user.displayName || "";
    }

    if (customerEmail) {
        customerEmail.value = user.email || "";
    }

    loadCheckout();
});


// ======================================================
// GET CART
// ======================================================

function getCart() {

    let cart = [];

    try {

        const newCart = localStorage.getItem(CART_KEY);

        if (newCart) {
            cart = JSON.parse(newCart);
        }

        // Compatibility with old cart key
        if (!Array.isArray(cart) || cart.length === 0) {

            const oldCart = localStorage.getItem(OLD_CART_KEY);

            if (oldCart) {
                cart = JSON.parse(oldCart);
            }
        }

    } catch (error) {

        console.error("Cart loading error:", error);
        cart = [];
    }

    return Array.isArray(cart) ? cart : [];
}


// ======================================================
// SAVE LOCAL ORDER
// ======================================================

function saveLocalOrder(order) {

    try {

        const existingOrders =
            JSON.parse(
                localStorage.getItem("chemistboys_orders") || "[]"
            );

        existingOrders.push(order);

        localStorage.setItem(
            "chemistboys_orders",
            JSON.stringify(existingOrders)
        );

    } catch (error) {

        console.error("Local order save error:", error);
    }
}


// ======================================================
// SAVE ORDER TO FIRESTORE
// ======================================================

async function saveOrderToFirestore(order) {

    try {

        await addDoc(
            collection(db, "orders"),
            {
                ...order,
                createdAt: serverTimestamp()
            }
        );

        return true;

    } catch (error) {

        console.error("Firestore order error:", error);

        showMessage(
            "Unable to place order. Please try again.",
            "error"
        );

        return false;
    }
}


// ======================================================
// LOAD CHECKOUT
// ======================================================

function loadCheckout() {

    const cart = getCart();

    if (!checkoutItems) {
        return;
    }

    if (cart.length === 0) {

        checkoutItems.innerHTML = `
            <div class="empty-box">
                Your cart is empty.
            </div>
        `;

        updateTotals([]);

        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
        }

        return;
    }

    if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
    }

    renderCheckoutItems(cart);

    updateTotals(cart);
}


// ======================================================
// RENDER CHECKOUT ITEMS
// ======================================================

function renderCheckoutItems(cart) {

    checkoutItems.innerHTML = "";

    cart.forEach((item) => {

        const quantity =
            Number(item.quantity || item.qty || 1);

        const price =
            Number(item.price || 0);

        const itemTotal =
            price * quantity;

        const itemName =
            escapeHTML(item.name || "Product");

        checkoutItems.innerHTML += `

            <div class="checkout-item">

                <div class="checkout-item-info">

                    <strong>
                        ${itemName}
                    </strong>

                    <span>
                        ₹${price} × ${quantity}
                    </span>

                </div>

                <strong>
                    ₹${itemTotal}
                </strong>

            </div>

        `;
    });
}


// ======================================================
// UPDATE TOTALS
// ======================================================

function updateTotals(cart) {

    let subtotal = 0;

    cart.forEach((item) => {

        const quantity =
            Number(item.quantity || item.qty || 1);

        const price =
            Number(item.price || 0);

        subtotal += price * quantity;
    });


    // Free delivery
    const deliveryCharge = 0;

    const grandTotal =
        subtotal + deliveryCharge;


    if (subtotalElement) {
        subtotalElement.textContent =
            `₹${subtotal}`;
    }

    if (deliveryChargeElement) {
        deliveryChargeElement.textContent =
            `₹${deliveryCharge}`;
    }

    if (grandTotalElement) {
        grandTotalElement.textContent =
            `₹${grandTotal}`;
    }
}


// ======================================================
// VALIDATE CUSTOMER DETAILS
// ======================================================

function validateCustomerDetails() {

    const name =
        customerName?.value.trim();

    const email =
        customerEmail?.value.trim();

    const phone =
        customerPhone?.value.trim();

    const address =
        customerAddress?.value.trim();

    const city =
        customerCity?.value.trim();

    const pincode =
        customerPincode?.value.trim();


    if (!name) {

        showMessage(
            "Please enter your name.",
            "error"
        );

        customerName?.focus();

        return false;
    }


    if (!email) {

        showMessage(
            "Please enter your email.",
            "error"
        );

        customerEmail?.focus();

        return false;
    }


    if (!phone) {

        showMessage(
            "Please enter your phone number.",
            "error"
        );

        customerPhone?.focus();

        return false;
    }


    if (!/^[0-9]{10}$/.test(phone)) {

        showMessage(
            "Please enter a valid 10-digit phone number.",
            "error"
        );

        customerPhone?.focus();

        return false;
    }


    if (!address) {

        showMessage(
            "Please enter your delivery address.",
            "error"
        );

        customerAddress?.focus();

        return false;
    }


    if (!city) {

        showMessage(
            "Please enter your city.",
            "error"
        );

        customerCity?.focus();

        return false;
    }


    if (!pincode) {

        showMessage(
            "Please enter your pincode.",
            "error"
        );

        customerPincode?.focus();

        return false;
    }


    if (!/^[0-9]{6}$/.test(pincode)) {

        showMessage(
            "Please enter a valid 6-digit pincode.",
            "error"
        );

        customerPincode?.focus();

        return false;
    }


    return true;
}


// ======================================================
// GENERATE ORDER ID
// ======================================================

function generateOrderId() {

    const randomNumber =
        Math.floor(
            100000000 +
            Math.random() * 900000000
        );

    return `CB${randomNumber}`;
}


// ======================================================
// GET SELECTED PAYMENT METHOD
// ======================================================

function getSelectedPaymentMethod() {

    if (!paymentMethod) {
        return "cod";
    }

    return (
        paymentMethod.value ||
        "cod"
    ).toLowerCase();
}


// ======================================================
// CREATE UPI LINK
// ======================================================

function createUPILink(order) {

    const amount =
        Number(order.total || 0).toFixed(2);

    const transactionNote =
        encodeURIComponent(
            `ChemistBoys Order ${order.id}`
        );

    const payeeName =
        encodeURIComponent("ChemistBoys");

    return (
        `upi://pay` +
        `?pa=${encodeURIComponent(UPI_ID)}` +
        `&pn=${payeeName}` +
        `&tn=${transactionNote}` +
        `&am=${amount}` +
        `&cu=INR` +
        `&tr=${encodeURIComponent(order.id)}`
    );
}


// ======================================================
// PLACE ORDER
// ======================================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ------------------------------------------
            // AUTH CHECK
            // ------------------------------------------

            const authenticated =
                await waitForAuthentication();

            if (!authenticated) {
                return;
            }


            // ------------------------------------------
            // CUSTOMER VALIDATION
            // ------------------------------------------

            if (!validateCustomerDetails()) {
                return;
            }


            // ------------------------------------------
            // CART
            // ------------------------------------------

            const cart = getCart();

            if (cart.length === 0) {

                showMessage(
                    "Your cart is empty.",
                    "error"
                );

                return;
            }


            // ------------------------------------------
            // PAYMENT METHOD
            // ------------------------------------------

            const selectedPayment =
                getSelectedPaymentMethod();


            // ------------------------------------------
            // TOTAL
            // ------------------------------------------

            let subtotal = 0;

            const orderItems =
                cart.map((item) => {

                    const quantity =
                        Number(
                            item.quantity ||
                            item.qty ||
                            1
                        );

                    const price =
                        Number(item.price || 0);

                    const itemTotal =
                        price * quantity;

                    subtotal += itemTotal;

                    return {

                        id:
                            item.id ??
                            null,

                        name:
                            item.name ||
                            "Product",

                        price:
                            price,

                        quantity:
                            quantity,

                        image:
                            item.image ||
                            ""
                    };
                });


            const deliveryCharge = 0;

            const total =
                subtotal + deliveryCharge;


            // ------------------------------------------
            // ORDER ID
            // ------------------------------------------

            const orderId =
                generateOrderId();


            // ------------------------------------------
            // DATE / TIME
            // ------------------------------------------

            const now = new Date();


            // ------------------------------------------
            // PAYMENT STATUS
            // ------------------------------------------

            let paymentStatus =
                "Pending";


            if (
                selectedPayment === "cod"
            ) {

                paymentStatus =
                    "Cash on Delivery - Pending";

            } else if (
                selectedPayment === "upi" ||
                selectedPayment === "online"
            ) {

                paymentStatus =
                    "UPI - Pending";
            }


            // ------------------------------------------
            // ORDER OBJECT
            // ------------------------------------------

            const order = {

                id:
                    orderId,

                orderId:
                    orderId,

                userId:
                    auth.currentUser.uid,

                customerName:
                    customerName.value.trim(),

                email:
                    customerEmail.value.trim(),

                phone:
                    customerPhone.value.trim(),

                address:
                    customerAddress.value.trim(),

                city:
                    customerCity.value.trim(),

                pincode:
                    customerPincode.value.trim(),

                paymentMethod:
                    selectedPayment,

                paymentStatus:
                    paymentStatus,

                items:
                    orderItems,

                total:
                    total,

                subtotal:
                    subtotal,

                deliveryCharge:
                    deliveryCharge,

                orderDate:
                    now.toLocaleDateString("en-IN"),

                orderTime:
                    now.toLocaleTimeString("en-IN"),

                orderDateISO:
                    now.toISOString(),

                status:
                    "Processing"

                // IMPORTANT:
                // deliveryDate is NOT created here.
                // Admin will add it after accepting the order.
            };


            // ------------------------------------------
            // DISABLE BUTTON
            // ------------------------------------------

            if (placeOrderBtn) {

                placeOrderBtn.disabled = true;

                placeOrderBtn.textContent =
                    "Placing Order...";
            }


            try {

                // --------------------------------------
                // SAVE TO FIRESTORE
                // --------------------------------------

                const saved =
                    await saveOrderToFirestore(order);


                if (!saved) {

                    throw new Error(
                        "Order could not be saved."
                    );
                }


                // --------------------------------------
                // SAVE LOCAL COPY
                // --------------------------------------

                saveLocalOrder(order);


                // --------------------------------------
                // CLEAR CART
                // --------------------------------------

                localStorage.removeItem(
                    CART_KEY
                );

                localStorage.removeItem(
                    OLD_CART_KEY
                );


                // ==================================================
                // COD
                // ==================================================

                if (
                    selectedPayment === "cod"
                ) {

                    showMessage(
                        "Order placed successfully! Payment will be collected on delivery.",
                        "success"
                    );


                    // NO UPI REDIRECT HERE
                    // COD stays on the website.


                    setTimeout(() => {

                        window.location.href =
                            "orders.html";

                    }, 1500);

                    return;
                }


                // ==================================================
                // UPI / ONLINE
                // ==================================================

                if (
                    selectedPayment === "upi" ||
                    selectedPayment === "online"
                ) {

                    showMessage(
                        "Order placed! Opening UPI for payment...",
                        "success"
                    );


                    const upiLink =
                        createUPILink(order);


                    setTimeout(() => {

                        window.location.href =
                            upiLink;

                    }, 500);

                    return;
                }


                // ==================================================
                // UNKNOWN PAYMENT METHOD
                // ==================================================

                showMessage(
                    "Order placed successfully.",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "orders.html";

                }, 1500);


            } catch (error) {

                console.error(
                    "Order placement error:",
                    error
                );


                showMessage(
                    "Something went wrong while placing your order. Please try again.",
                    "error"
                );


                if (placeOrderBtn) {

                    placeOrderBtn.disabled = false;

                    placeOrderBtn.textContent =
                        "Place Order";
                }
            }
        }
    );
}


// ======================================================
// STORAGE CHANGE
// ======================================================

window.addEventListener(
    "storage",
    () => {

        loadCheckout();

    }
);


// ======================================================
// POPUP MESSAGE
// ======================================================

function showMessage(
    message,
    type = "success"
) {

    let messageBox =
        document.getElementById(
            "checkoutMessage"
        );


    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.id =
            "checkoutMessage";

        messageBox.style.position =
            "fixed";

        messageBox.style.top =
            "20px";

        messageBox.style.right =
            "20px";

        messageBox.style.zIndex =
            "99999";

        messageBox.style.padding =
            "14px 20px";

        messageBox.style.borderRadius =
            "10px";

        messageBox.style.fontWeight =
            "700";

        messageBox.style.maxWidth =
            "350px";

        messageBox.style.boxShadow =
            "0 8px 25px rgba(0,0,0,0.15)";

        document.body.appendChild(
            messageBox
        );
    }


    messageBox.textContent =
        message;


    if (type === "error") {

        messageBox.style.background =
            "#dc3545";

        messageBox.style.color =
            "#ffffff";

    } else {

        messageBox.style.background =
            "#0f766e";

        messageBox.style.color =
            "#ffffff";
    }


    messageBox.style.display =
        "block";


    clearTimeout(
        window.checkoutMessageTimer
    );


    window.checkoutMessageTimer =
        setTimeout(() => {

            messageBox.style.display =
                "none";

        }, 3500);
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// INITIAL LOAD
// ======================================================

(async function initializeCheckout() {

    const authenticated =
        await waitForAuthentication();

    if (!authenticated) {
        return;
    }

    loadCheckout();

})();