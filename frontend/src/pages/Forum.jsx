// src/pages/Forum.jsx
import { useState, useEffect } from 'react'
import { Plus, Search, MessageSquare, Heart, MessageCircle, User, Calendar, MoreVertical } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import PostModal from '../components/forum/PostModal'
import DeleteConfirmation from '../components/common/DeleteConfirmation'

import './Forum.css'

const Forum = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [deletePost, setDeletePost] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage] = useState(10)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts')
      setPosts(response.data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = () => {
    setSelectedPost(null)
    setShowModal(true)
  }

  const handleEditPost = (post) => {
    setSelectedPost(post)
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${deletePost._id}`)
      setPosts(posts.filter(post => post._id !== deletePost._id))
      setDeletePost(null)
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`)
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: response.data.likes } 
          : post
      ))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedPost(null)
    fetchPosts() // Refresh posts
  }

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isLikedByUser = (post) => {
    return post.likes.includes(user._id)
  }

  if (loading) {
    return (
      <div className="forum-loading">
        <div className="loading-spinner"></div>
        <p>Loading forum posts...</p>
      </div>
    )
  }

  return (
    <div className="forum">
      <div className="forum-header">
        <div className="header-content">
          <h1>Community Forum</h1>
          <p>Share knowledge, ask questions, and connect with other farmers</p>
        </div>
        <button className="btn-primary" onClick={handleCreatePost}>
          <Plus size={20} />
          New Post
        </button>
      </div>

      <div className="forum-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="stats">
          <span>{filteredPosts.length} posts found</span>
        </div>
      </div>

      <div className="posts-container">
        {currentPosts.length > 0 ? (
          currentPosts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onEdit={handleEditPost}
              onDelete={setDeletePost}
              onLike={handleLike}
              isLiked={isLikedByUser(post)}
              user={user}
              formatDate={formatDate}
            />
          ))
        ) : (
          <div className="empty-state">
            <MessageSquare size={64} />
            <h3>No posts found</h3>
            <p>Be the first to start a discussion</p>
            <button className="btn-primary" onClick={handleCreatePost}>
              <Plus size={20} />
              Create Post
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
        <PostModal
          post={selectedPost}
          onClose={handleModalClose}
        />
      )}

      {deletePost && (
        <DeleteConfirmation
          item={deletePost}
          onClose={() => setDeletePost(null)}
          onConfirm={handleDelete}
          title="Delete Post"
          message={`Are you sure you want to delete "${deletePost.title}"? This action cannot be undone.`}
        />
      )}
    </div>
  )
}

const PostCard = ({ post, onEdit, onDelete, onLike, isLiked, user, formatDate }) => {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commenting, setCommenting] = useState(false)

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setCommenting(true)
    try {
      const response = await api.post(`/posts/${post._id}/comments`, {
        text: newComment.trim()
      })
      // Update the post with new comments
      const updatedPost = response.data
      onLike(post._id) // Refresh the post data
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setCommenting(false)
    }
  }

  const canEditDelete = user.role === 'admin' || post.user._id === user._id

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-info">
          <div className="user-avatar">
            {post.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{post.user.name}</span>
            <span className="post-date">
              <Calendar size={12} />
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        {canEditDelete && (
          <div className="post-actions">
            <button
              onClick={() => onEdit(post)}
              className="btn-icon"
              title="Edit Post"
            >
              <MoreVertical size={16} />
            </button>
            <div className="dropdown-menu">
              <button onClick={() => onEdit(post)}>Edit</button>
              <button onClick={() => onDelete(post)} className="danger">
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">{post.content}</p>
      </div>

      <div className="post-footer">
        <div className="post-stats">
          <button
            onClick={() => onLike(post._id)}
            className={`like-btn ${isLiked ? 'liked' : ''}`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{post.likes.length}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="comment-btn"
          >
            <MessageCircle size={18} />
            <span>{post.comments.length}</span>
          </button>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="view-comments-btn"
        >
          {showComments ? 'Hide Comments' : 'View Comments'}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments.length > 0 ? (
              post.comments.map(comment => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user.name}</span>
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            <div className="comment-input">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                disabled={commenting}
              />
              <button
                type="submit"
                disabled={commenting || !newComment.trim()}
                className="btn-primary"
              >
                {commenting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Forum