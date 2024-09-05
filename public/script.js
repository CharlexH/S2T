const input = document.getElementById('file-input');
input.addEventListener('change', async function() {
  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log(result);
});