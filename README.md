# 🌟 Vogue Trends — AI-Personalized Fashion Boutique

Vogue Trends is a premium, web-based fashion e-commerce storefront featuring an **AI Stylist Concierge** and **Bespoke Outfit Recommendation Capsules** powered by the Google Gemini API (`gemini-2.5-flash`). Built on a hybrid MERN stack architecture, the platform dynamically analyzes browsing behavior to construct custom style profiles, color theory analyses, and outfit suggestions.

---

## 🎨 Core Platform Features

*   **🛍️ Boutique Wardrobe Shop:** An interactive catalog with advanced filters for categories, style vibes, colors, and maximum price thresholds.
*   **✨ Atelier AI Stylist:** A conversational chat interface that acts as an elite stylist, suggesting real items from the inventory based on context.
*   **🧭 Personalization Compass:** A real-time profile evaluator that scores interests (styles, categories, palette preferences) based on user interactions.
*   **📦 Bespoke Outfit Capsules:** Formulates three custom coordinate collections on-the-fly, generating structured JSON recommendations from the Gemini API.
*   **💬 Reviews Ledger:** Allows customers to submit starred reviews and comments, linked across database profiles.
*   **🔄 Database Synchronization:** Automatically links authentication sessions, shopping bags, wishlists, and orders to a MongoDB Atlas cluster.

---

## 🔄 Platform Workflow

```mermaid
graph TD
    A[Boutique Browsing] -->|Track Clicks, Views, Wishlists| B(Style Compass Analytics)
    B -->|Calculate Interest Scores| C{Atelier AI Services}
    C -->|Bespoke Capsules| D[Gemini Structured Outfits]
    C -->|Stylist Chat| E[Interactive Concierge Advice]
    A -->|Add to Cart| F[Checkout Screen]
    F -->|Apply Demo Coupons| G[Place Order]
    G -->|Sync Database Ledger| H[Fulfillment Status Tracking]
```

### 1. Boutique Discovery
Users browse collection listings, filter by categories or tags, view detailed sizes, read product reviews, and add coordinates to their wishlist or cart.

### 2. AI Style Calibration
As users browse, the platform tracks coordinates. The **Style Compass** updates in the background, computing preferred style aesthetics (e.g., *Minimalist*, *Streetwear*) and favorite color palettes.

### 3. AI Personalization
*   **Capsules:** Clicking *Formulate Outfits* queries the Gemini API using browsing history to design three visual looks from matching catalog IDs.
*   **Interactive Chat:** Users type custom queries (e.g., *"What matches Selvedge Denim?"*), returning styling suggestions and clickable product cards.

### 4. Discount Checkout & Order Dispatch
Within the shopping bag drawer, users review items, apply promo codes, submit shipping info, and finalize payments. Orders are instantly persisted in the cloud MERN dashboard.

---

## 🛡️ Administrative Portal Access

Vogue Trends includes a back-office administration panel to monitor sales KPIs, manage product inventories, and update customer order dispatches.

### How to Access the Admin Panel:
1.  Click the user icon in the top right menu to open the **Atelier Account Modal**.
2.  Log in using the following administrative demo credentials (auto-seeded on startup):
    *   **Username/Email:** `user`
    *   **Password:** `user123`
3.  Once authenticated, a **"Shield" Admin Portal** link will unlock on the navigation rail (desktop menu and mobile icon toolbar).

### Dashboard Panels:
*   **📊 Sales Analytics:** Summary widgets tracking Total Revenue, Total Volume Checkouts, Average Ticket Value, and Applied Discounts.
*   **🚚 Fulfillment Pipeline:** Scrollable ledger displaying database orders. Updating the status dropdown (e.g., *Processing*, *Shipped*, *Delivered*) immediately updates the customer's personal profile card.
*   **➕ Product Editor:** Interface to add new fashion products, update pricing and stock, and delete items from the live boutique catalog.

---

## ⚙️ Run Locally

### Prerequisites
*   **Node.js** (v20+ recommended)
*   **Gemini API Key** (Obtained from [Google AI Studio](https://aistudio.google.com/))
*   *(Optional)* **MongoDB Atlas URI** for database persistence.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Google Gemini API key used for chat and outfit generation
GEMINI_API_KEY="your_actual_gemini_api_key"

# JWT token signing secret (optional - fallback value is used if blank)
JWT_SECRET="your_secure_jwt_signing_key"

# MongoDB connection string (optional - falls back to local JSON file if blank)
MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/vogue_trends"
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🏛️ Architecture & Database Modes

The project employs a custom database wrapper ([server/config/db.js](server/config/db.js)):
*   **MongoDB Live Mode:** Connects to a cloud database cluster if `MONGO_URI` is set.
*   **Local File Fallback:** If no connection string is set, it falls back to writing to [local_database.json](local_database.json).

> [!WARNING]
> **Serverless Hosting Environments:** Serverless hosts (e.g., Vercel, Cloud Run) have ephemeral filesystems. File writes to `local_database.json` will be wiped during cold starts. Configuring a live `MONGO_URI` is required for production persistence.

---

## 🚀 Production Deployment

### 1. Build Client Assets
Compile the React-Vite frontend bundle:
```bash
npm run build
```
Optimized, minified, and hashed assets are written to the `/dist` directory.

### 2. Run Production Server
```bash
# Windows (PowerShell)
$env:NODE_ENV="production"
npm run start

# Linux/macOS
NODE_ENV=production npm run start
```
In production mode, the Express server hosts compiled files from `/dist` as static assets and forwards fallback SPA routes to `index.html`.
