# Folder Structure Documentation

This document explains the purpose of each folder and when to use them.

## 📂 Root Level

### `/src`
Main source code directory. All application code lives here.

### `/public`
Static files served as-is (favicon, robots.txt, etc.). Files here are not processed by Vite.

---

## 📂 Source Directory (`/src`)

### `/assets`
**Purpose:** Store static assets like images, fonts, icons, and videos.

**When to use:**
- Images used in components
- Custom fonts
- SVG icons
- Video files
- Any binary assets

**Structure:**
```
assets/
├── images/
│   ├── logo.svg
│   └── hero-bg.png
├── icons/
│   ├── check.svg
│   └── close.svg
└── fonts/
    └── custom-font.woff2
```

**Example usage:**
```tsx
import logo from '@assets/images/logo.svg'

function Header() {
  return <img src={logo} alt="Logo" />
}
```

---

### `/components`
**Purpose:** All React components organized by type.

#### `/components/common`
**Purpose:** Reusable UI components used throughout the application.

**When to create here:**
- Component is generic and reusable
- Used in 2+ different features/pages
- No business logic or API calls
- Pure presentation components

**Examples:**
- Button, Input, Select, Modal
- Card, Badge, Avatar
- LoadingSpinner, ErrorMessage
- Layout components (Grid, Flex)

**Structure:**
```
components/common/
├── Button/
│   ├── Button.tsx         # Component code
│   ├── Button.css         # Component styles
│   ├── Button.test.tsx    # Component tests
│   └── index.ts           # Barrel export
└── Input/
    ├── Input.tsx
    ├── Input.css
    └── index.ts
```

**Naming convention:**
- Folder: PascalCase matching component name
- Component file: `ComponentName.tsx`
- Always include barrel export (`index.ts`)

#### `/components/features`
**Purpose:** Feature-specific components with business logic.

**When to create here:**
- Component is specific to one feature
- Contains business logic or API calls
- Uses multiple common components
- Tied to specific data models

**Examples:**
- LoginForm, RegisterForm
- UserProfile, UserCard
- ProductList, ProductFilter
- PaymentForm, InvoiceDetails

**Structure:**
```
components/features/
├── LoginForm/
│   ├── LoginForm.tsx
│   ├── LoginForm.css
│   ├── useLoginForm.ts    # Custom hook for logic
│   └── index.ts
└── UserProfile/
    ├── UserProfile.tsx
    ├── UserProfile.css
    ├── UserAvatar.tsx      # Sub-component (optional)
    └── index.ts
```

**Key differences from common:**
- Can import from `services/`
- Can use feature-specific hooks
- May have sub-components
- Tied to specific business domain

---

### `/config`
**Purpose:** Application configuration and constants.

**When to create here:**
- Environment variables configuration
- API endpoints
- Route paths
- Application-wide constants
- Feature flags

**Files:**
```
config/
├── index.ts           # Main config (env vars)
└── constants.ts       # App constants
```

**Example:**
```typescript
// config/index.ts
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  },
}

// config/constants.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
}
```

---

### `/hooks`
**Purpose:** Custom React hooks.

**When to create here:**
- Reusable stateful logic
- Abstracting component logic
- Shared side effects

**Examples:**
- `useAuth` - Authentication state/methods
- `useDebounce` - Debounced value
- `useLocalStorage` - LocalStorage sync
- `useFetch` - Data fetching
- `useToggle` - Boolean state management

**Naming convention:**
- Always start with `use` prefix
- camelCase: `useMyHook.ts`

**Structure:**
```
hooks/
├── useAuth.ts
├── useDebounce.ts
├── useLocalStorage.ts
└── index.ts           # Barrel export
```

**Example:**
```typescript
// hooks/useToggle.ts
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggle = () => setValue(prev => !prev)
  return { value, toggle, setValue }
}
```

---

### `/layouts`
**Purpose:** Page layout components that wrap page content.

**When to create here:**
- Components that define page structure
- Shared headers, sidebars, footers
- Different layout variations

**Examples:**
- MainLayout (header + sidebar + content)
- AuthLayout (centered content)
- DashboardLayout (specific to dashboard)
- EmptyLayout (no chrome)

**Structure:**
```
layouts/
├── MainLayout/
│   ├── MainLayout.tsx
│   ├── MainLayout.css
│   ├── Header.tsx         # Layout sub-component
│   ├── Sidebar.tsx
│   └── index.ts
└── AuthLayout/
    ├── AuthLayout.tsx
    └── index.ts
```

**Usage in routes:**
```tsx
<Route element={<MainLayout />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>
```

---

### `/pages`
**Purpose:** Top-level page components representing routes.

**When to create here:**
- Component maps to a route
- Top-level view/screen
- Orchestrates multiple features

**Characteristics:**
- One page = one route
- Composes layouts and features
- Minimal logic (delegate to features/hooks)
- Data fetching at page level

**Examples:**
- HomePage, LoginPage, DashboardPage
- ProfilePage, SettingsPage
- ProductsPage, ProductDetailPage

**Structure:**
```
pages/
├── HomePage/
│   ├── HomePage.tsx
│   ├── HomePage.css
│   └── index.ts
├── DashboardPage/
│   ├── DashboardPage.tsx
│   ├── DashboardPage.css
│   └── index.ts
└── ProductDetailPage/
    ├── ProductDetailPage.tsx
    ├── useProductDetail.ts  # Page-specific hook
    └── index.ts
```

**Example:**
```tsx
// pages/DashboardPage/DashboardPage.tsx
export function DashboardPage() {
  return (
    <MainLayout>
      <DashboardStats />
      <RecentActivity />
      <QuickActions />
    </MainLayout>
  )
}
```

---

### `/routes`
**Purpose:** Routing configuration and route guards.

**Files:**
```
routes/
├── index.tsx           # Main route configuration
└── ProtectedRoute.tsx  # Auth guard component
```

**When to modify:**
- Adding new routes
- Changing route structure
- Adding route guards/middleware
- Implementing lazy loading

**Example:**
```tsx
// routes/index.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
  </Route>
</Routes>
```

---

### `/services`
**Purpose:** External integrations and API communication.

#### `/services/api`
**Purpose:** API client and service modules.

**When to create here:**
- Making HTTP requests
- Grouping related API calls
- Transforming API responses

**Structure:**
```
services/api/
├── axios.config.ts      # Axios instance + interceptors
├── auth.service.ts      # Auth endpoints
├── user.service.ts      # User endpoints
├── product.service.ts   # Product endpoints
└── index.ts             # Barrel export
```

**Pattern:**
```typescript
// services/api/user.service.ts
export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/users')
    return response.data.data
  },

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`)
    return response.data.data
  },
}
```

**Best practices:**
- One service file per domain/resource
- Export as object with methods
- Always type parameters and returns
- Handle errors at service level or let them bubble

---

### `/store`
**Purpose:** Global state management.

**When to use:**
- State shared across many components
- State that persists across routes
- Complex state logic

**Files:**
```
store/
├── AuthContext.tsx      # Context + Provider
├── ThemeContext.tsx
└── index.ts             # Barrel export
```

**Alternative (Zustand):**
```
store/
├── userStore.ts
├── cartStore.ts
└── index.ts
```

**When to use Context vs Zustand:**

**Use Context when:**
- Simple state (auth, theme)
- Few updates
- Small provider tree

**Use Zustand when:**
- Complex state logic
- Frequent updates
- Need devtools
- Performance matters

---

### `/styles`
**Purpose:** Global styles and theme configuration.

**Files:**
```
styles/
├── index.css           # Global styles
├── variables.css       # CSS custom properties
└── reset.css           # CSS reset (optional)
```

**When to modify:**
- Adding global styles
- Defining CSS variables
- Theme configuration
- Font imports

---

### `/types`
**Purpose:** TypeScript type definitions.

**When to create here:**
- Defining data models
- API request/response types
- Shared interfaces
- Type utilities

**Structure:**
```
types/
├── index.ts            # Re-exports all types
├── user.types.ts       # User domain types
├── product.types.ts    # Product domain types
├── api.types.ts        # Generic API types
└── common.types.ts     # Utility types
```

**Naming convention:**
- File: `domain.types.ts`
- Interface: PascalCase (`User`, `Product`)
- Type: PascalCase (`ApiResponse<T>`)

**Example:**
```typescript
// types/user.types.ts
export interface User {
  id: string
  email: string
  name: string
}

export interface UpdateUserData {
  name?: string
  email?: string
}
```

---

### `/utils`
**Purpose:** Utility functions and helpers.

**When to create here:**
- Pure functions
- Helper utilities
- Data transformations
- Validators
- Formatters

**Files:**
```
utils/
├── index.ts            # Barrel export
├── format.ts           # Formatting (dates, numbers, etc.)
├── validation.ts       # Validation functions
├── helpers.ts          # General helpers
└── storage.ts          # LocalStorage helpers
```

**Examples:**
- `formatDate(date)` - Format dates
- `isValidEmail(email)` - Validate email
- `debounce(fn, delay)` - Debounce function
- `cn(...classes)` - Class name utility

**Best practices:**
- One function = one purpose
- Always type parameters and returns
- Pure functions (no side effects)
- Add JSDoc comments

---

## 🎯 Decision Tree: Where to Put Code?

### Creating a Component?

1. **Is it a full page?** → `/pages`
2. **Is it a layout wrapper?** → `/layouts`
3. **Is it reusable UI?** → `/components/common`
4. **Is it feature-specific?** → `/components/features`

### Creating Logic?

1. **Is it reusable React logic?** → `/hooks`
2. **Is it an API call?** → `/services/api`
3. **Is it a pure function?** → `/utils`
4. **Is it global state?** → `/store`

### Creating Types?

1. **Always** → `/types`

### Creating Constants?

1. **Environment-based?** → `/config/index.ts`
2. **Application constants?** → `/config/constants.ts`

---

## 📋 Quick Reference

| Folder | Contains | Example |
|--------|----------|---------|
| `assets/` | Images, fonts, icons | `logo.svg` |
| `components/common/` | Reusable UI | `Button.tsx` |
| `components/features/` | Feature components | `LoginForm.tsx` |
| `config/` | Configuration | `constants.ts` |
| `hooks/` | Custom hooks | `useAuth.ts` |
| `layouts/` | Page layouts | `MainLayout.tsx` |
| `pages/` | Route pages | `HomePage.tsx` |
| `routes/` | Routing config | `index.tsx` |
| `services/` | API calls | `user.service.ts` |
| `store/` | Global state | `AuthContext.tsx` |
| `styles/` | Global styles | `index.css` |
| `types/` | TypeScript types | `user.types.ts` |
| `utils/` | Helper functions | `format.ts` |

---

## ✅ Best Practices

1. **Barrel Exports**: Always include `index.ts` for clean imports
2. **Colocate**: Keep related files together (component + styles + tests)
3. **One Responsibility**: Each file should have a single, clear purpose
4. **Consistent Naming**: Follow project conventions
5. **Type Everything**: No implicit `any` types
6. **Document**: Add comments for complex logic
7. **Test**: Colocate tests with components
