// src/pages/Sensors.jsx
import { useState, useEffect } from 'react'
import { Plus, Search, Droplets, Thermometer, Gauge, MapPin, Calendar, AlertCircle, Lightbulb } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import SensorModal from '../components/sensors/SensorModal'
import './Sensors.css'

const Sensors = () => {
  const { user } = useAuth()
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [advice, setAdvice] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [readingsPerPage] = useState(10)

  useEffect(() => {
    fetchReadings()
    fetchAdvice()
  }, [])

  const fetchReadings = async () => {
    try {
      const response = await api.get('/sensors')
      setReadings(response.data)
    } catch (error) {
      console.error('Error fetching sensor readings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdvice = async () => {
    try {
      const response = await api.get('/sensors/advice')
      setAdvice(response.data)
    } catch (error) {
      console.error('Error fetching irrigation advice:', error)
    }
  }

  const handleCreateReading = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    fetchReadings() // Refresh readings
    fetchAdvice() // Refresh advice
  }

  // Filter readings based on search term
  const filteredReadings = readings.filter(reading =>
    reading.createdAt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reading.location?.coordinates?.join(',').includes(searchTerm)
  )

  // Pagination
  const indexOfLastReading = currentPage * readingsPerPage
  const indexOfFirstReading = indexOfLastReading - readingsPerPage
  const currentReadings = filteredReadings.slice(indexOfFirstReading, indexOfLastReading)
  const totalPages = Math.ceil(filteredReadings.length / readingsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getMoistureLevel = (moisture) => {
    if (moisture < 30) return { level: 'Low', class: 'low' }
    if (moisture < 60) return { level: 'Moderate', class: 'moderate' }
    return { level: 'High', class: 'high' }
  }

  const getTemperatureLevel = (temp) => {
    if (temp < 10) return { level: 'Cold', class: 'cold' }
    if (temp < 25) return { level: 'Moderate', class: 'moderate' }
    if (temp < 35) return { level: 'Warm', class: 'warm' }
    return { level: 'Hot', class: 'hot' }
  }

  const getHumidityLevel = (humidity) => {
    if (humidity < 30) return { level: 'Dry', class: 'dry' }
    if (humidity < 70) return { level: 'Comfortable', class: 'comfortable' }
    return { level: 'Humid', class: 'humid' }
  }

  if (loading) {
    return (
      <div className="sensors-loading">
        <div className="loading-spinner"></div>
        <p>Loading sensor data...</p>
      </div>
    )
  }

  return (
    <div className="sensors">
      <div className="sensors-header">
        <div className="header-content">
          <h1>Sensor Readings</h1>
          <p>Monitor soil conditions and get irrigation advice</p>
        </div>
        <button className="btn-primary" onClick={handleCreateReading}>
          <Plus size={20} />
          New Reading
        </button>
      </div>

      {/* Irrigation Advice Card */}
      {advice && (
        <div className="advice-card">
          <div className="advice-header">
            <Lightbulb size={24} />
            <h3>Irrigation Advice</h3>
          </div>
          <div className="advice-content">
            <p className="advice-message">{advice.advice}</p>
            {advice.latest && (
              <div className="latest-reading">
                <h4>Latest Reading:</h4>
                <div className="reading-details">
                  <span>Moisture: {advice.latest.soilMoisture}%</span>
                  <span>Temp: {advice.latest.temperature}°C</span>
                  <span>Humidity: {advice.latest.humidity}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sensors-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search readings by date or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="stats">
          <span>{filteredReadings.length} readings found</span>
        </div>
      </div>

      <div className="readings-grid">
        {currentReadings.length > 0 ? (
          currentReadings.map(reading => (
            <SensorCard
              key={reading._id}
              reading={reading}
              formatDate={formatDate}
              getMoistureLevel={getMoistureLevel}
              getTemperatureLevel={getTemperatureLevel}
              getHumidityLevel={getHumidityLevel}
            />
          ))
        ) : (
          <div className="empty-state">
            <Droplets size={64} />
            <h3>No sensor readings found</h3>
            <p>Get started by adding your first sensor reading</p>
            <button className="btn-primary" onClick={handleCreateReading}>
              <Plus size={20} />
              New Reading
            </button>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <SensorModal onClose={handleCloseModal} />
      )}
    </div>
  )
}

const SensorCard = ({ reading, formatDate, getMoistureLevel, getTemperatureLevel, getHumidityLevel }) => {
  const moisture = getMoistureLevel(reading.soilMoisture)
  const temperature = getTemperatureLevel(reading.temperature)
  const humidity = getHumidityLevel(reading.humidity)

  return (
    <div className="sensor-card">
      <div className="card-header">
        <div className="reading-date">
          <Calendar size={16} />
          <span>{formatDate(reading.createdAt)}</span>
        </div>
        {reading.location && reading.location.coordinates && (
          <div className="reading-location">
            <MapPin size={16} />
            <span>{reading.location.coordinates[1].toFixed(4)}, {reading.location.coordinates[0].toFixed(4)}</span>
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="sensor-metric">
          <div className="metric-header">
            <Droplets size={20} />
            <span>Soil Moisture</span>
          </div>
          <div className={`metric-value ${moisture.class}`}>
            {reading.soilMoisture}%
            <span className="metric-level">{moisture.level}</span>
          </div>
        </div>

        <div className="sensor-metric">
          <div className="metric-header">
            <Thermometer size={20} />
            <span>Temperature</span>
          </div>
          <div className={`metric-value ${temperature.class}`}>
            {reading.temperature}°C
            <span className="metric-level">{temperature.level}</span>
          </div>
        </div>

        <div className="sensor-metric">
          <div className="metric-header">
            <Gauge size={20} />
            <span>Humidity</span>
          </div>
          <div className={`metric-value ${humidity.class}`}>
            {reading.humidity}%
            <span className="metric-level">{humidity.level}</span>
          </div>
        </div>
      </div>

      {/* Warning for low moisture */}
      {reading.soilMoisture < 30 && (
        <div className="card-warning">
          <AlertCircle size={16} />
          <span>Low moisture level - Consider irrigation</span>
        </div>
      )}
    </div>
  )
}

export default Sensors