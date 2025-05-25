var express = require('express');
var router = express.Router();
const Propiedad = require("../models/propiedad")
const Usuario = require("../models/usuario");
const { api_key_casas } = require('../keys');

// ruta de incio si existe el usuario manda el usuario al render y el estado cambia de null a true
router.get('/', async function(req, res, next) {
  let estado = null;
  const inicioSesion = req.session.inicioSesion || null;
  let busquedaVacia = false;
  let noticias = [];
  const pageSize = 5;
  const page = parseInt(req.query.page,10) || 1;
  const errorBusqueda = req.query.errorBusqueda === '1';

  if(errorBusqueda){
    busquedaVacia = true
  }

  var params = {
      api_token: api_key_casas,
      categories: 'business,tech',
      search: 'vivienda españa',
      limit: pageSize.toString(),
      page: page.toString()
  };



  var esc = encodeURIComponent;
  var query = Object.keys(params)
      .map(function(k) {return esc(k) + '=' + esc(params[k]);})
      .join('&');

  const response = await fetch(
      `https://api.thenewsapi.com/v1/news/all?${query}`,
      { method: 'GET' }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    noticias     = result.data || [];
    totalResults = result.meta?.found || 0;

  

  const propiedadesAleatorias = await Propiedad.aggregate([{$sample: {size:4}}])

  if(inicioSesion === null){
    res.render('index', { title: 'MiEspacioIdeal', estado, propiedadesAleatorias,busquedaVacia,noticias,page,pageSize});
  }else{
    estado = true
    const usuario = await Usuario.findById(req.session.inicioSesion.id)
    res.render('index', { title: 'MiEspacioIdeal', estado, usuario,propiedadesAleatorias,busquedaVacia,noticias,page,pageSize});
  }
  
});

module.exports = router;
