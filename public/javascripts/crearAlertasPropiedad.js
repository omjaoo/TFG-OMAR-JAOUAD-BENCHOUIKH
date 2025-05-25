document.getElementById('crearAlerta').addEventListener('click', async (e) => {

    e.preventDefault();

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


    const tipo = document.getElementById('tipoPropiedad').value
    const direccion = document.getElementById('direccion').value
    const operacion = document.getElementById('operacion').value

    const datos = {tipo,direccion,operacion}

    let  id = document.getElementById('crearAlerta').dataset.id;
    let buttonAlerta = document.getElementById('crearAlerta');

    const response = await fetch(`/propiedad/crear_alerta_busqueda`,{

        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Requested-With' : 'XMLHttpRequest',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)

    });

    const result = await response.json();

    if(!result.ok){
        buttonAlerta.textContent = "Eliminar Alerta para esta busqueda"; 
        console.log("entra aqui")
    }else{
        buttonAlerta.textContent = "Crear alerta para esta busqueda";
    }

});