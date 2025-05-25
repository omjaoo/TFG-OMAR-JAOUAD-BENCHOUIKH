document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([40.4168, -3.7038], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const drawnItems = new L.FeatureGroup().addTo(map);

  /* const iconos = {
    piso: L.icon({
      iconUrl: '/images/office-building.png',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48]
    }),
    casa: L.icon({
      iconUrl: '/images/circle.png',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48]
    }),
    chalet: L.icon({
      iconUrl: '/images/chalet.png',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48]
    }),
    condominio: L.icon({
      iconUrl: '/images/viral-marketing.png',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48]
    })
  }; */


  const drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: {
      polygon: true,
      rectangle: true,
      circle: false,
      marker: false,
      polyline: false,
      circlemarker: false
    }
  });
  map.addControl(drawControl);

  let currentMarkers = [];

  map.on('draw:created', async function (e) {
    const layer = e.layer;
    drawnItems.clearLayers();
    drawnItems.addLayer(layer);

    let latlngs = [];

    // Rectángulo o polígono
    if (layer.getLatLngs) {
      latlngs = layer.getLatLngs()[0].map(p => [p.lat, p.lng]); // Formato [lat, lng]
    } else if (layer.getBounds) {
      const bounds = layer.getBounds();
      latlngs = [
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthWest().lat, bounds.getNorthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
        [bounds.getSouthEast().lat, bounds.getSouthEast().lng],
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng]
      ];
    }

    // POST al backend
    const res = await fetch('/propiedad/mapa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area: latlngs })
    });

    const data = await res.json();

    console.log("Propiedades recibidas:", data.propiedades);


    // Limpia marcadores anteriores
    currentMarkers.forEach(m => map.removeLayer(m));
    currentMarkers = [];

    // Añade nuevos
    data.propiedades.forEach((p, index) => {

      const precioFormateado = Number(p.precio).toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
      });

      let [lon, lat] = p.ubicacion.coordinates;
      // Pequeño desplazamiento para que no se solapen (en metros aprox.)
      const offset = index * 0.0001;
      lat += offset;
      lon += offset;
      console.log(p.tipo)
      /* const icono = iconos[p.tipo] || undefined; */
      const marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`
                    <div style="width: 200px;">
                      <img src="${p.imagenes?.[0] || '/img/default.jpg'}" 
                          alt="Imagen propiedad"
                          style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;">
                      <div style="margin-top: 8px;">
                        <strong>${p.tipo.toUpperCase()}</strong><br>
                        <span style="font-size: 0.9em; color: #555;">${p.direccion}</span><br>
                        <span style="color: green; font-weight: bold;">${precioFormateado}</span><br>
                        <a href="/propiedad/detalles/${p._id}" 
                          style="color: #007bff; text-decoration: none; font-weight: bold;">
                          Ver detalle →
                        </a>
                      </div>
                    </div>
                  `);
      currentMarkers.push(marker);
    });
  });
});


