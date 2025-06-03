/**
 * Script para generar e insertar 100 propiedades aleatorias en España
 * 
 * Este script utiliza Mongoose para conectarse a MongoDB y crear registros
 * de propiedades con datos aleatorios distribuidos por diferentes ciudades
 * de España, siguiendo el esquema proporcionado por el usuario.
 * 
 * Utiliza calles reales y verificables para cada ciudad, asegurando que las
 * direcciones generadas sean válidas cuando se verifiquen con APIs públicas.
 */

// Importar dependencias
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/es');

// Configuración de la conexión a MongoDB
// Reemplaza la URL con tu cadena de conexión
const MONGODB_URI = 'mongodb+srv://omar:CZl5U3I0dMJnz6Ob@cluster0.7qnys.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' ;

// Definir el esquema de Propiedad basado en el esquema proporcionado por el usuario
const propiedadSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['piso', 'chalet', 'condominio', 'casa'],
    required: true
  },
  descripcion: { type: String, required: true },
  operacion: { type: String, required: true },
  direccion: { type: String, required: true },
  superficie: { type: Number, required: true },
  precio: { type: Number, required: true },
  numero_habitaciones: { type: Number },
  numero_baños: { type: Number },
  imagenes: [String],
  propietario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usuario',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usuario',
  }],
  alertas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usuario'
  }],
  // Atributos exclusivos por tipo:
  planta: Number,               // Piso
  ascensor: Boolean,            // Piso
  numero_plantas: Number,       // Chalet, Casa
  piscina: Boolean,             // Chalet, Casa
  numero_personas: Number,      // Condominio
  zonas_comunes: Boolean,       // Condominio
  fecha_publicacion: {
    type: Date,
  },
  ubicacion: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [lon, lat]
      required: true
    }
  }
});

// Crear el modelo
const Propiedad = mongoose.model('propiedad', propiedadSchema);

// Datos para generar propiedades aleatorias
const callesRealesPorCiudad = {
  // Madrid - Calles reales y principales
  madrid: [
    "Gran Vía",
    "Paseo de la Castellana",
    "Calle Mayor",
    "Calle de Alcalá",
    "Paseo del Prado",
    "Calle Serrano",
    "Calle Goya",
    "Calle Princesa",
    "Puerta del Sol",
    "Calle Fuencarral",
    "Calle Atocha",
    "Calle Velázquez",
    "Calle Hortaleza",
    "Calle de Preciados",
    "Calle Génova"
  ],
  
  // Barcelona - Calles reales y principales
  barcelona: [
    "Passeig de Gràcia",
    "La Rambla",
    "Avinguda Diagonal",
    "Carrer de Sants",
    "Carrer Gran de Gràcia",
    "Carrer Ferran",
    "Carrer Montcada",
    "Carrer Princesa",
    "Carrer del Bisbe",
    "Passeig del Born",
    "Carrer Petritxol",
    "Carrer Tallers",
    "Carrer Portaferrissa",
    "Carrer Jaume I",
    "Carrer Balmes"
  ],
  
  // Valencia - Calles reales y principales
  valencia: [
    "Calle Colón",
    "Calle de la Paz",
    "Avenida del Puerto",
    "Calle Sevilla",
    "Calle Cádiz",
    "Calle Lérida",
    "Calle Reus",
    "Calle General Elio",
    "Calle Reina Doña Germana",
    "Avenida Peris y Valero",
    "Calle Doctor Machí",
    "Calle Doctor Olóriz",
    "Calle Doctor Montoro",
    "Calle Joaquín Ballester",
    "Calle Padre Ferris"
  ],
  
  // Sevilla - Calles reales y principales
  sevilla: [
    "Calle Betis",
    "Calle Feria",
    "Calle Sierpes",
    "Calle del Agua",
    "Calle Mateos Gago",
    "Paseo Colón",
    "Calle Regina",
    "Calle San Luis",
    "Calle Tetuán",
    "Avenida de la Constitución",
    "Calle Adriano",
    "Calle Alemanes",
    "Calle Alfalfa",
    "Calle Álvarez Quintero",
    "Calle Amor de Dios"
  ],
  
  // Zaragoza - Calles reales y principales
  zaragoza: [
    "Paseo Independencia",
    "Calle Alfonso",
    "Gran Vía",
    "Paseo Sagasta",
    "Calle Don Jaime I",
    "Avenida Goya",
    "Calle Coso",
    "Paseo Constitución",
    "Calle San Miguel",
    "Avenida César Augusto",
    "Calle León XIII",
    "Calle Delicias",
    "Calle Predicadores",
    "Avenida Madrid",
    "Calle San Vicente de Paúl"
  ],
  
  // Málaga - Calles reales y principales
  malaga: [
    "Calle Marqués de Larios",
    "Calle Granada",
    "Alameda Principal",
    "Paseo del Parque",
    "Calle Alcazabilla",
    "Calle Carretería",
    "Calle Compañía",
    "Calle Nueva",
    "Calle Comedias",
    "Calle Álamos",
    "Calle Victoria",
    "Calle Molina Lario",
    "Calle Strachan",
    "Calle Calderería",
    "Calle San Juan"
  ],
  
  // Murcia - Calles reales y principales
  murcia: [
    "Gran Vía Escultor Salzillo",
    "Calle Trapería",
    "Calle Platería",
    "Avenida de la Libertad",
    "Calle Alfonso X El Sabio",
    "Calle Floridablanca",
    "Avenida de la Constitución",
    "Calle Santa Clara",
    "Calle Jabonerías",
    "Calle Pascual",
    "Calle Sociedad",
    "Calle Frenería",
    "Calle San Nicolás",
    "Calle Madre de Dios",
    "Calle Alejandro Séiquer"
  ],
  
  // Palma de Mallorca - Calles reales y principales
  palmaDeMallorca: [
    "Passeig del Born",
    "Calle Sant Miquel",
    "Avenida Jaume III",
    "Calle Sindicato",
    "Calle Colón",
    "Paseo Marítimo",
    "Calle Unió",
    "Calle Aragón",
    "Calle Blanquerna",
    "Calle 31 de Diciembre",
    "Calle Olmos",
    "Calle San Felio",
    "Calle Apuntadores",
    "Calle Rambla",
    "Calle Conquistador"
  ],
  
  // Las Palmas de Gran Canaria - Calles reales y principales
  lasPalmasDeGranCanaria: [
    "Calle Mayor de Triana",
    "Calle León y Castillo",
    "Avenida Marítima",
    "Calle Alicante",
    "Calle Mesa y López",
    "Calle Venegas",
    "Calle Perojo",
    "Calle Pérez Galdós",
    "Calle Domingo J. Navarro",
    "Calle Tomás Morales",
    "Calle Bravo Murillo",
    "Calle Concejal García Feo",
    "Calle Secretario Artiles",
    "Calle Carvajal",
    "Calle Malteses"
  ],
  
  // Bilbao - Calles reales y principales
  bilbao: [
    "Gran Vía de Don Diego López de Haro",
    "Calle Rodríguez Arias",
    "Alameda de Recalde",
    "Calle Licenciado Poza",
    "Calle Ercilla",
    "Calle Henao",
    "Calle Elcano",
    "Calle Autonomía",
    "Calle Alameda de Urquijo",
    "Calle Hurtado de Amézaga",
    "Calle Colón de Larreátegui",
    "Calle Iparraguirre",
    "Calle Ledesma",
    "Calle Diputación",
    "Calle Bidebarrieta"
  ],
  
  // Alicante - Calles reales y principales
  alicante: [
    "Avenida Federico Soto",
    "Paseo Explanada de España",
    "Rambla de Méndez Núñez",
    "Calle San Francisco",
    "Calle Mayor",
    "Avenida Alfonso X El Sabio",
    "Calle Castaños",
    "Calle San Fernando",
    "Calle Gerona",
    "Calle Teatro",
    "Calle Rafael Altamira",
    "Calle Bailén",
    "Calle Pascual Pérez",
    "Calle Calderón de la Barca",
    "Calle Segura"
  ],
  
  // Córdoba - Calles reales y principales
  cordoba: [
    "Calle Cruz Conde",
    "Calle Gondomar",
    "Calle Concepción",
    "Calle Jesús María",
    "Calle Claudio Marcelo",
    "Calle Caballerizas Reales",
    "Calle Deanes",
    "Calle Judería",
    "Calle Cardenal Herrero",
    "Calle Lucano",
    "Calle Romero Barros",
    "Calle Diario de Córdoba",
    "Calle San Fernando",
    "Calle Ambrosio de Morales",
    "Calle Ángel de Saavedra"
  ],
  
  // Valladolid - Calles reales y principales
  valladolid: [
    "Calle Santiago",
    "Calle Mantería",
    "Calle Ferrari",
    "Calle Teresa Gil",
    "Calle Platerias",
    "Calle Duque de la Victoria",
    "Calle Miguel Íscar",
    "Calle Doctrinos",
    "Calle Constitución",
    "Calle Fray Luis de León",
    "Calle Gamazo",
    "Calle López Gómez",
    "Calle Claudio Moyano",
    "Calle Montero Calvo",
    "Calle Menéndez Pelayo"
  ],
  
  // Vigo - Calles reales y principales
  vigo: [
    "Calle Príncipe",
    "Calle Urzáiz",
    "Calle Gran Vía",
    "Calle Policarpo Sanz",
    "Calle Colón",
    "Calle Arenal",
    "Calle Rosalía de Castro",
    "Calle Velázquez Moreno",
    "Calle Carral",
    "Calle Elduayen",
    "Calle Marqués de Valladares",
    "Calle Oporto",
    "Calle García Barbón",
    "Calle Areal",
    "Calle Doctor Cadaval"
  ],
  
  // Gijón - Calles reales y principales
  gijon: [
    "Calle Corrida",
    "Calle Uría",
    "Calle San Bernardo",
    "Calle Menéndez Valdés",
    "Calle Covadonga",
    "Calle Magnus Blikstad",
    "Calle Cabrales",
    "Calle Langreo",
    "Calle Marqués de San Esteban",
    "Calle Álvarez Garaya",
    "Calle Libertad",
    "Calle Instituto",
    "Calle Asturias",
    "Calle Jovellanos",
    "Calle Carlos Marx"
  ]
};

// Datos de ciudades con coordenadas
const ciudadesConCoordenadas = [
  { ciudad: 'Madrid', lat: 40.4168, lng: -3.7038, calles: callesRealesPorCiudad.madrid },
  { ciudad: 'Barcelona', lat: 41.3851, lng: 2.1734, calles: callesRealesPorCiudad.barcelona },
  { ciudad: 'Valencia', lat: 39.4699, lng: -0.3763, calles: callesRealesPorCiudad.valencia },
  { ciudad: 'Sevilla', lat: 37.3891, lng: -5.9845, calles: callesRealesPorCiudad.sevilla },
  { ciudad: 'Zaragoza', lat: 41.6488, lng: -0.8891, calles: callesRealesPorCiudad.zaragoza },
  { ciudad: 'Málaga', lat: 36.7213, lng: -4.4214, calles: callesRealesPorCiudad.malaga },
  { ciudad: 'Murcia', lat: 37.9922, lng: -1.1307, calles: callesRealesPorCiudad.murcia },
  { ciudad: 'Palma de Mallorca', lat: 39.5696, lng: 2.6502, calles: callesRealesPorCiudad.palmaDeMallorca },
  { ciudad: 'Las Palmas de Gran Canaria', lat: 28.1235, lng: -15.4366, calles: callesRealesPorCiudad.lasPalmasDeGranCanaria },
  { ciudad: 'Bilbao', lat: 43.2630, lng: -2.9350, calles: callesRealesPorCiudad.bilbao },
  { ciudad: 'Alicante', lat: 38.3452, lng: -0.4815, calles: callesRealesPorCiudad.alicante },
  { ciudad: 'Córdoba', lat: 37.8882, lng: -4.7794, calles: callesRealesPorCiudad.cordoba },
  { ciudad: 'Valladolid', lat: 41.6523, lng: -4.7245, calles: callesRealesPorCiudad.valladolid },
  { ciudad: 'Vigo', lat: 42.2328, lng: -8.7226, calles: callesRealesPorCiudad.vigo },
  { ciudad: 'Gijón', lat: 43.5322, lng: -5.6611, calles: callesRealesPorCiudad.gijon }
];

// Tipos de propiedad y operación
const tiposPropiedad = ['piso', 'chalet', 'condominio', 'casa'];
const tiposOperacion = ['venta', 'alquiler'];

// Nombres de imágenes (asumiendo que existen en tu sistema)
const imagenesPropiedad = [
  '/uploadsPropiedades/681a0cfe95aa832288643b8e/salon.jpg', '/uploadsPropiedades/681a0cfe95aa832288643b8e/cocina.jpg', 
  '/uploadsPropiedades/681a0cfe95aa832288643b8e/dormitorio.jpg', '/uploadsPropiedades/681a0cfe95aa832288643b8e/baño.jpg',
  '/uploadsPropiedades/681a0cfe95aa832288643b8e/patio.jpg', '/uploadsPropiedades/681a0cfe95aa832288643b8e/dormitorio2.jpg', 
  '/uploadsPropiedades/681a0cfe95aa832288643b8e/ban2.jpg', '/uploadsPropiedades/681a0cfe95aa832288643b8e/ban1.jpg',
  '/uploadsPropiedades/681a0cfe95aa832288643b8e/hab3.jpg', '/uploadsPropiedades/681a0cfe95aa832288643b8e/pisci.jpg', 
  '/uploadsPropiedades/681a0cfe95aa832288643b8e/ban7.jpg', '/uploadsPropiedades/681a0cfe95aa832288643b8e/cocinamos.jpg'
];

// Función para generar una dirección aleatoria con calles reales de la ciudad correspondiente
const generarDireccion = (ciudadInfo) => {
  // Usamos las calles específicas de la ciudad seleccionada
  const calles = ciudadInfo.calles;
  const calle = calles[Math.floor(Math.random() * calles.length)];
  const numero = Math.floor(Math.random() * 100) + 1;
  return `${calle}, ${numero}, ${ciudadInfo.ciudad}`;
};

// Función para generar imágenes aleatorias (entre 5 y 7 imágenes)
const generarImagenes = () => {
  const numImagenes = Math.floor(Math.random() * 7) + 5;
  const imagenes = [];
  
  for (let i = 0; i < numImagenes; i++) {
    const imagen = imagenesPropiedad[Math.floor(Math.random() * imagenesPropiedad.length)];
    if (!imagenes.includes(imagen)) {
      imagenes.push(imagen);
    }
  }
  
  return imagenes;
};

// Función para generar descripciones específicas según el tipo de propiedad
const generarDescripcion = (tipo, superficie, habitaciones, baños) => {
  let descripcionBase = '';
  
  switch (tipo) {
    case 'casa':
      descripcionBase = `Magnífica casa de ${superficie} m² con ${habitaciones} habitaciones y ${baños} baños. `;
      descripcionBase += 'Ideal para familias que buscan tranquilidad y espacio. ';
      descripcionBase += faker.lorem.paragraph(3);
      break;
    case 'piso':
      descripcionBase = `Acogedor piso de ${superficie} m² con ${habitaciones} habitaciones y ${baños} baños. `;
      descripcionBase += 'Ubicado en una zona con todos los servicios. ';
      descripcionBase += faker.lorem.paragraph(3);
      break;
    case 'chalet':
      descripcionBase = `Espectacular chalet de ${superficie} m² con ${habitaciones} habitaciones y ${baños} baños. `;
      descripcionBase += 'Amplio jardín y zonas exteriores para disfrutar. ';
      descripcionBase += faker.lorem.paragraph(3);
      break;
    case 'condominio':
      descripcionBase = `Exclusivo condominio de ${superficie} m² con ${habitaciones} habitaciones y ${baños} baños. `;
      descripcionBase += 'Disfrute de las ventajas de vivir en comunidad con servicios compartidos. ';
      descripcionBase += faker.lorem.paragraph(3);
      break;
  }
  
  return descripcionBase;
};

// Función para generar precios realistas según tipo, tamaño y ubicación
const generarPrecio = (tipo, superficie, ciudad, operacion) => {
  // Precios base por m² según ciudad (aproximados)
  const preciosPorCiudad = {
    'Madrid': 4000,
    'Barcelona': 4200,
    'Valencia': 2000,
    'Sevilla': 2200,
    'Zaragoza': 1800,
    'Málaga': 2500,
    'Murcia': 1500,
    'Palma de Mallorca': 3000,
    'Las Palmas de Gran Canaria': 2300,
    'Bilbao': 2800,
    'Alicante': 1900,
    'Córdoba': 1700,
    'Valladolid': 1600,
    'Vigo': 1800,
    'Gijón': 1700
  };
  
  // Multiplicadores según tipo de propiedad
  const multiplicadorTipo = {
    'piso': 1.0,
    'casa': 1.2,
    'chalet': 1.5,
    'condominio': 1.1
  };
  
  // Multiplicadores según operación
  const multiplicadorOperacion = {
    'venta': 1.0,
    'alquiler': 0.004, // Precio mensual aproximado (0.4% del valor de venta)
    'alquiler temporal': 0.008 // Precio mensual aproximado (0.8% del valor de venta)
  };
  
  // Calcular precio base
  let precioBase = superficie * preciosPorCiudad[ciudad] * multiplicadorTipo[tipo];
  
  // Añadir variación aleatoria (±15%)
  const variacion = 0.85 + (Math.random() * 0.3);
  precioBase = precioBase * variacion;
  
  // Aplicar multiplicador según operación
  precioBase = precioBase * multiplicadorOperacion[operacion];
  
  // Redondear a miles para venta, a decenas para alquiler
  if (operacion === 'venta') {
    return Math.round(precioBase / 1000) * 1000;
  } else {
    return Math.round(precioBase / 10) * 10;
  }
};

// Función para generar una propiedad aleatoria
const generarPropiedad = (propietarioId) => {
  // Seleccionar una ciudad aleatoria
  const ciudadAleatoria = ciudadesConCoordenadas[Math.floor(Math.random() * ciudadesConCoordenadas.length)];
  
  // Generar pequeñas variaciones en las coordenadas para que no estén todas en el mismo punto
  const latVariacion = (Math.random() * 0.02 - 0.01);
  const lngVariacion = (Math.random() * 0.02 - 0.01);
  
  const latitud = ciudadAleatoria.lat + latVariacion;
  const longitud = ciudadAleatoria.lng + lngVariacion;
  
  // Seleccionar un tipo de propiedad aleatorio
  const tipo = tiposPropiedad[Math.floor(Math.random() * tiposPropiedad.length)];
  
  // Seleccionar un tipo de operación aleatorio
  const operacion = tiposOperacion[Math.floor(Math.random() * tiposOperacion.length)];
  
  // Generar superficie y habitaciones de forma realista según el tipo
  let superficie, habitaciones, baños;
  
  switch (tipo) {
    case 'piso':
      superficie = faker.number.int({ min: 40, max: 200 });
      habitaciones = Math.min(Math.floor(superficie / 25), 5);
      baños = Math.min(Math.floor(habitaciones / 2) + 1, 3);
      break;
    case 'casa':
      superficie = faker.number.int({ min: 80, max: 300 });
      habitaciones = Math.min(Math.floor(superficie / 30), 6);
      baños = Math.min(Math.floor(habitaciones / 2) + 1, 4);
      break;
    case 'chalet':
      superficie = faker.number.int({ min: 120, max: 500 });
      habitaciones = Math.min(Math.floor(superficie / 40), 8);
      baños = Math.min(Math.floor(habitaciones / 2) + 1, 5);
      break;
    case 'condominio':
      superficie = faker.number.int({ min: 60, max: 250 });
      habitaciones = Math.min(Math.floor(superficie / 30), 5);
      baños = Math.min(Math.floor(habitaciones / 2) + 1, 3);
      break;
  }
  
  // Generar datos base para todas las propiedades
  const propiedadBase = {
    tipo,
    descripcion: generarDescripcion(tipo, superficie, habitaciones, baños),
    operacion,
    direccion: generarDireccion(ciudadAleatoria),
    superficie,
    precio: generarPrecio(tipo, superficie, ciudadAleatoria.ciudad, operacion),
    numero_habitaciones: habitaciones,
    numero_baños: baños,
    imagenes: generarImagenes(),
    propietario: propietarioId,
    likes: [],  // Array vacío como solicitó el usuario
    alertas: [], // Array vacío como solicitó el usuario
    fecha_publicacion: faker.date.past({ years: 1 }),
    ubicacion: {
      type: 'Point',
      coordinates: [longitud, latitud] // [longitud, latitud] en formato GeoJSON
    }
  };
  
  // Añadir atributos específicos según el tipo de propiedad
  switch (tipo) {
    case 'piso':
      propiedadBase.planta = faker.number.int({ min: 0, max: 10 });
      propiedadBase.ascensor = faker.datatype.boolean();
      break;
    case 'chalet':
      propiedadBase.numero_plantas = faker.number.int({ min: 1, max: 3 });
      propiedadBase.piscina = faker.datatype.boolean();
      break;
    case 'casa':
      propiedadBase.numero_plantas = faker.number.int({ min: 1, max: 2 });
      propiedadBase.piscina = faker.datatype.boolean();
      break;
    case 'condominio':
      propiedadBase.numero_personas = faker.number.int({ min: 2, max: 10 });
      propiedadBase.zonas_comunes = faker.datatype.boolean();
      break;
  }
  
  return propiedadBase;
};

// Función principal para insertar las propiedades
const insertarPropiedades = async (propietarioId, cantidad = 100) => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Conexión a MongoDB establecida');
    
    // Array para almacenar las propiedades generadas
    const propiedades = [];
    
    // Generar propiedades aleatorias
    for (let i = 0; i < cantidad; i++) {
      propiedades.push(generarPropiedad(propietarioId));

    }

    // Insertar todas las propiedades de golpe
    let resultado3 = await Propiedad.insertMany(propiedades);
    console.log(`Se han insertado ${resultado.length} propiedades con éxito`);

    // Obtener el array de _id de las propiedades recién insertadas
    const idsPropiedades = resultado3.map(p => p._id);

    // Hacer un único push con $each al array 'propiedades' del usuario
    await Usuario.findByIdAndUpdate(
      propietarioId,
      { $push: { propiedades: { $each: idsPropiedades } } },
      { new: true, useFindAndModify: false }
    );
    
    // Insertar las propiedades en la base de datos
    const resultado = await Propiedad.insertMany(propiedades);
    
    console.log(`Se han insertado ${resultado.length} propiedades con éxito`);
    
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
    
    return resultado;
  } catch (error) {
    console.error('Error al insertar propiedades:', error);
    
    // Asegurar que la conexión se cierre en caso de error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Conexión a MongoDB cerrada después de error');
    }
    
    throw error;
  }
};

// Ejecutar el script si se llama directamente
if (require.main === module) {
  // Reemplaza este ID con el ID real del propietario
  const PROPIETARIO_ID = '683df0de124cfa7092708b2c';
  
  insertarPropiedades(PROPIETARIO_ID)
    .then(() => {
      console.log('Script completado con éxito');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en el script:', error);
      process.exit(1);
    });
}

// Exportar la función para uso en otros scripts
module.exports = { insertarPropiedades };

