const mongoose = require('mongoose'); 

const propiedadSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['piso', 'chalet', 'condominio', 'casa'],
    required: true
  },
  descripcion : {type:String, require: true},
  operacion : {type: String, require: true},
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
    enum: ['Propiedad', 'Busqueda'] 
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

  piscina: Boolean,
  numero_plantas: Number,            // Casa

  numero_personas: Number,      // Condominio
  zonas_comunes: Boolean,        // Condominio

  fecha_publicacion: {
    type:Date,
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

module.exports = mongoose.model('propiedad', propiedadSchema);
