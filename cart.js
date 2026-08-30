document.addEventListener("DOMContentLoaded", () => {

    /* ============================
       GET CART
    ============================ */

    let cart =
        JSON.parse(localStorage.getItem("chemistCart")) || [];


    /* ============================
       ELEMENTS
    ============================ */

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

    const totalElement =
        document.getElementById("grandTotal");

    const checkoutBtn =
        document.getElementById("checkoutBtn");


    /* ============================
       CART COUNT
    ============================ */

    function updateCartCount() {

        const count = cart.reduce(
            (total, item) => {
                return total + Number(item.quantity || 0);
            },
            0
        );

        if (cartCount) {
            cartCount.textContent = count;
        }
    }


    /* ============================
       DISPLAY CART
    ============================ */

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
                        Looks like you haven't added
                        anything yet.
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
            updateCartCount();

            return;
        }


        /* CART PRODUCTS */

        cart.forEach(item => {

            const productPrice =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 1;

            const itemTotal =
                productPrice * quantity;


            const cartItem =
                document.createElement("div");

            cartItem.className =
                "cart-product";


            cartItem.innerHTML = `

                <div class="product-info">

                    <div class="product-name">
                        ${item.name || "Medicine"}
                    </div>

                    <div class="product-price">
                        ₹${productPrice}
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


            cartItems.appendChild(cartItem);

        });


        addCartEvents();

        updateSummary();

        updateCartCount();

    }


    /* ============================
       CART BUTTON EVENTS
    ============================ */

    function addCartEvents() {


        /* INCREASE */

        document
            .querySelectorAll(".increase")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;

                        changeQuantity(id, 1);

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

                        const id =
                            button.dataset.id;

                        changeQuantity(id, -1);

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

                        const id =
                            button.dataset.id;

                        removeItem(id);

                    }
                );

            });

    }


    /* ============================
       CHANGE QUANTITY
    ============================ */

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


        /* REMOVE WHEN ZERO */

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


    /* ============================
       REMOVE ITEM
    ============================ */

    function removeItem(productId) {

        cart =
            cart.filter(
                item =>
                    String(item.id) !==
                    String(productId)
            );


        saveCart();

    }


    /* ============================
       SAVE CART
    ============================ */

    function saveCart() {

        localStorage.setItem(
            "chemistCart",
            JSON.stringify(cart)
        );


        displayCart();

    }


    /* ============================
       UPDATE SUMMARY
    ============================ */

    function updateSummary() {

        let subtotal = 0;

        let itemCount = 0;


        cart.forEach(item => {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 0;


            subtotal +=
                price * quantity;


            itemCount += quantity;

        });


        /*

            FREE DELIVERY
            ABOVE ₹500

        */

        let delivery = 0;


        if (subtotal > 0 && subtotal < 500) {

            delivery = 50;

        }


        const grandTotal =
            subtotal + delivery;


        if (totalItems) {

            totalItems.textContent =
                itemCount;

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


        if (totalElement) {

            totalElement.textContent =
                `₹${grandTotal}`;

        }

    }


    /* ============================
       CHECKOUT
    ============================ */

    if (checkoutBtn) {

        checkoutBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                if (cart.length === 0) {

                    alert(
                        "Your cart is empty!"
                    );

                    return;

                }


                window.location.href =
                    "checkout.html";

            }
        );

    }


    /* ============================
       INITIAL LOAD
    ============================ */

    updateCartCount();

    displayCart();

});