# Upload System - Quick Reference

## 🚀 Quick Start

### 1. Add to your .env
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Import what you need
```javascript
const { upload, setUploadType } = require('../config/upload');
const uploadService = require('../utils/uploadService');
const uploadErrorHandler = require('../middleware/upload');
```

### 3. Add route with upload
```javascript
router.post(
  '/upload',
  setUploadType('car'),           // or 'profile'
  upload.single('image'),         // single or array
  controller.uploadFunction,
  uploadErrorHandler              // MUST be last!
);
```

---

## 📁 uploadService Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `uploadFile(path, folder, name)` | Upload single file | `{ url, public_id, ... }` |
| `uploadMultipleFiles(paths, folder)` | Upload many files | `{ uploads: [...], failed }` |
| `deleteFile(public_id)` | Delete from Cloudinary | `{ success, message }` |
| `deleteMultipleFiles(ids)` | Delete many files | `{ deleted, failed }` |
| `getFileInfo(public_id)` | Get file metadata | `{ data: {...} }` |
| `getOptimizedImageUrl(id, options)` | Get optimized URL | URL string |
| `getThumbnailUrl(public_id)` | Get 200x200 thumb | URL string |
| `getPublicIdFromUrl(url)` | Extract ID from URL | Public ID string |

---

## 🎯 Common Patterns

### Upload Profile Image
```javascript
// Route
router.post('/profile', setUploadType('profile'), upload.single('image'), controller);

// Controller
const user = await User.findByIdAndUpdate(req.user.id, {
  avatarUrl: req.file.path
}, { new: true });
```

### Upload Multiple Car Images
```javascript
// Route
router.post('/:id/images', setUploadType('car'), upload.array('images', 10), controller);

// Controller
const car = await Car.findById(req.params.id);
car.images.push(...req.files.map(f => f.path));
await car.save();
```

### Delete Image
```javascript
const publicId = uploadService.getPublicIdFromUrl(imageUrl);
await uploadService.deleteFile(publicId);
```

### Get Thumbnail
```javascript
const thumbUrl = uploadService.getThumbnailUrl('caryuk/cars/car_123');
```

---

## 📤 Frontend Upload (React Native Example)

```javascript
// Single file
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'photo.jpg'
});

const response = await fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData,
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## ⚙️ Configuration

| Setting | Value |
|---------|-------|
| Max File Size | 5MB |
| Allowed Types | JPEG, PNG, GIF, WebP |
| Folders | profile, car, uploads |
| Upload Type | Set via `setUploadType()` |

---

## ❌ Error Handling

```javascript
// Automatically handled by middleware
router.post(
  '/upload',
  upload.single('file'),
  controller,
  uploadErrorHandler  // ← Catches all errors
);
```

Errors returned:
- File too large
- Invalid file type
- No file uploaded
- Cloudinary errors

---

## 📝 File Structure

```
config/upload.js       - Multer + Cloudinary config
utils/uploadService.js - Helper functions (upload/delete)
middleware/upload.js   - Error handling
UPLOAD_EXAMPLES.js     - Code examples
UPLOAD_SYSTEM_DOCS.md  - Full documentation
```

---

## 🔗 Useful Links

- **Get Cloudinary Account**: https://cloudinary.com
- **Multer Docs**: https://github.com/expressjs/multer
- **Full Documentation**: See UPLOAD_SYSTEM_DOCS.md

---

## 💡 Tips

✅ Always delete old image before uploading new one
✅ Use `setUploadType()` to organize files in folders
✅ Extract public_id from URL using `getPublicIdFromUrl()`
✅ Use `getThumbnailUrl()` for list views
✅ Use `getOptimizedImageUrl()` for different sizes
✅ Error handler middleware MUST be last in chain
