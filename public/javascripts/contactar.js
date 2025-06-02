lottie.loadAnimation({
    container: document.getElementById('contact-button'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/animations/animacion.json'
});

let propiedadId = null;
let successAnimationInstance = null;


document.getElementById('contact-button').addEventListener('click', async () => {

  const response = await fetch('/users/usuario-logueado');

  const data = await response.json();

  if(!data.logueado){
    window.location.href = "/users/login";
    return;
  }else{
    document.getElementById('contact-modal').style.display = 'flex';
  }
          
});

  
function cerrarModal() {
  
  document.getElementById('contact-modal').style.display = 'none';
  
}

document.getElementById('contact-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    propiedadId = document.getElementById('contact-button').dataset.id;



    const data = {
      mensaje: this.mensaje.value,
      propiedadId
    };

    try {
      const response = await fetch('/propiedad/contactar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });


      if (response.ok) {
        console.log("Correo enviado correctamente.");
        cerrarModal();
         // Mostrar animación de éxito
        const successScreen = document.getElementById('success-animation');
        successScreen.style.display = 'flex';

        // si tengo una animación previa, destruirla
        if (successAnimationInstance) {
          successAnimationInstance.destroy();
        }

        successAnimationInstance = lottie.loadAnimation({
          container: document.getElementById('success-lottie'),
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: '/animations/sentreal.json'
        });

        // oculto animación tras unos segundos
        setTimeout(() => {
          successScreen.style.display = 'none';
        }, 5200);

        this.reset();
      } else {
        console.log("Error al enviar el mensaje.", response);
      }
    } catch (error) {
      console.log("Hubo un problema al contactar al anunciante.");
      console.error(error);
    }
});



