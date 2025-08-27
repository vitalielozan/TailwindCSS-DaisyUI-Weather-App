let apiKey = '';
const weatherForm = document.querySelector('#weatherForm');
const cityInput = document.querySelector('#cityInput');
const card = document.querySelector('#card');
const cityDisplay = document.querySelector('#cityDisplay');
const tempDisplay = document.querySelector('#tempDisplay');
const feelsDisplay = document.querySelector('#feelsDisplay');
const humidityDisplay = document.querySelector('#humidityDisplay');
const descDisplay = document.querySelector('#descDisplay');
const weatherEmoji = document.querySelector('#weatherEmoji');
const errorDisplay = document.querySelector('#errorDisplay');

const loadConfig = async () => {
  try {
    const resp = await fetch('./config/config.json');
    const data = await resp.json();
    apiKey = data.apiKey;
  } catch (error) {
    console.log('Config error', error);
  }
};

loadConfig();

window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        getWeatherLocal(lat, lon);
      },
      (error) => {
        console.error('Error getting location', error);
        displayError(error);
      }
    );
  } else {
    alert('Geolocation is not supported by this browser.');
  }
});

weatherForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = cityInput.value;

  if (city) {
    try {
      const weatherData = await getWeatherData(city);
      displayWeatherInfo(weatherData);
      cityInput.value = '';
    } catch (error) {
      console.error('Error', error);
      displayError(error);
    }
  } else {
    displayError('Please enter a city');
  }
});

async function getWeatherLocal(lat, lon) {
  try {
    const apiUriLocal = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const res = await fetch(apiUriLocal);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await res.json();
    displayWeatherInfo(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    displayError(error);
  }
}

async function getWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  const response = await fetch(apiUrl);

  if (!response) {
    throw new Error('Could not fetch weather data');
  }
  return await response.json();
}

function displayWeatherInfo(data) {
  const {
    name: city,
    main: { temp, humidity, feels_like },
    weather: [{ description, id }],
  } = data;

  card.classList.remove('hidden');
  const feelsLikeKelvin = feels_like;
  const feelsLikeCelsius = kelvinToCelsius(feelsLikeKelvin);
  const tempKelvin = temp;
  const tempCelsius = kelvinToCelsius(tempKelvin);
  cityDisplay.textContent = city;
  tempDisplay.textContent = `Temp : ${tempCelsius.toFixed(2)} °C`;
  feelsDisplay.textContent = `Feels like : ${feelsLikeCelsius.toFixed(2)} °C`;
  humidityDisplay.textContent = `Humidity : ${humidity} %`;
  descDisplay.textContent = description;
  weatherEmoji.textContent = getWeatherEmoji(id);
  errorDisplay.classList.add('hidden');
}

function getWeatherEmoji(weatherId) {
  switch (true) {
    case weatherId >= 200 && weatherId < 300:
      return `<img src='./images/thunderstorm.png'alt='thunderstorm'/>`;
    case weatherId >= 300 && weatherId < 500:
      return '🌦️';
    case weatherId >= 500 && weatherId < 600:
      return '🌧️';
    case weatherId >= 600 && weatherId < 700:
      return '❄️';
    case weatherId >= 700 && weatherId < 800:
      return '♒';
    case weatherId === 800:
      return '☀️';
    case weatherId >= 801 && weatherId < 810:
      return '🌥️';
    default:
      return '❓';
  }
}

function displayError(message) {
  card.classList.add('hidden');
  errorDisplay.classList.remove('hidden');
}

function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}
