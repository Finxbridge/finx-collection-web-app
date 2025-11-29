# NPM Scripts Reference

Quick reference for all available npm scripts in this project.

## 🚀 Development

### Start Development Server
```bash
npm run dev
```
**What it does:** Starts Vite dev server with HMR
**Use when:** Normal daily development
**Port:** http://localhost:3000
**Features:**
- ⚡ Instant hot reload
- 💾 Preserves component state
- 🔥 Fast builds

### Start with Nodemon
```bash
npm run dev:watch
```
**What it does:** Starts Vite with nodemon watching for changes
**Use when:**
- Debugging build issues
- Need full server restart
- Working on configuration files
**Features:**
- 🔄 Full restart on changes
- 📝 Verbose output
- ⏱️ 500ms delay before restart

See [docs/NODEMON_GUIDE.md](docs/NODEMON_GUIDE.md) for more details.

---

## 🏗️ Build & Preview

### Build for Production
```bash
npm run build
```
**What it does:** Creates optimized production build
**Output:** `dist/` folder
**Steps:**
1. TypeScript compilation check
2. Vite production build
3. Minification & optimization
4. Asset optimization

### Preview Production Build
```bash
npm run preview
```
**What it does:** Serves production build locally
**Use when:** Testing production build before deployment
**Port:** http://localhost:4173

---

## 🧪 Testing

### Run Tests Once
```bash
npm test
```
**What it does:** Runs all tests once with Vitest
**Use when:** CI/CD, pre-commit checks

### Run Tests in Watch Mode
```bash
npm run test:watch
```
**What it does:** Runs tests automatically on file changes
**Use when:** Writing tests, TDD
**Features:**
- 🔄 Auto-reruns on changes
- 📊 Shows only changed tests
- ⚡ Interactive mode

### Run Tests with UI
```bash
npm run test:ui
```
**What it does:** Opens Vitest UI in browser
**Use when:** Debugging tests, exploring test results
**Features:**
- 🖥️ Visual test interface
- 📊 Coverage visualization
- 🔍 Interactive debugging

---

## 🧹 Code Quality

### Lint Code
```bash
npm run lint
```
**What it does:** Checks code for linting errors with ESLint
**Checks:**
- TypeScript errors
- React hooks rules
- Code style issues
- Unused variables

**Exit codes:**
- `0` - No errors
- `1` - Errors found

### Format Code
```bash
npm run format
```
**What it does:** Formats all code with Prettier
**Formats:**
- `.ts`, `.tsx` files
- `.json` files
- `.css`, `.scss` files
- `.md` files

**Target:** All files in `src/`

---

## 🎯 Workflow Examples

### Daily Development
```bash
# Morning routine
npm install          # Update dependencies if needed
npm run dev          # Start development

# During development
# ... make changes ...
# Vite auto-reloads

# Before commit
npm run lint         # Check for errors
npm run format       # Format code
npm test             # Run tests
```

### Debugging Build Issues
```bash
npm run dev:watch    # Start with nodemon
# Make changes to config files
# Watch for automatic restart
```

### Test-Driven Development
```bash
npm run test:watch   # Start test watch mode
# Write test -> see it fail
# Write code -> see it pass
# Refactor -> tests stay green
```

### Pre-Deployment
```bash
npm run lint         # Check code quality
npm test             # Run all tests
npm run build        # Create production build
npm run preview      # Test production build locally
```

---

## 🔧 Custom Script Combinations

### Run Lint + Format + Test
```bash
npm run lint && npm run format && npm test
```

### Full Check (pre-commit)
```bash
npm run format && npm run lint && npm test && npm run build
```

### Watch Everything
```bash
# Terminal 1
npm run dev:watch

# Terminal 2
npm run test:watch
```

---

## 🚀 Advanced Scripts (Optional)

You can add these to [package.json](package.json) if needed:

### Type Check Only
```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```
```bash
npm run type-check
```

### Clean Build
```json
{
  "scripts": {
    "clean": "rm -rf dist node_modules/.vite",
    "clean:all": "rm -rf dist node_modules",
    "rebuild": "npm run clean:all && npm install && npm run build"
  }
}
```

### Coverage Report
```json
{
  "scripts": {
    "test:coverage": "vitest --coverage"
  }
}
```

### Full-Stack Development
```json
{
  "scripts": {
    "dev:fullstack": "concurrently \"npm run dev\" \"cd ../backend && npm run dev\""
  }
}
```
Requires `concurrently`:
```bash
npm install -D concurrently
```

### Analyze Bundle Size
```json
{
  "scripts": {
    "analyze": "vite build --mode analyze"
  }
}
```

---

## 📊 Script Comparison

| Script | Speed | Use Case | Output |
|--------|-------|----------|--------|
| `dev` | ⚡⚡⚡ Instant | Daily development | Terminal |
| `dev:watch` | ⚡⚡ ~2-3s | Debugging config | Terminal (verbose) |
| `build` | ⚡ ~10-30s | Production build | `dist/` folder |
| `preview` | ⚡⚡ Quick | Test prod build | Browser |
| `test` | ⚡⚡ Quick | Run all tests | Terminal |
| `test:watch` | ⚡⚡⚡ Instant | TDD | Terminal (interactive) |
| `test:ui` | ⚡⚡ Quick | Explore tests | Browser |
| `lint` | ⚡⚡ Quick | Check code | Terminal |
| `format` | ⚡⚡⚡ Instant | Format code | Files modified |

---

## 🎓 Tips

1. **Use `dev` most of the time** - it's the fastest
2. **Use `dev:watch` for debugging** - when HMR isn't enough
3. **Run `format` before committing** - keep code consistent
4. **Use `test:watch` when writing tests** - instant feedback
5. **Build locally before deploying** - catch issues early

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Use different port
npm run dev -- --port 3001
```

### Cache issues
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Tests not running
```bash
# Clear coverage folder
rm -rf coverage
npm test
```

### Build fails
```bash
# Check TypeScript errors first
npx tsc --noEmit

# Check for linting errors
npm run lint

# Try clean build
rm -rf dist
npm run build
```

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [docs/NODEMON_GUIDE.md](docs/NODEMON_GUIDE.md) - Nodemon details
- [QUICK_START.md](QUICK_START.md) - Quick setup guide

---

## ⌨️ Quick Commands Cheat Sheet

```bash
# Start development
npm run dev

# Run tests while developing
npm run test:watch

# Before committing
npm run format && npm run lint && npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Pro Tip:** Create shell aliases for frequently used commands:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias ndev="npm run dev"
alias ntest="npm run test:watch"
alias nbuild="npm run build"
alias ncheck="npm run format && npm run lint && npm test"
```

Then use:
```bash
ndev        # instead of npm run dev
ntest       # instead of npm run test:watch
nbuild      # instead of npm run build
ncheck      # run full checks
```
