/* =========================================================
   CHEMISTBOYS - MAIN SCRIPT
========================================================= */


/* =========================================================
   FIREBASE LOGIN CHECK
   Firebase auth state ready hone ke baad hi user check hoga
========================================================= */

async function requireLogin() {

    try {

        /* Wait for Firebase to restore the auth state */

        if (window.firebaseAuthReady) {

            await window.firebaseAuthReady;

        }


        /* Get current Firebase user */

        const user =
            window.firebaseAuth
                ? window.firebaseAuth.currentUser
                : null;


        /* User is not logged in */

        if (!user) {

            alert(
                "Please login first to continue."
            );

            window.location.href =
                "login.html";

            return false;

        }


        /* User is logged in */

        return true;


    } catch (error) {

        console.error(
            "❌ Login check error:",
            error
        );

        window.location.href =
            "login.html";

        return false;

    }

}


/* Make requireLogin available to other scripts */

window.requireLogin =
    requireLogin;


/* =========================================================
   MAIN WEBSITE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================================
           PRODUCTS
        ===================================================== */

        const products =
            Array.isArray(window.products)
                ? window.products
                : [];


        const productsGrid =
            document.getElementById(
                "productsGrid"
            );


        const searchInput =
            document.getElementById(
                "searchInput"
            );


        const searchBtn =
            document.getElementById(
                "searchBtn"
            );


        const categoryFilter =
            document.getElementById(
                "categoryFilter"
            );


        const sortFilter =
            document.getElementById(
                "sortFilter"
            );


        const priceRange =
            document.getElementById(
                "priceRange"
            );


        const priceLabel =
            document.getElementById(
                "priceLabel"
            );


        /* =====================================================
           CHECK PRODUCTS
        ===================================================== */

        if (!productsGrid) {

            console.error(
                "❌ productsGrid not found in index.html"
            );

            return;

        }


        if (products.length === 0) {

            productsGrid.innerHTML = `
                <p class="no-products">
                    No products available.
                </p>
            `;

            console.error(
                "❌ products.js did not load."
            );

            return;

        }


        /* =====================================================
           DISPLAY PRODUCTS
        ===================================================== */

        function displayProducts(list) {

            productsGrid.innerHTML = "";


            if (list.length === 0) {

                productsGrid.innerHTML = `
                    <div class="no-products">
                        <h3>😔 No products found</h3>
                        <p>Try another search or filter.</p>
                    </div>
                `;

                return;

            }


            list.forEach(
                function (product) {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "product-card";


                    card.innerHTML = `

                        <div class="product-image">

                            <img
                                src="${product.image}"
                                alt="${product.name}"
                                loading="lazy"
                            >

                            ${
                                product.discount
                                    ? `
                                        <span class="discount-badge">
                                            ${product.discount}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>


                        <div class="product-info">

                            <h3>
                                ${product.name}
                            </h3>


                            <div class="product-rating">
                                ⭐ ${product.rating}
                            </div>


                            <div class="product-price">

                                <span class="current-price">
                                    ₹${product.price}
                                </span>

                                ${
                                    product.oldPrice
                                        ? `
                                            <span class="old-price">
                                                ₹${product.oldPrice}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            <button
                                type="button"
                                class="add-cart-btn"
                                data-product-id="${product.id}"
                            >
                                🛒 Add to Cart
                            </button>

                        </div>

                    `;


                    productsGrid.appendChild(
                        card
                    );

                }
            );

        }


        /* =====================================================
           FILTER + SEARCH + SORT
        ===================================================== */

        function applyFilters() {

            let result =
                [...products];


            /* SEARCH */

            const search =
                searchInput
                    ? searchInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            if (search) {

                result =
                    result.filter(
                        function (product) {

                            return (

                                product.name
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                product.category
                                    .toLowerCase()
                                    .includes(search)

                            );

                        }
                    );

            }


            /* CATEGORY */

            const category =
                categoryFilter
                    ? categoryFilter.value
                    : "all";


            if (
                category &&
                category !== "all"
            ) {

                result =
                    result.filter(
                        function (product) {

                            return (
                                product.category ===
                                category
                            );

                        }
                    );

            }


            /* PRICE */

            const maxPrice =
                priceRange
                    ? Number(
                        priceRange.value
                    )
                    : Infinity;


            result =
                result.filter(
                    function (product) {

                        return (
                            Number(product.price) <=
                            maxPrice
                        );

                    }
                );


            /* SORT */

            const sort =
                sortFilter
                    ? sortFilter.value
                    : "default";


            if (sort === "low") {

                result.sort(
                    function (a, b) {

                        return (
                            a.price -
                            b.price
                        );

                    }
                );

            }


            else if (sort === "high") {

                result.sort(
                    function (a, b) {

                        return (
                            b.price -
                            a.price
                        );

                    }
                );

            }


            else if (sort === "rating") {

                result.sort(
                    function (a, b) {

                        return (
                            b.rating -
                            a.rating
                        );

                    }
                );

            }


            else if (sort === "newest") {

                result.sort(
                    function (a, b) {

                        return (
                            Number(b.newest) -
                            Number(a.newest)
                        );

                    }
                );

            }


            displayProducts(
                result
            );

        }


        /* =====================================================
           SEARCH BUTTON
        ===================================================== */

        if (searchBtn) {

            searchBtn.addEventListener(
                "click",
                function () {

                    applyFilters();

                }
            );

        }


        /* =====================================================
           SEARCH ENTER KEY
        ===================================================== */

        if (searchInput) {

            searchInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        applyFilters();

                    }

                }
            );


            /* Live search */

            searchInput.addEventListener(
                "input",
                function () {

                    applyFilters();

                }
            );

        }


        /* =====================================================
           CATEGORY FILTER
        ===================================================== */

        if (categoryFilter) {

            categoryFilter.addEventListener(
                "change",
                function () {

                    applyFilters();

                }
            );

        }


        /* =====================================================
           SORT FILTER
        ===================================================== */

        if (sortFilter) {

            sortFilter.addEventListener(
                "change",
                function () {

                    applyFilters();

                }
            );

        }


        /* =====================================================
           PRICE FILTER
        ===================================================== */

        if (priceRange) {

            function updatePrice() {

                const value =
                    Number(
                        priceRange.value
                    );


                if (priceLabel) {

                    priceLabel.textContent =
                        `Up to ₹${value}`;

                }


                applyFilters();

            }


            priceRange.addEventListener(
                "input",
                updatePrice
            );


            updatePrice();

        }


        /* =====================================================
           ADD TO CART
        ===================================================== */

        document.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        ".add-cart-btn"
                    );


                if (!button) {

                    return;

                }


                const productId =
                    Number(
                        button.dataset.productId
                    );


                if (
                    typeof window.addToCart ===
                    "function"
                ) {

                    window.addToCart(
                        productId
                    );

                } else {

                    console.error(
                        "❌ addToCart function not found."
                    );

                }

            }
        );


        /* =====================================================
           INITIAL DISPLAY
        ===================================================== */

        displayProducts(
            products
        );

    }
);