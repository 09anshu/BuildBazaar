# 🏗️ BuildBazaar — Construction E-Commerce Platform

A modern, full-stack e-commerce web application for buying and selling construction materials, tools, machinery, and safety equipment. Designed with an Amazon-inspired user experience, BuildBazaar connects buyers and sellers across the construction industry — with dedicated dashboards for Admin, Sales, and Customer Support teams.

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
- Browse products by category (Cement, Steel, Tools, Machinery, Rentals, Safety Equipment, Electrical, Plumbing, Paint)
- Advanced filtering by Category, Brand, Material Type, Price Range, and Availability
- Full-text search across all products
- Add to cart with quantity management
- Immersive product detail page with image gallery, stock status, delivery estimates, highlights, and specifications

### 👤 User Authentication & Accounts
- User registration with role selection (Customer / Seller)
- Secure login with JWT-based sessions
- Profile management (name, email, password update)
- Forgot password flow with reset token link
- Role-based access control with 6 roles: `customer`, `seller`, `admin`, `sales`, `support`

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
- Staff can mark orders as delivered

### 🤖 AI & Support
- AI-powered product recommendations based on categories
- Built-in chatbot for instant construction-related queries

### 📍 Location Services
- GPS-based site location capture
- Manual address entry for delivery
- Saved shipping addresses for checkout

---

## 🔹 Role-Based Dashboards (RBAC)

The platform features **three segregated dashboards**, ensuring each team only has access to the tools they need.

### 🛡️ Admin Panel (`/dashboard`)
> **Who accesses it**: Users with `role: "admin"`

| Tab | Capabilities |
|-----|-------------|
| **Overview** | Revenue stats, pending orders, total products, total users, quick-access links to Sales & Support dashboards |
| **Products** | Full CRUD — create, edit, and delete any product in the catalog |
| **Orders** | View all orders (standard + enquiries), mark as delivered |
| **Users & Roles** | View all users, change any user's role via dropdown, delete users, **create new staff accounts** with role assignment |
| **Team Monitor** | View Sales & Support team members, enquiry summaries, fulfillment stats, direct links to sub-dashboards |

> **Supervisor Rights**: Admins have default access to both the Sales and Support dashboards.

### 📈 Sales Panel (`/sales/dashboard`)
> **Who accesses it**: Users with `role: "sales"`

| Tab | Capabilities |
|-----|-------------|
| **Quotes & Enquiries** | Kanban board with 4 columns (New → Quoted → Countered → Won) for managing active enquiries. View customer notes, provide quotes, and handle counter-offers. |
| **Live Sheet** | Real-time spreadsheet view of all won/closed deals from the enquiry pipeline. Includes Excel export functionality. |
| **Order History** | Complete pipeline history showing all enquiries (won, lost, pending, rejected). Features status filters, accurate sales stats, and Excel export. |
| **Offer Management** | Create, toggle on/off, and delete promotional discount codes. |

> **Restrictions**: Cannot delete user accounts or modify the main product catalog.

### 🎧 Support Panel (`/support/dashboard`)
> **Who accesses it**: Users with `role: "support"`

| Tab | Capabilities |
|-----|-------------|
| **Order Tracking** | View all standard orders, update delivery status, process **cancellations**, process **refunds**, and edit shipping addresses. Features an expandable **Order Timeline**. |
| **Tickets** | Comprehensive ticketing system. View open/progress/closed tickets, reply directly to customer queries via the built-in communication hub. |
| **Enquiries** | Dedicated view for managing bulk enquiries without cluttering the main order feed. |
| **Live Chat** | Real-time chat takeover. View active sessions, claim waiting customers, and provide live assistance via Socket.io. |
| **User Lookup** | Search any user by name, email, or phone. Features a **"View As" (Impersonation)** mode to see the platform from the customer's perspective. |
| **FAQ Editor** | Full CMS for creating, categorizing, and publishing Knowledge Base articles visible to end-users on the `/contact-support` page. |
| **Activity Logs** | System-wide audit trail tracking all major actions (refunds, role changes, order cancellations) with timestamps and agent details. |

> **Restrictions**: Cannot access Quotes Kanban, create discount codes, or delete products.

### 🔒 Security Implementation

| Component | Details |
|-----------|---------|
| **Backend Middleware** | `protect`, `admin`, `seller`, `sales`, `support`, `staff` guards in `authMiddleware.js` |
| **Dynamic Navigation** | Navbar automatically shows/hides dashboard links based on user's JWT role |
| **Frontend Guards** | Each dashboard component validates role on mount, redirects unauthorized users to login |
| **Redux State** | Dedicated slices (`offerSlice`, `notificationSlice`, `orderSlice`) for isolated state management |

---

## 🔹 API Reference

### Users — `/api/users`
| Method | Endpoint                    | Access  | Description               |
| ------ | --------------------------- | ------- | ------------------------- |
| POST   | `/`                         | Public  | Register a new user (Customer/Seller only) |
| POST   | `/admin-create`             | Admin   | Create a user with any role (Admin/Staff) |
| POST   | `/login`                    | Public  | Authenticate & get token  |
| POST   | `/forgot-password`          | Public  | Generate password reset token |
| PUT    | `/reset-password/:token`    | Public  | Reset password with token |
| GET    | `/profile`                  | Private | Get user profile          |
| PUT    | `/profile`                  | Private | Update user profile       |
| GET    | `/`                         | Staff   | Get all users             |
| GET    | `/:id`                      | Staff   | Get user by ID            |
| PUT    | `/:id`                      | Admin   | Update user (including role) |
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
| POST   | `/`                         | Private | Create a new standard order |
| GET    | `/myorders`                 | Private | Get logged-in user's orders |
| GET    | `/:id`                      | Private | Get order by ID           |
| PUT    | `/:id/pay`                  | Private | Mark order as paid        |
| PUT    | `/:id/deliver`              | Staff   | Mark order as delivered   |
| PUT    | `/:id/cancel`               | Staff   | Cancel order with reason  |
| PUT    | `/:id/refund`               | Staff   | Process order refund      |
| PUT    | `/:id/update-address`       | Staff   | Edit shipping address     |
| GET    | `/enquiries`                | Sales   | Get active enquiries      |
| PUT    | `/:id/quote`                | Sales   | Send quote to customer    |
| PUT    | `/:id/counter`              | Private | Customer proposes counter |
| PUT    | `/:id/counter-by-sales`     | Sales   | Sales proposes counter    |
| PUT    | `/:id/accept-counter`       | Sales   | Sales accepts counter     |
| PUT    | `/:id/decline-counter`      | Sales   | Sales declines counter    |
| PUT    | `/:id/reject`               | Sales   | Sales rejects enquiry     |
| PUT    | `/:id/accept-quote`         | Private | Customer accepts quote    |
| GET    | `/sales-history`            | Sales   | Get complete pipeline history |
| GET    | `/sales-closed`             | Sales   | Get won/closed enquiries  |
| GET    | `/standard`                 | Support | Get standard orders for tracking |
| GET    | `/`                         | Admin   | Get all orders            |

### Offers — `/api/offers`
| Method | Endpoint                    | Access  | Description               |
| ------ | --------------------------- | ------- | ------------------------- |
| GET    | `/`                         | Public  | Get active offers         |
| GET    | `/all`                      | Sales   | Get all offers (active + inactive) |
| POST   | `/`                         | Sales   | Create a new offer        |
| PUT    | `/:id`                      | Sales   | Update an offer           |
| DELETE | `/:id`                      | Sales   | Delete an offer           |

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

### Support & CRM APIs
| Method | Endpoint                    | Access  | Description               |
| ------ | --------------------------- | ------- | ------------------------- |
| POST   | `/api/tickets`              | Private | Submit a support ticket   |
| POST   | `/api/tickets/:id/messages` | Private | Reply to a ticket         |
| GET    | `/api/tickets`              | Staff   | View all tickets          |
| GET    | `/api/faqs`                 | Public  | Get published FAQs        |
| POST   | `/api/faqs`                 | Staff   | Create a new FAQ          |
| GET    | `/api/chat-sessions`        | Staff   | Get active chat sessions  |
| GET    | `/api/activity-logs`        | Staff   | View system audit trail   |

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
│   │   │   ├── Navbar.js            # Top navigation bar (role-based links)
│   │   │   ├── NotificationDropdown.js  # Bell icon + notification panel
│   │   │   └── ProductCard.js       # Reusable product card
│   │   ├── pages/
│   │   │   ├── AllProductsPage.js   # Browse & filter all products
│   │   │   ├── CartPage.js          # Shopping cart
│   │   │   ├── DashboardPage.js     # Admin Panel (Overview, Products, Orders, Users, Teams)
│   │   │   ├── SalesDashboard.js    # Sales Panel (Quotes Kanban, Offer Management)
│   │   │   ├── SupportDashboard.js  # Support Panel (Order Tracking, User Lookup)
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
│   │   │   │   ├── offerSlice.js    # Offers/promotions state
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
│   │   ├── notificationController.js  # Notification CRUD + helper
│   │   ├── offerController.js       # Offer/promo CRUD
│   │   ├── orderController.js       # Order management + auto-notifications
│   │   ├── productController.js     # Product CRUD + reviews
│   │   └── userController.js        # Auth, profile, user management
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT protect, admin, seller, sales, support, staff guards
│   ├── models/
│   │   ├── Notification.js          # Notification schema
│   │   ├── Offer.js                 # Discount/promo schema
│   │   ├── Order.js                 # Order schema (standard + enquiry)
│   │   ├── Product.js               # Product schema with wholesale tiers
│   │   └── User.js                  # User schema with role enum
│   ├── routes/
│   │   ├── notificationRoutes.js
│   │   ├── offerRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/                     # Stored product images
│   ├── seed.js                      # Database seeder (products + admin user)
│   ├── server.js                    # Express app entry point
│   └── package.json
│
├── Dashboard_Roles_Breakdown.md     # RBAC architecture documentation
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

4. **Seed the database** (optional but recommended — creates products + admin user):
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

### Default Admin Login
After seeding, log in with:
- **Email**: `admin@buildbazaar.com`
- **Password**: `Admin@123`

From the Admin Panel → **Users & Roles** tab, you can create new staff accounts or promote existing users to `sales` / `support` roles.

---

## 🔹 Available Scripts

| Script              | Command                  | Description                              |
| ------------------- | ------------------------ | ---------------------------------------- |
| `npm start`         | Root                     | Run client + server concurrently         |
| `npm run server`    | Root                     | Run only the backend (with nodemon)      |
| `npm run client`    | Root                     | Run only the frontend                    |
| `npm run install-all` | Root                   | Install deps for root, server, and client |

---

## 🔹 User Roles & Access Matrix

| Feature | Customer | Seller | Sales | Support | Admin |
|---------|:--------:|:------:|:-----:|:-------:|:-----:|
| Browse & buy products | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own orders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create/edit products | ❌ | ✅ | ❌ | ❌ | ✅ |
| Seller Dashboard | ❌ | ✅ | ✅ | ❌ | ✅ |
| Quotes Kanban | ❌ | ❌ | ✅ | ❌ | ✅ |
| Offer Management | ❌ | ❌ | ✅ | ❌ | ✅ |
| Order Tracking (all) | ❌ | ❌ | ❌ | ✅ | ✅ |
| User Lookup | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mark orders delivered | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage users & roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete products/users | ❌ | ❌ | ❌ | ❌ | ✅ |
| Team Monitor | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔹 Design Philosophy

BuildBazaar uses a dark-themed, premium navbar with amber/gold accent colors (`#f5a623`) paired with clean white content areas. The UI prioritizes:

- **Professional aesthetics** suited for the construction industry
- **Responsive design** across all screen sizes
- **Smooth micro-interactions** with Framer Motion animations
- **Intuitive navigation** with category-based browsing and full-text search
- **Role-segregated dashboards** with dedicated sidebar navigation and stats
- **Accessibility** with proper ARIA labels and semantic HTML

---

## 🔹 License

MIT License
