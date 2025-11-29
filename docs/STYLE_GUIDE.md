# Code Style Guide & Best Practices

This document outlines coding standards, naming conventions, and best practices for the FinxCollection frontend project.

## 📋 Table of Contents

1. [File Naming](#file-naming)
2. [Code Formatting](#code-formatting)
3. [TypeScript Guidelines](#typescript-guidelines)
4. [React Best Practices](#react-best-practices)
5. [Component Patterns](#component-patterns)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Error Handling](#error-handling)
9. [Performance](#performance)
10. [Accessibility](#accessibility)

---

## 📁 File Naming

### Components
- **PascalCase** for component files: `UserProfile.tsx`, `LoginForm.tsx`
- Match folder name: `Button/Button.tsx` (not `Button/index.tsx`)

### Utilities and Services
- **camelCase** for utility files: `formatDate.ts`, `validation.ts`
- **camelCase** for service files: `user.service.ts`, `auth.service.ts`

### Types
- **kebab-case** with `.types.ts` suffix: `user.types.ts`, `api.types.ts`

### Styles
- Match component name: `Button.css` for `Button.tsx`
- Global styles: `index.css`, `variables.css`

### Tests
- Match component/file name with `.test.tsx` or `.test.ts` suffix
- Example: `Button.test.tsx`, `formatDate.test.ts`

### Examples

✅ **Good:**
```
components/
  common/
    Button/
      Button.tsx
      Button.css
      Button.test.tsx
      index.ts
```

❌ **Bad:**
```
components/
  common/
    Button/
      index.tsx          # Should be Button.tsx
      button.css         # Should be Button.css
      button.test.tsx    # Should be Button.test.tsx
```

---

## 🎨 Code Formatting

We use **Prettier** for automatic code formatting.

### Key Rules

```typescript
// ✅ Use single quotes
const message = 'Hello'

// ✅ No semicolons
const count = 5

// ✅ Trailing commas
const user = {
  name: 'John',
  age: 30,
}

// ✅ Arrow function parentheses (avoid when single param)
const double = (x: number) => x * 2
const square = x => x * x  // Single param, no type

// ✅ Line length: 100 characters
const longString =
  'This is a very long string that should be broken into multiple lines'
```

### Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Before Committing

```bash
npm run format  # Format all files
npm run lint    # Check for linting errors
```

---

## 🔷 TypeScript Guidelines

### Always Use Types

❌ **Bad:**
```typescript
function getUser(id) {
  return fetch(`/api/users/${id}`)
}
```

✅ **Good:**
```typescript
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
```

### Avoid `any`

❌ **Bad:**
```typescript
const data: any = response.data
```

✅ **Good:**
```typescript
const data: User = response.data
// or if truly unknown:
const data: unknown = response.data
```

### Use Interfaces for Objects

```typescript
// ✅ Use interface for object shapes
interface User {
  id: string
  name: string
  email: string
}

// ✅ Use type for unions, primitives, utilities
type Status = 'idle' | 'loading' | 'success' | 'error'
type Nullable<T> = T | null
```

### Generic Types

```typescript
// ✅ Use generics for reusable types
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Usage
const userResponse: ApiResponse<User> = await api.getUser(id)
const usersResponse: ApiResponse<User[]> = await api.getUsers()
```

### Type Guards

```typescript
// ✅ Create type guards for runtime checks
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  )
}

// Usage
if (isUser(data)) {
  console.log(data.email) // TypeScript knows it's a User
}
```

### Optional Chaining and Nullish Coalescing

```typescript
// ✅ Use optional chaining
const userName = user?.profile?.name

// ✅ Use nullish coalescing
const displayName = user?.name ?? 'Guest'

// ❌ Avoid unnecessary checks
if (user && user.profile && user.profile.name) {
  // ...
}
```

---

## ⚛️ React Best Practices

### Component Declaration

✅ **Prefer function components with named exports:**
```typescript
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

❌ **Avoid:**
```typescript
// Default export only
export default function Button() { }

// Arrow function component
export const Button = () => { }
```

### Props Interface

```typescript
// ✅ Always define props interface
interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false
}: ButtonProps) {
  // ...
}
```

### Destructure Props

✅ **Good:**
```typescript
function UserCard({ name, email, avatar }: UserCardProps) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  )
}
```

❌ **Bad:**
```typescript
function UserCard(props: UserCardProps) {
  return (
    <div>
      <img src={props.avatar} alt={props.name} />
      <h3>{props.name}</h3>
      <p>{props.email}</p>
    </div>
  )
}
```

### Hook Order

```typescript
export function MyComponent() {
  // 1. Context hooks
  const { user } = useAuth()
  const navigate = useNavigate()

  // 2. State hooks
  const [count, setCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // 3. Effect hooks
  useEffect(() => {
    // ...
  }, [])

  // 4. Custom hooks
  const debouncedValue = useDebounce(count, 500)

  // 5. Event handlers
  const handleClick = () => {
    setCount(count + 1)
  }

  // 6. Computed values
  const isEven = count % 2 === 0

  // 7. Render
  return <div>...</div>
}
```

### Conditional Rendering

```typescript
// ✅ Short circuit for simple conditions
{isLoading && <LoadingSpinner />}

// ✅ Ternary for if/else
{isError ? <ErrorMessage /> : <SuccessMessage />}

// ✅ Early return for complex conditions
if (!user) {
  return <LoginPrompt />
}

return <UserDashboard user={user} />

// ❌ Avoid nested ternaries
{isLoading ? <Spinner /> : isError ? <Error /> : <Success />}
```

### Lists and Keys

```typescript
// ✅ Use stable, unique keys
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

// ❌ Don't use index as key (unless list is static)
{users.map((user, index) => (
  <UserCard key={index} user={user} />
))}
```

---

## 🎯 Component Patterns

### Container/Presentational Pattern

**Presentational Component** (Dumb/Pure):
```typescript
// components/common/UserCard/UserCard.tsx
interface UserCardProps {
  name: string
  email: string
  avatar: string
  onEdit: () => void
}

export function UserCard({ name, email, avatar, onEdit }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
      <Button onClick={onEdit}>Edit</Button>
    </div>
  )
}
```

**Container Component** (Smart):
```typescript
// components/features/UserProfile/UserProfile.tsx
export function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
  }

  if (!user) return <div>No user found</div>

  return (
    <UserCard
      name={user.name}
      email={user.email}
      avatar={user.avatar}
      onEdit={handleEdit}
    />
  )
}
```

### Compound Components

```typescript
// ✅ Create flexible, composable components
export function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>
}

Card.Header = function CardHeader({ children }: { children: ReactNode }) {
  return <div className="card-header">{children}</div>
}

Card.Body = function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>
}

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

### Custom Hooks Pattern

```typescript
// ✅ Extract logic into custom hooks
function useUserForm(initialData: User) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return { formData, errors, handleChange, validate }
}
```

---

## 🔄 State Management

### When to Use Each Solution

**Component State (`useState`):**
- Local to one component
- Simple data (strings, numbers, booleans)
- UI state (modals, toggles)

```typescript
const [isOpen, setIsOpen] = useState(false)
const [count, setCount] = useState(0)
```

**Context API:**
- Global state (auth, theme)
- Shared across many components
- Infrequent updates

```typescript
const { user, login, logout } = useAuth()
```

**Zustand:**
- Complex global state
- Frequent updates
- Need for performance
- Multiple stores

```typescript
const { users, addUser, removeUser } = useUserStore()
```

**React Query:**
- Server state
- Data fetching
- Caching needs

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.users.getAll(),
})
```

### State Update Patterns

```typescript
// ✅ Functional updates for state based on previous state
setCount(prev => prev + 1)

// ✅ Immutable updates for objects
setUser(prev => ({ ...prev, name: 'New Name' }))

// ✅ Immutable updates for arrays
setItems(prev => [...prev, newItem])
setItems(prev => prev.filter(item => item.id !== id))

// ❌ Direct mutation
user.name = 'New Name'
items.push(newItem)
```

---

## 🌐 API Integration

### Service Pattern

```typescript
// services/api/user.service.ts
export const userService = {
  async getAll(params?: PaginationParams): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params })
    return response.data.data
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
    return response.data.data
  },

  async create(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users', data)
    return response.data.data
  },

  async update(id: string, data: UpdateUserData): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  },
}
```

### React Query Integration

```typescript
// hooks/useUsers.ts
export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserData) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Usage in component
function UserList() {
  const { data: users, isLoading, error } = useUsers()
  const createUser = useCreateUser()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {users?.map(user => <UserCard key={user.id} user={user} />)}
      <Button onClick={() => createUser.mutate(newUserData)}>
        Add User
      </Button>
    </div>
  )
}
```

---

## ⚠️ Error Handling

### Component Error Boundaries

```typescript
// components/common/ErrorBoundary/ErrorBoundary.tsx
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }

    return this.props.children
  }
}
```

### API Error Handling

```typescript
// In component
try {
  await api.users.create(userData)
  showSuccessToast('User created successfully')
} catch (error) {
  if (error instanceof ApiError) {
    showErrorToast(error.message)
    setFormErrors(error.errors)
  } else {
    showErrorToast('An unexpected error occurred')
  }
}
```

### Form Validation

```typescript
// Use react-hook-form with zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type UserFormData = z.infer<typeof userSchema>

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  const onSubmit = (data: UserFormData) => {
    // Submit data
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('email')} error={errors.email?.message} />
      <Input {...register('password')} error={errors.password?.message} />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

---

## ⚡ Performance

### Memoization

```typescript
// ✅ useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ✅ useCallback for event handlers passed to child components
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// ✅ React.memo for components that receive same props
export const UserCard = memo(function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>
})
```

### Code Splitting

```typescript
// ✅ Lazy load routes
const DashboardPage = lazy(() => import('@pages/DashboardPage'))

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Suspense>
```

### Avoid Inline Functions in JSX

❌ **Bad:**
```typescript
<Button onClick={() => handleClick(id)}>Click</Button>
```

✅ **Good:**
```typescript
const handleButtonClick = () => handleClick(id)

<Button onClick={handleButtonClick}>Click</Button>
```

---

## ♿ Accessibility

### Semantic HTML

```typescript
// ✅ Use semantic elements
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

// ❌ Avoid
<div>
  <div>
    <div><div onClick={...}>Home</div></div>
  </div>
</div>
```

### ARIA Labels

```typescript
// ✅ Add labels for screen readers
<button aria-label="Close dialog" onClick={onClose}>
  <CloseIcon />
</button>

<input
  type="text"
  aria-label="Search users"
  placeholder="Search..."
/>
```

### Keyboard Navigation

```typescript
// ✅ Support keyboard interactions
function Modal({ onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return <div role="dialog" aria-modal="true">...</div>
}
```

---

## ✅ Code Review Checklist

Before submitting a PR, ensure:

- [ ] TypeScript types are defined for all props and functions
- [ ] No `any` types without justification
- [ ] Components are small and focused (< 200 lines)
- [ ] No duplicate code
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Accessibility considerations (ARIA, keyboard nav)
- [ ] Code is formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Meaningful commit messages
- [ ] No console.logs in production code

---

## 📚 Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Best Practices](https://react.dev/learn)
- [Accessibility Guide](https://www.a11yproject.com/)
