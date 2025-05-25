var express = require('express');
var router = express.Router();
var path = require('path');
const fs   = require('fs/promises'); 
const upload  = require('../middleware/uploads');
const Usuario = require('../models/usuario');
const nodemailer = require('nodemailer');


function isAuthenticated(req, res, next) {
    if (req.session && req.session.inicioSesion) {
        next(); // puede pasar
    } else {
        res.redirect('/users/login'); // si no está logueado, fuera
    }
  }
  

//ruta para cuando haya un usuario logueado te lleve al panel de usuario
router.get('/panel',isAuthenticated,async function(req,res,next) {
    let editarDatos = null;
    let estado = true;
    let user = req.session.inicioSesion
    let inicioSesion = req.session.inicioSesion

    //saca el usuario
    const usuario = await Usuario.findById(user.id);

    //verifico que el perfil de inquilino tiene informacion o no
    const perfilInquilino = usuario.perfilInquilino;

    const tieneInfo = perfilInquilino && (
        perfilInquilino.personasVivienda >= 1 ||
        perfilInquilino.tieneMascota === true ||
        perfilInquilino.fechaMudanza ||
        perfilInquilino.IngresosMensuales ||
      (perfilInquilino.cartaPresentacion && perfilInquilino.cartaPresentacion.trim() !== '')
    );

    console.log("tiene perfil como inquilino",tieneInfo)


    console.log('session:', req.session.inicioSesion);

    console.log(usuario.foto)
    res.render('panel', { usuario,editarDatos,tieneInfo,estado,inicioSesion})
});

//ruta para editar los datos del usuario
router.get('/editarDatos', async function (req,res,next){
    editarDatos = true;
    let tieneInfo;
    let inicioSesion = req.session.inicioSesion;
    let usuario = await Usuario.findById(req.session.inicioSesion.id);

    const perfil = usuario.perfilInquilino || {};

    console.log(usuario)

    if( Object.keys(perfil).length > 0){
        tieneInfo = true;
    }else{
        tieneInfo = undefined
    }
    console.log("usuario foto:",usuario.foto);
    
    return res.render('panel', {editarDatos,tieneInfo,estado:true,inicioSesion,usuario})
});

// con usuario autenticado (req.user)
router.post('/foto', upload.single('avatar'), async (req, res) => {
    
    const user = await Usuario.findById(req.session.inicioSesion.id);
    console.log(user)
    if (user.foto) {
        // concatena la carpeta public para llegar a la ruta física
        const rutaFisica = path.join('public', user.foto);
        await fs.unlink(rutaFisica).catch(() => {
          console.warn('No se pudo borrar la foto previa (quizá no existía).');
        });
    }
    // ruta relativa que servirá Express: "/uploads/filename.jpg"
    const ruta = '/uploads/'+ user.email + "/" + req.file.filename;

    await Usuario.findByIdAndUpdate(req.session.inicioSesion.id, { foto: ruta });
    res.redirect('panel');          
  
});

router.post('/guardarDatos', async function(req,res,next){

    let nombreActualizado = req.body.nombreActualizado;
    let prefijo = req.body.prefijo;
    let telefono = req.body.telefono;
    console.log(nombreActualizado,prefijo,telefono)

    let numeroCompleto = prefijo+telefono;
    console.log(numeroCompleto);

    //busco al usuario que hace la solicitud de actualizar los datos
    const idUser = await Usuario.findById(req.session.inicioSesion.id);

    //actualizo al usuario creo un objeto
    const nuevosDatos = await Usuario.findByIdAndUpdate(
        idUser,
        {
            nombre: nombreActualizado,
            telefono: numeroCompleto
        },
        {new:true, runValidators:true}
    );

    //actualizo la session para que no haga falta hacer login de nuevo
    req.session.inicioSesion.nombre = nombreActualizado;
    req.session.inicioSesion.telefono = numeroCompleto;

    //redirijo all panel de perfil de nuevo
    res.redirect('/panel')
});

//aqui tendre la configuracion del inquilino
router.post('/perfil/inquilino', async function (req,res,next){

    //usuario de la sesion 
    const usuario = req.session.inicioSesion
    let editarDatos = null;
    let tieneInfo = false;
    let estado = true

    console.log(usuario)

    let estadoPerfil = null;
    res.render('panel', {estadoPerfil,usuario,editarDatos,tieneInfo,estado})

})

//en esta ruta procesare guardare la info que añadidio el usuario a su perfil y la renderizare en el panel
router.post('/perfil/guardarPerfilInquilino', async function (req,res,next) {

    
    //recupero los datos enviados por el usuario por el formulario
    const {personas,mascota,mudanza, ingresos, carta} = req.body
    let usaFechaExacta;
    let fecha_exacta;

    if(req.body.fecha_exacta){

        fecha_exacta = req.body.fecha_exacta;
        console.log(fecha_exacta)

        usaFechaExacta = true;

    }

    
    //actualizo la el objeto perfilInquilino
    const perfilInquilino = {

        personasVivienda: personas,
        tieneMascota: mascota,
        fechaMudanza: mudanza,
        IngresosMensuales: ingresos,
        cartaPresentacion: carta
    };

    if (usaFechaExacta === true) {
      perfilInquilino.fechaMudanza = fecha_exacta; 
    }


    //busco al usuario que hace la solicitud de actualizar los datos y actualizo la variable
    //me quedo por auqi solucionar esto
    await Usuario.findByIdAndUpdate(

        req.session.inicioSesion.id,
        { perfilInquilino: perfilInquilino},
        { new: true, runValidators: true}
    
    );

    //variables del ejs
    const usuario = req.session.inicioSesion
    let editarDatos = null;
    let estadoPerfil = null;
    let tieneInfo =  true;

    req.session.inicioSesion.perfilInquilino = perfilInquilino;


    console.log(personas,mascota,mudanza,ingresos,carta)

    res.render("panel", {usuario,editarDatos,estadoPerfil,tieneInfo,estado:true})

});



module.exports = router;
