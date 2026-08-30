document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       ELEMENTS
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
    ========================================= */

    let cart =
        JSON.parse(
            localStorage.getItem("chemistCart")
        ) || [];


    /* =========================================
       CHECK CART
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
                        before checkout.
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
       DISPLAY CART ITEMS
    ========================================= */

    function displayCheckoutItems() {

        checkoutItems.innerHTML = "";

        let subtotal = 0;


        cart.forEach(function (item) {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 1;

            const itemTotal =
                price * quantity;


            subtotal += itemTotal;


            const itemElement =
                document.createElement("div");

            itemElement.className =
                "checkout-item";


            itemElement.innerHTML = `

                <div>

                    <div class="checkout-item-name">
                        ${item.name || "Medicine"}
                    </div>

                    <div class="checkout-item-quantity">
                        Quantity: ${quantity}
                    </div>

                </div>

                <div class="checkout-item-price">
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

        const deliveryCharge =
            subtotal >= 500
                ? 0
                : 50;


        const grandTotal =
            subtotal + deliveryCharge;


        subtotalElement.textContent =
            `₹${subtotal}`;


        deliveryChargeElement.textContent =
            deliveryCharge === 0
                ? "FREE"
                : `₹${deliveryCharge}`;


        grandTotalElement.textContent =
            `₹${grandTotal}`;


        return {
            subtotal: subtotal,
            deliveryCharge: deliveryCharge,
            grandTotal: grandTotal
        };

    }


    /* =========================================
       DELIVERY DATES
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

            const date =
                new Date(today);


            date.setDate(
                today.getDate() + i
            );


            const value =
                date.toISOString()
                    .split("T")[0];


            const readable =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "long",
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
                    value="${value}"
                    required
                >

                <span>
                    📅 ${readable}
                </span>

            `;


            deliveryOptions.appendChild(
                label
            );

        }

    }


    /* =========================================
       INITIAL LOAD
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


            /* ==============================
               CUSTOMER DETAILS
            ============================== */

            const name =
                document
                    .getElementById("customerName")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("customerPhone")
                    .value
                    .trim();


            const address =
                document
                    .getElementById("customerAddress")
                    .value
                    .trim();


            const city =
                document
                    .getElementById("customerCity")
                    .value
                    .trim();


            const pincode =
                document
                    .getElementById("customerPincode")
                    .value
                    .trim();


            const paymentMethod =
                document
                    .getElementById("paymentMethod")
                    .value;


            const deliveryInput =
                document.querySelector(
                    'input[name="deliveryDate"]:checked'
                );


            /* ==============================
               VALIDATION
            ============================== */

            if (name === "") {

                alert(
                    "Please enter your full name."
                );

                return;
            }


            if (
                !/^\d{10}$/.test(phone)
            ) {

                alert(
                    "Please enter a valid 10-digit mobile number."
                );

                return;
            }


            if (address === "") {

                alert(
                    "Please enter your delivery address."
                );

                return;
            }


            if (city === "") {

                alert(
                    "Please enter your city."
                );

                return;
            }


            if (
                !/^\d{6}$/.test(pincode)
            ) {

                alert(
                    "Please enter a valid 6-digit pincode."
                );

                return;
            }


            if (!deliveryInput) {

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


            /* ==============================
               CURRENT DATE & TIME
            ============================== */

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


            /* ==============================
               DELIVERY DATE
            ============================== */

            const deliveryDateObject =
                new Date(
                    deliveryInput.value +
                    "T00:00:00"
                );


            const deliveryDate =
                deliveryDateObject.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );


            /* ==============================
               ORDER ID
            ============================== */

            const orderId =
                "CB" +
                Date.now()
                    .toString()
                    .slice(-8);


            /* ==============================
               PAYMENT STATUS
            ============================== */

            let paymentStatus =
                "Pending";


            if (paymentMethod === "cod") {

                paymentStatus =
                    "Pending";

            }


            /* ==============================
               CREATE ORDER
            ============================== */

            const newOrder = {

                id: orderId,

                orderDate: orderDate,

                orderDateISO: orderDateISO,

                orderTime: orderTime,

                deliveryDate: deliveryDate,

                deliveryDateISO:
                    deliveryInput.value,

                status: "Processing",

                paymentMethod:
                    paymentMethod,

                paymentStatus:
                    paymentStatus,


                customer: {

                    name: name,

                    phone: phone,

                    address: address,

                    city: city,

                    pincode: pincode

                },


                items:
                    cart.map(function (item) {

                        return {

                            id: item.id,

                            name:
                                item.name,

                            price:
                                Number(item.price) || 0,

                            quantity:
                                Number(item.quantity) || 1

                        };

                    }),


                subtotal:
                    totals.subtotal,

                deliveryCharge:
                    totals.deliveryCharge,

                total:
                    totals.grandTotal

            };


            /* ==============================
               LOAD OLD ORDERS
            ============================== */

            let orders =
                JSON.parse(
                    localStorage.getItem("orders")
                ) || [];


            if (!Array.isArray(orders)) {

                orders = [];

            }


            /* ==============================
               SAVE ORDER
            ============================== */

            orders.push(newOrder);


            localStorage.setItem(
                "orders",
                JSON.stringify(orders)
            );


            /* ==============================
               SAVE LAST ORDER
            ============================== */

            localStorage.setItem(
                "lastOrder",
                JSON.stringify(newOrder)
            );


            /* ==============================
               CLEAR CART
            ============================== */

            localStorage.removeItem(
                "chemistCart"
            );


            /* ==============================
               SUCCESS
            ============================== */

            alert(

                "🎉 Order Placed Successfully!\n\n" +

                "Order ID: " +
                orderId +

                "\n\nOrder Date: " +
                orderDate +

                "\nDelivery Date: " +
                deliveryDate

            );


            /* ==============================
               MY ORDERS
            ============================== */

            window.location.href =
                "orders.html";

        }
    );

});