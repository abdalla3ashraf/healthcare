import axios from 'axios';

const DOTNET_API = process.env.DOTNET_API_URL;
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// ─── Blood Pressure ───────────────────────────────────────
export const getBloodPressureDotNet = async (userId, token) => {
  const response = await axios.get(`${DOTNET_API}/api/Users/measurements/BloodPressure`, authHeader(token));
  return response.data;
};

export const addBloodPressureDotNet = async (userId, data, token) => {
  const response = await axios.post(`${DOTNET_API}/api/Users/add-measurement`, {
    type:      'BloodPressure',
    date:      data.date,
    breakfast: data.breakfast || null,
    lunch:     data.afterLunch || null,
    dinner:    data.afterDinner || null,
    note:      data.note || null,
  }, authHeader(token));
  return response.data;
};

export const deleteBloodPressureDayDotNet = async (userId, date, token) => {
  const response = await axios.delete(`${DOTNET_API}/api/Users/measurements/BloodPressure/${date}`, authHeader(token));
  return response.data;
};

// ─── Diabetes ─────────────────────────────────────────────
export const getDiabetesDotNet = async (userId, token) => {
  const response = await axios.get(`${DOTNET_API}/api/Users/measurements/Diabetes`, authHeader(token));
  return response.data;
};

export const addDiabetesDotNet = async (userId, data, token) => {
  const response = await axios.post(`${DOTNET_API}/api/Users/add-measurement`, {
    type:       'Diabetes',
    date:       data.date,
    breakfast:  data.fasting?.toString() || null,
    lunch:      data.beforeLunch?.toString() || null,
    dinner:     data.afterDinner?.toString() || null,
    sugarLevel: data.fasting || 0,
    note:       data.note || null,
  }, authHeader(token));
  return response.data;
};

export const deleteDiabetesDayDotNet = async (userId, date, token) => {
  const response = await axios.delete(`${DOTNET_API}/api/Users/measurements/Diabetes/${date}`, authHeader(token));
  return response.data;
};

// ─── Body Temperature ─────────────────────────────────────
export const getBodyTempDotNet = async (userId, token) => {
  const response = await axios.get(`${DOTNET_API}/api/Users/measurements/Temperature`, authHeader(token));
  return response.data;
};

export const addBodyTempDotNet = async (userId, data, token) => {
  const response = await axios.post(`${DOTNET_API}/api/Users/add-measurement`, {
    type:        'Temperature',
    date:        data.date,
    breakfast:   data.morning?.toString() || null,
    lunch:       data.afternoon?.toString() || null,
    dinner:      data.evening?.toString() || null,
    temperature: data.morning || 0,
    note:        data.note || null,
  }, authHeader(token));
  return response.data;
};

export const deleteBodyTempDayDotNet = async (userId, date, token) => {
  const response = await axios.delete(`${DOTNET_API}/api/Users/measurements/Temperature/${date}`, authHeader(token));
  return response.data;
};

// ─── Note ─────────────────────────────────────────────────
export const addNoteDotNet = async (userId, measurementType, date, note, token) => {
  const typeMap = {
    'blood-pressure':   'BloodPressure',
    'diabetes':         'Diabetes',
    'body-temperature': 'Temperature',
  };
  const response = await axios.post(`${DOTNET_API}/api/Users/add-measurement`, {
    type: typeMap[measurementType] || measurementType,
    date,
    note,
  }, authHeader(token));
  return response.data;
};