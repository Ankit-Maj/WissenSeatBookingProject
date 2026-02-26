# 🪑 WissenSeat: Advanced Seat Booking System

WissenSeat is a robust, full-stack seat booking platform designed to manage office workspace distribution between multiple batches and squads. It features a bi-weekly alternating reservation system, real-time occupancy tracking, and a dynamic "floater" seat mechanism.

**Live Demo:** [https://wissenseatbookingproject-1.onrender.com/](https://wissenseatbookingproject-1.onrender.com/)

---

## 🚀 Key Features

### 📅 Smart Scheduling & Reservations
- **Bi-Weekly Alternating System**: 
  - **Week 1**: Batch A (Mon-Wed) | Batch B (Thu-Fri)
  - **Week 2**: Batch A (Thu-Fri) | Batch B (Mon-Wed)
- **Advanced Booking**: Reserve seats up to **2 weeks** in advance.
- **Holiday & Weekend Protection**: Automated blocking of bookings on non-working days.

### 🏢 Dynamic Workspace Management
- **Zone Distribution**: 40 Reserved seats and 10 Floating seats per session.
- **Temporary Floaters**: If a reserved user vacates their seat, it automatically converts into a "Temporary Floater" available for others.
- **Floater Unlock**: Standard floating seats unlock for everyone at **3:00 PM** the previous day.

### 📊 Real-time Interactive UI
- **Live Room Grid**: A visual map of the office where users can select specific seats.
- **Batch & Squad Stats**: Monitor organization capacity with real-time progress bars.
- **Occupancy Indicators**: See who is sitting where with user initials and hover tooltips.

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite
- Lucide React (Icons)
- CSS3 (Custom Glassmorphism Design)
- Axios (API Communication)
- React Router 7

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT (Authentication)
- Bcrypt.js (Security)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/Ankit-Maj/WissenSeatBookingProject.git
cd WissenSeatBookingProject
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
PORT=5000
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```
Run the client:
```bash
npm run dev
```

### 4. Seed Experimental Data (Optional)
To populate the database with 50 sample users and 50% seat occupancy:
```bash
cd server
node seed.js
```

---

## 🛡️ Organization Rules
- **Batch Capacity**: Maximum 50 members per Batch.
- **Squad Capacity**: Maximum 15 members per Squad (5 Squads total per batch).
- **Booking Rule**: Users can only have **one active booking** per session date.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
