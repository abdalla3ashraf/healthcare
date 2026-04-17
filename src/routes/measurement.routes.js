import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const DOTNET = process.env.DOTNET_API_URL;
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const getToken = (req) => req.headers.authorization?.split(' ')[1];
const err = (res, error) => res.status(error.response?.status || 500).json({
  message: error.response?.data?.message || error.message || 'Server error',
});

// ─── BLOOD PRESSURE ───────────────────────────────────────

// GET /api/measurements/blood-pressure
router.get('/blood-pressure', protect, async (req, res) => {
  try {
    const { data } = await axios.get(`${DOTNET}/api/Users/measurements/BloodPressure`, h(getToken(req)));
    res.status(200).json(data);
  } catch (error) { err(res, error); }
});

// POST /api/measurements/blood-pressure
router.post('/blood-pressure', protect, async (req, res) => {
  try {
    const { date, breakfast, afterLunch, afterDinner, note } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const { data } = await axios.post(`${DOTNET}/api/Users/add-measurement`, {
      type:      'BloodPressure',
      date,
      breakfast: breakfast || null,
      lunch:     afterLunch || null,
      dinner:    afterDinner || null,
      note:      note || null,
    }, h(getToken(req)));

    res.status(201).json({ message: 'Blood pressure added successfully', data });
  } catch (error) { err(res, error); }
});

// DELETE /api/measurements/blood-pressure/:date
router.delete('/blood-pressure/:date', protect, async (req, res) => {
  try {
    await axios.delete(`${DOTNET}/api/Users/measurements/BloodPressure/${req.params.date}`, h(getToken(req)));
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) { err(res, error); }
});

// ─── DIABETES ─────────────────────────────────────────────

// GET /api/measurements/diabetes
router.get('/diabetes', protect, async (req, res) => {
  try {
    const { data } = await axios.get(`${DOTNET}/api/Users/measurements/Diabetes`, h(getToken(req)));
    res.status(200).json(data);
  } catch (error) { err(res, error); }
});

// POST /api/measurements/diabetes
router.post('/diabetes', protect, async (req, res) => {
  try {
    const { date, fasting, beforeLunch, afterDinner, note } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const { data } = await axios.post(`${DOTNET}/api/Users/add-measurement`, {
      type:       'Diabetes',
      date,
      breakfast:  fasting?.toString() || null,
      lunch:      beforeLunch?.toString() || null,
      dinner:     afterDinner?.toString() || null,
      sugarLevel: fasting || 0,
      note:       note || null,
    }, h(getToken(req)));

    res.status(201).json({ message: 'Diabetes record added successfully', data });
  } catch (error) { err(res, error); }
});

// DELETE /api/measurements/diabetes/:date
router.delete('/diabetes/:date', protect, async (req, res) => {
  try {
    await axios.delete(`${DOTNET}/api/Users/measurements/Diabetes/${req.params.date}`, h(getToken(req)));
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) { err(res, error); }
});

// ─── BODY TEMPERATURE ─────────────────────────────────────

// GET /api/measurements/body-temperature
router.get('/body-temperature', protect, async (req, res) => {
  try {
    const { data } = await axios.get(`${DOTNET}/api/Users/measurements/Temperature`, h(getToken(req)));
    res.status(200).json(data);
  } catch (error) { err(res, error); }
});

// POST /api/measurements/body-temperature
router.post('/body-temperature', protect, async (req, res) => {
  try {
    const { date, morning, afternoon, evening, note } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    if (morning && (morning < 30 || morning > 45))
      return res.status(400).json({ message: 'Morning temperature out of range (30-45°C)' });
    if (afternoon && (afternoon < 30 || afternoon > 45))
      return res.status(400).json({ message: 'Afternoon temperature out of range (30-45°C)' });
    if (evening && (evening < 30 || evening > 45))
      return res.status(400).json({ message: 'Evening temperature out of range (30-45°C)' });

    const { data } = await axios.post(`${DOTNET}/api/Users/add-measurement`, {
      type:        'Temperature',
      date,
      breakfast:   morning?.toString() || null,
      lunch:       afternoon?.toString() || null,
      dinner:      evening?.toString() || null,
      temperature: morning || 0,
      note:        note || null,
    }, h(getToken(req)));

    res.status(201).json({ message: 'Body temperature added successfully', data });
  } catch (error) { err(res, error); }
});

// DELETE /api/measurements/body-temperature/:date
router.delete('/body-temperature/:date', protect, async (req, res) => {
  try {
    await axios.delete(`${DOTNET}/api/Users/measurements/Temperature/${req.params.date}`, h(getToken(req)));
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) { err(res, error); }
});

// ─── NOTE ─────────────────────────────────────────────────

// POST /api/measurements/:type/note
router.post('/:type/note', protect, async (req, res) => {
  try {
    const { type } = req.params;
    const { date, note } = req.body;

    const typeMap = {
      'blood-pressure': 'BloodPressure',
      'diabetes':       'Diabetes',
      'body-temperature': 'Temperature',
    };

    if (!typeMap[type])
      return res.status(400).json({ message: 'Invalid measurement type' });
    if (!date || !note)
      return res.status(400).json({ message: 'Date and note are required' });

    const { data } = await axios.post(`${DOTNET}/api/Users/add-measurement`, {
      type: typeMap[type], date, note,
    }, h(getToken(req)));

    res.status(201).json({ message: 'Note added successfully', data });
  } catch (error) { err(res, error); }
});

export default router;