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

// GET /api/doctors/online
router.get('/online', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const { data } = await axios.get(`${DOTNET}/api/doctors/online?limit=${limit}`);
    res.status(200).json(data);
  } catch (error) { err(res, error); }
});

// GET /api/doctors
router.get('/', async (req, res) => {
  try {
    const { specialization, city, online, page = 1, limit = 10 } = req.query;
    const params = new URLSearchParams({ specialization, city, online, page, limit }).toString();
    const { data } = await axios.get(`${DOTNET}/api/doctors?${params}`);
    res.status(200).json(data);
  } catch (error) { err(res, error); }
});

// POST /api/doctors/:id/session
router.post('/:id/session', protect, async (req, res) => {
  try {
    const { data } = await axios.post(
      `${DOTNET}/api/doctors/${req.params.id}/session`,
      { userId: req.user.id },
      h(getToken(req))
    );
    res.status(200).json({ message: 'Session started successfully', session: data });
  } catch (error) { err(res, error); }
});

// GET /api/doctors/appointments
router.get('/appointments', protect, async (req, res) => {
  try {
    const { data } = await axios.get(`${DOTNET}/api/appointments/user/${req.user.id}`, h(getToken(req)));
    res.status(200).json(data);
  } catch (error) { err(res, error); }
});

// DELETE /api/doctors/appointments/:id
router.delete('/appointments/:id', protect, async (req, res) => {
  try {
    await axios.delete(`${DOTNET}/api/appointments/${req.params.id}`, h(getToken(req)));
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) { err(res, error); }
});

// PATCH /api/doctors/appointments/:id/reminder
router.patch('/appointments/:id/reminder', protect, async (req, res) => {
  try {
    const { reminder } = req.body;
    if (typeof reminder !== 'boolean')
      return res.status(400).json({ message: 'Reminder must be true or false' });
    const { data } = await axios.patch(
      `${DOTNET}/api/appointments/${req.params.id}/reminder`,
      { reminder },
      h(getToken(req))
    );
    res.status(200).json({ message: 'Reminder updated successfully', data });
  } catch (error) { err(res, error); }
});

export default router;