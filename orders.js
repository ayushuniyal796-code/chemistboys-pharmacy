document.addEventListener("DOMContentLoaded", function () {

    const ordersContainer =
        document.getElementById("ordersContainer");


    /*
        Demo orders

        Baad mein Firebase/database se
        real orders yahan load karenge.
    */

    const orders = [

        {
            id: "CB10245",
            date: "30 August 2026",
            delivery: "2 September 2026",
            status: "Out for Delivery",

            items: [
                {
                    name: "Paracetamol 500mg",
                    quantity: 2,
                    price: 120
                },
                {
                    name: "Vitamin C Tablets",
                    quantity: 1,
                    price: 199
                },
                {
                    name: "First Aid Kit",
                    quantity: 1,
                    price: 330
                }
            ],

            total: 769
        },

        {
            id: "CB10231",
            date: "25 August 2026",
            delivery: "28 August 2026",
            status: "Delivered",

            items: [
                {
                    name: "Multivitamin Tablets",
                    quantity: 1,
                    price: 299
                }
            ],

            total: 299
        }

    ];


    if (orders.length === 0) {

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
                    Start Shopping
                </a>

            </div>

        `;

        return;

    }


    ordersContainer.innerHTML = "";


    orders.forEach(function (order) {

        const orderCard =
            document.createElement("div");

        orderCard.className =
            "order-card";


        let itemsHTML = "";


        order.items.forEach(function (item) {

            itemsHTML += `

                <div class="order-item">

                    <span>
                        ${item.name}
                        × ${item.quantity}
                    </span>

                    <strong>
                        ₹${item.price * item.quantity}
                    </strong>

                </div>

            `;

        });


        orderCard.innerHTML = `

            <div class="order-header">

                <div class="order-id">

                    Order #${order.id}

                </div>

                <div class="order-status">

                    ${order.status}

                </div>

            </div>


            <div class="order-info">

                <p>
                    📅 <strong>Order Date:</strong>
                    ${order.date}
                </p>

                <p>
                    🚚 <strong>Expected Delivery:</strong>
                    ${order.delivery}
                </p>

                <p>
                    💳 <strong>Payment:</strong>
                    Paid
                </p>

                <p>
                    📦 <strong>Order Status:</strong>
                    ${order.status}
                </p>

            </div>


            <div class="order-items">

                ${itemsHTML}

            </div>


            <div class="order-total">

                Total: ₹${order.total}

            </div>

        `;


        ordersContainer.appendChild(orderCard);

    });

});