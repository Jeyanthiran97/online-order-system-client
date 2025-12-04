# Online Order System - Frontend

A complete Next.js 14 frontend application for the Online Order System with multiple portals (Public, Customer, Seller, Deliverer, Admin).

## Features

- **Multi-Portal Architecture**:

  - Public portal with product browsing
  - Customer portal with order management
  - Seller portal with product and order management
  - Deliverer portal with delivery tracking
  - Admin portal with full system management

- **Authentication & Authorization**:

  - JWT-based authentication
  - Role-based access control (RBAC)
  - Approval workflow for sellers and deliverers
  - Protected routes with middleware

- **UI Components**:

  - Built with shadcn/ui and Tailwind CSS
  - Responsive design
  - Modern and clean interface

- **Features by Portal**:
  - **Public/Customer**: Product browsing, filtering, search, order placement
  - **Seller**: Product CRUD, order management, sales dashboard
  - **Deliverer**: Delivery assignment, status updates
  - **Admin**: User management, seller/deliverer approval, analytics with charts, order management

## Setup

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Run Development Server**:

   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin portal pages
│   │   ├── auth/               # Authentication pages
│   │   ├── customer/           # Customer portal pages
│   │   ├── deliverer/          # Deliverer portal pages
│   │   ├── seller/             # Seller portal pages
│   │   ├── products/           # Product detail pages
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── layouts/            # Layout components (Navbar, Sidebar)
│   │   ├── ui/                 # shadcn/ui components
│   │   └── ProductCard.tsx     # Product card component
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication context
│   ├── lib/
│   │   ├── api.ts              # Axios instance with interceptors
│   │   └── utils.ts            # Utility functions
│   ├── services/               # API service functions
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── orderService.ts
│   │   ├── deliveryService.ts
│   │   └── adminService.ts
│   └── middleware.ts           # Route protection middleware
```

## Routes

### Public Routes

- `/` - Home page with product listing
- `/products/[id]` - Product detail page
- `/auth/login` - Login page
- `/auth/signup` - Customer signup
- `/seller/register` - Seller registration
- `/deliverer/register` - Deliverer registration

### Customer Routes (Protected)

- `/customer` - Customer dashboard
- `/customer/orders` - Order history
- `/customer/profile` - Profile management

### Seller Routes (Protected, Requires Approval)

- `/seller` - Seller dashboard
- `/seller/products` - Product management
- `/seller/orders` - Order management

### Deliverer Routes (Protected, Requires Approval)

- `/deliverer` - Deliverer dashboard
- `/deliverer/deliveries` - Delivery management

### Admin Routes (Protected)

- `/admin` - Admin dashboard with analytics
- `/admin/users` - User management
- `/admin/sellers` - Seller approval management
- `/admin/deliverers` - Deliverer approval management
- `/admin/products` - Product overview
- `/admin/orders` - Order management

## Key Features

### Authentication Flow

1. User registers/logs in
2. JWT token stored in cookies
3. User profile fetched to check approval status
4. Sellers/Deliverers blocked if not approved
5. Role-based redirect after login

### Approval Workflow

- Sellers and Deliverers register with pending status
- Admin approves/rejects with reason
- Login blocked until approved
- Status checked on every authentication

### Route Protection

- Middleware checks authentication and role
- Redirects unauthorized users
- Checks approval status for sellers/deliverers

## Technologies Used

- **Next.js 14** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Axios** (API client)
- **Recharts** (Charts for admin dashboard)
- **js-cookie** (Cookie management)

## API Integration

All API calls are made through service functions in `/src/services/`:

- `authService` - Authentication endpoints
- `productService` - Product CRUD operations
- `orderService` - Order management
- `deliveryService` - Delivery tracking
- `adminService` - Admin operations

The API client (`/src/lib/api.ts`) automatically:

- Adds JWT token to requests
- Handles 401 errors (auto logout)
- Uses the base URL from environment variables

## Development Notes

- All components are client-side ("use client")
- Authentication state managed via React Context
- Toast notifications for user feedback
- Responsive design for mobile and desktop
- Error handling with user-friendly messages
