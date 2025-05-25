function renPropiedades(x,usuarioId){

    document.querySelector('.contenedor-propiedades').innerHTML = "";

    document.querySelector('.contenedor-propiedades').innerHTML = 
    
        x.map(prop => `
          <div class="tarjeta-propiedad">
            <img src="${ prop.imagenes[0] }" alt="Imagen propiedad" class="imagen-propiedad" />
            <div class="info-propiedad">
              <h2>
                ${ prop.tipo.toUpperCase()} en ${ prop.direccion }
              </h2>
              <p class="precio">€ ${ prop.precio.toLocaleString('es-ES') }
              </p>
              <p class="fecha-publicacion">
                Publicado el ${ new Date(prop.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric' ,
                  month: 'long' , year: 'numeric' }) }
              </p>
              <p>
                ${prop.numero_habitaciones } habitaciones • ${ prop.numero_baños } baños • ${ prop.superficie }
                      m²
              </p>
              <p class="descripcion">
                ${prop.descripcion.slice(0, 120)}...
              </p>
              <div class="like-wrapper ${prop.likes.includes(usuarioId) ? 'liked' : '' }" onclick="toggleLike('${prop._id}',this)" data-id="${ prop._id }">
                <svg class="icono-like" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21s-6.5-4.8-9.5-8.2C.6 9.2 2.5 5 6 5c1.8 0 3.4 1 4.1 2.4C11.6 6 13.2 5 15 5c3.5 0 5.4 4.2 3.5 7.8C18.5 16.2 12 21 12 21z"
                    stroke="#e84118" stroke-width="2" fill="transparent" />
                </svg>
              </div>
              <a href="/propiedad/detalles/${prop._id}" data-id="${ prop._id }" class="boton-ver">Ver detalle</a>
            </div>
          </div>
    `).join('')
}

// función global que se invoca desde el onclick
async function toggleLike(propId, el) {

   const response = await fetch('/users/usuario-logueado', {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      const data = await response.json();

      if(!data.logueado){
        window.location.href = "/users/login";
        return;
      }



  const res = await fetch(`/propiedad/like/${propId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) return alert('Error al dar like');
  el.classList.toggle('liked');
}

document.getElementById('filtroForm').addEventListener("submit", async (e) => {
    e.preventDefault()
    const datos = {
      numero_habitaciones : document.querySelector('input[name="habitaciones"]:checked').value,
      numero_baños : document.querySelector('input[name="banos"]:checked').value,
      superficie : document.getElementById('superficie').value,
      precio : document.getElementById('precio').value,
      fecha : document.getElementById('fecha').value,
      tipoPropiedad: document.getElementById('tipoPropiedad').value,
      operacion: document.getElementById('operacion').value,
      direccion: document.getElementById('direccion').value

    }

    console.log(datos)

    const response = await fetch(`/propiedad/buscadorFiltrado`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type':     'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(datos)
    });

    const result = await response.json();
    const {busquedaFiltrada, usuarioId} = result

    

    console.log(busquedaFiltrada, usuarioId)

    if(busquedaFiltrada.length === 0){

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No hay resultados que coincidan con tu busqueda",
      });

    }else{

      renPropiedades(busquedaFiltrada,usuarioId)

    }



})