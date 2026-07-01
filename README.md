# 🏗️ BuildBazaar — Construction E-Commerce Platform

A modern, full-stack e-commerce web application for buying and selling construction materials, tools, machinery, and safety equipment. Designed with an Amazon-inspired user experience, BuildBazaar connects buyers and sellers across the construction industry.

---

## 🔹 Tech Stack

| Layer            | Technologies                                                     |
| ---------------- | ---------------------------------------------------------------- |
| **Frontend**     | React 19, React Router DOM 7, Redux Toolkit, Tailwind CSS 3      |
| **Backend**      | Node.js, Express 5, MongoDB, Mongoose 9                          |
| **Auth**         | JWT (JSON Web Tokens), Bcrypt.js                                 |
| **UI**           | Lucide React icons, Framer Motion, React Toastify                |
| **File Uploads** | Multer                                                           |
| **Dev Tools**    | Nodemon, Concurrently, Morgan (HTTP logger)                      |

---

## 🔹 Features

### 🛒 Shopping Experience
- Browse products by category (Cement, Steel, Tools, Machinery, Rentals, Safety Equipment)
- Advanced filtering by Category, Brand, Material Type, Price Range, and Availability
- Full-text search across all products
- Add to cart with quantity management
- Immersive product detail page with image gallery, stock status, delivery estimates, highlights, and specifications

### 👤 User Authentication & Accounts
- User registration with role selection (Customer / Seller)
- Secure login with JWT-based sessions
- Profile management (name, email, password update)
- Forgot password flow with reset token link
- Role-based access control (Customer, Seller, Admin)

### 🔔 Real-Time Notifications
- In-app notification bell with live unread count badge
- Auto-generated notifications on order events (placed, paid, delivered)
- Notification dropdown with type-based icons, relative timestamps, and read/unread status
- Mark individual or all notifications as read
- Background polling every 30 seconds for new notifications

### 📦 Order Management
- Complete checkout flow: Shipping → Payment → Place Order → Confirmation
- Order history with status tracking
- Payment integration (mock)
- Seller/Admin can mark orders as delivered

### 📊 Seller Dashboard
- Manage products (CRUD operations with image upload)
- View and fulfill incoming orders
- Sales analytics overview

### 🛡️ Admin Panel
- Full control over users, products, and orders
- User role management
- System-wide order oversight

### 🤖 AI & Support
- AI-powered product recommendations based on categories
- Built-in chatbot for instant construction-related queries

### 📍 Location Services
- GPS-based site location capture
- Manual address entry for delivery
- Saved shipping addresses for checkout

---

## 🔹 API Reference

### Users — `/api/users`
| Method | Endpoint                    | Access  | Description               |
| ------ | --------------------------- | ------- | ------------------------- |
| POST   | `/`                         | Public  | Register a new user       |
| POST   | `/login`                    | Public  | Authenticate & get token  |
| POST   | `/forgot-password`          | Public  | Generate password reset token |
| PUT    | `/reset-password/:token`    | Public  | Reset password with token |
| GET    | `/profile`                  | Private | Get user profile          |
| PUT    | `/profile`                  | Private | Update user profile       |
| GET    | `/`                         | Admin   | Get all users             |
| GET    | `/:id`                      | Admin   | Get user by ID            |
| PUT    | `/:id`                      | Admin   | Update user               |
| DELETE | `/:id`                      | Admin   | Delete user               |

### Products — `/api/products`
| Method | Endpoint                    | Access  | Description               |
| ------ | --------------------------- | ------- | ------------------------- |
| GET    | `/`                         | Public  | List products (search, filter, paginate) |
| GET    | `/:id`                      | Public  | Get single product        |
| POST   | `/`                         | Seller  | Create a product          |
| PUT    | `/:id`                      | Seller  | Update a product          |
| DELETE | `/:id`                      | Admin   | Delete a product          |
| POST   | `/:id/reviews`              | Private | Add a product review      |

### Orders — `/api/orders`
| Method | Endpoint                    | Access  | Description               |
| ------ | --------------------------- | ------- | ------------------------- |
| POST   | `/`                         | Private | Create a new order        |
| GET    | `/myorders`                 | Private | Get logged-in user's orders |
| GET    | `/:id`                      | Private | Get order by ID           |
| PUT    | `/:id/pay`                  | Private | Mark order as paid        |
| PUT    | `/:id/deliver`              | Seller  | Mark order as delivered   |
| GET    | `/`                         | Admin   | Get all orders            |

### Notifications — `/api/notifications`
| Method | Endpoint                    | Access  | Description               |
| ------ | --------------------------- | ------- | ------------------------- |
| GET    | `/`                         | Private | Get user's notifications (latest 20) |
| GET    | `/unread-count`             | Private | Get unread notification count |
| PUT    | `/read-all`                 | Private | Mark all as read          |
| PUT    | `/:id/read`                 | Private | Mark single notification as read |

### File Upload — `/api/upload`
| Method | Endpoint                    | Access  | Description               |
| ------ | --------------------------- | ------- | ------------------------- |
| POST   | `/`                         | Private | Upload a product image    |

---

## 🔹 Project Structure

```
construction_equip/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chatbot.js           # AI chatbot widget
│   │   │   ├── Footer.js            # Site footer
│   │   │   ├── Navbar.js            # Top navigation bar
│   │   │   ├── NotificationDropdown.js  # Bell icon + notification panel
│   │   │   └── ProductCard.js       # Reusable product card
│   │   ├── pages/
│   │   │   ├── AllProductsPage.js   # Browse & filter all products
│   │   │   ├── CartPage.js          # Shopping cart
│   │   │   ├── DashboardPage.js     # Seller/Admin dashboard
│   │   │   ├── ForgotPasswordPage.js
│   │   │   ├── HomePage.js          # Landing page with categories
│   │   │   ├── LoginPage.js
│   │   │   ├── MyOrdersPage.js      # User's order history
│   │   │   ├── OrderPage.js         # Single order details
│   │   │   ├── PaymentPage.js       # Payment method selection
│   │   │   ├── PlaceOrderPage.js    # Order review & confirmation
│   │   │   ├── ProductPage.js       # Product detail view
│   │   │   ├── ProfilePage.js       # User profile management
│   │   │   ├── RegisterPage.js
│   │   │   ├── ResetPasswordPage.js
│   │   │   └── ShippingPage.js      # Shipping address form
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js     # Authentication state
│   │   │   │   ├── cartSlice.js     # Cart state
│   │   │   │   ├── notificationSlice.js  # Notifications state
│   │   │   │   ├── orderSlice.js    # Orders state
│   │   │   │   └── productSlice.js  # Products state
│   │   │   └── index.js            # Redux store configuration
│   │   ├── utils/
│   │   ├── App.js                   # Root component with routes
│   │   └── index.js                 # React entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                          # Express Backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── notificationController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT protect, admin, seller guards
│   ├── models/
│   │   ├── Notification.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── notificationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/                     # Stored product images
│   ├── seed.js                      # Database seeder script
│   ├── server.js                    # Express app entry point
│   └── package.json
│
├── package.json                     # Root scripts (concurrently)
└── README.md
```

---

## 🔹 Prerequisites

- **Node.js** v16 or higher
- **MongoDB** installed locally or a cloud URI (e.g. MongoDB Atlas)

---

## 🔹 Installation & Running

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd construction_equip
   ```

2. **Install all dependencies** (root + client + server):
   ```bash
   npm run install-all
   ```

3. **Configure environment variables** — create `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/construction_equip
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

4. **Seed the database** (optional but recommended):
   ```bash
   cd server
   node seed.js
   cd ..
   ```

5. **Run the application**:
   ```bash
   npm start
   ```
   This starts both servers concurrently:
   - **Frontend** → http://localhost:3000
   - **Backend API** → http://localhost:5000

---

## 🔹 Available Scripts

| Script              | Command                  | Description                              |
| ------------------- | ------------------------ | ---------------------------------------- |
| `npm start`         | Root                     | Run client + server concurrently         |
| `npm run server`    | Root                     | Run only the backend (with nodemon)      |
| `npm run client`    | Root                     | Run only the frontend                    |
| `npm run install-all` | Root                   | Install deps for root, server, and client |

---

## 🔹 Design Philosophy

BuildBazaar uses a dark-themed, premium navbar with amber/gold accent colors (`#f5a623`) paired with clean white content areas. The UI prioritizes:

- **Professional aesthetics** suited for the construction industry
- **Responsive design** across all screen sizes
- **Smooth micro-interactions** with Framer Motion animations
- **Intuitive navigation** with category-based browsing and full-text search
- **Accessibility** with proper ARIA labels and semantic HTML

---

## 🔹 License

MIT License
