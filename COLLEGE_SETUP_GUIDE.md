# College Management System - Setup Guide

## ✅ Completed So Far

### 1. Cloudinary Packages Installed
```bash
✓ cloudinary
✓ next-cloudinary
```

### 2. Database Schema Created
SQL migration file: `database/setup_college_management.sql`

**Tables:**
- ✅ Updated `colleges` table with new columns
- ✅ Created `college_images` table for multiple photos
- ✅ Created `college_videos` table for videos
- ✅ Added RLS policies for security

### 3. Cloudinary Utility Module
File: `src/lib/cloudinary.ts`

**Functions:**
- `uploadImage()` - Upload and optimize images
- `uploadVideo()` - Upload videos with transcoding
- `uploadDocument()` - Upload PDF brochures
- `deleteAsset()` - Delete files from Cloudinary
- `getOptimizedImageUrl()` - Get responsive image URLs
- `getVideoUrl()` - Get video streaming URLs

### 4. Server Actions
File: `src/app/actions/colleges.ts`

**Implemented:**
- ✅ `getStates()` - Fetch all states
- ✅ `getCitiesByState()` - Fetch cities by state
- ✅ `getUniversitiesByCity()` - Fetch universities by city
- ✅ `getAllColleges()` - Fetch all colleges with relations
- ✅ `getCollegeById()` - Get college with images/videos
- ✅ `createCollege()` - Create new college
- ✅ `updateCollege()` - Update college info
- ✅ `deleteCollege()` - Delete college + cleanup Cloudinary
- ✅ `addCollegeImage()` - Upload image to Cloudinary
- ✅ `deleteCollegeImage()` - Remove image
- ✅ `addCollegeVideo()` - Upload video or add URL
- ✅ `deleteCollegeVideo()` - Remove video
- ✅ `uploadBrochure()` - Upload PDF brochure

---

## 🔧 Setup Required

### Step 1: Run Database Migration

1. Open Supabase SQL Editor
2. Copy contents from `database/setup_college_management.sql`
3. Run the SQL script
4. Verify tables are created

### Step 2: Set Up Cloudinary Account

1. **Create Account**: Go to [cloudinary.com](https://cloudinary.com) and sign up (free tier available)
2. **Get Credentials**: From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

3. **Create Upload Preset** (Optional but recommended):
   - Go to Settings → Upload
   - Create unsigned upload preset
   - Name it: `college_uploads`
   - Set folder: `colleges`

### Step 3: Add Environment Variables

Add to your `.env.local`:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important**: Replace `your_cloud_name_here`, `your_api_key_here`, and `your_api_secret_here` with your actual Cloudinary credentials.

---

## 📋 Next Steps

### UI Components to Build:
1. **AddCollegeModal** - Multi-step form for adding colleges
2. **CollegeManagementClient** - List and manage colleges
3. **Admin Dashboard Integration** - Add college management section

### Features:
- Drag-and-drop file upload
- Image preview before upload
- Video URL validation
- PDF upload with progress
- Edit/Delete colleges
- Search and filters

---

## 🎯 College Data Structure

### Basic Information
- Name (required)
- University (required)
- Specialization
- Contact Email
- Contact Phone
- Website URL

### Descriptions
- Short Description (max 150 chars)
- Long Description (detailed info)

### Media
- Multiple Photos (Cloudinary)
- Multiple Videos (Cloudinary or YouTube/Vimeo URLs)
- Brochure PDF (Cloudinary)

---

## 🔐 Security

- ✅ RLS policies on all tables
- ✅ Server-side Cloudinary operations
- ✅ API keys never exposed to client
- ✅ Authenticated user checks
- ✅ Cascade delete for cleanup

---

## 📝 Usage Example

```typescript
// Create a college
const result = await createCollege({
  name: "Example College",
  university_id: "uuid-here",
  specialization: "Engineering",
  short_description: "Top engineering college",
  long_description: "Detailed description...",
  contact_email: "info@example.edu",
  contact_phone: "+91 1234567890",
  website_url: "https://example.edu"
});

// Upload an image
const imageResult = await addCollegeImage(
  collegeId,
  base64ImageData,
  "Campus view"
);

// Upload brochure
const brochureResult = await uploadBrochure(
  collegeId,
  base64PdfData
);
```

---

## ⚠️ Important Notes

1. **File Size Limits**:
   - Images: Recommended max 5MB
   - Videos: Recommended max 100MB
   - PDFs: Recommended max 10MB

2. **Cloudinary Free Tier**:
   - 25GB storage
   - 25GB bandwidth/month
   - Should be sufficient for testing

3. **Image Optimization**:
   - Auto-compressed by Cloudinary
   - Responsive sizes generated
   - WebP format for modern browsers

4. **Video Processing**:
   - Auto-transcoding
   - Multiple quality options
   - Adaptive streaming

---

## 🚀 Ready to Continue?

Once you've:
1. ✅ Run the database migration
2. ✅ Set up Cloudinary account
3. ✅ Added environment variables

We can proceed to build the UI components!
