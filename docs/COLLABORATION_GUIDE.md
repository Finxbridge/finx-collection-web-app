# Team Collaboration Guide

Guidelines for multiple developers working on the FinxCollection frontend.

## 🤝 Team Workflow

### Git Branch Strategy

**Main Branches:**
- `main` - Production-ready code
- `develop` - Integration branch for features

**Feature Branches:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/what-changed` - Code refactoring
- `docs/what-documented` - Documentation updates

### Workflow Steps

```bash
# 1. Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/user-profile

# 2. Make changes and commit regularly
git add .
git commit -m "feat: add user profile component"

# 3. Keep branch updated
git fetch origin
git rebase origin/develop

# 4. Push and create PR
git push origin feature/user-profile
# Create Pull Request on GitHub/GitLab
```

---

## 📝 Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring (no functionality change)
- `style:` - Formatting, missing semicolons, etc.
- `docs:` - Documentation only
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, etc.
- `perf:` - Performance improvement

### Examples
```bash
feat: add user authentication
feat(auth): implement login flow
fix: resolve navigation bug on mobile
fix(button): correct disabled state styling
refactor: simplify API service structure
docs: update README with setup instructions
test: add tests for LoginForm component
chore: update dependencies
```

---

## 🔍 Code Review Process

### Before Creating PR

**Checklist:**
- [ ] Code is formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] All TypeScript errors resolved
- [ ] No console.logs or debugger statements
- [ ] Meaningful commit messages
- [ ] Branch is up to date with develop

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation

## Changes Made
- List key changes
- Component additions/modifications
- API integrations

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Edge cases considered

## Screenshots (if applicable)
[Add screenshots]

## Related Issues
Closes #123
```

### Review Guidelines

**What to Look For:**
1. **Code Quality**
   - TypeScript types defined
   - No `any` types
   - Proper error handling
   - Loading states implemented

2. **Architecture**
   - Follows project structure
   - Separation of concerns
   - Reusable components
   - Proper folder placement

3. **Performance**
   - No unnecessary re-renders
   - Proper memoization
   - Code splitting if needed

4. **Accessibility**
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation

5. **Tests**
   - New code is tested
   - Tests are meaningful
   - Edge cases covered

**Review Comments:**
```
✅ Good:
"Great use of custom hooks here! Consider adding error handling."

❌ Avoid:
"This is wrong."

✅ Better:
"The component could be simplified by extracting this logic into a custom hook. Would make it more reusable."
```

---

## 📁 File Ownership

### Who Creates What

**Frontend Lead:**
- Project structure
- Core configuration
- Shared utilities
- Base components

**Feature Developers:**
- Feature components
- Page components
- Feature-specific hooks
- API services for their features

**All Developers:**
- Tests for their code
- Documentation updates
- Type definitions

---

## 🎨 Component Development Guidelines

### Creating a New Component

**1. Choose the Right Location:**
```
Is it reusable UI? → components/common/
Is it feature-specific? → components/features/
Is it a page? → pages/
Is it a layout? → layouts/
```

**2. Follow the Template:**
```typescript
// ComponentName.tsx
import { ReactNode } from 'react'
import './ComponentName.css'

/**
 * Brief description of what this component does
 *
 * @example
 * <ComponentName title="Hello">Content</ComponentName>
 */
interface ComponentNameProps {
  /** Description of prop */
  title: string
  /** Description of optional prop */
  children?: ReactNode
  /** Description with default */
  variant?: 'primary' | 'secondary'
}

export function ComponentName({
  title,
  children,
  variant = 'primary'
}: ComponentNameProps) {
  // Logic here

  return (
    <div className={`component-name component-name--${variant}`}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

export default ComponentName
```

**3. Create Barrel Export:**
```typescript
// index.ts
export { ComponentName } from './ComponentName'
export type { ComponentNameProps } from './ComponentName'
export default ComponentName
```

**4. Write Tests:**
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders with title', () => {
    render(<ComponentName title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

---

## 🔄 State Management Guidelines

### When to Use What

**Component State (useState):**
```typescript
// ✅ Use for local UI state
const [isOpen, setIsOpen] = useState(false)
const [inputValue, setInputValue] = useState('')
```

**Context:**
```typescript
// ✅ Use for global app state
const { user, theme } = useAuth()
```

**React Query:**
```typescript
// ✅ Use for server data
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: userService.getAll,
})
```

**Avoid:**
```typescript
// ❌ Don't lift state unnecessarily
// ❌ Don't use Context for frequently changing state
// ❌ Don't store server data in Context/local state
```

---

## 🧩 Working on Features Together

### Scenario: Two Developers, One Feature

**Developer A: Frontend**
1. Creates page component
2. Creates UI components
3. Defines data requirements

**Developer B: API Integration**
1. Creates TypeScript types
2. Implements API service
3. Creates React Query hooks

**Coordination:**
```typescript
// Step 1: Agree on types (Developer B)
// types/user.types.ts
export interface User {
  id: string
  name: string
  email: string
}

// Step 2: Create service (Developer B)
// services/api/user.service.ts
export const userService = {
  getAll: (): Promise<User[]> => { /* ... */ }
}

// Step 3: Use in component (Developer A)
// pages/UsersPage.tsx
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: userService.getAll,
})
```

### Avoiding Conflicts

**1. Communicate:**
- Use Slack/Teams for quick questions
- Daily standups to sync progress
- Update tickets/issues

**2. Work on Different Files:**
```
Developer A: pages/UsersPage/
Developer B: services/api/user.service.ts
```

**3. Pull Frequently:**
```bash
# Every morning
git pull origin develop

# Before pushing
git fetch origin
git rebase origin/develop
```

---

## 📋 Task Management

### Breaking Down Features

**Bad:**
```
- [ ] Implement user management
```

**Good:**
```
- [ ] Create User types (user.types.ts)
- [ ] Implement user API service
- [ ] Create UserList component
- [ ] Create UserCard component
- [ ] Create UserForm component
- [ ] Add users page with routing
- [ ] Add tests for all components
- [ ] Update documentation
```

### Estimation Guide

**Small (1-2 hours):**
- Add a simple component
- Fix a minor bug
- Update documentation

**Medium (3-5 hours):**
- Add a feature component
- Implement API integration
- Add page with routing

**Large (1-2 days):**
- New feature with multiple components
- Complex state management
- Major refactoring

**Extra Large (3+ days):**
- New module/section
- Architecture changes
- Multiple integrated features

---

## 🧪 Testing Strategy

### What to Test

**Unit Tests:**
- Utility functions
- Custom hooks
- Complex logic

**Component Tests:**
- Rendering with props
- User interactions
- Conditional rendering
- Error states

**Integration Tests:**
- Full user flows
- Form submissions
- Navigation

### Test Coverage Goals

- **Utilities:** 90%+
- **Hooks:** 80%+
- **Components:** 70%+
- **Overall:** 70%+

### Writing Good Tests

```typescript
// ✅ Good: Descriptive test names
it('displays error message when API call fails', () => {})

// ❌ Bad: Vague test names
it('works correctly', () => {})

// ✅ Good: Test user behavior
it('submits form when user clicks submit button', () => {
  render(<LoginForm />)
  fireEvent.click(screen.getByText('Submit'))
  // assertions
})

// ❌ Bad: Test implementation details
it('calls handleSubmit function', () => {})
```

---

## 🎯 Performance Guidelines

### Component Optimization

**When to Use React.memo:**
```typescript
// ✅ Use when component receives same props often
export const UserCard = memo(function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>
})

// ❌ Don't use for every component
```

**When to Use useMemo:**
```typescript
// ✅ Use for expensive calculations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name))
}, [users])

// ❌ Don't use for simple operations
const doubled = useMemo(() => count * 2, [count]) // Overkill
```

**When to Use useCallback:**
```typescript
// ✅ Use for callbacks passed to memoized children
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

<MemoizedChild onClick={handleClick} />

// ❌ Don't use everywhere
const handleClick = useCallback(() => {
  console.log('clicked')
}, []) // Unnecessary
```

---

## 🔐 Security Practices

### Never Commit:
- `.env` files with real credentials
- API keys or secrets
- Access tokens
- Private keys

### Always:
- Validate user input
- Sanitize data before rendering
- Use HTTPS in production
- Implement CSRF protection
- Keep dependencies updated

### Code Security

```typescript
// ✅ Good: Validate input
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

if (!isValidEmail(email)) {
  throw new Error('Invalid email')
}

// ❌ Bad: Trust user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Good: Sanitize or use safe rendering
<div>{userInput}</div>
```

---

## 📞 Communication

### Daily Standup Template

**What I did yesterday:**
- Implemented UserProfile component
- Fixed navigation bug

**What I'm doing today:**
- Adding tests for UserProfile
- Implementing user edit functionality

**Blockers:**
- Waiting for API endpoint for user update

### Asking for Help

**Bad:**
> "My code doesn't work"

**Good:**
> "I'm getting a TypeScript error when trying to pass props to UserCard. The error says 'Type X is not assignable to Type Y'. I've tried [what you tried]. Here's the code: [code snippet]"

---

## 📊 Code Metrics

### Keep an Eye On:

**Bundle Size:**
```bash
npm run build
# Check dist/ folder size
```

**Build Time:**
```bash
time npm run build
```

**Test Coverage:**
```bash
npm test -- --coverage
```

---

## 🎓 Onboarding New Developers

### Day 1 Checklist:
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Run development server
- [ ] Review README.md
- [ ] Review project structure
- [ ] Set up IDE with recommended extensions

### Week 1 Tasks:
- [ ] Read all documentation
- [ ] Fix a "good first issue" bug
- [ ] Add a simple component
- [ ] Review 2-3 PRs
- [ ] Pair program with senior dev

### Resources to Share:
- Project documentation
- Architecture diagrams
- API documentation
- Design system/style guide

---

## 📚 Learning Resources

### Recommended Reading:
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

### Internal Resources:
- `docs/STYLE_GUIDE.md` - Coding standards
- `docs/ARCHITECTURE.md` - System design
- `docs/FOLDER_STRUCTURE.md` - Where things go

---

## 🎉 Best Practices Recap

1. ✅ **Communicate** early and often
2. ✅ **Test** your code
3. ✅ **Review** others' code constructively
4. ✅ **Document** complex logic
5. ✅ **Refactor** when you see duplication
6. ✅ **Ask** questions when unclear
7. ✅ **Help** your teammates
8. ✅ **Keep** learning

Remember: We're all on the same team! 🤝
