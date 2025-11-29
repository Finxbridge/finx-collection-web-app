# Architecture Documentation

## System Overview

This document describes the architectural decisions, patterns, and principles used in the FinxCollection frontend application.

## Technology Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Routing
- **React Router v6** - Client-side routing

### State Management
- **Context API** - Global state (auth, theme)
- **Zustand** - Optional for complex state
- **React Query** - Server state management

### API Communication
- **Axios** - HTTP client
- **React Query** - Data fetching and caching

### Forms
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Styling
- **CSS Modules** - Component styles
- **CSS Custom Properties** - Theming

### Testing
- **Vitest** - Test runner
- **Testing Library** - Component testing

---

## Architectural Patterns

### 1. Feature-Based Organization

The codebase is organized by feature/domain rather than by file type.

```
components/
  features/
    UserManagement/
      UserList.tsx
      UserForm.tsx
      useUsers.ts
```

**Benefits:**
- Easy to locate related code
- Clear feature boundaries
- Scales well with team size

### 2. Separation of Concerns

**Three layers:**

1. **Presentation Layer** (Components)
   - UI rendering
   - User interactions
   - No business logic

2. **Business Logic Layer** (Hooks, Services)
   - Data fetching
   - State management
   - Validation

3. **Data Layer** (API Services, Types)
   - API communication
   - Data transformation
   - Type definitions

### 3. Container/Presentational Pattern

**Presentational Components:**
- Receive data via props
- No API calls or business logic
- Highly reusable
- Easy to test

**Container Components:**
- Manage state and logic
- Fetch data
- Pass data to presentational components

### 4. Custom Hooks Pattern

Extract reusable logic into custom hooks:

```typescript
// Logic extraction
function useUserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    const data = await api.users.getAll()
    setUsers(data)
    setLoading(false)
  }

  return { users, loading, fetchUsers }
}
```

---

## Data Flow

### Authentication Flow

```
1. User submits login form
   ↓
2. LoginForm component calls useAuth hook
   ↓
3. useAuth calls authService.login()
   ↓
4. authService makes API request
   ↓
5. On success, token is stored in localStorage
   ↓
6. AuthContext updates with user data
   ↓
7. All components re-render with authenticated state
   ↓
8. User is redirected to dashboard
```

### Data Fetching Flow (React Query)

```
1. Component calls useQuery hook
   ↓
2. React Query checks cache
   ↓
   ├─ Cache hit → Return cached data
   │  └─ Fetch in background if stale
   │
   └─ Cache miss → Fetch from API
      ↓
      Service layer makes HTTP request
      ↓
      Response is cached
      ↓
      Component receives data and re-renders
```

---

## State Management Strategy

### Component State (useState)

**Use for:**
- Local UI state (modal open/closed, form inputs)
- State not shared with other components
- Simple, independent state

**Example:**
```typescript
const [isOpen, setIsOpen] = useState(false)
```

### Context API

**Use for:**
- Global state (authentication, theme)
- State shared by many components
- Infrequent updates

**Example:**
```typescript
const { user, isAuthenticated } = useAuth()
```

### Zustand (Optional)

**Use for:**
- Complex global state
- Frequent updates
- Need for devtools
- Multiple independent stores

**Example:**
```typescript
const { items, addItem, removeItem } = useCartStore()
```

### React Query

**Use for:**
- Server state (data from APIs)
- Automatic caching
- Background refetching
- Optimistic updates

**Example:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: userService.getAll,
})
```

---

## API Integration Architecture

### Axios Configuration

**Base instance with interceptors:**

```typescript
// Request interceptor - Add auth token
apiClient.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Handle 401 - refresh token
    // Handle other errors
    return Promise.reject(transformedError)
  }
)
```

### Service Layer

**Encapsulates API calls:**

```typescript
export const userService = {
  getAll: () => apiClient.get('/users'),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post('/users', data),
  update: (id, data) => apiClient.patch(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
}
```

**Benefits:**
- Centralized API logic
- Easy to mock for testing
- Type-safe with TypeScript
- Consistent error handling

---

## Routing Architecture

### Route Organization

```typescript
<Routes>
  {/* Public routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />

  {/* Protected routes with layout */}
  <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### Protected Routes

```typescript
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" />

  return children
}
```

### Route Guards

Future enhancements:
- Role-based access control
- Permission checking
- Analytics tracking

---

## Component Architecture

### Component Hierarchy

```
App
├── BrowserRouter
│   ├── ThemeProvider
│   │   └── AuthProvider
│   │       └── QueryClientProvider
│   │           └── Routes
│   │               ├── Public Routes
│   │               │   ├── HomePage
│   │               │   └── LoginPage
│   │               │
│   │               └── Protected Routes
│   │                   └── MainLayout
│   │                       ├── Header
│   │                       ├── Sidebar
│   │                       └── Content
│   │                           ├── DashboardPage
│   │                           └── Other Pages
```

### Component Props Pattern

```typescript
// ✅ Always define props interface
interface ComponentProps {
  // Required props first
  id: string
  title: string

  // Optional props
  description?: string
  onAction?: () => void

  // Props with defaults
  variant?: 'primary' | 'secondary'

  // Children
  children?: ReactNode
}

// ✅ Destructure with defaults
export function Component({
  id,
  title,
  description,
  onAction,
  variant = 'primary',
  children,
}: ComponentProps) {
  // Component logic
}
```

---

## Error Handling Strategy

### Layers of Error Handling

**1. API Layer (Axios Interceptor)**
```typescript
// Transform API errors to consistent format
apiClient.interceptors.response.use(
  response => response,
  error => {
    const apiError: ApiError = {
      message: error.response?.data?.message || 'An error occurred',
      statusCode: error.response?.status || 500,
    }
    return Promise.reject(apiError)
  }
)
```

**2. Service Layer**
```typescript
// Services can add context-specific error handling
export const userService = {
  async getById(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`/users/${id}`)
      return response.data.data
    } catch (error) {
      // Add context
      throw new Error(`Failed to fetch user ${id}`)
    }
  },
}
```

**3. Component Layer**
```typescript
// Handle UI-specific errors
function UserProfile() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return <UserCard user={data} />
}
```

**4. Error Boundary**
```typescript
// Catch unhandled errors
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Performance Optimization

### Code Splitting

**Route-based splitting:**
```typescript
const DashboardPage = lazy(() => import('@pages/DashboardPage'))

<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
</Suspense>
```

### Memoization

**React.memo for components:**
```typescript
export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <div>{/* Expensive render */}</div>
})
```

**useMemo for calculations:**
```typescript
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name))
}, [users])
```

**useCallback for handlers:**
```typescript
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### React Query Optimization

**Stale time and cache configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## Security Considerations

### Authentication

1. **Token Storage**: Access token in memory, refresh token in httpOnly cookie
2. **Token Refresh**: Automatic refresh on 401 responses
3. **Logout**: Clear all tokens and redirect

### XSS Prevention

1. React automatically escapes JSX content
2. Never use `dangerouslySetInnerHTML` without sanitization
3. Validate user input

### CSRF Protection

1. Use tokens for state-changing operations
2. Implement SameSite cookies
3. Verify origin headers

### API Security

1. Always use HTTPS in production
2. Implement rate limiting
3. Validate input on both client and server
4. Never expose sensitive data in URLs

---

## Testing Strategy

### Unit Tests

**Test utilities and hooks:**
```typescript
describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-01')
    expect(formatDate(date)).toBe('January 1, 2024')
  })
})
```

### Component Tests

**Test user interactions:**
```typescript
describe('Button', () => {
  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)

    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Integration Tests

**Test feature flows:**
```typescript
describe('Login flow', () => {
  it('logs in user successfully', async () => {
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})
```

---

## Build and Deployment

### Development Build

```bash
npm run dev
```

- Fast HMR (Hot Module Replacement)
- Source maps for debugging
- Development-only warnings

### Production Build

```bash
npm run build
```

- Code minification
- Tree shaking
- Asset optimization
- No source maps (optional)

### Environment Configuration

```
.env.development
.env.production
.env.test
```

---

## Scalability Considerations

### As the Application Grows

**1. Feature Modules**
```
features/
  user-management/
    components/
    hooks/
    services/
    types/
  order-management/
    components/
    hooks/
    services/
    types/
```

**2. Shared Libraries**
```
libs/
  ui/           # Shared UI components
  utils/        # Shared utilities
  hooks/        # Shared hooks
```

**3. Micro-frontends** (future consideration)
- Split application into smaller apps
- Independent deployment
- Technology agnostic

---

## Monitoring and Debugging

### Development Tools

- React DevTools
- Redux DevTools (if using Redux)
- React Query DevTools
- Network tab for API calls

### Production Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring (Web Vitals)
- User session recording (LogRocket)

---

## Future Improvements

1. **Internationalization (i18n)** - Multi-language support
2. **Progressive Web App (PWA)** - Offline capability
3. **Server-Side Rendering (SSR)** - Better SEO and performance
4. **Micro-frontends** - Split into independent apps
5. **Advanced Caching** - Service workers
6. **Real-time Updates** - WebSockets
7. **E2E Testing** - Playwright/Cypress
8. **Storybook** - Component documentation

---

## Conclusion

This architecture provides a solid foundation for building scalable, maintainable React applications. It follows industry best practices while remaining flexible enough to adapt to changing requirements.

Key principles:
- **Separation of concerns**
- **Type safety**
- **Reusability**
- **Testability**
- **Performance**
- **Developer experience**
