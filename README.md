# 💼 Cashly Admin Panel

Modern, professional admin panel built with React + Vite + Tailwind CSS

## 📁 Project Structure

```
cashly-admin/
├── public/                 # Static files
├── src/
│   ├── assets/            # Images, icons
│   ├── components/        # React components
│   │   ├── common/       # Reusable components (Button, Card, etc.)
│   │   └── layout/       # Layout components (Sidebar, Header)
│   ├── pages/            # Page components
│   │   ├── auth/         # Login page
│   │   ├── dashboard/    # Dashboard
│   │   ├── kyc/          # KYC management
│   │   ├── loans/        # Loan management
│   │   ├── withdrawals/  # Withdrawal management
│   │   └── users/        # User management
│   ├── services/         # API services
│   ├── utils/            # Helper functions
│   ├── context/          # React Context
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on http://localhost:5000

### Installation

1. Extract the project folder
2. Install dependencies:

```bash
cd cashly-admin
npm install
```

3. Configure environment:

Edit `.env` file if needed:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:

```bash
npm run dev
```

The admin panel will be available at: **http://localhost:3001**

## 📦 Build for Production

```bash
npm run build
```

Built files will be in the `dist/` folder.

## 🎨 Features

### ✅ Completed Features

- **Authentication**
  - Admin login
  - Protected routes
  - Session management

- **Dashboard**
  - Statistics overview
  - Recent activity
  - Quick actions

- **KYC Management**
  - View pending KYC submissions
  - Approve/reject KYC
  - View user documents
  - Filter by status

- **Loan Management**
  - View loan applications
  - Approve/reject loans
  - Track active loans
  - Filter by status

### 🔜 Coming Soon

- Withdrawal management
- User management
- Reports and analytics
- Notifications

## 🔐 Default Admin Credentials

Backend ээс тохируулсан admin credential-ээ ашиглана уу.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icons

## 📝 API Endpoints Used

```
POST   /api/admin/login              # Admin login
GET    /api/admin/dashboard          # Dashboard stats
GET    /api/admin/pending-kyc        # KYC list
GET    /api/admin/kyc-detail/:id     # KYC detail
POST   /api/admin/approve-kyc/:id    # Approve KYC
POST   /api/admin/reject-kyc/:id     # Reject KYC
GET    /api/admin/pending-loans      # Loan list
GET    /api/admin/active-loans       # Active loans
GET    /api/admin/loan-detail/:id    # Loan detail
POST   /api/admin/approve-loan/:id   # Approve loan
POST   /api/admin/reject-loan/:id    # Reject loan
```

## 🎯 Usage Tips

1. **First Login**: Use your admin credentials from backend
2. **KYC Review**: Check all documents carefully before approval
3. **Loan Review**: Verify user's KYC status before approving loans
4. **Filters**: Use status filters to organize your workflow

## 🐛 Troubleshooting

### CORS Issues
Make sure backend CORS is configured correctly:
```javascript
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

### Port Already in Use
Change port in `vite.config.js`:
```javascript
server: {
  port: 3002  // Change to any available port
}
```

### API Connection Failed
1. Check if backend is running
2. Verify API URL in `.env` file
3. Check browser console for errors

## 📞 Support

For issues or questions, please contact the development team.

---

Built with ❤️ for Cashly.mn
