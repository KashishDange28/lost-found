/**
 * Migration script: find local `/uploads/*` references in Reports and Users,
 * upload the files to Cloudinary (if present under server/uploads) and update DB.
 *
 * Usage: node server/scripts/migrate-uploads-to-cloudinary.js
 * Make sure server `NODE_ENV` env and Cloudinary env vars are set before running.
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Report = require('../models/Report');
const User = require('../models/User');

async function main() {
  const mongo = process.env.MONGODB_URI;
  if (!mongo) {
    console.error('MONGODB_URI not set in env. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for migration');

  cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  });

  const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');

  // Helper to upload a local file to Cloudinary
  async function uploadLocalFile(localPath, folder = 'lost-found') {
    if (!fs.existsSync(localPath)) {
      console.warn('File not found, skipping:', localPath);
      return null;
    }
    try {
      const res = await cloudinary.uploader.upload(localPath, { folder });
      return res.secure_url || res.url || null;
    } catch (err) {
      console.error('Cloudinary upload failed for', localPath, err && err.message ? err.message : err);
      return null;
    }
  }

  // Migrate Reports
  const reports = await Report.find({});
  console.log('Found', reports.length, 'reports');
  for (const r of reports) {
    let changed = false;
    if (r.item && r.item.imageUrl && String(r.item.imageUrl).startsWith('/uploads')) {
      const localPath = path.join(uploadsDir, path.basename(r.item.imageUrl));
      const uploadedUrl = await uploadLocalFile(localPath);
      if (uploadedUrl) {
        r.item.imageUrl = uploadedUrl;
        changed = true;
      }
    }
    if (changed) {
      await r.save();
      console.log('Updated report', r._id);
    }
  }

  // Migrate Users
  const users = await User.find({});
  console.log('Found', users.length, 'users');
  for (const u of users) {
    let changed = false;
    if (u.profileImageUrl && String(u.profileImageUrl).startsWith('/uploads')) {
      const localPath = path.join(uploadsDir, path.basename(u.profileImageUrl));
      const uploadedUrl = await uploadLocalFile(localPath, 'lost-found/profiles');
      if (uploadedUrl) {
        u.profileImageUrl = uploadedUrl;
        changed = true;
      }
    }
    if (changed) {
      await u.save();
      console.log('Updated user', u._id);
    }
  }

  console.log('Migration complete');
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err && err.message ? err.message : err);
  process.exit(1);
});
