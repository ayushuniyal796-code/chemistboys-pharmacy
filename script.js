/* =========================================================
   CHEMISTBOYS - MAIN SCRIPT
========================================================= */


/* =========================================================
   GET PRODUCTS
========================================================= */

const products = window.products || [];


/* =========================================================
   GLOBAL STATE
========================================================= */

let displayedProducts = [...products];

let currentCategory = "all";

let currentSearch = "";

let currentSort = "default";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const productContainer =
    document.getElementById("productContainer");

const searchInput =
    document.getElementById("searchInput");

const categoryButtons =
    document.querySelectorAll("[data-category]");

const sortSelect =
    document.getElementById("sortSelect");


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts(productList) {

    if (!productContainer) {
        console.error(
            "Product container not found."
        );
        return;
    }


    productContainer.innerHTML = "";


    if (productList.length === 0) {

        productContainer.innerHTML = `
            <div class="no-products">
                <h3>😔 No products found</h3>
                <p>Try another search or category.</p>
            </div>
        `;

        return;
    }


    productList.forEach(function (product) {

        const card =
            document.createElement("div");

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

                <h3 class="product-name">
                    ${product.name}
                </h3>


                <div class="product-rating">

                    <span>
                        ⭐ ${product.rating}
                    </span>

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
                    class="add-cart-btn"
                    data-product-id="${product.id}"
                >
                    🛒 Add to Cart
                </button>

            </div>

        `;


        productContainer.appendChild(card);

    });


    attachCartButtons();

}


/* =========================================================
   FILTER PRODUCTS
========================================================= */

function filterProducts() {

    let result =
        [...products];


    /* CATEGORY */

    if (
        currentCategory !== "all"
    ) {

        result =
            result.filter(function (product) {

                return (
                    product.category ===
                    currentCategory
                );

            });

    }


    /* SEARCH */

    if (
        currentSearch
    ) {

        const search =
            currentSearch.toLowerCase();


        result =
            result.filter(function (product) {

                return (

                    product.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    product.category
                        .toLowerCase()
                        .includes(search)

                );

            });

    }


    /* SORT */

    if (
        currentSort === "low"
    ) {

        result.sort(function (a, b) {

            return a.price - b.price;

        });

    }


    else if (
        currentSort === "high"
    ) {

        result.sort(function (a, b) {

            return b.price - a.price;

        });

    }


    else if (
        currentSort === "rating"
    ) {

        result.sort(function (a, b) {

            return b.rating - a.rating;

        });

    }


    else if (
        currentSort === "newest"
    ) {

        result.sort(function (a, b) {

            return (
                Number(b.newest) -
                Number(a.newest)
            );

        });

    }


    displayedProducts =
        result;


    displayProducts(
        displayedProducts
    );

}


/* =========================================================
   CATEGORY BUTTONS
========================================================= */

categoryButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentCategory =
                    button.dataset.category ||
                    "all";


                categoryButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                filterProducts();

            }
        );

    }
);


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            currentSearch =
                searchInput.value.trim();


            filterProducts();

        }
    );

}


/* =========================================================
   SORT
========================================================= */

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        function () {

            currentSort =
                sortSelect.value;


            filterProducts();

        }
    );

}


/* =========================================================
   CART
========================================================= */

function getCart() {

    try {

        const cart =
            JSON.parse(
                localStorage.getItem(
                    "chemistboys_cart"
                )
            );


        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        console.error(
            "Cart read error:",
            error
        );

        return [];

    }

}


function saveCart(cart) {

    localStorage.setItem(
        "chemistboys_cart",
        JSON.stringify(cart)
    );

}


function addToCart(productId) {

    const product =
        products.find(function (item) {

            return (
                item.id ===
                productId
            );

        });


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;

    }


    const cart =
        getCart();


    const existingItem =
        cart.find(function (item) {

            return (
                item.id ===
                productId
            );

        });


    if (existingItem) {

        existingItem.quantity =
            (existingItem.quantity || 1) + 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            image: product.image,

            quantity: 1

        });

    }


    saveCart(cart);


    updateCartCount();


    alert(
        "✅ " +
        product.name +
        " added to cart!"
    );

}


/* =========================================================
   CART BUTTONS
========================================================= */

function attachCartButtons() {

    const buttons =
        document.querySelectorAll(
            ".add-cart-btn"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const productId =
                    Number(
                        button.dataset.productId
                    );


                addToCart(
                    productId
                );

            }
        );

    });

}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    const cart =
        getCart();


    const count =
        cart.reduce(
            function (total, item) {

                return (
                    total +
                    (item.quantity || 1)
                );

            },
            0
        );


    const cartCountElements =
        document.querySelectorAll(
            "#cartCount, .cart-count"
        );


    cartCountElements.forEach(
        function (element) {

            element.textContent =
                count;

        }
    );

}


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !Array.isArray(
                window.products
            )
        ) {

            console.error(
                "products.js was not loaded."
            );

            return;

        }


        displayProducts(
            products
        );


        updateCartCount();

    }
);