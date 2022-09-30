const multer = require('multer');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};
const store = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid Mime Type");
        if (isValid) {
            error = null;
        }
        cb(error, "uploads/");
    },
    filename: function (req, file, cb) {
        const name = file.originalname.toLowerCase().split(' ').join('_');
        cb(null, Date.now() + name)
    }
});
const upload = multer({
    storage: store,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size
}).single('file');

module.exports = upload