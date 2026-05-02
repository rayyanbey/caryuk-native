# 🚀 CARYUK API DOCUMENTATION

**Base URL:** `http://localhost:3000/api`  
**API Version:** v1  
**Date Generated:** May 2, 2026

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Cars](#cars)
3. [Cart](#cart)
4. [Contact](#contact)
5. [Orders](#orders)
6. [Payment](#payment)
7. [Recommendations](#recommendations)
8. [Search History](#search-history)
9. [Social Share](#social-share)
10. [User](#user)
11. [Vouchers](#vouchers)

---

## 🔐 AUTHENTICATION

### 1. Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "Ali Khan",
  "email": "ali@example.com",
  "password": "SecurePass123!",
  "phone": "03001234567"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "64abc123...",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "phone": "03001234567",
    "provider": "local",
    "isActive": true,
    "createdAt": "2026-05-02T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

### 2. Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "ali@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "64abc123...",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "avatarUrl": "https://...",
    "favourites": [],
    "isActive": true
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### 3. Google OAuth Login
```
POST /auth/google
```

**Request Body:**
```json
{
  "token": "google_id_token_from_frontend"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "_id": "64abc123...",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "provider": "google",
    "providerId": "12345678901234567890"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### 4. Refresh Token
```
POST /auth/refresh
```

**Headers:**
```
Authorization: Bearer {refreshToken}
```

**Response (200):**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### 5. Logout
```
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🚗 CARS

### 1. Get All Cars (Search & Filter)
```
GET /cars?search=civic&category=Sedan&minPrice=1000000&maxPrice=3000000&fuelType=Petrol&transmission=Auto&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123...",
      "title": "Honda Civic 2023",
      "brand": "Honda",
      "model": "Civic",
      "year": 2023,
      "price": 2500000,
      "category": "Sedan",
      "fuelType": "Petrol",
      "transmission": "Auto",
      "mileage": "15000 km",
      "color": "Black",
      "description": "Well maintained car",
      "features": ["AC", "Power Steering", "ABS"],
      "images": ["url1", "url2"],
      "views": 245,
      "status": "available",
      "seller": {
        "_id": "user_id",
        "name": "Ahmed Ali",
        "phone": "03001234567"
      },
      "createdAt": "2026-05-02T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "limit": 10,
    "pages": 13
  }
}
```

---

### 2. Get Car Details
```
GET /cars/64abc123...
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "title": "Honda Civic 2023",
    "brand": "Honda",
    "model": "Civic",
    "year": 2023,
    "price": 2500000,
    "category": "Sedan",
    "fuelType": "Petrol",
    "transmission": "Auto",
    "mileage": "15000 km",
    "color": "Black",
    "description": "Well maintained, no accidents",
    "features": ["AC", "Power Steering", "ABS", "Airbags"],
    "images": ["url1", "url2", "url3"],
    "views": 246,
    "status": "available",
    "seller": {
      "_id": "user_id",
      "name": "Ahmed Ali",
      "phone": "03001234567",
      "avatarUrl": "https://..."
    },
    "createdAt": "2026-05-02T10:30:00Z"
  }
}
```

---

### 3. Get Popular Cars
```
GET /cars/popular?limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123...",
      "title": "Honda Civic 2023",
      "brand": "Honda",
      "price": 2500000,
      "views": 1250,
      "images": ["url1"]
    }
  ]
}
```

---

### 4. Get Trending Cars
```
GET /cars/trending?limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123...",
      "title": "Toyota Fortuner 2022",
      "brand": "Toyota",
      "price": 4500000,
      "views": 850,
      "trendingScore": 95.5
    }
  ]
}
```

---

### 5. Create Car (Seller)
```
POST /cars
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "title": "Honda Civic 2023",
  "brand": "Honda",
  "model": "Civic",
  "year": 2023,
  "price": 2500000,
  "category": "Sedan",
  "fuelType": "Petrol",
  "transmission": "Auto",
  "mileage": "15000 km",
  "color": "Black",
  "description": "Well maintained car",
  "features": ["AC", "Power Steering", "ABS"]
}
```

**Files:**
```
images: [file1.jpg, file2.jpg, file3.jpg]
```

**Response (201):**
```json
{
  "success": true,
  "message": "Car created successfully",
  "data": {
    "_id": "64abc123...",
    "title": "Honda Civic 2023",
    "brand": "Honda",
    "price": 2500000,
    "images": ["https://cloudinary.../caryuk/cars/...jpg"],
    "seller": "user_id",
    "status": "available",
    "createdAt": "2026-05-02T10:30:00Z"
  }
}
```

---

### 6. Update Car (Seller)
```
PUT /cars/64abc123...
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Honda Civic 2023 - Updated",
  "price": 2450000,
  "mileage": "16000 km"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Car updated successfully",
  "data": {
    "_id": "64abc123...",
    "title": "Honda Civic 2023 - Updated",
    "price": 2450000,
    "mileage": "16000 km"
  }
}
```

---

### 7. Delete Car (Seller)
```
DELETE /cars/64abc123...
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Car deleted successfully"
}
```

---

### 8. Get My Cars (Seller)
```
GET /cars/my-cars
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123...",
      "title": "Honda Civic 2023",
      "price": 2500000,
      "views": 245,
      "status": "available",
      "createdAt": "2026-05-02T10:30:00Z"
    }
  ]
}
```

---

## 🛒 CART

### 1. Get Cart
```
GET /cart
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64cart123...",
    "userId": "64user123...",
    "items": [
      {
        "_id": "item_1",
        "car": {
          "_id": "64car123...",
          "title": "Honda Civic 2023",
          "price": 2500000,
          "images": ["url1"]
        },
        "addedAt": "2026-05-02T10:30:00Z",
        "notes": "Interested in this one"
      }
    ],
    "appliedVoucher": "SAVE20",
    "totalAmount": 2500000,
    "discountAmount": 100000,
    "finalAmount": 2400000,
    "updatedAt": "2026-05-02T10:30:00Z"
  }
}
```

---

### 2. Add to Cart
```
POST /cart/add
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "carId": "64car123...",
  "notes": "Interested in this car"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Car added to cart",
  "data": {
    "totalItems": 3,
    "totalAmount": 7500000,
    "finalAmount": 7350000
  }
}
```

---

### 3. Remove from Cart
```
POST /cart/remove
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "carId": "64car123..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Car removed from cart",
  "data": {
    "totalItems": 2,
    "totalAmount": 5000000,
    "finalAmount": 4900000
  }
}
```

---

### 4. Apply Voucher
```
POST /cart/apply-voucher
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "voucherCode": "SAVE20"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Voucher applied successfully",
  "data": {
    "voucherCode": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "discountAmount": 100000,
    "newTotal": 2400000
  }
}
```

---

### 5. Get Cart Summary
```
GET /cart/summary
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "itemCount": 3,
    "totalAmount": 7500000,
    "discountAmount": 100000,
    "finalAmount": 7400000,
    "appliedVoucher": "SAVE20"
  }
}
```

---

### 6. Clear Cart
```
POST /cart/clear
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 📞 CONTACT

### 1. Initiate Phone Call
```
POST /contact/phone
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "carId": "64car123...",
  "sellerId": "64seller123..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Contact initiated",
  "data": {
    "recipientPhone": "03001234567",
    "carTitle": "Honda Civic 2023",
    "sellerName": "Ahmed Ali"
  }
}
```

---

### 2. Initiate SMS
```
POST /contact/sms
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "carId": "64car123...",
  "sellerId": "64seller123...",
  "message": "Are you still selling this car?"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "SMS initiated",
  "data": {
    "recipientPhone": "03001234567",
    "message": "Are you still selling this car?",
    "timestamp": "2026-05-02T10:30:00Z"
  }
}
```

---

### 3. Get Contact History
```
GET /contact/history?page=1&limit=10
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64contact123...",
      "car": {
        "_id": "64car123...",
        "title": "Honda Civic 2023"
      },
      "recipient": {
        "_id": "64seller123...",
        "name": "Ahmed Ali",
        "phone": "03001234567"
      },
      "contactMethod": "phone",
      "status": "initiated",
      "timestamp": "2026-05-02T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

---

### 4. Get Received Contacts
```
GET /contact/received?page=1&limit=10
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64contact123...",
      "initiator": {
        "_id": "64buyer123...",
        "name": "Ali Khan",
        "phone": "03009876543"
      },
      "car": {
        "_id": "64car123...",
        "title": "Honda Civic 2023"
      },
      "contactMethod": "sms",
      "message": "Are you still selling?",
      "status": "initiated",
      "timestamp": "2026-05-02T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 5. Report Contact
```
POST /contact/report
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "contactId": "64contact123..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contact reported successfully"
}
```

---

## 📦 ORDERS

### 1. Create Order
```
POST /orders
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "carId": "64car123...",
  "quantity": 1,
  "voucherCode": "SAVE20"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "64order123...",
    "buyer": "64buyer123...",
    "car": "64car123...",
    "amount": 2500000,
    "discountAmount": 100000,
    "voucherCode": "SAVE20",
    "status": "pending",
    "createdAt": "2026-05-02T10:30:00Z"
  }
}
```

---

### 2. Get All Orders (Buyer)
```
GET /orders?status=pending&page=1&limit=10
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64order123...",
      "car": {
        "_id": "64car123...",
        "title": "Honda Civic 2023",
        "price": 2500000
      },
      "amount": 2500000,
      "status": "paid",
      "createdAt": "2026-05-02T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 3. Get Order Details
```
GET /orders/64order123...
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64order123...",
    "buyer": {
      "_id": "64buyer123...",
      "name": "Ali Khan",
      "email": "ali@example.com",
      "phone": "03001234567"
    },
    "car": {
      "_id": "64car123...",
      "title": "Honda Civic 2023",
      "price": 2500000,
      "seller": "64seller123..."
    },
    "amount": 2500000,
    "discountAmount": 100000,
    "voucherCode": "SAVE20",
    "status": "paid",
    "stripePaymentId": "pi_xxxxxxxxxxxx",
    "createdAt": "2026-05-02T10:30:00Z"
  }
}
```

---

### 4. Update Order Status (Admin)
```
PUT /orders/64order123...
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "_id": "64order123...",
    "status": "completed",
    "updatedAt": "2026-05-02T10:35:00Z"
  }
}
```

---

## 💳 PAYMENT

### 1. Get Public Stripe Key
```
GET /payment/public-key
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "publicKey": "pk_test_xxxxxxxxxxxxx"
  }
}
```

---

### 2. Create Payment Intent
```
POST /payment/create-intent
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "orderId": "64order123..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxxxxxxxxxxx",
    "amount": 2500000,
    "currency": "pkr"
  }
}
```

---

### 3. Confirm Payment
```
POST /payment/confirm
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "orderId": "64order123...",
  "paymentIntentId": "pi_xxxxxxxxxxxx"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "_id": "64order123...",
    "status": "paid",
    "stripePaymentId": "pi_xxxxxxxxxxxx",
    "amount": 2500000
  }
}
```

---

### 4. Get Payment Status
```
GET /payment/status/pi_xxxxxxxxxxxx
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "pi_xxxxxxxxxxxx",
    "status": "succeeded",
    "amount": 2500000,
    "currency": "pkr",
    "description": "Payment for Honda Civic",
    "clientSecret": "pi_xxx_secret_xxx"
  }
}
```

---

### 5. Refund Payment
```
POST /payment/refund
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "orderId": "64order123...",
  "reason": "requested_by_customer",
  "amount": 500000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundId": "re_xxxxxxxxxxxx",
    "amount": 500000,
    "status": "succeeded",
    "reason": "requested_by_customer"
  }
}
```

---

### 6. Cancel Payment
```
POST /payment/cancel
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "orderId": "64order123...",
  "cancellationReason": "User changed mind"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment cancelled successfully",
  "data": {
    "_id": "64order123...",
    "status": "cancelled",
    "cancellationReason": "User changed mind"
  }
}
```

---

### 7. Initialize Checkout
```
POST /payment/initialize-checkout
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "orderId": "64order123...",
  "returnUrl": "https://app.example.com/checkout-return"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_live_xxxxxxxxxxxx",
    "sessionUrl": "https://checkout.stripe.com/pay/cs_live_xxx",
    "publishableKey": "pk_test_xxxxxxxxxxxxx"
  }
}
```

---

### 8. Get Transaction Details
```
GET /payment/transaction/64order123...
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "64order123...",
      "status": "paid",
      "amount": 2500000,
      "buyer": { "name": "Ali Khan", "email": "ali@example.com" }
    },
    "stripe": {
      "paymentIntentId": "pi_xxxxxxxxxxxx",
      "status": "succeeded",
      "charges": [
        {
          "id": "ch_xxxxxxxxxxxx",
          "amount": 2500000,
          "status": "succeeded"
        }
      ]
    }
  }
}
```

---

### 9. Get Transactions (List)
```
GET /payment/transactions?page=1&limit=10&status=paid
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64order123...",
      "car": { "title": "Honda Civic", "price": 2500000 },
      "amount": 2500000,
      "status": "paid",
      "createdAt": "2026-05-02T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

## 🎯 RECOMMENDATIONS

### 1. Get Recommendations
```
GET /recommendations?limit=10
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64car123...",
      "title": "Honda Civic",
      "brand": "Honda",
      "price": 2500000,
      "images": ["url1"],
      "recommendationScore": 85,
      "recommendationReason": "similar_category"
    }
  ]
}
```

---

### 2. Get Recommendation Stats
```
GET /recommendations/stats
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRecommendations": 45,
    "byReason": [
      { "_id": "similar_category", "count": 15, "avgScore": 78.5 },
      { "_id": "same_brand", "count": 12, "avgScore": 82.1 }
    ]
  }
}
```

---

### 3. Regenerate Recommendations
```
POST /recommendations/regenerate
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Old recommendations cleared. Fetch new recommendations with GET /api/recommendations"
}
```

---

## 🔍 SEARCH HISTORY

### 1. Save Search
```
POST /search-history
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "query": "civic",
  "filters": {
    "category": "Sedan",
    "minPrice": 2000000,
    "maxPrice": 3000000,
    "fuelType": "Petrol"
  },
  "resultCount": 45
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Search saved successfully",
  "data": {
    "_id": "64search123...",
    "userId": "64user123...",
    "query": "civic",
    "filters": { "category": "Sedan", "minPrice": 2000000 },
    "resultCount": 45,
    "createdAt": "2026-05-02T10:30:00Z"
  }
}
```

---

### 2. Get Search History
```
GET /search-history?limit=15
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64search123...",
      "query": "civic",
      "filters": { "category": "Sedan" },
      "resultCount": 45,
      "createdAt": "2026-05-02T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Trending Searches
```
GET /search-history/trending
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "query": "civic",
      "count": 234,
      "avgResults": 45
    },
    {
      "query": "fortuner",
      "count": 189,
      "avgResults": 32
    }
  ]
}
```

---

### 4. Delete Search
```
DELETE /search-history/64search123...
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Search deleted successfully"
}
```

---

### 5. Clear History
```
POST /search-history/clear
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Search history cleared successfully"
}
```

---

## 📱 SOCIAL SHARE

### 1. Track Social Share
```
POST /social-share/64car123...
Headers: Authorization: Bearer {token} (optional)
```

**Request Body:**
```json
{
  "platform": "facebook",
  "shareUrl": "https://facebook.com/sharedpost"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Shared on facebook",
  "data": {
    "_id": "64share123...",
    "car": "64car123...",
    "platform": "facebook",
    "sharedBy": "64user123...",
    "timestamp": "2026-05-02T10:30:00Z"
  }
}
```

---

### 2. Get Share Stats
```
GET /social-share/64car123.../stats
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "carId": "64car123...",
    "totalShares": 47,
    "sharesInLast7Days": 12,
    "sharesByPlatform": [
      { "_id": "whatsapp", "count": 25 },
      { "_id": "facebook", "count": 15 }
    ]
  }
}
```

---

### 3. Get Share Leaderboard
```
GET /social-share/leaderboard?limit=10&platform=whatsapp
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64car123...",
      "totalShares": 87,
      "platforms": ["whatsapp", "facebook"],
      "carDetails": {
        "title": "Honda Civic",
        "brand": "Honda",
        "price": 2500000
      }
    }
  ]
}
```

---

### 4. Get My Shares
```
GET /social-share/my-shares?page=1&limit=10
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64share123...",
      "car": {
        "title": "Toyota Fortuner",
        "price": 4500000
      },
      "platform": "whatsapp",
      "timestamp": "2026-05-02T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

## 👤 USER

### 1. Get Profile
```
GET /user/profile
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64user123...",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "phone": "03001234567",
    "avatarUrl": "https://cloudinary.../avatar.jpg",
    "provider": "local",
    "favourites": ["64car123...", "64car456..."],
    "isActive": true,
    "lastLogin": "2026-05-02T10:30:00Z",
    "createdAt": "2026-04-15T15:20:00Z"
  }
}
```

---

### 2. Update Profile
```
PUT /user/profile
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "name": "Ali Khan Updated",
  "phone": "03009876543"
}
```

**Files (optional):**
```
avatar: file.jpg
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "64user123...",
    "name": "Ali Khan Updated",
    "phone": "03009876543",
    "avatarUrl": "https://cloudinary.../avatar_new.jpg"
  }
}
```

---

### 3. Add Favorite
```
POST /user/favorites
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "carId": "64car123..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Car added to favorites",
  "data": {
    "favourites": ["64car123...", "64car456...", "64car789..."]
  }
}
```

---

### 4. Remove Favorite
```
DELETE /user/favorites/64car123...
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Car removed from favorites",
  "data": {
    "favourites": ["64car456...", "64car789..."]
  }
}
```

---

### 5. Get Favorites
```
GET /user/favorites
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64car123...",
      "title": "Honda Civic 2023",
      "brand": "Honda",
      "price": 2500000,
      "images": ["url1"]
    }
  ]
}
```

---

## 🎟️ VOUCHERS

### 1. Get All Vouchers
```
GET /vouchers?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64voucher123...",
      "code": "SAVE20",
      "discountType": "percentage",
      "discountValue": 20,
      "maxDiscountCap": 500000,
      "minOrderAmount": 1000000,
      "expiresAt": "2026-12-31T23:59:59Z",
      "isActive": true,
      "usageLimit": 100,
      "usedCount": 45
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 2. Validate Voucher
```
POST /vouchers/validate
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "orderAmount": 2500000
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "code": "SAVE20",
    "isValid": true,
    "discountType": "percentage",
    "discountValue": 20,
    "discountAmount": 500000,
    "finalAmount": 2000000,
    "message": "Voucher is valid and applied"
  }
}
```

---

### 3. Create Voucher (Admin)
```
POST /vouchers
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscountCap": 500000,
  "minOrderAmount": 1000000,
  "expiresAt": "2026-12-31T23:59:59Z",
  "usageLimit": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Voucher created successfully",
  "data": {
    "_id": "64voucher123...",
    "code": "SAVE20",
    "discountType": "percentage",
    "isActive": true
  }
}
```

---

## ✅ Response Format Standards

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { },
  "pagination": { "total": 0, "page": 1, "limit": 10 }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## 🔑 Authentication Headers

All protected endpoints require:
```
Authorization: Bearer {accessToken}
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

**Documentation Generated:** May 2, 2026  
**API Version:** v1  
**Status:** Complete and Ready
