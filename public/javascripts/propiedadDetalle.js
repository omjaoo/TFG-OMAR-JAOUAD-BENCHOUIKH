document.querySelectorAll('.boton-ver').forEach(boton => {
    boton.addEventListener('click', async () => {
      const id = boton.dataset.id;
        window.location.href = `/propiedad/detalles/${id}`
       
    });
});
