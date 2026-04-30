# Upload System Documentation - Cloudinary & Multer

## Overview
This upload system provides file upload and management capabilities using **Cloudinary** for storage and **Multer** for handling multipart form data.

## Files Structure
```
server/src/
├── config/
│   └── upload.js           # Multer + Cloudinary configuration
├── utils/
│   └── uploadService.js    # Cloudinary helper functions
└── middleware/
    └── upload.js           # Error handling middleware
```

---

## Configuration

### 1. Environment Variables
Add these to your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get these from: https://cloudinary.com/console

### 2. File Size & Type Limits
- **Max file size**: 5MB
- **Allowed formats**: JPEG, PNG, GIF, WebP
- **Error handling**: Built-in validation

---

## Cloudinary Upload Service (`uploadService.js`)

### Functions Available

#### 1. `uploadFile(filePath, folder, filename)`
Upload a single file to Cloudinary.

**Parameters:**
- `filePath` (string): Local file path or buffer
- `folder` (string): Cloudinary folder (default: 'caryuk/uploads')
- `filename` (string): Public ID (optional)

**Returns:**
```javascript
{
  success: true,
  url: 'https://res.cloudinary.com/...',
  public_id: 'caryuk/path/filename',
  width: 400,
  height: 300,
  size: 12345
}
```

**Example:**
```javascript
const result = await uploadService.uploadFile(
  '/local/path/image.jpg',
  'caryuk/cars',
  'car_1'
);
```

---

#### 2. `uploadMultipleFiles(files, folder)`
Upload multiple files at once.

**Parameters:**
- `files` (array): Array of file paths/buffers
- `folder` (string): Cloudinary folder

**Returns:**
```javascript
{
  success: true,
  uploads: [ {...}, {...} ],
  failed: 0
}
```

---

#### 3. `deleteFile(public_id)`
Delete a file from Cloudinary.

**Parameters:**
- `public_id` (string): Cloudinary public ID

**Returns:**
```javascript
{
  success: true,
  message: 'File deleted successfully',
  public_id: 'caryuk/path/filename'
}
```

**Example:**
```javascript
const result = await uploadService.deleteFile('caryuk/cars/car_1');
```

---

#### 4. `deleteMultipleFiles(public_ids)`
Delete multiple files at once.

**Parameters:**
- `public_ids` (array): Array of public IDs

**Returns:**
```javascript
{
  success: true,
  deleted: 2,
  failed: 0,
  results: [ {...}, {...} ]
}
```

---

#### 5. `getFileInfo(public_id)`
Retrieve file metadata from Cloudinary.

**Returns:**
```javascript
{
  success: true,
  data: {
    public_id: 'caryuk/path/filename',
    url: 'https://...',
    width: 400,
    height: 300,
    size: 12345,
    created_at: '2024-01-01T00:00:00Z',
    format: 'jpg'
  }
}
```

---

#### 6. `getOptimizedImageUrl(public_id, options)`
Generate an optimized image URL with transformations.

**Parameters:**
- `public_id` (string): Cloudinary public ID
- `options` (object): Transformation options

**Example:**
```javascript
const url = uploadService.getOptimizedImageUrl('caryuk/cars/car_1', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto'
});
```

**Common Transformations:**
```javascript
{
  width: 400,           // Width in pixels
  height: 300,          // Height in pixels
  crop: 'fill',         // fill, fit, thumb, pad
  gravity: 'face',      // face, auto, center
  quality: 'auto',      // auto, 80, 90, 100
  fetch_format: 'auto'  // auto, jpg, png, webp
}
```

---

#### 7. `getThumbnailUrl(public_id)`
Get a thumbnail URL (200x200).

**Example:**
```javascript
const thumbUrl = uploadService.getThumbnailUrl('caryuk/cars/car_1');
```

---

#### 8. `getPublicIdFromUrl(url)`
Extract public ID from a Cloudinary URL.

**Example:**
```javascript
const publicId = uploadService.getPublicIdFromUrl(
  'https://res.cloudinary.com/cloud/image/upload/v123/caryuk/cars/car_1.jpg'
);
// Returns: 'caryuk/cars/car_1'
```

---

## Multer Configuration (`config/upload.js`)

### Setup

```javascript
const { upload, cloudinary, setUploadType } = require('../config/upload');
const uploadErrorHandler = require('../middleware/upload');
```

### Middleware Options

#### Single File Upload
```javascript
router.post('/upload', upload.single('file'), controller);
```

#### Multiple Files Upload
```javascript
router.post('/upload', upload.array('files', 10), controller);
```

#### Set Upload Type
```javascript
router.post(
  '/upload',
  setUploadType('profile'),  // or 'car'
  upload.single('image'),
  controller
);
```

**Upload Types (folders):**
- `'profile'` → `caryuk/profiles`
- `'car'` → `caryuk/cars`
- Default → `caryuk/uploads`

### Error Handling

Always add error handler after upload middleware:

```javascript
router.post(
  '/upload',
  upload.single('image'),
  controller,
  uploadErrorHandler
);
```

---

## Real-World Examples

### Example 1: Upload User Profile Image

**Route Setup:**
```javascript
const { upload, setUploadType } = require('../config/upload');
const uploadErrorHandler = require('../middleware/upload');

router.post(
  '/profile-image',
  verifyJWT,
  setUploadType('profile'),
  upload.single('profileImage'),
  userController.uploadProfileImage,
  uploadErrorHandler
);
```

**Controller:**
```javascript
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Delete old image
    const user = await User.findById(req.user.id);
    if (user?.avatarUrl) {
      const oldPublicId = uploadService.getPublicIdFromUrl(user.avatarUrl);
      if (oldPublicId) {
        await uploadService.deleteFile(oldPublicId);
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl: req.file.path },
      { new: true }
    );

    res.json({
      success: true,
      url: req.file.path,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
```

**Frontend Usage (React Native):**
```javascript
const uploadProfileImage = async (imageUri, token) => {
  const formData = new FormData();
  formData.append('profileImage', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'profile.jpg'
  });

  const response = await fetch(
    'http://localhost:5000/api/user/profile-image',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );
  return response.json();
};
```

---

### Example 2: Upload Car Images

**Route Setup:**
```javascript
router.post(
  '/:id/images',
  setUploadType('car'),
  upload.array('carImages', 10),
  carsController.uploadCarImages,
  uploadErrorHandler
);

router.delete(
  '/:id/images/:imageIndex',
  carsController.deleteCarImage
);
```

**Controller:**
```javascript
const uploadCarImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files' });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      // Clean up if car doesn't exist
      for (const file of req.files) {
        await uploadService.deleteFile(file.filename);
      }
      return res.status(404).json({ error: 'Car not found' });
    }

    // Add images
    const urls = req.files.map(f => f.path);
    car.images.push(...urls);
    await car.save();

    res.json({
      success: true,
      urls: urls,
      car: car
    });
  } catch (error) {
    next(error);
  }
};
```

---

## Common Use Cases

### 1. Replace Old Image
```javascript
// Delete old
if (user.avatarUrl) {
  const publicId = uploadService.getPublicIdFromUrl(user.avatarUrl);
  await uploadService.deleteFile(publicId);
}

// Upload new
// File is now stored in req.file.path
user.avatarUrl = req.file.path;
await user.save();
```

### 2. Get Responsive Images
```javascript
// Get different sizes of same image
const full = uploadService.getOptimizedImageUrl(publicId, {
  width: 800, height: 600, crop: 'fill'
});

const medium = uploadService.getOptimizedImageUrl(publicId, {
  width: 500, height: 400, crop: 'fill'
});

const thumb = uploadService.getThumbnailUrl(publicId);
```

### 3. Bulk Delete
```javascript
const publicIds = cars.flatMap(car => 
  car.images.map(url => uploadService.getPublicIdFromUrl(url))
);

await uploadService.deleteMultipleFiles(publicIds);
```

---

## Error Handling

Built-in error messages:
- `"File too large. Maximum size is 5MB."`
- `"Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."`
- `"No file uploaded"`
- `"Failed to delete file"`

Always use the error handler middleware to catch these automatically.

---

## Best Practices

1. ✅ Always use `uploadErrorHandler` middleware
2. ✅ Delete old images before uploading new ones
3. ✅ Validate file existence before operations
4. ✅ Use `setUploadType()` to organize files
5. ✅ Extract `public_id` from URLs for deletions
6. ✅ Use optimized URLs for different screen sizes
7. ✅ Handle promise rejections in batch operations

---

## Troubleshooting

**Issue:** "Cloudinary credentials not found"
- Check `.env` file has all three credentials
- Verify values are correct from Cloudinary dashboard

**Issue:** "File too large"
- Change `fileSize` limit in `config/upload.js`
- Note: Cloudinary free tier has 125MB storage

**Issue:** "Upload returns null"
- Check MIME type is valid
- Ensure `setUploadType()` is called before upload
- Verify Cloudinary folder exists

---

## See Also
- [UPLOAD_EXAMPLES.js](./UPLOAD_EXAMPLES.js) - Full code examples
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Multer Docs](https://github.com/expressjs/multer)
