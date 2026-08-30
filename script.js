/* =========================================================
   CHEMISTBOYS - MAIN SCRIPT
========================================================= */

import {
    auth,
    authReady
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   GLOBAL CART
========================================================= */

let cart =
    JSON.parse(localStorage.getItem("chemistCart")) || [];


/* =========================================================
   ELEMENTS
========================================================= */

const productsGrid =
    document.getElementById("productsGrid");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

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

const shopNowBtn =
    document.getElementById("shopNowBtn");

const toastNotification =
    document.getElementById("toastNotification");


/* =========================================================
   AUTH STATE
========================================================= */

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    currentUser = user || null;

    window.currentFirebaseUser =
        currentUser;

});


/* =========================================================
   REQUIRE LOGIN
========================================================= */

async function requireLogin() {

    /*
     * Wait until Firebase has finished
     * restoring the authentication state.
     */

    await authReady;


    /*
     * Read the SAME Firebase auth instance.
     */

    currentUser =
        auth.currentUser || null;


    window.currentFirebaseUser =
        currentUser;


    if (currentUser) {

        return true;

    }


    alert("🔒 Please login first.");

    window.location.href =
        "login.html";

    return false;
}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) => {

                return total +
                    Number(item.quantity || 0);

            },
            0
        );


    if (cartCount) {

        cartCount.textContent =
            count;

    }

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        "chemistCart",
        JSON.stringify(cart)
    );

    updateCartCount();

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toastNotification) {

        alert(message);

        return;

    }


    toastNotification.textContent =
        message;


    toastNotification.classList.add(
        "show"
    );


    setTimeout(() => {

        toastNotification.classList.remove(
            "show"
        );

    }, 2500);

}


/* =========================================================
   ADD TO CART
========================================================= */

async function addToCart(productId) {

    const loggedIn =
        await requireLogin();


    if (!loggedIn) {

        return;

    }


    const product =
        products.find(
            product =>
                String(product.id) ===
                String(productId)
        );


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;

    }


    const existing =
        cart.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (existing) {

        existing.quantity =
            Number(existing.quantity || 0) + 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price:
                Number(product.price) || 0,

            category:
                product.category || "",

            rating:
                product.rating || 0,

            quantity: 1

        });

    }


    saveCart();


    showToast(
        `✅ ${product.name} added to cart`
    );

}


/* =========================================================
   BUY NOW
========================================================= */

async function buyNow(productId) {

    const loggedIn =
        await requireLogin();


    if (!loggedIn) {

        return;

    }


    const product =
        products.find(
            product =>
                String(product.id) ===
                String(productId)
        );


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;

    }


    cart = [{

        id: product.id,

        name: product.name,

        price:
            Number(product.price) || 0,

        category:
            product.category || "",

        rating:
            product.rating || 0,

        quantity: 1

    }];


    saveCart();


    window.location.href =
        "checkout.html";

}


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts(list) {

    if (!productsGrid) {

        return;

    }


    productsGrid.innerHTML = "";


    if (!list || list.length === 0) {

        productsGrid.innerHTML = `

            <div class="no-products">

                <h2>
                    😕 No Products Found
                </h2>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(product => {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        const price =
            Number(product.price) || 0;


        const rating =
            Number(product.rating) || 0;


        card.innerHTML = `

            <div class="product-image">

                ${
                    product.image
                        ? `<img
                            src="${product.image}"
                            alt="${product.name || "Medicine"}"
                          >`
                        : "💊"
                }

            </div>


            <div class="product-details">

                <h3 class="product-name">
                    ${product.name || "Medicine"}
                </h3>


                <p class="product-category">
                    ${product.category || ""}
                </p>


                <div class="product-rating">

                    ⭐ ${rating}

                </div>


                <div class="product-bottom">

                    <strong class="product-price">
                        ₹${price}
                    </strong>


                    <button
                        type="button"
                        class="add-cart-btn"
                        data-id="${product.id}"
                    >
                        🛒 Add to Cart
                    </button>

                </div>


                <button
                    type="button"
                    class="buy-now-btn"
                    data-buy-id="${product.id}"
                >
                    ⚡ Buy Now
                </button>

            </div>

        `;


        productsGrid.appendChild(card);

    });


    addProductEvents();

}


/* =========================================================
   PRODUCT BUTTON EVENTS
========================================================= */

function addProductEvents() {

    document
        .querySelectorAll(".add-cart-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    addToCart(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".buy-now-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    buyNow(
                        button.dataset.buyId
                    );

                }
            );

        });

}


/* =========================================================
   FILTER + SEARCH
========================================================= */

function filterProducts() {

    if (
        typeof products ===
        "undefined"
    ) {

        return;

    }


    let filtered =
        [...products];


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (search) {

        filtered =
            filtered.filter(product => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();


                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    category.includes(search)
                );

            });

    }


    const category =
        categoryFilter
            ? categoryFilter.value
            : "";


    if (category) {

        filtered =
            filtered.filter(product => {

                return String(
                    product.category || ""
                ).toLowerCase() ===
                category.toLowerCase();

            });

    }


    const maxPrice =
        priceRange
            ? Number(priceRange.value)
            : 5000;


    filtered =
        filtered.filter(product => {

            return Number(
                product.price || 0
            ) <= maxPrice;

        });


    const sort =
        sortFilter
            ? sortFilter.value
            : "";


    if (sort === "price-low") {

        filtered.sort(
            (a, b) =>
                Number(a.price || 0) -
                Number(b.price || 0)
        );

    }


    if (sort === "price-high") {

        filtered.sort(
            (a, b) =>
                Number(b.price || 0) -
                Number(a.price || 0)
        );

    }


    if (sort === "rating") {

        filtered.sort(
            (a, b) =>
                Number(b.rating || 0) -
                Number(a.rating || 0)
        );

    }


    if (sort === "newest") {

        filtered.reverse();

    }


    displayProducts(filtered);

}


/* =========================================================
   SEARCH BUTTON
========================================================= */

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        filterProducts
    );

}


/* =========================================================
   SEARCH ENTER
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                filterProducts();

            }

        }
    );


    searchInput.addEventListener(
        "input",
        filterProducts
    );

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

}


/* =========================================================
   SORT FILTER
========================================================= */

if (sortFilter) {

    sortFilter.addEventListener(
        "change",
        filterProducts
    );

}


/* =========================================================
   PRICE FILTER
========================================================= */

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


/* =========================================================
   SHOP NOW
========================================================= */

if (shopNowBtn) {

    shopNowBtn.addEventListener(
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


/* =========================================================
   INITIAL LOAD
========================================================= */

updateCartCount();


if (
    typeof products !==
    "undefined"
) {

    displayProducts(products);

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.addToCart =
    addToCart;

window.buyNow =
    buyNow;

window.requireLogin =
    requireLogin;

window.updateCartCount =
    updateCartCount;