var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const Usuario = require('../models/usuario'); 

function isAuthenticated(req, res, next) {
  if (req.session.usuario) {
      next(); // puede pasar
  } else {
      res.redirect('/login'); // si no está logueado, fuera
  }
}

/*Pagina incio protegida */
router.get('/', isAuthenticated, function(req, res) {
  res.render('index', { usuario: req.session.usuario });
});

/*Logout */
router.get('/logout', (req, res) => {
  req.session.destroy(); // Eliminamos la sesión
  res.redirect('/login'); // Redirigimos a login
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Aquí mi "login" es tu archivo `views/login.ejs`
router.get('/login', function(req, res, next) {
  res.render('login');  
});


/* RUTA DE LOGIN para enviar codigo al usuario */
router.post('/login', async function(req, res, next) {

  const usuarioComprobacion = await Usuario.findOne({email: req.body.email})

  if(!usuarioComprobacion){
    console.log("este usuario no existe")
  }else{
    console.log("Usuario encontrado:", usuarioComprobacion.email);

    // Generar un código aleatorio
    const codigoGenerado = Math.floor(100000 + Math.random() * 900000);
    
    console.log("Código generado:", codigoGenerado);

    // Guardar el código en la base de datos
    usuarioComprobacion.codigoVerificacion = codigoGenerado.toString();
    usuarioComprobacion.codigoExpiracion = new Date(Date.now() + 5 * 60 * 1000);
    await usuarioComprobacion.save();

    // Configurar el transporte de email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'miespacioideal7@gmail.com', 
        pass: 'szrq zyri nubd evyt'
      }
    });

    // Opciones del email
    const mailOptions = {
      from: 'miespacioideal7@gmail.com',
      to: usuarioComprobacion.email,
      subject: 'Código de Verificación',
      html: `<h1>Tu código para iniciar sesión es: <strong>${codigoGenerado}</strong></h1>`
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    console.log("Email enviado correctamente a", usuarioComprobacion.email);
  }

  //me quedo por aqui
  console.log(req.body.email)
});

module.exports = router;
