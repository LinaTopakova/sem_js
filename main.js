import { geocodeCity } from './dataService.js';
import {
  showMainPage,
  enableNextButtonOnInput,
  enableSearchButtonOnInput,
  renderResults
} from './uiService.js';

let myMap;
let placemarks = [];

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
    const placemark = new ymaps.Placemark(item.coords, {
      balloonContentHeader: item.name,
      balloonContentBody: item.description,
      balloonContentFooter: `<a href="${item.url}" target="_blank" rel="noopener">Подробнее</a>`
    });
    myMap.geoObjects.add(placemark);
    placemarks.push(placemark);
  });
}

async function searchAttractions(city) {
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

    searchControl.search(`достопримечательности ${city}`);
  });
}

function initMainPage(username) {
  showMainPage(username);

  const searchBtn = document.getElementById('searchBtn');
  const cityInput = document.getElementById('cityInput');

  searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (!city) return;

    try {
      const items = await searchAttractions(city);
      renderResults(items);

      if (items.length > 0) {
        initMap(items[0].coords);
        addPlacemarks(items);
      }
    } catch (e) {
      alert('Ошибка при поиске: ' + e.message);
    }
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