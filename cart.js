document.addEventListener("DOMContentLoaded", () => {

    let cart =
        JSON.parse(localStorage.getItem("chemistCart")) || [];

    const cartItems =
        document.getElementById("cartItems");

    const cartCount =
        document.getElementById("cartCount");

    const subtotalElement =
        document.getElementById("subtotal");

    const deliveryElement =
        document.getElementById("delivery");

    const totalElement =
        document.getElementById("total");

    const checkoutBtn =
        document.getElementById("checkoutBtn");


    /* ================= CART COUNT ================= */

    function updateCartCount() {

        const count = cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

        cartCount.textContent = count;
    }


    /* ================= DISPLAY CART ================= */

    function displayCart() {

        cartItems.innerHTML = "";

        if (cart.length === 0) {

            cartItems.innerHTML = `

                <div class="empty-cart">

                    <div class="empty-cart-icon">
                        🛒
                    </div>

                    <h2>
                        Your cart is empty
                    </h2>

                    <p>
                        Looks like you haven't added
                        anything yet.
                    </p>

                    <a
                        href="index.html"
                        class="checkout-btn"
                        style="
                            display:inline-block;
                            width:auto;
                            text-decoration:none;
                            margin-top:25px;
                        "
                    >
                        🛍️ Start Shopping
                    </a>

                </div>

            `;

            updateSummary();

            return;
        }


        cart.forEach(item => {

            const cartItem =
                document.createElement("div");

            cartItem.className =
                "cart-item";

            cartItem.innerHTML = `

                <div class="cart-item-image">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                </div>


                <div class="cart-item-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <div class="cart-price">
                        ₹${item.price}
                    </div>


                    <div class="quantity-control">

                        <button
                            class="decrease"
                            data-id="${item.id}"
                        >
                            −
                        </button>

                        <strong>
                            ${item.quantity}
                        </strong>

                        <button
                            class="increase"
                            data-id="${item.id}"
                        >
                            +
                        </button>

                    </div>

                </div>


                <button
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

    }


    /* ================= CART EVENTS ================= */

    function addCartEvents() {

        document
            .querySelectorAll(".increase")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        changeQuantity(
                            Number(button.dataset.id),
                            1
                        );

                    }
                );

            });


        document
            .querySelectorAll(".decrease")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        changeQuantity(
                            Number(button.dataset.id),
                            -1
                        );

                    }
                );

            });


        document
            .querySelectorAll(".remove-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        removeItem(
                            Number(button.dataset.id)
                        );

                    }
                );

            });

    }


    /* ================= QUANTITY ================= */

    function changeQuantity(
        productId,
        change
    ) {

        const item =
            cart.find(
                item => item.id === productId
            );

        if (!item) return;


        item.quantity += change;


        if (item.quantity <= 0) {

            cart =
                cart.filter(
                    item =>
                        item.id !== productId
                );

        }


        saveCart();

    }


    /* ================= REMOVE ================= */

    function removeItem(productId) {

        cart =
            cart.filter(
                item =>
                    item.id !== productId
            );

        saveCart();

    }


    /* ================= SAVE ================= */

    function saveCart() {

        localStorage.setItem(
            "chemistCart",
            JSON.stringify(cart)
        );

        displayCart();

        updateCartCount();

    }


    /* ================= SUMMARY ================= */

    function updateSummary() {

        const subtotal =
            cart.reduce(
                (total, item) =>
                    total +
                    item.price *
                    item.quantity,
                0
            );


        /*
            Free delivery above ₹500
        */

        const delivery =
            subtotal === 0
                ? 0
                : subtotal >= 500
                    ? 0
                    : 50;


        const total =
            subtotal + delivery;


        subtotalElement.textContent =
            `₹${subtotal}`;

        deliveryElement.textContent =
            delivery === 0
                ? "FREE"
                : `₹${delivery}`;

        totalElement.textContent =
            `₹${total}`;

    }


    /* ================= CHECKOUT ================= */

    checkoutBtn.addEventListener(
        "click",
        () => {

            if (cart.length === 0) {

                alert(
                    "Your cart is empty!"
                );

                return;
            }


            /*
                Next page will be checkout.html
            */

            window.location.href =
                "checkout.html";

        }
    );


    /* ================= INITIAL ================= */

    updateCartCount();

    displayCart();

});