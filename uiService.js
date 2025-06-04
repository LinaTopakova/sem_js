export function enableNextButtonOnInput() {
  const input = document.getElementById('username');
  const btn = document.getElementById('nextBtn');
  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length === 0;
  });
}

export function showMainPage(username) {
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('mainPage').style.display = 'block';
  document.getElementById('header').textContent = `Привет, ${username}!`;
}
export function enableSearchButtonOnInput() {
  const input = document.getElementById('cityInput');
  const btn = document.getElementById('searchBtn');
  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length === 0;
  });
}

export function renderResults(items) {
  const container = document.getElementById('results');
  container.innerHTML = '';

  if (items.length === 0) {
    container.textContent = 'Достопримечательности не найдены.';
    return;
  }

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'place';

    const name = item.name || 'Без названия';
    const url = item.url || '#';
    const description = item.description || '';
    const photo = item.photos && item.photos.length > 0 ? item.photos[0] : null;

    let imageHTML = '';
    if (photo) {
      imageHTML = `<img src="${photo}" alt="${name}" style="max-width:200px; max-height:150px;" />`;
    } else {
      imageHTML = `<p>Фотография отсутствует</p>`; // Или можно вставить изображение-заглушку
    }

    div.innerHTML = `
      <h3><a href="${url}" target="_blank" rel="noopener">${name}</a></h3>
      ${imageHTML}
      <p>${description}</p>
    `;

    container.appendChild(div);
  });
}

