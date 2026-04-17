import express from 'express';
import axios from 'axios';

const router = express.Router();
const DOTNET = process.env.DOTNET_API_URL;

// GET /api/home/stats
router.get('/stats', async (req, res) => {
  try {
    const { data } = await axios.get(`${DOTNET}/api/home/stats`);
    res.status(200).json(data);
  } catch {
    res.status(200).json({ patients: 30000, appointments: 50000, doctors: 10000, hospitals: 15000 });
  }
});

// GET /api/home/specializations
router.get('/specializations', async (req, res) => {
  try {
    const { data } = await axios.get(`${DOTNET}/api/home/specializations`);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/home/specializations/all
router.get('/specializations/all', async (req, res) => {
  try {
    const { data } = await axios.get(`${DOTNET}/api/home/specializations/all`);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;