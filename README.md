# 🏋️ GymPro 

A powerful **Gym Management System** built with **React**, **Supabase**, and **Tailwind CSS**.

From member check-ins to financial reporting — handle it all in one dashboard.

---

## ⚡ Features Snapshot

| Module | Key Functionality |
| :--- | :--- |
| **👥 Members** | Manage Profiles, Digital QR IDs, Capture Photos, Track Status (Active/Inactive) & Payments. |
| **🧾 Billing** | Generate PDF Invoices, Manage Payments (Part/Full), Track Expenses & Revenue. |
| **mobile Attendance** | Built-in QR Code Scanner for check-ins, Real-time Logs & History. |
| **💊 Inventory** | Supplement Store with Stock Alerts, Barcode Scanning & Sales Tracking. |
| **💪 Training** | Personal Training (PT) subscriptions, Workout Plans & Cardio Packages. |
| **📅 Schedule** | Create Class Timetables, Assign Instructors & Manage Capacity. |
| **📊 Analytics** | Visual Dashboards for Revenue, Attendance Trends & Sales Reports. |
| **⚙️ Admin** | Role-based Access, Global Settings, System Config & Data Exports. |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL Database, Storage)
- **Utilities:** Recharts (Analytics), jsPDF (Invoices), html5-qrcode (Scanner)

---

## 🚀 Quick Setup

1.  **Clone & Install**
    ```bash
    git clone https://github.com/yourusername/gym-application.git
    cd gym-application
    npm install
    ```

2.  **Environment Variables** (`.env`)
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```

3.  **Database**
    Run the `COMPLETE-GYM-DATABASE.sql` script in your Supabase SQL Editor to set up all tables.

4.  **Run**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:5173`. Credentials: Login with ANY email/password if signup is enabled, or create an admin user in Supabase Auth.

---

## � Project Structure

- `src/pages`: All main views (Dashboard, Members, etc.)
- `src/components`: Reusable UI elements (Sidebar, Layout, Cards).
- `src/context`: Global State (GymContext).
- `src/supabaseClient.js`: Database Connection.

---

<div align="center">
  <b>GymPro - Comprehensive & Concise</b>
</div>