/* =========================================================
   CHEMISTBOYS - CART JAVASCRIPT
   ========================================================= */

import {
    auth,
    authReady
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   CART SETTINGS
   ========================================================= */

const CART_KEY = "chemistboys_cart";
const OLD_CART_KEY = "chemistCart";


/* =========================================================
   GET CART
   ========================================================= */

function getCart() {

    try {

        let cart =
            JSON.parse(
                localStorage.getItem(CART_KEY)
            );

        if (
            Array.isArray(cart) &&
            cart.length > 0
        ) {
            return cart;
        }


        /* Old key compatibility */

        cart =
            JSON.parse(
                localStorage.getItem(OLD_CART_KEY)
            );

        if (Array.isArray(cart)) {
            return cart;
        }

    } catch (error) {

        console.error(
            "Cart read error:",
            error
        );

    }

    return [];
}


/* =========================================================
   SAVE CART
   ========================================================= */

function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    /* Keep old key synchronized */

    localStorage.setItem(
        OLD_CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   SHOW MESSAGE
   ========================================================= */

function showCartMessage(
    message,
    type = "success"
) {

    /* Remove previous message */

    const oldMessage =
        document.querySelector(
            ".cart-message"
        );

    if (oldMessage) {
        oldMessage.remove();
    }


    /* Create message */

    const messageBox =
        document.createElement("div");

    messageBox.className =
        "cart-message";


    const background =
        type === "error"
            ? "#d9534f"
            : "#078f7d";


    messageBox.innerHTML = `
        <span
            style="
                font-size:20px;
                display:block;
                margin-bottom:5px;
            "
        >
            ${type === "error" ? "⚠️" : "✓"}
        </span>

        <span>
            ${message}
        </span>
    `;


    messageBox.style.cssText = `
        position: fixed;

        left: 50%;

        bottom: 80px;

        transform: translateX(-50%);

        z-index: 99999;

        width: max-content;

        max-width: 85%;

        padding: 16px 24px;

        border-radius: 14px;

        background: ${background};

        color: white;

        text-align: center;

        font-size: 16px;

        font-weight: 700;

        line-height: 1.4;

        box-shadow:
            0 10px 30px
            rgba(0, 0, 0, 0.25);

        animation:
            cartMessageIn
            0.3s ease;
    `;


    /* Animation */

    const style =
        document.createElement("style");

    style.textContent = `

        @keyframes cartMessageIn {

            from {

                opacity: 0;

                transform:
                    translateX(-50%)
                    translateY(20px);

            }

            to {

                opacity: 1;

                transform:
                    translateX(-50%)
                    translateY(0);

            }

        }

    `;

    document.head.appendChild(style);


    document.body.appendChild(
        messageBox
    );


    /* Remove after 2.5 seconds */

    setTimeout(() => {

        if (messageBox) {
            messageBox.remove();
        }

    }, 2500);

}


/* =========================================================
   UPDATE CART COUNT
   ========================================================= */

function updateCartCount() {

    const cart = getCart();

    const count =
        cart.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 1),
            0
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (cartCount) {

        cartCount.textContent =
            count;

    }

}


/* =========================================================
   GET PRODUCT PRICE
   ========================================================= */

function getProductPrice(item) {

    let price =
        Number(item.price || 0);


    /* If price is missing,
       find product from products.js */

    if (
        price <= 0 &&
        Array.isArray(window.products)
    ) {

        const product =
            window.products.find(
                p =>
                    String(p.id) ===
                    String(item.id)
            );


        if (product) {

            price =
                Number(product.price || 0);

        }

    }


    return price;

}


/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {

    const cart =
        getCart();


    const cartItems =
        document.getElementById(
            "cartItems"
        );


    const totalItems =
        document.getElementById(
            "totalItems"
        );


    const subtotalElement =
        document.getElementById(
            "subtotal"
        );


    const grandTotalElement =
        document.getElementById(
            "grandTotal"
        );


    if (!cartItems) {
        return;
    }


    /* =====================================================
       EMPTY CART
       ===================================================== */

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div
                    class="empty-cart-icon"
                >
                    🛒
                </div>

                <h2>
                    Your Cart is Empty
                </h2>

                <p>
                    Add some products to
                    your cart to continue shopping.
                </p>

            </div>

        `;


        if (totalItems) {
            totalItems.textContent = "0";
        }


        if (subtotalElement) {
            subtotalElement.textContent =
                "₹0";
        }


        if (grandTotalElement) {
            grandTotalElement.textContent =
                "₹0";
        }


        updateCartCount();

        return;

    }


    /* =====================================================
       CART HAS PRODUCTS
       ===================================================== */

    let totalItemsCount = 0;

    let subtotal = 0;


    cartItems.innerHTML = "";


    cart.forEach(
        (item, index) => {

            const quantity =
                Number(
                    item.quantity || 1
                );


            const price =
                getProductPrice(item);


            const itemTotal =
                price * quantity;


            totalItemsCount +=
                quantity;


            subtotal +=
                itemTotal;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <img
                    src="${item.image || ""}"
                    alt="${item.name || "Product"}"
                    class="cart-item-image"
                    onerror="
                        this.style.display='none'
                    "
                >


                <div
                    class="cart-item-info"
                >

                    <h3>
                        ${item.name || "Product"}
                    </h3>


                    <div
                        class="cart-price"
                    >
                        ₹${price}
                    </div>


                    <div
                        class="quantity-control"
                    >

                        <button
                            type="button"
                            class="quantity-minus"
                            data-index="${index}"
                        >
                            −
                        </button>


                        <strong>
                            ${quantity}
                        </strong>


                        <button
                            type="button"
                            class="quantity-plus"
                            data-index="${index}"
                        >
                            +
                        </button>

                    </div>

                </div>


                <div
                    class="cart-item-actions"
                >

                    <strong>
                        ₹${itemTotal}
                    </strong>


                    <button
                        type="button"
                        class="remove-btn"
                        data-index="${index}"
                    >
                        🗑️ Remove
                    </button>

                </div>

            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    /* =====================================================
       UPDATE SUMMARY
       ===================================================== */

    if (totalItems) {

        totalItems.textContent =
            totalItemsCount;

    }


    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${subtotal}`;

    }


    if (grandTotalElement) {

        grandTotalElement.textContent =
            `₹${subtotal}`;

    }


    updateCartCount();

}


/* =========================================================
   ADD TO CART
   ========================================================= */

function addToCart(product) {

    if (!product) {
        return;
    }


    let cart =
        getCart();


    const existingIndex =
        cart.findIndex(
            item =>
                String(item.id) ===
                String(product.id)
        );


    /* =====================================================
       PRODUCT ALREADY EXISTS
       ===================================================== */

    if (existingIndex !== -1) {

        cart[existingIndex].quantity =
            Number(
                cart[existingIndex].quantity || 1
            ) + 1;

    }


    /* =====================================================
       NEW PRODUCT
       ===================================================== */

    else {

        cart.push({

            id: product.id,

            name: product.name,

            price:
                Number(
                    product.price || 0
                ),

            image:
                product.image || "",

            quantity: 1

        });

    }


    saveCart(cart);


    /* IMPORTANT:
       Only ADD TO CART gives
       success message */

    showCartMessage(
        "Product successfully added to cart",
        "success"
    );


    renderCart();

}


/* =========================================================
   CHANGE QUANTITY
   ========================================================= */

function changeQuantity(
    index,
    change
) {

    const cart =
        getCart();


    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }


    cart[index].quantity =
        Number(
            cart[index].quantity || 1
        ) + change;


    /* Quantity minimum = 1 */

    if (
        cart[index].quantity < 1
    ) {

        cart[index].quantity = 1;

    }


    saveCart(cart);

    renderCart();

}


/* =========================================================
   REMOVE PRODUCT
   ========================================================= */

function removeFromCart(index) {

    const cart =
        getCart();


    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }


    const removedProduct =
        cart[index];


    cart.splice(
        index,
        1
    );


    saveCart(cart);


    showCartMessage(
        `${removedProduct.name || "Product"} removed from cart`,
        "success"
    );


    renderCart();

}


/* =========================================================
   CHECKOUT
   ========================================================= */

async function handleCheckout(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const cart =
        getCart();


    /* =====================================================
       EMPTY CART
       ===================================================== */

    if (cart.length === 0) {

        /*
         * IMPORTANT:
         * NO alert()
         * NO success message
         */

        showCartMessage(
            "Your cart is empty",
            "error"
        );

        return;

    }


    /* =====================================================
       AUTH CHECK
       ===================================================== */

    await authReady;


    if (!auth.currentUser) {

        showCartMessage(
            "Please login before checkout",
            "error"
        );


        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1200);


        return;

    }


    /* =====================================================
       GO TO CHECKOUT
       ===================================================== */

    window.location.href =
        "checkout.html";

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {


        /* =================================================
           QUANTITY PLUS
           ================================================= */

        if (
            event.target.matches(
                ".quantity-plus"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            changeQuantity(
                index,
                1
            );


            return;

        }


        /* =================================================
           QUANTITY MINUS
           ================================================= */

        if (
            event.target.matches(
                ".quantity-minus"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            changeQuantity(
                index,
                -1
            );


            return;

        }


        /* =================================================
           REMOVE BUTTON
           ================================================= */

        if (
            event.target.matches(
                ".remove-btn"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            removeFromCart(
                index
            );


            return;

        }


        /* =================================================
           CHECKOUT BUTTON
           ================================================= */

        if (
            event.target.closest(
                "#checkoutBtn"
            )
        ) {

            handleCheckout(
                event
            );

        }

    }
);


/* =========================================================
   AUTH STATE
   ========================================================= */

onAuthStateChanged(
    auth,
    () => {

        renderCart();

        updateCartCount();

    }
);


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await authReady;

        renderCart();

        updateCartCount();

    }
);


/* =========================================================
   LISTEN FOR CART CHANGES
   ========================================================= */

window.addEventListener(
    "storage",
    () => {

        renderCart();

        updateCartCount();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.addToCart =
    addToCart;

window.renderCart =
    renderCart;

window.updateCartCount =
    updateCartCount;

window.showCartMessage =
    showCartMessage;


/* =========================================================
   INITIAL RENDER
   ========================================================= */

renderCart();

updateCartCount();