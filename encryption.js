// ======================================================
// CHEMISTBOYS - ENCRYPTION LAYER
// Uses AES-GCM
// ======================================================

"use strict";


// Convert text -> bytes
function textToBytes(text) {
    return new TextEncoder().encode(text);
}


// Convert bytes -> Base64
function bytesToBase64(bytes) {

    let binary = "";

    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}


// Convert Base64 -> bytes
function base64ToBytes(base64) {

    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}


// Generate encryption key
async function generateEncryptionKey() {

    return await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}


// Export key
async function exportEncryptionKey(key) {

    const rawKey =
        await crypto.subtle.exportKey("raw", key);

    return bytesToBase64(
        new Uint8Array(rawKey)
    );
}


// Import key
async function importEncryptionKey(base64Key) {

    const rawKey = base64ToBytes(base64Key);

    return await crypto.subtle.importKey(
        "raw",
        rawKey,
        {
            name: "AES-GCM"
        },
        true,
        ["encrypt", "decrypt"]
    );
}


// Encrypt text
async function encryptData(text, key) {

    const iv = crypto.getRandomValues(
        new Uint8Array(12)
    );

    const encrypted =
        await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            textToBytes(text)
        );

    return {
        iv: bytesToBase64(iv),
        data: bytesToBase64(
            new Uint8Array(encrypted)
        )
    };
}


// Decrypt text
async function decryptData(encryptedObject, key) {

    const iv =
        base64ToBytes(encryptedObject.iv);

    const encryptedData =
        base64ToBytes(encryptedObject.data);

    const decrypted =
        await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encryptedData
        );

    return new TextDecoder().decode(decrypted);
}