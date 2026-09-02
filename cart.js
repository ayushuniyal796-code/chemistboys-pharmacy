/* =========================================================
   CHEMISTBOYS - CART
   Single Firebase Auth + Cart Rendering + Price Recovery
========================================================= */

import { auth, authReady } from "./firebase.js";
import { onAuthStateChanged } from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentUser = null;


/* =========================================================
   GET CART
========================================================= */

function getCart() {

    try {

        const cart = JSON.parse(
            localStorage.getItem("chemistCart")
        );

        return Array.isArray(cart) ? cart : [];

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
        "chemistCart",
        JSON.stringify(cart)
    );

}


/* =========================================================
   GET PRODUCT FROM products.js
========================================================= */

function findProduct(productId) {

    const products =
        Array.isArray(window.products)
            ? window.products
            : [];

    return products.find(
        product => String(product.id) === String(productId)
    );

}


/* =========================================================
   GET CORRECT PRICE
   - First use cart price
   - If price is 0/missing, recover from products.js
========================================================= */

function getCorrectPrice(item) {

    const product = findProduct(item.id);

    const cartPrice = Number(item.price);

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
   UPDATE CART COUNT
========================================================= */

function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 1),
        0
    );

    document
        .querySelectorAll(".cart-count")
        .forEach(element => {

            element.textContent = count;

        });

}


/* =========================================================
   SUCCESS MESSAGE
========================================================= */

function showCartMessage(productName = "Product") {

    const oldMessage =
        document.getElementById("cartSuccessMessage");

    if (oldMessage) {
        oldMessage.remove();
    }

    const message =
        document.createElement("div");

    message.id = "cartSuccessMessage";

    message.textContent =
        `✓ ${productName} successfully added to cart`;

    message.style.cssText = `
        position: fixed;
        left: 50%;
        bottom: 25px;
        transform: translateX(-50%);
        background: #087c6b;
        color: white;
        padding: 13px 22px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 6px 20px rgba(0,0,0,0.18);
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.25s ease;
    `;

    document.body.appendChild(message);

    requestAnimationFrame(() => {

        message.style.opacity = "1";

    });

    setTimeout(() => {

        message.style.opacity = "0";

        setTimeout(() => {

            message.remove();

        }, 300);

    }, 2500);

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(productId) {

    const product = findProduct(productId);

    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;

    }

    const cart = getCart();

    const existingItem =
        cart.find(
            item =>
                String(item.id) === String(productId)
        );

    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity || 1) + 1;

        /*
         * Repair old cart item if its price was 0
         */
        existingItem.price =
            Number(product.price);

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

    showCartMessage(product.name);

}


/* =========================================================
   REMOVE FROM CART
========================================================= */

function removeFromCart(productId) {

    let cart = getCart();

    cart = cart.filter(
        item =>
            String(item.id) !== String(productId)
    );

    saveCart(cart);

    updateCartCount();

    renderCart();

}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(productId, change) {

    const cart = getCart();

    const item =
        cart.find(
            cartItem =>
                String(cartItem.id) === String(productId)
        );

    if (!item) {
        return;
    }

    item.quantity =
        Number(item.quantity || 1) + Number(change);

    if (item.quantity <= 0) {

        removeFromCart(productId);

        return;

    }

    /*
     * Repair price if old cart item has 0/missing price
     */

    const product = findProduct(productId);

    if (
        product &&
        Number(item.price) <= 0
    ) {

        item.price =
            Number(product.price);

    }

    saveCart(cart);

    updateCartCount();

    renderCart();

}


/* =========================================================
   UPDATE ORDER SUMMARY
========================================================= */

function updateSummary(totalItems, subtotal) {

    const totalItemsElement =
        document.getElementById("totalItems");

    const subtotalElement =
        document.getElementById("subtotal");

    const deliveryElement =
        document.getElementById("deliveryCharge");

    const grandTotalElement =
        document.getElementById("grandTotal");


    if (totalItemsElement) {

        totalItemsElement.textContent =
            totalItems;

    }


    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${subtotal}`;

    }


    /*
     * Free delivery
     */

    if (deliveryElement) {

        deliveryElement.textContent =
            "FREE";

    }


    if (grandTotalElement) {

        grandTotalElement.textContent =
            `₹${subtotal}`;

    }

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const cartItemsContainer =
        document.getElementById("cartItems");

    if (!cartItemsContainer) {

        return;

    }

    let cart = getCart();


    /*
     * Repair old cart prices automatically
     */

    let cartChanged = false;

    cart = cart.map(item => {

        const correctPrice =
            getCorrectPrice(item);

        if (
            Number(item.price) !== correctPrice
        ) {

            item.price = correctPrice;

            cartChanged = true;

        }

        if (!item.quantity || Number(item.quantity) < 1) {

            item.quantity = 1;

            cartChanged = true;

        }

        return item;

    });


    if (cartChanged) {

        saveCart(cart);

    }


    /* =====================================================
       EMPTY CART
    ===================================================== */

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <div style="
                text-align:center;
                padding:40px 20px;
                color:#666;
            ">
                <div style="
                    font-size:45px;
                    margin-bottom:10px;
                ">
                    🛒
                </div>

                <h3 style="margin-bottom:8px;">
                    Your cart is empty
                </h3>

                <p>
                    Add some products to your cart.
                </p>
            </div>
        `;

        updateSummary(0, 0);

        updateCartCount();

        return;

    }


    /* =====================================================
       CALCULATE TOTALS
    ===================================================== */

    let totalItems = 0;

    let subtotal = 0;


    /* =====================================================
       CREATE CART ITEMS
    ===================================================== */

    cartItemsContainer.innerHTML =
        cart.map(item => {

            const price =
                getCorrectPrice(item);

            const quantity =
                Number(item.quantity || 1);

            const itemTotal =
                price * quantity;

            totalItems += quantity;

            subtotal += itemTotal;


            return `
                <div class="cart-item">

                    <div class="cart-item-image">

                        <img
                            src="${item.image || ""}"
                            alt="${item.name || "Product"}"
                            onerror="
                                this.style.display='none';
                            "
                        >

                    </div>


                    <div class="cart-item-details">

                        <h3>
                            ${item.name || "Product"}
                        </h3>

                        <div class="cart-item-price">
                            ₹${price}
                        </div>


                        <div class="cart-item-actions">

                            <div class="quantity-control">

                                <button
                                    type="button"
                                    class="quantity-btn"
                                    data-action="decrease"
                                    data-id="${item.id}"
                                >
                                    −
                                </button>

                                <span class="quantity">
                                    ${quantity}
                                </span>

                                <button
                                    type="button"
                                    class="quantity-btn"
                                    data-action="increase"
                                    data-id="${item.id}"
                                >
                                    +
                                </button>

                            </div>


                            <button
                                type="button"
                                class="remove-cart-btn"
                                data-id="${item.id}"
                            >
                                Remove
                            </button>

                        </div>

                    </div>


                    <div class="cart-item-total">

                        ₹${itemTotal}

                    </div>

                </div>
            `;

        })
        .join("");


    /* =====================================================
       UPDATE SUMMARY
    ===================================================== */

    updateSummary(
        totalItems,
        subtotal
    );


    updateCartCount();

}


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        currentUser = user;

        window.currentFirebaseUser =
            user;

        updateCheckoutButton();

    }
);


/* =========================================================
   UPDATE CHECKOUT BUTTON
========================================================= */

function updateCheckoutButton() {

    const checkoutButton =
        document.getElementById("checkoutBtn");

    if (!checkoutButton) {

        return;

    }

    if (currentUser) {

        checkoutButton.textContent =
            "🛒 Buy Now";

    } else {

        checkoutButton.textContent =
            "🔐 Login to Buy";

    }

}


/* =========================================================
   CHECKOUT BUTTON
========================================================= */

async function handleCheckout(event) {

    event.preventDefault();

    /*
     * Wait for Firebase Auth to finish loading
     */

    await authReady;

    const user =
        auth.currentUser;


    /*
     * User is not logged in
     */

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    /*
     * Check cart
     */

    const cart =
        getCart();

    if (cart.length === 0) {

        showCartMessage(
            "Your cart is empty"
        );

        return;

    }


    /*
     * Go to checkout
     */

    window.location.href =
        "checkout.html";

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

document.addEventListener(
    "click",
    event => {

        /* =================================================
           QUANTITY BUTTON
        ================================================= */

        const quantityButton =
            event.target.closest(
                ".quantity-btn"
            );

        if (quantityButton) {

            const productId =
                quantityButton.dataset.id;

            const action =
                quantityButton.dataset.action;

            if (action === "increase") {

                changeQuantity(
                    productId,
                    1
                );

            }

            if (action === "decrease") {

                changeQuantity(
                    productId,
                    -1
                );

            }

            return;

        }


        /* =================================================
           REMOVE BUTTON
        ================================================= */

        const removeButton =
            event.target.closest(
                ".remove-cart-btn"
            );

        if (removeButton) {

            const productId =
                removeButton.dataset.id;

            removeFromCart(productId);

            return;

        }


        /* =================================================
           ADD TO CART BUTTON
        ================================================= */

        const addButton =
            event.target.closest(
                ".add-cart-btn"
            );

        if (addButton) {

            const productId =
                addButton.dataset.id;

            if (productId) {

                addToCart(productId);

            }

            return;

        }


        /* =================================================
           CHECKOUT BUTTON
        ================================================= */

        const checkoutButton =
            event.target.closest(
                "#checkoutBtn"
            );

        if (checkoutButton) {

            handleCheckout(event);

        }

    }
);


/* =========================================================
   INITIAL LOAD
========================================================= */

updateCartCount();

renderCart();

updateCheckoutButton();


/* =========================================================
   GLOBAL FUNCTIONS
   script.js can call addToCart()
========================================================= */

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