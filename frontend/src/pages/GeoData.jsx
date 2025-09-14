// src/pages/GeoData.jsx
import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MapPin, Droplets, Sprout, Trash2, Edit, Eye } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import GeoDataModal from '../components/geodata/GeoDataModal'
import DeleteConfirmation from '../components/common/DeleteConfirmation'
import './GeoData.css'

const GeoData = () => {
  const { user } = useAuth()
  const [geoData, setGeoData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [soilTypeFilter, setSoilTypeFilter] = useState('all')
  const [waterSourceFilter, setWaterSourceFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [deleteData, setDeleteData] = useState(null)
  const [viewData, setViewData] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchGeoData()
  }, [])

  const fetchGeoData = async () => {
    try {
      const endpoint = user.role === 'admin' ? '/geo-data' : '/geo-data/my-farm'
      const response = await api.get(endpoint)
      setGeoData(response.data.geoData || response.data)
    } catch (error) {
      console.error('Error fetching geo data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingData(null)
    setShowModal(true)
  }

  const handleEdit = (data) => {
    setEditingData(data)
    setShowModal(true)
  }

  const handleView = (data) => {
    setViewData(data)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/geo-data/${deleteData._id}`)
      setGeoData(geoData.filter(item => item._id !== deleteData._id))
      setDeleteData(null)
    } catch (error) {
      console.error('Error deleting geo data:', error)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingData(null)
    setViewData(null)
    fetchGeoData() // Refresh data
  }

  // Filter data based on search term and filters
  const filteredData = geoData.filter(item => {
    const matchesSearch = 
      item.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produce.some(produce => produce.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSoilType = soilTypeFilter === 'all' || item.soilType === soilTypeFilter
    const matchesWaterSource = waterSourceFilter === 'all' || item.waterSource === waterSourceFilter
    
    return matchesSearch && matchesSoilType && matchesWaterSource
  })

  // Get unique values for filters
  const soilTypes = ['all', 'CLAY', 'SANDY', 'LOAMY', 'SILTY', 'PEATY', 'CHALKY']
  const waterSources = ['all', 'RIVER', 'WELL', 'RAINFED', 'IRRIGATION_SYSTEM']

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatSoilType = (type) => {
    return type.charAt(0) + type.slice(1).toLowerCase()
  }

  const formatWaterSource = (source) => {
    return source.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="geo-data-loading">
        <div className="loading-spinner"></div>
        <p>Loading farm data...</p>
      </div>
    )
  }

  return (
    <div className="geo-data">
      <div className="geo-data-header">
        <div className="header-content">
          <h1>Farm Data</h1>
          <p>Manage your farm location, soil, and water information</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Add Farm Data
        </button>
      </div>

      <div className="geo-data-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search farms or produce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={soilTypeFilter}
              onChange={(e) => setSoilTypeFilter(e.target.value)}
            >
              {soilTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Soil Types' : formatSoilType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Filter size={16} />
            <select
              value={waterSourceFilter}
              onChange={(e) => setWaterSourceFilter(e.target.value)}
            >
              {waterSources.map(source => (
                <option key={source} value={source}>
                  {source === 'all' ? 'All Water Sources' : formatWaterSource(source)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats">
          <span>{filteredData.length} farms found</span>
        </div>
      </div>

      <div className="geo-data-grid">
        {currentItems.length > 0 ? (
          currentItems.map(item => (
            <GeoDataCard
              key={item._id}
              data={item}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={setDeleteData}
              userRole={user.role}
              formatSoilType={formatSoilType}
              formatWaterSource={formatWaterSource}
            />
          ))
        ) : (
          <div className="empty-state">
            <MapPin size={64} />
            <h3>No farm data found</h3>
            <p>Get started by adding your first farm data</p>
            <button className="btn-primary" onClick={handleCreate}>
              <Plus size={20} />
              Add Farm Data
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
        <GeoDataModal
          data={editingData}
          onClose={handleModalClose}
        />
      )}

      {viewData && (
        <GeoDataModal
          data={viewData}
          onClose={handleModalClose}
          viewMode={true}
        />
      )}

      {deleteData && (
        <DeleteConfirmation
          item={deleteData}
          onClose={() => setDeleteData(null)}
          onConfirm={handleDelete}
          title="Delete Farm Data"
          message={`Are you sure you want to delete "${deleteData.farmName}"? This action cannot be undone.`}
        />
      )}
    </div>
  )
}

const GeoDataCard = ({ data, onEdit, onView, onDelete, userRole, formatSoilType, formatWaterSource }) => {
  const canEdit = userRole === 'admin' || (userRole === 'farmer' && data.farmer?._id)

  return (
    <div className="geo-data-card">
      <div className="card-header">
        <div className="farm-info">
          <h3>{data.farmName}</h3>
          {data.farmer && (
            <p className="farmer-name">by {data.farmer.name}</p>
          )}
        </div>
        <div className="card-actions">
          <button 
            className="btn-icon" 
            onClick={() => onView(data)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {canEdit && (
            <>
              <button 
                className="btn-icon" 
                onClick={() => onEdit(data)}
                title="Edit Farm Data"
              >
                <Edit size={16} />
              </button>
              <button 
                className="btn-icon danger" 
                onClick={() => onDelete(data)}
                title="Delete Farm Data"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card-content">
        <div className="location-info">
          <div className="info-item">
            <MapPin size={16} />
            <span>Location: {data.location.latitude.toFixed(4)}, {data.location.longitude.toFixed(4)}</span>
          </div>
        </div>

        <div className="farm-details">
          <div className="detail-item">
            <div className="detail-icon soil">
              <Droplets size={16} />
            </div>
            <div className="detail-content">
              <span className="label">Soil Type</span>
              <span className="value">{formatSoilType(data.soilType)}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon water">
              <Droplets size={16} />
            </div>
            <div className="detail-content">
              <span className="label">Water Source</span>
              <span className="value">{formatWaterSource(data.waterSource)}</span>
            </div>
          </div>
        </div>

        {data.produce && data.produce.length > 0 && (
          <div className="produce-section">
            <div className="section-header">
              <Sprout size={16} />
              <span>Produce</span>
            </div>
            <div className="produce-tags">
              {data.produce.map((item, index) => (
                <span key={index} className="produce-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="card-footer">
          <span className="date">
            Added: {new Date(data.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default GeoData