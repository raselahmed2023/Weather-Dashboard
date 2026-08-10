
// 1. Select Elements


const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherBox = document.getElementById("weatherBox");


// 2. Weather Condition


function getCondition(code) {
  if (code === 0) return ["Clear Sky", "☀️"];
  if (code <= 3) return ["Partly Cloudy", "⛅"];
  if (code <= 48) return ["Foggy", "🌫️"];
  if (code <= 67) return ["Rainy", "🌧️"];
  if (code <= 77) return ["Snowy", "❄️"];
  if (code <= 82) return ["Rain Showers", "🌦️"];
  if (code <= 99) return ["Thunderstorm", "⛈️"];

  return ["Unknown", "🌤️"];
}



// 3. Get City Location


async function getCity(city) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) {
    throw new Error("City not found");
  }

  return data.results[0];
}



// 4. Get Weather Data


async function getWeather(lat, lon) {

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=3`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather data unavailable");
  }

  return await response.json();
}



// 5. Display Current Weather


function displayWeather(city, data) {

  const [condition, icon] =
    getCondition(data.current.weather_code);

  document.getElementById("cityName").innerText = city;
  document.getElementById("weatherIcon").innerText = icon;

  document.getElementById("temperature").innerText =
    `${data.current.temperature_2m}°C`;

  document.getElementById("condition").innerText = condition;

  displayForecast(data.daily);
}



// 6. Display 3-Day Forecast


function displayForecast(daily) {

  const forecast = document.getElementById("forecast");

  forecast.innerHTML = daily.time.map((date, index) => {

    const [condition, icon] =
      getCondition(daily.weather_code[index]);

    return `
      <div class="card bg-base-100 shadow-md">
        <div class="card-body text-center">

          <h3 class="font-bold">
            ${new Date(date).toLocaleDateString("en-US", {
              weekday: "long"
            })}
          </h3>

          <div class="text-5xl">${icon}</div>

          <p>${condition}</p>

          <p class="font-semibold">
            ${daily.temperature_2m_max[index]}°C /
            ${daily.temperature_2m_min[index]}°C
          </p>

        </div>
      </div>
    `;
  }).join("");
}



// 7. Search Weather


async function searchWeather() {

  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  loading.classList.remove("hidden");
  error.classList.add("hidden");
  weatherBox.classList.add("hidden");

  try {

    const location = await getCity(city);

    const weather =
      await getWeather(location.latitude, location.longitude);

    displayWeather(location.name, weather);

    weatherBox.classList.remove("hidden");

  } catch (err) {

    showError(err.message);

  } finally {

    loading.classList.add("hidden");

  }
}



// 8. Show Error


function showError(message) {
  error.innerText = message;
  error.classList.remove("hidden");
}



// 9. Events


searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    searchWeather();
  }
});