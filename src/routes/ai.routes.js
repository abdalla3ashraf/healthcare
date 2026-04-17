import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const AI = process.env.AI_API_URL;

// POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });
    if (message.length > 1000) return res.status(400).json({ message: 'Message too long (max 1000)' });

    const { data: aiResponse } = await axios.post(`${AI}/api/chat`, {
      message, history,
      userContext: { userId: req.user.id, email: req.user.email },
    });
    res.status(200).json({ reply: aiResponse.reply, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ message: 'AI service unavailable' });
  }
});

// GET /api/ai/suggestions
router.get('/suggestions', protect, (req, res) => {
  res.status(200).json({
    suggestions: [
      'What are COVID symptoms?',
      'How to lower blood pressure?',
      'Best foods for diabetes?',
      'When to see a doctor?',
    ],
  });
});

export default router;