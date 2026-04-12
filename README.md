# 🕵️‍♂️ OFF Canada Detective Engine (Prototype)

## 📺 Demo Video
[![Watch the Demo](https://img.youtube.com/vi/R3Lp-F9927U/maxresdefault.jpg)](https://youtu.be/KGmOiUdv-BA)
*Click the image above to watch the prototype in action.*

A lightweight, zero-bloat Chrome extension prototype built for the **Open Food Facts Canada - GSoC 2026** proposal. 

This prototype demonstrates a highly resilient "Detective Engine" that bypasses fragile visible DOM scraping by natively extracting hidden JSON-LD metadata on Canadian e-commerce sites.

## ✨ Features

* 🔍 **Native JSON-LD Scraping:** Extracts "Gold Standard" product metadata (Brand, Name, GTIN) from hidden SEO tags.
* ⚡ **Zero-Bloat Architecture:** Built entirely with Vanilla JavaScript and Manifest V3. No heavy frameworks or complex build tools.
* 🛡️ **Shadow DOM UI:** Injects a clean, expandable Nutri-Score widget using a CSS Firewall to prevent layout leakage.
* 🖱️ **Draggable & Non-Intrusive:** The UI widget spawns in the corner and is fully draggable, ensuring the user's shopping experience is never blocked.
* 🇨🇦 **Live API Integration:** Bypasses CORS using background workers to fetch real-time data from the live Canadian OFF API.

## 🚀 How to Test It (Developer Mode)

Because this relies on native browser APIs, it takes less than 30 seconds to install:

1. Clone this repository to your local machine:
   \`\`\`bash
   git clone https://github.com/Prashant1git/off-canada-detective.git
   \`\`\`
2. Open Chrome or Edge and navigate to \`chrome://extensions/\`.
3. Toggle **Developer mode** on (top right corner).
4. Click **Load unpacked** and select the cloned \`off-canada-detective\` folder.
5. Visit a product page on [Walmart Canada](https://www.walmart.ca/) (e.g., standard Nutella or Oreos) and watch the Detective Engine go to work!

## 📂 Project Structure

* `manifest.json` - Manifest V3 configuration and permissions.
* `background.js` - Service worker handling CORS-free API communication.
* `content.js` - The core engine: handles DOM observation, JSON-LD extraction, Two-Pass search logic, and Shadow DOM UI injection.
