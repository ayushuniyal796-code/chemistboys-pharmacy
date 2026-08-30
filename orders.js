document.addEventListener("DOMContentLoaded", function () {

    const ordersContainer =
        document.getElementById("ordersContainer");


    /* =========================================
       LOAD ORDERS FROM LOCAL STORAGE
    ========================================= */

    let orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    /* =========================================
       CHECK ORDERS CONTAINER
    ========================================= */

    if (!ordersContainer) {
        return;
    }


    /* =========================================
       NO ORDERS
    ========================================= */

    if (
        !Array.isArray(orders) ||
        orders.length === 0
    ) {

        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <div class="empty-orders-icon">
                    📦
                </div>

                <h2>
                    No Orders Yet
                </h2>

                <p>
                    You haven't placed any orders yet.
                </p>

                <a
                    href="index.html"
                    class="shop-btn"
                >
                    🛍️ Start Shopping
                </a>

            </div>

        `;

        return;
    }


    /* =========================================
       NEWEST ORDER FIRST
    ========================================= */

    orders.sort(function (a, b) {

        const dateA =
            a.orderDateISO ||
            a.orderDate ||
            "";

        const dateB =
            b.orderDateISO ||
            b.orderDate ||
            "";

        return String(dateB)
            .localeCompare(String(dateA));

    });


    /* =========================================
       CLEAR OLD CONTENT
    ========================================= */

    ordersContainer.innerHTML = "";


    /* =========================================
       DISPLAY EACH ORDER
    ========================================= */

    orders.forEach(function (order) {


        /* =====================================
           ORDER CARD
        ===================================== */

        const orderCard =
            document.createElement("div");

        orderCard.className =
            "order-card";


        /* =====================================
           ITEMS HTML
        ===================================== */

        let itemsHTML = "";


        if (
            Array.isArray(order.items) &&
            order.items.length > 0
        ) {

            order.items.forEach(function (item) {

                const itemName =
                    item.name ||
                    "Medicine";


                const itemPrice =
                    Number(item.price) || 0;


                const quantity =
                    Number(item.quantity) || 1;


                const itemTotal =
                    itemPrice * quantity;


                itemsHTML += `

                    <div class="order-item">

                        <span>
                            ${itemName}
                            × ${quantity}
                        </span>

                        <strong>
                            ₹${itemTotal}
                        </strong>

                    </div>

                `;

            });

        }
        else {

            itemsHTML = `

                <div class="order-item">

                    <span>
                        No item details available
                    </span>

                </div>

            `;

        }


        /* =====================================
           STATUS
        ===================================== */

        const status =
            order.status ||
            "Processing";


        /* =====================================
           PAYMENT
        ===================================== */

        let paymentText =
            "Pending";


        if (
            order.paymentMethod === "cod"
        ) {

            paymentText =
                "Cash on Delivery";

        }
        else if (
            order.paymentMethod === "online"
        ) {

            if (
                order.paymentStatus === "Paid"
            ) {

                paymentText =
                    "Paid Online";

            }
            else {

                paymentText =
                    "Online Payment - Pending";

            }

        }
        else {

            paymentText =
                "Not Selected";

        }


        /* =====================================
           TOTAL
        ===================================== */

        const total =
            Number(order.total) || 0;


        /* =====================================
           ORDER CARD HTML
        ===================================== */

        orderCard.innerHTML = `

            <div class="order-header">


                <div class="order-id">

                    Order #${order.id || "N/A"}

                </div>


                <div class="order-status">

                    ${status}

                </div>


            </div>



            <div class="order-info">


                <p>

                    📅

                    <strong>
                        Order Date:
                    </strong>

                    ${order.orderDate || "N/A"}

                </p>



                <p>

                    🕐

                    <strong>
                        Order Time:
                    </strong>

                    ${order.orderTime || "N/A"}

                </p>



                <p>

                    🚚

                    <strong>
                        Expected Delivery:
                    </strong>

                    ${order.deliveryDate || "N/A"}

                </p>



                <p>

                    💳

                    <strong>
                        Payment:
                    </strong>

                    ${paymentText}

                </p>



                <p>

                    📦

                    <strong>
                        Order Status:
                    </strong>

                    ${status}

                </p>


            </div>



            <div class="order-items">

                ${itemsHTML}

            </div>



            <div class="order-total">

                Total:
                ₹${total}

            </div>

        `;


        /* =====================================
           ADD TO PAGE
        ===================================== */

        ordersContainer.appendChild(
            orderCard
        );

    });

});