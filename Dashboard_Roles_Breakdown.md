# Dashboard Roles & Rights Breakdown

The platform features three segregated dashboards, ensuring that each team only has access to the tools they need to perform their jobs.

## 1. The Admin Dashboard (`/dashboard`)
* **Who accesses it**: Users with the `role: "admin"`
* **Their Rights (Full System Access)**:
  - **Products**: Can create, edit, and delete any product in the catalog.
  - **Orders**: Can view all orders, mark them as delivered, and manage returns.
  - **Users**: Can view, edit, and delete any user account on the platform.
  - *Supervisor Rights*: They have default access to both the Sales and Support tools.

## 2. The Sales Dashboard (`/sales/dashboard`)
* **Who accesses it**: Users with the `role: "sales"`
* **Their Rights (Revenue & Negotiation)**:
  - **Quotes Kanban**: Can view and manage all "Custom Bulk Enquiries" (they cannot see standard single-item orders).
  - **Offer Management**: Can create, edit, and delete promotional discount codes and website banners.
  - *Restrictions*: They cannot delete user accounts or modify the main product catalog.

## 3. The Customer Support Dashboard (`/support/dashboard`)
* **Who accesses it**: Users with the `role: "support"`
* **Their Rights (Service & Tracking)**:
  - **Global User Lookup**: Can search for any user by name or email to view their account details.
  - **Order Tracking**: Can view all standard orders and update their delivery status (e.g., marking a package as delivered).
  - *Restrictions*: They cannot access the Quotes Kanban, create discount codes, or delete products.

---

## Technical Implementation Details
- **Security Middleware**: Backend routes are strictly protected by custom `sales`, `support`, and `admin` middleware functions in `authMiddleware.js`.
- **Dynamic Navigation**: The frontend `Navbar.js` automatically hides or shows the dashboard links based on the authenticated user's active JSON Web Token (JWT) role.
- **Redux State**: Dedicated slices (`offerSlice`, `orderSlice`) handle the data fetching ensuring isolated state management for each panel.
