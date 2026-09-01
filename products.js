/* =========================================================
   CHEMISTBOYS - PRODUCTS
========================================================= */

const products = [

    {
        id: 1,
        name: "HealMax Pain Relief Tablets",
        price: 49,
        oldPrice: 69,
        category: "painrelief",
        rating: 4.8,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=HealMax",
        discount: "29% OFF",
        newest: true
    },

    {
        id: 2,
        name: "CurePlus Vitamin C",
        price: 199,
        oldPrice: 299,
        category: "vitamins",
        rating: 4.7,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=Vitamin+C",
        discount: "33% OFF",
        newest: true
    },

    {
        id: 3,
        name: "VitaBoost Multivitamin",
        price: 349,
        oldPrice: 499,
        category: "vitamins",
        rating: 4.6,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=VitaBoost",
        discount: "30% OFF",
        newest: false
    },

    {
        id: 4,
        name: "ColdAway Relief Syrup",
        price: 129,
        oldPrice: 179,
        category: "cough",
        rating: 4.5,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=ColdAway",
        discount: "28% OFF",
        newest: true
    },

    {
        id: 5,
        name: "ThermoCheck Digital Thermometer",
        price: 249,
        oldPrice: 349,
        category: "firstaid",
        rating: 4.9,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=Thermometer",
        discount: "29% OFF",
        newest: true
    },

    {
        id: 6,
        name: "SafeCare Antiseptic Solution",
        price: 99,
        oldPrice: 129,
        category: "firstaid",
        rating: 4.6,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=SafeCare",
        discount: "23% OFF",
        newest: false
    },

    {
        id: 7,
        name: "SkinGlow Aloe Vera Gel",
        price: 179,
        oldPrice: 249,
        category: "skincare",
        rating: 4.7,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=SkinGlow",
        discount: "28% OFF",
        newest: true
    },

    {
        id: 8,
        name: "FlexiHeal Pain Relief Spray",
        price: 219,
        oldPrice: 299,
        category: "painrelief",
        rating: 4.4,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=FlexiHeal",
        discount: "27% OFF",
        newest: false
    },

    {
        id: 9,
        name: "CareBox First Aid Kit",
        price: 599,
        oldPrice: 899,
        category: "firstaid",
        rating: 4.9,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=CareBox",
        discount: "33% OFF",
        newest: true
    },

    {
        id: 10,
        name: "BreatheEasy Cold Tablets",
        price: 89,
        oldPrice: 119,
        category: "cough",
        rating: 4.5,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=BreatheEasy",
        discount: "25% OFF",
        newest: false
    },

    {
        id: 11,
        name: "OmegaCare Capsules",
        price: 449,
        oldPrice: 649,
        category: "vitamins",
        rating: 4.8,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=OmegaCare",
        discount: "31% OFF",
        newest: true
    },

    {
        id: 12,
        name: "DermaSoft Moisturizing Cream",
        price: 279,
        oldPrice: 399,
        category: "skincare",
        rating: 4.6,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=DermaSoft",
        discount: "30% OFF",
        newest: false
    },

    {
        id: 13,
        name: "HealthPro Zinc Tablets",
        price: 159,
        oldPrice: 229,
        category: "vitamins",
        rating: 4.5,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=HealthPro",
        discount: "31% OFF",
        newest: true
    },

    {
        id: 14,
        name: "FreshSkin Vitamin Gel",
        price: 229,
        oldPrice: 329,
        category: "skincare",
        rating: 4.4,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=FreshSkin",
        discount: "30% OFF",
        newest: false
    },

    {
        id: 15,
        name: "QuickAid Emergency Kit",
        price: 799,
        oldPrice: 1099,
        category: "firstaid",
        rating: 4.9,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=QuickAid",
        discount: "27% OFF",
        newest: true
    },

    {
        id: 16,
        name: "CoolBreathe Herbal Syrup",
        price: 149,
        oldPrice: 199,
        category: "cough",
        rating: 4.3,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=CoolBreathe",
        discount: "25% OFF",
        newest: false
    },

    {
        id: 17,
        name: "ActiveLife Calcium Plus",
        price: 399,
        oldPrice: 549,
        category: "vitamins",
        rating: 4.7,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=Calcium+Plus",
        discount: "27% OFF",
        newest: true
    },

    {
        id: 18,
        name: "PureCare Hand Sanitizer",
        price: 79,
        oldPrice: 99,
        category: "firstaid",
        rating: 4.6,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=PureCare",
        discount: "20% OFF",
        newest: false
    },

    {
        id: 19,
        name: "GlowCare Skin Lotion",
        price: 249,
        oldPrice: 349,
        category: "skincare",
        rating: 4.5,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=GlowCare",
        discount: "29% OFF",
        newest: true
    },

    {
        id: 20,
        name: "ReliefPro Muscle Balm",
        price: 119,
        oldPrice: 169,
        category: "painrelief",
        rating: 4.4,
        image: "https://placehold.co/500x400/e9faf7/087c6b?text=ReliefPro",
        discount: "30% OFF",
        newest: false
    }

];


/* =========================================================
   MAKE PRODUCTS AVAILABLE TO script.js
========================================================= */

window.products = products;