# ☕ Brew Haven Cafeteria Management System


A modern full-stack cafeteria management platform with real-time order management and admin dashboard.

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/yourusername/cafeteria-management-system.git
cd cafeteria-management-system

# Install dependencies
npm install
cd Frontend && npm install && cd ..
cd server && npm install && cd ..

# Start development servers
npm run dev
```

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, React Router
**Backend:** Node.js, Express, MongoDB
**Deployment:** Vercel (Frontend), Render (Backend)
**Security:** JWT, Bcrypt, Helmet.js

## 🌟 Key Features

### For Customers
- 🔐 Secure JWT authentication
- 🛒 Real-time shopping cart
- ❤️ Wishlist functionality
- 💳 Multiple payment options
- 📧 Order notifications
- ⭐ Product reviews

### For Admins
- 📊 Analytics dashboard
- 👥 User management
- 🍕 Product CRUD operations
- 📦 Order tracking
- 📈 Sales reporting

## 📡 API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /signin` - User login
- `GET /profile` - Get profile (JWT required)

### Products
- `GET /products` - Get all products
- `POST /products` - Create product (Admin)

### Cart & Orders
- `GET /cart` - Get cart (JWT required)
- `POST /orders` - Place order (JWT required)

### Admin Only
- `GET /admin/analytics` - Dashboard data
- `GET /admin/users` - All users
- `GET /admin/orders` - All orders

## 🔐 Test Credentials

- **Admin Login:** `admin@cafeteria.com` / `admin123`
- **Test User:** Create account or use any email

## 🏗️ Installation

1. Clone the repository
2. Install dependencies: `npm install` in root, Frontend, and server directories
3. Create `.env` files from `.env.example` templates
4. Configure MongoDB connection
5. Run `npm run dev` to start development servers

## 🛡️ Security

- JWT authentication
- Password hashing with bcrypt
- Helmet.js security headers
- Rate limiting protection
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Purv007)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/purv-patel-b31a84280/)