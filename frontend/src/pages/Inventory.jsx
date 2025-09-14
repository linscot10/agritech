// src/pages/Inventory.jsx
import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Package } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import InventoryModal from '../components/inventory/InventoryModal'
import DeleteConfirmation from '../components/common/DeleteConfirmation'
import './Inventory.css'

const Inventory = () => {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory')
      setInventory(response.data.items)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/inventory/${deleteItem._id}`)
      setInventory(inventory.filter(i => i._id !== deleteItem._id))
      setDeleteItem(null)
    } catch (error) {
      console.error('Error deleting inventory item:', error)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  const handleItemSave = (savedItem) => {
    if (editingItem) {
      setInventory(inventory.map(i => i._id === savedItem._id ? savedItem : i))
    } else {
      setInventory([savedItem, ...inventory])
    }
    handleModalClose()
  }

  // Filter inventory based on search term and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = ['all', ...new Set(inventory.map(item => item.category).filter(Boolean))]

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="loading-spinner"></div>
        <p>Loading inventory...</p>
      </div>
    )
  }

  return (
    <div className="inventory">
      <div className="inventory-header">
        <div className="header-content">
          <h1>Inventory</h1>
          <p>Manage your farm supplies and equipment</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Add Item
        </button>
      </div>

      <div className="inventory-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <Filter size={20} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="stats">
          <span>{filteredInventory.length} items found</span>
        </div>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Acquired Date</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(item => (
                <InventoryRow
                  key={item._id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={setDeleteItem}
                  userRole={user.role}
                />
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-table">
                  <Package size={48} />
                  <h3>No inventory items found</h3>
                  <p>Get started by adding your first inventory item</p>
                  <button className="btn-primary" onClick={handleCreate}>
                    <Plus size={20} />
                    Add Item
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
        <InventoryModal
          item={editingItem}
          onClose={handleModalClose}
          onSave={handleItemSave}
        />
      )}

      {deleteItem && (
        <DeleteConfirmation
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
          title="Delete Inventory Item"
          message={`Are you sure you want to delete "${deleteItem.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  )
}

const InventoryRow = ({ item, onEdit, onDelete, userRole }) => {
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date()
  const isExpiringSoon = item.expiryDate && 
    new Date(item.expiryDate) > new Date() && 
    new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return (
    <tr className={isExpired ? 'expired' : isExpiringSoon ? 'expiring-soon' : ''}>
      <td>
        <div className="item-name">
          <Package size={16} />
          <span>{item.name}</span>
        </div>
      </td>
      <td>
        <span className="category-badge">{item.category}</span>
      </td>
      <td>
        <span className={`quantity ${item.quantity === 0 ? 'out-of-stock' : ''}`}>
          {item.quantity}
        </span>
      </td>
      <td>{item.unit}</td>
      <td>
        {item.acquiredDate ? new Date(item.acquiredDate).toLocaleDateString() : 'N/A'}
      </td>
      <td>
        {item.expiryDate ? (
          <span className={isExpired ? 'expired-date' : isExpiringSoon ? 'expiring-soon-date' : ''}>
            {new Date(item.expiryDate).toLocaleDateString()}
          </span>
        ) : (
          'N/A'
        )}
      </td>
      <td>
        <div className="table-actions">
          <button 
            className="btn-icon" 
            onClick={() => onEdit(item)}
            title="Edit Item"
          >
            <Edit size={16} />
          </button>
          <button 
            className="btn-icon danger" 
            onClick={() => onDelete(item)}
            title="Delete Item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default Inventory