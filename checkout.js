document.addEventListener("DOMContentLoaded", function () {

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

    const checkoutForm =
        document.getElementById("checkoutForm");


    /*
        CART

        script.js usually stores cart data
        in localStorage.

        We check both common names.
    */

    let cart =
        JSON.parse(localStorage.getItem("cart")) ||
        JSON.parse(localStorage.getItem("cartItems")) ||
        [];


    /*
        If cart is empty
    */

    if (!Array.isArray(cart) || cart.length === 0) {

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
                        Add some products before checkout.
                    </p>

                    <a
                        href="index.html"
                        class="continue-shopping"
                    >
                        Continue Shopping
                    </a>

                </div>

            </div>

        `;

        return;
    }


    /*
        GET PRODUCT PRICE
    */

    function getPrice(item) {

        return Number(
            item.price ||
            item.productPrice ||
            0
        );

    }


    /*
        GET PRODUCT NAME
    */

    function getName(item) {

        return (
            item.name ||
            item.productName ||
            "Medicine"
        );

    }


    /*
        GET QUANTITY
    */

    function getQuantity(item) {

        return Number(
            item.quantity ||
            item.qty ||
            1
        );

    }


    /*
        DISPLAY CART ITEMS
    */

    let subtotal = 0;

    checkoutItems.innerHTML = "";


    cart.forEach(function (item) {

        const price = getPrice(item);

        const quantity = getQuantity(item);

        const name = getName(item);

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


    /*
        DELIVERY CHARGE

        Free delivery above ₹500
    */

    const deliveryCharge =
        subtotal >= 500 ? 0 : 40;


    const grandTotal =
        subtotal + deliveryCharge;


    subtotalElement.textContent =
        "₹" + subtotal;


    deliveryChargeElement.textContent =
        deliveryCharge === 0
            ? "FREE"
            : "₹" + deliveryCharge;


    grandTotalElement.textContent =
        "₹" + grandTotal;



    /*
        DELIVERY DATES

        First available date = tomorrow.

        Customer can choose one of
        the next 5 available dates.
    */

    const today =
        new Date();


    for (let i = 1; i <= 5; i++) {

        const deliveryDate =
            new Date(today);


        deliveryDate.setDate(
            today.getDate() + i
        );


        const dateText =
            deliveryDate.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


        const dateValue =
            deliveryDate
                .toISOString()
                .split("T")[0];


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
                📅 ${dateText}
            </span>

        `;


        deliveryOptions.appendChild(
            label
        );

    }



    /*
        PLACE ORDER
    */

    checkoutForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /*
                CUSTOMER DETAILS
            */

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


            /*
                BASIC VALIDATION
            */

            if (!/^\d{10}$/.test(customerPhone)) {

                alert(
                    "Please enter a valid 10-digit mobile number."
                );

                return;
            }


            if (!/^\d{6}$/.test(customerPincode)) {

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



            /*
                CURRENT ORDER DATE

                This is automatically generated
                at the exact time the user places
                the order.
            */

            const orderDate =
                new Date();


            const orderDateFormatted =
                orderDate.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );


            const orderTime =
                orderDate.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            /*
                DELIVERY DATE
            */

            const deliveryDateObject =
                new Date(
                    selectedDelivery.value +
                    "T00:00:00"
                );


            const deliveryDateFormatted =
                deliveryDateObject.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );



            /*
                UNIQUE ORDER ID
            */

            const orderId =
                "CB" +
                Date.now()
                    .toString()
                    .slice(-8);



            /*
                ORDER OBJECT
            */

            const order = {

                id: orderId,

                orderDate:
                    orderDateFormatted,

                orderTime:
                    orderTime,

                deliveryDate:
                    deliveryDateFormatted,

                deliveryDateISO:
                    selectedDelivery.value,

                status:
                    "Processing",

                paymentMethod:
                    paymentMethod,

                paymentStatus:
                    paymentMethod === "cod"
                        ? "Pending"
                        : "Pending",

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

                            name:
                                getName(item),

                            price:
                                getPrice(item),

                            quantity:
                                getQuantity(item)

                        };

                    }),

                subtotal:
                    subtotal,

                deliveryCharge:
                    deliveryCharge,

                total:
                    grandTotal

            };



            /*
                GET EXISTING ORDERS
            */

            let existingOrders =
                JSON.parse(
                    localStorage.getItem("orders")
                ) || [];


            if (!Array.isArray(existingOrders)) {

                existingOrders = [];

            }


            /*
                ADD NEW ORDER
            */

            existingOrders.push(order);


            /*
                SAVE ORDERS
            */

            localStorage.setItem(
                "orders",
                JSON.stringify(existingOrders)
            );


            /*
                CLEAR CART
            */

            localStorage.removeItem("cart");

            localStorage.removeItem(
                "cartItems"
            );


            /*
                SAVE LAST ORDER
            */

            localStorage.setItem(
                "lastOrder",
                JSON.stringify(order)
            );


            /*
                SUCCESS
            */

            alert(
                "Order placed successfully!\n\n" +
                "Order ID: " + orderId +
                "\nOrder Date: " +
                orderDateFormatted +
                "\nDelivery Date: " +
                deliveryDateFormatted
            );


            /*
                GO TO ORDERS
            */

            window.location.href =
                "orders.html";

        }
    );

});