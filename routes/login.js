const express  = require("express");
const passport = require("passport")

const loginRouter = express.Router();

loginRouter.get('/google',
    passport.authenticate('auth-google', { scope: ['profile', 'email'] })
  );
  

// Ruta de callback donde directamente muestras los datos
loginRouter.get("/google/callback", passport.authenticate("auth-google", {
    failureRedirect: "/login",
    session: false
}), (req, res) => {
    const usuario = req.user; // El usuario que ha iniciado sesión

    // Aquí pintamos directamente la información
    res.redirect('/users/login');
});


module.exports = loginRouter;