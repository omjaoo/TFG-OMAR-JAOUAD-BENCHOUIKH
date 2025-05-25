window.addEventListener('load', () => {
    // Esto es opcional si usas la animación fadeOut
    setTimeout(() => {
      const loader = document.getElementById('loader');
      loader?.remove();
    }, 3600); // espera hasta que las animaciones terminen
});