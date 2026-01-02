Raise2Solve is a full-stack MERN (MongoDB, Express, React, Node.js) web application that connects customers with verified service providers (vendors).
It supports role-based authentication, secure dashboards, and admin management for a real-world service booking platform.

📌 Key Features
👤 Customer

Register & login securely

Browse service categories

View vendor profiles

Raise service requests

Track job/request status

🏪 Vendor

Vendor registration with business details

Vendor dashboard

Accept & manage service requests

Control availability status

🛠 Admin

Secure admin login

Manage users & vendors

Platform control & moderation

Role-based protected routes

🔐 Authentication & Security

JWT-based authentication

Role-based access control (User / Vendor / Admin)

Protected frontend & backend routes

Password hashing using bcrypt

🧱 Tech Stack
Frontend

React (Vite)

JavaScript (JSX)

Tailwind CSS

shadcn/ui

React Router

Axios

Backend

Node.js

Express.js

MongoDB Atlas

Mongoose

JWT Authentication

bcryptjs

📂 Project Structure
raise2solve/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── routes/
│   │   └── lib/
│   └── main.jsx
│
└── README.md

⚙️ Environment Variables

Create a .env file inside backend/:

PORT=5000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret

▶️ Run Locally
1️⃣ Clone the Repository
git clone https://github.com/your-username/raise2solve.git

2️⃣ Backend Setup
cd backend
npm install
npm run dev


Backend runs on:

http://localhost:5000

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs on:

http://localhost:8080

🔑 Authentication Flow (Simple)

User logs in → JWT token generated

Token stored in browser

Axios automatically sends token in headers

Backend verifies token

Role-based access is enforced

🛡 Role-Based Access
Role	Access
User	Customer Dashboard
Vendor	Vendor Dashboard
Admin	Admin Dashboard
📦 Sample API Endpoints
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
GET    /api/vendors
GET    /api/jobs

🚀 Future Enhancements

Refresh token authentication

Admin analytics dashboard

Real-time notifications

Payment gateway integration

In-app chat between users & vendors

👨‍💻 Author

Hariharan
MERN Stack Developer
📍 India