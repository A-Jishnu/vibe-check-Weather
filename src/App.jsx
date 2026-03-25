import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { 
  searchLocation, 
  getWeatherData, 
  register, 
  login, 
  logout, 
  isAuthenticated,
  getSavedLocations,
  saveLocation,
  deleteLocation,
  getAuthToken
} from './services/api'

function App() {
  // Auth state
  const [user, setUser] = useState(() => {
    const token = getAuthToken();
    return token ? { username: localStorage.getItem('username') || 'user' } : null;
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  
  // Weather state
  const [search, setSearch] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  
  // Saved locations
  const [savedLocations, setSavedLocations] = useState([])
  const [showSaved, setShowSaved] = useState(false)

  const popularCities = [
    { name: 'New York', lat: 40.71, lon: -74.01, country: 'USA' },
    { name: 'London', lat: 51.51, lon: -0.13, country: 'UK' },
    { name: 'Tokyo', lat: 35.69, lon: 139.69, country: 'Japan' },
    { name: 'Seoul', lat: 37.57, lon: 126.98, country: 'South Korea' },
    { name: 'Los Angeles', lat: 34.05, lon: -118.24, country: 'USA' },
    { name: 'Paris', lat: 48.85, lon: 2.35, country: 'France' },
    { name: 'Mumbai', lat: 19.08, lon: 72.88, country: 'India' },
    { name: 'Dubai', lat: 25.20, lon: 55.27, country: 'UAE' }
  ]

  // Load saved locations if logged in
  useEffect(() => {
    if (isAuthenticated()) {
      loadSavedLocations();
    }
  }, [user]);

  const loadSavedLocations = async () => {
    try {
      const locations = await getSavedLocations();
      setSavedLocations(locations);
    } catch (err) {
      console.error('Failed to load saved locations:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const data = authMode === 'login' 
        ? await login(authForm.username, authForm.password)
        : await register(authForm.username, authForm.password);
      setUser({ username: data.username });
      localStorage.setItem('username', data.username);
      setShowAuth(false);
      setAuthForm({ username: '', password: '' });
      loadSavedLocations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setSavedLocations([]);
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    
    if (value.length > 2) {
      try {
        const results = await searchLocation(value);
        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      setShowResults(false);
    }
  };

  const handleSelectLocation = async (location) => {
    setSearch(location.name);
    setSelectedLocation(location);
    setShowResults(false);
    
    setLoading(true);
    setError(null);
    
    try {
      const rawData = await getWeatherData(location.latitude, location.longitude);
      const formatted = formatWeatherData(rawData, location.name, location.country);
      setWeather(formatted);
    } catch (err) {
      setError('Failed to load weather data 😢');
    } finally {
      setLoading(false);
    }
  };

  const formatWeatherData = (data, locationName, country) => {
    const weatherCodes = {
      0: { icon: '☀️', condition: 'clear sky' },
      1: { icon: '🌤️', condition: 'mainly clear' },
      2: { icon: '⛅', condition: 'partly cloudy' },
      3: { icon: '☁️', condition: 'overcast' },
      45: { icon: '🌫️', condition: 'foggy' },
      48: { icon: '🌫️', condition: 'depositing rime fog' },
      51: { icon: '🌦️', condition: 'light drizzle' },
      53: { icon: '🌦️', condition: 'moderate drizzle' },
      55: { icon: '🌧️', condition: 'dense drizzle' },
      61: { icon: '🌧️', condition: 'slight rain' },
      63: { icon: '🌧️', condition: 'moderate rain' },
      65: { icon: '🌧️', condition: 'heavy rain' },
      71: { icon: '🌨️', condition: 'slight snow' },
      73: { icon: '❄️', condition: 'moderate snow' },
      75: { icon: '❄️', condition: 'heavy snow' },
      77: { icon: '🌨️', condition: 'snow grains' },
      80: { icon: '🌦️', condition: 'rain showers' },
      81: { icon: '🌧️', condition: 'moderate showers' },
      82: { icon: '⛈️', condition: 'violent showers' },
      95: { icon: '⛈️', condition: 'thunderstorm' },
      96: { icon: '⛈️', condition: 'thunderstorm with hail' },
      99: { icon: '⛈️', condition: 'heavy thunderstorm' },
    };

    const code = data.current.weather_code;
    const weatherInfo = weatherCodes[code] || { icon: '❓', condition: 'unknown' };

    const forecast = data.daily.time.slice(1, 6).map((time, i) => ({
      day: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
      temp: Math.round(data.daily.temperature_2m_max[i + 1]),
      icon: weatherCodes[data.daily.weather_code[i + 1]]?.icon || '🌡️',
    }));

    return {
      location: locationName,
      country: country || '',
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: `${data.current.relative_humidity_2m}%`,
      wind: `${data.current.wind_speed_10m} km/h`,
      visibility: `${data.current.weather_code < 50 ? '10+' : '5'} km`,
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      forecast,
    };
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation || !isAuthenticated()) return;
    
    try {
      await saveLocation(
        selectedLocation.name,
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.country
      );
      loadSavedLocations();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteLocation = async (id) => {
    try {
      await deleteLocation(id);
      loadSavedLocations();
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSavedCity = async (loc) => {
    const savedLoc = { 
      name: loc.city, 
      latitude: loc.lat, 
      longitude: loc.lon, 
      country: loc.country 
    };
    await handleSelectLocation(savedLoc);
  };

  // Load London on mount
  useEffect(() => {
    handleSelectLocation({ name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'UK' });
  }, []);

  return (
    <div className="app">
      <div className="ambient-glow"></div>
      <div className="ambient-glow-2"></div>
      
      <header className="header">
        <h1 className="logo">
          <span className="logo-icon">✨</span>
          vibe check
        </h1>
        <p className="tagline">ur daily weather glow up</p>
        
        <div className="auth-section">
          {user ? (
            <div className="user-menu">
              <span className="username">👤 {user.username}</span>
              <button className="btn-icon" onClick={() => setShowSaved(!showSaved)} title="Saved locations">
                📍
              </button>
              <button className="btn-text" onClick={handleLogout}>logout</button>
            </div>
          ) : (
            <button className="btn-text" onClick={() => setShowAuth(true)}>login / sign up</button>
          )}
        </div>
      </header>

      <main className="main">
        {/* Auth Modal */}
        {showAuth && (
          <div className="modal-overlay" onClick={() => setShowAuth(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>{authMode === 'login' ? 'welcome back' : 'create account'}</h2>
              <form onSubmit={handleAuth}>
                <input
                  type="text"
                  placeholder="username"
                  value={authForm.username}
                  onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="password"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary">
                  {authMode === 'login' ? 'login' : 'sign up'}
                </button>
              </form>
              <p className="auth-switch">
                {authMode === 'login' ? "don't have an account? " : "already have an account? "}
                <button 
                  className="btn-link" 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                >
                  {authMode === 'login' ? 'sign up' : 'login'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Saved Locations Panel */}
        {showSaved && user && (
          <div className="saved-panel">
            <h3>your saved spots 📍</h3>
            {savedLocations.length === 0 ? (
              <p className="empty-state">no saved locations yet</p>
            ) : (
              <div className="saved-list">
                {savedLocations.map(loc => (
                  <div key={loc.id} className="saved-item">
                    <button onClick={() => loadSavedCity(loc)}>
                      {loc.city} {loc.country && `• ${loc.country}`}
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDeleteLocation(loc.id)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="search a city..."
              className="search-input"
            />
            {loading && <span className="spinner"></span>}
          </div>
          
          {showResults && searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map((result) => (
                <li key={`${result.latitude}-${result.longitude}`}>
                  <button onClick={() => handleSelectLocation(result)}>
                    {result.name} {result.admin1 && `• ${result.admin1}`} {result.country && `• ${result.country}`}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {!weather && !loading && (
          <div className="popular-cities">
            <p className="section-label">trending now</p>
            <div className="city-pills">
              {popularCities.map(city => (
                <button 
                  key={city.name} 
                  className="city-pill"
                  onClick={() => handleSelectLocation({
                    name: city.name,
                    latitude: city.lat,
                    longitude: city.lon,
                    country: city.country
                  })}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-toast">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {weather && (
          <div className="weather-card">
            <div className="weather-header">
              <div className="location">
                <h2 className="city-name">{weather.location}</h2>
                <p className="country">{weather.country}</p>
              </div>
              <div className="weather-actions">
                <div className="weather-icon-large">{weather.icon}</div>
                {isAuthenticated() && selectedLocation && (
                  <button 
                    className="btn-save" 
                    onClick={handleSaveLocation}
                    title="Save location"
                  >
                    💾
                  </button>
                )}
              </div>
            </div>

            <div className="temp-section">
              <span className="temperature">{weather.temp}</span>
              <span className="temp-unit">°C</span>
            </div>

            <p className="condition">{weather.condition}</p>

            <div className="details-grid">
              <div className="detail-card">
                <span className="detail-icon">💨</span>
                <span className="detail-value">{weather.wind}</span>
                <span className="detail-label">wind</span>
              </div>
              <div className="detail-card">
                <span className="detail-icon">💧</span>
                <span className="detail-value">{weather.humidity}</span>
                <span className="detail-label">humidity</span>
              </div>
              <div className="detail-card">
                <span className="detail-icon">🌡️</span>
                <span className="detail-value">{weather.feelsLike}</span>
                <span className="detail-label">feels like</span>
              </div>
              <div className="detail-card">
                <span className="detail-icon">👁️</span>
                <span className="detail-value">{weather.visibility}</span>
                <span className="detail-label">visibility</span>
              </div>
            </div>

            <div className="forecast-section">
              <p className="section-label">coming up</p>
              <div className="forecast-list">
                {weather.forecast?.map((day, idx) => (
                  <div key={idx} className="forecast-item">
                    <span className="forecast-day">{day.day}</span>
                    <span className="forecast-icon">{day.icon}</span>
                    <span className="forecast-temp">{day.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>made with 💜 by jarvis</p>
      </footer>
    </div>
  )
}

export default App
