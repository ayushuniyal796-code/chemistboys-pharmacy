document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       GET ELEMENTS
    ========================================= */

    const checkoutForm =
        document.getElementById("checkoutForm");

    const checkoutItems =
        document.getElementById("checkoutItems");

    const subtotalElement =
        document.getElementById("subtotal");

    const deliveryChargeElement =
        document.getElementById("deliveryCharge");

    const grandTotalElement =
        document.getElementById("grandTotal");

    const deliveryOptions =
        document.getElementById("deliveryOptions");


    /* =========================================
       LOAD CART

       IMPORTANT:
       cart.js saves data as "chemistCart"
    ========================================= */

    let cart =
        JSON.parse(
            localStorage.getItem("chemistCart")
        ) || [];


    /* =========================================
       EMPTY CART CHECK
    ========================================= */

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        document.querySelector(".checkout-page").innerHTML = `

            <div class="container">

                <div class="empty-cart">

                    <div class="empty-cart-icon">
                        🛒
                    </div>

                    <h2>
                        Your Cart is Empty
                    </h2>

                    <p>
                        Please add products to your cart
                        before proceeding to checkout.
                    </p>

                    <a
                        href="index.html"
                        class="continue-shopping"
                    >
                        🛍️ Continue Shopping
                    </a>

                </div>

            </div>

        `;

        return;
    }


    /* =========================================
       PRODUCT NAME
    ========================================= */

    function getProductName(item) {

        return item.name || "Medicine";

    }


    /* =========================================
       PRODUCT PRICE
    ========================================= */

    function getProductPrice(item) {

        return Number(item.price) || 0;

    }


    /* =========================================
       PRODUCT QUANTITY
    ========================================= */

    function getProductQuantity(item) {

        return Number(item.quantity) || 1;

    }


    /* =========================================
       DISPLAY CART ITEMS
    ========================================= */

    function displayCheckoutItems() {

        checkoutItems.innerHTML = "";

        let subtotal = 0;


        cart.forEach(function (item) {

            const name =
                getProductName(item);

            const price =
                getProductPrice(item);

            const quantity =
                getProductQuantity(item);


            const itemTotal =
                price * quantity;


            subtotal += itemTotal;


            const itemElement =
                document.createElement("div");

            itemElement.className =
                "cart-item";


            itemElement.innerHTML = `

                <div>

                    <div class="cart-item-name">
                        ${name}
                    </div>

                    <small>
                        Quantity: ${quantity}
                    </small>

                </div>

                <div class="cart-item-price">
                    ₹${itemTotal}
                </div>

            `;


            checkoutItems.appendChild(
                itemElement
            );

        });


        /* =====================================
           DELIVERY CHARGE
        ===================================== */

        let deliveryCharge = 0;


        if (
            subtotal > 0 &&
            subtotal < 500
        ) {

            deliveryCharge = 50;

        }


        const grandTotal =
            subtotal + deliveryCharge;


        /* =====================================
           SHOW TOTALS
        ===================================== */

        subtotalElement.textContent =
            `₹${subtotal}`;


        deliveryChargeElement.textContent =
            deliveryCharge === 0
                ? "FREE"
                : `₹${deliveryCharge}`;


        grandTotalElement.textContent =
            `₹${grandTotal}`;


        return {
            subtotal,
            deliveryCharge,
            grandTotal
        };

    }


    /* =========================================
       DELIVERY DATE OPTIONS
       
       Tomorrow + next 4 days
    ========================================= */

    function createDeliveryDates() {

        deliveryOptions.innerHTML = "";


        const today =
            new Date();


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            const deliveryDate =
                new Date(today);


            deliveryDate.setDate(
                today.getDate() + i
            );


            const dateValue =
                deliveryDate
                    .toISOString()
                    .split("T")[0];


            const readableDate =
                deliveryDate.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );


            const label =
                document.createElement("label");


            label.className =
                "delivery-option";


            label.innerHTML = `

                <input
                    type="radio"
                    name="deliveryDate"
                    value="${dateValue}"
                    required
                >

                <span>
                    📅 ${readableDate}
                </span>

            `;


            deliveryOptions.appendChild(
                label
            );

        }

    }


    /* =========================================
       INITIAL DISPLAY
    ========================================= */

    const totals =
        displayCheckoutItems();


    createDeliveryDates();


    /* =========================================
       PLACE ORDER
    ========================================= */

    checkoutForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /* =====================================
               CUSTOMER DETAILS
            ===================================== */

            const customerName =
                document
                    .getElementById("customerName")
                    .value
                    .trim();


            const customerPhone =
                document
                    .getElementById("customerPhone")
                    .value
                    .trim();


            const customerAddress =
                document
                    .getElementById("customerAddress")
                    .value
                    .trim();


            const customerCity =
                document
                    .getElementById("customerCity")
                    .value
                    .trim();


            const customerPincode =
                document
                    .getElementById("customerPincode")
                    .value
                    .trim();


            const paymentMethod =
                document
                    .getElementById("paymentMethod")
                    .value;


            const selectedDelivery =
                document.querySelector(
                    'input[name="deliveryDate"]:checked'
                );


            /* =====================================
               VALIDATION
            ===================================== */

            if (customerName === "") {

                alert(
                    "Please enter your name."
                );

                return;
            }


            if (
                !/^\d{10}$/.test(
                    customerPhone
                )
            ) {

                alert(
                    "Please enter a valid 10-digit mobile number."
                );

                return;
            }


            if (customerAddress === "") {

                alert(
                    "Please enter your delivery address."
                );

                return;
            }


            if (customerCity === "") {

                alert(
                    "Please enter your city."
                );

                return;
            }


            if (
                !/^\d{6}$/.test(
                    customerPincode
                )
            ) {

                alert(
                    "Please enter a valid 6-digit pincode."
                );

                return;
            }


            if (!selectedDelivery) {

                alert(
                    "Please select a delivery date."
                );

                return;
            }


            if (paymentMethod === "") {

                alert(
                    "Please select a payment method."
                );

                return;
            }


            /* =====================================
               ORDER DATE

               Automatically today's date
            ===================================== */

            const now =
                new Date();


            const orderDate =
                now.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );


            const orderTime =
                now.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            const orderDateISO =
                now.toISOString();


            /* =====================================
               DELIVERY DATE
            ===================================== */

            const deliveryDateObject =
                new Date(
                    selectedDelivery.value +
                    "T00:00:00"
                );


            const deliveryDate =
                deliveryDateObject
                    .toLocaleDateString(
                        "en-IN",
                        {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    );


            /* =====================================
               CREATE ORDER ID
            ===================================== */

            const orderId =
                "CB" +
                Date.now()
                    .toString()
                    .slice(-8);


            /* =====================================
               CREATE ORDER OBJECT
            ===================================== */

            const newOrder = {

                id:
                    orderId,

                orderDate:
                    orderDate,

                orderDateISO:
                    orderDateISO,

                orderTime:
                    orderTime,

                deliveryDate:
                    deliveryDate,

                deliveryDateISO:
                    selectedDelivery.value,

                status:
                    "Processing",

                paymentMethod:
                    paymentMethod,

                paymentStatus:
                    "Pending",

                customer: {

                    name:
                        customerName,

                    phone:
                        customerPhone,

                    address:
                        customerAddress,

                    city:
                        customerCity,

                    pincode:
                        customerPincode

                },

                items:
                    cart.map(function (item) {

                        return {

                            id:
                                item.id,

                            name:
                                getProductName(item),

                            price:
                                getProductPrice(item),

                            quantity:
                                getProductQuantity(item)

                        };

                    }),

                subtotal:
                    totals.subtotal,

                deliveryCharge:
                    totals.deliveryCharge,

                total:
                    totals.grandTotal

            };


            /* =====================================
               GET OLD ORDERS
            ===================================== */

            let orders =
                JSON.parse(
                    localStorage.getItem("orders")
                ) || [];


            if (!Array.isArray(orders)) {

                orders = [];

            }


            /* =====================================
               SAVE NEW ORDER
            ===================================== */

            orders.push(newOrder);


            localStorage.setItem(
                "orders",
                JSON.stringify(orders)
            );


            /* =====================================
               CLEAR CART AFTER ORDER
            ===================================== */

            localStorage.removeItem(
                "chemistCart"
            );


            /* =====================================
               SAVE LAST ORDER
            ===================================== */

            localStorage.setItem(
                "lastOrder",
                JSON.stringify(newOrder)
            );


            /* =====================================
               SUCCESS MESSAGE
            ===================================== */

            alert(

                "🎉 Order Placed Successfully!\n\n" +

                "Order ID: " +
                orderId +

                "\n\nOrder Date: " +
                orderDate +

                "\nDelivery Date: " +
                deliveryDate

            );


            /* =====================================
               GO TO MY ORDERS
            ===================================== */

            window.location.href =
                "orders.html";

        }
    );

});