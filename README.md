# SO Management System

## Overview

Aplikasi manajemen Sales Order dan Delivery Execution dengan arsitektur offline-first untuk Windows 10/11.

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Path**: `C:/so_management/data/delivery.db`
- **Authentication**: JWT + bcryptjs
- **Logging**: Winston
- **Validation**: Zod

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 6
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts

## Project Structure

```
so_management/
├── src/
│   ├── server/              # Express backend
│   │   ├── index.js         # Server entry point
│   │   ├── db/              # Database layer
│   │   │   ├── index.js     # DB connection (delivery.db)
│   │   │   ├── schema.js
│   │   │   ├── migrations.js
│   │   │   └── seed.js
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── customers.js
│   │   │   ├── products.js
│   │   │   ├── sales-orders.js
│   │   │   ├── delivery.js
│   │   │   ├── alerts.js
│   │   │   ├── reports.js
│   │   │   ├── audit.js
│   │   │   └── ...
│   │   ├── middleware/      # Express middleware
│   │   │   └── auth.js
│   │   └── utils/
│   │       └── logger.js
│   └── client/              # React frontend
│       ├── main.jsx         # Entry point
│       ├── App.jsx          # Root component
│       ├── index.css        # Global styles
│       ├── api/
│       │   └── client.js    # Axios client
│       ├── store/
│       │   └── authStore.js # Zustand auth store
│       ├── components/
│       │   ├── ui/          # Base UI components
│       │   ├── table/       # Table components
│       │   ├── modals/      # Modal components
│       │   ├── sidebar/     # Sidebar components
│       │   ├── DataTable.jsx
│       │   ├── Header.jsx
│       │   ├── Layout.jsx
│       │   ├── Modal.jsx
│       │   ├── Sidebar.jsx
│       │   └── Toast.jsx
│       ├── pages/
│       │   ├── dashboard/   # Dashboard page
│       │   ├── sales-orders/ # SO management
│       │   ├── delivery/    # Delivery execution
│       │   ├── alerts/      # Alert system
│       │   ├── reports/     # Reports & charts
│       │   ├── admin/       # Admin pages
│       │   ├── Login.jsx
│       │   ├── Customers.jsx
│       │   ├── Products.jsx
│       │   └── Users.jsx
│       ├── hooks/           # Custom hooks
│       └── utils/           # Utilities
├── scripts/                 # Build & utility scripts
│   ├── build-server.js
│   ├── db-migrate.js
│   ├── ensure-utf8.js
│   └── migrate-po-to-so.js
├── data/
│   └── delivery.db          # (gitignored)
├── dist/                    # Frontend build output
├── dist-server/             # Backend build output
├── .env
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

## Features

### Core Modules

#### 1. Dashboard
- Overview metrics (Total, Pending, In Progress, Completed)
- Plan vs Actual quantity tracking
- OTIF (On Time In Full) percentage
- Charts: Bar charts, Donut charts, Distribution by bucket/destination
- Filter by date range (Daily, Weekly, Monthly)
- Filter by status and destination

#### 2. Sales Orders
- **CRUD Operations**: Create, Read, Update, Delete SO
- **Bucket System**: Group SO by bucket number
- **Multi-step Form**:
  - Delivery Type selection (Regular, CKD, Non Regular)
  - Customer selection (filtered by delivery type)
  - Destination selection (filtered by customer + delivery type)
  - Manual address entry option
  - Multiple items per SO (item number, model code, quantity)
  - Bucket number assignment
  - Delivery date
  - Remarks
- **Status Management**: PENDING, PARTIAL, COMPLETED
- **Export**: CSV export functionality
- **Bulk Selection**: Select multiple SOs for batch operations
- **Filters**: Search by SO number, customer, destination
- **Status Filter**: Filter by SO status
- **Type Filter**: Filter by delivery type

#### 3. Delivery Execution
- Batch processing for SO delivery
- QR/Barcode scanning
- Box management (open, sealed)
- Unit scanning with prefix validation
- Real-time progress tracking

#### 4. Alerts
- SLA monitoring with auto-escalation
- Alert types: DELAY, QTY_MISMATCH, DUPLICATE, PREFIX_MISMATCH
- Severity levels: Critical, Warning, Info
- Read/unread status tracking

#### 5. Reports
- Sales performance analytics
- Charts and visualizations
- Date range filtering

#### 6. Admin
- **Users Management**: Create, edit, delete users with roles
- **Products Master**: Product catalog with part numbers, model codes
- **Customers Management**: Customer master data with destinations

### Authentication
- JWT-based login
- 5 roles: admin, ppic, warehouse, qc, viewer
- Role-based permissions

## Pages

| Page | Path | Description |
|------|------|-------------|
| Login | `/login` | User authentication |
| Dashboard | `/` | Overview and metrics |
| Sales Orders | `/sales-orders` | SO management |
| Delivery | `/delivery` | Delivery execution |
| Alerts | `/alerts` | System alerts |
| Reports | `/reports` | Analytics and charts |
| Users | `/users` | User management (admin) |
| Products | `/products` | Product catalog (admin) |
| Customers | `/customers` | Customer management (admin) |

## API Endpoints

### Authentication
```
POST /api/auth/login     - Login user
POST /api/auth/logout    - Logout user
GET  /api/auth/me        - Get current user
```

### Sales Orders
```
GET    /api/sales-orders        - List all SOs (with filters)
GET    /api/sales-orders/:id    - Get SO detail with items
POST   /api/sales-orders        - Create new SO
PATCH  /api/sales-orders/:id    - Update SO
DELETE /api/sales-orders/:id    - Delete SO
```

### Master Data
```
GET/POST/PATCH/DELETE /api/customers
GET/POST/PATCH/DELETE /api/products
GET/POST/PATCH/DELETE /api/users
GET/POST/PATCH/DELETE /api/destinations
GET/POST/PATCH/DELETE /api/delivery-types
```

### Delivery
```
POST /api/delivery/start-batch     - Start delivery batch
POST /api/delivery/scan-unit       - Scan unit
POST /api/delivery/seal-box         - Seal box
POST /api/delivery/complete-batch   - Complete batch
GET  /api/delivery/batches          - List batches
```

### Alerts & Reports
```
GET /api/alerts     - List alerts
GET /api/reports    - Analytics data
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- API Server: http://127.0.0.1:43118

### Build
```bash
npm run build
```

### Start Production
```bash
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development (frontend + backend) |
| `npm run dev:server` | Backend only |
| `npm run dev:client` | Frontend only |
| `npm run build` | Build for production |
| `npm run build:server` | Build server only |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run check:utf8` | Check UTF-8 encoding |
| `npm run fix:utf8` | Fix UTF-8 encoding |

## Database Schema

### Core Tables
- `users` - User accounts with role-based access
- `customers` - Customer master data
- `product_master` - Product catalog
- `sales_orders` - SO headers (references purchase_orders)
- `so_items` - SO line items
- `delivery_batches` - Delivery execution batches
- `delivery_boxes` - Box tracking
- `scanned_units` - Individual unit scans
- `alerts` - System alerts with SLA
- `po_locks` - Concurrent editing prevention
- `delivery_amend_requests` - Amendment workflow
- `po_audit_logs` - Audit trail
- `integration_webhooks` - Webhook configurations
- `role_permission_matrix` - RBAC permissions

## Default Credentials
```
Username: admin
Password: Admin@123456!
```

## License
Proprietary - Internal use only