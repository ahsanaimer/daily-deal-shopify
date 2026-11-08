# Daily Deal — Shopify App

A custom Shopify app that lets store owners feature one product per day in a top header bar with a live countdown timer and a special deal price.

# Features

- Admin Dashboard: Pick any product from the store, set a custom deal price, customize the badge textand choose when the deal ends.
- Header Countdown Bar: Adds a slim bar at the top of the storefront with the product image, title, original vs. deal price, a live countdown clockand a one-click Claim Deal button.
- Dynamic Cart Pricing: Uses a Shopify Discount Function to apply the deal price in the cart and checkout while the timer is active, without changing the actual product price in the Shopify Admin catalog.
- Metafield Storage: Saves deal settings directly in a Shop Metafield ("deal_of_day.config") via GraphQL, so no extra database table is needed.

# Tech Stack

- Admin UI: React Router, Polaris Web Components, Shopify App Bridge, GraphQL Admin API
- Storefront Extension: Theme App Extension (App Embed) using Liquid, CSSand vanilla JavaScript
- Discount Logic: Shopify Functions (Discount API)

# Key Files

- "app/routes/app._index.jsx" — Admin dashboard (product picker, metafield saveand automatic discount setup)
- "app/routes/app.help.jsx" — Setup instructions for merchants
- "extensions/deal-header-bar/" — Theme App Extension for the storefront header bar ("deal-bar.liquid", "deal-bar.css", "deal-bar.js")
- "extensions/deal-dynamic-price/" — Shopify Function that overrides the cart price while the deal is active

# Local Setup

1. Clone this repository and install dependencies:
   """bash
   git clone https://github.com
   cd shopify-daily-deal-app
   pnpm install
   """
2. Start the Shopify dev server:
   """bash
   shopify app dev
   """
3. Install the app on your development store and pick a deal product in Apps > Daily Deal.
4. Go to Online Store > Themes > Customize > App embeds, turn on Deal of the Day Barand click Save.
