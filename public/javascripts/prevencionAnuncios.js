document.querySelectorAll('.form-eliminar').forEach(form => {
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Evita el envío inmediato

        Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo'
        }).then((result) => {
        if (result.isConfirmed) {
            form.submit(); // Solo se envía si confirma
        }
    });
    });
});
