# Dashboard Roles & Rights Breakdown

The platform features three segregated dashboards, ensuring that each team only has access to the tools they need to perform their jobs.

## User Roles & Access Matrix

| Feature | Customer | Seller | Sales | Support | Admin |
|---|---|---|---|---|---|
| Browse & buy products | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own orders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create/edit products | ❌ | ✅ | ❌ | ❌ | ✅ |
| Seller Dashboard | ❌ | ✅ | ❌ | ❌ | ✅ |
| Quotes Kanban | ❌ | ❌ | ✅ | ❌ | ✅ |
| Offer Management | ❌ | ❌ | ✅ | ❌ | ✅ |
| Order Tracking (all) | ❌ | ❌ | ❌ | ✅ | ✅ |
| User Lookup | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mark orders delivered | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage users & roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete products/users | ❌ | ❌ | ❌ | ❌ | ✅ |
| Team Monitor | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 1. The Admin Dashboard (`/dashboard`)
* **Who accesses it**: Users with the `role: "admin"`
* **Their Rights (Full System Access)**:
  - **Products**: Can create, edit, and delete any product in the catalog.
  - **Orders**: Can view all orders, mark them as delivered, and manage returns.
  - **Users**: Can view, edit, and delete any user account on the platform.
  - **Team Monitor**: Can oversee all sales and support team activity.
  - *Supervisor Rights*: They have default access to both the Sales and Support tools.

## 2. The Seller Dashboard (`/seller/dashboard`)
* **Who accesses it**: Users with the `role: "seller"`
* **Their Rights (Product Management)**:
  - **Products**: Can create and edit their own products.
  - **Own Orders**: Can view orders for their products.
  - *Restrictions*: Cannot access admin, sales, or support dashboards. Cannot delete other users' products.

## 3. The Sales Dashboard (`/sales/dashboard`)
* **Who accesses it**: Users with the `role: "sales"`
* **Their Rights (Revenue & Negotiation)**:
  - **Quotes Kanban**: Can view and manage all "Custom Bulk Enquiries" (they cannot see standard single-item orders).
  - **Offer Management**: Can create, edit, and delete promotional discount codes and website banners.
  - **Mark Delivered**: Can mark orders as delivered.
  - *Restrictions*: Cannot view all standard orders, look up users, delete user accounts, or modify the main product catalog.

## 4. The Customer Support Dashboard (`/support/dashboard`)
* **Who accesses it**: Users with the `role: "support"`
* **Their Rights (Service & Tracking)**:
  - **Global User Lookup**: Can search for any user by name or email to view their account details.
  - **Order Tracking**: Can view all standard orders and update their delivery status (e.g., marking a package as delivered).
  - *Restrictions*: They cannot access the Quotes Kanban, create discount codes, or delete products.

---

## Technical Implementation Details
- **Security Middleware**: Backend routes are strictly protected by custom `sales`, `support`, `supportOrAdmin`, `staff`, and `admin` middleware functions in `authMiddleware.js`.
  - `admin`: Admin only
  - `seller`: Seller + Admin
  - `sales`: Sales + Admin
  - `support`: Support + Admin
  - `supportOrAdmin`: Support + Admin (used for user lookup and order tracking)
  - `staff`: Sales + Support + Admin (used for marking orders delivered)
- **Dynamic Navigation**: The frontend Navbar automatically hides or shows the dashboard links based on the authenticated user's active JSON Web Token (JWT) role.
- **Redux State**: Dedicated slices (`offerSlice`, `orderSlice`) handle the data fetching ensuring isolated state management for each panel.
- **Registration Security**: Self-registration is restricted to `customer` and `seller` roles only. Staff roles (`admin`, `sales`, `support`) must be assigned by an admin.
