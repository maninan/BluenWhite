# 🖼️ IMAGE MANAGEMENT GUIDE

## Overview

Your website now has a clean image management system with placeholders ready for your actual product photos.

---

## Directory Structure

```
BluenWhite/
└── images/
    └── products/
        ├── placeholder.svg ← Generic placeholder
        ├── e3-orbit-cabin.svg ← E3 Model
        ├── e5-nova-pod.svg ← E5 Model
        ├── e7-stellar-lodge.svg ← E7 Model
        ├── f5-dune-pod.svg ← F5 Model
        ├── f7-ridge-cabin.svg ← F7 Model
        ├── h3-steam-pod.svg ← H3 Model (Wellness)
        ├── h7-meadow-pod.svg ← H7 Model (Hospitality)
        ├── n7-forest-cabin.svg ← N7 Model (Nature)
        └── zenith-twin.svg ← Zenith Twin (Double)
```

---

## Current Placeholder Images

Each placeholder shows:
- Model name and code (E3, E5, etc.)
- Product type/category
- Unique gradient color for visual differentiation
- Professional layout

---

## How to Replace Images

### Option 1: Using Admin Dashboard (Easiest)

1. Open `admin.html` in browser
2. Login with admin credentials
3. Go to "Products" tab
4. Click "+ Add Product" or edit existing
5. In "Image URL" field, enter path or URL:
   - Local: `/images/products/e3-orbit-cabin.jpg`
   - External: `https://example.com/product-e3.jpg`
6. Click "Save Product"

### Option 2: Direct File Replacement

1. Export your images as files
2. Place in `/images/products/` directory
3. Update database image URLs:
   ```bash
   sqlite3 database.sqlite
   UPDATE products SET img = '/images/products/e3-orbit-cabin.jpg' WHERE key = 'e3';
   ```

### Option 3: Edit Database + Admin Interface

1. Add images to `/images/products/` folder
2. Use Admin Dashboard to update image paths
3. This is the recommended approach

---

## Image Specifications

### Recommended Format

| Spec | Value |
|------|-------|
| **Format** | JPG, PNG, or WebP |
| **Size** | 600x600px minimum |
| **Aspect Ratio** | 1:1 (square) |
| **File Size** | <500KB per image |
| **Quality** | 85-90% (JPG) |
| **Optimization** | Yes (compress before uploading) |

### Why These Specs?

- **600x600px:** Displays crisp on desktop and mobile
- **1:1 ratio:** Fits perfectly in product cards
- **<500KB:** Fast loading, good UX
- **JPG quality 85-90%:** Best balance of quality/file size

---

## Image Preparation Workflow

### Step 1: Prepare Your Images

Use any photo editing software (Photoshop, GIMP, online tools):

1. Crop to 1:1 aspect ratio
2. Resize to 600x600px
3. Add white background if needed
4. Export as JPG at 85% quality

**Free online tools:**
- [Squoosh](https://squoosh.app/) - Google's compression tool
- [TinyPNG](https://tinypng.com/) - PNG/JPG compression
- [Pixlr](https://pixlr.com/) - Free photo editor
- [Canva](https://canva.com/) - Template-based designs

### Step 2: Optimize Scaling

```bash
# Using ImageMagick (if installed)
convert input.jpg -resize 600x600 -quality 85 output.jpg
```

### Step 3: Export

Save as:
- `e3-orbit-cabin.jpg` (for E3 model)
- `e5-nova-pod.jpg` (for E5 model)
- etc.

### Step 4: Upload

Place in `/images/products/` directory

### Step 5: Update Database

Use Admin Dashboard to point to new images

---

## Product Image Mapping

| Product | File Name | Placeholder Color | Category |
|---------|-----------|------------------|----------|
| E3 Orbit Cabin | e3-orbit-cabin.jpg | Red | single |
| E5 Nova Pod | e5-nova-pod.jpg | Teal | single |
| E7 Stellar Lodge | e7-stellar-lodge.jpg | Green | single |
| F5 Dune Pod | f5-dune-pod.jpg | Rose | specialty |
| F7 Ridge Cabin | f7-ridge-cabin.jpg | Purple | specialty |
| H3 Steam Pod | h3-steam-pod.jpg | Pink | specialty |
| H7 Meadow Pod | h7-meadow-pod.jpg | Blue | specialty |
| N7 Forest Cabin | n7-forest-cabin.jpg | Brown | apple |
| Zenith Twin | zenith-twin.jpg | Sky Blue | double |

---

## Best Practices

### DO ✓
- [ ] Use high-quality original images
- [ ] Keep aspect ratio 1:1
- [ ] Compress images before uploading
- [ ] Use descriptive file names
- [ ] Optimize for web (85-90% quality)
- [ ] Test images on mobile
- [ ] Keep backup of originals
- [ ] Use consistent styling/lighting

### DON'T ✗
- [ ] Use images larger than 600x600
- [ ] Use unoptimized file sizes (>1MB)
- [ ] Mix aspect ratios
- [ ] Use low-quality upscaled images
- [ ] Forget to compress
- [ ] Use copyright/unlicensed images
- [ ] Have inconsistent quality between products

---

## Display Behavior

### How Images Appear

**Product Grid (Products Page):**
- 3-column layout on desktop
- 2-column on tablets
- 1-column on mobile
- Click to open detailed modal
- Images fill available space (object-fit: cover)

**Product Modal:**
- Larger preview
- Full specifications shown
- Price (if available)
- Better visibility

**Admin Dashboard:**
- Small thumbnail (60x60px)
- Shows in products table
- Easy to verify what's displayed

---

## Image Caching

The website caches images in browser. If you update an image:

1. Old users may see cached version
2. Force refresh: Cmd/Ctrl + Shift + R
3. Clear browser cache if needed
4. Use specific file names to avoid caching issues

**Tips to bypass cache:**
- Add query parameter: `/image.jpg?v=2`
- Change filename slightly each time
- Use CDN with cache invalidation

---

## Advanced: Image URLs in Database

### Current Database Setup

Products table stores image URLs:
```sql
SELECT model, name, img FROM products;
```

Example output:
```
E3     | Orbit Cabin | /images/products/e3-orbit-cabin.svg
E5     | Nova Pod    | /images/products/e5-nova-pod.svg
```

### Updating Image URLs

**Via Admin Dashboard:**
- Edit product → Change Image URL → Save

**Via Database Query:**
```bash
sqlite3 database.sqlite

UPDATE products 
SET img = '/images/products/e3-orbit-cabin.jpg' 
WHERE key = 'e3';
```

**Via App Code:**
Add image URL when creating product:
```javascript
{
    key: 'e3',
    model: 'E3',
    name: 'Orbit Cabin',
    img: '/images/products/e3-orbit-cabin.jpg',
    category: 'single',
    is_featured: true
}
```

---

## Troubleshooting Images

### Issue: Images not showing
**Solutions:**
- Check file path is correct
- Verify file exists in `/images/products/`
- Clear browser cache (Cmd+Shift+Delete)
- Check file extension (.jpg not .JPG)
- Verify file is actually an image

### Issue: Image quality looks bad
**Solutions:**
- Image too small - use larger original
- Compression too high - reduce compression
- Interlaced JPG - re-export
- Check browser zoom level

### Issue: Slow loading
**Solutions:**
- Reduce file size (<500KB)
- Use JPG instead of PNG
- Optimize before uploading
- Enable browser caching

### Issue: Wrong image showing
**Solutions:**
- Check database URL is correct
- Clear browser cache
- Verify file was uploaded
- Check file naming matches URL

---

## Image Performance

### Current Performance

✓ SVG placeholders are tiny (<50KB each)
✓ Lazy loading ready (via object-fit)
✓ Responsive images (scale to container)

### Optimization Tips

1. **Compress:** Use TinyPNG or Squoosh
2. **Format:** JPG for photos, PNG for graphics
3. **Responsive:** Only use 600px width (perfect for 1x and 2x displays)
4. **Cache:** Browser caches images (good!)
5. **CDN:** Optional - use for global coverage

---

## Bulk Image Updates

### If replacing all 9 images:

1. Prepare all 9 images (600x600px, <500KB each)
2. Place all in `/images/products/`
3. Name them exactly:
   - `e3-orbit-cabin.jpg`
   - `e5-nova-pod.jpg`
   - ... etc
4. Update database URLs in Admin Dashboard one by one
   OR run bulk update query:

```bash
sqlite3 database.sqlite << EOF
UPDATE products SET img = '/images/products/e3-orbit-cabin.jpg' WHERE key = 'e3';
UPDATE products SET img = '/images/products/e5-nova-pod.jpg' WHERE key = 'e5';
UPDATE products SET img = '/images/products/e7-stellar-lodge.jpg' WHERE key = 'e7';
UPDATE products SET img = '/images/products/f5-dune-pod.jpg' WHERE key = 'f5';
UPDATE products SET img = '/images/products/f7-ridge-cabin.jpg' WHERE key = 'f7';
UPDATE products SET img = '/images/products/h3-steam-pod.jpg' WHERE key = 'h3';
UPDATE products SET img = '/images/products/h7-meadow-pod.jpg' WHERE key = 'h7';
UPDATE products SET img = '/images/products/n7-forest-cabin.jpg' WHERE key = 'n7';
UPDATE products SET img = '/images/products/zenith-twin.jpg' WHERE key = 'zenith';
EOF
```

5. Refresh website and verify

---

## Using External Image URLs

You can also use external URLs (hosted elsewhere):

**Advantages:**
- Don't clutter local server
- Easier content management
- Can use CDN

**Disadvantages:**
- Dependent on external service
- Slower if hosted far away
- Potential broken links

**Example:**
```
img: 'https://cdn.example.com/products/e3.jpg'
```

---

## Backup & Version Control

### For Local Images:

1. Keep original files backed up
2. Store compressed versions for web
3. Version control: `.gitignore` ignores large files
4. Consider external storage (cloud backup)

### Recommended Setup:

```
/Local Storage/
├── originals/ (full resolution backups)
└── web-ready/ (optimized 600x600)
```

---

## Next Steps

1. **Short-term:**
   - [ ] Prepare your product images
   - [ ] Optimize to 600x600px, <500KB
   - [ ] Upload to `/images/products/`
   - [ ] Test via Admin Dashboard

2. **Medium-term:**
   - [ ] Create professional product photography
   - [ ] Consider 360° views or multiple angles
   - [ ] Plan lifestyle/context shots

3. **Long-term:**
   - [ ] Professional product catalog PDF
   - [ ] Video demonstrations
   - [ ] Augmented reality (AR) preview

---

**Last Updated:** April 16, 2026
**Version:** 1.0
