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


const CART_KEY = "chemistboys_cart";
const OLD_CART_KEY = "chemistCart";


/* =========================================================
   FIND PRODUCT FROM PRODUCTS.JS
   ========================================================= */

function findProduct(productOrId) {

    if (!Array.isArray(window.products)) {
        return null;
    }

    const id =
        typeof productOrId === "object"
            ? productOrId.id
            : productOrId;

    return window.products.find(
        product =>
            String(product.id) === String(id)
    ) || null;
}


/* =========================================================
   GET CART
   ========================================================= */

function getCart() {

    try {

        let cart =
            JSON.parse(
                localStorage.getItem(CART_KEY)
            );

        if (!Array.isArray(cart)) {

            cart =
                JSON.parse(
                    localStorage.getItem(OLD_CART_KEY)
                );

        }

        if (!Array.isArray(cart)) {
            return [];
        }


        /*
         * IMPORTANT:
         * Purane galat cart items ko
         * products.js ke original data se repair karo.
         */

        cart = cart.map(item => {

            const product =
                findProduct(item.id);

            if (!product) {
                return item;
            }

            return {

                id: product.id,

                name: product.name,

                price: Number(product.price),

                image: product.image || "",

                quantity:
                    Math.max(
                        1,
                        Number(item.quantity || 1)
                    )

            };

        });


        return cart;

    } catch (error) {

        console.error(
            "Cart read error:",
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
        CART_KEY,
        JSON.stringify(cart)
    );

    localStorage.setItem(
        OLD_CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   CART MESSAGE
   ========================================================= */

function showCartMessage(
    message,
    type = "success"
) {

    if (
        typeof message === "string" &&
        message
            .toLowerCase()
            .includes("your cart is empty")
    ) {

        message = "Your cart is empty";

        type = "error";

    }


    const oldMessage =
        document.querySelector(
            ".cart-message"
        );

    if (oldMessage) {
        oldMessage.remove();
    }


    const messageBox =
        document.createElement("div");

    messageBox.className =
        "cart-message";


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


    messageBox.style.position = "fixed";
    messageBox.style.left = "50%";
    messageBox.style.bottom = "80px";
    messageBox.style.transform =
        "translateX(-50%)";
    messageBox.style.zIndex = "999999";
    messageBox.style.width = "max-content";
    messageBox.style.maxWidth = "85%";
    messageBox.style.padding = "16px 25px";
    messageBox.style.borderRadius = "14px";

    messageBox.style.background =
        type === "error"
            ? "#d9534f"
            : "#078f7d";

    messageBox.style.color = "white";
    messageBox.style.textAlign = "center";
    messageBox.style.fontSize = "16px";
    messageBox.style.fontWeight = "700";
    messageBox.style.lineHeight = "1.4";
    messageBox.style.boxShadow =
        "0 10px 30px rgba(0,0,0,0.25)";


    document.body.appendChild(
        messageBox
    );


    setTimeout(() => {

        if (messageBox.parentNode) {
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
        cartCount.textContent = count;
    }

}


/* =========================================================
   GET PRODUCT PRICE
   ========================================================= */

function getProductPrice(item) {

    const product =
        findProduct(item.id);

    if (product) {

        return Number(
            product.price || 0
        );

    }

    return Number(
        item.price || 0
    );

}


/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {

    const cart = getCart();


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

                <div class="empty-cart-icon">
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
            subtotalElement.textContent = "₹0";
        }

        if (grandTotalElement) {
            grandTotalElement.textContent = "₹0";
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
                Math.max(
                    1,
                    Number(
                        item.quantity || 1
                    )
                );


            const product =
                findProduct(item.id);


            const name =
                product
                    ? product.name
                    : (
                        item.name ||
                        "Product"
                    );


            const price =
                product
                    ? Number(product.price)
                    : Number(item.price || 0);


            const image =
                product
                    ? (product.image || "")
                    : (item.image || "");


            const itemTotal =
                price * quantity;


            totalItemsCount +=
                quantity;

            subtotal +=
                itemTotal;


            const cartItem =
                document.createElement("div");

            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <img
                    src="${image}"
                    alt="${name}"
                    class="cart-item-image"
                    onerror="
                        this.style.display='none';
                    "
                >


                <div
                    class="cart-item-info"
                >

                    <h3>
                        ${name}
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

function addToCart(productOrId) {

    /*
     * Product object bhi chalega
     * aur product ID bhi.
     */

    const product =
        findProduct(productOrId);


    if (!product) {

        console.error(
            "Product not found:",
            productOrId
        );

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


    if (existingIndex !== -1) {

        cart[existingIndex].quantity =
            Number(
                cart[existingIndex].quantity || 1
            ) + 1;


        /*
         * Product details ko fresh rakho.
         */

        cart[existingIndex].name =
            product.name;

        cart[existingIndex].price =
            Number(product.price);

        cart[existingIndex].image =
            product.image || "";

    }


    else {

        cart.push({

            id: product.id,

            name: product.name,

            price:
                Number(product.price),

            image:
                product.image || "",

            quantity: 1

        });

    }


    saveCart(cart);


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


    if (cart.length === 0) {

        showCartMessage(
            "Your cart is empty",
            "error"
        );

        return;

    }


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


    window.location.href =
        "checkout.html";

}


/* =========================================================
   CLICK EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {


        /* PLUS */

        const plusButton =
            event.target.closest(
                ".quantity-plus"
            );

        if (plusButton) {

            const index =
                Number(
                    plusButton.dataset.index
                );

            changeQuantity(
                index,
                1
            );

            return;

        }


        /* MINUS */

        const minusButton =
            event.target.closest(
                ".quantity-minus"
            );

        if (minusButton) {

            const index =
                Number(
                    minusButton.dataset.index
                );

            changeQuantity(
                index,
                -1
            );

            return;

        }


        /* REMOVE */

        const removeButton =
            event.target.closest(
                ".remove-btn"
            );

        if (removeButton) {

            const index =
                Number(
                    removeButton.dataset.index
                );

            removeFromCart(index);

            return;

        }


        /* CHECKOUT */

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
   FIREBASE AUTH
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

window.getCart =
    getCart;