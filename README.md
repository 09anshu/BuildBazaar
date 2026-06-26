# BuildBazaar - Construction E-commerce Platform

A modern, full-stack e-commerce web application for buying and selling construction materials and equipment, designed with an Amazon-like user experience.

## 🔹 TECH STACK
- **Frontend**: React.js, React Router DOM, Tailwind CSS, Redux Toolkit, Lucide React
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens), Bcrypt.js
- **Other**: Multer (File Uploads), Axios, React Toastify

## 🔹 CORE FEATURES
- **User Authentication**: Sign up, Login, Profile Management, Role-based Access (Customer, Seller, Admin).
- **Product Management**: Browse by categories (Cement, Steel, Tools, Machinery, Safety, Electrical, Plumbing, Paint).
- **Advanced Filtering**: Filter products by Category, Brand, Material Type, Price Range, and Availability on the All Products page.
- **Shopping Experience**: Add to Cart, Quantity Management, Checkout, Order Summary.
- **Product Details**: Immersive product viewing gallery, stock status, delivery estimates, highlights, and specifications.
- **Order Management**: Order history, Tracking, Payment integration (Mock).
- **Seller Dashboard**: Manage products, View orders, Analytics.
- **Admin Panel**: Complete control over users, products, and orders.
- **AI Recommendation**: Product suggestions based on categories.
- **Chatbot**: Instant support for construction-related queries.

## 🔹 PREREQUISITES
- Node.js (v16+)
- MongoDB (installed locally or a cloud URI)

## 🔹 INSTALLATION & RUNNING

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd construction_equip
   ```

2. **Install all dependencies**:
   Run this from the root directory to install packages for root, client, and server:
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/construction_equip
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

4. **Seed the Database (Optional but Recommended)**:
   To populate the database with sample construction products, brands, and categories:
   ```bash
   cd server
   node seed.js
   cd ..
   ```

5. **Run the application**:
   From the root directory:
   ```bash
   npm start
   ```
   This will run both the frontend (localhost:3000) and backend (localhost:5000) concurrently.

## 🔹 PROJECT STRUCTURE
- `server/`: Express backend with MongoDB models, API controllers, and routes.
- `client/`: React frontend with Redux state management and Tailwind styling.
- `uploads/`: Directory for stored product images.

## 🔹 DESIGN PHILOSOPHY
The platform uses a clean, light-themed color palette (white, light grey, soft blue, beige, light yellow) to maintain a professional and minimal design suitable for the construction industry, mirroring the layout and robust user experience. It incorporates smooth micro-interactions, responsive design, and intuitive navigation.

## 🔹 LICENSE
MIT License
