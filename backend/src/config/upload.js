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
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload;
