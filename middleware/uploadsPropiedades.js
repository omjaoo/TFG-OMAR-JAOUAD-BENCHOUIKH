const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storagePropiedad = multer.diskStorage({
  destination: function (req, file, cb) {

    const userId = req.session.inicioSesion.id;

    const userFolder = path.join(__dirname, '../public/uploadsPropiedades/', userId);


    // Verifica si existe la carpeta, si no, la crea
    fs.mkdir(userFolder, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, userFolder);
    });
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }

});

const uploadPropiedad = multer({
  storage: storagePropiedad,
  limits: { files: 50 }
});

module.exports = uploadPropiedad;
