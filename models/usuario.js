const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

//perfil del inquilino
const perfilInquilino = new Schema({

  personasVivienda : {type: Number, default: 1}, //numero de personas  que viviran en la propiedad
  tieneMascota : { type: Boolean, default: false}, // mascota si / no

  fechaMudanza: {
    type: String,
  },

  IngresosMensuales: {type: Number},
  cartaPresentacion: {type: String, maxlength: 1000},

}, {_id:false}); //evito que mongo me cree un id especifico para este subdocumento

const userSchema = new Schema({
  nombre: { type: String, required: false },
  apellidos: {type: String, required: false},
  email:  { type: String, required: true, unique:true },
  foto: {type: String},
  telefono:  { type: String, required: false},
  favoritos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'propiedad'
  }],

  propiedades: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'propiedad'
  }],

  perfilInquilino: perfilInquilino,

  codigoVerificacion: { type: String},
  codigoExpiracion: {type: Date},

  alertas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'propiedad',
  }],

  busquedaUsuario: [{
    type: String,
    maxlength: 200,
  }],

});

userSchema.methods.findEmail= async (email) => {
  const User = mongoose.model("user", userSchema);
  return  await User.findOne({'email': email})
  .then(result => {return result})
  .catch(error => console.log(error));

};


userSchema.methods.insert= async function () {
  //await this.save();
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

module.exports = mongoose.model('usuario', userSchema);