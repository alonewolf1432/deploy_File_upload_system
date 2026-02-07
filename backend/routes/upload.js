// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const auth = require('../middleware/authMiddleware');

const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload buffer to Cloudinary
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw' // 🔥 VERY IMPORTANT for PDFs, docs, etc.
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ---------- ROUTES ---------- //

router.post('/reference', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'reference');

    await db.query(
      'INSERT INTO files (user_id, category, filename, filepath) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'reference', req.file.originalname, result.secure_url]
    );

    res.json({
      message: 'Reference file uploaded successfully',
      fileUrl: result.secure_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/students', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'students');

    await db.query(
      'INSERT INTO files (user_id, category, filename, filepath) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'students', req.file.originalname, result.secure_url]
    );

    res.json({
      message: 'Student file uploaded successfully',
      fileUrl: result.secure_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/questions', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'questions');

    await db.query(
      'INSERT INTO files (user_id, category, filename, filepath) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'questions', req.file.originalname, result.secure_url]
    );

    res.json({
      message: 'Question file uploaded successfully',
      fileUrl: result.secure_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
