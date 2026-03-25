// Weather service using wttr.in API

const API_BASE = 'https://wttr.in'

// Map weather conditions to Gen Z friendly descriptions and icons
const weatherMap = {
  'Sunny': { icon: '☀️', desc: 'main character energy' },
  'Clear': { icon: '🌙', desc: 'clear vibes only' },
  'Partly cloudy': { icon: '⛅', desc: 'partly aesthetic' },
  'Cloudy': { icon: '☁️', desc: 'cloudy but make it fashion' },
  'Overcast': { icon: '🌫️', desc: 'overcast mood' },
  'Rain': { icon: '🌧️', desc: 'rainy day vibes' },
  'Light rain': { icon: '🌦️', desc: 'drizzle era' },
  'Heavy rain': { icon: '⛈️', desc: 'it\'s giving storm' },
  'Snow': { icon: '❄️', desc: 'snow aesthetic' },
  'Thunderstorm': { icon: '⚡', desc: 'thunderbolts and lightning' },
  'Fog': { icon: '🌫️', desc: 'mysterious foggy energy' },
  'Mist': { icon: '🌫️', desc: 'misty morning' },
}

function getIconAndDesc(condition) {
  const key = Object.keys(weatherMap).find(k => 
    condition.toLowerCase().includes(k.toLowerCase())
  )
  return weatherMap[key] || { icon: '🌤️', desc: 'vibes unclear' }
}

function getDayName(offset) {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return days[date.getDay()]
}

export async function getWeatherData(location) {
  try {
    // Get current weather
    const currentRes = await fetch(`${API_BASE}/${encodeURIComponent(location)}?format=j1`, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!currentRes.ok) throw new Error('Failed to fetch')
    
    const data = await currentRes.json()
    
    if (!data.current_condition || !data.current_condition[0]) {
      throw new Error('Invalid response')
    }

    const current = data.current_condition[0]
    const nearest = data.nearest_area?.[0] || {}
    
    // Get forecast for next 3 days
    const forecast = []
    for (let i = 1; i <= 3; i++) {
      const dayData = data.weather?.[i]
      if (dayData) {
        const avgTemp = Math.round((parseInt(dayData.avgtempC) + parseInt(dayData.mintempC)) / 2)
        const desc = dayData.hourly?.[4]?.weatherDesc?.[0]?.value || 'Clear'
        forecast.push({
          day: getDayName(i),
          temp: avgTemp,
          icon: getIconAndDesc(desc).icon
        })
      }
    }

    const weatherInfo = getIconAndDesc(current.weatherDesc?.[0]?.value || 'Clear')

    return {
      location: nearest.areaName?.[0]?.value || location,
      country: nearest.country?.[0]?.value || '',
      temp: current.temp_C,
      feelsLike: current.FeelsLikeC,
      condition: weatherInfo.desc,
      icon: weatherInfo.icon,
      wind: `${current.windspeedKmph} km/h`,
      humidity: `${current.humidity}%`,
      visibility: `${current.visibility} km`,
      forecast: forecast
    }
  } catch (error) {
    console.error('Weather fetch error:', error)
    throw error
  }
}

export function searchLocation(query) {
  // wttr.in handles fuzzy matching, so we just return the query
  return Promise.resolve([{ name: query }])
}
