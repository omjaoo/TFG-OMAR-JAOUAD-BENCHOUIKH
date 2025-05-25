
const radios = document.querySelectorAll('input[name="tipo"]');

const radiosOperacion = document.querySelectorAll('input[name="operacion"]')

let divInfo = document.createElement('div');

const footer = document.querySelector('footer');

const divInsertar = document.querySelector('.div-tipo-propiedad');

let divActualizarFormu = document.getElementById('formularioTipo')

console.log(divInsertar)

divInfo.classList.add('info-box');

divInsertar.appendChild(divInfo)

/* footer.parentNode.insertBefore(divInfo, footer); */

divInfo.style.display = "none";
divActualizarFormu.style.display = "none";


function actualizarformulario(radio){

    divActualizarFormu.style.display = "flex";
    divActualizarFormu.style.flexDirection = "column"
    
    if(radio.value === "chalet" || radio.value === "casa"){

        divActualizarFormu.innerHTML = `

            <label>Piscina</label>
            <div style="margin-top: 30px; margin-bottom:20px; gap:20px">
                
                <input type="radio" name="piscina" value="true">
                Si
                <input type="radio" name="piscina" value="false">
                No
            </div>

            <label>Número Plantas</label>
            <input type="text" name="numero_plantas">
            
            
        `;

    }else if(radio.value === "piso"){

        divActualizarFormu.innerHTML = `
        
            <label>Ascensor</label>
            <div style="margin-top: 30px; margin-bottom:20px; gap:20px">
                
                <input type="radio" name="ascensor" value="true">
                Si
                <input type="radio" name="ascensor" value="false">
                No
            </div>

            <label>Planta</label>
            <input type="text" name="planta">
            
           

        `;

    }else if( radio.value === "condominio"){

        divActualizarFormu.innerHTML = `

            
            
            <label>Zonas Comunes</label>´
            <div style="margin-top: 30px; margin-bottom:20px; gap:20px">
                
                <input type="radio" name="zonaComun" value="true">
                Si
                <input type="radio" name="zonaComun" value="false">
                No
            </div>

            <label>Número Personas</label>
            <input type="text" name="numero_personas">
        

        `;

    }else{

        divActualizarFormu.innerHTML = "";

    }
}


function actualizarInfo(radio){

    divInfo.style.display = "block";


    if(radio.value === "chalet"){

        divInfo.innerHTML = `
            <img src="/images/chaletIconoReal.webp" alt="Chalet">
            <h4>Chalet</h4>
            <p>Vivienda unifamiliar, normalmente independiente y con jardín o parcela propia.</p>
        `;

    }else if(radio.value === "casa"){

        divInfo.innerHTML = `
            <img src="/images/casaiconoColor.webp" alt="Casa">
            <h4>Casa</h4>
            <p>Inmueble individual que puede compartir estructura con otras viviendas.</p>
        `;

    }else if(radio.value === "piso"){

        divInfo.innerHTML = `
            <img src="/images/edificiiooPisoColor.webp" alt="Piso">
            <h4>Piso</h4>
            <p>Vivienda situada en un edificio que comparte zonas comunes con otras viviendas.</p>
        `;

    }else if( radio.value === "condominio"){

        divInfo.innerHTML = `
            <img src="/images/condominio.png" alt="Condominio">
            <h4>Condominio</h4>
            <p>Vivienda dentro de un complejo residencial con zonas comunes compartidas como jardines, piscinas o áreas recreativas.</p>
        `;

    }else{

        divInfo.innerHTML = "";

    }
}

function precioDinamico(radio){

    let divOperacion = document.getElementById('precioPropiedad');

    divOperacion.style.display = "flex";
    divOperacion.style.flexDirection = "column";

    if(radio.value === "venta"){

        divOperacion.innerHTML = `
            <label>Precio de Venta</label>
            <input style="margin-top: 30px;" type="text" name="precio" placeholder="&#8364">
        `

    }else if(radio.value === "alquiler"){

        divOperacion.innerHTML = `
            <label>Precio de Alquiler</label>
            <input style="margin-top: 30px;" type="text" name="precio" placeholder="&#8364/mes">
        `

    }else{

        divOperacion.innerHTML = ""

    }
}

//actualizacion dinamica al recargar la pagina
window.addEventListener('DOMContentLoaded', () => {
  const radio = document.querySelector('input[name="tipo"]:checked');

  if (radio) {
    actualizarInfo(radio);
    actualizarformulario(radio);
  }

});



radios.forEach(radio => {
    radio.addEventListener('change', () => {

        if (radio.checked) {
            actualizarformulario(radio);
            actualizarInfo(radio)
            
        } else {
            actualizarformulario(radio);
            actualizarInfo(radio)
        }
    });
});

radiosOperacion.forEach(radio => {
    radio.addEventListener('change', () => {

        if (radio.checked) {
            precioDinamico(radio)
            
        } else {
            precioDinamico(radio)
        }
    });
});