/* =========================================================
   CHEMISTBOYS - CART.JS
   Firebase Authentication + Cart Management
========================================================= */

import {
    auth,
    authReady
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   GET CART
========================================================= */

function getCart() {

    try {

        const cart =
            JSON.parse(
                localStorage.getItem("chemistboys_cart")
            );

        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        console.error("Cart read error:", error);

        return [];

    }

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart(cart) {

    localStorage.setItem(
        "chemistboys_cart",
        JSON.stringify(cart)
    );

}


/* =========================================================
   UPDATE CART COUNT
========================================================= */

function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        function (total, item) {

            return (
                total +
                Number(item.quantity || 1)
            );

        },
        0
    );


    document
        .querySelectorAll("#cartCount, .cart-count")
        .forEach(
            function (element) {

                element.textContent = count;

            }
        );

}


/* =========================================================
   UPDATE CART PAGE
========================================================= */

function renderCart() {

    const cartItems =
        document.getElementById("cartItems");

    const totalItems =
        document.getElementById("totalItems");

    const subtotalElement =
        document.getElementById("subtotal");

    const deliveryChargeElement =
        document.getElementById("deliveryCharge");

    const grandTotalElement =
        document.getElementById("grandTotal");


    if (!cartItems) {
        return;
    }


    const cart = getCart();


    /* EMPTY CART */

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <h3>🛒 Your cart is empty</h3>
                <p>Add some medicines to continue.</p>

                <a
                    href="index.html"
                    class="continue-btn"
                >
                    ← Shop Now
                </a>
            </div>
        `;


        if (totalItems) {
            totalItems.textContent = "0";
        }

        if (subtotalElement) {
            subtotalElement.textContent = "₹0";
        }

        if (deliveryChargeElement) {
            deliveryChargeElement.textContent = "FREE";
        }

        if (grandTotalElement) {
            grandTotalElement.textContent = "₹0";
        }

        updateCheckoutButton();

        return;

    }


    /* CART ITEMS */

    let totalQuantity = 0;
    let subtotal = 0;


    cartItems.innerHTML = "";


    cart.forEach(
        function (item) {

            const quantity =
                Number(item.quantity || 1);

            const price =
                Number(item.price || 0);

            const itemTotal =
                price * quantity;


            totalQuantity += quantity;

            subtotal += itemTotal;


            const itemElement =
                document.createElement("div");


            itemElement.className =
                "cart-item";


            itemElement.innerHTML = `

                <div class="cart-item-image">

                    <img
                        src="${item.image || ""}"
                        alt="${item.name || "Product"}"
                    >

                </div>


                <div class="cart-item-info">

                    <h3>
                        ${item.name || "Product"}
                    </h3>


                    <p>
                        ₹${price}
                    </p>


                    <div class="cart-quantity">

                        <button
                            type="button"
                            class="quantity-btn"
                            data-action="decrease"
                            data-product-id="${item.id}"
                        >
                            −
                        </button>


                        <span>
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            class="quantity-btn"
                            data-action="increase"
                            data-product-id="${item.id}"
                        >
                            +
                        </button>

                    </div>


                    <strong>
                        Total: ₹${itemTotal}
                    </strong>


                    <button
                        type="button"
                        class="remove-btn"
                        data-action="remove"
                        data-product-id="${item.id}"
                    >
                        🗑️ Remove
                    </button>

                </div>

            `;


            cartItems.appendChild(itemElement);

        }
    );


    /* SUMMARY */

    if (totalItems) {

        totalItems.textContent =
            totalQuantity;

    }


    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${subtotal}`;

    }


    /* DELIVERY */

    const delivery =
        subtotal >= 500
            ? 0
            : subtotal > 0
                ? 40
                : 0;


    if (deliveryChargeElement) {

        deliveryChargeElement.textContent =
            delivery === 0
                ? "FREE"
                : `₹${delivery}`;

    }


    /* GRAND TOTAL */

    const grandTotal =
        subtotal + delivery;


    if (grandTotalElement) {

        grandTotalElement.textContent =
            `₹${grandTotal}`;

    }


    updateCheckoutButton();

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(productId) {

    const products =
        Array.isArray(window.products)
            ? window.products
            : [];


    const product =
        products.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(productId)
                );

            }
        );


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;

    }


    const cart =
        getCart();


    const existingItem =
        cart.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(productId)
                );

            }
        );


    if (existingItem) {

        existingItem.quantity =
            Number(
                existingItem.quantity || 1
            ) + 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: Number(product.price),

            image: product.image,

            quantity: 1

        });

    }


    saveCart(cart);

    updateCartCount();

    renderCart();


    alert(
        `✅ ${product.name} added to cart!`
    );

}


/* =========================================================
   REMOVE FROM CART
========================================================= */

function removeFromCart(productId) {

    let cart =
        getCart();


    cart =
        cart.filter(
            function (item) {

                return (
                    Number(item.id) !==
                    Number(productId)
                );

            }
        );


    saveCart(cart);

    updateCartCount();

    renderCart();

}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(
    productId,
    change
) {

    const cart =
        getCart();


    const item =
        cart.find(
            function (product) {

                return (
                    Number(product.id) ===
                    Number(productId)
                );

            }
        );


    if (!item) {
        return;
    }


    item.quantity =
        Number(item.quantity || 1) +
        Number(change);


    if (item.quantity <= 0) {

        removeFromCart(productId);

        return;

    }


    saveCart(cart);

    updateCartCount();

    renderCart();

}


/* =========================================================
   FIREBASE AUTH STATE
========================================================= */

let currentUser = null;


/* =========================================================
   CHECKOUT BUTTON
========================================================= */

function updateCheckoutButton() {

    const checkoutButtons =
        document.querySelectorAll(
            "#checkoutBtn, .checkout-btn"
        );


    checkoutButtons.forEach(
        function (button) {

            if (currentUser) {

                button.textContent =
                    "🛒 Buy Now";

                button.disabled =
                    false;

                button.dataset.loggedIn =
                    "true";

            } else {

                button.textContent =
                    "🔐 Login to Buy";

                button.disabled =
                    false;

                button.dataset.loggedIn =
                    "false";

            }

        }
    );

}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

onAuthStateChanged(
    auth,
    function (user) {

        currentUser =
            user || null;


        window.currentFirebaseUser =
            currentUser;


        updateCheckoutButton();

    }
);


/* =========================================================
   CHECKOUT CLICK
========================================================= */

document.addEventListener(
    "click",
    async function (event) {

        const checkoutButton =
            event.target.closest(
                "#checkoutBtn, .checkout-btn"
            );


        if (!checkoutButton) {
            return;
        }


        event.preventDefault();


        /*
         * IMPORTANT:
         * Firebase auth state fully ready hone ka wait.
         */

        await authReady;


        const user =
            auth.currentUser;


        /* USER LOGGED IN */

        if (user) {

            window.location.href =
                "checkout.html";

            return;

        }


        /* USER NOT LOGGED IN */

        window.location.href =
            "login.html";

    }
);


/* =========================================================
   CART ITEM BUTTONS
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const productId =
            button.dataset.productId;


        const action =
            button.dataset.action;


        if (!productId) {
            return;
        }


        if (action === "increase") {

            changeQuantity(
                productId,
                1
            );

        }


        else if (action === "decrease") {

            changeQuantity(
                productId,
                -1
            );

        }


        else if (action === "remove") {

            removeFromCart(
                productId
            );

        }

    }
);


/* =========================================================
   PRODUCT PAGE ADD TO CART
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const addButton =
            event.target.closest(
                ".add-cart-btn"
            );


        if (!addButton) {
            return;
        }


        const productId =
            addButton.dataset.productId;


        if (!productId) {
            return;
        }


        addToCart(productId);

    }
);


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await authReady;


        currentUser =
            auth.currentUser;


        window.currentFirebaseUser =
            currentUser;


        updateCartCount();

        renderCart();

        updateCheckoutButton();

    }
);


/* =========================================================
   EXPORT FUNCTIONS TO WINDOW
========================================================= */

window.getCart =
    getCart;

window.saveCart =
    saveCart;

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.changeQuantity =
    changeQuantity;

window.updateCartCount =
    updateCartCount;

window.renderCart =
    renderCart;