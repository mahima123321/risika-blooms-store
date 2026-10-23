// Data for "Build Your Own Bouquet" and "Gift Combo Builder"
// Every stem and combo element has a unique, high-resolution photo

export const FLORAL_STEMS = [
  {
    id: "stem-velvet-pink-tulip",
    name: "Plush Pink Velvet Tulip",
    nameHindi: "Plush Pink Velvet Tulip",
    category: "Velvet Tulips",
    color: "Pastel Pink",
    hex: "#F48FB1",
    pricePerStem: 150,
    minQty: 0,
    maxQty: 30,
    image: "/images/velvet_single_pink_tulip.jpg"
  },
  {
    id: "stem-velvet-sunflower",
    name: "Golden Velvet Sunflower",
    nameHindi: "Golden Velvet Sunflower",
    category: "Sunflowers",
    color: "Bright Yellow",
    hex: "#FBC02D",
    pricePerStem: 220,
    minQty: 0,
    maxQty: 15,
    image: "/images/velvet_sunflower_magenta_cone.jpg"
  },
  {
    id: "stem-velvet-wine-lily",
    name: "Handcrafted Wine Red Velvet Lily",
    nameHindi: "Handcrafted Wine Red Velvet Lily",
    category: "Velvet Lilies",
    color: "Wine Maroon",
    hex: "#880E4F",
    pricePerStem: 180,
    minQty: 0,
    maxQty: 30,
    image: "/images/velvet_single_lily.jpg"
  },
  {
    id: "stem-velvet-pink-lily",
    name: "Handcrafted Pastel Pink Velvet Lily",
    nameHindi: "Handcrafted Pastel Pink Velvet Lily",
    category: "Velvet Lilies",
    color: "Pastel Pink",
    hex: "#F48FB1",
    pricePerStem: 180,
    minQty: 0,
    maxQty: 30,
    image: "/images/velvet_pink_tulip_pearl_bow.jpg"
  },
  {
    id: "stem-mini-craft-daisies",
    name: "Mini White & Yellow Craft Daisies (Set of 3)",
    nameHindi: "Mini White & Yellow Craft Daisies (Set of 3)",
    category: "Fillers",
    color: "Snow White & Yellow",
    hex: "#FFF9C4",
    pricePerStem: 80,
    minQty: 0,
    maxQty: 20,
    image: "https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=1200&q=95"
  },
  {
    id: "stem-pearl-wire-heart",
    name: "Handcrafted Pearl Wire Heart on Stem",
    nameHindi: "Handcrafted Pearl Wire Heart on Stem",
    category: "Accents",
    color: "Pink & Pearl White",
    hex: "#F8BBD0",
    pricePerStem: 120,
    minQty: 0,
    maxQty: 10,
    image: "/images/velvet_vintage_heart.jpg"
  },
  {
    id: "stem-chenille-lavender",
    name: "Fluffy Purple Chenille Lavender",
    nameHindi: "Fluffy Purple Chenille Lavender",
    category: "Lavender",
    color: "Soft Lavender",
    hex: "#B39DDB",
    pricePerStem: 90,
    minQty: 0,
    maxQty: 20,
    image: "/images/velvet_lavender_cone.jpg"
  },
  {
    id: "stem-spiral-velvet-eucalyptus",
    name: "Spiral Velvet Eucalyptus Stems",
    nameHindi: "Spiral Velvet Eucalyptus Stems",
    category: "Greens",
    color: "Velvet Sage Green",
    hex: "#81C784",
    pricePerStem: 75,
    minQty: 0,
    maxQty: 20,
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=95"
  },
  {
    id: "stem-red-rose",
    name: "Dutch Velvet Red Rose",
    nameHindi: "Dutch Velvet Red Rose",
    category: "Roses",
    color: "Crimson Red",
    hex: "#9E1B32",
    pricePerStem: 75,
    minQty: 0,
    maxQty: 50,
    image: "https://images.unsplash.com/photo-1550983606-22435cefe1fa?auto=format&fit=crop&w=1200&q=95"
  },
  {
    id: "stem-pink-rose",
    name: "Blush Avalanche Rose",
    nameHindi: "Blush Avalanche Rose",
    category: "Roses",
    color: "Soft Pink",
    hex: "#E892A2",
    pricePerStem: 80,
    minQty: 0,
    maxQty: 50,
    image: "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=1200&q=95"
  },
  {
    id: "stem-blue-hydrangea",
    name: "Korean Cloud Hydrangea",
    nameHindi: "Korean Cloud Hydrangea",
    category: "Hydrangea",
    color: "Sky Blue",
    hex: "#90CAF9",
    pricePerStem: 280,
    minQty: 0,
    maxQty: 10,
    image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=95"
  }
];

export const WRAPPING_PAPERS = [
  { id: "wrap-black-gold-pearl", name: "Matte Black & Gold Edge with Pearl Pleated Organza Collar", price: 180, hex: "#1A1A1A", preview: "Black Gold & Pearl Tutu Ruffle" },
  { id: "wrap-white-gold-cone", name: "Crisp Structured White with Metallic Gold Border", price: 120, hex: "#FFFFFF", preview: "Minimalist Gold Line Cone" },
  { id: "wrap-pink-pearl-tulle", name: "Pastel Pink Paper with Pearl Lace Tulle Collar", price: 160, hex: "#FCE7F3", preview: "Romantic Pearl Edge Collar" },
  { id: "wrap-wine-velvet", name: "Royal Wine Burgundy Velvet", price: 180, hex: "#4A0E17", preview: "Imperial Heavy Velvet" },
  { id: "wrap-korean-frosted", name: "Korean Translucent Frosted Mesh", price: 120, hex: "#E0F2FE", preview: "Frosted Cloud Effect" }
];

export const SATIN_RIBBONS = [
  { id: "ribbon-champagne-gold", name: "Champagne Gold Heavy Satin", price: 40, hex: "#D4AF37" },
  { id: "ribbon-rose-gold", name: "Rose Gold Shimmer Bow", price: 50, hex: "#E892A2" },
  { id: "ribbon-wine-crimson", name: "Crimson Velvet Ribbon", price: 45, hex: "#880E4F" },
  { id: "ribbon-emerald-green", name: "Emerald Forest Green Silk", price: 45, hex: "#1B5E20" },
  { id: "ribbon-pearl-white", name: "Pure Pearl Double Organza", price: 35, hex: "#FFFFFF" }
];

export const COMBO_ITEMS = {
  bases: [
    { id: "combo-base-12roses", name: "12 Velvet Red Roses Bouquet", price: 999, image: "https://images.unsplash.com/photo-1531747056597-0b022e399587?auto=format&fit=crop&w=1200&q=95" },
    { id: "combo-base-korean-mix", name: "Korean Pastel Symphony Bouquet", price: 1499, image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=95" },
    { id: "combo-base-lilies-roses", name: "Regal Lilies & Orchids Bunch", price: 1299, image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=95" }
  ],
  teddies: [
    { id: "teddy-6in-brown", name: "6-inch Classic Honey Teddy", price: 349, image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=1200&q=95" },
    { id: "teddy-12in-white", name: "12-inch Snow White Plush Bear", price: 699, image: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=1200&q=95" },
    { id: "teddy-2ft-pink", name: "2-Foot Giant Blush Pink Hug Bear", price: 1299, image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=95" }
  ],
  chocolates: [
    { id: "choc-ferrero-16", name: "Ferrero Rocher Box (16 Pcs)", price: 549, image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=95" },
    { id: "choc-cadbury-silk-3", name: "Cadbury Dairy Milk Silk Trio (3 Bars)", price: 399, image: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=1200&q=95" },
    { id: "choc-lindt-luxury", name: "Lindt Lindor Swiss Truffles (200g)", price: 799, image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=95" }
  ],
  cards: [
    { id: "card-luxury-gold", name: "Embossed Gold Foil Greeting Card", price: 99, freeWithCode: true },
    { id: "card-handmade-pop", name: "Handmade 3D Pop-Up Love Card", price: 199 },
    { id: "card-custom-photo", name: "Personal Photo Print & Wax Seal Card", price: 249 }
  ]
};
