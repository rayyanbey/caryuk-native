# Authentication System Documentation

## Overview
Complete authentication system supporting:
- ✅ Email/Password (Signup & Login)
- ✅ Google OAuth
- ✅ JWT Token-based Authorization
- ✅ Password Management

---

## Setup Instructions

### 1. Environment Variables
Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend
CLIENT_URL=http://localhost:3000
```

### 2. Get OAuth Credentials

#### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs

---

## API Endpoints

### Email/Password Authentication

#### 1. Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "provider": "local",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** Same as signup

---

### OAuth Authentication

#### 3. Google Login
```http
GET /api/auth/google
```
User is redirected to Google login, then redirected back to callback URL with tokens.

---

### Protected Routes (Require JWT Token)

#### 4. Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "local",
    "avatarUrl": "https://...",
    "phone": "+1234567890",
    "lastLogin": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 5. Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 6. Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+9876543210"
}
```

**Response:** Updated user object

#### 7. Change Password
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "CurrentPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### 8. Refresh Access Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token"
  }
}
```

---

## Frontend Integration

### React Native (Expo) - Email/Password Example

```javascript
import * as SecureStore from 'expo-secure-store';

const signup = async (name, email, password, confirmPassword) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store tokens securely
      await SecureStore.setItemAsync('token', data.data.token);
      await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
      return data.data.user;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      await SecureStore.setItemAsync('token', data.data.token);
      await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
      return data.data.user;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

const logout = async () => {
  try {
    const token = await SecureStore.getItemAsync('token');
    
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Remove tokens
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const getCurrentUser = async () => {
  try {
    const token = await SecureStore.getItemAsync('token');
    
    const response = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get user failed:', error);
  }
};
```

### React Native - Google OAuth Example

```javascript
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';

const handleGoogleSignIn = async () => {
  const authURL = 'http://localhost:5000/api/auth/google';
  await Linking.openURL(authURL);
};

// Handle redirect in _layout.tsx
const handleDeepLink = ({ url }) => {
  const parsedUrl = new URL(url);
  const token = parsedUrl.searchParams.get('token');
  const refreshToken = parsedUrl.searchParams.get('refreshToken');

  if (token && refreshToken) {
    SecureStore.setItemAsync('token', token);
    SecureStore.setItemAsync('refreshToken', refreshToken);
    navigation.navigate('(tabs)'); // Navigate to home
  }
};
```

### Make Authenticated Requests

```javascript
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = await SecureStore.getItemAsync('token');
  
  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// Usage
const user = await makeAuthenticatedRequest('/api/auth/me');
```

---

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `User already exists` | Email registered | Try login or password reset |
| `Invalid email or password` | Wrong credentials | Check email/password |
| `All fields are required` | Missing fields | Fill all required fields |
| `Passwords do not match` | Password mismatch | Confirm passwords match |
| `No token provided` | Missing JWT | Include Authorization header |
| `Invalid token` | Expired or malformed | Refresh token or login again |
| `User not found` | Invalid user ID | Check user exists |

---

## Token Management

### Access Token (JWT)
- **Expiry:** 7 days (configurable via JWT_EXPIRE)
- **Usage:** Include in Authorization header
- **Format:** `Authorization: Bearer {token}`

### Refresh Token
- **Expiry:** 30 days
- **Usage:** Get new access token
- **Endpoint:** `POST /api/auth/refresh-token`

### Token Refresh Flow
```javascript
const refreshToken = async () => {
  const oldRefreshToken = await SecureStore.getItemAsync('refreshToken');
  
  const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: oldRefreshToken })
  });

  const data = await response.json();
  
  if (data.success) {
    await SecureStore.setItemAsync('token', data.data.token);
    return true;
  }
  
  // If refresh fails, logout user
  logout();
  return false;
};
```

---

## User Schema

```javascript
{
  name: String,              // User's full name
  email: String,             // Unique email
  password: String,          // Hashed (null for OAuth users)
  avatarUrl: String,         // Profile picture URL
  phone: String,             // Optional phone number
  provider: String,          // 'local', 'google', 'facebook', 'twitter'
  providerId: String,        // OAuth provider's user ID
  favourites: [ObjectId],    // Array of Car IDs
  expoPushToken: String,     // For push notifications
  isActive: Boolean,         // Account status
  lastLogin: Date,           // Last login timestamp
  createdAt: Date,           // Account creation date
  updatedAt: Date            // Last profile update
}
```

---

## Passport Strategies

### Available Strategies
1. **Local** - Email/password
2. **Google** - OAuth 2.0

### How It Works
1. User initiates login
2. Passport redirects to provider
3. Provider authenticates user
4. Provider redirects back with user data
5. Backend creates/updates user
6. Backend generates JWT tokens
7. Frontend redirected to success page with tokens

---

## Security Best Practices

✅ Passwords hashed with bcryptjs (12 rounds)
✅ JWT tokens signed with secret
✅ Tokens expire after 7 days
✅ Refresh tokens expire after 30 days
✅ No passwords in API responses
✅ HTTPS recommended for production
✅ Secure storage for tokens (SecureStore in React Native)
✅ CORS configured properly

---

## Testing

### Test Email/Password Flow
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123","confirmPassword":"Test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Get Current User (replace TOKEN)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## Troubleshooting

**OAuth not working?**
- Verify credentials in .env
- Check callback URLs match in provider settings
- Ensure CLIENT_URL is correct

**Token expired?**
- Use refresh token endpoint to get new access token
- Or prompt user to login again

**Password verification fails?**
- Ensure password is hashed before storage
- Check bcrypt configuration (12 salt rounds)

---

## File Structure

```
server/src/
├── config/
│   └── passport.js         # Passport strategies
├── controllers/
│   └── auth.controller.js  # Auth functions
├── middleware/
│   └── verifyJWT.js        # JWT verification
├── models/
│   └── user.model.js       # User schema
├── routes/
│   └── auth.routes.js      # Auth endpoints
└── utils/
    └── authService.js      # Helper functions
```

---

## What's Next?

1. Implement email verification for signups
2. Add password reset functionality
3. Add two-factor authentication (2FA)
4. Implement token blacklist for logout
5. Add role-based access control (RBAC)
6. Rate limiting on auth endpoints
