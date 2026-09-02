/* =========================================================
   CHEMISTBOYS - CART.JS
   ========================================================= */

import {
    auth,
    authReady
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   CART KEYS
   ========================================================= */

const CART_KEY = "chemistboys_cart";
const OLD_CART_KEY = "chemistCart";


/* =========================================================
   GET CART
   ========================================================= */

function getCart() {

    try {

        let cart = JSON.parse(
            localStorage.getItem(CART_KEY)
        );

        if (Array.isArray(cart)) {
            return cart;
        }

        cart = JSON.parse(
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

    localStorage.setItem(
        OLD_CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   SHOW CART MESSAGE
   ========================================================= */

function showCartMessage(message, type = "success") {

    /*
     * IMPORTANT:
     * Agar empty cart message hai,
     * to sirf wahi message show hoga.
     */

    if (
        typeof message === "string" &&
        message
            .toLowerCase()
            .includes("your cart is empty")
    ) {

        message = "Your cart is empty";

        type = "error";

    }


    /* Remove old message */

    const oldMessage =
        document.querySelector(
            ".cart-message"
        );

    if (oldMessage) {
        oldMessage.remove();
    }


    /* Create new message */

    const messageBox =
        document.createElement("div");

    messageBox.className =
        "cart-message";


    /* Icon */

    const icon =
        type === "error"
            ? "⚠️"
            : "✓";


    messageBox.innerHTML = `

        <div
            style="
                font-size:22px;
                margin-bottom:5px;
            "
        >
            ${icon}
        </div>

        <div>
            ${message}
        </div>

    `;


    /* Message styling */

    messageBox.style.position =
        "fixed";

    messageBox.style.left =
        "50%";

    messageBox.style.bottom =
        "80px";

    messageBox.style.transform =
        "translateX(-50%)";

    messageBox.style.zIndex =
        "999999";

    messageBox.style.width =
        "max-content";

    messageBox.style.maxWidth =
        "85%";

    messageBox.style.padding =
        "16px 25px";

    messageBox.style.borderRadius =
        "14px";

    messageBox.style.background =
        type === "error"
            ? "#d9534f"
            : "#078f7d";

    messageBox.style.color =
        "white";

    messageBox.style.textAlign =
        "center";

    messageBox.style.fontSize =
        "16px";

    messageBox.style.fontWeight =
        "700";

    messageBox.style.lineHeight =
        "1.4";

    messageBox.style.boxShadow =
        "0 10px 30px rgba(0,0,0,0.25)";


    /* Add to page */

    document.body.appendChild(
        messageBox
    );


    /* Remove after 2.5 seconds */

    setTimeout(() => {

        if (
            messageBox &&
            messageBox.parentNode
        ) {

            messageBox.remove();

        }

    }, 2500);

}


/* =========================================================
   UPDATE CART COUNT
   ========================================================= */

function updateCartCount() {

    const cart =
        getCart();

    const count =
        cart.reduce(
            (total, item) => {

                return (
                    total +
                    Number(
                        item.quantity || 1
                    )
                );

            },
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
        Number(
            item.price || 0
        );


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
                Number(
                    product.price || 0
                );

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

            totalItems.textContent =
                "0";

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
       CART HAS ITEMS
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
                        this.style.display='none';
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
       UPDATE TOTALS
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
       PRODUCT ALREADY IN CART
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

            id:
                product.id,

            name:
                product.name,

            price:
                Number(
                    product.price || 0
                ),

            image:
                product.image || "",

            quantity:
                1

        });

    }


    /* Save cart */

    saveCart(cart);


    /* ONLY ADD TO CART SHOWS SUCCESS */

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


    /* Minimum quantity = 1 */

    if (
        cart[index].quantity < 1
    ) {

        cart[index].quantity = 1;

    }


    saveCart(cart);

    renderCart();

}


/* =========================================================
   REMOVE FROM CART
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


    const product =
        cart[index];


    cart.splice(
        index,
        1
    );


    saveCart(cart);


    showCartMessage(
        `${product.name || "Product"} removed from cart`,
        "success"
    );


    renderCart();

}


/* =========================================================
   CHECKOUT
   ========================================================= */

async function handleCheckout(event) {

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
         * NO ALERT
         * NO SUCCESS MESSAGE
         */

        showCartMessage(
            "Your cart is empty",
            "error"
        );

        return;

    }


    /* =====================================================
       FIREBASE LOGIN CHECK
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
   CLICK EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {


        /* =================================================
           PLUS
           ================================================= */

        if (
            event.target.closest(
                ".quantity-plus"
            )
        ) {

            const button =
                event.target.closest(
                    ".quantity-plus"
                );


            const index =
                Number(
                    button.dataset.index
                );


            changeQuantity(
                index,
                1
            );


            return;

        }


        /* =================================================
           MINUS
           ================================================= */

        if (
            event.target.closest(
                ".quantity-minus"
            )
        ) {

            const button =
                event.target.closest(
                    ".quantity-minus"
                );


            const index =
                Number(
                    button.dataset.index
                );


            changeQuantity(
                index,
                -1
            );


            return;

        }


        /* =================================================
           REMOVE
           ================================================= */

        if (
            event.target.closest(
                ".remove-btn"
            )
        ) {

            const button =
                event.target.closest(
                    ".remove-btn"
                );


            const index =
                Number(
                    button.dataset.index
                );


            removeFromCart(
                index
            );


            return;

        }


        /* =================================================
           CHECKOUT
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
   FIREBASE AUTH STATE
   ========================================================= */

onAuthStateChanged(
    auth,
    function() {

        renderCart();

        updateCartCount();

    }
);


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await authReady;

        renderCart();

        updateCartCount();

    }
);


/* =========================================================
   STORAGE CHANGE
   ========================================================= */

window.addEventListener(
    "storage",
    function() {

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
   INITIAL LOAD
   ========================================================= */

renderCart();

updateCartCount();