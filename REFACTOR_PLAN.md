# SO Management - Refactoring Plan

## Analisis Awal

### Struktur Sekarang

```
src/
├── client/
│   ├── api/client.js          (63 baris)
│   ├── components/
│   │   ├── DataTable.jsx      (436 baris) ⬅️ PERLU DIPECAH
│   │   ├── FilterPanel.jsx    (344 baris)
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   ├── Modal.jsx          (273 baris) ⬅️ PERLU DIPECAH
│   │   ├── Sidebar.jsx        (462 baris)
│   │   └── Toast.jsx
│   ├── pages/
│   │   ├── Admin.jsx          (810 baris) ⬅️ PERLU DIPECAH - 3 tab besar
│   │   ├── SalesOrders.jsx    (698 baris) ⬅️ PERLU DIPECAH
│   │   ├── Dashboard.jsx      (494 baris) ⬅️ PERLU DIPECAH
│   │   ├── Reports.jsx        (459 baris)
│   │   ├── Alerts.jsx         (397 baris)
│   │   ├── Users.jsx          (374 baris)
│   │   ├── Products.jsx       (343 baris)
│   │   ├── Customers.jsx      (305 baris)
│   │   └── ...
│   ├── store/authStore.js
│   ├── utils/barcode.js
│   └── App.jsx
└── server/
    ├── db.js                  (419 baris) ⬅️ PERLU DIPECAH - migrations + schema
    ├── index.js
    ├── middleware/auth.js
    ├── utils/logger.js
    └── routes/
        ├── sales-orders.js    (227 baris)
        ├── customers.js      (172 baris)
        ├── products.js       (173 baris)
        ├── users.js          (275 baris)
        └── ... (9 route files)
```

---

## Masalah yang Ditemukan

### 1. Files yang Terlalu Besar (>300 baris)

| File | Lines | Issues |
|------|-------|--------|
| Admin.jsx | 810 | 3 sub-components + complex modal logic |
| SalesOrders.jsx | 698 | SOItemsEditor + form logic + filters |
| Dashboard.jsx | 494 | Too many chart computations inline |
| Sidebar.jsx | 462 | Desktop + Mobile duplicate logic |
| DataTable.jsx | 436 | Cell helpers + export logic |
| Reports.jsx | 459 | - |
| FilterPanel.jsx | 344 | - |
| db.js | 419 | Migrations + Schema + Seed data |

### 2. Duplicate Patterns

| Pattern | Files Affected | Solution |
|---------|----------------|----------|
| Toast usage (`window.__TOAST__`) | 8+ pages | Custom hook `useToast()` |
| Status badge rendering | Admin, SalesOrders, Dashboard | Extract `StatusBadge` component |
| Date formatting | 6+ files | Extract `useDateFormat` hook + `formatDate` util |
| Loading state | 4+ files | Extract `LoadingSpinner` component |
| Stats calculation | Dashboard, SalesOrders | Create `useStats` hook |
| Form modal field rendering | Admin, SalesOrders | Extract `useFormFields` hook |

### 3. Missing Abstractions

- No `useApi` custom hook (repetitive fetch logic)
- No `useFilters` hook (repeated filter state)
- No centralized constants (STATUS_OPTIONS, TYPE_OPTIONS)
- No shared types/interfaces
- Modal components too monolithic

---

## Strategi Refactoring

### Phase 1: Shared Utilities & Hooks (Foundation)

```
src/client/
├── hooks/
│   ├── useToast.js           # Replace window.__TOAST__
│   ├── useApi.js             # Centralized API calls
│   ├── useFilters.js         # Filter state management
│   ├── useStats.js           # Stats calculation
│   ├── useLocalStorage.js    # localStorage abstraction
│   └── useDebounce.js        # Debounce utility
├── utils/
│   ├── constants.js          # STATUS_OPTIONS, TYPE_OPTIONS, etc.
│   ├── formatters.js         # formatDate, formatNumber
│   └── validation.js         # Form validation helpers
├── components/ui/
│   ├── StatusBadge.jsx       # Reusable status badge
│   ├── LoadingSpinner.jsx    # Loading component
│   ├── EmptyState.jsx        # Empty state component
│   └── StatCard.jsx          # Stats card component
```

### Phase 2: Component Refactoring

**DataTable.jsx** → Split into:
- `DataTable.jsx` (main table logic, ~200 lines)
- `TableCell.jsx` (BadgeCell, NumberCell, DateCell - already exists)
- `TablePagination.jsx` (pagination logic)
- `TableFilters.jsx` (search + filter UI)
- `TableExport.jsx` (export functionality)

**Modal.jsx** → Split into:
- `Modal.jsx` (base modal structure, ~80 lines)
- `ViewModal.jsx` (view-only modal)
- `FormModal.jsx` (form modal with validation)
- `DeleteModal.jsx` (confirmation modal)
- `ModalField.jsx` (field type renderers)

**Sidebar.jsx** → Simplify:
- Extract `NavItem` component
- Extract `SidebarHeader` component
- Use shared hook for collapse state

### Phase 3: Page Refactoring

**Admin.jsx (810 → 200 lines)**

```
src/client/pages/admin/
├── AdminPage.jsx            # Main container + tab routing
├── UsersTab.jsx             # User management (250 lines)
├── CustomersTab.jsx         # Customer tree view (250 lines)
├── ProductsTab.jsx          # Product grid (100 lines)
└── DestinationsModal.jsx    # Destination CRUD
```

**SalesOrders.jsx (698 → 250 lines)**

```
src/client/pages/sales-orders/
├── SalesOrdersPage.jsx      # Main page (250 lines)
├── SOItemsEditor.jsx        # Item editor (80 lines) - extract
├── SOStatsBar.jsx           # Stats display (40 lines)
├── SOFilters.jsx             # Filter UI (60 lines)
└── SOFormModal.jsx          # Custom form content
```

**Dashboard.jsx (494 → 250 lines)**

```
src/client/pages/dashboard/
├── DashboardPage.jsx        # Main (200 lines)
├── StatsCards.jsx           # Stats display (50 lines)
├── ChartGrid.jsx            # Chart arrangement (80 lines)
└── FilterBar.jsx            # Filter controls (60 lines)
```

### Phase 4: Server Refactoring

**db.js (419 lines)**

```
src/server/
├── db/
│   ├── index.js             # DB connection only (~30 lines)
│   ├── schema.js            # Table creation (~200 lines)
│   ├── migrations.js        # All migration logic (~150 lines)
│   └── seed.js              # Default data seeding (~40 lines)
└── index.js                 # Server entry (unchanged)
```

---

## Implementation Order

### Week 1: Foundation
1. Create `src/client/hooks/` with useToast, useApi, useFilters
2. Create `src/client/utils/constants.js`
3. Create `src/client/components/ui/` with shared components
4. Update 3 pages to use new hooks

### Week 2: Component Splitting
5. Split DataTable.jsx into sub-components
6. Split Modal.jsx into sub-components
7. Create StatusBadge, LoadingSpinner components

### Week 3: Page Refactoring
8. Refactor Admin.jsx → admin/ folder
9. Refactor SalesOrders.jsx → sales-orders/ folder
10. Refactor Dashboard.jsx → dashboard/ folder

### Week 4: Server Cleanup
11. Split db.js into db/ folder
12. Add indexes and optimization
13. Final cleanup and testing

---

## Duplicate Code yang Akan Dihapus

### Toast Pattern (8 files → 1 hook)
```javascript
// BEFORE: Each page has this
const toast = window.__TOAST__;
toast?.success?.('Saved');
toast?.error?.('Failed');

// AFTER: useToast hook
const toast = useToast();
toast.success('Saved');
```

### Stats Calculation (3 files → 1 hook)
```javascript
// BEFORE: Each page has own stats calculation
const stats = useMemo(() => {
  const total = filteredOrders.length;
  const completed = filteredOrders.filter(o => o.status === 'COMPLETED').length;
  // ... more calculations
}, [filteredOrders]);

// AFTER: useStats hook
const stats = useStats(filteredOrders, {
  total: true,
  byStatus: true,
  sumField: ['total_qty_plan', 'total_qty_actual']
});
```

### Form Field Rendering (2 files → shared)
```javascript
// BEFORE: Duplicate renderField logic in Admin.jsx and SalesOrders.jsx

// AFTER: useFormFields hook with shared field types
```

---

## Files to Create

### New Directory Structure

```
src/client/
├── hooks/
│   ├── useToast.js
│   ├── useApi.js
│   ├── useFilters.js
│   ├── useStats.js
│   ├── useLocalStorage.js
│   └── useDebounce.js
├── utils/
│   ├── constants.js
│   ├── formatters.js
│   └── validators.js
├── components/ui/
│   ├── StatusBadge.jsx
│   ├── LoadingSpinner.jsx
│   ├── EmptyState.jsx
│   ├── StatCard.jsx
│   ├── Card.jsx
│   └── IconButton.jsx
├── components/data/
│   ├── Table.jsx
│   ├── TableCell.jsx
│   ├── TablePagination.jsx
│   └── TableFilters.jsx
├── components/modals/
│   ├── Modal.jsx
│   ├── ViewModal.jsx
│   ├── FormModal.jsx
│   ├── DeleteModal.jsx
│   └── ConfirmModal.jsx
├── pages/
│   ├── admin/
│   │   ├── index.js
│   │   ├── AdminPage.jsx
│   │   ├── UsersTab.jsx
│   │   ├── CustomersTab.jsx
│   │   └── ProductsTab.jsx
│   ├── sales-orders/
│   │   ├── index.js
│   │   ├── SalesOrdersPage.jsx
│   │   ├── SOItemsEditor.jsx
│   │   └── SOFormContent.jsx
│   └── dashboard/
│       ├── index.js
│       ├── DashboardPage.jsx
│       └── components/
│           ├── StatsCards.jsx
│           ├── ChartsGrid.jsx
│           └── FilterBar.jsx

src/server/
├── db/
│   ├── index.js
│   ├── schema.js
│   ├── migrations.js
│   └── seed.js
```

---

## Migration Notes

### Breaking Changes
- `window.__TOAST__` → use `useToast()` hook
- All pages need import path updates
- Route files need to import from new db structure

### Non-Breaking (backward compatible)
- DataTable props unchanged
- Modal props unchanged
- Page routing unchanged

### Testing Strategy
1. Run existing tests
2. Refactor one component at a time
3. Test after each change
4. No large refactors in single commit

---

## Files to Delete

- `src/client/pages/SalesOrders_backup.jsx` (backup file - DELETE)
- `src/client/components/FilterPanel.jsx` (may merge into TableFilters)
- Server route files can be consolidated

---

## Success Metrics

- [ ] All files < 500 lines
- [ ] No duplicate code patterns
- [ ] Custom hooks used consistently
- [ ] Shared components extracted
- [ ] Tests pass after each phase
- [ ] 0 console.log statements in production code