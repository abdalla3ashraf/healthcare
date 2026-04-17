import axios from 'axios';

const DOTNET_API = process.env.DOTNET_API_URL;
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getEmergencyDataDotNet = async (userId, token) => {
  const response = await axios.get(`${DOTNET_API}/api/emergency/${userId}`, authHeader(token));
  return response.data;
};

export const addEmergencyContactDotNet = async (userId, contact, token) => {
  const response = await axios.post(`${DOTNET_API}/api/emergency/${userId}/contacts`, contact, authHeader(token));
  return response.data;
};

export const deleteEmergencyContactDotNet = async (userId, contactId, token) => {
  const response = await axios.delete(`${DOTNET_API}/api/emergency/${userId}/contacts/${contactId}`, authHeader(token));
  return response.data;
};

export const updatePhoneDotNet = async (userId, phone, token) => {
  const response = await axios.patch(`${DOTNET_API}/api/emergency/${userId}/phone`, { phone }, authHeader(token));
  return response.data;
};

export const getNearestHospitalsDotNet = async (lat, lng, token) => {
  const response = await axios.get(`${DOTNET_API}/api/emergency/hospitals/nearest?lat=${lat}&lng=${lng}`, authHeader(token));
  return response.data;
};