# 🏋️ GymPro - Complete Gym Management System

A modern, full-featured gym management system built with React, Supabase, and Tailwind CSS. Manage members, classes, trainers, supplements, billing, and more with an intuitive dashboard.

![GymPro Dashboard](https://via.placeholder.com/800x400/1a1a1a/39ff14?text=GymPro+Dashboard)

## ✨ Features

### 👥 **Member Management**
- Complete member profiles with photo capture
- Payment status tracking (Paid/Unpaid/Partial)
- Member status management (Active/Inactive/Suspended)
- QR code generation for each member
- Attendance tracking with check-in/check-out
- Export member data (CSV/PDF)

### 📅 **Class Scheduling**
- Weekly class schedule management
- Instructor assignment and specializations
- Class capacity and booking management
- Real-time availability tracking
- Class popularity analytics

### 📊 **Dashboard & Analytics**
- Real-time gym statistics
- Monthly revenue tracking
- Member attendance reports
- Supplement sales analytics
- Class utilization metrics
- Low stock alerts

### 💊 **Supplement Management**
- Complete inventory tracking
- Stock level monitoring with alerts
- Sales history and analytics
- Barcode support
- Supplier management
- Profit margin calculations

### 🏃 **Cardio & Training**
- Cardio package management (Weekly/Monthly/Unlimited)
- Personal training packages
- Trainer profiles and specializations
- Session tracking and progress monitoring
- Package expiry management

### 🧾 **Billing & Invoicing**
- Professional invoice generation
- Multiple payment methods (Cash/Card/Online)
- Automatic tax and discount calculations
- Payment status tracking
- Invoice history and reports

### 📱 **QR Code Attendance**
- QR code scanning for attendance
- Real-time attendance tracking
- Attendance history and reports
- Mobile-friendly interface

### ⚙️ **Settings & Configuration**
- Gym information management
- Fee structure configuration
- System preferences
- Backup and restore options

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Lucide React Icons
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **QR Codes**: qrcode.react
- **Routing**: React Router DOM

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Supabase account
- Modern web browser

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/gym-management-app.git
cd gym-management-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase Database
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and run the complete database schema from `COMPLETE-GYM-DATABASE.sql`
4. Create an admin user in Authentication section

### 4. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Login & Test
- Open http://localhost:5173
- Login with your admin credentials
- Explore all features!

## 📁 Project Structure

```
gym-management-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   └── Sidebar.jsx      # Navigation sidebar
│   ├── context/             # React Context providers
│   │   └── GymContext.jsx   # Global state management
│   ├── pages/               # Main application pages
│   │   ├── Dashboard.jsx    # Dashboard with analytics
│   │   ├── Members.jsx      # Member management
│   │   ├── Schedule.jsx     # Class scheduling
│   │   ├── Reports.jsx      # Reports and analytics
│   │   ├── AttendanceQR.jsx # QR code attendance
│   │   ├── Supplements.jsx  # Supplement inventory
│   │   ├── Cardio.jsx       # Cardio packages
│   │   ├── PersonalTraining.jsx # Trainer management
│   │   ├── TrainingPlan.jsx # Training packages
│   │   ├── Invoice.jsx      # Billing and invoicing
│   │   ├── Settings.jsx     # System settings
│   │   └── Login.jsx        # Authentication
│   ├── supabaseClient.js    # Supabase configuration
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── COMPLETE-GYM-DATABASE.sql # Complete database schema
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## 🗄️ Database Schema

The system uses a comprehensive PostgreSQL database with 14 main tables:

### Core Tables
- **members** - Member profiles and information
- **trainers** - Trainer profiles and specializations
- **classes** - Class schedules and details
- **attendance** - Daily attendance tracking

### Business Logic Tables
- **supplements** - Inventory management
- **cardio_packages** - Cardio subscription packages
- **training_packages** - Personal training packages
- **invoices** - Billing and payment tracking

### Relationship Tables
- **class_bookings** - Class reservations
- **member_supplements** - Supplement purchase history
- **member_cardio** - Cardio subscriptions
- **member_training_plans** - Training subscriptions

### System Tables
- **gym_settings** - System configuration
- **invoice_items** - Invoice line items

## 🎨 UI/UX Features

### Design System
- **Dark Theme**: Modern dark interface with neon green accents
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Glassmorphism**: Beautiful frosted glass effects
- **Smooth Animations**: Subtle transitions and hover effects

### User Experience
- **Intuitive Navigation**: Clear sidebar with active state indicators
- **Real-time Updates**: Live data updates without page refresh
- **Search & Filters**: Quick search across all data
- **Export Options**: CSV and PDF export capabilities
- **Mobile Optimized**: Touch-friendly interface for mobile devices

## 📊 Analytics & Reports

### Dashboard Metrics
- Active members count
- Monthly revenue tracking
- Today's attendance
- Unpaid members alerts
- Low stock notifications
- Class utilization rates

### Detailed Reports
- **Member Reports**: Attendance history, payment status
- **Financial Reports**: Revenue trends, payment methods
- **Inventory Reports**: Stock levels, sales performance
- **Class Reports**: Popularity, attendance rates
- **Trainer Reports**: Session counts, earnings

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure user authentication via Supabase
- **Data Validation**: Input validation and sanitization
- **Secure API**: Protected API endpoints
- **Backup Support**: Automatic database backups

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **Supabase Hosting**: Use Supabase's built-in hosting
- **Custom Server**: Deploy to any static hosting service

### Environment Variables for Production
Make sure to set these in your hosting platform:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Use Tailwind CSS for styling
- Write clean, commented code
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Q: Members page not loading?**
A: Check your Supabase connection and ensure the database schema is properly set up.

**Q: Camera not working for member photos?**
A: Ensure your browser has camera permissions enabled and you're using HTTPS in production.

**Q: Invoice generation failing?**
A: Verify that jsPDF is properly installed and your data is valid.

### Getting Help
- 📧 Email: support@gympro.com
- 💬 Discord: [Join our community](https://discord.gg/gympro)
- 📖 Documentation: [Full docs](https://docs.gympro.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/gym-management-app/issues)

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Email marketing integration
- [ ] Advanced reporting dashboard
- [ ] Multi-gym support
- [ ] API for third-party integrations
- [ ] Wearable device integration
- [ ] AI-powered insights

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added QR code attendance
- **v1.2.0** - Enhanced reporting and analytics
- **v1.3.0** - Mobile optimization and PWA support

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Lucide](https://lucide.dev) - Beautiful icon library
- [React](https://reactjs.org) - UI library
- [Vite](https://vitejs.dev) - Build tool

---

<div align="center">

**Built with ❤️ for the fitness community**

[⭐ Star this repo](https://github.com/yourusername/gym-management-app) | [🐛 Report Bug](https://github.com/yourusername/gym-management-app/issues) | [💡 Request Feature](https://github.com/yourusername/gym-management-app/issues)

</div>