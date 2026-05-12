import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.middleware.js';
import { sendEmergencyEmail } from '../services/email.service.js';
const router = express.Router();
const DOTNET = process.env.DOTNET_API_URL;
const AI = process.env.AI_API_URL;
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const getToken = (req) => req.headers.authorization?.split(' ')[1];
const err = (res, error) => res.status(error.response?.status || 500).json({
  message: error.response?.data?.message || 'Server error',
});

const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const calculateRisk = (bp, diabetes, bodyTemp) => {
  let score = 0;
  if (bp) {
    const s = parseInt(bp.split('/')[0]);
    const d = parseInt(bp.split('/')[1]);
    if (s >= 180 || d >= 120) score += 3;
    else if (s >= 140 || d >= 90) score += 2;
    else if (s >= 130 || d >= 80) score += 1;
  }
  if (diabetes) {
    if (diabetes >= 126) score += 3;
    else if (diabetes >= 100) score += 2;
  }
  if (bodyTemp) {
    if (bodyTemp >= 39) score += 3;
    else if (bodyTemp >= 38) score += 2;
    else if (bodyTemp >= 37.3) score += 1;
  }
  if (score >= 5) return { level: 'High', message: 'High risk. Seek immediate medical attention or call 123.', score };
  if (score >= 2) return { level: 'Medium', message: 'Some vitals are abnormal. Consult your doctor soon.', score };
  return { level: 'Low', message: 'Your vitals appear normal', score };
};

// GET /api/emergency
router.get('/', protect, async (req, res) => {
  try {
    const { data } = await axios.get(`${DOTNET}/api/emergency/${req.user.id}`, h(getToken(req)));
    res.status(200).json({ ...data, age: calculateAge(data.birthDate) });
  } catch (error) { err(res, error); }
});

// PATCH /api/emergency/phone
router.patch('/phone', protect, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });
    if (!/^01[0-2,5]{1}[0-9]{8}$/.test(phone))
      return res.status(400).json({ message: 'Invalid Egyptian phone number' });
    const { data } = await axios.patch(`${DOTNET}/api/emergency/${req.user.id}/phone`, { phone }, h(getToken(req)));
    res.status(200).json({ message: 'Phone updated successfully', data });
  } catch (error) { err(res, error); }
});

// POST /api/emergency/contacts
router.post('/contacts', protect, async (req, res) => {
  try {
    const { name, phoneNumber, email, relation } = req.body;

    if (!name || !phoneNumber || !relation)
      return res.status(400).json({ message: 'Name, phoneNumber, and relation are required' });
if (phoneNumber.length >11)
        return res.status(400).json({ message: 'phoneNumber must be at least 11 characters' });

    // جيب الـ contacts الموجودة الأول
    const { data: existingContacts } = await axios.get(
      `${DOTNET}/api/Users/my-emergency-contacts`,
      h(getToken(req))
    );

    // تحقق لو الرقم موجود بالفعل
    const duplicate = existingContacts.find(
      (c) => c.phoneNumber === phoneNumber
    );

    if (duplicate)
      return res.status(400).json({ 
        message: `الرقم ${phoneNumber} مضاف بالفعل باسم ${duplicate.name}` 
      });

    // لو مش موجود — أضفه
    const { data } = await axios.post(
      `${DOTNET}/api/Users/add-emergency-contact`,
      { name, phoneNumber, email, relation },
      h(getToken(req))
    );

    res.status(201).json({ message: 'Contact added successfully', data });
  } catch (error) { err(res, error); }
});


// GET /api/emergency/contacts
router.get('/contacts', protect, async (req, res) => {
  try {
    const { data } = await axios.get(
      `${DOTNET}/api/Users/my-emergency-contacts`,
      h(getToken(req))
    );
    res.status(200).json(data);
  } catch (error) { err(res, error); }
});

// DELETE /api/emergency/contacts/:id
router.delete('/contacts/:id', protect, async (req, res) => {
  try {
    await axios.delete(`${DOTNET}/api/Users/delete-emergency-contact/${req.params.id}`, h(getToken(req)));
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) { err(res, error); }
});

// GET /api/emergency/hospitals?lat=&lng=
router.get('/hospitals', protect, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng)
      return res.status(400).json({ message: 'lat and lng are required' });

    const query = `[out:json];node["amenity"="hospital"](around:10000,${lat},${lng});out body 5;`;

    const { data } = await axios.get(
  `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
  {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'HealthcareApp/1.0',
    }
  }
);

   const hospitals = data.elements.map((h) => ({
  name:       h.tags?.name || 'Unknown Hospital',
  address:    h.tags?.['addr:street'] || h.tags?.['addr:full'] || h.tags?.['addr:city'] || 'Cairo, Egypt',
  lat:        h.lat,
  lng:        h.lon,
  phone:      h.tags?.phone || h.tags?.['contact:phone'] || null,
  mapsLink:   `https://www.google.com/maps?q=${h.lat},${h.lon}`,
  distance:   null,
}));

    res.status(200).json({ hospitals });

 } catch (error) {
    console.error('Hospitals error:', error.message);
    console.error('Hospitals error response:', error.response?.data);
    console.error('Hospitals error status:', error.response?.status);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/emergency/risk
router.get('/risk', protect, async (req, res) => {
  try {
    const token = getToken(req);
    const [{ data: bp }, { data: diabetes }, { data: temp }] = await Promise.all([
      axios.get(`${DOTNET}/api/Users/measurements/BloodPressure`, h(token)),
      axios.get(`${DOTNET}/api/Users/measurements/Diabetes`, h(token)),
      axios.get(`${DOTNET}/api/Users/measurements/Temperature`, h(token)),
    ]);
    const latestBP  = bp?.at(-1)?.dinner || bp?.at(-1)?.breakfast;
    const latestSugar = diabetes?.at(-1)?.sugarLevel;
    const latestTemp  = temp?.at(-1)?.temperature;
    res.status(200).json(calculateRisk(latestBP, latestSugar, latestTemp));
  } catch (error) { err(res, error); }
});

// GET /api/emergency/latest-measurements
router.get('/latest-measurements', protect, async (req, res) => {
  try {
    const token = getToken(req);
    const [{ data: bp }, { data: diabetes }, { data: temp }] = await Promise.all([
      axios.get(`${DOTNET}/api/Users/measurements/BloodPressure`, h(token)),
      axios.get(`${DOTNET}/api/Users/measurements/Diabetes`, h(token)),
      axios.get(`${DOTNET}/api/Users/measurements/Temperature`, h(token)),
    ]);
    const cleanMeasurement = (m) => {
      if (!m) return null;
      const { user, ...rest } = m;
      return rest;
    };
    const latest = {
      bloodPressure: cleanMeasurement(bp?.at(-1)) || null,
      diabetes:      cleanMeasurement(diabetes?.at(-1)) || null,
      bodyTemp:      cleanMeasurement(temp?.at(-1)) || null,
    };
    res.status(200).json({ hasData: Object.values(latest).some(Boolean), latest });
  } catch (error) { err(res, error); }
});

// GET /api/emergency/self-care
router.get('/self-care', protect, async (req, res) => {
  try {
    const token = getToken(req);
    const [{ data: bp }, { data: diabetes }, { data: temp }] = await Promise.all([
      axios.get(`${DOTNET}/api/Users/measurements/BloodPressure`, h(token)),
      axios.get(`${DOTNET}/api/Users/measurements/Diabetes`, h(token)),
      axios.get(`${DOTNET}/api/Users/measurements/Temperature`, h(token)),
    ]);
    const risk = calculateRisk(
      bp?.at(-1)?.dinner || bp?.at(-1)?.breakfast,
      diabetes?.at(-1)?.sugarLevel,
      temp?.at(-1)?.temperature
    );
    const instructions = {
      Low:    ['Maintain a balanced diet.', 'Exercise 30 min/day.', 'Stay hydrated.', 'Sleep 7-8 hours.', 'Monitor vitals weekly.'],
      Medium: ['Monitor vitals daily.', 'Reduce salt and sugar.', 'Avoid strenuous activity.', 'Take medications on time.', 'See a doctor within 48 hours.'],
      High:   ['Seek immediate medical attention.', 'Call your emergency contact now.', 'Do not drive yourself.', 'Call ambulance 123 if symptoms worsen.'],
    };
    const aiRecommendation = {
      Low:    'Low risk. Maintain healthy habits. If you feel unwell, rest and stay hydrated.',
      Medium: 'Some vitals are abnormal. Please monitor closely and consult your doctor soon.',
      High:   'High risk detected. Please seek immediate medical attention or call 123.',
    };
    res.status(200).json({ riskLevel: risk.level, instructions: instructions[risk.level], aiRecommendation: aiRecommendation[risk.level] });
  } catch (error) { err(res, error); }
});

// POST /api/emergency/send-message
// POST /api/emergency/send-sms-all
router.post('/send-message', protect, async (req, res) => {
  try {
    const { contactEmail, contactName, patientName } = req.body;

    if (!contactEmail || !patientName)
      return res.status(400).json({ message: 'contactEmail and patientName are required' });

    await sendEmergencyEmail(contactEmail, contactName, patientName);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    err(res, error);
  }
});

// POST /api/emergency/ai-assistant
router.post('/ai-assistant', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const token = getToken(req);
    const [{ data: userData }, { data: bp }, { data: diabetes }, { data: temp }] = await Promise.all([
      axios.get(`${DOTNET}/api/Users/my-profile`, h(token)),
      axios.get(`${DOTNET}/api/Users/measurements/BloodPressure`, h(token)),
      axios.get(`${DOTNET}/api/Users/measurements/Diabetes`, h(token)),
      axios.get(`${DOTNET}/api/Users/measurements/Temperature`, h(token)),
    ]);
    const { data: aiResponse } = await axios.post(`${AI}/api/chat`, {
      message: message || 'Analyze my current health status for emergency assessment',
      history: [],
      userContext: {
        patient: { name: userData.fullName, bloodType: userData.bloodType },
        latestMeasurements: { bloodPressure: bp?.at(-1) || null, diabetes: diabetes?.at(-1) || null, bodyTemp: temp?.at(-1) || null },
      },
    });
    res.status(200).json({ reply: aiResponse.reply, timestamp: new Date().toISOString() });
  } catch (error) { err(res, error); }
});

export default router;