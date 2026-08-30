document.addEventListener("DOMContentLoaded", () => {

    const productsGrid =
        document.getElementById("productsGrid");

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const sortFilter =
        document.getElementById("sortFilter");

    const priceRange =
        document.getElementById("priceRange");

    const priceLabel =
        document.getElementById("priceLabel");

    const cartCount =
        document.getElementById("cartCount");

    const toast =
        document.getElementById("toastNotification");

    const shopNow =
        document.querySelector(".hero-btn");


    /* ================= CART ================= */

    let cart =
        JSON.parse(localStorage.getItem("chemistCart")) || [];


    function updateCartCount() {

        if (!cartCount) return;

        cartCount.textContent =
            cart.reduce(
                (total, item) =>
                    total + item.quantity,
                0
            );
    }


    /* ================= PRODUCTS ================= */

    function displayProducts(productList) {

        productsGrid.innerHTML = "";


        if (productList.length === 0) {

            productsGrid.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:60px;
                    font-size:20px;
                ">
                    😔 No products found
                </div>
            `;

            return;
        }


        productList.forEach((product, index) => {

            const card =
                document.createElement("div");

            card.className =
                "product-card";

            card.style.animationDelay =
                `${index * 0.05}s`;


            card.innerHTML = `

                <div class="product-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                    >

                </div>


                <span class="discount">
                    ${product.discount}
                </span>


                <span class="product-category">
                    ${getCategoryName(product.category)}
                </span>


                <h3 class="product-name">
                    ${product.name}
                </h3>


                <div class="product-rating">
                    ⭐ ${product.rating}
                </div>


                <div class="product-price">
                    ₹${product.price}

                    <span class="old-price">
                        ₹${product.oldPrice}
                    </span>
                </div>


                <!-- ADD TO CART BUTTON -->

                <button
                    class="add-cart-btn"
                    data-id="${product.id}"

                    style="
                        display:flex;
                        width:100%;
                        min-height:48px;
                        align-items:center;
                        justify-content:center;
                        gap:8px;

                        margin-top:16px;
                        padding:13px 16px;

                        border:none;
                        border-radius:12px;

                        background:#0ca88f;
                        color:#ffffff;

                        font-family:Arial,Helvetica,sans-serif;
                        font-size:16px;
                        font-weight:700;

                        line-height:1.2;
                        text-align:center;

                        cursor:pointer;

                        box-shadow:0 6px 16px rgba(12,168,143,0.20);

                        appearance:none;
                        -webkit-appearance:none;
                    "
                >
                    🛒 Add to Cart
                </button>

            `;


            productsGrid.appendChild(card);

        });


        /* ================= BUTTON EVENTS ================= */

        document
            .querySelectorAll(".add-cart-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(button.dataset.id);

                        addToCart(id);

                    }
                );


                /* HOVER EFFECT */

                button.addEventListener(
                    "mouseenter",
                    () => {

                        button.style.background =
                            "#087c6b";

                        button.style.transform =
                            "translateY(-2px)";

                    }
                );


                button.addEventListener(
                    "mouseleave",
                    () => {

                        button.style.background =
                            "#0ca88f";

                        button.style.transform =
                            "translateY(0)";

                    }
                );

            });

    }


    /* ================= CATEGORY ================= */

    function getCategoryName(category) {

        const names = {

            painrelief:
                "Pain Relief",

            vitamins:
                "Vitamins",

            cough:
                "Cough & Cold",

            firstaid:
                "First Aid",

            skincare:
                "Skin Care"

        };

        return names[category] || category;

    }


    /* ================= ADD TO CART ================= */

    function addToCart(productId) {

        const product =
            products.find(
                p => p.id === productId
            );


        if (!product) return;


        const existing =
            cart.find(
                item =>
                    item.id === productId
            );


        if (existing) {

            existing.quantity++;

        } else {

            cart.push({

                ...product,

                quantity: 1

            });

        }


        localStorage.setItem(
            "chemistCart",
            JSON.stringify(cart)
        );


        updateCartCount();


        showToast(
            `✅ ${product.name} added to cart`
        );

    }


    /* ================= TOAST ================= */

    function showToast(message) {

        if (!toast) return;


        toast.textContent =
            message;


        toast.classList.add(
            "show"
        );


        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);

    }


    /* ================= FILTER ================= */

    function filterProducts() {

        const searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        const category =
            categoryFilter.value;


        const maxPrice =
            Number(priceRange.value);


        let filtered =
            products.filter(product => {

                const matchesSearch =
                    product.name
                        .toLowerCase()
                        .includes(searchText);


                const matchesCategory =
                    !category ||
                    product.category === category;


                const matchesPrice =
                    product.price <= maxPrice;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesPrice
                );

            });


        /* ================= SORT ================= */

        switch (sortFilter.value) {

            case "price-low":

                filtered.sort(
                    (a, b) =>
                        a.price - b.price
                );

                break;


            case "price-high":

                filtered.sort(
                    (a, b) =>
                        b.price - a.price
                );

                break;


            case "rating":

                filtered.sort(
                    (a, b) =>
                        b.rating - a.rating
                );

                break;


            case "newest":

                filtered.sort(
                    (a, b) =>
                        Number(b.newest) -
                        Number(a.newest)
                );

                break;

        }


        displayProducts(filtered);

    }


    /* ================= EVENTS ================= */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterProducts
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    if (priceRange) {

        priceRange.addEventListener(
            "input",
            () => {

                if (priceLabel) {

                    priceLabel.textContent =
                        `Max Price: ₹${priceRange.value}`;

                }

                filterProducts();

            }
        );

    }


    /* ================= SHOP NOW ================= */

    if (shopNow) {

        shopNow.addEventListener(
            "click",
            () => {

                const productsSection =
                    document.querySelector(
                        ".products-section"
                    );


                if (productsSection) {

                    productsSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    }


    /* ================= INITIAL LOAD ================= */

    updateCartCount();

    displayProducts(products);

});