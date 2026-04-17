// // src/services/dotnet.service.js
// import axios from 'axios';

// const DOTNET = process.env.DOTNET_API_URL;
// const AI = process.env.AI_API_URL;

// const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// // ─── AUTH ──────────────────────────────────────────────────
// export const dotnetLogin = (email, password) =>
//   axios.post(`${DOTNET}/api/Users/login`, {
//     emailAddress: email,
//     password,
//   });

// export const dotnetRegister = (data) =>
//   axios.post(`${DOTNET}/api/Users/register`, {
//     fullName: data.fullName,
//     emailAddress: data.email,
//     password: data.password,
//   });

// export const dotnetGoogleAuth = (data) =>
//   axios.post(`${DOTNET}/api/Users/social-login`, {
//     provider: 'Google',
//     token: data.googleToken,
//   });

// export const dotnetFacebookAuth = (data) =>
//   axios.post(`${DOTNET}/api/Users/social-login`, {
//     provider: 'Facebook',
//     token: data.accessToken,
//   });

// export const dotnetForgotPass = (email) =>
//   axios.post(`${DOTNET}/api/Users/forgot-password`, { emailAddress: email });

// // ─── USER ──────────────────────────────────────────────────
// export const dotnetGetProfile = (userId, token) =>
//   axios.get(`${DOTNET}/api/Users/my-profile`, h(token));

// export const dotnetUpdateProfile = (userId, data, token) =>
//   axios.post(`${DOTNET}/api/Users/complete-profile`, {
//     emailAddress: data.email,
//     nationalId:   data.nationalId,
//     birthDate:    data.birthDate,
//     gender:       data.gender,
//     city:         data.city,
//     phoneNumber:  data.phoneNumber,
//   }, h(token));

// // ─── MEASUREMENTS ──────────────────────────────────────────
// export const dotnetGetBP = (userId, token) =>
//   axios.get(`${DOTNET}/api/Users/measurements/BloodPressure`, h(token));

// export const dotnetAddBP = (userId, data, token) =>
//   axios.post(`${DOTNET}/api/Users/add-measurement`, {
//     type:      'BloodPressure',
//     date:      data.date,
//     breakfast: data.breakfast ? `${data.breakfast.systolic}/${data.breakfast.diastolic}` : null,
//     lunch:     data.afterLunch ? `${data.afterLunch.systolic}/${data.afterLunch.diastolic}` : null,
//     dinner:    data.afterDinner ? `${data.afterDinner.systolic}/${data.afterDinner.diastolic}` : null,
//     note:      data.note || null,
//   }, h(token));

// export const dotnetDeleteBP = (userId, date, token) =>
//   axios.delete(`${DOTNET}/api/Users/measurements/BloodPressure/${date}`, h(token));

// export const dotnetGetDiabetes = (userId, token) =>
//   axios.get(`${DOTNET}/api/Users/measurements/Diabetes`, h(token));

// export const dotnetAddDiabetes = (userId, data, token) =>
//   axios.post(`${DOTNET}/api/Users/add-measurement`, {
//     type:       'Diabetes',
//     date:       data.date,
//     breakfast:  data.fasting?.level?.toString() || null,
//     lunch:      data.beforeLunch?.level?.toString() || null,
//     dinner:     data.afterDinner?.level?.toString() || null,
//     sugarLevel: data.fasting?.level || 0,
//     note:       data.note || null,
//   }, h(token));

// export const dotnetDeleteDiabetes = (userId, date, token) =>
//   axios.delete(`${DOTNET}/api/Users/measurements/Diabetes/${date}`, h(token));

// export const dotnetGetTemp = (userId, token) =>
//   axios.get(`${DOTNET}/api/Users/measurements/Temperature`, h(token));

// export const dotnetAddTemp = (userId, data, token) =>
//   axios.post(`${DOTNET}/api/Users/add-measurement`, {
//     type:        'Temperature',
//     date:        data.date,
//     breakfast:   data.morning?.temp?.toString() || null,
//     lunch:       data.afternoon?.temp?.toString() || null,
//     dinner:      data.evening?.temp?.toString() || null,
//     temperature: data.morning?.temp || 0,
//     note:        data.note || null,
//   }, h(token));

// export const dotnetDeleteTemp = (userId, date, token) =>
//   axios.delete(`${DOTNET}/api/Users/measurements/Temperature/${date}`, h(token));

// export const dotnetAddNote = (userId, type, date, note, token) =>
//   axios.post(`${DOTNET}/api/Users/add-measurement`, {
//     type, date, note,
//   }, h(token));

// // ─── APPOINTMENTS ──────────────────────────────────────────
// export const dotnetGetAppointments    = (userId, token) =>
//   axios.get(`${DOTNET}/api/appointments/user/${userId}`, h(token));

// export const dotnetCancelAppointment  = (id, token) =>
//   axios.delete(`${DOTNET}/api/appointments/${id}`, h(token));

// export const dotnetToggleReminder     = (id, reminder, token) =>
//   axios.patch(`${DOTNET}/api/appointments/${id}/reminder`, { reminder }, h(token));

// // ─── DOCTORS ───────────────────────────────────────────────
// export const dotnetGetOnlineDoctors   = (limit) =>
//   axios.get(`${DOTNET}/api/doctors/online?limit=${limit}`);

// export const dotnetGetAllDoctors      = (filters) =>
//   axios.get(`${DOTNET}/api/doctors?${new URLSearchParams(filters)}`);

// export const dotnetStartSession       = (doctorId, userId, token) =>
//   axios.post(`${DOTNET}/api/doctors/${doctorId}/session`, { userId }, h(token));

// // ─── EMERGENCY ─────────────────────────────────────────────
// export const dotnetGetEmergency       = (userId, token) =>
//   axios.get(`${DOTNET}/api/emergency/${userId}`, h(token));

// export const dotnetUpdatePhone        = (userId, phone, token) =>
//   axios.patch(`${DOTNET}/api/emergency/${userId}/phone`, { phone }, h(token));

// export const dotnetAddContact         = (userId, data, token) =>
//   axios.post(`${DOTNET}/api/emergency/${userId}/contacts`, data, h(token));

// export const dotnetDeleteContact      = (userId, contactId, token) =>
//   axios.delete(`${DOTNET}/api/emergency/${userId}/contacts/${contactId}`, h(token));

// export const dotnetGetHospitals       = (lat, lng, token) =>
//   axios.get(`${DOTNET}/api/emergency/hospitals/nearest?lat=${lat}&lng=${lng}`, h(token));

// export const dotnetSendMessage        = (userId, data, token) =>
//   axios.post(`${DOTNET}/api/emergency/${userId}/send-message`, data, h(token));

// // ─── HOME ──────────────────────────────────────────────────
// export const dotnetGetStats               = () => axios.get(`${DOTNET}/api/home/stats`);
// export const dotnetGetSpecializations     = () => axios.get(`${DOTNET}/api/home/specializations`);
// export const dotnetGetAllSpecializations  = () => axios.get(`${DOTNET}/api/home/specializations/all`);

// // ─── COMMENTS ──────────────────────────────────────────────
// export const dotnetGetComments    = (limit) =>
//   axios.get(`${DOTNET}/api/comments?limit=${limit}`);

// export const dotnetGetAllComments = (page, limit) =>
//   axios.get(`${DOTNET}/api/comments/all?page=${page}&limit=${limit}`);

// export const dotnetAddComment     = (data, token) =>
//   axios.post(`${DOTNET}/api/comments`, data, h(token));

// // ─── AI ────────────────────────────────────────────────────
// export const aiSendMessage = (message, history, context) =>
//   axios.post(`${AI}/api/chat`, { message, history, userContext: context });