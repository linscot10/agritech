// src/pages/Weather.jsx
import { useState } from 'react'
import { Search, Cloud, Sun, CloudRain, CloudSnow, CloudDrizzle, Wind, Calendar, Thermometer, Gauge, MapPin, AlertTriangle, Lightbulb, Droplet } from 'lucide-react'
import api from '../utils/api'
import './Weather.css'

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [city, setCity] = useState('')
  const [searchHistory, setSearchHistory] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/weather?city=${encodeURIComponent(city)}`)
      setWeatherData(response.data)
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [city, ...prev.filter(item => item !== city)].slice(0, 5)
        return newHistory
      })
    } catch (err) {
      console.error('Error fetching weather:', err)
      setError(err.response?.data?.message || 'Could not fetch weather data')
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (description) => {
    const desc = description.toLowerCase()
    if (desc.includes('rain')) return <CloudRain size={48} />
    if (desc.includes('snow')) return <CloudSnow size={48} />
    if (desc.includes('drizzle')) return <CloudDrizzle size={48} />
    if (desc.includes('cloud')) return <Cloud size={48} />
    if (desc.includes('clear')) return <Sun size={48} />
    return <Cloud size={48} />
  }

  const getWeatherColor = (description) => {
    const desc = description.toLowerCase()
    if (desc.includes('rain')) return '#3182ce' // Blue for rain
    if (desc.includes('snow')) return '#90cdf4' // Light blue for snow
    if (desc.includes('clear')) return '#f6ad55' // Orange for clear
    if (desc.includes('cloud')) return '#a0aec0' // Gray for clouds
    return '#718096' // Default gray
  }

  const formatAdvice = (advice) => {
    return Array.isArray(advice) ? advice : [advice]
  }

  return (
    <div className="weather">
      <div className="weather-header">
        <div className="header-content">
          <h1>Weather Forecast</h1>
          <p>Check weather conditions and get farming advice</p>
        </div>
      </div>

      <div className="weather-search">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Enter city name (e.g., Nairobi, London, New York)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading || !city.trim()} className="btn-primary">
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </form>

        {searchHistory.length > 0 && (
          <div className="search-history">
            <span>Recent searches: </span>
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => setCity(item)}
                className="history-btn"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {weatherData ? (
        <div className="weather-content">
          <div className="weather-card" style={{ borderLeftColor: getWeatherColor(weatherData.weather) }}>
            <div className="weather-header">
              <div className="location-info">
                <MapPin size={24} />
                <h2>{weatherData.location}</h2>
              </div>
              <div className="weather-icon">
                {getWeatherIcon(weatherData.weather)}
              </div>
            </div>

            <div className="weather-details">
              <div className="main-temp">
                <Thermometer size={32} />
                <span className="temperature">{weatherData.temperature}</span>
              </div>
              
              <div className="weather-description">
                <span>{weatherData.weather}</span>
              </div>

              <div className="additional-info">
                <div className="info-item">
                  <Gauge size={20} />
                  <span>Humidity: {weatherData.humidity || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <Wind size={20} />
                  <span>Wind: {weatherData.wind || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <Calendar size={20} />
                  <span>Updated: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="advice-section">
            <div className="section-header">
              <Lightbulb size={24} />
              <h3>Farming Advice</h3>
            </div>
            
            <div className="advice-list">
              {formatAdvice(weatherData.advice).map((item, index) => (
                <div key={index} className="advice-item">
                  <Droplet size={20} />  {/* Replaced EyeDropper with Droplet */}
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="weather-tips">
            <div className="section-header">
              <AlertTriangle size={24} />
              <h3>Weather Tips</h3>
            </div>
            
            <div className="tips-grid">
              <div className="tip-card">
                <CloudRain size={32} />
                <h4>Rainy Conditions</h4>
                <ul>
                  <li>Delay irrigation to conserve water</li>
                  <li>Check drainage systems</li>
                  <li>Protect sensitive crops</li>
                </ul>
              </div>

              <div className="tip-card">
                <Sun size={32} />
                <h4>Sunny Conditions</h4>
                <ul>
                  <li>Water plants early morning</li>
                  <li>Provide shade for delicate plants</li>
                  <li>Monitor soil moisture levels</li>
                </ul>
              </div>

              <div className="tip-card">
                <Wind size={32} />
                <h4>Windy Conditions</h4>
                <ul>
                  <li>Secure greenhouses and structures</li>
                  <li>Protect young plants</li>
                  <li>Check for soil erosion</li>
                </ul>
              </div>

              <div className="tip-card">
                <CloudSnow size={32} />
                <h4>Cold Conditions</h4>
                <ul>
                  <li>Protect plants from frost</li>
                  <li>Consider greenhouse cultivation</li>
                  <li>Delay planting sensitive crops</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="empty-state">
            <Cloud size={64} />
            <h3>Check Weather Conditions</h3>
            <p>Enter a city name to get current weather and farming advice</p>
            <div className="example-cities">
              <span>Try: Nairobi, London, Tokyo, New York, Paris</span>
            </div>
          </div>
        )
      )}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Fetching weather data...</p>
        </div>
      )}
    </div>
  )
}

export default Weather
