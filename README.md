# 🏪 Ration Shop CRM — Government Ration Shop Management System

<div align="center">

![Ration Shop CRM](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

**A full-stack CRM for Government Ration Shops (Fair Price Shops)**  
Built for Sunkesula Village · Shop #0806015 · Andhra Pradesh

</div>

---

## 📋 Features

- ✅ **1,541 Ration Card Holders** — Imported from official PDF with serial numbers
- ✅ **Monthly Distribution Tracking** — Rice, Soaps, Wheat, Idli Rava, Samiya, Surf
- ✅ **Live Camera Capture** — Take receiver photos during distribution using phone/webcam
- ✅ **Stock Management** — Real-time stock levels with auto-deduction on distribution
- ✅ **Pending / Received Status** — Know instantly who has and hasn't collected
- ✅ **Monthly Reports + PDF Export** — Download distribution reports as PDF
- ✅ **Dashboard Analytics** — Charts and stats for each month
- ✅ **Search & Filter** — Search by card number or name across all modules
- ✅ **Bilingual UI** — English + Telugu names displayed throughout
- ✅ **Mobile Responsive** — Works perfectly on smartphones in the field
- ✅ **JWT Authentication** — Secure login for shop operators

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite |
| **Styling** | Tailwind CSS |
| **Charts** | Chart.js + react-chartjs-2 |
| **PDF Export** | jsPDF + jspdf-autotable |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Atlas cloud / local) |
| **Auth** | JWT (JSON Web Tokens) |
| **Camera** | Browser `getUserMedia` API |

---

## 📁 Project Structure

```
Ration/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar
│   │   ├── context/         # AuthContext, LanguageContext
│   │   ├── pages/           # Dashboard, RationCards, Distribution, Stock, Reports
│   │   └── services/        # api.js (axios)
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── server/                  # Node.js + Express backend
    ├── models/              # RationCard, Transaction, Stock, User
    ├── routes/              # users, transactions, stock, reports, auth
    ├── middleware/          # auth.js (JWT)
    ├── scripts/             # importPdf.js, fixUnits.js
    ├── .env                 # Environment variables (DO NOT COMMIT)
    └── index.js             # Entry point
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas cloud)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ration-shop-crm.git
cd ration-shop-crm
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ration_shop
JWT_SECRET=YourSuperSecretKeyHere_ChangeThis
JWT_EXPIRES_IN=7d
SHOP_NUMBER=0806015
```

### 3. Set up the frontend
```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the development servers

**Backend (Terminal 1):**
```bash
cd server
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Default Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> ⚠️ **Change the password immediately after first login in production!**

---

## 🌐 Deployment

### Frontend → Netlify
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Select your repository
4. **Build settings:**
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
6. Deploy!

### Backend → Railway / Render
1. Go to [railway.app](https://railway.app) or [render.com](https://render.com)
2. Connect your GitHub repository
3. Set root directory: `server`
4. Add all environment variables from `.env`
5. Deploy!

---

## 📦 Importing Ration Cards from PDF

```bash
cd server
node scripts/importPdf.js
```

This will import all 1,541 cards from `cards.pdf.pdf` into MongoDB.

---

## 📜 License

MIT — Free to use and modify for government/public service purposes.

---

<div align="center">
Made with ❤️ for the people of Sunkesula Village, Andhra Pradesh
</div>
"# ration-shop-management-system" 
