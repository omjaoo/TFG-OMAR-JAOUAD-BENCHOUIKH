const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema({
  nombre: { type: String, required: true },
  apellidos: {type: String, required: false},
  email:  { type: String, required: true, unique:true },
  telefono:  { type: String, required: false},

  propiedades: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'propiedad'
  }],

  codigoVerificacion: { type: String},
  codigoExpiracion: {type: Date}

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