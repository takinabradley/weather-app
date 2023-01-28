//API logic
async function checkCurrentWeather(location) {
  try {
    const coordsRequest = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${location.toString()}&limit=1&appid=399346ae1e970c4f9bd870c6c64bdc7c`)
    const coords = await coordsRequest.json()
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coords[0].lat}&lon=${coords[0].lon}&exclude=minutely,hourly,alerts&units=metric&appid=399346ae1e970c4f9bd870c6c64bdc7c`)
    const weather = await weatherResponse.json()
    return {data: weather, location: coords};
  } catch(err) {
    return 'Could not find that city'
  }
}

//DOM logic
const DOMController = (function(){
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

  function makeIconUrl(iconName) {
    return `https://openweathermap.org/img/wn/${iconName}@4x.png`
  }
  
  function appendCurrentWeather(weather) {
    const currentLocation = document.querySelector('.current-location')
    const currentDate = document.querySelector('.current-date')
    const currentDescription = document.querySelector('.current-description')
    const currentImg = document.querySelector('.current-img')
    const currentTemp = document.querySelector('.current-temp')
    const currentHumidity = document.querySelector('.current-humidity')
    const currentClouds = document.querySelector('.current-clouds')
    const currentWindspeed = document.querySelector('.current-windspeed')
    const currentRainSnow = document.querySelector('.current-rain-snow')
    const currentOther = document.querySelector('.current-other')
  
    currentLocation.textContent = `${weather.location[0].name}, ${weather.location[0].state}`
    currentDate.textContent = `${unixTimeToDate(weather.data.current.dt)}`
    currentDescription.textContent = weather.data.current.weather[0].description
    currentImg.src = makeIconUrl(weather.data.current.weather[0].icon)
    currentTemp.textContent = `${weather.data.current.temp} °C`
    currentHumidity.textContent = `Humidity: ${weather.data.current.humidity}%`
    currentClouds.textContent = `Cloud Cover: ${weather.data.current.clouds}%`
    currentWindspeed.textContent = `Wind Speed: ${weather.data.current.wind_speed} km/h`
  
    if(weather.data.current.rain || weather.data.current.snow) {
      if(weather.data.current.rain) {
        currentRainSnow.textContent = `Rain: ${JSON.stringify(weather.data.current.rain["1h"])} cm/h` 
      } else {
        currentRainSnow.textContent = `Snow: ${JSON.stringify(weather.data.current.snow["1h"])} cm/h`  
      }
    }
  }
  
  function appendForecast(weather) {
    const forecastElems = document.querySelectorAll('.forecast')

    forecastElems.forEach( (card, index) => {
      const date = card.querySelector('.forecast-date')
      const minTemp = card.querySelector('.forecast-min')
      const maxTemp = card.querySelector('.forecast-max')

      //index + 1 is used because forecast data includes the current date
      date.textContent = unixTimeToDate(weather.data.daily[index + 1].dt)
      minTemp.textContent = `Min: ${weather.data.daily[index + 1].temp.min} °C`
      maxTemp.textContent = `Max: ${weather.data.daily[index + 1].temp.max} °C`
      card.style.backgroundImage = `url(${makeIconUrl(weather.data.daily[index + 1].weather[0].icon)})`
    })
  }

  function unixTimeToDate(unixTime) {
    const months = [
      'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
    ]

    const time = new Date(unixTime * 1000)
    const month = months[time.getMonth()];
    const date = time.getDate();
    return month + ' ' + date
  }
  
  async function displayWeather(e) {
    e.preventDefault()
    const errMessages = document.querySelector('.form-messages')
    const location = [
      //replaces spaces with '+' for API call
      document.querySelector('#city-input').value.replace(/\s+/g, '+'),
      document.querySelector('#state-select').value,
      document.querySelector('#country-select').value
    ]

    const weather = await checkCurrentWeather(location)

    console.log(location)
    console.log(weather)
    if(typeof weather === 'object') {
      errMessages.textContent = ''
      const weatherDescription = weather.data.current.weather[0].main
      changeBackground(weatherDescription)
      appendCurrentWeather(weather)
      appendForecast(weather)
    } else {
      console.log(weather)
      errMessages.textContent = weather
    }
  }
  
  return {displayWeather}
})()


//Form logic
const FormController = (function() {
  function enableUSStates(e) {
    if(e.target.value === 'US') {
      document.querySelector('#state-select').removeAttribute('disabled')
    } else {
      document.querySelector('#state-select').setAttribute('disabled', '')
    }
  }

  /*changeSelectColor allows styling of optional select elements as if they had 
  the 'required' attribute. I dispatch the event immediately to give them a 
  fake 'invalid' class synonomous with the :invalid selector upon pageload. */
  function changeSelectColor(e) {
    if(e.target.value === '') {
      e.target.classList.add('invalid')
    } else {
      e.target.classList.remove('invalid')
    }
  }

  function initForm() {
    document.querySelectorAll('select').forEach(selectElem => {
      selectElem.addEventListener('change', changeSelectColor)
      selectElem.dispatchEvent(new Event('change'))
    })

    document.querySelector('#country-select').addEventListener('change', enableUSStates)
    document.querySelector('form').addEventListener('submit', DOMController.displayWeather)
  }

  initForm()
})()

console.log(navigator.geolocation.getCurrentPosition(position => console.log('got position...', position)))
//http://api.openweathermap.org/data/2.5/weather?q=London&appid=399346ae1e970c4f9bd870c6c64bdc7c
//weather conditions list: https://openweathermap.org/weather-conditions
//icons url: http://openweathermap.org/img/wn/10d@2x.png