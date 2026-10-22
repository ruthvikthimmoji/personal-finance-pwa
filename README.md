# 📱 Personal Finance Tracker — Mobile PWA

A mobile-first Progressive Web App (PWA) designed for your phone that syncs directly with your Google Spreadsheet:
**[Google Sheet Link](https://docs.google.com/spreadsheets/d/1al3dZQcq-FOASXxkfYKt_-gvbolvGMqLjTS32EWvXjQ/edit?gid=11885255#gid=11885255)**

---

## ✨ Features

- **📱 Mobile App Experience**: Installs to your iPhone or Android home screen with an app icon. Opens full-screen without browser bars.
- **⚡ Two-Way Google Sheets Sync**: All balance updates and investment logs are appended directly to your sheet and automatically preserve all formulas (`SUM`, change calculations, net worth totals).
- **💰 Real-Time Net Worth Dashboard**:
  - Net Worth overview with Indian Rupee (`₹`) formatting.
  - Asset allocation bar (Bank accounts vs Cash in Hand vs Investments).
  - Breakdown of individual bank accounts (**HDFC**, **SBI**, **Indian Bank**, **Canara Bank**, **Cash in Hand**) with latest balances and change indicators.
  - Investment portfolio (**Stocks / Zerodha**, **Long Term / Groww**, **APY / NPS**) with invested amounts, earnings/profit, current value, and return percentages.
- **⚡ 10-Second Balance Logger ("+ Balance")**:
  - Fast numeric inputs with previous balances shown as reference so you only type what changed.
  - Real-time delta preview (shows how much your total balance went up or down before submitting).
  - Confetti celebration upon saving!
- **📈 10-Second Investment Logger ("+ Invest")**:
  - Log invested amounts and current earnings (profit/loss) per asset.
  - Live preview of total value and percentage return.
- **📜 Full History & Audit Logs**:
  - Filter by Balance Logs or Investment Logs.
  - Expandable date cards showing full breakdown of accounts on that day.
- **📷 QR Code Scanner**:
  - Settings tab contains a dynamic QR code you can scan with your phone's camera to instantly launch the app.

---

## 🚀 How to Open on Your Phone Right Now (Local Wi-Fi)

The development server is already running on your Mac!

1. Make sure your phone is connected to the same Wi-Fi network as your Mac.
2. Open your phone's camera and scan the QR code in the **Settings** tab of the app, or open Safari/Chrome on your phone and type:
   ```
   http://192.168.1.4:5173
   ```
3. To install it as a standalone app on your phone:
   - **iPhone (Safari)**: Tap the **Share** button (box with arrow pointing up) at the bottom &rarr; tap **"Add to Home Screen"**.
   - **Android (Chrome)**: Tap the **three dots** (⋮) in the top-right &rarr; tap **"Add to Home screen"** or **"Install app"**.

---

## 🔄 1-Minute Google Sheets Sync Setup (Free & Zero Maintenance)

To allow the mobile app to write directly into your Google Sheet:

1. Open your **[Google Spreadsheet](https://docs.google.com/spreadsheets/d/1al3dZQcq-FOASXxkfYKt_-gvbolvGMqLjTS32EWvXjQ/edit)**.
2. In the top menu, click **Extensions** &rarr; **Apps Script**.
3. Delete any default code in `Code.gs`.
4. Copy the script from `google-apps-script/Code.gs` (or tap the **"Copy Script Code"** button inside the app's **Settings** tab) and paste it.
5. Click the **Save** icon (floppy disk or `Cmd+S`).
6. In the top right, click **Deploy** &rarr; **New deployment**.
7. Click the **Select type** gear icon &rarr; choose **Web app**.
8. Set:
   - **Description**: `Finance App API`
   - **Execute as**: `Me (<your-email>)`
   - **Who has access**: `Anyone` *(Note: This allows your mobile app to send updates)*
9. Click **Deploy**, review/grant permissions when prompted by Google.
10. Copy the generated **Web App URL** (looks like `https://script.google.com/macros/s/.../exec`).
11. In the mobile app, go to **Settings**, paste your URL, and tap **Test Connection** &rarr; **Save**!

Once saved, any time you log balances or investments on your phone, they are immediately stored in your Google Sheet!

---

## 🌐 Free 24/7 Cloud Hosting (Vercel / Cloudflare Pages / Netlify)

If you want an online link (HTTPS) that works from anywhere without needing your Mac turned on:

### Option A: Vercel (Recommended, 1-Click)
1. Push this folder to GitHub (e.g. `personal-finance-pwa`).
2. Go to [vercel.com](https://vercel.com) &rarr; **Add New Project** &rarr; import repository.
3. Framework preset: **Vite**.
4. Click **Deploy**. Vercel will give you a permanent `https://<your-project>.vercel.app` link!

### Option B: Cloudflare Pages or Netlify
Run `pnpm build` and drag-and-drop the `dist/` folder into Netlify Drop or Cloudflare Pages for instant 100% free hosting.

---

## 🛠️ Project Structure

```
personal-finance-pwa/
├── google-apps-script/
│   └── Code.gs                  # Google Apps Script API backend code
├── public/
│   ├── icon-192.svg             # PWA app icon (Rupee symbol with emerald glow)
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker for offline & caching
├── src/
│   ├── components/
│   │   ├── BalanceUpdateModal.tsx # Quick balance input form
│   │   ├── BottomNav.tsx        # Mobile tab navigation
│   │   ├── DashboardView.tsx    # Net Worth & Account cards overview
│   │   ├── Header.tsx           # Mobile status header
│   │   ├── HistoryView.tsx      # Past log entries & breakdown
│   │   ├── InvestmentUpdateModal.tsx # Investment values & returns form
│   │   └── SettingsView.tsx     # QR code, sync status & 1-min guide
│   ├── services/
│   │   └── api.ts               # Google Sheets API client & local cache
│   ├── types/
│   │   └── index.ts             # TypeScript definitions
│   ├── utils/
│   │   └── format.ts            # INR currency & date formatting
│   ├── App.tsx                  # Main app controller
│   ├── index.css                # Tailwind styling & safe-area insets
│   └── main.tsx                 # Entry point
├── package.json
└── vite.config.ts
```
