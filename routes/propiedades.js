const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const uploadPropiedad = require("../middleware/uploadsPropiedades");
const Propiedad = require("../models/propiedad");
const Usuario = require("../models/usuario"); // Para asociar la propiedad al usuario
const { authenticate } = require("passport");

function isAuthenticated(req, res, next) {
  if (req.session && req.session.inicioSesion) {
    next(); // puede pasar
  } else {
    res.redirect("/users/login"); // si no está logueado, fuera
  }
}

router.post(
  "/propiedadPublicar",
  uploadPropiedad.array("imagenes", 50),
  async (req, res) => {
    const usuarioId = req.session.inicioSesion.id;

    const {
      tipo,
      operacion,
      localidad,
      nombreVia,
      numeroVia,
      superficie,
      numBa,
      numero_habitaciones,
      precio,
      descripcion,
    } = req.body;

    //direccion
    let direccion =
      req.body.localidad +
      ", " +
      req.body.nombreVia +
      ", " +
      req.body.numeroVia;

    //codificar la altitud y latitud apartir de la localidad y la calle
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(direccion)}`;

    console.log("direccion url geo ", url);


    //mas sobre la geolocaliazion hago la peticion fetch para que me lo devuelva
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'mi-app-node/1.0'
      }
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log("entra aqui dentro de data")

      return res.json({ok:false});
    }

    const resultado = data[0];

    const lat = parseFloat(resultado.lat);
    const lon = parseFloat(resultado.lon);

    const imagenes = req.files.map(
      (file) => "/uploadsPropiedades/" + usuarioId + "/" + file.filename
    );
    let nuevaPropiedad;

    let precioFloat = parseFloat(precio);
    
    let fecha_publicacion = new Date();

    if (tipo === "casa" || tipo === "chalet") {
      const piscina = req.body.piscina;
      const plantas = req.body.numero_plantas;

      console.log(piscina, plantas, direccion);

      nuevaPropiedad = new Propiedad({
        tipo,
        descripcion,
        operacion,
        direccion,
        superficie,
        precio: precioFloat,
        numero_baños: numBa,
        numero_habitaciones,
        imagenes,
        propietario: usuarioId,
        piscina,
        plantas,
        fecha_publicacion,
        ubicacion: {
          type: "Point",
          coordinates: [lon, lat]
        },
      });
    } else if (tipo === "piso") {
      const planta = req.body.planta;
      const ascensor = req.body.ascensor;

      nuevaPropiedad = new Propiedad({
        tipo,
        descripcion,
        operacion,
        direccion,
        superficie,
        precio: precioFloat,
        numero_habitaciones,
        numero_baños: numBa,
        imagenes,
        propietario: usuarioId,
        planta,
        ascensor,
        fecha_publicacion,
        ubicacion: {
          type: "Point",
          coordinates: [lon, lat]
        },
      });
    } else if (tipo === "condominio") {
      const zonas_comunes = req.body.zonaComun;
      const numero_personas = req.body.numero_personas;

      nuevaPropiedad = new Propiedad({
        tipo,
        descripcion,
        operacion,
        direccion,
        superficie,
        precio: precioFloat,
        numero_habitaciones,
        numero_baños: numBa,
        imagenes,
        propietario: usuarioId,
        zonas_comunes,
        numero_personas,
        fecha_publicacion,
        ubicacion: {
          type: "Point",
          coordinates: [lon, lat]
        },
      });
    }
    console.log(nuevaPropiedad._id)
    await nuevaPropiedad.save();
    console.log(usuarioId)
    const usuarioActualizacion = await Usuario.findById(usuarioId);
    usuarioActualizacion.propiedades.push(nuevaPropiedad._id)
    await usuarioActualizacion.save();

    res.json({ ok:true,mensaje: "Propiedad publicada correctamente" });
  
    // Imagina que esto viene de tu BD:
    const direccionAlerta = nuevaPropiedad.direccion;
    const operacionAlerta = nuevaPropiedad.operacion; 
    const tipoPropiedadAlerta = nuevaPropiedad.tipo;

    console.log(direccionAlerta);

    const usuariosConBusquedas = await Usuario.find(
      { busquedaUsuario: { $exists: true, $ne: "" } },
    );

    function normalize(str) {
      return str
      .toLowerCase()
      // elimina todo lo que no sea letra, número o espacio
      .replace(/[^a-z0-9áéíóúüñ ]+/g, '')
      // colapsa múltiples espacios
      .replace(/\s+/g, ' ')
      .trim();
    }
    
    console.log("estos son los usuarios con busquedas\n"+usuariosConBusquedas)

    const operTarget    = operacionAlerta.trim().toLowerCase();
    const tipoTarget    = tipoPropiedadAlerta.trim().toLowerCase();

    let direccionBusqueda = nuevaPropiedad.direccion.toLowerCase();
    direccionBusqueda = normalize(direccionBusqueda);

    
    const usuariosNot = []
    for (const user of usuariosConBusquedas) {

      // si no hay alertas, saltamos
      if (!Array.isArray(user.busquedaUsuario) || user.busquedaUsuario.length === 0) {
        continue;
      }

      for(const alertaBusqueda of user.busquedaUsuario){

        const alerta = alertaBusqueda;
        console.log("alertas por ususario"+alerta)
        // asegúrate de que exista y sea cadena
        if (typeof alerta !== 'string') continue;

        // separa en 3 segmentos
        const partes = alerta.split('/');
        if (partes.length !== 3) continue;

        let [opAlerta, tipoAlerta, ciudadAlerta] = partes;
        opAlerta     = opAlerta.trim().toLowerCase();
        tipoAlerta   = tipoAlerta.trim().toLowerCase();
        ciudadAlerta = ciudadAlerta.trim().toLowerCase();

        // comprueba operación y tipo
        if (opAlerta !== operTarget)   continue;
        if (tipoAlerta !== tipoTarget) continue;

        // comprueba ciudad por coincidencia parcial
        if (!direccionBusqueda.includes(ciudadAlerta)) continue;

        // si llegas aquí, ¡coincide! lo añades al array
        usuariosNot.push(user);

      }
      
    }

    console.log(usuariosNot)

    
    if(usuariosNot.length > 0){

      // Configurar el transporte de email
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
          user: 'miespacioideal7@gmail.com', 
          pass: 'szrq zyri nubd evyt'
        }
      });
        

      for(const user of usuariosNot){

        
            // Opciones del email
            const mailOptions = {
              from: 'miespacioideal7@gmail.com',
              to: user.email,
              subject: '¡Bienvenido a EspacioIdeal! Novedades en tu alerta',
              html: `
                <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                <div style="background-color: #4a90e2; padding: 30px 20px; text-align: center; color: white; font-family: Arial, sans-serif;">
                  <h1 style="margin: 0; font-size: 32px;">Espacio<span style="color: #ffffff;">Ideal</span></h1>
                  <p style="margin: 5px 0 0; font-size: 16px;">La plataforma para encontrar tu lugar perfecto</p>
                </div>
                    <p style="font-size: 16px; margin-left: 20px; line-height: 1.5;">
                      Tenemos buenas noticias para ti<strong> nuevas actualizaciones</strong> en tu alerta
                    </p>
                    
                    <p style="font-size: 16px; margin-left: 20px; line-height: 1.5;">
                      Nuevas publicaciones en tu alerta por busqueda.
                    </p>
            
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://miespacioideal.omarjaouad.dev" 
                        style="background-color: #2E86DE; color: #ffffff; text-decoration: none; 
                          padding: 12px 24px; border-radius: 4px; font-size: 16px;">
                        Mi Espacio Ideal
                      </a>
                    </div>
          
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

      }

  } 
});


//sigo por aqui
router.post("/buscador",async (req, res) => {
  const usuarioId = req.session?.inicioSesion?.id;
  let inicioSesion = req.session.inicioSesion;
  let estado;
  let alerta;
  let usuario;

  if(req.session.inicioSesion){
    usuario = await Usuario.findById(req.session.inicioSesion.id)
  }

  if (inicioSesion) {
    estado = true;
  } else {
    estado = false;
  }

  const { operacion, tipoPropiedad, direccion } = req.body;

  const inputHidden = {
    operacion,
    tipoPropiedad,
    direccion
  }

  //saber si el usuario que ha realizado la busqueda ya habia realizado esta busqueda antes en el array
  //para la alerta
  const busqueda = `${operacion}/${tipoPropiedad}/${direccion}`

  if(inicioSesion === undefined){

  }else{

    const busquedaAlerta = await Usuario.findOne({

      _id: req.session.inicioSesion.id,
      busquedaUsuario: busqueda

    });

    if(busquedaAlerta){

      alerta = true

    }else{

      alerta = false

    }

    console.log("El usuario tiene busqueda ya", busquedaAlerta)

  }

  console.log(req.body)

  console.log(operacion, tipoPropiedad, direccion);

  const direccionInput = direccion.trim().replace(/\s*,\s*/g, "[\\s,]*"); 

  let direccionFinal = new RegExp(direccionInput, "i");

  console.log(direccionFinal);

  let resultados1 = await Propiedad.find({
    operacion: operacion,
    tipo: tipoPropiedad,
    direccion: direccionFinal,
  });

  console.log(resultados1);

  if(resultados1.length === 0){

    /* res.render('index', { title: 'MiEspacioIdeal', estado, usuario,propiedadesAleatorias,busquedaVacia}); */
    res.redirect("/?errorBusqueda=1")
   
  }else{
    
    const busquedaVacia = true
   
    res.render("resultadosBusquedas", {
      propiedades: resultados1,
      usuario,
      inicioSesion,
      estado,
      usuarioId: usuarioId?.toString(),
      inputHidden,
      alerta
    });
  }

});


router.post("/like/:id", isAuthenticated, async (req, res) => {
  console.log(req.session);

  const propiedadId = req.params.id;
  const usuarioId = req.session.inicioSesion.id;

  //actualizo tanto usuario comm la propiedad
  const propiedad = await Propiedad.findById(propiedadId);

  const yaLeDioLike = propiedad.likes.includes(usuarioId.toString());

  if (yaLeDioLike) {
    // Quitar like
    await Propiedad.findByIdAndUpdate(propiedadId, {
      $pull: { likes: usuarioId },
    });
    await Usuario.findByIdAndUpdate(usuarioId, {
      $pull: { favoritos: propiedadId },
    });
  } else {
    // Dar like
    await Usuario.findByIdAndUpdate(usuarioId, {
      $addToSet: { favoritos: propiedadId },
    });

    await Propiedad.findByIdAndUpdate(propiedadId, {
      $addToSet: { likes: usuarioId },
    });
  }

  res.status(200).json({ mensaje: "Like registrado" });
});

router.get("/detalles/:id", async function (req, res) {
  const inicioSesion = req.session.inicioSesion;
  let estado;
  let tieneAlerta;
  let alerta;
  let usuario;

  if(req.session.inicioSesion){
    usuario  = await Usuario.findById(req.session.inicioSesion.id)

  }

  console.log(inicioSesion)

  if (inicioSesion) {
    estado = true;
  } else {
    estado = false;
  }

  const propiedadId = req.params.id;

  const propiedadEncontrada = await Propiedad.findById(propiedadId);

  tieneAlerta = propiedadEncontrada.alertas.map(a => a.toString());

  let userAlerta;

  if(inicioSesion === undefined){
    userAlerta = false
  }else{
    userAlerta = true

    if(tieneAlerta.includes(req.session.inicioSesion.id)){

    alerta = true;

    }else{

      alerta = false;

    }

  }

  

  const usuarioId = propiedadEncontrada.propietario;

  const usuarioPropiedad = await Usuario.findById(usuarioId);

  console.log("console log de la foto", usuarioPropiedad.foto);

  console.log(propiedadEncontrada);

  if (propiedadEncontrada) {
    res.render("detalles", {
      propiedadEncontrada,
      usuarioPropiedad,
      inicioSesion,
      usuario,
      estado,
      alerta,
      userAlerta
    });
  }
});

//ruta para contactar al anunciante
router.post("/contactar", isAuthenticated, async (req, res) => {
  try {
    const { mensaje, propiedadId } = req.body;

    console.log(propiedadId);

    const propiedad = await Propiedad.findById(propiedadId);

    const anunciante = await Usuario.findById(propiedad.propietario);

    const usuarioBbdd = await Usuario.findById(req.session.inicioSesion.id);

    console.log(usuarioBbdd.email);

    console.log(anunciante.email)

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "miespacioideal7@gmail.com",
        pass: "lbch xelo zlbw cruj",
      },
    });

    const mailOptions = {
      from: usuarioBbdd.email,
      to: anunciante.email,
      subject: "Un inquilino interesado en tu propiedad - EspacioIdeal",
      html: `<div style="font-family: Arial, sans-serif; background-color: #f0f2f5; padding: 30px;">
            <div style="max-width: 700px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); overflow: hidden;">
              
              <div style="background-color: #4a90e2; padding: 30px 20px; text-align: center; color: white; font-family: Arial, sans-serif;">
                <h1 style="margin: 0; font-size: 32px;">Espacio<span style="color: #ffffff;">Ideal</span></h1>
                <p style="margin: 5px 0 0; font-size: 16px;">La plataforma para encontrar tu lugar perfecto</p>
              </div>




              <!-- Datos del inquilino -->
              <div style="padding: 30px;">
                    <p style="margin: 0;"><strong>Nombre:</strong> ${
                      usuarioBbdd.nombre
                    } ${usuarioBbdd.apellidos}</p>
                    <p style="margin: 0;"><strong>Teléfono:</strong> ${
                      usuarioBbdd.telefono
                    }</p>
                    <p style="margin: 0;"><strong>Rol:</strong> Inquilino</p>
                  </div>
              </div>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

                <h3 style="color: #4a90e2;">📘 Perfil del Inquilino</h3>
                <ul style="list-style: none; padding: 0; line-height: 1.6;">
                  <li><strong>Personas en la vivienda:</strong> ${
                    usuarioBbdd.perfilInquilino.personasVivienda
                  }</li>
                  <li><strong>Mascota:</strong> ${
                    usuarioBbdd.perfilInquilino.tieneMascota ? "Sí" : "No"
                  }</li>
                  <li><strong>Fecha de mudanza:</strong> ${
                    usuarioBbdd.perfilInquilino.fechaMudanza
                  }</li>
                  <li><strong>Ingresos mensuales:</strong> ${
                    usuarioBbdd.perfilInquilino.IngresosMensuales
                  } €</li>
                  <li><strong>Carta de presentación:</strong><br />${
                    usuarioBbdd.perfilInquilino.cartaPresentacion
                  }</li>
                </ul>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

                <h3 style="color: #4a90e2;">📝 Mensaje del inquilino</h3>
                <p style="font-size: 16px; line-height: 1.6; background: #f8f8f8; padding: 15px; border-radius: 6px;">
                  ${mensaje}
                </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                © ${new Date().getFullYear()} EspacioIdeal · Este mensaje fue generado automáticamente desde la plataforma
              </div>
            </div>
          </div>`,
    };

    //envio el email al anunciante
    await transporter.sendMail(mailOptions);
    res.status(200).json({ mensaje: "Correo enviado correctamente." });
  } catch (error) {
    res.status(500).json({
      error:
        "Hubo un problema al enviar el correo. Intenta de nuevo más tarde.",
    });
  }
});

router.post('/mapa', async function (req,res) {

  console.log("llega aqui")


    
  const areaLatLng = req.body.area; // Ej: [[lat, lon], [lat, lon], ...]

  console.log(areaLatLng)
    
  if (!areaLatLng || !Array.isArray(areaLatLng)) {
    return res.status(400).json({ error: "Área no válida" });
  }

  // Convertimos a formato GeoJSON: [ [lon, lat], [lon, lat], ... ]
  const polygon = areaLatLng.map(p => [p[1], p[0]]); // [lon, lat]

  console.log(polygon)

  // Cerramos el polígono si no está cerrado
  if (JSON.stringify(polygon[0]) !== JSON.stringify(polygon[polygon.length - 1])) {
    polygon.push(polygon[0]);
  }

  // Consulta geoespacial
  const propiedadesDentro = await Propiedad.find({
    ubicacion: {
      $geoWithin: {
        $geometry: {
          type: "Polygon",
          coordinates: [polygon]
        }
      }
    }
  });

  console.log(propiedadesDentro)

  res.json({ propiedades: propiedadesDentro });

});


router.get('/editar/:id', async function(req,res,next) {

  const propiedad = await Propiedad.findById(req.params.id);

  console.log(propiedad)

  const inicioSesion = req.session.inicioSesion

  let estado = true;

  

  res.render('editar-anuncio',{estado:true,propiedad,inicioSesion});

});

router.post('/actualizar-propiedad/:id', uploadPropiedad.array('fotos', 10),async function (req,res,next) {
  console.log(req.params.id)

  const propiedad = await Propiedad.findById(req.params.id);
  const inicioSesion = req.session.inicioSesion;
  const usuarioAlerta = req.session.inicioSesion.id


  const {precio,habitaciones,numero_ba,superficie,descripcion} = req.body

    console.log(numero_ba)
    console.log(req.body)
  
    propiedad.precio = precio;
    propiedad.numero_habitaciones = habitaciones;
    propiedad.numero_baños = numero_ba;
    propiedad.superficie = superficie;
    propiedad.descripcion = descripcion;

    // Procesar nuevas imágenes si se enviaron
    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map(
        (file) => "/uploadsPropiedades/" + propiedad.propietario + "/" + file.filename
      );
      propiedad.imagenes = [...propiedad.imagenes, ...nuevasImagenes];
    }

  await propiedad.save();

  //cuando un usuario edite una propiedad que tiene una alerta se notificara al usuario
  const coincidencias = await Usuario.find({
    _id: { $ne: usuarioAlerta },                    // excluirme a mí
    alertas: propiedad.id // misma propiedad
  }); 

  console.log(coincidencias)
  
  if(coincidencias.length > 0){

    // Configurar el transporte de email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'miespacioideal7@gmail.com', 
        pass: 'szrq zyri nubd evyt'
      }
    });
      

    for(const user of coincidencias){

      
          // Opciones del email
          const mailOptions = {
            from: 'miespacioideal7@gmail.com',
            to: user.email,
            subject: '¡Bienvenido a EspacioIdeal! Novedades en tu alerta',
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
              <div style="background-color: #4a90e2; padding: 30px 20px; text-align: center; color: white; font-family: Arial, sans-serif;">
                <h1 style="margin: 0; font-size: 32px;">Espacio<span style="color: #ffffff;">Ideal</span></h1>
                <p style="margin: 5px 0 0; font-size: 16px;">La plataforma para encontrar tu lugar perfecto</p>
              </div>
                  <p style="font-size: 16px; margin-left: 20px; line-height: 1.5;">
                    Tenemos buenas noticias para ti<strong> nuevas actualizaciones</strong> en tu alerta
                  </p>
                  <ul style="font-size: 16px; line-height: 1.5; margin-left:20px; margin: 15px 0;">
                    <li>📌${propiedad.direccion}</li>
                    <li>📌 ${propiedad.precio}€</li>
                    <li>📌 ${propiedad.fecha_publicacion}</li>
                  </ul>
                  <p style="font-size: 16px; margin-left: 10px; line-height: 1.5;">
                    Visita nuestra página para ver las actualizaciones en el inmueble.
                  </p>
          
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://miespacioideal.omarjaouad.dev/propiedad/detalles/${propiedad.id}" 
                      style="background-color: #2E86DE; color: #ffffff; text-decoration: none; 
                        padding: 12px 24px; border-radius: 4px; font-size: 16px;">
                      Ver detalles
                    </a>
                  </div>
        
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

    }

  }

    res.redirect('/')
});

router.post('/borrar/:id', async function(req,res,next){

  const anuncioBorrar = await Propiedad.findByIdAndDelete(req.params.id);

  console.log(anuncioBorrar.likes)

  /* tengo que eliminar los likes que se hayan  dado */
  /* si no se envian mal y se rompe el favoritos */

  await Usuario.updateMany(
    {favoritos: req.params.id}, 
    {$pull: {favoritos: req.params.id}
  })

  await Usuario.updateMany(
    {propiedades: req.params.id}, 
    {$pull: {propiedades: req.params.id}
  })
  
  console.log(anuncioBorrar)

  res.redirect('/users/misanuncios');

});

router.post('/buscadorFiltrado', async function(req,res,next){

  console.log("llego aqui sin rpoblema")

  console.log(req.body);
  let usuarioId;
  let fechaFiltro;

  if(req.session.inicioSesion === undefined){


  }else{
    usuarioId = req.session.inicioSesion.id;
  }
  
  const ahora = new Date();


    // Lo que te llega
    const {
      numero_habitaciones,
      numero_baños,
      superficie,
      precio,
      fecha,
      tipoPropiedad,
      operacion,
      direccion
    } = req.body;

    const query = {};

    const direccionInput = direccion.trim().replace(/\s*,\s*/g, "[\\s,]*"); 

    let direccionFinal = new RegExp(direccionInput, "i");

  // Operaciones y tipo de inmueble (si vienen)
  if (operacion)  query.operacion  = operacion;
  if (tipoPropiedad)  query.tipo  = tipoPropiedad;
  if (direccion)  query.direccion  = direccionFinal;

  // Habitaciones
  if (numero_habitaciones != null) {
    const num = parseInt(numero_habitaciones, 10); 
    if (!isNaN(num) && num > 0) {
      if (num === 3) {
        // 3 o más
        query.numero_habitaciones = { $gte: num };
      } else {
        // exactamente 1 o 2
        query.numero_habitaciones = num;
      }
    }
  }

  // Baños
  if (numero_baños != null) {
    const nb = parseInt(numero_baños, 10);
    if (!isNaN(nb) && nb > 0) {
      if (nb === 3) {
        // 3 o más
        query.numero_baños = { $gte: nb };
      } else {
        // exactamente 1 o 2
        query.numero_baños = nb;
      }
    }
  }

  // Superficie y precio, solo si el usuario envía un valor distinto de cero o vacío
  if (parseInt(superficie) > 0) query.superficie = parseInt(superficie);
  if (parseInt(precio) > 0 )    query.precio    = parseInt(precio);

  // Fecha de publicación
  if (fecha) {
    let fechaFiltro;
    if (fecha === 'mes') {
      fechaFiltro = new Date(ahora);
      fechaFiltro.setMonth(fechaFiltro.getMonth() - 1);
    } else if (fecha === 'semana') {
      fechaFiltro = new Date(ahora.getTime() - 7 * 24 * 3600 * 1000);
    } else if (fecha === '24h') {
      fechaFiltro = new Date(ahora.getTime() - 24 * 3600 * 1000);
    }
    if (fechaFiltro) {
      query.fecha_publicacion = { $gte: fechaFiltro };
    }
  }

  console.log("entro aqui fuera",query)

  //Ejecuto la consulta
  const resultados = await Propiedad.find(query);

  console.log(resultados)

  //Devolvemos la respuesta incluyendo el usuario
  return res.json({ busquedaFiltrada:resultados, usuarioId: String(usuarioId) });

});

router.post('/crearAlerta/:id', isAuthenticated , async function(req,res,next) {


  const propiedad = await Propiedad.findById(req.params.id);
  const usuario = await Usuario.findById(req.session.inicioSesion.id)

  console.log(usuario,propiedad);

  const alertaExiste = propiedad.alertas.some(a => a.toString() === req.session.inicioSesion.id)

  console.log(alertaExiste)

  if(alertaExiste){

    //si la alerta ya existe eso es que el usuario querra eliminarlo lo elimino
    propiedad.alertas.pull(req.session.inicioSesion.id);
    usuario.alertas.pull(propiedad._id);

    await usuario.save();
    await propiedad.save();
    return res.json({ok:true})

  }else{

    propiedad.alertas.push(req.session.inicioSesion.id);
    usuario.alertas.push(propiedad._id);

    await usuario.save();
    await propiedad.save();
    return res.json({ok:false})
  }

});

router.post('/crear_alerta_busqueda', isAuthenticated , async function(req,res,next) {

  function normalize(str) {
  return str
    .toLowerCase()
    // elimina todo lo que no sea letra, número o espacio
    .replace(/[^a-z0-9áéíóúüñ ]+/g, '')
    // colapsa múltiples espacios
    .replace(/\s+/g, ' ')
    .trim();
}
  
  const usuario = await Usuario.findById(req.session.inicioSesion.id);

  let { operacion, tipo, direccion } = req.body;

  direccion = normalize(direccion)

  const busqueda = `${operacion}/${tipo}/${direccion}`;

  const existe = await Usuario.findOne({

    _id: req.session.inicioSesion.id,
    busquedaUsuario: busqueda

  });
  console.log(usuario)
  console.log(existe)

  if(existe){

    usuario.busquedaUsuario.pull(busqueda);

    await usuario.save();
    return res.json({ok:true});
    
  }else{

    usuario.busquedaUsuario.push(`${operacion}/${tipo}/${direccion}`);
    await usuario.save();
    return res.json({ok:false})

  }

});

module.exports = router;
