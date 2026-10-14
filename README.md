# 🌸 RISIKA BLOOMS — Luxury Flower & Gifting E-Commerce Experience

> **"Every Bloom Tells a Story."**  
> *हर फूल सुनाए एक अनूठी कहानी।*

**RISIKA BLOOMS** is an ultra-premium, modern, and mobile-first flower bouquet and gifting e-commerce platform crafted with haute-couture floral aesthetics, interactive customizers, multi-faceted catalog browsing, and seamless direct WhatsApp concierge ordering.

---

## ✨ Key Features & Highlights

### 1. 🎨 Haute-Couture Brand Identity & Visual Design
- **Luxury Color Palette:** Blush Rose (`#E892A2`), Deep Wine Burgundy (`#4A0E17`), Metallic Champagne Gold (`#D4AF37`), Soft Sage Green (`#8FA89B`), and Silk Ivory (`#FAF8F5`).
- **Velvet Noir Dark Mode:** High-end dark theme toggle styled like a Parisian floral atelier at night.
- **Bilingual Interface:** Instant English ↔ Hindi (हिन्दी) translation toggle.
- **Luxury Typography:** Google Fonts pairing `Cinzel`, `Playfair Display`, `Cormorant Garamond`, `Plus Jakarta Sans`, and `Alex Brush`.
- **Floral Monogram Crest:** Custom SVG logo with intertwined rose petals and gold "RB" seal.

### 2. 💐 14 Curated Product Categories
Each category features distinct authentic photography, descriptions, pricing, and variant options:
1. **Rose Bouquets** *(Dutch Velvety Crimson, Blush Pink, Porcelain White, Sunset Peach)*
2. **Mixed Flower Bouquets** *(French Meadow, Oriental Lilies, Lisianthus, Snapdragons)*
3. **Korean-Style Bouquets** *(Seoul Cloud Mesh, Translucent Frosted Draping, Giant Hydrangeas)*
4. **Teddy Bear Bouquets** *(Plush Bear Hugs nestled in fresh blossom beds)*
5. **Money Bouquets** *(Opulent currency fans with gold-dipped rose arrangements)*
6. **Chocolate Bouquets** *(Ferrero Rocher towers, Cadbury Silk hearts & blooms)*
7. **Flower Jhalar & Decorative Garlands** *(Traditional Marigold & Jasmine Mogra entrance torans)*
8. **Wedding & Engagement Flowers** *(Royal Rajwada Varmalas, cascading bridal bouquets)*
9. **Birthday & Anniversary Bouquets** *(Midnight celebration hat boxes with LED fairy lights)*
10. **Luxury Gift Hampers** *(Velvet treasure trunks with French scented candles & chocolates)*
11. **Artificial & Preserved Flowers** *(Forever preserved Ecuadorian roses lasting 3+ years)*
12. **Customized Bouquets** *(Bespoke floral initials & couple letter monogram boxes)*
13. **Surprise Gift Boxes** *(Explosion floral boxes with flying mechanical butterflies)*
14. **Flower & Teddy Combos** *(3-Foot giant plush bear paired with 50 Dutch roses)*

### 3. 🎨 Interactive "Build Your Own Bouquet" (Floral Studio)
- **Stem-by-Stem Selection:** Add Red Roses, Avalanche Roses, White Roses, Lilies, Cloud Hydrangeas, Thai Orchids, Baby's Breath, and Eucalyptus with live steppers.
- **Artisanal Wrapping Papers:** Korean Frosted Mesh, Parisian Charcoal Black, Blush Silk, Wine Velvet, Vintage Eco-Kraft.
- **Satin Ribbons & Bows:** Champagne Gold, Rose Gold Shimmer, Crimson Velvet, Emerald Forest Green.
- **Luxury Add-ons:** Ferrero Rocher boxes, plush bears, warm LED fairy lights, scented candles.
- **Live Visual Composition & Price Calculator:** Instant WhatsApp custom order or add to shopping bag!

### 4. 🎁 Gift Combo Builder
- Mix and match Flower Base + Teddy Bear + Gourmet Chocolates + Greeting Card.
- Automatic **12% Combo Savings** calculated live.

### 5. 🔍 Surprise Gift Finder (AI Concierge Quiz)
- 3-step interactive questionnaire (Recipient ➔ Occasion ➔ Budget).
- Generates curated 98% confidence gift recommendations with confetti animation.

### 6. 📱 Direct WhatsApp Concierge Ordering (Official Click-to-Chat)
- Configurable WhatsApp business number in [`src/config/brand.js`](file:///c:/Users/hp/OneDrive/attachment2/risika/src/config/brand.js) and [`src/config/whatsapp.js`](file:///c:/Users/hp/OneDrive/attachment2/risika/src/config/whatsapp.js).
- Pre-fills a clean, emoji-formatted WhatsApp message containing:
  - Product name, selected color, bouquet size, wrapping paper, ribbon style
  - Quantity & Unit/Total Price
  - Customer & Recipient details, Delivery Address, PIN code
  - Delivery Date & Time slot (Morning, Standard, Evening, Midnight Surprise)
  - Personalized Printed Gift Card message
- Real-time chat confirmation with concierge.

### 7. 🛒 Persistent Shopping Bag & Smart Cart Drawer
- LocalStorage persistent cart with quantity steppers and quick removal.
- Free delivery progress threshold (Free above ₹999).
- Promo coupon engine (`BLOOM10` for 10% off, `FIRSTGIFT` for ₹200 off, `LUXEBLOOM` for 15% off).
- Integrated Recipient details & delivery date/slot selection.
- Dual checkout: **Order on WhatsApp** + **Demo Online Payment Gateway**.

### 8. 🚚 PIN Code Delivery Checker
- Real-time Indian 6-digit PIN code validator with instant slot eligibility:
  - Morning (8:00 AM – 11:00 AM)
  - Standard (1:00 PM – 5:00 PM)
  - Evening (6:00 PM – 9:00 PM)
  - Midnight Surprise (11:15 PM – 12:00 AM)
- Same-day dispatch live countdown timer in the header.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19 + Vite
- **Styling:** Custom Modular Vanilla CSS with HSL color tokens, glassmorphism, smooth animations & responsive grids
- **Icons:** Lucide Icons & Custom SVG Monogram Emblems
- **State Management:** React Context (`ShopContext`) with LocalStorage persistence
- **Animations & Effects:** Custom CSS keyframes + Canvas Confetti

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` to experience the website.

### 3. Production Build
```bash
npm run build
```

---

## ⚙️ Configuration

### Changing the WhatsApp Business Number
Open [`src/config/brand.js`](file:///c:/Users/hp/OneDrive/attachment2/risika/src/config/brand.js) and update `whatsappNumber`:
```javascript
export const BRAND_CONFIG = {
  name: "RISIKA BLOOMS",
  whatsappNumber: "919876543210", // International format without '+' or spaces
  ...
};
```
