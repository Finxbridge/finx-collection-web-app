# Quick Start Guide

Get your React project up and running in minutes!

## 🚀 Installation

```bash
# Navigate to project directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Your app will be running at `http://localhost:3000`

---

## 📝 First Steps

### 1. Create a New Page

```bash
# Create folder
mkdir -p src/pages/MyPage

# Create files
touch src/pages/MyPage/MyPage.tsx
touch src/pages/MyPage/MyPage.css
touch src/pages/MyPage/index.ts
```

**MyPage.tsx:**
```typescript
import './MyPage.css'

export function MyPage() {
  return (
    <div className="my-page">
      <h1>My New Page</h1>
      <p>Content goes here</p>
    </div>
  )
}

export default MyPage
```

**index.ts:**
```typescript
export { MyPage } from './MyPage'
export default MyPage
```

### 2. Add a Route

**src/routes/index.tsx:**
```typescript
import { MyPage } from '@pages/MyPage'

// Add to your routes
<Route path="/my-page" element={<MyPage />} />
```

### 3. Create a Component

```bash
# Create in common/ for reusable UI
mkdir -p src/components/common/Card

# Create files
touch src/components/common/Card/Card.tsx
touch src/components/common/Card/Card.css
touch src/components/common/Card/index.ts
```

**Card.tsx:**
```typescript
import { ReactNode } from 'react'
import './Card.css'

interface CardProps {
  children: ReactNode
  title?: string
}

export function Card({ children, title }: CardProps) {
  return (
    <div className="card">
      {title && <h3 className="card__title">{title}</h3>}
      <div className="card__content">{children}</div>
    </div>
  )
}

export default Card
```

### 4. Create a Custom Hook

**src/hooks/useFetch.ts:**
```typescript
import { useState, useEffect } from 'react'

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [url])

  return { data, loading, error }
}
```

### 5. Add a Service

**src/services/api/product.service.ts:**
```typescript
import { apiClient } from './axios.config'
import type { Product } from '@types'

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get('/products')
    return response.data.data
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`)
    return response.data.data
  },

  async create(data: Partial<Product>): Promise<Product> {
    const response = await apiClient.post('/products', data)
    return response.data.data
  },
}
```

---

## 🎯 Common Tasks

### Making API Calls

**Using React Query (Recommended):**
```typescript
import { useQuery } from '@tanstack/react-query'
import { userService } from '@services/api'

function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data?.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}
```

### Form Handling

**Using React Hook Form:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Submit</button>
    </form>
  )
}
```

### Using Authentication

```typescript
import { useAuth } from '@hooks'

function UserProfile() {
  const { user, logout } = useAuth()

  return (
    <div>
      <p>Welcome, {user?.firstName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@routes/ProtectedRoute'

<Route
  element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>
```

---

## 🎨 Styling

### Using CSS Classes

```typescript
import './MyComponent.css'

export function MyComponent() {
  return (
    <div className="my-component">
      <h1 className="my-component__title">Title</h1>
      <p className="my-component__text">Text</p>
    </div>
  )
}
```

### Dynamic Classes

```typescript
import { cn } from '@utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ variant = 'primary', disabled }: ButtonProps) {
  return (
    <button
      className={cn(
        'button',
        `button--${variant}`,
        disabled && 'button--disabled'
      )}
    >
      Click
    </button>
  )
}
```

---

## 📦 Adding Dependencies

```bash
# Install package
npm install package-name

# Install dev dependency
npm install -D package-name

# Remove package
npm uninstall package-name
```

---

## 🔍 Debugging

### React DevTools
1. Install React DevTools browser extension
2. Open DevTools in browser
3. Look for "Components" and "Profiler" tabs

### Network Debugging
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR" to see API calls
4. Check request/response details

### Console Logging
```typescript
// Debug component renders
useEffect(() => {
  console.log('Component mounted')
  return () => console.log('Component unmounted')
}, [])

// Debug state changes
useEffect(() => {
  console.log('State changed:', state)
}, [state])
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Write a Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 🚢 Building for Production

```bash
# Build the app
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` folder.

---

## 🔧 Troubleshooting

### Port 3000 is already in use
```bash
# Use different port
npm run dev -- --port 3001
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Build fails
```bash
# Check for linting errors
npm run lint

# Check TypeScript errors
npx tsc --noEmit
```

---

## 📚 Learn More

### Essential Documentation
- [React Docs](https://react.dev) - React fundamentals
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [Vite Guide](https://vitejs.dev/guide/) - Vite documentation
- [React Router](https://reactrouter.com/) - Routing guide

### Project Documentation
- [README.md](./README.md) - Project overview
- [docs/FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md) - Folder explanations
- [docs/STYLE_GUIDE.md](./docs/STYLE_GUIDE.md) - Coding standards
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architecture details
- [docs/VARIATIONS.md](./docs/VARIATIONS.md) - Alternative approaches

---

## 🎓 Next Steps

1. ✅ Set up your development environment
2. ✅ Explore the existing code structure
3. ✅ Create your first component
4. ✅ Add a new page with routing
5. ✅ Connect to your backend API
6. ✅ Implement authentication
7. ✅ Add error handling
8. ✅ Write tests
9. ✅ Build for production

---

## 💡 Pro Tips

1. **Use path aliases** for cleaner imports:
   ```typescript
   // ❌ Bad
   import { Button } from '../../../components/common/Button'

   // ✅ Good
   import { Button } from '@components/common'
   ```

2. **Extract complex logic into custom hooks**:
   ```typescript
   // Instead of complex component logic
   function useUserManagement() {
     // Extract logic here
   }
   ```

3. **Keep components small** (< 200 lines)
4. **Use TypeScript types everywhere**
5. **Handle loading and error states**
6. **Add meaningful comments for complex logic**

---

## 🤝 Getting Help

- Check the [docs/](./docs) folder for detailed documentation
- Review existing code for patterns and examples
- Use TypeScript's autocomplete for available props/methods
- Check browser console for error messages

---

Happy coding! 🎉
