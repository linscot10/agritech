// src/components/forum/PostModal.jsx
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../utils/api'
import './PostModal.css'

const PostModal = ({ post, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || ''
      })
    }
  }, [post])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.content.trim()) newErrors.content = 'Content is required'
    if (formData.title.length > 200) newErrors.title = 'Title must be less than 200 characters'
    if (formData.content.length > 5000) newErrors.content = 'Content must be less than 5000 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      if (post) {
        await api.put(`/posts/${post._id}`, formData)
      } else {
        await api.post('/posts', formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving post:', error)
      setErrors({ submit: 'Failed to save post. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{post ? 'Edit Post' : 'Create New Post'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Post Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="Enter a title for your post"
              maxLength={200}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
            <div className="character-count">
              {formData.title.length}/200 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">Post Content *</label>
            <textarea
              id="content"
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              className={errors.content ? 'error' : ''}
              placeholder="Share your thoughts, questions, or experiences..."
              maxLength={5000}
            />
            {errors.content && <span className="error-text">{errors.content}</span>}
            <div className="character-count">
              {formData.content.length}/5000 characters
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostModal