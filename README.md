# 🛵 Chandgaon Express — Full Stack App

Hyper-local grocery delivery marketplace for Chandgaon, Chittagong.

---

## 📁 Project Structure

```
chandgaon-express/
├── backend/          → Node.js + Express + MongoDB API
└── frontend/         → React + Vite + Tailwind CSS
```

---

## ⚙️ Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in all values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/chandgaon
JWT_SECRET=your_long_random_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
BULKSMS_API_KEY=your_bulksmsbd_api_key
BULKSMS_SENDER_ID=your_sender_id
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev        # Development (nodemon)
npm start          # Production
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🗺️ App URLs

| URL | Description |
|-----|-------------|
| `/` | Customer homepage |
| `/products` | Product listing |
| `/cart` | Shopping cart |
| `/checkout` | Place order (COD) |
| `/track/:id` | Live order tracking |
| `/orders` | Customer order history |
| `/login` | OTP login |
| `/admin` | Admin dashboard |
| `/admin/orders` | All orders + assign rider |
| `/admin/riders` | Rider COD management |
| `/admin/shops` | Shop management |
| `/admin/products` | Product management |
| `/delivery` | Rider order queue |
| `/delivery/earnings` | Rider earnings & COD |

---

## 👤 User Roles

| Role | Access |
|------|--------|
| `customer` | Browse, order, track |
| `admin` | Full management, COD settlement |
| `rider` | Accept deliveries, mark complete |
| `shopOwner` | Manage products |

### Create First Admin (Development Only)
```bash
POST /api/auth/admin/create
Body: { "phone": "01XXXXXXXXX", "name": "Admin" }
```

Then login via OTP on `/login`.

---

## 💰 COD Flow

1. Customer places order → **Cash on Delivery**
2. Admin assigns rider
3. Rider picks up & delivers → marks **Delivered** in app
4. App records: `codCollected = true`, adds to `riderInfo.dueToPay`
5. Admin sees total due from each rider in `/admin/riders`
6. When rider pays cash → Admin clicks **Mark Paid**
7. `dueToPay` resets, orders marked `codPaidToAdmin = true`

---

## 📱 Delivery Fee Logic

| Condition | Fee |
|-----------|-----|
| 1–3 items | ৳10 |
| 3+ items | ৳30 |
| 10+ kg | ৳50 |
| 25+ kg | ৳70 |
| 50+ kg | ৳100 |

---

## 🔌 Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io, JWT, Cloudinary, BulkSMSBD

**Frontend:** React 18, Vite, Tailwind CSS v3, React Router v6, React Query, Zustand, Socket.io-client

---

## 📲 BulkSMSBD Setup

1. Register at [bulksmsbd.net](https://bulksmsbd.net)
2. Get API Key from dashboard
3. Get approved Sender ID
4. Add to `.env`:
   ```
   BULKSMS_API_KEY=your_key
   BULKSMS_SENDER_ID=your_sender_id
   ```

> In development mode, OTP is also returned in the API response for testing.

---

## ☁️ Cloudinary Setup

1. Register at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret
3. Add to backend `.env`

---

## 🚀 Production Deployment

**Backend:** Railway, Render, or any Node.js host  
**Frontend:** Vercel (connect GitHub, set `VITE_API_URL` env var)  
**Database:** MongoDB Atlas (free tier available)

---

Built with ❤️ for Chandgaon, Chittagong
