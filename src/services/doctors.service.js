import axios from 'axios';

const DOTNET_API = process.env.DOTNET_API_URL;
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyAppointmentsDotNet = async (userId, token) => {
  const response = await axios.get(`${DOTNET_API}/api/appointments/user/${userId}`, authHeader(token));
  return response.data;
};

export const cancelAppointmentDotNet = async (id, token) => {
  const response = await axios.delete(`${DOTNET_API}/api/appointments/${id}`, authHeader(token));
  return response.data;
};

export const toggleReminderDotNet = async (id, reminder, token) => {
  const response = await axios.patch(`${DOTNET_API}/api/appointments/${id}/reminder`, { reminder }, authHeader(token));
  return response.data;
};

export const getOnlineDoctorsDotNet = async (limit = 3) => {
  const response = await axios.get(`${DOTNET_API}/api/doctors/online?limit=${limit}`);
  return response.data;
};

export const getAllDoctorsDotNet = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`${DOTNET_API}/api/doctors?${params}`);
  return response.data;
};

export const startSessionDotNet = async (doctorId, userId, token) => {
  const response = await axios.post(`${DOTNET_API}/api/doctors/${doctorId}/session`, { userId }, authHeader(token));
  return response.data;
};