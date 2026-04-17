import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const DOTNET = process.env.DOTNET_API_URL;
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const getToken = (req) => req.headers.authorization?.split(' ')[1];
const err = (res, error) => res.status(error.response?.status || 500).json({
  message: error.response?.data?.message || 'Server error',
});

// GET /api/comments
router.get('/', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const { data } = await axios.get(`${DOTNET}/api/comments?limit=${limit}`);
    res.status(200).json(data);
  } catch (error) { err(res, error); }
});

// GET /api/comments/all
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { data } = await axios.get(`${DOTNET}/api/comments/all?page=${page}&limit=${limit}`);
    res.status(200).json(data);
  } catch (error) { err(res, error); }
});

// POST /api/comments
router.post('/', protect, async (req, res) => {
  try {
    const { text, rating } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });
    if (text.length > 500) return res.status(400).json({ message: 'Too long (max 500 chars)' });
    if (rating && (rating < 1 || rating > 5))
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const { data: comment } = await axios.post(`${DOTNET}/api/comments`,
      { text, rating, userId: req.user.id },
      h(getToken(req))
    );
    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) { err(res, error); }
});

export default router;