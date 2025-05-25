document.addEventListener('DOMContentLoaded', () => {

  function syncRangeAndNumber(rangeId, numberId, valSpanId, formatter) {
    const rangeEl = document.getElementById(rangeId);
    const numEl   = document.getElementById(numberId);
    const spanEl  = document.getElementById(valSpanId);
    if (!rangeEl || !numEl || !spanEl) return;

    const updateAll = source => {
      let v = source === 'range' ? rangeEl.value : numEl.value;

      if (v === '' || isNaN(v)) {
        v = 0;
      }

      rangeEl.value = v;
      numEl.value   = v;
      spanEl.textContent = formatter(v);
    };

    rangeEl.addEventListener('input', () => updateAll('range'));
    numEl.addEventListener(  'input', () => updateAll('number'));

    // inicializa ambos controles y el span
    updateAll('range');
  }

  syncRangeAndNumber(
    'superficie',     // id slider
    'superficieInput',// id input number
    'superficieVal',  // id span valor
    v => `${v} m²`    // formateador
  );

  syncRangeAndNumber(
    'precio',
    'precioInput',
    'precioVal',
    v => Number(v).toLocaleString('es-ES', {
      style:               'currency',
      currency:            'EUR',
      minimumFractionDigits: 0
    })
  );

});


