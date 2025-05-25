document.getElementById('formanuncio').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  // Validación básica
  const requiredFields = [
    'tipo', 'operacion', 'localidad', 'nombreVia', 'numeroVia',
    'superficie', 'numero_habitaciones', 'numBa', 'descripcion'
  ];

  let valid = true;

  // Verifica que todos los campos estén completos
  for (const name of requiredFields) {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input || input.value.trim() === '') {
      valid = false;
      break;
    }
  }

  // Verifica si hay al menos una imagen seleccionada
  const imagenes = form.querySelector('#imagenes');
  if (!imagenes || imagenes.files.length === 0) {
    valid = false;
  }

  if (!valid) {
    console.log('Formulario inválido: mostrando overlay de error');
    // Mostrar overlay de error
    document.getElementById('overlay-error').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('overlay-error').style.display = 'none';
    }, 1000);

    return;

  }else{

    const response = await fetch("/propiedad/propiedadPublicar", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (result.ok) {

      document.getElementById('overlay-exito').style.display = 'flex';
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      
    }else{
      Swal.fire({
        icon: "error",
        title: "Direccion no encontrada",
        text: "Introduzca una direccion valida."
      });

      return
    }

  }
   
});
