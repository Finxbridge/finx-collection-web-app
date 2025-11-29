# FinxCollection Frontend

Enterprise-level React application built with Vite, TypeScript, and modern best practices.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server (Vite HMR - recommended)
npm run dev

# Start development with nodemon (full restart on changes)
npm run dev:watch

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/              # Static assets (images, fonts, etc.)
│   ├── components/          # React components
│   │   ├── common/         # Reusable UI components (Button, Input, etc.)
│   │   └── features/       # Feature-specific components (LoginForm, etc.)
│   ├── config/             # Configuration files and constants
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Layout components (MainLayout, AuthLayout)
│   ├── pages/              # Page components (HomePage, DashboardPage)
│   ├── routes/             # Routing configuration
│   ├── services/           # API services and external integrations
│   │   └── api/           # API client and service modules
│   ├── store/              # State management (Context API/Zustand)
│   ├── styles/             # Global styles and theme
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions and helpers
│   ├── App.tsx             # Main App component
│   └── main.tsx            # Application entry point
├── public/                 # Public static files
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🏗️ Architecture Overview

### Component Organization

**Common Components** (`components/common/`)
- Reusable UI components used throughout the application
- Should be generic and not coupled to specific business logic
- Examples: Button, Input, Modal, Card

**Feature Components** (`components/features/`)
- Feature-specific components with business logic
- Can use common components internally
- Examples: LoginForm, UserProfile, PaymentForm

### State Management

This project uses **Context API** for global state management:
- `AuthContext` - User authentication state
- `ThemeContext` - Theme preferences (light/dark mode)

For more complex state, consider migrating to **Zustand** (already included in dependencies).

### API Integration

API calls are organized in the `services/api/` directory:
- `axios.config.ts` - Axios instance with interceptors
- `auth.service.ts` - Authentication endpoints
- `user.service.ts` - User management endpoints

Each service exports typed functions for API calls.

### Routing

Routes are configured in `src/routes/index.tsx`:
- Public routes (accessible to all users)
- Protected routes (require authentication)
- `ProtectedRoute` wrapper handles auth checks

### TypeScript Types

Type definitions are organized by domain in `src/types/`:
- `user.types.ts` - User-related types
- `api.types.ts` - API response/request types
- `common.types.ts` - Shared utility types

## 🎨 Styling Approach

This project uses **CSS Modules** with the following conventions:

1. Component-specific styles in `.css` files next to components
2. Global styles and variables in `src/styles/`
3. CSS custom properties (variables) for theming
4. BEM-like naming convention for classes

### Example:
```tsx
// Button.tsx
import './Button.css'

export function Button() {
  return <button className="button button--primary">Click</button>
}
```

```css
/* Button.css */
.button {
  /* base styles */
}

.button--primary {
  /* variant styles */
}
```

## 🔧 Configuration

### Path Aliases

The following path aliases are configured for cleaner imports:

```typescript
import { Button } from '@components/common'
import { useAuth } from '@hooks'
import { api } from '@services/api'
import { User } from '@types'
import config from '@config'
```

### Environment Variables

Create a `.env` file from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=FinxCollection
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## 🔄 Development Modes

### Vite HMR (Default - Recommended)
```bash
npm run dev
```
- Instant hot module replacement
- Preserves component state
- Fastest development experience

### Nodemon Watch Mode
```bash
npm run dev:watch
```
- Full server restart on file changes
- Useful for debugging build issues
- See [docs/NODEMON_GUIDE.md](docs/NODEMON_GUIDE.md) for details

## 🧪 Testing

Tests are colocated with components using the `.test.tsx` extension:

```
Button/
  ├── Button.tsx
  ├── Button.test.tsx
  ├── Button.css
  └── index.ts
```

**Run tests:**
```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:ui       # UI mode
```

## 📝 Naming Conventions

### Files and Folders
- **Components**: PascalCase (`Button.tsx`, `LoginForm.tsx`)
- **Utilities**: camelCase (`format.ts`, `validation.ts`)
- **Types**: kebab-case with suffix (`user.types.ts`, `api.types.ts`)
- **Folders**: camelCase (`components/`, `utils/`)

### Code
- **Components**: PascalCase (`function Button()`)
- **Hooks**: camelCase with `use` prefix (`useAuth`, `useDebounce`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`, `ROUTES`)
- **Functions**: camelCase (`formatDate`, `isValidEmail`)

## 🚦 Best Practices

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@components/common'
import './MyComponent.css'

// 2. Types
interface MyComponentProps {
  title: string
}

// 3. Component
export function MyComponent({ title }: MyComponentProps) {
  // 4. Hooks
  const [count, setCount] = useState(0)

  // 5. Event handlers
  const handleClick = () => {
    setCount(count + 1)
  }

  // 6. Render
  return (
    <div className="my-component">
      <h1>{title}</h1>
      <Button onClick={handleClick}>Count: {count}</Button>
    </div>
  )
}

// 7. Export
export default MyComponent
```

### When to Create Reusable vs Page-Specific Components

**Create in `components/common/` when:**
- Component is used in 2+ places
- Component is generic UI (buttons, inputs, modals)
- Component has no business logic

**Create in `components/features/` when:**
- Component is feature-specific
- Component contains business logic
- Component is used only in one feature area

**Create in `pages/` when:**
- Component represents an entire page/route
- Component is a top-level view

### API Service Pattern

```typescript
// services/api/user.service.ts
export const userService = {
  async getUsers(params: PaginationParams): Promise<User[]> {
    const response = await apiClient.get('/users', { params })
    return response.data.data
  },

  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiClient.post('/users', data)
    return response.data.data
  },
}
```

## 🔄 State Management Options

### Context API (Current)
- Good for: Simple global state (auth, theme)
- Pros: Built-in, no extra dependencies
- Cons: Can cause unnecessary re-renders

### Zustand (Recommended for Complex State)
```typescript
// store/userStore.ts
import { create } from 'zustand'

interface UserStore {
  users: User[]
  setUsers: (users: User[]) => void
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}))
```

### React Query (Already Included)
- For server state management
- Handles caching, refetching, and synchronization

## 📦 Adding New Features

### 1. Create Types
```typescript
// types/product.types.ts
export interface Product {
  id: string
  name: string
  price: number
}
```

### 2. Create API Service
```typescript
// services/api/product.service.ts
export const productService = {
  async getProducts(): Promise<Product[]> {
    // ...
  },
}
```

### 3. Create Components
```typescript
// components/features/ProductList/ProductList.tsx
export function ProductList() {
  // ...
}
```

### 4. Create Page
```typescript
// pages/ProductsPage/ProductsPage.tsx
export function ProductsPage() {
  return (
    <MainLayout>
      <ProductList />
    </MainLayout>
  )
}
```

### 5. Add Route
```typescript
// routes/index.tsx
<Route path="/products" element={<ProductsPage />} />
```

## 🤝 Team Collaboration

### Before Committing
```bash
npm run lint    # Check for linting errors
npm run format  # Format code
npm test        # Run tests
```

### Code Review Checklist
- [ ] Types are defined for all props and functions
- [ ] No `any` types unless absolutely necessary
- [ ] Components are small and focused
- [ ] No duplicate code - create utilities/hooks
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Accessibility considerations (ARIA labels, keyboard navigation)

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/user-profile

# Make changes, commit frequently
git add .
git commit -m "feat: add user profile component"

# Push and create PR
git push origin feature/user-profile
```

## 🔐 Security Best Practices

1. **Never commit** `.env` files
2. **Always validate** user input
3. **Sanitize** data before rendering
4. **Use HTTPS** in production
5. **Implement CSRF** protection
6. **Keep dependencies** updated

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com/)
- [React Query](https://tanstack.com/query/latest)

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in vite.config.ts or:
npm run dev -- --port 3001
```

### Type errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run dev
```

### Build fails
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## 📄 License

MIT License - see LICENSE file for details
