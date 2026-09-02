/* =========================================================
   CHEMISTBOYS - CHECKOUT
   Cart Total + Place Order + Success Animation + Sound
========================================================= */

import { auth, authReady } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const CART_KEY = "chemistboys_cart";
const OLD_CART_KEY = "chemistCart";

let currentUser = null;


/* =========================================================
   GET CART
========================================================= */

function getCart() {

    try {

        let data =
            localStorage.getItem(CART_KEY);

        /* Support old cart data */
        if (!data) {
            data =
                localStorage.getItem(OLD_CART_KEY);
        }

        if (!data) {
            return [];
        }

        const cart =
            JSON.parse(data);

        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

        return [];

    }

}


/* =========================================================
   FIND PRODUCT
========================================================= */

function findProduct(id) {

    const products =
        Array.isArray(window.products)
            ? window.products
            : [];

    return products.find(product =>
        String(product.id) === String(id)
    );

}


/* =========================================================
   GET CORRECT PRICE
========================================================= */

function getPrice(item) {

    const product =
        findProduct(item.id);

    const cartPrice =
        Number(item.price);

    if (
        Number.isFinite(cartPrice) &&
        cartPrice > 0
    ) {

        return cartPrice;

    }

    if (
        product &&
        Number(product.price) > 0
    ) {

        return Number(product.price);

    }

    return 0;

}


/* =========================================================
   DISPLAY USER DETAILS
========================================================= */

function fillUserDetails() {

    if (!currentUser) {
        return;
    }

    const name =
        currentUser.displayName ||
        currentUser.email ||
        "User";

    const email =
        currentUser.email ||
        "";

    const nameInput =
        document.getElementById(
            "customerName"
        );

    const emailInput =
        document.getElementById(
            "customerEmail"
        );

    if (
        nameInput &&
        !nameInput.value
    ) {

        nameInput.value = name;

    }

    if (
        emailInput &&
        !emailInput.value
    ) {

        emailInput.value = email;

    }

}


/* =========================================================
   RENDER CHECKOUT CART
========================================================= */

function renderCheckoutCart() {

    const container =
        document.getElementById(
            "checkoutItems"
        );

    const subtotalElement =
        document.getElementById(
            "subtotal"
        );

    const totalElement =
        document.getElementById(
            "grandTotal"
        );

    const deliveryElement =
        document.getElementById(
            "deliveryCharge"
        );


    if (!container) {
        return;
    }


    const cart =
        getCart();


    if (cart.length === 0) {

        container.innerHTML = `
            <div style="
                text-align:center;
                padding:20px;
                color:#666;
            ">
                🛒 Your cart is empty
            </div>
        `;

        if (subtotalElement) {
            subtotalElement.textContent = "₹0";
        }

        if (totalElement) {
            totalElement.textContent = "₹0";
        }

        if (deliveryElement) {
            deliveryElement.textContent = "FREE";
        }

        return;

    }


    let subtotal = 0;


    container.innerHTML =
        cart.map(item => {

            const price =
                getPrice(item);

            const quantity =
                Math.max(
                    1,
                    Number(item.quantity) || 1
                );

            const itemTotal =
                price * quantity;

            subtotal += itemTotal;


            return `
                <div class="checkout-item">

                    <div>

                        <div class="checkout-item-name">
                            ${item.name || "Medicine"}
                        </div>

                        <div class="checkout-item-quantity">
                            Quantity: ${quantity}
                        </div>

                    </div>

                    <div class="checkout-item-price">
                        ₹${itemTotal}
                    </div>

                </div>
            `;

        }).join("");


    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${subtotal}`;

    }


    if (deliveryElement) {

        deliveryElement.textContent =
            "FREE";

    }


    if (totalElement) {

        totalElement.textContent =
            `₹${subtotal}`;

    }

}


/* =========================================================
   SUCCESS SOUND
========================================================= */

function playSuccessSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        const audio =
            new AudioContext();

        const oscillator =
            audio.createOscillator();

        const gain =
            audio.createGain();


        oscillator.type =
            "sine";

        oscillator.frequency.setValueAtTime(
            523.25,
            audio.currentTime
        );

        oscillator.frequency.setValueAtTime(
            659.25,
            audio.currentTime + 0.12
        );

        oscillator.frequency.setValueAtTime(
            783.99,
            audio.currentTime + 0.24
        );


        gain.gain.setValueAtTime(
            0.0001,
            audio.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.25,
            audio.currentTime + 0.03
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audio.currentTime + 0.55
        );


        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start();

        oscillator.stop(
            audio.currentTime + 0.55
        );

    } catch (error) {

        console.log(
            "Success sound unavailable"
        );

    }

}


/* =========================================================
   SUCCESS SCREEN
========================================================= */

function showOrderSuccess(orderId) {

    const overlay =
        document.createElement("div");

    overlay.id =
        "orderSuccessOverlay";


    overlay.innerHTML = `

        <div class="success-box">

            <div class="success-circle">
                ✓
            </div>

            <h1>
                Order Placed Successfully!
            </h1>

            <p>
                Your order has been placed successfully.
            </p>

            <div class="success-order-id">
                Order #${orderId}
            </div>

            <button
                id="successContinueBtn"
                type="button"
            >
                📦 View My Orders
            </button>

        </div>

    `;


    const style =
        document.createElement("style");

    style.textContent = `

        #orderSuccessOverlay {

            position: fixed;
            inset: 0;

            background:
                rgba(0, 70, 60, 0.72);

            display: flex;
            align-items: center;
            justify-content: center;

            z-index: 999999;

            animation:
                successFadeIn 0.25s ease;

            padding: 20px;

        }


        .success-box {

            background: white;

            width: min(
                430px,
                100%
            );

            text-align: center;

            border-radius: 24px;

            padding: 40px 25px;

            box-shadow:
                0 20px 60px
                rgba(0,0,0,0.25);

            animation:
                successPop 0.4s ease;

        }


        .success-circle {

            width: 95px;
            height: 95px;

            margin:
                0 auto 20px;

            border-radius: 50%;

            background: #16b79d;

            color: white;

            display: flex;

            align-items: center;
            justify-content: center;

            font-size: 65px;

            font-weight: 800;

            box-shadow:
                0 10px 30px
                rgba(22,183,157,0.35);

            animation:
                tickPop 0.55s
                cubic-bezier(.17,.67,.3,1.4);

        }


        .success-box h1 {

            color: #075f55;

            font-size: 27px;

            margin:
                10px 0;

        }


        .success-box p {

            color: #627875;

            font-size: 15px;

        }


        .success-order-id {

            margin:
                18px 0;

            padding: 12px;

            background: #eefaf7;

            border-radius: 10px;

            color: #087c6b;

            font-weight: 700;

        }


        #successContinueBtn {

            width: 100%;

            border: none;

            padding: 14px;

            border-radius: 12px;

            background: #0ca88f;

            color: white;

            font-size: 16px;

            font-weight: 700;

            cursor: pointer;

        }


        #successContinueBtn:hover {

            background: #087c6b;

        }


        @keyframes successFadeIn {

            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }

        }


        @keyframes successPop {

            from {

                transform:
                    scale(0.75);

                opacity: 0;

            }

            to {

                transform:
                    scale(1);

                opacity: 1;

            }

        }


        @keyframes tickPop {

            0% {
                transform: scale(0);
            }

            70% {
                transform: scale(1.12);
            }

            100% {
                transform: scale(1);
            }

        }

    `;


    document.head.appendChild(style);

    document.body.appendChild(
        overlay
    );


    playSuccessSound();


    document
        .getElementById(
            "successContinueBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "orders.html";

            }
        );

}


/* =========================================================
   GENERATE ORDER ID
========================================================= */

function generateOrderId() {

    return (
        "CB" +
        Date.now()
            .toString()
            .slice(-8)
    );

}


/* =========================================================
   GET AUTOMATIC DELIVERY DATE
========================================================= */

function getDeliveryDate() {

    const date =
        new Date();

    date.setDate(
        date.getDate() + 3
    );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   PLACE ORDER
========================================================= */

async function placeOrder(event) {

    event.preventDefault();


    await authReady;


    if (!auth.currentUser) {

        window.location.href =
            "login.html";

        return;

    }


    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    const form =
        document.getElementById(
            "checkoutForm"
        );


    if (!form.checkValidity()) {

        form.reportValidity();

        return;

    }


    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        )?.value;


    if (!paymentMethod) {

        document
            .getElementById(
                "paymentMethod"
            )
            ?.focus();

        return;

    }


    let total = 0;


    const orderItems =
        cart.map(item => {

            const price =
                getPrice(item);

            const quantity =
                Math.max(
                    1,
                    Number(item.quantity) || 1
                );

            total +=
                price * quantity;


            return {

                id: item.id,

                name: item.name,

                price: price,

                quantity: quantity,

                image: item.image

            };

        });


    if (total <= 0) {

        alert(
            "Unable to calculate cart total."
        );

        return;

    }


    const orderId =
        generateOrderId();


    const now =
        new Date();


    const order = {

        id: orderId,

        userId:
            auth.currentUser.uid,

        customerName:
            document.getElementById(
                "customerName"
            )?.value.trim(),

        phone:
            document.getElementById(
                "customerPhone"
            )?.value.trim(),

        address:
            document.getElementById(
                "customerAddress"
            )?.value.trim(),

        city:
            document.getElementById(
                "customerCity"
            )?.value.trim(),

        pincode:
            document.getElementById(
                "customerPincode"
            )?.value.trim(),

        paymentMethod:
            paymentMethod,

        paymentStatus:
            paymentMethod === "cod"
                ? "Pending"
                : "Pending",

        items:
            orderItems,

        total:
            total,

        orderDate:
            now.toLocaleDateString(
                "en-IN"
            ),

        orderTime:
            now.toLocaleTimeString(
                "en-IN"
            ),

        orderDateISO:
            now.toISOString(),

        deliveryDate:
            getDeliveryDate(),

        status:
            "Processing"

    };


    /* =====================================================
       SAVE ORDER
    ===================================================== */

    const orders =
        JSON.parse(
            localStorage.getItem(
                "orders"
            )
        ) || [];


    orders.push(order);


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );


    /* =====================================================
       CLEAR CART
    ===================================================== */

    localStorage.removeItem(
        CART_KEY
    );

    localStorage.removeItem(
        OLD_CART_KEY
    );


    /* =====================================================
       SHOW SUCCESS
    ===================================================== */

    showOrderSuccess(
        orderId
    );

}


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        currentUser = user;

        if (user) {

            fillUserDetails();

        }

    }
);


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await authReady;

        if (!auth.currentUser) {

            window.location.href =
                "login.html";

            return;

        }

        currentUser =
            auth.currentUser;

        fillUserDetails();

        renderCheckoutCart();


        const form =
            document.getElementById(
                "checkoutForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                placeOrder
            );

        }

    }
);