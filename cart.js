/* =========================================================
   CHEMISTBOYS - CART
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
                localStorage.getItem(
                    "chemistboys_cart"
                )
            );

        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        console.error(
            "Cart error:",
            error
        );

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

    const cart =
        getCart();

    const count =
        cart.reduce(
            function (total, item) {

                return (
                    total +
                    Number(
                        item.quantity || 1
                    )
                );

            },
            0
        );


    document
        .querySelectorAll(
            "#cartCount, .cart-count"
        )
        .forEach(
            function (element) {

                element.textContent =
                    count;

            }
        );

}


/* =========================================================
   ADD PRODUCT TO CART
========================================================= */

function addToCart(productId) {

    const products =
        window.products || [];


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

            price: product.price,

            image: product.image,

            quantity: 1

        });

    }


    saveCart(cart);

    updateCartCount();


    alert(
        "✅ " +
        product.name +
        " added to cart!"
    );

}


/* =========================================================
   REMOVE PRODUCT
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
        Number(
            item.quantity || 1
        ) +
        Number(change);


    if (item.quantity <= 0) {

        removeFromCart(
            productId
        );

        return;

    }


    saveCart(cart);

    updateCartCount();

}


/* =========================================================
   AUTH STATE
========================================================= */

let currentUser = null;


/* Firebase auth ready hone ke baad state check */

authReady.then(
    function () {

        currentUser =
            auth.currentUser;

    }
);


/* Firebase auth state continuously monitor */

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
                    "Proceed to Checkout";

                button.disabled =
                    false;

                button.dataset.loggedIn =
                    "true";

            } else {

                button.textContent =
                    "Login to Checkout";

                button.disabled =
                    false;

                button.dataset.loggedIn =
                    "false";

            }

        }
    );

}


/* =========================================================
   CHECKOUT BUTTON CLICK
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


        /* Firebase auth state ready hone do */

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
   PRODUCT PAGE BUTTONS
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


        addToCart(
            productId
        );

    }
);


/* =========================================================
   INITIAL CART COUNT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

        updateCheckoutButton();

    }
);


/* =========================================================
   MAKE CART FUNCTIONS AVAILABLE
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