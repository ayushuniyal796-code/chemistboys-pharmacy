document.addEventListener("DOMContentLoaded", function () {

    let cart =
        JSON.parse(localStorage.getItem("chemistCart")) || [];

    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const totalItems = document.getElementById("totalItems");
    const subtotalElement = document.getElementById("subtotal");
    const deliveryElement = document.getElementById("deliveryCharge");
    const grandTotalElement = document.getElementById("grandTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");


    /* =========================
       SAVE CART
    ========================= */

    function saveCart() {

        localStorage.setItem(
            "chemistCart",
            JSON.stringify(cart)
        );

        updateCartCount();
        displayCart();
    }


    /* =========================
       CART COUNT
    ========================= */

    function updateCartCount() {

        const count = cart.reduce(
            function (total, item) {
                return total + Number(item.quantity || 0);
            },
            0
        );

        if (cartCount) {
            cartCount.textContent = count;
        }
    }


    /* =========================
       DISPLAY CART
    ========================= */

    function displayCart() {

        if (!cartItems) return;

        cartItems.innerHTML = "";


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


        cart.forEach(function (item) {

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


    /* =========================
       BUTTON EVENTS
    ========================= */

    function addEvents() {


        document
            .querySelectorAll(".increase")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        changeQuantity(
                            button.dataset.id,
                            1
                        );

                    }
                );

            });


        document
            .querySelectorAll(".decrease")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        changeQuantity(
                            button.dataset.id,
                            -1
                        );

                    }
                );

            });


        document
            .querySelectorAll(".remove-btn")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        removeItem(
                            button.dataset.id
                        );

                    }
                );

            });

    }


    /* =========================
       CHANGE QUANTITY
    ========================= */

    function changeQuantity(
        productId,
        change
    ) {

        const item =
            cart.find(function (product) {

                return String(product.id) ===
                    String(productId);

            });


        if (!item) return;


        item.quantity =
            Number(item.quantity || 0) + change;


        if (item.quantity <= 0) {

            cart =
                cart.filter(function (product) {

                    return String(product.id) !==
                        String(productId);

                });

        }


        saveCart();

    }


    /* =========================
       REMOVE ITEM
    ========================= */

    function removeItem(productId) {

        cart =
            cart.filter(function (item) {

                return String(item.id) !==
                    String(productId);

            });


        saveCart();

    }


    /* =========================
       SUMMARY
    ========================= */

    function updateSummary() {

        let subtotal = 0;
        let items = 0;


        cart.forEach(function (item) {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 0;


            subtotal +=
                price * quantity;

            items += quantity;

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
            totalItems.textContent = items;
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


    /* =========================
       CHECKOUT
    ========================= */

    if (checkoutBtn) {

        checkoutBtn.addEventListener(
            "click",
            function (event) {

                if (cart.length === 0) {

                    event.preventDefault();

                    alert(
                        "Your cart is empty!"
                    );

                    return;
                }

                /*
                    Normal link will open:
                    checkout.html
                */

            }
        );

    }


    /* =========================
       START
    ========================= */

    updateCartCount();
    displayCart();

});