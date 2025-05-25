const input = document.getElementById('imagenes');
const preview = document.getElementById('preview');

let filesArray = [];

input.addEventListener('change', (e) => {
  preview.innerHTML = ''; // Limpia previews anteriores
  filesArray = Array.from(e.target.files); // Array desde FileList

  filesArray.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewBox = document.createElement('div');
      previewBox.classList.add('preview-box');
      previewBox.innerHTML = `
        <img src="${e.target.result}" class="preview-img" />
        <button type="button" class="remove-btn" data-index="${index}">&times;</button>
      `;
      preview.appendChild(previewBox);
    };
    reader.readAsDataURL(file);
  });
});

// Delegación de eventos para eliminar
preview.addEventListener('click', function (e) {
  if (e.target.classList.contains('remove-btn')) {
    const index = e.target.dataset.index;
    filesArray.splice(index, 1); // Elimina del array
    updateInputFiles();
    input.dispatchEvent(new Event('change')); // Regenera previews
  }
});

function updateInputFiles() {
  const dataTransfer = new DataTransfer();
  filesArray.forEach(file => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
}
