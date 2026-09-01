/* =========================================================
   CHEMISTBOYS - CART
   Clean Version - No Popup Alert
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


    /* Create message if it doesn't exist */

    if (!message) {

        message =
            document.createElement("div");

        message.id =
            "cartSuccessMessage";

        message.style.position =
            "fixed";

        message.style.left =
            "50%";

        message.style.bottom =
            "25px";

        message.style.transform =
            "translateX(-50%) translateY(20px)";

        message.style.background =
            "#ffffff";

        message.style.color =
            "#087c6b";

        message.style.padding =
            "14px 24px";

        message.style.borderRadius =
            "14px";

        message.style.boxShadow =
            "0 8px 30px rgba(0,0,0,0.12)";

        message.style.border =
            "1px solid #d8eee9";

        message.style.fontSize =
            "15px";

        message.style.fontWeight =
            "600";

        message.style.zIndex =
            "99999";

        message.style.opacity =
            "0";

        message.style.transition =
            "all 0.3s ease";

        message.style.pointerEvents =
            "none";

        document.body.appendChild(message);

    }


    message.innerHTML =
        `✓ ${productName} successfully added to cart`;


    /* Show */

    requestAnimationFrame(function () {

        message.style.opacity =
            "1";

        message.style.transform =
            "translateX(-50%) translateY(0)";

    });


    /* Hide after 2.5 seconds */

    clearTimeout(
        window.cartMessageTimer
    );


    window.cartMessageTimer =
        setTimeout(function () {

            message.style.opacity =
                "0";

            message.style.transform =
                "translateX(-50%) translateY(20px)";

        }, 2500);

}


/* =========================================================
   ADD PRODUCT TO CART
========================================================= */

function addToCart(productId) {

    const products =
        window.products || [];


    const product =
        products.find(function (item) {

            return Number(item.id) ===
                Number(productId);

        });


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
        cart.find(function (item) {

            return Number(item.id) ===
                Number(productId);

        });


    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity || 1) + 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            image: product.image,

            quantity: 1

        });

    }


    saveCart(cart);

    updateCartCount();


    /* NO ALERT / NO POPUP */

    showCartMessage(product.name);

}


/* =========================================================
   REMOVE PRODUCT
========================================================= */

function removeFromCart(productId) {

    let cart =
        getCart();


    cart =
        cart.filter(function (item) {

            return Number(item.id) !==
                Number(productId);

        });


    saveCart(cart);

    updateCartCount();

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
        cart.find(function (product) {

            return Number(product.id) ===
                Number(productId);

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

}


/* =========================================================
   AUTH STATE
========================================================= */

let currentUser = null;


authReady.then(function () {

    currentUser =
        auth.currentUser;

    updateCheckoutButton();

});


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


    checkoutButtons.forEach(function (button) {

        if (currentUser) {

            button.textContent =
                "🛒 Buy Now";

            button.disabled =
                false;

            button.dataset.loggedIn =
                "true";

        } else {

            button.textContent =
                "🔐 Login to Checkout";

            button.disabled =
                false;

            button.dataset.loggedIn =
                "false";

        }

    });

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


        await authReady;


        const user =
            auth.currentUser;


        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        window.location.href =
            "checkout.html";

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
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

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