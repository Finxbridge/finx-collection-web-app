# 🔧 Troubleshooting Guide - Blank Screen Fix

## Problem: Seeing Blank White Screen

If you're seeing a blank screen when accessing the app, follow these steps:

### ✅ Solution 1: Access the Login Page Directly

The login screen is at a specific route. Make sure you visit:

```
http://localhost:3001/login
```

**NOT just:**
```
http://localhost:3001/
```

### ✅ Solution 2: Check the Port Number

The dev server might be running on a different port. Check the terminal output:

```
➜  Local:   http://localhost:3001/   ← Use this URL
```

If port 3000 is already in use, Vite automatically tries 3001, 3002, etc.

### ✅ Solution 3: Open Browser Console

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Look for errors (red text)
4. Common errors and fixes:

**Error: "Failed to resolve module"**
```bash
# Solution: Install dependencies
npm install
```

**Error: "Cannot find module '@/...'"**
```bash
# Solution: Restart dev server
npm run dev
```

**Error: Blank page with no errors**
```bash
# Solution: Clear browser cache
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### ✅ Solution 4: Verify Server is Running

Check terminal output:

```bash
# Should see:
✓ VITE ready in XXX ms

➜  Local:   http://localhost:3001/
```

If not running:
```bash
# Start server
npm run dev
```

### ✅ Solution 5: Check for TypeScript Errors

```bash
# Run type check
npx tsc --noEmit

# If errors, they'll prevent the app from running
# Fix errors and restart dev server
```

### ✅ Solution 6: Clear Vite Cache

```bash
# Stop the dev server (Ctrl+C)

# Delete cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

### ✅ Solution 7: Reinstall Dependencies

```bash
# Stop the dev server

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart
npm run dev
```

---

## 🎯 Quick Test

### Test 1: Verify Server Responds

Visit: `http://localhost:3001/test-login.html`

If you see a test page, the server works!

### Test 2: Check React App

Visit: `http://localhost:3001/login`

You should see the enterprise login screen.

### Test 3: Check Network Tab

1. Open DevTools (F12)
2. Go to "Network" tab
3. Refresh page (F5)
4. Look for:
   - `main.tsx` - Should load successfully (200 status)
   - `LoginForm.tsx` - Should load
   - `LoginForm.css` - Should load

If any show red (404 or error), there's a routing/build issue.

---

## 🚨 Common Issues

### Issue: Port Already in Use

**Symptom:** Server won't start

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use custom port
npm run dev -- --port 3002
```

### Issue: White Screen with React Router

**Symptom:** Blank page at `/` but works at `/login`

**Solution:** This is expected! The root path needs a route.

Navigate to: `http://localhost:3001/login`

### Issue: CSS Not Loading

**Symptom:** Login screen appears but no styles

**Solution:**
1. Check browser console for 404 errors
2. Verify CSS file exists: `src/components/features/LoginForm/LoginForm.css`
3. Restart dev server

### Issue: "Cannot find module" Errors

**Symptom:** Import errors in console

**Solution:**
```bash
# Reinstall dependencies
npm install

# Restart server
npm run dev
```

---

## 📋 Checklist

Before asking for help, verify:

- [ ] Dev server is running (`npm run dev`)
- [ ] Accessing correct URL with `/login` path
- [ ] Checking correct port (look at terminal output)
- [ ] Browser console shows no errors (F12)
- [ ] Dependencies are installed (`node_modules` folder exists)
- [ ] `.env` file exists (copy from `.env.example`)

---

## 🎯 Expected Behavior

When everything works:

1. **Start server:** `npm run dev`
2. **See output:**
   ```
   VITE ready in XXX ms
   ➜ Local: http://localhost:3001/
   ```
3. **Open browser:** `http://localhost:3001/login`
4. **See:** Beautiful purple gradient login screen with:
   - Animated background
   - FinxCollection logo
   - Email and password inputs
   - Sign In button

---

## 🔥 Nuclear Option (If All Else Fails)

```bash
# Stop server
Ctrl+C

# Remove everything
rm -rf node_modules package-lock.json dist

# Fresh install
npm install

# Start clean
npm run dev
```

---

## 📞 Still Having Issues?

If you still see a blank screen:

1. **Take a screenshot** of:
   - Browser window
   - Browser console (F12 → Console tab)
   - Terminal with server output

2. **Share the errors** from console

3. **Verify you're visiting:** `http://localhost:XXXX/login` (not just `/`)

---

## ✅ Success Indicators

You'll know it's working when you see:

- Purple gradient animated background
- White login card in center
- FinxCollection logo at top
- Email and password fields
- "Welcome Back" heading

If you see this, **congratulations!** 🎉 The login screen is working!
