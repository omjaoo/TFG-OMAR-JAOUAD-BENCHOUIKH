//declaro el input 

//cojo el click en fecha_exacta
let fechaInput = document.getElementById('fechaClick');
console.log(fechaInput)
const radios = document.querySelectorAll('input[name="mudanza"]');
const divFecha = document.getElementById('divFecha');
radios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (document.getElementById('fechaClick').checked) {
            divFecha.innerHTML = "<input type='date' name='fecha_exacta'>";
        } else {
            divFecha.innerHTML = "";
        }
    });
});