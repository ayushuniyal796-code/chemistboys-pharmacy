/* CHEMISTBOYS - CHECKOUT + FAMPAY UPI */

import { auth, authReady } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const CART_KEY = "chemistboys_cart";
const OLD_CART_KEY = "chemistCart";


// Tumhari FamPay UPI ID
const UPI_ID =
    "ayushuniyal.cyberlab@fam";


let currentUser = null;



// ================= CART =================

function getCart() {

    try {

        const data =
            localStorage.getItem(CART_KEY) ||
            localStorage.getItem(OLD_CART_KEY);

        if (!data)
            return [];

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



// ================= PRODUCT PRICE =================

function findProduct(id) {

    const products =
        Array.isArray(window.products)
            ? window.products
            : [];

    return products.find(
        product =>
            String(product.id) === String(id)
    );
}


function getPrice(item) {

    const cartPrice =
        Number(item.price);

    if (
        Number.isFinite(cartPrice) &&
        cartPrice > 0
    ) {

        return cartPrice;
    }


    const product =
        findProduct(item.id);


    if (
        product &&
        Number(product.price) > 0
    ) {

        return Number(product.price);
    }


    return 0;
}



// ================= USER DETAILS =================

function fillUserDetails() {

    if (!currentUser)
        return;


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

        nameInput.value =
            currentUser.displayName ||
            currentUser.email ||
            "";
    }


    if (
        emailInput &&
        !emailInput.value
    ) {

        emailInput.value =
            currentUser.email ||
            "";
    }
}



// ================= SHOW CART =================

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


    if (!container)
        return;


    const cart =
        getCart();


    if (!cart.length) {

        container.innerHTML = `

            <div style="
                text-align:center;
                padding:20px;
                color:#666;
            ">

                🛒 Your cart is empty

            </div>

        `;


        if (subtotalElement)
            subtotalElement.textContent =
                "₹0";


        if (totalElement)
            totalElement.textContent =
                "₹0";


        if (deliveryElement)
            deliveryElement.textContent =
                "FREE";


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


    if (subtotalElement)
        subtotalElement.textContent =
            `₹${subtotal}`;


    if (deliveryElement)
        deliveryElement.textContent =
            "FREE";


    if (totalElement)
        totalElement.textContent =
            `₹${subtotal}`;
}



// ================= ORDER ID =================

function generateOrderId() {

    return "CB" +
        Date.now()
            .toString()
            .slice(-8);
}



// ================= DELIVERY DATE =================

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



// ================= SUCCESS SOUND =================

function playSuccessSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext)
            return;


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

        gain.connect(
            audio.destination
        );


        oscillator.start();

        oscillator.stop(
            audio.currentTime + 0.6
        );

    } catch (error) {

        console.error(
            "Success sound error:",
            error
        );
    }
}



// ================= ORDER SUCCESS =================

function showOrderSuccess(
    orderId,
    paymentStatus
) {

    playSuccessSound();


    const overlay =
        document.createElement("div");


    overlay.id =
        "orderSuccessOverlay";


    overlay.innerHTML = `

        <div class="success-box">

            <div class="success-tick">

                ✓

            </div>


            <h2>
                Order Successful!
            </h2>


            <p>
                Your order has been placed
                successfully.
            </p>


            <p>
                <strong>
                    Order ID:
                </strong>
                ${orderId}
            </p>


            <p>
                <strong>
                    Payment:
                </strong>
                ${paymentStatus}
            </p>


            <button
                id="viewOrdersBtn"
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
                rgba(0,0,0,.65);

            display: flex;

            align-items: center;

            justify-content: center;

            z-index: 2000000;

            padding: 20px;

        }


        .success-box {

            background: white;

            width:
                min(420px,100%);

            padding: 35px 25px;

            border-radius: 22px;

            text-align: center;

            box-shadow:
                0 20px 70px
                rgba(0,0,0,.3);

        }


        .success-tick {

            width: 80px;

            height: 80px;

            margin: 0 auto 15px;

            border-radius: 50%;

            background: #16a34a;

            color: white;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 50px;

            font-weight: bold;

        }


        .success-box h2 {

            color: #15803d;

            margin-bottom: 10px;

        }


        .success-box button {

            width: 100%;

            border: 0;

            border-radius: 10px;

            padding: 14px;

            margin-top: 15px;

            background: #075f55;

            color: white;

            font-size: 16px;

            font-weight: bold;

            cursor: pointer;

        }

    `;


    document.head.appendChild(style);

    document.body.appendChild(
        overlay
    );


    document
        .getElementById(
            "viewOrdersBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "orders.html";

            }
        );
}



// ================= UPI PAYMENT =================

function showUpiPayment(
    total,
    orderData
) {

    const oldOverlay =
        document.getElementById(
            "upiPaymentOverlay"
        );


    if (oldOverlay)
        oldOverlay.remove();


    const transactionNote =
        `ChemistBoys ${orderData.id}`;


    const upiUrl =
        `upi://pay?` +
        `pa=${encodeURIComponent(UPI_ID)}` +
        `&pn=${encodeURIComponent("ChemistBoys")}` +
        `&am=${encodeURIComponent(total.toFixed(2))}` +
        `&cu=INR` +
        `&tn=${encodeURIComponent(transactionNote)}`;


    const overlay =
        document.createElement("div");


    overlay.id =
        "upiPaymentOverlay";


    overlay.innerHTML = `

        <div class="upi-box">

            <button
                class="upi-close"
                id="upiCloseBtn"
                type="button"
            >

                ×

            </button>


            <div class="upi-icon">

                📱

            </div>


            <h2>

                Pay via UPI

            </h2>


            <p>

                Pay

                <strong>
                    ₹${total.toFixed(2)}
                </strong>

                to ChemistBoys

            </p>


            <div class="upi-id-box">

                ${UPI_ID}

            </div>


            <!-- PAY BUTTON -->

            <a
                class="upi-pay-btn"
                href="${upiUrl}"
            >

                💳 Pay ₹${total.toFixed(2)}
                via UPI

            </a>


            <p class="upi-note">

                Your UPI app will open with
                the amount and FamPay UPI ID
                already filled in.

            </p>

        </div>

    `;


    const style =
        document.createElement("style");


    style.textContent = `

        #upiPaymentOverlay {

            position: fixed;

            inset: 0;

            background:
                rgba(0,0,0,.65);

            display: flex;

            align-items: center;

            justify-content: center;

            z-index: 1000000;

            padding: 18px;

        }


        .upi-box {

            position: relative;

            background: white;

            width:
                min(430px,100%);

            border-radius: 22px;

            padding: 30px 22px;

            text-align: center;

            box-shadow:
                0 20px 70px
                rgba(0,0,0,.3);

        }


        .upi-close {

            position: absolute;

            right: 14px;

            top: 10px;

            border: 0;

            background: transparent;

            font-size: 30px;

            cursor: pointer;

            color: #666;

        }


        .upi-icon {

            font-size: 42px;

        }


        .upi-box h2 {

            color: #075f55;

            margin: 8px 0;

        }


        .upi-id-box {

            background: #eefaf7;

            border:
                1px dashed #0ca88f;

            padding: 12px;

            border-radius: 10px;

            margin: 15px 0;

            font-weight: 700;

            color: #087c6b;

            word-break: break-all;

        }


        .upi-pay-btn {

            display: block;

            width: 100%;

            box-sizing: border-box;

            border: 0;

            border-radius: 12px;

            padding: 14px;

            margin-top: 12px;

            font-size: 16px;

            font-weight: 700;

            cursor: pointer;

            text-decoration: none;

            background: #0ca88f;

            color: white;

        }


        .upi-note {

            font-size: 13px;

            color: #666;

            margin-top: 15px;

        }

    `;


    document.head.appendChild(style);

    document.body.appendChild(
        overlay
    );


    // CLOSE BUTTON

    document
        .getElementById(
            "upiCloseBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                overlay.remove();

            }
        );
}



// ================= SAVE ORDER =================

function finishOrder(
    order,
    paymentStatus
) {

    order.paymentStatus =
        paymentStatus;


    const orders =
        JSON.parse(
            localStorage.getItem(
                "orders"
            ) || "[]"
        );


    orders.push(order);


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );


    localStorage.removeItem(
        CART_KEY
    );


    localStorage.removeItem(
        OLD_CART_KEY
    );


    showOrderSuccess(
        order.id,
        paymentStatus
    );
}



// ================= PLACE ORDER =================

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


    if (!cart.length) {

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

        alert(
            "Please select a payment method."
        );

        return;
    }


    const orderItems =
        cart.map(item => ({

            id: item.id,

            name: item.name,

            price: getPrice(item),

            quantity:
                Math.max(
                    1,
                    Number(item.quantity) || 1
                ),

            image: item.image

        }));


    const total =
        orderItems.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    if (total <= 0) {

        alert(
            "Unable to calculate cart total."
        );

        return;
    }


    const order = {

        id:
            generateOrderId(),

        userId:
            auth.currentUser.uid,

        customerName:
            document
                .getElementById(
                    "customerName"
                )
                ?.value.trim(),

        email:
            document
                .getElementById(
                    "customerEmail"
                )
                ?.value.trim(),

        phone:
            document
                .getElementById(
                    "customerPhone"
                )
                ?.value.trim(),

        address:
            document
                .getElementById(
                    "customerAddress"
                )
                ?.value.trim(),

        city:
            document
                .getElementById(
                    "customerCity"
                )
                ?.value.trim(),

        pincode:
            document
                .getElementById(
                    "customerPincode"
                )
                ?.value.trim(),

        paymentMethod,

        paymentStatus:
            "Pending",

        items:
            orderItems,

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

        deliveryDate:
            getDeliveryDate(),

        status:
            "Processing"

    };



    // ================= UPI =================

    if (
        paymentMethod === "upi"
    ) {

        showUpiPayment(
            total,
            order
        );

        return;
    }



    // ================= COD =================

    if (
        paymentMethod === "cod"
    ) {

        finishOrder(
            order,
            "Cash on Delivery - Pending"
        );

        return;
    }



    // ================= CARD =================

    if (
        paymentMethod === "card"
    ) {

        alert(
            "Card payment gateway is not connected yet."
        );

        return;
    }
}



// ================= FIREBASE AUTH =================

onAuthStateChanged(
    auth,
    user => {

        currentUser =
            user;


        if (user)
            fillUserDetails();

    }
);



// ================= PAGE LOAD =================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await authReady;


        if (!auth.currentUser) {

            window.location.href =
                "login.html";

            return;
        }


        fillUserDetails();


        renderCheckoutCart();


        document
            .getElementById(
                "checkoutForm"
            )
            ?.addEventListener(
                "submit",
                placeOrder
            );

    }
);