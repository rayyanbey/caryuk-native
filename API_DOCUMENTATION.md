# CarYuk API Documentation

**Base URL:** `http://localhost:3000/api`

**Authentication:** Most endpoints require JWT token in the header:
```
Authorization: Bearer {token}
```

---

## Table of Contents
1. [Authentication Routes](#authentication-routes)
2. [Cars Routes](#cars-routes)
3. [Orders Routes](#orders-routes)
4. [Payment Routes](#payment-routes)
5. [User Routes](#user-routes)
6. [Voucher Routes](#voucher-routes)

---

## Authentication Routes

### 1. Sign Up
**Endpoint:** `POST /auth/signup`

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "03001234567"
}
```

**Request File (Optional):**
- Field name: `avatar`
- Accepted formats: JPEG, PNG, GIF, WebP
- Max size: 5MB
- Note: Uploaded to Cloudinary

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "userId",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "03001234567",
      "avatarUrl": "https://cloudinary.url/avatar.jpg",
      "provider": "local",
      "lastLogin": "2026-05-01T10:30:00Z",
      "favourites": [],
      "createdAt": "2026-05-01T10:30:00Z",
      "updatedAt": "2026-05-01T10:30:00Z"
    },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Error Responses:**
- `400` - Validation error (missing fields, password mismatch, password < 6 chars)
- `409` - User already exists with this email

---

### 2. Login
**Endpoint:** `POST /auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "_id": "userId",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "03001234567",
      "avatarUrl": "https://cloudinary.url/avatar.jpg",
      "provider": "local",
      "lastLogin": "2026-05-01T10:35:00Z",
      "favourites": [],
      "createdAt": "2026-05-01T10:30:00Z",
      "updatedAt": "2026-05-01T10:35:00Z"
    },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Error Responses:**
- `400` - Email/password required or OAuth user error
- `401` - Invalid email or password

---

### 3. Google OAuth Login/Signup
**Endpoint:** `GET /auth/google`

**Authentication:** Not required

**Description:** Redirects to Google login page with scopes: profile, email

**Callback Endpoint:** `GET /auth/google/callback`

**Response:** Redirects to frontend with tokens:
```
{CLIENT_URL}/auth-success?token={token}&refreshToken={refreshToken}
```

---

### 4. Logout
**Endpoint:** `POST /auth/logout`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Get Current User
**Endpoint:** `GET /auth/me`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "03001234567",
    "avatarUrl": "https://cloudinary.url/avatar.jpg",
    "provider": "local",
    "lastLogin": "2026-05-01T10:35:00Z",
    "favourites": ["carId1", "carId2"],
    "createdAt": "2026-05-01T10:30:00Z",
    "updatedAt": "2026-05-01T10:35:00Z"
  }
}
```

---

### 6. Refresh Access Token
**Endpoint:** `POST /auth/refresh-token`

**Authentication:** Not required

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc..."
  }
}
```

**Error Responses:**
- `400` - Refresh token required
- `401` - Invalid or expired refresh token

---

## Cars Routes

### 1. Get All Cars
**Endpoint:** `GET /cars`

**Authentication:** Not required

**Query Parameters:**
```
page=1                  // Default: 1
limit=10                // Default: 10
category=sedan          // Optional: sedan, suv, hatchback, etc.
fuelType=petrol         // Optional: petrol, diesel, hybrid, electric
transmission=automatic  // Optional: automatic, manual
minPrice=500000         // Optional: minimum price
maxPrice=5000000        // Optional: maximum price
search=toyota          // Optional: search term
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "carId",
      "title": "Toyota Corolla 2020",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2020,
      "price": 1500000,
      "category": "sedan",
      "fuelType": "petrol",
      "transmission": "automatic",
      "color": "silver",
      "mileage": 25000,
      "description": "Well maintained car",
      "features": ["AC", "Power Steering", "ABS"],
      "images": ["https://url/image1.jpg"],
      "status": "available",
      "views": 150,
      "seller": {
        "_id": "userId",
        "name": "Ali Khan",
        "email": "ali@example.com",
        "avatarUrl": "https://url/avatar.jpg",
        "phone": "03001234567"
      },
      "createdAt": "2026-05-01T10:30:00Z",
      "updatedAt": "2026-05-01T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

### 2. Get Car by ID
**Endpoint:** `GET /cars/:id`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "carId",
    "title": "Toyota Corolla 2020",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "price": 1500000,
    "category": "sedan",
    "fuelType": "petrol",
    "transmission": "automatic",
    "color": "silver",
    "mileage": 25000,
    "description": "Well maintained car",
    "features": ["AC", "Power Steering", "ABS"],
    "images": ["https://url/image1.jpg"],
    "status": "available",
    "views": 151,
    "seller": {
      "_id": "userId",
      "name": "Ali Khan",
      "email": "ali@example.com",
      "avatarUrl": "https://url/avatar.jpg",
      "phone": "03001234567"
    },
    "createdAt": "2026-05-01T10:30:00Z",
    "updatedAt": "2026-05-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `404` - Car not found

---

### 3. Create Car
**Endpoint:** `POST /cars`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "title": "Toyota Corolla 2020",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "price": 1500000,
  "category": "sedan",
  "fuelType": "petrol",
  "transmission": "automatic",
  "color": "silver",
  "mileage": 25000,
  "description": "Well maintained car with complete service history",
  "features": ["AC", "Power Steering", "ABS", "Climate Control"],
  "images": ["https://url/image1.jpg", "https://url/image2.jpg"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Car created successfully",
  "data": {
    "_id": "carId",
    "title": "Toyota Corolla 2020",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "price": 1500000,
    "category": "sedan",
    "fuelType": "petrol",
    "transmission": "automatic",
    "color": "silver",
    "mileage": 25000,
    "description": "Well maintained car with complete service history",
    "features": ["AC", "Power Steering", "ABS", "Climate Control"],
    "images": ["https://url/image1.jpg", "https://url/image2.jpg"],
    "status": "available",
    "views": 0,
    "seller": {
      "_id": "userId",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://url/avatar.jpg",
      "phone": "03001234567"
    },
    "createdAt": "2026-05-01T10:30:00Z",
    "updatedAt": "2026-05-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields (title, brand, model, year, price)

---

### 4. Update Car
**Endpoint:** `PUT /cars/:id`

**Authentication:** Required (JWT)

**Request Body:** (Same fields as Create Car - all optional)
```json
{
  "title": "Toyota Corolla 2020 - Updated",
  "price": 1450000,
  "status": "unavailable"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Car updated successfully",
  "data": {
    "_id": "carId",
    "title": "Toyota Corolla 2020 - Updated",
    "price": 1450000,
    "status": "unavailable",
    "...": "...other fields..."
  }
}
```

**Error Responses:**
- `403` - Not authorized (can only edit own listings)
- `404` - Car not found

---

### 5. Delete Car
**Endpoint:** `DELETE /cars/:id`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Car deleted successfully"
}
```

**Error Responses:**
- `403` - Not authorized (can only delete own listings)
- `404` - Car not found

---

### 6. Get My Cars
**Endpoint:** `GET /cars/user/my-cars`

**Authentication:** Required (JWT)

**Query Parameters:**
```
status=available  // Optional: available, unavailable
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "carId",
      "title": "Toyota Corolla 2020",
      "...": "...car details..."
    }
  ],
  "count": 5
}
```

---

## Orders Routes

### 1. Get All Orders
**Endpoint:** `GET /orders`

**Authentication:** Required (JWT)

**Query Parameters:**
```
page=1           // Default: 1
limit=10         // Default: 10
status=pending   // Optional: pending, paid, completed, cancelled
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "orderId",
      "buyer": {
        "_id": "userId",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "03001234567"
      },
      "car": {
        "_id": "carId",
        "title": "Toyota Corolla 2020",
        "brand": "Toyota",
        "model": "Corolla",
        "price": 1500000,
        "images": ["https://url/image1.jpg"]
      },
      "amount": 1450000,
      "discountAmount": 50000,
      "voucherCode": "SAVE50",
      "status": "pending",
      "stripePaymentId": null,
      "createdAt": "2026-05-01T10:30:00Z",
      "updatedAt": "2026-05-01T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 2. Get Order by ID
**Endpoint:** `GET /orders/:id`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "orderId",
    "buyer": {
      "_id": "buyerId",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "03001234567"
    },
    "car": {
      "_id": "carId",
      "title": "Toyota Corolla 2020",
      "brand": "Toyota",
      "model": "Corolla",
      "price": 1500000,
      "images": ["https://url/image1.jpg"],
      "seller": {
        "_id": "sellerId",
        "name": "Ali Khan",
        "email": "ali@example.com",
        "phone": "03001234567"
      }
    },
    "amount": 1450000,
    "discountAmount": 50000,
    "voucherCode": "SAVE50",
    "status": "pending",
    "stripePaymentId": null,
    "createdAt": "2026-05-01T10:30:00Z",
    "updatedAt": "2026-05-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `403` - Not authorized to view this order
- `404` - Order not found

---

### 3. Create Order
**Endpoint:** `POST /orders`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "carId": "carId",
  "voucherCode": "SAVE50"  // Optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "orderId",
    "buyer": {
      "_id": "userId",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "03001234567"
    },
    "car": {
      "_id": "carId",
      "title": "Toyota Corolla 2020",
      "brand": "Toyota",
      "model": "Corolla",
      "price": 1500000,
      "images": ["https://url/image1.jpg"]
    },
    "amount": 1450000,
    "discountAmount": 50000,
    "voucherCode": "SAVE50",
    "status": "pending",
    "stripePaymentId": null,
    "createdAt": "2026-05-01T10:30:00Z",
    "updatedAt": "2026-05-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Car ID required / Car not available / Cannot order own car / Invalid voucher
- `404` - Car not found

---

### 4. Update Order
**Endpoint:** `PUT /orders/:id`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "status": "completed"  // pending, paid, completed, cancelled
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "_id": "orderId",
    "status": "completed",
    "...": "...order details..."
  }
}
```

---

### 5. Delete Order
**Endpoint:** `DELETE /orders/:id`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

---

## Payment Routes

### 1. Create Payment Intent
**Endpoint:** `POST /payment/create-intent`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "orderId": "orderId"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 1450000,
    "currency": "pkr"
  }
}
```

**Error Responses:**
- `400` - Order ID required / Order not in pending status
- `404` - Order not found

---

### 2. Confirm Payment
**Endpoint:** `POST /payment/confirm`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "orderId": "orderId",
  "paymentIntentId": "pi_xxx"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "_id": "orderId",
    "status": "paid",
    "stripePaymentId": "pi_xxx",
    "...": "...order details..."
  }
}
```

---

### 3. Get Transactions
**Endpoint:** `GET /payment/transactions`

**Authentication:** Required (JWT)

**Query Parameters:**
```
page=1           // Default: 1
limit=10         // Default: 10
status=paid      // Optional: pending, paid, failed
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "transactionId",
      "orderId": "orderId",
      "userId": "userId",
      "amount": 1450000,
      "status": "paid",
      "stripePaymentId": "pi_xxx",
      "createdAt": "2026-05-01T10:35:00Z",
      "updatedAt": "2026-05-01T10:35:00Z"
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

### 4. Stripe Webhook
**Endpoint:** `POST /payment/webhook`

**Authentication:** Not required (Stripe signature verification)

**Description:** Automatically handles Stripe events:
- `payment_intent.succeeded` - Updates order status to "paid"
- Other events handled accordingly

---

## User Routes

### 1. Get Profile
**Endpoint:** `GET /user/profile`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "03001234567",
    "avatarUrl": "https://url/avatar.jpg",
    "provider": "local",
    "lastLogin": "2026-05-01T10:35:00Z",
    "favourites": [
      {
        "_id": "carId1",
        "name": "Toyota Corolla",
        "images": ["https://url/image.jpg"],
        "price": 1500000
      }
    ],
    "createdAt": "2026-05-01T10:30:00Z",
    "updatedAt": "2026-05-01T10:30:00Z"
  }
}
```

---

### 2. Update Profile
**Endpoint:** `PUT /user/profile`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "03009876543",
  "avatarUrl": "https://new-url/avatar.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "userId",
    "name": "John Doe Updated",
    "phone": "03009876543",
    "avatarUrl": "https://new-url/avatar.jpg",
    "...": "...other user fields..."
  }
}
```

**Error Responses:**
- `400` - At least one field required to update
- `404` - User not found

---

### 3. Delete User Account
**Endpoint:** `DELETE /user/:id`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

**Error Responses:**
- `403` - Can only delete own account
- `404` - User not found

---

### 4. Get Favorites
**Endpoint:** `GET /user/favorites`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "carId1",
      "name": "Toyota Corolla",
      "images": ["https://url/image1.jpg"],
      "price": 1500000,
      "description": "Well maintained",
      "seatsCount": 5,
      "fuelType": "petrol",
      "transmission": "automatic"
    }
  ],
  "count": 5
}
```

---

### 5. Add to Favorites
**Endpoint:** `POST /user/favorites/:carId`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Car added to favorites",
  "data": [
    {
      "_id": "carId1",
      "name": "Toyota Corolla",
      "images": ["https://url/image.jpg"],
      "price": 1500000
    }
  ]
}
```

**Error Responses:**
- `404` - Car not found / User not found

---

### 6. Remove from Favorites
**Endpoint:** `DELETE /user/favorites/:carId`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Car removed from favorites",
  "data": [
    {
      "_id": "carId2",
      "name": "Honda Civic",
      "images": ["https://url/image.jpg"],
      "price": 1200000
    }
  ]
}
```

---

## Voucher Routes

### 1. Get All Vouchers
**Endpoint:** `GET /vouchers`

**Authentication:** Not required

**Query Parameters:**
```
page=1           // Default: 1
limit=10         // Default: 10
isActive=true    // Optional: true, false
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "voucherId",
      "code": "SAVE50",
      "discountType": "flat",
      "discountValue": 50000,
      "minOrderAmount": 500000,
      "maxDiscountCap": 100000,
      "usageLimit": 100,
      "usedCount": 25,
      "isActive": true,
      "expiresAt": "2026-12-31T23:59:59Z",
      "createdAt": "2026-05-01T10:30:00Z",
      "updatedAt": "2026-05-01T10:30:00Z"
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

### 2. Validate Voucher
**Endpoint:** `POST /vouchers/validate`

**Authentication:** Not required

**Request Body:**
```json
{
  "code": "SAVE50",
  "orderAmount": 1500000
}
```

**Success Response (200):**
```json
{
  "success": true,
  "valid": true,
  "data": {
    "code": "SAVE50",
    "discountType": "flat",
    "discountValue": 50000,
    "originalAmount": 1500000,
    "discountAmount": 50000,
    "finalAmount": 1450000,
    "message": "Voucher applied! You save 50000"
  }
}
```

**Error Responses:**
- `400` - Code and orderAmount required / Invalid voucher / Voucher expired / Usage limit reached / Minimum order amount not met

---

### 3. Create Voucher (Admin)
**Endpoint:** `POST /vouchers`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "code": "SAVE50",
  "discountType": "flat",
  "discountValue": 50000,
  "minOrderAmount": 500000,
  "maxDiscountCap": 100000,
  "expiresAt": "2026-12-31T23:59:59Z",
  "usageLimit": 100
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Voucher created successfully",
  "data": {
    "_id": "voucherId",
    "code": "SAVE50",
    "discountType": "flat",
    "discountValue": 50000,
    "minOrderAmount": 500000,
    "maxDiscountCap": 100000,
    "usageLimit": 100,
    "usedCount": 0,
    "isActive": true,
    "expiresAt": "2026-12-31T23:59:59Z",
    "createdAt": "2026-05-01T10:30:00Z",
    "updatedAt": "2026-05-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Required fields missing / Invalid discountType
- `409` - Voucher code already exists

---

### 4. Deactivate Voucher (Admin)
**Endpoint:** `PATCH /vouchers/:id/deactivate`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voucher deactivated successfully",
  "data": {
    "_id": "voucherId",
    "code": "SAVE50",
    "isActive": false,
    "...": "...other fields..."
  }
}
```

---

### 5. Delete Voucher (Admin)
**Endpoint:** `DELETE /vouchers/:id`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voucher deleted successfully"
}
```

**Error Responses:**
- `404` - Voucher not found

---

## Error Handling

All endpoints follow this error response format:

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Authentication Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Extracting from response:**
- `token` - Access token (short-lived, ~24 hours)
- `refreshToken` - Refresh token (long-lived, ~7 days)

**Token Refresh:**
When access token expires, use the refresh token to get a new access token via `/auth/refresh-token` endpoint.

---

## Notes for Frontend Developers

1. **Image Uploads:** Profile pictures are uploaded to Cloudinary. Use multipart/form-data for file uploads.
2. **Pagination:** All list endpoints support pagination with `page` and `limit` query parameters.
3. **Filters:** Use appropriate query parameters for filtering results (e.g., category, fuelType for cars).
4. **JWT Tokens:** Always include the JWT token in the Authorization header for protected routes.
5. **Error Handling:** Check the `success` field in all responses. If false, read the `error` field for details.
6. **Currency:** All prices are in PKR (Pakistani Rupees).
7. **Timestamps:** All dates are in ISO 8601 format (UTC).
8. **Car Status:** Cars can have status: "available", "unavailable", "sold"
9. **Order Status:** Orders can have status: "pending", "paid", "completed", "cancelled"
10. **Voucher Types:** Discount types are "percentage" or "flat"

---

**Last Updated:** May 1, 2026
