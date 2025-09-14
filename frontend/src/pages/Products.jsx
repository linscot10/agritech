// src/pages/Products.jsx
import { useState, useEffect } from 'react'
// import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react';

import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import ProductModal from '../components/products/ProductModal'
import DeleteConfirmation from '../components/common/DeleteConfirmation'
import './Products.css'

const Products = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(10)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteProduct._id}`)
      setProducts(products.filter(p => p._id !== deleteProduct._id))
      setDeleteProduct(null)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const handleProductSave = (savedProduct) => {
    if (editingProduct) {
      setProducts(products.map(p => p._id === savedProduct._id ? savedProduct : p))
    } else {
      setProducts([savedProduct, ...products])
    }
    handleModalClose()
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="products">
      <div className="products-header">
        <div className="header-content">
          <h1>Products</h1>
          <p>Manage your agricultural products and inventory</p>
        </div>
        {user.role !== 'tech' && (
          <button className="btn-primary" onClick={handleCreate}>
            <Plus size={20} />
            Add Product
          </button>
        )}
      </div>

      <div className="products-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="stats">
          <span>{filteredProducts.length} products found</span>
        </div>
      </div>

      <div className="products-grid">
        {currentProducts.length > 0 ? (
          currentProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={handleEdit}
              onDelete={setDeleteProduct}
              userRole={user.role}
            />
          ))
        ) : (
          <div className="empty-state">
            <Package size={64} />
            <h3>No products found</h3>
            <p>Get started by adding your first product</p>
            {user.role !== 'tech' && (
              <button className="btn-primary" onClick={handleCreate}>
                <Plus size={20} />
                Add Product
              </button>
            )}
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
        <ProductModal
          product={editingProduct}
          onClose={handleModalClose}
          onSave={handleProductSave}
        />
      )}

      {deleteProduct && (
        <DeleteConfirmation
          item={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onConfirm={handleDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteProduct.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  )
}

const ProductCard = ({ product, onEdit, onDelete, userRole }) => (
  <div className="product-card">
    <div className="product-image">
      {product.image ? (
        <img src={`http://localhost:5000${product.image}`} alt={product.name} />
      ) : (
        <div className="image-placeholder">
          <Package size={32} />
        </div>
      )}
    </div>
    
    <div className="product-content">
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>
      
      <div className="product-meta">
        <div className="meta-item">
          <span className="meta-label">Price:</span>
          <span className="meta-value">${product.price}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Stock:</span>
          <span className={`meta-value ${product.quantity === 0 ? 'out-of-stock' : ''}`}>
            {product.quantity} units
          </span>
        </div>
        {product.category && (
          <div className="meta-item">
            <span className="meta-label">Category:</span>
            <span className="meta-value">{product.category}</span>
          </div>
        )}
      </div>

      <div className="product-actions">
        <button className="btn-icon" title="View Details">
          <Eye size={16} />
        </button>
        {userRole !== 'tech' && (
          <>
            <button 
              className="btn-icon" 
              onClick={() => onEdit(product)}
              title="Edit Product"
            >
              <Edit size={16} />
            </button>
            <button 
              className="btn-icon danger" 
              onClick={() => onDelete(product)}
              title="Delete Product"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  </div>
)

export default Products