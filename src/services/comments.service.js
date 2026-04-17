import axios from 'axios';

const DOTNET_API = process.env.DOTNET_API_URL;
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getCommentsDotNet = async (limit = 3) => {
  const response = await axios.get(`${DOTNET_API}/api/comments?limit=${limit}`);
  return response.data;
};

export const getAllCommentsDotNet = async (page = 1, limit = 10) => {
  const response = await axios.get(`${DOTNET_API}/api/comments/all?page=${page}&limit=${limit}`);
  return response.data;
};

export const addCommentDotNet = async (comment, token) => {
  const response = await axios.post(`${DOTNET_API}/api/comments`, comment, authHeader(token));
  return response.data;
};