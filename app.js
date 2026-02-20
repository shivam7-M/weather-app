
// GEOLOCATION AUTO-FETCH SECTION

window.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await updateWeatherInfoByCoords(lat, lon);
      },
      (error) => {
        // If user denies or error, do nothing (manual search )
        
      }
    );
  }
});

// Fetch weather and forecast by coordinates
async function updateWeatherInfoByCoords(lat, lon) {
    showLoader();
  disableSearch();
  try{
  const weatherData = await getFetchDataByCoords("weather", lat, lon);
  if (weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    return;
  }
  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;

  countryTxt.textContent = country;
  tempTxt.textContent = Math.round(temp) + " °C";
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = humidity + "%";
  windValueTxt.textContent = speed + " M/s";
  currentDateTxt.textContent = getCurrentDate();
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

  await updateForecastInfoByCoords(lat, lon);
  showDisplaySection(weatherInfoSection);
}catch(err){
    showDisplaySection(notFoundSection);
}finally {
    hideLoader();
    enableSearch();
  }

}

async function getFetchDataByCoords(endPoint, lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

async function updateForecastInfoByCoords(lat, lon) {
  const forecastData = await getFetchDataByCoords("forecast", lat, lon);
  const timeTaken = "12:00:00";
  const todayDate = new Date().toISOString().split("T")[0];
  forecastItemContainer.innerHTML = "";
  forecastData.list.forEach((forecastWeather) => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    )
      updateForecastItem(forecastWeather);
  });
}



const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const weatherInfoSection = document.querySelector(".weather-info");

const notFoundSection = document.querySelector(".not-found");
const searchCitySecton = document.querySelector(".search-city");

const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");

const forecastItemContainer=document.querySelector(".forecast-items-container")

const apiKey = "593528426173e8d4ec01174dbd12296a";
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value);
    cityInput.value = "";
    cityInput.blur();
  }
});

cityInput.addEventListener("keydown", (event) => {
  // console.log(event)
  if (event.key == "Enter" && cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value);
    cityInput.value = "";
    cityInput.blur();
  }
});

async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

function getWeatherIcon(id) {
  // console.log(id)
  if (id <= 232) return "thunderstorm.svg";
  if (id <= 321) return "drizzle.svg";
  if (id <= 531) return "rain.svg";
  if (id <= 622) return "snow.svg";
  if (id <= 781) return "atmosphere.svg";
  if (id <= 800) return "clear.svg";
 else  return "clouds.svg";
}

function getCurrentDate(){
    const currentDate=new Date()
    const options ={
        weekday:"short",
        day:"2-digit",
        month:"short"
    }
    return currentDate.toLocaleDateString("en-GB",options)
}

async function updateWeatherInfo(city) {
    showLoader();
    disableSearch();
    try{
  const weatherData = await getFetchData("weather", city);
  if (weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    return;
  }
  //  console.log(weatherData);
  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;

  countryTxt.textContent = country;
  tempTxt.textContent = Math.round(temp) + " °C";
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = humidity + "%";
  windValueTxt.textContent = speed + " M/s";

  currentDateTxt.textContent=getCurrentDate()
//   console.log(getCurrentDate())
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

  await updateForecastInfo(city)
  showDisplaySection(weatherInfoSection);
    }catch(err){
        showDisplaySection(notFoundSection);
  } finally {
    hideLoader();
    enableSearch();
  }
    }
  //


async function updateForecastInfo(city){
    const forecastData=await getFetchData("forecast",city)
    timeTaken="12:00:00"
    todayDate=new Date().toISOString().split("T")[0]

        forecastItemContainer.innerHTML=""
    forecastData.list.forEach(forecastWeather=>{
        if(forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate))
            updateForecastItem(forecastWeather)
    })

}

function updateForecastItem(weatherData){
        const {
            dt_txt:date,
            weather:[{id}],
            main:{temp}
        }=weatherData

        const dateTaken=new Date(date)
        const dateOption={
            day:"2-digit",
            month:"short"
        }
        const dateResult = dateTaken.toLocaleDateString("en-US",dateOption)
       
        const forecastItem=`
             <div class="forecast-item">
             <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
             <img src="assets/weather/${getWeatherIcon(id)}" alt="" class="forecast-item-img">
             <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
              </div>
        `
        forecastItemContainer.insertAdjacentHTML("beforeend",forecastItem)
}

function showDisplaySection(section) {
  [weatherInfoSection, searchCitySecton, notFoundSection].forEach(
    (section) => (section.style.display = "none"),
  );

  section.style.display = "flex";
}

// loader
const loaderContainer = document.querySelector('.loader-container');
function showLoader() { loaderContainer.style.display = 'flex'; }
function hideLoader() { loaderContainer.style.display = 'none'; }
function disableSearch() { searchBtn.disabled = true; }
function enableSearch() { searchBtn.disabled = false; }
