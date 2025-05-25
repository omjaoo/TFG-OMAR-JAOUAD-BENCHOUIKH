

document.getElementById('limpiarFavoritos').addEventListener('click', async(e) => {
 // mostramos la confirmación
    const { isConfirmed } = await Swal.fire({
        title: '¿Estás seguro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'No, cancelar'
    });

    if (!isConfirmed) return;  // si cancela, salimos
    console.log("entra aqui")
     const response = await fetch('/users/limpiar-favoritos', {
        method: 'POST',
        credentials: 'include',
        headers: { 
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
         }
      });

      const data = await response.json();

      if(data.ok){
        
        window.location.reload();
        return
      }
})