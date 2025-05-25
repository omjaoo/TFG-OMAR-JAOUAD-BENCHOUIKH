const Usuario = require('../models/usuario');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


passport.use("auth-google",new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"

  },
  
  async function(accessToken, refreshToken, profile, cb) {
    
    const googleEmail = profile.emails[0].value;

    console.log("aqyu email del usuario",googleEmail)

    let usuario = await Usuario.findOne({email: googleEmail});

    if(usuario){
      //ya se ha registrado
      return cb(null,usuario)
    }else{
      //no se ha registrado asi que proocedo a crearlo
      let usuario = new Usuario ({
        nombre: profile.name.givenName,
        apellidos: profile.name.familyName || '',
        email: googleEmail,
        foto: "",
        telefono: ''
      })

      await usuario.save();
      return cb(null,usuario)
    }

  }
));