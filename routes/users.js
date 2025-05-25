var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const Usuario = require('../models/usuario'); 
const Propiedad = require('../models/propiedad'); 
const { route } = require('./perfil');

function isAuthenticated(req, res, next) {
  if (req.session?.usuario || req.session?.inicioSesion) {
    return next();
  }
  return res.redirect('login');
}

/*Pagina incio protegida */
router.get('/', isAuthenticated, function(req, res) {
  res.render('index', { usuario: req.session.usuario });
});


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/*Ru ta para usar en eventos sobretodo para saber si el usuario llega a un sitio logueado o no */
router.get('/usuario-logueado', (req,res) => {
  res.json({logueado: !!req.session.inicioSesion})
})

// mi archivo login.ejs
router.get('/login', function(req, res, next) {

  res.render('login', { estado: null,fallo:false,exito:false});  
  
});


/* RUTA DE LOGIN para enviar codigo al usuario */
router.post('/login', async function(req, res, next) {

  const usuarioComprobacion = await Usuario.findOne({email: req.body.email});

 
  // Generar un código aleatorio
  const codigoGenerado = Math.floor(100000 + Math.random() * 900000);

  if(!usuarioComprobacion){
    console.log("este usuario no existe");

    let emailRegistrar = req.body.email;

    //variable para los registros de los usuarios declarada a null
    let coincidencia = null

    //guardar datos en session para poder hacer comporbacion, asi evito que alguien se pueda registrar sin querer con el codigo de otra persona
    req.session.registro = {
      emailRegistrar,
      codigoGenerado
    }

    
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
      to: emailRegistrar,
      subject: 'Código de Verificación',
      html: `<h1>Tu código para iniciar sesión es: <strong>${codigoGenerado}</strong></h1>`
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    return res.render('login',{estado:false,emailRegistrar,coincidencia, coincidenciaCodigo: null,fallo:false });


  }else{
    console.log("Usuario encontrado:", usuarioComprobacion.email);

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
      subject: '¡Bienvenido a EspacioIdeal! Aquí tienes tu código de acceso personalizado',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            
            <div style="background-color: #4a90e2; padding: 30px 20px; text-align: center; color: white; font-family: Arial, sans-serif;">
              <h1 style="margin: 0; font-size: 32px;">Espacio<span style="color: #ffffff;">Ideal</span></h1>
              <p style="margin: 5px 0 0; font-size: 16px;">La plataforma para encontrar tu lugar perfecto</p>
            </div>


              <p style="font-size: 18px; color: #333;">Tu código de verificación para iniciar sesión en EspacioIdeal es:</p>
              <h2 style="font-size: 36px; color: #4a90e2; margin: 20px 0;">${codigoGenerado}</h2>

              <p style="font-size: 14px; color: #888;">Este código expirará en 10 minutos. Si no fuiste tú quien lo solicitó, puedes ignorar este mensaje.</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
              © ${new Date().getFullYear()} EspacioIdeal. Todos los derechos reservados.
            </div>
          </div>
        </div>`

    };

    

    // Enviar el email
    await transporter.sendMail(mailOptions);
    req.session.emailPendiente = usuarioComprobacion.email;
    return res.render('login', {estado:true,fallo:false,exito:false});
  }

  //pasarlo atributos por el render y en el ejs hacer una condicion
  
});


router.get('/logout', async function (req, res, next) {
  //destruye la sesion y la cookie
  req.session.destroy(err => {
    if(err) console.log(err);
    res.clearCookie('miCookieSesion')
    res.redirect('/')
  })
})


//ruta para verificar el usuario que ya se encuentra en nuestra bbdd
router.post('/verificar/codigo',async function(req, res, next) {

  //establezco una variable dependiendo de su estado imprimire de una manera el header o de otra
  let estado = null;
  const propiedadesAleatorias = await Propiedad.aggregate([{$sample: {size:4}}])
  
  //extraigo tanto el codigo introducido por el usuario en el front como su email para activas us sesion
  let emailUser = req.session.emailPendiente;
  const {d1,d2,d3,d4,d5,d6} = req.body;
  const codigoUser = `${d1}${d2}${d3}${d4}${d5}${d6}`;
  let fallo;
  let busquedaVacia = false;
  
  //busco en la bbdd si coincide el codigo introducido por el usu con el enviado por correo.
  const inicioSesion = await Usuario.findOne({
    email:emailUser,
    codigoVerificacion:codigoUser
  });
  

  if(!inicioSesion){
    fallo = true;
    return res.render('login',{estado:true,fallo} )
  }

  //averigua la fecha de expiracion para hacer el condicional
  const expiracion = inicioSesion.codigoExpiracion.getTime();

  
  
  //condiiconal para crear la sesion
  if(inicioSesion && expiracion > Date.now()){
    let estado = true;

    //session guardo aqui los datos
    req.session.inicioSesion = {
      id:     inicioSesion._id,
      nombre: inicioSesion.nombre,
      email:  inicioSesion.email,
      foto: inicioSesion.foto,
      perfilInquilino: inicioSesion.perfilInquilino,
      telefono: inicioSesion.telefono
    };
    
    return res.redirect('/')

  }else{
    return res.redirect('/')
  }


});

//ruta para registrar usuario
router.post('/registrar', async function(req,res,next){

  //declaro variables para controlar el comportamiento del ejs en este caso del registrar
  let estado = false;
  let coincidencia = null;
  let coincidenciaCodigo = null;

  //email introducido y el siguiente cuando le pida que lo repita
  let email = req.body.emailRegistrar;

  //recupero los datos del usuario que va registrarse
  let {emailRegistrar, codigoGenerado} = req.session.registro;

  //recupero los digitos introducios por el usuario para comporbar si son los mismos que se ha enviado por correo
  const {d1,d2,d3,d4,d5,d6} = req.body;
  const codigoUser = `${d1}${d2}${d3}${d4}${d5}${d6}`;
  console.log(codigoUser)

  if(email === emailRegistrar){

    console.log("los emails coinciden")
    console.log(codigoGenerado)

    //quiero hacer la comprobacion del codigo  enviado por email aqui
    if(Number(codigoUser) === codigoGenerado){
      console.log("el codigo del usuario coincide");
      
      //extraigo las variables que ha puesto el usuario en el formulario
      let nombre = req.body.nombre;
      let telefono = "";
      let apellidos = "";
      let foto = "";

      //creo una instancia del modelo
      const nuevoUsuario = new Usuario({nombre,apellidos,email,foto,telefono});

      //guardo los datos en la bbdd
      await nuevoUsuario.save();

      //session guardo aqui los datos
      req.session.inicioSesion = {
        id:     nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email:  nuevoUsuario.email,
      };
      
      res.redirect('/');


    }else{

      coincidenciaCodigo = false;
      return res.render('login',{estado,coincidencia,coincidenciaCodigo,emailRegistrar,fallo:true});

    }

  }else{
    coincidencia = false;
    return res.render('login',{estado,coincidencia,emailRegistrar, coincidenciaCodigo: null,fallo:true })
  }
  
});

router.get('/subiranuncio',isAuthenticated, async function(req,res,next){

  console.log(req.session.usuario)
  let usuario = await Usuario.findById(req.session.inicioSesion.id)
  let inicioSesion = req.session.inicioSesion
  let estado = true;

  console.log(inicioSesion)

  res.render('subiranuncio',{usuario,estado})

});

/* ruta para renderizar los favoritos */
router.get('/favoritos',isAuthenticated, async function(req,res,next){

  let estado = true;
  let inicioSesion = req.session.inicioSesion;

  const usuarioId = req.session.inicioSesion.id

  const usuario = await Usuario.findById(req.session.inicioSesion.id);
  let propiedadesFavoritas = [];

  console.log(usuario);

  const favoritos = usuario.favoritos;

  for(const favorito of favoritos){
    const propiedad = await Propiedad.findById(favorito)

    propiedadesFavoritas.push(propiedad);
  }

  res.render('favoritos', {propiedadesFavoritas,estado,usuario,usuarioId})

});

router.get('/mapa', async function (req,res,next){

  let estado;
  const inicioSesion = req.session.inicioSesion;

  if(inicioSesion){
    estado = true;
  }else{
    estado = null
  }

  res.render('mapa',{estado,inicioSesion})
});

router.get('/misanuncios', isAuthenticated ,async function(req,res,next){

  const inicioSesion = req.session.inicioSesion

  const usuario = await Usuario.findById(req.session.inicioSesion.id)

  const usuarioId = req.session.inicioSesion.id

  const anuncios = await Propiedad.find({propietario : usuarioId})

  res.render('misAnuncios', {estado:true,usuario,anuncios})

});

router.post('/limpiar-favoritos',async function (req,res,next){

  const user = await Usuario.findById(req.session.inicioSesion.id);

  //vacio el array de user de likes
  user.favoritos = [];

  await user.save();

  //vaciar el atributo favoritos de las propiedades
  await Propiedad.updateMany(
    {
      likes: user.id
    },
    {
      $pull: {likes: user.id}
    }
  )

  let propiedades = await Propiedad.find({
    likes: user.id
  })

  res.json(
    {
      propiedades,
      ok: true
    }
  )
  

});

router.post('/baja',async function (req,res,next){

  const user = await Usuario.findById(req.session.inicioSesion.id);
  //elimino primero todo lo relacionado con el usuario

  //las propiedades
  await Propiedad.deleteMany({
    propietario: user.id
  })

  //elimino al usuario
  await Usuario.findByIdAndDelete(req.session.inicioSesion.id);

  //destruye la sesion y la cookie
  req.session.destroy(err => {
    if(err) console.log(err);
    res.clearCookie('miCookieSesion')
    return res.json({ok:true})

  })

  

});

module.exports = router;
