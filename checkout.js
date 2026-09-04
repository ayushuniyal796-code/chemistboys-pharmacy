import {
    auth,
    authReady,
    db
} from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ========================================
// ELEMENTS
// ========================================

const checkoutForm =
    document.getElementById("checkoutForm");

const customerName =
    document.getElementById("customerName");

const customerEmail =
    document.getElementById("customerEmail");

const customerPhone =
    document.getElementById("customerPhone");

const customerAddress =
    document.getElementById("customerAddress");

const customerCity =
    document.getElementById("customerCity");

const customerPincode =
    document.getElementById("customerPincode");

const paymentMethod =
    document.getElementById("paymentMethod");

const checkoutItems =
    document.getElementById("checkoutItems");

const subtotalElement =
    document.getElementById("subtotal");

const deliveryChargeElement =
    document.getElementById("deliveryCharge");

const grandTotalElement =
    document.getElementById("grandTotal");

const placeOrderBtn =
    document.getElementById("placeOrderBtn");


// ========================================
// CART KEY
// ========================================

const CART_KEY =
    "chemistboys_cart";

const OLD_CART_KEY =
    "chemistCart";


// ========================================
// UPI ID
// ========================================

const UPI_ID =
    "ayushuniyal.cyberlab@fam";


// ========================================
// CART
// ========================================

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


    // Old key support
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
// INITIAL AUTH CHECK
// ========================================

await authReady;


if (!auth.currentUser) {

    window.location.href =
        "auth.html";

}


// ========================================
// AUTH STATE
// ========================================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "auth.html";

            return;

        }


        // Fill logged-in user's details
        if (customerName) {

            customerName.value =
                user.displayName || "";

        }


        if (customerEmail) {

            customerEmail.value =
                user.email || "";

        }


        loadCheckout();

    }
);


// ========================================
// LOAD CHECKOUT
// ========================================

function loadCheckout() {

    const cart =
        getCart();


    if (cart.length === 0) {

        showEmptyCart();

        return;

    }


    renderCheckoutItems(
        cart
    );

}


// ========================================
// RENDER ITEMS
// ========================================

function renderCheckoutItems(
    cart
) {

    checkoutItems.innerHTML =
        "";


    let subtotal = 0;

    let totalQuantity = 0;


    cart.forEach(
        (item) => {

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


            const itemTotal =
                price * quantity;


            subtotal +=
                itemTotal;


            totalQuantity +=
                quantity;


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "checkout-item";


            itemElement.innerHTML = `

                <div>

                    <div class="checkout-item-name">

                        ${escapeHTML(name)}

                    </div>


                    <div class="checkout-item-quantity">

                        Quantity:
                        ${quantity}

                    </div>

                </div>


                <div class="checkout-item-price">

                    ₹${itemTotal.toFixed(2)}

                </div>

            `;


            checkoutItems.appendChild(
                itemElement
            );

        }
    );


    // Delivery is FREE
    const deliveryCharge =
        0;


    const grandTotal =
        subtotal +
        deliveryCharge;


    subtotalElement.textContent =
        `₹${subtotal.toFixed(2)}`;


    deliveryChargeElement.textContent =
        "FREE";


    grandTotalElement.textContent =
        `₹${grandTotal.toFixed(2)}`;


    // Store values for order
    checkoutForm.dataset.subtotal =
        subtotal.toString();


    checkoutForm.dataset.total =
        grandTotal.toString();


    checkoutForm.dataset.quantity =
        totalQuantity.toString();

}


// ========================================
// EMPTY CART
// ========================================

function showEmptyCart() {

    checkoutItems.innerHTML = `

        <div class="empty-cart">

            <div class="empty-cart-icon">
                🛒
            </div>

            <h2>
                Your Cart is Empty
            </h2>

            <p>
                Please add some products
                before placing an order.
            </p>

            <a
                href="index.html"
                class="continue-shopping"
            >
                🛍️ Continue Shopping
            </a>

        </div>

    `;


    subtotalElement.textContent =
        "₹0";


    deliveryChargeElement.textContent =
        "FREE";


    grandTotalElement.textContent =
        "₹0";


    if (placeOrderBtn) {

        placeOrderBtn.disabled =
            true;

    }

}


// ========================================
// PLACE ORDER
// ========================================

checkoutForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // ====================================
        // AUTH CHECK
        // ====================================

        if (!auth.currentUser) {

            window.location.href =
                "auth.html";

            return;

        }


        // ====================================
        // CART CHECK
        // ====================================

        const cart =
            getCart();


        if (cart.length === 0) {

            showMessage(
                "Your cart is empty.",
                "error"
            );

            return;

        }


        // ====================================
        // FORM VALIDATION
        // ====================================

        const name =
            customerName.value.trim();

        const email =
            customerEmail.value.trim();

        const phone =
            customerPhone.value.trim();

        const address =
            customerAddress.value.trim();

        const city =
            customerCity.value.trim();

        const pincode =
            customerPincode.value.trim();

        const selectedPayment =
            paymentMethod.value;


        if (!name) {

            showMessage(
                "Please enter your name.",
                "error"
            );

            customerName.focus();

            return;

        }


        if (!email) {

            showMessage(
                "Please enter your email.",
                "error"
            );

            customerEmail.focus();

            return;

        }


        if (!/^\d{10}$/.test(phone)) {

            showMessage(
                "Please enter a valid 10-digit mobile number.",
                "error"
            );

            customerPhone.focus();

            return;

        }


        if (!address) {

            showMessage(
                "Please enter your delivery address.",
                "error"
            );

            customerAddress.focus();

            return;

        }


        if (!city) {

            showMessage(
                "Please enter your city.",
                "error"
            );

            customerCity.focus();

            return;

        }


        if (!/^\d{6}$/.test(pincode)) {

            showMessage(
                "Please enter a valid 6-digit pincode.",
                "error"
            );

            customerPincode.focus();

            return;

        }


        if (!selectedPayment) {

            showMessage(
                "Please select a payment method.",
                "error"
            );

            paymentMethod.focus();

            return;

        }


        // ====================================
        // PREVENT DOUBLE CLICK
        // ====================================

        placeOrderBtn.disabled =
            true;

        placeOrderBtn.textContent =
            "Placing Order...";


        try {

            // =================================
            // PREPARE ITEMS
            // =================================

            const orderItems =
                cart.map(
                    (item) => {

                        return {

                            name:
                                item.name ||
                                item.productName ||
                                "Product",

                            price:
                                Number(
                                    item.price ??
                                    item.productPrice
                                ) || 0,

                            quantity:
                                Number(
                                    item.quantity ??
                                    item.qty
                                ) || 1

                        };

                    }
                );


            // =================================
            // TOTAL
            // =================================

            const total =
                orderItems.reduce(
                    (
                        sum,
                        item
                    ) => {

                        return (
                            sum +
                            item.price *
                            item.quantity
                        );

                    },
                    0
                );


            // =================================
            // ORDER OBJECT
            // =================================

            const order = {

                id:
                    generateOrderId(),

                userId:
                    auth.currentUser.uid,

                customerName:
                    name,

                email:
                    email,

                phone:
                    phone,

                address:
                    address,

                city:
                    city,

                pincode:
                    pincode,

                paymentMethod:
                    selectedPayment,

                paymentStatus:
                    selectedPayment === "cod"
                        ? "Cash on Delivery - Pending"
                        : "UPI - Pending",

                items:
                    orderItems,

                total:
                    total,

                orderDate:
                    new Date()
                        .toLocaleDateString(
                            "en-IN"
                        ),

                orderTime:
                    new Date()
                        .toLocaleTimeString(
                            "en-IN"
                        ),

                orderDateISO:
                    new Date()
                        .toISOString(),

                status:
                    "Processing"

                /*
                    IMPORTANT:

                    deliveryDate intentionally
                    NOT included here.

                    Admin will choose it later.
                */

            };


            // =================================
            // SAVE ORDER
            // =================================

            await saveOrderToFirestore(
                order
            );


            // =================================
            // SAVE LOCAL COPY
            // =================================

            saveLocalOrder(
                order
            );


            // =================================
            // CLEAR CART
            // =================================

            localStorage.removeItem(
                CART_KEY
            );

            localStorage.removeItem(
                OLD_CART_KEY
            );


            // =================================
            // PAYMENT
            // =================================

            if (
                selectedPayment === "online" ||
                selectedPayment === "upi"
            ) {

                showUPIPopup(
                    order
                );

            }

            else {

                showSuccessMessage(
                    order
                );

            }

        }

        catch (error) {

            console.error(
                "Place Order Error:",
                error
            );


            showMessage(
                "Order place nahi ho paya. Please try again.",
                "error"
            );


            placeOrderBtn.disabled =
                false;


            placeOrderBtn.textContent =
                "✅ Place Order";

        }

    }
);


// ========================================
// SAVE ORDER FIRESTORE
// ========================================

async function saveOrderToFirestore(
    order
) {

    await addDoc(

        collection(
            db,
            "orders"
        ),

        {

            ...order,

            createdAt:
                serverTimestamp()

        }

    );

}


// ========================================
// LOCAL ORDER
// ========================================

function saveLocalOrder(
    order
) {

    try {

        const existing =
            JSON.parse(
                localStorage.getItem(
                    "chemistboys_orders"
                ) || "[]"
            );


        const orders =
            Array.isArray(existing)
                ? existing
                : [];


        orders.unshift(
            order
        );


        localStorage.setItem(

            "chemistboys_orders",

            JSON.stringify(
                orders
            )

        );

    }

    catch (error) {

        console.error(
            "Local order save error:",
            error
        );

    }

}


// ========================================
// ORDER ID
// ========================================

function generateOrderId() {

    const randomNumber =
        Math.floor(
            100000000 +
            Math.random() *
            900000000
        );


    return (
        "CB" +
        randomNumber
    );

}


// ========================================
// UPI POPUP
// ========================================

function showUPIPopup(
    order
) {

    const popup =
        document.createElement(
            "div"
        );


    popup.style.cssText = `

        position:fixed;
        inset:0;
        z-index:99999;

        display:flex;
        align-items:center;
        justify-content:center;

        padding:20px;

        background:
            rgba(0,40,35,.60);

        backdrop-filter:
            blur(5px);

    `;


    popup.innerHTML = `

        <div style="

            width:100%;
            max-width:430px;

            box-sizing:border-box;

            background:white;

            padding:30px;

            border-radius:22px;

            text-align:center;

            box-shadow:
                0 25px 70px
                rgba(0,0,0,.25);

        ">


            <div style="
                font-size:50px;
                margin-bottom:10px;
            ">
                💳
            </div>


            <h2 style="
                color:#075f55;
                margin:0 0 10px;
            ">
                UPI Payment
            </h2>


            <p style="
                color:#526d69;
                margin-bottom:20px;
            ">
                Please complete the payment
                using the UPI ID below.
            </p>


            <div style="

                background:#edf9f6;

                padding:15px;

                border-radius:12px;

                margin-bottom:15px;

            ">

                <strong>
                    UPI ID
                </strong>

                <br>

                <span style="
                    color:#087c6b;
                    font-weight:800;
                    word-break:break-all;
                ">
                    ${escapeHTML(UPI_ID)}
                </span>

            </div>


            <div style="

                background:#f7fbfa;

                padding:15px;

                border-radius:12px;

                margin-bottom:20px;

            ">

                <strong>
                    Amount
                </strong>

                <br>

                <span style="
                    color:#075f55;
                    font-size:24px;
                    font-weight:900;
                ">
                    ₹${Number(
                        order.total
                    ).toFixed(2)}
                </span>

            </div>


            <p style="
                color:#718987;
                font-size:13px;
                margin-bottom:20px;
            ">

                Your order has been received
                and is currently being processed.

            </p>


            <button
                type="button"
                id="closeUPIPopup"
                style="

                    width:100%;

                    border:none;

                    padding:14px;

                    border-radius:11px;

                    background:#0ca88f;

                    color:white;

                    font-size:16px;

                    font-weight:800;

                    cursor:pointer;

                "
            >
                Continue
            </button>


        </div>

    `;


    document.body.appendChild(
        popup
    );


    const closeButton =
        popup.querySelector(
            "#closeUPIPopup"
        );


    closeButton.addEventListener(
        "click",
        () => {

            popup.remove();

            showSuccessMessage(
                order
            );

        }
    );

}


// ========================================
// SUCCESS MESSAGE
// ========================================

function showSuccessMessage(
    order
) {

    const overlay =
        document.createElement(
            "div"
        );


    overlay.style.cssText = `

        position:fixed;
        inset:0;
        z-index:99998;

        display:flex;
        align-items:center;
        justify-content:center;

        padding:20px;

        background:
            rgba(0,40,35,.55);

        backdrop-filter:
            blur(5px);

    `;


    overlay.innerHTML = `

        <div style="

            width:100%;
            max-width:430px;

            box-sizing:border-box;

            background:white;

            padding:32px;

            border-radius:22px;

            text-align:center;

            box-shadow:
                0 25px 70px
                rgba(0,0,0,.25);

        ">


            <div style="
                font-size:55px;
                margin-bottom:10px;
            ">
                ✅
            </div>


            <h2 style="
                color:#075f55;
                margin:0 0 10px;
            ">
                Order Placed Successfully!
            </h2>


            <p style="
                color:#526d69;
                margin-bottom:8px;
            ">
                Your Order ID
            </p>


            <strong style="
                color:#087c6b;
                font-size:20px;
            ">
                #${escapeHTML(order.id)}
            </strong>


            <p style="
                color:#718987;
                margin-top:20px;
                line-height:1.6;
            ">
                Your order is currently
                <strong>
                    Processing
                </strong>.
                Delivery date will be
                confirmed after the order
                is accepted.
            </p>


            <div style="
                display:flex;
                gap:10px;
                margin-top:25px;
                flex-direction:column;
            ">


                <a
                    href="orders.html"
                    style="

                        display:block;

                        padding:13px;

                        border-radius:11px;

                        background:#0ca88f;

                        color:white;

                        text-decoration:none;

                        font-weight:800;

                    "
                >
                    📦 View My Orders
                </a>


                <a
                    href="index.html"
                    style="

                        display:block;

                        padding:13px;

                        border-radius:11px;

                        background:#eef3f2;

                        color:#526d69;

                        text-decoration:none;

                        font-weight:800;

                    "
                >
                    🏠 Continue Shopping
                </a>

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );

}


// ========================================
// MESSAGE
// ========================================

function showMessage(
    message,
    type = "error"
) {

    const existing =
        document.getElementById(
            "checkoutMessage"
        );


    if (existing) {

        existing.remove();

    }


    const messageBox =
        document.createElement(
            "div"
        );


    messageBox.id =
        "checkoutMessage";


    messageBox.textContent =
        message;


    messageBox.style.cssText = `

        position:fixed;

        top:20px;
        left:50%;

        transform:
            translateX(-50%);

        z-index:100000;

        max-width:90%;

        padding:13px 20px;

        border-radius:12px;

        font-weight:700;

        box-shadow:
            0 8px 25px
            rgba(0,0,0,.15);

        background:
            ${type === "success"
                ? "#dff8f3"
                : "#f8d7da"};

        color:
            ${type === "success"
                ? "#087c6b"
                : "#b42318"};

    `;


    document.body.appendChild(
        messageBox
    );


    setTimeout(
        () => {

            messageBox.remove();

        },
        3500
    );

}


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