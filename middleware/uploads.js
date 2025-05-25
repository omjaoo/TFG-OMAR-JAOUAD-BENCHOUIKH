const multer  = require('multer');
const path    = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  
  destination: function (req, file, cb) {

    const userEmail = req.session.inicioSesion.email;

    const userFolder = path.join(__dirname, '../public/uploads/', userEmail);
  
  
    // Verifica si existe la carpeta, si no, la crea
    fs.mkdir(userFolder, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, userFolder);
    });
  },

  
   
  filename:    (req, file, cb) => {
    // userId-timestamp.ext (evita colisiones)
    const ext = path.extname(file.originalname);
    cb(null, req.session.inicioSesion.id + '-' + Date.now() + ext);
  }
});

module.exports = multer({
  storage,
  fileFilter: (_, file, cb) => {
    // acepta solo imágenes
    cb(null, /jpg|jpeg|png|gif/i.test(file.mimetype));
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB
});
