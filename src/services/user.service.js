import axios from 'axios';

const DOTNET_API = process.env.DOTNET_API_URL;
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getProfileDotNet = async (userId, token) => {
  const response = await axios.get(`${DOTNET_API}/api/Users/my-profile`, authHeader(token));
  return response.data;
};

export const updateProfileDotNet = async (userId, profileData, token) => {
  const response = await axios.post(`${DOTNET_API}/api/Users/complete-profile`, {
    emailAddress: profileData.email,
    nationalId:   profileData.nationalId,
    birthDate:    profileData.birthDate,
    gender:       profileData.gender,
    city:         profileData.city,
    phoneNumber:  profileData.phoneNumber,
    //BloodType:    profileData.BloodType
    
  }, authHeader(token));
  return response.data;
};