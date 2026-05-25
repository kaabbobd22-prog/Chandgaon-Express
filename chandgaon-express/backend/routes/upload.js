const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');

// @POST /api/upload/image
router.post('/image', protect, authorize('admin', 'shopOwner'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
});

// @POST /api/upload/images (multiple)
router.post('/images', protect, authorize('admin', 'shopOwner'), upload.array('images', 5), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No images provided' });
  const urls = req.files.map(f => ({ url: f.path, publicId: f.filename }));
  res.json({ success: true, images: urls });
});

// @DELETE /api/upload/:publicId
router.delete('/:publicId', protect, authorize('admin'), async (req, res) => {
  await cloudinary.uploader.destroy(req.params.publicId);
  res.json({ success: true, message: 'Image deleted' });
});

module.exports = router;
