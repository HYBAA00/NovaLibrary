const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadRoot = path.join(__dirname, '../../uploads');
const booksDir = path.join(uploadRoot, 'books');
const coversDir = path.join(uploadRoot, 'covers');

[uploadRoot, booksDir, coversDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'pdf') cb(null, booksDir);
    else if (file.fieldname === 'cover') cb(null, coversDir);
    else cb(null, uploadRoot);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, unique + ext);
  }
});

const allowed = {
  pdf: ['application/pdf'],
  cover: ['image/jpeg', 'image/png', 'image/webp'],
};

const upload = multer({
  storage,
  limits: {
    fileSize: 60 * 1024 * 1024,
    files: 2,
  },
  fileFilter(req, file, cb) {
    const allowedForField = allowed[file.fieldname];
    if (!allowedForField) return cb(new Error('Champ fichier invalide'));
    if (!allowedForField.includes(file.mimetype)) {
      return cb(new Error(file.fieldname === 'pdf' ? 'Le fichier doit etre un PDF' : 'La couverture doit etre une image JPG, PNG ou WebP'));
    }
    cb(null, true);
  },
});

module.exports = upload;
