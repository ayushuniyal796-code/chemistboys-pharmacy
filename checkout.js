document.addEventListener("DOMContentLoaded", () => {

    let cart =
        JSON.parse(localStorage.getItem("chemistCart")) || [];


    const cartCount =
        document.getElementById("cartCount");

    const orderItems =
        document.getElementById("orderItems");

    const subtotalElement =
        document.getElementById("subtotal");

    const deliveryElement =
        document.getElementById("delivery");

    const totalElement =
        document.getElementById("total");

    const checkoutForm =
        document.getElementById("checkoutForm");

    const checkoutContent =
        document.getElementById("checkoutContent");

    const successScreen =
        document.getElementById("successScreen");

    const orderIdElement =
        document.getElementById("orderId");


    /* ================= CART COUNT ================= */

    function updateCartCount() {

        const count = cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

        cartCount.textContent = count;
    }


    /* ================= CHECK EMPTY CART ================= */

    if (cart.length === 0) {

        checkoutContent.innerHTML = `

            <div style="
                text-align:center;
                padding:70px 20px;
                background:white;
                border-radius:25px;
            ">

                <div style="font-size:70px;">
                    🛒
                </div>

                <h2>
                    Your cart is empty
                </h2>

                <p style="margin:10px 0 25px;">
                    Add some products before checkout.
                </p>

                <a
                    href="index.html"
                    class="checkout-btn"
                    style="
                        display:inline-block;
                        width:auto;
                        text-decoration:none;
                    "
                >
                    🛍️ Shop Now
                </a>

            </div>

        `;

        return;
    }


    /* ================= ORDER ITEMS ================= */

    function displayOrderItems() {

        orderItems.innerHTML = "";

        cart.forEach(item => {

            const div =
                document.createElement("div");

            div.className =
                "summary-item";

            div.innerHTML = `

                <span>
                    ${item.name}
                    × ${item.quantity}
                </span>

                <strong>
                    ₹${item.price * item.quantity}
                </strong>

            `;

            orderItems.appendChild(div);

        });

    }


    /* ================= CALCULATE ================= */

    function calculateTotal() {

        const subtotal =
            cart.reduce(
                (total, item) =>
                    total +
                    item.price *
                    item.quantity,
                0
            );


        const delivery =
            subtotal >= 500
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


    /* ================= PLACE ORDER ================= */

    checkoutForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "fullName"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const address =
                document.getElementById(
                    "address"
                ).value.trim();


            const city =
                document.getElementById(
                    "city"
                ).value.trim();


            const pincode =
                document.getElementById(
                    "pincode"
                ).value.trim();


            if (
                !name ||
                !phone ||
                !email ||
                !address ||
                !city ||
                !pincode
            ) {

                alert(
                    "Please fill all details."
                );

                return;
            }


            /* Generate Demo Order ID */

            const orderId =
                "CB" +
                Date.now()
                    .toString()
                    .slice(-8);


            orderIdElement.textContent =
                orderId;


            /* Save demo order */

            const order = {

                orderId: orderId,

                customer: {
                    name,
                    phone,
                    email,
                    address,
                    city,
                    pincode
                },

                products: cart,

                total:
                    totalElement.textContent,

                date:
                    new Date().toLocaleString()

            };


            localStorage.setItem(
                "lastOrder",
                JSON.stringify(order)
            );


            /* Empty cart */

            localStorage.removeItem(
                "chemistCart"
            );


            /* Show success */

            checkoutContent.style.display =
                "none";

            successScreen.style.display =
                "block";


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    /* ================= INITIAL ================= */

    updateCartCount();

    displayOrderItems();

    calculateTotal();

});