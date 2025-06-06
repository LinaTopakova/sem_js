import { geocodeCity } from './dataService.js';
import {
  showMainPage,
  enableNextButtonOnInput,
  enableSearchButtonOnInput,
  renderResults,
  setActiveButton
} from './uiService.js';

let myMap;
let placemarks = [];
let currentSearchType = 'attractions'; 
let currentCity = '';
let currentItems = [];

function sortItems(items, order = 'default') {
  if (order === 'default') {
    return items; 
  }
  return items.slice().sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) return order === 'asc' ? -1 : 1;
    if (nameA > nameB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

function initMap(center) {
  if (!myMap) {
    myMap = new ymaps.Map('map', {
      center,
      zoom: 12,
      controls: ['zoomControl', 'fullscreenControl']
    });
  } else {
    myMap.setCenter(center, 12);
    placemarks.forEach(pm => myMap.geoObjects.remove(pm));
    placemarks = [];
  }
}

function addPlacemarks(items) {
  items.forEach(item => {
    const photoHtml = item.photos.length > 0
      ? `<img src="${item.photos[0]}" alt="${item.name}" style="max-width:300px; display:block; margin-bottom:10px;">`
      : '';

    const placemark = new ymaps.Placemark(item.coords, {
      balloonContentHeader: item.name,
      balloonContentBody: photoHtml + `<p>${item.description}</p>`,
      balloonContentFooter: `<a href="${item.url}" target="_blank" rel="noopener">Подробнее</a>`
    });
    myMap.geoObjects.add(placemark);
    placemarks.push(placemark);
  });
}

async function searchPlaces(city, type) {
  const cityCoords = await geocodeCity(city);
  const searchControl = new ymaps.control.SearchControl({
    options: {
      provider: 'yandex#search',
      results: 10,
      boundedBy: [
        [cityCoords[0] - 0.5, cityCoords[1] - 0.5],
        [cityCoords[0] + 0.5, cityCoords[1] + 0.5]
      ],
      strictBounds: true,
      noPlacemark: true
    }
  });

  let searchQuery;
  switch(type) {
    case 'attractions':
      searchQuery = `достопримечательности ${city}`;
      break;
    case 'hotels':
      searchQuery = `отели ${city}`;
      break;
    case 'cafes':
      searchQuery = `кафе ${city}`;
      break;
    default:
      searchQuery = `достопримечательности ${city}`;
  }

  return new Promise((resolve, reject) => {
    searchControl.events.once('load', () => {
      const results = searchControl.getResultsArray();
      if (results.length === 0) {
        reject(new Error('По вашему запросу ничего не найдено'));
        return;
      }

      const items = results.map(place => {
        const props = place.properties;
        const meta = props.get('metaDataProperty')?.CompanyMetaData || {};
        const photos = (meta.Photos || []).map(photo => photo.url).filter(Boolean);

        return {
          name: props.get('name'),
          description: props.get('description') || '',
          url: props.get('url') || '',
          coords: place.geometry.getCoordinates(),
          photos
        };
      });

      resolve(items);
    });

    searchControl.search(searchQuery);
  });
}

function updateResults(items) { //Обновляет отображение результатов
  currentItems = items;
  const order = document.getElementById('sortOrder').value || 'default';
  const sorted = sortItems(currentItems, order);
  renderResults(sorted, currentSearchType); //отображение отсортированных результатов

  if (items.length > 0) {
    initMap(items[0].coords);
    addPlacemarks(items);
  }
}

function initMainPage(username) { //главная страница
  showMainPage(username);
  enableSearchButtonOnInput();

  const searchBtn = document.getElementById('searchBtn');
  const cityInput = document.getElementById('cityInput');
  const attractionsBtn = document.getElementById('attractionsBtn');
  const hotelsBtn = document.getElementById('hotelsBtn');
  const cafesBtn = document.getElementById('cafesBtn');
  const sortOrderSelect = document.getElementById('sortOrder');

  searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (!city) return;

    currentCity = city;

    try {
      const items = await searchPlaces(city, currentSearchType);
      updateResults(items);
    } catch (e) {
      alert('Ошибка при поиске: ' + e.message);
    }
  });

  async function onMenuClick(type) {
    if (currentSearchType === type) return;
    currentSearchType = type;
    setActiveButton(type);

    if (currentCity) {
      try {
        const items = await searchPlaces(currentCity, currentSearchType);
        updateResults(items);
      } catch (e) {
        alert('Ошибка при поиске: ' + e.message);
      }
    }
  }

  attractionsBtn.addEventListener('click', () => onMenuClick('attractions'));
  hotelsBtn.addEventListener('click', () => onMenuClick('hotels'));
  cafesBtn.addEventListener('click', () => onMenuClick('cafes'));

  sortOrderSelect.addEventListener('change', () => {
    if (!currentItems.length) return;
    const order = sortOrderSelect.value;
    const sorted = sortItems(currentItems, order);
    renderResults(sorted, currentSearchType);
  });
}

function startApp() {
  enableNextButtonOnInput();

  document.getElementById('nextBtn').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    if (!username) return;

    initMainPage(username);
    enableSearchButtonOnInput();
  });
}

ymaps.ready(startApp);
