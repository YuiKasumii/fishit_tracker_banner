const form = document.getElementById("form");
const preview = document.getElementById("preview");
const imageUrl = document.getElementById("imageUrl");

function buildUrl() {
  const params = new URLSearchParams();
  const data = new FormData(form);
  for (const [key, value] of data.entries()) {
    if (value) params.set(key, value);
  }
  return `/api/generate?${params.toString()}`;
}

function updatePreview() {
  const url = buildUrl();
  preview.src = url;
  imageUrl.value = url;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updatePreview();
});

updatePreview();