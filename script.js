document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       ELEMENTS
    ========================================== */

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
        document.getElementById("shopNowBtn");


    /* ==========================================
       CART
    ========================================== */

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem("chemistCart")
            ) || [];

        if (!Array.isArray(cart)) {
            cart = [];
        }

    } catch (error) {

        console.error("Cart loading error:", error);

        cart = [];

    }


    /* ==========================================
       CART COUNT
    ========================================== */

    function updateCartCount() {

        if (!cartCount) return;

        const count =
            cart.reduce(
                (total, item) => {

                    return total +
                        Number(item.quantity || 0);

                },
                0
            );

        cartCount.textContent = count;

    }


    /* ==========================================
       LOGIN CHECK
    ========================================== */

    function requireLogin() {

        /*
         * account.js Firebase user ko
         * window.currentFirebaseUser mein rakhta hai.
         */

        if (window.currentFirebaseUser) {

            return true;

        }


        showToast(
            "🔒 Please login first to add products."
        );


        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 900);


        return false;

    }


    /* ==========================================
       DISPLAY PRODUCTS
    ========================================== */

    function displayProducts(productList) {

        if (!productsGrid) return;


        productsGrid.innerHTML = "";


        if (
            !Array.isArray(productList) ||
            productList.length === 0
        ) {

            productsGrid.innerHTML = `

                <div style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:60px 20px;
                    font-size:20px;
                ">

                    😔 No products found

                </div>

            `;

            return;

        }


        productList.forEach(
            (product, index) => {

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

                        ${product.discount || ""}

                    </span>


                    <span class="product-category">

                        ${getCategoryName(
                            product.category
                        )}

                    </span>


                    <h3 class="product-name">

                        ${product.name}

                    </h3>


                    <div class="product-rating">

                        ⭐ ${product.rating || 0}

                    </div>


                    <div class="product-price">

                        ₹${product.price}

                        <span class="old-price">

                            ${
                                product.oldPrice
                                    ? "₹" + product.oldPrice
                                    : ""
                            }

                        </span>

                    </div>


                    <button
                        type="button"
                        class="add-cart-btn"
                        data-id="${product.id}"
                    >

                        🛒 Add to Cart

                    </button>

                `;


                productsGrid.appendChild(card);

            }
        );


        /* ==========================================
           ADD TO CART EVENTS
        ========================================== */

        document
            .querySelectorAll(".add-cart-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const productId =
                            Number(
                                button.dataset.id
                            );


                        addToCart(productId);

                    }
                );


                /* HOVER */

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


    /* ==========================================
       CATEGORY NAME
    ========================================== */

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


        return (
            names[category] ||
            category ||
            ""
        );

    }


    /* ==========================================
       ADD TO CART
    ========================================== */

    function addToCart(productId) {

        /* LOGIN REQUIRED */

        if (!requireLogin()) {

            return;

        }


        /* FIND PRODUCT */

        const product =
            products.find(
                p =>
                    Number(p.id) ===
                    Number(productId)
            );


        if (!product) {

            console.error(
                "Product not found:",
                productId
            );

            return;

        }


        /* FIND EXISTING PRODUCT */

        const existing =
            cart.find(
                item =>
                    Number(item.id) ===
                    Number(productId)
            );


        if (existing) {

            existing.quantity =
                Number(
                    existing.quantity || 0
                ) + 1;

        } else {

            cart.push({

                ...product,

                quantity: 1

            });

        }


        /* SAVE CART */

        localStorage.setItem(
            "chemistCart",
            JSON.stringify(cart)
        );


        updateCartCount();


        showToast(
            `✅ ${product.name} added to cart`
        );

    }


    /* ==========================================
       TOAST
    ========================================== */

    function showToast(message) {

        if (!toast) {

            alert(message);

            return;

        }


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


    /* ==========================================
       FILTER PRODUCTS
    ========================================== */

    function filterProducts() {

        if (!Array.isArray(products)) {

            console.error(
                "Products array not found."
            );

            return;

        }


        const searchText =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        const category =
            categoryFilter
                ? categoryFilter.value
                : "";


        const maxPrice =
            priceRange
                ? Number(priceRange.value)
                : Infinity;


        let filtered =
            products.filter(
                product => {

                    const productName =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const matchesSearch =
                        productName.includes(
                            searchText
                        );


                    const matchesCategory =
                        !category ||
                        product.category ===
                            category;


                    const matchesPrice =
                        Number(
                            product.price
                        ) <= maxPrice;


                    return (
                        matchesSearch &&
                        matchesCategory &&
                        matchesPrice
                    );

                }
            );


        /* ==========================================
           SORT
        ========================================== */

        const sort =
            sortFilter
                ? sortFilter.value
                : "";


        switch (sort) {

            case "price-low":

                filtered.sort(
                    (a, b) =>
                        Number(a.price) -
                        Number(b.price)
                );

                break;


            case "price-high":

                filtered.sort(
                    (a, b) =>
                        Number(b.price) -
                        Number(a.price)
                );

                break;


            case "rating":

                filtered.sort(
                    (a, b) =>
                        Number(
                            b.rating || 0
                        ) -
                        Number(
                            a.rating || 0
                        )
                );

                break;


            case "newest":

                filtered.sort(
                    (a, b) =>
                        Number(
                            b.newest || 0
                        ) -
                        Number(
                            a.newest || 0
                        )
                );

                break;

        }


        displayProducts(filtered);

    }


    /* ==========================================
       SEARCH
    ========================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterProducts
        );

    }


    /* ==========================================
       CATEGORY
    ========================================== */

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    /* ==========================================
       SORT
    ========================================== */

    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    /* ==========================================
       PRICE RANGE
    ========================================== */

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


    /* ==========================================
       SHOP NOW
    ========================================== */

    if (shopNow) {

        shopNow.addEventListener(
            "click",
            () => {

                const productsSection =
                    document.getElementById(
                        "products"
                    );


                if (productsSection) {

                    productsSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    }


    /* ==========================================
       INITIAL LOAD
    ========================================== */

    updateCartCount();


    if (
        typeof products !==
        "undefined"
    ) {

        displayProducts(products);

    } else {

        console.error(
            "products.js is not loaded."
        );

    }

});