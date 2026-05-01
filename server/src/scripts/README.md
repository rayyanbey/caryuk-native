# Database Seeding Scripts

This directory contains scripts to manage test data for the Caryuk database.

## 📋 Available Scripts

### 1. Seed Database
Seeds the database with realistic test data across all models with proper relationships.

```bash
npm run seed
```

**What gets seeded:**
- **6 Users** (3 sellers, 3 buyers) with realistic names and contact info
- **6 Cars** linked to sellers with varied brands, models, prices, and features
- **5 Vouchers** with percentage and flat discount types
- **6 Orders** linking buyers to cars with optional vouchers
- **8 Notifications** linked to users with various notification types

### 2. Clear Database
Deletes all data from the database without seeding new data.

```bash
npm run clear
```

**Clears:**
- All Users
- All Cars
- All Orders
- All Vouchers
- All Notifications

---

## 🔗 Data Relationships

### Users (6 total)
- **Sellers (3):** Ahmed Hassan, Fatima Ali, Muhammad Khan
  - Used as `seller` reference in Car documents
- **Buyers (3):** Ayesha Ahmed, Hassan Khan, Zainab Malik
  - Used as `buyer` reference in Order documents

### Cars (6 total)
- **Ahmed's Cars (2):**
  - Honda Civic 2022 - 2.5M PKR
  - Toyota Corolla 2020 - 1.8M PKR

- **Fatima's Cars (2):**
  - Suzuki Alto 2019 - 1.2M PKR
  - Hyundai Tucson 2021 - 3.2M PKR

- **Muhammad's Cars (2):**
  - Toyota Fortuner 2023 - 4.5M PKR
  - Nissan Qashqai 2018 - 2.8M PKR

**All cars linked to their sellers via `seller` ObjectId**

### Vouchers (5 total)

| Code | Type | Value | Min Amount | Max Cap | Usage |
|------|------|-------|------------|---------|-------|
| SAVE10 | Percentage | 10% | 500K | None | 100x |
| FLAT500 | Flat | 500K | 2M | 500K | 50x |
| WELCOME15 | Percentage | 15% | 1M | 300K | 200x |
| SUMMER20 | Percentage | 20% | 1.5M | 400K | 75x |
| FLAT1000 | Flat | 1M | 3M | None | 30x |

### Orders (6 total)

| Order | Buyer | Car | Voucher | Amount | Status |
|-------|-------|-----|---------|--------|--------|
| 1 | Ayesha | Honda Civic | - | 2.5M | Paid |
| 2 | Hassan | Suzuki Alto | SAVE10 | 1.08M | Paid |
| 3 | Zainab | Hyundai Tucson | WELCOME15 | 3.04M | Paid |
| 4 | Ayesha | Toyota Corolla | - | 1.8M | Pending |
| 5 | Hassan | Toyota Fortuner | SUMMER20 | 4.05M | Cancelled |
| 6 | Zainab | Nissan Qashqai | - | 2.8M | Pending |

**All orders linked to:**
- `buyer` (User reference)
- `car` (Car reference)
- `voucherCode` (optional, string reference)

### Notifications (8 total)

- **Type: order_update** (3)
  - Order confirmations, payment updates, new orders on listings
- **Type: new_listing** (1)
  - Matching interest alerts
- **Type: price_drop** (1)
  - Price reduction alerts
- **Type: promo** (1)
  - Promotional offers
- **Type: system** (2)
  - Welcome messages, maintenance notices

**All notifications linked to `userId` (User reference)**

---

## 🚀 Quick Start

### First time setup:
```bash
npm run seed
```

### Reset database (clear + reseed):
```bash
npm run clear && npm run seed
```

### Just clear without reseeding:
```bash
npm run clear
```

---

## 📧 Test Credentials

Use any of these emails with password `password123` to test login:

**Sellers:**
- ahmed@example.com
- fatima@example.com
- khan@example.com

**Buyers:**
- ayesha@example.com
- hassan@example.com
- zainab@example.com

---

## 🛠️ Script Details

### `seed.js`
Main seeding script that:
1. Connects to MongoDB
2. Clears all collections
3. Seeds users in dependency order
4. Seeds cars linked to sellers
5. Seeds vouchers
6. Seeds orders linked to buyers, cars, and vouchers
7. Seeds notifications linked to users

**Run time:** ~2-5 seconds

### `clear.js`
Database cleanup script that:
1. Connects to MongoDB
2. Deletes all documents from each collection
3. Reports deletion counts

**Run time:** ~1-2 seconds

---

## ⚠️ Important Notes

- Scripts use `MONGO_URI` from `.env` file
- All passwords are hashed before storage (via pre-save hook)
- Timestamps (`createdAt`, `updatedAt`) are auto-generated
- Car `status` defaults to 'available'
- Voucher `expiresAt` is set to 30 days from seed date
- Order `status` varies for testing different scenarios

---

## 🐛 Troubleshooting

**Connection Error:**
- Ensure `.env` has valid `MONGO_URI`
- Check MongoDB connection string and credentials
- Verify VPN/firewall if using MongoDB Atlas

**Models not found:**
- Verify model files exist in `/src/models/`
- Check model requires/exports are correct

**Script hangs:**
- May indicate connection timeout
- Check MongoDB is running and accessible
- Increase `serverSelectionTimeoutMS` in script if needed

---

## 📊 Database Schema Validation

Seeds include validation for:
- Unique email addresses (User model)
- Valid enum values (category, fuelType, transmission, etc.)
- Required fields (all populated)
- Reference integrity (all ObjectIds valid)
- Price constraints (positive numbers)

