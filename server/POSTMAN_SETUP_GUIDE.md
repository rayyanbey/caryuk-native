# 📮 Postman Collection Setup Guide

## 🎯 Quick Import (30 seconds)

### Step 1: Open Postman
- Download from [postman.com](https://www.postman.com/downloads/)
- Or use web version at [web.postman.co](https://web.postman.co)

### Step 2: Import Collection
1. Click **Import** button (top left)
2. Choose **Upload Files** tab
3. Select `Caryuk_API_Collection.postman_collection.json`
4. Click **Import**

### Step 3: Collection Imported! ✅
You'll see "Caryuk API Collection" in your sidebar with all endpoints organized by category

---

## ⚙️ Configure Environment Variables

### Method 1: Manual (Recommended for Testing)

1. In Postman, click **Variables** tab (in the collection)
2. Set these variables:

```
baseUrl      = http://localhost:3000/api
accessToken  = (leave empty, will populate after login)
refreshToken = (leave empty, will populate after login)
```

### Method 2: Using Environment

1. Click the environment selector (top right)
2. Click **Create New** → **Environment**
3. Name it: `Caryuk Local`
4. Add variables:

```json
{
  "baseUrl": "http://localhost:3000/api",
  "accessToken": "",
  "refreshToken": ""
}
```

5. Save and select the environment

---

## 🚀 Get Started

### 1. Register a Test User

1. Expand **Authentication** folder
2. Click **Register User**
3. Click **Send**
4. Response will include `accessToken` and `refreshToken`

### 2. Copy the Access Token

1. In response, find: `"tokens": { "accessToken": "eyJhbGc..." }`
2. Copy the full token value
3. In Postman, click the **Variables** tab
4. Paste into `accessToken` value
5. Click **Save**

### 3. Test Protected Endpoints

1. Go to **User** folder
2. Click **Get Profile**
3. Notice it already uses `{{accessToken}}` variable
4. Click **Send** ✅

---

## 📋 Folder Structure

```
Caryuk API Collection/
├── Authentication (5 endpoints)
├── Cars (8 endpoints)
├── Cart (6 endpoints)
├── Contact (5 endpoints)
├── Orders (4 endpoints)
├── Payment (9 endpoints)
├── Recommendations (3 endpoints)
├── Search History (5 endpoints)
├── Social Share (4 endpoints)
├── User (5 endpoints)
└── Vouchers (3 endpoints)
```

**Total: 57 endpoints**

---

## 🔐 Authentication Flow

### Step 1: Register/Login
```
POST /auth/register  OR  POST /auth/login
```

### Step 2: Save Token
- Copy `accessToken` from response
- Paste into Postman Variables

### Step 3: Use Protected Endpoints
- All endpoints with `{{accessToken}}` will use your token

### Step 4: Refresh Token (when expired)
```
POST /auth/refresh
Headers: Authorization: Bearer {{refreshToken}}
```

---

## 💡 Tips & Tricks

### Tip 1: View Response in Pretty Format
- Send a request
- Look at response tabs: **Body**, **Headers**, **Tests**
- Body shows formatted JSON

### Tip 2: Copy Values from Response
- Right-click on any value in response
- Select **Set as variable**
- Choose which variable to set
- Auto-saves for next request!

### Tip 3: Use Pre-request Scripts
Before sending a request, Postman can run setup code:
```javascript
// Example: Extract IDs from previous response
const responseData = pm.response.json();
pm.variables.set("carId", responseData.data._id);
```

### Tip 4: Test File Uploads (Cars)
1. Go to **Cars** → **Create Car**
2. In **Body**, click **form-data**
3. For `images` row:
   - Set type to **File**
   - Click the value field
   - Select image from computer
4. Send

### Tip 5: Paginated Requests
Most list endpoints support:
```
?page=1&limit=10&status=pending
```

Modify query parameters before sending:
1. Click on endpoint
2. Look at **Params** tab
3. Modify values
4. Send

---

## 🧪 Common Test Workflows

### Workflow 1: Complete Payment Flow
```
1. Login (Auth)
2. Get Public Key (Payment)
3. Create Order (Orders)
4. Create Payment Intent (Payment)
5. Confirm Payment (Payment)
6. Get Transaction Details (Payment)
```

### Workflow 2: List and Search Cars
```
1. Get All Cars (Cars) - with filters
2. Get Car Details (Cars)
3. Get Popular Cars (Cars)
4. Get Trending Cars (Cars)
```

### Workflow 3: User Profile Setup
```
1. Login (Auth)
2. Get Profile (User)
3. Update Profile (User)
4. Add to Favorites (User)
```

### Workflow 4: Shopping Flow
```
1. Login (Auth)
2. Search Cars (Cars)
3. Add to Cart (Cart)
4. Apply Voucher (Cart)
5. Get Cart Summary (Cart)
6. Create Order (Orders)
```

---

## 🐛 Troubleshooting

### Issue: "Authorization has been revoked"
**Solution:** Token expired. Get new token:
1. Go to **Auth** → **Refresh Token**
2. Click **Send**
3. Copy new `accessToken`
4. Update in Variables

### Issue: "404 Not Found"
**Solution:** Check:
1. Is server running? (`npm start`)
2. Is `baseUrl` correct? (should be `http://localhost:3000/api`)
3. Is resource ID correct?

### Issue: "Invalid JSON"
**Solution:** Check Body format:
1. Headers should show: `Content-Type: application/json`
2. Body should be valid JSON (check for trailing commas)
3. Use **Postman beautify** (bottom right)

### Issue: "CORS Error"
**Solution:** This is frontend issue, not API issue. Check server CORS config in `app.js`

### Issue: File Upload Not Working
**Solution:**
1. Make sure Body type is **form-data** (not raw)
2. For image fields, set type to **File**
3. Select actual file from computer

---

## 📊 Testing Test vs Live

### Test Mode (Recommended)
- Use test Stripe keys
- Database can be reset with `npm run clear`
- No real payments processed

### Switching to Production
1. Update `baseUrl` to production domain
2. Add live Stripe keys to `.env`
3. Ensure `https://` is used
4. Update webhooks URL

---

## 📞 Support

### Need Help?
1. Check **API_DOCUMENTATION.md** for endpoint details
2. Check **STRIPE_QUICK_REFERENCE.md** for payment help
3. Look at error message in response
4. Enable Postman **Console** (bottom left) to see logs

### Console Debugging
1. Click **Console** (bottom left)
2. Send request
3. See all headers, body, response
4. Helps identify exact error

---

## ✅ Ready to Test!

You're all set! Start with:
1. **Register User** (Auth)
2. **Get Profile** (User)
3. **Get All Cars** (Cars)
4. Explore other endpoints

**Happy testing!** 🚀

---

## 📝 Quick Reference

| Task | Endpoint | Method |
|------|----------|--------|
| Login | `/auth/login` | POST |
| Get Cars | `/cars` | GET |
| Add to Cart | `/cart/add` | POST |
| Create Order | `/orders` | POST |
| Pay | `/payment/create-intent` | POST |
| Get Profile | `/user/profile` | GET |

---

**Postman Collection:** Caryuk_API_Collection.postman_collection.json  
**Created:** May 2, 2026  
**Total Endpoints:** 57
