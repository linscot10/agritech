// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');

// Create a post
router.post('/', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });

    const post = await Post.create({ user: req.user._id, title, content });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name email')
      .populate('comments.user', 'name email');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to post
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    const updated = await Post.findById(req.params.id)
      .populate('user', 'name')
      .populate('comments.user', 'name');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike post
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post (author or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.user.role !== 'admin' && post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment (comment owner or admin)
router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (req.user.role !== 'admin' && comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    comment.remove();
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
