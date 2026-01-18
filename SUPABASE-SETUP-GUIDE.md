# 🏋️ Gym Management System - Supabase Setup Guide

## Step 1: Create New Supabase Project

1. **Supabase par jao**: [https://supabase.com](https://supabase.com)
2. **Sign in** karo (ya new account banao)
3. **"New Project"** button par click karo
4. Project details fill karo:
   - **Name**: `gym-management` (ya koi bhi naam)
   - **Database Password**: Strong password set karo (save kar lena!)
   - **Region**: Closest region select karo (e.g., Singapore for Pakistan)
   - **Pricing Plan**: Free tier select karo
5. **"Create new project"** par click karo
6. Wait karo 2-3 minutes (project setup ho raha hai)

---

## Step 2: Run Database Schema

1. **Left sidebar** mein **"SQL Editor"** par click karo
2. **"New query"** button par click karo
3. **`supabase-schema.sql`** file ko open karo (jo maine abhi banai hai)
4. **Pura code copy karo** aur SQL Editor mein paste karo
5. **"Run"** button (ya Ctrl+Enter) press karo
6. Success message aana chahiye: ✅ "Success. No rows returned"

---

## Step 3: Verify Database Tables

1. Left sidebar mein **"Table Editor"** par click karo
2. Yeh 3 tables dikhni chahiye:
   - ✅ **members** (5 sample members ke saath)
   - ✅ **attendance** (empty)
   - ✅ **classes** (5 sample classes ke saath)

---

## Step 4: Enable Authentication

1. Left sidebar mein **"Authentication"** par click karo
2. **"Providers"** tab par jao
3. **"Email"** provider already enabled hona chahiye
4. Agar disabled hai to enable kar do

---

## Step 5: Create Admin User

1. **"Authentication"** > **"Users"** par jao
2. **"Add user"** > **"Create new user"** par click karo
3. User details fill karo:
   - **Email**: `admin@gym.com` (ya apni email)
   - **Password**: `admin123` (ya apna password)
   - **Auto Confirm User**: ✅ Check kar do
4. **"Create user"** par click karo

---

## Step 6: Get API Keys

1. Left sidebar mein **"Settings"** (gear icon) par click karo
2. **"API"** section par jao
3. Yeh 2 values copy karo:

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```

### Anon/Public Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

---

## Step 7: Update .env File

1. Apne project mein **`.env`** file open karo
2. Naye values paste karo:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

3. File save karo

---

## Step 8: Restart Development Server

1. Terminal mein development server stop karo (Ctrl+C)
2. Phir se start karo:
```bash
npm run dev
```

---

## Step 9: Test Login

1. Browser mein app open karo: `http://localhost:5173`
2. Login page par jao
3. Credentials enter karo:
   - **Email**: `admin@gym.com`
   - **Password**: `admin123`
4. **"Sign In"** par click karo
5. ✅ Dashboard open hona chahiye!

---

## Step 10: Test Members Page

1. Sidebar mein **"Members"** par click karo
2. ✅ 5 sample members dikhne chahiye:
   - Ahmed Ali
   - Fatima Khan
   - Hassan Raza
   - Ayesha Malik
   - Bilal Ahmed

---

## 🎉 Setup Complete!

Aapka Gym Management System ab fully functional hai!

---

## Troubleshooting

### ❌ Login nahi ho raha?
- Check karo `.env` file mein correct URL aur Key hai
- Development server restart karo
- Browser cache clear karo (Ctrl+Shift+Delete)

### ❌ Members page empty hai?
- SQL Editor mein sample data wala query phir se run karo
- Table Editor mein manually check karo ki data hai ya nahi

### ❌ "Failed to fetch" error?
- Internet connection check karo
- Supabase project status check karo (dashboard par)
- `.env` file mein URL correct hai ya nahi

---

## Database Schema Details

### Members Table
- `id`: Unique member ID (auto-generated)
- `name`: Member ka naam
- `fee`: Monthly fee amount
- `payment`: Payment status (Paid/Unpaid)
- `status`: Member status (Active/Inactive)
- `profile`: Profile picture URL
- `join_date`: Joining date
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### Attendance Table
- `id`: Unique attendance ID
- `member_id`: Member reference
- `date`: Attendance date
- `created_at`: Record creation timestamp

### Classes Table
- `id`: Unique class ID
- `name`: Class name
- `instructor`: Instructor name
- `time`: Class time
- `day`: Day of week
- `capacity`: Maximum students
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Authentication required** for all operations
✅ **Automatic timestamps** on updates
✅ **Foreign key constraints** for data integrity
✅ **Indexes** for better performance

---

## Need Help?

Agar koi issue ho to mujhe batao! 🚀
