# Nodemon Integration Guide

This project includes **nodemon** for advanced file watching and automatic restarts during development.

## 📋 What is Nodemon?

Nodemon is a utility that monitors changes in your source code and automatically restarts your development server. While Vite already has excellent HMR (Hot Module Replacement), nodemon provides additional capabilities for tracking changes across your entire project.

## 🚀 Available Commands

### Standard Development (Vite HMR)
```bash
npm run dev
```
- Uses Vite's built-in HMR
- Fast, optimized for React
- **Recommended for most development**

### Development with Nodemon
```bash
npm run dev:watch
```
- Monitors all file changes in `src/`
- Restarts Vite on changes to `.ts`, `.tsx`, `.css` files
- Useful for debugging build-related issues
- More verbose output

### Test Watch Mode
```bash
npm run test:watch
```
- Runs tests automatically when files change
- Interactive test runner

## ⚙️ Nodemon Configuration

Configuration is in [nodemon.json](../nodemon.json):

```json
{
  "watch": ["src"],                    // Directories to watch
  "ext": "ts,tsx,js,jsx,css,scss,json", // File extensions to monitor
  "ignore": [                          // Files to ignore
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "node_modules",
    "dist",
    "coverage"
  ],
  "delay": "500",                      // Delay before restart (ms)
  "verbose": true                      // Show detailed logs
}
```

## 🎯 When to Use Each Mode

### Use `npm run dev` (Vite HMR) when:
- ✅ Normal feature development
- ✅ Making component changes
- ✅ UI development
- ✅ Quick iterations

**Benefits:**
- Instant hot reload
- Preserves component state
- Faster than full restart

### Use `npm run dev:watch` (Nodemon) when:
- ✅ Working on build configuration
- ✅ Debugging module resolution issues
- ✅ Testing environment variable changes
- ✅ Need full server restart on every change
- ✅ Troubleshooting cache issues

**Benefits:**
- Full clean restart
- More predictable behavior
- Better for debugging

## 📊 Comparison

| Feature | Vite HMR | Nodemon + Vite |
|---------|----------|----------------|
| Speed | ⚡ Instant | 🔄 ~2-3 seconds |
| State Preservation | ✅ Yes | ❌ No |
| Full Restart | ❌ Rare | ✅ Always |
| Config Changes | ⚠️ Manual restart | ✅ Auto restart |
| Use Case | Normal dev | Debugging |

## 🔧 Custom Nodemon Scripts

### Watch Specific Folders
```json
{
  "scripts": {
    "dev:watch-components": "nodemon --watch src/components --exec \"vite\""
  }
}
```

### Watch with Custom Extensions
```json
{
  "scripts": {
    "dev:watch-all": "nodemon --watch src --ext ts,tsx,css,json,md --exec \"vite\""
  }
}
```

### Delay Restart
```json
{
  "scripts": {
    "dev:watch-slow": "nodemon --watch src --delay 2000 --exec \"vite\""
  }
}
```

## 🛠️ Advanced Configuration

### Watching Multiple Directories
```json
{
  "watch": ["src", "public", ".env"],
  "ext": "ts,tsx,css,env"
}
```

### Custom Events
```json
{
  "events": {
    "start": "echo 'Starting development server...'",
    "restart": "echo 'Restarting due to changes...'",
    "crash": "echo 'Server crashed - waiting for changes...'"
  }
}
```

### Environment-Specific Config
Create multiple configs:

**nodemon.dev.json:**
```json
{
  "watch": ["src"],
  "delay": "500"
}
```

**nodemon.debug.json:**
```json
{
  "watch": ["src", "vite.config.ts"],
  "verbose": true,
  "delay": "1000"
}
```

Usage:
```json
{
  "scripts": {
    "dev:debug": "nodemon --config nodemon.debug.json --exec \"vite\""
  }
}
```

## 🐛 Troubleshooting

### Nodemon not restarting
```bash
# Check if nodemon is watching files
nodemon --watch src --verbose

# Clear cache
rm -rf node_modules/.cache
```

### Too many restarts
```bash
# Increase delay
nodemon --delay 2000

# Ignore more files
nodemon --ignore "*.test.tsx" --ignore "*.spec.ts"
```

### Performance issues
```bash
# Watch fewer files
nodemon --watch src/components

# Reduce extensions
nodemon --ext ts,tsx
```

## 📝 Best Practices

1. **Use Vite HMR for normal development**
   - Faster and preserves state

2. **Use nodemon for:**
   - Configuration changes
   - Environment variable updates
   - Debugging build issues

3. **Configure ignored files**
   - Prevent unnecessary restarts
   - Exclude test files, node_modules

4. **Set appropriate delay**
   - Prevent multiple restarts
   - Balance between responsiveness and stability

## 🔄 Integration with Backend

If you're running a backend alongside the frontend, use `concurrently`:

### Install
```bash
npm install -D concurrently
```

### Add Script
```json
{
  "scripts": {
    "dev:fullstack": "concurrently \"npm run dev\" \"cd ../backend && npm run dev\"",
    "dev:fullstack:watch": "concurrently \"npm run dev:watch\" \"cd ../backend && nodemon server.js\""
  }
}
```

### Usage
```bash
# Run frontend and backend together
npm run dev:fullstack

# With nodemon watching both
npm run dev:fullstack:watch
```

### Advanced Concurrently Setup
```json
{
  "scripts": {
    "dev:all": "concurrently -n \"FRONTEND,BACKEND\" -c \"cyan,green\" \"npm run dev\" \"cd ../backend && npm run dev\""
  }
}
```

**Options explained:**
- `-n` - Names for processes
- `-c` - Colors for output
- `-k` - Kill all on error

## 📊 Monitoring File Changes

### See what files are being watched
```bash
nodemon --watch src --verbose
```

### Debug mode
```bash
DEBUG=nodemon:* nodemon --watch src --exec "vite"
```

### List watched files
```bash
nodemon --dump
```

## 🎨 Custom Restart Messages

Add to [nodemon.json](../nodemon.json):

```json
{
  "events": {
    "restart": "clear && echo '\n🔄 Reloading after file changes...\n'",
    "start": "echo '\n✅ Server started successfully!\n'",
    "crash": "echo '\n❌ Server crashed! Fix the error and save to restart.\n'"
  }
}
```

## 🚀 Production Notes

**Important:** Nodemon is a **development-only** tool. Never use it in production!

For production:
```bash
npm run build  # Build optimized bundle
npm run preview  # Preview production build locally
```

## 📚 Resources

- [Nodemon Documentation](https://nodemon.io/)
- [Nodemon GitHub](https://github.com/remy/nodemon)
- [Vite HMR Documentation](https://vitejs.dev/guide/features.html#hot-module-replacement)

## ✅ Quick Reference

```bash
# Normal development (recommended)
npm run dev

# With nodemon watching
npm run dev:watch

# Tests with watch mode
npm run test:watch

# Full-stack development
npm run dev:fullstack
```

---

**Recommendation:** Use `npm run dev` for daily development. Switch to `npm run dev:watch` when you need full restarts or are debugging configuration issues.
