const API_KEY = '3f52aef1-4112-4aa0-a5fa-c3e369fcaed9'; 
const URL = 'https://geocode-maps.yandex.ru/1.x/';

export async function geocodeCity(city) {
  const url = `${URL}?apikey=${API_KEY}&format=json&geocode=${encodeURIComponent(city)}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка при запросе к Геокодеру: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const geoObject = data.response.GeoObjectCollection.featureMember[0]?.GeoObject; //первый объект геокодирования из ответа

  if (!geoObject) {
    throw new Error(`Город "${city}" не найден`);
  }

  const pos = geoObject.Point.pos.split(' ').map(Number); 
  return [pos[1], pos[0]]; 
}