/* =========================================================
   CHEMISTBOYS - CART SCRIPT
========================================================= */


/* =========================================================
   CART
========================================================= */

let cart =
    JSON.parse(localStorage.getItem("chemistCart")) || [];


/* =========================================================
   ELEMENTS
========================================================= */

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const totalItems =
    document.getElementById("totalItems");

const subtotalElement =
    document.getElementById("subtotal");

const deliveryElement =
    document.getElementById("deliveryCharge");

const grandTotalElement =
    document.getElementById("grandTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) => {

                return total +
                    Number(item.quantity || 0);

            },
            0
        );


    if (cartCount) {

        cartCount.textContent = count;

    }

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        "chemistCart",
        JSON.stringify(cart)
    );

    updateCartCount();

    displayCart();

}


/* =========================================================
   DISPLAY CART
========================================================= */

function displayCart() {

    if (!cartItems) return;


    cartItems.innerHTML = "";


    /* EMPTY CART */

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
                    Add some medicines to continue.
                </p>

                <a
                    href="index.html"
                    class="shop-btn"
                >
                    🛍️ Start Shopping
                </a>

            </div>

        `;

        updateSummary();

        return;

    }


    /* CART PRODUCTS */

    cart.forEach(item => {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        const itemTotal =
            price * quantity;


        const div =
            document.createElement("div");


        div.className =
            "cart-product";


        div.innerHTML = `

            <div class="product-info">

                <div class="product-name">
                    ${item.name || "Medicine"}
                </div>

                <div class="product-price">
                    ₹${price}
                </div>

            </div>


            <div class="quantity-controls">

                <button
                    type="button"
                    class="quantity-btn decrease"
                    data-id="${item.id}"
                >
                    −
                </button>


                <span class="quantity-number">
                    ${quantity}
                </span>


                <button
                    type="button"
                    class="quantity-btn increase"
                    data-id="${item.id}"
                >
                    +
                </button>

            </div>


            <strong>
                ₹${itemTotal}
            </strong>


            <button
                type="button"
                class="remove-btn"
                data-id="${item.id}"
            >
                🗑 Remove
            </button>

        `;


        cartItems.appendChild(div);

    });


    addEvents();

    updateSummary();

}


/* =========================================================
   CART BUTTON EVENTS
========================================================= */

function addEvents() {


    /* INCREASE */

    document
        .querySelectorAll(".increase")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        button.dataset.id,
                        1
                    );

                }
            );

        });


    /* DECREASE */

    document
        .querySelectorAll(".decrease")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        button.dataset.id,
                        -1
                    );

                }
            );

        });


    /* REMOVE */

    document
        .querySelectorAll(".remove-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    removeItem(
                        button.dataset.id
                    );

                }
            );

        });

}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            product =>
                String(product.id) ===
                String(productId)
        );


    if (!item) return;


    item.quantity =
        Number(item.quantity || 0) +
        change;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                product =>
                    String(product.id) !==
                    String(productId)
            );

    }


    saveCart();

}


/* =========================================================
   REMOVE ITEM
========================================================= */

function removeItem(productId) {

    cart =
        cart.filter(
            item =>
                String(item.id) !==
                String(productId)
        );


    saveCart();

}


/* =========================================================
   ORDER SUMMARY
========================================================= */

function updateSummary() {

    let subtotal = 0;

    let items = 0;


    cart.forEach(item => {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 0;


        subtotal +=
            price * quantity;

        items +=
            quantity;

    });


    const delivery =
        subtotal === 0
            ? 0
            : subtotal >= 500
                ? 0
                : 50;


    const grandTotal =
        subtotal + delivery;


    if (totalItems) {

        totalItems.textContent =
            items;

    }


    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${subtotal}`;

    }


    if (deliveryElement) {

        deliveryElement.textContent =
            delivery === 0
                ? "FREE"
                : `₹${delivery}`;

    }


    if (grandTotalElement) {

        grandTotalElement.textContent =
            `₹${grandTotal}`;

    }

}


/* =========================================================
   BUY NOW / CHECKOUT
========================================================= */

if (checkoutBtn) {

    /* Button text */

    checkoutBtn.textContent =
        "🛒 Buy Now";


    checkoutBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();


            /* CART EMPTY */

            if (cart.length === 0) {

                alert(
                    "🛒 Your cart is empty!"
                );

                return;

            }


            /* DIRECT CHECKOUT */

            window.location.href =
                "checkout.html";

        }
    );

}


/* =========================================================
   INITIAL LOAD
========================================================= */

updateCartCount();

displayCart();