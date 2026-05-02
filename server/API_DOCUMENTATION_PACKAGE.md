# 📚 CARYUK API DOCUMENTATION - COMPLETE PACKAGE

**Date Generated:** May 2, 2026  
**Status:** ✅ COMPLETE AND READY TO USE  
**Total Endpoints:** 57  
**API Categories:** 11

---

## 📦 What's Included

### 1. 📖 **API_DOCUMENTATION.md** (Main Reference)
- **Size:** 450+ lines
- **Content:**
  - Complete API reference for all 57 endpoints
  - Request body examples for each endpoint
  - Response examples for each endpoint
  - Status codes and error handling
  - Authentication requirements
  - 11 API categories organized clearly

**How to use:**
- Open in any markdown viewer
- Use search (Ctrl+F) to find endpoints
- Copy request examples for reference
- Bookmark for quick lookup

---

### 2. 🎮 **Postman Collection JSON** (Import & Test)
- **File:** `Caryuk_API_Collection.postman_collection.json`
- **Size:** 2000+ lines
- **Content:**
  - All 57 endpoints pre-configured
  - Organized in 11 folders by category
  - Request headers pre-set
  - Request bodies with examples
  - Query parameters configured
  - File upload support for image endpoints
  - Variables for baseUrl and auth tokens

**How to use:**
1. Open Postman
2. Click **Import**
3. Upload the JSON file
4. All endpoints ready to test!

**File location:** `c:\caryuk-native\server\Caryuk_API_Collection.postman_collection.json`

---

### 3. 📋 **POSTMAN_SETUP_GUIDE.md** (Getting Started)
- **Size:** 300+ lines
- **Content:**
  - Step-by-step import guide
  - Variable configuration
  - Authentication workflow
  - Common test scenarios
  - Tips & tricks
  - Troubleshooting guide
  - Quick reference table

**How to use:**
- Follow step-by-step guide to import
- Set up variables correctly
- Use workflows for common tasks
- Refer to troubleshooting section if issues

---

## 🎯 Quick Start (5 minutes)

### Step 1: Import Collection (1 min)
```
1. Open Postman
2. Click Import
3. Upload Caryuk_API_Collection.postman_collection.json
4. Collection appears in sidebar ✅
```

### Step 2: Set Variables (1 min)
```
1. Click collection variables tab
2. Set baseUrl = http://localhost:3000/api
3. Leave accessToken blank (will populate)
4. Save ✅
```

### Step 3: Register Test User (1 min)
```
1. Go to Authentication folder
2. Click Register User
3. Modify name/email if needed
4. Click Send
5. Copy accessToken from response ✅
```

### Step 4: Populate Token (1 min)
```
1. Click Variables tab
2. Paste accessToken
3. Save
4. Now ready to test protected endpoints ✅
```

### Step 5: Test Endpoints (1 min)
```
1. Go to User folder
2. Click Get Profile
3. Click Send
4. See your profile! ✅
```

---

## 📊 Endpoint Summary

### Authentication (5)
- Register User
- Login
- Google OAuth
- Refresh Token
- Logout

### Cars (8)
- Get All Cars (search/filter)
- Get Car Details
- Get Popular Cars
- Get Trending Cars
- Create Car
- Update Car
- Delete Car
- Get My Cars

### Cart (6)
- Get Cart
- Add to Cart
- Remove from Cart
- Apply Voucher
- Get Cart Summary
- Clear Cart

### Contact (5)
- Initiate Phone Call
- Initiate SMS
- Get Contact History
- Get Received Contacts
- Report Contact

### Orders (4)
- Create Order
- Get All Orders
- Get Order Details
- Update Order Status

### Payment (9)
- Get Public Stripe Key
- Create Payment Intent
- Confirm Payment
- Get Payment Status
- Refund Payment
- Cancel Payment
- Initialize Checkout
- Get Transaction Details
- Get Transactions List

### Recommendations (3)
- Get Recommendations
- Get Recommendation Stats
- Regenerate Recommendations

### Search History (5)
- Save Search
- Get Search History
- Get Trending Searches
- Delete Search
- Clear Search History

### Social Share (4)
- Track Social Share
- Get Share Stats
- Get Share Leaderboard
- Get My Shares

### User (5)
- Get Profile
- Update Profile
- Add Favorite
- Remove Favorite
- Get Favorites

### Vouchers (3)
- Get All Vouchers
- Validate Voucher
- Create Voucher

**Total: 57 Endpoints**

---

## 🗂️ File Locations

### Documentation Files
```
server/
├── API_DOCUMENTATION.md                 ← Main reference (450+ lines)
├── POSTMAN_SETUP_GUIDE.md              ← Setup instructions (300+ lines)
├── Caryuk_API_Collection.postman_collection.json  ← Import file
├── STRIPE_PAYMENT_GUIDE.md             ← Payment details
├── STRIPE_QUICK_REFERENCE.md           ← Quick payment reference
└── STRIPE_IMPLEMENTATION_COMPLETE.md   ← Payment implementation
```

---

## 💡 Common Use Cases

### Use Case 1: Test Car Search
```
1. Go to Cars folder
2. Click Get All Cars
3. Modify search/category/price in Params tab
4. Send
5. View results
```

### Use Case 2: Complete Purchase
```
1. Login (get token)
2. Search Cars
3. Add to Cart
4. Create Order
5. Create Payment Intent
6. Confirm Payment
7. Check transaction history
```

### Use Case 3: Seller Workflow
```
1. Register/Login as seller
2. Create Car listing
3. Get My Cars
4. View received contacts
5. Monitor car details
```

### Use Case 4: Test Payment Flow
```
1. Get Public Stripe Key
2. Create Order
3. Create Payment Intent
4. Get Payment Status
5. Confirm Payment
```

---

## 🔑 Authentication

### Setup
1. Get access token from **Login** or **Register**
2. Copy token to Variables → `accessToken`
3. All subsequent requests auto-include token

### Token Expiration
- Access Token: 7 days
- Refresh Token: 30 days

### Refresh When Expired
```
POST /auth/refresh
Headers: Authorization: Bearer {{refreshToken}}
```

---

## 🧪 Test Data

### Test User Account
```json
{
  "email": "test@example.com",
  "password": "TestPass123!",
  "name": "Test User",
  "phone": "03001234567"
}
```

### Test Stripe Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 2500 0000 3010`

**Expiry:** Any future date  
**CVC:** Any 3 digits

---

## 📊 Response Format

### Success (200, 201)
```json
{
  "success": true,
  "message": "Optional message",
  "data": { /* endpoint data */ },
  "pagination": { "total": 0, "page": 1, "limit": 10 }
}
```

### Error (400, 401, 404, 500)
```json
{
  "success": false,
  "error": "Error description"
}
```

---

## 🔄 Common Workflows

### Workflow: Complete Shopping
```
Auth Login
  ↓
Cars Get All Cars (search/filter)
  ↓
Cars Get Car Details
  ↓
Cart Add to Cart
  ↓
Vouchers Validate Voucher
  ↓
Cart Apply Voucher
  ↓
Orders Create Order
  ↓
Payment Create Payment Intent
  ↓
Payment Confirm Payment
  ↓
Payment Get Transaction Details
```

### Workflow: Seller Listing
```
Auth Register/Login
  ↓
User Get Profile
  ↓
Cars Create Car
  ↓
Cars Get My Cars
  ↓
Contact Get Received Contacts
  ↓
Orders Get All Orders
```

### Workflow: Get Recommendations
```
User Get Favorites
  ↓
Recommendations Get Recommendations
  ↓
Recommendations Get Recommendation Stats
  ↓
Cars Get Car Details (for each rec)
```

---

## ⚙️ Environment Setup

### Local Development
```
baseUrl: http://localhost:3000/api
NODE_ENV: development
PORT: 3000
STRIPE_MODE: test
```

### Production
```
baseUrl: https://yourdomain.com/api
NODE_ENV: production
PORT: 443
STRIPE_MODE: live
```

---

## 📞 API Support Resources

1. **API_DOCUMENTATION.md** - Full reference
2. **POSTMAN_SETUP_GUIDE.md** - Setup help
3. **STRIPE_PAYMENT_GUIDE.md** - Payment details
4. **STRIPE_QUICK_REFERENCE.md** - Payment cheat sheet
5. Postman **Console** - Debug requests

---

## ✅ Verification Checklist

- [x] API Documentation complete (450+ lines)
- [x] Postman collection created (57 endpoints)
- [x] Setup guide provided (300+ lines)
- [x] All request/response examples included
- [x] Authentication flow documented
- [x] Payment workflows documented
- [x] Error handling examples provided
- [x] Test data provided
- [x] Troubleshooting guide included
- [x] Quick reference available

---

## 🚀 Ready to Use!

Everything is ready to import and test immediately!

### Next Steps:
1. ✅ Import collection into Postman
2. ✅ Configure variables
3. ✅ Register test user
4. ✅ Copy access token
5. ✅ Test endpoints
6. ✅ Use for development/testing

---

## 📝 Files to Keep Handy

| File | Purpose | Size |
|------|---------|------|
| API_DOCUMENTATION.md | Main reference | 450+ lines |
| Caryuk_API_Collection.postman_collection.json | Import to Postman | 2000+ lines |
| POSTMAN_SETUP_GUIDE.md | Setup instructions | 300+ lines |
| STRIPE_PAYMENT_GUIDE.md | Payment details | 500+ lines |

---

## 🎉 Status

**✅ COMPLETE**

All APIs documented and ready for:
- Development testing
- Integration testing
- Production deployment
- Client documentation
- Team onboarding

---

**Created:** May 2, 2026  
**Package:** Complete Caryuk API Documentation  
**Quality:** Production Ready
