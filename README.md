# 🚀 ProtoHub — Project Income, Expense Dashboard & Customer Billing System

An interactive web application built for **ProtoHub** to manage project sales records, dynamically monitor financial inflow vs expenditure across years (2025, 2026+), analyze client growth, and generate customer invoices downloadable as **PNG** and **PDF**.

---

## 🔐 Tab Access Passwords

Both sections are password-protected with independent passkeys:

| Feature / Tab | Description |
| :--- | :--- | :--- |
| **Financial Dashboard** | Access 2025 & 2026 project sales records, dynamic charts, and record editing |
| **Customer Billing** | Generate official invoices and download in PNG & PDF formats |

---

## 🌟 Key Features

### 1. 📊 Financial & Project Dashboard
- **Preloaded Sales & Expense Records**: Pre-configured with complete 2025 and 2026 data.
- **Dynamic Analytics & Charts**:
  - **Income vs Expenditure**: Toggle between Interactive Bar Chart and Pie/Donut Chart.
  - **Customer Growth Chart**: Multi-year unique customer volume and project counts.
  - **Profit Ratio & Net Inflow**: Area & Line chart tracking net profit and profit margin percentage.
  - **Top Client Institutions**: Distribution of projects by college (VEC, VIT, Salem College, etc.).
- **Full CRUD Capabilities**:
  - Add new projects with automatic customer ID & serial numbering.
  - Edit existing records (including modifying 2025 and 2026 entries).
  - Delete records with confirmation modal.
  - Filter by Year (`All`, `2025`, `2026`, etc.), Type (`Income` vs `Expenditure`), or Status.
  - Live instant search across Customer Name, Phone, Project Summary, College, and Notes.
  - **Export to CSV**: Download complete Excel-compatible reports.
  - **Persistent Storage**: Changes are preserved automatically in browser storage (`localStorage`).

### 2. 🧾 Customer Bill Generator
- Input project title, actual price, discount, referral discount, customer name, and phone number.
- **Live A4 Invoice Preview**: Real-time receipt styled with official ProtoHub branding and seal.
- **Dual Export Formats**:
  - 🖼️ **Download PNG**: High-resolution image format.
  - 📄 **Download PDF**: Standard print-ready A4 document.
- **1-Click Save to Dashboard**: Option to directly append issued bills into the master project tracker.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans & JetBrains Mono fonts
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Document Export**: html2canvas & jsPDF

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🚀 Deployment Guide

### Deploying to GitHub & Vercel:

1. **Initialize Git Repository and Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ProtoHub Dashboard & Billing System"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New Project"** -> **"Import Git Repository"**.
   - Select your ProtoHub repository.
   - Framework preset will automatically detect **Vite**.
   - Click **"Deploy"**.
   - Your live site will be ready in seconds with free SSL and custom domain support!
