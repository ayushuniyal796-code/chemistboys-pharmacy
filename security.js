// ======================================================
// CHEMISTBOYS - SECURITY LAYER
// ======================================================

"use strict";

// ---------- XSS PROTECTION ----------

// Escape text before putting it into HTML
function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    const div = document.createElement("div");
    div.textContent = String(value);

    return div.innerHTML;
}


// Safe text output
function setSafeText(element, value) {
    if (!element) return;

    element.textContent = value ?? "";
}


// Remove dangerous characters from normal user input
function sanitizeInput(value, maxLength = 500) {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/[<>]/g, "")
        .trim()
        .slice(0, maxLength);
}


// ---------- EMAIL VALIDATION ----------

function isValidEmail(email) {
    if (typeof email !== "string") return false;

    const regex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return regex.test(email.trim());
}


// ---------- PASSWORD VALIDATION ----------

function isStrongPassword(password) {
    if (typeof password !== "string") {
        return false;
    }

    // Minimum 8 characters
    // At least uppercase, lowercase, number and special character
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}


// ---------- PHONE VALIDATION ----------

function isValidPhone(phone) {
    if (typeof phone !== "string") return false;

    return /^[6-9][0-9]{9}$/.test(phone.trim());
}


// ---------- NUMBER VALIDATION ----------

function safeNumber(value, min = 0, max = 1000000) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return null;
    }

    if (number < min || number > max) {
        return null;
    }

    return number;
}


// ---------- PRODUCT PRICE ----------

function validatePrice(price) {
    return safeNumber(price, 0, 1000000);
}


// ---------- PRODUCT STOCK ----------

function validateStock(stock) {
    return safeNumber(stock, 0, 10000000);
}


// ---------- URL PROTECTION ----------

function isSafeURL(url) {

    if (typeof url !== "string") {
        return false;
    }

    try {

        const parsed = new URL(url, window.location.origin);

        return (
            parsed.protocol === "https:" ||
            parsed.protocol === "http:"
        );

    } catch {
        return false;
    }
}


// ---------- SAFE REDIRECT ----------

function safeRedirect(path) {

    const allowedPages = [
        "index.html",
        "login.html",
        "register.html",
        "account.html",
        "cart.html",
        "checkout.html"
    ];

    const page = String(path).split("/").pop();

    if (allowedPages.includes(page)) {
        window.location.href = path;
    }
}


// ---------- BASIC RATE LIMIT ----------

const securityAttempts = {};

function rateLimit(action, maxAttempts = 5, windowMs = 60000) {

    const now = Date.now();

    if (!securityAttempts[action]) {
        securityAttempts[action] = [];
    }

    // Remove old attempts
    securityAttempts[action] =
        securityAttempts[action].filter(
            time => now - time < windowMs
        );

    if (securityAttempts[action].length >= maxAttempts) {
        console.warn("Security rate limit triggered:", action);
        return false;
    }

    securityAttempts[action].push(now);

    return true;
}


// ---------- SECURITY CHECK ----------

function securityCheck() {

    // Do not allow website to run inside unexpected iframe
    if (window.top !== window.self) {
        console.warn("Possible clickjacking attempt detected.");
    }

    // Warn if HTTPS is not being used
    if (
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
    ) {
        console.warn(
            "WARNING: ChemistBoys is not running over HTTPS."
        );
    }
}


// Run security check
securityCheck();


// ---------- FREEZE SECURITY FUNCTIONS ----------

Object.freeze({
    escapeHTML,
    sanitizeInput,
    isValidEmail,
    isStrongPassword,
    isValidPhone,
    validatePrice,
    validateStock,
    isSafeURL,
    rateLimit
});