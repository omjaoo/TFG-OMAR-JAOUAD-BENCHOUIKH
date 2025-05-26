var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const MongoStore = require('connect-mongo');
const cors = require('cors');






const loginRouter = require('./routes/login');
const passport = require("passport");
const session = require('express-session');
const mongoose = require('mongoose');
const { mongodb } = require('./keys');


require('./middleware/google');
require('./database'); 


var app = express();
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

console.log('static folder:', path.join(__dirname, 'public'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var perfilRouter = require('./routes/perfil');
var propiedadRouter = require('./routes/propiedades');

// Sesiones para Passport
app.use(session({
  name: 'miCookieSesion', //nombre de la cookie de sesion
  secret: 'unsecretoseguro123',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000   
    
  },

  store: MongoStore.create({
    mongoUrl: mongodb.URI,
    ttl: 30 * 24 * 60 * 60             
  })
}));

app.use('/', require('./routes/perfil'));

//usuario disponible en todas las vistas
app.use((req, res, next) => {
  // si no hay sesión, será null
  res.locals.usuario = req.session.inicioSesion || null;
  next();
});

app.use('/', indexRouter);
app.use('/perfil', perfilRouter)
app.use('/propiedad', propiedadRouter)
app.use('/users', usersRouter);
app.use('/auth', require('./routes/login'))

// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors({
  origin: 'http://localhost:3000',  // O permite solo tu frontend, por ejemplo: 'http://localhost:5500'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Permite que las cookies se envíen con las peticiones

}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());


//autenticado con Google
app.use("/auth", loginRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



/* Esto al final siempre Omar */
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


