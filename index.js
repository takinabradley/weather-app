//API logic
async function checkCurrentWeather(...location) {
  try {
    let coordsRequest = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location.toString()}&limit=1&appid=399346ae1e970c4f9bd870c6c64bdc7c`)
    let coords = await coordsRequest.json()
    console.log(coords)
    //using onecall api for current weather + forecast
    let weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coords[0].lat}&lon=${coords[0].lon}&exclude=minutely,hourly,alerts&appid=399346ae1e970c4f9bd870c6c64bdc7c`)
    //let weatherResponse = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${coords[0].lat}&lon=${coords[0].lon}&units=metric&appid=399346ae1e970c4f9bd870c6c64bdc7c`)
    let weather = await weatherResponse.json()
    let iconUrl = `http://openweathermap.org/img/wn/${weather.current.weather[0].icon}@4x.png`
    return {data: weather, iconUrl};
  } catch(err) {
    return 'Could not find that city'
  }
}



//DOM logic

function changeBackground(currentWeatherMain) {
  let body = document.querySelector('body')
  let cloudyConditions = [
    'Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 
    'Dust', 'Ash', 'Squall', 'Tornado', 'Clouds'
  ]
  let rainyConditions = ['Thunderstorm', 'Drizzle', 'Rain']
  
  //shuffles through background images
  if(currentWeatherMain === 'Snow') {
    body.style.backgroundSize = '100% 100%, 100% 100%, 100% 100%, 100% 100%'
  } else if(currentWeatherMain === 'Clear') {
    body.style.backgroundSize = '0% 100%, 100% 100%, 100% 100%, 100% 100%'
  } else if(cloudyConditions.includes(currentWeatherMain)) {
    body.style.backgroundSize = '0% 100%, 0% 100%, 100% 100%, 100% 100%'
  } else if(rainyConditions.includes(currentWeatherMain)) {
    body.style.backgroundSize = '0% 100%, 0% 100%, 0% 100%, 100% 100%'
  }
}

function appendCurrentWeather(currentWeather, iconUrl) {
  const weatherData = document.querySelector('.weather-data')
  const weatherDescription = document.querySelector('.weather-description')
  const weatherImg = document.querySelector('img')
  const weatherOther = document.querySelector('.weather-other')

  let conditionsDescription = currentWeather.weather[0].description
  weatherDescription.textContent = conditionsDescription
  weatherImg.src = iconUrl
  weatherOther.textContent = JSON.stringify(currentWeather.main) +
                             JSON.stringify(currentWeather.wind)

  if(currentWeather.rain || currentWeather.snow) {
    weatherOther.textContent += JSON.stringify(currentWeather.rain || currentWeather.snow)
  }
}

function appendForecast(forecast) {

}

async function displayWeather(e) {
  e.preventDefault()

  const location = [
    document.querySelector('#city-input').value.replace(/\s+/g, '+'),
    document.querySelector('#state-select').value,
    document.querySelector('#country-select').value
  ]

  const weather = await checkCurrentWeather(location)
  console.log(weather)
  const errMessages = document.querySelector('.form-messages')
  if(typeof weather === 'object') {
    errMessages.textContent = ''
    changeBackground(weather.data.current.weather[0].main)
    appendCurrentWeather(weather.data.current, weather.iconUrl)
    appendForecast()
  } else {
    console.log(weather)
    errMessages.textContent = weather
  }
}

function enableStateSelector(e) {
  if(e.target.value === 'US') {
    document.querySelector('#state-select').removeAttribute('disabled')
  } else {
    document.querySelector('#state-select').setAttribute('disabled', '')
  }
}

document.querySelector('form').addEventListener('submit', displayWeather)
document.querySelector('#country-select').addEventListener('change', enableStateSelector)
//document.querySelector('#state-list').options.map(option => option.value)
//document.querySelector('#country-list').options
//message: must use a two letter state/country code
//http://api.openweathermap.org/data/2.5/weather?q=London&appid=399346ae1e970c4f9bd870c6c64bdc7c
//weather conditions list: https://openweathermap.org/weather-conditions
//icons url: http://openweathermap.org/img/wn/10d@2x.png