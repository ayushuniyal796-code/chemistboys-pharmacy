/* =========================================================
   CHEMISTBOYS - CART.JS
   Complete Firebase + Cart + Calculation System
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

        const cart = JSON.parse(
            localStorage.getItem("chemistboys_cart")
        );

        return Array.isArray(cart) ? cart : [];

    } catch (error) {

        console.error("Cart error:", error);

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
   CART COUNT
========================================================= */

function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        function (total, item) {

            return total + Number(item.quantity || 1);

        },
        0
    );


    document
        .querySelectorAll("#cartCount, .cart-count")
        .forEach(function (element) {

            element.textContent = count;

        });

}


/* =========================================================
   SUCCESS MESSAGE
========================================================= */

function showCartMessage(productName) {

    let message =
        document.getElementById("cartSuccessMessage");


    if (!message) {

        message = document.createElement("div");

        message.id = "cartSuccessMessage";

        message.style.position = "fixed";
        message.style.left = "50%";
        message.style.bottom = "25px";
        message.style.transform = "translateX(-50%)";
        message.style.background = "#0ca88f";
        message.style.color = "#ffffff";
        message.style.padding = "14px 24px";
        message.style.borderRadius = "12px";
        message.style.fontSize = "15px";
        message.style.fontWeight = "600";
        message.style.boxShadow =
            "0 8px 25px rgba(0,0,0,0.15)";
        message.style.zIndex = "9999";
        message.style.opacity = "0";
        message.style.transition =
            "opacity 0.3s ease, transform 0.3s ease";

        document.body.appendChild(message);

    }


    message.textContent =
        "✓ " + productName + " successfully added to cart";


    message.style.opacity = "1";
    message.style.transform =
        "translateX(-50%) translateY(-5px)";


    clearTimeout(
        window.cartMessageTimer
    );


    window.cartMessageTimer =
        setTimeout(function () {

            message.style.opacity = "0";

            message.style.transform =
                "translateX(-50%) translateY(10px)";

        }, 2500);

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(productId) {

    const products =
        window.products || [];


    const product =
        products.find(function (item) {

            return Number(item.id) === Number(productId);

        });


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;

    }


    const cart = getCart();


    const existingItem =
        cart.find(function (item) {

            return Number(item.id) === Number(productId);

        });


    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity || 1) + 1;

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


    cart = cart.filter(function (item) {

        return Number(item.id) !== Number(productId);

    });


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
        cart.find(function (product) {

            return Number(product.id) === Number(productId);

        });


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
   RENDER CART ITEMS
========================================================= */

function renderCart() {

    const cartItems =
        document.getElementById("cartItems");


    if (!cartItems) {

        return;

    }


    const cart = getCart();


    /* EMPTY CART */

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div style="
                    font-size:50px;
                    margin-bottom:15px;
                ">
                    🛒
                </div>

                <h3>Your cart is empty</h3>

                <p>Add some products to your cart.</p>

                <a
                    href="index.html"
                    class="continue-btn"
                >
                    ← Continue Shopping
                </a>

            </div>

        `;


        updateSummary(0, 0);

        return;

    }


    let totalItems = 0;

    let subtotal = 0;


    cartItems.innerHTML = "";


    cart.forEach(function (item) {

        const quantity =
            Number(item.quantity || 1);

        const price =
            Number(item.price || 0);

        const itemTotal =
            price * quantity;


        totalItems += quantity;

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
                    style="
                        width:90px;
                        height:75px;
                        object-fit:contain;
                        border-radius:10px;
                    "
                >

            </div>


            <div class="cart-item-info">

                <h3>
                    ${item.name || "Product"}
                </h3>


                <p>
                    ₹${price}
                </p>


                <div class="quantity-controls">

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

            </div>


            <div class="cart-item-total">

                <strong>
                    ₹${itemTotal}
                </strong>


                <button
                    type="button"
                    class="remove-cart-btn"
                    data-id="${item.id}"
                >
                    Remove
                </button>

            </div>

        `;


        cartItems.appendChild(itemElement);

    });


    updateSummary(
        totalItems,
        subtotal
    );

}


/* =========================================================
   UPDATE ORDER SUMMARY
========================================================= */

function updateSummary(
    totalItems,
    subtotal
) {

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
            "₹" + subtotal;

    }


    /*
       Free delivery for all orders
    */

    const deliveryCharge = 0;


    if (deliveryElement) {

        deliveryElement.textContent =
            deliveryCharge === 0
                ? "FREE"
                : "₹" + deliveryCharge;

    }


    const grandTotal =
        subtotal + deliveryCharge;


    if (grandTotalElement) {

        grandTotalElement.textContent =
            "₹" + grandTotal;

    }

}


/* =========================================================
   CART ITEM BUTTONS
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const quantityButton =
            event.target.closest(".quantity-btn");


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

            } else {

                changeQuantity(
                    productId,
                    -1
                );

            }

            return;

        }


        const removeButton =
            event.target.closest(
                ".remove-cart-btn"
            );


        if (removeButton) {

            const productId =
                removeButton.dataset.id;


            removeFromCart(
                productId
            );

            return;

        }

    }
);


/* =========================================================
   ADD TO CART BUTTON
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


        addToCart(productId);

    }
);


/* =========================================================
   FIREBASE AUTH
========================================================= */

let currentUser = null;


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


        /* Wait for Firebase */

        await authReady;


        const user =
            auth.currentUser;


        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        /* Check cart */

        const cart =
            getCart();


        if (cart.length === 0) {

            showCartMessage(
                "Your cart is empty"
            );

            return;

        }


        window.location.href =
            "checkout.html";

    }
);


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await authReady;

        currentUser =
            auth.currentUser;


        updateCartCount();

        renderCart();

        updateCheckoutButton();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
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