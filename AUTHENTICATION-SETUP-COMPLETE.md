**Test Employee Login Credentials**

Employee has been successfully configured with SuperAdmin role and all permissions.

---

## ✅ Login Credentials

- **Email**: `rohit.jain@programmers.io`
- **Password**: `password`
- **Role**: SuperAdmin (ID: 1)
- **Permissions**: 122 (all permissions)

---

## ✅ Backend API Verified

The backend API endpoint `/api/auth/login` has been tested and confirmed working:

```bash
php test-api-login.php
```

**Result**: ✅ 200 OK - Token generated successfully

---

## ⚠️ Frontend Issue: 401 Unauthorized

The 401 error you're seeing is likely due to **Vite not picking up the `VITE_API_KEY` environment variable**.

### Solution Steps:

1. **Stop the Vite dev server** (if running)
   - Press `Ctrl+C` in the terminal where `npm run dev` is running

2. **Restart Vite dev server**:
   ```powershell
   cd hrms-frontend
   npm run dev
   ```

3. **Clear browser cache** and reload:
   - Press `Ctrl+Shift+R` (hard reload)
   - Or open DevTools → Network tab → Check "Disable cache"

4. **Verify environment variable is loaded**:
   - Open browser console (F12)
   - Type: `import.meta.env.VITE_API_KEY`
   - Should show: `hrms-secure-api-key-change-in-production`

---

## 🔍 Debugging

If the issue persists, check the Network tab in browser DevTools:

1. Open DevTools (F12) → Network tab
2. Try to login
3. Click on the `/login` request
4. Check **Request Headers** section
5. Verify `X-API-Key` header is present with value: `hrms-secure-api-key-change-in-production`

### Expected Request Headers:
```
Content-Type: application/json
Accept: application/json
X-API-Key: hrms-secure-api-key-change-in-production
```

---

## 🔑 Backend Configuration

- **API Key** (backend `.env`): `hrms-secure-api-key-change-in-production`
- **API Key** (frontend `.env`): `hrms-secure-api-key-change-in-production`
- **Backend URL**: `http://localhost:8000/api`
- **Frontend URL**: `http://localhost:5175` (or 5173)

---

## ✅ Quick Test

You can test the API directly using curl:

```powershell
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -H "Accept: application/json" `
  -H "X-API-Key: hrms-secure-api-key-change-in-production" `
  -d '{"email":"rohit.jain@programmers.io","password":"password"}'
```

**Expected**: 200 OK with token

---

## 📝 Files Updated

1. `hrms-backend/finalize-test-login.php` - Sets up test employee with SuperAdmin role
2. `hrms-backend/test-api-login.php` - Tests API endpoint directly
3. Employee record in database:
   - `employee_data.id = 1`
   - `employment_details.email = rohit.jain@programmers.io`
   - `employment_details.role_id = 1` (SuperAdmin)

---

## 🎯 Next Steps After Restart

Once Vite picks up the environment variable:

1. Navigate to: `http://localhost:5175/internal-login`
2. Enter credentials:
   - Email: `rohit.jain@programmers.io`
   - Password: `password`
3. Should redirect to dashboard
4. Can then navigate to `/roles` to test Role Management feature

---

## 🐛 Still Getting 401?

If after restarting Vite you still get 401, check:

1. **Browser console** for the actual error message
2. **Network tab** → Request Headers → Verify `X-API-Key` is sent
3. **Backend logs** in the terminal running `php artisan serve`

The error message will tell us exactly what's wrong:
- "API key is missing" → Environment variable not loaded
- "Invalid API key" → Mismatch between frontend and backend
- "Invalid email or password" → Authentication issue (different problem)
