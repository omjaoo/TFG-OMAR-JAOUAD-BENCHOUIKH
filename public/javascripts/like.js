document.querySelectorAll('.like-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', async () => {
      const id = wrapper.dataset.id;

      const response = await fetch('/users/usuario-logueado', {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      const data = await response.json();

      if(!data.logueado){
        window.location.href = "/users/login";
        return;
      }


      try {
        const response = await fetch(`/propiedad/like/${id}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          wrapper.classList.toggle('liked');
        } else {
          console.log("Error al dar like");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("No se pudo conectar");
      }
    });
});

