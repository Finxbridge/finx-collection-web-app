# Project Variations Guide

This document shows how to adapt the project structure for different technology choices.

## Table of Contents

1. [TypeScript vs JavaScript](#typescript-vs-javascript)
2. [Redux vs Context API vs Zustand](#redux-vs-context-api-vs-zustand)
3. [CSS Solutions](#css-solutions)
4. [API Client Variations](#api-client-variations)

---

## TypeScript vs JavaScript

### Current Setup (TypeScript - Recommended)

**Structure:**
```
src/
├── types/
│   ├── user.types.ts
│   ├── api.types.ts
│   └── common.types.ts
├── components/
│   └── Button/
│       └── Button.tsx
```

**Example Component:**
```typescript
// Button.tsx
interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

### JavaScript Alternative

**Structure:**
```
src/
├── components/
│   └── Button/
│       └── Button.jsx
```

**Example Component:**
```javascript
// Button.jsx
import PropTypes from 'prop-types'

export function Button({ children, onClick, variant = 'primary' }) {
  return <button onClick={onClick}>{children}</button>
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary']),
}
```

**Changes needed for JavaScript:**

1. **Remove TypeScript files:**
   - Delete `tsconfig.json`, `tsconfig.node.json`
   - Delete `/src/types/` folder

2. **Update file extensions:**
   - `.tsx` → `.jsx`
   - `.ts` → `.js`

3. **Update package.json:**
   ```json
   {
     "dependencies": {
       "prop-types": "^15.8.1"
     },
     "devDependencies": {
       "@vitejs/plugin-react": "^4.3.1"
     }
   }
   ```

4. **Update vite.config:**
   ```javascript
   // vite.config.js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
   })
   ```

**Pros of JavaScript:**
- Faster initial setup
- Less learning curve
- No type annotations needed

**Cons of JavaScript:**
- No compile-time type checking
- Harder to refactor
- More runtime errors
- Worse IDE support

**Recommendation:** Use TypeScript for projects with:
- Multiple developers
- Long-term maintenance
- Complex data structures
- Need for reliability

---

## Redux vs Context API vs Zustand

### Option 1: Context API (Current - Best for Simple State)

**Structure:**
```
src/
├── store/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── index.ts
```

**Example:**
```typescript
// AuthContext.tsx
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const authUser = await authService.login({ email, password })
    setUser(authUser.user)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Usage
const { user, login } = useAuth()
```

**Pros:**
- Built into React
- No dependencies
- Simple for global state

**Cons:**
- Can cause unnecessary re-renders
- Verbose for complex state
- No devtools

---

### Option 2: Zustand (Included - Best for Complex State)

**Structure:**
```
src/
├── store/
│   ├── authStore.ts
│   ├── userStore.ts
│   └── index.ts
```

**Example:**
```typescript
// authStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        login: async (email, password) => {
          const authUser = await authService.login({ email, password })
          set({ user: authUser.user })
        },
        logout: () => set({ user: null }),
      }),
      { name: 'auth-storage' }
    )
  )
)

// Usage
const { user, login, logout } = useAuthStore()
```

**Migration from Context to Zustand:**

1. **Install Zustand** (already included):
   ```bash
   npm install zustand
   ```

2. **Convert Context to Store:**
   ```typescript
   // Before (Context)
   const { user } = useAuth()

   // After (Zustand)
   const user = useAuthStore(state => state.user)
   ```

3. **Remove Context Providers from App:**
   ```typescript
   // Before
   <AuthProvider>
     <App />
   </AuthProvider>

   // After
   <App /> // No provider needed!
   ```

**Pros:**
- Minimal boilerplate
- Better performance
- Built-in devtools
- Middleware support (persist, devtools)
- No provider needed

**Cons:**
- External dependency
- Less familiar to React devs

---

### Option 3: Redux Toolkit (Alternative)

**Structure:**
```
src/
├── store/
│   ├── store.ts
│   └── slices/
│       ├── authSlice.ts
│       └── userSlice.ts
```

**Setup:**

1. **Install dependencies:**
   ```bash
   npm install @reduxjs/toolkit react-redux
   ```

2. **Create store:**
   ```typescript
   // store/store.ts
   import { configureStore } from '@reduxjs/toolkit'
   import authReducer from './slices/authSlice'

   export const store = configureStore({
     reducer: {
       auth: authReducer,
     },
   })

   export type RootState = ReturnType<typeof store.getState>
   export type AppDispatch = typeof store.dispatch
   ```

3. **Create slice:**
   ```typescript
   // store/slices/authSlice.ts
   import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

   export const loginUser = createAsyncThunk(
     'auth/login',
     async ({ email, password }: LoginCredentials) => {
       return await authService.login({ email, password })
     }
   )

   const authSlice = createSlice({
     name: 'auth',
     initialState: {
       user: null,
       loading: false,
       error: null,
     },
     reducers: {
       logout: (state) => {
         state.user = null
       },
     },
     extraReducers: (builder) => {
       builder
         .addCase(loginUser.pending, (state) => {
           state.loading = true
         })
         .addCase(loginUser.fulfilled, (state, action) => {
           state.user = action.payload.user
           state.loading = false
         })
         .addCase(loginUser.rejected, (state, action) => {
           state.error = action.error.message
           state.loading = false
         })
     },
   })

   export const { logout } = authSlice.actions
   export default authSlice.reducer
   ```

4. **Setup hooks:**
   ```typescript
   // store/hooks.ts
   import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
   import type { RootState, AppDispatch } from './store'

   export const useAppDispatch = () => useDispatch<AppDispatch>()
   export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
   ```

5. **Wrap App:**
   ```typescript
   // App.tsx
   import { Provider } from 'react-redux'
   import { store } from './store/store'

   function App() {
     return (
       <Provider store={store}>
         {/* Your app */}
       </Provider>
     )
   }
   ```

6. **Usage:**
   ```typescript
   import { useAppDispatch, useAppSelector } from '@store/hooks'
   import { loginUser, logout } from '@store/slices/authSlice'

   function LoginForm() {
     const dispatch = useAppDispatch()
     const { user, loading } = useAppSelector(state => state.auth)

     const handleLogin = () => {
       dispatch(loginUser({ email, password }))
     }
   }
   ```

**Pros:**
- Industry standard
- Great devtools
- Powerful middleware
- Time-travel debugging
- Predictable state updates

**Cons:**
- More boilerplate
- Steeper learning curve
- Overkill for simple apps

---

### When to Use Each?

| Solution | Use When |
|----------|----------|
| **Context API** | - Simple global state (auth, theme)<br>- Small apps<br>- Infrequent updates<br>- No performance issues |
| **Zustand** | - Medium complexity<br>- Need good performance<br>- Want minimal boilerplate<br>- Multiple independent stores |
| **Redux Toolkit** | - Large enterprise apps<br>- Complex state logic<br>- Many developers<br>- Need time-travel debugging |

---

## CSS Solutions

### Option 1: CSS Modules (Current)

**Structure:**
```
Button/
├── Button.tsx
├── Button.css
└── index.ts
```

**Usage:**
```typescript
import './Button.css'

export function Button() {
  return <button className="button button--primary">Click</button>
}
```

**Pros:**
- Scoped styles
- No runtime overhead
- Familiar CSS syntax

**Cons:**
- Manual class management
- No dynamic styles

---

### Option 2: Tailwind CSS

**Setup:**

1. **Install:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Configure:**
   ```javascript
   // tailwind.config.js
   export default {
     content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

3. **Add to CSS:**
   ```css
   /* src/styles/index.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

**Usage:**
```typescript
export function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Click
    </button>
  )
}
```

**Pros:**
- Utility-first
- Fast development
- Consistent design
- Small bundle (purged)

**Cons:**
- HTML can get cluttered
- Learning curve
- Less semantic

---

### Option 3: Styled Components

**Setup:**

1. **Install:**
   ```bash
   npm install styled-components
   npm install -D @types/styled-components
   ```

**Usage:**
```typescript
import styled from 'styled-components'

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  background-color: ${props => props.variant === 'primary' ? '#3b82f6' : '#6b7280'};
  color: white;
  border-radius: 0.375rem;

  &:hover {
    opacity: 0.9;
  }
`

export function Button({ variant = 'primary' }) {
  return <StyledButton variant={variant}>Click</StyledButton>
}
```

**Pros:**
- CSS-in-JS
- Dynamic styles
- Scoped automatically
- TypeScript support

**Cons:**
- Runtime overhead
- Larger bundle
- Different syntax

---

## API Client Variations

### Option 1: Axios (Current)

**Setup:**
```typescript
// services/api/axios.config.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
})

apiClient.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Pros:**
- Feature-rich
- Interceptors
- Request/response transformation
- Automatic JSON parsing

---

### Option 2: Fetch API

**Setup:**
```typescript
// services/api/fetchClient.ts
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken()

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient(config.api.baseUrl)
```

**Pros:**
- Native browser API
- No dependencies
- Modern and standard

**Cons:**
- More manual setup
- No interceptors (need custom implementation)
- More verbose

---

### Option 3: SWR (Alternative to React Query)

**Setup:**

1. **Install:**
   ```bash
   npm install swr
   ```

2. **Usage:**
   ```typescript
   import useSWR from 'swr'

   const fetcher = (url: string) =>
     fetch(url).then(res => res.json())

   function UserProfile() {
     const { data, error, isLoading } = useSWR('/api/user', fetcher)

     if (isLoading) return <div>Loading...</div>
     if (error) return <div>Error</div>

     return <div>{data.name}</div>
   }
   ```

**Pros:**
- Lightweight
- Simple API
- Automatic revalidation
- Built by Vercel

**Cons:**
- Less features than React Query
- Smaller ecosystem

---

## Recommendation Summary

### For Most Projects (Recommended):
- ✅ **TypeScript** (type safety)
- ✅ **Vite** (fast builds)
- ✅ **Context API** for simple state (auth, theme)
- ✅ **Zustand** for complex state
- ✅ **React Query** for server state
- ✅ **CSS Modules** or **Tailwind** for styling
- ✅ **Axios** for HTTP client

### For Large Enterprise Apps:
- ✅ **TypeScript** (mandatory)
- ✅ **Redux Toolkit** (complex state)
- ✅ **React Query** (server state)
- ✅ **Tailwind CSS** or **Styled Components**
- ✅ **Monorepo** structure (Nx, Turborepo)

### For Small/Simple Apps:
- ⚡ **JavaScript** (optional)
- ⚡ **Context API** only
- ⚡ **Fetch API** (no Axios)
- ⚡ **Plain CSS** or **CSS Modules**

---

## Migration Guides

### Context → Zustand

1. Install Zustand
2. Convert Context to store
3. Replace `useContext` with store hook
4. Remove Provider from App

### CSS Modules → Tailwind

1. Install Tailwind
2. Replace class names
3. Remove CSS files
4. Configure purge

### Axios → Fetch

1. Create fetch wrapper
2. Replace axios calls
3. Update error handling
4. Remove axios dependency

For detailed migration steps, see individual sections above.
